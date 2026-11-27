// Lojistik: konvoylar (hammadde -> depo, ikmal -> cephe), ikmal menzili. Konvoylar görünür ve vurulabilir.
import { KIND, C, F } from '../core/ecs.js';
import { BUILDINGS } from '../data/buildings.js';
import { R, RAW } from '../data/defs.js';

const usable = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));
export const CONVOY_HP = 20;

function nearestDepot(sim, c, x, y, comp) {
  const e = sim.e, map = sim.map; let best = -1, bd = 1e18;
  e.each(C.DEPOT, (i) => {
    if (e.owner[i] !== c || !usable(e, i) || e.aux[i] < 0) return;
    if (comp >= 0 && map.roadComp[e.aux[i]] !== comp) return;
    const dx = e.x[i] - x, dy = e.y[i] - y, d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

function spawnConvoy(sim, c, fromTile, toTile, resIdx, amount, dest, src, mode) {
  const map = sim.map, e = sim.e;
  const sx = fromTile % map.W, sy = (fromTile / map.W) | 0, tx = toTile % map.W, ty = (toTile / map.W) | 0;
  const path = map.astar(sx, sy, tx, ty, (i) => map.roadPass(i), 60000, false, true);
  if (!path) return -1;
  const id = e.create(KIND.CONVOY, 0, c, sx + 0.5, sy + 0.5, C.CONVOY | C.MOVE);
  if (id < 0) return -1;
  e.hp[id] = e.maxhp[id] = CONVOY_HP; e.target[id] = dest; e.aux[id] = src; e.buf[id] = amount; e.res[id] = resIdx;
  e.state[id] = mode; e.wp[id] = 0; e.speed[id] = 0.22 * sim.mod(c, 'convoySpeed', 1);
  e.routes.set(id, Int32Array.from(path));
  e.tx[id] = tx + 0.5; e.ty[id] = ty + 0.5;
  return id;
}

export function updateLogistics(sim) {
  const e = sim.e, map = sim.map, nC = sim.countries.length, tick = sim.tick;
  // 1) hammadde konvoyları
  if (tick % 10 === 1) {
    for (let i = 0; i < e.hi; i++) {
      if (e.kind[i] !== KIND.BUILDING || e.owner[i] >= nC || !usable(e, i)) continue;
      const bd = BUILDINGS[e.def[i]];
      if ((bd.id !== 'mine' && bd.id !== 'well') || e.buf[i] < 12) continue;
      if (e.target[i] >= 0 && e.alive(e.target[i]) && e.kind[e.target[i]] === KIND.CONVOY) continue;
      if (!(e.flags[i] & F.CONNECTED)) {
        if (e.buf[i] >= 39 && tick % 900 === 1) sim.notify(e.owner[i], 'n_nosupplyroute', ['b_' + bd.id], e.x[i], e.y[i], 1);
        continue;
      }
      const comp = map.roadComp[e.aux[i]];
      const dep = nearestDepot(sim, e.owner[i], e.x[i], e.y[i], comp);
      if (dep < 0) continue;
      const cap = 14 * sim.mod(e.owner[i], 'convoyCap', 1);
      const amt = Math.min(cap, e.buf[i]);
      const cv = spawnConvoy(sim, e.owner[i], e.aux[i], e.aux[dep], R[RAW[e.res[i] - 1]], amt, dep, i, 0);
      if (cv >= 0) { e.buf[i] -= amt; e.target[i] = cv; }
    }
  }
  // 2) cephe ikmali
  if (tick % 20 === 9) frontSupply(sim);
  // 3) konvoy hareketi
  for (let i = 0; i < e.hi; i++) {
    if (e.kind[i] !== KIND.CONVOY || (e.flags[i] & F.DEAD)) continue;
    const c = e.owner[i], co = sim.countries[c];
    if (e.state[i] === 2) { // sahada ikmal noktası
      e.timer[i] -= 1;
      if (e.timer[i] <= 0 || e.buf[i] <= 0.01) e.kill(i);
      continue;
    }
    const path = e.routes.get(i); if (!path) { e.kill(i); continue; }
    if (co.res[R.fuel] > 0.002) sim.subRes(c, R.fuel, 0.002, 'convoy');
    let wp = e.wp[i];
    if (wp >= path.length) { arrive(sim, i); continue; }
    const ti = path[wp];
    if (!map.roadPass(ti)) { // köprü yıkıldı / sel: yeniden rota
      if (tick % 20 === i % 20) {
        const np = map.astar(e.x[i] | 0, e.y[i] | 0, e.tx[i] | 0, e.ty[i] | 0, (k) => map.roadPass(k), 60000, false, true);
        if (np) { e.routes.set(i, Int32Array.from(np)); e.wp[i] = 0; }
        else { e.timer[i] += 20; if (e.timer[i] > 1500) { e.kill(i); sim.notify(c, 'n_convoy_stuck', [], e.x[i], e.y[i], 1); } }
      }
      continue;
    }
    const gx = (ti % map.W) + 0.5, gy = ((ti / map.W) | 0) + 0.5;
    const dx = gx - e.x[i], dy = gy - e.y[i], d = Math.sqrt(dx * dx + dy * dy);
    const sp = e.speed[i] * (map.road[ti] & 2 ? 2.5 : 1) * (co.res[R.fuel] > 0.01 ? 1 : 0.3) * (sim.env.season === 0 && sim.env.weather === 'rain' && !(map.road[ti] & 1) ? 0.6 : 1);
    if (d <= sp) { e.x[i] = gx; e.y[i] = gy; e.wp[i] = wp + 1; }
    else { e.x[i] += dx / d * sp; e.y[i] += dy / d * sp; e.vx[i] = dx / d; e.vy[i] = dy / d; }
  }
}

function arrive(sim, i) {
  const e = sim.e, co = sim.countries[e.owner[i]];
  if (e.state[i] === 0) { sim.addRes(e.owner[i], e.res[i], e.buf[i], 'b_mine'); e.kill(i); }
  else if (e.state[i] === 1) { e.state[i] = 2; e.timer[i] = 900; e.routes.delete(i); }
}

function frontSupply(sim) {
  const e = sim.e, map = sim.map, nC = sim.countries.length;
  for (let c = 0; c < nC; c++) {
    const co = sim.countries[c]; if (!co.alive) continue;
    const range = 18 * sim.mod(c, 'supplyRange', 1);
    const depots = [], points = [];
    e.each(C.DEPOT, (i) => { if (e.owner[i] === c && usable(e, i) && (e.flags[i] & F.CONNECTED || BUILDINGS[e.def[i]].id === 'hq')) depots.push(i); });
    e.each(C.CONVOY, (i) => { if (e.owner[i] === c && e.state[i] >= 1) points.push(i); });
    let spawned = 0;
    e.each(C.UNIT, (u) => {
      if (e.owner[u] !== c || e.kind[u] === KIND.AIR) return;
      if (e.supply[u] >= 1) return;
      const need = Math.min(0.2, 1 - e.supply[u]);
      // depo menzili
      for (const d of depots) {
        if (e.dist2(d, u) <= range * range) {
          if (co.res[R.supply] >= need * 0.6) { sim.subRes(c, R.supply, need * 0.6, 'units'); e.supply[u] += need; }
          return;
        }
      }
      // sahadaki ikmal konvoyu
      for (const p of points) {
        if (e.state[p] === 2 && e.dist2(p, u) <= 64 && e.buf[p] > need * 0.6) { e.buf[p] -= need * 0.6; e.supply[u] += need; return; }
        if (e.state[p] === 1 && Math.abs(e.tx[p] - e.x[u]) + Math.abs(e.ty[p] - e.y[u]) < 14) return; // yolda
      }
      if (spawned >= 2 || e.supply[u] > 0.75 || co.res[R.supply] < 8 || !depots.length) return;
      // yeni ikmal konvoyu
      const dest = map.nearestRoad(e.x[u], e.y[u], 8); if (dest < 0) return;
      let best = -1, bd = 1e18;
      for (const d of depots) { if (map.roadComp[e.aux[d]] !== map.roadComp[dest]) continue; const dd = e.dist2(d, u); if (dd < bd) { bd = dd; best = d; } }
      if (best < 0) return;
      const amt = Math.min(20, co.res[R.supply]);
      const cv = spawnConvoy(sim, c, e.aux[best], dest, R.supply, amt, -1, best, 1);
      if (cv >= 0) { sim.subRes(c, R.supply, amt, 'units'); points.push(cv); spawned++; }
    });
  }
}
