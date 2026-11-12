import { useMemo, useState } from 'react';
import './screensB.css';
import * as actions from '../../engine/actions';
import { facilityBuildCost, facilityUpgradeCost, countryCostIndex } from '../../engine/preview';
import { CATEGORIES, CLOUD, FACILITIES, GOODS, SECTORS } from '../../engine/data/defs';
import type { Company, Facility, FacilityTypeId, GameState } from '../../engine/types';
import { capacityUse, goodName, holdingTechs } from '../../engine/selectors';
import { useGame, useStore } from '../../store/gameStore';
import { Badge, Bar, Card, Confirm, DataTable, Empty, Field, Info, Modal, NumInput, Select, Stat, type Column } from '../components/ui';
import CompanyPicker, { useSelectedCompany } from '../components/CompanyPicker';
import { money, num, pct } from '../format';

const run = useStore.getState().run;

function outputOptions(g: GameState, c: Company, f: { type: FacilityTypeId; countryId: string }): { value: string; label: string }[] {
  const def = FACILITIES[f.type];
  const techs = holdingTechs(g, c);
  if (f.type === 'mine') {
    const dep = g.countries[f.countryId]?.deposits ?? {};
    return (def.outputs ?? []).filter((o) => (dep[o] ?? 0) > 0).map((o) => ({ value: o, label: `${goodName(o)} (zenginlik %${Math.round((dep[o] ?? 0) * 100)})` }));
  }
  if (f.type === 'assemblyPlant') {
    return c.products.map((id) => g.products[id]).filter((p) => !!p).map((p) => ({ value: p.id, label: `${p.name} (${CATEGORIES[p.category].name})` }));
  }
  if (f.type === 'dataCenter') {
    return (SECTORS.cloud.cloudServices ?? []).map((s) => ({ value: s, label: CLOUD[s].name + (CLOUD[s].requiresTech && !techs.has(CLOUD[s].requiresTech) ? ' (teknoloji gerekli)' : '') }));
  }
  return (def.outputs ?? []).map((o) => ({ value: o, label: goodName(o) }));
}

function outputLabel(g: GameState, f: Facility): string {
  if (f.type === 'assemblyPlant') return g.products[f.output]?.name ?? '—';
  if (f.type === 'dataCenter') return CLOUD[f.output as 'cloud' | 'ai']?.name ?? f.output;
  return goodName(f.output);
}

export default function Production() {
  const g = useGame();
  const c = useSelectedCompany(['extraction', 'processing', 'manufacturing', 'datacenter']);
  const [building, setBuilding] = useState(false);
  const [selling, setSelling] = useState<Facility | null>(null);
  const [expanding, setExpanding] = useState<Facility | null>(null);

  if (!c) return <div className="page"><div className="page-h"><h2>Üretim</h2><CompanyPicker kinds={['extraction', 'processing', 'manufacturing', 'datacenter']} /></div><Empty>Tesis işletebilen bir şirketiniz yok. Şirketler ekranından madencilik, yarı iletken, donanım, mobil veya bulut şirketi kurun.</Empty></div>;

  const kind = SECTORS[c.sector].kind;
  const cap = c.facilities.filter((f) => f.type !== 'dataCenter').reduce((a, f) => a + FACILITIES[f.type].capacity * f.level, 0);
  const dcCap = c.facilities.filter((f) => f.type === 'dataCenter').reduce((a, f) => a + (f.dcCapacity ?? 0), 0);
  const stock = Object.values(c.goodsStock).reduce<number>((a, b) => a + (b ?? 0), 0) + Object.values(c.productStock).reduce((a, b) => a + b, 0);

  const cols: Column<Facility>[] = [
    { key: 'name', label: 'Tesis', sort: (f) => f.name, render: (f) => <div><b>{f.name}</b><div className="muted">{FACILITIES[f.type].name}</div></div> },
    { key: 'country', label: 'Ülke', sort: (f) => g.countries[f.countryId]?.name ?? '', render: (f) => g.countries[f.countryId]?.name ?? f.countryId },
    { key: 'level', label: 'Seviye', align: 'right', sort: (f) => f.level, render: (f) => f.level },
    {
      key: 'output', label: 'Çıktı', render: (f) => {
        const opts = outputOptions(g, c, f);
        if (opts.length <= 1 && f.type !== 'assemblyPlant' && f.type !== 'dataCenter') return outputLabel(g, f);
        if (opts.length === 0) return <span className="muted">Ürün yok</span>;
        const val = opts.some((o) => o.value === f.output) ? f.output : '';
        return <select value={val} onChange={(e) => run((s) => actions.setFacility(s, c.id, f.id, { output: e.target.value }), 'Çıktı değişti')}>
          {val === '' && <option value="">Seçin…</option>}
          {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>;
      },
    },
    {
      key: 'util', label: 'Kullanım', sort: (f) => f.utilization, render: (f) => (
        <div className="inl"><input type="range" min={0} max={100} step={5} value={Math.round(f.utilization * 100)}
          onChange={(e) => run((s) => actions.setFacility(s, c.id, f.id, { utilization: Number(e.target.value) / 100 }))} /><span>{pct(f.utilization, 0)}</span></div>
      ),
    },
    { key: 'cond', label: 'Durum', sort: (f) => f.condition, render: (f) => <div style={{ minWidth: 70 }}><Bar value={f.condition} max={100} tone={f.condition < 40 ? 'neg' : f.condition < 70 ? 'warn' : 'pos'} /><small className="muted">%{f.condition.toFixed(0)}</small></div> },
    {
      key: 'maint', label: 'Bakım', hideOnMobile: true, render: (f) => (
        <Select value={f.maintenance} options={[{ value: 0, label: 'Düşük' }, { value: 1, label: 'Standart' }, { value: 2, label: 'Yoğun' }]}
          onChange={(v) => run((s) => actions.setFacility(s, c.id, f.id, { maintenance: v }))} />
      ),
    },
    { key: 'down', label: 'Arıza', hideOnMobile: true, align: 'right', sort: (f) => f.downDays, render: (f) => f.downDays > 0 ? <Badge tone="neg">{f.downDays} gün</Badge> : <Badge tone="pos">Çalışıyor</Badge> },
    {
      key: 'out', label: 'Üretim / Kapasite', align: 'right', sort: (f) => f.lastOutput,
      render: (f) => f.type === 'dataCenter'
        ? <span>{num(f.dcCapacity ?? 0)} birim</span>
        : <span>{num(f.lastOutput)} / {num(FACILITIES[f.type].capacity * f.level)}</span>,
    },
    {
      key: 'res', label: 'Rezerv / Saflık', hideOnMobile: true, render: (f) => f.type === 'mine'
        ? <span>{num(f.reserve ?? 0)} · %{Math.round((f.purity ?? 0) <= 1 ? (f.purity ?? 0) * 100 : (f.purity ?? 0))}</span> : <span className="muted">—</span>,
    },
    {
      key: 'act', label: 'İşlem', render: (f) => (
        <div className="btn-row">
          {f.level < 10 && <button title={`Seviye ${f.level + 1}`} onClick={() => run((s) => actions.upgradeFacility(s, c.id, f.id), 'Tesis yükseltildi')}>Yükselt {money(facilityUpgradeCost(g, f), 1)}</button>}
          {f.type === 'dataCenter' && <button onClick={() => setExpanding(f)}>Genişlet</button>}
          <button className="danger" onClick={() => setSelling(f)}>Sat</button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-h">
        <h2>Üretim</h2>
        <div className="row"><CompanyPicker kinds={['extraction', 'processing', 'manufacturing', 'datacenter']} />
          <button className="primary" onClick={() => setBuilding(true)}>+ Tesis Kur</button></div>
      </div>
      <div className="kpis">
        <Stat label="Toplam kapasite" value={kind === 'datacenter' ? `${num(dcCap)} birim` : `${num(cap)} /gün`} sub={`${c.facilities.length} tesis`} />
        <Stat label="Kapasite kullanımı" value={kind === 'datacenter' ? '—' : pct(capacityUse(c), 0)} sub="son gün çıktısı / kapasite" />
        <Stat label="Bu ay üretim" value={num(c.ledger.unitsProduced)} sub={`satış: ${num(c.ledger.unitsSold)}`} />
        <Stat label="Stok" value={num(stock)} sub="hammadde + ürün" />
      </div>
      <Card title="Tesisler" info="Kullanım oranı, tesisin hedef doluluğudur: yüksek kullanım daha fazla üretir ama enerji ve aşınmayı artırır. Bakım düzeyi durumu korur, arızaları azaltır.">
        <DataTable rows={c.facilities} columns={cols} rowKey={(f) => f.id} search={(f) => `${f.name} ${FACILITIES[f.type].name} ${g.countries[f.countryId]?.name ?? ''}`}
          filters={[...new Set(c.facilities.map((f) => f.type))].map((t) => ({ label: FACILITIES[t].name, test: (f: Facility) => f.type === t }))}
          empty="Tesis yok — 'Tesis Kur' ile başlayın." />
      </Card>
      {building && <BuildModal c={c} onClose={() => setBuilding(false)} />}
      {selling && <Confirm danger text={`${selling.name} satılsın mı? Defter değeri üzerinden elden çıkarılır.`} onNo={() => setSelling(null)}
        onYes={() => { const id = selling.id; setSelling(null); run((s) => actions.sellFacility(s, c.id, id), 'Tesis satıldı'); }} />}
      {expanding && <ExpandModal c={c} f={expanding} onClose={() => setExpanding(null)} />}
    </div>
  );
}

function ExpandModal({ c, f, onClose }: { c: Company; f: Facility; onClose: () => void }) {
  const [units, setUnits] = useState(1);
  const def = CLOUD[(f.output as 'cloud' | 'ai')] ?? CLOUD.cloud;
  return (
    <Modal title={`${f.name} — Genişlet`} onClose={onClose}
      footer={<><button onClick={onClose}>Kapat</button><button className="primary" onClick={() => { const r = run((s) => actions.expandDataCenter(s, c.id, f.id, units), 'Kapasite eklendi'); if (r.ok) onClose(); }}>Genişlet</button></>}>
      <p className="muted">Her {CATEGORIES[def.inputCategory].name} birimi {def.unitsPerInput} kapasite birimi ekler. Donanım şirket stoğundan veya piyasadan alınır.</p>
      <Field label={`Alınacak ${CATEGORIES[def.inputCategory].name} adedi`}><NumInput value={units} min={1} step={1} onCommit={(v) => setUnits(Math.max(1, Math.round(v)))} /></Field>
      <p>Eklenecek kapasite: <b>{num(units * def.unitsPerInput)}</b> birim · mevcut: {num(f.dcCapacity ?? 0)}</p>
    </Modal>
  );
}

function BuildModal({ c, onClose }: { c: Company; onClose: () => void }) {
  const g = useGame();
  const techs = holdingTechs(g, c);
  const types = SECTORS[c.sector].facilities;
  const [type, setType] = useState<FacilityTypeId>(types[0]);
  const [countryId, setCountryId] = useState(c.countryId);
  const [output, setOutput] = useState('');
  const locked = (t: FacilityTypeId) => { const r = FACILITIES[t].requiresTech; return !!r && !techs.has(r); };
  const idx = useMemo(() => Object.fromEntries(Object.keys(g.countries).map((id) => [id, countryCostIndex(g, id)])), [g, g.day]);
  const opts = outputOptions(g, c, { type, countryId });
  const out = opts.some((o) => o.value === output) ? output : opts[0]?.value ?? '';
  const cost = facilityBuildCost(g, type, countryId);
  const dep = g.countries[countryId]?.deposits ?? {};
  const isMine = type === 'mine';
  const rows = Object.values(g.countries);
  const colsC: Column<(typeof rows)[number]>[] = [
    { key: 'n', label: 'Ülke', sort: (k) => k.name, render: (k) => <b>{k.name}</b> },
    { key: 'score', label: 'Maliyet endeksi', align: 'right', sort: (k) => idx[k.id].score, render: (k) => idx[k.id].score.toFixed(2) },
    { key: 'wage', label: 'Maaş', align: 'right', hideOnMobile: true, sort: (k) => idx[k.id].wage, render: (k) => idx[k.id].wage.toFixed(2) },
    { key: 'en', label: 'Enerji', align: 'right', hideOnMobile: true, sort: (k) => idx[k.id].energy, render: (k) => idx[k.id].energy.toFixed(2) },
    { key: 'tax', label: 'Vergi', align: 'right', hideOnMobile: true, sort: (k) => idx[k.id].tax, render: (k) => idx[k.id].tax.toFixed(2) },
    { key: 'log', label: 'Lojistik', align: 'right', hideOnMobile: true, sort: (k) => idx[k.id].logistics, render: (k) => idx[k.id].logistics.toFixed(2) },
    { key: 'risk', label: 'Risk', align: 'right', hideOnMobile: true, sort: (k) => idx[k.id].risk, render: (k) => idx[k.id].risk.toFixed(2) },
    ...(isMine ? [{ key: 'dep', label: 'Zenginlik', align: 'right' as const, sort: (k: (typeof rows)[number]) => k.deposits[out as keyof typeof GOODS] ?? 0, render: (k: (typeof rows)[number]) => { const v = k.deposits[out as keyof typeof GOODS] ?? 0; return v > 0 ? <Badge tone="pos">%{Math.round(v * 100)}</Badge> : <span className="muted">yok</span>; } }] : []),
    { key: 'sel', label: '', render: (k) => k.id === countryId ? <Badge tone="accent">Seçili</Badge> : <button onClick={() => setCountryId(k.id)}>Seç</button> },
  ];
  const canBuild = !locked(type) && !!out && cost <= c.cash;
  return (
    <Modal title="Tesis Kur" onClose={onClose}
      footer={<><span className="muted">Maliyet: <b>{money(cost)}</b> · Nakit: {money(c.cash)}</span><button onClick={onClose}>Vazgeç</button>
        <button className="primary" disabled={!canBuild} onClick={() => { const r = run((s) => actions.buildFacility(s, c.id, { type, countryId, output: out }), 'Tesis kuruldu'); if (r.ok) onClose(); }}>Kur</button></>}>
      <div className="col">
        <Field label="Tesis türü">
          <div className="opt-grid">{types.map((t) => (
            <button key={t} className={`opt-btn ${t === type ? 'sel' : ''}`} disabled={locked(t)} onClick={() => setType(t)} title={FACILITIES[t].description}>
              {FACILITIES[t].name}<small>{money(FACILITIES[t].buildCost)} {locked(t) && `· Teknoloji: ${FACILITIES[t].requiresTech}`}</small>
            </button>))}</div>
        </Field>
        <p className="muted">{FACILITIES[type].description}</p>
        {opts.length > 0 ? <Field label="Çıktı"><Select value={out} options={opts} onChange={setOutput} /></Field>
          : <p className="warn">{type === 'assemblyPlant' ? 'Önce bir ürün tasarlayın (Ürünler ekranı).' : 'Bu ülkede uygun yatak yok.'}</p>}
        <Field label="Ülke" hint="Maliyet endeksi: ücret, enerji, vergi, lojistik ve risk bileşimi; düşük = ucuz. Madenlerde yatak zenginliği verimi belirler.">
          <span><b>{g.countries[countryId]?.name}</b> {isMine && out && <Badge tone={(dep[out as keyof typeof GOODS] ?? 0) > 0 ? 'pos' : 'neg'}>zenginlik %{Math.round((dep[out as keyof typeof GOODS] ?? 0) * 100)}</Badge>}</span>
        </Field>
        <DataTable rows={rows} columns={colsC} rowKey={(k) => k.id} search={(k) => k.name} initialSort={{ key: 'score', dir: 1 }} pageSize={8} />
        <Info text="Kurulum maliyeti ülkeye göre değişir." />
      </div>
    </Modal>
  );
}
