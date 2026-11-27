// İnşa: yerleştirme kuralları, otomatik yol bağlantısı, inşaat ilerlemesi, bina komutları
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { BUILDINGS, B, HARDEN } from '../data/buildings.js';
import { ITEMS, ITEM_BY, RECRUIT_BY } from '../data/defs.js';
import { T, RD } from '../world/map.js';
import { citySiteOk, completeCityFounding } from './territory.js';

const CAP_MASK = {
  power: C.POWER, comms: C.COMMS, depot: C.DEPOT, factory: C.FACTORY, radar: C.RADAR | C.EMIT, ad: C.AD,
  jammer: C.JAMMER | C.EMIT, sigint: C.SIGINT, base: C.BASE, launcher: C.LAUNCHER, fuelnet: C.FUELNET,
  water: C.WATER, vision: C.VISION, emit: C.EMIT, control: C.BASE, research: C.FACTORY,
};
export const PRODUCT = { ITEM: 0, UNIT: 1000, RECIPE: 2000 };
const DEPOSIT_RES = [1, 2, 5, 6, 7];

export function canPlace(sim, c, defIdx, tx, ty, opts = {}) {
  const d = BUILDINGS[defIdx], map = sim.map, [w, h] = d.size;
  if (!opts.free) {
    if (!sim.techOk(c, d.tech)) return 'err_tech';
    if (d.cat === 'none') return 'err_tech';
    if (!sim.canAfford(c, d.cost, opts.hardened ? HARDEN.cost : 1)) return 'err_cost';
  }
  if (d.place === 'citysite') { const r = citySiteOk(sim, c, tx, ty); if (r) return r; if (map.occ[ty * map.W + tx] || map.road[ty * map.W + tx]) return 'err_occupied'; return ''; }
  let river = 0, deposit = 0, oil = 0;
  for (let y = ty; y < ty + h; y++) for (let x = tx; x < tx + w; x++) {
    if (!map.inb(x, y)) return 'err_bounds';
    const i = y * map.W + x;
    if (map.owner[i] !== c) return 'err_territory';
    if (map.occ[i]) return 'err_occupied';
    if (map.flood[i]) return 'err_terrain';
    const t = map.ter[i];
    if (t === T.RIVER) { if (d.place === 'river') { river++; continue; } return 'err_terrain'; }
    if (!map.isLand(i) || t === T.PEAK) return 'err_terrain';
    if (map.road[i] && !opts.allowRoad) return 'err_road';
    if (DEPOSIT_RES.includes(map.res[i])) deposit = map.res[i];
    if (map.res[i] === 3 || map.res[i] === 4) oil = map.res[i];
  }
  if (d.place === 'deposit' && !deposit) return 'err_deposit';
  if (d.place === 'oilgas' && !oil) return 'err_oil';
  if (d.place === 'river' && !river) return 'err_river';
  if (d.place === 'coast' || d.place === 'nearwater') {
    const r = d.place === 'coast' ? 1 : 3; let ok = false;
    for (let y = ty - r; y < ty + h + r && !ok; y++) for (let x = tx - r; x < tx + w + r; x++) {
      if (!map.inb(x, y)) continue; const i = y * map.W + x, t = map.ter[i];
      if (d.place === 'coast' ? (t === T.SEA || t === T.DEEP) : (t === T.SEA || t === T.LAKE || t === T.RIVER)) { ok = true; break; }
    }
    if (!ok) return d.place === 'coast' ? 'err_coast' : 'err_water';
  }
  return '';
}

export function findSpot(sim, c, defIdx, nx, ny, r, rng, allowOnDeposit) {
  const d = BUILDINGS[defIdx]; const [w, h] = d.size;
  const bx = Math.round(nx - w / 2), by = Math.round(ny - h / 2);
  for (let ring = 0; ring <= r; ring++) {
    for (let dy = -ring; dy <= ring; dy++) for (let dx = -ring; dx <= ring; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
      const x = bx + dx, y = by + dy;
      if (canPlace(sim, c, defIdx, x, y, { free: true }) !== '') continue;
      // kaynak yataklarını maden dışı binalarla kapatma
      if (!allowOnDeposit && d.place !== 'deposit' && d.place !== 'oilgas' && footprintHasDeposit(sim.map, x, y, w, h)) continue;
      // bina etrafında 1 karo boşluk (yollar için)
      if (!clearance(sim.map, x, y, w, h)) continue;
      return [x, y];
    }
  }
  return null;
}
function footprintHasDeposit(map, x, y, w, h) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (map.res[yy * map.W + xx]) return true;
  return false;
}
function clearance(map, x, y, w, h) {
  for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
    if (!map.inb(xx, yy)) return false;
    if (map.occ[yy * map.W + xx]) return false;
  }
  return true;
}

export function placeBuilding(sim, c, defIdx, tx, ty, opts = {}) {
  const d = BUILDINGS[defIdx], map = sim.map, e = sim.e, [w, h] = d.size;
  let mask = C.BUILDING;
  for (const cap of d.caps || []) mask |= CAP_MASK[cap] || 0;
  const id = e.create(KIND.BUILDING, defIdx, c, tx + w / 2, ty + h / 2, mask);
  if (id < 0) return -1;
  const hard = !!opts.hardened;
  if (!opts.free) sim.pay(c, d.cost, hard ? HARDEN.cost : 1);
  e.ox[id] = tx; e.oy[id] = ty;
  e.maxhp[id] = d.hp * (hard ? 1.5 : 1);
  e.hp[id] = opts.instant ? e.maxhp[id] : e.maxhp[id] * 0.1;
  if (hard) e.flags[id] |= F.HARDENED;
  if (!opts.instant) { e.flags[id] |= F.BUILDING; e.prog[id] = 0; }
  if (mask & (C.RADAR | C.JAMMER)) e.flags[id] |= F.EMIT_ON;
  if (d.caps && d.caps.includes('emit')) e.flags[id] |= F.EMIT_ON;
  e.prio[id] = 1;
  for (let y = ty; y < ty + h; y++) for (let x = tx; x < tx + w; x++) {
    const i = y * map.W + x; map.occ[i] = id + 1;
    if (!e.res[id] && map.res[i]) {
      if (d.place === 'deposit' && DEPOSIT_RES.includes(map.res[i])) e.res[id] = map.res[i];
      if (d.place === 'oilgas' && (map.res[i] === 3 || map.res[i] === 4)) e.res[id] = map.res[i];
    }
    if (e.res[id] && e.parent[id] < 0 && sim.deposits && sim.deposits.idx[i] >= 0 && map.res[i] === e.res[id]) e.parent[id] = sim.deposits.idx[i];
  }
  // varsayılan ürün
  if (d.recipes) e.item[id] = PRODUCT.RECIPE + 0 + 1;
  else if (d.items && d.id === 'drone_fac') e.item[id] = ITEM_BY.fpv + 1;
  else if (d.items && d.id === 'missile_fac') e.item[id] = ITEM_BY.sam_s + 1;
  else if (d.items) e.item[id] = ITEM_BY[d.items[0]] + 1;
  if (d.id === 'munitions') e.item[id] = PRODUCT.RECIPE + 1 + 1; // ikmal
  if (d.id !== 'city_found') connectRoad(sim, id, !!opts.free);
  map.markDirtyArea(tx - 1, ty - 1, tx + w + 1, ty + h + 1);
  markNetDirty(sim);
  return id;
}
export function markNetDirty(sim) { const d = sim.dirty; d.power = d.comms = d.water = d.fuel = d.roads = true; }

// Binayı en yakın yol ağına bağla (gerekirse yol ve köprü inşa et)
export function connectRoad(sim, id, free) {
  const map = sim.map, e = sim.e, d = sim.bdef(id); const [w, h] = d.size; const tx = e.ox[id], ty = e.oy[id];
  if (d.id === 'bridge') return;
  // çevrede yol var mı?
  let start = -1;
  for (let y = ty - 1; y <= ty + h; y++) for (let x = tx - 1; x <= tx + w; x++) {
    if (!map.inb(x, y)) continue; const i = y * map.W + x;
    if (map.road[i] & RD.ROAD) { e.aux[id] = i; return; }
  }
  const cand = [[tx + (w >> 1), ty + h], [tx + (w >> 1), ty - 1], [tx - 1, ty + (h >> 1)], [tx + w, ty + (h >> 1)]];
  for (const [x, y] of cand) { if (map.inb(x, y)) { const i = y * map.W + x; if (map.isLand(i) && !map.occ[i]) { start = i; break; } } }
  if (start < 0) return;
  const sx = start % map.W, sy = (start / map.W) | 0;
  const target = map.nearestRoad(sx, sy, 40);
  e.aux[id] = start;
  if (target < 0) { map.road[start] |= RD.ROAD; return; }
  const p = map.astar(sx, sy, target % map.W, (target / map.W) | 0, (i) => {
    if (map.road[i] & RD.ROAD) return 0.3;
    if (map.occ[i]) return 0;
    const t = map.ter[i];
    if (t === T.DEEP || t === T.SEA || t === T.LAKE || t === T.PEAK) return 0;
    return t === T.RIVER ? 5 : t === T.MOUNTAIN ? 5 : t === T.HILL ? 2 : t === T.SWAMP ? 2.5 : t === T.FOREST ? 1.3 : 1;
  }, 30000);
  const tiles = [start, ...(p || [])];
  let n = 0;
  for (const i of tiles) {
    if (map.road[i] & RD.ROAD) continue;
    map.road[i] |= RD.ROAD; n++;
    const x = i % map.W, y = (i / map.W) | 0;
    if (map.ter[i] === T.RIVER) {
      map.road[i] |= RD.BRIDGE;
      const b = e.create(KIND.BUILDING, B.bridge, 255, x + 0.5, y + 0.5, C.BUILDING);
      e.hp[b] = e.maxhp[b] = BUILDINGS[B.bridge].hp; e.aux[b] = i; e.ox[b] = x; e.oy[b] = y;
    }
    map.markDirty(x, y);
  }
  if (!free) sim.countries[e.owner[id]].money -= n * 3;
  sim.dirty.roads = true;
}

export function updateConstruction(sim) {
  const e = sim.e;
  for (let i = 0, n = e.hi; i < n; i++) {
    if (e.kind[i] !== KIND.BUILDING || !(e.flags[i] & F.BUILDING) || (e.flags[i] & F.DEAD)) continue;
    const d = BUILDINGS[e.def[i]]; const co = sim.countries[e.owner[i]];
    const need = d.time * (e.flags[i] & F.HARDENED ? HARDEN.time : 1);
    e.prog[i] += 0.5 + 0.5 * co.workSat;
    e.hp[i] = Math.min(e.maxhp[i], e.maxhp[i] * (0.1 + 0.9 * e.prog[i] / need));
    if (e.prog[i] >= need) {
      if (d.id === 'city_found') { completeCityFounding(sim, i); continue; }
      e.flags[i] &= ~F.BUILDING; e.hp[i] = e.maxhp[i];
      markNetDirty(sim);
      sim.map.markDirty(e.ox[i], e.oy[i]);
      sim.notify(e.owner[i], 'n_built', ['b_' + d.id], e.x[i], e.y[i], 0);
      sim.emit({ k: 'built', id: i });
    }
  }
}

export function removeBuilding(sim, id) {
  const e = sim.e, map = sim.map, d = sim.bdef(id); const [w, h] = d.size;
  for (let y = e.oy[id]; y < e.oy[id] + h; y++) for (let x = e.ox[id]; x < e.ox[id] + w; x++) map.occ[y * map.W + x] = 0;
  map.markDirtyArea(e.ox[id] - 1, e.oy[id] - 1, e.ox[id] + w + 1, e.oy[id] + h + 1);
  e.kill(id); markNetDirty(sim);
}

// ---- komutlar ----
registerCommand(CMD.BUILD, (sim, c) => {
  const r = canPlace(sim, c.c, c.def, c.x, c.y, { hardened: c.hard });
  if (r) { if (!sim.countries[c.c].ai) sim.notify(c.c, r, [], -1, -1, 2); return false; }
  return placeBuilding(sim, c.c, c.def, c.x, c.y, { hardened: c.hard }) >= 0;
});
registerCommand(CMD.DEMOLISH, (sim, c) => {
  const e = sim.e; if (!e.alive(c.e) || e.owner[c.e] !== c.c || e.kind[c.e] !== KIND.BUILDING) return false;
  const d = sim.bdef(c.e); if (d.id === 'hq') return false;
  sim.countries[c.c].money += (d.cost.money || 0) * 0.3 * (e.flags[c.e] & F.RUINED ? 0 : 1);
  removeBuilding(sim, c.e);
});
registerCommand(CMD.SET_PRODUCT, (sim, c) => {
  const e = sim.e; if (!e.alive(c.e) || e.owner[c.e] !== c.c) return false;
  const d = sim.bdef(c.e); const p = c.p | 0;
  if (p === 0) { e.item[c.e] = 0; e.timer[c.e] = 0; return; }
  if (p >= PRODUCT.RECIPE) { if (!d.recipes || !d.recipes[p - PRODUCT.RECIPE - 1]) return false; }
  else if (p >= PRODUCT.UNIT) { const ri = p - PRODUCT.UNIT - 1; if (!d.units) return false; }
  else { const it = ITEMS[p - 1]; if (!it || !d.items || !d.items.includes(it.id) || !sim.techOk(c.c, it.tech)) return false; }
  if (e.item[c.e] !== p) e.timer[c.e] = 0;
  e.item[c.e] = p;
});
registerCommand(CMD.REPAIR_PRIO, (sim, c) => {
  const e = sim.e; if (!e.alive(c.e) || e.owner[c.e] !== c.c) return false;
  e.prio[c.e] = Math.max(0, Math.min(3, c.prio | 0));
});
registerCommand(CMD.TOGGLE_EMIT, (sim, c) => {
  const e = sim.e; if (!e.alive(c.e) || e.owner[c.e] !== c.c) return false;
  if (c.on) e.flags[c.e] |= F.EMIT_ON; else e.flags[c.e] &= ~F.EMIT_ON;
});
export { RECRUIT_BY };
