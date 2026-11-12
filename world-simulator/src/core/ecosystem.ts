/**
 * Population-based ecosystem (per-cell biomass, no individuals).
 * APPROXIMATE MODEL: logistic plant growth with climate niches; consumers use Holling type-II
 * functional responses, Kleiber-like intake (∝ M^-0.25) and Damuth-like density ceilings
 * (biomass ∝ M^0.25). All updates use the exact logistic solution so any timestep is stable.
 */
import { SIM_GEOM, SIM_H, SIM_N, SIM_W } from './grid';
import { clamp, fracAbove, logisticStep, smoothstep } from './math';
import type { Rng } from './rng';
import type { SimState } from './state';
import type { FoodSource, SpeciesCategory, SpeciesDef } from './types';

export const EDIBLE = { grass: 250000, shrub: 200000, tree: 400000 }; // kg/km² at full cover
const SRC: FoodSource[] = ['grass', 'shrub', 'tree', 'plankton', 'detritus', 'herbivore', 'carnivore', 'bird', 'fish', 'insect', 'microbe'];
const HALF: Record<FoodSource, number> = {
  grass: 40000, shrub: 25000, tree: 15000, plankton: 600, detritus: 20000,
  herbivore: 150, carnivore: 30, bird: 60, fish: 300, insect: 400, microbe: 5000,
};
const CAT_RANK: Record<SpeciesCategory, number> = { microbe: 0, insect: 1, herbivore: 1, fish: 2, bird: 2, carnivore: 3 };
const BMAX_COEF: Record<SpeciesCategory, number> = { herbivore: 600, carnivore: 40, bird: 120, insect: 2000, fish: 200, microbe: 30000 };
const INTAKE_COEF: Record<SpeciesCategory, number> = { herbivore: 30, carnivore: 12, bird: 40, insect: 8, fish: 10, microbe: 0 };
const CATS: SpeciesCategory[] = ['herbivore', 'carnivore', 'bird', 'fish', 'insect', 'microbe'];
/** Beddington–DeAngelis predator interference (kg/km² of half-saturation added per kg/km² of consumer). */
const INTERFERENCE: Record<SpeciesCategory, number> = { herbivore: 0, carnivore: 4, bird: 1, fish: 1, insect: 0, microbe: 0 };
/** Fraction of animal prey biomass that is reachable (rest is in refuges). */
const PREY_ACCESS = 0.75;

export function isProducer(sp: SpeciesDef) {
  return sp.category === 'microbe';
}

/** Max biomass density (kg/km²) for a species before environmental suitability. */
export function bmax(sp: SpeciesDef): number {
  if (sp.category === 'microbe') return sp.habitat === 'ocean' ? 4000 : 30000;
  return BMAX_COEF[sp.category] * Math.pow(sp.massKg, 0.25);
}

const scratch = {
  catSum: CATS.map(() => new Float32Array(SIM_N)),
  disp: new Float32Array(SIM_N),
  suit: new Float32Array(SIM_N),
  stress: new Float32Array(SIM_N),
};

export function iceCover(s: SimState, i: number) {
  return Math.min(1, s.f.ice[i] / 5);
}

export function waterIndex(s: SimState, i: number) {
  const f = s.f;
  const F_lakeFrac = f.lakeFrac, F_riverIdx = f.riverIdx, F_soilW = f.soilW;
  return clamp(Math.max(F_soilW[i], 0.6 * F_riverIdx[i], F_lakeFrac[i] * 2), 0, 1);
}

/** Vegetation + fire. dt in days. */
export function vegetationStep(s: SimState, dt: number, annual: boolean, rng: Rng, microbeIdx: number) {
  const f = s.f;
  const F_burnScar = f.burnScar, F_farm = f.farm, F_fire = f.fire, F_grass = f.grass, F_lakeFrac = f.lakeFrac, F_landFrac = f.landFrac, F_precip = f.precip, F_riverIdx = f.riverIdx, F_shrub = f.shrub, F_smoke = f.smoke, F_soilW = f.soilW, F_temp = f.temp, F_tempAmp = f.tempAmp, F_tempAnn = f.tempAnn, F_tree = f.tree;
  const dtY = dt / 365;
  const microbe = microbeIdx >= 0 ? s.bio[microbeIdx] : null;
  for (let y = 0; y < SIM_H; y++) {
    for (let x = 0; x < SIM_W; x++) {
      const i = y * SIM_W + x;
      if (F_landFrac[i] < 0.5) {
        F_grass[i] = F_shrub[i] = F_tree[i] = F_farm[i] = F_fire[i] = 0;
        continue;
      }
      const t = F_temp[i];
      let g: number;
      if (annual) g = fracAbove(F_tempAnn[i], F_tempAmp[i], 5);
      else g = clamp((t - 2) / 10, 0, 1) * (t > 38 ? Math.max(0, 1 - (t - 38) / 8) : 1);
      const sw = Math.min(1, F_soilW[i] + 0.3 * F_lakeFrac[i] + 0.15 * F_riverIdx[i]);
      const ic = iceCover(s, i);
      const ta = F_tempAnn[i];
      const KG = smoothstep(0.03, 0.3, sw) * smoothstep(-18, -8, ta) * (1 - ic);
      const KS = 0.7 * smoothstep(0.01, 0.18, sw) * smoothstep(-20, -10, ta) * (1 - ic);
      const KT = Math.min(1, smoothstep(0.15, 0.45, sw) * smoothstep(-12, -4, ta) * (1 - ic) * (1 - smoothstep(30, 36, ta)) * (0.3 + s.params.forestDensity));
      const nf = microbe ? 0.6 + 0.4 * Math.min(1, microbe[i] / 15000) : 1;
      const G = F_grass[i], S = F_shrub[i], T = F_tree[i], F = F_farm[i];
      const rG = 3 * g * nf, rS = 0.8 * g * nf, rT = 0.3 * g * nf;
      const capG = Math.max(0, KG - 0.7 * T - 0.3 * S - F);
      const capS = Math.max(0, KS - 0.5 * T - 0.2 * G - F);
      const capT = Math.max(0, KT - 0.1 * S - F);
      const oG = G > KG ? (1.5 * (G - KG)) / Math.max(G, 0.01) : 0;
      const oS = S > KS ? (1.5 * (S - KS)) / Math.max(S, 0.01) : 0;
      const oT = T > KT ? (1.5 * (T - KT)) / Math.max(T, 0.01) : 0;
      let nG = logisticStep(G, rG * capG - 0.05 - oG, rG, dtY);
      let nS = logisticStep(S, rS * capS - 0.03 - oS, rS, dtY);
      let nT = logisticStep(T, rT * capT - 0.01 - oT, rT, dtY);
      // seed dispersal from neighbours + seed bank (enables recolonisation)
      const iw = y * SIM_W + ((x + SIM_W - 1) % SIM_W), ie = y * SIM_W + ((x + 1) % SIM_W);
      const inn = y > 0 ? i - SIM_W : i, is = y < SIM_H - 1 ? i + SIM_W : i;
      const gs = Math.min(1, g * 2);
      const aG = (F_grass[iw] + F_grass[ie] + F_grass[inn] + F_grass[is]) * 0.25;
      const aS = (F_shrub[iw] + F_shrub[ie] + F_shrub[inn] + F_shrub[is]) * 0.25;
      const aT = (F_tree[iw] + F_tree[ie] + F_tree[inn] + F_tree[is]) * 0.25;
      nG += Math.min(1, dtY * gs * (0.6 * aG + 0.004)) * Math.max(0, capG - nG);
      nS += Math.min(1, dtY * gs * (0.2 * aS + 0.002)) * Math.max(0, capS - nS);
      nT += Math.min(1, dtY * gs * (0.1 * aT + 0.002)) * Math.max(0, capT - nT);

      // --- fire ---
      const fuel = 0.5 * nG + 0.8 * nS + nT;
      const dry = 1 - smoothstep(0.1, 0.45, F_soilW[i]);
      let fire = F_fire[i];
      if (fire <= 0 && t > 12 && fuel > 0.15 && s.naturalEvents) {
        const p = 1 - Math.exp(-dtY * 0.03 * dry * dry * fuel);
        if (rng.next() < p) fire = 0.6;
      }
      if (fire > 0) {
        const fd = Math.min(dt, 20); // a fire front burns for days–weeks, not the whole step
        nT *= Math.exp(-0.03 * fire * fd);
        nG *= Math.exp(-0.08 * fire * fd);
        nS *= Math.exp(-0.06 * fire * fd);
        F_smoke[i] += fire * fuel * Math.min(dt, 10) * 0.15;
        F_burnScar[i] = Math.max(F_burnScar[i], fire * 0.9);
        // spread
        const nb = [iw, ie, inn, is];
        for (const j of nb) {
          if (F_landFrac[j] < 0.5 || F_fire[j] > 0) continue;
          const fj = 0.5 * F_grass[j] + 0.8 * F_shrub[j] + F_tree[j];
          const dj = 1 - smoothstep(0.1, 0.45, F_soilW[j]);
          const p = 1 - Math.exp(-0.5 * Math.min(dt, 10) * fire * fj * dj * dj);
          if (rng.next() < p) F_fire[j] = Math.min(1, fire * 0.85);
        }
        fire *= Math.exp(-dt / 7) * Math.exp(-F_precip[i] * dt * 0.05);
        if (fuel < 0.08 || fire < 0.03) fire = 0;
      }
      F_fire[i] = fire;
      F_burnScar[i] *= Math.exp(-dt / (365 * 3));
      F_grass[i] = clamp(nG, 0, 1);
      F_shrub[i] = clamp(nS, 0, 1);
      F_tree[i] = clamp(nT, 0, 1);
    }
  }
}

interface Prepared {
  idx: number;
  sp: SpeciesDef;
  src: number[];
  w: number[];
  bmax: number;
  intake: number;
}

const SRC_CAT = SRC.map((k) => CATS.indexOf(k as SpeciesCategory));
const SRC_HALF = SRC.map((k) => HALF[k]);

function sourceAvail(s: SimState, src: number, i: number, catSum: Float32Array[], planktonIdx: number): number {
  const f = s.f;
  const F_grass = f.grass, F_shrub = f.shrub, F_tree = f.tree;
  switch (src) {
    case 0: return F_grass[i] * EDIBLE.grass;
    case 1: return F_shrub[i] * EDIBLE.shrub;
    case 2: return F_tree[i] * EDIBLE.tree;
    case 3: return planktonIdx >= 0 ? s.bio[planktonIdx][i] : 0;
    case 4: return (F_grass[i] + F_shrub[i] + F_tree[i]) * 50000;
    default: return catSum[SRC_CAT[src]][i] * PREY_ACCESS;
  }
}

function removeSource(s: SimState, src: number, i: number, kg: number, catSum: Float32Array[], planktonIdx: number) {
  if (kg <= 0) return;
  const f = s.f;
  const F_grass = f.grass, F_shrub = f.shrub, F_tree = f.tree;
  switch (src) {
    case 0: F_grass[i] = Math.max(0, F_grass[i] - kg / EDIBLE.grass); return;
    case 1: F_shrub[i] = Math.max(0, F_shrub[i] - kg / EDIBLE.shrub); return;
    case 2: F_tree[i] = Math.max(0, F_tree[i] - kg / EDIBLE.tree); return;
    case 3: if (planktonIdx >= 0) s.bio[planktonIdx][i] = Math.max(0, s.bio[planktonIdx][i] - kg); return;
    case 4: return;
    default: {
      const cat = SRC[src] as SpeciesCategory;
      const ci = SRC_CAT[src];
      const tot = catSum[ci][i];
      if (tot <= 0) return;
      const frac = Math.min(1, kg / tot);
      for (let k = 0; k < s.species.length; k++) {
        if (s.species[k].category === cat) s.bio[k][i] *= 1 - frac;
      }
      catSum[ci][i] = tot * (1 - frac);
    }
  }
}

/** Animal / microbe populations. dt in days. */
export function faunaStep(s: SimState, dt: number, annual: boolean, insolationAnnual: (y: number) => number) {
  const f = s.f;
  const F_fire = f.fire, F_grass = f.grass, F_landFrac = f.landFrac, F_seaIce = f.seaIce, F_shrub = f.shrub, F_soilW = f.soilW, F_temp = f.temp, F_tempAmp = f.tempAmp, F_tempAnn = f.tempAnn, F_tree = f.tree;
  const dtY = dt / 365;
  const catSum = scratch.catSum;
  for (const c of catSum) c.fill(0);
  for (let k = 0; k < s.species.length; k++) {
    const ci = CATS.indexOf(s.species[k].category);
    const b = s.bio[k];
    const cs = catSum[ci];
    for (let i = 0; i < SIM_N; i++) cs[i] += b[i];
  }
  const planktonIdx = s.species.findIndex((sp) => sp.category === 'microbe' && sp.habitat === 'ocean');
  const prepared: Prepared[] = s.species
    .map((sp, idx) => {
      const src: number[] = [];
      const w: number[] = [];
      for (const [k, v] of Object.entries(sp.diet)) {
        const si = SRC.indexOf(k as FoodSource);
        if (si >= 0 && v && v > 0) {
          src.push(si);
          w.push(v);
        }
      }
      return { idx, sp, src, w, bmax: bmax(sp), intake: INTAKE_COEF[sp.category] * Math.pow(sp.massKg, -0.25) };
    })
    .sort((a, b) => CAT_RANK[a.sp.category] - CAT_RANK[b.sp.category]);

  const suitArr = scratch.suit;
  const shares = new Float64Array(16);
  const avs = new Float64Array(16);
  for (const P of prepared) {
    if (s.extinct[P.idx]) continue;
    const sp = P.sp;
    const B = s.bio[P.idx];
    const ocean = sp.habitat === 'ocean';
    const ci = CATS.indexOf(sp.category);
    const r = sp.reproRate;
    const m = 1 / Math.max(0.01, sp.lifespanYr);
    for (let y = 0; y < SIM_H; y++) {
      for (let x = 0; x < SIM_W; x++) {
        const i = y * SIM_W + x;
        const land = F_landFrac[i] >= 0.5;
        if (land === ocean) {
          B[i] = 0;
          suitArr[i] = 0;
          continue;
        }
        // environmental suitability
        const t = ocean ? Math.max(-1.9, F_temp[i]) : F_temp[i];
        const tEff = annual ? F_tempAnn[i] : t;
        let suit = smoothstep(sp.tempMin, sp.tempMin + 6, tEff) * (1 - smoothstep(sp.tempMax - 6, sp.tempMax, tEff));
        let stress = (3 * Math.max(0, sp.tempMin - tEff)) / 5 + (3 * Math.max(0, tEff - sp.tempMax)) / 5;
        if (annual) {
          // seasonal extremes approximated from amplitude
          const amp = F_tempAmp[i];
          stress += (1.5 * Math.max(0, sp.tempMin - (tEff - amp))) / 10 + (1.5 * Math.max(0, tEff + amp - sp.tempMax)) / 10;
        }
        if (!ocean) {
          const wi = waterIndex(s, i);
          const sw = smoothstep(sp.waterNeed * 0.4, sp.waterNeed * 1.2 + 0.01, wi);
          suit *= sw;
          stress += (1 - sw) * 0.5;
          const ic = iceCover(s, i);
          suit *= 1 - ic;
          stress += ic * 2 + F_fire[i] * 3;
        } else {
          suit *= 1 - 0.8 * F_seaIce[i];
        }
        suitArr[i] = suit;
        const b0 = B[i];
        if (b0 <= 0) continue;
        if (isProducer(sp)) {
          let K: number;
          if (ocean) {
            const light = insolationAnnual(y) / 420;
            K = 4000 * (0.3 + 0.7 * light) * (0.3 + 0.7 * Math.exp(-(((t - 14) / 14) ** 2))) * (1 - F_seaIce[i]);
          } else {
            const cover = F_grass[i] + F_shrub[i] + F_tree[i];
            K = 30000 * (0.15 + cover) * smoothstep(-5, 15, t) * smoothstep(0.05, 0.3, F_soilW[i]);
          }
          K *= suit;
          const a = r * suit - 5 - stress;
          B[i] = logisticStep(b0, a, (r * suit) / Math.max(K, 1e-3), dtY);
          continue;
        }
        // consumer: Holling II per food source
        let sigW = 0, wSum = 0;
        const ns = P.src.length;
        const interf = INTERFERENCE[sp.category];
        for (let k = 0; k < ns; k++) {
          const av = sourceAvail(s, P.src[k], i, catSum, planktonIdx);
          avs[k] = av;
          const sg = av / (av + SRC_HALF[P.src[k]] + interf * b0);
          shares[k] = P.w[k] * sg;
          sigW += P.w[k] * sg;
          wSum += P.w[k];
        }
        let sigma = wSum > 0 ? sigW / wSum : 0;
        const demand = P.intake * b0 * sigma * dtY;
        if (demand > 0 && sigW > 0) {
          let got = 0;
          for (let k = 0; k < ns; k++) {
            const want = (demand * shares[k]) / sigW;
            const take = Math.min(want, avs[k] * 0.6);
            removeSource(s, P.src[k], i, take, catSum, planktonIdx);
            got += take;
          }
          sigma *= got / demand;
        }
        const Bm = P.bmax * Math.max(suit, 0.02);
        const a = r * sigma * suit - m * (1 + 1.5 * (1 - sigma)) - stress;
        B[i] = logisticStep(b0, a, (r * sigma * suit) / Bm, dtY);
      }
    }
    // dispersal (diffusion into habitat-compatible neighbours, weighted by target suitability)
    const k = Math.min(0.25, sp.dispersal * dtY * 3 + (annual ? 0.1 : 0));
    const D = scratch.disp;
    const minB = isProducer(sp) ? 1e-3 : sp.massKg * 1e-4;
    for (let y = 0; y < SIM_H; y++) {
      for (let x = 0; x < SIM_W; x++) {
        const i = y * SIM_W + x;
        if (suitArr[i] <= 0 && B[i] <= 0) {
          D[i] = 0;
          continue;
        }
        const iw = y * SIM_W + ((x + SIM_W - 1) % SIM_W), ie = y * SIM_W + ((x + 1) % SIM_W);
        const inn = y > 0 ? i - SIM_W : i, is = y < SIM_H - 1 ? i + SIM_W : i;
        const avg = (B[iw] + B[ie] + B[inn] + B[is]) * 0.25;
        const inflow = avg * suitArr[i];
        let v = B[i] + k * (inflow - B[i]);
        if (v < minB) v = 0;
        D[i] = v;
      }
    }
    B.set(D);
    // refresh category sum for this species' category (used by predators later)
    const cs = catSum[ci];
    cs.fill(0);
    for (let kk = 0; kk < s.species.length; kk++) {
      if (s.species[kk].category !== sp.category) continue;
      const bb = s.bio[kk];
      for (let i = 0; i < SIM_N; i++) cs[i] += bb[i];
    }
  }
}

/** Individuals (or tonnes for microbes) per species. */
export function speciesTotals(s: SimState): number[] {
  return s.species.map((sp, k) => {
    const b = s.bio[k];
    let t = 0;
    for (let y = 0; y < SIM_H; y++) {
      const a = SIM_GEOM.areaKm2[y];
      for (let x = 0; x < SIM_W; x++) t += b[y * SIM_W + x] * a;
    }
    return sp.category === 'microbe' ? t / 1000 : t / sp.massKg;
  });
}

export function suitabilityForSeed(s: SimState, sp: SpeciesDef, i: number): number {
  const f = s.f;
  const F_landFrac = f.landFrac, F_tempAnn = f.tempAnn;
  const land = F_landFrac[i] >= 0.5;
  if ((sp.habitat === 'ocean') === land) return 0;
  const t = F_tempAnn[i];
  return smoothstep(sp.tempMin, sp.tempMin + 6, t) * (1 - smoothstep(sp.tempMax - 6, sp.tempMax, t)) * (land ? smoothstep(sp.waterNeed * 0.4, sp.waterNeed * 1.2 + 0.01, waterIndex(s, i)) * (1 - iceCover(s, i)) : 1);
}
