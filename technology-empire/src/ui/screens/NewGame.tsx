import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, DataTable, Field, Tabs, type Column } from '../components/ui';
import { createCountries } from '../../engine/data/countries';
import { DIFFICULTY, FACILITIES, SECTORS, SECTOR_IDS } from '../../engine/data/defs';
import { createNewGame } from '../../engine/newGame';
import { useStore } from '../../store/gameStore';
import { listSlots, loadGame, type SlotId, type SlotMeta } from '../../save/storage';
import type { Country, Difficulty, SectorId } from '../../engine/types';
import { gameDate, money } from '../format';

const ICONS = ['🚀', '💾', '🖥️', '📡', '🛰️', '🧠', '⚡', '🔷', '🌐', '🏛️', '🦅', '🐺', '🦊', '🔥', '💎', '⚙️'];
const COLORS = ['#4f8cff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#64748b'];
type Step = 'identity' | 'country' | 'sector' | 'difficulty';
const STEPS: { id: Step; label: string }[] = [
  { id: 'identity', label: '1. Kimlik' }, { id: 'country', label: '2. Ülke' }, { id: 'sector', label: '3. Sektör' }, { id: 'difficulty', label: '4. Zorluk' },
];

export default function NewGame() {
  const setGame = useStore((s) => s.setGame);
  const toast = useStore((s) => s.toast);
  const countries = useMemo(() => Object.values(createCountries()), []);
  const [step, setStep] = useState<Step>('identity');
  const [holdingName, setHoldingName] = useState('Nova Holding');
  const [companyName, setCompanyName] = useState('Nova Teknoloji');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);
  const [countryId, setCountryId] = useState('US');
  const [sector, setSector] = useState<SectorId>('hardware');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [slots, setSlots] = useState<(SlotMeta | null)[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { listSlots().then(setSlots).catch(() => setSlots([])); }, []);

  const country = countries.find((c) => c.id === countryId);
  const valid = holdingName.trim().length > 0 && companyName.trim().length > 0;

  const start = () => {
    if (!valid) { setStep('identity'); toast('Holding ve şirket adı boş olamaz.', 'error'); return; }
    setBusy(true);
    try {
      const g = createNewGame({ holdingName: holdingName.trim(), companyName: companyName.trim(), color, icon, countryId, sector, difficulty });
      g.speed = 0;
      g.settings.showTutorial = true;
      setGame(g);
    } catch (e) {
      toast(`Oyun oluşturulamadı: ${e instanceof Error ? e.message : String(e)}`, 'error');
    } finally { setBusy(false); }
  };

  const load = async (slot: SlotId) => {
    try { const g = await loadGame(slot); g.speed = 0; setGame(g); toast('Kayıt yüklendi', 'ok'); }
    catch (e) { toast(e instanceof Error ? e.message : 'Kayıt yüklenemedi.', 'error'); }
  };

  const cols: Column<Country>[] = [
    { key: 'name', label: 'Ülke', sort: (c) => c.name, render: (c) => <b>{c.id === countryId ? '✓ ' : ''}{c.name}</b> },
    { key: 'region', label: 'Bölge', sort: (c) => c.region, render: (c) => c.region, hideOnMobile: true },
    { key: 'sal', label: 'Maaş', align: 'right', sort: (c) => c.avgSalary, render: (c) => money(c.avgSalary, 0) },
    { key: 'tax', label: 'Vergi', align: 'right', sort: (c) => c.corporateTax, render: (c) => `%${(c.corporateTax * 100).toFixed(0)}` },
    { key: 'el', label: 'Elektrik', align: 'right', sort: (c) => c.electricityCost, render: (c) => `$${c.electricityCost}`, hideOnMobile: true },
    { key: 'tech', label: 'Teknoloji', align: 'right', sort: (c) => c.techLevel, render: (c) => c.techLevel },
    { key: 'risk', label: 'Risk', align: 'right', sort: (c) => c.politicalRisk, render: (c) => <span className={c.politicalRisk > 60 ? 'neg' : c.politicalRisk > 35 ? 'warn' : 'pos'}>{c.politicalRisk}</span> },
  ];

  const idx = STEPS.findIndex((s) => s.id === step);
  const sDef = SECTORS[sector];
  const dDef = DIFFICULTY[difficulty];

  return (
    <div className="wizard">
      <div className="row">
        <div className="brand-logo" style={{ background: color, width: 52, height: 52, fontSize: 28 }}>{icon}</div>
        <div><h1>TECHNOLOGY EMPIRE</h1><div className="muted">Teknoloji imparatorluğunu sıfırdan kur.</div></div>
      </div>

      <Tabs tabs={STEPS} value={step} onChange={setStep} />

      {step === 'identity' && (
        <Card title="Holding ve ilk şirket">
          <div className="col">
            <div className="form-grid">
              <Field label="Holding adı"><input value={holdingName} maxLength={30} onChange={(e) => setHoldingName(e.target.value)} /></Field>
              <Field label="İlk şirket adı"><input value={companyName} maxLength={40} onChange={(e) => setCompanyName(e.target.value)} /></Field>
            </div>
            <Field label="Logo rengi">
              <div className="row">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                {COLORS.map((c) => <button key={c} aria-label={c} onClick={() => setColor(c)} style={{ background: c, width: 28, height: 28, padding: 0, borderRadius: 8, outline: c === color ? '2px solid #fff' : undefined }} />)}
              </div>
            </Field>
            <Field label="Logo simgesi">
              <div className="emoji-grid">{ICONS.map((i) => <button key={i} className={i === icon ? 'active' : ''} onClick={() => setIcon(i)}>{i}</button>)}</div>
            </Field>
          </div>
        </Card>
      )}

      {step === 'country' && (
        <Card title="Başlangıç ülkesi" info="Maaş, vergi, elektrik ve risk ilk şirketinizin maliyet yapısını belirler.">
          <DataTable rows={countries} columns={cols} rowKey={(c) => c.id} search={(c) => `${c.name} ${c.region}`} onRowClick={(c) => setCountryId(c.id)} initialSort={{ key: 'tech', dir: -1 }} pageSize={40} />
          {country && <p className="muted small" style={{ marginTop: 10 }}>Seçili: <b>{country.name}</b> — nüfus {country.population.toFixed(0)} M, GSYH ${country.gdp.toLocaleString('tr-TR')} Mr, lojistik {country.logistics}, eğitim {country.education}.</p>}
        </Card>
      )}

      {step === 'sector' && (
        <Card title="Başlangıç sektörü">
          <div className="pick-grid">
            {SECTOR_IDS.map((id) => {
              const d = SECTORS[id];
              return (
                <button key={id} className={`pick ${id === sector ? 'active' : ''}`} onClick={() => setSector(id)}>
                  <b>{d.icon} {d.name}</b>
                  <span className="muted small" style={{ whiteSpace: 'normal' }}>{d.description}</span>
                  <span className="small">Kuruluş: <b>{money(d.foundingCost)}</b></span>
                </button>
              );
            })}
          </div>
          <p className="muted small" style={{ marginTop: 10 }}>
            {sDef.facilities.length > 0 ? `Tesisler: ${sDef.facilities.map((f) => FACILITIES[f].name).join(', ')}` : 'Fiziksel tesis gerekmez; platformlar yazılım olarak büyür.'}
          </p>
        </Card>
      )}

      {step === 'difficulty' && (
        <Card title="Zorluk">
          <div className="pick-grid">
            {(Object.keys(DIFFICULTY) as Difficulty[]).map((id) => (
              <button key={id} className={`pick ${id === difficulty ? 'active' : ''}`} onClick={() => setDifficulty(id)}>
                <b>{DIFFICULTY[id].label}</b>
                <span className="small">Başlangıç nakdi: <b>{money(DIFFICULTY[id].cash)}</b></span>
                <span className="small">Başlangıç borcu: <b>{money(DIFFICULTY[id].debt)}</b></span>
                <span className="small muted">Rakip gücü ×{DIFFICULTY[id].aiBoost}</span>
              </button>
            ))}
          </div>
          <div className="kv" style={{ marginTop: 14 }}>
            <span>Holding</span><span>{icon} {holdingName}</span>
            <span>İlk şirket</span><span>{companyName}</span>
            <span>Ülke</span><span>{country?.name ?? countryId}</span>
            <span>Sektör</span><span>{sDef.name}</span>
            <span>Zorluk</span><span><Badge tone="accent">{dDef.label}</Badge></span>
          </div>
        </Card>
      )}

      <div className="btn-row" style={{ justifyContent: 'space-between' }}>
        <button disabled={idx === 0} onClick={() => setStep(STEPS[idx - 1].id)}>← Geri</button>
        {idx < STEPS.length - 1
          ? <button className="primary" onClick={() => setStep(STEPS[idx + 1].id)}>İleri →</button>
          : <button className="primary" disabled={busy} onClick={start}>🚀 Oyunu Başlat</button>}
      </div>

      {slots.some(Boolean) && (
        <Card title="Kayıt yükle">
          <div className="col">
            {slots.map((m, i) => m && (
              <div key={m.slot} className="row" style={{ justifyContent: 'space-between' }}>
                <div><b>{m.slot === 'auto' ? 'Otomatik kayıt' : `Yuva ${i}`}</b> — {m.holdingName}<div className="muted small">{gameDate(m.day)} · Net değer {money(m.netWorth)} · {new Date(m.savedAt).toLocaleString('tr-TR')}</div></div>
                <button onClick={() => load(m.slot)}>Yükle</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
