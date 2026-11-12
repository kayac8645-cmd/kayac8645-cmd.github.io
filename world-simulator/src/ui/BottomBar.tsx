import { useMemo } from 'react';
import { SPEEDS, useApp } from '../state/store';
import { sim } from '../state/simClient';
import { rendererRef } from './PlanetView';
import { formatDate } from '../core/calendar';

const JUMPS = [
  { y: 10, l: '+10 yıl' }, { y: 100, l: '+100 yıl' }, { y: 1000, l: '+1.000 yıl' }, { y: 100_000, l: '+100 bin' }, { y: 1_000_000, l: '+1 milyon' },
];

export function BottomBar() {
  const running = useApp((s) => s.running);
  const speedIdx = useApp((s) => s.speedIdx);
  const jump = useApp((s) => s.jump);
  const ready = useApp((s) => s.status === 'ready');
  return (
    <footer className="bottombar">
      <div className="time-controls">
        <button className={`play ${running ? 'on' : ''}`} disabled={!ready || jump.active} onClick={() => sim.setRunning(!running)} data-testid="play" aria-label={running ? 'Duraklat' : 'Devam et'}>
          {running ? '❚❚' : '▶'}
        </button>
        <div className="speeds">
          {SPEEDS.map((s, i) => (
            <button key={s} className={i === speedIdx ? 'active' : ''} onClick={() => sim.setSpeedIdx(i)} data-testid={`speed-${s}`}>{s}x</button>
          ))}
        </div>
        <span className="hint desktop-only">1x = 1 gün/sn</span>
        <div className="jumps">
          {jump.active ? (
            <>
              <progress max={1} value={jump.frac} />
              <span>%{Math.round(jump.frac * 100)} · {jump.years.toLocaleString('tr-TR')} yıl</span>
              <button className="mini danger" onClick={() => sim.cancelJump()}>Durdur</button>
            </>
          ) : (
            JUMPS.map((j) => (
              <button key={j.y} disabled={!ready} onClick={() => { sim.setRunning(false); sim.jump(j.y); }} title="Hızlandırılmış uzun dönem hesaplaması (yaklaşık)" data-testid={`jump-${j.y}`}>{j.l}</button>
            ))
          )}
        </div>
      </div>
      <Timeline />
    </footer>
  );
}

function Timeline() {
  const logs = useApp((s) => s.logs);
  const day = useApp((s) => s.stats?.day ?? 0);
  const saves = useApp((s) => s.saves);
  const seed = useApp((s) => s.params.seed);
  const marks = useMemo(() => logs.filter((l) => l.kind === 'disaster' || l.kind === 'extinction' || l.kind === 'species'), [logs]);
  const cps = saves.filter((s) => s.kind === 'checkpoint' && s.seed === seed && s.day <= day);
  const span = Math.max(1, day);
  return (
    <div className="timeline" aria-label="Zaman çizelgesi">
      <div className="track">
        {marks.map((m, i) => (
          <button
            key={i}
            className={`mark ${m.kind}`}
            style={{ left: `${(m.day / span) * 100}%` }}
            title={`${formatDate(m.day)} — ${m.text}`}
            onClick={() => m.lat !== undefined && rendererRef?.controller.flyTo(m.lat, m.lon ?? 0)}
          />
        ))}
        {cps.map((c) => (
          <button
            key={c.id}
            className="mark checkpoint"
            style={{ left: `${(c.day / span) * 100}%` }}
            title={`Kayıt noktası: ${formatDate(c.day)} — geri dönmek için tıklayın`}
            onClick={() => { if (confirm(`${formatDate(c.day)} kayıt noktasına dönülsün mü? Kaydedilmemiş ilerleme kaybolur.`)) sim.loadSaved(c.id); }}
          />
        ))}
      </div>
      <div className="tl-labels"><span>{formatDate(0)}</span><span>{formatDate(day)}</span></div>
    </div>
  );
}
