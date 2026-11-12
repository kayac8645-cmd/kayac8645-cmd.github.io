// Military Engine: birlikler, emirler, hareket, kara/deniz/hava savaşı, ikmal, üretim
import { W, H, N, clamp, dist, D8, idx } from './util.js';
import { T, TERR, UNITS, UNIT_KEYS, MATCHUP, GOV, NR, F, IR, OI, WO } from './data.js';
import { findPath } from './path.js';
import { multiSource } from './path.js';
import { atWar, canPass, cityAt, logEvent, addMem, rebuildOwner, allied } from './state.js';
import { canAfford, pay, refund, militiaMax } from './economy.js';

const uhp = (a) => UNITS[a.type].hp;
export const count = (a) => Math.max(1, Math.ceil(a.hp / uhp(a) - 0.001));
export const isWaterTile = (S, t) => S.W.terr[t] <= T.SEA;
export const embarked = (S, a) => UNITS[a.type].dom === 'land' && isWaterTile(S, a.tile);

// ---------- yardımcılar
export function newArmy(S, owner, type, cnt, tile, extra = {}) {
  const a = { id: ++S.aid, owner, type, hp: UNITS[type].hp * cnt, max: UNITS[type].hp * cnt, morale: 80, supply: 100, tile, prog: 0, path: [], order: 'idle', target: -1, group: 0, engaged: -1, entrench: 0, routed: 0, state: 'base', rest: 0, loop: false, base: -1, ...extra };
  if (type === 'air') { a.x = tile % W; a.y = (tile / W) | 0; }
  S.armies.push(a); return a;
}
export function removeArmy(S, a) { a.dead = true; S.armies = S.armies.filter((x) => !x.dead); if (a.group) fixGroup(S, a.group); }
export const armyById = (S, id) => S.armies.find((a) => a.id === id);

function unitMods(S, a) {
  const n = S.nations[a.owner], m = n.mods;
  switch (a.type) {
    case 'inf': return { atk: 1 + m.landAtk, def: 1 + m.landDef + m.landAtk * 0.3, spd: 1 + m.landSpeed };
    case 'tank': return { atk: 1 + m.landAtk + m.tankAtk, def: 1 + m.landDef + m.landAtk * 0.3, spd: 1 + m.landSpeed };
    case 'art': return { atk: 1 + m.landAtk * 0.5 + m.artAtk, def: 1 + m.landDef, spd: 1 + m.landSpeed };
    case 'air': return { atk: 1 + m.airAtk, def: 1 + m.airAtk * 0.6, spd: 1 + m.airSpeed };
    default: return { atk: 1 + m.navyAtk, def: 1 + m.navyHp * 0.6, spd: 1 + m.navySpeed };
  }
}
export function armyEff(S, a, kind, battleTerr = T.PLAINS) {
  const n = S.nations[a.owner], d = UNITS[a.type], um = unitMods(S, a);
  let v = (kind === 'atk' ? d.atk * um.atk : d.def * um.def) * GOV[n.gov].mil ** (kind === 'atk' ? 1 : 0.5) * (0.9 + 0.2 * n.idx.mil / 100);
  v *= (0.45 + 0.55 * a.morale / 100) * (0.55 + 0.45 * a.supply / 100);
  if (kind === 'atk' && a.type === 'tank') v *= battleTerr === T.FOREST ? 0.75 : battleTerr === T.HILLS ? 0.65 : battleTerr === T.MOUNTAIN ? 0.5 : battleTerr === T.SNOW ? 0.8 : battleTerr === T.DESERT ? 0.95 : 1;
  return v;
}
export function armyPower(S, a) { return (a.hp / 100) * (armyEff(S, a, 'atk') + armyEff(S, a, 'def')) / 2; }
export function nationPower(S, nid) { let p = 0; for (const a of S.armies) if (a.owner === nid) p += armyPower(S, a); return p; }
export function armySpeed(S, a) {
  const d = UNITS[a.type], um = unitMods(S, a); let s = d.speed * um.spd;
  if (embarked(S, a)) s = 0.62 * (1 + S.nations[a.owner].mods.navySpeed);
  return s * (0.5 + 0.5 * Math.min(1, a.supply / 40 + 0.2)) * (a.morale < 25 ? 0.8 : 1);
}

export function tileCostFor(S, a) {
  const own = a.owner, dom = UNITS[a.type].dom, Wd = S.W, tank = a.type === 'tank';
  return (f, t) => {
    const tt = Wd.terr[t];
    if (dom === 'sea') return tt > T.SEA ? -1 : 1;
    const tw = tt <= T.SEA, fw = Wd.terr[f] <= T.SEA;
    if (tw) {
      if (tt === T.LAKE) return -1;
      if (!fw) { const c = cityAt(S, f); if (!c || c.owner !== own || !c.bld.port || c.portTile !== t) return -1; }
      return 1.4;
    }
    if (!canPass(S, own, S.ownerGrid[t])) return -1;
    let c = TERR[tt].cost;
    if (tank) c = tt === T.FOREST ? 2.6 : tt === T.HILLS ? 3.2 : tt === T.MOUNTAIN ? 7 : tt === T.SNOW ? 2.4 : c;
    if (Wd.river[t]) c += tank ? 2 : 1;
    if (Wd.road[t]) c = tt === T.MOUNTAIN ? 1.1 : 0.5;
    return c;
  };
}

// ---------- emirler
export function orderMove(S, a, goal, opts = {}) {
  if (a.dead) return { ok: false, msg: 'Birlik yok' };
  if (a.type === 'air') return orderStrike(S, a, goal);
  const members = a.group ? S.armies.filter((x) => x.group === a.group) : [a];
  let leader = members.reduce((m, x) => (UNITS[x.type].speed < UNITS[m.type].speed ? x : m), members[0]);
  const dom = UNITS[a.type].dom;
  let g = goal;
  if (dom === 'sea' && !isWaterTile(S, g)) { // kıyıya bombardıman/rapor: komşu su karesi
    const x = g % W, y = (g / W) | 0; let best = -1, bd = 1e9;
    for (const [dx, dy] of D8) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const t = ny * W + nx; if (S.W.terr[t] <= T.SEA) { const d = dist(t, leader.tile); if (d < bd) { bd = d; best = t; } } }
    if (best < 0) return { ok: false, msg: 'Gemi bu hedefe ulaşamaz' };
    g = best; opts.bombard = goal;
  }
  const path = findPath(leader.tile, g, tileCostFor(S, leader));
  if (!path) return { ok: false, msg: 'Yol bulunamadı (sınır/deniz/arazi engeli)' };
  for (const m of members) {
    m.path = m === leader ? path : path.slice(); m.target = g; m.order = opts.defend ? 'move' : 'move'; m.engaged = -1; m.routed = 0; m.entrench = 0; m.bombard = opts.bombard ?? -1;
    if (m !== leader) { m.tile = leader.tile; m.prog = leader.prog; }
  }
  return { ok: true, msg: `Hareket: ${path.length} kare` };
}
export function orderHold(S, a) {
  const members = a.group ? S.armies.filter((x) => x.group === a.group) : [a];
  for (const m of members) { m.path = []; m.order = 'hold'; m.target = -1; m.engaged = -1; m.bombard = -1; if (m.type === 'air') m.loop = false; }
}
export function orderStrike(S, a, tile) {
  if (a.type !== 'air') return orderMove(S, a, tile);
  const bc = a.base >= 0 ? S.cities[a.base] : cityAt(S, a.tile);
  if (!bc) return { ok: false, msg: 'Hava üssü yok' };
  const range = airRange(S, a); if (dist(bc.t, tile) > range) return { ok: false, msg: `Menzil dışı (${Math.round(range)} kare)` };
  a.order = 'strike'; a.target = tile; return { ok: true, msg: 'Hava harekâtı emredildi' };
}
export const airRange = (S, a) => 30 * (1 + S.nations[a.owner].mods.airSpeed * 0.5);
export function retreat(S, a) {
  let best = null, bd = 1e9;
  for (const c of S.cities) if (c.owner === a.owner && c.land === (S.W.landId[a.tile] >= 0 ? S.W.landId[a.tile] : c.land)) { const d = dist(c.t, a.tile); if (d < bd) { bd = d; best = c; } }
  if (!best) for (const c of S.cities) if (c.owner === a.owner) { const d = dist(c.t, a.tile); if (d < bd) { bd = d; best = c; } }
  a.routed = 18; a.engaged = -1; a.path = []; a.order = 'hold';
  if (best) { const tgt = UNITS[a.type].dom === 'sea' ? (best.portTile >= 0 ? best.portTile : best.t) : best.t; const p = findPath(a.tile, tgt, tileCostFor(S, a)); if (p) { a.path = p; a.target = tgt; a.order = 'move'; } }
}
export function splitArmy(S, a) {
  const c = count(a); if (c < 2 || a.type === 'air' && c < 2) return null;
  const take = Math.floor(c / 2); const hpTake = a.hp * take / c; const maxTake = a.max * take / c;
  a.hp -= hpTake; a.max -= maxTake;
  const b = newArmy(S, a.owner, a.type, take, a.tile, { hp: hpTake, max: maxTake, morale: a.morale, supply: a.supply, state: a.state, base: a.base, x: a.x, y: a.y });
  return b;
}
export function mergeAt(S, a) {
  let n = 0;
  for (const b of S.armies.slice()) if (b !== a && !b.dead && b.owner === a.owner && b.type === a.type && b.tile === a.tile && !b.path.length && b.engaged < 0 && b.state === a.state) {
    const tot = a.hp + b.hp; a.morale = (a.morale * a.hp + b.morale * b.hp) / tot; a.supply = (a.supply * a.hp + b.supply * b.hp) / tot; a.hp = tot; a.max += b.max; b.dead = true; n++;
  }
  if (n) S.armies = S.armies.filter((x) => !x.dead);
  return n;
}
let GID = 0;
export function groupArmies(S, list) {
  const l = list.filter((a) => UNITS[a.type].dom === 'land'); if (l.length < 2) return false;
  const gid = ++S.gid; for (const a of l) { a.group = gid; }
  const lead = l.reduce((m, x) => (UNITS[x.type].speed < UNITS[m.type].speed ? x : m), l[0]);
  for (const a of l) { a.gl = lead.id; a.tile = lead.tile; a.prog = lead.prog; a.path = lead.path.slice(); a.order = lead.order; a.target = lead.target; }
  return true;
}
export function ungroup(S, a) { const g = a.group; if (!g) return; for (const x of S.armies) if (x.group === g) x.group = 0; }
function fixGroup(S, g) { const m = S.armies.filter((x) => x.group === g); if (m.length < 2) for (const x of m) x.group = 0; }
export function disband(S, a) { const n = S.nations[a.owner]; n.manpower += UNITS[a.type].mp * a.hp / uhp(a) * 0.5; removeArmy(S, a); }

// ---------- üretim
export function unitCost(S, n, type, cnt) { const d = UNITS[type], c = {}; for (const r in d.cost) c[r] = Math.ceil(d.cost[r] * cnt * (r === 'money' ? n.priceLevel : 1)); return c; }
export function canRecruit(S, n, city, type, cnt) {
  const d = UNITS[type];
  if (city.owner !== n.id) return 'Şehir sizin değil';
  if (d.req && !n.unlock[type] && !n.techs[d.req]) return 'Teknoloji gerekli';
  if (d.needsPort && !(city.bld.port > 0)) return 'Liman gerekli';
  if (city.occ > 0) return 'Şehir karışık (işgal sonrası)';
  const mp = d.mp * cnt; if (n.manpower < mp) return `İnsan gücü yetersiz (${mp.toFixed(0)})`;
  if (!canAfford(n, unitCost(S, n, type, cnt))) return 'Kaynak/para yetersiz';
  if (n.prodQueue.length >= 12) return 'Üretim kuyruğu dolu';
  return null;
}
export function queueUnit(S, nid, cityId, type, cnt = 1) {
  const n = S.nations[nid], city = S.cities[cityId]; const why = canRecruit(S, n, city, type, cnt); if (why) return { ok: false, msg: why };
  const cost = unitCost(S, n, type, cnt); pay(n, cost); n.manpower -= UNITS[type].mp * cnt;
  const speed = 1 - Math.min(0.45, (n.factories || 0) * 0.035 + city.bld.barracks * 0.04);
  const hrs = Math.ceil(UNITS[type].time * Math.pow(cnt, 0.75) * speed);
  n.prodQueue.push({ id: ++S.pid, type, cnt, city: cityId, left: hrs, total: hrs, cost });
  return { ok: true, msg: `${UNITS[type].name} x${cnt} üretim kuyruğuna alındı` };
}
export function cancelProd(S, nid, qid) { const n = S.nations[nid]; const i = n.prodQueue.findIndex((q) => q.id === qid); if (i < 0) return; const q = n.prodQueue[i]; refund(n, q.cost, 0.7); n.manpower += UNITS[q.type].mp * q.cnt; n.prodQueue.splice(i, 1); }
export function spawnUnit(S, nid, type, cnt, city) {
  const dom = UNITS[type].dom; const tile = dom === 'sea' ? (city.portTile >= 0 ? city.portTile : city.t) : city.t;
  const ex = S.armies.find((a) => a.owner === nid && a.type === type && a.tile === tile && !a.path.length && a.engaged < 0 && a.state === 'base' && !a.group);
  if (ex) { ex.hp += UNITS[type].hp * cnt; ex.max += UNITS[type].hp * cnt; return ex; }
  return newArmy(S, nid, type, cnt, tile, { base: dom === 'air' || dom === 'sea' ? city.id : -1, order: 'hold' });
}
function productionHour(S) {
  for (const n of S.nations) {
    if (!n.alive || !n.prodQueue.length) continue;
    const slots = 1 + Math.floor((n.factories || 0) / 3);
    let used = 0;
    for (const q of n.prodQueue) { if (used >= slots) break; used++; q.left--; }
    for (const q of n.prodQueue.slice()) if (q.left <= 0) {
      n.prodQueue.splice(n.prodQueue.indexOf(q), 1); const city = S.cities[q.city];
      if (city.owner !== n.id) { refund(n, q.cost, 0.5); continue; }
      spawnUnit(S, n.id, q.type, q.cnt, city); if (n.id === S.player) logEvent(S, n.id, `${UNITS[q.type].name} x${q.cnt} hazır — ${city.name}`, 1, { tag: 'mil' });
    }
  }
}

// ---------- başlangıç ordusu
export function initMilitary(S, rng) {
  for (const n of S.nations) {
    const cs = S.cities.filter((c) => c.owner === n.id); const cap = S.cities[n.capital];
    const inf = Math.round((n.tr.aggr * 5 + 4) * (0.8 + rng.next() * 0.4));
    for (const c of cs) { const k = c === cap ? Math.ceil(inf * 0.4) : Math.max(1, Math.round(inf * 0.6 / Math.max(1, cs.length - 1))); newArmy(S, n.id, 'inf', k, c.t, { order: 'hold' }); }
    newArmy(S, n.id, 'art', 1 + (n.tr.aggr > 0.5 ? 1 : 0), cap.t, { order: 'hold' });
    for (const c of cs) if (c.bld.port && (c === cap || rng.chance(0.4 + n.tr.naval * 0.4))) { newArmy(S, n.id, 'navy', 1 + (n.tr.naval > 0.7 ? 1 : 0), c.portTile, { base: c.id, order: 'hold' }); }
    n.manpower = n.manpowerMax = n.pop * 0.05;
  }
}

// ---------- ikmal haritası
export function rebuildSupply(S) {
  const own = new Int16Array(N);
  for (const n of S.nations) {
    if (!n.alive) continue;
    let grid = S.supply[n.id]; if (!grid) grid = S.supply[n.id] = new Float32Array(N);
    const src = S.cities.filter((c) => c.owner === n.id).map((c) => [c.t, 1]);
    if (!src.length) { grid.fill(1e9); continue; }
    const og = S.ownerGrid;
    multiSource(src, (nb) => { const tt = S.W.terr[nb]; if (tt <= T.LAKE) return -1; const base = S.W.road[nb] ? 0.4 : TERR[tt].cost * 0.75; return base * (og[nb] === n.id || og[nb] < 0 || allied(S, n.id, og[nb]) ? 1 : 1.8); }, own, grid);
  }
  S.supplyVer = S.ownerVer;
}
export const supplyRange = (n) => 11 + n.mods.supply + n.idx.infra / 20;

// ---------- saatlik döngü
const KDMG = 0.06;
export function hourlyMilitary(S) {
  const occ = new Map();
  for (const a of S.armies) { if (a.type === 'air' && a.state === 'base') continue; const l = occ.get(a.tile); if (l) l.push(a); else occ.set(a.tile, [a]); }
  S.occ = occ;
  productionHour(S);
  // hareket
  for (const a of S.armies) {
    if (a.dead || a.type === 'air') continue;
    if (a.group && a.gl && a.gl !== a.id) continue; // takipçiler lider ile gider
    moveArmy(S, a, occ);
  }
  syncGroups(S);
  // savaşlar
  resolveBattles(S, occ);
  siegeHour(S);
  // hava
  for (const a of S.armies) if (a.type === 'air' && !a.dead) airHour(S, a);
  // ikmal/moral/şifa
  if (S.supplyVer !== S.ownerVer || S.t % 72 === 0) rebuildSupply(S);
  for (const a of S.armies) { if (!a.dead) upkeepHour(S, a); }
  S.armies = S.armies.filter((x) => !x.dead);
  // grup liderleri
  const seen = new Set();
  for (const a of S.armies) { if (!a.group) { a.gl = 0; continue; } if (!seen.has(a.group)) { seen.add(a.group); const m = S.armies.filter((x) => x.group === a.group); const lead = m.reduce((q, x) => (UNITS[x.type].speed < UNITS[q.type].speed ? x : q), m[0]); for (const x of m) x.gl = lead.id; } }
}

function syncGroups(S) {
  for (const a of S.armies) if (a.group && a.gl && a.gl !== a.id) { const l = armyById(S, a.gl); if (l) { a.tile = l.tile; a.prog = l.prog; a.path = l.path.slice(); a.target = l.target; a.order = l.order; a.engaged = l.engaged; a.routed = l.routed; } }
}

function hostileAt(S, a, tile, occ) {
  const out = [];
  const l = occ.get(tile);
  if (l) for (const b of l) if (b.owner !== a.owner && atWar(S, a.owner, b.owner) && b.type !== 'air') out.push(b);
  return out;
}
function enemyCityAt(S, a, tile) { const c = cityAt(S, tile); return c && c.owner !== a.owner && atWar(S, a.owner, c.owner) ? c : null; }

function moveArmy(S, a, occ) {
  const d = UNITS[a.type];
  if (a.routed > 0) a.routed--;
  if (a.engaged >= 0) return;
  if (a.path.length) {
    const next = a.path[0];
    const hostile = hostileAt(S, a, next, occ);
    const ec = d.dom === 'land' ? enemyCityAt(S, a, next) : null;
    if (hostile.length || (ec && (ec.militia > 2))) { a.engaged = next; a.prog = Math.min(a.prog, 0.5); return; }
    const cost = tileCostFor(S, a)(a.tile, next);
    if (cost < 0) { // yol kapandı (sınır değişti)
      const g = a.target; a.path = []; if (g >= 0 && g !== a.tile) { const p = findPath(a.tile, g, tileCostFor(S, a)); if (p) a.path = p; else a.order = 'hold'; } return;
    }
    const diag = (next % W !== a.tile % W) && (((next / W) | 0) !== ((a.tile / W) | 0));
    a.prog += armySpeed(S, a) / (cost * (diag ? 1.414 : 1));
    a.entrench = 0;
    if (a.prog >= 1) {
      a.prog = 0; moveInto(S, a, next);
    }
  } else {
    a.prog = 0; a.entrench = Math.min(100, a.entrench + 2);
    if (a.bombard >= 0 && d.dom === 'sea') { const h = hostileAt(S, a, a.bombard, occ); if (h.length && dist(a.tile, a.bombard) < 1.6) a.engaged = a.bombard; else a.bombard = -1; }
    if (a.order === 'move') a.order = 'hold';
  }
}
function moveInto(S, a, tile) {
  const from = a.tile; a.tile = tile; a.path.shift();
  if (UNITS[a.type].dom === 'land') {
  }
  if (!S.occ.has(tile)) S.occ.set(tile, [a]); else S.occ.get(tile).push(a);
}

// ---------- savaş çözümü
function pseudoMilitia(c) { return { isMilitia: true, city: c, owner: c.owner, type: 'inf', hp: c.militia, morale: 85, supply: 100, entrench: 30, id: -c.id - 1 }; }
function shareOf(list) { const t = list.reduce((s, x) => s + x.hp, 0) || 1; const m = {}; for (const x of list) m[x.type] = (m[x.type] || 0) + x.hp / t; return m; }
function sideStats(S, list, enemyShare, terr, isDef, defMult) {
  let atk = 0, def = 0;
  for (const a of list) {
    const s = a.hp / 100; let mu = 0; for (const k in enemyShare) mu += enemyShare[k] * MATCHUP[a.type][k];
    const ea = a.isMilitia ? 6 * (0.45 + 0.55 * a.morale / 100) : armyEff(S, a, 'atk', terr);
    const ed = a.isMilitia ? 10 * (0.45 + 0.55 * a.morale / 100) : armyEff(S, a, 'def', terr);
    atk += s * ea * mu; def += s * ed * (isDef ? defMult * (1 + Math.min(0.25, (a.entrench || 0) / 100 * 0.25)) : 1);
  }
  return { atk, def };
}
function airBonus(S, nid, tile) {
  let b = 0; const n = S.nations[nid];
  for (const w of S.armies) if (w.owner === nid && w.type === 'air' && w.state === 'base' && w.hp > 30) { const bc = S.cities[w.base]; if (!bc) continue; const d = dist(bc.t, tile); if (d <= airRange(S, w) * 0.65) b += (w.hp / 100) * 0.05 * (1 + n.mods.airGround) * (w.supply > 20 ? 1 : 0.3); }
  return Math.min(0.5, b);
}
function resolveBattles(S, occ) {
  const byTile = new Map();
  for (const a of S.armies) if (a.engaged >= 0 && !a.dead) { const l = byTile.get(a.engaged); if (l) l.push(a); else byTile.set(a.engaged, [a]); }
  S.battles = [];
  for (const [tile, atkers0] of byTile) {
    const atkers = atkers0.filter((a) => !a.dead);
    if (!atkers.length) continue;
    const aNat = atkers[0].owner;
    let defs = [...(occ.get(tile) || []).filter((b) => !b.dead && b.type !== 'air' && atWar(S, aNat, b.owner))];
    const city = cityAt(S, tile); let mil = null;
    if (city && city.owner !== aNat && atWar(S, aNat, city.owner) && city.militia > 0.5) { mil = pseudoMilitia(city); defs.push(mil); }
    if (!defs.length) { for (const a of atkers) a.engaged = -1; continue; }
    const tTerr = S.W.terr[tile];
    let dm = TERR[tTerr].def * (S.W.river[tile] ? 1.12 : 1) * (city ? 1.15 + city.bld.fort * 0.3 : 1);
    if (tTerr <= T.SEA) dm = 1;
    const amph = atkers.some((a) => isWaterTile(S, a.tile) && !isWaterTile(S, tile) && UNITS[a.type].dom === 'land') ? 0.55 : 1;
    const aSh = shareOf(atkers), dSh = shareOf(defs);
    const A = sideStats(S, atkers, dSh, tTerr, false, 1), D = sideStats(S, defs, aSh, tTerr, true, dm);
    const aBon = 1 + airBonus(S, aNat, tile) * 1 - airBonus(S, defs[0].owner, tile) * 0.5, dBon = 1 + airBonus(S, defs[0].owner, tile) - airBonus(S, aNat, tile) * 0.5;
    const rA = 0.85 + S.rng.next() * 0.3, rD = 0.85 + S.rng.next() * 0.3;
    const atkP = A.atk * Math.max(0.3, aBon) * amph, dAtkP = D.atk * Math.max(0.3, dBon);
    const dmgToD = KDMG * atkP * (2 * atkP / (atkP + D.def + 1e-6)) * rA;
    const dmgToA = KDMG * dAtkP * (2 * dAtkP / (dAtkP + A.def + 1e-6)) * rD;
    applyDamage(S, defs, dmgToD, atkers[0].owner, tile, true);
    applyDamage(S, atkers, dmgToA, defs[0].owner, tile, false);
    const dn = defs[0].owner;
    S.battles.push({ tile, a: aNat, d: dn, ahp: atkers.reduce((s, x) => s + x.hp, 0), dhp: defs.reduce((s, x) => s + x.hp, 0) });
    if (S.t - (S.battleLog[tile + '_' + aNat] || -999) > 200) { S.battleLog[tile + '_' + aNat] = S.t; const where = city ? city.name : 'cephe'; logEvent(S, aNat, `${S.nations[aNat].short} ↔ ${S.nations[dn].short}: ${where} civarında çatışma`, 2, { tag: 'war', inv: [aNat, dn] }); }
    S.fx.push({ k: 'hit', tile, t: S.t, n: S.fxSeq++ }); if (S.fx.length > 160) S.fx.splice(0, 40);
    if (mil) city.militia = Math.max(0, mil.hp);
    for (const a of atkers) if (!a.dead) { a.supply = Math.max(0, a.supply - 0.4); }
    // sonuç
    const alive = defs.filter((x) => !x.isMilitia && !x.dead).length, mAlive = mil ? mil.hp > 0.5 : false;
    if (!alive && !mAlive) {
      for (const a of atkers) if (!a.dead) a.engaged = -1;
    }
    for (const a of atkers) if (!a.dead && a.morale < 18 && !a.routed) retreat(S, a);
    for (const b of defs) if (!b.isMilitia && !b.dead && b.morale < 14) retreat(S, b);
  }
  S.armies = S.armies.filter((x) => !x.dead);
  for (const a of S.armies) if (a.engaged >= 0 && !byTile.has(a.engaged)) a.engaged = -1;
}
function applyDamage(S, list, dmg, byNat, tile, isDef) {
  const tot = list.reduce((s, x) => s + x.hp, 0) || 1;
  for (const x of list) {
    const share = x.hp / tot; let d = Math.min(x.hp, dmg * share);
    if (!x.isMilitia) {
      x.hp -= d; const frac = d / Math.max(x.max, 1);
      x.morale = clamp(x.morale - frac * 180 - 0.25 + (isDef ? 0 : 0), 0, 100);
      const lost = d / uhp(x); const nn = S.nations[x.owner]; nn.casualties += lost * UNITS[x.type].mp; S.nations[byNat].kills += lost;
      nn.weariness = Math.min(100, nn.weariness + lost * 0.12);
      if (x.hp <= 1) { x.dead = true; if (x.group) fixGroup(S, x.group); if (x.owner === S.player || byNat === S.player) logEvent(S, x.owner, `${S.nations[x.owner].short} ${UNITS[x.type].name} birliği yok edildi (${S.nations[byNat].short})`, x.owner === S.player ? 3 : 1, { tag: 'war', inv: [byNat] }); }
    } else { x.hp -= d; }
  }
}

// ---------- kuşatma/işgal: savunmasız şehirde 16 saat kalan düşman şehri ele geçirir
function siegeHour(S) {
  for (const c of S.cities) {
    const here = S.occ.get(c.t) || [];
    const foes = here.filter((a) => !a.dead && a.owner !== c.owner && UNITS[a.type].dom === 'land' && atWar(S, a.owner, c.owner) && !isWaterTile(S, a.tile));
    const defs = here.filter((a) => !a.dead && a.owner === c.owner && a.type !== 'air');
    if (foes.length && !defs.length && c.militia <= 2) {
      c.siege = (c.siege || 0) + 1;
      if (c.siege >= 16) { c.siege = 0; const best = foes.reduce((q, x) => (x.hp > q.hp ? x : q), foes[0]); captureCity(S, c, best.owner); }
    } else if (c.siege) c.siege = Math.max(0, c.siege - 2);
  }
}

// ---------- hava operasyonları
function airHour(S, a) {
  const n = S.nations[a.owner]; const bc = a.base >= 0 ? S.cities[a.base] : null;
  if (!bc || bc.owner !== a.owner) { // üs kaybedildi: en yakın şehre
    const near = S.cities.filter((c) => c.owner === a.owner).sort((p, q) => dist(p.t, a.tile) - dist(q.t, a.tile))[0];
    if (!near) { a.dead = true; return; } a.base = near.id; return;
  }
  if (a.rest > 0) a.rest--;
  if (a.state === 'base') {
    a.x = bc.x; a.y = bc.y; a.tile = bc.t; a.hp = Math.min(a.max, a.hp + a.max * 0.012);
    a.morale = Math.min(100, a.morale + 1.5);
    if (a.order === 'strike' && a.target >= 0 && a.rest <= 0 && a.hp > a.max * 0.4 && n.stock[OI] > 3) {
      n.stock[OI] -= 0.5 * (a.hp / 80); a.state = 'out';
    }
  } else if (a.state === 'out') {
    const tx = a.target % W, ty = (a.target / W) | 0, dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), sp = UNITS.air.speed * (1 + n.mods.airSpeed);
    if (d <= sp) { a.x = tx; a.y = ty; airStrike(S, a); a.state = 'back'; } else { a.x += dx / d * sp; a.y += dy / d * sp; }
  } else {
    const dx = bc.x - a.x, dy = bc.y - a.y, d = Math.hypot(dx, dy), sp = UNITS.air.speed * (1 + n.mods.airSpeed);
    if (d <= sp) { a.x = bc.x; a.y = bc.y; a.state = 'base'; a.rest = 10; if (!a.loop) { a.order = 'hold'; a.target = -1; } } else { a.x += dx / d * sp; a.y += dy / d * sp; }
  }
  a.tile = Math.round(a.y) * W + Math.round(a.x);
}
function airStrike(S, a) {
  const tile = a.target, n = S.nations[a.owner]; a.supply = 100;
  const ground = (S.occ.get(tile) || []).filter((b) => b.type !== 'air' && atWar(S, a.owner, b.owner));
  const c = cityAt(S, tile); const ecity = c && atWar(S, a.owner, c.owner) ? c : null;
  if (!ground.length && !ecity) { a.order = a.loop ? 'strike' : 'hold'; return; }
  const foe = ground.length ? ground[0].owner : ecity.owner;
  // önleme
  for (const w of S.armies) if (w.type === 'air' && w.owner === foe && w.state === 'base' && w.hp > w.max * 0.3) {
    const bc = S.cities[w.base]; if (!bc || dist(bc.t, tile) > airRange(S, w) * 0.7) continue;
    const pa = (a.hp / 100) * armyEff(S, a, 'atk') * 0.5, pw = (w.hp / 100) * armyEff(S, w, 'def') * 0.5 * (1 + 0.15);
    const da = Math.min(a.hp, KDMG * 6 * pw * (2 * pw / (pw + pa + 1e-6)) * (0.8 + S.rng.next() * 0.4)), dw = Math.min(w.hp, KDMG * 6 * pa * (2 * pa / (pa + pw + 1e-6)) * (0.8 + S.rng.next() * 0.4));
    a.hp -= da; w.hp -= dw; n.casualties += da / 80 * 2; S.nations[foe].casualties += dw / 80 * 2;
    S.fx.push({ k: 'air', tile, t: S.t, n: S.fxSeq++ });
    if (w.hp <= 1) w.dead = true;
    if (a.hp <= 1) { a.dead = true; return; }
    if (a.hp < a.max * 0.35) { return; }
    break;
  }
  const mu = (type) => MATCHUP.air[type];
  let power = (a.hp / 100) * armyEff(S, a, 'atk') * (1 + n.mods.airGround) * 0.18;
  for (const b of ground) { const d = Math.min(b.hp, power / Math.max(1, ground.length) * mu(b.type) * (0.7 + S.rng.next() * 0.6)); b.hp -= d; b.morale = clamp(b.morale - d / b.max * 120, 0, 100); S.nations[b.owner].casualties += d / uhp(b) * UNITS[b.type].mp; n.kills += d / uhp(b); if (b.hp <= 1) { b.dead = true; logEvent(S, b.owner, `${UNITS[b.type].name} hava saldırısında yok edildi`, b.owner === S.player ? 3 : 0, { tag: 'war', inv: [a.owner] }); } }
  if (ecity) { ecity.militia = Math.max(0, ecity.militia - power * 1.2); if (S.rng.next() < 0.05 && ecity.dmg < 0.4) ecity.dmg += 0.02; }
  // uçaksavar
  if (ecity) a.hp -= Math.min(a.hp - 1, 1 + ecity.bld.fort * 1.2 + (ecity.pop > 600 ? 1 : 0));
  S.fx.push({ k: 'bomb', tile, t: S.t, n: S.fxSeq++ }); if (S.fx.length > 160) S.fx.splice(0, 40);
  if (ground.length) S.armies = S.armies.filter((x) => !x.dead);
}

// ---------- ikmal, moral, şifa (saatlik)
function upkeepHour(S, a) {
  const n = S.nations[a.owner]; const d = UNITS[a.type];
  if (a.type === 'air') { a.supply = 100; return; }
  const c = cityAt(S, a.tile); const here = !!(c && c.owner === a.owner);
  const grid = S.supply[a.owner]; let inRange;
  if (d.dom === 'sea') { inRange = false; for (const k of S.cities) if (k.owner === a.owner && k.portTile >= 0 && dist(k.portTile, a.tile) < 26) { inRange = true; break; } }
  else if (embarked(S, a)) inRange = false;
  else inRange = grid && grid[a.tile] <= supplyRange(n);
  const foodOk = n.sat[F] > 0.6 && (d.up.oil ? n.sat[OI] > 0.4 : true);
  if (inRange && foodOk) a.supply = Math.min(100, a.supply + 3); else a.supply = Math.max(0, a.supply - (inRange ? 0.6 : 0.5) - (a.supply <= 0 ? 0.3 : 0));
  if (a.supply <= 0) { const d0 = a.hp * 0.004; a.hp -= d0; if (a.hp <= 1) { a.dead = true; return; } }
  if (a.engaged < 0) a.morale = Math.min(100, a.morale + (inRange ? 0.5 : 0.1) + n.idx.mil / 400 - n.weariness / 400);
  else a.morale = Math.min(100, a.morale + 0.02);
  if (a.engaged < 0 && a.hp < a.max && (here || (d.dom === 'sea' && c)) && n.manpower > 0 && a.supply > 40) {
    const heal = Math.min(a.max - a.hp, a.max * 0.007); a.hp += heal; n.manpower -= heal / uhp(a) * d.mp * 0.2;
  }
  if (d.dom === 'sea' && a.engaged < 0 && c && c.owner === a.owner) a.hp = Math.min(a.max, a.hp + a.max * 0.01);
}

// ---------- şehir ele geçirme / devlet yok olması
export function captureCity(S, c, by) {
  const old = c.owner; if (old === by) return;
  const o = S.nations[old], nb = S.nations[by];
  const wasCap = o.capital === c.id;
  c.owner = by; c.pop *= 0.92; c.occ = 100; c.militia = militiaMax(c) * 0.15; c.queue = []; c.dmg = Math.min(0.5, c.dmg + 0.15);
  for (const k of Object.keys(c.bld)) if (k !== 'port' && S.rng.next() < 0.15 && c.bld[k] > 0) c.bld[k]--;
  rebuildOwner(S); S.visDirty = true; S.ownerDirty = true;
  addMem(S, old, by, 'city_lost'); o.weariness += 6; nb.weariness = Math.max(0, nb.weariness - 2);
  S.warScore[by + '_' + old] = (S.warScore[by + '_' + old] || 0) + 1;
  logEvent(S, by, `${nb.short}, ${c.name} şehrini ${o.short} devletinden ele geçirdi!`, by === S.player ? 1 : old === S.player ? 3 : 2, { tag: 'capture', inv: [old, by], global: true });
  S.fx.push({ k: 'capture', tile: c.t, t: S.t, n: S.fxSeq++ });
  for (const a of S.armies) if (a.owner === old && a.tile === c.t && a.type !== 'air') a.dead = true;
  for (const a of S.armies) if (a.type === 'air' && a.base === c.id && a.owner === old) a.base = -1;
  S.armies = S.armies.filter((x) => !x.dead);
  if (wasCap) { const rest = S.cities.filter((k) => k.owner === old).sort((p, q) => q.pop - p.pop)[0]; if (rest) { o.capital = rest.id; o.stab = Math.max(0, o.stab - 12); logEvent(S, old, `${o.short} başkenti ${rest.name} şehrine taşındı`, old === S.player ? 3 : 0, { tag: 'war' }); } }
  if (!S.cities.some((k) => k.owner === old)) eliminateNation(S, old, by);
}
export function eliminateNation(S, nid, by) {
  const n = S.nations[nid]; n.alive = false;
  S.armies = S.armies.filter((a) => a.owner !== nid);
  for (let o = 0; o < S.nations.length; o++) if (o !== nid) { const p = S.dip.pacts; for (const k in p) { /* anlaşmalar zamanla geçersiz */ } }
  for (const k in S.dip.pacts) { const [a, b] = [Math.floor(k / 32), k % 32]; if (a === nid || b === nid) delete S.dip.pacts[k]; }
  logEvent(S, nid, `${n.name} tarihe karıştı!`, 3, { tag: 'war', global: true, inv: [by] });
  if (nid === S.player) S.gameOver = 'lost';
}
