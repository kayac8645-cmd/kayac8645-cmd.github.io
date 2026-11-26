// Prosedürel piksel sanat üreteci + atlas paketleyici (Kenney CC0 sayfaları dahil)
import { PixelBuf, TEAM_KEY } from './pixel.js';
import { P32 } from '../data/palette.js';
import { BUILDINGS } from '../data/buildings.js';
import { hash2f } from '../core/rng.js';
import kBattle from '../../assets/kenney/tiny-battle.png';
import kTown from '../../assets/kenney/tiny-town.png';

export const TILE = 16;
export const BUILD_TOP = 26; // binaların taban izinin üstünde kalan çizim payı (px)

// ---------- bina ilkelleri (3/4 görünüm) ----------
function block(b, x, y, w, d, H, roof, wall, o = {}) {
  // çatı (y-H) ... duvar
  b.rect(x, y - H, w, d, roof);
  b.rect(x, y - H + d, w, H, wall);
  // çatı kenar ışığı / gölge
  b.hline(x, x + w - 1, y - H, o.roofLight || 'k6');
  b.vline(x + w - 1, y - H, y - H + d - 1, o.roofDark || 'k3');
  b.hline(x, x + w - 1, y - H + d, o.eave || 'k2');
  if (o.windows) {
    const rows = Math.max(1, ((H - 3) / 4) | 0), cols = Math.max(1, ((w - 2) / 3) | 0);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = x + 2 + c * 3, wy = y - H + d + 2 + r * 4; if (wy + 1 >= y + d) continue;
      b.px(wx, wy, 'u0'); b.px(wx, wy + 1, 'k1');
      if ((c + r * 7 + x) % 3 !== 0) o.lights?.push([wx, wy, 1]);
    }
  }
  if (o.door) b.rect(x + ((w / 2) | 0) - 1, y + d - 4, 3, 4, 'k1');
  if (o.stripe) b.hline(x + 1, x + w - 2, y - H + ((d / 2) | 0), 'team');
}
function cyl(b, cx, y, r, H, col, top) {
  b.rect(cx - r, y - H, 2 * r + 1, H, col);
  b.vline(cx - r, y - H, y, 'k6'); b.vline(cx + r, y - H, y, 'k3'); b.vline(cx + r - 1, y - H, y, 'k4');
  b.ellipse(cx, y, r, (r / 2) | 0 || 1, col);
  b.ellipse(cx, y - H, r, (r / 2) | 0 || 1, top || 'k6');
  b.hline(cx - r + 1, cx + r - 1, y - H, 'k7');
}
function chimney(b, x, y, w, H, striped, smoke) {
  b.rect(x, y - H, w, H, 'c1'); b.vline(x, y - H, y, 'c2'); b.vline(x + w - 1, y - H, y, 'c0');
  if (striped) for (let k = 0; k < H; k += 6) b.rect(x, y - H + k, w, 2, 'e2');
  b.rect(x, y - H, w, 1, 'k1');
  smoke?.push([x + w / 2, y - H]);
}
function cooling(b, cx, y, r, H, smoke) {
  for (let k = 0; k <= H; k++) {
    const t = k / H; const rr = Math.round(r * (0.7 + 0.3 * Math.abs(t - 0.62) / 0.62 + (t > 0.62 ? 0.15 * (t - 0.62) : 0)));
    b.hline(cx - rr, cx + rr, y - k, 'c2'); b.px(cx - rr, y - k, 'k6'); b.px(cx + rr, y - k, 'c0'); b.px(cx + rr - 1, y - k, 'c1');
  }
  b.ellipse(cx, y - H, (r * 0.85) | 0, 2, 'k2'); b.hline(cx - ((r * 0.85) | 0), cx + ((r * 0.85) | 0), y - H - 2, 'k6');
  smoke?.push([cx, y - H, 1]);
}
function dish(b, cx, cy, r) {
  b.vline(cx, cy, cy + r + 2, 'k3'); b.hline(cx - 2, cx + 2, cy + r + 2, 'k2');
  b.ellipse(cx, cy, r, Math.max(1, (r * 0.7) | 0), 'k6'); b.ellipse(cx + 1, cy + 1, Math.max(1, r - 2), Math.max(1, (r * 0.5) | 0), 'k5');
  b.px(cx, cy, 'k1'); b.line(cx, cy, cx - r + 1, cy - r + 1, 'k4');
}
function mast(b, x, y, H, lights) {
  b.vline(x, y - H, y, 'k4'); b.vline(x + 2, y - H + 2, y, 'k4');
  for (let k = 2; k < H; k += 3) { b.px(x + 1, y - k, 'k3'); }
  b.px(x + 1, y - H - 1, 'e2'); lights?.push([x + 1, y - H - 1, 2]);
}
function flag(b, x, y) { b.vline(x, y - 12, y, 'k4'); b.rect(x + 1, y - 12, 5, 3, 'team'); b.px(x, y - 13, 'l0'); }
function pad(b, cx, cy, r) { b.circle(cx, cy, r, 'c1'); b.circle(cx, cy, r - 1, 'c0'); b.vline(cx - 1, cy - 2, cy + 2, 'l0'); b.vline(cx + 1, cy - 2, cy + 2, 'l0'); b.px(cx, cy, 'l0'); }
function pile(b, cx, cy, r, c1, c2) { for (let k = r; k > 0; k--) b.ellipse(cx, cy - (r - k) / 1.5, k, Math.max(1, (k / 2) | 0), k % 2 ? c1 : c2); }
function sandbag(b, cx, cy, r) { for (let a = 0; a < 24; a++) { const t = a / 24 * 6.283; b.px(cx + Math.round(Math.cos(t) * r), cy + Math.round(Math.sin(t) * r * 0.7), a % 2 ? 'b4' : 'b3'); } }
function ground(b, x, y, w, h, k) { b.rect(x, y, w, h, k); b.noise(x, y, w, h, ['c0', 'c2', 'k4'], 0.18); }

// görünüm üreticileri: (b, W, H(footprint px), E(top), meta) -> taban y = E + H
const LOOKS = {
  hq(b, W, H, E, m) { ground(b, 1, E + 1, W - 2, H - 2, 'c1'); block(b, 6, E + 10, W - 12, H - 16, 14, 'k5', 'c1', { windows: 1, lights: m.lights, door: 1, stripe: 1 }); flag(b, 4, E + H - 3); mast(b, W - 8, E + 12, 18, m.lights); pad(b, W - 7, E + H - 6, 4); },
  cmd(b, W, H, E, m) { ground(b, 1, E + 2, W - 2, H - 3, 'g1'); block(b, 4, E + 8, W - 8, H - 12, 7, 'm1', 'c0', { windows: 1, lights: m.lights }); mast(b, W - 6, E + 8, 16, m.lights); dish(b, 8, E + 3, 3); },
  depot(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'c0'); for (let k = 0; k < 2; k++) block(b, 2 + k * 15, E + 6, 12, H - 12, 7, 'b3', 'b2', { door: 1 }); for (let k = 0; k < 4; k++) b.rect(3 + k * 7, E + H - 5, 5, 3, k % 2 ? 'g2' : 'f1'); },
  rail(b, W, H, E) { ground(b, 0, E + 2, W, H - 2, 'c1'); b.hline(0, W - 1, E + H - 4, 'k3'); b.hline(0, W - 1, E + H - 2, 'k3'); block(b, 6, E + 4, W - 12, 6, 6, 'f1', 'c2', { windows: 1 }); },
  mine(b, W, H, E, m) {
    ground(b, 0, E + 2, W, H - 2, 'b2'); pile(b, 8, E + H - 5, 6, 'b1', 'b0');
    const x = W - 12; b.line(x, E + H - 3, x + 4, E + 2, 'k3'); b.line(x + 8, E + H - 3, x + 4, E + 2, 'k3'); b.circle(x + 4, E + 3, 3, 'k4'); b.circle(x + 4, E + 3, 1, 'k2');
    block(b, x - 2, E + H - 7, 10, 5, 5, 'f1', 'b3'); b.line(10, E + H - 8, x - 2, E + H - 12, 'k2');
  },
  well(b, W, H, E) { ground(b, 1, E + 4, W - 2, H - 5, 'b1'); b.line(3, E + H - 3, 8, E + 4, 'k3'); b.line(12, E + H - 3, 8, E + 4, 'k3'); b.line(2, E + 5, 14, E + 3, 'k2'); b.rect(1, E + 4, 3, 3, 'e1'); b.rect(12, E + 1, 2, 4, 'k3'); },
  refinery(b, W, H, E, m) {
    ground(b, 0, E + 1, W, H - 1, 'c0'); cyl(b, 9, E + H - 6, 6, 9, 'k6'); cyl(b, 23, E + H - 5, 5, 8, 'k5'); cyl(b, 17, E + 20, 4, 6, 'k6');
    b.rect(30, E + 4, 3, 22, 'k4'); b.rect(36, E + 8, 2, 18, 'k3'); m.flame.push([31, E + 2]); m.lights.push([31, E + 3, 3]);
    b.hline(4, 40, E + 30, 'k3'); b.hline(4, 40, E + 31, 'k4');
  },
  steel(b, W, H, E, m) {
    ground(b, 0, E + 1, W, H - 1, 'c0'); block(b, 3, E + 12, W - 6, H - 15, 9, 'k4', 'c0', { door: 1 });
    for (let x = 4; x < W - 5; x += 5) { b.line(x, E + 3 + 2, x + 4, E + 3, 'k5'); }
    chimney(b, W - 9, E + 10, 3, 22, true, m.smoke); chimney(b, W - 15, E + 10, 3, 18, false, m.smoke);
    b.rect(8, E + H - 6, 4, 2, 'o1'); m.lights.push([10, E + H - 5, 3]);
  },
  electronics(b, W, H, E, m) { ground(b, 0, E + 2, W, H - 2, 'c1'); block(b, 3, E + 8, W - 6, H - 12, 11, 'k6', 'k5', { windows: 1, lights: m.lights, door: 1 }); b.rect(6, E - 1, 4, 2, 'k4'); b.rect(14, E - 1, 4, 2, 'k4'); },
  munitions(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'g1'); for (let k = 0; k < 3; k++) { b.ellipse(8 + k * 15, E + 14, 6, 4, 'g2'); block(b, 4 + k * 15, E + 12, 8, 5, 4, 'c0', 'c1'); } for (let x = 2; x < W - 2; x += 4) { b.px(x, E + H - 3, 'l0'); b.px(x + 1, E + H - 3, 'k1'); } },
  drone_fac(b, W, H, E, m) { ground(b, 0, E + 2, W, H - 2, 'c1'); block(b, 3, E + 8, W - 6, H - 11, 10, 'k4', 'k3', { lights: m.lights, door: 1, stripe: 1 }); for (let x = 7; x < W - 8; x += 7) b.rect(x, E + 1, 3, 2, 'w4'); b.rect(W / 2 - 4, E + H - 6, 8, 5, 'k1'); },
  missile_fac(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'c0'); block(b, 3, E + 12, W - 6, H - 16, 12, 'k5', 'c1', { windows: 1, lights: m.lights, door: 1 }); b.rect(6, E + H - 4, 18, 2, 'k6'); b.rect(24, E + H - 5, 3, 4, 'e2'); },
  barracks(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'b3'); block(b, 2, E + 4, W - 4, 6, 6, 'g2', 'b2', { windows: 1, lights: m.lights }); block(b, 2, E + 18, W - 4, 6, 6, 'g2', 'b2', { windows: 1, lights: m.lights }); flag(b, W - 3, E + H - 2); },
  vehicle_fac(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'c0'); block(b, 3, E + 6, W - 6, 12, 10, 'k4', 'c0', { door: 1 }); for (let k = 0; k < 3; k++) { b.rect(8 + k * 12, E + 9, 7, 6, 'k2'); } for (let k = 0; k < 3; k++) { b.rect(6 + k * 13, E + H - 6, 8, 4, 'g2'); b.rect(9 + k * 13, E + H - 7, 3, 2, 'g1'); } },
  research(b, W, H, E, m) { ground(b, 0, E + 2, W, H - 2, 'g3'); block(b, 3, E + 12, W - 6, H - 16, 7, 'k6', 'k5', { windows: 1, lights: m.lights }); b.ellipse(W / 2, E + 9, 7, 6, 'k6'); b.ellipse(W / 2 - 1, E + 8, 5, 4, 'k7'); b.vline(W / 2, E + 1, E + 4, 'k3'); },
  coal_plant(b, W, H, E, m) {
    ground(b, 0, E + 1, W, H - 1, 'c0'); pile(b, 9, E + H - 6, 7, 'k1', 'k0');
    block(b, 16, E + 16, 18, 16, 12, 'k4', 'c1', { windows: 1, lights: m.lights });
    chimney(b, 37, E + 26, 4, 34, true, m.smoke); chimney(b, 43, E + 26, 3, 28, true, m.smoke);
    cooling(b, 9, E + 18, 7, 16, m.smoke);
  },
  gas_plant(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'c1'); block(b, 3, E + 12, 18, 14, 8, 'k5', 'c1', { windows: 1, lights: m.lights }); chimney(b, W - 7, E + 22, 3, 20, true, m.smoke); b.hline(2, W - 2, E + H - 3, 'l0'); },
  dam(b, W, H, E, m) { for (let y = 0; y < H; y++) b.hline(1, W - 2, E + y, y < 6 ? 'w3' : 'c1'); b.rect(1, E + 6, W - 2, 6, 'c2'); b.hline(1, W - 2, E + 6, 'k6'); block(b, 6, E + 20, W - 12, 8, 6, 'k5', 'c1', { windows: 1, lights: m.lights }); for (let x = 4; x < W - 4; x += 5) b.vline(x, E + 12, E + 16, 'w4'); },
  nuclear(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'c1'); cooling(b, 11, E + 30, 9, 26, m.smoke); cooling(b, 32, E + 26, 8, 22, m.smoke); b.ellipse(36, E + 40, 7, 6, 'k6'); b.ellipse(35, E + 39, 5, 4, 'k7'); block(b, 4, E + 40, 18, 5, 4, 'c0', 'c1', { windows: 1, lights: m.lights }); },
  solar(b, W, H, E) { ground(b, 0, E + 1, W, H - 1, 'g2'); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { b.rect(2 + c * 10, E + 3 + r * 7, 8, 5, 'u0'); b.hline(2 + c * 10, 9 + c * 10, E + 3 + r * 7, 'w4'); b.vline(5 + c * 10, E + 3 + r * 7, E + 7 + r * 7, 'u1'); } },
  substation(b, W, H, E, m) { ground(b, 1, E + 2, W - 2, H - 3, 'k3'); b.rect(3, E + 6, 4, 5, 'k5'); b.rect(9, E + 6, 4, 5, 'k5'); b.line(2, E + 1, 8, E - 6, 'k4'); b.line(14, E + 1, 8, E - 6, 'k4'); b.hline(3, 13, E - 3, 'k4'); b.px(8, E - 7, 'l0'); m.lights.push([8, E - 6, 2]); },
  pump(b, W, H, E, m) { ground(b, 1, E + 3, W - 2, H - 4, 'c1'); block(b, 3, E + 8, 10, 6, 5, 'w3', 'c1', { door: 1 }); b.hline(0, 15, E + H - 2, 'w3'); },
  relay(b, W, H, E, m) { b.line(3, E + H - 1, 8, E - 14, 'k3'); b.line(13, E + H - 1, 8, E - 14, 'k3'); for (let k = 0; k < 6; k++) b.hline(4 + k, 12 - k, E + H - 2 - k * 4, 'k4'); b.px(8, E - 15, 'e2'); m.lights.push([8, E - 15, 2]); b.rect(6, E - 6, 4, 2, 'k6'); },
  satellite(b, W, H, E, m) { ground(b, 0, E + 2, W, H - 2, 'c1'); dish(b, 14, E + 6, 10); block(b, 20, E + 24, 10, 6, 5, 'k5', 'c1', { windows: 1, lights: m.lights }); },
  drone_base(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'b3'); pad(b, 8, E + 22, 5); pad(b, 22, E + 22, 5); block(b, 3, E + 6, 14, 6, 6, 'g2', 'g1', { windows: 1, lights: m.lights, stripe: 1 }); mast(b, 25, E + 8, 14, m.lights); },
  airbase(b, W, H, E, m) {
    ground(b, 0, E + 1, W, H - 1, 'g2'); b.rect(2, E + 18, W - 4, 9, 'k2'); for (let x = 6; x < W - 6; x += 6) b.hline(x, x + 2, E + 22, 'k7');
    for (let x = 3; x < W - 2; x += 5) { m.lights.push([x, E + 18, 2]); m.lights.push([x, E + 26, 2]); b.px(x, E + 18, 'l1'); b.px(x, E + 26, 'l1'); }
    block(b, 6, E + 8, 18, 6, 7, 'k4', 'c0', { door: 1 }); block(b, 30, E + 8, 6, 4, 14, 'k5', 'c1', { windows: 1, lights: m.lights }); b.rect(30, E - 7, 6, 2, 'w4');
  },
  port(b, W, H, E, m) { b.rect(0, E + 1, W, H - 1, 'c1'); b.rect(0, E + H - 8, W, 8, 'w2'); for (let x = 4; x < W - 4; x += 9) b.rect(x, E + H - 11, 6, 5, 'c0'); for (let k = 0; k < 6; k++) b.rect(4 + (k % 3) * 6, E + 6 + ((k / 3) | 0) * 4, 5, 3, ['e1', 'u1', 'g2', 'l0'][k % 4]); b.vline(36, E - 8, E + 14, 'l0'); b.hline(28, 44, E - 8, 'l0'); b.vline(30, E - 8, E - 2, 'k3'); },
  missile_base(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'g1'); for (let k = 0; k < 2; k++) { b.circle(9 + k * 14, E + 18, 5, 'c1'); b.circle(9 + k * 14, E + 18, 3, 'k2'); } b.rect(4, E + 6, 22, 4, 'k6'); b.rect(26, E + 6, 3, 4, 'e2'); b.rect(4, E + 10, 22, 2, 'k3'); },
  coastal(b, W, H, E) { ground(b, 0, E + 2, W, H - 2, 'b3'); sandbag(b, 16, E + 9, 12); b.rect(8, E + 4, 16, 4, 'g2'); b.rect(10, E + 2, 12, 2, 'k6'); b.rect(22, E + 2, 3, 2, 'e2'); },
  radar(b, W, H, E, m) { ground(b, 0, E + 2, W, H - 2, 'c1'); block(b, 4, E + 22, 12, 6, 5, 'k5', 'c1', { windows: 1, lights: m.lights }); b.line(16, E + 24, 22, E + 4, 'k3'); b.line(28, E + 24, 22, E + 4, 'k3'); for (let k = 0; k < 5; k++) b.hline(18 + k, 26 - k, E + 22 - k * 4, 'k4'); m.dish = [22, E - 2]; },
  sam_site(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'g1'); for (let k = 0; k < 3; k++) { sandbag(b, 7 + k * 9, E + 22, 4); b.rect(4 + k * 9, E + 17, 6, 3, 'k6'); b.rect(4 + k * 9, E + 16, 6, 1, 'g2'); } dish(b, 24, E + 6, 4); },
  aa_gun(b, W, H, E) { sandbag(b, 8, E + 9, 6); b.circle(8, E + 9, 3, 'g2'); b.line(8, E + 9, 14, E + 2, 'k2'); b.line(9, E + 9, 15, E + 3, 'k2'); },
  ciws(b, W, H, E) { b.rect(3, E + 6, 10, 8, 'c1'); b.ellipse(8, E + 5, 4, 4, 'k7'); b.ellipse(7, E + 4, 2, 2, 'k6'); b.rect(10, E + 5, 5, 2, 'k3'); },
  laser(b, W, H, E, m) { ground(b, 0, E + 1, W, H - 1, 'c1'); for (let k = 0; k < 4; k++) b.rect(3 + k * 6, E + 22, 4, 6, 'u1'); b.rect(10, E + 6, 12, 12, 'k5'); b.ellipse(16, E + 4, 5, 4, 'k6'); b.circle(16, E + 4, 2, 'cy' in P32 ? 'w5' : 'w5'); m.lights.push([16, E + 4, 4]); },
  jammer(b, W, H, E, m) { b.rect(3, E + 8, 10, 7, 'g1'); for (let k = 0; k < 3; k++) { b.vline(4 + k * 4, E - 6 + k * 2, E + 8, 'k4'); b.hline(3 + k * 4, 5 + k * 4, E - 6 + k * 2, 'k6'); } m.lights.push([8, E - 4, 2]); },
  sigint(b, W, H, E, m) { ground(b, 0, E + 2, W, H - 2, 'c1'); b.circle(10, E + 10, 7, 'k7'); b.circle(9, E + 9, 5, 'k6'); b.rect(7, E + 16, 6, 3, 'k4'); mast(b, 24, E + 24, 20, m.lights); },
  bunker(b, W, H, E) { b.ellipse(8, E + 9, 7, 5, 'c1'); b.ellipse(8, E + 8, 6, 4, 'c2'); b.rect(4, E + 9, 8, 1, 'k0'); },
  bridge() {},
};

export function buildBuildingSprite(def, variant, seed = 1) {
  const W = def.size[0] * TILE, H = def.size[1] * TILE, E = BUILD_TOP;
  const b = new PixelBuf(W, H + E); b.seed = seed;
  const meta = { lights: [], smoke: [], flame: [] };
  (LOOKS[def.look] || LOOKS.depot)(b, W, H, E, meta);
  if (variant >= 1) damage(b, variant, E, H, seed);
  b.outline('k0');
  const mask = b.splitTeam();
  return { b, mask, meta: variant === 2 ? { lights: [], smoke: [], flame: [] } : meta, W, H: H + E };
}
function damage(b, v, E, H, seed) {
  const w = b.w, h = b.h;
  if (v === 1) { // hasarlı: is lekeleri + delikler
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!b.get(x, y)) continue; const r = hash2f(x >> 1, y >> 1, seed + 3);
      if (r < 0.12) b.px(x, y, 'k1'); else if (r < 0.2) b.px(x, y, 'k2');
    }
    return;
  }
  // harabe: sütun başına kesik yükseklik, moloz ve kurum
  const src = b.d.slice(); b.d.fill(0);
  for (let x = 0; x < w; x++) {
    const cut = E + Math.floor(H * 0.45 + hash2f(x >> 2, 7, seed) * H * 0.4);
    for (let y = cut; y < h; y++) {
      if (!src[y * w + x]) continue;
      const r = hash2f(x, y, seed + 11);
      b.d[y * w + x] = r < 0.3 ? P32.k1 : r < 0.5 ? P32.r1 : r < 0.65 ? P32.b1 : r < 0.75 ? P32.k2 : src[y * w + x] === TEAM_KEY ? P32.k3 : src[y * w + x];
    }
    if (hash2f(x, 3, seed) < 0.5) b.px(x, cut - 1, hash2f(x, 4, seed) < 0.5 ? 'r2' : 'k3');
  }
}

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
// kara özel araçlar (Kenney tarzı, sağa bakan 3/4)
function truck(launcher) {
  const b = new PixelBuf(16, 16);
  b.rect(1, 9, 14, 4, 'k5'); b.rect(11, 6, 4, 4, 'k6'); b.px(13, 7, 'w4'); b.px(14, 7, 'w4');
  for (const x of [3, 7, 12]) { b.circle(x, 13, 1, 'k1'); }
  launcher(b); b.outline('k0'); return b;
}
const TRUCKS = {
  samL: () => truck((b) => { b.line(2, 9, 9, 3, 'k6'); b.line(3, 9, 10, 3, 'k6'); b.line(2, 8, 9, 2, 'k7'); b.rect(4, 7, 3, 2, 'team'); }),
  samM: () => truck((b) => { b.rect(2, 6, 8, 3, 'k6'); b.hline(2, 9, 6, 'k7'); b.rect(3, 9, 3, 1, 'team'); }),
  samS: () => truck((b) => { b.rect(3, 4, 6, 5, 'k6'); b.circle(6, 5, 1, 'k3'); b.rect(3, 9, 4, 1, 'team'); }),
  ewtruck: () => truck((b) => { b.rect(2, 5, 8, 4, 'g2'); b.vline(4, 0, 5, 'k4'); b.vline(8, 1, 5, 'k4'); b.hline(3, 5, 0, 'k6'); b.rect(3, 9, 3, 1, 'team'); }),
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
  const A = new Atlas(2048);
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
  for (const [name, gen] of Object.entries(TRUCKS)) { const b = gen(); const m = b.splitTeam(); A.addBuf('gen:' + name, b); if (m) A.addBuf('gen:' + name + ':m', m); }
  for (const t of ['inf', 'armor', 'mech', 'arty', 'eng', 'ad', 'ew', 'mlrs', 'ship']) { A.addBuf('sym:' + t + ':f', symbol(t, false)); A.addBuf('sym:' + t + ':h', symbol(t, true)); }
  // binalar: sağlam / hasarlı / harabe
  BUILDINGS.forEach((def, i) => {
    if (def.look === 'bridge') return;
    for (let v = 0; v < 3; v++) {
      const s = buildBuildingSprite(def, v, 17 + i * 13);
      A.addBuf(`b:${def.id}:${v}`, s.b, { meta: s.meta, top: BUILD_TOP });
      if (s.mask) A.addBuf(`b:${def.id}:${v}:m`, s.mask);
    }
  });
  // Kenney CC0 sayfaları (16x16 karolar, aralık yok)
  const [ib, it] = await Promise.all([loadImage(kBattle), loadImage(kTown)]);
  A.kenney = { battle: ib, town: it };
  for (let i = 0; i < 18 * 11; i++) A.addImage('kb:' + i, ib, (i % 18) * 16, ((i / 18) | 0) * 16, 16, 16);
  for (let i = 0; i < 12 * 11; i++) A.addImage('kt:' + i, it, (i % 12) * 16, ((i / 12) | 0) * 16, 16, 16);
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
