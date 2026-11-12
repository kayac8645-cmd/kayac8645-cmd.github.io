import type { FromWorker, ToWorker, FramePayload } from '../worker/protocol';
import type { SerializedState } from '../core/state';
import type { CellInfo, MapLayer, PlanetParams, SpeciesDef, ToolApply } from '../core/types';
import { SPEEDS, useApp } from './store';
import * as db from '../persistence/db';
import { formatDate } from '../core/calendar';

type FrameListener = (f: FramePayload) => void;
type TerrainListener = (hr: Float32Array, sea: number, params?: PlanetParams) => void;

class SimClient {
  private worker: Worker;
  private frameListeners = new Set<FrameListener>();
  private terrainListeners = new Set<TerrainListener>();
  private reqId = 1;
  private pending = new Map<number, (v: unknown) => void>();
  private autosaveTimer = 0;
  lastTerrain: { hr: Float32Array; sea: number; params?: PlanetParams } | null = null;

  constructor() {
    this.worker = new Worker(new URL('../worker/sim.worker.ts', import.meta.url), { type: 'module' });
    this.worker.onmessage = (e: MessageEvent<FromWorker>) => this.onMessage(e.data);
    this.worker.onerror = (e) => useApp.getState().toast(`Simülasyon hatası: ${e.message}`, 'warn');
    this.autosaveTimer = window.setInterval(() => this.autosave(), 90_000);
  }

  private send(m: ToWorker, transfer: Transferable[] = []) {
    this.worker.postMessage(m, transfer);
  }

  onFrame(fn: FrameListener) {
    this.frameListeners.add(fn);
    return () => this.frameListeners.delete(fn);
  }
  onTerrain(fn: TerrainListener) {
    this.terrainListeners.add(fn);
    if (this.lastTerrain) fn(this.lastTerrain.hr, this.lastTerrain.sea, this.lastTerrain.params);
    return () => this.terrainListeners.delete(fn);
  }

  private onMessage(m: FromWorker) {
    const app = useApp.getState();
    switch (m.type) {
      case 'progress':
        app.set({ status: 'generating', progress: { msg: m.msg, frac: m.frac } });
        break;
      case 'ready':
        this.lastTerrain = { hr: m.hrElev, sea: m.seaLevel, params: m.params };
        this.terrainListeners.forEach((fn) => fn(m.hrElev, m.seaLevel, m.params));
        app.set({ status: 'ready', params: m.params, logs: m.log, history: m.history, selected: null, cell: null });
        this.send({ type: 'setSpeed', speed: SPEEDS[app.speedIdx] });
        this.send({ type: 'setLayer', layer: app.layer });
        this.send({ type: 'setNatural', on: app.settings.natural });
        this.send({ type: 'setRunning', running: app.running });
        break;
      case 'terrain':
        this.lastTerrain = { hr: m.hrElev, sea: m.seaLevel, params: this.lastTerrain?.params };
        this.terrainListeners.forEach((fn) => fn(m.hrElev, m.seaLevel));
        break;
      case 'frame': {
        this.frameListeners.forEach((fn) => fn(m));
        const patch: Partial<ReturnType<typeof useApp.getState>> = { stats: m.stats, events: m.events, settlements: m.settlements };
        if (m.history) patch.history = m.history;
        if (m.logs.length) {
          patch.logs = [...app.logs, ...m.logs].slice(-400);
          for (const l of m.logs) if (l.kind === 'extinction' || l.kind === 'species') app.toast(l.text, l.kind === 'extinction' ? 'warn' : 'info');
        }
        app.set(patch);
        break;
      }
      case 'cell':
      case 'serialized': {
        const fn = this.pending.get(m.reqId);
        this.pending.delete(m.reqId);
        fn?.(m.type === 'cell' ? m.info : m.data);
        break;
      }
      case 'checkpoint':
        this.storeCheckpoint(m.data, m.day);
        break;
      case 'jumpProgress':
        app.set({ jump: { active: m.active, frac: m.frac, years: m.years } });
        break;
      case 'toast':
        app.toast(m.text, m.level);
        break;
      case 'error':
        app.toast(`Hata: ${m.message}`, 'warn');
        break;
    }
  }

  generate(params: PlanetParams) {
    useApp.getState().set({ status: 'generating', progress: { msg: 'Gezegen oluşturuluyor', frac: 0 }, params, stats: null });
    this.send({ type: 'generate', params });
  }
  load(data: SerializedState) {
    useApp.getState().set({ status: 'generating', progress: { msg: 'Kayıt yükleniyor', frac: 0.5 } });
    this.send({ type: 'load', data });
  }
  setRunning(running: boolean) {
    useApp.getState().set({ running });
    this.send({ type: 'setRunning', running });
  }
  setSpeedIdx(i: number) {
    useApp.getState().set({ speedIdx: i });
    this.send({ type: 'setSpeed', speed: SPEEDS[i] });
  }
  setLayer(layer: MapLayer) {
    useApp.getState().set({ layer });
    this.send({ type: 'setLayer', layer });
  }
  applyTool(apply: ToolApply) {
    this.send({ type: 'tool', apply });
  }
  addSpecies(def: SpeciesDef, lat: number, lon: number) {
    this.send({ type: 'addSpecies', def, lat, lon });
  }
  stopEvent(id: number) {
    this.send({ type: 'stopEvent', id });
  }
  resetEvents() {
    this.send({ type: 'resetEvents' });
  }
  resetUserForcing() {
    this.send({ type: 'resetUserForcing' });
  }
  setNatural(on: boolean) {
    this.send({ type: 'setNatural', on });
  }
  jump(years: number) {
    this.send({ type: 'jump', years });
  }
  cancelJump() {
    this.send({ type: 'cancelJump' });
  }
  requestFrame() {
    this.send({ type: 'requestFrame' });
  }
  query(lat: number, lon: number): Promise<CellInfo> {
    const reqId = this.reqId++;
    return new Promise((res) => {
      this.pending.set(reqId, res as (v: unknown) => void);
      this.send({ type: 'query', lat, lon, reqId });
    });
  }
  serialize(): Promise<SerializedState> {
    const reqId = this.reqId++;
    return new Promise((res) => {
      this.pending.set(reqId, res as (v: unknown) => void);
      this.send({ type: 'serialize', reqId });
    });
  }

  private meta(id: string, name: string, kind: db.SaveKind, data: SerializedState): db.SaveMeta {
    const st = useApp.getState().stats;
    const p = data.meta.params;
    return {
      id, name, kind, createdAt: Date.now(), day: data.meta.day, planetName: p.name, seed: p.seed,
      summary: { temp: st?.meanTemp ?? 0, humans: st?.humans ?? 0, species: st?.species.filter((s) => !s.extinct).length ?? 0 },
    };
  }

  async save(name: string) {
    const data = await this.serialize();
    const id = `save-${Date.now()}`;
    await db.putSave(this.meta(id, name || `${data.meta.params.name} · ${formatDate(data.meta.day)}`, 'manual', data), data);
    useApp.getState().set({ lastSavedAt: Date.now() });
    await this.refreshSaves();
    useApp.getState().toast('Gezegen kaydedildi');
  }

  async autosave() {
    const app = useApp.getState();
    if (app.status !== 'ready' || !app.settings.autosave || app.jump.active) return;
    try {
      const data = await this.serialize();
      await db.putSave(this.meta('autosave', `Otomatik kayıt · ${data.meta.params.name}`, 'auto', data), data);
      useApp.getState().set({ lastSavedAt: Date.now() });
    } catch (e) {
      console.warn('autosave failed', e);
    }
  }

  private async storeCheckpoint(data: SerializedState, day: number) {
    try {
      const p = data.meta.params;
      await db.putSave(this.meta(`cp-${p.seed}-${Math.round(day)}`, `Kayıt noktası · ${formatDate(day)}`, 'checkpoint', data), data);
      await db.pruneCheckpoints(8, p.seed);
      await this.refreshSaves();
    } catch (e) {
      console.warn('checkpoint failed', e);
    }
  }

  async loadSaved(id: string) {
    const data = await db.loadSave(id);
    if (!data) return useApp.getState().toast('Kayıt bulunamadı', 'warn');
    this.load(data);
  }

  async refreshSaves() {
    useApp.getState().set({ saves: await db.listSaves() });
  }

  dispose() {
    clearInterval(this.autosaveTimer);
    this.worker.terminate();
  }
}

export const sim = new SimClient();
// debugging / automated-test hook
(globalThis as unknown as { __sim: SimClient }).__sim = sim;
