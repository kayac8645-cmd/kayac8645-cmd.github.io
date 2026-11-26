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

export const SIM_VERSION = 3;
export const TICK_MS = 100;
export const MAX_COUNTRIES = 24;

export class Simulation {
  constructor(opts) {
    this.opts = Object.assign({ seed: 1, size: 256, countries: 4, difficulty: 1, player: 0, allAI: false }, opts);
    const o = this.opts;
    this.tick = 0;
    this.rng = new RNG(o.seed ^ 0xa5a5a5);
    this.world = generateWorld({ seed: o.seed, size: o.size, countries: o.countries });
    this.map = this.world.map;
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
    this.delayed = []; // gecikmeli emirler (haberleşme kopukluğu)
    this.groups = 0;
    this.winner = -1; this.over = false;
    this.debug = false;
    const n = this.world.countries.length;
    this.countries = this.world.countries.map((ci, k) => {
      const ai = o.allAI || k !== o.player;
      const pers = PERSONALITIES[(o.seed + k * 7) % PERSONALITIES.length];
      return createCountry(ci, this.map, ai, ai ? pers : null);
    });
    this.diplo = new Diplomacy(n);
    initEnv(this);
    this.setupInitial();
    initAI(this);
  }

  // ---- yardımcılar ----
  bdef(id) { return BUILDINGS[this.e.def[id]]; }
  udef(id) { return UNITS[this.e.def[id]]; }
  pdef(id) { return PROJS[this.e.def[id]]; }
  has(c, techId) { return this.countries[c].tech[TECH_BY[techId]] === 1; }
  mod(c, key, def = 1) { const v = this.countries[c].mods[key]; return v === undefined ? def : v; }
  atWar(a, b) { return a !== b && this.diplo.atWar(a, b); }
  allied(a, b) { return a === b || this.diplo.allied(a, b); }
  techOk(c, t) { return !t || this.has(c, t); }
  canAfford(c, cost, mul = 1) {
    const co = this.countries[c];
    for (const k in cost) { const v = cost[k] * mul; if (k === 'money') { if (co.money < v) return false; } else if (co.res[R[k]] < v - 1e-9) return false; }
    return true;
  }
  pay(c, cost, mul = 1) {
    const co = this.countries[c];
    for (const k in cost) { const v = cost[k] * mul; if (k === 'money') co.money -= v; else co.res[R[k]] -= v; }
  }
  emit(ev) { if (this.events.length < this.maxEvents) this.events.push(ev); }
  notify(c, key, args, x, y, lvl = 1) {
    const ent = { t: this.tick, c, key, args: args || [], x: x ?? -1, y: y ?? -1, lvl };
    this.log.push(ent); if (this.log.length > 400) this.log.shift();
    this.emit({ k: 'note', ...ent });
  }
  newGroup() { return ++this.groups; }

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

  // ---- başlangıç kurulumu: başkent + kasabalar + küçük çekirdek ----
  setupInitial() {
    const map = this.map, e = this.e;
    // köprüler
    for (const i of this.world.bridges) {
      const id = e.create(KIND.BUILDING, B.bridge, 255, (i % map.W) + 0.5, ((i / map.W) | 0) + 0.5, C.BUILDING);
      e.hp[id] = e.maxhp[id] = BUILDINGS[B.bridge].hp; e.aux[id] = i; e.ox[id] = i % map.W; e.oy[id] = (i / map.W) | 0;
    }
    for (const co of this.countries) {
      const info = this.world.countries[co.id];
      const mk = (x, y, name, pop, capital) => {
        const id = e.create(KIND.CITY, 0, co.id, x + 0.5, y + 0.5, C.CITY);
        e.hp[id] = e.maxhp[id] = 100 + pop / 50; e.buf[id] = pop; e.supply[id] = 0.75;
        e.prog[id] = Math.ceil(2 + Math.sqrt(pop) / 22); // yarıçap
        this.cityInfo.set(id, { name, capital, seed: (x * 7919 + y * 31) | 0, pop0: pop });
        if (capital) { co.capitalCity = id; e.flags[id] |= F.CAPITAL; }
        // şehir alanını işaretle (bina yerleşimi engeli değil, görsel)
        return id;
      };
      mk(info.capital.x, info.capital.y, info.capital.name, 14000, true);
      for (const tw of info.towns) mk(tw.x, tw.y, tw.name, 3000 + this.rng.int(3000), false);
      const cx = info.capital.x, cy = info.capital.y;
      const put = (defId, near, r = 14) => {
        const d = B[defId]; const [nx, ny] = near || [cx, cy];
        const s = findSpot(this, co.id, d, nx, ny, r, this.rng);
        if (!s) return -1;
        return placeBuilding(this, co.id, d, s[0], s[1], { instant: true, free: true });
      };
      co.hq = put('hq', [cx, cy], 8);
      if (co.hq >= 0) e.flags[co.hq] |= F.CAPITAL;
      put('coal_plant', [cx + 6, cy], 16);
      put('substation', [cx - 4, cy + 4], 12);
      put('depot', [cx, cy + 5], 12);
      put('barracks', [cx - 5, cy], 12);
      put('drone_base', [cx + 3, cy - 6], 14);
      put('steel_mill', [cx - 6, cy - 5], 16);
      // en yakın kömür ve demir yatağına maden
      for (const r of [2, 1]) {
        const dep = this.findDeposit(co.id, cx, cy, r, 30);
        if (dep) { const s = findSpot(this, co.id, B.mine, dep[0], dep[1], 3, this.rng, true); if (s) placeBuilding(this, co.id, B.mine, s[0], s[1], { instant: true, free: true }); }
      }
      for (const tw of info.towns) {
        const s = findSpot(this, co.id, B.substation, tw.x + 2, tw.y + 2, 6, this.rng);
        if (s) placeBuilding(this, co.id, B.substation, s[0], s[1], { instant: true, free: true });
      }
      // birimler
      const sp = (uid, dx, dy) => { const id = this.spawnUnit(co.id, UNIT_BY[uid], cx + dx, cy + dy); return id; };
      sp('inf', 3, 3); sp('inf', -3, 3); sp('engineer', 0, 3); sp('ad_bat', 1, -2); sp('mlrs', -2, -3);
      co.territory0 = 0;
    }
    // toprak sayımı
    const cnt = new Int32Array(this.countries.length);
    for (let i = 0; i < map.N; i++) if (map.owner[i] < cnt.length) cnt[map.owner[i]]++;
    this.countries.forEach((co, k) => { co.territory = co.territory0 = cnt[k]; });
  }
  findDeposit(c, x, y, res, r) {
    const map = this.map; let best = null, bd = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx, ny = y + dy; if (!map.inb(nx, ny)) continue;
      const i = ny * map.W + nx;
      if (map.res[i] === res && map.owner[i] === c && !map.occ[i]) { const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [nx, ny]; } }
    }
    return best;
  }

  issue(cmd) {
    if (cmd.tick === undefined || cmd.tick <= this.tick) cmd.tick = this.tick + 1;
    this.cmds.push(cmd);
  }

  step() {
    if (this.over) { this.tick++; return; }
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
