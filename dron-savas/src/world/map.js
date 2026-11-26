// Harita veri yapısı + yol bulma (A*). DOM yok; headless çalışır.
import { MinHeap } from '../core/math.js';

export const T = { DEEP: 0, SEA: 1, SAND: 2, GRASS: 3, FOREST: 4, SWAMP: 5, HILL: 6, MOUNTAIN: 7, PEAK: 8, RIVER: 9, LAKE: 10 };
export const T_NAMES = ['deep', 'sea', 'sand', 'grass', 'forest', 'swamp', 'hill', 'mountain', 'peak', 'river', 'lake'];
export const RD = { ROAD: 1, RAIL: 2, BRIDGE: 4, BROKEN: 8 };
export const NONE = 255;
export const DX8 = [1, -1, 0, 0, 1, 1, -1, -1], DY8 = [0, 0, 1, -1, 1, -1, 1, -1];
// kara hareket maliyeti (0 = geçilmez)
export const MOVE_COST = [0, 0, 1.2, 1, 1.6, 2.4, 1.8, 3.5, 0, 0, 0];

export class GameMap {
  constructor(W, H) {
    this.W = W; this.H = H; const N = W * H; this.N = N;
    this.height = new Float32Array(N);
    this.moist = new Float32Array(N);
    this.ter = new Uint8Array(N);
    this.res = new Uint8Array(N); // 0 yok, 1..7 RAW
    this.owner = new Uint8Array(N).fill(NONE);
    this.road = new Uint8Array(N);
    this.flood = new Uint16Array(N);
    this.down = new Int32Array(N).fill(-1); // akış yönü (nehir/baraj taşkını)
    this.occ = new Int32Array(N); // bina varlık id + 1
    this.roadComp = new Int32Array(N).fill(-1);
    this.decals = []; // {x,y,r,k}
    this.dirtyChunks = new Set();
    this.version = 0; // render önbelleği için
    // A* çalışma tamponları
    this._g = new Float32Array(N); this._came = new Int32Array(N); this._stamp = new Uint32Array(N); this._gen = 1;
  }
  idx(x, y) { return y * this.W + x; }
  inb(x, y) { return x >= 0 && y >= 0 && x < this.W && y < this.H; }
  isWater(i) { const t = this.ter[i]; return t === T.DEEP || t === T.SEA || t === T.LAKE; }
  isLand(i) { const t = this.ter[i]; return t !== T.DEEP && t !== T.SEA && t !== T.LAKE && t !== T.RIVER; }
  markDirty(x, y) { this.dirtyChunks.add(((y >> 5) << 16) | (x >> 5)); this.version++; }
  markDirtyArea(x0, y0, x1, y1) {
    for (let cy = Math.max(0, y0 >> 5); cy <= Math.min((this.H - 1) >> 5, y1 >> 5); cy++)
      for (let cx = Math.max(0, x0 >> 5); cx <= Math.min((this.W - 1) >> 5, x1 >> 5); cx++) this.dirtyChunks.add((cy << 16) | cx);
    this.version++;
  }
  // kara birimi için geçilebilirlik (köprüler dahil)
  groundPass(i) {
    if (this.flood[i] > 0) return 0;
    const t = this.ter[i];
    if (t === T.RIVER) { const r = this.road[i]; return (r & RD.BRIDGE) && !(r & RD.BROKEN) ? 1 : 0; }
    let c = MOVE_COST[t];
    if (c && (this.road[i] & RD.ROAD)) c = 0.5;
    return c;
  }
  roadPass(i) {
    const r = this.road[i];
    if (!(r & (RD.ROAD | RD.RAIL))) return 0;
    if ((r & RD.BROKEN) || this.flood[i] > 0) return 0;
    return r & RD.RAIL ? 0.4 : 1;
  }
  navalPass(i) { const t = this.ter[i]; return t === T.SEA || t === T.DEEP || t === T.LAKE || t === T.RIVER ? 1 : 0; }

  // A*: costFn(i)->0 geçilmez; döner: karo indeks dizisi (başlangıç hariç) ya da null
  astar(sx, sy, tx, ty, costFn, maxNodes = 40000, allowNearest = false, allowCut = false) {
    const W = this.W, H = this.H;
    sx = sx | 0; sy = sy | 0; tx = tx | 0; ty = ty | 0;
    if (!this.inb(sx, sy) || !this.inb(tx, ty)) return null;
    const s = sy * W + sx, t = ty * W + tx;
    if (s === t) return [];
    const gen = ++this._gen; const g = this._g, came = this._came, st = this._stamp;
    const open = new MinHeap();
    g[s] = 0; came[s] = -1; st[s] = gen; open.push(0, s);
    let n = 0, best = s, bestH = 1e9;
    const h = (i) => { const x = i % W, y = (i / W) | 0; const dx = Math.abs(x - tx), dy = Math.abs(y - ty); return (dx + dy) * 0.5 + Math.max(dx, dy) * 0.5; };
    const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1], DC = [1, 1, 1, 1, 1.414, 1.414, 1.414, 1.414];
    while (open.size) {
      const c = open.pop();
      if (c === t) { best = t; break; }
      if (++n > maxNodes) break;
      const cx = c % W, cy = (c / W) | 0; const gc = g[c];
      const hc = h(c); if (hc < bestH) { bestH = hc; best = c; }
      for (let k = 0; k < 8; k++) {
        const nx = cx + DX[k], ny = cy + DY[k];
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const ni = ny * W + nx;
        let mc = ni === t ? Math.max(costFn(ni), 0.0001) : costFn(ni);
        if (!mc) continue;
        if (k >= 4 && !allowCut) { // köşe kesme yok
          if (!costFn(cy * W + nx) || !costFn(ny * W + cx)) continue;
        }
        const ng = gc + mc * DC[k];
        if (st[ni] !== gen || ng < g[ni]) {
          st[ni] = gen; g[ni] = ng; came[ni] = c;
          open.push(ng + h(ni) * 0.9, ni);
        }
      }
    }
    if (best !== t && !allowNearest) return null;
    if (best === s) return null;
    const path = [];
    for (let c = best; c !== s && c !== -1; c = came[c]) path.push(c);
    path.reverse();
    return path;
  }

  // yol ağı bileşenleri (köprü yıkılınca yeniden hesaplanır)
  computeRoadComponents() {
    const N = this.N, W = this.W, comp = this.roadComp; comp.fill(-1);
    let id = 0; const q = new Int32Array(N);
    for (let i = 0; i < N; i++) {
      if (comp[i] !== -1 || !this.roadPass(i)) continue;
      let qh = 0, qt = 0; q[qt++] = i; comp[i] = id;
      while (qh < qt) {
        const c = q[qh++]; const x = c % W, y = (c / W) | 0;
        for (let k = 0; k < 8; k++) {
          const nx = x + DX8[k], ny = y + DY8[k];
          if (nx < 0 || ny < 0 || nx >= W || ny >= this.H) continue;
          const ni = ny * W + nx;
          if (comp[ni] === -1 && this.roadPass(ni)) { comp[ni] = id; q[qt++] = ni; }
        }
      }
      id++;
    }
    this.roadCompCount = id;
  }
  // bir karoya en yakın yol karosu (r yarıçapında)
  nearestRoad(x, y, r = 4) {
    x = x | 0; y = y | 0; let best = -1, bd = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = x + dx, ny = y + dy; if (!this.inb(nx, ny)) continue;
      const i = ny * this.W + nx; if (!this.roadPass(i)) continue;
      const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
}
