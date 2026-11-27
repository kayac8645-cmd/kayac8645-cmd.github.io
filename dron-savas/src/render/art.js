// Piksel sanat araç takımı: ışık/gölge rampaları (gölgede maviye, ışıkta sarıya kayan ton), derinlikli kutu
// (çatı + ön cephe + eğik yan yüz), silindir, beşik çatı, doku, renkli dış hat, yere düşen yarı saydam gölge.
import { RNG } from '../core/rng.js';
import { PAL } from '../data/palette.js';

export const TEAMC = [255, 0, 255]; // takım rengi işareti (maskeye ayrılır)
export function hex(h) { if (Array.isArray(h)) return h; if (PAL[h]) h = PAL[h]; return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function rgb2hls(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  return [h, l, s];
}
function hue2(p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }
function hls2rgb(h, l, s) { if (!s) return [l, l, l]; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [hue2(p, q, h + 1 / 3), hue2(p, q, h), hue2(p, q, h - 1 / 3)]; }
export function shade(c, f) {
  c = hex(c); let [h, l, s] = rgb2hls(c[0] / 255, c[1] / 255, c[2] / 255);
  l = Math.max(0, Math.min(1, l * f));
  if (s > 0.05) h = (h + (f < 1 ? 0.02 : -0.01) + 1) % 1;
  s = Math.min(1, s * (f < 1 ? 1.08 : 0.95));
  const [r, g, b] = hls2rgb(h, l, s); return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
const pack = (c, a = 255) => ((a << 24) | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;

export class Art {
  // w,h: yerel piksel; S: ölçek (mantıksal koordinat × S = yerel piksel). Detay (pencere, doku, dış hat) yerel çözünürlükte.
  constructor(w, h, seed = 1, S = 1) { this.w = w; this.h = h; this.S = S; this.d = new Uint32Array(w * h); this.rng = new RNG(seed); this.shadowSet = null; }
  np(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = pack(hex(c)); }
  p(x, y, c) { const S = this.S; if (S === 1) return this.np(x, y, c); const k = hex(c); const X = Math.round(x * S), Y = Math.round(y * S); for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) this.np(X + i, Y + j, k); }
  team(x, y) { this.p(x, y, TEAMC); }
  g(x, y) { const S = this.S; x = (x * S) | 0; y = (y * S) | 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[y * this.w + x]; }
  gc(x, y) { const v = this.g(x, y); return [v & 255, (v >> 8) & 255, (v >> 16) & 255]; }
  rect(x, y, w, h, c) { const k = hex(c), S = this.S; const X0 = Math.round(x * S), Y0 = Math.round(y * S), X1 = Math.round((x + w) * S), Y1 = Math.round((y + h) * S); for (let yy = Y0; yy < Y1; yy++) for (let xx = X0; xx < X1; xx++) this.np(xx, yy, k); }
  ell(cx, cy, rx, ry, c) { const k = hex(c), S = this.S; const RX = rx * S + (S > 1 ? 0.5 : 0), RY = ry * S + (S > 1 ? 0.5 : 0), CX = cx * S + (S > 1 ? S / 2 - 0.5 : 0), CY = cy * S + (S > 1 ? S / 2 - 0.5 : 0); for (let y = Math.floor(-RY); y <= RY; y++) for (let x = Math.floor(-RX); x <= RX; x++) if ((x * x) / (RX * RX + 0.35) + (y * y) / (RY * RY + 0.35) <= 1) this.np(Math.round(CX + x), Math.round(CY + y), k); }
  line(x0, y0, x1, y1, c) { const k = hex(c), S = this.S; const o = S > 1 ? S / 2 - 0.5 : 0; const X0 = x0 * S + o, Y0 = y0 * S + o, X1 = x1 * S + o, Y1 = y1 * S + o; const n = Math.max(Math.abs(X1 - X0), Math.abs(Y1 - Y0), 1); for (let i = 0; i <= n; i++) { const X = Math.round(X0 + (X1 - X0) * i / n), Y = Math.round(Y0 + (Y1 - Y0) * i / n); this.np(X, Y, k); if (S > 1) this.np(X + 1, Y, k); } }
  tex(x, y, w, h, base, amt, lo = 0.88, hi = 1.1) {
    base = hex(base); const S = this.S;
    for (let yy = Math.round(y * S); yy < Math.round((y + h) * S); yy++) for (let xx = Math.round(x * S); xx < Math.round((x + w) * S); xx++) if (this.d[yy * this.w + xx] && xx >= 0 && xx < this.w && this.rng.next() < amt) this.np(xx, yy, shade(base, lo + this.rng.next() * (hi - lo)));
  }
  pad(x, y, w, h, base, curb = true) {
    this.rect(x, y, w, h, base); this.tex(x, y, w, h, base, 0.35);
    if (curb) { for (let xx = x; xx < x + w; xx++) { this.p(xx, y, shade(base, 1.2)); this.p(xx, y + h - 1, shade(base, 0.75)); } }
  }
  // derinlikli kutu: taban izi sol-üst (x,y), genişlik w, derinlik d, yükseklik h. Ön cephe tabanı y+d.
  box(x, y, w, d, h, base, o = {}) {
    base = hex(base); const roof = o.roof ? hex(o.roof) : shade(base, 1.25), front = shade(base, 0.85), side = shade(base, 0.62), dep = o.dep ?? Math.max(1, Math.min(4, (d / 3) | 0));
    for (let k = 0; k < dep; k++) { this.line(x + w + k, y - h + d - k - 1, x + w + k, y + d - k - 1, side); this.line(x + w + k, y - h - k, x + w + k, y - h + d - k - 1, shade(roof, 0.82)); }
    this.rect(x, y - h, w, d, roof);
    for (let xx = x; xx < x + w; xx++) this.p(xx, y - h, shade(roof, 1.15));
    this.rect(x, y - h + d, w, h, front);
    { const S = this.S; for (let yy = Math.round((y - h + d) * S); yy < Math.round((y + d) * S); yy++) for (let xx = Math.round(x * S); xx < Math.round((x + w) * S); xx++) if ((xx + yy * 3) % 7 === 0) this.np(xx, yy, shade(front, 1.06)); }
    for (let xx = x; xx < x + w; xx++) this.p(xx, y - h + d, shade(front, 0.7));
    if (o.stripe) for (let xx = x + 1; xx < x + w - 1; xx++) this.team(xx, y - h + ((d / 2) | 0));
    if (o.win) {
      const S = this.S, fx = Math.round(x * S), fy = Math.round((y - h + d) * S), fw = Math.round(w * S), fh = Math.round(h * S);
      const rows = Math.max(1, ((fh - 3) / 5) | 0), cols = Math.max(1, ((fw - 3) / 4) | 0);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const wx = fx + 2 + c * 4, wy = fy + 2 + r * 5; if (wy + 3 >= fy + fh) continue;
        const lit = (c * 3 + r * 5 + x) % 4 !== 0;
        this.np(wx, wy, '#c9e6f8'); this.np(wx + 1, wy, '#9fd2f0'); this.np(wx, wy + 1, '#5b8fbf'); this.np(wx + 1, wy + 1, '#3f6a9a'); this.np(wx, wy + 2, '#2f4d78'); this.np(wx + 1, wy + 2, '#203a5b');
        if (S > 1) { this.np(wx - 1, wy - 1, shade(front, 1.18)); this.np(wx + 2, wy - 1, shade(front, 1.18)); this.np(wx, wy + 3, shade(front, 1.25)); this.np(wx + 1, wy + 3, shade(front, 1.25)); }
        if (o.lights && lit) o.lights.push([(wx + 1) / S, (wy + 1) / S, 1]);
      }
    }
    if (o.door) { const dx = x + ((w / 2) | 0) - 1; this.rect(dx, y + d - 4, 3, 4, '#2b2f3c'); this.p(dx + 2, y + d - 2, '#f7c948'); }
    if (o.vents) for (let k = 0; k < o.vents; k++) this.rect(x + 2 + k * 5, y - h + 1, 3, 2, shade(roof, 0.7));
  }
  cyl(cx, y, r, h, base) {
    base = hex(base);
    for (let xx = -r; xx <= r; xx++) { const f = 1.25 - 0.65 * ((xx + r) / (2 * r || 1)); for (let yy = y - h; yy <= y; yy++) this.p(cx + xx, yy, shade(base, f)); }
    this.ell(cx, y, r, Math.max(1, r >> 1), shade(base, 0.6)); this.ell(cx, y - h, r, Math.max(1, r >> 1), shade(base, 1.3));
    if (r > 2) this.ell(cx, y - h, r - 1, Math.max(1, (r >> 1) - 1), shade(base, 1.15));
  }
  // beşik çatılı ön cephe (şehir evi)
  gable(x, y, w, rh, h, roof, wall, o = {}) {
    roof = hex(roof); wall = hex(wall);
    this.rect(x, y - h, w, h, wall);
    for (let yy = y - h; yy < y; yy++) { this.p(x + w - 1, yy, shade(wall, 0.72)); this.p(x, yy, shade(wall, 1.1)); for (let xx = x; xx < x + w; xx++) if ((xx * 3 + yy) % 9 === 0) this.p(xx, yy, shade(wall, 0.92)); }
    for (let k = 0; k < rh; k++) this.line(x - 1, y - h - k, x + w, y - h - k, shade(roof, (k % 2 ? 1.05 : 0.95) - 0.25 * (k / rh)));
    for (let k = 0; k < rh; k++) { this.p(x - 1, y - h - k, shade(roof, 1.3)); this.p(x + w, y - h - k, shade(roof, 0.6)); }
    this.line(x - 1, y - h - rh, x + w, y - h - rh, shade(roof, 1.35));
    for (let xx = x - 1; xx <= x + w; xx++) this.p(xx, y - h, shade(roof, 0.55));
    if (o.win !== false) {
      const n = Math.max(1, ((w - 3) / 5) | 0);
      for (let c = 0; c < n; c++) {
        const wx = x + 2 + c * 5, wy = y - h + 2; if (o.door && Math.abs(wx + 1 - (x + w / 2)) < 2) continue;
        this.rect(wx - 0.5, wy - 0.5, 3, 3, shade(wall, 1.15)); this.rect(wx, wy, 2, 2, '#3f6a9a'); this.p(wx, wy, '#9fd2f0'); this.rect(wx, wy + 1, 2, 0.5, shade(wall, 1.15)); this.rect(wx - 0.5, wy + 2.5, 3, 0.5, shade(wall, 0.8));
        o.lights?.push([wx + 1, wy + 1, 1]);
      }
    }
    if (o.door) { const dx = x + ((w / 2) | 0) - 1; this.rect(dx, y - 4, 2, 4, '#5a3620'); this.p(dx + 1, y - 2, '#f7c948'); }
  }
  sandbags(cx, cy, rx, ry, n = 32) { for (let k = 0; k < n; k++) { const t = k / n * 6.283; const x = Math.round(cx + Math.cos(t) * rx), y = Math.round(cy + Math.sin(t) * ry); this.ell(x, y, 1, 1, '#b8935e'); this.p(x, y - 1, '#dcc08a'); } }
  // renkli dış hat: komşu dolgu renginin koyusu
  outline(f = 0.38) {
    const w = this.w, h = this.h, src = this.d.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (src[y * w + x]) continue;
      let n = 0;
      if (x > 0 && src[y * w + x - 1]) n = src[y * w + x - 1]; else if (x < w - 1 && src[y * w + x + 1]) n = src[y * w + x + 1];
      else if (y > 0 && src[(y - 1) * w + x]) n = src[(y - 1) * w + x]; else if (y < h - 1 && src[(y + 1) * w + x]) n = src[(y + 1) * w + x];
      if (n) { const c = [n & 255, (n >> 8) & 255, (n >> 16) & 255]; this.d[y * w + x] = c[0] === 255 && c[1] === 0 && c[2] === 255 ? pack([60, 20, 60]) : pack(shade(c, f)); }
    }
  }
  // yere düşen gölge: opak olmayan piksellere yarı saydam siyah
  shadow(dx = 3, dy = 2, a = 90) {
    const w = this.w, h = this.h, src = this.d.slice(), sh = (a << 24) >>> 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!src[y * w + x]) continue; const X = x + dx, Y = y + dy;
      if (X < w && Y < h && !src[Y * w + X] && !this.d[Y * w + X]) this.d[Y * w + X] = sh;
    }
  }
  // takım maskesi ve atlas için
  splitTeam() {
    let any = false; const m = new Art(this.w, this.h, 1, 1); const T = pack(TEAMC); const base = pack([150, 160, 176]);
    for (let i = 0; i < this.d.length; i++) if (this.d[i] === T) { m.d[i] = 0xffffffff; this.d[i] = base; any = true; }
    return any ? m : null;
  }
  toImageData() { return new ImageData(new Uint8ClampedArray(this.d.buffer.slice(0)), this.w, this.h); }
  // en yakın komşu döndürme (yukarıdan görünen hava/deniz araçları)
  rotated(cos, sin) {
    const w = this.w, h = this.h, s = Math.ceil(Math.sqrt(w * w + h * h)), out = new Art(s, s, 1, 1);
    const cx = (w - 1) / 2, cy = (h - 1) / 2, oc = (s - 1) / 2;
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const dx = x - oc, dy = y - oc; const sx = Math.round(cx + dx * cos + dy * sin), sy = Math.round(cy - dx * sin + dy * cos);
      if (sx >= 0 && sy >= 0 && sx < w && sy < h) out.d[y * s + x] = this.d[sy * w + sx];
    }
    return out;
  }
  // harabe dönüşümü: sütun başına kesik yükseklik, moloz, kurum
  ruin(baseY, seed) { baseY = Math.round(baseY * this.S);
    const w = this.w, h = this.h, src = this.d.slice(), r = new RNG(seed); this.d.fill(0);
    const deb = [[92, 90, 87], [43, 47, 60], [140, 100, 64], [26, 29, 40], [118, 116, 122]];
    let cut = baseY - 4;
    for (let x = 0; x < w; x++) {
      if (x % 3 === 0) cut = baseY - 3 - ((r.next() * 9) | 0);
      for (let y = Math.max(0, cut); y < h; y++) {
        const v = src[y * w + x]; if (!v || (v >>> 24) < 200) continue;
        const k = r.next();
        this.d[y * w + x] = k < 0.35 ? pack(deb[(k * 14) | 0 % 5] || deb[1]) : k < 0.55 ? pack([26, 29, 40]) : v;
      }
    }
    this.outline(0.4);
  }
  damage(seed) {
    const r = new RNG(seed);
    for (let i = 0; i < this.d.length; i++) { const v = this.d[i]; if (!v || (v >>> 24) < 200) continue; const k = r.next(); if (k < 0.06) this.d[i] = pack([26, 29, 40]); else if (k < 0.12) this.d[i] = pack([43, 47, 60]); }
  }
}
