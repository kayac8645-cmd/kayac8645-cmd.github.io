// Genel amaçlı A* (8 yönlü). cost(from,to,diag) -> maliyet ya da <0 (geçilemez)
import { W, H, N, Heap, D8 } from './util.js';

const g = new Float32Array(N), came = new Int32Array(N), seen = new Uint32Array(N), closed = new Uint32Array(N);
let stamp = 1;
const heap = new Heap();

export function findPath(start, goal, cost, hMul = 0.45, maxExp = 30000) {
  if (start === goal) return [];
  stamp++;
  heap.clear();
  const gx = goal % W, gy = (goal / W) | 0;
  g[start] = 0; came[start] = -1; seen[start] = stamp;
  heap.push(0, start);
  let exp = 0;
  while (heap.size) {
    const cur = heap.pop();
    if (closed[cur] === stamp) continue;
    closed[cur] = stamp;
    if (cur === goal) {
      const out = [];
      for (let c = goal; c !== start; c = came[c]) out.push(c);
      return out.reverse();
    }
    if (++exp > maxExp) return null;
    const cx = cur % W, cy = (cur / W) | 0;
    for (let k = 0; k < 8; k++) {
      const nx = cx + D8[k][0], ny = cy + D8[k][1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const nb = ny * W + nx;
      if (closed[nb] === stamp) continue;
      const diag = D8[k][0] !== 0 && D8[k][1] !== 0;
      let c = cost(cur, nb, diag);
      if (c < 0) continue;
      if (diag) {
        // köşe kesmeyi engelle: iki ortogonal komşunun ikisi de geçilemezse çapraz geçiş yok
        const a = cost(cur, cy * W + nx, false), b = cost(cur, ny * W + cx, false);
        if (a < 0 && b < 0) continue;
        c *= 1.414;
      }
      const ng = g[cur] + c;
      if (seen[nb] !== stamp || ng < g[nb]) {
        seen[nb] = stamp; g[nb] = ng; came[nb] = cur;
        heap.push(ng + Math.hypot(nx - gx, ny - gy) * hMul, nb);
      }
    }
  }
  return null;
}

// Çok kaynaklı Dijkstra: sources=[[tile,id],...]; cost(tile,id)-> <0 geçilemez
export function multiSource(sources, cost, owner, distOut) {
  const h = new Heap();
  distOut.fill(1e9);
  for (const [t, id] of sources) { distOut[t] = 0; owner[t] = id; h.push(0, t); }
  while (h.size) {
    const cur = h.pop();
    const d0 = distOut[cur];
    const id = owner[cur];
    const cx = cur % W, cy = (cur / W) | 0;
    for (let k = 0; k < 8; k++) {
      const nx = cx + D8[k][0], ny = cy + D8[k][1];
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const nb = ny * W + nx;
      const c = cost(nb, id);
      if (c < 0) continue;
      const nd = d0 + c * (D8[k][0] && D8[k][1] ? 1.414 : 1);
      if (nd < distOut[nb]) { distOut[nb] = nd; owner[nb] = id; h.push(nd, nb); }
    }
  }
}
