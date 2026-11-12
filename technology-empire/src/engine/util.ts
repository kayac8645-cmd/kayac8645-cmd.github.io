// Shared engine helpers: factories, cost indices, news, effect aggregation.
import type { Company, Country, GameState, Id, Manager, ManagerRole, NewsItem, NewsKind, SectorId } from './types';
import { emptyLedger, MANAGER_ROLES } from './types';
import { TECHS, type TechEffect } from './data/defs';
import { genId, pick, randInt, randRange } from './rng';

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

const FIRST = ['Ayşe', 'Mehmet', 'Elif', 'Can', 'Zeynep', 'Emre', 'Selin', 'Burak', 'Deniz', 'Kerem', 'Lena', 'Marcus', 'Sofia', 'Kenji', 'Mei', 'Arjun', 'Priya', 'Lucas', 'Emma', 'Noah', 'Olivia', 'Hana', 'Diego', 'Ana', 'Yusuf', 'Ida', 'Omar', 'Nora', 'Ravi', 'Ji-woo'];
const LAST = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Arslan', 'Müller', 'Schmidt', 'Rossi', 'Tanaka', 'Kim', 'Chen', 'Patel', 'Singh', 'Silva', 'García', 'Johnson', 'Brown', 'Novak', 'Larsen', 'Haddad', 'Okafor', 'Nguyen', 'Ivanova', 'Dubois'];

export function makeManager(s: GameState, role: ManagerRole, skillHint?: number): Manager {
  const skill = clamp(Math.round(skillHint ?? randRange(s, 30, 92)), 10, 99);
  const experience = clamp(Math.round(skill / 5 + randRange(s, -4, 8)), 1, 35);
  const base = role === 'CEO' ? 22000 : 13000;
  return {
    id: genId(s, 'm'), name: `${pick(s, FIRST)} ${pick(s, LAST)}`, role, skill, experience,
    salary: Math.round(base * (0.4 + (skill / 100) ** 2 * 2.2) * s.macro.wageIndex / 100) * 100,
    performance: 60, hiredDay: s.day,
  };
}

export function refreshCandidates(s: GameState) {
  s.candidates = [];
  for (const role of MANAGER_ROLES) for (let i = 0; i < 3; i++) s.candidates.push(makeManager(s, role));
}

export function addNews(s: GameState, kind: NewsKind, title: string, body: string, opts: { important?: boolean; companyId?: Id; countryId?: Id } = {}) {
  const n: NewsItem = { id: genId(s, 'n'), day: s.day, kind, title, body, important: !!opts.important, companyId: opts.companyId, countryId: opts.countryId };
  s.news.unshift(n);
  if (s.news.length > 300) s.news.length = 300;
}

export function newCompany(s: GameState, p: { name: string; holdingId: Id; sector: SectorId; countryId: Id; cash: number; color: string; icon: string; shares?: number }): Company {
  const id = genId(s, 'c');
  const shares = p.shares ?? 10_000_000;
  const c: Company = {
    id, name: p.name, holdingId: p.holdingId, sector: p.sector, countryId: p.countryId, foundedDay: s.day,
    color: p.color, icon: p.icon, cash: p.cash, loans: [],
    employees: { production: 0, rnd: 3, sales: 3, admin: 2 },
    employeeTargets: { production: 0, rnd: 3, sales: 3, admin: 2 },
    morale: 70, managers: {}, autoManaged: false, brand: 30, satisfaction: 60,
    techs: [], research: null, researchPoints: 0, patents: 0,
    facilities: [], products: [], platforms: [], cloudOffers: [],
    goodsStock: {}, productStock: {}, sourcing: 'internal', transferPriceMult: 1,
    markets: [p.countryId], sharesOutstanding: shares, shareholders: { [p.holdingId]: shares },
    isPublic: false, sharePrice: p.cash / shares, priceHistory: [], ledger: emptyLedger(), reports: [],
    bankrupt: false, distressMonths: 0, revenue30: 0, profit30: 0, dividendPayout: 0,
  };
  s.companies[id] = c;
  return c;
}

/** USD cost factors for operating in a country. */
export function countryCosts(s: GameState, c: Country) {
  return {
    wageMonthly: (c.avgSalary * s.macro.wageIndex) / c.fx,
    elec: (c.electricityCost * s.macro.energyIndex) / c.fx,
    tax: clamp(c.corporateTax + c.taxModifier, 0, 0.6),
    logisticsFee: 0.02 + (100 - c.logistics) / 1200,
  };
}

/** Aggregated multiplicative / additive effects of a company's own techs. */
export function techEffects(c: Company): Required<TechEffect> {
  const e = { efficiency: 1, extraction: 1, costReduction: 0, engagement: 0, quality: 0, dcEfficiency: 0 };
  for (const t of c.techs) {
    const x = TECHS[t]?.effects;
    if (!x) continue;
    if (x.efficiency) e.efficiency *= x.efficiency;
    if (x.extraction) e.extraction *= x.extraction;
    if (x.costReduction) e.costReduction = 1 - (1 - e.costReduction) * (1 - x.costReduction);
    if (x.engagement) e.engagement += x.engagement;
    if (x.quality) e.quality += x.quality;
    if (x.dcEfficiency) e.dcEfficiency = 1 - (1 - e.dcEfficiency) * (1 - x.dcEfficiency);
  }
  return e;
}

export const mgr = (c: Company, r: ManagerRole) => c.managers[r]?.skill ?? 0;

/** Overall operational efficiency 0.4 – 1.35. */
export function companyEfficiency(c: Company): number {
  const req = requiredProductionWorkers(c);
  const staffing = req > 0 ? clamp(c.employees.production / req, 0, 1.1) : 1;
  const adminNeed = adminRequired(c);
  const admin = adminNeed > 0 ? clamp(c.employees.admin / adminNeed, 0.3, 1) : 1;
  const morale = 0.8 + c.morale / 500;
  const leaders = 0.88 + mgr(c, 'CEO') * 0.0015 + mgr(c, 'COO') * 0.0015;
  return clamp(Math.pow(staffing, 0.8) * (0.7 + 0.3 * admin) * morale * leaders, 0.2, 1.35);
}

import { FACILITIES } from './data/defs';
export function requiredProductionWorkers(c: Company): number {
  return c.facilities.reduce((a, f) => a + FACILITIES[f.type].workers * f.level, 0);
}
/** Management complexity: admin staff needed grows super-linearly with size. */
export function adminRequired(c: Company): number {
  const staff = c.employees.production + c.employees.rnd + c.employees.sales;
  return Math.ceil(2 + staff * 0.06 + Math.pow(c.facilities.length + c.markets.length / 3, 1.25) * 1.5);
}

export const SALARY_MULT: Record<string, number> = { production: 0.6, rnd: 1.4, sales: 0.9, admin: 1.0 };

export function randomColor(s: GameState) {
  return pick(s, ['#4f8cff', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#ec4899', '#84cc16', '#f97316']);
}
export { randInt };
