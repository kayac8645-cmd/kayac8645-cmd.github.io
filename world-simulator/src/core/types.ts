/** Shared data models for the simulation core, worker protocol and UI. */

export interface PlanetParams {
  seed: string;
  name: string;
  landRatio: number; // 0.1..0.7 fraction of surface that is land
  mountainDensity: number; // 0..1
  oceanDepth: number; // metres (mean abyssal depth), 2000..7000
  forestDensity: number; // 0..1 initial forest seeding
  iceAmount: number; // 0..1 initial glaciation
  baseTemperature: number; // target global mean °C, -10..35
  atmosphereDensity: number; // 0.3..3 (1 = Earth-like)
}

export const DEFAULT_PARAMS: PlanetParams = {
  seed: '1337',
  name: 'Gaia',
  landRatio: 0.32,
  mountainDensity: 0.5,
  oceanDepth: 4000,
  forestDensity: 0.6,
  iceAmount: 0.4,
  baseTemperature: 14,
  atmosphereDensity: 1,
};

export type SpeciesCategory = 'herbivore' | 'carnivore' | 'bird' | 'fish' | 'insect' | 'microbe';
export type Habitat = 'land' | 'ocean';
/** Food sources a consumer can use. Plant sources are vegetation fields; others are species categories. */
export type FoodSource = 'grass' | 'shrub' | 'tree' | 'plankton' | 'detritus' | SpeciesCategory;

export interface SpeciesDef {
  id: string;
  name: string;
  category: SpeciesCategory;
  habitat: Habitat;
  diet: Partial<Record<FoodSource, number>>; // preference weights
  massKg: number; // adult body mass
  lifespanYr: number;
  reproRate: number; // max per-capita births per year
  tempMin: number; // °C tolerated (surface temperature)
  tempMax: number;
  waterNeed: number; // 0..1 required soil moisture index (land only)
  dispersal: number; // 0..1 fraction exchanged with neighbours per year
  custom?: boolean;
  color: string;
}

export interface Settlement {
  id: number;
  name: string;
  lat: number;
  lon: number;
  cell: number;
  pop: number;
  tech: number; // 0..10 continuous
  food: number; // last food ratio (production / need)
  water: number; // last water index 0..1
  energy: number; // per-capita energy use (relative units)
  wealth: number;
  farmKm2: number;
  founded: number; // sim day
  health: number; // 0..1 (epidemic pressure)
}

export type DisasterType =
  | 'volcano' | 'earthquake' | 'tsunami' | 'hurricane' | 'tornado' | 'wildfire' | 'flood' | 'drought'
  | 'coldwave' | 'heatwave' | 'asteroid' | 'meteorShower' | 'iceAge' | 'superstorm' | 'climateChange' | 'epidemic';

export interface DisasterEvent {
  id: number;
  type: DisasterType;
  lat: number;
  lon: number;
  radiusKm: number;
  intensity: number; // 0.1..1
  durationDays: number;
  elapsedDays: number;
  startDay: number;
  heading?: number; // degrees, for moving storms
  data?: Record<string, number>;
}

export interface LogEntry {
  day: number;
  kind: 'disaster' | 'extinction' | 'settlement' | 'civ' | 'climate' | 'user' | 'species';
  text: string;
  lat?: number;
  lon?: number;
}

export type MapLayer =
  | 'normal' | 'temperature' | 'precipitation' | 'elevation' | 'vegetation' | 'population' | 'animals' | 'disaster' | 'water';

export type ToolId =
  | 'inspect' | 'heat' | 'cool' | 'rain' | 'dry' | 'grass' | 'forest' | 'lake' | 'raise' | 'lower'
  | 'animals' | 'settlement' | 'disaster';

export interface ToolApply {
  tool: ToolId;
  lat: number;
  lon: number;
  radiusKm: number;
  strength: number; // 0..1
  speciesId?: string;
  disaster?: { type: DisasterType; intensity: number; radiusKm: number; durationDays: number };
}

export interface SpeciesStat {
  id: string;
  name: string;
  category: SpeciesCategory;
  count: number; // individuals (microbes: biomass tonnes)
  trend: number; // relative change per year
  extinct: boolean;
  color: string;
  custom?: boolean;
}

export interface GlobalStats {
  day: number;
  meanTemp: number;
  meanLandTemp: number;
  meanSeaTemp: number;
  co2ppm: number;
  forcing: number; // W/m2 greenhouse forcing relative to base
  aerosol: number; // optical depth
  seaLevel: number; // m relative to start
  iceAreaPct: number; // land ice + sea ice coverage of surface, %
  seaIcePct: number;
  meanPrecip: number; // mm/yr
  meanCloud: number; // 0..1
  meanHumidity: number; // RH 0..1
  forestPct: number; // of land
  grassPct: number;
  desertPct: number;
  plantBiomassGt: number;
  species: SpeciesStat[];
  humans: number;
  settlements: number;
  maxTech: number;
  meanFood: number;
  farmlandKm2: number;
  burningCells: number;
  activeEvents: number;
  simSpeedDaysPerSec: number;
}

export interface HistoryPoint {
  day: number;
  temp: number;
  co2: number;
  humans: number;
  herb: number;
  carn: number;
  forest: number;
  ice: number;
}

export interface CellInfo {
  lat: number;
  lon: number;
  cell: number;
  region: string;
  isLand: boolean;
  elevation: number; // m above current sea level
  temp: number;
  tempAnnual: number;
  seaTemp: number | null;
  humidity: number; // RH 0..1
  precipAnnual: number; // mm/yr
  precipNow: number; // mm/day
  pressure: number; // hPa surface
  windSpeed: number;
  windDir: number; // degrees, direction wind blows towards
  cloud: number;
  snowMm: number;
  iceM: number;
  soilWater: number;
  waterIndex: number;
  biome: string;
  grass: number;
  shrub: number;
  tree: number;
  farm: number;
  fire: number;
  animals: { id: string; name: string; count: number }[];
  animalTotal: number;
  humans: number;
  settlement: string | null;
  ecoStatus: string;
  events: string[];
}

export const DISASTER_INFO: Record<DisasterType, { label: string; defaultRadius: number; defaultDuration: number; global?: boolean; icon: string }> = {
  volcano: { label: 'Volkanik patlama', defaultRadius: 300, defaultDuration: 60, icon: '🌋' },
  earthquake: { label: 'Deprem', defaultRadius: 400, defaultDuration: 3, icon: '〰' },
  tsunami: { label: 'Tsunami', defaultRadius: 900, defaultDuration: 4, icon: '🌊' },
  hurricane: { label: 'Kasırga', defaultRadius: 500, defaultDuration: 12, icon: '🌀' },
  tornado: { label: 'Hortum', defaultRadius: 80, defaultDuration: 2, icon: '🌪' },
  wildfire: { label: 'Orman yangını', defaultRadius: 250, defaultDuration: 30, icon: '🔥' },
  flood: { label: 'Sel', defaultRadius: 350, defaultDuration: 20, icon: '💧' },
  drought: { label: 'Kuraklık', defaultRadius: 1200, defaultDuration: 540, icon: '☀' },
  coldwave: { label: 'Aşırı soğuma', defaultRadius: 1500, defaultDuration: 60, icon: '❄' },
  heatwave: { label: 'Aşırı sıcaklık', defaultRadius: 1500, defaultDuration: 45, icon: '♨' },
  asteroid: { label: 'Asteroit çarpması', defaultRadius: 900, defaultDuration: 1500, icon: '☄' },
  meteorShower: { label: 'Meteor yağmuru', defaultRadius: 2000, defaultDuration: 10, icon: '✦' },
  iceAge: { label: 'Buzul çağı', defaultRadius: 0, defaultDuration: 365 * 400, global: true, icon: '🧊' },
  superstorm: { label: 'Büyük fırtına', defaultRadius: 1400, defaultDuration: 8, icon: '⛈' },
  climateChange: { label: 'Küresel iklim değişimi', defaultRadius: 0, defaultDuration: 365 * 200, global: true, icon: '🌡' },
  epidemic: { label: 'Salgın', defaultRadius: 1500, defaultDuration: 365, icon: '☣' },
};

export const LAYER_LABELS: Record<MapLayer, string> = {
  normal: 'Normal',
  temperature: 'Sıcaklık',
  precipitation: 'Yağış',
  elevation: 'Yükseklik',
  vegetation: 'Bitki örtüsü',
  population: 'Nüfus',
  animals: 'Hayvan yoğunluğu',
  disaster: 'Felaket',
  water: 'Su kaynakları',
};
