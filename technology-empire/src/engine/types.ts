// ─── Core domain types for TECHNOLOGY EMPIRE ─────────────────────────────
// All simulation state lives in a single serialisable GameState object.
// 1 simulation tick = 1 game day. Money is in USD.

export type Id = string;

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Speed = 0 | 1 | 2 | 4 | 8;

export type SectorId =
  | 'mining'
  | 'semiconductor'
  | 'hardware'
  | 'mobile'
  | 'cloud'
  | 'social'
  | 'software';

/** How a sector's companies make money (selects the simulation path). */
export type SectorKind = 'extraction' | 'processing' | 'manufacturing' | 'datacenter' | 'platform';

/** Tradable commodity / intermediate goods (global market). */
export type GoodId =
  | 'copper' | 'gold' | 'silver' | 'lithium' | 'cobalt' | 'nickel'
  | 'silicon' | 'rareEarth' | 'iron' | 'aluminum'
  | 'wafer' | 'logicChip' | 'memoryChip' | 'battery' | 'display';

/** Consumer product categories (differentiated products, logit market). */
export type CategoryId =
  | 'gpu' | 'cpu' | 'ram' | 'ssd' | 'server' | 'laptop'
  | 'smartphone' | 'tablet' | 'wearable';

/** Service markets (cloud capacity). */
export type CloudServiceId = 'cloud' | 'ai';

/** Platform markets (social media & software). */
export type PlatformCatId =
  | 'video' | 'photo' | 'messaging' | 'streaming' | 'forum' | 'music'
  | 'os' | 'aiApi' | 'gameEngine' | 'office' | 'devTools' | 'security';

export type ManagerRole = 'CEO' | 'CFO' | 'CTO' | 'COO' | 'CMO' | 'CHRO' | 'CPO';
export const MANAGER_ROLES: ManagerRole[] = ['CEO', 'CFO', 'CTO', 'COO', 'CMO', 'CHRO', 'CPO'];

export type Department = 'production' | 'rnd' | 'sales' | 'admin';
export const DEPARTMENTS: Department[] = ['production', 'rnd', 'sales', 'admin'];

export interface Manager {
  id: Id;
  name: string;
  role: ManagerRole;
  /** 0-100 */
  skill: number;
  /** years */
  experience: number;
  /** USD / month */
  salary: number;
  /** 0-100, rolling performance evaluation computed monthly */
  performance: number;
  hiredDay: number;
}

export interface Country {
  id: Id;
  name: string;
  iso3: string; // matches world-atlas numeric via isoNumeric
  isoNumeric: string;
  region: string;
  lat: number;
  lon: number;
  population: number; // millions
  laborForce: number; // millions
  gdp: number; // billions USD
  gdpGrowth: number; // annual, e.g. 0.03
  avgSalary: number; // USD / month (skilled worker)
  unemployment: number; // 0-1
  corporateTax: number; // 0-1
  electricityCost: number; // USD / MWh
  internet: number; // 0-100
  logistics: number; // 0-100
  education: number; // 0-100
  techLevel: number; // 0-100
  politicalRisk: number; // 0-100 (higher = riskier)
  currency: string;
  fx: number; // local currency units per USD index (1 = baseline)
  /** Resource deposits available for mines: good -> richness 0-1 */
  deposits: Partial<Record<GoodId, number>>;
  /** Temporary tax/incentive modifier set by events (added to corporateTax) */
  taxModifier: number;
  /** Market size weight (derived), share of global consumer demand */
  marketWeight: number;
}

export interface Loan {
  id: Id;
  principal: number;
  balance: number;
  annualRate: number;
  /** months remaining */
  termMonths: number;
  monthlyPayment: number;
  takenDay: number;
}

export type FacilityTypeId =
  | 'mine'
  | 'waferPlant' | 'logicFab' | 'memoryFab' | 'batteryPlant' | 'displayPlant'
  | 'assemblyPlant'
  | 'dataCenter';

export interface Facility {
  id: Id;
  type: FacilityTypeId;
  name: string;
  countryId: Id;
  level: number; // 1..10 capacity multiplier
  /** Player/AI target utilisation 0-1 */
  utilization: number;
  /** 0-100, degrades daily, maintenance restores */
  condition: number;
  /** Days of breakdown remaining (0 = operational) */
  downDays: number;
  /** What it produces: GoodId for mine/processing, productId for assembly, CloudServiceId for DC */
  output: string;
  /** mine only */
  reserve?: number;
  purity?: number;
  /** data centers: installed capacity units */
  dcCapacity?: number;
  builtDay: number;
  /** cumulative capex for book value */
  bookValue: number;
  /** last-day actual output (for UI) */
  lastOutput: number;
  /** maintenance spend level 0-2 (1 = standard) */
  maintenance: number;
}

/** Selected option index per spec field. */
export type SpecSelection = Record<string, number>;

export interface Product {
  id: Id;
  companyId: Id;
  category: CategoryId;
  name: string;
  generation: number;
  spec: SpecSelection;
  /** 0-100 quality focus slider */
  qualityFocus: number;
  // Derived at design time (recomputed by computeProductStats)
  performance: number;
  quality: number;
  reliability: number;
  power: number; // watts
  unitMaterialCost: number; // expected at base prices
  /** commodity bill of materials per unit */
  bom: Partial<Record<GoodId, number>>;
  laborHours: number;
  // Commercial
  price: number;
  marketing: number; // USD / day
  active: boolean;
  launchedDay: number;
  /** sales last 30 days rolling (units) */
  sales30: number;
  unitsSoldTotal: number;
  revenueTotal: number;
  /** last-day sold units */
  lastSales: number;
  /** last market share in category (0-1) */
  share: number;
  /** design cost already paid */
  designCost: number;
}

export interface Platform {
  id: Id;
  companyId: Id;
  category: PlatformCatId;
  name: string;
  users: number;
  dau: number;
  creators: number;
  engagement: number; // 0-1
  satisfaction: number; // 0-100
  trust: number; // 0-100
  features: number; // feature level (grows with dev spend)
  // Levers
  adLoad: number; // 0-1
  premiumPrice: number; // USD / month
  moderation: number; // 0-2
  marketing: number; // USD / day
  devSpend: number; // USD / day
  infraCapacity: number; // users supported
  // Last day metrics
  lastSignups: number;
  lastChurn: number;
  lastAdRevenue: number;
  lastSubRevenue: number;
  lastInfraCost: number;
  lastModCost: number;
  premiumUsers: number;
  impressions: number;
  launchedDay: number;
}

export interface CloudOffer {
  service: CloudServiceId;
  price: number; // USD per capacity-unit per day
  marketing: number;
  lastSold: number;
  share: number;
}

export interface ResearchProject {
  techId: Id;
  progress: number; // research points accumulated
  budget: number; // USD / day
}

/** Accumulators for the running month (reset at month end). */
export interface Ledger {
  revenue: number;
  internalRevenue: number;
  cogsMaterials: number;
  salaries: number;
  managerSalaries: number;
  energy: number;
  maintenance: number;
  logistics: number;
  marketing: number;
  rnd: number;
  infra: number;
  other: number;
  interest: number;
  tax: number;
  depreciation: number;
  capex: number;
  dividends: number;
  unitsProduced: number;
  unitsSold: number;
}

export interface MonthlyReport extends Ledger {
  day: number;
  netIncome: number;
  cash: number;
  debt: number;
  inventoryValue: number;
  assets: number;
  equity: number;
  marketCap: number;
  employees: number;
}

export interface Company {
  id: Id;
  name: string;
  holdingId: Id;
  sector: SectorId;
  countryId: Id;
  foundedDay: number;
  color: string;
  icon: string;
  cash: number;
  loans: Loan[];
  employees: Record<Department, number>;
  /** target headcount the company tries to reach (hiring/firing is gradual) */
  employeeTargets: Record<Department, number>;
  morale: number; // 0-100
  managers: Partial<Record<ManagerRole, Manager>>;
  autoManaged: boolean;
  brand: number; // 0-100
  satisfaction: number; // 0-100
  techs: Id[];
  research: ResearchProject | null;
  researchPoints: number; // lifetime
  patents: number;
  facilities: Facility[];
  /** products this company designed (manufacturing) */
  products: Id[];
  platforms: Id[];
  cloudOffers: CloudOffer[];
  /** inventory: goods + products */
  goodsStock: Partial<Record<GoodId, number>>;
  productStock: Record<Id, number>;
  /** Input sourcing policy: internal (holding sisters first) or market only */
  sourcing: 'internal' | 'market';
  /** Transfer price multiplier for sales to sister companies (of market price) */
  transferPriceMult: number;
  /** Countries where the company sells (market presence) */
  markets: Id[];
  // Equity
  sharesOutstanding: number;
  /** shares held by holdings: holdingId -> shares. Remainder = free float (public) */
  shareholders: Record<Id, number>;
  isPublic: boolean;
  sharePrice: number;
  priceHistory: number[]; // last ~120 daily closes
  ledger: Ledger;
  reports: MonthlyReport[]; // last 36
  bankrupt: boolean;
  /** consecutive months with negative cash */
  distressMonths: number;
  /** last 30 days revenue for quick valuation */
  revenue30: number;
  profit30: number;
  dividendPayout: number; // 0-1 of monthly net income
}

export interface AiStrategy {
  aggression: number; // 0-1 pricing aggressiveness
  expansion: number; // 0-1 capex appetite
  rnd: number; // 0-1 research appetite
  risk: number; // 0-1 debt appetite
  focus: SectorId[];
}

export interface Holding {
  id: Id;
  name: string;
  isPlayer: boolean;
  color: string;
  icon: string;
  cash: number;
  strategy?: AiStrategy;
  /** monthly net worth history */
  netWorthHistory: { day: number; value: number }[];
  eliminated: boolean;
}

export interface CommodityMarket {
  good: GoodId;
  price: number;
  basePrice: number;
  /** NPC (outside world) daily supply & demand in units */
  npcSupply: number;
  npcDemand: number;
  /** Event-driven supply multiplier */
  supplyShock: number;
  shockDays: number;
  // today accumulators
  boughtToday: number;
  soldToday: number;
  history: number[]; // daily prices, last 180
}

export interface CategoryMarket {
  category: CategoryId;
  /** frontier performance index (best available tech), grows with research */
  frontierPerf: number;
  avgPrice: number;
  demandToday: number;
  soldToday: number;
  demandHistory: number[];
  priceHistory: number[];
}

export interface CloudMarket {
  service: CloudServiceId;
  demand: number; // capacity units demanded per day
  avgPrice: number;
  history: number[];
}

export interface PlatformMarket {
  category: PlatformCatId;
  addressable: number; // max users globally
  trend: number; // event multiplier on growth (1 = neutral)
  trendDays: number;
}

export interface Macro {
  gdpGrowth: number; // annual global growth
  inflation: number; // annual
  baseRate: number; // central bank annual rate
  demandIndex: number; // multiplier on consumer demand (~1)
  energyIndex: number; // multiplier on electricity prices
  wageIndex: number; // cumulative wage inflation multiplier
  priceLevel: number; // cumulative CPI
  phase: 'expansion' | 'slowdown' | 'recession' | 'recovery';
  phaseDays: number;
  history: { day: number; gdpGrowth: number; inflation: number; baseRate: number; demandIndex: number }[];
}

export type NewsKind =
  | 'tech' | 'launch' | 'economy' | 'commodity' | 'breakdown' | 'recall'
  | 'deal' | 'acquisition' | 'policy' | 'patent' | 'trend' | 'finance' | 'company' | 'system';

export interface NewsItem {
  id: Id;
  day: number;
  kind: NewsKind;
  title: string;
  body: string;
  /** important for player (shown as alert) */
  important: boolean;
  companyId?: Id;
  countryId?: Id;
}

export interface Settings {
  autosave: boolean;
  autosaveIntervalDays: number;
  sound: boolean;
  showTutorial: boolean;
}

export interface GameState {
  version: number;
  seed: number;
  rng: number; // RNG internal state
  day: number;
  speed: Speed;
  difficulty: Difficulty;
  playerHoldingId: Id;
  holdings: Record<Id, Holding>;
  companies: Record<Id, Company>;
  products: Record<Id, Product>;
  platforms: Record<Id, Platform>;
  countries: Record<Id, Country>;
  commodities: Record<GoodId, CommodityMarket>;
  categories: Record<CategoryId, CategoryMarket>;
  cloud: Record<CloudServiceId, CloudMarket>;
  platformMarkets: Record<PlatformCatId, PlatformMarket>;
  macro: Macro;
  news: NewsItem[];
  /** manager candidate pool (refreshed monthly) */
  candidates: Manager[];
  settings: Settings;
  nextId: number;
  /** global tech unlocked by anyone (for frontier) */
  globalTechs: Id[];
  stats: { lastEventDay: number; tickMs: number };
}

export interface NewGameConfig {
  holdingName: string;
  companyName: string;
  color: string;
  icon: string;
  countryId: Id;
  sector: SectorId;
  difficulty: Difficulty;
  seed?: number;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: Id;
}

export function emptyLedger(): Ledger {
  return {
    revenue: 0, internalRevenue: 0, cogsMaterials: 0, salaries: 0, managerSalaries: 0,
    energy: 0, maintenance: 0, logistics: 0, marketing: 0, rnd: 0, infra: 0, other: 0,
    interest: 0, tax: 0, depreciation: 0, capex: 0, dividends: 0, unitsProduced: 0, unitsSold: 0,
  };
}
