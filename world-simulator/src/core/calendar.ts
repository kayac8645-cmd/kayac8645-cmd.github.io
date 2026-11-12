export const DAYS_PER_YEAR = 365;
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const MONTH_LEN = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function dateParts(day: number) {
  const year = Math.floor(day / DAYS_PER_YEAR) + 1;
  let doy = Math.floor(day - (year - 1) * DAYS_PER_YEAR);
  let m = 0;
  while (m < 11 && doy >= MONTH_LEN[m]) {
    doy -= MONTH_LEN[m];
    m++;
  }
  const seasonIdx = Math.floor(((m + 1) % 12) / 3); // 0 winter(D,J,F) 1 spring 2 summer 3 autumn
  const seasonsN = ['Kış', 'İlkbahar', 'Yaz', 'Sonbahar'];
  const seasonsS = ['Yaz', 'Sonbahar', 'Kış', 'İlkbahar'];
  return { year, month: m, monthName: MONTHS[m], dayOfMonth: doy + 1, seasonNorth: seasonsN[seasonIdx], seasonSouth: seasonsS[seasonIdx] };
}

export function formatDate(day: number): string {
  const p = dateParts(day);
  return `Yıl ${p.year.toLocaleString('tr-TR')} · ${p.dayOfMonth} ${p.monthName}`;
}

export function dayOfYear(day: number): number {
  return ((day % DAYS_PER_YEAR) + DAYS_PER_YEAR) % DAYS_PER_YEAR;
}
