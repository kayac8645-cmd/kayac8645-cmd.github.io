// Recharts wrappers with consistent dark styling.
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar as RBar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

export const PALETTE = ['#4f8cff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b'];
const axis = { stroke: '#64748b', fontSize: 11, tickLine: false } as const;
const tip = { contentStyle: { background: '#111827', border: '1px solid #273244', borderRadius: 8, fontSize: 12 }, labelStyle: { color: '#94a3b8' } };

export interface Series { key: string; name: string; color?: string }

export function LineChartBox<T extends object>({ data, x, series, height = 220, fmt, area }: { data: T[]; x: keyof T & string; series: Series[]; height?: number; fmt?: (v: number) => string; area?: boolean }) {
  const C = area ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <C data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1e293b" vertical={false} />
        <XAxis dataKey={x} {...axis} minTickGap={24} />
        <YAxis {...axis} width={64} tickFormatter={fmt} />
        <Tooltip {...tip} formatter={(v) => (fmt ? fmt(Number(v)) : String(v))} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => area
          ? <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? PALETTE[i]} fill={s.color ?? PALETTE[i]} fillOpacity={0.15} strokeWidth={2} dot={false} isAnimationActive={false} />
          : <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? PALETTE[i]} strokeWidth={2} dot={false} isAnimationActive={false} />)}
      </C>
    </ResponsiveContainer>
  );
}

export function BarChartBox<T extends object>({ data, x, series, height = 220, fmt, stacked }: { data: T[]; x: keyof T & string; series: Series[]; height?: number; fmt?: (v: number) => string; stacked?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#1e293b" vertical={false} />
        <XAxis dataKey={x} {...axis} />
        <YAxis {...axis} width={64} tickFormatter={fmt} />
        <Tooltip {...tip} formatter={(v) => (fmt ? fmt(Number(v)) : String(v))} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => <RBar key={s.key} dataKey={s.key} name={s.name} fill={s.color ?? PALETTE[i]} stackId={stacked ? 'a' : undefined} isAnimationActive={false} radius={stacked ? 0 : [3, 3, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieBox({ data, height = 220, fmt }: { data: { name: string; value: number; color?: string }[]; height?: number; fmt?: (v: number) => string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={1} isAnimationActive={false}>
          {data.map((d, i) => <Cell key={d.name} fill={d.color ?? PALETTE[i % PALETTE.length]} stroke="none" />)}
        </Pie>
        <Tooltip {...tip} formatter={(v) => (fmt ? fmt(Number(v)) : String(v))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Tiny inline sparkline (SVG, no recharts overhead) for tables. */
export function Spark({ values, width = 80, height = 22, color }: { values: number[]; width?: number; height?: number; color?: string }) {
  if (values.length < 2) return <svg width={width} height={height} />;
  const min = Math.min(...values), max = Math.max(...values), r = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / r) * (height - 2) - 1}`).join(' ');
  const up = values[values.length - 1] >= values[0];
  return <svg width={width} height={height}><polyline points={pts} fill="none" stroke={color ?? (up ? '#22c55e' : '#ef4444')} strokeWidth={1.5} /></svg>;
}
