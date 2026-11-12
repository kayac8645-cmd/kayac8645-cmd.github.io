import type { SerializedState } from '../core/state';
import type { CellInfo, DisasterEvent, GlobalStats, HistoryPoint, LogEntry, MapLayer, PlanetParams, SpeciesDef, ToolApply } from '../core/types';

export type ToWorker =
  | { type: 'generate'; params: PlanetParams }
  | { type: 'load'; data: SerializedState }
  | { type: 'setRunning'; running: boolean }
  | { type: 'setSpeed'; speed: number }
  | { type: 'setLayer'; layer: MapLayer }
  | { type: 'tool'; apply: ToolApply }
  | { type: 'addSpecies'; def: SpeciesDef; lat: number; lon: number }
  | { type: 'stopEvent'; id: number }
  | { type: 'resetEvents' }
  | { type: 'resetUserForcing' }
  | { type: 'setNatural'; on: boolean }
  | { type: 'query'; lat: number; lon: number; reqId: number }
  | { type: 'jump'; years: number }
  | { type: 'cancelJump' }
  | { type: 'serialize'; reqId: number }
  | { type: 'requestFrame' };

export interface SettlementLite {
  id: number;
  name: string;
  lat: number;
  lon: number;
  pop: number;
  tech: number;
}

export interface FramePayload {
  type: 'frame';
  surface: Uint8ClampedArray;
  clouds: Uint8ClampedArray;
  stats: GlobalStats;
  events: DisasterEvent[];
  settlements: SettlementLite[];
  tree: Float32Array;
  ice: Float32Array;
  seaLevel: number;
  logs: LogEntry[];
  history: HistoryPoint[] | null;
  running: boolean;
  layer: MapLayer;
}

export type FromWorker =
  | { type: 'progress'; msg: string; frac: number }
  | { type: 'ready'; params: PlanetParams; hrElev: Float32Array; seaLevel: number; log: LogEntry[]; history: HistoryPoint[]; day: number }
  | { type: 'terrain'; hrElev: Float32Array; seaLevel: number }
  | FramePayload
  | { type: 'cell'; reqId: number; info: CellInfo }
  | { type: 'serialized'; reqId: number; data: SerializedState }
  | { type: 'checkpoint'; data: SerializedState; day: number }
  | { type: 'jumpProgress'; frac: number; active: boolean; years: number }
  | { type: 'toast'; text: string; level?: 'info' | 'warn' }
  | { type: 'error'; message: string };
