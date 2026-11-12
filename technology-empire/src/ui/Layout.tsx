import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useStore, useGame, type Screen } from '../store/gameStore';
import { gameDate, money } from './format';
import { netWorth } from '../engine/selectors';
import type { Speed } from '../engine/types';
import ErrorBoundary from './components/ErrorBoundary';
import Overview from './screens/Overview';
import Companies from './screens/Companies';
import Sectors from './screens/Sectors';
import Settings from './screens/Settings';
import Production from './screens/Production';
import Supply from './screens/Supply';
import Products from './screens/Products';
import Research from './screens/Research';
import WorldMap from './screens/WorldMap';
import Finance from './screens/Finance';
import Market from './screens/Market';
import Rivals from './screens/Rivals';
import HR from './screens/HR';
import News from './screens/News';

const NAV: { id: Screen; label: string; icon: string; view: ComponentType }[] = [
  { id: 'overview', label: 'Genel Bakış', icon: '📊', view: Overview },
  { id: 'companies', label: 'Şirketlerim', icon: '🏢', view: Companies },
  { id: 'sectors', label: 'Sektörler', icon: '🧭', view: Sectors },
  { id: 'production', label: 'Üretim', icon: '🏭', view: Production },
  { id: 'supply', label: 'Tedarik Zinciri', icon: '🔗', view: Supply },
  { id: 'products', label: 'Ürünler', icon: '📦', view: Products },
  { id: 'research', label: 'Araştırma', icon: '🔬', view: Research },
  { id: 'world', label: 'Dünya Haritası', icon: '🌍', view: WorldMap },
  { id: 'finance', label: 'Finans', icon: '💰', view: Finance },
  { id: 'market', label: 'Borsa', icon: '📈', view: Market },
  { id: 'rivals', label: 'Rakipler', icon: '♟️', view: Rivals },
  { id: 'hr', label: 'İnsan Kaynakları', icon: '👥', view: HR },
  { id: 'news', label: 'Haberler', icon: '📰', view: News },
  { id: 'settings', label: 'Ayarlar', icon: '⚙️', view: Settings },
];

const SPEEDS: { v: Speed; label: string }[] = [
  { v: 0, label: '⏸' }, { v: 1, label: '1x' }, { v: 2, label: '2x' }, { v: 4, label: '4x' }, { v: 8, label: '8x' },
];

const TIPS = [
  'Şirketlerim ekranından şirketinize bir Genel Müdür (CEO) atayın; otomatik yönetimi açarsanız günlük kararları o alır.',
  'Üretim ekranından tesis kurun, Ürünler ekranından ürün tasarlayın ve fiyatlayın; stok biriktiğinde fiyatı düşürün.',
  'Araştırma yeni teknolojilerin kilidini açar; teknolojiler holdingdeki tüm şirketler arasında paylaşılır.',
  'Kardeş şirketler birbirinden hammadde/bileşen alabilir; Tedarik Zinciri ekranında bu akışı yönetin.',
  'Nakit sıfırın altına düşerse şirket iflas riskine girer. Üst Genel Bakış ekranındaki uyarıları takip edin.',
  'Boşluk tuşu oyunu duraklatır / devam ettirir. Hız düğmeleriyle zamanı hızlandırabilirsiniz.',
];

export default function Layout() {
  const g = useGame();
  const screen = useStore((s) => s.screen);
  const setScreen = useStore((s) => s.setScreen);
  const setSpeed = useStore((s) => s.setSpeed);
  const fps = useStore((s) => s.fps);
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const [open, setOpen] = useState(false);
  const lastSpeed = useRef<Speed>(1);
  const holding = g.holdings[g.playerHoldingId];

  useEffect(() => { if (g.speed !== 0) lastSpeed.current = g.speed; }, [g.speed]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const t = e.target as HTMLElement | null;
      if (t && (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(t.tagName) || t.isContentEditable)) return;
      e.preventDefault();
      const cur = useStore.getState().game?.speed ?? 0;
      useStore.getState().setSpeed(cur === 0 ? lastSpeed.current : 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const current = NAV.find((n) => n.id === screen) ?? NAV[0];
  const View = current.view;
  const go = (id: Screen) => { setScreen(id); setOpen(false); window.scrollTo({ top: 0 }); };

  return (
    <div className="app">
      <div className={open ? 'scrim open' : 'scrim'} onClick={() => setOpen(false)} />
      <aside className={open ? 'sidebar open' : 'sidebar'}>
        <div className="brand">
          <div className="brand-logo" style={{ background: holding.color }}>{holding.icon}</div>
          <div style={{ minWidth: 0 }}>
            <div className="brand-name">{holding.name}</div>
            <div className="brand-sub">TECHNOLOGY EMPIRE</div>
          </div>
        </div>
        <nav>
          {NAV.map((n) => (
            <button key={n.id} className={n.id === screen ? 'nav-item active' : 'nav-item'} onClick={() => go(n.id)}>
              <span className="nav-ico">{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="ghost hamburger" aria-label="Menü" onClick={() => setOpen(!open)}>☰</button>
          <div className="tb-date">{gameDate(g.day)}</div>
          <div className="speed" role="group" aria-label="Oyun hızı">
            {SPEEDS.map((s) => <button key={s.v} className={g.speed === s.v ? 'active' : ''} onClick={() => setSpeed(s.v)} title={s.v === 0 ? 'Duraklat (Boşluk)' : `${s.v}x hız`}>{s.label}</button>)}
          </div>
          <div className="spacer" />
          <div className="tb-metric"><small>Nakit</small><b>{money(holding.cash)}</b></div>
          <div className="tb-metric"><small>Net Değer</small><b>{money(netWorth(g, g.playerHoldingId))}</b></div>
          <div className="fps hm">{fps > 0 ? `${Math.round(fps)} FPS` : ''}</div>
        </header>
        <main className="content">
          {g.settings.showTutorial && g.day < 120 && <TutorialPanel />}
          <ErrorBoundary resetKey={screen}><View /></ErrorBoundary>
        </main>
      </div>
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className={`toast ${t.kind}`} onClick={() => dismiss(t.id)}>{t.text}</div>)}
      </div>
    </div>
  );
}

function TutorialPanel() {
  const run = useStore((s) => s.run);
  return (
    <section className="card" style={{ marginBottom: 16 }}>
      <header className="card-h">
        <h3>💡 Başlangıç ipuçları</h3>
        <button className="ghost sm" onClick={() => run((g) => { g.settings.showTutorial = false; return { ok: true }; })}>Gizle</button>
      </header>
      <div className="card-b">
        <ul style={{ margin: 0, paddingLeft: 18 }}>{TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>
  );
}
