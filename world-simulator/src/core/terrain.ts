import { HR_GEOM, HR_H, HR_SCALE, HR_W, SIM_H, SIM_N, SIM_W, latLonToVec, lonOfX, angDist, EARTH_RADIUS_KM } from './grid';
import { Noise3 } from './noise';
import { Rng, seedToInt } from './rng';
import { smoothstep } from './math';
import { makeName } from './names';
import type { PlanetParams } from './types';
import type { Region, SimState } from './state';

/** Procedural HR elevation (metres, sea level = 0) from seed + params. Deterministic. */
export function generateElevation(p: PlanetParams, out: Float32Array) {
  const seed = seedToInt(p.seed);
  const n1 = new Noise3(seed);
  const n2 = new Noise3(seed ^ 0x5bd1e995);
  const n3 = new Noise3(seed ^ 0x1b873593);
  const raw = new Float32Array(out.length);
  const v: [number, number, number] = [0, 0, 0];
  for (let y = 0; y < HR_H; y++) {
    const lat = HR_GEOM.lat[y];
    for (let x = 0; x < HR_W; x++) {
      latLonToVec(lat, lonOfX(x, HR_W), v);
      const wx = n2.fbm(v[0] * 1.5 + 10, v[1] * 1.5, v[2] * 1.5, 3);
      const wy = n2.fbm(v[0] * 1.5, v[1] * 1.5 + 20, v[2] * 1.5, 3);
      const wz = n2.fbm(v[0] * 1.5, v[1] * 1.5, v[2] * 1.5 + 30, 3);
      const px = v[0] + 0.4 * wx, py = v[1] + 0.4 * wy, pz = v[2] + 0.4 * wz;
      raw[y * HR_W + x] = n1.fbm(px * 1.1, py * 1.1, pz * 1.1, 6) + 0.22 * n1.fbm(v[0] * 3 + 5, v[1] * 3, v[2] * 3, 4);
    }
  }
  // area-weighted quantile -> exact land ratio
  const idx = new Uint32Array(raw.length);
  for (let i = 0; i < idx.length; i++) idx[i] = i;
  const sorted = Array.from(idx).sort((a, b) => raw[a] - raw[b]);
  const total = HR_GEOM.totalAreaKm2;
  let acc = 0;
  let thr = raw[sorted[sorted.length - 1]];
  const target = (1 - p.landRatio) * total;
  for (const i of sorted) {
    acc += HR_GEOM.areaKm2[(i / HR_W) | 0];
    if (acc >= target) {
      thr = raw[i];
      break;
    }
  }
  const rmin = raw[sorted[0]], rmax = raw[sorted[sorted.length - 1]];
  const md = p.mountainDensity;
  for (let y = 0; y < HR_H; y++) {
    const lat = HR_GEOM.lat[y];
    for (let x = 0; x < HR_W; x++) {
      const i = y * HR_W + x;
      latLonToVec(lat, lonOfX(x, HR_W), v);
      const c = raw[i];
      if (c >= thr) {
        const t = (c - thr) / Math.max(1e-6, rmax - thr);
        let e = 20 + 900 * Math.pow(t, 0.9);
        const ridge = n3.ridged(v[0] * 2.4 + 3, v[1] * 2.4, v[2] * 2.4, 5);
        const belt = smoothstep(0.42 - 0.25 * md, 0.85 - 0.2 * md, n3.fbm(v[0] * 1.3 + 20, v[1] * 1.3, v[2] * 1.3, 3) * 0.5 + 0.5);
        e += ridge * ridge * belt * (1500 + 6000 * md) * smoothstep(0, 0.12, t);
        e += 220 * n2.fbm(v[0] * 9, v[1] * 9, v[2] * 9, 4) * smoothstep(0, 0.08, t);
        out[i] = Math.max(2, e);
      } else {
        const sN = (thr - c) / Math.max(1e-6, thr - rmin);
        const shelf = 30 + 170 * smoothstep(0, 0.05, sN);
        const abyss = p.oceanDepth * 1.15 * smoothstep(0.03, 0.45, sN);
        const ridge = n3.ridged(v[0] * 2 + 7, v[1] * 2, v[2] * 2, 4);
        const e = -(shelf + abyss) + ridge * ridge * 1800 * smoothstep(0.15, 0.5, sN) + 150 * n2.fbm(v[0] * 8, v[1] * 8, v[2] * 8, 3);
        out[i] = Math.min(-5, e);
      }
    }
  }
}

/** Downsample HR terrain to sim cells (land fraction + mean land / ocean elevation). */
export function recomputeSimTerrain(s: SimState, y0 = 0, y1 = SIM_H - 1) {
  const f = s.f;
  const sea = s.seaLevel;
  const inv = 1 / (HR_SCALE * HR_SCALE);
  for (let y = y0; y <= y1; y++) {
    for (let x = 0; x < SIM_W; x++) {
      let land = 0, sl = 0, so = 0;
      for (let dy = 0; dy < HR_SCALE; dy++) {
        const row = (y * HR_SCALE + dy) * HR_W + x * HR_SCALE;
        for (let dx = 0; dx < HR_SCALE; dx++) {
          const z = s.hrElev[row + dx];
          if (z > sea) {
            land++;
            sl += z;
          } else so += z;
        }
      }
      const i = y * SIM_W + x;
      f.landFrac[i] = land * inv;
      const isL = f.landFrac[i] >= 0.5;
      f.elev[i] = isL ? sl / Math.max(1, land) : so / Math.max(1, HR_SCALE * HR_SCALE - land);
    }
  }
}

/** Connected components of land / ocean on the sim grid, with procedural names. */
export function computeRegions(s: SimState, rng: Rng) {
  const f = s.f;
  const reg = s.region;
  reg.fill(-1);
  const regions: Region[] = [];
  const stack: number[] = [];
  for (let start = 0; start < SIM_N; start++) {
    if (reg[start] >= 0) continue;
    const ocean = f.landFrac[start] < 0.5;
    const id = regions.length;
    let count = 0, sx = 0, sy = 0, sz = 0;
    stack.push(start);
    reg[start] = id;
    while (stack.length) {
      const c = stack.pop()!;
      count++;
      const v = latLonToVec(SIM_GEOMlat(c), lonOfX(c % SIM_W, SIM_W));
      sx += v[0]; sy += v[1]; sz += v[2];
      const x = c % SIM_W, y = (c / SIM_W) | 0;
      const nb = [y * SIM_W + ((x + 1) % SIM_W), y * SIM_W + ((x + SIM_W - 1) % SIM_W)];
      if (y > 0) nb.push(c - SIM_W);
      if (y < SIM_H - 1) nb.push(c + SIM_W);
      for (const j of nb) {
        if (reg[j] < 0 && (f.landFrac[j] < 0.5) === ocean) {
          reg[j] = id;
          stack.push(j);
        }
      }
    }
    const r = Math.hypot(sx, sy, sz) || 1;
    const lat = Math.asin(sy / r) * 57.2958;
    const base = makeName(rng, count > 400 ? 2 : 1);
    let name: string;
    if (ocean) name = count > 600 ? `${base} Okyanusu` : count > 40 ? `${base} Denizi` : `${base} Gölü`;
    else name = count > 300 ? `${base} Kıtası` : count > 30 ? `${base} Adaları` : `${base} Adası`;
    if (!ocean && count > 300 && Math.abs(lat) > 35) name = `${lat > 0 ? 'Kuzey' : 'Güney'} ${name}`;
    regions.push({ id, name, ocean, cells: count });
  }
  s.regions = regions;
}

function SIM_GEOMlat(c: number) {
  return 90 - ((((c / SIM_W) | 0) + 0.5) * 180) / SIM_H;
}

/** Gaussian brush on HR elevation. Returns affected sim row range. */
export function brushElevation(s: SimState, lat: number, lon: number, radiusKm: number, deltaM: number, mode: 'add' | 'crater' | 'lake' = 'add') {
  const angR = radiusKm / EARTH_RADIUS_KM;
  const latSpan = (angR * 180) / Math.PI + 1;
  const yA = Math.max(0, Math.floor(((90 - (lat + latSpan)) / 180) * HR_H));
  const yB = Math.min(HR_H - 1, Math.ceil(((90 - (lat - latSpan)) / 180) * HR_H));
  let minNear = Infinity;
  if (mode === 'lake') {
    for (let y = yA; y <= yB; y++) for (let x = 0; x < HR_W; x++) {
      const d = angDist(lat, lon, HR_GEOM.lat[y], lonOfX(x, HR_W));
      if (d <= angR) minNear = Math.min(minNear, s.hrElev[y * HR_W + x]);
    }
  }
  for (let y = yA; y <= yB; y++) {
    const la = HR_GEOM.lat[y];
    for (let x = 0; x < HR_W; x++) {
      const d = angDist(lat, lon, la, lonOfX(x, HR_W)) / angR;
      if (d > 1.6) continue;
      const i = y * HR_W + x;
      if (mode === 'add') {
        s.hrElev[i] += deltaM * Math.exp(-d * d * 2.5);
      } else if (mode === 'crater') {
        // bowl with raised rim
        const bowl = d < 1 ? -(1 - d * d) : 0;
        const rim = Math.exp(-(((d - 1.05) / 0.15) ** 2)) * 0.25;
        s.hrElev[i] += deltaM * (bowl + rim);
      } else if (mode === 'lake' && d < 1) {
        const target = Math.max(s.seaLevel + 8, minNear - deltaM * (1 - d * d));
        if (s.hrElev[i] > target) s.hrElev[i] = target;
      }
    }
  }
  const sy0 = Math.max(0, Math.floor(yA / HR_SCALE));
  const sy1 = Math.min(SIM_H - 1, Math.ceil(yB / HR_SCALE));
  return { sy0, sy1 };
}
