// Zustand store. The GameState object is mutated in place by the engine for
// performance; `rev` is bumped whenever UI should re-render.
import { create } from 'zustand';
import type { GameState, Speed, ActionResult } from '../engine/types';

export type Screen =
  | 'overview' | 'companies' | 'sectors' | 'production' | 'supply' | 'products' | 'research'
  | 'world' | 'finance' | 'market' | 'rivals' | 'hr' | 'news' | 'settings';

interface Toast { id: number; text: string; kind: 'ok' | 'error' | 'info' }

interface StoreState {
  game: GameState | null;
  rev: number;
  screen: Screen;
  /** company focused in detail views (Companies/Production/Products/HR…) */
  selectedCompanyId: string | null;
  toasts: Toast[];
  fps: number;
  setGame: (g: GameState | null) => void;
  bump: () => void;
  setScreen: (s: Screen) => void;
  selectCompany: (id: string | null) => void;
  setSpeed: (s: Speed) => void;
  toast: (text: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;
  /** Run a mutating action against the live game, bump rev, toast on error. */
  run: (fn: (g: GameState) => ActionResult, okMsg?: string) => ActionResult;
}

let toastId = 1;
export const useStore = create<StoreState>((set, get) => ({
  game: null, rev: 0, screen: 'overview', selectedCompanyId: null, toasts: [], fps: 0,
  setGame: (g) => set({ game: g, rev: get().rev + 1, selectedCompanyId: null }),
  bump: () => set({ rev: get().rev + 1 }),
  setScreen: (screen) => set({ screen }),
  selectCompany: (selectedCompanyId) => set({ selectedCompanyId }),
  setSpeed: (speed) => { const g = get().game; if (g) { g.speed = speed; set({ rev: get().rev + 1 }); } },
  toast: (text, kind = 'info') => {
    const id = toastId++;
    set({ toasts: [...get().toasts, { id, text, kind }].slice(-5) });
    setTimeout(() => get().dismissToast(id), 4000);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  run: (fn, okMsg) => {
    const g = get().game;
    if (!g) return { ok: false, error: 'Oyun yok' };
    let r: ActionResult;
    try { r = fn(g); } catch (e) { r = { ok: false, error: e instanceof Error ? e.message : String(e) }; }
    set({ rev: get().rev + 1 });
    if (!r.ok) get().toast(r.error ?? 'İşlem başarısız', 'error');
    else if (okMsg) get().toast(okMsg, 'ok');
    return r;
  },
}));

/** Subscribe to the live game; component re-renders on every rev bump. */
export function useGame(): GameState {
  useStore((s) => s.rev);
  const g = useStore((s) => s.game);
  if (!g) throw new Error('useGame called without active game');
  return g;
}
