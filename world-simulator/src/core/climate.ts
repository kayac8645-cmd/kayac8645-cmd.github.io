/**
 * Climate engine.
 * PHYSICAL (simplified but standard): daily-mean top-of-atmosphere insolation, Budyko–Sellers
 * energy balance (OLR = A + B·T, meridional transport term), lapse rate, Clausius–Clapeyron
 * moisture capacity, degree-day snow/ice melt, CO2 forcing 5.35·ln(C/C0), barometric pressure.
 * HEURISTIC (tuned, not derived): prevailing wind belts, precipitation triggers, cloud cover,
 * evaporation coefficients, aerosol optical-depth forcing efficiency.
 */
import { DEG, EARTH_RADIUS_KM, SIM_GEOM, SIM_H, SIM_N, SIM_W } from './grid';
import { clamp, fracAbove, meanPositive, satVap } from './math';
import type { SimState } from './state';
import { dayOfYear } from './calendar';

export const OLR_A = 203.3;
export const OLR_B = 2.09;
export const LAPSE = 0.0065;
const S0 = 1361;

export function declination(day: number): number {
  return 23.44 * DEG * Math.sin((2 * Math.PI * (dayOfYear(day) - 80)) / 365);
}

export function dailyInsolation(latDeg: number, decl: number): number {
  const phi = latDeg * DEG;
  const tt = -Math.tan(phi) * Math.tan(decl);
  const h0 = tt >= 1 ? 0 : tt <= -1 ? Math.PI : Math.acos(tt);
  return (S0 / Math.PI) * (h0 * Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.sin(h0));
}

const annualQ = new Float32Array(SIM_H);
for (let y = 0; y < SIM_H; y++) {
  let s = 0;
  for (let k = 0; k < 73; k++) s += dailyInsolation(SIM_GEOM.lat[y], 23.44 * DEG * Math.sin((2 * Math.PI * k) / 73));
  annualQ[y] = s / 73;
}

export const annualInsolationRow = (y: number) => annualQ[y];

const dxM = new Float32Array(SIM_H);
const dyM = (Math.PI * EARTH_RADIUS_KM * 1000) / SIM_H;
for (let y = 0; y < SIM_H; y++) dxM[y] = Math.max(20000, (2 * Math.PI * EARTH_RADIUS_KM * 1000 * SIM_GEOM.cosLat[y]) / SIM_W);

const scratch = {
  t0: new Float32Array(SIM_N),
  q2: new Float32Array(SIM_N),
  wsat: new Float32Array(SIM_N),
  ups: new Float32Array(SIM_N),
  psum: new Float32Array(SIM_N),
  esum: new Float32Array(SIM_N),
  zonal: new Float32Array(SIM_H),
  ice2: new Float32Array(SIM_N),
  zs: new Float32Array(SIM_N),
};

function computeSurfaceHeights(s: SimState) {
  const f = s.f, zs = scratch.zs, sea = s.seaLevel;
  for (let i = 0; i < SIM_N; i++) zs[i] = f.landFrac[i] >= 0.5 ? Math.max(0, f.elev[i] + f.ice[i] - sea) : 0;
  return zs;
}

export const isLand = (s: SimState, i: number) => s.f.landFrac[i] >= 0.5;

export function totalForcing(s: SimState): number {
  return s.greenhouseBase + 5.35 * Math.log(Math.max(50, s.co2ppm) / 280) + s.eventForcing;
}

/** Height of the surface (incl. ice) above current sea level for land cells, 0 for ocean. */
export function surfaceHeight(s: SimState, i: number): number {
  if (!isLand(s, i)) return 0;
  return Math.max(0, s.f.elev[i] + s.f.ice[i] - s.seaLevel);
}

function belts(latShift: number) {
  const a = Math.abs(latShift);
  const g = (c: number, w: number) => Math.exp(-(((a - c) / w) ** 2));
  const u0 = -6 * g(12, 14) + 9 * g(45, 12) - 3 * g(75, 10);
  const sign = latShift >= 0 ? 1 : -1;
  const v0 = -sign * 3 * g(15, 10) + sign * 1.5 * g(45, 10);
  const p = -5 * Math.exp(-((latShift / 10) ** 2)) + 7 * g(30, 10) - 8 * g(60, 10) + 4 * g(88, 8);
  return { u0, v0, p };
}

export function climateStep(s: SimState, dt: number, annual: boolean): void {
  const f = s.f;
  const F_T0 = f.T0, F_cloud = f.cloud, F_eventTemp = f.eventTemp, F_farm = f.farm, F_grass = f.grass, F_ice = f.ice, F_landFrac = f.landFrac, F_pressure = f.pressure, F_seaIce = f.seaIce, F_shrub = f.shrub, F_smoke = f.smoke, F_snow = f.snow, F_temp = f.temp, F_tempAmp = f.tempAmp, F_tempAnn = f.tempAnn, F_tree = f.tree, F_userTemp = f.userTemp, F_windU = f.windU, F_windV = f.windV;
  const dens = s.params.atmosphereDensity;
  const C = 3.8 * Math.sqrt(dens);
  const D = 2.5;
  const decl = declination(s.day);
  const forcing = totalForcing(s);
  const aer = Math.exp(-0.1 * s.aerosol);
  const Tm = s.meanT0;
  const t0n = scratch.t0;
  const W = SIM_W;

  // --- energy balance ---
  for (let y = 0; y < SIM_H; y++) {
    const Q = annual ? annualQ[y] : dailyInsolation(SIM_GEOM.lat[y], decl);
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const land = F_landFrac[i] >= 0.5;
      let as: number;
      if (land) {
        const veg = Math.min(1, F_grass[i] + F_shrub[i] + F_tree[i] + F_farm[i]);
        const aLand = F_tree[i] * 0.13 + F_grass[i] * 0.2 + F_shrub[i] * 0.18 + F_farm[i] * 0.2 + (1 - veg) * 0.32;
        // annual mode: snow lies mostly during the low-sun season, so weight its albedo effect
        const snowCov = annual
          ? (1 - fracAbove(F_tempAnn[i], F_tempAmp[i], 0)) * 0.7
          : Math.min(1, F_snow[i] / 30);
        const cov = Math.max(snowCov, Math.min(1, F_ice[i] / 5));
        as = aLand + (0.75 - aLand) * cov;
      } else {
        as = 0.07 + (0.6 - 0.07) * F_seaIce[i] * (annual ? 0.75 : 1);
      }
      const cl = F_cloud[i];
      const ap = clamp(0.18 + 0.55 * as + 0.18 * (cl - 0.5), 0.05, 0.9);
      const smokeFac = Math.exp(-0.15 * F_smoke[i]);
      const Qabs = Q * (1 - ap) * aer * smokeFac;
      const u = F_windU[i], v = F_windV[i];
      const iw = y * W + (x === 0 ? W - 1 : x - 1);
      const ie = y * W + (x === W - 1 ? 0 : x + 1);
      const inn = y > 0 ? i - W : i;
      const is = y < SIM_H - 1 ? i + W : i;
      const wW = 1 + Math.max(0, u) / 5, wE = 1 + Math.max(0, -u) / 5;
      const wN = 1 + Math.max(0, -v) / 5, wS = 1 + Math.max(0, v) / 5;
      const Tn = (F_T0[iw] * wW + F_T0[ie] * wE + F_T0[inn] * wN + F_T0[is] * wS) / (wW + wE + wN + wS);
      const A = OLR_A - forcing - 8 * (cl - 0.5);
      const Teq = (Qabs - A + C * Tm + D * Tn) / (OLR_B + C + D) + F_eventTemp[i] + F_userTemp[i];
      const tau = land ? 12 : F_seaIce[i] > 0.5 ? 30 : 90;
      t0n[i] = F_T0[i] + (Teq - F_T0[i]) * (1 - Math.exp(-dt / tau));
    }
  }
  let sumT = 0, sumA = 0;
  const kYr = 1 - Math.exp(-dt / 365);
  const zsArr = computeSurfaceHeights(s);
  for (let y = 0; y < SIM_H; y++) {
    const a = SIM_GEOM.areaKm2[y];
    let zs = 0;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      F_T0[i] = t0n[i];
      sumT += t0n[i] * a;
      sumA += a;
      const t = t0n[i] - LAPSE * zsArr[i];
      F_temp[i] = t;
      zs += t;
      if (annual) {
        F_tempAnn[i] = t;
      } else {
        F_tempAnn[i] += (t - F_tempAnn[i]) * kYr;
        F_tempAmp[i] += (Math.abs(t - F_tempAnn[i]) * (Math.PI / 2) - F_tempAmp[i]) * kYr;
      }
      if (F_landFrac[i] < 0.5) {
        const target = annual
          ? 1 - fracAbove(F_tempAnn[i], F_tempAmp[i] * 0.6, -1.5)
          : clamp((-1 - t) / 5, 0, 1);
        F_seaIce[i] += (target - F_seaIce[i]) * (1 - Math.exp(-dt / 20));
      } else F_seaIce[i] = 0;
    }
    scratch.zonal[y] = zs / W;
  }
  s.meanT0 = sumT / sumA;

  // --- pressure & wind (heuristic belts + pressure-gradient correction) ---
  const latShift0 = annual ? 0 : (decl / DEG) * 0.45;
  for (let y = 0; y < SIM_H; y++) {
    const b = belts(SIM_GEOM.lat[y] - latShift0);
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      F_pressure[i] = 1013 * dens + b.p - 0.35 * (F_temp[i] - scratch.zonal[y]);
    }
  }
  for (let y = 0; y < SIM_H; y++) {
    const b = belts(SIM_GEOM.lat[y] - latShift0);
    const dxk = dxM[y] / 1000, dyk = dyM / 1000;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const iw = y * W + (x === 0 ? W - 1 : x - 1);
      const ie = y * W + (x === W - 1 ? 0 : x + 1);
      const inn = y > 0 ? i - W : i;
      const is = y < SIM_H - 1 ? i + W : i;
      const gx = (F_pressure[ie] - F_pressure[iw]) / (2 * dxk);
      const gy = (F_pressure[inn] - F_pressure[is]) / (2 * dyk);
      F_windU[i] = clamp(b.u0 - 200 * gx, -25, 25);
      F_windV[i] = clamp(b.v0 - 200 * gy, -15, 15);
    }
  }
  // store surface pressure (barometric reduction)
  for (let i = 0; i < SIM_N; i++) F_pressure[i] *= Math.exp(-zsArr[i] / 8400);

  moistureStep(s, dt, decl, annual);
  surfaceWaterStep(s, dt, annual);

  // --- global atmosphere bookkeeping ---
  s.aerosol *= Math.exp(-dt / 365);
  const smokeDecay = Math.exp(-dt / 8);
  for (let i = 0; i < SIM_N; i++) F_smoke[i] *= smokeDecay;
  s.co2ppm = 280 + (s.co2ppm - 280) * Math.exp(-dt / (365 * 150));
  updateSeaLevel(s);
}

function moistureStep(s: SimState, dt: number, decl: number, annual: boolean) {
  const f = s.f;
  const F_cloud = f.cloud, F_evap = f.evap, F_eventPrecip = f.eventPrecip, F_eventWind = f.eventWind, F_farm = f.farm, F_grass = f.grass, F_lakeFrac = f.lakeFrac, F_landFrac = f.landFrac, F_precip = f.precip, F_precipAnn = f.precipAnn, F_q = f.q, F_seaIce = f.seaIce, F_shrub = f.shrub, F_smoke = f.smoke, F_soilW = f.soilW, F_temp = f.temp, F_tree = f.tree, F_userPrecip = f.userPrecip, F_windU = f.windU, F_windV = f.windV;
  const W = SIM_W;
  const ws = scratch.wsat, ups = scratch.ups, psum = scratch.psum, esum = scratch.esum;
  const itczLat = annual ? 0 : (decl / DEG) * 0.45;
  const zsH = scratch.zs;
  for (let y = 0; y < SIM_H; y++) {
    const dxk = dxM[y], dyk = dyM;
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      ws[i] = Math.min(140, 2.2 * satVap(F_temp[i]));
      const z = zsH[i];
      if (z > 0) {
        const iw = y * W + (x === 0 ? W - 1 : x - 1);
        const ie = y * W + (x === W - 1 ? 0 : x + 1);
        const inn = y > 0 ? i - W : i;
        const is = y < SIM_H - 1 ? i + W : i;
        const dzdx = (zsH[ie] - zsH[iw]) / (2 * dxk);
        const dzdy = (zsH[inn] - zsH[is]) / (2 * dyk);
        ups[i] = Math.max(0, F_windU[i] * dzdx + F_windV[i] * dzdy);
      } else ups[i] = 0;
      psum[i] = 0;
      esum[i] = 0;
    }
  }
  const IT = 4;
  const dta = 0.375; // days of atmospheric time per iteration
  let q = f.q, q2 = scratch.q2;
  for (let it = 0; it < IT; it++) {
    for (let y = 0; y < SIM_H; y++) {
      const lat = SIM_GEOM.lat[y];
      const al = Math.abs(lat);
      const subs = Math.exp(-(((al - 27) / 9) ** 2));
      const itcz = Math.exp(-(((lat - itczLat) / 8) ** 2));
      const front = Math.exp(-(((al - 50) / 15) ** 2));
      const fx = (dta * 86400) / dxM[y];
      const fy = (dta * 86400) / dyM;
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        let gx = x - F_windU[i] * fx;
        let gy = y + F_windV[i] * fy;
        if (gy < 0) gy = 0;
        else if (gy > SIM_H - 1) gy = SIM_H - 1;
        const x0 = Math.floor(gx), y0 = Math.floor(gy);
        const ax = gx - x0, ay = gy - y0;
        let xa = x0 % W;
        if (xa < 0) xa += W;
        const xb = xa + 1 === W ? 0 : xa + 1;
        const r0 = y0 * W, r1 = (y0 + 1 < SIM_H ? y0 + 1 : y0) * W;
        const qa = (q[r0 + xa] * (1 - ax) + q[r0 + xb] * ax) * (1 - ay) + (q[r1 + xa] * (1 - ax) + q[r1 + xb] * ax) * ay;
        const wsi = ws[i];
        const deficit = Math.max(0, wsi - qa);
        const land = F_landFrac[i] >= 0.5;
        const wind = Math.sqrt(F_windU[i] * F_windU[i] + F_windV[i] * F_windV[i]) + F_eventWind[i];
        let E: number;
        if (land) {
          const veg = Math.min(1, F_grass[i] + F_shrub[i] + F_tree[i] + F_farm[i]);
          E = 0.08 * deficit * F_soilW[i] * (0.3 + 0.7 * veg) + 0.11 * deficit * F_lakeFrac[i];
          if (F_temp[i] < 0) E *= 0.3;
        } else {
          E = 0.16 * deficit * (0.5 + wind / 10) * (1 - F_seaIce[i]);
        }
        const RHc = 0.66 + 0.18 * subs - 0.12 * itcz;
        let P = Math.max(0, qa - RHc * wsi) * 2 + 0.045 * qa * front + qa * Math.min(0.8, ups[i] * 3) + 0.03 * qa * itcz;
        P *= Math.max(0, F_eventPrecip[i] * F_userPrecip[i]);
        P = Math.min(P, qa / dta + E);
        q2[i] = Math.max(0, qa + (E - P) * dta);
        psum[i] += P;
        esum[i] += E;
      }
    }
    const t = q; q = q2; q2 = t;
  }
  if (q !== f.q) f.q.set(q);
  const kc = 1 - Math.exp(-dt / 2);
  const kYr = 1 - Math.exp(-dt / 365);
  for (let i = 0; i < SIM_N; i++) {
    const P = psum[i] / IT;
    F_precip[i] = P;
    F_evap[i] = esum[i] / IT;
    if (annual) F_precipAnn[i] = P * 365;
    else F_precipAnn[i] += (P * 365 - F_precipAnn[i]) * kYr;
    const rh = F_q[i] / Math.max(0.5, ws[i]);
    const target = clamp((rh - 0.4) / 0.5, 0, 1) * 0.8 + Math.min(0.3, P * 0.03) + Math.min(0.2, F_smoke[i] * 0.05);
    F_cloud[i] += (clamp(target, 0, 1) - F_cloud[i]) * kc;
  }
}

function surfaceWaterStep(s: SimState, dt: number, annual: boolean) {
  const f = s.f;
  const F_evap = f.evap, F_ice = f.ice, F_landFrac = f.landFrac, F_precip = f.precip, F_runoffAnn = f.runoffAnn, F_snow = f.snow, F_soilW = f.soilW, F_temp = f.temp, F_tempAmp = f.tempAmp, F_tempAnn = f.tempAnn;
  const kYr = 1 - Math.exp(-dt / 365);
  for (let i = 0; i < SIM_N; i++) {
    if (F_landFrac[i] < 0.5) {
      F_soilW[i] = 1;
      F_snow[i] = 0;
      F_ice[i] = 0;
      F_runoffAnn[i] = 0;
      continue;
    }
    const P = F_precip[i] * dt;
    let snowfall: number, meltPot: number;
    if (annual) {
      const fb = 1 - fracAbove(F_tempAnn[i], F_tempAmp[i], 0.5);
      snowfall = P * fb;
      meltPot = 4 * meanPositive(F_tempAnn[i], F_tempAmp[i], 0) * dt;
    } else {
      const fb = clamp((1 - F_temp[i]) / 2, 0, 1);
      snowfall = P * fb;
      meltPot = 4 * Math.max(0, F_temp[i]) * dt;
    }
    const rain = P - snowfall;
    let snow = F_snow[i] + snowfall;
    const snowMelt = Math.min(snow, meltPot);
    snow -= snowMelt;
    const rest = meltPot - snowMelt;
    let ice = F_ice[i];
    const iceMeltMm = Math.min(ice * 900, rest * 0.8);
    ice -= iceMeltMm / 900;
    if (snow > 1000) {
      ice += (snow - 1000) / 900;
      snow = 1000;
    }
    F_snow[i] = snow;
    // ice-sheet discharge / calving: linear outflow, residence time ~1500 yr
    ice *= Math.exp(-dt / (365 * 1500));
    F_ice[i] = Math.min(3500, ice);
    // linear-reservoir soil bucket, solved exactly over dt (timestep-consistent)
    const S0 = F_soilW[i] * 200;
    const inflow = (rain + snowMelt + iceMeltMm) / Math.max(dt, 1e-6); // mm/day
    const lamE = F_evap[i] / Math.max(F_soilW[i], 0.02) / 200;
    const lamD = 0.004;
    const lam = lamE + lamD;
    const Seq = inflow / lam;
    let Sm = Seq + (S0 - Seq) * Math.exp(-lam * dt);
    const out = Math.max(0, S0 + inflow * dt - Sm);
    let runoff = (out * lamD) / lam;
    if (Sm > 200) {
      runoff += Sm - 200;
      Sm = 200;
    }
    F_soilW[i] = clamp(Sm / 200, 0, 1);
    const r = (runoff / Math.max(dt, 1e-6)) * 365;
    if (annual) F_runoffAnn[i] = r;
    else F_runoffAnn[i] += (r - F_runoffAnn[i]) * kYr;
  }
  // slow glacier spreading (diffusion of ice thickness across land)
  const kf = Math.min(0.2, (0.004 * dt) / 365);
  if (kf > 1e-6) {
    const ice2 = scratch.ice2;
    ice2.set(f.ice);
    for (let y = 0; y < SIM_H; y++) {
      for (let x = 0; x < SIM_W; x++) {
        const i = y * SIM_W + x;
        if (F_landFrac[i] < 0.5) continue;
        const iw = y * SIM_W + (x === 0 ? SIM_W - 1 : x - 1);
        const ie = y * SIM_W + (x === SIM_W - 1 ? 0 : x + 1);
        const inn = y > 0 ? i - SIM_W : i;
        const is = y < SIM_H - 1 ? i + SIM_W : i;
        const fi = F_ice[i];
        let flux = 0;
        if (F_landFrac[iw] >= 0.5) flux += F_ice[iw] - fi;
        if (F_landFrac[ie] >= 0.5) flux += F_ice[ie] - fi;
        if (F_landFrac[inn] >= 0.5) flux += F_ice[inn] - fi;
        if (F_landFrac[is] >= 0.5) flux += F_ice[is] - fi;
        ice2[i] = Math.max(0, F_ice[i] + kf * flux * 0.25);
      }
    }
    f.ice.set(ice2);
  }
}

export function landIceVolume(s: SimState): number {
  let v = 0;
  for (let y = 0; y < SIM_H; y++) {
    const a = SIM_GEOM.areaKm2[y];
    for (let x = 0; x < SIM_W; x++) {
      const i = y * SIM_W + x;
      if (s.f.landFrac[i] >= 0.5) v += s.f.ice[i] * a;
    }
  }
  return v; // m·km²
}

export function oceanArea(s: SimState): number {
  let a = 0;
  for (let y = 0; y < SIM_H; y++) for (let x = 0; x < SIM_W; x++) if (s.f.landFrac[y * SIM_W + x] < 0.5) a += SIM_GEOM.areaKm2[y];
  return Math.max(a, 1);
}

/** Eustatic sea level from land-ice volume change (ice density 0.9). */
export function updateSeaLevel(s: SimState) {
  const target = (-(landIceVolume(s) - s.iceVolume0) * 0.9) / oceanArea(s);
  s.seaLevel = clamp(target, -200, 120);
}
