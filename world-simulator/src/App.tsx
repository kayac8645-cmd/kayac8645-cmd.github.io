import { useEffect } from 'react';
import { PlanetView } from './ui/PlanetView';
import { TopBar, LayerBar } from './ui/TopBar';
import { LeftPanel } from './ui/LeftPanel';
import { RightPanel } from './ui/RightPanel';
import { BottomBar } from './ui/BottomBar';
import { RegionCard, CameraButtons } from './ui/RegionCard';
import { Dialogs } from './ui/Dialogs';
import { useApp } from './state/store';
import { sim } from './state/simClient';
import { DEFAULT_PARAMS } from './core/types';

function Loading() {
  const status = useApp((s) => s.status);
  const progress = useApp((s) => s.progress);
  if (status === 'ready') return null;
  return (
    <div className="loading" data-testid="loading">
      <div className="loading-box">
        <div className="spinner" />
        <div>{progress.msg}</div>
        <progress max={1} value={progress.frac} />
      </div>
    </div>
  );
}

function Toasts() {
  const toasts = useApp((s) => s.toasts);
  return (
    <div className="toasts">
      {toasts.map((t) => <div key={t.id} className={`toast ${t.level}`}>{t.text}</div>)}
    </div>
  );
}

let booted = false;

export function App() {
  const mobilePanel = useApp((s) => s.mobilePanel);
  useEffect(() => {
    if (booted) return;
    booted = true;
    sim.refreshSaves().catch(() => {});
    const url = new URL(location.href);
    const seed = url.searchParams.get('seed');
    sim.generate({ ...DEFAULT_PARAMS, seed: seed ?? DEFAULT_PARAMS.seed });
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        const s = useApp.getState();
        if (s.status === 'ready' && !s.jump.active) sim.setRunning(!s.running);
      }
      if (e.key === 'Escape') useApp.getState().set({ dialog: null, mobilePanel: null, tool: 'inspect' });
    };
    window.addEventListener('keydown', onKey);
    const onHide = () => { if (document.visibilityState === 'hidden') sim.autosave(); };
    document.addEventListener('visibilitychange', onHide);
  }, []);
  return (
    <div className="app">
      <PlanetView />
      <TopBar />
      <LeftPanel />
      <RightPanel />
      <div className="center-overlay">
        <LayerBar />
        <CameraButtons />
      </div>
      <RegionCard />
      <BottomBar />
      {mobilePanel && <div className="scrim mobile-only" onClick={() => useApp.getState().set({ mobilePanel: null })} />}
      <Dialogs />
      <Toasts />
      <Loading />
    </div>
  );
}
