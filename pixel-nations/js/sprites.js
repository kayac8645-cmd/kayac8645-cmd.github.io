// Piksel sprite üretimi: birlikler (devlet renginde) ve şehirler (nüfus/tahkimata göre)
import { hash2, shade, hexToRgb } from './util.js';

const BM = {
  inf: ['...kkkk...', '..khhhhk..', '..kfffhk..', '..kffffk..', '...kkkk.e.', '..kppppke.', '.kpppppkeb', '.kppkppkeb', '.kppkppkb.', '..kpppk.b.', '..kk.kk...', '..kk.kk...'],
  tank: ['......kkkkkk....', '.....kppppppkk..', '.....kppqqppkeee', '..kkkkppppppkkee', '.kppppppppppppk.', 'kpppppppppppppk.', 'kdddddddddddddk.', 'kdkdkdkdkdkdkdk.', '.kdddddddddddk..', '..kkkkkkkkkkk...'],
  art: ['............kkkk', '..........kkeeek', '........kkeeeekk', '......kkeeeekk..', '..kkkkppekk.....', '.kppppppppk.....', '.kppppppppk.....', 'kdkkdkkkdkk.....', 'kdwwdkkdwwdk....', '.kddk..kddk.....', '..kk....kk......'],
  air: ['......kk......', '.....kppk.....', '.....kppk.....', '..kk.kppk.kk..', '.kppkkppkkppk.', 'kppppppppppppk', '.kkkkkppkkkkk.', '.....kppk.....', '.....kppk.....', '....kppppk....', '...kkppppkk...', '...kk.kk.kk...'],
  navy: ['........k.........', '.......kqk........', '....kkkkqkkkk.....', '...kppppqpppppk...', 'kkkkkkkkkkkkkkkkk.', '.kddddddddddddddk.', '..kddddddddddddk..', '...kkkkkkkkkkkk...'],
  trans: ['........kk........', '.......kppk.......', '...kkkkkppkkkk....', '..kqqqqqqqqqqqk...', 'kkkkkkkkkkkkkkkkk.', '.kddddddddddddk...', '..kkkkkkkkkkkk....'],
};
const cache = new Map();
function shadeHex(h, f) { return shade(h, f); }
export function unitSprite(type, nation, variant = '') {
  const key = type + nation.id + variant + nation.col; if (cache.has(key)) return cache.get(key);
  const rows = BM[type === 'trans' ? 'trans' : type]; const w = rows[0].length, h = rows.length;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const pal = { k: '#10141c', p: nation.col, q: nation.col2, f: '#f0c8a0', h: shadeHex(nation.col, -0.35), e: '#b8c2d0', d: '#2c303c', b: '#7a5430', w: '#d8dde8' };
  rows.forEach((r, yy) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch !== '.') { x.fillStyle = pal[ch] || '#f0f'; x.fillRect(i, yy, 1, 1); } } });
  c._w = w; c._h = h; cache.set(key, c); return c;
}

// ---- şehir sprite
const CITY_CACHE = new Map();
function rect(x, X, Y, w, h, col) { x.fillStyle = col; x.fillRect(X, Y, w, h); }
function house(x, X, Y, w, h, roof, wall, dark) {
  rect(x, X, Y + 3, w, h, wall); rect(x, X + w - 1, Y + 3, 1, h, dark); rect(x, X, Y + 3 + h - 1, w, 1, dark);
  for (let i = 0; i < 3; i++) rect(x, X - 1 + i, Y + 2 - i + 0, w + 2 - i * 2, 1, i === 0 ? dark : roof); // basit çatı kademesi
  rect(x, X - 1, Y + 2, w + 2, 1, roof); rect(x, X, Y + 1, w, 1, roof); rect(x, X + 1, Y, Math.max(1, w - 2), 1, shade(roof, 0.25));
  rect(x, X + 1, Y + 4, 1, 1, '#2a3a5a'); if (w > 5) rect(x, X + w - 3, Y + 4, 1, 1, '#2a3a5a');
}
export function citySprite(city, nation, tier, fort, isCap) {
  const key = [city.id, nation.id, tier, fort, isCap, nation.col].join('|'); if (CITY_CACHE.has(key)) return CITY_CACHE.get(key);
  const sizes = [[22, 17], [28, 21], [34, 25], [42, 31]]; const [W_, H_] = sizes[tier - 1];
  const S = 2; const c = document.createElement('canvas'); c.width = W_; c.height = H_; const x = c.getContext('2d');
  const cx = W_ >> 1;
  // zemin
  x.fillStyle = 'rgba(70,50,30,.35)'; x.beginPath(); x.ellipse(cx, H_ - 5, W_ / 2 - 1, 5.5, 0, 0, 7); x.fill();
  const n = [3, 6, 10, 16][tier - 1]; const wall = '#e8dcc0', dark = '#b0a080';
  const roofs = [nation.col, shade(nation.col, -0.25), '#b5542f', nation.col2];
  const spots = [];
  for (let i = 0; i < n; i++) {
    const a = hash2(city.id, i, 7) * 6.28, r = (0.15 + hash2(city.id, i, 8) * 0.85);
    const px = cx + Math.cos(a) * r * (W_ / 2 - 8), py = H_ - 12 + Math.sin(a) * r * 5.5;
    spots.push([px, py, i]);
  }
  spots.sort((p, q) => p[1] - q[1]);
  if (fort >= 1 && tier >= 2) { // sur
    const wx = 3, wy = H_ - 15, ww = W_ - 6, wh = 9;
    rect(x, wx, wy, ww, 1, '#9a9a9a'); rect(x, wx, wy + wh, ww, 1, '#7b7b7b'); rect(x, wx, wy, 1, wh, '#8a8a8a'); rect(x, wx + ww - 1, wy, 1, wh, '#6e6e6e');
    for (let i = 0; i < ww; i += 3) rect(x, wx + i, wy - 1, 2, 1, '#b0b0b0');
    if (fort >= 2) { for (const px of [wx, wx + ww - 3]) { rect(x, px, wy - 4, 3, 6, '#a8a8a8'); rect(x, px, wy - 5, 3, 1, '#c8c8c8'); rect(x, px + 2, wy - 4, 1, 6, '#808080'); } }
  }
  for (const [px, py, i] of spots) {
    const w = 4 + ((hash2(city.id, i, 9) * 3) | 0), h = 3 + ((hash2(city.id, i, 10) * 2) | 0);
    house(x, Math.round(px - w / 2), Math.round(py - h - 3), w, h, roofs[(hash2(city.id, i, 11) * 4) | 0], wall, dark);
  }
  if (tier >= 3) { // kule/kilise
    const tx = cx - 2, ty = H_ - 22;
    rect(x, tx, ty + 6, 4, 9, '#d8ceb0'); rect(x, tx + 3, ty + 6, 1, 9, dark); rect(x, tx - 1, ty + 4, 6, 2, nation.col); rect(x, tx, ty + 2, 4, 2, shade(nation.col, 0.1)); rect(x, tx + 1, ty, 2, 2, '#e8c040'); rect(x, tx + 1, ty + 9, 1, 2, '#2a3a5a');
  }
  if (tier >= 4) {
    for (const bx of [cx - 13, cx + 10]) { rect(x, bx, H_ - 20, 3, 10, '#c8bea0'); rect(x, bx + 2, H_ - 20, 1, 10, dark); rect(x, bx - 1, H_ - 22, 5, 2, nation.col2); }
  }
  if (isCap) { // saray + kubbe
    const px = cx + (tier >= 3 ? 5 : 3), py = H_ - 12;
    rect(x, px - 5, py - 3, 10, 5, '#f2ead0'); rect(x, px + 4, py - 3, 1, 5, dark); x.fillStyle = '#e8c040'; x.beginPath(); x.arc(px, py - 5, 3.2, Math.PI, 0); x.fill(); rect(x, px, py - 10, 1, 2, '#e8c040');
    rect(x, px - 4, py - 2, 1, 2, '#2a3a5a'); rect(x, px + 2, py - 2, 1, 2, '#2a3a5a');
  }
  x.strokeStyle = 'rgba(0,0,0,0)'; c._w = W_; c._h = H_; c._flagY = isCap ? H_ - 22 : tier >= 3 ? H_ - 24 : H_ - 15; c._flagX = isCap ? cx + 5 : tier >= 3 ? cx : cx + 3;
  CITY_CACHE.set(key, c); return c;
}
export function clearSpriteCaches() { CITY_CACHE.clear(); }
