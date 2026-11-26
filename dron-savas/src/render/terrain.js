// Arazi chunk pişirici (32x32 karo = 512x512 px): piksel düzeyinde autotile geçişleri, yamaç gölgesi,
// nehir/yol/demiryolu/köprü bağlantıları, kalıcı kraterler, sel, kaynak izleri, sınır/cephe çizgileri, ağaçlar.
// Mevsim görünümü palet kaydırmasıyla üretilir. LRU önbellek, karede sınırlı pişirme.
import { P32, PRGB, SEASON_MAP, TEAM } from '../data/palette.js';
import { T, RD, NONE } from '../world/map.js';
import { hash2, hash2f } from '../core/rng.js';

const CH = 32, TS = 16, CPX = CH * TS;
const RANK = [0, 0, 1, 3, 3, 2, 4, 5, 6, 3, 0]; // geçiş önceliği (T sırası)

function key(season, k) { const m = SEASON_MAP[season]; return P32[(m && m[k]) || k]; }

// 16x16 karo desenleri (mevsim başına, 4 varyant)
function makePatterns(season) {
  const P = [];
  const spec = {
    [T.DEEP]: ['w1', ['w0', 'w1', 'w2'], 0.25, 'wave0'],
    [T.SEA]: ['w2', ['w1', 'w3', 'w2'], 0.25, 'wave'],
    [T.LAKE]: ['w3', ['w2', 'w4', 'w3'], 0.2, 'wave'],
    [T.SAND]: ['s1', ['s2', 'b4', 's1'], 0.3],
    [T.GRASS]: ['g3', ['g4', 'g2', 'g4', 'g5'], 0.35, 'tuft'],
    [T.FOREST]: ['g2', ['g1', 'g3', 'g1'], 0.4],
    [T.SWAMP]: ['m1', ['m0', 'g2', 'w2'], 0.45, 'pool'],
    [T.HILL]: ['g4', ['y1', 'g3', 'g5', 'b3'], 0.35, 'tuft'],
    [T.MOUNTAIN]: ['r2', ['r1', 'r3', 'r0', 'b2'], 0.45, 'crack'],
    [T.PEAK]: ['n1', ['n2', 'n0', 'r3'], 0.35],
    [T.RIVER]: ['g3', ['g4', 'g2'], 0.3],
  };
  for (let t = 0; t <= 10; t++) {
    const s = spec[t]; const vars = [];
    for (let v = 0; v < 4; v++) {
      const a = new Uint32Array(256); const base = key(season, s[0]);
      for (let i = 0; i < 256; i++) {
        const x = i & 15, y = i >> 4; const r = hash2f(x + v * 16, y + t * 16, 991 + season);
        a[i] = r < s[2] ? key(season, s[1][(r / s[2] * s[1].length) | 0]) : base;
      }
      const deco = s[3];
      if (deco === 'tuft') for (let k = 0; k < 3; k++) { const x = hash2(k, v, t) % 14, y = 2 + hash2(v, k, t + 5) % 13; a[y * 16 + x] = key(season, 'g5'); a[(y - 1) * 16 + x] = key(season, 'g4'); if (season === 0 && k === 0) a[y * 16 + x + 1] = P32.l1; }
      if (deco === 'wave') for (let k = 0; k < 2; k++) { const x = hash2(k, v, t) % 12, y = 2 + hash2(v, k, t + 9) % 12; for (let d = 0; d < 3; d++) a[y * 16 + x + d] = P32.w4; }
      if (deco === 'crack') for (let k = 0; k < 2; k++) { const x = 2 + hash2(k, v, t) % 11, y = 2 + hash2(v, k, t + 3) % 11; a[y * 16 + x] = P32.r0; a[(y + 1) * 16 + x + 1] = P32.r0; a[(y - 1) * 16 + x] = P32.r3; }
      if (deco === 'pool') { const x = 3 + hash2(v, 1, t) % 8, y = 3 + hash2(v, 2, t) % 8; for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 4; dx++) a[(y + dy) * 16 + x + dx] = P32.w2; }
      vars.push(a);
    }
    P.push(vars);
  }
  return P;
}


export class TerrainBaker {
  constructor(renderer, atlas, map) {
    this.r = renderer; this.A = atlas; this.map = map;
    this.cache = new Map(); this.max = 96; this.season = -1; this.patterns = null;
    this.buf = new Uint32Array(CPX * CPX); this.img = new ImageData(new Uint8ClampedArray(this.buf.buffer), CPX, CPX);
    this.frame = 0; this.warFn = () => false;
    this.trees = atlas.trees; this.deposits = atlas.deposits; // prosedürel ağaç ve yatak çizimleri
  }
  setSeason(s) { if (s !== this.season) { this.season = s; this.patterns = makePatterns(s); this.invalidateAll(); } }
  invalidateAll() { for (const v of this.cache.values()) v.dirty = true; }
  invalidate(set) { for (const k of set) { const c = this.cache.get(((k >> 16) * 4096) + (k & 0xffff)); if (c) c.dirty = true; } }
  // görünür chunk dokusu (gerekirse pişir); budget: karede kalan pişirme hakkı
  get(cx, cy, budget) {
    const k = cy * 4096 + cx; let c = this.cache.get(k);
    if (c && !c.dirty) { c.used = this.frame; return c.tex; }
    if (budget.n <= 0) return c ? c.tex : null;
    budget.n--;
    this.bake(cx, cy);
    if (c) { if (this.r.kind === 'webgl2') this.r.updateTexture(c.tex, this.img); else { c.cv.getContext('2d').putImageData(this.img, 0, 0); this.r.updateTexture(c.tex, c.cv); } c.dirty = false; c.used = this.frame; return c.tex; }
    let tex, cv = null;
    if (this.r.kind === 'webgl2') tex = this.r.createTexture(this.img);
    else { cv = document.createElement('canvas'); cv.width = cv.height = CPX; cv.getContext('2d').putImageData(this.img, 0, 0); tex = this.r.createTexture(cv); }
    this.cache.set(k, { tex, cv, dirty: false, used: this.frame });
    if (this.cache.size > this.max) this.evict();
    return tex;
  }
  evict() {
    let oldK = -1, old = 1e18;
    for (const [k, v] of this.cache) if (v.used < old) { old = v.used; oldK = k; }
    if (oldK >= 0) { this.r.deleteTexture(this.cache.get(oldK).tex); this.cache.delete(oldK); }
  }
  bake(cx, cy) {
    const map = this.map, W = map.W, H = map.H, buf = this.buf, P = this.patterns, season = this.season;
    const tx0 = cx * CH, ty0 = cy * CH;
    const ter = map.ter, hgt = map.height;
    const terAt = (x, y) => ter[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
    // 1) desen + geçişler
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const gx = tx0 + tx, gy = ty0 + ty; if (gx >= W || gy >= H) continue;
      const t = ter[gy * W + gx]; const v = hash2(gx, gy, 77) & 3; const pat = P[t][v];
      const ox = tx * TS, oy = ty * TS;
      for (let y = 0; y < 16; y++) { const row = (oy + y) * CPX + ox; for (let x = 0; x < 16; x++) buf[row + x] = pat[y * 16 + x]; }
      // kenar geçişleri: daha yüksek öncelikli komşu bu karonun kenarına taşar
      const r0 = RANK[t];
      for (let d = 0; d < 8; d++) {
        const ndx = [1, -1, 0, 0, 1, 1, -1, -1][d], ndy = [0, 0, 1, -1, 1, -1, 1, -1][d];
        const nt = terAt(gx + ndx, gy + ndy); if (nt === t) continue;
        const nr = RANK[nt]; if (nr <= r0 || nt === T.RIVER) continue;
        const npat = P[nt][(hash2(gx + ndx, gy + ndy, 77) & 3)];
        for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
          let dd;
          if (d < 4) dd = ndx === 1 ? 15 - x : ndx === -1 ? x : ndy === 1 ? 15 - y : y;
          else { const ex = ndx === 1 ? 15 - x : x, ey = ndy === 1 ? 15 - y : y; dd = Math.sqrt(ex * ex + ey * ey) * 0.9; }
          if (dd > 5) continue;
          const th = (5 - dd) / 6 + (hash2f(gx * 16 + x, gy * 16 + y, 5) - 0.5) * 0.5;
          if (th > 0.45) buf[(oy + y) * CPX + ox + x] = npat[y * 16 + x];
        }
      }
    }
    // 2) yamaç gölgesi (bilineer)
    const shadeAt = (x, y) => {
      x = Math.min(W - 3, Math.max(2, x)); y = Math.min(H - 3, Math.max(2, y));
      const i = y * W + x; if (map.isWater(i)) return 1;
      // 5x5 ortalamalı eğim: yumuşak yamaç gölgesi
      let g = 0; for (let k = -1; k <= 1; k++) g += hgt[i - 2 * W - 2 + k] - hgt[i + 2 * W + 2 + k] + hgt[i - 2 * W - 2 + k * W] - hgt[i + 2 * W + 2 + k * W];
      g *= 0.75;
      return Math.max(0.8, Math.min(1.2, 1 + g));
    };
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const gx = tx0 + tx, gy = ty0 + ty; if (gx >= W || gy >= H) continue;
      const s00 = shadeAt(gx, gy), s10 = shadeAt(gx + 1, gy), s01 = shadeAt(gx, gy + 1), s11 = shadeAt(gx + 1, gy + 1);
      if (Math.abs(s00 - 1) < 0.02 && Math.abs(s11 - 1) < 0.02 && Math.abs(s10 - 1) < 0.02) continue;
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const fx = x / 16, fy = y / 16; let s = (s00 * (1 - fx) + s10 * fx) * (1 - fy) + (s01 * (1 - fx) + s11 * fx) * fy;
        // sıralı titreşimle kuantala (piksel sanat bantları)
        s = Math.round((s + (((x ^ y) & 1) ? 0.025 : -0.025)) * 16) / 16;
        if (s === 1) continue;
        const k = (ty * 16 + y) * CPX + tx * 16 + x; const c = buf[k];
        const r = Math.min(255, (c & 255) * s), g = Math.min(255, ((c >> 8) & 255) * s), b = Math.min(255, ((c >> 16) & 255) * s);
        buf[k] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
      }
    }
    // 3) kıyı köpüğü + nehirler + sel
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const gx = tx0 + tx, gy = ty0 + ty; if (gx >= W || gy >= H) continue;
      const i = gy * W + gx, t = ter[i], ox = tx * TS, oy = ty * TS;
      if (t === T.SEA || t === T.LAKE) {
        for (let d = 0; d < 4; d++) {
          const nx = gx + [1, -1, 0, 0][d], ny = gy + [0, 0, 1, -1][d];
          if (!map.inb(nx, ny) || !map.isLand(ny * W + nx)) continue;
          for (let k = 0; k < 16; k++) {
            const off = (hash2(gx * 16 + k, gy, d + 3) % 3);
            const x = d === 0 ? 15 - off : d === 1 ? off : k, y = d === 2 ? 15 - off : d === 3 ? off : k;
            const xx = d < 2 ? x : k, yy = d < 2 ? k : y;
            buf[(oy + yy) * CPX + ox + xx] = off === 0 ? P32.w5 : P32.w4;
          }
        }
      }
      if (t === T.RIVER) this.drawRiver(gx, gy, ox, oy);
      if (map.flood[i]) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (((x + y) & 1) || hash2f(x, y, i) < 0.6) buf[(oy + y) * CPX + ox + x] = (x + y) % 5 ? P32.w3 : P32.w4;
      if (map.res[i] && map.isLand(i) && !map.occ[i] && !map.road[i]) { const h = hash2(gx, gy, 50); this.blit(this.deposits[map.res[i]][h % 3], ox + 2 + (h >> 4) % 3, oy + 3 + (h >> 8) % 3); }
    }
    // 4) kraterler / yanık izleri
    const x0 = tx0 - 3, y0 = ty0 - 3, x1 = tx0 + CH + 3, y1 = ty0 + CH + 3;
    for (const dcl of map.decals) {
      if (dcl.x < x0 || dcl.x > x1 || dcl.y < y0 || dcl.y > y1) continue;
      const cxp = (dcl.x - tx0) * TS, cyp = (dcl.y - ty0) * TS, R = dcl.r * TS;
      const R2 = R * 1.6;
      for (let y = Math.max(0, (cyp - R2) | 0); y < Math.min(CPX, cyp + R2); y++) for (let x = Math.max(0, (cxp - R2) | 0); x < Math.min(CPX, cxp + R2); x++) {
        const dx = x - cxp, dy = (y - cyp) * 1.15, d = Math.sqrt(dx * dx + dy * dy); const h = hash2f(x, y, 31);
        const k = y * CPX + x;
        if (d < R * 0.45) buf[k] = h < 0.5 ? P32.b0 : P32.k1;
        else if (d < R * 0.7) buf[k] = h < 0.5 ? P32.b1 : P32.b0;
        else if (d < R * 0.85) buf[k] = dy < 0 ? P32.b3 : P32.b2;
        else if (d < R2 && h < (R2 - d) / (R2 - R * 0.85) * 0.7) buf[k] = h < 0.3 ? P32.k1 : P32.k2;
      }
    }
    // 5) yollar, demiryolu, köprüler
    for (let ty = -1; ty <= CH; ty++) for (let tx = -1; tx <= CH; tx++) {
      const gx = tx0 + tx, gy = ty0 + ty; if (!map.inb(gx, gy)) continue;
      const i = gy * W + gx; if (!map.road[i]) continue;
      this.drawRoad(gx, gy, tx * TS, ty * TS);
    }
    // 6) ağaçlar ve dağ zirveleri (komşu chunk'tan taşanlar dahil)
    for (let ty = -1; ty <= CH; ty++) for (let tx = -1; tx <= CH; tx++) {
      const gx = tx0 + tx, gy = ty0 + ty; if (!map.inb(gx, gy)) continue;
      const i = gy * W + gx, t = ter[i];
      if (map.road[i] || map.occ[i]) continue;
      const h = hash2(gx, gy, 123);
      if (t === T.FOREST || (t === T.GRASS && (h & 63) < 2) || (t === T.HILL && (h & 31) < 3) || (t === T.SWAMP && (h & 15) < 3)) {
        const T_ = this.trees[season]; const pick = (k) => { const q = k & 7; return q < 4 ? T_.round[q % 3] : q < 7 ? T_.pine[q & 1] : T_.bush[q & 1]; };
        const ox = tx * TS + ((h >> 12) % 5) - 1, oy = ty * TS + ((h >> 16) % 5) - 4;
        this.blit(pick(h >> 8), ox, oy);
        if (t === T.FOREST && ((h >> 20) & 1)) this.blit(pick(h >> 22), ox + 6, oy + 6);
      } else if ((t === T.MOUNTAIN || t === T.PEAK) && (h & 3) === 0) this.drawPeak(tx * TS + 2, ty * TS + 12, t === T.PEAK || season === 3, h);
    }
    // 7) sınırlar ve cephe hattı
    const own = map.owner;
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const gx = tx0 + tx, gy = ty0 + ty; if (gx >= W - 1 || gy >= H - 1) continue;
      const i = gy * W + gx, o = own[i]; if (o === NONE) continue;
      const ox = tx * TS, oy = ty * TS; const col = P32[TEAM[o % TEAM.length]];
      for (const [ni, side] of [[i + 1, 0], [i + W, 1], [i - 1, 2], [i - W, 3]]) {
        if (ni < 0 || ni >= map.N) continue; const o2 = own[ni]; if (o2 === o) continue;
        const war = o2 !== NONE && this.warFn(o, o2);
        for (let k = 0; k < 16; k++) {
          const on = war ? ((k >> 2) & 1) : (k & 3) < 2;
          const px = side === 0 ? 15 : side === 2 ? 0 : k, py = side === 1 ? 15 : side === 3 ? 0 : k;
          const ppx = side === 0 || side === 2 ? px : k, ppy = side === 0 || side === 2 ? k : py;
          if (war) {
            buf[(oy + ppy) * CPX + ox + ppx] = on ? P32.e2 : P32.k7;
            const ix = side === 0 ? ppx - 1 : side === 2 ? ppx + 1 : ppx, iy = side === 1 ? ppy - 1 : side === 3 ? ppy + 1 : ppy;
            buf[(oy + iy) * CPX + ox + ix] = col;
          } else if (on) buf[(oy + ppy) * CPX + ox + ppx] = col;
        }
      }
    }
  }
  // Art sprite'ını chunk tamponuna kopyala (yarı saydam gölge pikselleri karartma olarak uygulanır)
  blit(art, ox, oy) {
    const buf = this.buf, d = art.d, w = art.w;
    for (let y = 0; y < art.h; y++) for (let x = 0; x < w; x++) {
      const v = d[y * w + x]; if (!v) continue; const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= CPX || Y >= CPX) continue;
      const a = v >>> 24, k = Y * CPX + X;
      if (a >= 250) buf[k] = v;
      else { const c = buf[k], f = 1 - a / 255 * 0.6; buf[k] = (0xff000000 | ((((c >> 16) & 255) * f) << 16) | ((((c >> 8) & 255) * f) << 8) | ((c & 255) * f)) >>> 0; }
    }
  }
  drawPeak(ox, oy, snow, h) {
    const buf = this.buf, w = 12, ht = 9 + (h % 4);
    for (let y = 0; y < ht; y++) {
      const half = Math.round((y + 1) * w / 2 / ht);
      for (let x = -half; x <= half; x++) {
        const X = ox + 6 + x, Y = oy - ht + y; if (X < 0 || Y < 0 || X >= CPX || Y >= CPX) continue;
        let c = x < 0 ? P32.r3 : x === 0 ? P32.r2 : P32.r1;
        if (Math.abs(x) === half) c = P32.r0;
        if (snow && y < ht * 0.4) c = x < 0 ? P32.n2 : P32.n0;
        buf[Y * CPX + X] = c;
      }
    }
  }
  drawRiver(gx, gy, ox, oy) {
    const map = this.map, buf = this.buf, W = map.W;
    const water = (x, y) => map.inb(x, y) && (map.ter[y * W + x] === T.RIVER || map.isWater(y * W + x));
    const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < 16 && y < 16) buf[(oy + y) * CPX + ox + x] = c; };
    const disk = (cx, cy, r) => { for (let y = -r - 1; y <= r + 1; y++) for (let x = -r - 1; x <= r + 1; x++) { const d = x * x + y * y; if (d <= r * r) put(cx + x, cy + y, (x + y + gx) % 7 ? P32.w3 : P32.w4); else if (d <= (r + 1) * (r + 1)) { const k = (oy + cy + y) * CPX + ox + cx + x; if (cx + x >= 0 && cy + y >= 0 && cx + x < 16 && cy + y < 16 && buf[k] !== P32.w3 && buf[k] !== P32.w4) buf[k] = P32.b3; } } };
    disk(8, 8, 4);
    for (let d = 0; d < 8; d++) {
      const dx = [1, -1, 0, 0, 1, 1, -1, -1][d], dy = [0, 0, 1, -1, 1, -1, 1, -1][d];
      if (!water(gx + dx, gy + dy)) continue;
      if (d >= 4 && (water(gx + dx, gy) || water(gx, gy + dy))) continue;
      for (let s = 0; s <= 8; s += 2) disk(8 + dx * s, 8 + dy * s, 4);
    }
  }
  drawRoad(gx, gy, ox, oy) {
    const map = this.map, buf = this.buf, W = map.W, r = map.road[gy * W + gx];
    const conn = (x, y, bit) => map.inb(x, y) && (map.road[y * W + x] & bit);
    const put = (x, y, c) => { const X = ox + x, Y = oy + y; if (X >= 0 && Y >= 0 && X < CPX && Y < CPX) buf[Y * CPX + X] = c; };
    const isBridge = r & RD.BRIDGE, broken = r & RD.BROKEN;
    for (const bit of [RD.ROAD, RD.RAIL]) {
      if (!(r & bit)) continue;
      const half = bit === RD.ROAD ? 3 : 2;
      const arms = [];
      for (let d = 0; d < 8; d++) {
        const dx = [1, -1, 0, 0, 1, 1, -1, -1][d], dy = [0, 0, 1, -1, 1, -1, 1, -1][d];
        if (!conn(gx + dx, gy + dy, bit)) continue;
        if (d >= 4 && (conn(gx + dx, gy, bit) || conn(gx, gy + dy, bit))) continue;
        arms.push([dx, dy]);
      }
      const seg = (dx, dy, len) => {
        for (let s = 0; s <= len; s++) for (let w = -half; w <= half; w++) {
          const x = 8 + dx * s + (dy !== 0 ? w : 0) * (dx === 0 ? 1 : 0.7), y = 8 + dy * s + (dx !== 0 ? w : 0) * (dy === 0 ? 1 : 0.7);
          const X = Math.round(x), Y = Math.round(y);
          if (broken && s > 2 && s < 7 && isBridge) continue;
          let c;
          if (bit === RD.ROAD) c = isBridge ? (Math.abs(w) === half ? P32.k3 : P32.c2) : Math.abs(w) === half ? P32.c0 : (w === 0 && (s & 3) < 2 && arms.length <= 2 ? P32.k6 : P32.c1);
          else c = Math.abs(w) === 1 ? P32.k4 : (s & 1) ? P32.b2 : P32.b1;
          put(X, Y, c);
        }
      };
      if (!arms.length) seg(0, 0, 0);
      for (const [dx, dy] of arms) seg(dx, dy, dx && dy ? 11 : 8);
      for (let y = -half; y <= half; y++) for (let x = -half; x <= half; x++) put(8 + x, 8 + y, bit === RD.ROAD ? (isBridge ? P32.c2 : P32.c1) : P32.b1);
      if (broken && isBridge) for (let k = 0; k < 8; k++) { const h = hash2(gx, gy, k); put(4 + (h % 8), 4 + ((h >> 4) % 8), k & 1 ? P32.k2 : P32.b1); }
    }
  }
}
