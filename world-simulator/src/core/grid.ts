/**
 * Equirectangular simulation grids.
 * Row 0 = north. Longitude wraps; latitude clamps at the poles.
 * Coordinate convention matches THREE.SphereGeometry (see latLonToVec).
 */
export const SIM_W = 160;
export const SIM_H = 80;
export const HR_SCALE = 4;
export const HR_W = SIM_W * HR_SCALE;
export const HR_H = SIM_H * HR_SCALE;
export const SIM_N = SIM_W * SIM_H;
export const HR_N = HR_W * HR_H;

export const EARTH_RADIUS_KM = 6371;
export const DEG = Math.PI / 180;

export interface GridGeom {
  w: number;
  h: number;
  lat: Float32Array; // per row, degrees (center)
  cosLat: Float32Array; // per row
  areaKm2: Float32Array; // per row (cell area)
  totalAreaKm2: number;
}

export function makeGeom(w: number, h: number): GridGeom {
  const lat = new Float32Array(h);
  const cosLat = new Float32Array(h);
  const areaKm2 = new Float32Array(h);
  let total = 0;
  const dLon = (2 * Math.PI) / w;
  for (let y = 0; y < h; y++) {
    const la = 90 - ((y + 0.5) * 180) / h;
    lat[y] = la;
    cosLat[y] = Math.cos(la * DEG);
    const top = (90 - (y * 180) / h) * DEG;
    const bot = (90 - ((y + 1) * 180) / h) * DEG;
    areaKm2[y] = EARTH_RADIUS_KM * EARTH_RADIUS_KM * dLon * (Math.sin(top) - Math.sin(bot));
    total += areaKm2[y] * w;
  }
  return { w, h, lat, cosLat, areaKm2, totalAreaKm2: total };
}

export const SIM_GEOM = makeGeom(SIM_W, SIM_H);
export const HR_GEOM = makeGeom(HR_W, HR_H);

export function lonOfX(x: number, w: number): number {
  return -180 + ((x + 0.5) * 360) / w;
}

/** Unit vector for lat/lon, consistent with THREE.SphereGeometry UV layout. */
export function latLonToVec(latDeg: number, lonDeg: number, out: [number, number, number] = [0, 0, 0]) {
  const phi = (lonDeg + 180) * DEG;
  const la = latDeg * DEG;
  const c = Math.cos(la);
  out[0] = -Math.cos(phi) * c;
  out[1] = Math.sin(la);
  out[2] = Math.sin(phi) * c;
  return out;
}

export function vecToLatLon(x: number, y: number, z: number): { lat: number; lon: number } {
  const r = Math.hypot(x, y, z) || 1;
  const lat = Math.asin(Math.max(-1, Math.min(1, y / r))) / DEG;
  let lon = Math.atan2(z, -x) / DEG - 180;
  if (lon < -180) lon += 360;
  if (lon >= 180) lon -= 360;
  return { lat, lon };
}

/** Fractional grid coordinates (cell-center based) for lat/lon. */
export function latLonToGrid(lat: number, lon: number, w: number, h: number): { gx: number; gy: number } {
  const gx = ((lon + 180) / 360) * w - 0.5;
  const gy = ((90 - lat) / 180) * h - 0.5;
  return { gx, gy };
}

export function cellOf(lat: number, lon: number, w = SIM_W, h = SIM_H): number {
  let x = Math.floor(((lon + 180) / 360) * w);
  let y = Math.floor(((90 - lat) / 180) * h);
  x = ((x % w) + w) % w;
  y = Math.max(0, Math.min(h - 1, y));
  return y * w + x;
}

export function wrapX(x: number, w: number): number {
  return ((x % w) + w) % w;
}

/** Bilinear sample with longitude wrap and latitude clamp. */
export function sampleBilinear(f: ArrayLike<number>, w: number, h: number, gx: number, gy: number): number {
  if (gy < 0) gy = 0;
  if (gy > h - 1) gy = h - 1;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = gx - x0;
  const fy = gy - y0;
  const xa = wrapX(x0, w);
  const xb = wrapX(x0 + 1, w);
  const y1 = Math.min(h - 1, y0 + 1);
  const r0 = y0 * w;
  const r1 = y1 * w;
  const a = f[r0 + xa] * (1 - fx) + f[r0 + xb] * fx;
  const b = f[r1 + xa] * (1 - fx) + f[r1 + xb] * fx;
  return a * (1 - fy) + b * fy;
}

/** Great-circle angular distance (radians). */
export function angDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = lat1 * DEG, p2 = lat2 * DEG;
  const dp = p2 - p1, dl = (lon2 - lon1) * DEG;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function cellLat(i: number): number {
  return SIM_GEOM.lat[(i / SIM_W) | 0];
}
export function cellLon(i: number): number {
  return lonOfX(i % SIM_W, SIM_W);
}

/** Collect sim cells within a radius (km) of a point, with a smooth falloff weight. */
export function cellsInRadius(lat: number, lon: number, radiusKm: number): { idx: number[]; w: number[] } {
  const idx: number[] = [];
  const w: number[] = [];
  const angR = radiusKm / EARTH_RADIUS_KM;
  const latSpan = angR / DEG + 180 / SIM_H;
  const y0 = Math.max(0, Math.floor(((90 - (lat + latSpan)) / 180) * SIM_H));
  const y1 = Math.min(SIM_H - 1, Math.ceil(((90 - (lat - latSpan)) / 180) * SIM_H));
  for (let y = y0; y <= y1; y++) {
    const la = SIM_GEOM.lat[y];
    for (let x = 0; x < SIM_W; x++) {
      const lo = lonOfX(x, SIM_W);
      const d = angDist(lat, lon, la, lo);
      const halfCell = (Math.PI / SIM_H) * 0.7;
      if (d <= angR + halfCell) {
        const t = Math.min(1, d / Math.max(angR, 1e-6));
        idx.push(y * SIM_W + x);
        w.push(Math.max(0.15, 1 - t * t));
      }
    }
  }
  return { idx, w };
}

/** 8-neighbour offsets helper for sim grid (wrap x, clamp y). */
export function neighbors4(i: number, w: number, h: number, out: Int32Array): number {
  const x = i % w;
  const y = (i / w) | 0;
  let n = 0;
  out[n++] = y * w + wrapX(x - 1, w);
  out[n++] = y * w + wrapX(x + 1, w);
  if (y > 0) out[n++] = (y - 1) * w + x;
  if (y < h - 1) out[n++] = (y + 1) * w + x;
  return n;
}
