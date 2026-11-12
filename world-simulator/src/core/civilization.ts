/**
 * Human settlements (APPROXIMATE socio-economic model, not empirically calibrated).
 * Food from farmland/hunting/fishing, demographic transition with technology,
 * migration and colony founding, CO2 emissions feeding the climate model.
 */
import { SIM_GEOM, SIM_H, SIM_N, SIM_W, cellLat, cellLon, angDist, EARTH_RADIUS_KM } from './grid';
import { clamp, smoothstep } from './math';
import { makeName } from './names';
import type { Rng } from './rng';
import type { SimState } from './state';
import type { Settlement } from './types';
import { waterIndex, iceCover } from './ecosystem';

export const TECH_ERAS = ['Taş Çağı', 'Tarım Devrimi', 'Tunç Çağı', 'Demir Çağı', 'Klasik Çağ', 'Orta Çağ', 'Sanayi Çağı', 'Modern Çağ', 'Bilgi Çağı', 'Uzay Çağı', 'İleri Uygarlık'];
export function eraName(tech: number) {
  return TECH_ERAS[clamp(Math.floor(tech), 0, TECH_ERAS.length - 1)];
}
const MAX_SETTLEMENTS = 120;

export function farmSuitability(s: SimState, i: number): number {
  const f = s.f;
  if (f.landFrac[i] < 0.5) return 0;
  const ta = f.tempAnn[i];
  return smoothstep(-4, 6, ta) * (1 - smoothstep(30, 38, ta)) * smoothstep(0.06, 0.35, waterIndex(s, i)) * (1 - iceCover(s, i));
}

export function siteScore(s: SimState, i: number): number {
  const f = s.f;
  if (f.landFrac[i] < 0.5) return 0;
  const coastal = f.landFrac[i] < 0.95 ? 0.15 : 0;
  return farmSuitability(s, i) * (0.6 + 0.4 * f.riverIdx[i]) + coastal + 0.1 * f.grass[i];
}

function nbrCells(i: number): number[] {
  const x = i % SIM_W, y = (i / SIM_W) | 0;
  const r = [i, y * SIM_W + ((x + 1) % SIM_W), y * SIM_W + ((x + SIM_W - 1) % SIM_W)];
  if (y > 0) r.push(i - SIM_W);
  if (y < SIM_H - 1) r.push(i + SIM_W);
  return r;
}

export function createSettlement(s: SimState, cell: number, pop: number, tech: number, rng: Rng): Settlement | null {
  if (s.f.landFrac[cell] < 0.5 || s.settlements.length >= MAX_SETTLEMENTS) return null;
  const existing = s.settlements.find((t) => t.cell === cell);
  if (existing) {
    existing.pop += pop;
    return existing;
  }
  const st: Settlement = {
    id: s.nextSettlementId++,
    name: makeName(rng, 1 + (rng.next() < 0.5 ? 1 : 0)),
    lat: cellLat(cell) + rng.range(-0.6, 0.6),
    lon: cellLon(cell) + rng.range(-0.6, 0.6),
    cell,
    pop,
    tech,
    food: 1,
    water: 1,
    energy: 1,
    wealth: 0,
    farmKm2: 0,
    founded: s.day,
    health: 1,
  };
  s.settlements.push(st);
  return st;
}

/** dt in days. Returns CO2 emitted (ppm). */
export function civilizationStep(s: SimState, dt: number, rng: Rng, log: (t: string, st?: Settlement, kind?: 'civ' | 'settlement') => void, techScale = 1): number {
  const f = s.f;
  const dtY = dt / 365;
  let co2 = 0;
  // farmland relaxes toward demand per cell
  const demand = new Float32Array(SIM_N);
  const born: Settlement[] = [];
  for (const st of s.settlements) {
    const i = st.cell;
    const cells = nbrCells(i);
    const yieldPerKm2 = 18 * (1 + 0.7 * st.tech) * Math.max(0.05, farmSuitability(s, i));
    const needKm2 = (st.pop / yieldPerKm2) * smoothstep(0.6, 1.4, st.tech + 0.6);
    // distribute farmland demand: own cell first
    let rem = needKm2;
    for (const c of cells) {
      if (f.landFrac[c] < 0.5) continue;
      const area = SIM_GEOM.areaKm2[(c / SIM_W) | 0];
      const cap = area * 0.6 * farmSuitability(s, c);
      const take = Math.min(rem, cap - demand[c] * area);
      if (take > 0) {
        demand[c] += take / area;
        rem -= take;
      }
      if (rem <= 0) break;
    }
    // food production
    let farmKm2 = 0, farmProd = 0;
    for (const c of cells) {
      const area = SIM_GEOM.areaKm2[(c / SIM_W) | 0];
      const share = Math.min(f.farm[c], demand[c]) * area;
      farmKm2 += share;
      farmProd += share * 18 * (1 + 0.7 * st.tech) * farmSuitability(s, c);
    }
    // hunting & fishing (removes animals)
    let hunt = 0, fish = 0;
    const area0 = SIM_GEOM.areaKm2[(i / SIM_W) | 0];
    for (let k = 0; k < s.species.length; k++) {
      const sp = s.species[k];
      if (sp.category === 'herbivore' && f.landFrac[i] >= 0.5) {
        const avail = s.bio[k][i] * area0;
        const take = Math.min(avail * 0.3 * dtY, (st.pop * 120 * dtY) / 2);
        s.bio[k][i] -= take / area0;
        hunt += take / 150;
      }
      if (sp.category === 'fish') {
        for (const c of cells) {
          if (f.landFrac[c] >= 0.5) continue;
          const a = SIM_GEOM.areaKm2[(c / SIM_W) | 0];
          const avail = s.bio[k][c] * a;
          const take = Math.min(avail * 0.25 * dtY * (1 + st.tech * 0.3), st.pop * 80 * dtY);
          s.bio[k][c] -= take / a;
          fish += take / 120;
        }
      }
    }
    const foodRatio = (farmProd + hunt / Math.max(dtY, 1e-6) + fish / Math.max(dtY, 1e-6)) / Math.max(1, st.pop);
    st.food = st.food + (clamp(foodRatio, 0, 3) - st.food) * Math.min(1, dtY * 4 + 0.05);
    st.farmKm2 = farmKm2;
    st.water = waterIndex(s, i);
    const waterOk = smoothstep(0.04, 0.3, st.water);
    const t = f.temp[i];
    const climateStress = 0.04 * (Math.max(0, -25 - t) + Math.max(0, t - 42)) / 5;
    st.health = Math.min(1, st.health + dtY * 0.5);
    const birth = 0.045 - 0.003 * Math.min(st.tech, 10);
    const death = 0.02 - 0.0011 * Math.min(st.tech, 10) + 0.25 * Math.max(0, 1 - st.food) + 0.2 * (1 - waterOk) + (1 - st.health) * 0.4 + climateStress;
    st.pop *= Math.exp((birth - death) * dtY);
    // technology
    const surplus = clamp(st.food - 0.95, 0, 1);
    const neighbours = s.settlements.filter((o) => o !== st && angDist(o.lat, o.lon, st.lat, st.lon) * EARTH_RADIUS_KM < 1500).length;
    st.tech += techScale * dtY * 0.0003 * Math.max(0.2, Math.log10(st.pop + 1) - 1.5) * (1 + 0.2 * st.tech) * (0.2 + surplus) * (1 + Math.min(1, neighbours * 0.15));
    st.tech = Math.min(12, st.tech);
    st.energy = 1 + 0.4 * st.tech * st.tech;
    const fossil = smoothstep(5, 7, st.tech) * (1 - 0.8 * smoothstep(8.5, 10.5, st.tech));
    co2 += st.pop * st.energy * fossil * 3e-11 * dtY;
    st.wealth = st.pop * (1 + st.tech) ** 2 * Math.min(1, st.food) * 1e-3;
    // migration / colonisation: famine-driven emigration or occasional expansion of large towns
    const famine = st.food < 0.85 && st.pop > 400;
    const expand = st.food > 1.2 && st.pop > 3000 && rng.next() < 1 - Math.exp(-0.05 * dtY);
    if (famine || expand) {
      const emig = st.pop * (famine ? 0.12 : 0.15);
      let best = -1, bestScore = 0;
      const x = st.cell % SIM_W, y = (st.cell / SIM_W) | 0;
      const reach = 2 + Math.floor(st.tech / 2);
      for (let k = 0; k < 14; k++) {
        const cx = (x + rng.int(-reach - 2, reach + 2) + SIM_W) % SIM_W;
        const cy = clamp(y + rng.int(-reach, reach), 0, SIM_H - 1);
        const c = cy * SIM_W + cx;
        if (c === st.cell) continue;
        const occ = s.settlements.find((o) => o.cell === c);
        const sc = siteScore(s, c) * (occ ? (occ.food > 1 ? 0.6 : 0.1) : 1);
        if (sc > bestScore) {
          bestScore = sc;
          best = c;
        }
      }
      if (best >= 0 && bestScore > 0.25 && emig >= 50) {
        const before = s.settlements.length;
        const ns = createSettlement(s, best, emig, st.tech * 0.95, rng);
        if (ns) {
          st.pop -= emig;
          if (s.settlements.length > before) born.push(ns);
        }
      }
    }
    // spontaneous epidemics (density + low tech)
    if (s.naturalEvents && st.pop > 20000 && rng.next() < dtY * 0.004 * Math.log10(st.pop) * (1 - st.tech / 12)) {
      st.health = Math.max(0, st.health - 0.5);
      log(`${st.name} yerleşiminde salgın başladı`, st, 'civ');
    }
  }
  for (const ns of born) log(`${ns.name} yerleşimi kuruldu (göç)`, ns, 'settlement');
  // apply farmland: relax toward demand, deforest where needed
  const kf = Math.min(1, dtY * 2);
  for (let i = 0; i < SIM_N; i++) {
    if (f.landFrac[i] < 0.5) {
      f.farm[i] = 0;
      continue;
    }
    f.farm[i] += (demand[i] - f.farm[i]) * kf;
    const free = 1 - f.farm[i];
    if (f.tree[i] > free) f.tree[i] = free;
    if (f.grass[i] + f.tree[i] > 1) f.grass[i] = Math.max(0, 1 - f.tree[i]);
  }
  // deaths / merges
  for (let k = s.settlements.length - 1; k >= 0; k--) {
    const st = s.settlements[k];
    if (st.pop < 10 || f.landFrac[st.cell] < 0.5) {
      log(`${st.name} yerleşimi terk edildi`, st, 'settlement');
      s.settlements.splice(k, 1);
    }
  }
  // human density field
  f.humans.fill(0);
  for (const st of s.settlements) {
    const a = SIM_GEOM.areaKm2[(st.cell / SIM_W) | 0];
    f.humans[st.cell] += st.pop / a;
  }
  return co2;
}

export function totalHumans(s: SimState): number {
  let t = 0;
  for (const st of s.settlements) t += st.pop;
  return t;
}

export function killInRadius(s: SimState, lat: number, lon: number, radiusKm: number, frac: number) {
  let dead = 0;
  for (const st of s.settlements) {
    const d = angDist(lat, lon, st.lat, st.lon) * EARTH_RADIUS_KM;
    if (d < radiusKm) {
      const k = frac * (1 - (d / radiusKm) * 0.6) * (1 - Math.min(st.tech, 10) / 16);
      dead += st.pop * clamp(k, 0, 1);
      st.pop *= 1 - clamp(k, 0, 1);
    }
  }
  return dead;
}
