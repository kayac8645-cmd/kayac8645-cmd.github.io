// Prosedürel piksel sanat: 38 bina (3/4 görünüm), kara araçları, yukarıdan uçak/gemi, şehir yapıları,
// ağaçlar, kaynak ikonları ve maden yatağı çizimleri. Hepsi Art araç takımıyla; harici görsel yok.
import { Art, shade, hex } from './art.js';
import { tree32 } from './city.js';
export const SC = 2; // 16 px tasarım -> 32 px karo (yerel detay 2 kat)
const A2 = (w, h, seed) => new Art(w * SC, h * SC, seed, SC);

const C = (h) => hex(h);
// ---------- ortak parçalar ----------
function chimney(a, x, yb, w, h, striped, smoke) {
  for (let y = yb - h; y <= yb; y++) {
    const band = striped && ((y >> 2) & 1);
    a.p(x, y, band ? '#e05a4f' : '#b8b5ad'); for (let k = 1; k < w - 1; k++) a.p(x + k, y, band ? '#c43a33' : '#8f8c86'); a.p(x + w - 1, y, band ? '#8e2026' : '#6a6862');
  }
  a.rect(x, yb - h, w, 1, '#2b2f3c'); smoke?.push([x + w / 2, yb - h]);
}
function cooling(a, cx, yb, r, h, smoke) {
  for (let k = 0; k <= h; k++) {
    const t = k / h; const rr = Math.round(r * (0.72 + 0.28 * Math.abs(t - 0.62) / 0.62));
    for (let x = -rr; x <= rr; x++) a.p(cx + x, yb - k, shade('#c9c6be', 1.22 - 0.55 * ((x + rr) / (2 * rr || 1))));
  }
  const rt = Math.round(r * 0.85); a.ell(cx, yb - h, rt, 2, '#3a3d48'); a.line(cx - rt, yb - h - 1, cx + rt, yb - h - 1, '#e6e3da');
  smoke?.push([cx, yb - h, 1]);
}
function dish(a, cx, cy, r, ang = 0) {
  a.line(cx, cy, cx, cy + r + 2, '#6d7486'); a.line(cx - 2, cy + r + 2, cx + 2, cy + r + 2, '#4a5061');
  for (let x = -r; x <= r; x++) { const yy = Math.round(Math.abs(x) * 0.35); a.p(cx + x, cy + yy - 1, '#eef1f5'); a.p(cx + x, cy + yy, '#c9ced8'); a.p(cx + x, cy + yy + 1, '#9aa1b0'); }
  a.p(cx, cy - 2, '#4a5061'); a.p(cx, cy - 3, '#ff4a3a');
}
function mast(a, x, yb, h, lights) {
  for (let y = yb - h; y <= yb; y++) { a.p(x, y, '#9aa1b0'); a.p(x + 2, y, '#6d7486'); }
  for (let y = yb - h + 2; y <= yb; y += 3) { a.p(x + 1, y, '#4a5061'); a.p(x + 1, y - 1, '#6d7486'); }
  a.p(x + 1, yb - h - 1, '#ff4a3a'); lights?.push([x + 1, yb - h - 1, 2]);
}
function flag(a, x, yb) { a.line(x, yb - 14, x, yb, '#6d7486'); for (let yy = 0; yy < 4; yy++) for (let xx = 1; xx < 7; xx++) a.team(x + xx, yb - 14 + yy); a.p(x, yb - 15, '#f7c948'); }
function helipad(a, cx, cy, rx, ry) {
  a.ell(cx, cy, rx, ry, '#7d7a74'); a.ell(cx, cy, rx - 1, ry - 1, '#5c5a57');
  a.line(cx - 2, cy - 1, cx - 2, cy + 1, '#f7c948'); a.line(cx + 2, cy - 1, cx + 2, cy + 1, '#f7c948'); a.line(cx - 2, cy, cx + 2, cy, '#f7c948');
}
function pile(a, cx, cy, r, col) { for (let k = r; k > 0; k--) a.ell(cx, Math.round(cy - (r - k) / 1.6), k, Math.max(1, k >> 1), shade(col, 1 + (r - k) * 0.06)); }
function pylon(a, x, yb, h) { a.line(x - 2, yb, x, yb - h, '#6d7486'); a.line(x + 2, yb, x, yb - h, '#4a5061'); a.line(x - 3, yb - h + 2, x + 3, yb - h + 2, '#6d7486'); for (let y = yb - h + 4; y < yb; y += 3) a.line(x - 1, y, x + 1, y, '#4a5061'); }
function pipe(a, x0, y0, x1, y1) { a.line(x0, y0, x1, y1, '#9aa1b0'); a.line(x0, y0 + 1, x1, y1 + 1, '#5c6272'); }
function crates(a, x, y, n, cols = ['#94402f', '#356b35', '#2f5aa8', '#8c6440']) { for (let k = 0; k < n; k++) a.box(x + (k % 4) * 5, y + ((k / 4) | 0) * 4, 4, 2, 2, cols[k % cols.length], { dep: 1 }); }
function miniTank(a, x, y) { a.rect(x, y, 9, 2, '#2b2f3c'); a.rect(x, y + 5, 9, 2, '#2b2f3c'); a.rect(x + 1, y + 1, 7, 5, '#4f6b3a'); a.ell(x + 4, y + 3, 2, 2, '#6b8a4f'); a.line(x + 5, y + 3, x + 10, y + 3, '#2b3a22'); }
function launcher(a, x, yb, tubes, len, col = '#6b7a55') {
  a.rect(x, yb - 4, 16, 4, shade(col, 0.95)); a.rect(x, yb - 4, 16, 1, shade(col, 1.3)); a.box(x + 12, yb - 4, 5, 3, 3, shade(col, 1.1), { dep: 1 }); a.p(x + 15, yb - 6, '#8cbfdc');
  for (let k = 0; k < tubes; k++) { const x0 = x + 1 + k * 3; for (let t = 0; t < len; t++) { const px = x0 + ((t / 2) | 0), py = yb - 4 - t; a.p(px, py, '#e6e9ee'); a.p(px + 1, py, '#a3a9b5'); } a.p(x0 + ((len / 2) | 0), yb - 4 - len, '#c43a33'); }
  for (const wx of [x + 2, x + 7, x + 13]) { a.p(wx, yb, '#1a1d28'); a.p(wx + 1, yb, '#1a1d28'); }
}

// ---------- binalar: (a, W, H, E, m) — taban izi y: E..E+H ----------
export const LOOKS = {
  hq(a, W, H, E, m) {
    a.pad(1, E + 2, W - 2, H - 3, '#7d7a74');
    a.box(5, E + 14, 28, 14, 18, '#8c919c', { roof: '#b5bac4', win: 1, lights: m.lights, stripe: 1, door: 1, vents: 4 });
    flag(a, 3, E + H - 4); mast(a, W - 8, E + 18, 30, m.lights); helipad(a, W - 10, E + H - 7, 5, 3);
  },
  cmd(a, W, H, E, m) { a.pad(1, E + 3, W - 2, H - 4, '#5f7a45'); a.box(4, E + 10, 18, 10, 8, '#6b7a5a', { win: 1, lights: m.lights, door: 1 }); mast(a, W - 7, E + 16, 22, m.lights); dish(a, 8, E + 3, 4); },
  depot(a, W, H, E, m) {
    a.pad(0, E + 2, W, H - 2, '#5c5a57');
    a.box(2, E + 7, 22, 12, 9, '#8c6440', { roof: '#b08050', door: 1 });
    for (let x = 3; x < 24; x += 3) a.line(x, E - 1, x, E + 9, shade('#b08050', 0.85));
    crates(a, 4, E + H - 7, 4);
  },
  rail(a, W, H, E, m) { a.pad(0, E + 3, W, H - 3, '#7d7a74', false); for (const y of [E + H - 5, E + H - 2]) { a.line(0, y, W - 1, y, '#9aa1b0'); for (let x = 0; x < W; x += 3) a.p(x, y + 1, '#6b4a2f'); } a.box(6, E + 4, 18, 4, 6, '#94402f', { roof: '#b7593f', win: 1, lights: m.lights }); },
  mine(a, W, H, E, m) {
    a.pad(0, E + 2, W, H - 2, '#6b4a2f', false); pile(a, 8, E + H - 4, 7, '#5a4a3a');
    const x = W - 12; a.line(x, E + H - 4, x + 4, E + 1, '#6d7486'); a.line(x + 8, E + H - 4, x + 4, E + 1, '#4a5061');
    for (let y = E + 4; y < E + H - 4; y += 4) a.line(x + 1, y, x + 7, y, '#4a5061');
    a.ell(x + 4, E + 2, 3, 3, '#9aa1b0'); a.ell(x + 4, E + 2, 1, 1, '#2b2f3c');
    a.box(x - 4, E + H - 9, 9, 4, 5, '#94402f', { roof: '#b7593f' }); pipe(a, 12, E + H - 9, x - 4, E + H - 12);
  },
  well(a, W, H, E) {
    a.pad(1, E + 5, W - 2, H - 6, '#4a3322', false); a.ell(8, E + 14, 5, 2, '#1a1d28');
    a.line(4, E + H - 3, 8, E + 3, '#6d7486'); a.line(12, E + H - 3, 8, E + 3, '#4a5061');
    a.line(1, E + 3, 15, E, '#2b2f3c'); a.rect(0, E + 2, 4, 4, '#c43a33'); a.rect(12, E - 2, 2, 5, '#4a5061');
  },
  refinery(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#7d7a74');
    a.cyl(9, E + H - 6, 6, 10, '#d9dee6'); a.cyl(22, E + H - 5, 5, 8, '#c9ced8'); a.cyl(16, E + 22, 4, 7, '#e6e9ee');
    a.cyl(32, E + 26, 2, 24, '#9aa1b0'); a.cyl(38, E + 30, 2, 20, '#8c919c');
    a.rect(43, E - 2, 2, 30, '#6d7486'); m.flame.push([44, E - 3]); m.lights.push([44, E - 2, 3]);
    pipe(a, 4, E + 34, 44, E + 34); pipe(a, 26, E + 10, 26, E + 34);
  },
  steel(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#5c5a57');
    a.box(3, E + 10, 32, 15, 10, '#6d7486', { roof: '#8c919c', door: 1 });
    for (let x = 4; x < 34; x += 5) { a.line(x, E + 1, x + 4, E - 2, '#c9ced8'); a.line(x + 4, E - 2, x + 4, E + 1, '#6d7486'); }
    chimney(a, W - 10, E + 20, 4, 30, true, m.smoke); chimney(a, W - 5, E + 22, 3, 24, false, m.smoke);
    a.rect(10, E + 24, 6, 2, '#f08d35'); a.p(12, E + 24, '#fff3a8'); m.lights.push([13, E + 25, 3]);
  },
  electronics(a, W, H, E, m) { a.pad(0, E + 2, W, H - 2, '#a3a09a'); a.box(3, E + 8, 22, 12, 12, '#d6d9de', { roof: '#eef1f5', win: 1, lights: m.lights, door: 1, vents: 3 }); a.rect(4, E + H - 4, 6, 2, '#2f5aa8'); },
  munitions(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#4f6b3a', false);
    for (let k = 0; k < 3; k++) { const cx = 8 + k * 15; for (let r = 7; r > 0; r--) a.ell(cx, E + 15 - (7 - r), r, Math.max(1, r >> 1) + 1, shade('#5f8a45', 1 + (7 - r) * 0.05)); a.rect(cx - 2, E + 13, 4, 4, '#4a5061'); a.rect(cx - 1, E + 14, 2, 3, '#1a1d28'); }
    for (let x = 1; x < W - 1; x += 4) { a.p(x, E + H - 3, '#f7c948'); a.p(x + 1, E + H - 3, '#1a1d28'); a.p(x + 2, E + H - 3, '#f7c948'); }
  },
  drone_fac(a, W, H, E, m) {
    a.pad(0, E + 2, W, H - 2, '#a3a09a');
    a.box(3, E + 8, 36, 14, 10, '#6d7486', { roof: '#9aa1b0', stripe: 1, door: 1 });
    for (let x = 6; x < 36; x += 7) a.rect(x, E - 1, 4, 2, '#8cbfdc');
    const cx = 21, cy = E + H - 6; for (const [dx, dy] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) { a.line(cx, cy, cx + dx, cy + dy, '#2b2f3c'); a.p(cx + dx, cy + dy, '#eef1f5'); }
  },
  missile_fac(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#7d7a74');
    a.box(3, E + 10, 34, 18, 14, '#9aa1b0', { roof: '#c9ced8', win: 1, lights: m.lights, door: 1, vents: 5 });
    a.rect(5, E + H - 5, 24, 3, '#4f6b3a'); a.rect(7, E + H - 7, 20, 2, '#eef1f5'); a.rect(27, E + H - 7, 3, 2, '#c43a33');
  },
  barracks(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#8c6440', false);
    a.box(2, E + 3, 24, 5, 6, '#5f7a45', { roof: '#6b8a4f', win: 1, lights: m.lights }); a.box(2, E + 17, 24, 5, 6, '#5f7a45', { roof: '#6b8a4f', win: 1, lights: m.lights });
    flag(a, W - 3, E + H - 2);
  },
  vehicle_fac(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#5c5a57');
    a.box(3, E + 4, 36, 12, 10, '#6d7486', { roof: '#8c919c' });
    for (let k = 0; k < 3; k++) a.rect(7 + k * 11, E + 6, 7, 8, '#2b2f3c');
    for (let k = 0; k < 3; k++) miniTank(a, 3 + k * 14, E + H - 8);
  },
  research(a, W, H, E, m) {
    a.pad(0, E + 2, W, H - 2, '#6aa64e', false);
    a.box(3, E + 12, 22, 10, 7, '#d6d9de', { roof: '#eef1f5', win: 1, lights: m.lights });
    for (let r = 7; r > 0; r--) a.ell(14, E + 9 - (7 - r) * 0.4, r, Math.max(1, (r * 0.8) | 0), shade('#e6e9ee', 0.8 + (7 - r) * 0.05));
    a.rect(13, E - 2, 2, 5, '#4a5061'); a.p(14, E + 4, '#8cbfdc');
  },
  coal_plant(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#5c5a57');
    pile(a, 10, E + H - 5, 8, '#2b2f3c');
    a.box(17, E + 18, 18, 14, 14, '#8c919c', { roof: '#b5bac4', win: 1, lights: m.lights });
    chimney(a, 38, E + 30, 4, 40, true, m.smoke); chimney(a, 43, E + 32, 3, 34, true, m.smoke);
    cooling(a, 9, E + 22, 7, 18, m.smoke);
  },
  gas_plant(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#7d7a74');
    a.box(3, E + 12, 16, 12, 9, '#8c919c', { win: 1, lights: m.lights });
    for (const [x, y] of [[24, E + 8], [26, E + 18]]) { a.ell(x, y, 4, 4, '#d9dee6'); a.ell(x - 1, y - 1, 2, 2, '#f6f8fb'); }
    chimney(a, W - 6, E + 24, 3, 24, true, m.smoke); pipe(a, 2, E + H - 3, W - 2, E + H - 3);
  },
  dam(a, W, H, E, m) {
    a.rect(0, E, W, 7, '#2b6094'); for (let x = 0; x < W; x += 4) a.p(x + 1, E + 3, '#8cbfdc');
    a.box(0, E + 7, W - 3, 4, 6, '#a3a09a', { roof: '#c9c6be' });
    for (let x = 3; x < W - 4; x += 5) { a.rect(x, E + 11, 2, 5, '#4a85b5'); a.p(x, E + 16, '#eef6fb'); }
    a.box(6, E + 22, 16, 5, 5, '#8c919c', { win: 1, lights: m.lights }); a.rect(0, E + 28, W, 4, '#4a85b5');
  },
  nuclear(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#a3a09a');
    cooling(a, 11, E + 30, 9, 28, m.smoke); cooling(a, 31, E + 26, 8, 22, m.smoke);
    for (let r = 7; r > 0; r--) a.ell(36, E + 41 - (7 - r) * 0.6, r, Math.max(1, (r * 0.85) | 0), shade('#e6e9ee', 0.8 + (7 - r) * 0.05));
    a.box(3, E + 38, 20, 5, 5, '#8c919c', { win: 1, lights: m.lights }); for (let x = 1; x < W; x += 3) a.p(x, E + H - 2, '#f7c948');
  },
  solar(a, W, H, E) {
    a.pad(0, E + 1, W, H - 1, '#5f8a45', false);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      const x = 2 + c * 10, y = E + 3 + r * 7;
      a.rect(x, y, 8, 5, '#203a6b'); a.line(x, y, x + 7, y, '#8cbfdc'); a.line(x + 3, y + 1, x + 3, y + 4, '#2f5aa8'); a.p(x + 6, y + 1, '#d6ecf8'); a.line(x, y + 5, x + 7, y + 5, '#4a5061');
    }
  },
  substation(a, W, H, E, m) {
    a.pad(1, E + 3, W - 2, H - 4, '#4a5061');
    a.box(2, E + 7, 5, 3, 4, '#9aa1b0'); a.box(9, E + 7, 5, 3, 4, '#9aa1b0');
    pylon(a, 8, E + 3, 14); m.lights.push([8, E - 10, 2]);
    for (let x = 1; x < W - 1; x += 2) a.p(x, E + H - 2, '#c9ced8');
  },
  pump(a, W, H, E) { a.pad(1, E + 3, W - 2, H - 4, '#a3a09a'); a.box(2, E + 6, 8, 5, 6, '#4a85b5', { roof: '#6fa3d0', door: 1 }); a.cyl(13, E + 9, 2, 7, '#c9ced8'); pipe(a, 0, E + H - 2, 15, E + H - 2); },
  relay(a, W, H, E, m) {
    a.line(3, E + H - 1, 8, E - 18, '#9aa1b0'); a.line(13, E + H - 1, 8, E - 18, '#6d7486');
    for (let k = 0; k < 8; k++) a.line(4 + (k * 0.55) | 0, E + H - 3 - k * 4, 12 - (k * 0.55) | 0, E + H - 3 - k * 4, '#4a5061');
    a.rect(6, E - 8, 5, 3, '#eef1f5'); a.rect(5, E - 2, 3, 2, '#c9ced8'); a.p(8, E - 19, '#ff4a3a'); m.lights.push([8, E - 19, 2]);
  },
  satellite(a, W, H, E, m) {
    a.pad(0, E + 2, W, H - 2, '#a3a09a');
    for (let x = -11; x <= 11; x++) { const yy = Math.round(Math.abs(x) * 0.45); a.p(14 + x, E + 2 + yy, '#eef1f5'); a.p(14 + x, E + 3 + yy, '#c9ced8'); a.p(14 + x, E + 4 + yy, '#9aa1b0'); a.p(14 + x, E + 5 + yy, '#6d7486'); }
    a.line(14, E + 6, 14, E + 18, '#4a5061'); a.line(14, E + 2, 14, E - 6, '#6d7486'); a.p(14, E - 7, '#ff4a3a');
    a.box(18, E + 22, 10, 5, 5, '#8c919c', { win: 1, lights: m.lights });
  },
  drone_base(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#8c6440', false);
    helipad(a, 8, E + 24, 6, 4); helipad(a, 23, E + 24, 6, 4);
    a.box(2, E + 6, 16, 6, 6, '#5f7a45', { roof: '#6b8a4f', win: 1, lights: m.lights, stripe: 1 });
    mast(a, 25, E + 14, 22, m.lights); a.ell(26, E - 8, 3, 1, '#eef1f5');
  },
  airbase(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#5f8a45', false);
    a.rect(2, E + 18, W - 4, 10, '#3a3d45'); a.tex(2, E + 18, W - 4, 10, '#3a3d45', 0.3);
    for (let x = 6; x < W - 6; x += 6) a.rect(x, E + 22, 3, 1, '#eef1f5');
    for (let x = 3; x < W - 2; x += 5) { a.p(x, E + 18, '#fff3a8'); a.p(x, E + 27, '#fff3a8'); m.lights.push([x, E + 18, 2]); m.lights.push([x, E + 27, 2]); }
    a.box(6, E + 6, 20, 8, 7, '#6d7486', { roof: '#8c919c', door: 1 });
    a.box(34, E + 8, 6, 4, 16, '#9aa1b0', { win: 1, lights: m.lights }); a.rect(33, E - 9, 9, 3, '#5b8fbf');
    a.box(46, E + 8, 12, 6, 5, '#7d7a74');
  },
  port(a, W, H, E, m) {
    a.rect(0, E + H - 9, W, 9, '#2b6094'); for (let x = 2; x < W; x += 5) a.p(x, E + H - 5, '#8cbfdc');
    a.pad(0, E + 1, W, H - 9, '#a3a09a');
    for (let k = 0; k < 8; k++) a.box(3 + (k % 4) * 6, E + 5 + ((k / 4) | 0) * 6, 5, 3, 3, ['#94402f', '#2f5aa8', '#356b35', '#d9a35a'][k % 4], { dep: 1 });
    a.line(36, E - 8, 36, E + H - 10, '#f7c948'); a.line(28, E - 8, 46, E - 8, '#f7c948'); a.line(37, E - 8, 37, E + H - 10, '#c9a030'); a.line(30, E - 8, 30, E + 2, '#4a5061'); a.rect(29, E + 2, 3, 2, '#94402f');
  },
  missile_base(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#4f6b3a', false);
    for (let k = 0; k < 2; k++) { a.ell(9 + k * 14, E + 20, 5, 3, '#a3a09a'); a.ell(9 + k * 14, E + 20, 3, 2, '#2b2f3c'); a.p(8 + k * 14, E + 19, '#4a5061'); }
    launcher(a, 6, E + 12, 1, 14, '#5f7a45');
  },
  coastal(a, W, H, E) { a.pad(0, E + 2, W, H - 2, '#8c6440', false); a.sandbags(16, E + 10, 13, 5); launcher(a, 8, E + 12, 2, 8, '#5f7a45'); },
  radar(a, W, H, E, m) {
    a.pad(0, E + 2, W, H - 2, '#a3a09a');
    a.box(2, E + 20, 12, 6, 6, '#9aa1b0', { win: 1, lights: m.lights });
    a.line(16, E + 28, 23, E + 2, '#6d7486'); a.line(30, E + 28, 23, E + 2, '#4a5061');
    for (let y = E + 6; y < E + 28; y += 4) a.line(17 + ((E + 28 - y) / 4 | 0) * 0, y, 29, y, '#4a5061');
    m.dish = [23, E - 2];
  },
  sam_site(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#4f6b3a', false);
    for (let k = 0; k < 2; k++) { a.sandbags(8 + k * 15, E + 24, 7, 3, 20); launcher(a, 1 + k * 15, E + 24, 2, 9, '#6b7a55'); }
    dish(a, 24, E + 4, 4);
  },
  aa_gun(a, W, H, E) {
    a.sandbags(8, E + 10, 7, 4, 22); a.ell(8, E + 9, 4, 3, '#5f7a45'); a.ell(8, E + 8, 2, 2, '#7d9a5f');
    a.line(7, E + 8, 14, E + 1, '#2b2f3c'); a.line(9, E + 8, 15, E + 2, '#2b2f3c');
  },
  ciws(a, W, H, E) { a.box(3, E + 6, 10, 6, 5, '#7d7a74'); for (let r = 5; r > 0; r--) a.ell(8, E + 2 - (5 - r) * 0.5, r, r - 1 || 1, shade('#e6e9ee', 0.8 + (5 - r) * 0.06)); a.rect(10, E + 2, 6, 2, '#4a5061'); },
  laser(a, W, H, E, m) {
    a.pad(0, E + 1, W, H - 1, '#7d7a74');
    for (let k = 0; k < 4; k++) a.box(2 + k * 7, E + 22, 5, 3, 4, '#2f5aa8', { dep: 1 });
    a.box(9, E + 14, 13, 8, 8, '#6d7486'); for (let r = 5; r > 0; r--) a.ell(15, E + 3 - (5 - r) * 0.5, r, r - 1 || 1, shade('#c9ced8', 0.8 + (5 - r) * 0.06));
    a.ell(15, E + 3, 2, 2, '#8cbfdc'); a.p(15, E + 2, '#eef6fb'); m.lights.push([15, E + 3, 4]);
  },
  jammer(a, W, H, E, m) {
    a.box(2, E + 9, 12, 5, 4, '#5f7a45', { dep: 1 });
    for (let k = 0; k < 3; k++) { a.line(4 + k * 4, E - 8 + k * 3, 4 + k * 4, E + 5, '#6d7486'); a.line(3 + k * 4, E - 8 + k * 3, 5 + k * 4, E - 8 + k * 3, '#eef1f5'); a.line(3 + k * 4, E - 5 + k * 3, 5 + k * 4, E - 5 + k * 3, '#c9ced8'); }
    m.lights.push([8, E - 6, 2]);
  },
  sigint(a, W, H, E, m) {
    a.pad(0, E + 2, W, H - 2, '#a3a09a');
    for (let r = 8; r > 0; r--) a.ell(11, E + 10 - (8 - r) * 0.7, r, r, shade('#eef1f5', 0.78 + (8 - r) * 0.04));
    a.box(6, E + 22, 10, 4, 4, '#8c919c'); mast(a, 24, E + 26, 28, m.lights);
  },
  bunker(a, W, H, E) { for (let r = 7; r > 0; r--) a.ell(8, E + 10 - (7 - r) * 0.5, r, Math.max(1, (r * 0.7) | 0), shade('#a3a09a', 0.8 + (7 - r) * 0.05)); a.rect(4, E + 9, 8, 1, '#1a1d28'); },
  textile(a, W, H, E, m) { a.pad(0, E + 2, W, H - 2, '#a3a09a'); a.box(3, E + 8, 22, 12, 9, '#c9a0a8', { roof: '#e0c0c8', win: 1, lights: m.lights, door: 1 }); for (let x = 5; x < 24; x += 6) a.line(x, E - 1, x + 3, E - 3, '#f6f8fb'); chimney(a, W - 5, E + 12, 3, 16, false, m.smoke); },
  food(a, W, H, E, m) { a.pad(0, E + 2, W, H - 2, '#a3a09a'); a.box(3, E + 10, 16, 10, 8, '#e6e0c8', { roof: '#f6f2e0', win: 1, lights: m.lights, door: 1 }); a.cyl(24, E + 18, 4, 14, '#c9ced8'); a.cyl(24, E + 28, 3, 6, '#d9dee6'); a.rect(4, E + H - 4, 8, 2, '#58d16a'); },
  auto(a, W, H, E, m) { a.pad(0, E + 1, W, H - 1, '#7d7a74'); a.box(3, E + 6, 34, 12, 10, '#5c6a80', { roof: '#7d8aa0', stripe: 1, door: 1 }); for (let k = 0; k < 4; k++) { const x = 4 + k * 10; a.rect(x, E + H - 7, 7, 4, ['#c43a33', '#2f5aa8', '#eef1f5', '#f7c948'][k]); a.rect(x + 1, E + H - 8, 4, 2, '#8cbfdc'); a.p(x + 1, E + H - 3, '#1a1d28'); a.p(x + 5, E + H - 3, '#1a1d28'); } },
  appliance(a, W, H, E, m) { a.pad(0, E + 2, W, H - 2, '#a3a09a'); a.box(3, E + 8, 22, 12, 11, '#d6d9de', { roof: '#eef1f5', win: 1, lights: m.lights, door: 1, vents: 3 }); a.rect(5, E + H - 4, 4, 3, '#eef1f5'); a.rect(10, E + H - 4, 4, 3, '#c9ced8'); a.p(11, E + H - 3, '#2f5aa8'); },
  city_found(a, W, H, E, m) { a.pad(1, E + 4, W - 2, H - 5, '#cfa874', false); a.line(3, E + 14, 3, E - 2, '#6b4a2f'); for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 7; xx++) a.team(4 + xx, E - 2 + yy); a.rect(8, E + 8, 6, 4, '#8c6440'); a.rect(8, E + 7, 6, 1, '#b08050'); a.p(12, E + 12, '#f7c948'); },
  fire_station(a, W, H, E, m) { a.pad(0, E + 2, W, H - 2, '#7d7a74'); a.box(2, E + 3, 26, 9, 8, '#c43a33', { roof: '#e05a4f', door: 0 }); for (let k = 0; k < 2; k++) a.rect(5 + k * 10, E + 7, 8, 5, '#eef1f5'); a.line(5, E + 9, 12, E + 9, '#c9ced8'); a.rect(24, E - 6, 3, 10, '#c43a33'); a.p(25, E - 7, '#4b85e0'); m.lights.push([25, E - 7, 2]); },
  bridge() {},
};
// E: mantıksal üst pay; çıktı yerel piksel (SC kat), meta koordinatları yerel
export function buildingArt(def, variant, seed, E) {
  const W = def.size[0] * 16, H = def.size[1] * 16;
  const a = A2(W, H + E, seed); const m = { lights: [], smoke: [], flame: [] };
  (LOOKS[def.look] || LOOKS.depot)(a, W, H, E, m);
  if (variant === 1) a.damage(seed + 7);
  if (variant === 2) a.ruin(E + Math.round(H * 0.7), seed + 3);
  else a.outline();
  a.shadow(3 * SC, 2 * SC, 80);
  const sc = (l) => l.map((p) => [p[0] * SC, p[1] * SC, p[2]]);
  const meta = variant === 2 ? { lights: [], smoke: [], flame: [], dish: null } : { lights: sc(m.lights), smoke: sc(m.smoke), flame: sc(m.flame), dish: m.dish ? [m.dish[0] * SC, m.dish[1] * SC] : null };
  return { a, meta };
}

// ---------- kara araçları (sağa bakan, 3/4) ----------
const OLIVE = '#56703f';
function hull(a, x, y, w, h, base) {
  base = hex(base); a.rect(x, y, w, h, shade(base, 0.95));
  for (let xx = x; xx < x + w; xx++) { a.p(xx, y, shade(base, 1.3)); a.p(xx, y + h - 1, shade(base, 0.6)); }
  for (let yy = y; yy < y + h; yy++) { a.p(x, yy, shade(base, 1.12)); a.p(x + w - 1, yy, shade(base, 0.7)); }
}
function trackRow(a, x, y, w) { a.rect(x, y, w, 2, '#2b2f3c'); for (let xx = x; xx < x + w; xx += 2) a.p(xx, y, '#4a5061'); }
function wheelsRow(a, xs, y) { for (const x of xs) { a.rect(x, y, 2, 2, '#1a1d28'); a.p(x, y, '#4a5061'); } }
const OLN = hex('#56703f');
function soldier(a, x, y) {
  a.ell(x, y + 10, 3, 1, '#2b3a22'); a.rect(x - 2, y + 2, 5, 6, OLN); a.line(x - 2, y + 2, x - 2, y + 7, shade(OLN, 1.3)); a.rect(x - 2, y + 5, 5, 1, '#5a4a2a');
  a.rect(x - 2, y + 8, 2, 3, '#3d4d2e'); a.rect(x + 1, y + 8, 2, 3, '#3d4d2e'); a.p(x - 2, y + 10, '#1a1d28'); a.p(x + 2, y + 10, '#1a1d28');
  a.ell(x, y, 2, 2, '#d9b48a'); a.ell(x, y - 1, 3, 2, '#4f6b3a'); a.p(x - 1, y - 2, '#6b8a4f'); a.line(x + 3, y + 3, x + 7, y, '#1a1d28'); a.p(x + 2, y + 4, '#d9b48a'); a.rect(x - 4, y + 3, 2, 4, '#6b5a3a');
}
export const VEHICLES = {
  armor() {
    const a = new Art(52, 32, 3, 1);
    for (const y0 of [3, 24]) { a.rect(4, y0, 38, 5, '#2b2f3c'); for (let x = 4; x < 42; x += 3) { a.line(x, y0, x, y0 + 4, '#4a5061'); a.p(x + 1, y0 + 1, '#6d7486'); } for (let x = 7; x < 41; x += 6) { a.ell(x, y0 + 2, 1, 1, '#1a1d28'); } }
    for (let yy = 7; yy < 25; yy++) for (let xx = 6; xx < 40; xx++) { let f = 1.18 - 0.35 * ((yy - 7) / 18); if (((xx / 6) | 0) + ((yy / 5) | 0) % 3 === 0) f *= 0.85; a.p(xx, yy, shade(OLN, f)); }
    a.line(6, 7, 39, 7, shade(OLN, 1.4)); a.line(6, 24, 39, 24, shade(OLN, 0.55));
    a.ell(23, 15, 8, 6, shade(OLN, 0.75)); a.ell(22, 14, 7, 5, shade(OLN, 1.05)); a.ell(20, 12, 4, 2, shade(OLN, 1.3));
    for (let x = 30; x < 51; x++) { a.p(x, 14, '#3a4a2e'); a.p(x, 15, '#5c7a48'); a.p(x, 16, '#2b3a22'); } a.rect(49, 13, 3, 5, '#2b2f3c'); a.rect(25, 10, 3, 2, '#8cbfdc');
    a.rect(10, 18, 3, 3, [255, 0, 255]); a.rect(13, 18, 1, 3, [255, 0, 255]);
    return a;
  },
  inf() { const a = new Art(48, 36, 5, 1); for (const [x, y] of [[8, 6], [17, 3], [26, 6], [35, 4], [11, 17], [21, 15], [30, 18], [39, 14]]) soldier(a, x, y); for (let x = 3; x < 46; x += 3) { a.ell(x, 31, 2, 1, '#b8935e'); a.p(x, 30, '#dcc08a'); } for (let x = 20; x < 27; x++) a.p(x, 34, [255, 0, 255]); return a; },
  sam_long() {
    const a = new Art(52, 40, 11, 1);
    for (let yy = 22; yy < 32; yy++) for (let xx = 3; xx < 38; xx++) a.p(xx, yy, shade('#6b7a55', 1.15 - 0.3 * ((yy - 22) / 10)));
    a.rect(36, 17, 12, 15, '#7d8a65'); a.rect(36, 17, 12, 2, '#9aaa80'); a.rect(41, 20, 5, 4, '#8cbfdc'); a.p(41, 20, '#d6ecf8');
    for (const x of [7, 15, 23, 31, 43]) { a.ell(x, 33, 2, 2, '#1a1d28'); a.p(x - 1, 32, '#6d7486'); }
    for (let k = 0; k < 4; k++) { const x0 = 6 + k * 6; for (let t = 0; t < 20; t++) { const px = x0 + (t >> 1), py = 22 - t; a.p(px, py, '#eef1f5'); a.p(px + 1, py, '#c9ced8'); a.p(px + 2, py, '#9aa1b0'); } a.p(x0 + 10, 2, '#c43a33'); }
    a.rect(6, 27, 5, 2, [255, 0, 255]); return a;
  },
  _armor16() { const a = A2(26, 16, 3); trackRow(a, 2, 3, 20); trackRow(a, 2, 12, 20); hull(a, 3, 4, 18, 8, OLIVE); a.rect(6, 6, 4, 4, shade(OLIVE, 0.85)); a.ell(12, 8, 4, 3, shade(OLIVE, 1.1)); a.ell(11, 7, 2, 1, shade(OLIVE, 1.35)); a.line(15, 8, 25, 8, '#2b3a22'); a.line(15, 7, 24, 7, '#6b8a4f'); a.team(5, 5); a.team(6, 5); return a; },
  mech() { const a = A2(26, 16, 4); hull(a, 2, 4, 21, 8, OLIVE); a.rect(17, 5, 5, 6, shade(OLIVE, 1.2)); for (let k = 0; k < 3; k++) a.rect(4 + k * 4, 5, 3, 2, shade(OLIVE, 0.8)); a.ell(12, 8, 2, 1, shade(OLIVE, 1.3)); a.line(12, 8, 18, 6, '#2b2f3c'); a.p(21, 6, '#8cbfdc'); wheelsRow(a, [4, 9, 14, 19], 12); wheelsRow(a, [4, 9, 14, 19], 2); a.team(4, 9); a.team(5, 9); return a; },
  _inf16() {
    const a = A2(24, 18, 5); const pos = [[5, 5], [10, 3], [15, 5], [7, 10], [13, 10], [18, 9]];
    for (const [x, y] of pos) { a.rect(x - 1, y + 1, 3, 3, OLIVE); a.p(x - 1, y + 1, shade(OLIVE, 1.3)); a.ell(x, y, 1, 1, '#3d4d2e'); a.p(x, y - 1, '#6b7d52'); a.line(x + 2, y + 2, x + 3, y + 1, '#1a1d28'); a.p(x - 1, y + 4, '#2b2f3c'); a.p(x + 1, y + 4, '#2b2f3c'); }
    a.team(9, 15); a.team(10, 15); a.team(11, 15); for (let x = 2; x < 22; x += 2) { a.p(x, 16, '#b8935e'); a.p(x + 1, 16, '#dcc08a'); }
    return a;
  },
  artillery() { const a = A2(28, 16, 6); trackRow(a, 3, 4, 16); trackRow(a, 3, 12, 16); hull(a, 4, 5, 14, 7, OLIVE); a.box(6, 7, 7, 3, 3, shade(OLIVE, 1.05), { dep: 1 }); for (let x = 13; x < 27; x++) { const y = 7 - ((x - 13) >> 2); a.p(x, y, '#2b3a22'); a.p(x, y + 1, '#6b8a4f'); } a.team(5, 10); a.team(6, 10); return a; },
  engineer() { const a = A2(26, 16, 7); hull(a, 2, 5, 20, 7, '#8a7a4a'); a.box(16, 9, 6, 3, 4, '#a89a60', { dep: 1 }); a.line(4, 6, 12, 2, '#f7c948'); a.line(12, 2, 14, 5, '#f7c948'); a.p(21, 7, '#8cbfdc'); wheelsRow(a, [4, 9, 17], 12); a.team(5, 10); a.team(6, 10); return a; },
  ad_bat() { const a = A2(24, 18, 8); trackRow(a, 3, 6, 16); trackRow(a, 3, 14, 16); hull(a, 4, 7, 14, 7, OLIVE); a.ell(11, 10, 3, 2, shade(OLIVE, 1.2)); a.line(10, 9, 20, 1, '#2b2f3c'); a.line(12, 9, 22, 2, '#2b2f3c'); a.ell(6, 5, 2, 1, '#c9ced8'); a.p(6, 4, '#4b85e0'); a.team(5, 12); a.team(6, 12); return a; },
  ew_bat() { const a = A2(26, 18, 9); hull(a, 2, 8, 20, 7, OLIVE); a.box(4, 12, 11, 4, 5, '#5f7a45', { dep: 1 }); a.line(7, 1, 7, 7, '#6d7486'); a.line(12, 0, 12, 7, '#6d7486'); a.line(6, 1, 8, 1, '#eef1f5'); a.line(11, 0, 13, 0, '#eef1f5'); a.p(20, 10, '#8cbfdc'); wheelsRow(a, [4, 10, 17], 15); a.team(16, 11); a.team(17, 11); return a; },
  mlrs() { const a = A2(28, 18, 10); hull(a, 2, 9, 22, 6, OLIVE); a.box(19, 13, 6, 3, 4, shade(OLIVE, 1.1), { dep: 1 }); a.p(23, 10, '#8cbfdc'); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { a.ell(5 + c * 3, 5 + r * 3, 1, 1, shade(OLIVE, 0.8)); a.p(5 + c * 3, 5 + r * 3, '#1a1d28'); } a.line(3, 3, 16, 3, shade(OLIVE, 1.3)); wheelsRow(a, [4, 9, 14, 20], 15); a.team(4, 12); a.team(5, 12); return a; },
  sam_med() { const a = A2(28, 20, 12); launcher(a, 3, 18, 3, 10, '#6b7a55'); a.team(4, 15); a.team(5, 15); return a; },
  sam_short() { const a = A2(28, 18, 13); launcher(a, 3, 16, 2, 7, '#6b7a55'); a.team(4, 13); a.team(5, 13); return a; },
  truck() { const a = A2(22, 14, 14); hull(a, 2, 4, 13, 6, '#7d7a74'); a.box(14, 8, 6, 3, 4, '#9aa1b0', { dep: 1 }); a.p(18, 5, '#8cbfdc'); wheelsRow(a, [4, 9, 16], 10); a.team(4, 6); a.team(5, 6); return a; },
  truck_supply() { const a = A2(22, 14, 15); hull(a, 2, 3, 13, 7, '#6b8a4f'); for (let x = 3; x < 14; x += 3) a.line(x, 3, x, 9, '#4f6b3a'); a.box(14, 8, 6, 3, 4, '#5f7a45', { dep: 1 }); a.p(18, 5, '#8cbfdc'); wheelsRow(a, [4, 9, 16], 10); a.team(4, 5); return a; },
};
// yukarıdan görünen (döndürülen) araçlar: +x yönüne bakar
export const TOPDOWN = {
  jet() { const a = A2(17, 15, 21); for (let x = 2; x < 16; x++) { a.p(x, 7, '#c9ced8'); a.p(x, 6, '#e6e9ee'); a.p(x, 8, '#9aa1b0'); } for (let k = 0; k < 6; k++) { a.line(7 - k, 7, 9 - k, 1 + k, '#9aa1b0'); a.line(7 - k, 7, 9 - k, 13 - k, '#8c919c'); } a.line(2, 7, 0, 4, '#9aa1b0'); a.line(2, 7, 0, 10, '#9aa1b0'); a.p(14, 7, '#5b8fbf'); a.p(13, 7, '#8cbfdc'); a.team(6, 4); a.team(6, 10); return a; },
  heli() { const a = A2(17, 17, 22); a.ell(9, 8, 4, 3, '#56703f'); a.ell(10, 7, 2, 1, '#8cbfdc'); a.line(1, 8, 5, 8, '#56703f'); a.line(0, 6, 0, 10, '#6d7486'); for (let k = -7; k <= 7; k++) { a.p(9 + k, 8 + Math.round(k * 0.3), '#c9ced8'); a.p(9 - Math.round(k * 0.3), 8 + k, '#c9ced8'); } a.team(7, 9); return a; },
  boat() { const a = A2(13, 7, 23); a.ell(6, 3, 5, 2, '#c9ced8'); a.p(11, 3, '#eef1f5'); a.rect(4, 2, 3, 3, '#4a5061'); a.team(2, 3); a.team(3, 3); for (let k = 0; k < 3; k++) a.p(0 - 0, 2 + k, '#eef6fb'); return a; },
  corvette() { const a = A2(27, 9, 24); for (let x = 1; x < 25; x++) { const hh = x > 19 ? 25 - x : 3; for (let y = -hh; y <= hh; y++) a.p(x, 4 + y, shade('#8c919c', 1.1 - Math.abs(y) * 0.06)); } a.box(8, 2, 8, 4, 3, '#c9ced8', { dep: 1 }); a.rect(19, 3, 3, 3, '#4a5061'); a.p(21, 4, '#2b2f3c'); a.team(4, 4); a.team(5, 4); return a; },
};

// ---------- ağaçlar ----------
// küçük ağaç (16 px tasarım yardımcı)
function TREE(a, x, y, col) { a.p(x, y + 3, '#5a3620'); a.p(x, y + 2, '#5a3620'); a.ell(x, y - 1, 3, 3, shade(col, 0.82)); a.ell(x - 1, y - 2, 2, 2, col); a.p(x - 1, y - 3, shade(col, 1.4)); }
export function treeArt(kind, season, v) {
  const a = A2(14, 16, 91 + v + season * 7);
  const green = ['#3f8a3a', '#4f8f3a', '#9a6a2a', '#3a6a3a'][season], alt = ['#2f7a3a', '#5a8a2a', '#c4562a', '#2f5a35'][season];
  if (kind === 'pine') {
    a.line(7, 12, 7, 15, '#5a3620');
    for (let k = 0; k < 4; k++) { const r = 2 + k, y = 3 + k * 3; for (let x = -r; x <= r; x++) { a.p(7 + x, y, shade(season === 2 ? '#2f6a3a' : green, x < 0 ? 1.15 : 0.8)); a.p(7 + x, y + 1, shade(season === 2 ? '#2f6a3a' : green, x < 0 ? 0.95 : 0.7)); } }
    if (season === 3) for (let k = 0; k < 4; k++) { const r = 2 + k; for (let x = -r; x <= 0; x++) a.p(7 + x, 3 + k * 3, '#f6fafd'); }
  } else if (kind === 'bush') {
    a.ell(7, 12, 5, 3, shade(alt, 0.85)); a.ell(6, 11, 3, 2, alt); a.p(5, 10, shade(alt, 1.4)); if (season === 3) a.line(3, 10, 9, 10, '#f6fafd');
  } else {
    a.line(7, 10, 7, 15, '#5a3620'); a.p(8, 13, '#3a2416');
    if (season === 3) { a.line(7, 10, 3, 5, '#5a3620'); a.line(7, 10, 11, 4, '#5a3620'); a.line(7, 8, 7, 3, '#5a3620'); a.p(3, 4, '#f6fafd'); a.p(11, 3, '#f6fafd'); }
    else { a.ell(7, 7, 5, 5, shade(v % 2 ? green : alt, 0.8)); a.ell(6, 6, 4, 4, v % 2 ? green : alt); a.ell(5, 5, 2, 2, shade(v % 2 ? green : alt, 1.25)); a.p(4, 4, shade(green, 1.5)); }
  }
  a.outline(0.45); return a;
}

// ---------- kaynak ikonları (12x12) ----------
export const RES_ICON_LIST = ['iron', 'coal', 'oil', 'gas', 'copper', 'uranium', 'rare', 'steel', 'fuel', 'electronics', 'explosives', 'composite', 'supply', 'money', 'power', 'pop', 'morale'];
export function resIcon(id) {
  const a = new Art(12, 12, 101);
  const rock = (c1, c2, spots) => { a.ell(6, 7, 5, 4, c1); a.ell(5, 6, 3, 2, shade(c1, 1.25)); for (const [x, y] of spots) { a.p(x, y, c2); a.p(x + 1, y, shade(c2, 1.3)); } };
  switch (id) {
    case 'iron': rock('#6d6a72', '#c4683a', [[3, 7], [7, 5], [8, 8]]); break;
    case 'coal': a.ell(4, 8, 3, 2, '#2b2f3c'); a.ell(8, 7, 3, 3, '#1a1d28'); a.ell(6, 5, 2, 2, '#3a3d48'); a.p(7, 6, '#6d7486'); a.p(3, 7, '#4a5061'); break;
    case 'oil': for (let y = 2; y < 11; y++) { const r = Math.max(0, Math.round((y - 2) * 0.55)); a.line(6 - r, y, 6 + r, y, '#1a1d28'); } a.p(4, 7, '#4b85e0'); a.p(4, 8, '#8cbfdc'); break;
    case 'gas': a.ell(6, 7, 3, 4, '#4b85e0'); a.ell(6, 8, 2, 2, '#8cbfdc'); a.p(6, 3, '#4b85e0'); a.p(5, 4, '#4b85e0'); a.p(6, 9, '#eef6fb'); break;
    case 'copper': rock('#7a6a5a', '#e07a2a', [[3, 6], [7, 8], [8, 5]]); a.p(5, 9, '#3fbf8a'); break;
    case 'uranium': for (const [x, y, h] of [[4, 9, 5], [7, 9, 7], [9, 9, 4]]) { a.line(x, y, x, y - h, '#b6e04a'); a.line(x + 1, y, x + 1, y - h + 1, '#6aa02a'); a.p(x, y - h, '#f0ffb0'); } break;
    case 'rare': for (const [x, y, h] of [[3, 10, 5], [6, 10, 8], [9, 10, 5]]) { a.line(x, y, x, y - h, '#a06ad0'); a.line(x + 1, y, x + 1, y - h + 1, '#6a3a97'); a.p(x, y - h, '#e0c0ff'); } break;
    case 'steel': for (let k = 0; k < 2; k++) a.box(1 + k * 4, 9 - k * 3, 7, 3, 2, '#9aa1b0', { dep: 1 }); break;
    case 'fuel': a.box(3, 4, 6, 6, 1, '#c43a33', { roof: '#e05a4f', dep: 1 }); a.rect(4, 6, 4, 1, '#f7c948'); a.rect(7, 1, 2, 3, '#4a5061'); break;
    case 'electronics': a.rect(2, 3, 8, 7, '#2f6e3a'); a.rect(4, 5, 4, 3, '#1a1d28'); for (let k = 0; k < 4; k++) { a.p(3 + k * 2, 2, '#c9ced8'); a.p(3 + k * 2, 10, '#c9ced8'); } a.p(5, 6, '#f7c948'); break;
    case 'explosives': a.ell(6, 7, 4, 4, '#2b2f3c'); a.ell(5, 6, 2, 2, '#4a5061'); a.line(8, 3, 10, 1, '#ad8456'); a.p(10, 0, '#f7c948'); a.p(11, 1, '#f08d35'); break;
    case 'composite': for (let y = 2; y < 10; y++) for (let x = 2; x < 10; x++) a.p(x, y, (x + y) % 2 ? '#3a3d48' : '#6d7486'); break;
    case 'supply': a.box(2, 5, 8, 5, 4, '#8c6440', { roof: '#b08050', dep: 1 }); a.line(2, 5, 9, 5, '#5a3620'); a.line(6, 1, 6, 5, '#5a3620'); break;
    case 'money': a.ell(6, 6, 4, 4, '#f7c948'); a.ell(6, 6, 3, 3, '#e0a830'); a.line(6, 4, 6, 8, '#fff3a8'); a.p(4, 4, '#fff3a8'); break;
    case 'power': a.line(7, 1, 4, 6, '#f7c948'); a.line(4, 6, 8, 6, '#f7c948'); a.line(8, 6, 5, 11, '#f7c948'); a.line(8, 1, 5, 6, '#e0a830'); break;
    case 'pop': a.ell(6, 3, 2, 2, '#e8c8a0'); a.rect(4, 6, 5, 5, '#3f7fe0'); a.p(4, 6, '#6fa3f0'); break;
    case 'morale': a.ell(6, 6, 4, 4, '#f7c948'); a.p(4, 5, '#1a1d28'); a.p(8, 5, '#1a1d28'); a.line(4, 8, 8, 8, '#1a1d28'); a.p(3, 7, '#1a1d28'); a.p(9, 7, '#1a1d28'); break;
  }
  a.outline(0.4); return a;
}

// ---------- maden yatağı çizimleri (araziye pişirilir) ----------
export function depositArt(res, v) {
  const a = A2(12, 10, 201 + res * 13 + v);
  const rocks = (base, vein) => { for (const [x, y, r] of [[4, 6, 3], [8, 7, 2], [6, 4, 2]].slice(0, 2 + (v % 2))) { a.ell(x, y, r, Math.max(1, r - 1), shade(base, 0.85)); a.ell(x - 1, y - 1, Math.max(1, r - 1), 1, shade(base, 1.2)); a.p(x, y, vein); a.p(x + 1, y - 1, shade(hex(vein), 1.3)); } };
  switch (res) {
    case 1: rocks('#6d6a72', '#c4683a'); break; // demir
    case 2: for (const [x, y, r] of [[4, 6, 3], [8, 6, 2], [6, 7, 2]]) { a.ell(x, y, r, Math.max(1, r - 1), '#1a1d28'); a.p(x - 1, y - 1, '#4a5061'); } break; // kömür
    case 3: a.ell(6, 6, 5, 2, '#0c0e14'); a.ell(5, 5, 3, 1, '#1a1d28'); a.p(4, 5, '#4b85e0'); a.p(7, 6, '#8e5ac0'); a.rect(9, 1, 1, 4, '#4a5061'); break; // petrol
    case 4: a.ell(6, 7, 3, 1, '#6d7486'); a.rect(5, 3, 3, 4, '#9aa1b0'); a.p(6, 3, '#2b2f3c'); a.p(6, 1, '#dce6ef'); a.p(7, 0, '#f6fafd'); break; // gaz
    case 5: rocks('#7a6a5a', '#e07a2a'); a.p(3, 7, '#3fbf8a'); break; // bakır
    case 6: for (const [x, h] of [[4, 5], [7, 7], [9, 4]]) { a.line(x, 8, x, 8 - h, '#b6e04a'); a.line(x + 1, 8, x + 1, 9 - h, '#6aa02a'); a.p(x, 8 - h, '#f0ffb0'); } break; // uranyum
    case 7: for (const [x, h] of [[3, 5], [6, 7], [9, 5]]) { a.line(x, 8, x, 8 - h, '#a06ad0'); a.line(x + 1, 8, x + 1, 9 - h, '#6a3a97'); a.p(x, 8 - h, '#e0c0ff'); } break; // nadir
  }
  a.outline(0.4); return a;
}
