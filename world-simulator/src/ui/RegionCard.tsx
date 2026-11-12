import { useEffect } from 'react';
import { useApp } from '../state/store';
import { sim } from '../state/simClient';
import { fmtLatLon, fmtNum, fmtT } from './format';
import { rendererRef } from './PlanetView';

const DIRS = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];

export function RegionCard() {
  const selected = useApp((s) => s.selected);
  const cell = useApp((s) => s.cell);
  const set = useApp((s) => s.set);
  const mode = useApp((s) => s.cameraMode);
  // live refresh while open
  useEffect(() => {
    if (!selected) return;
    const t = setInterval(() => sim.query(selected.lat, selected.lon).then((c) => useApp.getState().set({ cell: c })), 1000);
    return () => clearInterval(t);
  }, [selected]);
  if (!selected || !cell) return null;
  const c = cell;
  return (
    <div className="region-card" data-testid="region-card">
      <div className="rc-head">
        <div>
          <div className="rc-title">BÖLGE: {c.region}</div>
          <div className="sub">{fmtLatLon(c.lat, c.lon)} · {c.biome}</div>
        </div>
        <button className="icon-btn" aria-label="Kapat" onClick={() => set({ selected: null, cell: null })}>×</button>
      </div>
      <div className="rc-grid">
        <span>Sıcaklık</span><b>{fmtT(c.temp)}</b>
        <span>Yıllık ort.</span><b>{fmtT(c.tempAnnual)}</b>
        {c.seaTemp !== null && (<><span>Deniz sıcaklığı</span><b>{fmtT(c.seaTemp)}</b></>)}
        <span>Nem (bağıl)</span><b>%{Math.round(c.humidity * 100)}</b>
        <span>Yağış</span><b>{fmtNum(c.precipAnnual)} mm/yıl</b>
        <span>Basınç</span><b>{c.pressure.toFixed(0)} hPa</b>
        <span>Rüzgâr</span><b>{c.windSpeed.toFixed(1)} m/s {DIRS[Math.round(c.windDir / 45) % 8]}</b>
        <span>Bulut</span><b>%{Math.round(c.cloud * 100)}</b>
        <span>Yükseklik</span><b>{fmtNum(c.elevation)} m</b>
        {c.isLand && (<>
          <span>Toprak nemi</span><b>%{Math.round(c.soilWater * 100)}</b>
          <span>Su kaynağı</span><b>%{Math.round(c.waterIndex * 100)}</b>
          <span>Kar / buzul</span><b>{fmtNum(c.snowMm)} mm / {fmtNum(c.iceM)} m</b>
          <span>Örtü (ağaç/ot/çalı)</span><b>%{Math.round(c.tree * 100)} / %{Math.round(c.grass * 100)} / %{Math.round(c.shrub * 100)}</b>
          {c.farm > 0.01 && (<><span>Tarım</span><b>%{Math.round(c.farm * 100)}</b></>)}
        </>)}
        <span>Hayvan popülasyonu</span><b>{fmtNum(c.animalTotal)}</b>
        <span>İnsan nüfusu</span><b>{fmtNum(c.humans)}</b>
        <span>Ekolojik durum</span><b className={`eco ${c.ecoStatus.startsWith('Dengeli') ? 'ok' : c.ecoStatus.startsWith('Kritik') || c.ecoStatus.startsWith('Aktif') ? 'bad' : 'mid'}`}>{c.ecoStatus}</b>
      </div>
      {c.settlement && <div className="rc-note">⌂ {c.settlement}</div>}
      {c.events.length > 0 && <div className="rc-note warn">Etkin olaylar: {c.events.join(', ')}</div>}
      {c.animals.length > 0 && (
        <details>
          <summary>Türler ({c.animals.length})</summary>
          <ul className="rc-species">
            {c.animals.sort((a, b) => b.count - a.count).map((a) => <li key={a.id}><span>{a.name}</span><b>{fmtNum(a.count)}</b></li>)}
          </ul>
        </details>
      )}
      <div className="row">
        {mode === 'space' ? (
          <button className="primary" onClick={() => rendererRef?.controller.enterSurface(c.lat, c.lon, 0.05)} data-testid="descend">Yüzeye in</button>
        ) : (
          <button onClick={() => rendererRef?.controller.flyTo(c.lat, c.lon)}>Buraya git</button>
        )}
      </div>
      <p className="fineprint">Değerler simülasyon ızgarasından (≈2.25°) gelir; model yaklaşık sonuçlar üretir.</p>
    </div>
  );
}

export function CameraButtons() {
  const mode = useApp((s) => s.cameraMode);
  return (
    <div className="cam-buttons">
      {mode === 'space' ? (
        <button onClick={() => { const f = rendererRef?.controller.focusLatLon(); if (f) rendererRef?.controller.enterSurface(f.lat, f.lon, 0.06); }} data-testid="to-surface">Yüzey modu</button>
      ) : (
        <button onClick={() => rendererRef?.controller.exitToSpace()} data-testid="to-space">Uzay modu</button>
      )}
      <button onClick={() => { if (rendererRef) rendererRef.controller.autoRotate = !rendererRef.controller.autoRotate; }} title="Otomatik dönüş">⟳</button>
      <button onClick={() => rendererRef?.controller.zoom(0.7)} aria-label="Yakınlaş">+</button>
      <button onClick={() => rendererRef?.controller.zoom(1.4)} aria-label="Uzaklaş">−</button>
    </div>
  );
}
