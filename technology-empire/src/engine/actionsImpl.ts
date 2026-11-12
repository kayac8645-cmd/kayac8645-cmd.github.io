// Implementation of all player commands (see actions.ts for the public contract).
// Every function validates its input, mutates GameState deterministically and
// returns an ActionResult with a Turkish error message on failure.
import type {
  ActionResult, CategoryId, CloudOffer, CloudServiceId, Company, Department, Facility, FacilityTypeId, GameState,
  GoodId, Holding, Id, ManagerRole, Platform, PlatformCatId, Product, SectorId, SpecSelection,
} from './types';
import { DEPARTMENTS, MANAGER_ROLES } from './types';
import {
  CATEGORIES, CLOUD, FACILITIES, GOODS, PLATFORMS, RAW_GOODS, SECTORS, TECHS,
} from './data/defs';
import { addNews, clamp, countryCosts, newCompany, techEffects } from './util';
import { genId, randRange } from './rng';
import {
  facilityBuildCost, facilityUpgradeCost, loanOffer, marketOpenCost, previewProduct,
} from './preview';
import { availableTechs, holdingTechs } from './selectors';
import { buyFromMarket, marketAvailable, sellToMarket } from './sim/trade';
import { makeLoan, transferControl, valuation } from './sim/finance';
import { createProductObject } from './newGame';

// ─── Helpers ────────────────────────────────────────────────────────────
const ok = (id?: Id): ActionResult => (id === undefined ? { ok: true } : { ok: true, id });
const fail = (error: string): ActionResult => ({ ok: false, error });

const hasKey = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isCloudService = (x: string): x is CloudServiceId => hasKey(CLOUD, x);
const isGood = (x: string): x is GoodId => hasKey(GOODS, x);

const MAX_TARGET = 100_000;
const MAX_LEVEL = 10;
const MAX_DAILY = 100_000_000; // sanity cap for daily budgets (USD/day)

const fmtMoney = (v: number): string => {
  const a = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (a >= 1e9) return `${sign}$${(a / 1e9).toFixed(2)} Mr`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(2)} M`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(1)} B`;
  return `${sign}$${a.toFixed(0)}`;
};
const noCash = (need: number, have: number) => `Yetersiz nakit: ${fmtMoney(need)} gerekli, mevcut ${fmtMoney(have)}.`;

function player(s: GameState): Holding | null {
  return s.holdings[s.playerHoldingId] ?? null;
}

/** Resolve a company the player controls (holdingId === player). */
function own(s: GameState, companyId: Id): Company | string {
  const c = s.companies[companyId];
  if (!c) return 'Şirket bulunamadı.';
  if (c.holdingId !== s.playerHoldingId) return 'Bu şirkete sahip değilsiniz.';
  if (c.bankrupt) return 'Şirket iflas etmiş; işlem yapılamaz.';
  return c;
}

function ownFacility(s: GameState, companyId: Id, facilityId: Id): { c: Company; f: Facility } | string {
  const c = own(s, companyId);
  if (typeof c === 'string') return c;
  const f = c.facilities.find((x) => x.id === facilityId);
  if (!f) return 'Tesis bulunamadı.';
  return { c, f };
}

function ownProduct(s: GameState, productId: Id): { c: Company; p: Product } | string {
  const p = s.products[productId];
  if (!p) return 'Ürün bulunamadı.';
  const c = own(s, p.companyId);
  if (typeof c === 'string') return c;
  return { c, p };
}

function ownPlatform(s: GameState, platformId: Id): { c: Company; pl: Platform } | string {
  const pl = s.platforms[platformId];
  if (!pl) return 'Platform bulunamadı.';
  const c = own(s, pl.companyId);
  if (typeof c === 'string') return c;
  return { c, pl };
}

function cleanName(name: unknown, min = 2, max = 40): string | null {
  if (typeof name !== 'string') return null;
  const n = name.trim().replace(/\s+/g, ' ');
  if (n.length < min || n.length > max) return null;
  return n;
}

function annuity(balance: number, annualRate: number, months: number): number {
  if (months <= 0) return balance;
  const r = annualRate / 12;
  if (r <= 0) return balance / months;
  return (balance * r) / (1 - Math.pow(1 + r, -months));
}

const sharesHeld = (c: Company) => Object.values(c.shareholders).reduce((a, b) => a + b, 0);
const floatShares = (c: Company) => Math.max(0, c.sharesOutstanding - sharesHeld(c));

function hasTech(s: GameState, c: Company, techId: string | undefined): boolean {
  return !techId || holdingTechs(s, c).has(techId);
}
const techName = (t: string) => TECHS[t]?.name ?? t;

function ensureCloudOffer(c: Company, service: CloudServiceId): CloudOffer {
  let o = c.cloudOffers.find((x) => x.service === service);
  if (!o) {
    o = { service, price: CLOUD[service].refPrice, marketing: 0, lastSold: 0, share: 0 };
    c.cloudOffers.push(o);
  }
  return o;
}

/** Validates facility output for a type. Returns error message or null. */
function validateOutput(s: GameState, c: Company, type: FacilityTypeId, countryId: Id, output: string): string | null {
  const def = FACILITIES[type];
  if (type === 'mine') {
    if (!isGood(output) || !RAW_GOODS.includes(output)) return 'Geçersiz değer: maden yalnızca hammadde çıkarabilir.';
    const rich = s.countries[countryId]?.deposits[output] ?? 0;
    if (rich <= 0) return `Bu ülkede ${GOODS[output].name} yatağı yok.`;
    return null;
  }
  if (type === 'assemblyPlant') {
    if (!output) return 'Önce bir ürün tasarlayın (Ürünler ekranı) ve montaj için seçin.';
    const p = s.products[output];
    if (!p || p.companyId !== c.id) return 'Geçersiz ürün: yalnızca bu şirketin tasarladığı ürünler üretilebilir.';
    return null;
  }
  if (type === 'dataCenter') {
    if (!isCloudService(output)) return 'Geçersiz hizmet türü.';
    const req = CLOUD[output].requiresTech;
    if (!hasTech(s, c, req)) return `Teknoloji gerekli: ${techName(req ?? '')}.`;
    return null;
  }
  const outs = def.outputs ?? [];
  if (!isGood(output) || !outs.includes(output)) {
    return `Geçersiz değer: ${def.name} yalnızca ${outs.map((g) => GOODS[g].name).join(', ')} üretebilir.`;
  }
  return null;
}

// ─── Company / holding ──────────────────────────────────────────────────
export function foundCompany(s: GameState, p: { name: string; sector: SectorId; countryId: Id; initialCapital: number; color?: string; icon?: string }): ActionResult {
  const h = player(s);
  if (!h) return fail('Holding bulunamadı.');
  const name = cleanName(p.name);
  if (!name) return fail('Geçersiz değer: şirket adı 2–40 karakter olmalı.');
  if (Object.values(s.companies).some((c) => c.name.toLowerCase() === name.toLowerCase())) return fail('Bu isimde bir şirket zaten var.');
  if (!hasKey(SECTORS, p.sector)) return fail('Geçersiz sektör.');
  if (!s.countries[p.countryId]) return fail('Geçersiz ülke.');
  if (!isNum(p.initialCapital) || p.initialCapital < 0) return fail('Geçersiz değer: başlangıç sermayesi negatif olamaz.');
  const sec = SECTORS[p.sector];
  const cost = sec.foundingCost + p.initialCapital;
  if (h.cash < cost) return fail(noCash(cost, h.cash));
  h.cash -= cost;
  const c = newCompany(s, {
    name, holdingId: h.id, sector: p.sector, countryId: p.countryId, cash: p.initialCapital,
    color: p.color ?? h.color, icon: p.icon ?? sec.icon,
  });
  if (sec.kind === 'datacenter') ensureCloudOffer(c, 'cloud');
  addNews(s, 'company', `${h.name} yeni şirket kurdu: ${name}`, `${sec.name} sektöründe ${s.countries[p.countryId].name} merkezli ${name} faaliyete başladı.`, { companyId: c.id, countryId: p.countryId });
  return ok(c.id);
}

export function transferCash(s: GameState, companyId: Id, amount: number): ActionResult {
  const h = player(s);
  if (!h) return fail('Holding bulunamadı.');
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!isNum(amount) || amount === 0) return fail('Geçersiz değer: tutar sıfırdan farklı bir sayı olmalı.');
  if (amount > 0) {
    if (h.cash < amount) return fail(noCash(amount, h.cash));
    h.cash -= amount;
    c.cash += amount;
  } else {
    const a = -amount;
    if (c.sharesOutstanding - (c.shareholders[h.id] ?? 0) > 0) return fail('Halka açık şirketten doğrudan nakit çekilemez; temettü politikasını kullanın.');
    if (c.cash < a) return fail(noCash(a, c.cash));
    c.cash -= a;
    h.cash += a;
  }
  return ok();
}

export function renameCompany(s: GameState, companyId: Id, name: string): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  const n = cleanName(name);
  if (!n) return fail('Geçersiz değer: şirket adı 2–40 karakter olmalı.');
  if (Object.values(s.companies).some((o) => o.id !== c.id && o.name.toLowerCase() === n.toLowerCase())) return fail('Bu isimde bir şirket zaten var.');
  c.name = n;
  return ok(c.id);
}

// ─── Facilities ─────────────────────────────────────────────────────────
export function buildFacility(s: GameState, companyId: Id, p: { type: FacilityTypeId; countryId: Id; output: string }): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!hasKey(FACILITIES, p.type)) return fail('Geçersiz tesis türü.');
  const def = FACILITIES[p.type];
  if (!SECTORS[c.sector].facilities.includes(p.type)) return fail(`${SECTORS[c.sector].name} şirketi ${def.name} kuramaz.`);
  const country = s.countries[p.countryId];
  if (!country) return fail('Geçersiz ülke.');
  if (!hasTech(s, c, def.requiresTech)) return fail(`Teknoloji gerekli: ${techName(def.requiresTech ?? '')}.`);
  const out = String(p.output ?? '');
  const bad = validateOutput(s, c, p.type, p.countryId, out);
  if (bad) return fail(bad);
  const cost = facilityBuildCost(s, p.type, p.countryId);
  if (c.cash < cost) return fail(noCash(cost, c.cash));

  c.cash -= cost;
  c.ledger.capex += cost;
  const n = c.facilities.filter((f) => f.type === p.type).length + 1;
  const f: Facility = {
    id: genId(s, 'f'), type: p.type, name: `${def.name} ${country.name} #${n}`, countryId: p.countryId,
    level: 1, utilization: 1, condition: 100, downDays: 0, output: out,
    builtDay: s.day, bookValue: cost, lastOutput: 0, maintenance: 1,
  };
  if (p.type === 'mine' && isGood(out)) {
    const richness = country.deposits[out] ?? 0;
    const purity = Math.round(randRange(s, 0.7, 1) * 100) / 100;
    f.purity = purity;
    // ≈ 8 years of output at level 1
    f.reserve = Math.round((def.capacity / GOODS[out].basePrice) * richness * purity * 360 * 8);
  }
  if (p.type === 'dataCenter' && isCloudService(out)) {
    f.dcCapacity = 0;
    ensureCloudOffer(c, out);
  }
  c.facilities.push(f);
  return ok(f.id);
}

export function upgradeFacility(s: GameState, companyId: Id, facilityId: Id): ActionResult {
  const r = ownFacility(s, companyId, facilityId);
  if (typeof r === 'string') return fail(r);
  const { c, f } = r;
  if (f.level >= MAX_LEVEL) return fail(`Tesis zaten en yüksek seviyede (${MAX_LEVEL}).`);
  const cost = facilityUpgradeCost(s, f);
  if (c.cash < cost) return fail(noCash(cost, c.cash));
  c.cash -= cost;
  c.ledger.capex += cost;
  f.bookValue += cost;
  f.level += 1;
  return ok(f.id);
}

export function sellFacility(s: GameState, companyId: Id, facilityId: Id): ActionResult {
  const r = ownFacility(s, companyId, facilityId);
  if (typeof r === 'string') return fail(r);
  const { c, f } = r;
  // 30% (worn out) … 50% (perfect condition) of book value
  const ratio = 0.3 + 0.2 * clamp(f.condition, 0, 100) / 100;
  const proceeds = Math.max(0, Math.round(f.bookValue * ratio));
  c.cash += proceeds;
  c.ledger.capex -= proceeds; // net investment (disinvestment)
  c.ledger.depreciation += Math.max(0, f.bookValue - proceeds); // non-cash loss on disposal
  c.facilities = c.facilities.filter((x) => x.id !== f.id);
  return ok(f.id);
}

export function setFacility(s: GameState, companyId: Id, facilityId: Id, p: { utilization?: number; maintenance?: number; output?: string }): ActionResult {
  const r = ownFacility(s, companyId, facilityId);
  if (typeof r === 'string') return fail(r);
  const { c, f } = r;
  if (p.utilization !== undefined && (!isNum(p.utilization) || p.utilization < 0 || p.utilization > 1)) return fail('Geçersiz değer: kullanım oranı 0–1 arasında olmalı.');
  if (p.maintenance !== undefined && (!isNum(p.maintenance) || p.maintenance < 0 || p.maintenance > 2)) return fail('Geçersiz değer: bakım düzeyi 0–2 arasında olmalı.');
  if (p.output !== undefined && p.output !== f.output) {
    const out = String(p.output);
    if (f.type === 'mine') return fail('Maden sahasının çıkardığı hammadde değiştirilemez; yeni maden kurun.');
    if (f.type === 'dataCenter' && (f.dcCapacity ?? 0) > 0) return fail('Kurulu donanımı olan veri merkezinin hizmet türü değiştirilemez (sunucu ve GPU farklıdır).');
    const bad = validateOutput(s, c, f.type, f.countryId, out);
    if (bad) return fail(bad);
    f.output = out;
    if (f.type === 'dataCenter' && isCloudService(out)) ensureCloudOffer(c, out);
  }
  if (p.utilization !== undefined) f.utilization = p.utilization;
  if (p.maintenance !== undefined) f.maintenance = p.maintenance;
  return ok(f.id);
}

export function expandDataCenter(s: GameState, companyId: Id, facilityId: Id, inputUnits: number): ActionResult {
  const r = ownFacility(s, companyId, facilityId);
  if (typeof r === 'string') return fail(r);
  const { c, f } = r;
  if (f.type !== 'dataCenter') return fail('Yalnızca veri merkezleri genişletilebilir.');
  if (!isCloudService(f.output)) return fail('Veri merkezinin hizmet türü geçersiz.');
  if (!isNum(inputUnits) || inputUnits < 1 || Math.round(inputUnits) !== inputUnits) return fail('Geçersiz değer: adet pozitif tam sayı olmalı.');
  const def = CLOUD[f.output];
  const cat: CategoryId = def.inputCategory;
  const maxCap = FACILITIES.dataCenter.capacity * f.level;
  const cur = f.dcCapacity ?? 0;
  const maxUnits = Math.floor((maxCap - cur) / def.unitsPerInput);
  if (maxUnits <= 0) return fail(`Veri merkezi tam kapasitede (${maxCap} birim). Tesisi yükseltin.`);
  if (inputUnits > maxUnits) return fail(`Kapasite sınırı: bu seviyede en fazla ${maxUnits} adet ${CATEGORIES[cat].name} eklenebilir.`);

  // Plan purchases: sister companies' stock first (if internal sourcing), then market.
  const plan: { o: Company; p: Product; q: number; price: number }[] = [];
  let need = inputUnits;
  if (c.sourcing === 'internal') {
    for (const o of Object.values(s.companies)) {
      if (need <= 0) break;
      if (o.id === c.id || o.holdingId !== c.holdingId || o.bankrupt) continue;
      for (const pid of o.products) {
        if (need <= 0) break;
        const prod = s.products[pid];
        if (!prod || prod.category !== cat) continue;
        const have = Math.floor(o.productStock[pid] ?? 0);
        if (have <= 0) continue;
        const q = Math.min(have, need);
        plan.push({ o, p: prod, q, price: prod.price * o.transferPriceMult });
        need -= q;
      }
    }
  }
  const avg = s.categories[cat]?.avgPrice ?? 0;
  const mktPrice = (avg > 0 ? avg : CATEGORIES[cat].refPrice * s.macro.priceLevel) * 1.1;
  const internalCost = plan.reduce((a, x) => a + x.q * x.price, 0);
  const total = internalCost + need * mktPrice;
  if (c.cash < total) return fail(noCash(total, c.cash));

  for (const x of plan) {
    const v = x.q * x.price;
    x.o.productStock[x.p.id] = (x.o.productStock[x.p.id] ?? 0) - x.q;
    x.o.cash += v;
    x.o.ledger.revenue += v;
    x.o.ledger.internalRevenue += v;
    x.o.ledger.unitsSold += x.q;
    x.p.unitsSoldTotal += x.q;
    x.p.revenueTotal += v;
  }
  c.cash -= total;
  c.ledger.capex += total;
  f.bookValue += total;
  f.dcCapacity = Math.min(maxCap, cur + inputUnits * def.unitsPerInput);
  ensureCloudOffer(c, f.output);
  return ok(f.id);
}

// ─── Products ───────────────────────────────────────────────────────────
export function designProduct(s: GameState, companyId: Id, p: { category: CategoryId; name: string; spec: SpecSelection; qualityFocus: number; price: number; marketing: number }): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!hasKey(CATEGORIES, p.category)) return fail('Geçersiz ürün kategorisi.');
  const def = CATEGORIES[p.category];
  if (!(SECTORS[c.sector].categories ?? []).includes(p.category)) return fail(`${SECTORS[c.sector].name} şirketi ${def.name} tasarlayamaz.`);
  const name = cleanName(p.name);
  if (!name) return fail('Geçersiz değer: ürün adı 2–40 karakter olmalı.');
  if (!isNum(p.qualityFocus) || p.qualityFocus < 0 || p.qualityFocus > 100) return fail('Geçersiz değer: kalite odağı 0–100 arasında olmalı.');
  if (!isNum(p.price) || p.price <= 0) return fail('Geçersiz değer: fiyat pozitif olmalı.');
  if (!isNum(p.marketing) || p.marketing < 0 || p.marketing > MAX_DAILY) return fail('Geçersiz değer: pazarlama bütçesi negatif olamaz.');
  const spec: SpecSelection = {};
  for (const fld of def.fields) {
    const v = p.spec?.[fld.key] ?? 0;
    if (!isNum(v) || Math.round(v) !== v || v < 0 || v >= fld.options.length) return fail(`Geçersiz değer: "${fld.label}" seçimi hatalı.`);
    spec[fld.key] = v;
  }
  const pv = previewProduct(s, c.id, { category: p.category, spec, qualityFocus: p.qualityFocus });
  if (pv.locked.length > 0) return fail(`Teknoloji gerekli: ${pv.locked.join(', ')}.`);
  const cost = pv.designCost;
  if (c.cash < cost) return fail(noCash(cost, c.cash));

  // Pay licence fees to a tech owner outside the holding (included in design cost).
  for (const t of pv.licensed) {
    const fee = (TECHS[t]?.cost ?? 0) * 400;
    const owner = Object.values(s.companies).find((o) => o.holdingId !== c.holdingId && !o.bankrupt && o.techs.includes(t));
    if (owner && fee > 0) { owner.cash += fee; owner.ledger.revenue += fee; }
  }
  c.cash -= cost;
  c.ledger.rnd += cost;

  const prod = createProductObject(s, c.id, { category: p.category, name, spec, qualityFocus: p.qualityFocus, price: p.price, marketing: p.marketing });
  prod.designCost = cost;
  s.products[prod.id] = prod;
  if (!c.products.includes(prod.id)) c.products.push(prod.id);
  c.productStock[prod.id] = 0;
  addNews(s, 'launch', `${c.name} yeni ürün tasarladı: ${name}`, `${def.name} kategorisinde ${name} tanıtıldı. Fiyat ${fmtMoney(p.price)}.`, { companyId: c.id });
  return ok(prod.id);
}

export function updateProduct(s: GameState, productId: Id, p: { price?: number; marketing?: number; active?: boolean; name?: string }): ActionResult {
  const r = ownProduct(s, productId);
  if (typeof r === 'string') return fail(r);
  const { p: prod } = r;
  if (p.price !== undefined && (!isNum(p.price) || p.price <= 0)) return fail('Geçersiz değer: fiyat pozitif olmalı.');
  if (p.marketing !== undefined && (!isNum(p.marketing) || p.marketing < 0 || p.marketing > MAX_DAILY)) return fail('Geçersiz değer: pazarlama bütçesi negatif olamaz.');
  if (p.active !== undefined && typeof p.active !== 'boolean') return fail('Geçersiz değer.');
  let name: string | null = null;
  if (p.name !== undefined) {
    name = cleanName(p.name);
    if (!name) return fail('Geçersiz değer: ürün adı 2–40 karakter olmalı.');
  }
  if (p.price !== undefined) prod.price = p.price;
  if (p.marketing !== undefined) prod.marketing = p.marketing;
  if (p.active !== undefined) prod.active = p.active;
  if (name) prod.name = name;
  return ok(prod.id);
}

// ─── Platforms ──────────────────────────────────────────────────────────
export function launchPlatform(s: GameState, companyId: Id, p: { category: PlatformCatId; name: string }): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!hasKey(PLATFORMS, p.category)) return fail('Geçersiz platform kategorisi.');
  const def = PLATFORMS[p.category];
  if (!(SECTORS[c.sector].platformCats ?? []).includes(p.category)) return fail(`${SECTORS[c.sector].name} şirketi ${def.name} platformu başlatamaz.`);
  const name = cleanName(p.name);
  if (!name) return fail('Geçersiz değer: platform adı 2–40 karakter olmalı.');
  if (c.platforms.some((id) => s.platforms[id]?.category === p.category)) return fail('Bu kategoride zaten bir platformunuz var.');
  if (!hasTech(s, c, def.requiresTech)) return fail(`Teknoloji gerekli: ${techName(def.requiresTech ?? '')}.`);
  const cost = def.launchCost;
  if (c.cash < cost) return fail(noCash(cost, c.cash));
  c.cash -= cost;
  c.ledger.capex += cost;

  const users = 2000;
  const engagement = clamp(0.25 + techEffects(c).engagement, 0, 0.95);
  const pl: Platform = {
    id: genId(s, 'pl'), companyId: c.id, category: p.category, name,
    users, dau: users * def.dauRatio * (0.6 + engagement), creators: users * def.creatorRate,
    engagement, satisfaction: 70, trust: 60, features: 0,
    adLoad: 0.3, premiumPrice: def.refPremiumPrice, moderation: 1, marketing: 0, devSpend: 0,
    infraCapacity: 50_000,
    lastSignups: 0, lastChurn: 0, lastAdRevenue: 0, lastSubRevenue: 0, lastInfraCost: 0, lastModCost: 0,
    premiumUsers: users * def.premiumRate, impressions: 0, launchedDay: s.day,
  };
  s.platforms[pl.id] = pl;
  c.platforms.push(pl.id);
  addNews(s, 'launch', `${c.name} yeni platform başlattı: ${name}`, `${def.name} pazarına ${name} ile giriş yapıldı.`, { companyId: c.id });
  return ok(pl.id);
}

export function updatePlatform(s: GameState, platformId: Id, p: { adLoad?: number; premiumPrice?: number; moderation?: number; marketing?: number; devSpend?: number; name?: string }): ActionResult {
  const r = ownPlatform(s, platformId);
  if (typeof r === 'string') return fail(r);
  const { pl } = r;
  if (p.adLoad !== undefined && (!isNum(p.adLoad) || p.adLoad < 0 || p.adLoad > 1)) return fail('Geçersiz değer: reklam yoğunluğu 0–1 arasında olmalı.');
  if (p.premiumPrice !== undefined && (!isNum(p.premiumPrice) || p.premiumPrice <= 0 || p.premiumPrice > 1000)) return fail('Geçersiz değer: abonelik fiyatı 0–1000 $ arasında olmalı.');
  if (p.moderation !== undefined && (!isNum(p.moderation) || p.moderation < 0 || p.moderation > 2)) return fail('Geçersiz değer: moderasyon düzeyi 0–2 arasında olmalı.');
  if (p.marketing !== undefined && (!isNum(p.marketing) || p.marketing < 0 || p.marketing > MAX_DAILY)) return fail('Geçersiz değer: pazarlama bütçesi negatif olamaz.');
  if (p.devSpend !== undefined && (!isNum(p.devSpend) || p.devSpend < 0 || p.devSpend > MAX_DAILY)) return fail('Geçersiz değer: geliştirme bütçesi negatif olamaz.');
  let name: string | null = null;
  if (p.name !== undefined) {
    name = cleanName(p.name);
    if (!name) return fail('Geçersiz değer: platform adı 2–40 karakter olmalı.');
  }
  if (p.adLoad !== undefined) pl.adLoad = p.adLoad;
  if (p.premiumPrice !== undefined) pl.premiumPrice = p.premiumPrice;
  if (p.moderation !== undefined) pl.moderation = p.moderation;
  if (p.marketing !== undefined) pl.marketing = p.marketing;
  if (p.devSpend !== undefined) pl.devSpend = p.devSpend;
  if (name) pl.name = name;
  return ok(pl.id);
}

export function expandPlatformInfra(s: GameState, platformId: Id, users: number): ActionResult {
  const r = ownPlatform(s, platformId);
  if (typeof r === 'string') return fail(r);
  const { c, pl } = r;
  if (!isNum(users) || users < 1 || Math.round(users) !== users) return fail('Geçersiz değer: kapasite pozitif tam sayı olmalı.');
  const cost = users * 0.4;
  if (c.cash < cost) return fail(noCash(cost, c.cash));
  c.cash -= cost;
  c.ledger.capex += cost;
  pl.infraCapacity += users;
  return ok(pl.id);
}

// ─── Cloud ──────────────────────────────────────────────────────────────
export function setCloudOffer(s: GameState, companyId: Id, service: CloudServiceId, p: { price?: number; marketing?: number }): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (SECTORS[c.sector].kind !== 'datacenter') return fail('Yalnızca bulut şirketleri hizmet teklifi verebilir.');
  if (!isCloudService(service)) return fail('Geçersiz hizmet türü.');
  const def = CLOUD[service];
  if (!hasTech(s, c, def.requiresTech)) return fail(`Teknoloji gerekli: ${techName(def.requiresTech ?? '')}.`);
  if (p.price !== undefined && (!isNum(p.price) || p.price <= 0 || p.price > def.refPrice * 20)) return fail(`Geçersiz değer: fiyat 0 ile ${fmtMoney(def.refPrice * 20)} arasında olmalı.`);
  if (p.marketing !== undefined && (!isNum(p.marketing) || p.marketing < 0 || p.marketing > MAX_DAILY)) return fail('Geçersiz değer: pazarlama bütçesi negatif olamaz.');
  const o = ensureCloudOffer(c, service);
  if (p.price !== undefined) o.price = p.price;
  if (p.marketing !== undefined) o.marketing = p.marketing;
  return ok();
}

// ─── Research ───────────────────────────────────────────────────────────
export function startResearch(s: GameState, companyId: Id, techId: Id, budgetPerDay: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!TECHS[techId]) return fail('Teknoloji bulunamadı.');
  if (!isNum(budgetPerDay) || budgetPerDay < 0 || budgetPerDay > MAX_DAILY) return fail('Geçersiz değer: araştırma bütçesi negatif olamaz.');
  if (c.research && c.research.techId === techId) { c.research.budget = budgetPerDay; return ok(techId); }
  if (c.research) return fail(`Şirket zaten "${techName(c.research.techId)}" araştırıyor; önce iptal edin.`);
  if (c.techs.includes(techId)) return fail('Bu teknolojiye zaten sahipsiniz.');
  if (!availableTechs(c).some((t) => t.id === techId)) {
    const t = TECHS[techId];
    if (t.sector !== c.sector) return fail('Bu teknoloji şirketin sektörüne ait değil.');
    return fail(`Önkoşul teknolojiler gerekli: ${t.prereq.filter((x) => !c.techs.includes(x)).map(techName).join(', ')}.`);
  }
  c.research = { techId, progress: 0, budget: budgetPerDay };
  return ok(techId);
}

export function setResearchBudget(s: GameState, companyId: Id, budgetPerDay: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!c.research) return fail('Devam eden araştırma yok.');
  if (!isNum(budgetPerDay) || budgetPerDay < 0 || budgetPerDay > MAX_DAILY) return fail('Geçersiz değer: araştırma bütçesi negatif olamaz.');
  c.research.budget = budgetPerDay;
  return ok();
}

export function cancelResearch(s: GameState, companyId: Id): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!c.research) return fail('Devam eden araştırma yok.');
  c.research = null; // progress is lost
  return ok();
}

// ─── People ─────────────────────────────────────────────────────────────
export function setEmployeeTarget(s: GameState, companyId: Id, dept: Department, target: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!DEPARTMENTS.includes(dept)) return fail('Geçersiz departman.');
  if (dept === 'production') return fail('Üretim personeli tesislerin ihtiyacına göre otomatik ayarlanır; tesis kurarak, yükselterek veya satarak değişir.');
  if (!isNum(target) || target < 0 || target > MAX_TARGET) return fail(`Geçersiz değer: hedef 0–${MAX_TARGET.toLocaleString('tr-TR')} arasında olmalı.`);
  c.employeeTargets[dept] = Math.round(target);
  return ok();
}

function payOff(c: Company, role: ManagerRole): void {
  const m = c.managers[role];
  if (!m) return;
  const sev = m.salary * 3;
  c.cash -= sev;
  c.ledger.managerSalaries += sev;
  delete c.managers[role];
}

export function hireManager(s: GameState, companyId: Id, candidateId: Id): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  const idx = s.candidates.findIndex((m) => m.id === candidateId);
  if (idx < 0) return fail('Aday bulunamadı (başka bir yere geçmiş olabilir).');
  const cand = s.candidates[idx];
  const prev = c.managers[cand.role];
  const sev = prev ? prev.salary * 3 : 0;
  // Require the first month's salary plus any severance up front.
  const need = sev + cand.salary;
  if (c.cash < need) return fail(noCash(need, c.cash));
  if (prev) payOff(c, cand.role);
  s.candidates.splice(idx, 1);
  c.managers[cand.role] = { ...cand, hiredDay: s.day, performance: 60 };
  return ok(cand.id);
}

export function fireManager(s: GameState, companyId: Id, role: ManagerRole): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!MANAGER_ROLES.includes(role)) return fail('Geçersiz yönetici rolü.');
  const m = c.managers[role];
  if (!m) return fail('Bu pozisyonda yönetici yok.');
  const sev = m.salary * 3;
  if (c.cash < sev) return fail(`${noCash(sev, c.cash)} (3 aylık tazminat)`);
  payOff(c, role);
  if (role === 'CEO') c.autoManaged = false;
  return ok();
}

export function setAutoManaged(s: GameState, companyId: Id, auto: boolean): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (auto && !c.managers.CEO) return fail('Otomatik yönetim için önce bir Genel Müdür (CEO) atayın.');
  c.autoManaged = !!auto;
  return ok();
}

// ─── Supply / trade ─────────────────────────────────────────────────────
export function setSourcing(s: GameState, companyId: Id, p: { sourcing?: 'internal' | 'market'; transferPriceMult?: number }): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (p.sourcing !== undefined && p.sourcing !== 'internal' && p.sourcing !== 'market') return fail('Geçersiz tedarik politikası.');
  if (p.transferPriceMult !== undefined && (!isNum(p.transferPriceMult) || p.transferPriceMult < 0.5 || p.transferPriceMult > 2)) return fail('Geçersiz değer: transfer fiyat çarpanı 0,5–2 arasında olmalı.');
  if (p.sourcing !== undefined) c.sourcing = p.sourcing;
  if (p.transferPriceMult !== undefined) c.transferPriceMult = p.transferPriceMult;
  return ok();
}

export function tradeGood(s: GameState, companyId: Id, good: GoodId, qty: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!isGood(good)) return fail('Geçersiz emtia.');
  if (!isNum(qty) || qty === 0) return fail('Geçersiz değer: miktar sıfırdan farklı olmalı.');
  if (qty > 0) {
    const avail = marketAvailable(s, good);
    if (avail <= 0) return fail(`Piyasada bugün satılık ${GOODS[good].name} kalmadı.`);
    const q = Math.min(qty, avail);
    const fee = countryCosts(s, s.countries[c.countryId]).logisticsFee;
    const cost = q * s.commodities[good].price * (1 + fee);
    if (c.cash < cost) return fail(noCash(cost, c.cash));
    const got = buyFromMarket(s, c, good, q);
    if (got <= 0) return fail('Alım gerçekleşmedi.');
    return ok();
  }
  const have = c.goodsStock[good] ?? 0;
  if (have <= 0) return fail(`Stokta ${GOODS[good].name} yok.`);
  if (-qty > have + 1e-9) return fail(`Stok yetersiz: yalnızca ${have.toFixed(1)} ${GOODS[good].unit} var.`);
  const sold = sellToMarket(s, c, good, Math.min(-qty, have));
  if (sold <= 0) return fail('Satış gerçekleşmedi.');
  return ok();
}

export function openMarket(s: GameState, companyId: Id, countryId: Id): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  const country = s.countries[countryId];
  if (!country) return fail('Geçersiz ülke.');
  if (c.markets.includes(countryId)) return fail(`${country.name} pazarında zaten varsınız.`);
  const cost = marketOpenCost(s, countryId);
  if (c.cash < cost) return fail(noCash(cost, c.cash));
  c.cash -= cost;
  c.ledger.marketing += cost;
  c.markets.push(countryId);
  return ok(countryId);
}

// ─── Finance ────────────────────────────────────────────────────────────
export function takeLoan(s: GameState, companyId: Id, amount: number, termMonths: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!isNum(amount) || amount <= 0) return fail('Geçersiz değer: kredi tutarı pozitif olmalı.');
  if (!isNum(termMonths) || Math.round(termMonths) !== termMonths || termMonths < 6 || termMonths > 120) return fail('Geçersiz değer: vade 6–120 ay arasında olmalı.');
  const offer = loanOffer(s, c.id);
  if (offer.maxAmount <= 0) return fail('Banka yeni kredi vermiyor: borç limiti dolu.');
  if (amount > offer.maxAmount) return fail(`Kredi limiti aşıldı: en fazla ${fmtMoney(offer.maxAmount)} kullanılabilir.`);
  const cashBefore = c.cash;
  const loan = makeLoan(s, c, amount, termMonths, offer.annualRate);
  if (!c.loans.includes(loan)) c.loans.push(loan);
  if (c.cash === cashBefore) c.cash += amount;
  return ok(loan.id);
}

export function repayLoan(s: GameState, companyId: Id, loanId: Id, amount: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  const loan = c.loans.find((l) => l.id === loanId);
  if (!loan) return fail('Kredi bulunamadı.');
  if (!isNum(amount) || amount <= 0) return fail('Geçersiz değer: tutar pozitif olmalı.');
  const pay = Math.min(amount, loan.balance);
  if (c.cash < pay) return fail(noCash(pay, c.cash));
  c.cash -= pay;
  loan.balance -= pay;
  if (loan.balance <= 0.5) {
    c.loans = c.loans.filter((l) => l.id !== loan.id);
  } else {
    loan.monthlyPayment = annuity(loan.balance, loan.annualRate, loan.termMonths);
  }
  return ok(loan.id);
}

export function setDividend(s: GameState, companyId: Id, payout: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (!isNum(payout) || payout < 0 || payout > 1) return fail('Geçersiz değer: temettü oranı 0–1 arasında olmalı.');
  c.dividendPayout = payout;
  return ok();
}

export function ipo(s: GameState, companyId: Id, fraction: number): ActionResult {
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  if (c.isPublic) return fail('Şirket zaten halka açık.');
  if (!isNum(fraction) || fraction < 0.1 || fraction > 0.49) return fail('Geçersiz değer: halka arz oranı %10–%49 arasında olmalı.');
  const value = valuation(s, c);
  if (!isNum(value) || value <= 0) return fail('Şirket değeri halka arz için çok düşük.');
  const price = value / c.sharesOutstanding;
  // New shares issued so that the public owns `fraction` after the offering.
  const newShares = Math.round((c.sharesOutstanding * fraction) / (1 - fraction));
  const gross = newShares * price;
  const fees = gross * 0.04;
  c.sharesOutstanding += newShares;
  c.cash += gross - fees;
  c.ledger.other += fees;
  c.isPublic = true;
  c.sharePrice = price;
  c.priceHistory.push(price);
  if (c.priceHistory.length > 120) c.priceHistory.splice(0, c.priceHistory.length - 120);
  addNews(s, 'finance', `${c.name} halka arz edildi`, `Hisselerin %${Math.round(fraction * 100)}'i hisse başı ${fmtMoney(price)} fiyatla halka arz edildi; şirkete ${fmtMoney(gross - fees)} nakit girdi.`, { important: true, companyId: c.id });
  return ok(c.id);
}

export function tradeShares(s: GameState, companyId: Id, shares: number): ActionResult {
  const h = player(s);
  if (!h) return fail('Holding bulunamadı.');
  const c = s.companies[companyId];
  if (!c) return fail('Şirket bulunamadı.');
  if (c.bankrupt) return fail('Şirket iflas etmiş; hisseleri işlem görmüyor.');
  if (!c.isPublic) return fail('Şirket halka açık değil; hisseleri borsada işlem görmüyor.');
  if (!isNum(shares)) return fail('Geçersiz değer.');
  const n = Math.round(Math.abs(shares));
  if (n === 0) return fail('Geçersiz değer: hisse adedi sıfır olamaz.');
  const price = c.sharePrice;
  const impact = (n / c.sharesOutstanding) * 2;
  const held = c.shareholders[h.id] ?? 0;
  if (shares > 0) {
    const fl = Math.floor(floatShares(c));
    if (fl <= 0) return fail('Serbest dolaşımda hisse yok.');
    if (n > fl) return fail(`Serbest dolaşımdaki hisse yetersiz: en fazla ${fl.toLocaleString('tr-TR')} adet alınabilir.`);
    const newPrice = price * (1 + impact);
    const cost = n * (price + newPrice) / 2;
    if (h.cash < cost) return fail(noCash(cost, h.cash));
    h.cash -= cost;
    c.shareholders[h.id] = held + n;
    c.sharePrice = newPrice;
    if (c.holdingId !== h.id && (held + n) / c.sharesOutstanding > 0.5) {
      const prevOwner = s.holdings[c.holdingId];
      transferControl(s, c, h.id);
      addNews(s, 'acquisition', `${h.name}, ${c.name} kontrolünü ele geçirdi`, `Borsa alımlarıyla %${Math.round(((held + n) / c.sharesOutstanding) * 100)} paya ulaşan ${h.name}, ${prevOwner?.name ?? 'önceki sahibi'} elinden ${c.name} yönetimini devraldı.`, { important: true, companyId: c.id });
    }
    return ok(c.id);
  }
  if (n > held) return fail(`Yeterli hisseniz yok: ${held.toLocaleString('tr-TR')} adet sahipsiniz.`);
  if (c.holdingId === h.id && (held - n) / c.sharesOutstanding <= 0.5) {
    return fail('Kontrolü kaybetmemek için payınız %50\'nin altına düşemez; şirketi elden çıkarmak için "Şirketi Sat" kullanın.');
  }
  const newPrice = Math.max(0.01, price * (1 - impact));
  const proceeds = n * (price + newPrice) / 2;
  h.cash += proceeds;
  if (held - n > 0) c.shareholders[h.id] = held - n;
  else delete c.shareholders[h.id];
  c.sharePrice = newPrice;
  return ok(c.id);
}

export function acquisitionCost(s: GameState, companyId: Id): number {
  const c = s.companies[companyId];
  if (!c) return 0;
  const notOwned = Math.max(0, c.sharesOutstanding - (c.shareholders[s.playerHoldingId] ?? 0));
  return notOwned * c.sharePrice * 1.3;
}

export function acquireCompany(s: GameState, companyId: Id): ActionResult {
  const h = player(s);
  if (!h) return fail('Holding bulunamadı.');
  const c = s.companies[companyId];
  if (!c) return fail('Şirket bulunamadı.');
  if (c.bankrupt) return fail('İflas etmiş şirket satın alınamaz.');
  const notOwned = c.sharesOutstanding - (c.shareholders[h.id] ?? 0);
  if (notOwned <= 0) return fail('Şirketin tamamı zaten size ait.');
  const cost = acquisitionCost(s, c.id);
  if (h.cash < cost) return fail(noCash(cost, h.cash));
  const offer = c.sharePrice * 1.3;
  h.cash -= cost;
  for (const [hid, sh] of Object.entries(c.shareholders)) {
    if (hid === h.id) continue;
    const other = s.holdings[hid];
    if (other) other.cash += sh * offer;
  }
  // Free float is paid out to public investors and leaves the company.
  c.shareholders = { [h.id]: c.sharesOutstanding };
  c.isPublic = false;
  const prevOwner = s.holdings[c.holdingId];
  const wasOther = c.holdingId !== h.id;
  if (wasOther) transferControl(s, c, h.id);
  c.shareholders = { [h.id]: c.sharesOutstanding };
  c.isPublic = false;
  addNews(s, 'acquisition', wasOther ? `${h.name}, ${c.name} şirketini satın aldı` : `${c.name} borsadan çekildi`,
    wasOther
      ? `${prevOwner?.name ?? 'Önceki sahip'} bünyesindeki ${c.name}, hisse başı ${fmtMoney(offer)} teklifle toplam ${fmtMoney(cost)} karşılığında ${h.name} holdingine geçti.`
      : `${h.name}, kalan tüm hisseleri ${fmtMoney(cost)} karşılığında toplayarak ${c.name} şirketini tamamen satın aldı.`,
    { important: true, companyId: c.id });
  return ok(c.id);
}

export function sellCompany(s: GameState, companyId: Id): ActionResult {
  const h = player(s);
  if (!h) return fail('Holding bulunamadı.');
  const c = own(s, companyId);
  if (typeof c === 'string') return fail(c);
  const held = c.shareholders[h.id] ?? 0;
  if (held <= 0) return fail('Bu şirkette hisseniz yok.');
  const value = valuation(s, c);
  if (!isNum(value) || value <= 0) return fail('Şirketin değeri çok düşük; alıcı bulunamadı.');
  const price = value * 0.9 * (held / c.sharesOutstanding);
  const buyers = Object.values(s.holdings)
    .filter((x) => !x.isPlayer && x.id !== h.id && !x.eliminated && x.cash >= price)
    .sort((a, b) => {
      const fa = a.strategy?.focus.includes(c.sector) ? 1 : 0;
      const fb = b.strategy?.focus.includes(c.sector) ? 1 : 0;
      if (fa !== fb) return fb - fa;
      if (b.cash !== a.cash) return b.cash - a.cash;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
  const buyer = buyers[0];
  if (!buyer) return fail(`Alıcı bulunamadı: hiçbir rakip holding ${fmtMoney(price)} ödeyemiyor.`);
  buyer.cash -= price;
  h.cash += price;
  delete c.shareholders[h.id];
  c.shareholders[buyer.id] = (c.shareholders[buyer.id] ?? 0) + held;
  transferControl(s, c, buyer.id);
  addNews(s, 'acquisition', `${h.name}, ${c.name} şirketini ${buyer.name} holdingine sattı`, `Satış bedeli ${fmtMoney(price)} oldu.`, { important: true, companyId: c.id });
  return ok(c.id);
}
