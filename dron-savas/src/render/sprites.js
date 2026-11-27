// Prosedürel piksel sanat üreteci + atlas paketleyici (Kenney CC0 sayfaları dahil)
import { PixelBuf, TEAM_KEY } from './pixel.js';
import { P32 } from '../data/palette.js';
import { BUILDINGS } from '../data/buildings.js';
import { buildingArt, VEHICLES, TOPDOWN, treeArt, resIcon, RES_ICON_LIST, depositArt, SC } from './looks.js';
import { blockArt, BLOCK_KINDS } from './city.js';

export const TILE = 32; // dünya pikseli / karo (16 px tasarım × 2 detay)
export const BUILD_TOP_L = 40; // mantıksal üst pay
export const BUILD_TOP = BUILD_TOP_L * SC; // yerel piksel: binanın taban izinin üstünde kalan çizim payı

// ---------- birim sprite'ları (yukarıdan, +x yönüne bakar) ----------
const UNIT_GEN = {
  quad() { const b = new PixelBuf(9, 9); b.line(1, 1, 7, 7, 'k4'); b.line(7, 1, 1, 7, 'k4'); for (const [x, y] of [[1, 1], [7, 1], [1, 7], [7, 7]]) { b.circle(x, y, 1, 'k6'); } b.rect(3, 3, 3, 3, 'team'); b.px(5, 4, 'e2'); return b; },
  fpv() { const b = new PixelBuf(7, 7); b.line(1, 1, 5, 5, 'k3'); b.line(5, 1, 1, 5, 'k3'); for (const [x, y] of [[1, 1], [5, 1], [1, 5], [5, 5]]) b.px(x, y, 'k6'); b.rect(2, 3, 3, 1, 'team'); b.px(5, 3, 'e2'); return b; },
  hexa() { const b = new PixelBuf(11, 11); for (const [x, y] of [[5, 1], [9, 3], [9, 7], [5, 9], [1, 7], [1, 3]]) { b.line(5, 5, x, y, 'k4'); b.circle(x, y, 1, 'k6'); } b.rect(4, 4, 3, 3, 'team'); b.px(5, 5, 'k1'); return b; },
  delta() { const b = new PixelBuf(13, 11); for (let x = 0; x < 11; x++) { const hh = Math.round((11 - x) / 2.2); b.vline(x + 1, 5 - hh, 5 + hh, x > 7 ? 'k5' : 'k4'); } b.hline(2, 11, 5, 'team'); b.px(12, 5, 'k6'); b.vline(1, 3, 7, 'k2'); return b; },
  uav() { const b = new PixelBuf(15, 13); b.hline(1, 13, 6, 'k5'); b.hline(2, 12, 7, 'k4'); b.vline(8, 0, 12, 'k6'); b.vline(9, 1, 11, 'k5'); b.vline(2, 3, 9, 'k5'); b.px(14, 6, 'k7'); b.px(10, 6, 'team'); b.px(11, 6, 'team'); return b; },
  male() { const b = new PixelBuf(19, 17); b.hline(1, 17, 8, 'k6'); b.hline(2, 16, 9, 'k5'); b.vline(10, 0, 16, 'k6'); b.vline(11, 1, 15, 'k5'); b.line(2, 8, 0, 5, 'k5'); b.line(2, 8, 0, 11, 'k5'); b.rect(15, 7, 3, 3, 'k7'); b.px(12, 8, 'team'); b.px(13, 8, 'team'); b.px(9, 5, 'k3'); b.px(9, 11, 'k3'); return b; },
  mother() { const b = new PixelBuf(15, 15); for (const [x, y] of [[7, 1], [13, 4], [13, 10], [7, 13], [1, 10], [1, 4]]) { b.line(7, 7, x, y, 'k3'); b.circle(x, y, 1, 'k6'); } b.circle(7, 7, 3, 'k5'); b.rect(6, 6, 3, 3, 'team'); for (const [x, y] of [[4, 4], [10, 4], [4, 10], [10, 10]]) b.px(x, y, 'e2'); return b; },
  cruise() { const b = new PixelBuf(11, 5); b.hline(1, 9, 2, 'k6'); b.px(10, 2, 'k5'); b.vline(5, 0, 4, 'k5'); b.vline(1, 1, 3, 'k4'); return b; },
  ballistic() { const b = new PixelBuf(11, 3); b.hline(0, 9, 1, 'k7'); b.px(10, 1, 'e2'); b.px(1, 0, 'k4'); b.px(1, 2, 'k4'); return b; },
  rocket() { const b = new PixelBuf(7, 3); b.hline(1, 5, 1, 'k5'); b.px(6, 1, 'e2'); return b; },
  intc() { const b = new PixelBuf(7, 3); b.hline(1, 5, 1, 'k7'); b.px(6, 1, 'l1'); return b; },
  bomb() { const b = new PixelBuf(5, 5); b.circle(2, 2, 1, 'k2'); b.px(2, 0, 'k4'); return b; },
};
// NATO tarzı harita sembolü (11x9): dost dikdörtgen, düşman eşkenar dörtgen
function symbol(type, hostile) {
  const b = new PixelBuf(13, 11);
  if (hostile) { for (let k = 0; k <= 5; k++) { b.px(6 - k, 5 - k + 0, 'k7'); b.px(6 + k, 5 - k, 'k7'); b.px(6 - k, 5 + k, 'k7'); b.px(6 + k, 5 + k, 'k7'); } }
  else { b.hline(1, 11, 1, 'k7'); b.hline(1, 11, 9, 'k7'); b.vline(1, 1, 9, 'k7'); b.vline(11, 1, 9, 'k7'); }
  const g = {
    inf: () => { b.line(3, 3, 9, 7, 'k7'); b.line(9, 3, 3, 7, 'k7'); },
    armor: () => { b.hline(4, 8, 3, 'k7'); b.hline(4, 8, 7, 'k7'); b.vline(3, 4, 6, 'k7'); b.vline(9, 4, 6, 'k7'); },
    mech: () => { b.line(3, 3, 9, 7, 'k7'); b.line(9, 3, 3, 7, 'k7'); b.vline(3, 4, 6, 'k7'); b.vline(9, 4, 6, 'k7'); },
    arty: () => { b.circle(6, 5, 1, 'k7'); },
    eng: () => { b.hline(3, 9, 4, 'k7'); b.vline(3, 4, 6, 'k7'); b.vline(6, 4, 6, 'k7'); b.vline(9, 4, 6, 'k7'); },
    ad: () => { for (let x = 3; x <= 9; x++) b.px(x, 7 - Math.round(Math.sqrt(9 - (x - 6) * (x - 6))), 'k7'); },
    ew: () => { b.line(3, 6, 5, 3, 'k7'); b.line(5, 3, 7, 7, 'k7'); b.line(7, 7, 9, 4, 'k7'); },
    mlrs: () => { b.circle(6, 5, 1, 'k7'); b.hline(3, 9, 7, 'k7'); b.px(4, 3, 'k7'); b.px(8, 3, 'k7'); },
    ship: () => { b.hline(3, 9, 6, 'k7'); b.line(3, 6, 4, 7, 'k7'); b.line(9, 6, 8, 7, 'k7'); b.vline(6, 3, 6, 'k7'); },
  };
  (g[type] || g.inf)();
  b.outline('k0'); return b;
}

// ---------- atlas ----------
export class Atlas {
  constructor(size = 2048) {
    this.size = size; this.canvas = makeCanvas(size, size); this.ctx = this.canvas.getContext('2d');
    this.frames = new Map(); this.x = 1; this.y = 1; this.rowH = 0;
  }
  alloc(w, h) {
    if (this.x + w + 1 > this.size) { this.x = 1; this.y += this.rowH + 1; this.rowH = 0; }
    const r = [this.x, this.y]; this.x += w + 1; this.rowH = Math.max(this.rowH, h);
    if (this.y + h > this.size) throw new Error('atlas dolu');
    return r;
  }
  addBuf(name, b, meta = {}) {
    const [x, y] = this.alloc(b.w, b.h);
    this.ctx.putImageData(b.toImageData(), x, y);
    const f = { x, y, w: b.w, h: b.h, ...meta }; this.frames.set(name, f); return f;
  }
  addImage(name, img, sx, sy, w, h, meta = {}) {
    const [x, y] = this.alloc(w, h); this.ctx.drawImage(img, sx, sy, w, h, x, y, w, h);
    const f = { x, y, w, h, ...meta }; this.frames.set(name, f); return f;
  }
  get(n) { return this.frames.get(n); }
}
export function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined' && typeof document === 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas'); c.width = w; c.height = h; return c;
}
function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

export const DIRS = 16;
export async function buildAtlas() {
  const A = new Atlas(4096);
  // beyaz piksel ve yumuşak ışık
  const wb = new PixelBuf(4, 4); wb.rect(0, 0, 4, 4, 0xffffffff); A.addBuf('white', wb);
  A.white = A.get('white'); A.white.x += 1; A.white.y += 1; A.white.w = 1; A.white.h = 1;
  { const [x, y] = A.alloc(64, 64); const g = A.ctx.createRadialGradient(x + 32, y + 32, 0, x + 32, y + 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    A.ctx.fillStyle = g; A.ctx.fillRect(x, y, 64, 64); A.frames.set('soft', { x, y, w: 64, h: 64 }); }
  // duman/ateş/kıvılcım
  for (let s = 0; s < 4; s++) { const r = 1 + s; const b = new PixelBuf(r * 2 + 3, r * 2 + 3); b.circle(r + 1, r + 1, r, 0xffffffff); b.px(r, r, 0xffffffff); A.addBuf('puff' + s, b); }
  for (let s = 0; s < 3; s++) { const b = new PixelBuf(5, 7); b.ellipse(2, 4, 2, 2 + (s % 2), 'o1'); b.ellipse(2, 4, 1, 1, 'l0'); b.px(2, 1 + s, 'l1'); A.addBuf('fire' + s, b); }
  { const b = new PixelBuf(17, 17); for (let a = 0; a < 48; a++) { const t = a / 48 * 6.283; b.px(8 + Math.round(Math.cos(t) * 7), 8 + Math.round(Math.sin(t) * 7), 0xffffffff); } A.addBuf('ring', b); }
  { const b = new PixelBuf(9, 9); b.circle(4, 4, 4, 'l1'); b.circle(4, 4, 2, 0xffffffff); A.addBuf('flash', b); }
  { const b = new PixelBuf(3, 3); b.circle(1, 1, 1, 0xffffffff); A.addBuf('dot', b); }
  // birimler: 16 yön döndürülmüş
  for (const [name, gen] of Object.entries(UNIT_GEN)) {
    const base = gen();
    for (let d = 0; d < DIRS; d++) {
      const ang = d * Math.PI * 2 / DIRS; const r = base.rotated(Math.cos(ang), Math.sin(ang)); r.outline('k0');
      const mask = r.splitTeam();
      A.addBuf(`gen:${name}:${d}`, r);
      if (mask) A.addBuf(`gen:${name}:${d}:m`, mask);
    }
  }
  for (const t of ['inf', 'armor', 'mech', 'arty', 'eng', 'ad', 'ew', 'mlrs', 'ship']) { A.addBuf('sym:' + t + ':f', symbol(t, false)); A.addBuf('sym:' + t + ':h', symbol(t, true)); }
  // kara araçları (sağa bakan; sola giderken yatay çevrilir)
  for (const [id, gen] of Object.entries(VEHICLES)) { const a = gen(); a.outline(); a.shadow(2, 1, 70); const m = a.splitTeam(); A.addBuf('v:' + id, a); if (m) A.addBuf('v:' + id + ':m', m); }
  // yukarıdan araçlar: 16 yön
  for (const [id, gen] of Object.entries(TOPDOWN)) {
    const base = gen();
    for (let d = 0; d < DIRS; d++) { const ang = d * Math.PI * 2 / DIRS; const r = base.rotated(Math.cos(ang), Math.sin(ang)); r.outline(); const m = r.splitTeam(); A.addBuf(`gen:${id}:${d}`, r); if (m) A.addBuf(`gen:${id}:${d}:m`, m); }
  }
  // binalar: sağlam / hasarlı / harabe
  BUILDINGS.forEach((def, i) => {
    if (def.look === 'bridge') return;
    for (let v = 0; v < 3; v++) {
      const { a, meta } = buildingArt(def, v, 17 + i * 13, BUILD_TOP_L);
      const mask = a.splitTeam();
      A.addBuf(`b:${def.id}:${v}`, a, { meta, top: BUILD_TOP });
      if (mask) A.addBuf(`b:${def.id}:${v}:m`, mask);
    }
  });
  // şehir adaları (3x3 karo)
  for (const [k, n] of Object.entries(BLOCK_KINDS)) for (let v = 0; v < n; v++) for (const vr of [0, 1]) {
    const a = blockArt(k, v, vr); A.addBuf(`blk:${k}:${v}:${vr}`, a, { lights: vr ? [] : a.lights.filter((_, j) => j % 2 === 0) });
  }
  // kaynak ikonları
  for (const id of RES_ICON_LIST) A.addBuf('res:' + id, resIcon(id));
  // ağaçlar ve yataklar (araziye pişirilir; atlas dışında tutulur)
  A.trees = [0, 1, 2, 3].map((s) => ({ round: [0, 1, 2].map((v) => treeArt('round', s, v)), pine: [0, 1].map((v) => treeArt('pine', s, v)), bush: [0, 1].map((v) => treeArt('bush', s, v)) }));
  A.deposits = [null]; for (let r = 1; r <= 7; r++) A.deposits.push([0, 1, 2].map((v) => depositArt(r, v)));
  return A;
}

// UI ikonu (DOM): atlas karesinden ölçekli dataURL
export function frameIcon(A, name, scale = 3, tint) {
  const f = A.get(name); if (!f) return '';
  const c = makeCanvas(f.w * scale, f.h * scale); const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.drawImage(A.canvas, f.x, f.y, f.w, f.h, 0, 0, f.w * scale, f.h * scale);
  if (tint) { const m = A.get(name + ':m'); if (m) { const t = makeCanvas(m.w, m.h), tx = t.getContext('2d'); tx.drawImage(A.canvas, m.x, m.y, m.w, m.h, 0, 0, m.w, m.h); tx.globalCompositeOperation = 'multiply'; tx.fillStyle = tint; tx.fillRect(0, 0, m.w, m.h); tx.globalCompositeOperation = 'destination-in'; tx.drawImage(A.canvas, m.x, m.y, m.w, m.h, 0, 0, m.w, m.h); x.drawImage(t, 0, 0, m.w * scale, m.h * scale); } }
  return c.toDataURL ? c.toDataURL() : '';
}
