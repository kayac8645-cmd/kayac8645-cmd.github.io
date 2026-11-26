// Seed'den deterministik kıta üretimi: yükseklik, nem, nehirler (öncelikli taşkın drenajı), göller,
// arazi, kaynak yatakları, ülkeler (başkent + kasabalar), toprak, yollar ve köprüler.
import { RNG } from '../core/rng.js';
import { MinHeap } from '../core/math.js';
import { fbm, ridged, valueNoise } from './noise.js';
import { GameMap, T, RD, NONE, DX8, DY8 } from './map.js';
import { countryName, cityName, makeFlag } from './names.js';
import { TEAM } from '../data/palette.js';

export const MAP_SIZES = { small: 256, medium: 512, large: 1024 };
const SEA = 0.40;

export function generateWorld(opts) {
  const { seed, size = 256, countries = 4 } = opts;
  const W = size, H = size, N = W * H;
  const rng = new RNG(seed);
  const map = new GameMap(W, H);
  const hs = seed ^ 0x51a3, ms = seed ^ 0x7a11, rs = seed ^ 0x3e9;
  const sc = (4.2 / 256) * Math.sqrt(256 / size); // dünya ölçeği karo başına sabit -> büyük haritalar daha çok kıta detayı
  // --- yükseklik ---
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const nx = x / W - 0.5, ny = y / H - 0.5;
    const wx = x * sc + (valueNoise(x * sc * 0.5, y * sc * 0.5, hs + 9) - 0.5) * 3;
    const wy = y * sc + (valueNoise(x * sc * 0.5 + 50, y * sc * 0.5, hs + 19) - 0.5) * 3;
    let h = fbm(wx, wy, hs, 6);
    const ridge = ridged(x * sc * 0.7, y * sc * 0.7, hs + 77, 4);
    const d = Math.sqrt(nx * nx + ny * ny) * 2; // 0 merkez .. 1.41 köşe
    const mask = 1 - d * d * 0.9;
    h = h * 0.62 + mask * 0.42 + ridge * 0.22 * Math.max(0, h - 0.35) * 2 - 0.12;
    // kenarlar deniz
    const e = Math.min(x, y, W - 1 - x, H - 1 - y) / (W * 0.06);
    if (e < 1) h *= 0.4 + 0.6 * e;
    map.height[y * W + x] = h;
  }
  // --- drenaj: öncelikli taşkın (depresyon doldurma) ---
  const filled = new Float32Array(map.height);
  const done = new Uint8Array(N); const order = new Int32Array(N); let oc = 0;
  const heap = new MinHeap();
  for (let i = 0; i < N; i++) if (map.height[i] < SEA) { done[i] = 1; heap.push(map.height[i], i); }
  while (heap.size) {
    const c = heap.pop(); order[oc++] = c;
    const cx = c % W, cy = (c / W) | 0;
    for (let k = 0; k < 4; k++) {
      const nx = cx + DX8[k], ny = cy + DY8[k];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = ny * W + nx; if (done[ni]) continue;
      done[ni] = 1;
      if (filled[ni] <= filled[c]) filled[ni] = filled[c] + 1e-5;
      map.down[ni] = c;
      heap.push(filled[ni], ni);
    }
  }
  // akış birikimi (yukarı akıştan aşağıya)
  const flow = new Float32Array(N);
  for (let i = 0; i < N; i++) flow[i] = 1;
  // --- nem ---
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    map.moist[i] = fbm(x * sc * 1.3, y * sc * 1.3, ms, 4) * 0.8 + (1 - Math.min(1, Math.max(0, map.height[i] - SEA) * 2.5)) * 0.25;
  }
  for (let k = oc - 1; k >= 0; k--) { const c = order[k]; const d = map.down[c]; if (d >= 0) flow[d] += flow[c] * (0.6 + map.moist[c] * 0.8); }
  // --- arazi sınıflandırma ---
  const riverT = Math.max(110, N / 260);
  for (let i = 0; i < N; i++) {
    const h = map.height[i], m = map.moist[i], x = i % W, y = (i / W) | 0;
    let t;
    if (h < SEA - 0.1) t = T.DEEP;
    else if (h < SEA) t = T.SEA;
    else if (filled[i] - h > 0.012 && filled[i] < 0.62) t = T.LAKE;
    else if (h < SEA + 0.018) t = T.SAND;
    else if (h > 0.86) t = T.PEAK;
    else if (h > 0.74) t = T.MOUNTAIN;
    else if (h > 0.63) t = T.HILL;
    else if (m > 0.66 && h < SEA + 0.08 && valueNoise(x * 0.09, y * 0.09, rs) > 0.45) t = T.SWAMP;
    else if (m > 0.52 + (valueNoise(x * 0.06, y * 0.06, rs + 5) - 0.5) * 0.25) t = T.FOREST;
    else t = T.GRASS;
    if (t !== T.DEEP && t !== T.SEA && t !== T.LAKE && t !== T.PEAK && flow[i] > riverT) t = T.RIVER;
    map.ter[i] = t;
  }
  // --- kaynak yatakları (jeolojiye göre) ---
  const RES_RULES = [
    // [res index 1..7, terrains, noise seed, threshold, scale]
    [1, [T.HILL, T.MOUNTAIN], 101, 0.82, 0.11], // demir
    [2, [T.HILL, T.GRASS, T.FOREST], 202, 0.86, 0.1], // kömür
    [3, [T.GRASS, T.SAND, T.SWAMP], 303, 0.87, 0.09], // petrol
    [4, [T.GRASS, T.SWAMP, T.SAND, T.FOREST], 404, 0.88, 0.09], // gaz
    [5, [T.MOUNTAIN, T.HILL], 505, 0.85, 0.11], // bakır
    [6, [T.MOUNTAIN], 606, 0.88, 0.13], // uranyum
    [7, [T.HILL, T.FOREST], 707, 0.88, 0.12], // nadir toprak
  ];
  for (let i = 0; i < N; i++) {
    const t = map.ter[i]; if (!map.isLand(i)) continue;
    const x = i % W, y = (i / W) | 0;
    for (const [r, ts, s, th, f] of RES_RULES) {
      if (!ts.includes(t)) continue;
      if (valueNoise(x * f, y * f, seed ^ s) > th && valueNoise(x * 0.6, y * 0.6, seed ^ (s * 3)) > 0.4) { map.res[i] = r; break; }
    }
  }
  // --- ülkeler ---
  const nC = Math.min(countries, 24);
  const cand = [];
  for (let tries = 0; tries < 6000 && cand.length < 900; tries++) {
    const x = 8 + rng.int(W - 16), y = 8 + rng.int(H - 16), i = y * W + x;
    if (map.ter[i] !== T.GRASS && map.ter[i] !== T.FOREST) continue;
    let ok = true;
    for (let dy = -3; dy <= 3 && ok; dy++) for (let dx = -3; dx <= 3; dx++) if (!map.isLand((y + dy) * W + x + dx)) { ok = false; break; }
    if (ok) cand.push(i);
  }
  const caps = [];
  if (cand.length) caps.push(cand[rng.int(cand.length)]);
  while (caps.length < nC && caps.length < cand.length) { // en uzak nokta örnekleme
    let best = -1, bd = -1;
    for (const c of cand) {
      let md = 1e9; const cx = c % W, cy = (c / W) | 0;
      for (const k of caps) { const dx = cx - (k % W), dy = cy - ((k / W) | 0); md = Math.min(md, dx * dx + dy * dy); }
      if (md > bd) { bd = md; best = c; }
    }
    caps.push(best);
  }
  // toprak: çok kaynaklı Dijkstra
  const cost = new Float32Array(N).fill(1e9); const own = map.owner;
  const h2 = new MinHeap(); const closed = new Uint8Array(N);
  caps.forEach((c, k) => { cost[c] = 0; own[c] = k; h2.push(0, c); });
  const maxCost = W * 0.55;
  while (h2.size) {
    const c = h2.pop(); if (closed[c]) continue; closed[c] = 1; const cc = cost[c]; if (cc > maxCost) continue;
    const cx = c % W, cy = (c / W) | 0;
    for (let k = 0; k < 4; k++) {
      const nx = cx + DX8[k], ny = cy + DY8[k]; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = ny * W + nx; const t = map.ter[ni];
      if (t === T.DEEP || t === T.SEA || t === T.LAKE) continue;
      const step = t === T.MOUNTAIN || t === T.PEAK ? 3 : t === T.RIVER ? 2.5 : t === T.HILL ? 1.6 : 1;
      const nc = cc + step;
      if (nc < cost[ni]) { cost[ni] = nc; own[ni] = own[c]; h2.push(nc, ni); }
    }
  }
  const countryList = [];
  for (let k = 0; k < caps.length; k++) {
    const crng = rng.fork(k + 1);
    const nm = countryName(crng);
    const c = caps[k];
    countryList.push({ id: k, name: nm.short, full: nm.full, color: TEAM[k], flag: makeFlag(crng, TEAM[k]), capital: { x: c % W, y: (c / W) | 0, name: cityName(crng) }, towns: [] });
  }
  // kasabalar
  for (const co of countryList) {
    const crng = rng.fork(100 + co.id);
    const nT = 2 + crng.int(2);
    for (let t = 0, tries = 0; co.towns.length < nT && tries < 400; tries++) {
      const r = 12 + crng.int(22); const [dx, dy] = crng.disk();
      const x = (co.capital.x + dx * r) | 0, y = (co.capital.y + dy * r) | 0;
      if (!map.inb(x, y)) continue; const i = y * W + x;
      if (own[i] !== co.id || (map.ter[i] !== T.GRASS && map.ter[i] !== T.FOREST && map.ter[i] !== T.SAND)) continue;
      if (Math.abs(dx * r) + Math.abs(dy * r) < 10) continue;
      if (co.towns.some((tw) => Math.abs(tw.x - x) + Math.abs(tw.y - y) < 12)) continue;
      co.towns.push({ x, y, name: cityName(crng) });
    }
    // adalet: başkent yakınında temel kaynak garantisi (demir, kömür, petrol, bakır)
    for (const r of [1, 2, 3, 5]) ensureDeposit(map, crng, co, r);
  }
  // --- yollar ---
  const bridges = [];
  const buildRoad = (ax, ay, bx, by) => {
    const p = map.astar(ax, ay, bx, by, (i) => {
      const t = map.ter[i];
      if (map.road[i] & RD.ROAD) return 0.35;
      if (t === T.DEEP || t === T.SEA || t === T.LAKE || t === T.PEAK) return 0;
      if (t === T.RIVER) return 6;
      return t === T.MOUNTAIN ? 6 : t === T.HILL ? 2.2 : t === T.SWAMP ? 3 : t === T.FOREST ? 1.4 : 1;
    }, 120000);
    if (!p) return false;
    for (const i of [ (ay * W + ax), ...p]) {
      if (!(map.road[i] & RD.ROAD)) {
        map.road[i] |= RD.ROAD;
        if (map.ter[i] === T.RIVER) { map.road[i] |= RD.BRIDGE; bridges.push(i); }
      }
    }
    return true;
  };
  for (const co of countryList) for (const tw of co.towns) buildRoad(co.capital.x, co.capital.y, tw.x, tw.y);
  // komşu başkentler arası otoyol (her biri en yakın 2)
  const linked = new Set();
  for (const a of countryList) {
    const near = countryList.filter((b) => b !== a).map((b) => [b, Math.abs(a.capital.x - b.capital.x) + Math.abs(a.capital.y - b.capital.y)]).sort((p, q) => p[1] - q[1]).slice(0, 2);
    for (const [b] of near) {
      const key = Math.min(a.id, b.id) + ':' + Math.max(a.id, b.id); if (linked.has(key)) continue; linked.add(key);
      buildRoad(a.capital.x, a.capital.y, b.capital.x, b.capital.y);
    }
  }
  map.computeRoadComponents();
  return { map, countries: countryList, bridges, seed, size };
}

function ensureDeposit(map, rng, co, r) {
  const W = map.W; const cx = co.capital.x, cy = co.capital.y;
  for (let dy = -28; dy <= 28; dy++) for (let dx = -28; dx <= 28; dx++) {
    const x = cx + dx, y = cy + dy; if (!map.inb(x, y)) continue;
    const i = y * W + x; if (map.res[i] === r && map.owner[i] === co.id) return;
  }
  for (let tries = 0; tries < 300; tries++) {
    const rr = 6 + rng.int(18); const [dx, dy] = rng.disk();
    const x = (cx + dx * rr) | 0, y = (cy + dy * rr) | 0; if (!map.inb(x, y)) continue;
    const i = y * W + x; if (map.owner[i] !== co.id || !map.isLand(i) || map.res[i]) continue;
    for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 3; xx++) {
      const j = (y + yy) * W + x + xx; if (map.inb(x + xx, y + yy) && map.isLand(j) && rng.chance(0.75)) map.res[j] = r;
    }
    return;
  }
}
