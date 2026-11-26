// ECS çekirdeği: SoA TypedArray sütunları. Varlık = indeks. Bileşen = maske biti + sütunlar.
export const KIND = { NONE: 0, BUILDING: 1, GROUND: 2, AIR: 3, NAVAL: 4, PROJ: 5, CONVOY: 6, CITY: 7 };

// Bileşen bitleri (sistem sorguları için)
export const C = {
  POS: 1 << 0, MOVE: 1 << 1, BUILDING: 1 << 2, UNIT: 1 << 3, AIR: 1 << 4, GROUND: 1 << 5, NAVAL: 1 << 6,
  PROJ: 1 << 7, CONVOY: 1 << 8, CITY: 1 << 9, RADAR: 1 << 10, AD: 1 << 11, JAMMER: 1 << 12, EMIT: 1 << 13,
  POWER: 1 << 14, COMMS: 1 << 15, VISION: 1 << 16, SIGINT: 1 << 17, BASE: 1 << 18, LAUNCHER: 1 << 19,
  FACTORY: 1 << 20, FUELNET: 1 << 21, WATER: 1 << 22, DEPOT: 1 << 23, ARTY: 1 << 24,
};
// Durum bayrakları
export const F = {
  RUINED: 1 << 0, EMIT_ON: 1 << 1, REVEALED: 1 << 2, LINKLOST: 1 << 3, BURNING: 1 << 4, LINKED: 1 << 5,
  POWERED: 1 << 6, MOVING: 1 << 7, LOWALT: 1 << 8, DEAD: 1 << 9, HARDENED: 1 << 10, BUILDING: 1 << 11,
  RETURNING: 1 << 12, GPSJAM: 1 << 13, CONNECTED: 1 << 14, CAPITAL: 1 << 15, GENERATOR: 1 << 16,
  JAMMED: 1 << 17, WATERED: 1 << 18, FUELED: 1 << 19, SPOOFED: 1 << 20, AUTONOMOUS: 1 << 21,
};

const F32 = ['x', 'y', 'px', 'py', 'z', 'pz', 'vx', 'vy', 'hp', 'maxhp', 'tx', 'ty', 'timer', 'fuel', 'ammo',
  'supply', 'entrench', 'prog', 'ox', 'oy', 'speed', 'heading', 'buf', 'cool', 'sat'];
const I32 = ['target', 'group', 'home', 'parent', 'wp', 'aux'];
const U8 = ['kind', 'owner', 'state', 'band', 'prio', 'mode', 'res'];
const U16 = ['def', 'item'];
const U32 = ['mask', 'flags', 'seenBy', 'jamBands'];
export const COLUMNS = { F32, I32, U8, U16, U32 };

export class EntityStore {
  constructor(cap = 32768) {
    this.cap = cap;
    for (const n of F32) this[n] = new Float32Array(cap);
    for (const n of I32) this[n] = new Int32Array(cap).fill(-1);
    for (const n of U8) this[n] = new Uint8Array(cap);
    for (const n of U16) this[n] = new Uint16Array(cap);
    for (const n of U32) this[n] = new Uint32Array(cap);
    this.free = [];
    this.hi = 0; // en yüksek kullanılan indeks + 1
    this.count = 0;
    this.pendingDestroy = [];
    this.routes = new Map(); // id -> Float32Array [x,y,x,y,...]
    this.cargo = new Map(); // id -> {res, amount, dest}
  }
  create(kind, def, owner, x, y, mask) {
    let id;
    if (this.free.length) id = this.free.pop();
    else { if (this.hi >= this.cap) return -1; id = this.hi++; }
    for (const n of F32) this[n][id] = 0;
    for (const n of I32) this[n][id] = -1;
    for (const n of U8) this[n][id] = 0;
    for (const n of U16) this[n][id] = 0;
    for (const n of U32) this[n][id] = 0;
    this.kind[id] = kind; this.def[id] = def; this.owner[id] = owner;
    this.x[id] = this.px[id] = x; this.y[id] = this.py[id] = y;
    this.mask[id] = mask | C.POS;
    this.count++;
    return id;
  }
  alive(id) { return id >= 0 && id < this.hi && this.kind[id] !== 0 && !(this.flags[id] & F.DEAD); }
  kill(id) {
    if (!this.alive(id)) return;
    this.flags[id] |= F.DEAD;
    this.pendingDestroy.push(id);
  }
  flush() {
    // ters sırada serbest bırak -> deterministik tekrar kullanım
    const p = this.pendingDestroy;
    for (let i = 0; i < p.length; i++) {
      const id = p[i];
      if (this.kind[id] === 0) continue;
      this.kind[id] = 0; this.mask[id] = 0;
      this.routes.delete(id); this.cargo.delete(id);
      this.free.push(id); this.count--;
    }
    p.length = 0;
  }
  dist2(a, b) { const dx = this.x[a] - this.x[b], dy = this.y[a] - this.y[b]; return dx * dx + dy * dy; }
  // her varlık için: fn(id)
  each(mask, fn) {
    const m = this.mask, k = this.kind, fl = this.flags;
    for (let i = 0, n = this.hi; i < n; i++) if (k[i] && (m[i] & mask) === mask && !(fl[i] & F.DEAD)) fn(i);
  }
  list(mask) { const out = []; this.each(mask, (i) => out.push(i)); return out; }
}
