import { useMemo } from 'react';
import { Badge, Card, DataTable, Empty, Stat, type Column } from '../components/ui';
import { LineChartBox, BarChartBox } from '../components/charts';
import { useGame, useStore } from '../../store/gameStore';
import { aggregateReports, alerts, marketCap, netWorth, playerCompanies, sectorName, totalEmployees } from '../../engine/selectors';
import type { Company, Macro } from '../../engine/types';
import { gameDate, gameMonth, money, num, pct } from '../format';

const PHASE: Record<Macro['phase'], { label: string; tone: 'pos' | 'warn' | 'neg' | 'accent' }> = {
  expansion: { label: 'Genişleme', tone: 'pos' },
  slowdown: { label: 'Yavaşlama', tone: 'warn' },
  recession: { label: 'Durgunluk', tone: 'neg' },
  recovery: { label: 'Toparlanma', tone: 'accent' },
};

export default function Overview() {
  const g = useGame();
  const rev = useStore((s) => s.rev);
  const selectCompany = useStore((s) => s.selectCompany);
  const setScreen = useStore((s) => s.setScreen);
  const holding = g.holdings[g.playerHoldingId];
  const mine = playerCompanies(g);

  const d = useMemo(() => {
    const reports = aggregateReports(mine, 24).map((r) => ({ ...r, label: gameMonth(r.day) }));
    const nw = holding.netWorthHistory.slice(-48).map((p) => ({ label: gameMonth(p.day), value: p.value }));
    const news = [...g.news].sort((a, b) => b.day - a.day).slice(0, 6);
    return { reports, nw, news };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rev]);

  const rev30 = mine.reduce((a, c) => a + c.revenue30, 0);
  const profit30 = mine.reduce((a, c) => a + c.profit30, 0);
  const cap = mine.reduce((a, c) => a + marketCap(c), 0);
  const emp = mine.reduce((a, c) => a + totalEmployees(c), 0);
  const al = alerts(g);
  const m = g.macro;
  const ph = PHASE[m.phase];

  const openCompany = (id: string) => { selectCompany(id); setScreen('companies'); };

  const cols: Column<Company>[] = [
    { key: 'name', label: 'Şirket', sort: (c) => c.name, render: (c) => <b>{c.icon} {c.name}</b> },
    { key: 'sector', label: 'Sektör', sort: (c) => c.sector, render: (c) => sectorName(c.sector), hideOnMobile: true },
    { key: 'cash', label: 'Nakit', align: 'right', sort: (c) => c.cash, render: (c) => <span className={c.cash < 0 ? 'neg' : ''}>{money(c.cash)}</span> },
    { key: 'rev', label: 'Gelir (30g)', align: 'right', sort: (c) => c.revenue30, render: (c) => money(c.revenue30) },
    { key: 'profit', label: 'Kâr (30g)', align: 'right', sort: (c) => c.profit30, render: (c) => <span className={c.profit30 >= 0 ? 'pos' : 'neg'}>{money(c.profit30)}</span> },
  ];

  return (
    <div className="page">
      <div className="page-h"><h1>📊 Genel Bakış</h1><span className="muted">{gameDate(g.day)}</span></div>

      <div className="kpis">
        <Stat label="Holding nakdi" value={money(holding.cash)} />
        <Stat label="Net değer" value={money(netWorth(g, g.playerHoldingId))} />
        <Stat label="Gelir (30 gün)" value={money(rev30)} />
        <Stat label="Net kâr (30 gün)" value={money(profit30)} tone={profit30 >= 0 ? 'pos' : 'neg'} />
        <Stat label="Piyasa değeri" value={money(cap)} sub="Şirketlerin toplamı" />
        <Stat label="Çalışan" value={num(emp, 0)} sub={`${mine.length} şirket`} />
      </div>

      <div className="grid-2">
        <Card title="Gelir ve net kâr (aylık)">
          {d.reports.length < 2 ? <Empty>Aylık raporlar ay sonunda oluşur. Oyunu ilerletin.</Empty>
            : <BarChartBox data={d.reports} x="label" series={[{ key: 'revenue', name: 'Gelir' }, { key: 'netIncome', name: 'Net kâr', color: '#22c55e' }]} fmt={(v) => money(v)} />}
        </Card>
        <Card title="Holding net değeri">
          {d.nw.length < 2 ? <Empty>Net değer geçmişi ay sonunda oluşur.</Empty>
            : <LineChartBox data={d.nw} x="label" series={[{ key: 'value', name: 'Net değer' }]} fmt={(v) => money(v)} area />}
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Uyarılar" actions={<Badge tone={al.some((a) => a.level === 'danger') ? 'neg' : al.length ? 'warn' : 'pos'}>{al.length}</Badge>}>
          {al.length === 0 ? <Empty>Her şey yolunda.</Empty> : (
            <div className="col" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {al.slice(0, 30).map((a, i) => (
                <button key={i} className={`alert ${a.level}`} disabled={!a.companyId} onClick={() => a.companyId && openCompany(a.companyId)}>
                  <span>{a.level === 'danger' ? '🔴' : a.level === 'warn' ? '🟠' : '🔵'}</span><span>{a.text}</span>
                </button>
              ))}
            </div>
          )}
        </Card>
        <Card title="Makroekonomi" actions={<Badge tone={ph.tone}>{ph.label}</Badge>}>
          <div className="kv">
            <span>Küresel büyüme (yıllık)</span><span className={m.gdpGrowth >= 0 ? 'pos' : 'neg'}>{pct(m.gdpGrowth)}</span>
            <span>Enflasyon (yıllık)</span><span>{pct(m.inflation)}</span>
            <span>Merkez bankası faizi</span><span>{pct(m.baseRate)}</span>
            <span>Talep endeksi</span><span className={m.demandIndex >= 1 ? 'pos' : 'neg'}>{m.demandIndex.toFixed(2)}</span>
            <span>Enerji endeksi</span><span>{m.energyIndex.toFixed(2)}</span>
            <span>Ücret endeksi</span><span>{m.wageIndex.toFixed(2)}</span>
          </div>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Şirketlerim" actions={<button className="sm" onClick={() => setScreen('companies')}>Tümü</button>}>
          <DataTable rows={mine} columns={cols} rowKey={(c) => c.id} onRowClick={(c) => openCompany(c.id)} empty="Henüz şirketiniz yok" />
        </Card>
        <Card title="Son haberler" actions={<button className="sm" onClick={() => setScreen('news')}>Tümü</button>}>
          {d.news.length === 0 ? <Empty>Henüz haber yok.</Empty> : (
            <div className="col">
              {d.news.map((n) => (
                <div key={n.id}>
                  <div className="row" style={{ gap: 6 }}>{n.important && <Badge tone="warn">Önemli</Badge>}<b>{n.title}</b></div>
                  <div className="muted small">{gameDate(n.day)} · {n.body}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
