import { Fragment, useMemo, useState } from 'react';
import './screensB.css';
import * as actions from '../../engine/actions';
import { CATEGORIES, FACILITIES, GOODS, GOOD_IDS, SECTORS } from '../../engine/data/defs';
import type { Company, GameState, GoodId, SectorId } from '../../engine/types';
import { goodName, playerCompanies } from '../../engine/selectors';
import { useGame, useStore } from '../../store/gameStore';
import { Badge, Card, DataTable, Empty, Field, Info, NumInput, Select, Stat, type Column } from '../components/ui';
import CompanyPicker, { useSelectedCompany } from '../components/CompanyPicker';
import { Spark } from '../components/charts';
import { money, num, pct } from '../format';

const run = useStore.getState().run;

const STAGES: { name: string; sectors: SectorId[] }[] = [
  { name: 'Maden', sectors: ['mining'] },
  { name: 'Yarı İletken', sectors: ['semiconductor'] },
  { name: 'Donanım / Mobil', sectors: ['hardware', 'mobile'] },
  { name: 'Bulut', sectors: ['cloud'] },
  { name: 'Platform', sectors: ['social', 'software'] },
];

/** Daily input needs of a company given current utilisation. */
function dailyNeeds(g: GameState, c: Company): Partial<Record<GoodId, number>> {
  const need: Partial<Record<GoodId, number>> = {};
  for (const f of c.facilities) {
    if (f.downDays > 0) continue;
    const units = FACILITIES[f.type].capacity * f.level * f.utilization;
    let recipe: Partial<Record<GoodId, number>> | undefined;
    if (f.type === 'assemblyPlant') recipe = g.products[f.output]?.bom;
    else if (f.type !== 'mine' && f.type !== 'dataCenter') recipe = GOODS[f.output as GoodId]?.recipe;
    if (!recipe) continue;
    for (const [k, v] of Object.entries(recipe)) need[k as GoodId] = (need[k as GoodId] ?? 0) + (v ?? 0) * units;
  }
  return need;
}

/** Daily supply capacity of a company for each good it produces. */
function dailySupply(c: Company): Partial<Record<GoodId, number>> {
  const out: Partial<Record<GoodId, number>> = {};
  for (const f of c.facilities) {
    if (f.type === 'assemblyPlant' || f.type === 'dataCenter') continue;
    out[f.output as GoodId] = (out[f.output as GoodId] ?? 0) + FACILITIES[f.type].capacity * f.level * f.utilization;
  }
  return out;
}

export default function Supply() {
  const g = useGame();
  const c = useSelectedCompany();
  const [good, setGood] = useState<GoodId>('copper');
  const [qty, setQty] = useState(100);
  const sisters = useMemo(() => playerCompanies(g).filter((o) => o.id !== c?.id), [g, c?.id, g.day]);

  if (!c) return <div className="page"><div className="page-h"><h2>Tedarik</h2></div><Empty>Şirket yok.</Empty></div>;

  const need = dailyNeeds(g, c);
  const needIds = Object.keys(need) as GoodId[];
  const stockRows = (Object.entries(c.goodsStock) as [GoodId, number][]).filter(([, q]) => q > 0.5);
  const prodRows = Object.entries(c.productStock).filter(([, q]) => q > 0.5);
  const m = g.commodities[good];

  const cols: Column<GoodId>[] = [
    { key: 'n', label: 'Mal', sort: (id) => GOODS[id].name, render: (id) => <div><b>{GOODS[id].name}</b><div className="muted">{GOODS[id].raw ? 'Hammadde' : 'Ara mal'} · {GOODS[id].unit}</div></div> },
    { key: 'p', label: 'Fiyat', align: 'right', sort: (id) => g.commodities[id].price, render: (id) => money(g.commodities[id].price) },
    { key: 'ch', label: 'Baz fiyata göre', align: 'right', sort: (id) => g.commodities[id].price / g.commodities[id].basePrice, render: (id) => { const r = g.commodities[id].price / g.commodities[id].basePrice - 1; return <span className={r >= 0 ? 'pos' : 'neg'}>{r >= 0 ? '+' : ''}{(r * 100).toFixed(1)}%</span>; } },
    { key: 'sp', label: 'Seyir', hideOnMobile: true, render: (id) => <Spark values={g.commodities[id].history.slice(-90)} /> },
    { key: 'sup', label: 'Arz', align: 'right', hideOnMobile: true, sort: (id) => g.commodities[id].npcSupply, render: (id) => num(g.commodities[id].npcSupply) },
    { key: 'dem', label: 'Talep', align: 'right', hideOnMobile: true, sort: (id) => g.commodities[id].npcDemand, render: (id) => num(g.commodities[id].npcDemand) },
    { key: 'sh', label: 'Şok', render: (id) => { const k = g.commodities[id]; return k.shockDays > 0 && k.supplyShock !== 1 ? <Badge tone={k.supplyShock < 1 ? 'neg' : 'pos'}>{k.supplyShock < 1 ? 'Arz kıtlığı' : 'Arz bolluğu'} ({k.shockDays}g)</Badge> : <span className="muted">—</span>; } },
    { key: 'st', label: 'Stok', align: 'right', sort: (id) => c.goodsStock[id] ?? 0, render: (id) => num(c.goodsStock[id] ?? 0) },
    { key: 'a', label: '', render: (id) => <button onClick={() => setGood(id)}>İşlem</button> },
  ];

  return (
    <div className="page">
      <div className="page-h"><h2>Tedarik &amp; Emtia</h2><CompanyPicker /></div>
      <div className="kpis">
        <Stat label="Nakit" value={money(c.cash)} />
        <Stat label="Hammadde stoğu" value={num(stockRows.reduce((a, [, q]) => a + q, 0))} sub={`${stockRows.length} kalem`} />
        <Stat label="Ürün stoğu" value={num(prodRows.reduce((a, [, q]) => a + q, 0))} sub={`${prodRows.length} ürün`} />
        <Stat label="Tedarik politikası" value={c.sourcing === 'internal' ? 'İç tedarik' : 'Piyasa'} sub={`transfer ×${c.transferPriceMult.toFixed(2)}`} />
      </div>

      <div className="grid-2">
        <Card title="Şirket Stoğu">
          {stockRows.length === 0 && prodRows.length === 0 ? <Empty>Stok yok.</Empty> : (
            <div className="kv">
              {stockRows.map(([id, q]) => <Fragment key={id}><span>{goodName(id)}</span><span>{num(q)} · {money(q * g.commodities[id].price)}</span></Fragment>)}
              {prodRows.map(([id, q]) => <Fragment key={id}><span>{g.products[id]?.name ?? id}</span><span>{num(q)} adet</span></Fragment>)}
            </div>)}
        </Card>
        <Card title="Tedarik Politikası" info="İç tedarik: girdiler önce holding içindeki kardeş şirketlerden transfer fiyatıyla alınır, eksik kalan piyasadan. Piyasa: yalnızca küresel emtia piyasası kullanılır. Transfer fiyat çarpanı, bu şirketin kardeşlere sattığı malın piyasa fiyatına oranıdır.">
          <div className="form-grid">
            <Field label="Girdi kaynağı"><Select value={c.sourcing} options={[{ value: 'internal', label: 'İç tedarik (kardeş şirketler)' }, { value: 'market', label: 'Yalnızca piyasa' }]}
              onChange={(v) => run((s) => actions.setSourcing(s, c.id, { sourcing: v }), 'Politika güncellendi')} /></Field>
            <Field label="Transfer fiyat çarpanı" hint="0.5–1.5 arası. 1 = piyasa fiyatı."><NumInput value={c.transferPriceMult} min={0.5} max={1.5} step={0.05}
              onCommit={(v) => run((s) => actions.setSourcing(s, c.id, { transferPriceMult: v }), 'Transfer fiyatı güncellendi')} /></Field>
          </div>
        </Card>
      </div>

      <Card title="Emtia Alım / Satım" info="Seçili şirketin kasasından piyasa fiyatıyla alım yapar veya şirket stoğunu piyasaya satar. Büyük işlemler fiyatı etkiler.">
        <div className="row" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Field label="Mal"><Select value={good} options={GOOD_IDS.map((id) => ({ value: id, label: GOODS[id].name }))} onChange={setGood} /></Field>
          <Field label={`Miktar (${GOODS[good].unit})`}><NumInput value={qty} min={1} step={10} onCommit={(v) => setQty(Math.max(1, Math.round(v)))} /></Field>
          <div>Fiyat <b>{money(m.price)}</b> · Tutar <b>{money(m.price * qty)}</b> · Stok <b>{num(c.goodsStock[good] ?? 0)}</b></div>
          <div className="btn-row">
            <button className="primary" onClick={() => run((s) => actions.tradeGood(s, c.id, good, qty), `${qty} ${GOODS[good].unit} ${goodName(good)} alındı`)}>Satın al</button>
            <button onClick={() => run((s) => actions.tradeGood(s, c.id, good, -qty), `${qty} ${GOODS[good].unit} ${goodName(good)} satıldı`)}>Sat</button>
            <button className="ghost" onClick={() => setQty(Math.max(1, Math.floor(c.goodsStock[good] ?? 0)))}>Tüm stok</button>
          </div>
        </div>
      </Card>

      <Card title="Küresel Emtia Piyasası">
        <DataTable rows={GOOD_IDS} columns={cols} rowKey={(id) => id} search={(id) => GOODS[id].name}
          filters={[{ label: 'Hammadde', test: (id) => GOODS[id].raw }, { label: 'Ara mal', test: (id) => !GOODS[id].raw }]} />
      </Card>

      <Card title="Girdi İhtiyacı (BOM)" info="Tesislerinizin mevcut kullanım oranında günlük tükettiği girdiler ve bunları üretebilen kardeş şirketler.">
        {needIds.length === 0 ? <Empty>Bu şirketin tesisleri girdi tüketmiyor (veya tesis/ürün yok).</Empty> : (
          <DataTable rows={needIds} rowKey={(id) => id} columns={[
            { key: 'g', label: 'Girdi', sort: (id) => GOODS[id].name, render: (id) => <b>{GOODS[id].name}</b> },
            { key: 'n', label: 'Günlük ihtiyaç', align: 'right', sort: (id) => need[id] ?? 0, render: (id) => `${num(need[id] ?? 0)} ${GOODS[id].unit}` },
            { key: 's', label: 'Stok', align: 'right', render: (id) => num(c.goodsStock[id] ?? 0) },
            { key: 'd', label: 'Yeterlilik', align: 'right', sort: (id) => (c.goodsStock[id] ?? 0) / Math.max(1e-9, need[id] ?? 1), render: (id) => { const d = (c.goodsStock[id] ?? 0) / Math.max(1e-9, need[id] ?? 1); return <span className={d < 2 ? 'neg' : d < 7 ? 'warn' : 'pos'}>{d.toFixed(1)} gün</span>; } },
            { key: 'c', label: 'Günlük maliyet', align: 'right', hideOnMobile: true, render: (id) => money((need[id] ?? 0) * g.commodities[id].price) },
            { key: 'sup', label: 'Kardeş tedarikçiler', render: (id) => {
              const list = sisters.map((o) => ({ o, d: dailySupply(o)[id] ?? 0 })).filter((x) => x.d > 0);
              return list.length ? list.map((x) => <Badge key={x.o.id} tone="accent">{x.o.name}: {num(x.d)}/gün</Badge>) : <span className="muted">yok — piyasadan</span>;
            } },
          ] as Column<GoodId>[]} />
        )}
        {c.products.length > 0 && SECTORS[c.sector].kind === 'manufacturing' && (
          <div style={{ marginTop: 12 }}>
            <h4>Aktif ürünlerin birim BOM'u</h4>
            <div className="kv">
              {c.products.map((id) => g.products[id]).filter((p) => p?.active).map((p) => (
                <Fragment key={p.id}><span>{p.name} <small className="muted">({CATEGORIES[p.category].name})</small></span>
                  <span>{(Object.entries(p.bom) as [GoodId, number][]).map(([k, v]) => `${v} ${goodName(k)}`).join(', ')}</span></Fragment>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card title="Holding İç Tedarik Zinciri" info="Holdingdeki şirketler üretim aşamasına göre sıralanır: Maden → Yarı iletken → Donanım/Mobil → Bulut. Her şirketin ürettiği mallar ve stokları gösterilir.">
        <div className="chain">
          {STAGES.map((st) => {
            const list = playerCompanies(g).filter((o) => st.sectors.includes(o.sector));
            return (
              <div key={st.name} className="chain-col">
                <b>{st.name} <Info text={st.sectors.map((s) => SECTORS[s].name).join(', ')} /></b>
                {list.length === 0 && <span className="muted">Şirket yok</span>}
                {list.map((o) => {
                  const sup = dailySupply(o);
                  return (
                    <div key={o.id} onClick={() => useStore.getState().selectCompany(o.id)} style={{ cursor: 'pointer' }}>
                      <div><b>{o.name}</b> {o.id === c.id && <Badge tone="accent">seçili</Badge>}</div>
                      {(Object.entries(sup) as [GoodId, number][]).map(([k, v]) => <div key={k} className="muted">{goodName(k)}: {num(v)}/gün · stok {num(o.goodsStock[k] ?? 0)}</div>)}
                      {o.facilities.filter((f) => f.type === 'assemblyPlant').map((f) => <div key={f.id} className="muted">{g.products[f.output]?.name ?? 'ürün'}: {num(f.lastOutput)}/gün</div>)}
                      {o.facilities.filter((f) => f.type === 'dataCenter').map((f) => <div key={f.id} className="muted">{f.output}: {num(f.dcCapacity ?? 0)} birim</div>)}
                      <div className="muted">kullanım {pct(o.facilities.length ? o.facilities.reduce((a, f) => a + f.utilization, 0) / o.facilities.length : 0, 0)}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
