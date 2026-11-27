// Komut katmanı: oyuncu ve YZ dünyayı yalnız Command nesneleriyle değiştirir.
// Her komut {type, c(ülke), tick(yürütme), seq, ...yük}. Ağ katmanı (net/) bu nesneleri taşır.
export const CMD = {
  BUILD: 1, DEMOLISH: 2, SET_PRODUCT: 3, REPAIR_PRIO: 4, TOGGLE_EMIT: 5, SET_JAM: 6,
  MISSION: 7, FIRE_MISSILE: 8, MOVE_UNITS: 9, RECALL: 10, RESEARCH: 11, DIPLO: 12,
  SET_BAND: 13, PRODUCE_UNIT: 14, SET_ROUTE: 15, CANCEL_BUILD: 16, MARKET: 17, RULE: 18, FOUND_CAPITAL: 19,
};
export const CMD_NAME = Object.fromEntries(Object.entries(CMD).map(([k, v]) => [v, k]));

const handlers = new Map();
export function registerCommand(type, fn) { handlers.set(type, fn); }

export class CommandQueue {
  constructor() { this.pending = []; this.seq = 0; this.history = []; this.record = false; }
  push(cmd) {
    cmd.seq = this.seq++;
    this.pending.push(cmd);
  }
  // tick için yürütülecek komutları deterministik sırada al: (tick, c, seq)
  take(tick) {
    const out = [], keep = [];
    for (const c of this.pending) (c.tick <= tick ? out : keep).push(c);
    this.pending = keep;
    out.sort((a, b) => a.tick - b.tick || a.c - b.c || a.seq - b.seq);
    return out;
  }
}

export function executeCommand(sim, cmd) {
  const h = handlers.get(cmd.type);
  if (!h) return false;
  const co = sim.countries[cmd.c];
  if (!co || !co.alive) return false;
  try { return h(sim, cmd) !== false; } catch (e) { if (sim.debug) console.error('cmd', cmd, e); return false; }
}

// Ağ için kompakt serileştirme
export function encodeCommand(c) { return JSON.stringify(c); }
export function decodeCommand(s) { return JSON.parse(s); }
