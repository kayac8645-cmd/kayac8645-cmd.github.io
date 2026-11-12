// Real-time loop: fixed-step simulation decoupled from render FPS.
// At speed N the simulation advances N game days per real second. Rendering
// is driven by zustand `rev` bumps, throttled to at most 10 per second.
// This is the only engine module that touches the browser (RAF, visibility).
import { useStore } from '../store/gameStore';
import { step } from './sim';
import { netWorth } from './selectors';
import { saveGame } from '../save/storage';
import type { GameState } from './types';

const MAX_STEPS_PER_FRAME = 8;
const UI_BUMP_INTERVAL_MS = 100; // ≤ 10 UI bumps / sec
const FPS_PUBLISH_INTERVAL_MS = 500; // ≤ 2 fps updates / sec
/** A frame gap longer than this (tab hidden, debugger) drops the backlog instead of catching up. */
const MAX_FRAME_GAP_MS = 1000;

let rafId: number | null = null;
let running = false;
let lastFrame = 0;
let accumulator = 0; // in game days
let fpsEma = 60;
let lastFpsPublish = 0;
let lastBump = 0;
let pendingBump = false;
let tickMsEma = 0;
let saving = false;

/** Day of the last autosave, tracked per game object (new/loaded game resets it). */
const lastAutosaveDay = new WeakMap<GameState, number>();

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function autosaveDue(g: GameState): boolean {
  if (!g.settings?.autosave) return false;
  const last = lastAutosaveDay.get(g);
  if (last === undefined) { lastAutosaveDay.set(g, g.day); return false; }
  const interval = Math.max(1, g.settings.autosaveIntervalDays || 30);
  return g.day - last >= interval;
}

function doSave(g: GameState, quiet: boolean): void {
  if (saving) return;
  saving = true;
  lastAutosaveDay.set(g, g.day);
  let nw = 0;
  try { nw = netWorth(g, g.playerHoldingId); } catch { /* keep 0 */ }
  saveGame(g, 'auto', nw)
    .catch((e: unknown) => {
      if (!quiet) useStore.getState().toast(`Otomatik kayıt başarısız: ${e instanceof Error ? e.message : String(e)}`, 'error');
    })
    .finally(() => { saving = false; });
}

function frame(t: number): void {
  if (!running) return;
  rafId = requestAnimationFrame(frame);

  let dt = t - lastFrame;
  lastFrame = t;
  if (dt < 0) dt = 0;

  // Render FPS (exponential moving average)
  if (dt > 0 && dt < MAX_FRAME_GAP_MS) fpsEma = fpsEma * 0.9 + (1000 / dt) * 0.1;
  const store = useStore.getState();
  if (t - lastFpsPublish >= FPS_PUBLISH_INTERVAL_MS) {
    lastFpsPublish = t;
    const fps = Math.round(fpsEma);
    if (fps !== store.fps) useStore.setState({ fps });
  }

  const g = store.game;
  if (!g) { accumulator = 0; return; }

  const speed = g.speed;
  if (speed > 0) {
    if (dt > MAX_FRAME_GAP_MS) dt = 0; // came back from background: drop backlog
    accumulator += (dt / 1000) * speed;
    let steps = 0;
    const t0 = now();
    while (accumulator >= 1 && steps < MAX_STEPS_PER_FRAME) {
      try {
        step(g);
      } catch (e) {
        // Never let a sim exception kill the loop; pause and inform the player.
        console.error('Simülasyon hatası', e);
        g.speed = 0;
        accumulator = 0;
        store.toast(`Simülasyon hatası: ${e instanceof Error ? e.message : String(e)} — oyun duraklatıldı.`, 'error');
        pendingBump = true;
        break;
      }
      accumulator -= 1;
      steps++;
    }
    if (steps >= MAX_STEPS_PER_FRAME && accumulator > 1) accumulator = Math.min(accumulator, 1); // can't keep up → drop backlog
    if (steps > 0) {
      const per = (now() - t0) / steps;
      tickMsEma = tickMsEma === 0 ? per : tickMsEma * 0.9 + per * 0.1;
      if (g.stats) g.stats.tickMs = Math.round(tickMsEma * 1000) / 1000;
      pendingBump = true;
      if (autosaveDue(g)) doSave(g, false);
    }
  } else {
    accumulator = 0; // paused: no sim time accrues
  }

  if (pendingBump && t - lastBump >= UI_BUMP_INTERVAL_MS) {
    lastBump = t;
    pendingBump = false;
    store.bump();
  }
}

function saveNow(): void {
  const g = useStore.getState().game;
  if (g && g.settings?.autosave) doSave(g, true);
}
function onVisibility(): void {
  if (document.visibilityState === 'hidden') saveNow();
  else lastFrame = now(); // resume without catching up hidden time
}
function onBeforeUnload(): void { saveNow(); }

/** Starts RAF loop driving useStore().game according to game.speed; autosaves. Idempotent. */
export function startLoop(): void {
  if (running) return;
  if (typeof requestAnimationFrame === 'undefined') return; // non-browser (tests)
  running = true;
  lastFrame = now();
  lastFpsPublish = lastFrame;
  lastBump = 0;
  accumulator = 0;
  const g = useStore.getState().game;
  if (g && !lastAutosaveDay.has(g)) lastAutosaveDay.set(g, g.day);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
  if (typeof window !== 'undefined') window.addEventListener('beforeunload', onBeforeUnload);
  rafId = requestAnimationFrame(frame);
}

export function stopLoop(): void {
  if (!running) return;
  running = false;
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
  if (typeof window !== 'undefined') window.removeEventListener('beforeunload', onBeforeUnload);
  if (pendingBump) { pendingBump = false; useStore.getState().bump(); }
}
