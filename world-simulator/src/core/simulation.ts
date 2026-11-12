import { HR_GEOM, HR_H, HR_N, HR_W, SIM_GEOM, SIM_H, SIM_N, SIM_W, cellOf, cellsInRadius, cellLat, cellLon, angDist, EARTH_RADIUS_KM } from './grid';
import { Rng, seedToInt } from './rng';
import { clamp, smoothstep } from './math';
import { allocFields, deserialize, newHrElev, serialize, type SerializedState, type SimState } from './state';
import { DEFAULT_SPECIES } from './species';
import { computeRegions, generateElevation, recomputeSimTerrain, brushElevation } from './terrain';
import { annualInsolationRow, climateStep, landIceVolume, totalForcing } from './climate';
import { accumulateFlow, computeDrainage, createHydro, type Hydro } from './hydrology';
import { bmax, faunaStep, speciesTotals, suitabilityForSeed, vegetationStep, waterIndex } from './ecosystem';
import { civilizationStep, createSettlement, siteScore, totalHumans, eraName } from './civilization';
import { createEvent, disasterStep, naturalDisasters, startEvent, type DisasterCtx } from './disasters';
import {
  DISASTER_INFO, type CellInfo, type DisasterEvent, type DisasterType, type GlobalStats, type LogEntry,
  type PlanetParams, type SpeciesDef, type ToolApply,
} from './types';

export const STATE_VERSION = 1;
export type Progress = (msg: string, frac: number) => void;

export class Simulation {
  s: SimState;
  rng: Rng;
  hydro: Hydro = createHydro();
  hydroDirty = true;
  regionsDirty = false;
  terrainVersion = 0;
  lastLandSea = 0;
  lastFlowDay = -1e9;
  lastTrendDay = 0;
  newLogs: LogEntry[] = [];
  private ctx: DisasterCtx;

  constructor(s: SimState) {
    this.s = s;
    this.rng = new Rng(s.rngState);
    this.lastLandSea = s.seaLevel;
    this.lastTrendDay = s.day;
    this.ctx = {
      rng: this.rng,
      log: (text, ev) => this.log('disaster', text, ev.lat, ev.lon),
      terrainChanged: (a, b) => this.terrainChanged(a, b),
    };
  }

  // ------------------------------------------------------------------ creation
  static generate(params: PlanetParams, progress: Progress = () => {}): Simulation {
    const seed = seedToInt(params.seed);
    progress('Arazi oluşturuluyor', 0.05);
    const hrElev = newHrElev();
    generateElevation(params, hrElev);
    const s: SimState = {
      version: STATE_VERSION,
      params: { ...params },
      day: 0,
      rngState: (seed ^ 0xa5a5a5a5) >>> 0,
      seaLevel: 0,
      co2ppm: 280,
      aerosol: 0,
      greenhouseBase: 0,
      eventForcing: 0,
      iceVolume0: 0,
      meanT0: 14,
      nextEventId: 1,
      nextSettlementId: 1,
      naturalEvents: true,
      hrElev,
      f: allocFields(),
      region: new Int16Array(SIM_N),
      regions: [],
      species: DEFAULT_SPECIES.map((d) => ({ ...d, diet: { ...d.diet } })),
      bio: DEFAULT_SPECIES.map(() => new Float32Array(SIM_N)),
      extinct: DEFAULT_SPECIES.map(() => false),
      speciesPrevTotals: DEFAULT_SPECIES.map(() => 0),
      speciesTrend: DEFAULT_SPECIES.map(() => 0),
      settlements: [],
      events: [],
      log: [],
      history: [],
      lastHistoryDay: -1e9,
      lastCheckpointDay: 0,
    };
    const sim = new Simulation(s);
    const f = s.f;
    recomputeSimTerrain(s);
    computeRegions(s, sim.rng);
    for (let y = 0; y < SIM_H; y++) {
      const lat = SIM_GEOM.lat[y];
      const t = 28 - 48 * Math.sin((lat * Math.PI) / 180) ** 2;
      for (let x = 0; x < SIM_W; x++) {
        const i = y * SIM_W + x;
        f.T0[i] = t;
        f.temp[i] = t;
        f.tempAnn[i] = t;
        f.tempAmp[i] = 4 + 20 * Math.abs(Math.sin((lat * Math.PI) / 180));
        f.q[i] = 20;
        f.cloud[i] = 0.5;
        f.soilW[i] = 0.4;
        f.grass[i] = f.landFrac[i] >= 0.5 ? 0.25 : 0;
      }
    }
    // climate spin-up in annual mode with greenhouse calibration to the requested mean temperature
    progress('İklim dengeleniyor', 0.2);
    for (let pass = 0; pass < 4; pass++) {
      for (let k = 0; k < 12; k++) climateStep(s, 365, true);
      vegetationStep(s, 365 * 3, true, sim.rng, -1);
      const mean = sim.meanSurfaceTemp();
      s.greenhouseBase += (params.baseTemperature - mean) * 2.4;
    }
    // initial glaciers
    const thr = -3 + 6 * params.iceAmount;
    for (let i = 0; i < SIM_N; i++) {
      if (f.landFrac[i] >= 0.5) f.ice[i] = params.iceAmount * 2600 * smoothstep(thr, thr - 14, f.tempAnn[i]);
    }
    for (let k = 0; k < 8; k++) climateStep(s, 365, true);
    progress('Bitki örtüsü yayılıyor', 0.45);
    s.naturalEvents = false;
    for (let k = 0; k < 24; k++) {
      climateStep(s, 365, true);
      vegetationStep(s, 365 * 4, true, sim.rng, -1);
    }
    s.greenhouseBase += (params.baseTemperature - sim.meanSurfaceTemp()) * 2.4;
    // seed species
    progress('Canlılar yerleşiyor', 0.6);
    s.species.forEach((sp, k) => {
      const b = s.bio[k];
      const bm = bmax(sp);
      const frac = sp.category === 'carnivore' ? 0.08 : 0.3;
      for (let i = 0; i < SIM_N; i++) b[i] = frac * bm * suitabilityForSeed(s, sp, i);
    });
    for (let k = 0; k < 15; k++) {
      climateStep(s, 365, true);
      vegetationStep(s, 365, true, sim.rng, 0);
      for (let j = 0; j < 4; j++) faunaStep(s, 91, true, annualInsolationRow);
    }
    // seasonal settle (establishes seasonal amplitude) + final calibration of the seasonal mean
    progress('Mevsimler hesaplanıyor', 0.72);
    const seasonalYear = () => {
      let acc = 0;
      for (let k = 0; k < 37; k++) {
        climateStep(s, 10, false);
        vegetationStep(s, 10, false, sim.rng, 0);
        faunaStep(s, 10, false, annualInsolationRow);
        s.day += 10;
        acc += sim.meanSurfaceTemp();
      }
      return acc / 37;
    };
    seasonalYear();
    progress('Buzullar dengeleniyor', 0.78);
    sim.equilibrateIce(3, 800);
    const ts = seasonalYear();
    s.greenhouseBase += (params.baseTemperature - ts) * 2.2;
    sim.equilibrateIce(2, 800);
    seasonalYear();
    s.day = 0;
    s.naturalEvents = true;
    // fires from spin-up should not carry over
    f.fire.fill(0);
    f.burnScar.fill(0);
    f.smoke.fill(0);
    // hydrology
    progress('Nehirler ve göller', 0.85);
    computeDrainage(s, sim.hydro);
    accumulateFlow(s, sim.hydro);
    sim.hydroDirty = false;
    // settlements
    progress('İlk yerleşimler', 0.92);
    let landCells = 0;
    for (let i = 0; i < SIM_N; i++) if (f.landFrac[i] >= 0.5) landCells++;
    const want = Math.round(3 + (14 * landCells) / SIM_N);
    const cand = Array.from({ length: SIM_N }, (_, i) => i).filter((i) => siteScore(s, i) > 0.35);
    cand.sort((a, b) => siteScore(s, b) - siteScore(s, a));
    for (const c of cand) {
      if (s.settlements.length >= want) break;
      if (s.settlements.some((t) => angDist(t.lat, t.lon, cellLat(c), cellLon(c)) * EARTH_RADIUS_KM < 1800)) continue;
      if (sim.rng.next() < 0.35) continue;
      createSettlement(s, c, sim.rng.range(300, 1500), sim.rng.range(0, 0.4), sim.rng);
    }
    s.iceVolume0 = landIceVolume(s);
    s.seaLevel = 0;
    sim.lastLandSea = 0;
    for (const t of s.settlements) sim.log('settlement', `${t.name} yerleşimi kuruldu`, t.lat, t.lon);
    const totals = speciesTotals(s);
    s.speciesPrevTotals = totals;
    sim.recordHistory(true);
    s.rngState = sim.rng.state;
    progress('Hazır', 1);
    return sim;
  }

  static fromSerialized(d: SerializedState): Simulation {
    const sim = new Simulation(deserialize(d));
    computeDrainage(sim.s, sim.hydro);
    accumulateFlow(sim.s, sim.hydro);
    sim.hydroDirty = false;
    return sim;
  }

  serialize(): SerializedState {
    this.s.rngState = this.rng.state;
    return serialize(this.s);
  }

  // ------------------------------------------------------------------ helpers
  log(kind: LogEntry['kind'], text: string, lat?: number, lon?: number) {
    const e: LogEntry = { day: this.s.day, kind, text, lat, lon };
    this.s.log.push(e);
    if (this.s.log.length > 400) this.s.log.splice(0, this.s.log.length - 400);
    this.newLogs.push(e);
  }

  meanSurfaceTemp(): number {
    let t = 0, a = 0;
    for (let y = 0; y < SIM_H; y++) {
      const ar = SIM_GEOM.areaKm2[y];
      for (let x = 0; x < SIM_W; x++) {
        t += this.s.f.temp[y * SIM_W + x] * ar;
        a += ar;
      }
    }
    return t / a;
  }

  terrainChanged(sy0: number, sy1: number) {
    recomputeSimTerrain(this.s, sy0, sy1);
    this.hydroDirty = true;
    this.regionsDirty = true;
    this.terrainVersion++;
  }

  private refreshRegions() {
    const s = this.s;
    const oldReg = s.region.slice();
    const oldRegions = s.regions;
    computeRegions(s, new Rng(s.rngState ^ 0x1234));
    // keep stable names: reuse old name with the largest overlap
    for (const r of s.regions) {
      const counts = new Map<number, number>();
      for (let i = 0; i < SIM_N; i++) if (s.region[i] === r.id) counts.set(oldReg[i], (counts.get(oldReg[i]) ?? 0) + 1);
      let best = -1, bc = 0;
      counts.forEach((c, k) => {
        if (c > bc && oldRegions[k] && oldRegions[k].ocean === r.ocean) {
          bc = c;
          best = k;
        }
      });
      if (best >= 0 && bc > r.cells * 0.3) r.name = oldRegions[best].name;
    }
    this.regionsDirty = false;
  }

  private maintainHydro(force = false) {
    const s = this.s;
    if (Math.abs(s.seaLevel - this.lastLandSea) > 2) {
      recomputeSimTerrain(s);
      this.lastLandSea = s.seaLevel;
      this.hydroDirty = true;
      this.regionsDirty = true;
      this.terrainVersion++;
    }
    if (this.hydroDirty) {
      computeDrainage(s, this.hydro);
      this.hydroDirty = false;
      force = true;
    }
    if (force || s.day - this.lastFlowDay >= 30) {
      accumulateFlow(s, this.hydro);
      this.lastFlowDay = s.day;
    }
    if (this.regionsDirty) this.refreshRegions();
  }

  // ------------------------------------------------------------------ stepping
  /** One seasonal step (dt ≤ ~30 days). */
  step(dt: number) {
    const s = this.s;
    for (const ev of naturalDisasters(s, dt, this.rng)) this.launch(ev);
    disasterStep(s, dt, this.ctx);
    climateStep(s, dt, false);
    vegetationStep(s, dt, false, this.rng, this.microbeIndex());
    faunaStep(s, dt, false, annualInsolationRow);
    const co2 = civilizationStep(s, dt, this.rng, (t, st, kind) => this.log(kind ?? 'civ', t, st?.lat, st?.lon));
    s.co2ppm += co2;
    s.day += dt;
    this.postStep(dt);
  }

  /**
   * Long-term step (dtYears ≥ 1). One representative year is simulated with the full seasonal
   * model; slow reservoirs (ice sheets, CO2, terrain, technology) are then extrapolated over dtYears.
   * Fast dynamics inside the skipped years are NOT resolved (quasi-equilibrium approximation).
   */
  stepGeo(dtYears: number) {
    const s = this.s;
    const f = s.f;
    disasterStep(s, dtYears * 365, this.ctx);
    const ice0 = f.ice.slice();
    for (let m = 0; m < 12; m++) {
      climateStep(s, 365 / 12, false);
      vegetationStep(s, 365 / 12, false, this.rng, this.microbeIndex());
      if (m % 3 === 2) faunaStep(s, 365 / 4, false, annualInsolationRow);
      s.day += 365 / 12;
    }
    if (dtYears > 1) this.extrapolateIce(ice0, dtYears - 1);
    if (dtYears >= 50) this.erode(dtYears);
    // population dynamics are integrated over at most 10 years per step; technology over the full span
    const civYears = Math.min(dtYears, 10);
    const co2 = civilizationStep(s, civYears * 365, this.rng, (t, st, kind) => this.log(kind ?? 'civ', t, st?.lat, st?.lon), dtYears / civYears);
    s.co2ppm += co2 * (dtYears / civYears);
    s.co2ppm = 280 + (s.co2ppm - 280) * Math.exp(-(dtYears - 1) / 150);
    s.day += (dtYears - 1) * 365;
    this.postStep(dtYears * 365);
  }

  /** Ice sheet: dI/dt = acc − I/τ, solved exactly using the accumulation measured over the last year. */
  private extrapolateIce(ice0: Float32Array, years: number) {
    const f = this.s.f;
    const tau = 1500;
    for (let i = 0; i < SIM_N; i++) {
      if (f.landFrac[i] < 0.5) continue;
      const acc = f.ice[i] - ice0[i] * Math.exp(-1 / tau); // net yearly gain before discharge
      const eq = Math.max(0, (acc / (1 - Math.exp(-1 / tau))));
      f.ice[i] = Math.min(3500, Math.max(0, eq + (f.ice[i] - eq) * Math.exp(-years / tau)));
    }
  }

  /** Spin ice sheets toward mass balance (used at planet creation). */
  private equilibrateIce(rounds: number, years: number) {
    const s = this.s;
    for (let r = 0; r < rounds; r++) {
      const ice0 = s.f.ice.slice();
      for (let m = 0; m < 12; m++) {
        climateStep(s, 365 / 12, false);
        s.day += 365 / 12;
      }
      this.extrapolateIce(ice0, years);
    }
  }

  private erode(dtYears: number) {
    const s = this.s;
    const z = s.hrElev;
    const sea = s.seaLevel;
    const out = new Float32Array(z);
    for (let y = 1; y < HR_H - 1; y++) {
      for (let x = 0; x < HR_W; x++) {
        const i = y * HR_W + x;
        if (z[i] <= sea) continue;
        const si = ((y / 4) | 0) * SIM_W + ((x / 4) | 0);
        const k = Math.min(0.2, dtYears * 4e-8 * (0.3 + s.f.precipAnn[si] / 1000));
        const avg = (z[i - HR_W] + z[i + HR_W] + z[y * HR_W + ((x + 1) % HR_W)] + z[y * HR_W + ((x + HR_W - 1) % HR_W)]) * 0.25;
        out[i] = z[i] + k * (avg - z[i]);
      }
    }
    s.hrElev.set(out);
    this.terrainChanged(0, SIM_H - 1);
  }

  private postStep(dt: number) {
    const s = this.s;
    // ecological trend reference
    const kE = 1 - Math.exp(-dt / 365);
    const f = s.f;
    for (let i = 0; i < SIM_N; i++) {
      let b = 0;
      for (let k = 0; k < s.species.length; k++) if (s.species[k].category !== 'microbe') b += s.bio[k][i];
      f.bioEma[i] += (b - f.bioEma[i]) * kE;
    }
    if (s.day - this.lastTrendDay >= 30) {
      const totals = speciesTotals(s);
      const span = (s.day - this.lastTrendDay) / 365;
      totals.forEach((t, k) => {
        const prev = s.speciesPrevTotals[k] ?? 0;
        const tr = prev > 0 ? Math.pow(Math.max(t, 1e-9) / prev, 1 / Math.max(span, 1e-3)) - 1 : 0;
        s.speciesTrend[k] = clamp(tr, -1, 10);
        const sp = s.species[k];
        const threshold = sp.category === 'microbe' ? 1 : 50;
        if (!s.extinct[k] && t < threshold) {
          s.extinct[k] = true;
          s.bio[k].fill(0);
          this.log('extinction', `${sp.name} türü yok oldu`);
        }
      });
      s.speciesPrevTotals = totals;
      this.lastTrendDay = s.day;
    }
    this.maintainHydro();
    this.recordHistory();
    s.rngState = this.rng.state;
  }

  private microbeIndex() {
    return this.s.species.findIndex((sp) => sp.category === 'microbe' && sp.habitat === 'land' && !this.s.extinct[this.s.species.indexOf(sp)]);
  }

  recordHistory(force = false) {
    const s = this.s;
    if (!force && s.day - s.lastHistoryDay < 30) return;
    s.lastHistoryDay = s.day;
    const st = this.quickStats();
    s.history.push(st);
    if (s.history.length > 720) s.history = s.history.filter((_, k) => k % 2 === 0 || k === s.history.length - 1);
  }

  private quickStats() {
    const s = this.s;
    const totals = s.speciesPrevTotals;
    let herb = 0, carn = 0;
    s.species.forEach((sp, k) => {
      if (sp.category === 'herbivore') herb += totals[k] ?? 0;
      if (sp.category === 'carnivore') carn += totals[k] ?? 0;
    });
    const g = this.coverStats();
    return { day: s.day, temp: this.meanSurfaceTemp(), co2: s.co2ppm, humans: totalHumans(s), herb, carn, forest: g.forestPct, ice: g.icePct };
  }

  private coverStats() {
    const f = this.s.f;
    let land = 0, forest = 0, grass = 0, desert = 0, ice = 0, seaIce = 0, total = 0, biomass = 0, farm = 0;
    for (let y = 0; y < SIM_H; y++) {
      const a = SIM_GEOM.areaKm2[y];
      for (let x = 0; x < SIM_W; x++) {
        const i = y * SIM_W + x;
        total += a;
        if (f.landFrac[i] >= 0.5) {
          land += a;
          forest += f.tree[i] * a;
          grass += f.grass[i] * a;
          farm += f.farm[i] * a;
          if (f.grass[i] + f.shrub[i] + f.tree[i] + f.farm[i] < 0.12 && f.ice[i] < 5) desert += a;
          if (f.ice[i] > 5) ice += a;
          biomass += (f.grass[i] * 0.5 + f.shrub[i] * 2 + f.tree[i] * 15) * a * 1e6;
        } else {
          seaIce += f.seaIce[i] * a;
        }
      }
    }
    return {
      forestPct: (100 * forest) / Math.max(1, land),
      grassPct: (100 * grass) / Math.max(1, land),
      desertPct: (100 * desert) / Math.max(1, land),
      icePct: (100 * (ice + seaIce)) / total,
      seaIcePct: (100 * seaIce) / total,
      biomassGt: biomass / 1e12,
      farmKm2: farm,
    };
  }

  // ------------------------------------------------------------------ user actions
  launch(ev: DisasterEvent) {
    const spawned = startEvent(this.s, ev, this.ctx);
    this.s.events.push(ev, ...spawned);
    for (const sp of spawned) startEvent(this.s, sp, this.ctx);
  }

  startDisaster(type: DisasterType, lat: number, lon: number, intensity: number, radiusKm?: number, durationDays?: number) {
    const ev = createEvent(this.s, type, lat, lon, intensity, radiusKm, durationDays);
    this.launch(ev);
    return ev;
  }

  stopEvent(id: number) {
    const ev = this.s.events.find((e) => e.id === id);
    this.s.events = this.s.events.filter((e) => e.id !== id);
    if (ev) this.log('user', `${DISASTER_INFO[ev.type].label} durduruldu`, ev.lat, ev.lon);
    // clear transient forcing immediately
    disasterStep(this.s, 0, this.ctx);
  }

  resetEvents() {
    const s = this.s;
    s.events = [];
    s.aerosol = 0;
    s.f.smoke.fill(0);
    s.f.fire.fill(0);
    disasterStep(s, 0, this.ctx);
    this.log('user', 'Tüm olaylar sıfırlandı (aerosol, duman ve yangınlar temizlendi)');
  }

  resetUserForcing() {
    this.s.f.userTemp.fill(0);
    this.s.f.userPrecip.fill(1);
    this.log('user', 'Bölgesel iklim müdahaleleri sıfırlandı');
  }

  applyTool(t: ToolApply): string {
    const s = this.s;
    const f = s.f;
    const st = clamp(t.strength, 0.05, 1);
    const { idx, w } = cellsInRadius(t.lat, t.lon, t.radiusKm);
    const cell = cellOf(t.lat, t.lon);
    const land = f.landFrac[cell] >= 0.5;
    switch (t.tool) {
      case 'inspect':
        return '';
      case 'heat':
      case 'cool': {
        const sg = t.tool === 'heat' ? 1 : -1;
        idx.forEach((i, k) => (f.userTemp[i] = clamp(f.userTemp[i] + sg * 6 * st * w[k], -40, 40)));
        this.log('user', `Bölgesel sıcaklık ${sg > 0 ? 'artırıldı' : 'azaltıldı'} (±${(6 * st).toFixed(1)}°C)`, t.lat, t.lon);
        return 'Sıcaklık değiştirildi';
      }
      case 'rain':
      case 'dry': {
        const m = t.tool === 'rain' ? 1 + 0.6 * st : 1 / (1 + 0.6 * st);
        idx.forEach((i, k) => (f.userPrecip[i] = clamp(f.userPrecip[i] * (1 + (m - 1) * w[k]), 0.05, 6)));
        this.log('user', `Yağış ${t.tool === 'rain' ? 'artırıldı' : 'azaltıldı'}`, t.lat, t.lon);
        return 'Yağış değiştirildi';
      }
      case 'grass':
      case 'forest': {
        let n = 0;
        idx.forEach((i, k) => {
          if (f.landFrac[i] < 0.5 || f.ice[i] > 5) return;
          n++;
          if (t.tool === 'grass') {
            f.grass[i] = Math.min(1, f.grass[i] + 0.6 * st * w[k]);
            f.shrub[i] = Math.min(1, f.shrub[i] + 0.15 * st * w[k]);
          } else {
            f.tree[i] = Math.min(1 - f.farm[i], f.tree[i] + 0.7 * st * w[k]);
            f.grass[i] = Math.min(f.grass[i], 1 - f.tree[i]);
          }
        });
        if (!n) return 'Bu bölgede kara yok';
        this.log('user', t.tool === 'grass' ? 'Bitki örtüsü oluşturuldu' : 'Orman oluşturuldu', t.lat, t.lon);
        return n + ' hücrede bitki örtüsü eklendi';
      }
      case 'lake': {
        if (!land) return 'Göl yalnızca karada oluşturulabilir';
        const r = brushElevation(s, t.lat, t.lon, Math.min(t.radiusKm, 250), 150 + 350 * st, 'lake');
        this.terrainChanged(r.sy0, r.sy1);
        idx.forEach((i) => (f.soilW[i] = 1));
        f.runoffAnn[cell] = Math.max(f.runoffAnn[cell], 200);
        this.maintainHydro(true);
        this.log('user', 'Göl çanağı oluşturuldu', t.lat, t.lon);
        return 'Göl oluşturuldu';
      }
      case 'raise':
      case 'lower': {
        const d = (t.tool === 'raise' ? 1 : -1) * (300 + 1700 * st);
        const r = brushElevation(s, t.lat, t.lon, t.radiusKm, d, 'add');
        this.terrainChanged(r.sy0, r.sy1);
        this.maintainHydro(true);
        this.log('user', `Arazi ${t.tool === 'raise' ? 'yükseltildi' : 'alçaltıldı'} (${Math.round(d)} m)`, t.lat, t.lon);
        return 'Arazi değiştirildi';
      }
      case 'animals': {
        const k = s.species.findIndex((sp) => sp.id === t.speciesId);
        if (k < 0) return 'Tür seçilmedi';
        const sp = s.species[k];
        let n = 0;
        idx.forEach((i, j) => {
          if ((f.landFrac[i] >= 0.5) !== (sp.habitat === 'land')) return;
          s.bio[k][i] += 0.3 * bmax(sp) * st * w[j];
          n++;
        });
        if (!n) return sp.habitat === 'land' ? 'Kara türü için kara seçin' : 'Deniz türü için okyanus seçin';
        if (s.extinct[k]) this.log('species', `${sp.name} yeniden tanıtıldı`, t.lat, t.lon);
        s.extinct[k] = false;
        this.log('user', `${sp.name} popülasyonu eklendi`, t.lat, t.lon);
        return 'Popülasyon eklendi';
      }
      case 'settlement': {
        if (!land) return 'Yerleşim yalnızca karada kurulabilir';
        const techs = s.settlements.map((x) => x.tech);
        const tech = techs.length ? (techs.reduce((a, b) => a + b, 0) / techs.length) * 0.8 : 0;
        const ns = createSettlement(s, cell, 500 + 4500 * st, tech, this.rng);
        if (!ns) return 'Yerleşim sınırına ulaşıldı';
        ns.lat = t.lat;
        ns.lon = t.lon;
        this.log('settlement', `${ns.name} yerleşimi kuruldu`, t.lat, t.lon);
        f.humans[cell] += ns.pop / SIM_GEOM.areaKm2[(cell / SIM_W) | 0];
        return 'Yerleşim kuruldu';
      }
      case 'disaster': {
        if (!t.disaster) return 'Felaket türü seçilmedi';
        const d = t.disaster;
        this.startDisaster(d.type, t.lat, t.lon, d.intensity, d.radiusKm, d.durationDays);
        return `${DISASTER_INFO[d.type].label} başlatıldı`;
      }
    }
    return '';
  }

  addSpecies(def: SpeciesDef, lat: number, lon: number): string {
    const s = this.s;
    if (s.species.length >= 24) return 'En fazla 24 tür desteklenir';
    const sp: SpeciesDef = { ...def, id: `custom-${Date.now().toString(36)}-${s.species.length}`, custom: true };
    s.species.push(sp);
    s.bio.push(new Float32Array(SIM_N));
    s.extinct.push(false);
    s.speciesPrevTotals.push(0);
    s.speciesTrend.push(0);
    const k = s.species.length - 1;
    const { idx, w } = cellsInRadius(lat, lon, 900);
    let n = 0;
    idx.forEach((i, j) => {
      const suit = suitabilityForSeed(s, sp, i);
      if (suit <= 0) return;
      s.bio[k][i] = 0.3 * bmax(sp) * w[j] * Math.max(0.2, suit);
      n++;
    });
    this.log('species', `Yeni tür oluşturuldu: ${sp.name}${n ? '' : ' (uygun yaşam alanı bulunamadı)'}`, lat, lon);
    return n ? `${sp.name} ${n} hücreye yerleştirildi` : 'Tür eklendi ama seçilen bölge uygun değil';
  }

  // ------------------------------------------------------------------ queries
  queryCell(lat: number, lon: number): CellInfo {
    const s = this.s;
    const f = s.f;
    const i = cellOf(lat, lon);
    const land = f.landFrac[i] >= 0.5;
    const animals = s.species
      .map((sp, k) => ({ id: sp.id, name: sp.name, count: sp.category === 'microbe' ? 0 : (s.bio[k][i] * SIM_GEOM.areaKm2[(i / SIM_W) | 0]) / sp.massKg, micro: sp.category === 'microbe' }))
      .filter((a) => !a.micro && a.count >= 1)
      .map(({ id, name, count }) => ({ id, name, count }));
    const animalTotal = animals.reduce((a, b) => a + b.count, 0);
    const hum = s.settlements.filter((t) => t.cell === i);
    const near = s.settlements
      .map((t) => ({ t, d: angDist(lat, lon, t.lat, t.lon) }))
      .sort((a, b) => a.d - b.d)[0];
    const events = s.events
      .filter((e) => DISASTER_INFO[e.type].global || angDist(lat, lon, e.lat, e.lon) * EARTH_RADIUS_KM < e.radiusKm)
      .map((e) => DISASTER_INFO[e.type].label);
    const rh = f.q[i] / Math.max(0.5, Math.min(140, 2.2 * 6.112 * Math.exp((17.67 * f.temp[i]) / (f.temp[i] + 243.5))));
    let b = 0;
    for (let k = 0; k < s.species.length; k++) if (s.species[k].category !== 'microbe') b += s.bio[k][i];
    const ratio = f.bioEma[i] > 1e-6 ? b / f.bioEma[i] : 1;
    let eco = 'Dengeli';
    if (f.fire[i] > 0) eco = 'Aktif yangın';
    else if (f.damage[i] > 0.5) eco = 'Kritik (felaket hasarı)';
    else if (land && f.grass[i] + f.shrub[i] + f.tree[i] < 0.05 && b < 1) eco = f.ice[i] > 5 ? 'Buzul — yaşam yok denecek kadar az' : 'Cansıza yakın';
    else if (ratio < 0.75) eco = 'Gerileyen';
    else if (ratio > 1.3) eco = 'Toparlanan / büyüyen';
    else if (f.damage[i] > 0.15) eco = 'Toparlanıyor';
    return {
      lat, lon, cell: i,
      region: s.regions[s.region[i]]?.name ?? '—',
      isLand: land,
      elevation: land ? f.elev[i] + f.ice[i] - s.seaLevel : f.elev[i] - s.seaLevel,
      temp: f.temp[i],
      tempAnnual: f.tempAnn[i],
      seaTemp: land ? null : Math.max(-1.9, f.temp[i]),
      humidity: clamp(rh, 0, 1),
      precipAnnual: f.precipAnn[i],
      precipNow: f.precip[i],
      pressure: f.pressure[i],
      windSpeed: Math.hypot(f.windU[i], f.windV[i]) + f.eventWind[i],
      windDir: ((Math.atan2(f.windU[i], f.windV[i]) * 180) / Math.PI + 360) % 360,
      cloud: f.cloud[i],
      snowMm: f.snow[i],
      iceM: f.ice[i],
      soilWater: f.soilW[i],
      waterIndex: waterIndex(s, i),
      biome: this.biome(i),
      grass: f.grass[i], shrub: f.shrub[i], tree: f.tree[i], farm: f.farm[i], fire: f.fire[i],
      animals,
      animalTotal,
      humans: hum.reduce((a, t) => a + t.pop, 0),
      settlement: hum.length ? `${hum.map((t) => t.name).join(', ')} · ${eraName(Math.max(...hum.map((t) => t.tech)))}` : near && near.d * EARTH_RADIUS_KM < 800 ? `En yakın: ${near.t.name} (${Math.round(near.d * EARTH_RADIUS_KM)} km)` : null,
      ecoStatus: eco,
      events,
    };
  }

  biome(i: number): string {
    const f = this.s.f;
    if (f.landFrac[i] < 0.5) {
      if (f.seaIce[i] > 0.5) return 'Deniz buzu';
      return f.elev[i] - this.s.seaLevel > -250 ? 'Sığ deniz / kıta sahanlığı' : 'Açık okyanus';
    }
    const ta = f.tempAnn[i], p = f.precipAnn[i];
    const hi = f.elev[i] - this.s.seaLevel > 3000 ? 'Yüksek dağ · ' : '';
    if (f.ice[i] > 5) return 'Buzul';
    if (f.lakeFrac[i] > 0.3) return hi + 'Göller bölgesi';
    if (f.farm[i] > 0.3) return hi + 'Tarım arazisi';
    if (f.tree[i] > 0.4) return hi + (ta > 21 && p > 1400 ? 'Tropikal yağmur ormanı' : ta > 4 ? 'Ilıman orman' : 'Tayga (boreal orman)');
    if (ta < -6) return hi + 'Tundra';
    if (f.grass[i] > 0.3) return hi + (ta > 18 ? 'Savan' : 'Bozkır / çayır');
    if (f.shrub[i] > 0.2) return hi + 'Çalılık';
    return hi + (p < 300 ? 'Çöl' : 'Çorak arazi');
  }

  stats(speed: number): GlobalStats {
    const s = this.s;
    const f = s.f;
    let tL = 0, aL = 0, tS = 0, aS = 0, p = 0, c = 0, rh = 0, at = 0, burning = 0;
    for (let y = 0; y < SIM_H; y++) {
      const a = SIM_GEOM.areaKm2[y];
      for (let x = 0; x < SIM_W; x++) {
        const i = y * SIM_W + x;
        if (f.landFrac[i] >= 0.5) {
          tL += f.temp[i] * a;
          aL += a;
          if (f.fire[i] > 0) burning++;
        } else {
          tS += Math.max(-1.9, f.temp[i]) * a;
          aS += a;
        }
        p += f.precipAnn[i] * a;
        c += f.cloud[i] * a;
        const ws = Math.max(0.5, Math.min(140, 2.2 * 6.112 * Math.exp((17.67 * f.temp[i]) / (f.temp[i] + 243.5))));
        rh += clamp(f.q[i] / ws, 0, 1) * a;
        at += a;
      }
    }
    const cs = this.coverStats();
    const totals = s.speciesPrevTotals;
    const settl = s.settlements;
    return {
      day: s.day,
      meanTemp: this.meanSurfaceTemp(),
      meanLandTemp: tL / Math.max(aL, 1),
      meanSeaTemp: tS / Math.max(aS, 1),
      co2ppm: s.co2ppm,
      forcing: totalForcing(s) - s.greenhouseBase,
      aerosol: s.aerosol,
      seaLevel: s.seaLevel,
      iceAreaPct: cs.icePct,
      seaIcePct: cs.seaIcePct,
      meanPrecip: p / at,
      meanCloud: c / at,
      meanHumidity: rh / at,
      forestPct: cs.forestPct,
      grassPct: cs.grassPct,
      desertPct: cs.desertPct,
      plantBiomassGt: cs.biomassGt,
      species: s.species.map((sp, k) => ({
        id: sp.id, name: sp.name, category: sp.category, count: totals[k] ?? 0, trend: s.speciesTrend[k] ?? 0,
        extinct: s.extinct[k], color: sp.color, custom: sp.custom,
      })),
      humans: totalHumans(s),
      settlements: settl.length,
      maxTech: settl.reduce((m, t) => Math.max(m, t.tech), 0),
      meanFood: settl.length ? settl.reduce((m, t) => m + t.food * t.pop, 0) / Math.max(1, totalHumans(s)) : 0,
      farmlandKm2: cs.farmKm2,
      burningCells: burning,
      activeEvents: s.events.length,
      simSpeedDaysPerSec: speed,
    };
  }
}

export { HR_N, HR_GEOM };
