// Formatting helpers (Turkish locale).
export function money(v: number, digits = 1): string {
  const a = Math.abs(v), sign = v < 0 ? '-' : '';
  if (a >= 1e12) return `${sign}$${(a / 1e12).toFixed(digits)} T`;
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(digits)} Mr`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(digits)} M`;
  if (a >= 1e4) return `${sign}$${(a / 1e3).toFixed(digits)} B`;
  return `${sign}$${a.toFixed(a < 100 ? 2 : 0)}`;
}
export function num(v: number, digits = 1): string {
  const a = Math.abs(v), sign = v < 0 ? '-' : '';
  if (a >= 1e9) return `${sign}${(a / 1e9).toFixed(digits)} Mr`;
  if (a >= 1e6) return `${sign}${(a / 1e6).toFixed(digits)} M`;
  if (a >= 1e4) return `${sign}${(a / 1e3).toFixed(digits)} B`;
  return `${sign}${a.toLocaleString('tr-TR', { maximumFractionDigits: a < 10 ? 2 : 0 })}`;
}
export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
/** Game day 0 = 1 Ocak 2030. 360-day year, 30-day months. */
export function gameDate(day: number): string {
  const y = 2030 + Math.floor(day / 360), m = Math.floor((day % 360) / 30), d = (day % 30) + 1;
  return `${d} ${MONTHS[m]} ${y}`;
}
export const gameMonth = (day: number) => `${MONTHS[Math.floor((day % 360) / 30)]} ${2030 + Math.floor(day / 360)}`;
