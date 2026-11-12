// Derived read-only metrics for UI. Never mutate state here.
import type { Company, GameState, Holding, Id, ManagerRole } from './types';
import { CATEGORIES, FACILITIES, GOODS, SECTORS, TECHS } from './data/defs';

export const playerHolding = (s: GameState): Holding => s.holdings[s.playerHoldingId];
export const companiesOf = (s: GameState, holdingId: Id): Company[] =>
  Object.values(s.companies).filter((c) => c.holdingId === holdingId && !c.bankrupt);
export const playerCompanies = (s: GameState) => companiesOf(s, s.playerHoldingId);
export const rivalHoldings = (s: GameState) => Object.values(s.holdings).filter((h) => !h.isPlayer);

export const debtOf = (c: Company) => c.loans.reduce((a, l) => a + l.balance, 0);

export function inventoryValue(s: GameState, c: Company): number {
  let v = 0;
  for (const [g, q] of Object.entries(c.goodsStock)) v += (q ?? 0) * s.commodities[g as keyof typeof GOODS].price;
  for (const [pid, q] of Object.entries(c.productStock)) {
    const p = s.products[pid];
    if (p) v += q * p.unitMaterialCost;
  }
  return v;
}
export const fixedAssets = (c: Company) => c.facilities.reduce((a, f) => a + f.bookValue, 0);
export const totalAssets = (s: GameState, c: Company) => Math.max(0, c.cash) + inventoryValue(s, c) + fixedAssets(c);
export const bookEquity = (s: GameState, c: Company) => totalAssets(s, c) - debtOf(c) - Math.max(0, -c.cash);
export const marketCap = (c: Company) => c.sharePrice * c.sharesOutstanding;
export const totalEmployees = (c: Company) => c.employees.production + c.employees.rnd + c.employees.sales + c.employees.admin;

/** Fraction of company owned by holding. */
export const ownership = (c: Company, holdingId: Id) => (c.shareholders[holdingId] ?? 0) / c.sharesOutstanding;
export const freeFloat = (c: Company) => 1 - Object.values(c.shareholders).reduce((a, b) => a + b, 0) / c.sharesOutstanding;

/** Holding net worth = holding cash + Σ ownership × max(marketCap, 0) of every company it holds shares in. */
export function netWorth(s: GameState, holdingId: Id): number {
  let v = s.holdings[holdingId].cash;
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt) continue;
    const sh = c.shareholders[holdingId];
    if (sh) v += (sh / c.sharesOutstanding) * marketCap(c);
  }
  return v;
}

/** Capacity utilisation of company facilities (0-1). */
export function capacityUse(c: Company): number {
  let cap = 0, out = 0;
  for (const f of c.facilities) {
    const def = FACILITIES[f.type];
    if (f.type === 'dataCenter') continue;
    cap += def.capacity * f.level;
    out += f.lastOutput;
  }
  return cap > 0 ? out / cap : 0;
}

/** Monthly salary bill estimate. */
export function payrollMonthly(s: GameState, c: Company): number {
  const country = s.countries[c.countryId];
  const staff = totalEmployees(c) * country.avgSalary * s.macro.wageIndex;
  const mgr = Object.values(c.managers).reduce((a, m) => a + (m?.salary ?? 0), 0);
  return staff + mgr;
}

export const managerSkill = (c: Company, role: ManagerRole) => c.managers[role]?.skill ?? 0;

/** Techs whose prerequisites are met for this company's sector and not yet owned. */
export function availableTechs(c: Company) {
  return Object.values(TECHS).filter((t) => t.sector === c.sector && !c.techs.includes(t.id) && t.prereq.every((p) => c.techs.includes(p)));
}
/** Techs usable by company: own + holding sister companies (shared within holding). */
export function holdingTechs(s: GameState, c: Company): Set<string> {
  const set = new Set<string>();
  for (const o of Object.values(s.companies)) if (o.holdingId === c.holdingId && !o.bankrupt) o.techs.forEach((t) => set.add(t));
  return set;
}

export const sectorName = (id: string) => SECTORS[id as keyof typeof SECTORS]?.name ?? id;
export const categoryName = (id: string) => CATEGORIES[id as keyof typeof CATEGORIES]?.name ?? id;
export const goodName = (id: string) => GOODS[id as keyof typeof GOODS]?.name ?? id;

/** Last N monthly reports aggregated over a list of companies (for holding-level charts). */
export function aggregateReports(cs: Company[], n = 24) {
  const byDay = new Map<number, { day: number; revenue: number; netIncome: number; cash: number; debt: number; marketCap: number }>();
  for (const c of cs) for (const r of c.reports.slice(-n)) {
    const e = byDay.get(r.day) ?? { day: r.day, revenue: 0, netIncome: 0, cash: 0, debt: 0, marketCap: 0 };
    e.revenue += r.revenue; e.netIncome += r.netIncome; e.cash += r.cash; e.debt += r.debt; e.marketCap += r.marketCap;
    byDay.set(r.day, e);
  }
  return [...byDay.values()].sort((a, b) => a.day - b.day);
}

/** Important alerts for the player's companies. */
export function alerts(s: GameState): { level: 'warn' | 'danger' | 'info'; text: string; companyId?: Id }[] {
  const out: { level: 'warn' | 'danger' | 'info'; text: string; companyId?: Id }[] = [];
  for (const c of playerCompanies(s)) {
    if (c.cash < 0) out.push({ level: 'danger', text: `${c.name}: nakit negatif! İflas riski (${c.distressMonths}/3 ay).`, companyId: c.id });
    else if (c.cash < payrollMonthly(s, c)) out.push({ level: 'warn', text: `${c.name}: nakit bir aylık maaşı karşılamıyor.`, companyId: c.id });
    for (const f of c.facilities) {
      if (f.downDays > 0) out.push({ level: 'warn', text: `${c.name}: ${f.name} arızalı (${f.downDays} gün).`, companyId: c.id });
      else if (f.condition < 40) out.push({ level: 'warn', text: `${c.name}: ${f.name} durumu kötü (%${f.condition.toFixed(0)}). Bakımı artırın.`, companyId: c.id });
      if (f.type === 'mine' && (f.reserve ?? 0) < 5000) out.push({ level: 'warn', text: `${c.name}: ${f.name} rezervi tükeniyor.`, companyId: c.id });
    }
    const kind = SECTORS[c.sector].kind;
    if (kind === 'manufacturing' && c.products.filter((p) => s.products[p]?.active).length === 0) out.push({ level: 'info', text: `${c.name}: aktif ürün yok — Ürünler ekranından tasarlayın.`, companyId: c.id });
    if (kind !== 'platform' && c.facilities.length === 0) out.push({ level: 'info', text: `${c.name}: tesis yok — Üretim ekranından tesis kurun.`, companyId: c.id });
    if (kind === 'platform' && c.platforms.length === 0) out.push({ level: 'info', text: `${c.name}: platform yok — Ürünler ekranından platform başlatın.`, companyId: c.id });
    for (const pid of c.products) {
      const p = s.products[pid];
      if (p?.active && (c.productStock[pid] ?? 0) > p.sales30 * 2 && p.sales30 > 0) out.push({ level: 'warn', text: `${p.name}: stok birikiyor (${Math.round(c.productStock[pid])} adet). Fiyatı düşürün veya üretimi azaltın.`, companyId: c.id });
    }
  }
  return out;
}
