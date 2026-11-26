// Dronlar ve hava birimleri: görev fırlatma, rota, sürü davranışı, kontrol menzili, batarya,
// rol davranışları (keşif, kamikaze, bombacı, MALE, önleyici, ana gemi, röle, deniz dronu, jet, helikopter)
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { UNITS, ITEMS, ITEM_BY, UNIT_BY, PROJ_BY, CLS } from '../data/defs.js';
import { BUILDINGS } from '../data/buildings.js';
import { explode, applyDamage, killUnit } from './damage.js';
import { planAirRoute } from './route.js';

export const AS = { OUT: 0, ATTACK: 1, LOITER: 2, RETURN: 3, LOST: 4 };
const usable = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));

function baseFits(bd, it) {
  if (!bd.launches) return false;
  if (it.cat === 'aircraft') return bd.launches === 'aircraft';
  if (it.id === 'naval_drone') return bd.launches === 'naval';
  return bd.launches === 'drone' || (bd.launches === 'aircraft' && (it.id === 'male' || it.id === 'recon_uav'));
}

registerCommand(CMD.MISSION, (sim, cmd) => {
  const e = sim.e, co = sim.countries[cmd.c]; const b = cmd.base;
  if (!e.alive(b) || e.owner[b] !== cmd.c || !usable(e, b)) return false;
  const bd = sim.bdef(b); const ii = ITEM_BY[cmd.item]; const it = ITEMS[ii];
  if (!it || !it.unit || !baseFits(bd, it)) return false;
  if (e.sat[b] < 0.3 && !(e.flags[b] & F.GENERATOR)) { sim.notify(cmd.c, 'err_nopower', [], e.x[b], e.y[b], 1); return false; }
  const n = Math.max(1, Math.min(cmd.n | 0 || 1, Math.floor(co.items[ii])));
  if (co.items[ii] < 1) return false;
  const ui = UNIT_BY[it.unit]; const u = UNITS[ui];
  let route = cmd.route && cmd.route.length >= 2 ? cmd.route.slice() : null;
  const tx = cmd.tx ?? (route ? route[route.length - 2] : e.x[b]), ty = cmd.ty ?? (route ? route[route.length - 1] : e.y[b]);
  if (!route) route = cmd.auto === false ? [tx, ty] : planAirRoute(sim, cmd.c, e.x[b], e.y[b], tx, ty, (u.alt || 1) === 1);
  if (u.fiber) { // fiber: kablo boyu kadar
    const dx = tx - e.x[b], dy = ty - e.y[b], d = Math.sqrt(dx * dx + dy * dy);
    if (d > u.maxDist) { sim.notify(cmd.c, 'err_range', [], tx, ty, 1); return false; }
  }
  let path = null;
  if (u.kind === 'naval') {
    const map = sim.map; let sx = -1, sy = -1;
    for (let r = 1; r < 6 && sx < 0; r++) for (let dy = -r; dy <= r && sx < 0; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = (e.x[b] | 0) + dx, y = (e.y[b] | 0) + dy; if (map.inb(x, y) && map.navalPass(map.idx(x, y))) { sx = x; sy = y; break; }
    }
    if (sx < 0) return false;
    path = map.astar(sx, sy, tx | 0, ty | 0, (i) => map.navalPass(i), 60000, true);
    if (!path || !path.length) { sim.notify(cmd.c, 'err_nopath', [], tx, ty, 1); return false; }
    route = []; for (let k = 0; k < path.length; k += 2) route.push((path[k] % map.W) + 0.5, ((path[k] / map.W) | 0) + 0.5);
    route.push((path[path.length - 1] % map.W) + 0.5, ((path[path.length - 1] / map.W) | 0) + 0.5);
  }
  const g = sim.newGroup();
  for (let k = 0; k < n; k++) {
    const id = sim.spawnUnit(cmd.c, ui, e.x[b] + (k % 3) * 0.4 - 0.4, e.y[b] + ((k / 3) | 0) * 0.4);
    if (id < 0) break;
    co.items[ii] -= 1; co.stats.launched++;
    e.home[id] = b; e.group[id] = g; e.item[id] = ii + 1; e.state[id] = AS.OUT; e.wp[id] = 0;
    e.routes.set(id, Float32Array.from(route));
    e.tx[id] = tx; e.ty[id] = ty; e.target[id] = cmd.target ?? -1; e.mode[id] = cmd.mode === 'patrol' ? 0x10 : 0;
    e.ox[id] = e.x[b]; e.oy[id] = e.y[b];
    if ((u.alt || 1) === 1) e.flags[id] |= F.LOWALT;
    if (u.carry) e.ammo[id] = u.carryN;
    e.timer[id] = 0;
  }
  sim.emit({ k: 'launch', x: e.x[b], y: e.y[b], air: true, owner: cmd.c });
});

registerCommand(CMD.RECALL, (sim, cmd) => {
  const e = sim.e;
  for (const id of cmd.ids || []) if (e.alive(id) && e.owner[id] === cmd.c && e.kind[id] === KIND.AIR) {
    const u = sim.udef(id); if (u.reusable) e.state[id] = AS.RETURN; else { e.state[id] = AS.OUT; }
  }
});
registerCommand(CMD.SET_ROUTE, (sim, cmd) => {
  const e = sim.e; if (!cmd.route || cmd.route.length < 2) return false;
  for (const id of cmd.ids || []) if (e.alive(id) && e.owner[id] === cmd.c && (e.kind[id] === KIND.AIR)) {
    e.routes.set(id, Float32Array.from(cmd.route)); e.wp[id] = 0; e.state[id] = AS.OUT;
    e.tx[id] = cmd.route[cmd.route.length - 2]; e.ty[id] = cmd.route[cmd.route.length - 1]; e.target[id] = cmd.target ?? -1;
  }
});

// kontrol düğümleri: [x, y, r] ülke başına
function controlNodes(sim) {
  const e = sim.e, nC = sim.countries.length; const nodes = Array.from({ length: nC }, () => []);
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || (e.flags[i] & F.DEAD) || e.owner[i] >= nC) continue;
    if (e.kind[i] === KIND.BUILDING) {
      const bd = BUILDINGS[e.def[i]];
      if (bd.control && usable(e, i) && (e.sat[i] >= 0.3 || e.flags[i] & F.GENERATOR)) nodes[e.owner[i]].push(e.x[i], e.y[i], bd.control);
    } else if (e.kind[i] === KIND.AIR) {
      const u = UNITS[e.def[i]];
      if (u.relay && !(e.flags[i] & (F.LINKLOST | F.JAMMED)) && (u.role === 'relay' || sim.has(e.owner[i], 'd_relay'))) nodes[e.owner[i]].push(e.x[i], e.y[i], u.relay);
    }
  }
  return nodes;
}
function inControl(nodes, x, y) {
  for (let k = 0; k < nodes.length; k += 3) { const dx = nodes[k] - x, dy = nodes[k + 1] - y, r = nodes[k + 2]; if (dx * dx + dy * dy <= r * r) return true; }
  return false;
}

function nearestBase(sim, i) {
  const e = sim.e, c = e.owner[i]; const it = ITEMS[e.item[i] - 1];
  if (e.alive(e.home[i]) && usable(e, e.home[i]) && e.owner[e.home[i]] === c) return e.home[i];
  let best = -1, bd = 1e18;
  e.each(C.BASE, (b) => { if (e.owner[b] !== c || !usable(e, b) || !it || !baseFits(sim.bdef(b), it)) return; const d = e.dist2(b, i); if (d < bd) { bd = d; best = b; } });
  return best;
}

function seenBy(sim, c, t) { return (sim.e.seenBy[t] >>> c) & 1; }

export function updateAir(sim) {
  const e = sim.e, env = sim.env, nodes = controlNodes(sim), map = sim.map;
  for (let i = 0, n = e.hi; i < n; i++) {
    const k = e.kind[i];
    if ((k !== KIND.AIR && !(k === KIND.NAVAL && UNITS[e.def[i]].role === 'naval')) || (e.flags[i] & F.DEAD)) continue;
    const u = UNITS[e.def[i]], c = e.owner[i];
    // batarya / yakıt
    e.fuel[i] -= env.airDrain;
    if (e.fuel[i] <= 0) { killUnit(sim, i, undefined, 'fuel'); continue; }
    // bağlantı
    const needsLink = u.link && !u.fiber && !(e.flags[i] & F.AUTONOMOUS);
    const linkOK = !needsLink || (inControl(nodes[c], e.x[i], e.y[i]) && !(e.flags[i] & F.JAMMED));
    if (!linkOK && e.state[i] !== AS.LOST && !(e.flags[i] & F.LINKLOST)) {
      e.flags[i] |= F.LINKLOST; e.mode[i] = e.state[i] | (e.mode[i] & 0xf0); e.state[i] = AS.LOST; e.timer[i] = 0;
    } else if (linkOK && (e.flags[i] & F.LINKLOST)) {
      e.flags[i] &= ~F.LINKLOST; e.state[i] = e.mode[i] & 0x0f; if (e.state[i] === AS.LOST) e.state[i] = AS.OUT;
    }
    // geri dönüş kararı
    const reusable = u.reusable;
    if (reusable && e.state[i] !== AS.RETURN && e.state[i] !== AS.LOST) {
      const b = nearestBase(sim, i);
      if (b >= 0) { const d = Math.sqrt(e.dist2(b, i)); if (e.fuel[i] < (d / (u.speed * env.airSpeed)) * env.airDrain * 1.25 + 20) e.state[i] = AS.RETURN; }
    }
    let gx = e.tx[i], gy = e.ty[i], speed = u.speed * env.airSpeed * sim.mod(c, 'droneSpeed', 1);
    const st = e.state[i];
    if (st === AS.LOST) {
      e.timer[i]++;
      if (sim.mod(c, 'autoReturn', 0) && reusable) { const b = nearestBase(sim, i); if (b >= 0) { gx = e.x[b]; gy = e.y[b]; } }
      else { gx = e.x[i] + e.vx[i] * 4; gy = e.y[i] + e.vy[i] * 4; }
      if (e.timer[i] > 40 && !(sim.mod(c, 'autoReturn', 0) && reusable)) { killUnit(sim, i, undefined, e.flags[i] & F.JAMMED ? 'jam' : 'link'); continue; }
    } else if (st === AS.RETURN) {
      const b = nearestBase(sim, i);
      if (b < 0) { gx = e.x[i]; gy = e.y[i]; e.fuel[i] -= 2; }
      else {
        gx = e.x[b]; gy = e.y[b];
        if (e.dist2(b, i) < 1.2) { // indi: stoğa geri
          if (e.item[i]) sim.countries[c].items[e.item[i] - 1] += 1;
          e.kill(i); sim.emit({ k: 'land', x: e.x[i], y: e.y[i] }); continue;
        }
      }
    } else {
      // rota takibi
      const r = e.routes.get(i);
      if (st === AS.OUT && r && e.wp[i] * 2 < r.length) {
        gx = r[e.wp[i] * 2]; gy = r[e.wp[i] * 2 + 1];
        const dx = gx - e.x[i], dy = gy - e.y[i];
        if (dx * dx + dy * dy < Math.max(1, speed * speed * 2)) {
          e.wp[i]++;
          if (e.wp[i] * 2 >= r.length) { if ((e.mode[i] & 0x10) && r.length > 2) e.wp[i] = 0; else arriveTarget(sim, i, u); }
        }
      } else if (st === AS.OUT) arriveTarget(sim, i, u);
      // hedef takibi (görülen hareketli hedef)
      const t = e.target[i];
      if (t >= 0 && e.alive(t) && seenBy(sim, c, t) && (st === AS.ATTACK || (st === AS.OUT && e.dist2(t, i) < 64))) {
        e.tx[i] = e.x[t]; e.ty[i] = e.y[t];
        if (u.role === 'kamikaze' || u.role === 'naval') { e.state[i] = AS.ATTACK; }
      }
      if (e.state[i] === AS.ATTACK || e.state[i] === AS.LOITER) { gx = e.tx[i]; gy = e.ty[i]; }
      if (behave(sim, i, u, c)) continue;
      if (e.state[i] === AS.LOITER) { // hedef çevresinde daire (trig'siz: dönen ofset)
        const ph = (sim.tick + i * 7) % 40; const q = ph < 10 ? [1, 0] : ph < 20 ? [0, 1] : ph < 30 ? [-1, 0] : [0, -1];
        gx = e.tx[i] + q[0] * 3; gy = e.ty[i] + q[1] * 3;
      }
    }
    // hareket + rüzgâr + sürü ayrışması
    let dx = gx - e.x[i], dy = gy - e.y[i]; const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 0.001) { dx /= d; dy /= d; }
    const sp = Math.min(speed, d);
    let mx = dx * sp, my = dy * sp;
    if (u.cls === CLS.DRONE) { mx += env.windX * 0.06; my += env.windY * 0.06; }
    if (e.group[i] > 0 && (sim.tick + i) % 3 === 0) {
      let sx = 0, sy = 0;
      sim.grid.query(e.x[i], e.y[i], 0.7, (j) => { if (j !== i && e.group[j] === e.group[i]) { sx += e.x[i] - e.x[j]; sy += e.y[i] - e.y[j]; } });
      mx += sx * 0.15; my += sy * 0.15;
    }
    if (k === KIND.NAVAL) { // yalnız suda
      const nx = e.x[i] + mx, ny = e.y[i] + my;
      if (!map.inb(nx | 0, ny | 0) || !map.navalPass(map.idx(nx | 0, ny | 0))) { mx *= 0.2; my *= 0.2; }
    }
    e.x[i] += mx; e.y[i] += my;
    if (sp > 0.01) { e.vx[i] = dx; e.vy[i] = dy; }
    // irtifa
    const zt = (e.flags[i] & F.LOWALT) ? 3 : 6 + (u.alt || 1) * 3;
    e.z[i] += (zt - e.z[i]) * 0.2;
    if (k === KIND.NAVAL) e.z[i] = 0;
    if (e.x[i] < 0 || e.y[i] < 0 || e.x[i] >= map.W || e.y[i] >= map.H) { e.x[i] = Math.max(0, Math.min(map.W - 0.01, e.x[i])); e.y[i] = Math.max(0, Math.min(map.H - 0.01, e.y[i])); }
  }
}

function arriveTarget(sim, i, u) {
  const e = sim.e;
  switch (u.role) {
    case 'kamikaze': case 'naval': case 'bomber': case 'fighter': case 'heli': e.state[i] = AS.ATTACK; break;
    case 'recon': case 'relay': case 'interceptor': case 'male': e.state[i] = AS.LOITER; break;
    case 'carrier': e.state[i] = AS.ATTACK; break;
    default: e.state[i] = AS.LOITER;
  }
}

// rol davranışları; true -> varlık işlendi (öldü/indi)
function behave(sim, i, u, c) {
  const e = sim.e, st = e.state[i];
  const dTx = e.tx[i] - e.x[i], dTy = e.ty[i] - e.y[i], dT2 = dTx * dTx + dTy * dTy;
  if (e.cool[i] > 0) e.cool[i]--;
  switch (u.role) {
    case 'kamikaze': case 'naval':
      if (st === AS.ATTACK && dT2 < 0.8) {
        let x = e.x[i], y = e.y[i];
        if (e.flags[i] & F.AUTONOMOUS) { // GPS karıştırma: otonom isabet düşer
          if (e.flags[i] & F.SPOOFED) { x += 5; y -= 4; }
          else if (e.flags[i] & F.GPSJAM) { const [a, b] = sim.rng.disk(); x += a * 3 * (1 - sim.mod(c, 'gpsResist', 0)); y += b * 3 * (1 - sim.mod(c, 'gpsResist', 0)); }
        }
        explode(sim, x, y, u.r, u.dmg, c);
        e.kill(i); return true;
      }
      return false;
    case 'bomber':
      if (st === AS.ATTACK && dT2 < 1.5 && e.cool[i] <= 0 && e.ammo[i] > 0) {
        sim.spawnProj(c, PROJ_BY.bomb, e.x[i], e.y[i], e.tx[i], e.ty[i], { from: i });
        e.ammo[i]--; e.cool[i] = 12;
        if (e.ammo[i] <= 0) e.state[i] = AS.RETURN;
      }
      return false;
    case 'carrier':
      if (st === AS.ATTACK && dT2 < 25 && e.ammo[i] > 0) {
        const cu = UNIT_BY[u.carry];
        for (let k = 0; k < e.ammo[i]; k++) {
          const id = sim.spawnUnit(c, cu, e.x[i], e.y[i]); if (id < 0) break;
          const [a, b] = sim.rng.disk();
          e.tx[id] = e.tx[i] + a * 2; e.ty[id] = e.ty[i] + b * 2; e.state[id] = AS.ATTACK; e.home[id] = e.home[i]; e.group[id] = e.group[i];
          e.flags[id] |= F.LOWALT | F.AUTONOMOUS; e.target[id] = e.target[i];
        }
        e.ammo[i] = 0; e.state[i] = AS.RETURN; sim.emit({ k: 'release', x: e.x[i], y: e.y[i] });
      }
      return false;
    case 'interceptor': {
      // en yakın görülen düşman dronu/İHA'yı kovala
      let tgt = e.target[i];
      if (!(tgt >= 0 && e.alive(tgt) && e.kind[tgt] === KIND.AIR)) {
        tgt = -1; let bd = u.acq * u.acq;
        sim.grid.query(e.x[i], e.y[i], u.acq, (j, d2) => {
          if (e.kind[j] !== KIND.AIR || !sim.atWar(c, e.owner[j]) || !seenBy(sim, c, j)) return;
          const uj = UNITS[e.def[j]]; if (uj.cls > CLS.UAV) return;
          if (d2 < bd) { bd = d2; tgt = j; }
        });
        e.target[i] = tgt;
      }
      if (tgt >= 0) {
        e.state[i] = AS.ATTACK; e.tx[i] = e.x[tgt]; e.ty[i] = e.y[tgt];
        if (e.dist2(tgt, i) < 0.5) {
          if (sim.rng.next() < 0.75 + sim.mod(e.owner[tgt], 'droneEvade', 0) * -1) applyDamage(sim, tgt, 50, c, { cause: 'intercept' });
          sim.emit({ k: 'boom', x: e.x[i], y: e.y[i], r: 0.6, big: 0, air: true }); e.kill(i); return true;
        }
      } else if (st === AS.ATTACK) e.state[i] = AS.LOITER;
      return false;
    }
    case 'male': case 'heli': case 'fighter': {
      // hava hedefleri (jet)
      if (u.aa && e.cool[i] <= 0) {
        let tgt = -1, bd = u.vision * u.vision;
        sim.grid.query(e.x[i], e.y[i], u.vision, (j, d2) => {
          if (e.kind[j] !== KIND.AIR || !sim.atWar(c, e.owner[j]) || !seenBy(sim, c, j)) return;
          if (d2 < bd) { bd = d2; tgt = j; }
        });
        if (tgt >= 0) { e.cool[i] = 6; sim.emit({ k: 'tracer', x: e.x[i], y: e.y[i], tx: e.x[tgt], ty: e.y[tgt], z: e.z[i] }); if (sim.rng.next() < 0.55) applyDamage(sim, tgt, 40, c, { cause: 'aa' }); }
      }
      // kara hedefleri: füze
      if (e.ammo[i] > 0 && e.cool[i] <= 0 && (st === AS.LOITER || st === AS.ATTACK || u.role !== 'male')) {
        let tgt = e.target[i];
        if (!(tgt >= 0 && e.alive(tgt) && seenBy(sim, c, tgt) && e.dist2(tgt, i) < u.vision * u.vision)) {
          tgt = -1; let best = -1;
          sim.grid.query(e.x[i], e.y[i], u.vision, (j, d2) => {
            const kj = e.kind[j]; if (kj === KIND.AIR || kj === KIND.PROJ || kj === KIND.CITY) return;
            if (e.owner[j] >= sim.countries.length || !sim.atWar(c, e.owner[j]) || !seenBy(sim, c, j)) return;
            if (kj === KIND.BUILDING && (e.flags[j] & F.RUINED)) return;
            const val = (e.mask[j] & (C.AD | C.RADAR) ? 5 : kj === KIND.CONVOY ? 3 : kj === KIND.GROUND ? 2 : 1) - d2 * 0.001;
            if (val > best) { best = val; tgt = j; }
          });
        }
        if (tgt >= 0) {
          sim.spawnProj(c, PROJ_BY[u.missile], e.x[i], e.y[i], e.x[tgt], e.y[tgt], { target: tgt, from: i });
          e.ammo[i]--; e.cool[i] = 25; sim.emit({ k: 'launch', x: e.x[i], y: e.y[i], small: true, owner: c });
          if (e.ammo[i] <= 0) e.state[i] = AS.RETURN;
        } else if (st === AS.ATTACK && (u.role === 'fighter' || u.role === 'heli')) e.state[i] = AS.LOITER;
      }
      if (st === AS.LOITER && u.role !== 'male') { e.timer[i]++; if (e.timer[i] > 200) e.state[i] = AS.RETURN; }
      return false;
    }
    case 'recon': case 'relay':
      if (st === AS.LOITER) { e.timer[i]++; if (u.role === 'recon' && e.timer[i] > 260 && u.reusable) e.state[i] = AS.RETURN; }
      return false;
  }
  return false;
}
