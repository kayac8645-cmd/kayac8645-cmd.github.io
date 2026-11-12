import { create } from 'zustand';
import type { CellInfo, DisasterEvent, DisasterType, GlobalStats, HistoryPoint, LogEntry, MapLayer, PlanetParams, ToolId } from '../core/types';
import { DEFAULT_PARAMS, DISASTER_INFO } from '../core/types';
import type { SettlementLite } from '../worker/protocol';
import type { SaveMeta } from '../persistence/db';
import type { Quality } from '../engine/PlanetRenderer';

export const SPEEDS = [1, 5, 10, 50, 100, 1000];
export type Dialog = null | 'new' | 'saves' | 'settings' | 'about';
export interface Toast { id: number; text: string; level: 'info' | 'warn' }

export interface AppState {
  status: 'booting' | 'generating' | 'ready';
  progress: { msg: string; frac: number };
  params: PlanetParams;
  stats: GlobalStats | null;
  history: HistoryPoint[];
  logs: LogEntry[];
  events: DisasterEvent[];
  settlements: SettlementLite[];
  running: boolean;
  speedIdx: number;
  layer: MapLayer;
  tool: ToolId;
  brushKm: number;
  strength: number;
  speciesId: string;
  disaster: { type: DisasterType; intensity: number; radiusKm: number; durationDays: number };
  selected: { lat: number; lon: number } | null;
  cell: CellInfo | null;
  cameraMode: 'space' | 'surface';
  dialog: Dialog;
  mobilePanel: null | 'left' | 'right';
  toasts: Toast[];
  jump: { active: boolean; frac: number; years: number };
  settings: { quality: Quality; exaggeration: number; clouds: boolean; natural: boolean; autosave: boolean };
  saves: SaveMeta[];
  fps: number;
  lastSavedAt: number | null;
  set: (p: Partial<AppState>) => void;
  toast: (text: string, level?: 'info' | 'warn') => void;
}

let toastId = 1;
function initialQuality(): Quality {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('quality') : null;
  if (q === 'low' || q === 'medium' || q === 'high') return q;
  const mobile = typeof window !== 'undefined' && (window.matchMedia?.('(max-width: 900px)').matches || /Mobi|Android/i.test(navigator.userAgent));
  return mobile ? 'medium' : 'high';
}

export const useApp = create<AppState>((set, get) => ({
  status: 'booting',
  progress: { msg: 'Başlatılıyor', frac: 0 },
  params: { ...DEFAULT_PARAMS },
  stats: null,
  history: [],
  logs: [],
  events: [],
  settlements: [],
  running: false,
  speedIdx: 2,
  layer: 'normal',
  tool: 'inspect',
  brushKm: 400,
  strength: 0.6,
  speciesId: 'grazer',
  disaster: { type: 'volcano', intensity: 0.6, radiusKm: DISASTER_INFO.volcano.defaultRadius, durationDays: DISASTER_INFO.volcano.defaultDuration },
  selected: null,
  cell: null,
  cameraMode: 'space',
  dialog: null,
  mobilePanel: null,
  toasts: [],
  jump: { active: false, frac: 0, years: 0 },
  settings: { quality: initialQuality(), exaggeration: 20, clouds: true, natural: true, autosave: true },
  saves: [],
  fps: 0,
  lastSavedAt: null,
  set: (p) => set(p),
  toast: (text, level = 'info') => {
    const t = { id: toastId++, text, level };
    set({ toasts: [...get().toasts.slice(-3), t] });
    setTimeout(() => set({ toasts: get().toasts.filter((x) => x.id !== t.id) }), 3800);
  },
}));
