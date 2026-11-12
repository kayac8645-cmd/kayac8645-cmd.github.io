import { useMemo } from 'react';
import { useApp } from '../state/store';
import { fmtNum, fmtT, trendArrow } from './format';
import { Sparkline } from './Chart';
import { eraName } from '../core/civilization';
import { formatDate } from '../core/calendar';
import { rendererRef } from './PlanetView';

function Row({ k, v, t }: { k: string; v: string; t?: string }) {
  return (
    <div className="kv" title={t}>
      <span>{k}</span>
      <b>{v}</b>
    </div>
  );
}

export function RightPanel() {
  const st = useApp((s) => s.stats);
  const history = useApp((s) => s.history);
  const logs = useApp((s) => s.logs);
  const mobilePanel = useApp((s) => s.mobilePanel);
  const series = useMemo(() => ({
    temp: history.map((h) => h.temp),
    co2: history.map((h) => h.co2),
    humans: history.map((h) => h.humans),
    herb: history.map((h) => h.herb),
    carn: history.map((h) => h.carn),
    forest: history.map((h) => h.forest),
    ice: history.map((h) => h.ice),
  }), [history]);
  if (!st) return <aside className={`panel right ${mobilePanel === 'right' ? 'open' : ''}`} />;
  const animals = st.species.filter((s) => s.category !== 'microbe');
  return (
    <aside className={`panel right ${mobilePanel === 'right' ? 'open' : ''}`} data-testid="right-panel">
      <div className="panel-body">
        <section>
          <h3>Gezegen</h3>
          <Row k="Ortalama sıcaklık" v={fmtT(st.meanTemp)} />
          <Row k="Kara / deniz" v={`${fmtT(st.meanLandTemp)} / ${fmtT(st.meanSeaTemp)}`} />
          <Row k="CO₂" v={`${st.co2ppm.toFixed(1)} ppm`} />
          <Row k="Ek ışınımsal zorlama" v={`${st.forcing >= 0 ? '+' : ''}${st.forcing.toFixed(2)} W/m²`} t="Başlangıca göre sera + olay zorlaması" />
          <Row k="Aerosol (AOD)" v={st.aerosol.toFixed(3)} />
          <Row k="Deniz seviyesi" v={`${st.seaLevel >= 0 ? '+' : ''}${st.seaLevel.toFixed(2)} m`} />
          <Row k="Buz örtüsü" v={`%${st.iceAreaPct.toFixed(1)} (deniz buzu %${st.seaIcePct.toFixed(1)})`} />
        </section>
        <section>
          <h3>İklim</h3>
          <Row k="Ortalama yağış" v={`${fmtNum(st.meanPrecip)} mm/yıl`} />
          <Row k="Bağıl nem" v={`%${Math.round(st.meanHumidity * 100)}`} />
          <Row k="Bulut örtüsü" v={`%${Math.round(st.meanCloud * 100)}`} />
          <Row k="Yanan hücre" v={`${st.burningCells}`} />
        </section>
        <section>
          <h3>Ekosistem</h3>
          <Row k="Orman / çayır / çöl" v={`%${st.forestPct.toFixed(0)} / %${st.grassPct.toFixed(0)} / %${st.desertPct.toFixed(0)}`} t="Kara yüzeyine oran" />
          <Row k="Bitki biyokütlesi" v={`${fmtNum(st.plantBiomassGt)} Gt`} />
          <div className="mini-species">
            {animals.map((s) => {
              const tr = trendArrow(s.trend);
              return (
                <div key={s.id} className={s.extinct ? 'extinct' : ''}>
                  <i className="sw" style={{ background: s.color }} />
                  <span>{s.name}</span>
                  <b>{s.extinct ? '—' : fmtNum(s.count)}</b>
                  <span className={`tr ${tr.c}`}>{tr.s}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <h3>Uygarlık</h3>
          <Row k="Nüfus" v={fmtNum(st.humans)} />
          <Row k="Yerleşim" v={`${st.settlements}`} />
          <Row k="En ileri dönem" v={st.settlements ? eraName(st.maxTech) : '—'} t={`Teknoloji ${st.maxTech.toFixed(2)}`} />
          <Row k="Gıda oranı" v={st.settlements ? `${st.meanFood.toFixed(2)}×` : '—'} t="Üretim / ihtiyaç (nüfus ağırlıklı)" />
          <Row k="Tarım arazisi" v={`${fmtNum(st.farmlandKm2)} km²`} />
        </section>
        <section>
          <h3>Zaman serileri</h3>
          <Sparkline label="Sıcaklık" value={fmtT(st.meanTemp)} data={series.temp} color="#ff8a5c" />
          <Sparkline label="CO₂" value={`${st.co2ppm.toFixed(0)} ppm`} data={series.co2} color="#c7a3ff" />
          <Sparkline label="İnsan nüfusu" value={fmtNum(st.humans)} data={series.humans} color="#ffd36b" log />
          <Sparkline label="Otçullar" value={fmtNum(series.herb[series.herb.length - 1] ?? 0)} data={series.herb} color="#6fdc8c" log />
          <Sparkline label="Etçiller" value={fmtNum(series.carn[series.carn.length - 1] ?? 0)} data={series.carn} color="#ff6b6b" log />
          <Sparkline label="Orman (kara %)" value={`%${st.forestPct.toFixed(1)}`} data={series.forest} color="#3fb37f" />
          <Sparkline label="Buz (yüzey %)" value={`%${st.iceAreaPct.toFixed(1)}`} data={series.ice} color="#9fd8ff" />
        </section>
        <section>
          <h3>Olay günlüğü</h3>
          <ul className="log">
            {logs.slice(-40).reverse().map((l, i) => (
              <li key={i} className={l.kind} onClick={() => l.lat !== undefined && rendererRef?.controller.flyTo(l.lat, l.lon ?? 0)}>
                <time>{formatDate(l.day)}</time>
                <span>{l.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
