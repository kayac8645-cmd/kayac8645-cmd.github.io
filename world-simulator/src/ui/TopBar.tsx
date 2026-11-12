import { useApp } from '../state/store';
import { dateParts, formatDate } from '../core/calendar';
import { LAYER_LABELS, type MapLayer } from '../core/types';
import { sim } from '../state/simClient';

export function TopBar() {
  const params = useApp((s) => s.params);
  const day = useApp((s) => s.stats?.day ?? 0);
  const running = useApp((s) => s.running);
  const jump = useApp((s) => s.jump);
  const eff = useApp((s) => s.stats?.simSpeedDaysPerSec ?? 0);
  const fps = useApp((s) => s.fps);
  const set = useApp((s) => s.set);
  const mobilePanel = useApp((s) => s.mobilePanel);
  const p = dateParts(day);
  const status = jump.active ? `Zaman sıçraması %${Math.round(jump.frac * 100)}` : running ? 'Çalışıyor' : 'Duraklatıldı';
  return (
    <header className="topbar">
      <button className="icon-btn mobile-only" aria-label="Araçlar" onClick={() => set({ mobilePanel: mobilePanel === 'left' ? null : 'left' })}>☰</button>
      <div className="brand">
        <span className="logo">◐</span>
        <div>
          <div className="planet-name">{params.name}</div>
          <div className="sub">seed {params.seed}</div>
        </div>
      </div>
      <div className="date-block">
        <div className="date">{formatDate(day)}</div>
        <div className="sub">K: {p.seasonNorth} · G: {p.seasonSouth}</div>
      </div>
      <div className={`status-chip ${jump.active ? 'jump' : running ? 'on' : 'off'}`} data-testid="sim-status">
        <span className="dot" />
        {status}
        {running && !jump.active && <span className="eff">{eff >= 365 ? `${(eff / 365).toFixed(1)} yıl/sn` : `${eff.toFixed(1)} gün/sn`}</span>}
      </div>
      <div className="spacer" />
      <span className="fps desktop-only">{fps.toFixed(0)} FPS</span>
      <nav className="top-actions">
        <button onClick={() => set({ dialog: 'new' })}>Yeni gezegen</button>
        <button onClick={() => { sim.refreshSaves(); set({ dialog: 'saves' }); }}>Kayıtlar</button>
        <button onClick={() => set({ dialog: 'settings' })} aria-label="Ayarlar">Ayarlar</button>
        <button className="desktop-only" onClick={() => set({ dialog: 'about' })}>Model</button>
      </nav>
      <button className="icon-btn mobile-only" aria-label="İstatistikler" onClick={() => set({ mobilePanel: mobilePanel === 'right' ? null : 'right' })}>▤</button>
    </header>
  );
}

export function LayerBar() {
  const layer = useApp((s) => s.layer);
  const layers = Object.keys(LAYER_LABELS) as MapLayer[];
  return (
    <div className="layerbar">
      <div className="chips desktop-only">
        {layers.map((l) => (
          <button key={l} className={l === layer ? 'chip active' : 'chip'} onClick={() => sim.setLayer(l)}>{LAYER_LABELS[l]}</button>
        ))}
      </div>
      <select className="mobile-only" value={layer} onChange={(e) => sim.setLayer(e.target.value as MapLayer)} aria-label="Harita katmanı">
        {layers.map((l) => <option key={l} value={l}>{LAYER_LABELS[l]}</option>)}
      </select>
      <Legend layer={layer} />
    </div>
  );
}

const LEGENDS: Partial<Record<MapLayer, { grad: string; lo: string; hi: string }>> = {
  temperature: { grad: 'linear-gradient(90deg,#283caa,#4696dc,#ebf0f0,#f5aa46,#c82828)', lo: '-40°C', hi: '+40°C' },
  precipitation: { grad: 'linear-gradient(90deg,#e6dca0,#78c8c8,#2878d2,#1e2896)', lo: '0', hi: '3000 mm/yıl' },
  elevation: { grad: 'linear-gradient(90deg,#0a1e5a,#5aaad2,#468c46,#aab45a,#be8c50,#f5f5f5)', lo: '-6 km', hi: '+6 km' },
  vegetation: { grad: 'linear-gradient(90deg,#c8b478,#8cbe50,#1e7832,#0a461e)', lo: 'çıplak', hi: 'yoğun orman' },
  population: { grad: 'linear-gradient(90deg,#3c143c,#c83228,#faaa32,#fffac8)', lo: 'seyrek', hi: 'yoğun' },
  animals: { grad: 'linear-gradient(90deg,#281e46,#783caa,#dc78c8,#ffdcf0)', lo: 'az', hi: 'çok (log)' },
  disaster: { grad: 'linear-gradient(90deg,#3c143c,#c83228,#faaa32,#fffac8)', lo: 'hasar yok', hi: 'yüksek' },
  water: { grad: 'linear-gradient(90deg,#e6dca0,#78c8c8,#2878d2,#1e2896)', lo: 'kurak', hi: 'bol su' },
};

function Legend({ layer }: { layer: MapLayer }) {
  const l = LEGENDS[layer];
  if (!l) return null;
  return (
    <div className="legend">
      <span>{l.lo}</span>
      <i style={{ background: l.grad }} />
      <span>{l.hi}</span>
    </div>
  );
}
