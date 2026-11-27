// Yangın: patlamalar ateş başlatır; orman, çimen, şehir ve binalarda rüzgâr yönünde yayılır; yağmur/kar söndürür;
// itfaiye istasyonu bastırır. Zincirleme patlamalar (mühimmat, yakıt), günlerce yanan petrol kuyusu yangınları.
import { KIND, C, F } from '../core/ecs.js';
import { BUILDINGS } from '../data/buildings.js';
import { T } from '../world/map.js';
import { explode, applyDamage } from './damage.js';

const MAX_FIRES = 6000;
// karo yakıtı (yanma olasılığı) ve yanma süresi (5 tick'lik çevrim)
function fuel(map, i) {
  if (map.burnt[i] > 0) return 0;
  if (map.occ[i]) return 0.8;
  if (map.cityTile[i]) return 0.75;
  switch (map.ter[i]) { case T.FOREST: return 1; case T.GRASS: return 0.18; case T.HILL: return 0.3; case T.SWAMP: return 0.08; case T.SAND: return 0.02; default: return 0; }
}
function burnTime(map, i) { return map.ter[i] === T.FOREST ? 50 : map.occ[i] || map.cityTile[i] ? 60 : 16; }

export function ignite(sim, x, y, chance = 1) {
  const map = sim.map; x |= 0; y |= 0; if (!map.inb(x, y)) return false;
  const i = y * map.W + x; if (map.fire[i]) return false;
  const f = fuel(map, i); if (!f || sim.rng.next() > f * chance) return false;
  if (sim.fireTiles.length >= MAX_FIRES) return false;
  map.fire[i] = 20; map.fireAge[i] = 0; sim.fireTiles.push(i);
  return true;
}
export function igniteArea(sim, x, y, r, chance) {
  const n = Math.max(1, Math.round(r * r * 1.5));
  for (let k = 0; k < n; k++) { const [a, b] = sim.rng.disk(); ignite(sim, x + a * r, y + b * r, chance); }
}

// bina yıkılınca zincirleme etkiler
export function chainReaction(sim, id) {
  const e = sim.e, bd = BUILDINGS[e.def[id]]; const x = e.x[id], y = e.y[id];
  const big = { munitions: [7, 70, 2.4], missile_fac: [6, 90, 2.6], missile_base: [4, 120, 2.8], depot: [4, 40, 2], refinery: [5, 60, 2.6], gas_plant: [3, 50, 2.2], well: [2, 30, 1.6], coal_plant: [2, 30, 1.8], port: [3, 40, 2] }[bd.id];
  if (!big) { igniteArea(sim, x, y, 1.5, 0.6); return; }
  const [n, dmg, r] = big;
  for (let k = 0; k < n; k++) { const [a, b] = sim.rng.disk(); sim.secondary.push({ t: sim.tick + 3 + k * (2 + sim.rng.int(5)), x: x + a * 2, y: y + b * 2, r, dmg, owner: 255 }); }
  igniteArea(sim, x, y, 3, 0.9);
  if (bd.id === 'well' || bd.id === 'refinery') sim.oilFires.push({ i: (y | 0) * sim.map.W + (x | 0), until: sim.tick + (bd.id === 'well' ? 2880 : 1440) }); // günlerce yanar
  sim.emit({ k: 'chain', x, y, big: n });
}

export function updateFire(sim) {
  // ikincil patlamalar
  if (sim.secondary.length) {
    const now = sim.secondary.filter((s) => s.t <= sim.tick); if (now.length) sim.secondary = sim.secondary.filter((s) => s.t > sim.tick);
    for (const s of now) { explode(sim, s.x, s.y, s.r, s.dmg, s.owner, { ff: true }); igniteArea(sim, s.x, s.y, s.r, 0.7); }
  }
  if (sim.tick % 5 !== 0) return;
  const map = sim.map, e = sim.e, env = sim.env, W = map.W;
  // petrol yangınları sürekli yeniden tutuşur
  if (sim.oilFires.length) { sim.oilFires = sim.oilFires.filter((o) => o.until > sim.tick); for (const o of sim.oilFires) { if (!map.fire[o.i]) { map.fire[o.i] = 100; map.fireAge[o.i] = 0; sim.fireTiles.push(o.i); } else map.fireAge[o.i] = 0; } }
  if (!sim.fireTiles.length) return;
  // itfaiye kapsaması
  const stations = [];
  e.each(C.BUILDING, (i) => { const bd = BUILDINGS[e.def[i]]; if (bd.fire && !(e.flags[i] & (F.RUINED | F.BUILDING)) && e.sat[i] >= 0.35) stations.push(e.x[i], e.y[i], bd.fire); });
  const covered = (x, y) => { for (let k = 0; k < stations.length; k += 3) { const dx = stations[k] - x, dy = stations[k + 1] - y; if (dx * dx + dy * dy <= stations[k + 2] * stations[k + 2]) return true; } return false; };
  const wet = env.weather === 'rain' || env.weather === 'storm' ? 0.25 : env.weather === 'snow' ? 0.15 : 1;
  const wl = Math.sqrt(env.windX * env.windX + env.windY * env.windY) || 1;
  const keep = [];
  for (const i of sim.fireTiles) {
    if (!map.fire[i]) continue;
    const x = i % W, y = (i / W) | 0; const cov = stations.length && covered(x, y);
    map.fireAge[i] += cov ? 5 : 1;
    if (wet < 1) map.fire[i] = Math.max(0, map.fire[i] - (1 - wet) * 25);
    else map.fire[i] = Math.min(100, map.fire[i] + 12);
    if (map.fire[i] <= 0 || map.fireAge[i] > burnTime(map, i)) {
      map.fire[i] = 0; if (map.fireAge[i] > 6) { if (!map.burnt[i]) sim.burntList.push(i); map.burnt[i] = 255; } map.fireAge[i] = 0; map.markDirty(x, y); continue;
    }
    // yayılma (rüzgâr yönünde daha olası)
    const inten = map.fire[i] / 100;
    for (let d = 0; d < 8; d++) {
      const dx = [1, -1, 0, 0, 1, 1, -1, -1][d], dy = [0, 0, 1, -1, 1, -1, 1, -1][d];
      const down = (dx * env.windX + dy * env.windY) / wl; // -1..1
      const p = 0.03 * inten * wet * (1 + down * Math.min(1.5, wl * 1.5)) * (cov ? 0.25 : 1) * (d >= 4 ? 0.7 : 1);
      if (p > 0 && sim.rng.next() < p) ignite(sim, x + dx, y + dy, 1);
    }
    // hasar: binalar, şehirler, birlikler
    const o = map.occ[i];
    if (o && e.alive(o - 1) && !(e.flags[o - 1] & F.RUINED)) { applyDamage(sim, o - 1, 3 * inten, 255); e.flags[o - 1] |= F.BURNING; }
    if (map.cityTile[i] && sim.tick % 20 === 0) { const c = sim.cityAt(x, y); if (c >= 0) { e.fuel[c] += 0.4 * inten; e.buf[c] = Math.max(200, e.buf[c] - 4 * inten); } }
    keep.push(i);
  }
  sim.fireTiles = keep;
}
// yanık zemin zamanla yeşerir (her 250 tick'te; tam iyileşme ≈ 9 oyun günü)
export function recoverBurnt(sim) {
  if (sim.tick % 250 !== 0 || !sim.burntList.length) return;
  const map = sim.map;
  sim.burntList = sim.burntList.filter((i) => {
    map.burnt[i] = Math.max(0, map.burnt[i] - 25);
    if (map.burnt[i] === 0) { map.markDirty(i % map.W, (i / map.W) | 0); return false; }
    return true;
  });
}
