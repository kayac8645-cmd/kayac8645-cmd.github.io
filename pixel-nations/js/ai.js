// AI Engine: 14 bağımsız devlet — ekonomi, diplomasi, savaş planı, hafıza tabanlı kararlar
import { clamp, dist, W } from './util.js';
import { NN, RES, NR, F, IR, CO, OI, GO, WO, ST, EL, BLD, BLD_KEYS, UNITS, TECHS, GOV } from './data.js';
import { atWar, allied, pactR, hasTrade, canPass, cityAt, logEvent } from './state.js';
import { build, buildInfo, setPolicy, startResearch, techState, setResPol } from './economy.js';
import { queueUnit, canRecruit, orderMove, orderStrike, orderHold, tileCostFor, nationPower, count, airRange, retreat } from './military.js';
import { propose, declareWar, alliesOf, warsOf, evaluate, complement, memScore, neighbors, warAdvantage, sanction, spyOp, gift, breakTreaty, canDeclare } from './diplomacy.js';
import { findPath } from './path.js';

export function initAI(S) {
  S.nations.forEach((n, i) => { n.ai = { next: 2 + i % 4, plan: { kind: 'consolidate', target: -1, until: 40 }, cool: new Array(NN).fill(0), warCool: 110 + i * 8, ops: {}, lastMil: 0 }; });
}
export function dailyAI(S) {
  for (const n of S.nations) {
    if (!n.alive || n.id === S.player) continue;
    if (S.day >= n.ai.next) { try { think(S, n); } catch (e) { console.error('AI hata', n.short, e); } n.ai.next = S.day + 2 + S.rng.int(2); }
    try { militaryAI(S, n); } catch (e) { console.error('AI askerî hata', n.short, e); }
  }
}

// ---------- değerlendirme yardımcıları
const others = (S, n) => S.nations.filter((o) => o.alive && o.id !== n.id);
const ownCities = (S, n) => S.cities.filter((c) => c.owner === n.id);
const days = (n, r) => n.stock[r] / Math.max(0.5, n.cons[r]);

function think(S, n) {
  const ai = n.ai; const cs = ownCities(S, n); if (!cs.length) return;
  const wars = warsOf(S, n.id);
  planUpdate(S, n, wars);
  economyAI(S, n, cs, wars);
  recruitAI(S, n, cs, wars);
  diplomacyAI(S, n, wars);
}

function planUpdate(S, n, wars) {
  const ai = n.ai; if (S.day < ai.plan.until && (ai.plan.kind !== 'expand' || (ai.plan.target >= 0 && S.nations[ai.plan.target].alive))) return;
  let best = null, bv = 0;
  for (const o of others(S, n)) {
    if (!neighbors(S, n.id, o.id) && S.near[n.id][o.id] > 40) continue;
    const v = warDesire(S, n, o); if (v > bv) { bv = v; best = o; }
  }
  const kinds = [['expand', bv > 55 ? n.tr.aggr + n.tr.expan : 0], ['trade', n.tr.merc + 0.2], ['tech', n.tr.tech + 0.1], ['fortify', n.tr.para + 0.1], ['industry', n.tr.indus]];
  let tot = kinds.reduce((s, k) => s + k[1], 0), r = S.rng.next() * tot, pick = 'consolidate';
  for (const k of kinds) { r -= k[1]; if (r <= 0) { pick = k[0]; break; } }
  ai.plan = { kind: pick, target: pick === 'expand' && best ? best.id : -1, until: S.day + 120 + S.rng.int(150) };
}

// ---------- ekonomi
function economyAI(S, n, cs, wars) {
  const t = n.tr, pol = n.pol, gdp = Math.max(1, n.gdpDay);
  const atWarNow = wars.length > 0;
  // vergi
  const broke = n.money < gdp * 4 || n.netEma < -gdp * 0.003 || n.debt > n.gdp * 0.6;
  const rich = n.money > gdp * 50 && n.netEma > 0;
  const tol = GOV[n.gov].corr < 0.1 ? 0.42 : 0.38;
  if (broke && n.stab > 35) { const avg = (pol.taxIncome + pol.taxCorp) / 2; if (avg < tol) { setPolicy(S, n.id, 'taxIncome', pol.taxIncome + 0.02); setPolicy(S, n.id, 'taxCorp', pol.taxCorp + 0.02); } }
  else if ((rich || n.stab < 40) && pol.taxIncome > 0.15) { setPolicy(S, n.id, 'taxIncome', pol.taxIncome - 0.015); setPolicy(S, n.id, 'taxCorp', pol.taxCorp - 0.015); }
  setPolicy(S, n.id, 'tariff', 0.04 + 0.12 * (1 - t.merc));
  // harcama bütçesi
  const up = (n.upkeep ? n.upkeep.money * n.priceLevel : 0) / gdp;
  const want = { edu: 0.02 + 0.025 * t.tech, health: 0.025 + 0.01 * t.para, infra: 0.02 + 0.02 * t.indus, science: 0.008 + 0.022 * t.tech, agri: n.sat[F] < 1 ? 0.03 : 0.006, industry: 0.006 + 0.02 * t.indus };
  let mil = Math.max(up * 1.15, 0.025 + 0.05 * t.aggr + (atWarNow ? 0.04 : 0));
  const revFrac = (n.bud.rev.income + n.bud.rev.corp + n.bud.rev.tariff) / gdp;
  let tot = mil + 0.02; for (const k in want) tot += want[k];
  const limit = revFrac * (broke ? 0.9 : 1.03);
  if (tot > limit) { const f = Math.max(0.35, (limit - mil - 0.02) / (tot - mil - 0.02)); for (const k in want) want[k] *= f; }
  for (const k in want) setPolicy(S, n.id, k, want[k]);
  setPolicy(S, n.id, 'military', mil);
  setPolicy(S, n.id, 'mobilization', clamp(0.25 + 0.35 * t.aggr + (atWarNow ? 0.4 : 0), 0.2, 0.95));
  setPolicy(S, n.id, 'immigration', n.sat[F] >= 1 && n.stab > 55 ? 0.2 : -0.3);
  // inşaat
  if (n.money > 2500 * n.priceLevel) buildAI(S, n, cs, wars);
  // araştırma
  if (!n.research) {
    const w = { agri: 0.5 + (n.sat[F] < 1.0 ? 1.5 : 0) + 0.4 * (1 - n.tr.merc), ind: 0.6 + t.indus, eco: 0.4 + t.merc, land: 0.4 + t.aggr * 1.2 + (atWarNow ? 0.8 : 0), air: 0.3 + t.aggr * 0.5 + t.tech * 0.4, navy: 0.2 + t.naval, infra: 0.4 + t.indus * 0.5, sci: 0.5 + t.tech * 1.2 };
    const av = TECHS.filter((x) => techState(n, x) === 'avail' && n.money > x.money * n.priceLevel * 1.6);
    if (av.length) { let tw = 0; const ws = av.map((x) => { const v = (w[x.area] || 0.3) / (0.6 + x.lv * 0.4) + S.rng.next() * 0.2; tw += v; return v; }); let r = S.rng.next() * tw, i = 0; for (; i < av.length - 1; i++) { r -= ws[i]; if (r <= 0) break; } startResearch(S, n.id, av[i].id); }
  }
  // kaynak politikası: savaş/askerî sıkıntı varsa demir-petrol biriktir
  for (const r of [IR, OI]) setResPol(S, n.id, r, atWarNow || t.aggr > 0.7 ? 'hoard' : 'auto');
  if (t.merc > 0.8) for (const r of [WO, ST, CO]) setResPol(S, n.id, r, 'export');
}

function buildAI(S, n, cs, wars) {
  const t = n.tr; const cand = [];
  const shortage = (r) => (days(n, r) < 14 ? 1 : 0) + (n.net[r] < 0 ? 0.5 : 0);
  for (const c of cs) {
    for (const k of BLD_KEYS) {
      const info = buildInfo(S, n, c, k); if (info.why) continue;
      if (info.cost.money > n.money * 0.45) continue;
      const lvl = c.bld[k]; let s = 0.3 - lvl * 0.2;
      switch (k) {
        case 'farm': s += (n.sat[F] < 1.02 ? 3.5 : n.net[F] < 3 ? 1.2 : -1) + (c.growth > 0 ? 0.2 : 0) + (c.pop > 500 ? 0.4 : 0); break;
        case 'power': s += n.elecF < 0.92 ? 3 : -0.5; break;
        case 'iron': s += shortage(IR) * 2 + t.aggr; break; case 'coal': s += shortage(CO) * 2 + (n.sat[CO] < 1 ? 2 : 0); break;
        case 'oil': s += shortage(OI) * 2 + 0.4; break; case 'gold': s += 0.9 + t.merc; break;
        case 'wood': s += shortage(WO) * 1.5 + 0.2; break; case 'stone': s += shortage(ST) * 1.5 + 0.2; break;
        case 'factory': s += t.indus * 2 + (n.stock[IR] > 150 && n.stock[CO] > 100 ? 1.2 : -1); break;
        case 'market': s += t.merc * 1.8; break; case 'port': s += t.naval * 1.8 + t.merc; break;
        case 'school': s += t.tech * 2 + 0.2; break; case 'hospital': s += c.pop > 300 ? 0.9 : 0.1; break;
        case 'barracks': s += t.aggr * 1.2 + (wars.length ? 1 : 0); break;
        case 'fort': s += t.para * 1.6 + (wars.length && neighborThreat(S, n, c) ? 2.5 : 0); break;
        case 'infra': s += 0.5 + t.indus * 0.6; break;
      }
      s -= info.cost.money / (n.money + 1) * 1.2;
      if (c.queue.length) s -= 1.5;
      cand.push([s + S.rng.next() * 0.3, c, k]);
    }
  }
  cand.sort((a, b) => b[0] - a[0]);
  let done = 0; const maxB = n.money > 30000 * n.priceLevel ? 3 : 2; for (const [s, c, k] of cand) { if (s < 0.4 || done >= maxB) break; if (build(S, n.id, c.id, k).ok) done++; }
}
function neighborThreat(S, n, c) { for (const a of S.armies) if (a.type !== 'air' && atWar(S, n.id, a.owner) && dist(a.tile, c.t) < 10) return true; return false; }

// ---------- ordu kurma
function recruitAI(S, n, cs, wars) {
  const t = n.tr; const threat = others(S, n).some((o) => neighbors(S, n.id, o.id) && S.dip.op[n.id][o.id] < -25 && (o.milPower || 0) > (n.milPower || 1) * 0.8);
  const desired = n.pop / 240 * (0.55 + t.aggr * 0.9) * (wars.length ? 1.6 : 1) * (threat ? 1.25 : 1);
  const have = S.armies.filter((a) => a.owner === n.id && a.type !== 'air').reduce((s, a) => s + a.hp / UNITS[a.type].hp, 0) + n.prodQueue.reduce((s, q) => s + q.cnt, 0);
  const reserve = (n.upkeep ? n.upkeep.money * n.priceLevel : 0) * 25 + 1500;
  if (have >= desired || n.money < reserve || n.prodQueue.length >= 3) return;
  const city = cs.slice().sort((a, b) => b.bld.barracks * 3 + b.pop / 200 - a.bld.barracks * 3 - b.pop / 200)[0];
  let type = 'inf'; const r = S.rng.next();
  const hasTank = n.unlock.tank, hasAir = n.unlock.air;
  const port = cs.find((c) => c.bld.port > 0);
  if (port && t.naval > 0.4 && r < t.naval * 0.2 && S.armies.filter((a) => a.owner === n.id && a.type === 'navy').length < 1 + t.naval * 4) type = 'navy';
  else if (hasAir && r < 0.14 + t.tech * 0.1 && S.armies.filter((a) => a.owner === n.id && a.type === 'air').length < 5) type = 'air';
  else if (hasTank && r < 0.4) type = 'tank'; else if (r < 0.58) type = 'art';
  const c = type === 'navy' ? port : city;
  const cnt = type === 'inf' ? 2 : 1;
  if (canRecruit(S, n, c, type, cnt)) { if (type !== 'inf' && !canRecruit(S, n, city, 'inf', 2)) queueUnit(S, n.id, city.id, 'inf', 2); return; }
  queueUnit(S, n.id, c.id, type, cnt);
}

// ---------- diplomasi
export function warDesire(S, n, o) {
  const t = n.tr, pn = n.milPower || 1, po = o.milPower || 1;
  let d = t.aggr * 30 + t.expan * 24;
  d -= memScore(S, n.id, o.id).s * 0.55;
  d += clamp((pn / po - 1) * 20, -35, 30);
  d += S.border[n.id][o.id] > 0 ? 14 : S.near[n.id][o.id] < 35 ? 3 : -50;
  d -= alliesOf(S, o.id).length * 10 - (alliesOf(S, n.id).length * 4);
  d -= GOV[n.gov].war < 1 ? 0 : 6; d -= n.weariness * 0.45;
  d += (n.ai.plan.kind === 'expand' && n.ai.plan.target === o.id) ? 18 : 0;
  d += S.dip.op[n.id][o.id] < -25 ? 8 : 0;
  d -= Math.max(0, S.dip.op[n.id][o.id]) * 0.6;
  for (let r = 0; r < NR - 1; r++) d += (n.sat[r] < 0.95 && o.stock[r] > o.cons[r] * 30) ? 2 : 0;
  d += (o.stab < 35 ? 8 : 0) - (pactR(S, n.id, o.id).trade ? 14 : 0);
  return d;
}

function diplomacyAI(S, n, wars) {
  const ai = n.ai, t = n.tr, me = n.id;
  // barış
  for (const w of wars) {
    const o = S.nations[w]; const adv = warAdvantage(S, w, me); const P = pactR(S, me, w);
    const losing = adv >= 1 || (o.milPower || 1) > (n.milPower || 1) * 1.8; const tired = n.weariness > 38 || n.stab < 32 || (S.day - P.warStart) > 400;
    if ((losing || tired) && S.day > ai.cool[w]) { const r = propose(S, me, w, 'peace'); ai.cool[w] = S.day + (r.accepted ? 0 : 20); }
  }
  for (const o of others(S, n)) {
    const b = o.id; const P = pactR(S, me, b); if (P.war) continue;
    const op = S.dip.op[me][b], cool = ai.cool[b];
    if (S.day < cool) continue;
    // savaş
    const maxWars = t.aggr > 0.75 ? 2 : 1;
    if (S.day > ai.warCool && wars.length < maxWars && !canDeclare(S, me, b) && n.stab > 35 && n.weariness < 30) {
      const d = warDesire(S, n, o); const thr = 62 - t.aggr * 6; const ratio = (n.milPower || 1) / ((o.milPower || 1) + 1);
      if (d > thr && ratio > 1.15 && (P.truce < S.day || t.loyal < 0.3) && !P.ally && (P.nap < S.day || t.loyal < 0.25) && S.rng.next() < 0.45) {
        declareWar(S, me, b, 'aggr'); ai.warCool = S.day + 120 + S.rng.int(120); ai.cool[b] = S.day + 30; continue;
      }
    }
    // ittifak
    if (!P.ally && op > 32 && (t.dipl + t.loyal) * 0.5 > 0.3 && S.rng.next() < 0.25) {
      const r = propose(S, me, b, 'alliance'); ai.cool[b] = S.day + (r.accepted ? 80 : 45); continue;
    }
    // ticaret
    if (!P.trade && op > -12 && S.day > 5) { const c = complement(S, me, b); if (c > 4 + (1 - t.merc) * 6 && S.rng.next() < 0.5) { const r = propose(S, me, b, 'trade'); ai.cool[b] = S.day + (r.accepted ? 60 : 30); continue; } }
    // saldırmazlık
    if (P.nap < S.day && !P.ally && neighbors(S, me, b) && op > -25 && ((o.milPower || 1) > (n.milPower || 1) * 1.3 || t.para > 0.6) && !(ai.plan.target === b) && S.rng.next() < 0.3) { const r = propose(S, me, b, 'nap'); ai.cool[b] = S.day + 50; continue; }
    // yaptırım
    if (op < -60 && t.merc > 0.5 && !(S.dip.sanc[me][b]) && S.rng.next() < 0.1) { sanction(S, me, b, true); continue; }
    // casusluk
    if (t.scheme > 0.5 && op < 5 && neighbors(S, me, b) && n.money > 800 * n.priceLevel && S.rng.next() < t.scheme * 0.12) { spyOp(S, me, b, S.rng.pick(['steal', 'steal', 'unrest', 'sabotage', 'intel'])); ai.cool[b] = S.day + 25; continue; }
    // dostluk hediyesi
    if (op > 5 && op < 30 && t.dipl > 0.6 && n.money > gdpStash(n) && S.rng.next() < 0.06) { gift(S, me, b, 60 * n.priceLevel); continue; }
    // ittifaklar bozulur: nefret
    if (P.ally && op < -15 && S.rng.next() < 0.15) breakTreaty(S, me, b, 'alliance', false);
    if (P.trade && op < -35 && S.rng.next() < 0.1) breakTreaty(S, me, b, 'trade', false);
  }
}
const gdpStash = (n) => Math.max(1, n.gdpDay) * 12;

// ---------- askerî AI
function enemyPowerNear(S, tile, owner, r) { let p = 0; for (const a of S.armies) if (a.owner === owner && a.type !== 'air' && dist(a.tile, tile) <= r) p += a.hp / 100 * (UNITS[a.type].atk + UNITS[a.type].def) / 2; return p; }
function myPower(S, list) { let p = 0; for (const a of list) p += a.hp / 100 * (UNITS[a.type].atk + UNITS[a.type].def) / 2; return p; }

function militaryAI(S, n) {
  const ai = n.ai; const wars = warsOf(S, n.id); const mine = S.armies.filter((a) => a.owner === n.id);
  const land = mine.filter((a) => UNITS[a.type].dom === 'land');
  const idle = land.filter((a) => !a.path.length && a.engaged < 0 && !a.routed && !a.group);
  const cs = ownCities(S, n);
  if (!cs.length) return;
  if (!wars.length) { // barış: eve dön, sınır şehirlerine dağıl
    for (const a of idle) {
      const here = S.ownerGrid[a.tile];
      if (here !== n.id && here !== -1 && !allied(S, n.id, here)) { const c = cs.sort((p, q) => dist(p.t, a.tile) - dist(q.t, a.tile))[0]; orderMove(S, a, c.t); }
      else if (S.day % 20 === n.id % 20 && a.type === 'inf') { // mevcut garnizonu dengeli dağıt
        const at = cityAt(S, a.tile); const cnt = idle.filter((x) => x.tile === a.tile).length;
        if (cnt > 2) { const c = cs[S.rng.int(cs.length)]; if (c.land === S.W.landId[a.tile]) orderMove(S, a, c.t); }
      }
    }
    for (const a of mine) { if (a.type === 'air') { a.loop = false; } if (a.type === 'navy' && !a.path.length && a.engaged < 0) { const c = S.cities[a.base]; if (c && c.owner === n.id && a.tile !== c.portTile && c.portTile >= 0) orderMove(S, a, c.portTile); } }
    ai.ops = {}; return;
  }
  if (S.day - ai.lastMil < 1) return; ai.lastMil = S.day;
  // savunma: tehdit altındaki şehirler
  for (const c of cs) {
    const enemy = S.armies.filter((e) => e.type !== 'air' && atWar(S, n.id, e.owner) && dist(e.tile, c.t) <= 7);
    if (!enemy.length) continue;
    const ep = myPower(S, enemy); const here = myPower(S, land.filter((a) => dist(a.tile, c.t) <= 1.5));
    if (here < ep * 1.1) {
      const helpers = idle.filter((a) => dist(a.tile, c.t) > 1.5 && dist(a.tile, c.t) < 26 && a.type !== 'art').sort((p, q) => dist(p.tile, c.t) - dist(q.tile, c.t)).slice(0, 5);
      for (const a of helpers) { if (orderMove(S, a, c.t).ok) a.mission = 'defend'; }
    }
  }
  // saldırı hedefi
  const free = land.filter((a) => !a.path.length && a.engaged < 0 && !a.routed && !a.group);
  for (const e of wars.slice(0, 2)) {
    let op = ai.ops[e];
    if (!op || S.cities[op.target].owner !== e || S.day > op.refresh) op = ai.ops[e] = chooseObjective(S, n, e, land, cs);
    if (!op) continue;
    const tc = S.cities[op.target], stage = S.cities[op.stage];
    const D = (tc.militia / 100 * 5 + tc.bld.fort * 2) * 1.2 + enemyPowerNear(S, tc.t, e, 5) * 1.0;
    const P = myPower(S, free.filter((a) => a.mission !== 'defend'));
    const atStage = free.filter((a) => dist(a.tile, stage.t) <= 6);
    const Pst = myPower(S, atStage);
    for (const a of free) {
      if (dist(a.tile, stage.t) > 6) { const r = orderMove(S, a, stage.t); if (r.ok) a.mission = 'rally'; }
    }
    if (Pst > D * 1.05 || (Pst > 0.6 * P && Pst > D * 0.75 && n.tr.aggr > 0.6)) {
      for (const a of atStage) { if (a.type === 'art' && atStage.length > 1 && a.hp < 100) continue; const r = orderMove(S, a, tc.t, { attack: true }); if (r.ok) a.mission = 'attack'; }
    }
    // hava harekâtı
    for (const w of mine) if (w.type === 'air' && w.state === 'base') {
      const bc = S.cities[w.base]; if (!bc) continue; let tgt = null, tv = 0;
      for (const en of S.armies) if (en.owner === e && en.type !== 'air' && dist(bc.t, en.tile) < airRange(S, w) * 0.9) { const v = en.hp * (dist(en.tile, tc.t) < 6 ? 1.5 : 1) * (S.ownerGrid[en.tile] === n.id ? 2 : 1); if (v > tv) { tv = v; tgt = en.tile; } }
      if (!tgt && dist(bc.t, tc.t) < airRange(S, w)) tgt = tc.t;
      if (tgt !== null && w.order !== 'strike') { if (orderStrike(S, w, tgt).ok) w.loop = true; }
    }
    // donanma
    for (const f of mine.filter((m) => m.type === 'navy' && m.engaged < 0 && !m.path.length)) {
      const foe = S.armies.filter((x) => x.owner === e && x.type === 'navy').sort((p, q) => dist(p.tile, f.tile) - dist(q.tile, f.tile))[0];
      if (foe && dist(foe.tile, f.tile) < 40 && myPower(S, [f]) > myPower(S, [foe]) * 0.7) orderMove(S, f, foe.tile);
      else if (S.cities[f.base] && f.tile !== S.cities[f.base].portTile && S.cities[f.base].owner === n.id) orderMove(S, f, S.cities[f.base].portTile);
    }
  }
}

function chooseObjective(S, n, e, land, cs) {
  const targets = S.cities.filter((c) => c.owner === e); if (!targets.length) return null;
  const sample = land.find((a) => a.type === 'inf') || land[0] || { owner: n.id, type: 'inf', tile: cs[0].t };
  let best = null, bs = -1e9;
  const scored = targets.map((c) => { let md = 1e9, from = null; for (const m of cs) { const d = dist(m.t, c.t); if (d < md) { md = d; from = m; } } return { c, md, from }; }).sort((a, b) => a.md - b.md).slice(0, 4);
  for (const { c, md, from } of scored) {
    let route = findPath(from.t, c.t, tileCostFor(S, { ...sample, tile: from.t }), 0.45, 9000);
    let stage = from;
    if (!route) { // amfibi: limanlı şehirden
        const port = cs.filter((m) => m.bld.port > 0 && m.portTile >= 0).sort((a, b) => dist(a.t, c.t) - dist(b.t, c.t))[0];
        if (!port || !c.coastal) continue; const r2 = findPath(port.t, c.t, tileCostFor(S, { ...sample, tile: port.t }), 0.45, 9000); if (!r2) continue; route = r2; stage = port;
    }
    const val = c.pop / 150 + (S.nations[e].capital === c.id ? 3 : 0) + (c.pot.iron + c.pot.oil + c.pot.gold) * 0.1;
    const def = c.militia / 100 + c.bld.fort * 0.8 + enemyPowerNear(S, c.t, e, 5) * 0.25;
    const sc = val / (1 + def) - route.length * 0.04;
    if (sc > bs) { bs = sc; best = { target: c.id, stage: stage.id, refresh: S.day + 8 }; }
  }
  return best;
}
