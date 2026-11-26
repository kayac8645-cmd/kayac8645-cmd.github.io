// Kaynak yatağı kümeleri: aynı türden bitişik karolar tek yatak sayılır (etiket, bilgi kartı, işletme durumu)
import { RAW } from '../data/defs.js';

export function computeDeposits(map) {
  const W = map.W, N = map.N, idx = new Int32Array(N).fill(-1), list = [];
  const q = new Int32Array(N);
  for (let s = 0; s < N; s++) {
    const r = map.res[s]; if (!r || idx[s] !== -1 || !map.isLand(s)) continue;
    const id = list.length; let qh = 0, qt = 0; q[qt++] = s; idx[s] = id; let sx = 0, sy = 0;
    while (qh < qt) {
      const c = q[qh++]; const x = c % W, y = (c / W) | 0; sx += x; sy += y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= map.H) continue;
        const n = ny * W + nx; if (idx[n] === -1 && map.res[n] === r && map.isLand(n)) { idx[n] = id; q[qt++] = n; }
      }
    }
    list.push({ id, res: RAW[r - 1], code: r, n: qt, x: sx / qt + 0.5, y: sy / qt + 0.5, tiles: q.slice(0, qt) });
  }
  return { list, idx };
}

// yatağı işleten bina (maden/kuyu) var mı?
export function depositWorked(sim, d) {
  const map = sim.map, e = sim.e;
  for (const t of d.tiles) { const o = map.occ[t]; if (o && e.alive(o - 1) && e.kind[o - 1] === 1) return o - 1; }
  return -1;
}
