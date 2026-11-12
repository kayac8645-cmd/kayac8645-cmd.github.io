// Map Engine (görsel): piksel doku üretimi — biyomlar, kabartma gölgeleme, nehirler, yollar, ağaçlar, dağlar
import { W, H, TS, hash2, vnoise, clamp, D8 } from './util.js';
import { T } from './data.js';

const PW = W * TS, PH = H * TS;
const C = {
  plains: [[116, 172, 72], [132, 186, 84], [98, 154, 62]],
  forest: [[48, 108, 54], [38, 92, 46], [60, 124, 60]],
  desert: [[222, 194, 122], [208, 178, 106], [234, 208, 142]],
  hills: [[142, 152, 86], [124, 136, 74], [158, 164, 100]],
  mountain: [[130, 124, 118], [104, 100, 96], [154, 148, 140]],
  snow: [[228, 238, 244], [208, 222, 234], [240, 246, 250]],
};
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function stampRiver(mask, paths) {
  const pts = [];
  for (const path of paths) {
    const arr = []; const L = path.length;
    for (let k = 0; k < L - 1; k++) {
      const a = path[k], b = path[k + 1];
      const ax = (a % W) * TS + TS / 2 + (hash2(a, 3, 5) - 0.5) * 7, ay = ((a / W) | 0) * TS + TS / 2 + (hash2(a, 9, 6) - 0.5) * 7;
      const bx = (b % W) * TS + TS / 2 + (hash2(b, 3, 5) - 0.5) * 7, by = ((b / W) | 0) * TS + TS / 2 + (hash2(b, 9, 6) - 0.5) * 7;
      const len = Math.hypot(bx - ax, by - ay); const steps = Math.ceil(len);
      const nx = -(by - ay) / len, ny = (bx - ax) / len;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps, off = Math.sin((k * 16 + s) * 0.45) * 1.8;
        const x = ax + (bx - ax) * t + nx * off, y = ay + (by - ay) * t + ny * off;
        const r = 0.9 + 1.5 * ((k + t) / L);
        const x0 = Math.floor(x - r), x1 = Math.ceil(x + r), y0 = Math.floor(y - r), y1 = Math.ceil(y + r);
        for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) if (xx >= 0 && yy >= 0 && xx < PW && yy < PH && (xx - x) ** 2 + (yy - y) ** 2 <= r * r + 0.3) mask[yy * PW + xx] = 1;
        if (s % 5 === 0) arr.push(x, y);
      }
    }
    pts.push(arr);
  }
  return pts;
}

export async function buildTerrain(Wd, progress = () => {}) {
  const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(PW, PH), d = img.data;
  const foam = document.createElement('canvas'); foam.width = PW; foam.height = PH;
  const fctx = foam.getContext('2d'); const fimg = fctx.createImageData(PW, PH), fd = fimg.data;
  const rmask = new Uint8Array(PW * PH);
  const riverPts = stampRiver(rmask, Wd.riverPaths);
  const { terr, elev } = Wd;
  const el = (x, y) => elev[clamp(y, 0, H - 1) * W + clamp(x, 0, W - 1)];
  const landAt = (x, y) => { const t = terr[clamp(y, 0, H - 1) * W + clamp(x, 0, W - 1)]; return t; };
  const nearLand = (x, y) => { let t = landAt(x, y); if (t > T.LAKE) return t; for (const [dx, dy] of D8) { const q = landAt(x + dx, y + dy); if (q > T.LAKE) return q; } return T.PLAINS; };
  const DEEP = [20, 58, 104], SHAL = [58, 144, 192], LAKE = [66, 150, 182], SAND = [228, 210, 152], RIV = [66, 140, 214];

  for (let by = 0; by < PH; by += 2) {
    for (let bx = 0; bx < PW; bx += 2) {
      const fx = (bx + 1) / TS, fy = (by + 1) / TS;
      const wxn = vnoise(fx * 2.3, fy * 2.3, 11) - 0.5, wyn = vnoise(fx * 2.3 + 37, fy * 2.3 + 11, 12) - 0.5;
      const tx = clamp(Math.floor(fx + wxn * 0.8), 0, W - 1), ty = clamp(Math.floor(fy + wyn * 0.8), 0, H - 1);
      let t = terr[ty * W + tx];
      const ex = fx - 0.5, ey = fy - 0.5, x0 = Math.floor(ex), y0 = Math.floor(ey), ux = ex - x0, uy = ey - y0;
      const e00 = el(x0, y0), e10 = el(x0 + 1, y0), e01 = el(x0, y0 + 1), e11 = el(x0 + 1, y0 + 1);
      const gx = (e10 - e00) * (1 - uy) + (e11 - e01) * uy, gy = (e01 - e00) * (1 - ux) + (e11 - e10) * ux;
      let e = e00 * (1 - ux) * (1 - uy) + e10 * ux * (1 - uy) + e01 * (1 - ux) * uy + e11 * ux * uy + (vnoise(fx * 7, fy * 7, 13) - 0.5) * 0.09;
      const rv = rmask[by * PW + bx] === 1;
      let col, fa = 0;
      const nz = vnoise(fx * 3.4, fy * 3.4, 21);
      if (e <= 0) {
        // su
        const lakeT = t === T.LAKE;
        if (t > T.LAKE) t = T.SEA; // kıyıdaki sapma: komşu su tipi
        if (lakeT) { col = mix(LAKE, [50, 128, 168], clamp(-e * 4, 0, 1)); }
        else { col = mix(SHAL, DEEP, clamp((-e - 0.04) / 0.42, 0, 1)); }
        col = [col[0] + (nz - 0.5) * 10, col[1] + (nz - 0.5) * 10, col[2] + (nz - 0.5) * 12];
        if (e > -0.17 && e < -0.045) { const k = 1 - Math.abs(e + 0.105) / 0.065; fa = 150 * k * (0.55 + 0.45 * vnoise(fx * 9, fy * 9, 15)); }
        if (e > -0.045) col = mix(col, [150, 214, 230], 0.45);
      } else {
        const tt = t <= T.LAKE ? nearLand(tx, ty) : t;
        let pal = tt === T.PLAINS ? C.plains : tt === T.FOREST ? C.forest : tt === T.DESERT ? C.desert : tt === T.HILLS ? C.hills : tt === T.MOUNTAIN ? C.mountain : C.snow;
        col = nz < 0.4 ? mix(pal[0], pal[1], (0.4 - nz) * 2.5) : mix(pal[0], pal[2], (nz - 0.4) * 1.67);
        const strength = tt === T.MOUNTAIN ? 1.5 : tt === T.HILLS ? 1.1 : 0.35;
        const light = clamp(-(gx * 0.8 + gy * 0.6) * 1.2, -0.5, 0.5) * strength;
        col = [col[0] * (1 + light * 0.7), col[1] * (1 + light * 0.7), col[2] * (1 + light * 0.75)];
        if (tt === T.MOUNTAIN && e > 0.82 && nz > 0.38) col = mix(col, [238, 242, 248], clamp((e - 0.82) * 5, 0, 0.9));
        if (tt === T.MOUNTAIN) { const st = vnoise(fx * 11 + fy * 5, fy * 11, 17); col = [col[0] * (0.9 + st * 0.2), col[1] * (0.9 + st * 0.2), col[2] * (0.9 + st * 0.2)]; }
        if (e < 0.05 && tt !== T.SNOW) col = mix(col, SAND, clamp((0.05 - e) / 0.05, 0, 0.85));
        if (rv) col = mix(col, RIV, 0.92);
      }
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const px = bx + i, py = by + j; if (px >= PW || py >= PH) continue;
        const dn = (hash2(px, py, 77) - 0.5) * 12; const k = (py * PW + px) * 4;
        d[k] = col[0] + dn; d[k + 1] = col[1] + dn; d[k + 2] = col[2] + dn; d[k + 3] = 255;
        if (fa) { const f = hash2(px >> 1, py >> 1, 5) > 0.35 ? fa : fa * 0.35; fd[k] = 255; fd[k + 1] = 255; fd[k + 2] = 255; fd[k + 3] = f; }
      }
    }
    if ((by & 63) === 0) { progress(by / PH * 0.8); await new Promise((r) => setTimeout(r, 0)); }
  }
  ctx.putImageData(img, 0, 0); fctx.putImageData(fimg, 0, 0);
  decorate(ctx, Wd); progress(1);
  return { canvas: cv, foam, riverPts };
}

// ---- dekor: ağaçlar, dağlar, tepeler, çöl, tarla, yollar
function px(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w, h); }
function tree(ctx, x, y, v, snow) {
  const dk = snow ? '#2c5a46' : v ? '#2a6a34' : '#245a2e', md = snow ? '#3f7a5f' : v ? '#3f8a45' : '#347a3c';
  px(ctx, x + 2, y + 6, 1, 2, '#4a3220');
  px(ctx, x + 2, y, 1, 1, md); px(ctx, x + 1, y + 1, 3, 1, dk); px(ctx, x + 1, y + 2, 3, 1, md); px(ctx, x, y + 3, 5, 1, dk); px(ctx, x + 1, y + 4, 3, 1, md); px(ctx, x, y + 5, 5, 1, dk);
  if (snow) { px(ctx, x + 2, y, 1, 1, '#fff'); px(ctx, x + 1, y + 2, 1, 1, '#e8f2f6'); px(ctx, x + 3, y + 3, 1, 1, '#e8f2f6'); }
  else px(ctx, x + 1, y + 1, 1, 1, '#5aa860');
}
function peak(ctx, x, y, w, h, snowy) {
  for (let r = 0; r < h; r++) {
    const half = Math.round((r + 1) / h * w / 2), cx = x + (w >> 1);
    for (let i = -half; i <= half; i++) {
      let c = i < -1 ? '#a39b90' : i > 1 ? '#625c58' : '#85807a';
      if (r < h * 0.32 && snowy) c = i > 1 ? '#c9d4e0' : '#f4f8fc';
      px(ctx, cx + i, y + r, 1, 1, c);
    }
    px(ctx, cx - half - 1, y + r, 1, 1, 'rgba(30,26,24,.55)'); px(ctx, cx + half + 1, y + r, 1, 1, 'rgba(30,26,24,.55)');
  }
}
function line(ctx, x0, y0, x1, y1, col, w) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let err = dx - dy, x = x0 | 0, y = y0 | 0; ctx.fillStyle = col;
  for (let n = 0; n < 400; n++) { ctx.fillRect(x, y, w, w); if (x === (x1 | 0) && y === (y1 | 0)) break; const e2 = 2 * err; if (e2 > -dy) { err -= dy; x += sx; } if (e2 < dx) { err += dx; y += sy; } }
}
function decorate(ctx, Wd) {
  const { terr, river, road, prov, cities, deposit } = Wd;
  const cityTile = new Set(cities.map((c) => c.t));
  // tarlalar (şehir çevresi, ova)
  for (const c of cities) {
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const x = c.x + dx, y = c.y + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const i = y * W + x;
      if (terr[i] !== T.PLAINS || Math.hypot(dx, dy) < 1.4 || Math.hypot(dx, dy) > 3.2 || river[i] || road[i] || prov[i] !== c.id) continue;
      for (let fy = 0; fy < 2; fy++) for (let fx = 0; fx < 2; fx++) {
        const h = hash2(x * 2 + fx, y * 2 + fy, 91); if (h < 0.35) continue;
        const col = h > 0.8 ? '#b9a85a' : h > 0.6 ? '#9cc058' : '#86b04c';
        px(ctx, x * TS + fx * 8 + 1, y * TS + fy * 8 + 1, 6, 6, col);
        for (let k = 0; k < 6; k += 2) px(ctx, x * TS + fx * 8 + 1, y * TS + fy * 8 + 1 + k, 6, 1, 'rgba(60,90,30,.35)');
      }
    }
  }
  // yollar
  for (let i = 0; i < W * H; i++) {
    if (!road[i]) continue; const x = i % W, y = (i / W) | 0;
    const cx = x * TS + 8 + (hash2(x, y, 3) - 0.5) * 4, cy = y * TS + 8 + (hash2(x, y, 4) - 0.5) * 4;
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!road[j]) continue;
      const jx = nx * TS + 8 + (hash2(nx, ny, 3) - 0.5) * 4, jy = ny * TS + 8 + (hash2(nx, ny, 4) - 0.5) * 4;
      const mount = terr[i] === T.MOUNTAIN || terr[j] === T.MOUNTAIN;
      line(ctx, cx, cy, jx, jy, mount ? '#5c4a3a' : '#7a5c3a', 2);
      line(ctx, cx, cy, jx, jy, mount ? '#a8957c' : '#c8a672', 1);
    }
  }
  // köprüler
  for (let i = 0; i < W * H; i++) if (road[i] && river[i]) { const x = (i % W) * TS + 4, y = ((i / W) | 0) * TS + 5; px(ctx, x, y, 8, 6, '#6e4a2a'); px(ctx, x, y + 1, 8, 1, '#a07848'); px(ctx, x, y + 3, 8, 1, '#a07848'); px(ctx, x, y, 8, 1, '#3a2814'); px(ctx, x, y + 5, 8, 1, '#3a2814'); }
  // arazi dekoru
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, t = terr[i], bx = x * TS, by = y * TS;
    if (t === T.FOREST) {
      const n = 4 + ((hash2(x, y, 31) * 3) | 0);
      for (let k = 0; k < n; k++) { const tx = bx + 1 + ((hash2(x, y, 40 + k) * 10) | 0), ty = by + ((hash2(x, y, 60 + k) * 7) | 0); tree(ctx, tx, ty, hash2(x, y, 90 + k) > 0.5, false); }
    } else if (t === T.SNOW && !cityTile.has(i)) {
      if (hash2(x, y, 33) > 0.35) for (let k = 0; k < 2; k++) tree(ctx, bx + 2 + ((hash2(x, y, 44 + k) * 9) | 0), by + 1 + ((hash2(x, y, 64 + k) * 7) | 0), 0, true);
    } else if (t === T.MOUNTAIN) {
      peak(ctx, bx + 1, by + 1, 12, 11, true);
      if (hash2(x, y, 35) > 0.4) peak(ctx, bx + 6, by + 6, 10, 9, hash2(x, y, 36) > 0.4);
    } else if (t === T.HILLS) {
      const n = 1 + ((hash2(x, y, 37) * 2) | 0);
      for (let k = 0; k < n; k++) { const mx = bx + 1 + ((hash2(x, y, 50 + k) * 8) | 0), my = by + 3 + ((hash2(x, y, 70 + k) * 8) | 0); px(ctx, mx + 2, my, 4, 1, '#a9b070'); px(ctx, mx + 1, my + 1, 6, 1, '#8c9560'); px(ctx, mx, my + 2, 8, 1, '#6b7448'); px(ctx, mx, my + 3, 8, 1, 'rgba(50,60,30,.4)'); }
      if (hash2(x, y, 38) > 0.55) tree(ctx, bx + 3 + ((hash2(x, y, 39) * 8) | 0), by + 2, 1, false);
    } else if (t === T.DESERT) {
      if (hash2(x, y, 41) > 0.3) { const dx = bx + 2 + ((hash2(x, y, 42) * 6) | 0), dy = by + 4 + ((hash2(x, y, 43) * 6) | 0); px(ctx, dx, dy, 6, 1, '#f2dc9c'); px(ctx, dx - 1, dy + 1, 3, 1, '#c8a864'); px(ctx, dx + 5, dy + 1, 2, 1, '#c8a864'); }
      if (hash2(x, y, 45) > 0.86) { const cx = bx + 3 + ((hash2(x, y, 46) * 9) | 0), cy = by + 3 + ((hash2(x, y, 47) * 6) | 0); px(ctx, cx, cy, 1, 5, '#3f8a45'); px(ctx, cx - 1, cy + 1, 1, 2, '#3f8a45'); px(ctx, cx + 1, cy + 2, 1, 2, '#3f8a45'); }
    } else if (t === T.PLAINS && !road[i] && !cityTile.has(i)) {
      for (let k = 0; k < 3; k++) { const gx = bx + ((hash2(x, y, 100 + k) * 14) | 0), gy = by + ((hash2(x, y, 120 + k) * 14) | 0); px(ctx, gx, gy, 1, 2, '#8cc652'); px(ctx, gx + 1, gy + 1, 1, 1, '#5e9a3e'); }
      if (hash2(x, y, 130) > 0.82) { const fx = bx + ((hash2(x, y, 131) * 14) | 0), fy = by + ((hash2(x, y, 132) * 14) | 0); px(ctx, fx, fy, 1, 1, hash2(x, y, 133) > 0.5 ? '#f4e870' : '#f08aa8'); }
    }
  }
}
