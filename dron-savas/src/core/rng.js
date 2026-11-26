// Deterministik RNG ve hash yardımcıları. Simülasyonda Math.random YASAK.
export class RNG {
  constructor(seed = 1) { this.s = (seed >>> 0) || 0x9e3779b9; }
  next() {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n) { return Math.floor(this.next() * n); }
  range(a, b) { return a + this.next() * (b - a); }
  chance(p) { return this.next() < p; }
  pick(a) { return a[Math.floor(this.next() * a.length)]; }
  // birim disk içinde nokta (trig yok -> motorlar arası deterministik)
  disk() {
    for (let i = 0; i < 16; i++) {
      const x = this.next() * 2 - 1, y = this.next() * 2 - 1;
      if (x * x + y * y <= 1) return [x, y];
    }
    return [0, 0];
  }
  // yaklaşık normal dağılım (Irwin-Hall)
  gauss() { return (this.next() + this.next() + this.next() + this.next() - 2) * 1.732; }
  fork(salt) { return new RNG(hash32(this.s ^ Math.imul(salt + 1, 0x85ebca6b))); }
}

export function hash32(x) {
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}
export function hash2(x, y, seed) {
  return hash32((Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1) ^ seed) >>> 0);
}
export function hash2f(x, y, seed) { return hash2(x, y, seed) / 4294967296; }
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
