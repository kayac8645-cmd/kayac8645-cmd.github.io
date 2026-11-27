// Hava rotası planlama: bilinen hava savunma menzillerinden kaçınan kaba ızgara A* (ülkenin kendi istihbaratıyla)
import { MinHeap } from '../core/math.js';
import { KIND } from '../core/ecs.js';
import { UNITS, AD_SYS } from '../data/defs.js';
import { BUILDINGS } from '../data/buildings.js';

const CELL = 6;
const DXR = [1, -1, 0, 0, 1, 1, -1, -1], DYR = [0, 0, 1, -1, 1, -1, 1, -1];
// ülkenin bildiği düşman hava savunması: [x,y,r]
export function knownThreats(sim, c) {
  const co = sim.countries[c]; const out = [];
  for (const [id, k] of co.known) {
    if (!sim.atWar(c, k.owner)) continue;
    let sys = null;
    if (k.kind === KIND.BUILDING) { const bd = BUILDINGS[k.def]; if (bd && bd.ad && !k.ruined) sys = AD_SYS[bd.ad]; if (bd && bd.radar && !k.ruined) out.push([k.x, k.y, 0, 1]); }
    else if (k.kind === KIND.GROUND || k.kind === KIND.NAVAL) { const u = UNITS[k.def]; if (u && u.ad) sys = AD_SYS[u.ad]; }
    if (sys) out.push([k.x, k.y, sys.range, 0]);
  }
  return out;
}

export function planAirRoute(sim, c, sx, sy, tx, ty, low = true) {
  const W = Math.ceil(sim.map.W / CELL), H = Math.ceil(sim.map.H / CELL);
  // tehdit maliyet ızgarası: ülke ve irtifa başına 100 tick önbellek (deterministik: yalnız tick ve istihbarata bağlı)
  sim.routeCache = sim.routeCache || new Map();
  const key = c * 2 + (low ? 1 : 0); let ent = sim.routeCache.get(key);
  if (!ent || sim.tick - ent.t >= 100) {
    const threats = knownThreats(sim, c).filter((t) => t[2] > 0);
    let cost = null;
    if (threats.length) {
      cost = new Float32Array(W * H).fill(1);
      for (const [ax, ay, r] of threats) { // yalnız menzil kutusu içindeki hücreler
        const rr = r * (low ? 0.75 : 1);
        const cx0 = Math.max(0, ((ax - rr) / CELL) | 0), cx1 = Math.min(W - 1, ((ax + rr) / CELL) | 0), cy0 = Math.max(0, ((ay - rr) / CELL) | 0), cy1 = Math.min(H - 1, ((ay + rr) / CELL) | 0);
        for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
          const x = cx * CELL + CELL / 2, y = cy * CELL + CELL / 2; const d2 = (ax - x) * (ax - x) + (ay - y) * (ay - y);
          if (d2 < rr * rr) cost[cy * W + cx] += 12 * (1 - Math.sqrt(d2) / rr) + 3;
        }
      }
    }
    ent = { t: sim.tick - (sim.tick % 100), cost }; sim.routeCache.set(key, ent);
  }
  const cost = ent.cost; if (!cost) return [tx, ty];
  const s = ((sy / CELL) | 0) * W + ((sx / CELL) | 0), t = ((ty / CELL) | 0) * W + ((tx / CELL) | 0);
  const g = new Float32Array(W * H).fill(1e9), came = new Int32Array(W * H).fill(-1); const h = new MinHeap();
  g[s] = 0; h.push(0, s); const tX = t % W, tY = (t / W) | 0;
  while (h.size) {
    const c0 = h.pop(); if (c0 === t) break;
    const x = c0 % W, y = (c0 / W) | 0;
    for (let k = 0; k < 8; k++) {
      const nx = x + DXR[k], ny = y + DYR[k];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = ny * W + nx; const ng = g[c0] + cost[ni] * (k < 4 ? 1 : 1.414);
      if (ng < g[ni]) { g[ni] = ng; came[ni] = c0; h.push(ng + Math.max(Math.abs(nx - tX), Math.abs(ny - tY)), ni); }
    }
  }
  if (came[t] < 0 && s !== t) return [tx, ty];
  const cells = []; for (let c1 = t; c1 !== s && c1 >= 0; c1 = came[c1]) cells.push(c1);
  cells.reverse();
  // yalınlaştır: her 3 hücrede bir ara nokta
  const out = [];
  for (let k = 2; k < cells.length - 1; k += 3) out.push((cells[k] % W) * CELL + CELL / 2, ((cells[k] / W) | 0) * CELL + CELL / 2);
  out.push(tx, ty);
  return out;
}
