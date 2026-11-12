// Daily simulation of service businesses:
//  A) Data centers / cloud capacity market (logit across all companies' cloud offers)
//  B) Platforms (social media & software): users, engagement, monetisation, costs, competition.
// Deterministic: randomness only via ../rng with the GameState.
import type {
  CloudOffer, CloudServiceId, Company, Facility, GameState, Platform, PlatformCatId,
} from '../types';
import { CLOUD, FACILITIES, PLATFORMS, SECTORS } from '../data/defs';
import { addNews, clamp, companyEfficiency, countryCosts, techEffects } from '../util';
import { chance, randInt } from '../rng';

const CLOUD_IDS = Object.keys(CLOUD) as CloudServiceId[];
const CLOUD_A0 = 0.3;
const HISTORY_LEN = 180;
const IDLE_ENERGY_SHARE = 0.3;
/** Base customer-acquisition cost per marketed user (USD, scaled by price level). */
const PLATFORM_CAC = 2.5;
/** Share of churned users that flow to rival platforms of the same category. */
const RIVAL_FLOW = 0.5;

// ─── Shared helpers ──────────────────────────────────────────────────────

const pushHist = (arr: number[], v: number) => {
  arr.push(v);
  if (arr.length > HISTORY_LEN) arr.splice(0, arr.length - HISTORY_LEN);
};

const isPlayerCo = (s: GameState, c: Company) => s.holdings[c.holdingId]?.isPlayer === true;

/** Whether a company may offer a service at all (AI compute requires its tech). */
export function canOfferService(c: Company, service: CloudServiceId): boolean {
  const req = CLOUD[service].requiresTech;
  return !req || c.techs.includes(req);
}

/** Installed (hardware-limited) capacity of one data center: dcCapacity bounded by FACILITIES.dataCenter.capacity × level. */
export function dcInstalledCapacity(f: Facility): number {
  if (f.type !== 'dataCenter') return 0;
  return clamp(f.dcCapacity ?? 0, 0, FACILITIES.dataCenter.capacity * f.level);
}

/** Condition → capacity factor (1 at 100, 0.6 at 0). */
const conditionFactor = (condition: number) => clamp(0.6 + condition / 250, 0, 1);
/** Staffing / management factor on DC capacity (softened company efficiency, ≤ 1). */
const staffFactor = (c: Company) => 0.7 + 0.3 * Math.min(1, companyEfficiency(c));

/** Sellable capacity of a single DC today (0 if broken down or service not allowed). */
export function dcEffectiveCapacity(c: Company, f: Facility): number {
  if (f.type !== 'dataCenter' || f.downDays > 0) return 0;
  const service = f.output as CloudServiceId;
  if (!CLOUD[service] || !canOfferService(c, service)) return 0;
  return dcInstalledCapacity(f) * clamp(f.utilization, 0, 1) * conditionFactor(f.condition) * staffFactor(c);
}

/** Total effective capacity units (per day) a company can sell for a service. */
export function dcCapacityOf(c: Company, service: CloudServiceId): number {
  if (c.bankrupt || !canOfferService(c, service)) return 0;
  let cap = 0;
  for (const f of c.facilities) if (f.type === 'dataCenter' && f.output === service) cap += dcEffectiveCapacity(c, f);
  return cap;
}

/** Global demand (capacity units / day) for a cloud service today. */
export function cloudDemandToday(s: GameState, service: CloudServiceId): number {
  const def = CLOUD[service];
  return def.baseDemand * Math.pow(1 + def.annualGrowth, s.day / 360) * s.macro.demandIndex;
}

/** Last-day operating profit of a platform (revenue − infra − moderation − marketing − dev). */
export function platformDailyProfit(p: Platform): number {
  return p.lastAdRevenue + p.lastSubRevenue - p.lastInfraCost - p.lastModCost - p.marketing - p.devSpend;
}

/** Combined market presence weight of a company (Σ marketWeight of its markets, min 0.15, max 1). */
export function presenceOf(s: GameState, c: Company): number {
  let w = 0;
  for (const id of c.markets) w += s.countries[id]?.marketWeight ?? 0;
  return clamp(w, 0.15, 1);
}

/** First non-bankrupt cloud-sector sister of a company inside its holding (infra provider). */
function cloudSister(s: GameState, c: Company): Company | undefined {
  for (const o of Object.values(s.companies)) {
    if (o.id !== c.id && o.holdingId === c.holdingId && !o.bankrupt && o.sector === 'cloud') return o;
  }
  return undefined;
}

// ─── A) Data centers / cloud ─────────────────────────────────────────────

interface OfferCtx {
  c: Company;
  offer: CloudOffer;
  cap: number;
  /** capacity-weighted avg condition of serving DCs */
  cond: number;
  A: number;
  sold: number;
  /** facilities serving the offer with their effective capacity */
  dcs: { f: Facility; cap: number }[];
}

function runDataCenters(s: GameState): void {
  const companies = Object.values(s.companies).filter((c) => !c.bankrupt);

  // 1. Reset per-day output (broken DCs offer 0 capacity; downDays is counted down in step 3).
  for (const c of companies) for (const f of c.facilities) {
    if (f.type !== 'dataCenter') continue;
    f.lastOutput = 0;
  }

  // 2. Build offers per service.
  for (const service of CLOUD_IDS) {
    const def = CLOUD[service];
    const refPrice = def.refPrice * s.macro.priceLevel;
    const ctxs: OfferCtx[] = [];
    for (const c of companies) {
      if (!canOfferService(c, service)) continue;
      const dcs: { f: Facility; cap: number }[] = [];
      let cap = 0, condW = 0;
      for (const f of c.facilities) {
        if (f.type !== 'dataCenter' || f.output !== service) continue;
        const fc = dcEffectiveCapacity(c, f);
        if (fc <= 0) continue;
        dcs.push({ f, cap: fc });
        cap += fc; condW += fc * f.condition;
      }
      let offer = c.cloudOffers.find((o) => o.service === service);
      if (cap <= 0) {
        if (offer) { offer.lastSold = 0; offer.share = 0; }
        continue;
      }
      if (!offer) {
        // Capacity without an offer: open one at the reference price so the hardware is not idle.
        offer = { service, price: Math.round(refPrice * 100) / 100, marketing: 0, lastSold: 0, share: 0 };
        c.cloudOffers.push(offer);
      }
      if (!(offer.price > 0)) { offer.lastSold = 0; offer.share = 0; continue; }
      // Marketing spend for active offers.
      const mkt = Math.max(0, offer.marketing);
      if (mkt > 0) { c.cash -= mkt; c.ledger.marketing += mkt; }
      const cond = condW / cap;
      const q = techEffects(c).quality;
      const A = Math.pow(offer.price / refPrice, -def.elasticity)
        * (0.6 + c.brand / 125)
        * (0.7 + clamp(cond + q, 0, 130) / 333)
        * (1 + 0.35 * Math.log(1 + mkt / (refPrice * 2000)));
      ctxs.push({ c, offer, cap, cond, A, sold: 0, dcs });
    }

    const demand = cloudDemandToday(s, service);
    const sumA = ctxs.reduce((a, x) => a + x.A, 0);
    // First pass: logit allocation limited by capacity.
    let unmet = 0;
    for (const x of ctxs) {
      const want = demand * x.A / (sumA + CLOUD_A0);
      x.sold = Math.min(want, x.cap);
      unmet += want - x.sold;
    }
    // Second pass: half of the unserved demand spills over to providers with spare capacity.
    if (unmet > 0) {
      const spill = unmet * 0.5;
      const spareA = ctxs.reduce((a, x) => a + (x.cap - x.sold > 1e-9 ? x.A : 0), 0);
      if (spareA > 0) for (const x of ctxs) {
        if (x.cap - x.sold <= 1e-9) continue;
        x.sold = Math.min(x.cap, x.sold + spill * x.A / spareA);
      }
    }

    // Book revenue.
    let totalSold = 0, revSum = 0;
    for (const x of ctxs) {
      const rev = x.sold * x.offer.price;
      x.c.cash += rev;
      x.c.ledger.revenue += rev;
      x.c.ledger.unitsSold += x.sold;
      x.offer.lastSold = x.sold;
      totalSold += x.sold; revSum += rev;
      // distribute load over serving DCs proportionally to their capacity
      for (const d of x.dcs) d.f.lastOutput = x.cap > 0 ? x.sold * d.cap / x.cap : 0;
    }
    for (const x of ctxs) x.offer.share = demand > 0 ? x.sold / demand : 0;

    const m = s.cloud[service];
    if (m) {
      m.demand = demand;
      if (totalSold > 0) m.avgPrice = revSum / totalSold;
      else if (sumA > 0) m.avgPrice = ctxs.reduce((a, x) => a + x.offer.price * x.A, 0) / sumA;
      else if (!(m.avgPrice > 0)) m.avgPrice = refPrice;
      pushHist(m.history, m.avgPrice);
    }
  }

  // 3. Facility costs, condition dynamics and breakdowns.
  for (const c of companies) {
    let fx: ReturnType<typeof techEffects> | null = null;
    for (const f of c.facilities) {
      if (f.type !== 'dataCenter') continue;
      fx ??= techEffects(c);
      const service = f.output as CloudServiceId;
      const def = CLOUD[service];
      const installed = dcInstalledCapacity(f);
      const used = f.lastOutput;
      const elec = countryCosts(s, s.countries[f.countryId] ?? s.countries[c.countryId]).elec;
      const perUnit = (def?.energyPerUnit ?? 0) * elec * (1 - fx.dcEfficiency);
      const energy = used * perUnit + Math.max(0, installed - used) * perUnit * IDLE_ENERGY_SHARE;
      const maint = FACILITIES.dataCenter.maintenance * f.level * Math.max(0, f.maintenance);
      c.cash -= energy + maint;
      c.ledger.energy += energy;
      c.ledger.maintenance += maint;

      if (f.downDays > 0) {
        f.downDays -= 1;
        f.condition = clamp(f.condition + 0.06 * f.maintenance - 0.01, 0, 100);
        continue;
      }
      const load = installed > 0 ? clamp(used / installed, 0, 1) : 0;
      f.condition = clamp(f.condition + 0.06 * f.maintenance - 0.08 * load - 0.01, 0, 100);
      if (installed > 0 && chance(s, 0.0004 * (1 + (100 - f.condition) / 20))) {
        f.downDays = randInt(s, 5, 20);
        const player = isPlayerCo(s, c);
        addNews(s, 'breakdown', `${f.name} arızalandı`,
          `${c.name} şirketine ait veri merkezi ${f.name} arıza nedeniyle ${f.downDays} gün hizmet veremeyecek.`,
          { important: player, companyId: c.id, countryId: f.countryId });
      }
    }
  }
}

// ─── B) Platforms ────────────────────────────────────────────────────────

interface PlatCtx {
  p: Platform;
  c: Company | undefined;
  active: boolean;
  churn: number;
  extra: number;
}

function runPlatforms(s: GameState): void {
  const all = Object.values(s.platforms);
  if (all.length === 0) { tickTrends(s); return; }

  // Group by category.
  const byCat = new Map<PlatformCatId, PlatCtx[]>();
  for (const p of all) {
    const c = s.companies[p.companyId];
    const ctx: PlatCtx = { p, c, active: !!c && !c.bankrupt, churn: 0, extra: 0 };
    const arr = byCat.get(p.category);
    if (arr) arr.push(ctx); else byCat.set(p.category, [ctx]);
  }

  const cac = PLATFORM_CAC * s.macro.priceLevel;

  for (const [cat, ctxs] of byCat) {
    const def = PLATFORMS[cat];
    const mk = s.platformMarkets[cat];
    const addressable = Math.max(1, mk?.addressable ?? def.addressable);
    const trend = mk?.trend ?? 1;
    const catUsers = ctxs.reduce((a, x) => a + x.p.users, 0);

    // Phase 1: churn.
    for (const x of ctxs) {
      const p = x.p;
      if (!x.active) { x.churn = p.users * 0.03; continue; }
      const satPenalty = 1 + Math.max(0, 60 - p.satisfaction) / 30;
      const trustPenalty = 1 + Math.max(0, 50 - p.trust) / 100;
      x.churn = Math.min(p.users, p.users * def.baseChurn * satPenalty * trustPenalty);
    }

    // Phase 2: churn flowing to rivals (proportional to rivals' satisfaction).
    for (const src of ctxs) {
      if (src.churn <= 0) continue;
      let satSum = 0;
      for (const r of ctxs) if (r !== src && r.active) satSum += Math.max(1, r.p.satisfaction);
      if (satSum <= 0) continue;
      const pool = src.churn * RIVAL_FLOW;
      for (const r of ctxs) if (r !== src && r.active) r.extra += pool * Math.max(1, r.p.satisfaction) / satSum;
    }

    // Phase 3: per-platform daily model.
    for (const x of ctxs) {
      const p = x.p;
      const c = x.c;
      if (!x.active || !c) {
        // Abandoned platform (bankrupt owner): users bleed away, no business activity.
        p.users = Math.max(0, p.users - x.churn);
        p.dau = 0; p.premiumUsers = 0; p.impressions = 0;
        p.lastSignups = 0; p.lastChurn = x.churn;
        p.lastAdRevenue = 0; p.lastSubRevenue = 0; p.lastInfraCost = 0; p.lastModCost = 0;
        continue;
      }
      const fx = techEffects(c);
      const presence = presenceOf(s, c);
      const usersStart = p.users;
      const infra = Math.max(1, p.infraCapacity);
      const overload = usersStart > infra ? clamp((usersStart - infra) / infra, 0, 1) : 0;

      // Features from dev spend.
      const dev = Math.max(0, p.devSpend);
      if (dev > 0) {
        p.features += dev / (40000 * (1 + p.features));
        c.cash -= dev; c.ledger.rnd += dev;
      }

      // Engagement (creators add a small bonus).
      if (def.creatorRate > 0) {
        const creatorTarget = usersStart * def.creatorRate * (0.5 + p.engagement);
        p.creators += (creatorTarget - p.creators) * 0.03;
      } else p.creators = 0;
      const creatorBoost = def.creatorRate > 0 && usersStart > 0
        ? 0.05 * clamp(p.creators / (usersStart * def.creatorRate), 0, 1) : 0;
      const engTarget = clamp(0.25 + p.features * 0.015 + fx.engagement + creatorBoost, 0, 0.95);
      p.engagement = clamp(p.engagement + (engTarget - p.engagement) * 0.05, 0, 0.95);

      // Signups: organic (viral, saturating) + marketing + rival churn inflow; capped by spare infra.
      const globalSat = Math.max(0, 1 - catUsers / addressable);
      const ownSat = Math.max(0, 1 - usersStart / (addressable * presence));
      const sat = globalSat * ownSat;
      const mkt = Math.max(0, p.marketing);
      if (mkt > 0) { c.cash -= mkt; c.ledger.marketing += mkt; }
      const organic = usersStart * def.viral * (0.5 + p.engagement) * sat * trend;
      const marketed = (mkt / cac) * Math.sqrt(sat);
      const spare = Math.max(0, infra - (usersStart - x.churn));
      const signups = overload > 0 ? 0 : Math.min(spare, organic + marketed + x.extra * ownSat);

      p.users = Math.max(0, usersStart - x.churn + signups);
      p.lastSignups = signups;
      p.lastChurn = x.churn;

      // Activity & monetisation.
      p.dau = p.users * def.dauRatio * (0.6 + p.engagement);
      const adLoad = clamp(p.adLoad, 0, 1);
      p.impressions = p.dau * def.impressionsPerDau * adLoad;
      const cpm = def.cpm * s.macro.demandIndex * s.macro.priceLevel * (0.7 + p.trust / 333);
      const adRev = p.impressions * cpm / 1000;
      let premiumUsers = 0;
      if (p.premiumPrice > 0 && def.premiumRate > 0) {
        const refPrem = def.refPremiumPrice * s.macro.priceLevel;
        premiumUsers = Math.min(p.users * 0.9, p.users * def.premiumRate * Math.pow(refPrem / p.premiumPrice, 1.3));
      }
      p.premiumUsers = premiumUsers;
      const subRev = premiumUsers * p.premiumPrice / 30;
      const revenue = adRev + subRev;
      c.cash += revenue;
      c.ledger.revenue += revenue;
      p.lastAdRevenue = adRev;
      p.lastSubRevenue = subRev;

      // Infra (cheaper & internalised when the holding owns a cloud company).
      let infraCost = p.dau * def.infraPerDau * s.macro.energyIndex;
      const sister = cloudSister(s, c);
      if (sister) {
        infraCost *= 0.8;
        const internal = infraCost * 0.8;
        sister.cash += internal;
        sister.ledger.revenue += internal;
        sister.ledger.internalRevenue += internal;
      }
      c.cash -= infraCost; c.ledger.infra += infraCost;
      p.lastInfraCost = infraCost;

      // Moderation.
      const moderation = clamp(p.moderation, 0, 2);
      const modCost = p.users * def.modPerUser * moderation * (1 - fx.costReduction) * s.macro.wageIndex;
      c.cash -= modCost; c.ledger.other += modCost;
      p.lastModCost = modCost;

      // Satisfaction & trust drift.
      const overloadNow = p.users > infra ? clamp((p.users - infra) / infra, 0, 1) : 0;
      const pricePenalty = p.premiumPrice > 0 ? Math.max(0, p.premiumPrice / (def.refPremiumPrice * s.macro.priceLevel) - 1) * 8 : 0;
      const satTarget = clamp(
        70 + p.features * 1.5 - adLoad * 40 - Math.max(overload, overloadNow) * 50
          - Math.max(0, 1 - moderation) * 15 + Math.max(0, moderation - 1) * 5 - pricePenalty,
        0, 100);
      p.satisfaction = clamp(p.satisfaction + (satTarget - p.satisfaction) * 0.03, 0, 100);
      const trustTarget = clamp(45 + moderation * 28 - adLoad * 15 + fx.quality, 0, 100);
      p.trust = clamp(p.trust + (trustTarget - p.trust) * 0.02, 0, 100);
    }
  }

  tickTrends(s);
}

/** Platform market trend countdown (events set trend/trendDays). */
function tickTrends(s: GameState): void {
  for (const mk of Object.values(s.platformMarkets)) {
    if (mk.trendDays > 0) {
      mk.trendDays -= 1;
      if (mk.trendDays <= 0) { mk.trendDays = 0; mk.trend = 1; }
    }
  }
}

// ─── Company-level drift (satisfaction / brand) for service companies ───

function runServiceCompanyDrift(s: GameState): void {
  for (const c of Object.values(s.companies)) {
    if (c.bankrupt) continue;
    const kind = SECTORS[c.sector]?.kind;
    if (kind === 'platform') {
      let users = 0, satW = 0, mkt = 0;
      for (const id of c.platforms) {
        const p = s.platforms[id];
        if (!p) continue;
        users += p.users; satW += p.users * p.satisfaction; mkt += Math.max(0, p.marketing);
      }
      if (users > 0) c.satisfaction = clamp(c.satisfaction + (satW / users - c.satisfaction) * 0.05, 0, 100);
      const target = clamp(20 + 8 * Math.log(1 + mkt / 10000) + 4 * Math.log10(1 + users / 1e5) + (c.satisfaction - 60) * 0.3, 0, 100);
      c.brand = clamp(c.brand + (target - c.brand) * 0.01, 0, 100);
    } else if (kind === 'datacenter') {
      let cap = 0, condW = 0, down = 0, total = 0;
      for (const f of c.facilities) {
        if (f.type !== 'dataCenter') continue;
        const inst = dcInstalledCapacity(f);
        total += inst;
        if (f.downDays > 0) down += inst; else { cap += inst; condW += inst * f.condition; }
      }
      if (total > 0) {
        const avgCond = cap > 0 ? condW / cap : 0;
        const satTarget = clamp(40 + avgCond * 0.5 - (down / total) * 40, 0, 100);
        c.satisfaction = clamp(c.satisfaction + (satTarget - c.satisfaction) * 0.03, 0, 100);
      }
      let mkt = 0, share = 0;
      for (const o of c.cloudOffers) { mkt += Math.max(0, o.marketing); share += o.share; }
      const target = clamp(20 + 8 * Math.log(1 + mkt / 10000) + share * 60 + (c.satisfaction - 60) * 0.3, 0, 100);
      c.brand = clamp(c.brand + (target - c.brand) * 0.01, 0, 100);
    }
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────

/** One day of service businesses: data-center cloud market and platforms. */
export function runServicesDay(s: GameState): void {
  runDataCenters(s);
  runPlatforms(s);
  runServiceCompanyDrift(s);
}
