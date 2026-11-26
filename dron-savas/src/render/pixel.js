// Piksel tamponu ve el-çizimi görünümlü ilkel şekiller (palet renkleri, otomatik dış hat, ölçeksiz döndürme)
import { P32 } from '../data/palette.js';
import { hash2f } from '../core/rng.js';

export const TEAM_KEY = 0xffff00ff; // macenta: takım rengi maskesi (ABGR)
export class PixelBuf {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); this.seed = 1; }
  c(k) { return typeof k === 'number' ? k : k === 'team' ? TEAM_KEY : P32[k]; }
  px(x, y, k) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = this.c(k); }
  get(x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0; return this.d[y * this.w + x]; }
  rect(x, y, w, h, k) { const c = this.c(k); for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (xx >= 0 && yy >= 0 && xx < this.w && yy < this.h) this.d[yy * this.w + xx] = c; }
  hline(x0, x1, y, k) { for (let x = x0; x <= x1; x++) this.px(x, y, k); }
  vline(x, y0, y1, k) { for (let y = y0; y <= y1; y++) this.px(x, y, k); }
  line(x0, y0, x1, y1, k) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx + dy;
    for (;;) { this.px(x0, y0, k); if (x0 === x1 && y0 === y1) break; const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; } }
  }
  ellipse(cx, cy, rx, ry, k) { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + 0.3) + (y * y) / (ry * ry + 0.3) <= 1) this.px(cx + x, cy + y, k); }
  circle(cx, cy, r, k) { this.ellipse(cx, cy, r, r, k); }
  // gürültülü doldurma (el yapımı doku)
  noise(x, y, w, h, keys, amt = 0.3) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      if (this.get(xx, yy) === 0) continue;
      const r = hash2f(xx, yy, this.seed);
      if (r < amt) this.px(xx, yy, keys[(r / amt * keys.length) | 0]);
    }
  }
  // dış hat: saydam komşuya sahip opak pikseller etrafına koyu çizgi
  outline(k = 'k0') {
    const c = this.c(k), w = this.w, h = this.h, src = this.d.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (src[y * w + x]) continue;
      const n = (x > 0 && src[y * w + x - 1]) || (x < w - 1 && src[y * w + x + 1]) || (y > 0 && src[(y - 1) * w + x]) || (y < h - 1 && src[(y + 1) * w + x]);
      if (n) this.d[y * w + x] = c;
    }
  }
  // gölgelendirme: üst/sol açık, sağ/alt koyu (yalnız verilen rengi)
  shadeEdges(fromKey, light, dark) {
    const f = this.c(fromKey), w = this.w, h = this.h, src = this.d.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (src[y * w + x] !== f) continue;
      if (y === 0 || src[(y - 1) * w + x] !== f || x === 0 || src[y * w + x - 1] !== f) this.d[y * w + x] = this.c(light);
      else if (x === w - 1 || src[y * w + x + 1] !== f || y === h - 1 || src[(y + 1) * w + x] !== f) this.d[y * w + x] = this.c(dark);
    }
  }
  blit(src, ox, oy) { for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const v = src.d[y * src.w + x]; if (v) this.px(ox + x, oy + y, v); } }
  // en yakın komşu döndürme (16 yön, dx,dy birim vektör; trig sadece render tarafında)
  rotated(cos, sin) {
    const w = this.w, h = this.h, s = Math.ceil(Math.sqrt(w * w + h * h)); const out = new PixelBuf(s, s);
    const cx = (w - 1) / 2, cy = (h - 1) / 2, oc = (s - 1) / 2;
    for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
      const dx = x - oc, dy = y - oc;
      const sx = Math.round(cx + dx * cos + dy * sin), sy = Math.round(cy - dx * sin + dy * cos);
      if (sx >= 0 && sy >= 0 && sx < w && sy < h) out.d[y * s + x] = this.d[sy * w + sx];
    }
    return out;
  }
  // takım maskesi çıkar: macenta -> beyaz (maske), tabanda -> açık gri
  splitTeam() {
    const mask = new PixelBuf(this.w, this.h); let any = false;
    for (let i = 0; i < this.d.length; i++) if (this.d[i] === TEAM_KEY) { mask.d[i] = 0xffffffff; this.d[i] = P32.k5; any = true; }
    return any ? mask : null;
  }
  toImageData() { return new ImageData(new Uint8ClampedArray(this.d.buffer.slice(0)), this.w, this.h); }
}
