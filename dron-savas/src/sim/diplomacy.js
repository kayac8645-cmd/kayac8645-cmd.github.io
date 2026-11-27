// Diplomasi: savaş, ateşkes, ittifak, ticaret, silah satışı, ihanet; teslimiyet ve zafer.
// Matrisler 24 ülkeye kadar ölçeklenir.
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { ITEM_BY, ITEMS, R } from '../data/defs.js';
export const DS = { PEACE: 0, WAR: 1, CEASEFIRE: 2, ALLIANCE: 3 };
const MAXC = 24;

export class Diplomacy {
  constructor(n) {
    this.n = n;
    this.state = new Uint8Array(MAXC * MAXC);
    this.rel = new Int8Array(MAXC * MAXC);
    this.timer = new Int32Array(MAXC * MAXC);
    this.proposals = []; // oyuncuya gelen öneriler
    this.pid = 1;
  }
  get(a, b) { return this.state[a * MAXC + b]; }
  set(a, b, s, t = 0) { this.state[a * MAXC + b] = this.state[b * MAXC + a] = s; this.timer[a * MAXC + b] = this.timer[b * MAXC + a] = t; }
  relOf(a, b) { return this.rel[a * MAXC + b]; }
  addRel(a, b, v) { for (const [x, y] of [[a, b], [b, a]]) { const k = x * MAXC + y; this.rel[k] = Math.max(-100, Math.min(100, this.rel[k] + v)); } }
  atWar(a, b) { return this.state[a * MAXC + b] === DS.WAR; }
  allied(a, b) { return this.state[a * MAXC + b] === DS.ALLIANCE; }
  warCount(a) { let n = 0; for (let b = 0; b < this.n; b++) if (b !== a && this.state[a * MAXC + b] === DS.WAR) n++; return n; }
  // savaş maskesi (bit maskesi; 24 bit)
  warMask(a) { let m = 0; for (let b = 0; b < this.n; b++) if (this.state[a * MAXC + b] === DS.WAR) m |= 1 << b; return m >>> 0; }
}

export function militaryStrength(sim, c) {
  const e = sim.e; let s = 0;
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || e.owner[i] !== c || (e.flags[i] & F.DEAD)) continue;
    if (e.kind[i] === KIND.GROUND || e.kind[i] === KIND.NAVAL) s += e.hp[i] / 10;
    else if (e.kind[i] === KIND.BUILDING && (e.mask[i] & (C.AD | C.FACTORY)) && !(e.flags[i] & F.RUINED)) s += 4;
  }
  const co = sim.countries[c];
  for (let k = 0; k < ITEMS.length; k++) s += co.items[k] * (ITEMS[k].cost.money / 200);
  return s + co.money / 1000;
}

export function declareWar(sim, a, b) {
  const d = sim.diplo; if (d.atWar(a, b) || a === b) return;
  const wasAlly = d.allied(a, b);
  d.set(a, b, DS.WAR); d.addRel(a, b, -60);
  for (let k = 0; k < sim.countries.length; k++) { // ihanet itibarı
    if (k !== a && k !== b && sim.countries[k].alive) d.addRel(a, k, wasAlly ? -25 : -8);
  }
  sim.notify(-1, wasAlly ? 'n_betrayal' : 'n_war', [sim.countries[a].name, sim.countries[b].name], -1, -1, 3);
  sim.emit({ k: 'war', a, b });
  // müttefikler savaşa katılır
  for (let k = 0; k < sim.countries.length; k++) {
    if (!sim.countries[k].alive || k === a || k === b) continue;
    if (d.allied(k, b) && !d.allied(k, a)) { d.set(k, a, DS.WAR); sim.notify(-1, 'n_joinwar', [sim.countries[k].name, sim.countries[a].name], -1, -1, 2); }
  }
}

// YZ önerileri değerlendirir (oyuncu için sim.diplo.proposals'a gider)
export function aiAccept(sim, from, to, action) {
  const co = sim.countries[to]; const p = co.personality || {};
  const sf = militaryStrength(sim, from), st = militaryStrength(sim, to);
  const ratio = sf / Math.max(1, st); const rel = sim.diplo.relOf(from, to);
  if (action === 'peace' || action === 'ceasefire') {
    const losing = co.territory < (co.territoryMax || co.territory0) * 0.85 || ratio > 1.3;
    const score = (losing ? 0.5 : 0) + (1 - (p.aggr ?? 0.5)) * 0.4 + rel / 300 + (action === 'ceasefire' ? 0.15 : 0);
    return score > 0.45;
  }
  if (action === 'alliance') {
    const commonEnemy = sim.countries.some((x, k) => x.alive && sim.atWar(from, k) && sim.atWar(to, k));
    return (p.alliance ?? 0.5) * 0.6 + (commonEnemy ? 0.35 : 0) + rel / 200 > 0.6;
  }
  if (action === 'trade') return rel > -30 && !sim.atWar(from, to);
  if (action === 'buy') return rel > -10 && !sim.atWar(from, to);
  return false;
}

function applyAction(sim, from, to, a, data) {
  const d = sim.diplo;
  if (a === 'peace') { d.set(from, to, DS.PEACE); d.addRel(from, to, 20); sim.notify(-1, 'n_peace', [sim.countries[from].name, sim.countries[to].name], -1, -1, 2); }
  else if (a === 'ceasefire') { d.set(from, to, DS.CEASEFIRE, 900); d.addRel(from, to, 10); sim.notify(-1, 'n_ceasefire', [sim.countries[from].name, sim.countries[to].name], -1, -1, 2); }
  else if (a === 'alliance') { d.set(from, to, DS.ALLIANCE); d.addRel(from, to, 30); sim.notify(-1, 'n_alliance', [sim.countries[from].name, sim.countries[to].name], -1, -1, 2); }
  else if (a === 'trade') { sim.countries[from].trades.push({ with: to, give: data.give, get: data.get, amt: data.amt || 0.5 }); d.addRel(from, to, 10); sim.notify(from, 'n_trade', [sim.countries[to].name], -1, -1, 1); }
  else if (a === 'buy') { // from, to'dan kalem satın alır
    const it = ITEM_BY[data.item]; const n = Math.min(data.n | 0, Math.floor(sim.countries[to].items[it]));
    const price = ITEMS[it].cost.money * 1.6 * n;
    if (n > 0 && sim.countries[from].money >= price) {
      sim.countries[from].money -= price; sim.countries[to].money += price;
      sim.countries[to].items[it] -= n; sim.countries[from].items[it] += n; d.addRel(from, to, 6);
      sim.notify(from, 'n_bought', [n, 'i_' + data.item, sim.countries[to].name], -1, -1, 1);
      sim.notify(to, 'n_sold', [n, 'i_' + data.item, sim.countries[from].name], -1, -1, 1);
    }
  }
}

registerCommand(CMD.DIPLO, (sim, cmd) => {
  const from = cmd.c, to = cmd.target, a = cmd.action, d = sim.diplo;
  if (a === 'respond') { // oyuncu yanıtı
    const pr = d.proposals.find((p) => p.id === cmd.pid && p.to === from); if (!pr) return false;
    d.proposals = d.proposals.filter((p) => p !== pr);
    if (cmd.accept) applyAction(sim, pr.from, pr.to, pr.action, pr.data); else d.addRel(pr.from, pr.to, -5);
    return;
  }
  if (to === undefined || to === from || !sim.countries[to] || !sim.countries[to].alive) return false;
  if (a === 'war') return declareWar(sim, from, to);
  if (a === 'break') { if (d.allied(from, to)) { d.set(from, to, DS.PEACE); d.addRel(from, to, -30); sim.notify(-1, 'n_break', [sim.countries[from].name, sim.countries[to].name], -1, -1, 2); } return; }
  if ((a === 'peace' || a === 'ceasefire') && !d.atWar(from, to) && d.get(from, to) !== DS.CEASEFIRE) return false;
  const target = sim.countries[to];
  if (!target.ai) { d.proposals.push({ id: d.pid++, from, to, action: a, data: cmd.data || {}, t: sim.tick }); sim.notify(to, 'n_proposal', [sim.countries[from].name, 'd_' + a], -1, -1, 2); return; }
  if (aiAccept(sim, from, to, a)) applyAction(sim, from, to, a, cmd.data || {});
  else if (!sim.countries[from].ai) sim.notify(from, 'n_rejected', [target.name, 'd_' + a], -1, -1, 1);
});

export function annex(sim, loser, winner, why) {
  const e = sim.e, map = sim.map; const L = sim.countries[loser];
  if (!L.alive) return;
  L.alive = false;
  for (let i = 0; i < map.N; i++) if (map.owner[i] === loser) map.owner[i] = winner;
  map.markDirtyArea(0, 0, map.W, map.H);
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || e.owner[i] !== loser) continue;
    if (e.kind[i] === KIND.BUILDING || e.kind[i] === KIND.CITY) { e.owner[i] = winner; e.flags[i] &= ~F.CAPITAL; }
    else e.kill(i);
  }
  for (let k = 0; k < sim.countries.length; k++) sim.diplo.set(loser, k, DS.PEACE);
  sim.countries[winner].money += L.money * 0.5;
  sim.notify(-1, why === 'capital' ? 'n_capital_fell' : 'n_surrender', [L.name, sim.countries[winner].name], -1, -1, 3);
  sim.emit({ k: 'eliminated', c: loser, by: winner });
  sim.dirty.power = sim.dirty.comms = sim.dirty.roads = sim.dirty.water = sim.dirty.fuel = true;
}

export function updateDiplomacy(sim) {
  const d = sim.diplo, n = sim.countries.length, t = sim.tick;
  if (t % 10 === 6) {
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
      const k = a * MAXC + b;
      if (d.state[k] === DS.CEASEFIRE) { d.timer[k] -= 10; d.timer[b * MAXC + a] = d.timer[k]; if (d.timer[k] <= 0) { d.set(a, b, DS.PEACE); } }
    }
    d.proposals = d.proposals.filter((p) => t - p.t < 1200);
  }
  if (t % 200 === 150) {
    // toprak sayımı + teslimiyet
    const cnt = new Int32Array(n); const map = sim.map;
    for (let i = 0; i < map.N; i++) if (map.owner[i] < n) cnt[map.owner[i]]++;
    for (let c = 0; c < n; c++) {
      const co = sim.countries[c]; co.territory = cnt[c]; co.territoryMax = Math.max(co.territoryMax || 0, cnt[c]);
      if (!co.alive || d.warCount(c) === 0) { co.surrenderScore = 0; continue; }
      const terr = 1 - co.territory / Math.max(1, co.territoryMax || co.territory0);
      const econ = co.power.demand > 0 ? 1 - Math.min(1, co.power.supply / co.power.demand) : 0;
      const mil = militaryStrength(sim, c);
      co.surrenderScore = terr * 0.55 + (1 - co.morale) * 0.3 + econ * 0.15 + (mil < 8 ? 0.15 : 0);
      if (co.surrenderScore > 0.7 && t > 3000) {
        let best = -1, bs = -1;
        for (let k = 0; k < n; k++) if (sim.countries[k].alive && d.atWar(c, k)) { const s = militaryStrength(sim, k); if (s > bs) { bs = s; best = k; } }
        if (best >= 0) annex(sim, c, best, 'surrender');
      }
    }
  }
  // zafer
  if (t % 50 === 25) {
    const alive = sim.countries.filter((c) => c.alive);
    if (alive.length === 1) { sim.over = true; sim.winner = alive[0].id; sim.emit({ k: 'victory', c: alive[0].id }); sim.notify(-1, 'n_victory', [alive[0].name], -1, -1, 3); }
    else if (alive.length > 1 && alive.every((a) => alive.every((b) => a === b || d.allied(a.id, b.id)))) {
      // sonda tek kazanan kalır: ittifaklar dağılır
      for (const a of alive) for (const b of alive) if (a.id < b.id) d.set(a.id, b.id, DS.PEACE);
      sim.notify(-1, 'n_alliance_end', [], -1, -1, 3);
    }
    const p = sim.opts.player; if (!sim.opts.allAI && sim.countries[p] && !sim.countries[p].alive && !sim.over) { sim.over = true; sim.winner = -2; sim.emit({ k: 'defeat' }); }
  }
}
