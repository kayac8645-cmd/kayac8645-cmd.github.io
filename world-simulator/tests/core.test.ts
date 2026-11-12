import { describe, it, expect, beforeAll } from 'vitest';
import { Simulation } from '../src/core/simulation';
import { DEFAULT_PARAMS } from '../src/core/types';
import { SIM_N, HR_N, cellOf, latLonToVec, vecToLatLon } from '../src/core/grid';
import { logisticStep, meanPositive, fracAbove } from '../src/core/math';
import { dailyInsolation } from '../src/core/climate';
import { serialize, deserialize } from '../src/core/state';

let sim: Simulation;
beforeAll(() => {
  sim = Simulation.generate({ ...DEFAULT_PARAMS, seed: 'test-world' });
}, 60_000);

const findCell = (pred: (i: number) => boolean) => {
  for (let i = 0; i < SIM_N; i++) if (pred(i)) return i;
  return -1;
};
const latlon = (i: number) => ({ lat: 90 - ((Math.floor(i / 160) + 0.5) * 180) / 80, lon: -180 + ((i % 160) + 0.5) * 360 / 160 });

describe('math & geometry', () => {
  it('logistic step is exact, bounded and positive for any dt', () => {
    expect(logisticStep(0.1, 1, 1, 1000)).toBeCloseTo(1, 5);
    expect(logisticStep(0.5, -2, 1, 1000)).toBeGreaterThanOrEqual(0);
    expect(logisticStep(0.5, -2, 1, 1000)).toBeLessThan(1e-6);
    const a = logisticStep(0.1, 0.5, 0.5, 1);
    const b = logisticStep(logisticStep(0.1, 0.5, 0.5, 0.5), 0.5, 0.5, 0.5);
    expect(a).toBeCloseTo(b, 6); // timestep-consistent
  });
  it('sinusoidal degree-day helpers', () => {
    expect(fracAbove(0, 10, 0)).toBeCloseTo(0.5);
    expect(meanPositive(20, 5, 0)).toBeCloseTo(20);
    expect(meanPositive(0, 10, 0)).toBeCloseTo(10 / Math.PI, 5);
  });
  it('lat/lon round trip', () => {
    for (const [la, lo] of [[10, 20], [-45, -120], [80, 179]]) {
      const v = latLonToVec(la, lo);
      const r = vecToLatLon(v[0], v[1], v[2]);
      expect(r.lat).toBeCloseTo(la, 4);
      expect(r.lon).toBeCloseTo(lo, 4);
    }
  });
  it('insolation: equator > pole annually; polar night is zero', () => {
    expect(dailyInsolation(0, 0)).toBeGreaterThan(400);
    expect(dailyInsolation(85, -0.4)).toBe(0);
    expect(dailyInsolation(85, 0.4)).toBeGreaterThan(450); // polar summer
  });
});

describe('planet generation', () => {
  it('is deterministic for the same seed', () => {
    const b = Simulation.generate({ ...DEFAULT_PARAMS, seed: 'test-world' });
    expect(b.s.hrElev.length).toBe(HR_N);
    let diff = 0;
    for (let i = 0; i < HR_N; i += 97) diff += Math.abs(b.s.hrElev[i] - sim.s.hrElev[i]);
    expect(diff).toBe(0);
    expect(b.s.settlements.map((t) => t.name)).toEqual(sim.s.settlements.map((t) => t.name));
  }, 60_000);
  it('honours the land ratio', () => {
    let land = 0;
    for (let i = 0; i < SIM_N; i++) if (sim.s.f.landFrac[i] >= 0.5) land++;
    const frac = land / SIM_N;
    expect(frac).toBeGreaterThan(0.2);
    expect(frac).toBeLessThan(0.5);
  });
  it('produces a plausible climate (Earth-like defaults)', () => {
    const st = sim.stats(0);
    expect(st.meanTemp).toBeGreaterThan(8);
    expect(st.meanTemp).toBeLessThan(20);
    expect(st.meanPrecip).toBeGreaterThan(400);
    expect(st.meanPrecip).toBeLessThan(1600);
    // equator warmer than poles
    const eq = sim.queryCell(0, 0).tempAnnual;
    const pole = sim.queryCell(85, 0).tempAnnual;
    expect(eq).toBeGreaterThan(pole + 20);
  });
  it('has living populations, regions and settlements', () => {
    const st = sim.stats(0);
    expect(st.species.every((s) => !s.extinct && s.count > 0)).toBe(true);
    expect(sim.s.regions.length).toBeGreaterThan(2);
    expect(st.settlements).toBeGreaterThan(0);
  });
});

describe('dynamics', () => {
  it('advances time with seasons and keeps fields finite', () => {
    const d0 = sim.s.day;
    for (let k = 0; k < 36; k++) sim.step(10);
    expect(sim.s.day).toBeCloseTo(d0 + 360);
    for (const k of Object.keys(sim.s.f) as (keyof typeof sim.s.f)[]) {
      const a = sim.s.f[k];
      for (let i = 0; i < a.length; i += 13) expect(Number.isFinite(a[i])).toBe(true);
    }
  });
  it('wildfire burns forest and produces smoke', () => {
    const i = findCell((c) => sim.s.f.landFrac[c] >= 0.5 && sim.s.f.tree[c] > 0.2);
    expect(i).toBeGreaterThanOrEqual(0);
    const { lat, lon } = latlon(i);
    const tree0 = sim.s.f.tree[i];
    sim.startDisaster('wildfire', lat, lon, 1, 300, 30);
    for (let k = 0; k < 10; k++) sim.step(2);
    expect(sim.s.f.tree[i]).toBeLessThan(tree0 * 0.8);
    expect(sim.s.f.burnScar[i]).toBeGreaterThan(0.1);
  });
  it('volcano injects aerosol, which cools the planet', () => {
    const base = Simulation.fromSerialized(sim.serialize());
    const hot = Simulation.fromSerialized(sim.serialize());
    base.s.naturalEvents = hot.s.naturalEvents = false;
    base.s.events = [];
    hot.s.events = [];
    hot.s.aerosol = 0;
    base.s.aerosol = 0;
    hot.startDisaster('asteroid', 10, 10, 1, 1500, 2000);
    expect(hot.s.aerosol).toBeGreaterThan(5);
    for (let k = 0; k < 18; k++) { base.step(10); hot.step(10); }
    expect(hot.meanSurfaceTemp()).toBeLessThan(base.meanSurfaceTemp() - 1);
  }, 30_000);
  it('regional temperature tool and drought act on the climate', () => {
    const a = Simulation.fromSerialized(sim.serialize());
    a.s.naturalEvents = false;
    const i = findCell((c) => a.s.f.landFrac[c] >= 0.5 && a.s.f.soilW[c] > 0.3 && a.s.f.ice[c] < 1 && a.s.f.snow[c] < 5 && Math.abs(latlon(c).lat) < 35);
    const { lat, lon } = latlon(i);
    const t0 = a.s.f.temp[i];
    a.applyTool({ tool: 'heat', lat, lon, radiusKm: 600, strength: 1 });
    a.startDisaster('drought', lat, lon, 1, 1500, 400);
    for (let k = 0; k < 12; k++) a.step(10);
    expect(a.s.f.userTemp[i]).toBeGreaterThan(3);
    expect(a.s.f.soilW[i]).toBeLessThan(0.3);
    expect(a.s.f.temp[i]).not.toBe(t0);
  });
  it('terrain tools change elevation and land mask', () => {
    const a = Simulation.fromSerialized(sim.serialize());
    const i = findCell((c) => a.s.f.landFrac[c] < 0.5 && a.s.f.elev[c] > -800);
    const { lat, lon } = latlon(i);
    const v0 = a.terrainVersion;
    for (let k = 0; k < 3; k++) a.applyTool({ tool: 'raise', lat, lon, radiusKm: 300, strength: 1 });
    expect(a.terrainVersion).toBeGreaterThan(v0);
    expect(a.s.f.landFrac[cellOf(lat, lon)]).toBeGreaterThanOrEqual(0.5);
  });
  it('predators and prey coexist for decades', () => {
    const a = Simulation.fromSerialized(sim.serialize());
    a.s.naturalEvents = false;
    for (let k = 0; k < 30 * 12; k++) a.step(30);
    const st = a.stats(0);
    for (const sp of st.species) expect(sp.extinct, sp.name).toBe(false);
  }, 60_000);
  it('long time jumps stay stable (1000 years)', () => {
    const a = Simulation.fromSerialized(sim.serialize());
    const t0 = a.meanSurfaceTemp();
    for (let k = 0; k < 50; k++) a.stepGeo(20);
    expect(Math.abs(a.meanSurfaceTemp() - t0)).toBeLessThan(4);
    expect(Math.abs(a.s.seaLevel)).toBeLessThan(40);
  }, 60_000);
});

describe('persistence', () => {
  it('serialize → deserialize preserves the full state', () => {
    sim.startDisaster('hurricane', 15, -40, 0.5);
    const d = serialize(sim.s);
    const cloned = structuredClone(d);
    const s2 = deserialize(cloned);
    expect(s2.day).toBe(sim.s.day);
    expect(s2.events.length).toBe(sim.s.events.length);
    expect(s2.settlements.length).toBe(sim.s.settlements.length);
    expect(Array.from(s2.f.temp.slice(0, 50))).toEqual(Array.from(sim.s.f.temp.slice(0, 50)));
    expect(s2.bio.length).toBe(sim.s.species.length);
    const r = Simulation.fromSerialized(cloned);
    r.step(1);
    expect(r.s.day).toBeCloseTo(sim.s.day + 1);
  });
});
