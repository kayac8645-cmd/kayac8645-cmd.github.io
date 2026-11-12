// Daily physical production: mines (extraction), processing plants (wafers,
// chips, batteries, displays) and assembly plants (consumer products).
// Data centers are handled by the services module.
// All cash flows mirror into the company ledger; inputs go through trade.ts.
import type { Company, Facility, GameState, GoodId } from '../types';
import { CATEGORIES, FACILITIES, GOODS, SECTORS } from '../data/defs';
import { addNews, clamp, companyEfficiency, countryCosts, mgr, techEffects } from '../util';
import { chance, randInt } from '../rng';
import { acquireGood } from './trade';

type Recipe = Partial<Record<GoodId, number>>;

const isGood = (id: string): id is GoodId => Object.prototype.hasOwnProperty.call(GOODS, id);

/** Per-unit input requirements of a facility (empty for mines / invalid outputs, null when it cannot run). */
function facilityRecipe(s: GameState, c: Company, f: Facility): Recipe | null {
  if (f.type === 'dataCenter') return null;
  if (f.type === 'mine') return isGood(f.output) && GOODS[f.output].raw ? {} : null;
  if (f.type === 'assemblyPlant') {
    const p = s.products[f.output];
    return p && p.active ? p.bom : null;
  }
  // processing: recipe of the output good, materials reduced by cost-reduction techs
  if (!isGood(f.output)) return null;
  const recipe = GOODS[f.output].recipe;
  if (!recipe) return null;
  const outs = FACILITIES[f.type].outputs;
  if (outs && !outs.includes(f.output)) return null;
  const red = 1 - techEffects(c).costReduction;
  if (red >= 1) return recipe;
  const r: Recipe = {};
  for (const [g, q] of Object.entries(recipe)) r[g as GoodId] = (q ?? 0) * red;
  return r;
}

/** Gross daily capacity (units started) given a precomputed company efficiency; ignores downtime. */
function capacityWith(s: GameState, c: Company, f: Facility, eff: number): number {
  if (f.type === 'dataCenter') return 0;
  const def = FACILITIES[f.type];
  const util = clamp(f.utilization, 0, 1);
  if (util <= 0) return 0;
  const fx = techEffects(c);
  if (f.type === 'mine') {
    if (!isGood(f.output) || !GOODS[f.output].raw) return 0;
    const richness = s.countries[f.countryId]?.deposits[f.output] ?? 0;
    const purity = f.purity ?? 1;
    const cap = (def.capacity / GOODS[f.output].basePrice) * f.level * purity * richness * util * eff * fx.extraction;
    const reserve = f.reserve ?? Infinity;
    return Math.max(0, Math.min(cap, reserve));
  }
  if (facilityRecipe(s, c, f) === null) return 0;
  return Math.max(0, def.capacity * f.level * util * eff * fx.efficiency);
}

/** Max daily output units the facility can start right now (0 if down, idle, data center or no valid output). */
export function facilityCapacity(s: GameState, c: Company, f: Facility): number {
  if (f.downDays > 0 || c.bankrupt) return 0;
  return capacityWith(s, c, f, companyEfficiency(c));
}

/** Daily input requirements of all operational facilities at current capacity (for UI / AI planning). */
export function inputNeedsPerDay(s: GameState, c: Company): Partial<Record<GoodId, number>> {
  const out: Partial<Record<GoodId, number>> = {};
  if (c.bankrupt) return out;
  const eff = companyEfficiency(c);
  for (const f of c.facilities) {
    if (f.downDays > 0 || f.type === 'mine' || f.type === 'dataCenter') continue;
    const recipe = facilityRecipe(s, c, f);
    if (!recipe) continue;
    const cap = capacityWith(s, c, f, eff);
    if (cap <= 0) continue;
    for (const [g, q] of Object.entries(recipe)) out[g as GoodId] = (out[g as GoodId] ?? 0) + (q ?? 0) * cap;
  }
  return out;
}

/**
 * Does the company consume good g as a production input?
 * Pass `s` for exact product BOMs; without it assembly plants fall back to the
 * union of their sector's category BOMs (incl. spec add-ons).
 */
export function consumesGood(c: Company, g: GoodId, s?: GameState): boolean {
  if (c.bankrupt) return false;
  for (const f of c.facilities) {
    if (f.type === 'mine' || f.type === 'dataCenter') continue;
    if (f.type === 'assemblyPlant') {
      if (s) {
        const p = s.products[f.output];
        if (p && p.active && (p.bom[g] ?? 0) > 0) return true;
      } else {
        for (const cat of SECTORS[c.sector].categories ?? []) {
          const def = CATEGORIES[cat];
          if ((def.bom[g] ?? 0) > 0) return true;
          for (const fld of def.fields) for (const o of fld.options) if ((o.bomAdd?.[g] ?? 0) > 0) return true;
        }
      }
      continue;
    }
    if (isGood(f.output) && (GOODS[f.output].recipe?.[g] ?? 0) > 0) return true;
  }
  return false;
}

const isPlayer = (s: GameState, c: Company) => c.holdingId === s.playerHoldingId;

function payMaintenance(c: Company, f: Facility, mult: number, costRed: number) {
  const cost = FACILITIES[f.type].maintenance * f.level * clamp(f.maintenance, 0, 2) * mult * (1 - costRed);
  if (cost <= 0) return;
  c.cash -= cost;
  c.ledger.maintenance += cost;
}

function payEnergy(s: GameState, c: Company, f: Facility, utilEff: number, costRed: number) {
  if (utilEff <= 0) return;
  const country = s.countries[f.countryId] ?? s.countries[c.countryId];
  const cost = FACILITIES[f.type].energyMWh * f.level * utilEff * countryCosts(s, country).elec * (1 - costRed);
  if (cost <= 0) return;
  c.cash -= cost;
  c.ledger.energy += cost;
}

function addOutput(c: Company, f: Facility, qty: number) {
  if (qty <= 0) return;
  if (f.type === 'assemblyPlant') c.productStock[f.output] = (c.productStock[f.output] ?? 0) + qty;
  else {
    const g = f.output as GoodId;
    c.goodsStock[g] = (c.goodsStock[g] ?? 0) + qty;
  }
}

/** Run one facility for one day. `eff` = companyEfficiency(c) precomputed. */
function runFacility(s: GameState, c: Company, f: Facility, eff: number) {
  const def = FACILITIES[f.type];
  const fx = techEffects(c);
  const player = isPlayer(s, c);
  // operating-cost reduction applies to mines (materials reduction is applied to recipes elsewhere)
  const opRed = f.type === 'mine' ? fx.costReduction : 0;
  const maint = clamp(f.maintenance, 0, 2);

  // ── Breakdown in progress ──
  if (f.downDays > 0) {
    f.downDays -= 1;
    f.lastOutput = 0;
    payMaintenance(c, f, 1, opRed); // repair crews
    f.condition = clamp(f.condition + 0.3 * Math.max(0.5, maint), 0, 100);
    if (f.downDays <= 0) {
      f.downDays = 0;
      if (player) addNews(s, 'breakdown', 'Tesis tekrar devrede', `${c.name} şirketine ait ${f.name} onarıldı ve yeniden üretime başladı.`, { companyId: c.id, countryId: f.countryId });
    }
    return;
  }

  const util = clamp(f.utilization, 0, 1);

  // ── Idle facility ──
  if (util <= 0) {
    f.lastOutput = 0;
    payMaintenance(c, f, 0.3, opRed);
    f.condition = clamp(f.condition + 0.06 * maint - 0.01, 0, 100);
    return;
  }

  const capacity = capacityWith(s, c, f, eff);
  const recipe = facilityRecipe(s, c, f);
  let gross = 0;

  if (capacity > 0 && recipe) {
    const inputs = Object.entries(recipe).filter(([, q]) => (q ?? 0) > 0) as [GoodId, number][];
    if (inputs.length === 0) {
      gross = capacity; // mine
    } else {
      // Limit purchases to what the company can afford (stock first, then cash).
      let stockCover = Infinity, unitCost = 0;
      const fee = countryCosts(s, s.countries[c.countryId]).logisticsFee;
      const priceMult = Math.max(1 + fee, c.sourcing === 'internal' ? c.transferPriceMult : 0);
      for (const [g, q] of inputs) {
        stockCover = Math.min(stockCover, (c.goodsStock[g] ?? 0) / q);
        unitCost += q * s.commodities[g].price * priceMult;
      }
      const affordable = unitCost > 0 ? stockCover + Math.max(0, c.cash) / unitCost : capacity;
      const target = Math.min(capacity, affordable);
      if (target > 0) {
        gross = target;
        for (const [g, q] of inputs) {
          const have = acquireGood(s, c, g, q * target);
          gross = Math.min(gross, have / q);
        }
        gross = Math.max(0, gross);
        for (const [g, q] of inputs) {
          const left = (c.goodsStock[g] ?? 0) - q * gross;
          c.goodsStock[g] = left > 1e-9 ? left : 0;
        }
      }
    }
  }

  // ── Output & defects (scrapped units still consumed their inputs) ──
  let good = gross;
  if (gross > 0 && def.baseDefect > 0) {
    const defect = clamp(def.baseDefect * (1.5 - f.condition / 200) / fx.efficiency * (1 - mgr(c, 'COO') * 0.003), 0, 0.95);
    good = gross * (1 - defect);
  }
  if (f.type === 'mine' && gross > 0 && f.reserve !== undefined) {
    const before = f.reserve;
    f.reserve = Math.max(0, f.reserve - gross);
    if (before > 0 && f.reserve <= 0) {
      addNews(s, 'company', 'Maden rezervi tükendi', `${c.name} şirketine ait ${f.name} sahasındaki ${GOODS[f.output as GoodId]?.name ?? f.output} rezervi tükendi. Saha artık üretim yapamıyor.`, { important: player, companyId: c.id, countryId: f.countryId });
    }
  }
  addOutput(c, f, good);
  f.lastOutput = good;
  c.ledger.unitsProduced += good;

  // ── Costs ──
  const runRate = capacity > 0 ? clamp(gross / capacity, 0, 1) : 0;
  const utilEff = util * (0.1 + 0.9 * runRate); // standby draw when starved of inputs
  payEnergy(s, c, f, utilEff, opRed);
  payMaintenance(c, f, 1, opRed);

  // ── Condition & breakdowns ──
  f.condition = clamp(f.condition + 0.06 * maint - 0.08 * utilEff - 0.01, 0, 100);
  if (chance(s, 0.0004 * (1 + (100 - f.condition) / 20))) {
    f.downDays = randInt(s, 5, 20);
    addNews(s, 'breakdown', `Arıza: ${f.name}`, `${c.name} şirketine ait ${f.name} arızalandı. Tahmini onarım süresi ${f.downDays} gün. Bakım seviyesini artırmak arıza riskini azaltır.`, { important: player, companyId: c.id, countryId: f.countryId });
  }
}

/** Daily production for every non-bankrupt company (O(companies × facilities)). */
export function runProductionDay(s: GameState): void {
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt || c.facilities.length === 0) continue;
    let eff = -1;
    for (const f of c.facilities) {
      if (f.type === 'dataCenter') continue;
      if (eff < 0) eff = companyEfficiency(c);
      runFacility(s, c, f, eff);
    }
  }
}
