// Ortak yardımcılar: RNG, gürültü, yığın, biçimlendirme, takvim
export const W = 160, H = 96, N = W * H, TS = 16;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const idx = (x, y) => y * W + x;
export const tx = (i) => i % W;
export const ty = (i) => (i / W) | 0;
export const dist = (a, b) => Math.hypot((a % W) - (b % W), ((a / W) | 0) - ((b / W) | 0));
export const D8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
export const D4 = [[0, -1], [-1, 0], [1, 0], [0, 1]];

export class RNG {
  constructor(seed) { this.s = (seed >>> 0) || 0x9e3779b9; }
  next() {
    this.s = (this.s + 0x6D2B79F5) | 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + (b - a) * this.next(); }
  int(n) { return Math.floor(this.next() * n); }
  pick(a) { return a[this.int(a.length)]; }
  chance(p) { return this.next() < p; }
  gauss() { return (this.next() + this.next() + this.next() + this.next() - 2) * 1.7; }
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = this.int(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
}

export function hash2(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
}
export function fbm(x, y, s, oct = 4) {
  let a = 0, amp = 0.5, f = 1, tot = 0;
  for (let i = 0; i < oct; i++) { a += amp * vnoise(x * f, y * f, s + i * 101); tot += amp; amp *= 0.5; f *= 2; }
  return a / tot;
}

export class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  clear() { this.k.length = 0; this.v.length = 0; }
  push(key, val) {
    const k = this.k, v = this.v; let i = k.length; k.push(key); v.push(val);
    while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= key) break; k[i] = k[p]; v[i] = v[p]; i = p; }
    k[i] = key; v[i] = val;
  }
  pop() {
    const k = this.k, v = this.v; const top = v[0]; const lk = k.pop(), lv = v.pop();
    const n = k.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let c = 2 * i + 1; if (c >= n) break;
        if (c + 1 < n && k[c + 1] < k[c]) c++;
        if (k[c] >= lk) break;
        k[i] = k[c]; v[i] = v[c]; i = c;
      }
      k[i] = lk; v[i] = lv;
    }
    return top;
  }
}

export function fmt(n, d = 0) {
  if (!isFinite(n)) return '—';
  const a = Math.abs(n), s = n < 0 ? '-' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(1) + 'Mr';
  if (a >= 1e6) return s + (a / 1e6).toFixed(1) + 'M';
  if (a >= 1e4) return s + (a / 1e3).toFixed(1) + 'K';
  if (a >= 1000) return s + Math.round(a).toLocaleString('tr-TR');
  return s + a.toFixed(d);
}
export const popStr = (k) => (k >= 1000 ? (k / 1000).toFixed(2) + 'M' : Math.round(k) + 'K');
export const pct = (v, d = 0) => (v * 100).toFixed(d) + '%';
export const sgn = (n, d = 0) => (n > 0 ? '+' : '') + fmt(n, d);

const MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MON = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
export const START_YEAR = 1936;
export function dateOf(t) {
  const day = Math.floor(t / 24);
  const y = START_YEAR + Math.floor(day / 365);
  let d = day % 365, m = 0;
  while (d >= MD[m]) { d -= MD[m]; m++; }
  return { y, m, d: d + 1, h: Math.floor(t % 24), day };
}
export const dateStr = (t) => { const o = dateOf(t); return `${o.d} ${MON[o.m]} ${o.y}`; };
export const dayStr = (day) => dateStr(day * 24);

export function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function rgbToHex(r, g, b) { return '#' + ((1 << 24) | (clamp(r | 0, 0, 255) << 16) | (clamp(g | 0, 0, 255) << 8) | clamp(b | 0, 0, 255)).toString(16).slice(1); }
export function shade(hex, f) { const [r, g, b] = hexToRgb(hex); return f >= 0 ? rgbToHex(r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f) : rgbToHex(r * (1 + f), g * (1 + f), b * (1 + f)); }
