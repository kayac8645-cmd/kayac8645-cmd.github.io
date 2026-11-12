/**
 * Rivers & lakes on the high-resolution grid.
 * Priority-flood depression filling (Barnes et al. 2014, with epsilon) gives a drainage order;
 * flow accumulation integrates simulated runoff downstream. Filled depressions on land with
 * positive water balance become lakes.
 */
import { HR_GEOM, HR_H, HR_N, HR_SCALE, HR_W, SIM_N, SIM_W } from './grid';
import type { SimState } from './state';

export interface Hydro {
  filled: Float32Array;
  down: Int32Array; // downstream HR index, -1 for outlets
  order: Int32Array; // processing order (high → low)
  flow: Float32Array; // m3/s
  lake: Uint8Array;
  seaLevelUsed: number;
}

export function createHydro(): Hydro {
  return {
    filled: new Float32Array(HR_N),
    down: new Int32Array(HR_N),
    order: new Int32Array(HR_N),
    flow: new Float32Array(HR_N),
    lake: new Uint8Array(HR_N),
    seaLevelUsed: NaN,
  };
}

class MinHeap {
  keys: Float32Array;
  vals: Int32Array;
  n = 0;
  constructor(cap: number) {
    this.keys = new Float32Array(cap);
    this.vals = new Int32Array(cap);
  }
  push(k: number, v: number) {
    let i = this.n++;
    const K = this.keys, V = this.vals;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (K[p] <= k) break;
      K[i] = K[p];
      V[i] = V[p];
      i = p;
    }
    K[i] = k;
    V[i] = v;
  }
  pop(): number {
    const K = this.keys, V = this.vals;
    const top = V[0];
    const n = --this.n;
    const k = K[n], v = V[n];
    let i = 0;
    for (;;) {
      let c = 2 * i + 1;
      if (c >= n) break;
      if (c + 1 < n && K[c + 1] < K[c]) c++;
      if (K[c] >= k) break;
      K[i] = K[c];
      V[i] = V[c];
      i = c;
    }
    K[i] = k;
    V[i] = v;
    return top;
  }
}

const heap = new MinHeap(HR_N);
const closed = new Uint8Array(HR_N);

function nbrs(i: number, out: Int32Array): number {
  const x = i % HR_W, y = (i / HR_W) | 0;
  let n = 0;
  for (let dy = -1; dy <= 1; dy++) {
    const yy = y + dy;
    if (yy < 0 || yy >= HR_H) continue;
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const xx = (x + dx + HR_W) % HR_W;
      out[n++] = yy * HR_W + xx;
    }
  }
  return n;
}
const NB = new Int32Array(8);

/** Recompute filled surface + drainage graph. ~O(N log N); call when terrain or sea level changes. */
export function computeDrainage(s: SimState, h: Hydro) {
  const z = s.hrElev;
  const sea = s.seaLevel;
  closed.fill(0);
  heap.n = 0;
  let oc = 0;
  // seeds: all ocean pixels
  for (let i = 0; i < HR_N; i++) {
    if (z[i] <= sea) {
      closed[i] = 1;
      h.filled[i] = sea;
      h.down[i] = -1;
      heap.push(sea, i);
    }
  }
  if (heap.n === 0) {
    // no ocean: lowest pixel is the outlet
    let m = 0;
    for (let i = 1; i < HR_N; i++) if (z[i] < z[m]) m = i;
    closed[m] = 1;
    h.filled[m] = z[m];
    h.down[m] = -1;
    heap.push(z[m], m);
  }
  while (heap.n > 0) {
    const c = heap.pop();
    h.order[oc++] = c;
    const fc = h.filled[c];
    const n = nbrs(c, NB);
    for (let k = 0; k < n; k++) {
      const j = NB[k];
      if (closed[j]) continue;
      closed[j] = 1;
      const fz = Math.max(z[j], fc + 0.01);
      h.filled[j] = fz;
      h.down[j] = c;
      heap.push(fz, j);
    }
  }
  h.seaLevelUsed = sea;
}

/** Flow accumulation from simulated runoff (mm/yr) and lake detection. O(N). */
export function accumulateFlow(s: SimState, h: Hydro) {
  const flow = h.flow;
  const sea = s.seaLevel;
  const run = s.f.runoffAnn;
  for (let y = 0; y < HR_H; y++) {
    const areaKm2 = HR_GEOM.areaKm2[y];
    const sy = (y / HR_SCALE) | 0;
    for (let x = 0; x < HR_W; x++) {
      const i = y * HR_W + x;
      const si = sy * SIM_W + ((x / HR_SCALE) | 0);
      // mm/yr * km2 -> m3/s : 1 mm * 1 km2 = 1000 m3
      flow[i] = s.hrElev[i] > sea ? (run[si] * areaKm2 * 1000) / 31_557_600 : 0;
    }
  }
  // order is low→high from priority flood; accumulate high→low
  const order = h.order;
  for (let k = HR_N - 1; k >= 0; k--) {
    const i = order[k];
    const d = h.down[i];
    if (d >= 0) flow[d] += flow[i];
  }
  const lakeFrac = s.f.lakeFrac;
  lakeFrac.fill(0);
  const riverIdx = s.f.riverIdx;
  riverIdx.fill(0);
  for (let i = 0; i < HR_N; i++) {
    const land = s.hrElev[i] > sea;
    const y = (i / HR_W) | 0, x = i % HR_W;
    const si = ((y / HR_SCALE) | 0) * SIM_W + ((x / HR_SCALE) | 0);
    const depth = h.filled[i] - s.hrElev[i];
    const lk = land && depth > 3 && run[si] > 40 && s.f.temp[si] > -15 && s.f.ice[si] < 5 ? 1 : 0;
    h.lake[i] = lk;
    if (lk) lakeFrac[si] += 1 / (HR_SCALE * HR_SCALE);
    if (land) {
      const r = Math.log10(1 + flow[i]) / 4.5;
      if (r > riverIdx[si]) riverIdx[si] = Math.min(1, r);
    }
  }
}

export function lakeCount(h: Hydro): number {
  let n = 0;
  for (let i = 0; i < HR_N; i++) n += h.lake[i];
  return n;
}

export const RIVER_FLOW_THRESHOLD = 1500; // m3/s shown as river on the map
export { SIM_N };
