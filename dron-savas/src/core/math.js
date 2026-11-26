// Simülasyon-güvenli matematik (yalnız + - * / sqrt: IEEE-754'te deterministik)
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
export const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
export const smooth = (t) => t * t * (3 - 2 * t);
// Yön: trig yerine birim vektör; heading 0..15 (16 yön) sprite seçimi için
export function dir16(dx, dy) {
  // atan2 kullanmadan 16 dilim: oktant + oran
  if (dx === 0 && dy === 0) return 0;
  const ax = Math.abs(dx), ay = Math.abs(dy);
  const r = ax > ay ? ay / ax : ax / ay; // 0..1
  // tan(11.25)=0.199, tan(33.75)=0.668
  let sub = r < 0.199 ? 0 : r < 0.668 ? 1 : 2; // 0,1,2 -> 0,22.5,45
  let a; // derece/22.5 birimi, 0 = doğu (+x), saat yönü (+y aşağı)
  if (ax >= ay) a = sub; else a = 4 - sub;
  // kadran
  if (dx >= 0 && dy >= 0) a = a;
  else if (dx < 0 && dy >= 0) a = 8 - a;
  else if (dx < 0 && dy < 0) a = 8 + a;
  else a = 16 - a;
  return a & 15;
}
export class MinHeap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    const k = this.k, v = this.v; let i = k.length; k.push(key); v.push(val);
    while (i > 0) { const p = (i - 1) >> 1; if (k[p] <= key) break; k[i] = k[p]; v[i] = v[p]; i = p; }
    k[i] = key; v[i] = val;
  }
  pop() {
    const k = this.k, v = this.v; const top = v[0]; const lk = k.pop(), lv = v.pop();
    if (k.length) {
      let i = 0; const n = k.length;
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
