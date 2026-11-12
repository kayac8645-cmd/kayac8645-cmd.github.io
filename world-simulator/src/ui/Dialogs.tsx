import { useEffect, useState } from 'react';
import { useApp } from '../state/store';
import { sim } from '../state/simClient';
import { DEFAULT_PARAMS, type PlanetParams } from '../core/types';
import * as db from '../persistence/db';
import { formatDate } from '../core/calendar';
import { fmtNum, fmtT } from './format';

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Dialogs() {
  const dialog = useApp((s) => s.dialog);
  const set = useApp((s) => s.set);
  const close = () => set({ dialog: null });
  if (dialog === 'new') return <Modal title="Yeni gezegen" onClose={close}><NewPlanet onDone={close} /></Modal>;
  if (dialog === 'saves') return <Modal title="Kayıtlar" onClose={close}><Saves onDone={close} /></Modal>;
  if (dialog === 'settings') return <Modal title="Ayarlar" onClose={close}><Settings /></Modal>;
  if (dialog === 'about') return <Modal title="Simülasyon modeli" onClose={close}><About /></Modal>;
  return null;
}

const SLIDERS: { k: keyof PlanetParams; label: string; min: number; max: number; step: number; fmt: (v: number) => string }[] = [
  { k: 'landRatio', label: 'Kara oranı', min: 0.1, max: 0.7, step: 0.01, fmt: (v) => `%${Math.round(v * 100)}` },
  { k: 'mountainDensity', label: 'Dağ yoğunluğu', min: 0, max: 1, step: 0.05, fmt: (v) => `%${Math.round(v * 100)}` },
  { k: 'oceanDepth', label: 'Okyanus derinliği', min: 1500, max: 7000, step: 100, fmt: (v) => `${fmtNum(v)} m` },
  { k: 'forestDensity', label: 'Orman yoğunluğu', min: 0, max: 1, step: 0.05, fmt: (v) => `%${Math.round(v * 100)}` },
  { k: 'iceAmount', label: 'Buzul miktarı', min: 0, max: 1, step: 0.05, fmt: (v) => `%${Math.round(v * 100)}` },
  { k: 'baseTemperature', label: 'Başlangıç sıcaklığı (küresel ort.)', min: -5, max: 30, step: 0.5, fmt: (v) => fmtT(v) },
  { k: 'atmosphereDensity', label: 'Atmosfer yoğunluğu', min: 0.3, max: 3, step: 0.1, fmt: (v) => `${v.toFixed(1)}× Dünya` },
];

function NewPlanet({ onDone }: { onDone: () => void }) {
  const current = useApp((s) => s.params);
  const [p, setP] = useState<PlanetParams>({ ...current });
  const [seeds, setSeeds] = useState<db.SeedRecord[]>([]);
  useEffect(() => {
    db.listSeeds().then(setSeeds).catch(() => {});
  }, []);
  const go = () => {
    sim.setRunning(false);
    sim.generate({ ...p, name: p.name.trim() || 'Gaia', seed: p.seed.trim() || String(Date.now() % 1e6) });
    onDone();
  };
  const saveSeed = async () => {
    await db.putSeed({ id: `seed-${Date.now()}`, name: `${p.name} (${p.seed})`, params: p, createdAt: Date.now() });
    setSeeds(await db.listSeeds());
    useApp.getState().toast('Seed kaydedildi');
  };
  return (
    <div className="form">
      <div className="grid2">
        <label className="field">Gezegen adı<input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} data-testid="planet-name" /></label>
        <label className="field">Seed
          <div className="row">
            <input value={p.seed} onChange={(e) => setP({ ...p, seed: e.target.value })} data-testid="planet-seed" />
            <button className="mini" onClick={() => setP({ ...p, seed: String(Math.floor(Math.random() * 1e9)) })} title="Rastgele">⚄</button>
          </div>
        </label>
      </div>
      {SLIDERS.map((s) => (
        <label key={s.k} className="field">{s.label} <b>{s.fmt(p[s.k] as number)}</b>
          <input type="range" min={s.min} max={s.max} step={s.step} value={p[s.k] as number} onChange={(e) => setP({ ...p, [s.k]: +e.target.value })} />
        </label>
      ))}
      <div className="row">
        <button onClick={() => setP({ ...DEFAULT_PARAMS, seed: p.seed, name: p.name })}>Varsayılanlar</button>
        <button onClick={saveSeed}>Seed'i kaydet</button>
        <div className="spacer" />
        <button className="primary" onClick={go} data-testid="generate">Oluştur</button>
      </div>
      {seeds.length > 0 && (
        <>
          <h4>Kayıtlı seed'ler</h4>
          <ul className="save-list">
            {seeds.map((s) => (
              <li key={s.id}>
                <span>{s.name}</span>
                <button className="mini" onClick={() => setP({ ...s.params })}>Kullan</button>
                <button className="mini danger" onClick={async () => { await db.deleteSeed(s.id); setSeeds(await db.listSeeds()); }}>Sil</button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="fineprint">Aynı seed ve ayarlar her zaman aynı gezegeni üretir. Oluşturma birkaç saniye sürer (iklim, buzullar ve ekosistem dengelenir).</p>
    </div>
  );
}

function Saves({ onDone }: { onDone: () => void }) {
  const saves = useApp((s) => s.saves);
  const lastSavedAt = useApp((s) => s.lastSavedAt);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const groups: { k: db.SaveKind; t: string }[] = [{ k: 'manual', t: 'Kayıtlar' }, { k: 'auto', t: 'Otomatik kayıt' }, { k: 'checkpoint', t: 'Kayıt noktaları (her 25 simülasyon yılı)' }];
  return (
    <div className="form">
      <div className="row">
        <input placeholder="Kayıt adı (isteğe bağlı)" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="primary" disabled={busy} onClick={async () => { setBusy(true); try { await sim.save(name); setName(''); } catch (e) { useApp.getState().toast('Kayıt başarısız: ' + String(e), 'warn'); } setBusy(false); }} data-testid="save-now">Şimdi kaydet</button>
      </div>
      {lastSavedAt && <p className="fineprint">Son kayıt: {new Date(lastSavedAt).toLocaleTimeString('tr-TR')}</p>}
      {groups.map((g) => {
        const list = saves.filter((s) => s.kind === g.k);
        if (!list.length) return null;
        return (
          <div key={g.k}>
            <h4>{g.t}</h4>
            <ul className="save-list">
              {list.map((s) => (
                <li key={s.id} data-testid="save-item">
                  <div>
                    <b>{s.name}</b>
                    <div className="sub">{s.planetName} · seed {s.seed} · {formatDate(s.day)} · {fmtT(s.summary.temp)} · {fmtNum(s.summary.humans)} insan · {new Date(s.createdAt).toLocaleString('tr-TR')}</div>
                  </div>
                  <button className="mini" onClick={() => { sim.setRunning(false); sim.loadSaved(s.id); onDone(); }} data-testid="load-save">Yükle</button>
                  <button className="mini danger" onClick={async () => { await db.deleteSave(s.id); sim.refreshSaves(); }}>Sil</button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {saves.length === 0 && <p className="hint">Henüz kayıt yok.</p>}
      <p className="fineprint">Kayıtlar tarayıcının IndexedDB deposunda tutulur: arazi, iklim alanları, tüm popülasyonlar, yerleşimler, aktif olaylar ve olay geçmişi dahil.</p>
    </div>
  );
}

function Settings() {
  const settings = useApp((s) => s.settings);
  const set = useApp((s) => s.set);
  const upd = (p: Partial<typeof settings>) => set({ settings: { ...settings, ...p } });
  return (
    <div className="form">
      <label className="field">Grafik kalitesi
        <select value={settings.quality} onChange={(e) => upd({ quality: e.target.value as typeof settings.quality })}>
          <option value="low">Düşük (zayıf cihazlar)</option>
          <option value="medium">Orta</option>
          <option value="high">Yüksek</option>
        </select>
      </label>
      <label className="field">Yükseklik abartısı <b>{settings.exaggeration}×</b>
        <input type="range" min={1} max={60} step={1} value={settings.exaggeration} onChange={(e) => upd({ exaggeration: +e.target.value })} />
      </label>
      <label className="check"><input type="checkbox" checked={settings.clouds} onChange={(e) => upd({ clouds: e.target.checked })} /> Bulut katmanı</label>
      <label className="check"><input type="checkbox" checked={settings.autosave} onChange={(e) => upd({ autosave: e.target.checked })} /> Otomatik kayıt (90 sn)</label>
      <label className="check"><input type="checkbox" checked={settings.natural} onChange={(e) => { upd({ natural: e.target.checked }); sim.setNatural(e.target.checked); useApp.getState().toast(e.target.checked ? 'Doğal olaylar açık' : 'Doğal olaylar kapalı'); }} /> Doğal olaylar</label>
      <h4>Kontroller</h4>
      <ul className="help">
        <li>Uzay modu: sürükle = döndür, tekerlek / iki parmak = yakınlaş. Çok yakınlaşınca yüzey moduna geçer.</li>
        <li>Yüzey modu: sürükle = kaydır, sağ tık/Shift + sürükle veya iki parmak = bakış açısı, WASD / QE klavye.</li>
        <li>Dokun = bölge seç / aracı uygula; basılı tut = aracı sürekli uygula.</li>
      </ul>
    </div>
  );
}

function About() {
  return (
    <div className="about">
      <p>Bu simülasyon, gerçek fizik formüllerine dayanan bileşenler ile oynanabilirlik için ayarlanmış yaklaşık modelleri birlikte kullanır. Sonuçlar bilimsel tahmin değildir.</p>
      <h4>Fiziksel temelli (basitleştirilmiş)</h4>
      <ul>
        <li>Enleme ve mevsime göre günlük ortalama güneş ışınımı (eğiklik 23,44°).</li>
        <li>Budyko–Sellers enerji dengesi: OLR = A + B·T, ısı taşınımı, kar/buz-albedo geri beslemesi, kara/okyanus ısı kapasitesi farkı.</li>
        <li>Rakımla sıcaklık düşüşü (6,5 °C/km), barometrik basınç azalması.</li>
        <li>Clausius–Clapeyron (Magnus) nem kapasitesi; yarı-Lagrange nem taşınımı, orografik yağış.</li>
        <li>CO₂ zorlaması ΔF = 5,35·ln(C/C₀); volkanik/çarpma aerosolü ışınımı azaltır.</li>
        <li>Derece-gün kar/buz erimesi, buzul hacmine bağlı deniz seviyesi.</li>
        <li>Öncelik-taşkın (priority-flood) drenajı ile nehirler ve göller.</li>
      </ul>
      <h4>Yaklaşık / sezgisel</h4>
      <ul>
        <li>Rüzgâr kuşakları, basınç alanı, bulut ve yağış eşikleri.</li>
        <li>Ekosistem: hücre başına biyokütle; lojistik bitki büyümesi, Holling tip-II beslenme, kütleye bağlı (allometrik) tüketim ve yoğunluk sınırları. Bireyler simüle edilmez.</li>
        <li>Uygarlık: gıda/su/teknoloji tabanlı nüfus, göç, salgın ve emisyon modeli — ampirik olarak kalibre edilmemiştir.</li>
        <li>Felaket şiddet ve etki büyüklükleri oynanabilirlik için seçilmiştir.</li>
        <li>Uzun zaman sıçramaları: her adımda tek bir temsili yıl tam modelle hesaplanır; buzullar, CO₂, erozyon ve teknoloji aradaki yıllar için tahmin edilir (ara dinamikler çözülmez).</li>
      </ul>
      <p className="fineprint">Izgara: simülasyon 160×80 hücre (~2,25°), arazi 640×320 piksel.</p>
    </div>
  );
}
