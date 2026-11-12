/**
 * Paints equirectangular RGBA textures (HR resolution) from simulation state for each map layer,
 * plus a cloud/haze texture. Rows are written bottom-up to match THREE's UV (v=0 at south).
 */
import { HR_H, HR_N, HR_SCALE, HR_W, SIM_H, SIM_W, latLonToVec, lonOfX, HR_GEOM, angDist, EARTH_RADIUS_KM, latLonToGrid } from './grid';
import { Noise3 } from './noise';
import { seedToInt } from './rng';
import type { Hydro } from './hydrology';
import { RIVER_FLOW_THRESHOLD } from './hydrology';
import type { SimState } from './state';
import type { MapLayer } from './types';

// per-axis bilinear lookup tables (HR pixel -> sim cell)
const LX0 = new Int32Array(HR_W), LX1 = new Int32Array(HR_W), LFX = new Float32Array(HR_W);
const LY0 = new Int32Array(HR_H), LY1 = new Int32Array(HR_H), LFY = new Float32Array(HR_H);
for (let x = 0; x < HR_W; x++) {
  const g = (x + 0.5) / HR_SCALE - 0.5;
  const x0 = Math.floor(g);
  LFX[x] = g - x0;
  LX0[x] = ((x0 % SIM_W) + SIM_W) % SIM_W;
  LX1[x] = (LX0[x] + 1) % SIM_W;
}
for (let y = 0; y < HR_H; y++) {
  const g = Math.min(SIM_H - 1, Math.max(0, (y + 0.5) / HR_SCALE - 0.5));
  const y0 = Math.floor(g);
  LFY[y] = g - y0;
  LY0[y] = y0;
  LY1[y] = Math.min(SIM_H - 1, y0 + 1);
}

export class Painter {
  shade = new Float32Array(HR_N);
  vary = new Float32Array(HR_N);
  cloudA = new Float32Array(HR_N);
  cloudB = new Float32Array(HR_N);
  private seed = -1;
  private tmp: Record<string, Float32Array> = {};

  prepareStatic(s: SimState) {
    const seed = seedToInt(s.params.seed);
    if (seed !== this.seed) {
      this.seed = seed;
      const n = new Noise3(seed ^ 0x77);
      const v: [number, number, number] = [0, 0, 0];
      for (let y = 0; y < HR_H; y++) {
        const lat = HR_GEOM.lat[y];
        for (let x = 0; x < HR_W; x++) {
          latLonToVec(lat, lonOfX(x, HR_W), v);
          const i = y * HR_W + x;
          this.vary[i] = n.fbm(v[0] * 14, v[1] * 14, v[2] * 14, 3) * 0.5 + 0.5;
          this.cloudA[i] = n.fbm(v[0] * 5 + 9, v[1] * 9, v[2] * 5, 5) * 0.5 + 0.5;
          this.cloudB[i] = n.fbm(v[0] * 6, v[1] * 10 + 4, v[2] * 6 + 2, 5) * 0.5 + 0.5;
        }
      }
    }
    this.computeShade(s);
  }

  computeShade(s: SimState) {
    const z = s.hrElev;
    const sea = s.seaLevel;
    // light from north-west, slope exaggerated for readability
    for (let y = 0; y < HR_H; y++) {
      const cw = Math.max(0.15, HR_GEOM.cosLat[y]);
      for (let x = 0; x < HR_W; x++) {
        const i = y * HR_W + x;
        const xe = y * HR_W + ((x + 1) % HR_W), xw = y * HR_W + ((x + HR_W - 1) % HR_W);
        const yn = y > 0 ? i - HR_W : i, ys = y < HR_H - 1 ? i + HR_W : i;
        const hz = (a: number) => Math.max(a, sea);
        const dx = (hz(z[xe]) - hz(z[xw])) / cw;
        const dy = hz(z[yn]) - hz(z[ys]);
        const sl = (-dx - dy) * 0.00045;
        this.shade[i] = Math.max(0.55, Math.min(1.35, 1 + sl));
      }
    }
  }

  private sampler(field: Float32Array) {
    return (x: number, y: number) => {
      const a = LY0[y] * SIM_W, b = LY1[y] * SIM_W, fx = LFX[x], fy = LFY[y];
      const x0 = LX0[x], x1 = LX1[x];
      return (field[a + x0] * (1 - fx) + field[a + x1] * fx) * (1 - fy) + (field[b + x0] * (1 - fx) + field[b + x1] * fx) * fy;
    };
  }

  private totalAnimals(s: SimState) {
    const t = (this.tmp.animals ??= new Float32Array(SIM_W * SIM_H));
    t.fill(0);
    s.species.forEach((sp, k) => {
      if (sp.category === 'microbe') return;
      const b = s.bio[k];
      for (let i = 0; i < t.length; i++) t[i] += b[i];
    });
    return t;
  }

  paintSurface(s: SimState, h: Hydro, layer: MapLayer, out: Uint8ClampedArray) {
    const f = s.f;
    const sea = s.seaLevel;
    const z = s.hrElev;
    const S = (a: Float32Array) => this.sampler(a);
    const sTemp = S(f.temp), sTree = S(f.tree), sGrass = S(f.grass), sShrub = S(f.shrub), sFarm = S(f.farm);
    const sSnow = S(f.snow), sIce = S(f.ice), sSeaIce = S(f.seaIce), sSoil = S(f.soilW), sFire = S(f.fire), sBurn = S(f.burnScar);
    const sTempAnn = S(f.tempAnn), sPrecip = S(f.precipAnn), sDamage = S(f.damage), sHum = S(f.humans);
    const animals = layer === 'animals' ? S(this.totalAnimals(s)) : null;
    const sRiver = S(f.riverIdx);
    for (let y = 0; y < HR_H; y++) {
      const orow = (HR_H - 1 - y) * HR_W;
      for (let x = 0; x < HR_W; x++) {
        const i = y * HR_W + x;
        const o = (orow + x) * 4;
        const e = z[i] - sea;
        const land = e > 0;
        const sh = this.shade[i];
        const vr = this.vary[i];
        let r = 0, g = 0, b = 0;
        const lake = h.lake[i] === 1;
        const river = land && h.flow[i] > RIVER_FLOW_THRESHOLD;
        if (layer === 'normal') {
          if (!land) {
            const d = Math.min(1, Math.sqrt(-e / 5000));
            r = 34 - 26 * d; g = 110 - 82 * d; b = 140 - 72 * d;
            const si = Math.min(1, sSeaIce(x, y) * 1.1);
            r += (225 - r) * si; g += (235 - g) * si; b += (245 - b) * si;
          } else {
            // sub-cell variation: modulate cover with static noise so 2.25° cells do not read as blocks
            const nv = (vr - 0.5) * 0.9;
            const T = clamp01(sTree(x, y) * (1 + nv * 1.6)), G = clamp01(sGrass(x, y) * (1 - nv * 0.6)), Sh = sShrub(x, y), F = sFarm(x, y);
            const ta = sTempAnn(x, y), sw = sSoil(x, y);
            const bare = Math.max(0, 1 - T - G - Sh - F);
            // bare ground: sand (hot/dry) → rock/tundra (cold/high)
            const cold = Math.min(1, Math.max(0, (8 - ta) / 20)) ;
            const high = Math.min(1, e / 3500);
            let br = 206 - 70 * cold - 40 * high, bg = 178 - 55 * cold - 40 * high, bb = 126 - 20 * cold - 15 * high;
            br += (vr - 0.5) * 30; bg += (vr - 0.5) * 24;
            const trop = Math.min(1, Math.max(0, (ta - 12) / 14)), bor = Math.min(1, Math.max(0, (6 - ta) / 12));
            const tr = 38 - 8 * trop - 6 * bor, tg = 92 + 6 * trop - 22 * bor, tb = 40 - 4 * trop + 10 * bor;
            const dryG = Math.min(1, Math.max(0, (0.35 - sw) / 0.3));
            const gr = 112 + 70 * dryG, gg = 150 + 18 * dryG, gb = 64 + 20 * dryG;
            r = br * bare + tr * T + gr * G + 120 * Sh + 196 * F;
            g = bg * bare + tg * T + gg * G + 124 * Sh + 172 * F;
            b = bb * bare + tb * T + gb * G + 70 * Sh + 96 * F;
            const tot = bare + T + G + Sh + F;
            r /= tot; g /= tot; b /= tot;
            const burn = sBurn(x, y) * 0.75;
            r += (55 - r) * burn; g += (45 - g) * burn; b += (38 - b) * burn;
            const snow = clamp01((sSnow(x, y) / 40) * (1 + nv) + Math.max(0, e - 2500) / 6000 * sSnow(x, y) / 10);
            const ice = clamp01(sIce(x, y) / 8 + nv * 0.3);
            r += (242 - r) * snow; g += (246 - g) * snow; b += (250 - b) * snow;
            r += (214 - r) * ice; g += (230 - g) * ice; b += (246 - b) * ice;
            r *= sh; g *= sh; b *= sh;
            if (lake) { r = 44; g = 104; b = 160; }
            else if (river) {
              const a = Math.min(0.85, 0.35 + Math.log10(h.flow[i] / RIVER_FLOW_THRESHOLD) * 0.4);
              r += (52 - r) * a; g += (112 - g) * a; b += (178 - b) * a;
            }
            const fire = sFire(x, y);
            if (fire > 0.05) {
              const a = Math.min(1, fire * 1.3) * (0.6 + 0.4 * vr);
              r += (255 - r) * a; g += (110 - g) * a; b += (20 - b) * a;
            }
          }
        } else {
          // data layers on desaturated relief
          const base = land ? 70 * sh : 28;
          r = base; g = base; b = land ? base : 40;
          let v = -1;
          let ramp: (t: number) => [number, number, number] = rampSeq;
          switch (layer) {
            case 'temperature': v = (sTemp(x, y) + 40) / 80; ramp = rampDiv; break;
            case 'precipitation': v = Math.sqrt(Math.min(1, sPrecip(x, y) / 3000)); ramp = rampBlue; break;
            case 'elevation': {
              const c = hypso(e);
              r = c[0] * sh; g = c[1] * sh; b = c[2] * sh;
              break;
            }
            case 'vegetation': if (land) { v = Math.min(1, sTree(x, y) + 0.6 * sGrass(x, y) + 0.5 * sShrub(x, y)); ramp = rampGreen; } break;
            case 'population': if (land) { const d = sHum(x, y); v = d > 0.001 ? Math.min(1, Math.log10(1 + d * 10) / 3.2) : -1; ramp = rampHeat; } break;
            case 'animals': if (animals) { const d = animals(x, y); v = d > 0.1 ? Math.min(1, Math.log10(1 + d) / 4) : -1; ramp = rampPurple; } break;
            case 'disaster': { const d = sDamage(x, y) + sFire(x, y); v = d > 0.01 ? Math.min(1, d) : -1; ramp = rampHeat; break; }
            case 'water': if (land) { v = Math.min(1, Math.max(sSoil(x, y), sRiver(x, y) * 0.8, lake ? 1 : 0)); ramp = rampBlue; } break;
          }
          if (v >= 0) {
            const c = ramp(Math.max(0, Math.min(1, v)));
            const a = land || layer === 'temperature' || layer === 'precipitation' || layer === 'disaster' ? 0.85 : 0.5;
            r = r * (1 - a) + c[0] * a * (land ? sh : 1);
            g = g * (1 - a) + c[1] * a * (land ? sh : 1);
            b = b * (1 - a) + c[2] * a * (land ? sh : 1);
          }
          if ((layer === 'water' || layer === 'elevation') && river) { r = 70; g = 150; b = 230; }
        }
        out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 255;
      }
    }
    // settlement markers (normal & population layers)
    if (layer === 'normal' || layer === 'population') {
      for (const st of s.settlements) {
        const { gx, gy } = latLonToGrid(st.lat, st.lon, HR_W, HR_H);
        const rad = Math.min(4, 0.6 + Math.log10(Math.max(10, st.pop)) * 0.45);
        const lit = st.tech >= 6 ? [255, 236, 170] : [255, 205, 120];
        for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
          const d = Math.hypot(dx, dy);
          if (d > rad) continue;
          const px = (((Math.round(gx) + dx) % HR_W) + HR_W) % HR_W;
          const py = Math.round(gy) + dy;
          if (py < 0 || py >= HR_H) continue;
          const o = ((HR_H - 1 - py) * HR_W + px) * 4;
          const a = 1 - d / (rad + 0.5);
          out[o] += (lit[0] - out[o]) * a; out[o + 1] += (lit[1] - out[o + 1]) * a; out[o + 2] += (lit[2] - out[o + 2]) * a;
        }
      }
    }
  }

  paintClouds(s: SimState, out: Uint8ClampedArray, t: number) {
    const f = s.f;
    const sCloud = this.sampler(f.cloud), sSmoke = this.sampler(f.smoke);
    const haze = Math.min(0.55, s.aerosol * 0.06);
    const wA = 0.5 + 0.5 * Math.sin(t * 0.7), wB = 1 - wA;
    const storms = s.events.filter((e) => e.type === 'hurricane' || e.type === 'superstorm' || e.type === 'tornado' || e.type === 'volcano');
    for (let y = 0; y < HR_H; y++) {
      const orow = (HR_H - 1 - y) * HR_W;
      const lat = HR_GEOM.lat[y];
      for (let x = 0; x < HR_W; x++) {
        const i = y * HR_W + x;
        const o = (orow + x) * 4;
        const det = this.cloudA[i] * wA + this.cloudB[i] * wB;
        const c = sCloud(x, y);
        let a = Math.max(0, Math.min(1, (c * 1.25 - 0.32 + (det - 0.5) * 0.9))) ;
        a = a * a * (3 - 2 * a) * 0.92;
        const sm = Math.min(1, sSmoke(x, y) * 0.04);
        let r = 255, g = 255, b = 255;
        if (sm > 0.02) {
          r = 255 - 150 * sm; g = 255 - 160 * sm; b = 255 - 170 * sm;
          a = Math.max(a, sm * (0.5 + 0.5 * det));
        }
        if (haze > 0) {
          a = a + (1 - a) * haze * (0.6 + 0.4 * det);
          r -= 40 * haze; g -= 55 * haze; b -= 75 * haze;
        }
        if (storms.length) {
          const lon = lonOfX(x, HR_W);
          for (const ev of storms) {
            if (Math.abs(lat - ev.lat) * 111 > ev.radiusKm * 1.2) continue;
            const d = angDist(lat, lon, ev.lat, ev.lon) * EARTH_RADIUS_KM;
            if (d > ev.radiusKm) continue;
            const rr = d / ev.radiusKm;
            if (ev.type === 'volcano') {
              const ash = (1 - rr) * ev.intensity * (0.5 + 0.5 * det);
              a = Math.max(a, ash * 0.9);
              r = r * (1 - ash) + 90 * ash; g = g * (1 - ash) + 84 * ash; b = b * (1 - ash) + 80 * ash;
              continue;
            }
            const dLon = (lon - ev.lon) * Math.cos((lat * Math.PI) / 180);
            const th = Math.atan2(lat - ev.lat, dLon) * (ev.lat >= 0 ? 1 : -1);
            const arm = 0.5 + 0.5 * Math.cos(2 * th + 7 * Math.log(rr + 0.03) - t * 2);
            const eye = ev.type === 'tornado' ? 0 : rr < 0.06 ? 1 - rr / 0.06 : 0;
            const v = Math.min(1, ev.intensity * 1.4 + 0.25) * (1 - rr) * (0.35 + 0.65 * arm) * (1 - eye);
            a = Math.max(a * (1 - eye), v);
          }
        }
        out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = a * 255;
      }
    }
  }
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
function lerp3(a: number[], b: number[], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function rampStops(stops: number[][], t: number): [number, number, number] {
  const n = stops.length - 1;
  const k = Math.min(n - 1, Math.floor(t * n));
  return lerp3(stops[k], stops[k + 1], t * n - k);
}
const DIV = [[40, 60, 170], [70, 150, 220], [235, 240, 240], [245, 170, 70], [200, 40, 40]];
const SEQ = [[20, 40, 70], [40, 160, 170], [230, 240, 160]];
const BLUE = [[230, 220, 160], [120, 200, 200], [40, 120, 210], [30, 40, 150]];
const GREEN = [[200, 180, 120], [140, 190, 80], [30, 120, 50], [10, 70, 30]];
const HEAT = [[60, 20, 60], [200, 50, 40], [250, 170, 50], [255, 250, 200]];
const PURPLE = [[40, 30, 70], [120, 60, 170], [220, 120, 200], [255, 220, 240]];
const rampDiv = (t: number) => rampStops(DIV, t);
const rampSeq = (t: number) => rampStops(SEQ, t);
const rampBlue = (t: number) => rampStops(BLUE, t);
const rampGreen = (t: number) => rampStops(GREEN, t);
const rampHeat = (t: number) => rampStops(HEAT, t);
const rampPurple = (t: number) => rampStops(PURPLE, t);
function hypso(e: number): [number, number, number] {
  if (e <= 0) {
    const d = Math.min(1, -e / 6000);
    return lerp3([90, 170, 210], [10, 30, 90], Math.sqrt(d));
  }
  const stops = [[70, 140, 70], [170, 180, 90], [190, 140, 80], [140, 100, 80], [245, 245, 245]];
  return rampStops(stops, Math.min(1, e / 6000));
}
