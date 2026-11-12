import type { Country, GoodId } from '../types';

type Row = [
  id: string, name: string, iso3: string, isoNumeric: string, region: string, lat: number, lon: number,
  pop: number, gdp: number, growth: number, salary: number, unemp: number, tax: number, elec: number,
  internet: number, logistics: number, education: number, tech: number, risk: number, currency: string,
  deposits: Partial<Record<GoodId, number>>,
];

// Balanced, data-driven country model (approximate real-world figures, simplified).
const ROWS: Row[] = [
  ['US', 'Amerika Birleşik Devletleri', 'USA', '840', 'Kuzey Amerika', 39, -98, 335, 27000, 0.022, 6200, 0.04, 0.21, 85, 92, 92, 88, 95, 15, 'USD', { copper: 0.5, gold: 0.4, lithium: 0.3, rareEarth: 0.3, iron: 0.4, silicon: 0.4 }],
  ['CA', 'Kanada', 'CAN', '124', 'Kuzey Amerika', 57, -100, 39, 2100, 0.018, 5000, 0.055, 0.26, 70, 93, 85, 87, 85, 10, 'CAD', { nickel: 0.6, gold: 0.5, cobalt: 0.3, aluminum: 0.6, iron: 0.4 }],
  ['MX', 'Meksika', 'MEX', '484', 'Kuzey Amerika', 23, -102, 128, 1450, 0.025, 1100, 0.03, 0.30, 95, 72, 65, 62, 55, 45, 'MXN', { silver: 0.9, copper: 0.4, gold: 0.3 }],
  ['BR', 'Brezilya', 'BRA', '076', 'Güney Amerika', -10, -52, 216, 2100, 0.025, 900, 0.08, 0.34, 110, 81, 55, 60, 52, 50, 'BRL', { iron: 0.9, nickel: 0.3, rareEarth: 0.3, aluminum: 0.5, gold: 0.3 }],
  ['CL', 'Şili', 'CHL', '152', 'Güney Amerika', -30, -71, 20, 330, 0.022, 1400, 0.085, 0.27, 120, 88, 70, 72, 55, 30, 'CLP', { copper: 1.0, lithium: 0.9, silver: 0.3 }],
  ['AR', 'Arjantin', 'ARG', '032', 'Güney Amerika', -34, -64, 46, 640, 0.01, 700, 0.07, 0.35, 70, 87, 58, 75, 50, 70, 'ARS', { lithium: 0.8, silver: 0.3, gold: 0.3 }],
  ['GB', 'Birleşik Krallık', 'GBR', '826', 'Avrupa', 54, -2, 68, 3300, 0.012, 4800, 0.042, 0.25, 210, 96, 88, 90, 88, 18, 'GBP', {}],
  ['DE', 'Almanya', 'DEU', '276', 'Avrupa', 51, 10, 84, 4400, 0.008, 5100, 0.03, 0.30, 230, 93, 94, 91, 90, 12, 'EUR', { silicon: 0.2 }],
  ['FR', 'Fransa', 'FRA', '250', 'Avrupa', 46, 2, 68, 3000, 0.01, 4300, 0.073, 0.25, 160, 92, 89, 88, 85, 18, 'EUR', {}],
  ['NL', 'Hollanda', 'NLD', '528', 'Avrupa', 52, 5, 18, 1100, 0.015, 5000, 0.036, 0.258, 200, 97, 95, 91, 92, 10, 'EUR', {}],
  ['SE', 'İsveç', 'SWE', '752', 'Avrupa', 62, 15, 10.5, 600, 0.012, 4600, 0.075, 0.206, 60, 96, 90, 92, 90, 8, 'SEK', { iron: 0.7, copper: 0.3, gold: 0.2 }],
  ['PL', 'Polonya', 'POL', '616', 'Avrupa', 52, 19, 37, 840, 0.03, 1900, 0.03, 0.19, 170, 87, 80, 82, 70, 22, 'PLN', { copper: 0.5, silver: 0.5 }],
  ['TR', 'Türkiye', 'TUR', '792', 'Avrupa', 39, 35, 86, 1100, 0.035, 1100, 0.095, 0.25, 110, 83, 75, 70, 62, 48, 'TRY', { gold: 0.3, rareEarth: 0.4, iron: 0.3, silver: 0.2 }],
  ['RU', 'Rusya', 'RUS', '643', 'Avrupa', 60, 90, 144, 2000, 0.012, 900, 0.03, 0.20, 55, 88, 62, 80, 60, 80, 'RUB', { nickel: 0.8, gold: 0.6, cobalt: 0.4, aluminum: 0.6, iron: 0.6 }],
  ['SA', 'Suudi Arabistan', 'SAU', '682', 'Orta Doğu', 24, 45, 36, 1100, 0.03, 2500, 0.055, 0.20, 50, 99, 78, 70, 62, 35, 'SAR', { gold: 0.3, aluminum: 0.4 }],
  ['AE', 'Birleşik Arap Emirlikleri', 'ARE', '784', 'Orta Doğu', 24, 54, 10, 500, 0.035, 3800, 0.03, 0.09, 75, 99, 90, 75, 75, 20, 'AED', {}],
  ['IL', 'İsrail', 'ISR', '376', 'Orta Doğu', 31, 35, 10, 520, 0.03, 4500, 0.035, 0.23, 120, 90, 80, 90, 92, 55, 'ILS', {}],
  ['ZA', 'Güney Afrika', 'ZAF', '710', 'Afrika', -29, 24, 62, 400, 0.01, 1100, 0.32, 0.27, 75, 72, 62, 60, 50, 50, 'ZAR', { gold: 0.8, rareEarth: 0.2, iron: 0.5, nickel: 0.3 }],
  ['CD', 'Demokratik Kongo', 'COD', '180', 'Afrika', -3, 23, 102, 65, 0.06, 150, 0.2, 0.30, 70, 25, 20, 30, 15, 85, 'CDF', { cobalt: 1.0, copper: 0.8 }],
  ['NG', 'Nijerya', 'NGA', '566', 'Afrika', 9, 8, 223, 470, 0.03, 250, 0.33, 0.30, 100, 55, 35, 45, 30, 70, 'NGN', {}],
  ['IN', 'Hindistan', 'IND', '356', 'Asya', 22, 79, 1430, 3700, 0.065, 650, 0.08, 0.25, 90, 52, 60, 62, 65, 40, 'INR', { iron: 0.6, aluminum: 0.4, rareEarth: 0.3 }],
  ['CN', 'Çin', 'CHN', '156', 'Asya', 35, 103, 1410, 17800, 0.045, 1600, 0.05, 0.25, 85, 77, 85, 78, 85, 35, 'CNY', { rareEarth: 1.0, silicon: 0.9, aluminum: 0.6, lithium: 0.4, gold: 0.4, iron: 0.5 }],
  ['JP', 'Japonya', 'JPN', '392', 'Asya', 36, 138, 124, 4200, 0.01, 3600, 0.026, 0.30, 220, 93, 92, 92, 93, 15, 'JPY', {}],
  ['KR', 'Güney Kore', 'KOR', '410', 'Asya', 36, 128, 51.7, 1700, 0.022, 3200, 0.028, 0.24, 110, 98, 91, 93, 94, 25, 'KRW', {}],
  ['TW', 'Tayvan', 'TWN', '158', 'Asya', 23.7, 121, 23.4, 790, 0.03, 2400, 0.035, 0.20, 100, 92, 90, 92, 96, 45, 'TWD', {}],
  ['SG', 'Singapur', 'SGP', '702', 'Asya', 1.35, 103.8, 5.9, 500, 0.025, 5000, 0.02, 0.17, 190, 97, 97, 93, 92, 8, 'SGD', {}],
  ['VN', 'Vietnam', 'VNM', '704', 'Asya', 16, 107, 99, 430, 0.06, 450, 0.022, 0.20, 80, 79, 68, 68, 58, 40, 'VND', { rareEarth: 0.5 }],
  ['ID', 'Endonezya', 'IDN', '360', 'Asya', -2, 118, 277, 1370, 0.05, 450, 0.055, 0.22, 85, 66, 60, 60, 52, 45, 'IDR', { nickel: 1.0, cobalt: 0.3, copper: 0.4, gold: 0.4 }],
  ['AU', 'Avustralya', 'AUS', '036', 'Okyanusya', -25, 134, 26.6, 1700, 0.02, 5300, 0.037, 0.30, 140, 90, 85, 88, 85, 10, 'AUD', { lithium: 1.0, iron: 1.0, gold: 0.6, nickel: 0.5, rareEarth: 0.5, copper: 0.5, aluminum: 0.7 }],
];

export function createCountries(): Record<string, Country> {
  const totalWeightRaw = ROWS.reduce((s, r) => s + r[8] * (0.4 + r[14] / 100 * 0.6), 0);
  const out: Record<string, Country> = {};
  for (const r of ROWS) {
    const [id, name, iso3, isoNumeric, region, lat, lon, pop, gdp, growth, salary, unemp, tax, elec, internet, logistics, education, tech, risk, currency, deposits] = r;
    out[id] = {
      id, name, iso3, isoNumeric, region, lat, lon,
      population: pop, laborForce: pop * 0.48, gdp, gdpGrowth: growth, avgSalary: salary, unemployment: unemp,
      corporateTax: tax, electricityCost: elec, internet, logistics, education, techLevel: tech, politicalRisk: risk,
      currency, fx: 1, deposits, taxModifier: 0,
      marketWeight: (gdp * (0.4 + internet / 100 * 0.6)) / totalWeightRaw,
    };
  }
  return out;
}

export const COUNTRY_IDS = ROWS.map((r) => r[0]);
