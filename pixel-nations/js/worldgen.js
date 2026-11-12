// World Engine + Map Engine (üretim): seed tabanlı kıtalar, biyomlar, nehirler, devletler, şehirler, yollar
import { RNG, fbm, hash2, W, H, N, D8, D4, clamp, idx } from './util.js';
import { T, NATIONS, NN, POT_SCALE } from './data.js';
import { findPath, multiSource } from './path.js';

const CONT_NAMES = ['Aetheria', 'Borealis', 'Calyndra', 'Dravoth'];

function components(mask, conn8 = true) {
  const id = new Int16Array(N).fill(-1); const sizes = [];
  const st = [];
  for (let i = 0; i < N; i++) {
    if (!mask[i] || id[i] >= 0) continue;
    const c = sizes.length; let n = 0; st.push(i); id[i] = c;
    while (st.length) {
      const cur = st.pop(); n++;
      const x = cur % W, y = (cur / W) | 0;
      for (const [dx, dy] of conn8 ? D8 : D4) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nb = ny * W + nx; if (mask[nb] && id[nb] < 0) { id[nb] = c; st.push(nb); }
      }
    }
    sizes.push(n);
  }
  return { id, sizes };
}

export function generateWorld(seed) {
  const rng = new RNG(seed);
  const s1 = (seed >>> 0) & 0xffff, s2 = (s1 * 7 + 13) & 0xffff, s3 = (s1 * 13 + 5) & 0xffff;
  const terr = new Uint8Array(N);
  const lval = new Float32Array(N);
  let land = new Uint8Array(N);

  // ---- 1) kıtalar: 3 büyük blob + adalar, alan bükmeli
  const jx = (rng.next() - 0.5) * 0.05, jy = (rng.next() - 0.5) * 0.05;
  const blobs = [[0.24 + jx, 0.5 + jy, 0.17, 0.4], [0.7 - jx, 0.27 + jy, 0.21, 0.22], [0.69 + jx, 0.8 - jy, 0.16, 0.15]];
  for (let k = 0; k < 7; k++) {
    for (let tries = 0; tries < 30; tries++) {
      const cx = rng.range(0.05, 0.95), cy = rng.range(0.08, 0.92);
      let ok = true;
      for (const b of blobs) { const dx = (cx - b[0]) / (b[2] * 1.5), dy = (cy - b[1]) / (b[3] * 1.4); if (dx * dx + dy * dy < 1.1) ok = false; }
      if (ok) { blobs.push([cx, cy, rng.range(0.025, 0.05), rng.range(0.04, 0.08)]); break; }
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const wx = x + (fbm(x * 0.045, y * 0.045, s1, 3) - 0.5) * 20, wy = y + (fbm(x * 0.045 + 50, y * 0.045 + 50, s1 + 7, 3) - 0.5) * 20;
    let v = -9;
    for (const b of blobs) { const dx = (wx / W - b[0]) / b[2], dy = (wy / H - b[1]) / b[3]; v = Math.max(v, 1 - Math.sqrt(dx * dx + dy * dy)); }
    const l = v + (fbm(x * 0.1, y * 0.1, s1 + 13, 4) - 0.5) * 0.6;
    const edge = Math.min(x, y, W - 1 - x, H - 1 - y); // kenarlarda deniz
    lval[i] = edge < 3 ? Math.min(l, -0.2) : l;
    land[i] = lval[i] > 0.16 ? 1 : 0;
  }
  // küçük parçaları sil
  { const c = components(land); for (let i = 0; i < N; i++) if (land[i] && c.sizes[c.id[i]] < 12) land[i] = 0; }

  // ---- 2) arazi tipleri
  const rug = new Float32Array(N); const rv = [];
  for (let i = 0; i < N; i++) {
    if (!land[i]) continue;
    const x = i % W, y = (i / W) | 0;
    const rn = 1 - Math.abs(2 * fbm(x * 0.07 + 200, y * 0.07, s2, 4) - 1);
    rug[i] = rn * clamp((lval[i] - 0.14) * 3.2, 0, 1) * 1.0;
    rv.push(rug[i]);
  }
  rv.sort((a, b) => a - b);
  const thM = rv[Math.floor(rv.length * 0.935)], thH = rv[Math.floor(rv.length * 0.80)];
  for (let i = 0; i < N; i++) {
    if (!land[i]) { terr[i] = T.SEA; continue; }
    const x = i % W, y = (i / W) | 0;
    const lat = Math.abs(y / H - 0.5) * 2; // 0 ekvator, 1 kutup
    const temp = 1 - lat - lval[i] * 0.08;
    const moist = fbm(x * 0.055 + 300, y * 0.055 + 120, s3, 4) + (lat < 0.3 ? -0.03 : 0.02);
    if (rug[i] >= thM && lval[i] > 0.3) terr[i] = T.MOUNTAIN;
    else if (rug[i] >= thH) terr[i] = T.HILLS;
    else if (temp < 0.2) terr[i] = T.SNOW;
    else if (temp > 0.42 && moist < 0.47) terr[i] = T.DESERT;
    else if (moist > 0.55 || (temp < 0.32 && moist > 0.5)) terr[i] = T.FOREST;
    else terr[i] = T.PLAINS;
  }
  // göller
  for (let k = 0; k < 14; k++) {
    for (let tries = 0; tries < 40; tries++) {
      const i = rng.int(N);
      if (!land[i] || lval[i] < 0.34 || terr[i] === T.MOUNTAIN) continue;
      const cx = i % W, cy = (i / W) | 0, r = rng.range(1.3, 3.2);
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const j = y * W + x; if (!land[j] || terr[j] === T.MOUNTAIN) continue;
        if (Math.hypot(dx, dy) < r + (hash2(x, y, s1) - 0.5) * 1.4) terr[j] = T.LAKE;
      }
      break;
    }
  }
  // kapalı denizleri göle çevir
  { const wm = new Uint8Array(N); for (let i = 0; i < N; i++) wm[i] = terr[i] === T.SEA ? 1 : 0;
    const c = components(wm, false); const touch = new Array(c.sizes.length).fill(false);
    for (let i = 0; i < N; i++) if (wm[i]) { const x = i % W, y = (i / W) | 0; if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touch[c.id[i]] = true; }
    for (let i = 0; i < N; i++) if (wm[i] && !touch[c.id[i]] && c.sizes[c.id[i]] < 400) { terr[i] = T.LAKE; land[i] = 0; } }

  // deniz derinliği (kıyıya mesafe)
  const sd = new Int16Array(N).fill(99);
  { const q = []; for (let i = 0; i < N; i++) if (terr[i] !== T.SEA && terr[i] !== T.DEEP) { sd[i] = 0; q.push(i); }
    for (let h = 0; h < q.length; h++) { const cur = q[h]; const x = cur % W, y = (cur / W) | 0;
      for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nb = ny * W + nx;
        if (sd[nb] === 99 && terr[nb] === T.SEA) { sd[nb] = sd[cur] + 1; q.push(nb); } } } }
  for (let i = 0; i < N; i++) if (terr[i] === T.SEA && sd[i] > 2) terr[i] = T.DEEP;

  // ---- 3) nehirler
  const flow = new Float32Array(N);
  for (let i = 0; i < N; i++) flow[i] = lval[i] + (terr[i] === T.MOUNTAIN ? 0.5 : terr[i] === T.HILLS ? 0.2 : 0) + hash2(i % W, (i / W) | 0, s1 + 3) * 0.04;
  const river = new Uint8Array(N); const riverNext = new Int32Array(N).fill(-1); const riverPaths = [];
  const starts = []; for (let i = 0; i < N; i++) if (terr[i] === T.MOUNTAIN || (terr[i] === T.HILLS && lval[i] > 0.5)) starts.push(i);
  rng.shuffle(starts);
  const usedStart = [];
  for (const s of starts) {
    if (riverPaths.length >= 26) break;
    const sx = s % W, sy = (s / W) | 0;
    if (usedStart.some((u) => Math.hypot(u % W - sx, ((u / W) | 0) - sy) < 9)) continue;
    const path = [s]; let cur = s; let ok = false; const seenT = new Set([s]);
    for (let step = 0; step < 110; step++) {
      const cx = cur % W, cy = (cur / W) | 0; let best = -1, bf = flow[cur];
      for (const [dx, dy] of D8) {
        const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const nb = ny * W + nx; if (seenT.has(nb)) continue;
        if (terr[nb] <= T.LAKE) { best = nb; bf = -9; break; }
        if (flow[nb] < bf) { bf = flow[nb]; best = nb; }
      }
      if (best < 0) { if (path.length > 7) { terr[cur] = T.LAKE; ok = true; } break; }
      path.push(best); seenT.add(best);
      if (terr[best] <= T.LAKE) { ok = path.length > 8; break; }
      if (river[best]) { ok = path.length > 8; break; }
      cur = best;
    }
    if (!ok) continue;
    usedStart.push(s);
    for (let k = 0; k < path.length - 1; k++) { const a = path[k]; if (terr[a] > T.LAKE && terr[a] !== T.MOUNTAIN) river[a] = 1; riverNext[a] = path[k + 1]; }
    riverPaths.push(path);
  }

  // ---- 4) kara parçaları
  const landMask = new Uint8Array(N); for (let i = 0; i < N; i++) landMask[i] = terr[i] > T.LAKE ? 1 : 0;
  const lc = components(landMask); const landId = lc.id; const compSizes = lc.sizes;
  const order = compSizes.map((s, i) => [s, i]).sort((a, b) => b[0] - a[0]);
  const bigComps = order.filter((o) => o[0] >= 150).map((o) => o[1]);
  const coast = new Uint8Array(N); const portTile = new Int32Array(N).fill(-1);
  for (let i = 0; i < N; i++) if (landMask[i]) {
    const x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nb = ny * W + nx; if (terr[nb] <= T.SEA) { coast[i] = 1; if (portTile[i] < 0) portTile[i] = nb; } }
  }
  // deniz bölgeleri (bağlantı kontrolü)
  const sm = new Uint8Array(N); for (let i = 0; i < N; i++) sm[i] = terr[i] <= T.SEA ? 1 : 0;
  const sc = components(sm, true);

  // ---- 5) bölge tohumları: kıtalara göre devlet dağıtımı
  const total = bigComps.reduce((s, c) => s + compSizes[c], 0);
  const alloc = bigComps.map((c) => Math.max(compSizes[c] >= 250 ? 2 : 1, Math.floor((compSizes[c] / total) * NN)));
  let sum = alloc.reduce((a, b) => a + b, 0);
  while (sum < NN) { let bi = 0, bv = -1; bigComps.forEach((c, k) => { const v = compSizes[c] / (alloc[k] + 0.6); if (v > bv) { bv = v; bi = k; } }); alloc[bi]++; sum++; }
  while (sum > NN) { let bi = 0, bv = 1e9; bigComps.forEach((c, k) => { if (alloc[k] <= 1) return; const v = compSizes[c] / alloc[k]; if (v < bv) { bv = v; bi = k; } }); alloc[bi]--; sum--; }
  const tcost = (i) => { const t = terr[i]; return t === T.MOUNTAIN ? 7 : t === T.HILLS ? 2.2 : t === T.FOREST ? 1.6 : t === T.DESERT ? 1.3 : t === T.SNOW ? 1.8 : 1; };
  const cand = (c) => { const a = []; for (let i = 0; i < N; i++) if (landId[i] === c && terr[i] !== T.MOUNTAIN && terr[i] !== T.LAKE && lval[i] > 0.2) a.push(i); return a; };
  const seeds = []; const seedComp = [];
  bigComps.forEach((c, k) => {
    const cs = cand(c); const mine = [rng.pick(cs)];
    while (mine.length < alloc[k]) {
      let best = -1, bd = -1;
      for (let s = 0; s < 500; s++) { const t = rng.pick(cs); let md = 1e9; for (const m of mine) md = Math.min(md, Math.hypot(t % W - m % W, ((t / W) | 0) - ((m / W) | 0))); if (md > bd) { bd = md; best = t; } }
      mine.push(best);
    }
    for (const m of mine) { seeds.push(m); seedComp.push(c); }
  });
  const region = new Int16Array(N).fill(-1); const rdist = new Float32Array(N);
  const growRegions = () => {
    region.fill(-1);
    multiSource(seeds.map((s, k) => [s, k]), (nb, id) => (landId[nb] !== seedComp[id] || terr[nb] === T.LAKE ? -1 : tcost(nb) + (river[nb] ? 1.5 : 0)), region, rdist);
  };
  growRegions();
  for (let it = 0; it < 3; it++) { // Lloyd gevşetme
    const sx = new Float64Array(seeds.length), sy = new Float64Array(seeds.length), sn = new Float64Array(seeds.length);
    for (let i = 0; i < N; i++) if (region[i] >= 0) { sx[region[i]] += i % W; sy[region[i]] += (i / W) | 0; sn[region[i]]++; }
    seeds.forEach((s, k) => {
      const cx = sx[k] / Math.max(1, sn[k]), cy = sy[k] / Math.max(1, sn[k]); let best = s, bd = 1e9;
      for (let i = 0; i < N; i++) if (region[i] === k && terr[i] !== T.MOUNTAIN && terr[i] !== T.LAKE) { const d = Math.hypot(i % W - cx, ((i / W) | 0) - cy); if (d < bd) { bd = d; best = i; } }
      seeds[k] = best;
    });
    growRegions();
  }
  // bölge profilleri -> karakter uyumu
  const prof = seeds.map(() => ({ n: 0, coast: 0, desert: 0, mount: 0, plains: 0, forest: 0, lat: 0 }));
  for (let i = 0; i < N; i++) { const r = region[i]; if (r < 0) continue; const p = prof[r]; p.n++; p.coast += coast[i]; const t = terr[i];
    if (t === T.DESERT) p.desert++; else if (t === T.MOUNTAIN || t === T.HILLS) p.mount++; else if (t === T.PLAINS) p.plains++; else if (t === T.FOREST) p.forest++;
    p.lat += Math.abs(((i / W) | 0) / H - 0.5) * 2; }
  const affOf = (nid, r) => { const a = NATIONS[nid].aff, p = prof[r], n = Math.max(1, p.n);
    return (a.coast || 0) * (p.coast / n) * 10 + (a.desert || 0) * (p.desert / n) * 10 + (a.mount || 0) * (p.mount / n) * 8 + (a.cold || 0) * (p.lat / n) * 3
      + (a.plains || 0) * (p.plains / n) * 3 + (a.forest || 0) * (p.forest / n) * 4 + (a.inland || 0) * (1 - p.coast / n) * 3; };
  const nOrder = NATIONS.map((n, i) => [Object.values(n.aff).reduce((s, v) => s + v, 0) + rng.next() * 0.1, i]).sort((a, b) => b[0] - a[0]).map((o) => o[1]);
  const freeR = new Set(seeds.map((_, k) => k)); const nationOfRegion = new Array(seeds.length).fill(-1);
  for (const nid of nOrder) { let br = -1, bv = -1e9; for (const r of freeR) { const v = affOf(nid, r) + rng.next() * 0.4; if (v > bv) { bv = v; br = r; } } nationOfRegion[br] = nid; freeR.delete(br); }
  const owner0 = new Int8Array(N).fill(-1);
  for (let i = 0; i < N; i++) if (region[i] >= 0) owner0[i] = nationOfRegion[region[i]];

  // ---- 6) şehirler
  const cities = []; const nationCities = Array.from({ length: NN }, () => []);
  const riverAdj = (i) => { const x = i % W, y = (i / W) | 0; for (const [dx, dy] of D8) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H && (river[ny * W + nx] || terr[ny * W + nx] === T.LAKE)) return true; } return false; };
  const cscore = (i) => { const t = terr[i]; if (t === T.MOUNTAIN || t === T.LAKE || t <= T.SEA) return -9;
    return (t === T.PLAINS ? 1.2 : t === T.FOREST ? 0.3 : t === T.HILLS ? 0.4 : t === T.DESERT ? 0.2 : -0.5) + (riverAdj(i) ? 1.3 : 0) + (coast[i] ? 0.7 : 0); };
  const addCity = (nid, i, nameIdx) => {
    const id = cities.length; const nm = NATIONS[nid].cities[nameIdx] || `${NATIONS[nid].short} Kolonisi ${nameIdx - 4}`;
    cities.push({ id, name: nm, nation: nid, t: i, x: i % W, y: (i / W) | 0, coastal: !!coast[i], portTile: coast[i] ? portTile[i] : -1, land: landId[i] });
    nationCities[nid].push(id); return id;
  };
  const nearestCityDist = (i) => { let m = 1e9; for (const c of cities) m = Math.min(m, Math.hypot(c.x - i % W, c.y - ((i / W) | 0))); return m; };
  for (let r = 0; r < seeds.length; r++) {
    const nid = nationOfRegion[r], p = prof[r]; const want = clamp(Math.round(p.n / 52), 3, 6);
    const tiles = []; let cx = 0, cy = 0; for (let i = 0; i < N; i++) if (region[i] === r) { tiles.push(i); cx += i % W; cy += (i / W) | 0; }
    cx /= tiles.length; cy /= tiles.length;
    let best = -1, bv = -1e9; for (const i of tiles) { const v = cscore(i) - Math.hypot(i % W - cx, ((i / W) | 0) - cy) * 0.09 + rng.next() * 0.3; if (v > bv && nearestCityDist(i) >= 5) { bv = v; best = i; } }
    addCity(nid, best, 0);
    while (nationCities[nid].length < want) {
      best = -1; bv = -1e9;
      for (const i of tiles) { const sc_ = cscore(i); if (sc_ < -1) continue; let md = nearestCityDist(i); if (md < 6.5) continue; let own = 1e9; for (const c of nationCities[nid]) own = Math.min(own, Math.hypot(cities[c].x - i % W, cities[c].y - ((i / W) | 0)));
        const v = sc_ + Math.min(own, 14) * 0.16 + rng.next() * 0.5; if (v > bv) { bv = v; best = i; } }
      if (best < 0) break; addCity(nid, best, nationCities[nid].length);
    }
  }
  // ada kolonileri
  for (const c of order.map((o) => o[1])) {
    if (bigComps.includes(c) || compSizes[c] < 14) continue;
    const tiles = []; let cx = 0, cy = 0; for (let i = 0; i < N; i++) if (landId[i] === c) { tiles.push(i); cx += i % W; cy += (i / W) | 0; }
    cx /= tiles.length; cy /= tiles.length;
    let bn = -1, bd = 1e9; for (const ct of cities) { const d = Math.hypot(ct.x - cx, ct.y - cy); if (d < bd) { bd = d; bn = ct.nation; } }
    if (bn < 0 || bd > 48) continue;
    let best = -1, bv = -1e9; for (const i of tiles) { const v = cscore(i) + (coast[i] ? 1 : 0) - Math.hypot(i % W - cx, ((i / W) | 0) - cy) * 0.1; if (v > bv) { bv = v; best = i; } }
    if (best < 0) continue;
    for (const i of tiles) owner0[i] = bn;
    addCity(bn, best, nationCities[bn].length);
  }
  // eyaletler (şehir etrafı Voronoi, devlet içinde)
  const prov = new Int16Array(N).fill(-1); const pd = new Float32Array(N);
  multiSource(cities.map((c) => [c.t, c.id]), (nb, id) => (owner0[nb] !== cities[id].nation || landId[nb] !== cities[id].land || terr[nb] === T.LAKE ? -1 : tcost(nb) * 0.8 + 0.2), prov, pd);
  for (let i = 0; i < N; i++) if (prov[i] >= 0 && owner0[i] < 0) prov[i] = -1;

  // sulak/ekilebilir alan dengesi: şehir çevresindeki çöl/kar → vaha
  for (const c of cities) for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    const x = c.x + dx, y = c.y + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const j = y * W + x;
    if (prov[j] === c.id && (terr[j] === T.DESERT || terr[j] === T.SNOW) && Math.hypot(dx, dy) <= 2.6 + (riverAdj(j) ? 1.2 : 0)) terr[j] = T.PLAINS;
  }
  for (const c of cities) terr[c.t] = (terr[c.t] === T.DESERT || terr[c.t] === T.SNOW || terr[c.t] === T.FOREST) ? T.PLAINS : terr[c.t];

  // ---- 7) maden yatakları
  const deposit = new Uint8Array(N), rich = new Uint8Array(N);
  const KINDS = [
    { k: 1, cnt: 40, pref: { [T.HILLS]: 1, [T.MOUNTAIN]: 0.9, [T.PLAINS]: 0.3, [T.FOREST]: 0.2 } },
    { k: 2, cnt: 38, pref: { [T.HILLS]: 0.8, [T.PLAINS]: 0.5, [T.FOREST]: 0.5, [T.MOUNTAIN]: 0.3, [T.SNOW]: 0.5 } },
    { k: 3, cnt: 22, pref: { [T.DESERT]: 1, [T.SNOW]: 0.6, [T.PLAINS]: 0.25 } },
    { k: 4, cnt: 16, pref: { [T.MOUNTAIN]: 1, [T.HILLS]: 0.5, [T.DESERT]: 0.2 } },
    { k: 6, cnt: 34, pref: { [T.HILLS]: 1, [T.MOUNTAIN]: 1, [T.DESERT]: 0.3 } },
  ];
  const cityTiles = new Set(cities.map((c) => c.t));
  KINDS.forEach((K, ki) => {
    const sc_ = []; for (let i = 0; i < N; i++) { if (owner0[i] < 0 && ki > 1) continue; const p = K.pref[terr[i]]; if (!p || deposit[i] || cityTiles.has(i)) continue; sc_.push([p * (0.35 + fbm((i % W) * 0.2, ((i / W) | 0) * 0.2, s1 + 40 + ki * 17, 3) * 1.3) + rng.next() * 0.15, i]); }
    sc_.sort((a, b) => b[0] - a[0]); const chosen = [];
    for (const [, i] of sc_) { if (chosen.length >= K.cnt) break; if (chosen.some((c) => Math.hypot(c % W - i % W, ((c / W) | 0) - ((i / W) | 0)) < 3.2)) continue; chosen.push(i); deposit[i] = K.k; rich[i] = 1 + rng.int(3); }
  });
  // ---- 8) potansiyeller
  const potKeys = ['food', 'iron', 'coal', 'oil', 'gold', 'wood', 'stone'];
  for (const c of cities) c.pot = { food: 0, iron: 0, coal: 0, oil: 0, gold: 0, wood: 0, stone: 0 };
  const provTiles = cities.map(() => 0);
  for (let i = 0; i < N; i++) { const p = prov[i]; if (p < 0) continue; const pot = cities[p].pot; provTiles[p]++;
    const t = terr[i];
    if (t === T.PLAINS) pot.food += 0.5; else if (t === T.FOREST) { pot.food += 0.12; pot.wood += 0.55; } else if (t === T.HILLS) { pot.stone += 0.15; pot.food += 0.12; } else if (t === T.MOUNTAIN) pot.stone += 0.2; else if (t === T.DESERT) pot.food += 0.04;
    if (river[i]) pot.food += 0.7; if (coast[i]) pot.food += 0.18;
    const d = deposit[i]; if (d) pot[potKeys[d]] += rich[i]; }
  cities.forEach((c, k) => { c.tiles = provTiles[k]; });

  // ---- 9) yollar
  const road = new Uint8Array(N);
  const rcost = (a, b) => { const t = terr[b]; if (t <= T.LAKE) return -1; if (!landMask[a] || !landMask[b]) return -1;
    let c = t === T.MOUNTAIN ? 4.5 : t === T.HILLS ? 1.5 : t === T.FOREST ? 1 : t === T.SNOW ? 1.3 : t === T.DESERT ? 0.9 : 0.65;
    if (river[b] && !road[b]) c += 1.6; if (road[b]) c = 0.15; return c; };
  const connect = (a, b) => { const p = findPath(cities[a].t, cities[b].t, rcost, 0.15, 12000); if (p) { road[cities[a].t] = 1; for (const t of p) road[t] = 1; } };
  for (let nid = 0; nid < NN; nid++) {
    const cs = nationCities[nid]; const inTree = [cs[0]]; const rest = cs.slice(1);
    while (rest.length) { let bi = -1, bj = -1, bd = 1e9; rest.forEach((r, j) => inTree.forEach((t) => { if (cities[r].land !== cities[t].land) return; const d = Math.hypot(cities[r].x - cities[t].x, cities[r].y - cities[t].y); if (d < bd) { bd = d; bi = r; bj = j; bi = r; cities[r]._to = t; } }));
      if (bj < 0) break; connect(bi, cities[bi]._to); inTree.push(bi); rest.splice(bj, 1); }
  }
  const linked = new Set();
  for (const a of cities) for (const b of cities) {
    if (a.nation >= b.nation || a.land !== b.land) continue; const key = a.nation * 100 + b.nation; if (linked.has(key)) continue;
    // en yakın çift
    let bd = 1e9, pa = null, pb = null; for (const x of cities) if (x.nation === a.nation) for (const y of cities) if (y.nation === b.nation && x.land === y.land) { const d = Math.hypot(x.x - y.x, x.y - y.y); if (d < bd) { bd = d; pa = x; pb = y; } }
    linked.add(key); if (pa && bd < 28) connect(pa.id, pb.id);
  }
  for (const c of cities) delete c._to;

  // ---- 10) görsel yükseklik alanı (render için) + istatistik
  const elev = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const t = terr[i];
    if (t === T.LAKE) elev[i] = -0.08; else if (t <= T.SEA) elev[i] = -Math.min(0.55, 0.1 + 0.07 * sd[i]);
    else elev[i] = 0.06 + (t === T.HILLS ? 0.3 : t === T.MOUNTAIN ? 0.62 + rug[i] * 0.5 : t === T.FOREST ? 0.02 : 0) + clamp(lval[i], 0, 1) * 0.1;
  }
  const waterComp = sc.id;
  const continents = bigComps.slice(0, 4).map((c, k) => ({ id: c, name: CONT_NAMES[k], size: compSizes[c] }));
  return { seed, terr, elev, river, riverNext, riverPaths, deposit, rich, road, landId, compSizes, coast, portTile, owner0, prov, cities, nationCities, waterComp, continents, lval };
}

export function asciiMap(w) {
  const ch = '~-=.fdhM*'; let s = '';
  for (let y = 0; y < H; y += 2) { for (let x = 0; x < W; x++) { const i = y * W + x; const o = w.owner0[i]; s += w.cities.some((c) => c.t === i) ? '@' : (o >= 0 && w.terr[i] > 2 ? String.fromCharCode(65 + o) : ch[w.terr[i]]); } s += '\n'; }
  return s;
}
