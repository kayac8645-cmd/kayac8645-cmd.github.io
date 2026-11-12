import { useEffect, useState } from 'react';
import { useStore } from './store/gameStore';
import { loadGame, lastSlot } from './save/storage';
import { startLoop, stopLoop } from './engine/loop';
import Layout from './ui/Layout';
import NewGame from './ui/screens/NewGame';

export default function App() {
  const hasGame = useStore((s) => s.game !== null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!useStore.getState().game) {
          const g = await loadGame(lastSlot() ?? 'auto');
          if (alive && !useStore.getState().game) { g.speed = 0; useStore.getState().setGame(g); }
        }
      } catch { /* no save or corrupt: show wizard */ }
      if (alive) setBooting(false);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!hasGame) return;
    startLoop();
    return () => stopLoop();
  }, [hasGame]);

  if (booting) return <div className="wizard"><p className="muted">Yükleniyor…</p></div>;
  return hasGame ? <Layout /> : <NewGame />;
}
