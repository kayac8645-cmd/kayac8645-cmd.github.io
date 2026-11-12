import { HR_N, SIM_N } from './grid';
import type { DisasterEvent, HistoryPoint, LogEntry, PlanetParams, Settlement, SpeciesDef } from './types';

/** Names of per-cell Float32 fields on the simulation grid. Order matters only for serialization. */
export const SIM_FIELDS = [
  'elev', 'landFrac', 'T0', 'temp', 'tempAnn', 'tempAmp', 'precip', 'precipAnn', 'q', 'cloud', 'pressure',
  'windU', 'windV', 'soilW', 'snow', 'ice', 'seaIce', 'evap', 'runoffAnn', 'riverIdx', 'lakeFrac',
  'grass', 'shrub', 'tree', 'farm', 'fire', 'burnScar', 'smoke', 'damage', 'humans',
  'userTemp', 'userPrecip', 'eventTemp', 'eventPrecip', 'eventWind', 'bioEma',
] as const;
export type SimField = (typeof SIM_FIELDS)[number];

export interface Region {
  id: number;
  name: string;
  ocean: boolean;
  cells: number;
}

export interface SimState {
  version: number;
  params: PlanetParams;
  day: number;
  rngState: number;
  seaLevel: number;
  co2ppm: number;
  aerosol: number;
  greenhouseBase: number;
  eventForcing: number;
  iceVolume0: number;
  meanT0: number;
  nextEventId: number;
  nextSettlementId: number;
  naturalEvents: boolean;
  hrElev: Float32Array;
  f: Record<SimField, Float32Array>;
  region: Int16Array;
  regions: Region[];
  species: SpeciesDef[];
  bio: Float32Array[]; // per species biomass kg/km2
  extinct: boolean[];
  speciesPrevTotals: number[];
  speciesTrend: number[];
  settlements: Settlement[];
  events: DisasterEvent[];
  log: LogEntry[];
  history: HistoryPoint[];
  lastHistoryDay: number;
  lastCheckpointDay: number;
}

export function allocFields(): Record<SimField, Float32Array> {
  const f = {} as Record<SimField, Float32Array>;
  for (const k of SIM_FIELDS) f[k] = new Float32Array(SIM_N);
  f.userPrecip.fill(1);
  f.eventPrecip.fill(1);
  return f;
}

export function newHrElev(): Float32Array {
  return new Float32Array(HR_N);
}

/** Plain-object snapshot suitable for structured clone / IndexedDB. */
export interface SerializedState {
  version: number;
  meta: Omit<SimState, 'hrElev' | 'f' | 'region' | 'bio'>;
  hrElev: Float32Array;
  fields: Record<string, Float32Array>;
  region: Int16Array;
  bio: Float32Array[];
}

export function serialize(s: SimState): SerializedState {
  const { hrElev, f, region, bio, ...meta } = s;
  const fields: Record<string, Float32Array> = {};
  for (const k of SIM_FIELDS) fields[k] = f[k].slice();
  return {
    version: s.version,
    meta: JSON.parse(JSON.stringify(meta)),
    hrElev: hrElev.slice(),
    fields,
    region: region.slice(),
    bio: bio.map((b) => b.slice()),
  };
}

export function deserialize(d: SerializedState): SimState {
  const f = allocFields();
  for (const k of SIM_FIELDS) if (d.fields[k]) f[k].set(d.fields[k]);
  return {
    ...(d.meta as SimState),
    hrElev: Float32Array.from(d.hrElev),
    f,
    region: Int16Array.from(d.region),
    bio: d.bio.map((b) => Float32Array.from(b)),
  };
}
