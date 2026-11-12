// Oyun çekirdeği: yeni oyun kurulumu ve saatlik simülasyon adımı (tüm motorları bağlar)
import { RNG, N } from './util.js';
import { NATIONS, NN, RES, NR } from './data.js';
import { generateWorld } from './worldgen.js';
import { rebuildOwner } from './state.js';
import { initNationEconomy, initCityEconomy, computeMods, dailyEconomy } from './economy.js';
import { initMilitary, hourlyMilitary, rebuildSupply } from './military.js';
import { initDiplomacy, dailyDiplomacy, computeNeighbors } from './diplomacy.js';
import { initAI, dailyAI } from './ai.js';
import { dailyEvents } from './events.js';
import { nationPower } from './military.js';

export function newGame(seed, playerId, opts = {}) {
  const W = generateWorld(seed);
  const rng = new RNG((seed ^ 0x9e3779b1) >>> 0);
  const S = {
    v: 1, seed, player: playerId, t: 0, day: 0, rng, nations: [], cities: [], armies: [], aid: 0, pid: 0, gid: 0, eid: 0,
    ownerGrid: new Int8Array(N), ownerVer: 0, ownerDirty: true, supply: {}, supplyVer: -1,
    market: { price: RES.map((r) => r.base), hist: [] }, flows: {}, log: [], notify: [], pending: [], inbox: [], fx: [], fxSeq: 0,
    battleLog: {}, warScore: {}, eventCool: {}, battles: [], occ: new Map(), visDirty: true, difficulty: opts.difficulty || 1, gameOver: null, created: Date.now(),
  };
  Object.defineProperty(S, 'W', { value: W, enumerable: false, writable: true });
  NATIONS.forEach((d, i) => {
    const n = { id: i, name: d.name, short: d.short, gov: d.gov, col: d.col, col2: d.col2, flag: d.flag, tr: { ...d.tr }, trait: d.trait, alive: true, capital: W.nationCities[i][0] };
    S.nations.push(n); initNationEconomy(S, n);
  });
  for (const c of W.cities) {
    const city = { ...c, owner: c.nation, pot: { ...c.pot }, isCap: W.nationCities[c.nation][0] === c.id };
    delete city.nation; S.cities.push(city);
    initCityEconomy(S, city, rng, city.isCap);
  }
  rebuildOwner(S);
  for (const n of S.nations) {
    n._cities = S.cities.filter((c) => c.owner === n.id); n.pop = n._cities.reduce((s, c) => s + c.pop, 0);
    for (let r = 0; r < NR; r++) n.stock[r] = r === 0 ? n.pop * 0.1 * 28 : r === 7 ? 80 : 120 + n.pop * 0.06;
    n.manpower = n.pop * 0.04;
  }
  initDiplomacy(S);
  initMilitary(S, rng);
  // ısınma: 3 sahte gün (stok/tüketim/fiyat dengesi), sonra sıfırla
  for (let i = 0; i < 3; i++) dailyEconomy(S);
  for (const n of S.nations) {
    n.money = Math.round(n.gdpDay * 12); n.debt = 0; n.priceLevel = 1; n.inflation = 0.02; n.gdp = n.gdpDay * 365; n.gdpPrev = n.gdp; n.growth = 0.02; n.netEma = 0; n.stab = 62 + (n.gov === 'democracy' ? 4 : 0);
    n.hist = { gdp: [], pop: [], money: [], army: [], stab: [], infl: [], growth: [], debt: [] }; n.milPower = nationPower(S, n.id);
    n.research = null;
  }
  S.market.price = RES.map((r) => r.base); S.market.hist = [];
  rebuildSupply(S); initAI(S);
  S.log.push({ id: ++S.eid, t: 0, nid: playerId, text: `${S.nations[playerId].name} yönetimini devraldınız. Dünya sizi izliyor.`, sev: 1, tag: 'sys', inv: [] });
  return S;
}

const safe = (name, fn, S) => { try { fn(S); } catch (e) { S.errors = (S.errors || 0) + 1; if (S.errors < 20) console.error(`[${name}]`, e); } };

export function stepHour(S) {
  if (S.gameOver) return;
  S.t++;
  safe('military', hourlyMilitary, S);
  if (S.t % 24 === 0) {
    S.day = S.t / 24;
    safe('economy', dailyEconomy, S);
    safe('diplomacy', dailyDiplomacy, S);
    safe('ai', dailyAI, S);
    safe('events', dailyEvents, S);
    if (S.ownerDirty) { computeNeighbors(S); S.ownerDirty = false; }
  }
}
