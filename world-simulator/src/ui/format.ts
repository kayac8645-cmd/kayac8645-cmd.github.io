export function fmtNum(n: number, digits = 0): string {
  if (!isFinite(n)) return '—';
  const a = Math.abs(n);
  if (a >= 1e12) return (n / 1e12).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' trilyon';
  if (a >= 1e9) return (n / 1e9).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' milyar';
  if (a >= 1e6) return (n / 1e6).toLocaleString('tr-TR', { maximumFractionDigits: 1 }) + ' milyon';
  if (a >= 1e4) return Math.round(n).toLocaleString('tr-TR');
  return n.toLocaleString('tr-TR', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}
export const fmtT = (t: number) => `${t.toLocaleString('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}°C`;
export const fmtPct = (v: number, d = 0) => `%${(v * 100).toLocaleString('tr-TR', { maximumFractionDigits: d })}`;
export function fmtLatLon(lat: number, lon: number) {
  return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'K' : 'G'} ${Math.abs(lon).toFixed(1)}°${lon >= 0 ? 'D' : 'B'}`;
}
export function trendArrow(t: number) {
  if (t > 0.02) return { s: '▲', c: 'up' };
  if (t < -0.02) return { s: '▼', c: 'down' };
  return { s: '■', c: 'flat' };
}
