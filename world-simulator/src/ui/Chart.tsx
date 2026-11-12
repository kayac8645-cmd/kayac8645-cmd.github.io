import { useEffect, useRef } from 'react';

interface Props {
  data: number[];
  color: string;
  height?: number;
  label: string;
  value: string;
  log?: boolean;
}

/** Lightweight canvas sparkline (no chart library). */
export function Sparkline({ data, color, height = 44, label, value, log }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = c.clientWidth || 200;
    c.width = w * dpr;
    c.height = height * dpr;
    const g = c.getContext('2d');
    if (!g) return;
    g.scale(dpr, dpr);
    g.clearRect(0, 0, w, height);
    const vals = data.map((v) => (log ? Math.log10(Math.max(1, v)) : v)).filter((v) => isFinite(v));
    if (vals.length < 2) return;
    let mn = Math.min(...vals), mx = Math.max(...vals);
    if (mx - mn < 1e-6) { mx += 0.5; mn -= 0.5; }
    const pad = 4;
    const x = (i: number) => pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = (v: number) => height - pad - ((v - mn) / (mx - mn)) * (height - pad * 2);
    g.beginPath();
    vals.forEach((v, i) => (i ? g.lineTo(x(i), y(v)) : g.moveTo(x(i), y(v))));
    g.strokeStyle = color;
    g.lineWidth = 1.6;
    g.stroke();
    g.lineTo(x(vals.length - 1), height);
    g.lineTo(x(0), height);
    g.closePath();
    const grad = g.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    g.fillStyle = grad;
    g.fill();
    g.beginPath();
    g.arc(x(vals.length - 1), y(vals[vals.length - 1]), 2.5, 0, Math.PI * 2);
    g.fillStyle = color;
    g.fill();
  }, [data, color, height, log]);
  return (
    <div className="spark">
      <div className="spark-head">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <canvas ref={ref} style={{ width: '100%', height }} />
    </div>
  );
}
