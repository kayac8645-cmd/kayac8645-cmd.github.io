// Economy Engine + Population Engine + Tech: üretim, tüketim, fiyat, ticaret, bütçe, borç, enflasyon, nüfus
import { clamp, fmt, dateStr } from './util.js';
import { RES, NR, F, IR, CO, OI, GO, WO, ST, EL, BLD, BLD_KEYS, EXTRACT, POT_SCALE, GOV, UNITS, TECHS, TECH_BY, POLICY_DEFAULT } from './data.js';
import { hasTrade, logEvent, atWar } from './state.js';

export const popTier = (pop) => (pop < 150 ? 1 : pop < 400 ? 2 : pop < 900 ? 3 : 4);
export const richness = (c, key) => { const b = BLD[key]; if (!b.pot) return 1; return clamp(0.45 + c.pot[b.pot] / POT_SCALE[b.pot], 0.45, 2.4); };
export const bldCap = (n) => clamp(3 + n.mods.bldCap, 3, 5);
export const cityHydro = (c, W) => c.hydro;

export function computeMods(n) {
  const m = { food: 0, iron: 0, coal: 0, oil: 0, gold: 0, wood: 0, stone: 0, power: 0, mine: 0, factory: 0, tax: 0, trade: 0, infl: 0, landAtk: 0, landDef: 0, tankAtk: 0, artAtk: 0, airAtk: 0, airGround: 0, airSpeed: 0, navyAtk: 0, navyHp: 0, navySpeed: 0, landSpeed: 0, supply: 0, bldCap: 0, rp: 0, spy: 0, infra: 0, eco: 0, popCap: 0 };
  n.unlock = { inf: true, art: true, navy: true };
  for (const id in n.techs) { const t = TECH_BY[id]; if (!t) continue; for (const k in t.fx) { if (k === 'unlock') n.unlock[t.fx[k]] = true; else m[k] += t.fx[k]; } }
  n.mods = m;
}

// ---------- başlangıç
export function initNationEconomy(S, n) {
  n.pol = { ...POLICY_DEFAULT };
  const g = GOV[n.gov];
  if (g.mil > 1.15) n.pol.military = 0.06; if (n.tr.aggr < 0.25) n.pol.military = 0.03; if (n.tr.tech > 0.7) n.pol.science = 0.02; if (n.tr.indus > 0.8) n.pol.industry = 0.025;
  n.money = 1500; n.debt = 0; n.priceLevel = 1; n.inflation = 0.02; n.growth = 0.02;
  n.stock = new Array(NR).fill(0); n.prod = new Array(NR).fill(0); n.cons = new Array(NR).fill(0); n.sat = new Array(NR).fill(1);
  n.net = new Array(NR).fill(0);
  n.resPol = new Array(NR).fill('auto');
  n.idx = { edu: 55, health: 55, infra: 50, mil: 50 };
  n.stab = 62; n.weariness = 0; n.rep = 55; n.elecF = 1; n.lf = 1; n.unemp = 0.05;
  n.techs = { }; n.research = null; n.rp = 3; n.rpBank = 0; computeMods(n);
  n.gdp = 0; n.gdpDay = 0; n.bud = { rev: { income: 0, corp: 0, tariff: 0, sales: 0 }, exp: { edu: 0, health: 0, infra: 0, subs: 0, sci: 0, mil: 0, admin: 0, interest: 0, other: 0 } };
  n.trade = { imp: new Array(NR).fill(0), exp: new Array(NR).fill(0), impVal: 0, expVal: 0 };
  n.hist = { gdp: [], pop: [], money: [], army: [], stab: [], infl: [], growth: [], debt: [] };
  n.pop = 0; n.manpower = 0; n.manpowerMax = 0; n.prodQueue = []; n.milPower = 0; n.casualties = 0; n.kills = 0;
  n.sciStolen = 0; n.cIntel = 0; n.modsTemp = [];
}

export function initCityEconomy(S, c, rng, isCap) {
  const t = c.tiles;
  const fr = clamp(0.45 + c.pot.food / 20, 0.45, 2.4);
  c.pop = clamp(70 + t * 5.2 * (0.4 + fr * 0.5) * rng.range(0.7, 1.3), 120, 1500) * (isCap ? 1.6 : 1);
  c.bld = {}; for (const k of BLD_KEYS) c.bld[k] = 0;
  c.queue = []; c.dmg = 0; c.occ = 0; c.lf = 1; c.hydro = false; c.militia = 0; c.unrest = 0; c.out = new Array(NR).fill(0); c.gdp = 0; c.growth = 0;
  const W = S.W;
  // hidro: nehir/göl kıyısı
  const x = c.x, y = c.y;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < 160 && ny < 96) { const i = ny * 160 + nx; if (W.river[i] || W.terr[i] === 2) c.hydro = true; } }
  const need = c.pop * 0.1;
  if (c.pot.food > 0.3) c.bld.farm = clamp(Math.ceil(need / (BLD.farm.out * richness(c, 'farm') * 0.8)), 1, 4);
  for (const k of ['iron', 'coal', 'oil', 'gold', 'stone']) { const p = c.pot[BLD[k].pot]; if (p > 0.5) c.bld[k] = clamp(Math.round(0.5 + p / 2.5 + rng.next()), 1, 3); }
  if (c.pot.wood > 1) c.bld.wood = clamp(Math.round(c.pot.wood / 14 + rng.next()), 1, 3);
  c.bld.market = isCap ? 2 : 1; c.bld.school = isCap ? 2 : 1; c.bld.hospital = isCap ? 2 : 1; c.bld.infra = isCap ? 2 : 1;
  if (c.pop > 330) c.bld.factory = isCap ? 2 : 1 + (rng.chance(0.4) ? 1 : 0);
  if (c.coastal && (isCap || rng.chance(0.65))) c.bld.port = 1;
  if (isCap) { c.bld.barracks = 1; c.bld.fort = 2; } else { c.bld.fort = rng.chance(0.5) ? 1 : 0; if (rng.chance(0.3)) c.bld.barracks = 1; }
  const eDem = c.pop * 0.012 + c.bld.factory * 8 + 12;
  c.bld.power = clamp(Math.ceil(eDem / 22), 1, 3);
  c.militia = militiaMax(c);
}
export const militiaMax = (c) => Math.sqrt(c.pop) * 8 + c.bld.fort * 120 + 60;

// ---------- günlük hesap
export function buildCost(S, n, key, lvl) {
  const b = BLD[key]; const f = Math.pow(lvl, 1.3) * n.priceLevel; const o = {};
  for (const r in b.cost) o[r] = Math.ceil(b.cost[r] * f);
  return o;
}
const resIdx = { money: -1, iron: IR, coal: CO, oil: OI, gold: GO, wood: WO, stone: ST, food: F };
export function canAfford(n, cost) { for (const r in cost) { if (r === 'money') { if (n.money < cost.money) return false; } else if (r !== 'manpower' && n.stock[resIdx[r]] < cost[r]) return false; } return true; }
export function pay(n, cost, mult = 1) { for (const r in cost) { if (r === 'money') n.money -= cost[r] * mult; else if (r !== 'manpower') n.stock[resIdx[r]] -= cost[r] * mult; } }
export function refund(n, cost, mult = 1) { for (const r in cost) { if (r === 'money') n.money += cost[r] * mult; else if (r !== 'manpower') n.stock[resIdx[r]] += cost[r] * mult; } }

export function buildInfo(S, n, c, key) {
  const b = BLD[key]; const queued = c.queue.filter((q) => q.key === key).length; const lvl = c.bld[key] + queued + 1;
  const cost = buildCost(S, n, key, lvl);
  let why = null;
  if (c.owner !== n.id) why = 'Şehir sizin değil';
  else if (lvl > bldCap(n)) why = `Seviye sınırı (${bldCap(n)})`;
  else if (b.pot && c.pot[b.pot] < (b.pot === 'food' ? 0.5 : 0.8)) why = 'Bölgede kaynak yok';
  else if (b.needsCoast && !c.coastal) why = 'Kıyıda değil';
  else if (c.queue.length >= 3) why = 'İnşaat kuyruğu dolu';
  else if (c.occ > 0 && key !== 'fort') why = 'Şehir işgal sonrası karışık';
  else if (!canAfford(n, cost)) why = 'Kaynak/para yetersiz';
  return { key, lvl, cost, why, days: Math.ceil(b.d * (1 + 0.2 * (lvl - 1))) };
}
export function build(S, nid, cid, key) {
  const n = S.nations[nid], c = S.cities[cid]; const info = buildInfo(S, n, c, key);
  if (info.why) return { ok: false, msg: info.why };
  pay(n, info.cost); c.queue.push({ key, left: info.days, total: info.days, lvl: info.lvl, cost: info.cost });
  return { ok: true, msg: `${BLD[key].name} inşaatı başladı` };
}
export function cancelBuild(S, nid, cid, qi) {
  const c = S.cities[cid], n = S.nations[nid]; if (c.owner !== nid) return; const q = c.queue[qi]; if (!q) return;
  refund(n, q.cost, 0.6); c.queue.splice(qi, 1);
}
export function setPolicy(S, nid, key, v) {
  const n = S.nations[nid]; const R = { taxIncome: [0, 0.6], taxCorp: [0, 0.6], tariff: [0, 0.4], edu: [0, 0.12], health: [0, 0.12], infra: [0, 0.1], agri: [0, 0.06], industry: [0, 0.06], science: [0, 0.07], military: [0, 0.2], mobilization: [0.05, 1], immigration: [-1, 1], natalism: [-1, 1] };
  if (!R[key]) return; n.pol[key] = clamp(v, R[key][0], R[key][1]);
}
export function setResPol(S, nid, r, mode) { S.nations[nid].resPol[r] = mode; }
export function creditLimit(n) { return Math.max(500, n.gdp * 1.4); }
export function borrow(S, nid, amt) { const n = S.nations[nid]; if (n.debt + amt > creditLimit(n)) return { ok: false, msg: 'Kredi sınırı aşılıyor' }; n.money += amt; n.debt += amt; return { ok: true, msg: `${fmt(amt)} ¤ borç alındı` }; }
export function repay(S, nid, amt) { const n = S.nations[nid]; amt = Math.min(amt, n.debt, n.money); if (amt <= 0) return { ok: false, msg: 'Ödenecek para/borç yok' }; n.money -= amt; n.debt -= amt; return { ok: true, msg: `${fmt(amt)} ¤ borç ödendi` }; }
export function printMoney(S, nid, amt) { const n = S.nations[nid]; n.money += amt; n.infShock = (n.infShock || 0) + (amt / Math.max(500, n.gdp)) * 2.5; n.rep -= 0.5; return { ok: true, msg: `${fmt(amt)} ¤ basıldı — enflasyon yükselecek` }; }

export function armyUpkeepOf(S, nid) {
  const u = { money: 0, food: 0, oil: 0, iron: 0 }; let manpower = 0;
  for (const a of S.armies) if (a.owner === nid) { const d = UNITS[a.type]; const k = a.hp / d.hp; for (const r in d.up) u[r] += d.up[r] * k; manpower += d.mp * k; }
  return { ...u, manpower };
}

// Küresel fiyatlar (gün sonu)
function updatePrices(S) {
  const M = S.market; const alive = S.nations.filter((n) => n.alive);
  for (let r = 0; r < NR; r++) {
    let st = 0, cs = 0;
    for (const n of alive) { st += n.stock[r]; cs += Math.max(n.cons[r], 0.5); }
    const cover = st / (cs * 30 + 1);
    const target = RES[r].base * clamp(1.5 / (0.5 + cover), 0.55, 2.4);
    M.price[r] += (target - M.price[r]) * 0.08;
  }
}
export const unitPrice = (S, r) => S.market.price[r];

// ---------- ticaret (günlük)
export function tradeStep(S) {
  const alive = S.nations.filter((n) => n.alive);
  for (const n of alive) { n.trade.imp.fill(0); n.trade.exp.fill(0); n.trade.impVal = 0; n.trade.expVal = 0; }
  S.flows = {};
  const target = (n, r) => { const m = n.resPol[r] === 'hoard' ? 1.7 : n.resPol[r] === 'export' ? 0.45 : 1; return (Math.max(n.cons[r], 1.2) * 24 + 15) * m; };
  for (const a of alive) for (const b of alive) {
    if (a.id >= b.id || !hasTrade(S, a.id, b.id)) continue;
    const capA = routeCap(a), capB = routeCap(b); const cap = Math.min(capA, capB);
    for (let r = 0; r < NR; r++) {
      if (r === GO) continue;
      for (const [x, y] of [[a, b], [b, a]]) { // x ihraç eder, y ithal eder
        if (x.resPol[r] === 'hoard' || y.resPol[r] === 'block') continue;
        const sur = x.stock[r] - target(x, r) * 1.1, need = target(y, r) * 0.85 - y.stock[r];
        if (sur <= 0 || need <= 0) continue;
        let q = Math.min(sur * 0.25, need * 0.35, cap * (r === EL ? 0.5 : 1));
        const p = S.market.price[r] * (1 + (y.sat[r] < 1 ? 0.15 : 0)) ;
        q = Math.min(q, y.money > 0 ? y.money / p / 3 : 0); if (q < 0.05) continue;
        x.stock[r] -= q; y.stock[r] += q; const v = q * p;
        x.money += v; y.money -= v; x.trade.exp[r] += q; x.trade.expVal += v; y.trade.imp[r] += q; y.trade.impVal += v;
        const k = x.id + '>' + y.id; const f = S.flows[k] || (S.flows[k] = { from: x.id, to: y.id, v: 0, res: new Array(NR).fill(0) }); f.v += v; f.res[r] += q;
      }
    }
  }
  // altın serbest piyasası (likit): fazlayı dünya fiyatının %90'ıyla satar
  for (const n of alive) { const keep = 40 + n.pop * 0.02; if (n.stock[GO] > keep && n.resPol[GO] !== 'hoard') { const q = (n.stock[GO] - keep) * 0.3; n.stock[GO] -= q; const v = q * S.market.price[GO] * 0.9; n.money += v; n.salesToday = (n.salesToday || 0) + v; } }
}
const routeCap = (n) => { let s = 0; for (const c of n._cities) s += c.bld.market + c.bld.port * 1.4; return (26 + s * 6) * (1 + n.mods.trade) * (0.8 + 0.4 * n.idx.infra / 100); };

// ---------- ana günlük döngü
export function dailyEconomy(S) {
  const alive = S.nations.filter((n) => n.alive);
  for (const n of alive) { n._cities = S.cities.filter((c) => c.owner === n.id); }
  for (const n of alive) nationDay(S, n);
  updatePrices(S);
  tradeStep(S);
  for (const n of alive) nationFinance(S, n);
  if (S.day % 10 === 0) for (const n of alive) pushHistory(S, n);
  if (S.day % 10 === 0) { S.market.hist.push(S.market.price.map((p) => +p.toFixed(2))); if (S.market.hist.length > 150) S.market.hist.shift(); }
}

function nationDay(S, n) {
  const pol = n.pol, g = GOV[n.gov], mods = n.mods;
  const cities = n._cities; n.pop = cities.reduce((s, c) => s + c.pop, 0);
  const prod = new Array(NR).fill(0), cons = new Array(NR).fill(0);
  const elecF = n.elecF;
  const taxAvg = (pol.taxIncome + pol.taxCorp) / 2;
  const taxPen = Math.max(0, taxAvg - 0.3) * 0.9, taxBoost = Math.max(0, 0.25 - taxAvg) * 0.25;
  const agriSub = clamp(pol.agri * 2.5, 0, 0.15), indSub = clamp(pol.industry * 2.5, 0, 0.15);
  const eduF = 0.8 + 0.4 * n.idx.edu / 100, hF = 0.92 + 0.16 * n.idx.health / 100;
  const stF = 0.7 + 0.3 * clamp(n.stab / 50, 0, 1);
  let gdpVal = 0, elecProd = 0, elecDemand = 0, labor = 0, jobs = 0, schools = 0, factories = 0, barracks = 0;
  const fuel = { coal: 0, iron: 0, oil: 0 }; const cityRec = [];
  const mob = armyUpkeepOf(S, n.id); n.upkeep = mob;
  for (const c of cities) {
    const infF = 0.85 + 0.3 * n.idx.infra / 100 + 0.035 * c.bld.infra + mods.infra;
    let req = 0; for (const k of BLD_KEYS) req += c.bld[k] * 5;
    const L = c.pop * 0.45 * (1 - clamp(mob.manpower / Math.max(n.pop, 1) * 2, 0, 0.3));
    const lf = req > 0 ? Math.min(1, L * 0.6 / req) : 1; c.lf = lf; labor += L * 0.6; jobs += req;
    const occ = c.occ > 0 ? 0.55 + 0.45 * (1 - c.occ / 120) : 1;
    const base = lf * eduF * hF * infF * stF * g.eco * (1 - taxPen + taxBoost) * (1 + mods.eco) * (1 - c.dmg) * occ * (1 + n.modsTemp.reduce((s, m) => s + (m.k === 'eco' ? m.v : 0), 0));
    c.base = base; c.out.fill(0);
    for (const k of EXTRACT) {
      const lvl = c.bld[k]; if (!lvl) continue; const b = BLD[k];
      const rich = richness(c, k);
      let m = base;
      if (k === 'farm') m *= 1 + mods.food + agriSub; else if (k === 'wood') m *= 1 + mods.wood; else if (k === 'iron' || k === 'coal' || k === 'oil' || k === 'gold' || k === 'stone') m *= (1 + mods.mine + indSub) * (0.55 + 0.45 * elecF);
      const out = b.out * lvl * rich * m; c.out[b.res] = out; prod[b.res] += out;
      elecDemand += lvl * (k === 'farm' ? 0.8 : 2.5);
    }
    if (c.bld.power) {
      const lvl = c.bld.power; const out = BLD.power.out * lvl * (1 + mods.power) * Math.min(1.1, base + 0.1);
      c._pw = out; fuel.coal += 1.1 * lvl * (c.hydro ? 0.35 : 1);
    } else c._pw = 0;
    if (c.bld.factory) { fuel.coal += 1.2 * c.bld.factory; fuel.iron += 1.5 * c.bld.factory; fuel.oil += 0.3 * c.bld.factory; elecDemand += 8 * c.bld.factory; factories += c.bld.factory; }
    elecDemand += c.pop * 0.012 + (c.bld.market + c.bld.school + c.bld.hospital + c.bld.port + c.bld.barracks) * 1;
    schools += c.bld.school; barracks += c.bld.barracks;
    cons[F] += c.pop * 0.1; cons[WO] += c.pop * 0.004; cons[CO] += c.pop * 0.004; cons[OI] += c.pop * 0.003; cons[ST] += c.pop * 0.0005;
    cityRec.push(c);
  }
  // askerî tüketim
  cons[F] += mob.food; cons[OI] += mob.oil; cons[IR] += mob.iron;
  cons[CO] += fuel.coal; cons[IR] += fuel.iron; cons[OI] += fuel.oil;
  // üretimi depoya yaz; yakıt tatmini
  const sat = new Array(NR).fill(1);
  for (let r = 0; r < NR; r++) {
    if (r === EL) continue;
    const avail = n.stock[r] + prod[r];
    sat[r] = cons[r] > 0 ? clamp(avail / cons[r], 0, 1) : 1;
  }
  const sFuel = Math.min(sat[CO], 1), sIron = sat[IR], sOil = sat[OI];
  // enerji santralleri + fabrikalar
  let factoryVal = 0;
  for (const c of cityRec) {
    if (c._pw) elecProd += c.hydro ? c._pw * (0.35 + 0.65 * sFuel) : c._pw * sFuel;
    if (c.bld.factory) { const sF = Math.min(sFuel, sIron, 0.3 + 0.7 * sOil); const v = 22 * c.bld.factory * sF * c.base * (1 + mods.factory + indSub) * (g.indus || 1) * (0.5 + 0.5 * elecF); c.fact = v; factoryVal += v; }
  }
  prod[EL] = elecProd; cons[EL] = elecDemand;
  n.elecF = clamp((elecProd + n.stock[EL] * 0.5) / Math.max(elecDemand, 1), 0.5, 1);
  sat[EL] = clamp((elecProd + n.stock[EL]) / Math.max(elecDemand, 1), 0, 1);
  // depo güncelle
  const capR = 500 + n.pop * 0.35 + cityRec.reduce((s, c) => s + c.bld.market * 40 + c.bld.port * 40, 0);
  for (let r = 0; r < NR; r++) {
    let s = n.stock[r] + prod[r] - cons[r];
    if (r === EL) s = Math.max(0, s) * 0.8;
    if (s < 0) s = 0;
    if (r === F && s > cons[F] * 40) s *= 0.99;
    const cap = r === GO ? capR * 0.3 : r === EL ? Math.max(100, elecDemand * 2) : capR * (r === F ? 1.6 : 1);
    n.stock[r] = Math.min(s, cap);
    n.net[r] = prod[r] - cons[r];
  }
  n.prod = prod; n.cons = cons; n.sat = sat;
  // GDP (reel, p=1) ve işsizlik
  let gdp = factoryVal;
  for (let r = 0; r < NR; r++) gdp += prod[r] * RES[r].base * (r === EL ? 0.6 : 1);
  for (const c of cityRec) { const svc = c.pop * 0.05 * (1 + c.bld.market * 0.12 + c.bld.port * 0.05) * (0.7 + 0.3 * c.base); gdp += svc; c.gdp = svc + (c.fact || 0); }
  n.gdpDay = gdp * n.priceLevel * (1 + n.modsTemp.reduce((s, m) => s + (m.k === 'gdp' ? m.v : 0), 0));
  n.unemp = clamp(1 - jobs / Math.max(labor, 1), 0, 0.4) * 0.7 + 0.04;
  n.schools = schools; n.factories = factories;
  // araştırma
  n.rp = (1 + 0.6 * schools + n.gdpDay * pol.science / 60) * (0.7 + 0.6 * n.idx.edu / 100) * (1 + mods.rp) * g.res * (1 + n.modsTemp.reduce((s, m) => s + (m.k === 'rp' ? m.v : 0), 0));
  researchTick(S, n);
  // inşaat
  for (const c of cityRec) {
    if (c.queue.length) { const q = c.queue[0]; q.left -= 1 + n.mods.infra * 3 + n.idx.infra / 400; if (q.left <= 0) { c.bld[q.key]++; c.queue.shift(); if (c.owner === S.player) { logEvent(S, n.id, `${c.name}: ${BLD[q.key].name} seviye ${c.bld[q.key]} tamamlandı`, 1, { tag: 'build' }); S.visDirty = true; } else S.visDirty = true; c.militia = Math.max(c.militia, militiaMax(c) * 0.5); } }
    if (c.dmg > 0) c.dmg = Math.max(0, c.dmg - 0.004);
    if (c.occ > 0) c.occ--;
  }
  popDay(S, n, cityRec, sat);
  // manpower
  n.manpowerMax = n.pop * (0.02 + 0.08 * pol.mobilization) * (0.85 + 0.3 * n.idx.health / 100);
  n.manpower = Math.min(n.manpowerMax, n.manpower + n.manpowerMax * (0.012 + 0.004 * barracks) + 0.2);
  // modTemp süreleri
  for (const m of n.modsTemp) m.days--; n.modsTemp = n.modsTemp.filter((m) => m.days > 0);
}

function popDay(S, n, cities, sat) {
  const pol = n.pol; const starv = sat[F] < 1 ? (1 - sat[F]) : 0;
  for (const c of cities) {
    const agriCap = BLD.farm.out * richness(c, 'farm') * 5 * (1 + n.mods.food) / 0.1;
    const cap = (agriCap * 0.9 + 140 + 70 * (c.bld.port + c.bld.market)) * (1 + n.mods.popCap) * (0.8 + 0.4 * n.idx.infra / 100);
    const r = 0.013 + 0.012 * (n.idx.health - 50) / 50 + pol.natalism * 0.008 + Math.max(0, pol.immigration) * 0.006 + Math.min(0, pol.immigration) * 0.003 - starv * 0.16 - (c.occ > 0 ? 0.01 : 0) - (n.stab < 20 ? 0.01 : 0);
    let g = r * (c.pop < cap ? (1 - c.pop / cap) : 0) + (c.pop >= cap ? -Math.min(0.1, (c.pop / cap - 1) * 0.06) : 0);
    if (starv > 0) g = Math.min(g, r);
    if (c.pop < cap * 0.4) g = Math.max(g, r * 0.3);
    c.growth = g; c.pop = Math.max(20, c.pop * (1 + g / 365));
    const mm = militiaMax(c); if (c.militia < mm) c.militia = Math.min(mm, c.militia + mm * 0.02); else c.militia = mm;
  }
}

function nationFinance(S, n) {
  const pol = n.pol, g = GOV[n.gov];
  const gdp = n.gdpDay; n.gdp = n.gdp ? n.gdp * 0.97 + gdp * 365 * 0.03 : gdp * 365; const gd = n.gdp / 365;
  const stabEff = 0.85 + 0.15 * Math.min(1, n.stab / 60);
  const eff = (1 - g.corr) * (1 + n.mods.tax) * stabEff;
  const rev = { income: gdp * 0.55 * pol.taxIncome * eff, corp: gdp * 0.3 * pol.taxCorp * eff, tariff: n.trade.impVal * pol.tariff * 0.6, sales: n.salesToday || 0 };
  const up = n.upkeep || { money: 0 };
  const upM = up.money * n.priceLevel;
  const milBudget = gdp * pol.military;
  const exp = {
    edu: gdp * pol.edu, health: gdp * pol.health, infra: gdp * pol.infra, subs: gdp * (pol.agri + pol.industry), sci: gdp * pol.science,
    mil: Math.max(milBudget, upM), admin: gdp * 0.02 * (1 + g.corr), interest: 0, other: gdp * Math.abs(pol.natalism) * 0.003 + gdp * Math.max(0, pol.immigration) * 0.002,
  };
  const rate = 0.03 + 0.1 * (n.debt / Math.max(n.gdp, 1)) + 0.3 * Math.max(0, n.inflation - 0.03) - n.mods.infl * 0.02;
  exp.interest = n.debt * Math.max(0.01, rate) / 365;
  const totR = rev.income + rev.corp + rev.tariff, totE = Object.values(exp).reduce((s, v) => s + v, 0);
  n.money += totR - totE; n.dayNet = totR - totE;
  // EMA gösterim
  for (const k in rev) n.bud.rev[k] = n.bud.rev[k] * 0.9 + rev[k] * 0.1; n.salesToday = 0;
  for (const k in exp) n.bud.exp[k] = n.bud.exp[k] * 0.9 + exp[k] * 0.1;
  n.netEma = (n.netEma || 0) * 0.9 + (totR - totE) * 0.1;
  // otomatik borçlanma / para basma
  const lim = creditLimit(n);
  if (n.money < 0) {
    const need = -n.money;
    if (n.debt + need <= lim) { n.debt += need; n.money = 0; }
    else { const take = Math.max(0, lim - n.debt); n.debt += take; const pr = need - take; n.money = 0; n.infShock = (n.infShock || 0) + pr / Math.max(500, n.gdp) * 2.5; n.printed = (n.printed || 0) + pr; }
  }
  // indeksler
  const ix = n.idx;
  ix.edu += (100 * (1 - Math.exp(-pol.edu / 0.035)) - ix.edu) * 0.008;
  ix.health += (100 * (1 - Math.exp(-pol.health / 0.035)) - ix.health) * 0.008;
  ix.infra += (100 * (1 - Math.exp(-pol.infra / 0.03)) - ix.infra) * 0.006;
  const ratio = (pol.military * gdp) / Math.max(1, upM);
  ix.mil += (clamp(25 + 60 * (ratio - 0.7) / 1.0, 15, 100) - ix.mil) * 0.02;
  // enflasyon
  const deficitR = Math.max(0, -(totR - totE)) / Math.max(gd, 1);
  const tgt = 0.02 + (n.infShock || 0) * 0.4 + deficitR * 0.15 + Math.max(0, n.sat[F] < 1 ? 0.04 : 0) - n.mods.infl * 0.02 + (n.debt > lim * 0.9 ? 0.03 : 0);
  n.inflation += (tgt - n.inflation) * 0.02; n.infShock = (n.infShock || 0) * 0.985;
  n.priceLevel *= Math.pow(1 + n.inflation, 1 / 365);
  // büyüme (30 günlük EMA'nın yıllık değişimi)
  if (S.day % 30 === 0) { const prev = n.gdpPrev || n.gdp; n.growth = Math.pow(n.gdp / Math.max(prev, 1), 12) - 1; n.growth = clamp(n.growth, -0.5, 0.5); n.gdpPrev = n.gdp; }
  // istikrar
  const foodS = n.sat[F];
  const taxTot = (pol.taxIncome * 0.55 + pol.taxCorp * 0.3) / 0.85;
  const tgtStab = 52 + g.stab + 0.14 * (ix.edu - 50) + 0.14 * (ix.health - 50) - Math.max(0, taxTot - 0.2) * 70 + Math.max(0, 0.2 - taxTot) * 30 - Math.min(24, n.inflation * 90) - n.weariness * 0.28 * g.war
    - n.unemp * 30 - (foodS < 1 ? (1 - foodS) * 70 : -4) + (n.sat[EL] < 0.8 ? -5 : 2) + (n.debt > lim * 0.9 ? -6 : 0) + Math.max(0, pol.mobilization - 0.5) * -12 + (pol.immigration > 0 ? -pol.immigration * 3 : -pol.immigration * 1.5)
    + n.modsTemp.reduce((s, m) => s + (m.k === 'stab' ? m.v : 0), 0) + (n.pol.edu + n.pol.health > 0.08 ? 3 : 0);
  n.stab = clamp(n.stab + (clamp(tgtStab, 0, 100) - n.stab) * 0.025, 0, 100);
  n.weariness = Math.max(0, n.weariness - 0.15);
  n.rep = clamp(n.rep + (55 - n.rep) * 0.002, 0, 100);
}

function pushHistory(S, n) {
  const h = n.hist; const push = (k, v) => { h[k].push(+v.toFixed(3)); if (h[k].length > 200) h[k].shift(); };
  push('gdp', n.gdp); push('pop', n.pop); push('money', n.money - n.debt); push('army', n.milPower || 0); push('stab', n.stab); push('infl', n.inflation * 100); push('growth', n.growth * 100); push('debt', n.debt);
}

// ---------- teknoloji
export function techState(n, t) { if (n.techs[t.id]) return 'done'; if (n.research && n.research.id === t.id) return 'active'; return t.req.every((r) => n.techs[r]) ? 'avail' : 'locked'; }
export function startResearch(S, nid, id) {
  const n = S.nations[nid], t = TECH_BY[id]; if (!t) return { ok: false, msg: 'Geçersiz teknoloji' };
  const st = techState(n, t); if (st === 'done') return { ok: false, msg: 'Zaten araştırıldı' }; if (st === 'locked') return { ok: false, msg: 'Ön koşullar eksik' };
  if (n.research && n.research.id === id) return { ok: false, msg: 'Zaten araştırılıyor' };
  const cost = t.money * n.priceLevel; if (n.money < cost) return { ok: false, msg: `Para yetersiz (${fmt(cost)} ¤)` };
  if (n.research) { n.money += n.research.paid * 0.5; }
  n.money -= cost; n.research = { id, progress: 0, paid: cost };
  return { ok: true, msg: `${t.name} araştırması başladı` };
}
function researchTick(S, n) {
  if (!n.research) return;
  const t = TECH_BY[n.research.id]; n.research.progress += n.rp + (n.sciStolen || 0); n.sciStolen = 0;
  if (n.research.progress >= t.rp) {
    n.techs[t.id] = true; n.research = null; computeMods(n);
    logEvent(S, n.id, `${n.short} teknolojisi tamamladı: ${t.name}`, n.id === S.player ? 1 : 0, { tag: 'tech', global: false });
    if (n.id === S.player) S.visDirty = true;
  }
}
