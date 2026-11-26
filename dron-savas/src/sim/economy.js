// Ekonomi: madenler, fabrika zincirleri, araştırma, şehirler (nüfus/moral/göç), vergi, iş gücü, onarım
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { BUILDINGS } from '../data/buildings.js';
import { ITEMS, RECRUITS, R, RAW, UNIT_BY } from '../data/defs.js';
import { TECHS, TECH_BY } from '../data/tech.js';
import { PRODUCT } from './build.js';

const MULT_KEYS = new Set(['prod', 'mine', 'repair', 'droneRange', 'droneSpeed', 'radarRange', 'convoySpeed', 'convoyCap', 'supplyRange', 'gridRange', 'entrench', 'lowDetect', 'workers', 'powerUse']);
const usable = (e, i) => !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));

export function applyTech(sim, c, ti) {
  const co = sim.countries[c]; const t = TECHS[ti];
  co.tech[ti] = 1;
  for (const [k, v] of Object.entries(t.fx || {})) {
    if (k === 'band') co.bands |= 1 << v;
    else if (MULT_KEYS.has(k)) co.mods[k] = (co.mods[k] ?? 1) * v;
    else co.mods[k] = v;
  }
}

export function updateEconomy(sim) {
  const e = sim.e, nC = sim.countries.length, tick = sim.tick;
  for (let i = 0, n = e.hi; i < n; i++) {
    if (e.kind[i] !== KIND.BUILDING || e.owner[i] >= nC || !usable(e, i)) continue;
    const bd = BUILDINGS[e.def[i]], c = e.owner[i], co = sim.countries[c];
    const eff = e.sat[i] * co.workSat * Math.max(0.3, e.hp[i] / e.maxhp[i]);
    if (bd.id === 'mine' && e.res[i]) {
      e.buf[i] = Math.min(40, e.buf[i] + bd.rate * eff * sim.mod(c, 'mine', 1));
    } else if (bd.id === 'well' && e.res[i]) {
      const amt = bd.rate * eff * sim.mod(c, 'mine', 1);
      if (e.flags[i] & F.FUELED) co.res[R[RAW[e.res[i] - 1]]] += amt; // boru hattı -> doğrudan
      else e.buf[i] = Math.min(40, e.buf[i] + amt); // konvoy bekler
    } else if (bd.caps && bd.caps.includes('research')) {
      if (co.researching >= 0) {
        co.rprog += bd.rate * eff;
        const t = TECHS[co.researching];
        if (co.rprog >= t.cost) {
          applyTech(sim, c, co.researching);
          sim.notify(c, 'n_research', ['t_' + t.id], -1, -1, 1);
          co.researching = -1; co.rprog = 0;
        }
      }
    } else if ((e.mask[i] & C.FACTORY) && e.item[i]) {
      produce(sim, i, bd, c, co, eff * sim.mod(c, 'prod', 1) * (e.flags[i] & F.CONNECTED ? 1 : 0.35));
    }
  }
  if (tick % 10 === 5) updateCities(sim);
  if (tick % 5 === 2) updateRepair(sim);
}

function produce(sim, i, bd, c, co, rate) {
  const e = sim.e, p = e.item[i];
  let cost, time, kind;
  if (p >= PRODUCT.RECIPE) { const r = bd.recipes[p - PRODUCT.RECIPE - 1]; if (!r) return; cost = r.in; time = r.t; kind = 'recipe'; }
  else if (p >= PRODUCT.UNIT) { const r = RECRUITS[p - PRODUCT.UNIT - 1]; if (!r) return; cost = r.cost; time = r.time; kind = 'unit'; if (!sim.techOk(c, r.tech)) return; }
  else { const it = ITEMS[p - 1]; cost = it.cost; time = it.time; kind = 'item'; }
  // state 0: girdiler bekleniyor, 1: üretimde
  if (e.state[i] === 0) {
    if (!sim.canAfford(c, cost)) {
      if (!(e.flags[i] & F.JAMMED)) { e.flags[i] |= F.JAMMED; } // "girdi yok" işareti (UI)
      return;
    }
    sim.pay(c, cost); e.state[i] = 1; e.timer[i] = 0; e.flags[i] &= ~F.JAMMED;
  }
  e.timer[i] += rate;
  if (e.timer[i] < time) return;
  e.state[i] = 0; e.timer[i] = 0;
  if (kind === 'recipe') { const r = bd.recipes[p - PRODUCT.RECIPE - 1]; co.res[R[r.out]] += r.n; }
  else if (kind === 'item') { const it = ITEMS[p - 1]; co.items[p - 1] += it.batch || 1; co.stats.produced++; }
  else {
    const r = RECRUITS[p - PRODUCT.UNIT - 1];
    const ux = e.ox[i] + bd.size[0] / 2, uy = e.oy[i] + bd.size[1] + 1;
    const id = sim.spawnUnit(c, UNIT_BY[r.id], ux, uy);
    if (id >= 0) { sim.notify(c, 'n_unit', ['u_' + r.id], ux, uy, 0); co.stats.produced++; }
  }
}

function updateCities(sim) {
  const e = sim.e, nC = sim.countries.length;
  const agg = sim.countries.map(() => ({ pop: 0, mor: 0, wf: 0, wd: 0, cities: [] }));
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || (e.flags[i] & F.DEAD)) continue;
    if (e.kind[i] === KIND.CITY) {
      const c = e.owner[i]; if (c >= nC) continue;
      const powered = e.flags[i] & F.POWERED ? 1 : 0, water = e.timer[i];
      e.fuel[i] *= 0.985; // bombardıman hafızası sönümü
      let target = 0.82 - (1 - powered) * 0.25 - (1 - water) * 0.22 - Math.min(0.4, e.fuel[i] * 0.02) - (1 - e.hp[i] / e.maxhp[i]) * 0.2;
      const co = sim.countries[c];
      if (sim.diplo.warCount(c) > 0) target -= 0.05;
      if (co.res[R.supply] < 5) target -= 0.05;
      e.supply[i] += (Math.max(0, target) - e.supply[i]) * 0.03;
      const info = sim.cityInfo.get(i);
      if (e.supply[i] > 0.55 && powered && e.buf[i] < info.pop0 * 2.5) e.buf[i] *= 1.0012;
      if (e.supply[i] < 0.32) { // göç
        const leave = e.buf[i] > info.pop0 * 0.3 ? e.buf[i] * 0.0012 : 0; e.buf[i] -= leave;
        agg[c].migr = (agg[c].migr || 0) + leave * 0.6;
        if (e.supply[i] < 0.2 && sim.tick % 600 === 5) sim.notify(c, 'n_migration', [info.name], e.x[i], e.y[i], 2);
      }
      e.prog[i] = Math.ceil(2 + Math.sqrt(e.buf[i]) / 22);
      agg[c].pop += e.buf[i]; agg[c].mor += e.supply[i] * e.buf[i];
      agg[c].wf += e.buf[i] * 0.42 * (0.45 + 0.55 * e.supply[i]);
      agg[c].cities.push(i);
    } else if (e.kind[i] === KIND.BUILDING && e.owner[i] < nC && usable(e, i)) {
      agg[e.owner[i]].wd += BUILDINGS[e.def[i]].workers * sim.mod(e.owner[i], 'workers', 1);
    }
  }
  for (let c = 0; c < nC; c++) {
    const co = sim.countries[c], a = agg[c];
    if (a.migr && a.cities.length > 1) { // göçmenler en iyi moralli şehre
      let best = a.cities[0]; for (const i of a.cities) if (e.supply[i] > e.supply[best]) best = i;
      if (e.supply[best] > 0.4) e.buf[best] += a.migr;
    }
    co.pop = a.pop; co.morale = a.pop ? a.mor / a.pop : 0;
    co.workforce = a.wf; co.workDemand = a.wd; co.workSat = a.wd > 0 ? Math.min(1, a.wf / a.wd) : 1;
    const tax = a.pop * 0.00013 * (0.5 + co.morale) * 10;
    co.money += tax; co.incomeLast = tax / 10;
    // ticaret anlaşmaları
    for (const tr of co.trades) {
      const other = sim.countries[tr.with];
      if (!other || !other.alive || sim.atWar(c, tr.with)) continue;
      const g = R[tr.give], gt = R[tr.get];
      if (co.res[g] >= tr.amt && other.res[gt] >= tr.amt) { co.res[g] -= tr.amt; other.res[g] += tr.amt; other.res[gt] -= tr.amt; co.res[gt] += tr.amt; }
    }
  }
}

function updateRepair(sim) {
  const e = sim.e, nC = sim.countries.length, map = sim.map;
  // mühendis konumları
  const eng = [];
  e.each(C.GROUND, (i) => { const u = sim.udef(i); if (u.repair) eng.push(i); });
  const cand = Array.from({ length: nC }, () => []);
  for (let i = 0; i < e.hi; i++) {
    if (e.kind[i] !== KIND.BUILDING || (e.flags[i] & (F.DEAD | F.BUILDING))) continue;
    if (e.hp[i] >= e.maxhp[i]) continue;
    let c = e.owner[i];
    if (c >= nC) { const ti = map.idx(e.x[i] | 0, e.y[i] | 0); c = map.owner[ti]; if (c >= nC) continue; } // köprü: toprak sahibi onarır
    cand[c].push(i);
  }
  for (let c = 0; c < nC; c++) {
    const co = sim.countries[c]; if (!co.alive) continue;
    const list = cand[c]; if (!list.length) continue;
    list.sort((a, b) => (e.prio[b] - e.prio[a]) || (e.hp[a] / e.maxhp[a] - e.hp[b] / e.maxhp[b]) || a - b);
    const slots = 3 + (co.workSat > 0.8 ? 1 : 0);
    for (let k = 0; k < Math.min(slots, list.length); k++) {
      const i = list[k]; if (e.prio[i] === 0 && e.owner[i] < nC) continue;
      let near = 0;
      for (const g of eng) if (e.owner[g] === c && e.dist2(g, i) < 36) near++;
      const isBridge = e.owner[i] >= nC;
      if (isBridge && near === 0) continue; // köprüler yalnız mühendisle onarılır
      const rate = (1.2 + near * 7) * 5 * sim.mod(c, 'repair', 1);
      const steelNeed = rate * 0.004;
      if (co.res[R.steel] < steelNeed) break;
      co.res[R.steel] -= steelNeed;
      e.hp[i] = Math.min(e.maxhp[i], e.hp[i] + rate);
      if ((e.flags[i] & F.RUINED) && e.hp[i] >= e.maxhp[i] * 0.6) {
        e.flags[i] &= ~(F.RUINED | F.BURNING);
        if (isBridge) { map.road[e.aux[i]] &= ~8; sim.dirty.roads = true; }
        sim.dirty.power = sim.dirty.comms = sim.dirty.water = sim.dirty.fuel = true;
        map.markDirty(e.ox[i], e.oy[i]);
        sim.notify(c, 'n_repaired', [isBridge ? 'b_bridge' : 'b_' + BUILDINGS[e.def[i]].id], e.x[i], e.y[i], 0);
        sim.emit({ k: 'repaired', id: i });
      }
      if (e.hp[i] > e.maxhp[i] * 0.5) e.flags[i] &= ~F.BURNING;
    }
  }
}

// Dış piyasa: parayla hammadde/ara ürün ithalatı (savaşta abluka primi)
export const MARKET_PRICE = { iron: 14, coal: 10, oil: 16, gas: 14, copper: 24, uranium: 90, rare: 60, steel: 45, fuel: 30, electronics: 70, explosives: 40, composite: 55, supply: 30 };
export function marketPrice(sim, c, res) { return MARKET_PRICE[res] * (sim.diplo.warCount(c) > 0 ? 1.5 : 1); }
registerCommand(CMD.MARKET, (sim, cmd) => {
  const co = sim.countries[cmd.c]; const r = R[cmd.res]; if (r === undefined) return false;
  const amt = Math.max(0, Math.min(500, +cmd.amt || 0)); const price = marketPrice(sim, cmd.c, cmd.res) * amt;
  if (cmd.sell) { if (co.res[r] < amt) return false; co.res[r] -= amt; co.money += price * 0.6; return; }
  if (co.money < price) return false;
  co.money -= price; co.res[r] += amt;
});

registerCommand(CMD.RESEARCH, (sim, cmd) => {
  const co = sim.countries[cmd.c]; const ti = TECH_BY[cmd.tech];
  if (ti === undefined || co.tech[ti]) return false;
  const t = TECHS[ti];
  for (const r of t.req) if (!co.tech[TECH_BY[r]]) return false;
  if (co.researching !== ti) { co.researching = ti; co.rprog = 0; }
});
