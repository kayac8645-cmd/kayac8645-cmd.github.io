// UI-facing calculators (pure, read-only) also used by the simulation.
import type { CategoryId, Company, Facility, FacilityTypeId, GameState, GoodId, Id, SpecSelection } from './types';
import { CATEGORIES, FACILITIES, GOODS, TECHS } from './data/defs';
import { clamp, countryCosts, mgr, techEffects } from './util';
import { debtOf, holdingTechs, totalAssets } from './selectors';

export interface ProductPreview {
  performance: number; quality: number; reliability: number; power: number;
  unitMaterialCost: number; unitTotalCost: number; bom: Partial<Record<GoodId, number>>; laborHours: number;
  designCost: number; relPerf: number; suggestedPrice: number;
  /** labels of spec options that require techs nobody has (selection invalid if non-empty) */
  locked: string[];
  /** techs used via licence (owned by others, not by holding) and fee included in designCost */
  licensed: string[];
}

/** Frontier performance of a category = base × Π frontier multipliers of globally known techs × slow drift. */
export function frontierPerf(s: GameState, cat: CategoryId): number {
  const def = CATEGORIES[cat];
  let m = 1;
  for (const t of s.globalTechs) {
    const f = TECHS[t]?.frontier;
    if (f && f.categories.includes(cat)) m *= f.mult;
  }
  return def.basePerf * m * Math.pow(1.03, s.day / 360);
}

export function previewProduct(s: GameState, companyId: Id, p: { category: CategoryId; spec: SpecSelection; qualityFocus: number }): ProductPreview {
  const c = s.companies[companyId];
  const def = CATEGORIES[p.category];
  const own = holdingTechs(s, c);
  const locked: string[] = [];
  const licensed: string[] = [];
  let perf = def.basePerf, cost = 1, power = def.basePower, qAdd = 0;
  const bom: Partial<Record<GoodId, number>> = { ...def.bom };
  const extra: Partial<Record<GoodId, number>> = {};
  const needTech = (t: string | undefined, label: string) => {
    if (!t || own.has(t)) return;
    if (s.globalTechs.includes(t)) { if (!licensed.includes(t)) licensed.push(t); }
    else locked.push(`${label} (${TECHS[t]?.name ?? t})`);
  };
  needTech(def.requiresTech, def.name);
  for (const f of def.fields) {
    const idx = clamp(Math.round(p.spec[f.key] ?? 0), 0, f.options.length - 1);
    const o = f.options[idx];
    perf *= o.perf; cost *= o.cost; power *= o.power ?? 1; qAdd += o.quality ?? 0;
    needTech(o.requiresTech, o.label);
    for (const [g, q] of Object.entries(o.bomAdd ?? {})) extra[g as GoodId] = (extra[g as GoodId] ?? 0) + (q ?? 0);
  }
  const fx = techEffects(c);
  const qf = clamp(p.qualityFocus, 0, 100);
  const qCost = 0.85 + qf * 0.003;
  const reduce = 1 - fx.costReduction;
  for (const k of Object.keys(bom) as GoodId[]) bom[k] = (bom[k] ?? 0) * cost * qCost * reduce;
  for (const [g, q] of Object.entries(extra)) bom[g as GoodId] = (bom[g as GoodId] ?? 0) + (q ?? 0) * qCost * reduce;
  const unitMaterialCost = Object.entries(bom).reduce((a, [g, q]) => a + (q ?? 0) * s.commodities[g as GoodId].price, 0);
  const country = s.countries[c.countryId];
  const cc = countryCosts(s, country);
  const laborHours = def.laborHours * cost;
  const unitTotalCost = unitMaterialCost + laborHours * (cc.wageMonthly * 0.6 / 160) + unitMaterialCost * 0.04;
  const quality = clamp(35 + qf * 0.5 + qAdd + mgr(c, 'CPO') * 0.1 + fx.quality, 0, 100);
  const reliability = clamp(45 + qf * 0.35 + mgr(c, 'COO') * 0.08 + fx.quality * 0.5, 0, 100);
  const relPerf = perf / frontierPerf(s, p.category);
  const fair = def.refPrice * Math.pow(relPerf, 0.9) * (0.85 + quality / 333);
  const suggestedPrice = Math.max(unitTotalCost * 1.25, fair);
  const licenceFee = licensed.reduce((a, t) => a + (TECHS[t]?.cost ?? 0) * 400, 0);
  const designCost = Math.round(def.refPrice * 1500 * (0.6 + Math.min(relPerf, 2) * 0.4) + licenceFee);
  return { performance: perf, quality, reliability, power, unitMaterialCost, unitTotalCost, bom, laborHours, designCost, relPerf, suggestedPrice, locked, licensed };
}

export function facilityBuildCost(s: GameState, type: FacilityTypeId, countryId: Id): number {
  const c = s.countries[countryId];
  const def = FACILITIES[type];
  // construction ~40% labour-sensitive, risk premium
  const labour = 0.6 + 0.4 * clamp(c.avgSalary / 3000, 0.3, 2);
  return Math.round(def.buildCost * labour * (1 + c.politicalRisk / 400) * s.macro.priceLevel);
}
export function facilityUpgradeCost(s: GameState, f: Facility): number {
  return Math.round(facilityBuildCost(s, f.type, f.countryId) * FACILITIES[f.type].upgradeCostMult * Math.pow(f.level, 1.15));
}
export function marketOpenCost(s: GameState, countryId: Id): number {
  return Math.round((150_000 + s.countries[countryId].marketWeight * 25_000_000) * s.macro.priceLevel);
}

export function loanOffer(s: GameState, companyId: Id): { maxAmount: number; annualRate: number } {
  const c = s.companies[companyId];
  const debt = debtOf(c);
  const assets = totalAssets(s, c);
  const annualRev = c.revenue30 * 12;
  const capacity = Math.max(1_000_000, annualRev * 0.6 + assets * 0.5);
  const leverage = debt / Math.max(1, capacity);
  const risk = s.countries[c.countryId].politicalRisk;
  const annualRate = clamp(s.macro.baseRate + 0.02 + leverage * 0.06 + risk / 1500 - mgr(c, 'CFO') * 0.0002 + (c.distressMonths > 0 ? 0.04 : 0), 0.01, 0.35);
  return { maxAmount: Math.max(0, Math.round((capacity - debt) / 1000) * 1000), annualRate };
}

/** Research points per day for a daily budget. Diminishing returns; R&D staff and CTO multiply. */
export function researchRate(s: GameState, c: Company, budgetPerDay: number): number {
  const staff = c.employees.rnd;
  const country = s.countries[c.countryId];
  const money = Math.sqrt(Math.max(0, budgetPerDay) / 1000) * 2; // $4k/day → 4 pts
  const people = Math.sqrt(staff) * 0.6;
  return (money + people) * (0.8 + mgr(c, 'CTO') * 0.005) * (0.8 + country.education / 250);
}

export function countryCostIndex(s: GameState, countryId: Id) {
  const c = s.countries[countryId];
  const cc = countryCosts(s, c);
  const score = clamp(100 - cc.wageMonthly / 80 - cc.elec / 5 - cc.tax * 60 - c.politicalRisk / 3 + c.logistics / 3 + c.education / 4 + c.techLevel / 4, 0, 100);
  return { wage: cc.wageMonthly, energy: cc.elec, tax: cc.tax, logistics: c.logistics, risk: c.politicalRisk, score };
}

export const goodPrice = (s: GameState, g: GoodId) => s.commodities[g]?.price ?? GOODS[g].basePrice;
