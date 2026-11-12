import { useState } from 'react';
import { useApp } from '../state/store';
import { sim } from '../state/simClient';
import { DISASTER_INFO, type DisasterType, type SpeciesCategory, type SpeciesDef, type ToolId } from '../core/types';
import { fmtNum, trendArrow } from './format';
import { rendererRef } from './PlanetView';

const TOOLS: { id: ToolId; label: string; icon: string; hint: string }[] = [
  { id: 'inspect', label: 'Bölge seç', icon: '⌖', hint: 'Bölgeye dokun: ayrıntılı veriler' },
  { id: 'heat', label: 'Isıt', icon: '▲°', hint: 'Bölgesel sıcaklık +' },
  { id: 'cool', label: 'Soğut', icon: '▼°', hint: 'Bölgesel sıcaklık −' },
  { id: 'rain', label: 'Yağış +', icon: '☂', hint: 'Yağış çarpanını artır' },
  { id: 'dry', label: 'Yağış −', icon: '☀', hint: 'Yağış çarpanını azalt' },
  { id: 'grass', label: 'Bitki örtüsü', icon: '❀', hint: 'Ot ve çalı ekle' },
  { id: 'forest', label: 'Orman', icon: '♣', hint: 'Ağaç örtüsü ekle' },
  { id: 'lake', label: 'Göl', icon: '◍', hint: 'Karada göl çanağı kaz' },
  { id: 'raise', label: 'Yükselt', icon: '⛰', hint: 'Araziyi yükselt' },
  { id: 'lower', label: 'Alçalt', icon: '⌄', hint: 'Araziyi alçalt' },
  { id: 'animals', label: 'Hayvan ekle', icon: '🐾', hint: 'Seçili türün popülasyonunu ekle' },
  { id: 'settlement', label: 'Yerleşim', icon: '⌂', hint: 'Yeni yerleşim kur' },
];

export function LeftPanel() {
  const [tab, setTab] = useState<'tools' | 'disasters' | 'life'>('tools');
  const mobilePanel = useApp((s) => s.mobilePanel);
  return (
    <aside className={`panel left ${mobilePanel === 'left' ? 'open' : ''}`} data-testid="left-panel">
      <div className="drawer-actions">
        <button onClick={() => useApp.getState().set({ dialog: 'new', mobilePanel: null })}>Yeni gezegen</button>
        <button onClick={() => { sim.refreshSaves(); useApp.getState().set({ dialog: 'saves', mobilePanel: null }); }}>Kayıtlar</button>
        <button onClick={() => useApp.getState().set({ dialog: 'settings', mobilePanel: null })}>Ayarlar</button>
        <button onClick={() => useApp.getState().set({ dialog: 'about', mobilePanel: null })}>Model</button>
      </div>
      <div className="panel-title">TANRI MODU</div>
      <div className="tabs">
        <button className={tab === 'tools' ? 'active' : ''} onClick={() => setTab('tools')}>Araçlar</button>
        <button className={tab === 'disasters' ? 'active' : ''} onClick={() => setTab('disasters')}>Felaketler</button>
        <button className={tab === 'life' ? 'active' : ''} onClick={() => setTab('life')}>Canlılar</button>
      </div>
      <div className="panel-body">
        {tab === 'tools' && <ToolsTab />}
        {tab === 'disasters' && <DisastersTab />}
        {tab === 'life' && <LifeTab />}
      </div>
    </aside>
  );
}

function ToolsTab() {
  const tool = useApp((s) => s.tool);
  const brushKm = useApp((s) => s.brushKm);
  const strength = useApp((s) => s.strength);
  const natural = useApp((s) => s.settings.natural);
  const settings = useApp((s) => s.settings);
  const set = useApp((s) => s.set);
  const species = useApp((s) => s.stats?.species ?? []);
  const speciesId = useApp((s) => s.speciesId);
  const active = TOOLS.find((t) => t.id === tool);
  return (
    <>
      <div className="tool-grid">
        {TOOLS.map((t) => (
          <button key={t.id} className={`tool ${tool === t.id ? 'active' : ''}`} title={t.hint} onClick={() => set({ tool: t.id })} data-testid={`tool-${t.id}`}>
            <span className="ti">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      <p className="hint">{active ? active.hint : 'Felaket aracı seçili'} — gezegene dokun{tool !== 'inspect' ? ', basılı tut: sürekli uygula' : ''}.</p>
      {tool === 'animals' && (
        <label className="field">Tür
          <select value={speciesId} onChange={(e) => set({ speciesId: e.target.value })}>
            {species.filter((s) => s.category !== 'microbe' || true).map((s) => <option key={s.id} value={s.id}>{s.name}{s.extinct ? ' (yok oldu)' : ''}</option>)}
          </select>
        </label>
      )}
      <label className="field">Fırça yarıçapı <b>{brushKm} km</b>
        <input type="range" min={50} max={2000} step={25} value={brushKm} onChange={(e) => set({ brushKm: +e.target.value })} />
      </label>
      <label className="field">Güç <b>%{Math.round(strength * 100)}</b>
        <input type="range" min={0.05} max={1} step={0.05} value={strength} onChange={(e) => set({ strength: +e.target.value })} />
      </label>
      <div className="row">
        <button className="ghost" onClick={() => sim.resetUserForcing()}>Bölgesel iklim müdahalelerini sıfırla</button>
      </div>
      <label className="check">
        <input type="checkbox" checked={natural} onChange={(e) => { set({ settings: { ...settings, natural: e.target.checked } }); sim.setNatural(e.target.checked); useApp.getState().toast(e.target.checked ? 'Doğal olaylar açık' : 'Doğal olaylar kapalı'); }} />
        Doğal olaylar (volkan, deprem, kasırga, yangın…)
      </label>
    </>
  );
}

const DISASTERS = Object.keys(DISASTER_INFO) as DisasterType[];

function DisastersTab() {
  const tool = useApp((s) => s.tool);
  const d = useApp((s) => s.disaster);
  const set = useApp((s) => s.set);
  const events = useApp((s) => s.events);
  const choose = (type: DisasterType) => {
    const info = DISASTER_INFO[type];
    set({ tool: 'disaster', disaster: { type, intensity: d.intensity, radiusKm: info.defaultRadius, durationDays: info.defaultDuration } });
  };
  const info = DISASTER_INFO[d.type];
  const startHere = () => {
    const sel = useApp.getState().selected;
    const f = rendererRef?.controller.focusLatLon() ?? { lat: 0, lon: 0 };
    const p = info.global ? { lat: 0, lon: 0 } : sel ?? f;
    sim.applyTool({ tool: 'disaster', lat: p.lat, lon: p.lon, radiusKm: d.radiusKm, strength: 1, disaster: d });
  };
  return (
    <>
      <div className="dis-grid">
        {DISASTERS.map((t) => (
          <button key={t} className={`dis ${tool === 'disaster' && d.type === t ? 'active' : ''}`} onClick={() => choose(t)} data-testid={`dis-${t}`}>
            <span className="ti">{DISASTER_INFO[t].icon}</span>
            {DISASTER_INFO[t].label}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-title">{info.icon} {info.label}</div>
        <label className="field">Şiddet <b>%{Math.round(d.intensity * 100)}</b>
          <input type="range" min={0.1} max={1} step={0.05} value={d.intensity} onChange={(e) => set({ disaster: { ...d, intensity: +e.target.value } })} />
        </label>
        {!info.global && (
          <label className="field">Etki alanı <b>{d.radiusKm} km</b>
            <input type="range" min={30} max={4000} step={10} value={d.radiusKm} onChange={(e) => set({ disaster: { ...d, radiusKm: +e.target.value } })} />
          </label>
        )}
        <label className="field">Süre <b>{d.durationDays >= 365 ? `${(d.durationDays / 365).toFixed(1)} yıl` : `${Math.round(d.durationDays)} gün`}</b>
          <input type="range" min={0} max={1} step={0.001} value={Math.log(d.durationDays) / Math.log(365 * 1000)} onChange={(e) => set({ disaster: { ...d, durationDays: Math.max(1, Math.round(Math.pow(365 * 1000, +e.target.value))) } })} />
        </label>
        <p className="hint">{info.global ? 'Küresel olay — konum gerekmez.' : 'Konum için gezegene dokunun ya da seçili/merkez noktada başlatın.'}</p>
        <button className="primary" onClick={startHere} data-testid="start-disaster">{info.global ? 'Başlat' : 'Seçili noktada başlat'}</button>
      </div>
      <div className="card">
        <div className="card-title">Aktif olaylar ({events.length})</div>
        {events.length === 0 && <p className="hint">Aktif olay yok.</p>}
        <ul className="ev-list">
          {events.map((e) => (
            <li key={e.id}>
              <span>{DISASTER_INFO[e.type].icon} {DISASTER_INFO[e.type].label}</span>
              <progress max={1} value={Math.min(1, e.elapsedDays / e.durationDays)} />
              <button className="mini" onClick={() => rendererRef?.controller.flyTo(e.lat, e.lon)} title="Konuma git">◎</button>
              <button className="mini danger" onClick={() => sim.stopEvent(e.id)} title="Durdur">■</button>
            </li>
          ))}
        </ul>
        <button className="ghost" onClick={() => sim.resetEvents()} title="Kalıcı hasarlar (yanmış alan, ölümler, krater) geri alınmaz; tam geri dönüş için kayıt noktası kullanın.">Tümünü sıfırla</button>
      </div>
    </>
  );
}

const CATS: { id: SpeciesCategory; label: string }[] = [
  { id: 'herbivore', label: 'Otçul' }, { id: 'carnivore', label: 'Etçil' }, { id: 'bird', label: 'Kuş' },
  { id: 'fish', label: 'Balık' }, { id: 'insect', label: 'Böcek' },
];

function LifeTab() {
  const species = useApp((s) => s.stats?.species ?? []);
  const set = useApp((s) => s.set);
  const [form, setForm] = useState({ name: 'Yeni tür', category: 'herbivore' as SpeciesCategory, mass: 30, tempMin: -10, tempMax: 35, repro: 0.6, life: 12, water: 0.15 });
  const create = () => {
    const sel = useApp.getState().selected ?? rendererRef?.controller.focusLatLon() ?? { lat: 0, lon: 0 };
    const c = form.category;
    const diet: SpeciesDef['diet'] =
      c === 'herbivore' ? { grass: 0.6, shrub: 0.3, tree: 0.1 } : c === 'carnivore' ? { herbivore: 1 } : c === 'bird' ? { insect: 0.7, grass: 0.3 } : c === 'fish' ? { plankton: 1 } : { grass: 0.6, shrub: 0.4 };
    sim.addSpecies({
      id: '', name: form.name.slice(0, 40) || 'Tür', category: c, habitat: c === 'fish' ? 'ocean' : 'land', diet,
      massKg: form.mass, lifespanYr: form.life, reproRate: form.repro, tempMin: form.tempMin, tempMax: form.tempMax,
      waterNeed: c === 'fish' ? 0 : form.water, dispersal: c === 'bird' ? 0.8 : 0.3, color: '#f0c060',
    }, sel.lat, sel.lon);
  };
  return (
    <>
      <table className="sp-table">
        <thead><tr><th>Tür</th><th>Sayı</th><th /></tr></thead>
        <tbody>
          {species.map((s) => {
            const tr = trendArrow(s.trend);
            return (
              <tr key={s.id} className={s.extinct ? 'extinct' : ''}>
                <td><i className="sw" style={{ background: s.color }} />{s.name}</td>
                <td>{s.extinct ? 'yok oldu' : s.category === 'microbe' ? `${fmtNum(s.count)} t` : fmtNum(s.count)}</td>
                <td><span className={`tr ${tr.c}`}>{tr.s}</span> <button className="mini" title="Bu türü ekleme aracına al" onClick={() => set({ tool: 'animals', speciesId: s.id })}>+</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="card">
        <div className="card-title">Yeni canlı türü oluştur</div>
        <label className="field">Ad<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="field">Kategori
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SpeciesCategory })}>
            {CATS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>
        <div className="grid2">
          <label className="field">Kütle (kg)<input type="number" min={0.001} max={5000} step="any" value={form.mass} onChange={(e) => setForm({ ...form, mass: Math.max(0.001, +e.target.value) })} /></label>
          <label className="field">Ömür (yıl)<input type="number" min={0.1} max={200} step="any" value={form.life} onChange={(e) => setForm({ ...form, life: Math.max(0.1, +e.target.value) })} /></label>
          <label className="field">Min °C<input type="number" value={form.tempMin} onChange={(e) => setForm({ ...form, tempMin: +e.target.value })} /></label>
          <label className="field">Maks °C<input type="number" value={form.tempMax} onChange={(e) => setForm({ ...form, tempMax: +e.target.value })} /></label>
          <label className="field">Üreme (/yıl)<input type="number" min={0.01} max={50} step="any" value={form.repro} onChange={(e) => setForm({ ...form, repro: Math.max(0.01, +e.target.value) })} /></label>
          <label className="field">Su ihtiyacı<input type="number" min={0} max={1} step={0.05} value={form.water} onChange={(e) => setForm({ ...form, water: Math.min(1, Math.max(0, +e.target.value)) })} /></label>
        </div>
        <p className="hint">Tür, seçili bölgenin (yoksa ekran merkezinin) çevresine uygun yaşam alanlarına yerleştirilir.</p>
        <button className="primary" onClick={create} data-testid="create-species">Türü oluştur</button>
      </div>
    </>
  );
}
