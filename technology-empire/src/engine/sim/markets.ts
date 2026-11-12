// Daily market simulation:
//  1) auto-sell of commodity output (extraction / processing companies)
//  2) consumer product sales (logit demand per category × country)
//  3) category market statistics
//  4) commodity price formation (NPC supply/demand + today's trade volume)
// Deterministic: randomness only via rng.ts (gauss for commodity volatility).
import type { CategoryId, Company, GameState, GoodId, Id, Product } from '../types';
import { CATEGORIES, CATEGORY_IDS, FACILITIES, GOOD_IDS, GOODS, SECTORS } from '../data/defs';
import { clamp, mgr } from '../util';
import { frontierPerf } from '../preview';
import { gauss } from '../rng';
import { sellToMarket, sisterConsumes } from './trade';

const HISTORY_CAP = 180;
/** Outside option in the consumer logit (other brands / not buying). */
const A0 = 0.35;
/** Daily inventory holding cost as a fraction of product stock value. */
const HOLDING_COST = 0.0005;
/** Days of output kept in stock when a sister (or the company itself) consumes the good. */
const BUFFER_DAYS = 3;

const pushCapped = (arr: number[], v: number) => {
  arr.push(v);
  if (arr.length > HISTORY_CAP) arr.splice(0, arr.length - HISTORY_CAP);
};

// ─── Demand helpers (pure) ────────────────────────────────────────────────

/** Seasonality factor ±6 % over the 360-day year. */
function seasonality(day: number): number {
  return 1 + 0.06 * Math.sin((2 * Math.PI * (day % 360)) / 360);
}

/** Global consumer demand (units/day) of a category today. */
export function categoryDemandToday(s: GameState, cat: CategoryId): number {
  const def = CATEGORIES[cat];
  return def.baseDemand * s.macro.demandIndex * Math.pow(1 + def.annualGrowth, s.day / 360) * seasonality(s.day);
}

/** Consumer demand (units/day) of a category in one country today. */
export function countryCategoryDemand(s: GameState, cat: CategoryId, countryId: Id): number {
  const c = s.countries[countryId];
  if (!c) return 0;
  return categoryDemandToday(s, cat) * c.marketWeight;
}

/**
 * Logit attractiveness of a consumer product (see ENGINE_NOTES).
 * `frontier` may be passed to avoid recomputing frontierPerf in hot loops.
 */
export function productAttractiveness(s: GameState, p: Product, frontier?: number): number {
  const def = CATEGORIES[p.category];
  const c = s.companies[p.companyId];
  const brand = c ? c.brand : 30;
  const fr = frontier ?? frontierPerf(s, p.category);
  const relPerf = Math.max(1e-4, p.performance / Math.max(1e-6, fr));
  const fair = Math.max(1e-6, def.refPrice * Math.pow(relPerf, 0.9) * (0.85 + p.quality / 333));
  const price = Math.max(0.01, p.price);
  const mkt = 1 + 0.35 * Math.log(1 + Math.max(0, p.marketing) / (def.refPrice * 20));
  return (
    Math.pow(relPerf, def.perfWeight) *
    (0.6 + p.quality / 250) *
    (0.6 + brand / 125) *
    (0.7 + p.reliability / 333) *
    mkt *
    Math.pow(price / fair, -def.elasticity)
  );
}

// ─── 1) Commodity auto-sell ───────────────────────────────────────────────

/** Does company o consume good g as an input (processing recipe or product BOM)? */
function companyConsumes(s: GameState, o: Company, g: GoodId): boolean {
  for (const f of o.facilities) {
    if (f.type === 'mine' || f.type === 'dataCenter') continue;
    if (f.type === 'assemblyPlant') {
      const p = s.products[f.output];
      if (p && (p.bom[g] ?? 0) > 0) return true;
    } else {
      const recipe = GOODS[f.output as GoodId]?.recipe;
      if (recipe && (recipe[g] ?? 0) > 0) return true;
    }
  }
  return false;
}

/** Estimated daily input need of good g by a company's own processing facilities. */
function ownDailyNeed(s: GameState, c: Company, g: GoodId): number {
  let need = 0;
  for (const f of c.facilities) {
    if (f.type === 'mine' || f.type === 'dataCenter') continue;
    let per = 0;
    if (f.type === 'assemblyPlant') per = s.products[f.output]?.bom[g] ?? 0;
    else per = GOODS[f.output as GoodId]?.recipe?.[g] ?? 0;
    if (per > 0) need += per * FACILITIES[f.type].capacity * f.level * f.utilization;
  }
  return need;
}

function autoSellCommodities(s: GameState): void {
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt) continue;
    const kind = SECTORS[c.sector].kind;
    if (kind !== 'extraction' && kind !== 'processing') continue;
    // daily output per produced good
    const produced = new Map<GoodId, number>();
    for (const f of c.facilities) {
      if (f.type === 'assemblyPlant' || f.type === 'dataCenter') continue;
      const g = f.output as GoodId;
      if (!GOODS[g]) continue;
      produced.set(g, (produced.get(g) ?? 0) + Math.max(0, f.lastOutput));
    }
    for (const [g, out] of produced) {
      const have = c.goodsStock[g] ?? 0;
      if (have <= 0) continue;
      let buffer = 0;
      if (companyConsumes(s, c, g)) buffer = Math.max(buffer, BUFFER_DAYS * Math.max(out, ownDailyNeed(s, c, g)));
      if (sisterConsumes(s, c, g, (o, gg) => companyConsumes(s, o, gg))) buffer = Math.max(buffer, BUFFER_DAYS * out);
      const qty = have - buffer;
      if (qty > 1e-9) sellToMarket(s, c, g, qty);
    }
  }
}

// ─── 2) Consumer product sales ────────────────────────────────────────────

interface Entry { p: Product; c: Company; a: number; stock: number; desired: number }

interface DayCatResult { demand: number; sold: number; revenue: number }

function runConsumerSales(s: GameState): Record<CategoryId, DayCatResult> {
  const companies = s.companies;
  const byCat = {} as Record<CategoryId, Entry[]>;
  const frontiers = {} as Record<CategoryId, number>;
  for (const cat of CATEGORY_IDS) { byCat[cat] = []; frontiers[cat] = frontierPerf(s, cat); }

  // per-company aggregates for brand / satisfaction
  const mktTotal = new Map<Id, number>();
  const satW = new Map<Id, [number, number]>(); // [Σ units·(q+r)/2, Σ units]

  // Pass over products: reset daily stats, charge marketing, collect sellable entries.
  for (const p of Object.values(s.products)) {
    p.lastSales = 0;
    p.sales30 *= 29 / 30;
    const c = companies[p.companyId];
    if (!c || c.bankrupt || !p.active) { if (!p.active) p.share = 0; continue; }
    const mk = Math.max(0, p.marketing);
    if (mk > 0) {
      c.cash -= mk;
      c.ledger.marketing += mk;
      mktTotal.set(c.id, (mktTotal.get(c.id) ?? 0) + mk);
    }
    const stock = c.productStock[p.id] ?? 0;
    if (stock <= 1e-9 || c.markets.length === 0) { p.share = 0; continue; }
    byCat[p.category].push({ p, c, a: productAttractiveness(s, p, frontiers[p.category]), stock, desired: 0 });
  }

  const countries = Object.values(s.countries);
  const result = {} as Record<CategoryId, DayCatResult>;

  for (const cat of CATEGORY_IDS) {
    const global = categoryDemandToday(s, cat);
    const entries = byCat[cat];
    const res: DayCatResult = { demand: global, sold: 0, revenue: 0 };
    result[cat] = res;
    if (entries.length === 0) continue;

    // per-country sum of attractiveness of present products
    const sumA = new Map<Id, number>();
    for (const e of entries) for (const cid of e.c.markets) sumA.set(cid, (sumA.get(cid) ?? 0) + e.a);
    const countryDemand = new Map<Id, number>();
    for (const co of countries) if (sumA.has(co.id)) countryDemand.set(co.id, global * co.marketWeight);

    for (const e of entries) {
      let d = 0;
      for (const cid of e.c.markets) {
        const D = countryDemand.get(cid);
        const sa = sumA.get(cid);
        if (D === undefined || sa === undefined) continue;
        d += D * (e.a / (sa + A0));
      }
      e.desired = d;
    }

    for (const e of entries) {
      const units = Math.min(e.desired, e.stock);
      if (units <= 0) continue;
      const { p, c } = e;
      const rev = units * p.price;
      c.productStock[p.id] = e.stock - units;
      c.cash += rev;
      c.ledger.revenue += rev;
      c.ledger.unitsSold += units;
      p.lastSales = units;
      p.sales30 += units;
      p.unitsSoldTotal += units;
      p.revenueTotal += rev;
      res.sold += units;
      res.revenue += rev;
      const w = satW.get(c.id) ?? [0, 0];
      w[0] += units * (p.quality + p.reliability) / 2;
      w[1] += units;
      satW.set(c.id, w);
    }
    for (const e of entries) e.p.share = global > 0 ? e.p.lastSales / global : 0;
  }

  // Inventory holding cost on finished goods.
  for (const c of Object.values(companies)) {
    if (c.bankrupt) continue;
    let value = 0;
    for (const pid in c.productStock) {
      const q = c.productStock[pid];
      const p = s.products[pid];
      if (p && q > 0) value += q * p.unitMaterialCost;
    }
    if (value > 0) {
      const cost = value * HOLDING_COST;
      c.cash -= cost;
      c.ledger.other += cost;
    }
  }

  // Brand & satisfaction drift (manufacturing companies).
  for (const c of Object.values(companies)) {
    if (c.bankrupt || SECTORS[c.sector].kind !== 'manufacturing') continue;
    const w = satW.get(c.id);
    if (w && w[1] > 0) c.satisfaction = clamp(c.satisfaction + (w[0] / w[1] - c.satisfaction) * 0.02, 0, 100);
    const cmo = mgr(c, 'CMO');
    const m = mktTotal.get(c.id) ?? 0;
    const target = clamp(30 + 25 * Math.log10(1 + m / 1e4) + (c.satisfaction - 60) * 0.4 + cmo * 0.08, 0, 100);
    c.brand = clamp(c.brand + (target - c.brand) * 0.002 * (1 + cmo / 200), 0, 100);
  }

  return result;
}

// ─── 3) Category stats ────────────────────────────────────────────────────

function updateCategoryStats(s: GameState, day: Record<CategoryId, DayCatResult>): void {
  for (const cat of CATEGORY_IDS) {
    const m = s.categories[cat];
    if (!m) continue;
    const r = day[cat];
    m.demandToday = r.demand;
    m.soldToday = r.sold;
    if (r.sold > 0) m.avgPrice = r.revenue / r.sold;
    else if (!(m.avgPrice > 0)) m.avgPrice = CATEGORIES[cat].refPrice * s.macro.priceLevel;
    m.frontierPerf = frontierPerf(s, cat);
    pushCapped(m.demandHistory, m.demandToday);
    pushCapped(m.priceHistory, m.avgPrice);
  }
}

// ─── 4) Commodity prices ──────────────────────────────────────────────────

function updateCommodityPrices(s: GameState): void {
  for (const g of GOOD_IDS) {
    const m = s.commodities[g];
    if (!m) continue;
    const def = GOODS[g];
    const ref = Math.max(1e-6, m.basePrice * s.macro.priceLevel);
    const ratio = Math.max(1e-6, m.price / ref);
    const vol = def.npcVolume;
    // npcSupply stored WITHOUT shock (trade.marketAvailable multiplies by supplyShock).
    m.npcDemand = vol * s.macro.demandIndex * Math.pow(ratio, -0.8);
    m.npcSupply = vol * Math.pow(ratio, 0.6);
    const D = m.npcDemand + m.boughtToday;
    const S = m.npcSupply * m.supplyShock + m.soldToday;
    const drift = clamp((0.08 * (D - S)) / vol, -0.04, 0.04);
    m.price = clamp(m.price * Math.exp(drift + def.volatility * gauss(s)), ref * 0.15, ref * 8);
    // supply shock countdown / recovery
    if (m.shockDays > 0) m.shockDays -= 1;
    else if (m.supplyShock !== 1) {
      m.supplyShock += (1 - m.supplyShock) * 0.05;
      if (Math.abs(1 - m.supplyShock) < 0.005) m.supplyShock = 1;
    }
    pushCapped(m.history, m.price);
    m.boughtToday = 0;
    m.soldToday = 0;
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────

export function runMarketsDay(s: GameState): void {
  autoSellCommodities(s);
  const day = runConsumerSales(s);
  updateCategoryStats(s, day);
  updateCommodityPrices(s);
}
