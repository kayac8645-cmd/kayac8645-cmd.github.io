// Şehir adaları (3x3 karo = 96 px, 32 px karo): sokaklarla çevrili kare adalar; binalar çevrede, ortada
// bahçe / avlu / meydan / otopark. Türler: konut, apartman, ofis, çarşı, okul, park. Harici görsel yok.
import { Art, shade, hex } from './art.js';
import { RNG } from '../core/rng.js';

export const BLOCK = 3, BT = 32, BPX = BLOCK * BT, BLOCK_TOP = 72, STREET = 5;
const C = hex;
export const BLOCK_KINDS = { houses: 4, apartments: 3, office: 2, market: 2, school: 1, park: 2 };

function win(a, x, y, lit, w = 3, h = 4) {
  a.rect(x - 1, y - 1, w + 2, h + 2, '#e6e0d0'); a.rect(x, y, w, h, lit ? '#ffe3a0' : '#5b8fbf');
  a.p(x, y, lit ? '#fff6d0' : '#c9e6f8'); a.line(x, y + (h >> 1), x + w - 1, y + (h >> 1), '#e6e0d0'); a.line(x, y + h, x + w - 1, y + h, '#a89c84');
  if (a.lights && lit) a.lights.push([x + 1, y + 1]);
}
function tiledRoof(a, x, y, w, rh, base) {
  base = C(base);
  for (let k = 0; k < rh; k++) for (let xx = x; xx < x + w; xx++) { let f = 1.18 - 0.4 * (k / rh); if ((xx + ((k >> 1) * 2)) % 4 === 0) f *= 0.82; if (k % 2 === 1) f *= 0.92; a.p(xx, y - k, shade(base, f)); }
  a.line(x, y - rh, x + w - 1, y - rh, shade(base, 1.35));
}
const ROOFS = ['#b7593f', '#94402f', '#5c6272', '#7a8090', '#6e2e24'], WALLS = ['#e8dcc4', '#d9c9a8', '#cfc2a8', '#e3d6bd'];
function house(a, ox, oy, s, r) {
  const roof = C(ROOFS[s % 5]), wall = C(WALLS[s % 4]); const bw = 28, x = ox + 2, base = oy + 30;
  a.rect(x, base - 14, bw, 14, wall);
  for (let yy = base - 14; yy < base; yy++) for (let xx = x; xx < x + bw; xx++) if ((xx * 5 + yy * 3) % 11 === 0) a.p(xx, yy, shade(wall, 0.93));
  a.line(x + bw - 1, base - 14, x + bw - 1, base - 1, shade(wall, 0.7)); a.line(x, base - 1, x + bw - 1, base - 1, shade(wall, 0.65));
  tiledRoof(a, x - 1, base - 15, bw + 2, 10, roof); for (let xx = x - 1; xx < x + bw + 1; xx++) a.p(xx, base - 15, shade(roof, 0.5));
  a.rect(x + bw - 8, base - 27, 4, 5, '#94402f'); a.line(x + bw - 8, base - 27, x + bw - 5, base - 27, '#5c5a57');
  win(a, x + 3, base - 11, r.next() < 0.4); win(a, x + bw - 8, base - 11, r.next() < 0.4);
  a.rect(x + 12, base - 9, 5, 9, '#6b3e22'); a.p(x + 16, base - 5, '#f7c948'); a.line(x + 11, base - 10, x + 17, base - 10, '#a89c84');
}
function rowhouse(a, ox, oy, s, r) {
  const cols = [['#b7593f', '#e8dcc4'], ['#94402f', '#d9c9a8'], ['#6e2e24', '#e3d6bd'], ['#7a8090', '#cfc2a8']];
  for (let k = 0; k < 2; k++) {
    const [rf, wl] = cols[(s + k) % 4].map(C); const x = ox + k * 16, base = oy + 30, h = 18 + ((s + k) % 2) * 4;
    a.rect(x, base - h, 16, h, wl);
    for (let yy = base - h; yy < base; yy++) for (let xx = x; xx < x + 16; xx++) if ((xx * 5 + yy * 3) % 11 === 0) a.p(xx, yy, shade(wl, 0.93));
    a.line(x + 15, base - h, x + 15, base - 1, shade(wl, 0.72)); tiledRoof(a, x, base - h - 1, 16, 8, rf);
    win(a, x + 2, base - h + 3, r.next() < 0.4); win(a, x + 10, base - h + 3, r.next() < 0.4); a.rect(x + 5, base - 9, 4, 9, '#5a3620'); win(a, x + 11, base - 9, r.next() < 0.3, 3, 3);
  }
}
function apartment(a, ox, oy, s, floors, r) {
  const wall = C(['#c9b8a0', '#b9bcc4', '#d6c2a2'][s % 3]); const x = ox + 1, base = oy + 31, h = floors * 6 + 4, w = 26;
  a.rect(x, base - h, w, h, wall);
  for (let k = 0; k < 4; k++) a.line(x + w + k, base - h - k, x + w + k, base - 1 - k, shade(wall, 0.6));
  a.rect(x, base - h - 6, w, 6, shade(wall, 1.22));
  for (let k = 0; k < 4; k++) a.line(x + k, base - h - 6 - k, x + w - 1 + k, base - h - 6 - k, shade(wall, 1.3 - k * 0.03));
  a.rect(x + 3, base - h - 9, 5, 3, '#6d7486'); a.rect(x + 16, base - h - 8, 6, 2, '#9aa1b0');
  for (let f = 0; f < floors; f++) { const y = base - h + 3 + f * 6; for (let c = 0; c < 4; c++) win(a, x + 2 + c * 6, y, r.next() < 0.35, 4, 3); a.line(x, y + 5, x + w - 1, y + 5, shade(wall, 0.86)); }
  a.rect(x + 10, base - 6, 6, 6, '#2b2f3c'); a.rect(x + 9, base - 7, 8, 1, '#6d7486');
}
function office(a, ox, oy, s, r) {
  const x = ox + 3, base = oy + 31, h = 56 + (s % 3) * 6, w = 22; const glass = C(s % 2 ? '#3f6a9a' : '#4a5a6a');
  for (let yy = base - h; yy < base; yy++) for (let xx = x; xx < x + w; xx++) { const f = 1.25 - 0.5 * ((xx - x) / w) + 0.08 * Math.sin(yy * 0.5); a.p(xx, yy, yy % 5 ? shade(glass, f) : C('#9aa1b0')); }
  for (let xx = x; xx < x + w; xx += 4) a.line(xx, base - h, xx, base - 1, '#2f4d78');
  for (let k = 0; k < 4; k++) a.line(x + w + k, base - h - k, x + w + k, base - 1 - k, shade(glass, 0.55));
  for (let k = 0; k < 4; k++) a.line(x + k, base - h - 1 - k, x + w - 1 + k, base - h - 1 - k, '#c9ced8');
  a.rect(x + 8, base - h - 12, 3, 8, '#6d7486'); a.p(x + 9, base - h - 13, '#ff4a3a');
  for (let k = 0; k < 24; k++) { const px = x + r.int(w), py = base - h + r.int(h); a.p(px, py, '#ffe3a0'); if (a.lights && k % 3 === 0) a.lights.push([px, py]); }
  a.rect(x + 7, base - 6, 8, 6, '#1a1d28');
}
function shop(a, ox, oy, s) {
  const x = ox + 1, base = oy + 30, w = 30, h = 14; const wall = C('#e9dcc0');
  a.rect(x, base - h, w, h, wall); a.rect(x, base - h - 3, w, 3, '#c9ced8');
  const aw = ['#c43a33', '#2f5aa8', '#356b35'][s % 3];
  for (let k = 0; k < 10; k++) a.rect(x + k * 3, base - h, 3, 3, k % 2 ? aw : '#eef1f5');
  a.rect(x + 2, base - 10, 10, 8, '#8cbfdc'); a.line(x + 2, base - 10, x + 11, base - 10, '#d6ecf8'); a.rect(x + 14, base - 10, 5, 10, '#5a3620'); a.rect(x + 21, base - 10, 7, 8, '#8cbfdc');
  a.rect(x + 6, base - h - 8, 18, 5, '#2f5aa8'); a.line(x + 8, base - h - 6, x + 21, base - h - 6, '#eef1f5');
  if (a.lights) a.lights.push([x + 6, base - 6], [x + 24, base - 6]);
}
export function tree32(a, x, y, col = '#3f8a3a') { col = C(col); a.rect(x - 1, y, 3, 6, '#5a3620'); a.ell(x, y - 3, 6, 5, shade(col, 0.75)); a.ell(x - 1, y - 4, 5, 4, col); a.ell(x - 2, y - 6, 3, 2, shade(col, 1.25)); a.p(x - 3, y - 7, shade(col, 1.5)); }
function court(a, x, y, w, h, kind, r) {
  if (kind === 'garden') {
    a.rect(x, y, w, h, '#5f9e4b'); for (let k = 0; k < (w * h / 14) | 0; k++) a.p(x + r.int(w), y + r.int(h), ['#7fbf5a', '#4f8f42', '#9acd6a'][r.int(3)]);
    tree32(a, x + (w >> 1), y + (h >> 1) + 2); a.rect(x + 2, y + h - 4, w - 4, 1, '#cfa874');
  } else if (kind === 'plaza') {
    a.rect(x, y, w, h, '#c9c2b0'); for (let yy = y; yy < y + h; yy += 4) for (let xx = x; xx < x + w; xx += 4) a.p(xx, yy, '#a89c84');
    a.ell(x + (w >> 1), y + (h >> 1), 6, 4, '#a3a09a'); a.ell(x + (w >> 1), y + (h >> 1), 4, 2, '#4a85b5'); a.p(x + (w >> 1), y + (h >> 1) - 1, '#d6ecf8');
  } else {
    a.rect(x, y, w, h, '#5c5f66'); for (let xx = x + 2; xx < x + w - 2; xx += 6) a.line(xx, y + 2, xx, y + 8, '#eef1f5');
    for (const [xx, cl] of [[x + 4, '#c43a33'], [x + 16, '#2f5aa8'], [x + 28, '#eef1f5']]) if (xx + 4 < x + w) { a.rect(xx, y + 3, 4, 6, cl); a.p(xx + 1, y + 4, '#8cbfdc'); }
  }
}
// ada sprite'ı: 96 x (96 + BLOCK_TOP); taban satırı = BLOCK_TOP + 96
export function blockArt(kind, v, ruined) {
  const W = BPX, H = BPX + BLOCK_TOP; const a = new Art(W, H, 501 + v * 31 + kind.length * 7, 1); a.lights = [];
  const r = new RNG(77 + v * 13 + kind.length); const oy0 = BLOCK_TOP;
  // sokak payı (yarım sokak; komşu adayla 10 px sokak olur) + kaldırım
  a.rect(0, oy0, W, BPX, '#4a4d55'); a.tex(0, oy0, W, BPX, '#4a4d55', 0.25, 0.9, 1.08);
  for (let x = 0; x < W; x += 8) { a.rect(x, oy0, 4, 1, '#d9dce2'); a.rect(x, oy0 + BPX - 1, 4, 1, '#d9dce2'); }
  for (let y = oy0; y < oy0 + BPX; y += 8) { a.rect(0, y, 1, 4, '#d9dce2'); a.rect(W - 1, y, 1, 4, '#d9dce2'); }
  const X0 = STREET, Y0 = oy0 + STREET, S = BPX - 2 * STREET;
  a.rect(X0, Y0, S, S, '#a3a09a'); for (let k = 0; k < S; k += 4) { a.p(X0 + k, Y0, '#c9c6be'); a.p(X0, Y0 + k, '#c9c6be'); }
  const T3 = S / 3; const cell = (cx, cy) => [X0 + cx * T3 - 1, Y0 + cy * T3 - 1];
  const ring = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
  if (kind === 'houses') {
    court(a, X0 + T3 - 4, Y0 + T3 - 4, T3 + 8, T3 + 8, 'garden', r);
    for (const [cx, cy] of ring) { const [x, y] = cell(cx, cy); const s = v * 7 + cx * 3 + cy; if ((cx === 1) && s % 2) rowhouse(a, x, y, s, r); else house(a, x, y, s, r); }
  } else if (kind === 'apartments') {
    court(a, X0 + T3 - 2, Y0 + T3 - 2, T3 + 4, T3 + 4, v % 2 ? 'garden' : 'parking', r);
    for (const [cx, cy] of ring) { const [x, y] = cell(cx, cy); apartment(a, x, y, v + cx * 5 + cy, cy === 0 ? 7 + ((cx + v) % 2) : 4 + ((cx + cy + v) % 2), r); }
  } else if (kind === 'office') {
    court(a, X0 + 4, Y0 + T3, S - 8, T3, 'plaza', r);
    for (const [cx, cy] of [[0, 0], [2, 0], [0, 2], [2, 2]]) { const [x, y] = cell(cx, cy); office(a, x, y, v + cx + cy, r); }
    for (const [cx, cy] of [[1, 0], [1, 2]]) { const [x, y] = cell(cx, cy); apartment(a, x, y, v + cx * 3, cy === 0 ? 8 : 5, r); }
  } else if (kind === 'market') {
    court(a, X0 + T3 - 6, Y0 + T3 - 6, T3 + 12, T3 + 12, 'plaza', r);
    for (const [cx, cy] of [[0, 0], [1, 0], [2, 0], [0, 2], [1, 2], [2, 2]]) { const [x, y] = cell(cx, cy); shop(a, x, y, v + cx + cy * 2); }
    for (let k = 0; k < 3; k++) { const xx = X0 + T3 + k * 10; a.rect(xx, Y0 + T3 + 10, 8, 6, ['#c43a33', '#f7c948', '#2f5aa8'][k]); a.rect(xx, Y0 + T3 + 16, 8, 2, '#8c6440'); }
  } else if (kind === 'school') {
    court(a, X0 + 4, Y0 + T3 + 4, S - 8, T3 + 20, 'garden', r);
    a.box(X0 + 4, Y0 + 18, S - 12, 10, 18, '#c97a4a', { roof: '#d9a35a' });
    for (let c = 0; c < 9; c++) win(a, X0 + 7 + c * 9, Y0 + 22, c % 3 === 0, 4, 3);
    a.rect(X0 + 10, Y0 + T3 + 38, 30, 16, '#c96a4a'); for (let k = 0; k < 30; k += 6) a.line(X0 + 10 + k, Y0 + T3 + 38, X0 + 10 + k, Y0 + T3 + 53, '#eef1f5');
    a.line(X0 + S - 10, Y0 + 2, X0 + S - 10, Y0 + 22, '#4a5061'); a.rect(X0 + S - 9, Y0 + 2, 8, 5, '#3f7fe0');
  } else { // park
    a.rect(X0 + 2, Y0 + 2, S - 4, S - 4, '#5f9e4b'); for (let k = 0; k < 260; k++) a.p(X0 + 2 + r.int(S - 4), Y0 + 2 + r.int(S - 4), ['#7fbf5a', '#4f8f42', '#9acd6a'][r.int(3)]);
    a.line(X0 + 2, Y0 + (S >> 1), X0 + S - 3, Y0 + (S >> 1), '#cfa874'); a.line(X0 + (S >> 1), Y0 + 2, X0 + (S >> 1), Y0 + S - 3, '#cfa874');
    a.ell(X0 + (S >> 1), Y0 + (S >> 1), 8, 6, '#4a85b5'); a.ell(X0 + (S >> 1), Y0 + (S >> 1), 6, 4, '#2b6094');
    for (const [tx, ty] of [[10, 14], [24, 22], [62, 12], [72, 26], [12, 62], [24, 74], [64, 68], [74, 76], [44, 16], [44, 74]]) tree32(a, X0 + tx, Y0 + ty, ['#3f8a3a', '#2f7a3a', '#4f9a42'][r.int(3)]);
  }
  if (ruined) a.ruin(oy0 + 40, v + 9); else a.outline();
  a.shadow(3, 2, 70);
  return a;
}
