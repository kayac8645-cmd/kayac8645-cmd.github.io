// Simülasyon: sabit adım (10 tick/sn), deterministik, DOM'a dokunmaz. Dünya yalnız komutlarla değişir.
import { RNG } from '../core/rng.js';
import { EntityStore, KIND, C, F } from '../core/ecs.js';
import { CommandQueue, executeCommand } from '../core/commands.js';
import { generateWorld } from '../world/mapgen.js';
import { BUILDINGS, B } from '../data/buildings.js';
import { UNITS, PROJS, UNIT_BY, ITEMS, R } from '../data/defs.js';
import { TECHS, TECH_BY } from '../data/tech.js';
import { PERSONALITIES } from '../data/ai.js';
import { createCountry } from './country.js';
import { SpatialGrid } from './spatial.js';
import { Diplomacy, updateDiplomacy } from './diplomacy.js';
import { placeBuilding, findSpot, updateConstruction } from './build.js';
import { updateNetworks } from './networks.js';
import { updateEconomy } from './economy.js';
import { updateLogistics } from './logistics.js';
import { updateAir } from './air.js';
import { updateProjectiles } from './missiles.js';
import { updateSensors, updateAD } from './airdefense.js';
import { updateEW, updateVisibility, updateSigint } from './ew.js';
import { updateGround } from './ground.js';
import { updateWeather, initEnv } from './weather.js';
import { updateFlood } from './damage.js';
import { updateAI, initAI } from '../ai/ai.js';
import { placeAICapitals, updateTerritory } from './territory.js';
import { updateFire, recoverBurnt } from './fire.js';
import { applyTech } from './economy.js';

export const SIM_VERSION = 3;
export { PERSONALITIES };
export const TICK_MS = 100;
export const MAX_COUNTRIES = 24;

export class Simulation {
  constructor(opts) {
    this.opts = Object.assign({ seed: 1, size: 256, countries: 4, difficulty: 1, player: 0, allAI: false, fog: true }, opts);
    const o = this.opts;
    this.tick = 0;
    this.rng = new RNG(o.seed ^ 0xa5a5a5);
    this.world = generateWorld({ seed: o.seed, size: o.size, countries: o.countries });
    this.map = this.world.map;
    this.deposits = this.world.deposits; this.phase = 'setup';
    this.e = new EntityStore(o.size >= 1024 ? 65536 : 32768);
    this.grid = new SpatialGrid(this.map.W, this.map.H, this.e.cap, 8);
    this.grid.bind(this.e);
    this.cmds = new CommandQueue();
    this.events = []; this.maxEvents = 4000;
    this.log = []; // {t, c, key, args, x, y, lvl}
    this.cityInfo = new Map(); // id -> {name, capital, seed}
    this.dirty = { power: true, comms: true, water: true, fuel: true, roads: true };
    this.net = { power: [], comms: [], fuel: [], water: [] };
    this.reveal = new Map(); // ifşa olan fırlatıcılar -> bitiş tick
    this.engaged = new Int16Array(o.size >= 1024 ? 65536 : 32768);
    this.fireTiles = []; this.burntList = []; this.secondary = []; this.oilFires = [];
    this.delayed = []; // gecikmeli emirler (haberleşme kopukluğu)
    this.groups = 0;
    this.winner = -1; this.over = false;
    this.debug = false;
    const n = this.world.countries.length;
    this.countries = this.world.countries.map((ci, k) => {
      const humans = o.humans || [o.player]; const ai = o.allAI || !humans.includes(k); // insan ülkeler tüm eşlerde aynı
      const pers = PERSONALITIES[(o.seed + k * 7) % PERSONALITIES.length];
      return createCountry(ci, this.map, ai, ai ? pers : null);
    });
    this.diplo = new Diplomacy(n);
    // araştırma yok: tüm teknolojiler ve bonuslar herkese baştan açık
    for (const co of this.countries) for (let t = 0; t < TECHS.length; t++) applyTech(this, co.id, t);
    initEnv(this);
    if (!o.skipSetup) {
      initAI(this);
      // izleyici / test / otomatik başlangıç: herkes otomatik yerleşir; oyuncu modu: oyuncu başkentini seçer
      if (o.allAI || o.autoStart) placeAICapitals(this);
    }
  }

  // ---- yardımcılar ----
  bdef(id) { return BUILDINGS[this.e.def[id]]; }
  udef(id) { return UNITS[this.e.def[id]]; }
  pdef(id) { return PROJS[this.e.def[id]]; }
  has(c, techId) { return this.countries[c].tech[TECH_BY[techId]] === 1; }
  mod(c, key, def = 1) { const v = this.countries[c].mods[key]; return v === undefined ? def : v; }
  atWar(a, b) { return a !== b && this.diplo.atWar(a, b); }
  allied(a, b) { return a === b || this.diplo.allied(a, b); }
  techOk() { return true; } // araştırma kaldırıldı: her şey açık, sınır para ve malzeme
  canAfford(c, cost, mul = 1) {
    const co = this.countries[c];
    for (const k in cost) { const v = cost[k] * mul; if (k === 'money') { if (co.money < v) return false; } else if (co.res[R[k]] < v - 1e-9) return false; }
    return true;
  }
  pay(c, cost, mul = 1, tag = 'b_construction') {
    const co = this.countries[c];
    for (const k in cost) { const v = cost[k] * mul; if (k === 'money') co.money -= v; else this.subRes(c, R[k], v, tag); }
  }
  emit(ev) { if (this.events.length < this.maxEvents) this.events.push(ev); }
  notify(c, key, args, x, y, lvl = 1) {
    const ent = { t: this.tick, c, key, args: args || [], x: x ?? -1, y: y ?? -1, lvl };
    this.log.push(ent); if (this.log.length > 400) this.log.shift();
    this.emit({ k: 'note', ...ent });
  }
  newGroup() { return ++this.groups; }
  cityAt(x, y) { const e = this.e; let best = -1, bd = 1e9; e.each(C.CITY, (i) => { const dx = e.x[i] - x, dy = e.y[i] - y, d = dx * dx + dy * dy; const r = e.prog[i] + 1; if (d <= r * r && d < bd) { bd = d; best = i; } }); return best; }

  spawnUnit(c, unitIdx, x, y) {
    const u = UNITS[unitIdx];
    const kind = u.kind === 'air' ? KIND.AIR : u.kind === 'naval' ? KIND.NAVAL : KIND.GROUND;
    let mask = C.UNIT | C.MOVE | C.VISION | (kind === KIND.AIR ? C.AIR : kind === KIND.NAVAL ? C.NAVAL : C.GROUND);
    if (u.ad) mask |= C.AD;
    if (u.jam) mask |= C.JAMMER | C.EMIT;
    if (u.sigint) mask |= C.SIGINT;
    if (u.role === 'arty' || u.role === 'mlrs') mask |= C.ARTY;
    const id = this.e.create(kind, unitIdx, c, x, y, mask);
    if (id < 0) return -1;
    const e = this.e;
    e.hp[id] = e.maxhp[id] = u.hp; e.fuel[id] = (u.fuel || 0) * (kind === KIND.AIR ? this.mod(c, 'droneRange', 1) : 1);
    e.ammo[id] = u.ammo || u.salvo || 0; e.supply[id] = 1; e.speed[id] = u.speed;
    e.tx[id] = x; e.ty[id] = y; e.ox[id] = x; e.oy[id] = y; e.band[id] = this.countries[c].band;
    if (u.autonomous) e.flags[id] |= F.AUTONOMOUS;
    if (u.jam) e.flags[id] |= F.EMIT_ON;
    if (u.ad) e.flags[id] |= F.EMIT_ON;
    e.z[id] = e.pz[id] = kind === KIND.AIR ? (u.alt || 1) * 6 : 0;
    return id;
  }
  spawnProj(c, projIdx, ox, oy, tx, ty, opts = {}) {
    const id = this.e.create(KIND.PROJ, projIdx, c, ox, oy, C.PROJ | C.MOVE);
    if (id < 0) return -1;
    const e = this.e, p = PROJS[projIdx];
    e.ox[id] = ox; e.oy[id] = oy; e.tx[id] = tx; e.ty[id] = ty; e.prog[id] = 0;
    e.target[id] = opts.target ?? -1; e.speed[id] = p.speed; e.hp[id] = e.maxhp[id] = 1;
    e.home[id] = opts.from ?? -1; e.timer[id] = 0;
    return id;
  }

  // ---- kaynak akışı (üretim/tüketim dökümü) ----
  addRes(c, r, amt, tag) { const co = this.countries[c]; co.res[r] += amt; co.fp[r] += amt; if (tag) { const m = co.fbyP[r] || (co.fbyP[r] = {}); m[tag] = (m[tag] || 0) + amt; } }
  subRes(c, r, amt, tag) { const co = this.countries[c]; co.res[r] -= amt; co.fc[r] += amt; if (tag) { const m = co.fbyC[r] || (co.fbyC[r] = {}); m[tag] = (m[tag] || 0) + amt; } }
  rollFlows() {
    for (const d of this.deposits.list) { d.rate = (d.drawn || 0) - (d.drawnPrev || 0); d.drawnPrev = d.drawn || 0; }
    for (const co of this.countries) { co.flowP = co.fp.slice(); co.flowC = co.fc.slice(); co.flowByP = co.fbyP; co.flowByC = co.fbyC; co.fp.fill(0); co.fc.fill(0); co.fbyP = []; co.fbyC = []; }
  }
  issue(cmd) {
    if (cmd.tick === undefined || cmd.tick <= this.tick) cmd.tick = this.tick + 1;
    this.cmds.push(cmd);
  }

  step() {
    if (this.over) { this.tick++; return; }
    if (this.phase === 'setup') { for (const cmd of this.cmds.take(this.tick)) executeCommand(this, cmd); this.tick++; this.setupTicks = this.tick; return; } // başkent seçimi bekleniyor (saat işlemez)
    const e = this.e;
    // önceki konumlar (render interpolasyonu)
    e.px.set(e.x.subarray(0, e.hi)); e.py.set(e.y.subarray(0, e.hi)); e.pz.set(e.z.subarray(0, e.hi));
    // 1. komutlar
    for (const cmd of this.cmds.take(this.tick)) executeCommand(this, cmd);
    if (this.delayed.length) {
      const now = this.delayed.filter((d) => d.tick <= this.tick); this.delayed = this.delayed.filter((d) => d.tick > this.tick);
      for (const d of now) executeCommand(this, d.cmd);
    }
    // 2. yapay zekâ (komut üretir)
    updateAI(this);
    // 3. çevre
    updateWeather(this);
    // 4. ağlar
    updateNetworks(this);
    // 5. ekonomi, inşaat, lojistik
    updateConstruction(this);
    updateEconomy(this);
    updateLogistics(this);
    // 6. uzamsal ızgara + algılayıcılar
    this.grid.rebuild(e);
    updateSensors(this);
    updateEW(this);
    if (this.tick % 5 === 0) updateVisibility(this);
    if (this.tick % 10 === 3) updateSigint(this);
    // 7. hareket ve çatışma
    updateAir(this);
    updateProjectiles(this);
    updateAD(this);
    updateGround(this);
    updateFlood(this);
    updateFire(this); recoverBurnt(this);
    updateTerritory(this);
    if (this.tick % 60 === 59) this.rollFlows();
    // 8. diplomasi ve zafer
    updateDiplomacy(this);
    e.flush();
    this.tick++;
  }

  // durum özeti (determinizm doğrulama / lockstep checksum)
  checksum() {
    const e = this.e; let h = 2166136261 >>> 0;
    const mix = (v) => { h ^= v >>> 0; h = Math.imul(h, 16777619) >>> 0; };
    mix(this.tick); mix(e.hi); mix(e.count);
    const fx = new Uint32Array(e.x.buffer, 0, e.hi), fy = new Uint32Array(e.y.buffer, 0, e.hi), fh = new Uint32Array(e.hp.buffer, 0, e.hi);
    for (let i = 0; i < e.hi; i++) { if (!e.kind[i]) continue; mix(e.kind[i] | (e.owner[i] << 8)); mix(fx[i]); mix(fy[i]); mix(fh[i]); }
    for (const co of this.countries) { mix(Math.floor(co.money)); mix(Math.floor(co.res[R.steel] * 100)); }
    return h >>> 0;
  }
}
