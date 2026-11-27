// Hasar: patlamalar, kalıcı kraterler, yıkım (harabe), yangın, köprü kopması, baraj taşkını
import { KIND, C, F } from '../core/ecs.js';
import { BUILDINGS, HARDEN } from '../data/buildings.js';
import { RD } from '../world/map.js';
import { igniteArea, chainReaction } from './fire.js';

const MAX_DECALS = 3000;

export function explode(sim, x, y, r, dmg, owner, opts = {}) {
  const e = sim.e, map = sim.map;
  sim.emit({ k: 'boom', x, y, r, big: dmg > 120 ? 2 : dmg > 40 ? 1 : 0, air: !!opts.air });
  if (!opts.air && dmg >= 20) igniteArea(sim, x, y, Math.max(0.8, r * 0.8), Math.min(0.9, dmg / 160));
  if (!opts.air) {
    if (map.decals.length >= MAX_DECALS) map.decals.shift();
    map.decals.push({ x, y, r: Math.min(3, r * 0.6 + 0.3), k: dmg > 100 ? 1 : 0 });
    map.markDirty(x | 0, y | 0);
  }
  const R2 = (r + 2) * (r + 2);
  sim.grid.query(x, y, r + 2.5, (i) => {
    if (!e.alive(i)) return;
    const k = e.kind[i];
    if (k === KIND.PROJ) return;
    if (k === KIND.AIR && !opts.air) { if (e.z[i] > 3) return; }
    if (opts.air && k !== KIND.AIR) return;
    if (e.owner[i] === owner && !opts.ff) return;
    let d;
    if (k === KIND.BUILDING) {
      const bd = BUILDINGS[e.def[i]]; const [w, h] = bd.size;
      const cx = Math.max(e.ox[i], Math.min(x, e.ox[i] + w)), cy = Math.max(e.oy[i], Math.min(y, e.oy[i] + h));
      d = Math.sqrt((cx - x) * (cx - x) + (cy - y) * (cy - y));
    } else if (k === KIND.CITY) return;
    else d = Math.sqrt((e.x[i] - x) * (e.x[i] - x) + (e.y[i] - y) * (e.y[i] - y));
    if (d > r) return;
    const f = 1 - (d / Math.max(r, 0.01)) * 0.6;
    applyDamage(sim, i, dmg * f, owner, opts);
  });
  // şehirler (ızgarada geniş yarıçap)
  e.each(C.CITY, (i) => {
    if (e.owner[i] === owner) return;
    const dx = e.x[i] - x, dy = e.y[i] - y; const rr = e.prog[i] + r;
    if (dx * dx + dy * dy > rr * rr) return;
    e.hp[i] = Math.max(e.maxhp[i] * 0.2, e.hp[i] - dmg * 0.15);
    let shelter = false; // sığınak: halkın moral kaybını yarıya indirir
    sim.grid.query(e.x[i], e.y[i], 10, (j) => { if (e.kind[j] === KIND.BUILDING && e.owner[j] === e.owner[i] && BUILDINGS[e.def[j]].shelter && !(e.flags[j] & (F.RUINED | F.BUILDING))) { shelter = true; return true; } });
    e.fuel[i] += (1 + dmg / 100) * (shelter ? 0.5 : 1); // bombardıman hafızası
    e.buf[i] = Math.max(200, e.buf[i] - dmg * 0.5); // yerinden edilen nüfus
  });
}

export function applyDamage(sim, i, dmg, attacker, opts = {}) {
  const e = sim.e, k = e.kind[i];
  if (!e.alive(i)) return;
  if (k === KIND.BUILDING) {
    if (e.flags[i] & F.RUINED) return;
    if (e.flags[i] & F.HARDENED) dmg *= HARDEN.dmg;
    if (BUILDINGS[e.def[i]].fort) dmg *= 0.5;
    e.hp[i] -= dmg;
    if (e.owner[i] < sim.countries.length) sim.emit({ k: 'hit', id: i, owner: e.owner[i], x: e.x[i], y: e.y[i] });
    if (e.hp[i] < e.maxhp[i] * 0.5) e.flags[i] |= F.BURNING;
    if (e.hp[i] <= 0) ruinBuilding(sim, i, attacker);
  } else if (k === KIND.CITY) {
    e.hp[i] = Math.max(e.maxhp[i] * 0.2, e.hp[i] - dmg * 0.3);
  } else {
    if (k === KIND.GROUND) dmg *= 1 - Math.min(0.6, e.entrench[i] * 0.5);
    e.hp[i] -= dmg;
    if (e.hp[i] <= 0) killUnit(sim, i, attacker, opts.cause || 'combat');
  }
}

export function killUnit(sim, i, attacker, cause) {
  const e = sim.e; if (!e.alive(i)) return;
  const c = e.owner[i];
  sim.emit({ k: 'down', x: e.x[i], y: e.y[i], kind: e.kind[i], def: e.def[i], owner: c, z: e.z[i], cause });
  if (c < sim.countries.length) {
    const co = sim.countries[c]; co.stats.losses++;
    if (e.kind[i] === KIND.AIR) { co.stats.dronesLost++; if (cause === 'jam') co.lossByJam++; else co.lossByOther++; }
  }
  if (attacker !== undefined && attacker < sim.countries.length && attacker !== c) sim.countries[attacker].stats.kills++;
  if (e.kind[i] === KIND.CONVOY && c < sim.countries.length) sim.notify(c, 'n_convoy_lost', [], e.x[i], e.y[i], 1);
  e.kill(i);
}

export function ruinBuilding(sim, i, attacker) {
  const e = sim.e, map = sim.map, bd = BUILDINGS[e.def[i]];
  e.hp[i] = 0; e.flags[i] |= F.RUINED | F.BURNING; e.flags[i] &= ~(F.POWERED | F.BUILDING);
  e.state[i] = 0; e.timer[i] = 0;
  const c = e.owner[i];
  sim.emit({ k: 'ruin', id: i, x: e.x[i], y: e.y[i], big: bd.size[0] >= 3 });
  map.markDirtyArea(e.ox[i] - 1, e.oy[i] - 1, e.ox[i] + bd.size[0] + 1, e.oy[i] + bd.size[1] + 1);
  sim.dirty.power = sim.dirty.comms = sim.dirty.water = sim.dirty.fuel = true;
  if (bd.id === 'bridge') {
    map.road[e.aux[i]] |= RD.BROKEN; sim.dirty.roads = true;
    const owner = map.owner[e.aux[i]];
    if (owner < sim.countries.length) sim.notify(owner, 'n_bridge', [], e.x[i], e.y[i], 2);
  } else if (c < sim.countries.length) {
    sim.countries[c].stats.buildingsLost++;
    sim.notify(c, 'n_destroyed', ['b_' + bd.id], e.x[i], e.y[i], bd.id === 'hq' || bd.size[0] >= 3 ? 3 : 2);
  }
  if (bd.id === 'hydro') floodFrom(sim, i);
  else if (bd.id !== 'bridge') chainReaction(sim, i);
}

// Baraj yıkılırsa nehrin aşağısı su basar
export function floodFrom(sim, i) {
  const e = sim.e, map = sim.map; const W = map.W;
  let t = map.idx(e.x[i] | 0, e.y[i] | 0);
  const base = map.height[t];
  sim.floodTiles = sim.floodTiles || [];
  const hit = new Set();
  for (let step = 0; step < 70 && t >= 0; step++) {
    const x = t % W, y = (t / W) | 0;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      if (!map.inb(x + dx, y + dy)) continue;
      const j = (y + dy) * W + x + dx;
      if (map.isWater(j)) continue;
      if (map.height[j] > base + 0.03 || dx * dx + dy * dy > 9) continue;
      if (!map.flood[j]) sim.floodTiles.push(j);
      map.flood[j] = 1400;
      if (map.occ[j]) hit.add(map.occ[j] - 1);
    }
    map.markDirtyArea(x - 3, y - 3, x + 3, y + 3);
    t = map.down[t];
  }
  for (const b of hit) if (e.alive(b) && b !== i) applyDamage(sim, b, e.maxhp[b] * 0.45, -1);
  sim.dirty.roads = true;
  const owner = e.owner[i];
  if (owner < sim.countries.length) sim.notify(owner, 'n_flood', [], e.x[i], e.y[i], 3);
  sim.emit({ k: 'flood', x: e.x[i], y: e.y[i] });
}

export function updateFlood(sim) {
  if (!sim.floodTiles || !sim.floodTiles.length || sim.tick % 10 !== 0) return;
  const map = sim.map; let changed = false;
  sim.floodTiles = sim.floodTiles.filter((j) => {
    map.flood[j] = Math.max(0, map.flood[j] - 10);
    if (map.flood[j] === 0) { map.markDirty(j % map.W, (j / map.W) | 0); changed = true; return false; }
    return true;
  });
  if (changed) sim.dirty.roads = true;
}
