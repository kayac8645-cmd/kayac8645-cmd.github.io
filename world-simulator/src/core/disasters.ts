/**
 * Disaster engine. Every event changes simulation fields (vegetation, fauna, soil water,
 * temperature/precipitation forcing, aerosols, terrain, settlements) — not only visuals.
 * Magnitudes are APPROXIMATE and chosen for plausibility, not derived from first principles.
 */
import { DEG, EARTH_RADIUS_KM, SIM_N, SIM_W, SIM_H, angDist, cellOf, cellsInRadius, cellLat, cellLon } from './grid';
import { clamp } from './math';
import type { Rng } from './rng';
import type { SimState } from './state';
import { DISASTER_INFO, type DisasterEvent, type DisasterType } from './types';
import { brushElevation } from './terrain';
import { killInRadius } from './civilization';

export interface DisasterCtx {
  rng: Rng;
  log: (text: string, ev: DisasterEvent) => void;
  terrainChanged: (sy0: number, sy1: number) => void;
}

export function isCoastal(s: SimState, i: number): boolean {
  const f = s.f;
  if (f.landFrac[i] < 0.5) return false;
  if (f.landFrac[i] < 0.97) return true;
  const x = i % SIM_W, y = (i / SIM_W) | 0;
  const nb = [y * SIM_W + ((x + 1) % SIM_W), y * SIM_W + ((x + SIM_W - 1) % SIM_W), y > 0 ? i - SIM_W : i, y < SIM_H - 1 ? i + SIM_W : i];
  return nb.some((j) => f.landFrac[j] < 0.5);
}

function envelope(p: number, rampIn = 0.15, rampOut = 0.15) {
  return clamp(Math.min(p / rampIn, (1 - p) / rampOut, 1), 0, 1);
}

/** Destination point given start, bearing (deg) and distance (km). */
export function destination(lat: number, lon: number, bearing: number, km: number) {
  const d = km / EARTH_RADIUS_KM, b = bearing * DEG, p1 = lat * DEG, l1 = lon * DEG;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  let lo = l2 / DEG;
  lo = ((((lo + 180) % 360) + 360) % 360) - 180;
  return { lat: p2 / DEG, lon: lo };
}

function scaleAnimals(s: SimState, i: number, k: number, landOnly = true) {
  for (let n = 0; n < s.species.length; n++) {
    if (landOnly && s.species[n].habitat !== 'land') continue;
    s.bio[n][i] *= k;
  }
}

function scalePlants(s: SimState, i: number, k: number) {
  s.f.grass[i] *= k;
  s.f.shrub[i] *= k;
  s.f.tree[i] *= k;
  s.f.farm[i] *= k;
}

function ignite(s: SimState, i: number, v = 1) {
  if (s.f.landFrac[i] >= 0.5 && s.f.grass[i] + s.f.shrub[i] + s.f.tree[i] > 0.05) s.f.fire[i] = Math.max(s.f.fire[i], v);
}

export function createEvent(s: SimState, type: DisasterType, lat: number, lon: number, intensity: number, radiusKm?: number, durationDays?: number): DisasterEvent {
  const info = DISASTER_INFO[type];
  const ev: DisasterEvent = {
    id: s.nextEventId++,
    type,
    lat,
    lon,
    radiusKm: radiusKm ?? info.defaultRadius,
    intensity: clamp(intensity, 0.05, 1),
    durationDays: Math.max(0.5, durationDays ?? info.defaultDuration),
    elapsedDays: 0,
    startDay: s.day,
    data: {},
  };
  if (type === 'hurricane') ev.heading = lat >= 0 ? 285 : 255;
  if (type === 'tornado') ev.heading = 45 + ((ev.id * 73) % 90);
  return ev;
}

/** Instant (onset) effects. */
export function startEvent(s: SimState, ev: DisasterEvent, ctx: DisasterCtx): DisasterEvent[] {
  const spawned: DisasterEvent[] = [];
  const f = s.f;
  const I = ev.intensity;
  const label = DISASTER_INFO[ev.type].label;
  const cell = cellOf(ev.lat, ev.lon);
  const onLand = f.landFrac[cell] >= 0.5;
  const where = s.regions[s.region[cell]]?.name ?? '';
  const lg = (extra = '') => ctx.log(`${label} — ${where}${extra}`, ev);
  switch (ev.type) {
    case 'volcano': {
      const r = brushElevation(s, ev.lat, ev.lon, ev.radiusKm * 0.25, 1200 * I, 'add');
      ctx.terrainChanged(r.sy0, r.sy1);
      const { idx, w } = cellsInRadius(ev.lat, ev.lon, ev.radiusKm * 0.45);
      idx.forEach((i, k) => {
        scalePlants(s, i, 1 - 0.85 * w[k]);
        scaleAnimals(s, i, 1 - 0.9 * w[k]);
        ignite(s, i, 0.9);
        f.damage[i] = Math.min(1, f.damage[i] + w[k]);
        f.burnScar[i] = 1;
      });
      const dead = killInRadius(s, ev.lat, ev.lon, ev.radiusKm * 0.4, 0.7 * I);
      lg(dead > 1 ? ` · ${Math.round(dead).toLocaleString('tr-TR')} kayıp` : '');
      break;
    }
    case 'earthquake': {
      const { idx, w } = cellsInRadius(ev.lat, ev.lon, ev.radiusKm);
      idx.forEach((i, k) => (f.damage[i] = Math.min(1, f.damage[i] + w[k] * I)));
      const r = brushElevation(s, ev.lat, ev.lon, ev.radiusKm * 0.3, (ctx.rng.next() - 0.4) * 300 * I, 'add');
      ctx.terrainChanged(r.sy0, r.sy1);
      const dead = killInRadius(s, ev.lat, ev.lon, ev.radiusKm, 0.25 * I);
      lg(dead > 1 ? ` · ${Math.round(dead).toLocaleString('tr-TR')} kayıp` : '');
      const nearOcean = cellsInRadius(ev.lat, ev.lon, ev.radiusKm * 0.6).idx.some((i) => f.landFrac[i] < 0.5);
      if (nearOcean && I >= 0.5) spawned.push(createEvent(s, 'tsunami', ev.lat, ev.lon, I * 0.9, 1000 * I + 300, 4));
      break;
    }
    case 'asteroid': {
      if (onLand) {
        const r = brushElevation(s, ev.lat, ev.lon, ev.radiusKm * 0.12, 2500 * I, 'crater');
        ctx.terrainChanged(r.sy0, r.sy1);
      }
      const { idx, w } = cellsInRadius(ev.lat, ev.lon, ev.radiusKm);
      idx.forEach((i, k) => {
        const core = w[k] > 0.7;
        scalePlants(s, i, core ? 0.02 : 1 - 0.6 * w[k]);
        scaleAnimals(s, i, core ? 0.01 : 1 - 0.6 * w[k], false);
        ignite(s, i, 1);
        f.smoke[i] += 30 * I * w[k];
        f.damage[i] = 1;
      });
      s.aerosol += 8 * I * I;
      const dead = killInRadius(s, ev.lat, ev.lon, ev.radiusKm, 0.95);
      lg(` · küresel toz bulutu (AOD +${(8 * I * I).toFixed(1)})${dead > 1 ? ` · ${Math.round(dead).toLocaleString('tr-TR')} kayıp` : ''}`);
      if (!onLand || cellsInRadius(ev.lat, ev.lon, ev.radiusKm * 0.3).idx.some((i) => f.landFrac[i] < 0.5)) {
        spawned.push(createEvent(s, 'tsunami', ev.lat, ev.lon, 1, 3000 * I + 500, 5));
      }
      break;
    }
    case 'wildfire': {
      const { idx, w } = cellsInRadius(ev.lat, ev.lon, ev.radiusKm);
      idx.forEach((i, k) => {
        f.soilW[i] *= 1 - 0.5 * w[k];
        if (w[k] > 0.5) ignite(s, i, 1);
      });
      ignite(s, cell, 1);
      lg();
      break;
    }
    case 'epidemic': {
      let n = 0;
      for (const st of s.settlements) {
        if (angDist(ev.lat, ev.lon, st.lat, st.lon) * EARTH_RADIUS_KM < ev.radiusKm) {
          st.health = Math.max(0, st.health - 0.6 * I);
          n++;
        }
      }
      lg(` · ${n} yerleşim etkilendi`);
      break;
    }
    default:
      lg();
  }
  return spawned;
}

/** Continuous effects. Resets and refills transient forcing fields. Returns ended events. */
export function disasterStep(s: SimState, dt: number, ctx: DisasterCtx): DisasterEvent[] {
  const f = s.f;
  f.eventTemp.fill(0);
  f.eventPrecip.fill(1);
  f.eventWind.fill(0);
  s.eventForcing = 0;
  const ended: DisasterEvent[] = [];
  const spawned: DisasterEvent[] = [];
  for (const ev of s.events) {
    const I = ev.intensity;
    const p = clamp(ev.elapsedDays / ev.durationDays, 0, 1);
    const frac = Math.min(1, dt / ev.durationDays);
    const area = (r: number) => cellsInRadius(ev.lat, ev.lon, r);
    switch (ev.type) {
      case 'volcano': {
        s.aerosol += 0.25 * I * frac;
        const { idx, w } = area(ev.radiusKm);
        idx.forEach((i, k) => {
          f.smoke[i] += 4 * I * w[k] * Math.min(dt, 5);
          f.eventTemp[i] -= 1.5 * I * w[k];
          if (w[k] > 0.85 && ctx.rng.next() < 0.3) ignite(s, i, 0.8);
        });
        break;
      }
      case 'tsunami': {
        const R = ev.radiusKm * Math.max(0.15, p + frac);
        const { idx } = area(R);
        const k = Math.min(1, frac * 3);
        for (const i of idx) {
          if (!isCoastal(s, i) || f.elev[i] - s.seaLevel > 150 * I + 30) continue;
          scalePlants(s, i, 1 - 0.5 * I * k);
          scaleAnimals(s, i, 1 - 0.5 * I * k);
          f.farm[i] *= 1 - 0.6 * k;
          f.soilW[i] = 1;
          f.damage[i] = Math.min(1, f.damage[i] + k * I);
          for (const st of s.settlements) if (st.cell === i) st.pop *= 1 - 0.35 * I * k;
        }
        break;
      }
      case 'hurricane':
      case 'tornado': {
        const isH = ev.type === 'hurricane';
        const speed = isH ? 350 : 250;
        const np = destination(ev.lat, ev.lon, ev.heading ?? 270, speed * dt);
        ev.lat = clamp(np.lat, -80, 80);
        ev.lon = np.lon;
        const c = cellOf(ev.lat, ev.lon);
        const land = f.landFrac[c] >= 0.5;
        if (isH) {
          ev.heading = (ev.heading ?? 270) + (ev.lat >= 0 ? 3 : -3) * dt;
          const sst = f.temp[c];
          if (!land && sst > 26) ev.intensity = Math.min(1, ev.intensity + 0.05 * dt);
          else ev.intensity -= (land ? 0.15 : sst < 24 ? 0.1 : 0.02) * dt;
          ev.intensity = Math.max(0, ev.intensity);
          if (ev.intensity < 0.05) ev.elapsedDays = ev.durationDays;
        } else if (!land) ev.elapsedDays = ev.durationDays;
        const { idx, w } = area(ev.radiusKm);
        const II = ev.intensity;
        idx.forEach((i, k) => {
          if (isH) {
            f.eventPrecip[i] *= 1 + 4 * II * w[k];
            f.eventWind[i] += 35 * II * w[k];
            f.cloud[i] = Math.max(f.cloud[i], 0.9 * w[k]);
            f.soilW[i] = Math.min(1, f.soilW[i] + 0.05 * II * w[k] * dt);
          } else f.eventWind[i] += 60 * II * w[k];
          if (f.landFrac[i] >= 0.5) {
            f.tree[i] *= 1 - Math.min(0.5, (isH ? 0.04 : 0.3) * II * w[k] * Math.min(dt, 3));
            f.farm[i] *= 1 - Math.min(0.5, 0.05 * II * w[k] * Math.min(dt, 3));
            f.damage[i] = Math.min(1, f.damage[i] + 0.08 * II * w[k] * Math.min(dt, 3));
          }
        });
        killInRadius(s, ev.lat, ev.lon, ev.radiusKm * 0.6, (isH ? 0.004 : 0.02) * II * Math.min(dt, 3));
        break;
      }
      case 'wildfire': {
        const { idx, w } = area(ev.radiusKm);
        idx.forEach((i, k) => {
          f.soilW[i] *= Math.exp(-0.02 * dt * w[k]);
          if (w[k] > 0.8 && p < 0.7) ignite(s, i, 0.9 * I + 0.1);
        });
        break;
      }
      case 'flood': {
        const { idx, w } = area(ev.radiusKm);
        idx.forEach((i, k) => {
          f.eventPrecip[i] *= 1 + 2 * I * w[k];
          if (f.landFrac[i] < 0.5) return;
          f.soilW[i] = Math.min(1, f.soilW[i] + w[k] * 0.3);
          f.farm[i] *= Math.exp(-0.02 * I * w[k] * dt);
          f.fire[i] = 0;
          scaleAnimals(s, i, Math.exp(-0.004 * I * w[k] * dt));
          f.damage[i] = Math.min(1, f.damage[i] + 0.01 * I * w[k] * dt);
        });
        killInRadius(s, ev.lat, ev.lon, ev.radiusKm * 0.6, 0.0006 * I * dt);
        break;
      }
      case 'drought':
      case 'coldwave':
      case 'heatwave': {
        const env = envelope(p);
        const { idx, w } = area(ev.radiusKm);
        idx.forEach((i, k) => {
          const a = I * w[k] * env;
          if (ev.type === 'drought') {
            f.eventPrecip[i] *= 1 - 0.85 * a;
            f.eventTemp[i] += 2 * a;
            f.soilW[i] *= Math.exp(-0.01 * a * dt);
          } else if (ev.type === 'coldwave') f.eventTemp[i] -= 25 * a;
          else {
            f.eventTemp[i] += 14 * a;
            f.soilW[i] *= Math.exp(-0.01 * a * dt);
          }
        });
        break;
      }
      case 'meteorShower': {
        const n = Math.floor(dt * 3 * I + ctx.rng.next());
        for (let k = 0; k < n; k++) {
          const d = destination(ev.lat, ev.lon, ctx.rng.range(0, 360), ev.radiusKm * Math.sqrt(ctx.rng.next()));
          const c = cellOf(d.lat, d.lon);
          ignite(s, c, 0.8);
          f.damage[c] = Math.min(1, f.damage[c] + 0.3);
          scaleAnimals(s, c, 0.85, false);
          killInRadius(s, d.lat, d.lon, 80, 0.15);
          s.aerosol += 0.002 * I;
        }
        break;
      }
      case 'iceAge':
        s.eventForcing -= 9 * I * envelope(p, 0.2, 0.2);
        break;
      case 'climateChange':
        s.eventForcing += 6 * I * envelope(p, 0.3, 0.1);
        break;
      case 'superstorm': {
        const { idx, w } = area(ev.radiusKm);
        idx.forEach((i, k) => {
          f.eventPrecip[i] *= 1 + 3 * I * w[k];
          f.eventWind[i] += 25 * I * w[k];
          f.eventTemp[i] -= 3 * I * w[k];
          f.cloud[i] = Math.max(f.cloud[i], 0.95 * w[k]);
          if (f.landFrac[i] >= 0.5) {
            f.tree[i] *= 1 - Math.min(0.3, 0.02 * I * w[k] * dt);
            f.soilW[i] = Math.min(1, f.soilW[i] + 0.05 * w[k] * dt);
            if (isCoastal(s, i)) f.damage[i] = Math.min(1, f.damage[i] + 0.05 * I * w[k] * dt);
          }
        });
        killInRadius(s, ev.lat, ev.lon, ev.radiusKm * 0.5, 0.002 * I * Math.min(dt, 3));
        break;
      }
      case 'epidemic': {
        for (const st of s.settlements) {
          if (st.health < 0.7) {
            for (const o of s.settlements) {
              if (o !== st && o.health > 0.5 && angDist(o.lat, o.lon, st.lat, st.lon) * EARTH_RADIUS_KM < 1200 && ctx.rng.next() < 0.02 * I * dt) {
                o.health = Math.max(0, o.health - 0.4 * I);
              }
            }
            st.health = Math.max(0, st.health - 0.01 * I * dt);
          }
        }
        break;
      }
      default:
        break;
    }
    ev.elapsedDays += dt;
    if (ev.elapsedDays >= ev.durationDays) ended.push(ev);
  }
  if (ended.length) s.events = s.events.filter((e) => !ended.includes(e));
  for (const e of spawned) s.events.push(e);
  // damage map slowly fades
  const kd = Math.exp(-dt / 400);
  for (let i = 0; i < SIM_N; i++) f.damage[i] *= kd;
  return ended;
}

/** Natural (spontaneous) disasters. */
export function naturalDisasters(s: SimState, dt: number, rng: Rng): DisasterEvent[] {
  const out: DisasterEvent[] = [];
  if (!s.naturalEvents || s.events.length > 8) return out;
  const dtY = dt / 365;
  const f = s.f;
  const pick = (pred: (i: number) => boolean) => {
    for (let k = 0; k < 40; k++) {
      const i = Math.floor(rng.next() * SIM_N);
      if (pred(i)) return i;
    }
    return -1;
  };
  const roll = (rate: number) => rng.next() < 1 - Math.exp(-rate * dtY);
  if (roll(1 / 25)) {
    const i = pick((c) => f.landFrac[c] >= 0.5 && f.elev[c] > 1200);
    if (i >= 0) out.push(createEvent(s, 'volcano', cellLat(i), cellLon(i), rng.range(0.2, 0.6)));
  }
  if (roll(1 / 5)) {
    const i = pick((c) => f.landFrac[c] >= 0.5 && f.elev[c] > 600);
    if (i >= 0) out.push(createEvent(s, 'earthquake', cellLat(i), cellLon(i), rng.range(0.2, 0.75)));
  }
  if (roll(5)) {
    const i = pick((c) => f.landFrac[c] < 0.5 && f.temp[c] > 27 && Math.abs(cellLat(c)) > 7 && Math.abs(cellLat(c)) < 25);
    if (i >= 0) out.push(createEvent(s, 'hurricane', cellLat(i), cellLon(i), rng.range(0.25, 0.5), rng.range(350, 600), 14));
  }
  if (roll(1)) {
    const i = pick((c) => f.landFrac[c] >= 0.5 && f.temp[c] > 18 && Math.abs(cellLat(c)) > 25 && Math.abs(cellLat(c)) < 50);
    if (i >= 0) out.push(createEvent(s, 'tornado', cellLat(i), cellLon(i), rng.range(0.3, 0.8)));
  }
  if (roll(0.5)) {
    const i = pick((c) => f.landFrac[c] >= 0.5);
    if (i >= 0) out.push(createEvent(s, rng.next() < 0.5 ? 'heatwave' : 'drought', cellLat(i), cellLon(i), rng.range(0.2, 0.5)));
  }
  return out;
}
