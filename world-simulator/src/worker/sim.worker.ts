/// <reference lib="webworker" />
import { Simulation } from '../core/simulation';
import { Painter } from '../core/paint';
import { HR_N } from '../core/grid';
import type { MapLayer } from '../core/types';
import type { FromWorker, ToWorker } from './protocol';

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const post = (m: FromWorker, transfer: Transferable[] = []) => ctx.postMessage(m, transfer);

let sim: Simulation | null = null;
const painter = new Painter();
let running = false;
let speed = 1; // simulated days per real second
let layer: MapLayer = 'normal';
let dirty = true;
let lastTick = performance.now();
let lastFrame = 0;
let acc = 0;
let lastTerrainVersion = -1;
let speedWindow = { t: performance.now(), days: 0, value: 0 };
let lastHistoryLen = -1;
let jump: { years: number; done: number; dt: number } | null = null;
const CHECKPOINT_YEARS = 25;

function sendTerrain() {
  if (!sim) return;
  lastTerrainVersion = sim.terrainVersion;
  painter.computeShade(sim.s);
  const copy = sim.s.hrElev.slice();
  post({ type: 'terrain', hrElev: copy, seaLevel: sim.s.seaLevel }, [copy.buffer]);
}

function sendFrame() {
  if (!sim) return;
  const s = sim.s;
  const surface = new Uint8ClampedArray(HR_N * 4);
  const clouds = new Uint8ClampedArray(HR_N * 4);
  painter.paintSurface(s, sim.hydro, layer, surface);
  painter.paintClouds(s, clouds, performance.now() / 1000);
  const tree = s.f.tree.slice();
  const ice = s.f.ice.slice();
  const logs = sim.newLogs;
  sim.newLogs = [];
  const history = s.history.length !== lastHistoryLen ? s.history.slice() : null;
  lastHistoryLen = s.history.length;
  post(
    {
      type: 'frame',
      surface,
      clouds,
      stats: sim.stats(speedWindow.value),
      events: s.events.map((e) => ({ ...e, data: undefined })),
      settlements: s.settlements.map((t) => ({ id: t.id, name: t.name, lat: t.lat, lon: t.lon, pop: t.pop, tech: t.tech })),
      tree,
      ice,
      seaLevel: s.seaLevel,
      logs,
      history,
      running,
      layer,
    },
    [surface.buffer, clouds.buffer, tree.buffer, ice.buffer],
  );
  lastFrame = performance.now();
  dirty = false;
}

function maybeCheckpoint() {
  if (!sim) return;
  const s = sim.s;
  if (s.day - s.lastCheckpointDay >= CHECKPOINT_YEARS * 365) {
    s.lastCheckpointDay = s.day;
    post({ type: 'checkpoint', data: sim.serialize(), day: s.day });
  }
}

function tick() {
  const now = performance.now();
  const elapsed = Math.min(0.25, (now - lastTick) / 1000);
  lastTick = now;
  if (!sim) return;
  if (jump) {
    const t0 = performance.now();
    while (jump.done < jump.years && performance.now() - t0 < 60) {
      const dt = Math.min(jump.dt, jump.years - jump.done);
      if (dt >= 1) sim.stepGeo(dt);
      else sim.step(dt * 365);
      jump.done += dt;
    }
    const finished = jump.done >= jump.years - 1e-9;
    post({ type: 'jumpProgress', frac: jump.done / jump.years, active: !finished, years: jump.years });
    if (finished) {
      post({ type: 'toast', text: `${jump.years.toLocaleString('tr-TR')} yıl ilerletildi` });
      jump = null;
      sim.s.lastCheckpointDay = -1e9;
      maybeCheckpoint();
    }
    dirty = true;
  } else if (running) {
    acc += elapsed * speed;
    const dtMax = speed >= 500 ? 30 : speed >= 50 ? 10 : 2;
    const minStep = Math.min(0.25, dtMax);
    const t0 = performance.now();
    let simulated = 0;
    while (acc >= minStep && performance.now() - t0 < 38) {
      const dt = Math.min(acc, dtMax);
      sim.step(dt);
      acc -= dt;
      simulated += dt;
    }
    if (acc > dtMax * 3) acc = dtMax * 3; // drop backlog: device too slow for requested speed
    speedWindow.days += simulated;
    if (simulated > 0) dirty = true;
    maybeCheckpoint();
  }
  if (now - speedWindow.t > 1000) {
    speedWindow.value = running && !jump ? speedWindow.days / ((now - speedWindow.t) / 1000) : 0;
    speedWindow = { t: now, days: 0, value: speedWindow.value };
  }
  if (sim.terrainVersion !== lastTerrainVersion) sendTerrain();
  if (dirty && now - lastFrame > (running ? 220 : 60)) sendFrame();
}

setInterval(tick, 50);

function onReady() {
  if (!sim) return;
  painter.prepareStatic(sim.s);
  lastTerrainVersion = sim.terrainVersion;
  lastHistoryLen = -1;
  acc = 0;
  const copy = sim.s.hrElev.slice();
  post({ type: 'ready', params: sim.s.params, hrElev: copy, seaLevel: sim.s.seaLevel, log: sim.s.log.slice(), history: sim.s.history.slice(), day: sim.s.day }, [copy.buffer]);
  sim.newLogs = [];
  dirty = true;
  sendFrame();
}

ctx.onmessage = (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  try {
    switch (m.type) {
      case 'generate':
        jump = null;
        sim = Simulation.generate(m.params, (msg, frac) => post({ type: 'progress', msg, frac }));
        onReady();
        break;
      case 'load':
        jump = null;
        sim = Simulation.fromSerialized(m.data);
        onReady();
        break;
      case 'setRunning':
        running = m.running;
        dirty = true;
        break;
      case 'setSpeed':
        speed = m.speed;
        acc = 0;
        break;
      case 'setLayer':
        layer = m.layer;
        dirty = true;
        lastFrame = 0;
        break;
      case 'tool': {
        if (!sim) return;
        const msg = sim.applyTool(m.apply);
        if (msg) post({ type: 'toast', text: msg });
        dirty = true;
        lastFrame = 0;
        break;
      }
      case 'addSpecies': {
        if (!sim) return;
        post({ type: 'toast', text: sim.addSpecies(m.def, m.lat, m.lon) });
        dirty = true;
        break;
      }
      case 'stopEvent':
        sim?.stopEvent(m.id);
        dirty = true;
        break;
      case 'resetEvents':
        sim?.resetEvents();
        dirty = true;
        break;
      case 'resetUserForcing':
        sim?.resetUserForcing();
        dirty = true;
        break;
      case 'setNatural':
        if (sim) sim.s.naturalEvents = m.on;
        break;
      case 'query':
        if (sim) post({ type: 'cell', reqId: m.reqId, info: sim.queryCell(m.lat, m.lon) });
        break;
      case 'jump': {
        if (!sim) return;
        const y = m.years;
        const dt = y <= 10 ? 1 : y <= 100 ? 2 : y <= 1000 ? 20 : y / 100;
        jump = { years: y, done: 0, dt };
        post({ type: 'jumpProgress', frac: 0, active: true, years: y });
        break;
      }
      case 'cancelJump':
        if (jump) post({ type: 'toast', text: `Zaman sıçraması durduruldu (${Math.round(jump.done).toLocaleString('tr-TR')} yıl işlendi)` });
        jump = null;
        post({ type: 'jumpProgress', frac: 1, active: false, years: 0 });
        break;
      case 'serialize':
        if (sim) post({ type: 'serialized', reqId: m.reqId, data: sim.serialize() });
        break;
      case 'requestFrame':
        dirty = true;
        lastFrame = 0;
        break;
    }
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? `${err.message}` : String(err) });
    console.error(err);
  }
};

