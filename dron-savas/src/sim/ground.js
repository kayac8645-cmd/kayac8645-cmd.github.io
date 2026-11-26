// Kara cephesi: batalyonlar, hedef-tabanlı emirler (tut/ilerle/saldır/köprü al), yol bulma, tahkimat,
// çatışma, topçu, dinamik toprak kontrolü (cephe hattı), başkent ele geçirme. Gemiler de burada hareket eder.
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { UNITS, PROJ_BY, R } from '../data/defs.js';
import { BUILDINGS } from '../data/buildings.js';
import { T } from '../world/map.js';
import { applyDamage } from './damage.js';
import { annex } from './diplomacy.js';

export const GM = { HOLD: 0, MOVE: 1, ATTACK: 2 };
const SPIRAL = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [0, 2], [-2, 0], [0, -2], [2, 1], [1, 2], [-2, 1], [-1, 2], [2, -1]];

registerCommand(CMD.MOVE_UNITS, (sim, cmd) => {
  const e = sim.e, map = sim.map; let n = 0;
  const late = []; let lead = null;
  for (const id of cmd.ids || []) {
    if (!e.alive(id) || e.owner[id] !== cmd.c) continue;
    const k = e.kind[id]; if (k !== KIND.GROUND && k !== KIND.NAVAL) continue;
    if (UNITS[e.def[id]].role === 'naval') continue;
    // haberleşme kopuksa emir gecikir
    if (!cmd.delayed && !(e.flags[id] & F.LINKED)) { late.push(id); continue; }
    const off = SPIRAL[n++ % SPIRAL.length];
    let tx = Math.floor(cmd.x) + off[0], ty = Math.floor(cmd.y) + off[1];
    if (!map.inb(tx, ty)) { tx = cmd.x | 0; ty = cmd.y | 0; }
    e.mode[id] = cmd.mode ?? GM.MOVE;
    if (cmd.mode === GM.HOLD) { e.routes.delete(id); e.tx[id] = e.x[id]; e.ty[id] = e.y[id]; continue; }
    const pass = k === KIND.NAVAL ? (i) => map.navalPass(i) : (i) => map.groundPass(i);
    let p = null;
    // grup: lider yolunu paylaş (yakın başlangıç), son karo ofsetli
    if (lead && k === lead.k && Math.abs(e.x[id] - lead.x) + Math.abs(e.y[id] - lead.y) < 6) {
      p = lead.p.slice(); const ti = ty * map.W + tx;
      if (map.inb(tx, ty) && pass(ti)) p[p.length - 1] = ti;
    } else {
      p = map.astar(e.x[id] | 0, e.y[id] | 0, tx, ty, pass, 20000, true);
      if (p && p.length) lead = { k, x: e.x[id], y: e.y[id], p };
    }
    if (!p || !p.length) continue;
    e.routes.set(id, Int32Array.from(p)); e.wp[id] = 0;
    const last = p[p.length - 1]; e.tx[id] = (last % map.W) + 0.5; e.ty[id] = ((last / map.W) | 0) + 0.5;
  }
  if (late.length) {
    sim.delayed.push({ tick: sim.tick + 30, cmd: { ...cmd, ids: late, delayed: true } });
    if (!sim.countries[cmd.c].ai) sim.notify(cmd.c, 'n_delayed', [], -1, -1, 1);
  }
});

function terrainDef(sim, x, y) {
  const map = sim.map; if (!map.inb(x | 0, y | 0)) return 1;
  const i = map.idx(x | 0, y | 0), t = map.ter[i];
  let d = t === T.FOREST ? 1.3 : t === T.HILL ? 1.35 : t === T.MOUNTAIN ? 1.6 : t === T.SWAMP ? 1.15 : 1;
  if (map.occ[i]) d += 0.25; // yapı içinde
  return d;
}

export function updateGround(sim) {
  const e = sim.e, map = sim.map, env = sim.env, nC = sim.countries.length;
  for (let i = 0, n = e.hi; i < n; i++) {
    const k = e.kind[i]; if ((k !== KIND.GROUND && k !== KIND.NAVAL) || (e.flags[i] & F.DEAD)) continue;
    const u = UNITS[e.def[i]]; if (u.role === 'naval') continue;
    const c = e.owner[i], co = sim.countries[c];
    // ikmal ve yakıt tüketimi
    e.supply[i] = Math.max(0, e.supply[i] - u.supUse * 0.15);
    const fueled = !u.fuelUse || co.res[R.fuel] > 0.5;
    // hareket
    const path = e.routes.get(i);
    let moving = false;
    if (path && e.wp[i] < path.length) {
      const ti = path[e.wp[i]];
      const pass = k === KIND.NAVAL ? map.navalPass(ti) : map.groundPass(ti);
      if (!pass) { e.routes.delete(i); }
      else {
        const gx = (ti % map.W) + 0.5, gy = ((ti / map.W) | 0) + 0.5;
        const dx = gx - e.x[i], dy = gy - e.y[i], d = Math.sqrt(dx * dx + dy * dy);
        let sp = u.speed * (k === KIND.NAVAL ? 1 : 1 / Math.max(0.5, pass)) * (0.45 + 0.55 * e.supply[i]) * (fueled ? 1 : 0.3);
        if (k === KIND.GROUND && !(map.road[ti] & 1)) sp *= env.groundMul;
        if (e.flags[i] & F.JAMMED) sp *= 0.9;
        if (d <= sp) { e.x[i] = gx; e.y[i] = gy; e.wp[i]++; } else { e.x[i] += dx / d * sp; e.y[i] += dy / d * sp; e.vx[i] = dx / d; e.vy[i] = dy / d; }
        moving = true;
        if (u.fuelUse) co.res[R.fuel] = Math.max(0, co.res[R.fuel] - u.fuelUse);
      }
    } else if (path) e.routes.delete(i);
    if (moving) { e.flags[i] |= F.MOVING; e.entrench[i] = Math.max(0, e.entrench[i] - 0.01); }
    else { e.flags[i] &= ~F.MOVING; if (k === KIND.GROUND) e.entrench[i] = Math.min(1, e.entrench[i] + 0.0012 * sim.mod(c, 'entrench', 1)); }
    if (e.cool[i] > 0) e.cool[i]--;
    // çatışma
    if (u.atk > 0 && e.cool[i] <= 0 && e.supply[i] > 0.02) combat(sim, i, u, c);
  }
  if (sim.tick % 10 === 4) territory(sim);
}

function combat(sim, i, u, c) {
  const e = sim.e;
  const range = u.range; const bit = (1 << c) >>> 0;
  let best = -1, bs = -1e9;
  sim.grid.query(e.x[i], e.y[i], range + 1.5, (j, d2) => {
    const kj = e.kind[j]; if (kj === KIND.AIR || kj === KIND.PROJ || kj === KIND.CITY) return;
    const oj = e.owner[j]; if (oj >= sim.countries.length || !sim.atWar(c, oj)) return;
    if (!(e.seenBy[j] & bit) && d2 > 9) return;
    if (kj === KIND.BUILDING && (e.flags[j] & F.RUINED)) return;
    if (kj === KIND.BUILDING && u.role !== 'arty' && d2 > (range + 1) * (range + 1)) return;
    const s = (kj === KIND.GROUND || kj === KIND.NAVAL ? 10 : kj === KIND.CONVOY ? 8 : 4) - Math.sqrt(d2);
    if (s > bs) { bs = s; best = j; }
  });
  if (best < 0) return;
  const j = best;
  if (u.role === 'arty') {
    sim.spawnProj(c, PROJ_BY.shell, e.x[i], e.y[i], e.x[j], e.y[j], { from: i });
    e.cool[i] = u.cool; e.supply[i] = Math.max(0, e.supply[i] - 0.01);
    if (sim.tick % 3 === 0) sim.emit({ k: 'launch', x: e.x[i], y: e.y[i], small: true, owner: c, gun: true });
    return;
  }
  const strength = e.hp[i] / e.maxhp[i];
  let dmg = u.atk * (0.3 + 0.7 * strength) * (0.4 + 0.6 * e.supply[i]);
  if (e.kind[j] === KIND.GROUND) {
    const uj = UNITS[e.def[j]];
    dmg *= 1 / (1 + e.entrench[j] * 1.2) / terrainDef(sim, e.x[j], e.y[j]);
    dmg *= 8 / Math.max(2, uj.def);
    if (u.id === 'armor' && uj.soft > 0.8) dmg *= 1.2;
  }
  applyDamage(sim, j, dmg * 0.5, c, { cause: 'ground' });
  e.cool[i] = 5; e.supply[i] = Math.max(0, e.supply[i] - 0.003);
  if ((sim.tick + i) % 3 === 0) sim.emit({ k: 'shot', x: e.x[i], y: e.y[i], tx: e.x[j], ty: e.y[j] });
}

// dinamik toprak kontrolü: düşman toprağındaki birimler, karşı koyan güç yoksa bölgeyi alır
function territory(sim) {
  const e = sim.e, map = sim.map, nC = sim.countries.length;
  const changedOwners = new Set();
  for (let i = 0; i < e.hi; i++) {
    if (e.kind[i] !== KIND.GROUND || (e.flags[i] & F.DEAD)) continue;
    const u = UNITS[e.def[i]]; if (u.role !== 'line' && u.role !== 'engineer') continue;
    if (e.hp[i] < e.maxhp[i] * 0.25 || e.supply[i] < 0.1) continue;
    const c = e.owner[i]; const x = e.x[i] | 0, y = e.y[i] | 0;
    const ti = map.idx(x, y), o = map.owner[ti];
    // yakın komşuluk: düşman toprağına bitişik mi?
    let target = -1;
    if (o !== c && o < nC && sim.atWar(c, o)) target = o;
    else {
      for (let dy = -2; dy <= 2 && target < 0; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (!map.inb(x + dx, y + dy)) continue; const oo = map.owner[map.idx(x + dx, y + dy)];
        if (oo !== c && oo < nC && sim.atWar(c, oo)) { target = oo; break; }
      }
    }
    if (target < 0) continue;
    // karşı koyan düşman kara birimi var mı?
    let contested = false;
    sim.grid.query(e.x[i], e.y[i], 4, (j) => {
      if (e.kind[j] === KIND.GROUND && e.owner[j] === target && e.hp[j] > e.maxhp[j] * 0.2) { contested = true; return true; }
    });
    if (contested) continue;
    const r = 2;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r + 1) continue;
      const nx = x + dx, ny = y + dy; if (!map.inb(nx, ny)) continue;
      const k = map.idx(nx, ny); if (map.owner[k] !== target || !map.isLand(k) && map.ter[k] !== T.RIVER) continue;
      map.owner[k] = c; changedOwners.add(k);
      const occ = map.occ[k];
      if (occ) { // bina ele geçirildi
        const b = occ - 1;
        if (e.alive(b) && e.owner[b] === target) {
          e.owner[b] = c; e.flags[b] &= ~F.CAPITAL;
          sim.notify(target, 'n_captured', ['b_' + BUILDINGS[e.def[b]].id], e.x[b], e.y[b], 2);
          if (BUILDINGS[e.def[b]].id === 'hq') e.flags[b] |= 0;
          sim.dirty.power = sim.dirty.comms = sim.dirty.roads = true;
        }
      }
    }
  }
  if (!changedOwners.size) return;
  for (const k of changedOwners) map.markDirty(k % map.W, (k / map.W) | 0);
  // şehirler: merkez karosu kimdeyse
  e.each(C.CITY, (i) => {
    const o = map.owner[map.idx(e.x[i] | 0, e.y[i] | 0)];
    if (o !== e.owner[i] && o < nC) {
      const old = e.owner[i]; e.owner[i] = o; e.supply[i] = Math.min(e.supply[i], 0.3);
      const info = sim.cityInfo.get(i);
      if (e.flags[i] & F.CAPITAL) {
        e.flags[i] &= ~F.CAPITAL;
        annex(sim, old, o, 'capital');
      } else sim.notify(old, 'n_city_lost', [info.name], e.x[i], e.y[i], 3);
      sim.emit({ k: 'citycap', id: i, from: old, to: o });
    }
  });
}
