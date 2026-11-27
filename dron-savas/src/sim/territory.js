// Toprak ve şehirler: başkent kurma (oyuncu seçer), YZ'nin uzağa yerleşmesi, şehir nüfusuyla büyüyen ama
// üst sınırı olan sınırlar, "Şehir Kur" ile yeni şehirler.
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { B, BUILDINGS } from '../data/buildings.js';
import { T, NONE } from '../world/map.js';
import { placeBuilding, findSpot, markNetDirty } from './build.js';
import { R } from '../data/defs.js';

export const CITY_R = { capital: [3, 10], town: [2, 7] }; // görsel yarıçap: başlangıç, üst sınır
export const CLAIM_EXTRA = 5; // şehir yarıçapının ötesinde sahiplenilen kuşak
export const MIN_CITY_DIST = 16;

export function cityRadius(sim, id) {
  const e = sim.e; const cap = e.flags[id] & F.CAPITAL || sim.cityInfo.get(id)?.capital;
  const [r0, r1] = cap ? CITY_R.capital : CITY_R.town;
  return Math.max(r0, Math.min(r1, Math.round(r0 + Math.sqrt(e.buf[id]) / 28)));
}

export function createCity(sim, c, x, y, name, pop, capital) {
  const e = sim.e;
  const id = e.create(KIND.CITY, 0, c, x + 0.5, y + 0.5, C.CITY);
  e.hp[id] = e.maxhp[id] = 100 + pop / 50; e.buf[id] = pop; e.supply[id] = 0.75;
  sim.cityInfo.set(id, { name, capital, seed: (x * 7919 + y * 31) | 0, pop0: pop, cap: capital ? 60000 : 25000 });
  if (capital) e.flags[id] |= F.CAPITAL;
  e.prog[id] = cityRadius(sim, id); markCityTiles(sim, x, y, e.prog[id]);
  claimAround(sim, c, x, y, e.prog[id] + CLAIM_EXTRA);
  sim.dirty.power = true;
  return id;
}

export function markCityTiles(sim, cx, cy, r) {
  const map = sim.map;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dy * dy > r * r) continue; const x = cx + dx, y = cy + dy; if (!map.inb(x, y)) continue;
    const i = y * map.W + x; if (map.isLand(i)) map.cityTile[i] = 1;
  }
}
export function claimAround(sim, c, cx, cy, r) {
  const map = sim.map; let n = 0;
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dy * dy > r * r) continue;
    const x = cx + dx, y = cy + dy; if (!map.inb(x, y)) continue;
    const i = y * map.W + x; if (map.owner[i] !== NONE) continue;
    if (map.ter[i] === T.DEEP || map.ter[i] === T.SEA) continue;
    map.owner[i] = c; n++;
  }
  if (n) map.markDirtyArea(cx - r, cy - r, cx + r, cy + r);
  return n;
}

// başkent yeri uygun mu?
export function capitalSiteOk(sim, x, y) {
  const map = sim.map; x |= 0; y |= 0;
  if (x < 8 || y < 8 || x >= map.W - 8 || y >= map.H - 8) return 'err_bounds';
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const i = (y + dy) * map.W + x + dx; if (!map.isLand(i) || map.ter[i] === T.MOUNTAIN || map.ter[i] === T.PEAK) return 'err_terrain';
    if (map.owner[i] !== NONE) return 'err_territory';
  }
  return '';
}
// çevre kaynak özeti (yer seçimi bilgi kartı ve YZ puanı)
export function siteSummary(sim, x, y, r = 22) {
  const map = sim.map, dep = sim.deposits; const seen = new Set(); const out = { iron: 0, coal: 0, oil: 0, gas: 0, copper: 0, uranium: 0, rare: 0, river: false, coast: false };
  for (let dy = -r; dy <= r; dy += 1) for (let dx = -r; dx <= r; dx += 1) {
    if (dx * dx + dy * dy > r * r) continue;
    const nx = (x | 0) + dx, ny = (y | 0) + dy; if (!map.inb(nx, ny)) continue;
    const i = ny * map.W + nx;
    const di = dep.idx[i]; if (di >= 0 && !seen.has(di)) { seen.add(di); out[dep.list[di].res] += dep.list[di].reserve; }
    const t = map.ter[i]; if (t === T.RIVER || t === T.LAKE) out.river = true; if (t === T.SEA) out.coast = true;
  }
  return out;
}

export function foundCountry(sim, c, x, y) {
  const co = sim.countries[c], info = sim.world.countries[c]; x |= 0; y |= 0;
  info.capital = { x, y };
  co.capitalCity = createCity(sim, c, x, y, info.capitalName, 6000, true);
  const hs = findSpot(sim, c, B.hq, x + 1, y + 4, 8, sim.rng);
  if (hs) { co.hq = placeBuilding(sim, c, B.hq, hs[0], hs[1], { instant: true, free: true }); sim.e.flags[co.hq] |= F.CAPITAL; }
  const ps = findSpot(sim, c, B.coal_plant, x + 7, y + 6, 10, sim.rng);
  if (ps) placeBuilding(sim, c, B.coal_plant, ps[0], ps[1], { instant: true, free: true });
  co.placed = true;
  markNetDirty(sim);
  sim.notify(c, 'n_founded', [info.capitalName], x, y, 1);
}

// YZ başkentleri: oyuncudan ve birbirinden olabildiğince uzak, kaynakça zengin yerler
export function placeAICapitals(sim) {
  const W = sim.map.W; const cand = sim.world.cand; const placed = [];
  for (const co of sim.countries) if (co.placed) placed.push([sim.world.countries[co.id].capital.x, sim.world.countries[co.id].capital.y]);
  for (const co of sim.countries) {
    if (co.placed || !co.ai) continue;
    let minD = Math.max(40, W / 4); let best = null;
    while (!best && minD > 12) {
      let bs = -1;
      for (let k = 0; k < cand.length; k += 3) {
        const i = cand[k], x = i % W, y = (i / W) | 0;
        let md = 1e9; for (const [px, py] of placed) md = Math.min(md, Math.hypot(px - x, py - y));
        if (md < minD || capitalSiteOk(sim, x, y)) continue;
        const s = siteSummary(sim, x, y, 18);
        const score = Math.min(md, W / 2) * 0.02 + (s.iron > 0) + (s.coal > 0) + (s.oil > 0) * 0.8 + (s.copper > 0) * 0.6 + (s.gas > 0) * 0.4 + (s.river ? 0.5 : 0) + sim.rng.next() * 0.3;
        if (score > bs) { bs = score; best = [x, y]; }
      }
      minD *= 0.75;
    }
    if (!best) { const i = cand[sim.rng.int(cand.length)]; best = [i % W, (i / W) | 0]; }
    foundCountry(sim, co.id, best[0], best[1]); placed.push(best);
  }
  sim.phase = 'play';
  sim.countries.forEach((co) => { co.territory = co.territory0 = countTerritory(sim, co.id); co.territoryMax = co.territory; });
}
function countTerritory(sim, c) { let n = 0; const o = sim.map.owner; for (let i = 0; i < o.length; i++) if (o[i] === c) n++; return n; }

registerCommand(CMD.FOUND_CAPITAL, (sim, cmd) => {
  if (sim.phase !== 'setup' || sim.countries[cmd.c].placed) return false;
  if (capitalSiteOk(sim, cmd.x, cmd.y)) return false;
  foundCountry(sim, cmd.c, cmd.x, cmd.y);
  if (sim.countries.every((co) => co.placed || co.ai)) placeAICapitals(sim); // tüm insan oyuncular yerleşince YZ uzağa yerleşir
});

// şehir büyümesi + sınır genişlemesi (her 50 tick)
export function updateTerritory(sim) {
  if (sim.tick % 50 !== 17) return;
  const e = sim.e;
  e.each(C.CITY, (i) => {
    const r = cityRadius(sim, i);
    if (r !== e.prog[i]) e.prog[i] = r;
    markCityTiles(sim, e.x[i] | 0, e.y[i] | 0, r);
    claimAround(sim, e.owner[i], e.x[i] | 0, e.y[i] | 0, r + CLAIM_EXTRA);
  });
}

// "Şehir Kur" tamamlanınca: bina yerine yeni şehir
export function completeCityFounding(sim, id) {
  const e = sim.e, c = e.owner[id]; const x = e.ox[id], y = e.oy[id];
  const co = sim.countries[c]; const names = sim.world.countries[c].cityNames;
  const nm = names[(co.citiesFounded = (co.citiesFounded || 0) + 1) % names.length] + (co.citiesFounded > names.length ? ' ' + co.citiesFounded : '');
  sim.map.occ[y * sim.map.W + x] = 0; e.kill(id);
  const cid = createCity(sim, c, x, y, nm, 1500, false);
  sim.notify(c, 'n_city_founded', [nm], x, y, 1);
  return cid;
}
// şehir kurulabilir mi: kendi toprağında ya da sınıra 4 karo yakın, diğer şehirlerden uzak
export function citySiteOk(sim, c, x, y) {
  const map = sim.map, e = sim.e; if (!map.inb(x, y)) return 'err_bounds';
  const i = y * map.W + x; if (!map.isLand(i)) return 'err_terrain';
  const o = map.owner[i]; if (o !== c && o !== NONE) return 'err_territory';
  if (o === NONE) {
    let near = false;
    for (let dy = -4; dy <= 4 && !near; dy++) for (let dx = -4; dx <= 4; dx++) { if (map.inb(x + dx, y + dy) && map.owner[(y + dy) * map.W + x + dx] === c) { near = true; break; } }
    if (!near) return 'err_border';
  }
  let ok = true;
  e.each(C.CITY, (j) => { const dx = e.x[j] - x, dy = e.y[j] - y; if (dx * dx + dy * dy < MIN_CITY_DIST * MIN_CITY_DIST) ok = false; });
  return ok ? '' : 'err_citydist';
}
export { R };
