// Simülasyon durumunu serileştir / geri yükle (saf JS; tarayıcı ve Node). Dünya seed'den yeniden üretilir,
// yalnız değişebilen katmanlar saklanır. Sürümlü format + migration zinciri.
import { COLUMNS } from '../core/ecs.js';
import { RNG } from '../core/rng.js';

export const SAVE_VERSION = 3; // 0.17: rezervler, yangın, sınırlar, başkent seçimi

const B64 = typeof Buffer !== 'undefined'
  ? { enc: (u8) => Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength).toString('base64'), dec: (s) => new Uint8Array(Buffer.from(s, 'base64')) }
  : {
    enc: (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); },
    dec: (s) => { const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; },
  };
const enc = (ta, n = ta.length) => B64.enc(new Uint8Array(ta.buffer, ta.byteOffset, n * ta.BYTES_PER_ELEMENT));
function decInto(ta, s) { const u = B64.dec(s); new Uint8Array(ta.buffer, ta.byteOffset, u.length).set(u); }
const TA = { F32: Float32Array, I32: Int32Array, U8: Uint8Array, U16: Uint16Array, U32: Uint32Array };

export function serialize(sim) {
  const e = sim.e, map = sim.map;
  const cols = {};
  for (const [t, names] of Object.entries(COLUMNS)) for (const n of names) cols[n] = enc(e[n], e.hi);
  const routes = []; for (const [id, r] of e.routes) routes.push([id, r instanceof Int32Array ? 'i' : 'f', enc(r)]);
  return {
    v: SAVE_VERSION, opts: sim.opts, tick: sim.tick, rng: sim.rng.s, groups: sim.groups, winner: sim.winner, over: sim.over,
    ents: { hi: e.hi, count: e.count, free: e.free.slice(), cols, routes },
    map: { owner: enc(map.owner), road: enc(map.road), flood: enc(map.flood), occ: enc(map.occ), fire: enc(map.fire), fireAge: enc(map.fireAge), burnt: enc(map.burnt), cityTile: enc(map.cityTile), decals: map.decals.map((d) => [d.x, d.y, d.r, d.k]) },
    phase: sim.phase, setupTicks: sim.setupTicks || 0, capitals: sim.world.countries.map((c) => c.capital),
    deposits: sim.deposits.list.map((d) => [d.reserve, d.drawn || 0, d.drawnPrev || 0, d.rate || 0]),
    fireTiles: sim.fireTiles, burntList: sim.burntList, secondary: sim.secondary, oilFires: sim.oilFires,
    routeCache: sim.routeCache ? Array.from(sim.routeCache).map(([k, v]) => [k, v.t, v.cost ? enc(v.cost) : null]) : [],
    floodTiles: sim.floodTiles || [],
    countries: sim.countries.map((c) => ({
      alive: c.alive, ai: c.ai, pers: c.personality && c.personality.id, capitalCity: c.capitalCity, hq: c.hq,
      res: Array.from(c.res), money: c.money, items: Array.from(c.items), tech: Array.from(c.tech), researching: c.researching, rprog: c.rprog,
      mods: c.mods, bands: c.bands, band: c.band, stats: c.stats, known: Array.from(c.known), emitters: Array.from(c.emitters),
      vis: enc(c.vis), territory: c.territory, territory0: c.territory0, morale: c.morale, pop: c.pop, trades: c.trades,
      lossByJam: c.lossByJam, lossByOther: c.lossByOther, workSat: c.workSat,
      placed: c.placed, citiesFounded: c.citiesFounded || 0, territoryMax: c.territoryMax || 0,
      fp: Array.from(c.fp), fc: Array.from(c.fc), fbyP: c.fbyP, fbyC: c.fbyC, flowP: Array.from(c.flowP), flowC: Array.from(c.flowC), flowByP: c.flowByP, flowByC: c.flowByC,
    })),
    diplo: { state: enc(sim.diplo.state), rel: enc(sim.diplo.rel), timer: enc(sim.diplo.timer), proposals: sim.diplo.proposals, pid: sim.diplo.pid },
    env: sim.env, cityInfo: Array.from(sim.cityInfo), delayed: sim.delayed, reveal: Array.from(sim.reveal),
    log: sim.log.slice(-60), cmds: sim.cmds.pending, cmdSeq: sim.cmds.seq,
    ai: sim.ai ? sim.ai.map((b) => b && { ...b, rng: b.rng.s, p: b.p.id, diff: b.diff.id }) : null,
  };
}

// Sürüm geçişleri: eski kayıtları güncel biçime taşı
export const MIGRATIONS = {
  2: () => { throw new Error('0.16 kayıtları 0.17 dünya kurallarıyla uyumsuz (yeni başlangıç, sınırlar ve rezervler)'); },
  1: (s) => { s.reveal = s.reveal || []; s.floodTiles = s.floodTiles || []; for (const c of s.countries) { c.trades = c.trades || []; c.bands = c.bands ?? 15; } s.v = 2; return s; },
};
export function migrate(s) {
  while (s.v < SAVE_VERSION) { const m = MIGRATIONS[s.v]; if (!m) throw new Error('migration yok: v' + s.v); s = m(s); }
  return s;
}

export function restore(SimClass, data, deps) {
  const s = migrate(data);
  const sim = new SimClass({ ...s.opts, skipSetup: true });
  const e = sim.e, map = sim.map;
  e.hi = s.ents.hi; e.count = s.ents.count; e.free = s.ents.free.slice();
  for (const [t, names] of Object.entries(COLUMNS)) for (const n of names) { e[n].fill(t === 'I32' ? -1 : 0); decInto(e[n], s.ents.cols[n]); }
  e.routes.clear(); for (const [id, k, b] of s.ents.routes) { const u = B64.dec(b); e.routes.set(id, k === 'i' ? new Int32Array(u.buffer, 0, u.length / 4).slice() : new Float32Array(u.buffer, 0, u.length / 4).slice()); }
  decInto(map.owner, s.map.owner); decInto(map.road, s.map.road); decInto(map.flood, s.map.flood); decInto(map.occ, s.map.occ);
  decInto(map.fire, s.map.fire); decInto(map.fireAge, s.map.fireAge); decInto(map.burnt, s.map.burnt); decInto(map.cityTile, s.map.cityTile);
  map.decals = s.map.decals.map(([x, y, r, k]) => ({ x, y, r, k })); map.computeRoadComponents(); map.version++;
  sim.phase = s.phase; sim.setupTicks = s.setupTicks || 0; s.capitals.forEach((cp, k) => { sim.world.countries[k].capital = cp; });
  s.deposits.forEach(([rv, dr, dp, rt], k) => { const d = sim.deposits.list[k]; d.reserve = rv; d.drawn = dr; d.drawnPrev = dp; d.rate = rt; });
  sim.fireTiles = s.fireTiles; sim.burntList = s.burntList; sim.secondary = s.secondary; sim.oilFires = s.oilFires;
  sim.routeCache = new Map(s.routeCache.map(([k, t, c]) => { let cost = null; if (c) { const u = B64.dec(c); cost = new Float32Array(u.buffer, 0, u.length / 4).slice(); } return [k, { t, cost }]; }));
  sim.floodTiles = s.floodTiles;
  sim.tick = s.tick; sim.rng.s = s.rng; sim.groups = s.groups; sim.winner = s.winner; sim.over = s.over;
  s.countries.forEach((d, k) => {
    const c = sim.countries[k];
    c.alive = d.alive; c.ai = d.ai; c.personality = d.pers ? deps.PERSONALITIES.find((p) => p.id === d.pers) : null;
    c.capitalCity = d.capitalCity; c.hq = d.hq; c.res.set(d.res); c.money = d.money; c.items.set(d.items); c.tech.set(d.tech);
    c.researching = d.researching; c.rprog = d.rprog; c.mods = d.mods; c.bands = d.bands; c.band = d.band; c.stats = d.stats;
    c.known = new Map(d.known); c.emitters = new Map(d.emitters); decInto(c.vis, d.vis);
    c.territory = d.territory; c.territory0 = d.territory0; c.morale = d.morale; c.pop = d.pop; c.trades = d.trades;
    c.lossByJam = d.lossByJam || 0; c.lossByOther = d.lossByOther || 0; c.workSat = d.workSat ?? 1;
    c.placed = d.placed; c.citiesFounded = d.citiesFounded; c.territoryMax = d.territoryMax;
    c.fp.set(d.fp); c.fc.set(d.fc); c.fbyP = d.fbyP; c.fbyC = d.fbyC; c.flowP.set(d.flowP); c.flowC.set(d.flowC); c.flowByP = d.flowByP; c.flowByC = d.flowByC;
  });
  decInto(sim.diplo.state, s.diplo.state); decInto(sim.diplo.rel, s.diplo.rel); decInto(sim.diplo.timer, s.diplo.timer);
  sim.diplo.proposals = s.diplo.proposals; sim.diplo.pid = s.diplo.pid;
  Object.assign(sim.env, s.env); sim.cityInfo = new Map(s.cityInfo); sim.delayed = s.delayed; sim.reveal = new Map(s.reveal);
  sim.log = s.log; sim.cmds.pending = s.cmds; sim.cmds.seq = s.cmdSeq;
  if (s.ai) sim.ai = s.ai.map((b) => b && { ...b, rng: Object.assign(new RNG(1), { s: b.rng }), p: deps.PERSONALITIES.find((p) => p.id === b.p), diff: deps.DIFFICULTY.find((d) => d.id === b.diff) });
  const d = sim.dirty; d.power = d.comms = d.water = d.fuel = d.roads = true;
  e.px.set(e.x); e.py.set(e.y); e.pz.set(e.z);
  return sim;
}
