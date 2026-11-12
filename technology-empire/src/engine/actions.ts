// Player commands. Every UI mutation of GameState goes through these functions.
// Each validates input and returns ActionResult { ok, error?, id? }.
// IMPLEMENTATION NOTE: bodies are filled in by the engine module (actionsImpl).
import type {
  ActionResult, CategoryId, CloudServiceId, Department, FacilityTypeId, GameState, GoodId, Id, ManagerRole,
  PlatformCatId, SectorId, SpecSelection,
} from './types';
import * as impl from './actionsImpl';

/** Found a new subsidiary company funded from holding cash (foundingCost + initialCapital). */
export const foundCompany = (s: GameState, p: { name: string; sector: SectorId; countryId: Id; initialCapital: number; color?: string; icon?: string }): ActionResult => impl.foundCompany(s, p);
/** Move cash between holding and a subsidiary (positive = inject into company, negative = withdraw to holding). */
export const transferCash = (s: GameState, companyId: Id, amount: number): ActionResult => impl.transferCash(s, companyId, amount);
/** Build facility. output: GoodId for mine/processing, productId for assemblyPlant, CloudServiceId for dataCenter. */
export const buildFacility = (s: GameState, companyId: Id, p: { type: FacilityTypeId; countryId: Id; output: string }): ActionResult => impl.buildFacility(s, companyId, p);
export const upgradeFacility = (s: GameState, companyId: Id, facilityId: Id): ActionResult => impl.upgradeFacility(s, companyId, facilityId);
export const sellFacility = (s: GameState, companyId: Id, facilityId: Id): ActionResult => impl.sellFacility(s, companyId, facilityId);
export const setFacility = (s: GameState, companyId: Id, facilityId: Id, p: { utilization?: number; maintenance?: number; output?: string }): ActionResult => impl.setFacility(s, companyId, facilityId, p);
/** Data center expansion: buys input hardware (servers / GPUs) internally or from market. */
export const expandDataCenter = (s: GameState, companyId: Id, facilityId: Id, inputUnits: number): ActionResult => impl.expandDataCenter(s, companyId, facilityId, inputUnits);
/** Design a new product (manufacturing sectors). Pays design cost. */
export const designProduct = (s: GameState, companyId: Id, p: { category: CategoryId; name: string; spec: SpecSelection; qualityFocus: number; price: number; marketing: number }): ActionResult => impl.designProduct(s, companyId, p);
export const updateProduct = (s: GameState, productId: Id, p: { price?: number; marketing?: number; active?: boolean; name?: string }): ActionResult => impl.updateProduct(s, productId, p);
export const launchPlatform = (s: GameState, companyId: Id, p: { category: PlatformCatId; name: string }): ActionResult => impl.launchPlatform(s, companyId, p);
export const updatePlatform = (s: GameState, platformId: Id, p: { adLoad?: number; premiumPrice?: number; moderation?: number; marketing?: number; devSpend?: number; name?: string }): ActionResult => impl.updatePlatform(s, platformId, p);
export const expandPlatformInfra = (s: GameState, platformId: Id, users: number): ActionResult => impl.expandPlatformInfra(s, platformId, users);
export const setCloudOffer = (s: GameState, companyId: Id, service: CloudServiceId, p: { price?: number; marketing?: number }): ActionResult => impl.setCloudOffer(s, companyId, service, p);
export const startResearch = (s: GameState, companyId: Id, techId: Id, budgetPerDay: number): ActionResult => impl.startResearch(s, companyId, techId, budgetPerDay);
export const setResearchBudget = (s: GameState, companyId: Id, budgetPerDay: number): ActionResult => impl.setResearchBudget(s, companyId, budgetPerDay);
export const cancelResearch = (s: GameState, companyId: Id): ActionResult => impl.cancelResearch(s, companyId);
export const setEmployeeTarget = (s: GameState, companyId: Id, dept: Department, target: number): ActionResult => impl.setEmployeeTarget(s, companyId, dept, target);
/** Hire a manager from s.candidates into role (replaces & fires existing). */
export const hireManager = (s: GameState, companyId: Id, candidateId: Id): ActionResult => impl.hireManager(s, companyId, candidateId);
export const fireManager = (s: GameState, companyId: Id, role: ManagerRole): ActionResult => impl.fireManager(s, companyId, role);
export const setAutoManaged = (s: GameState, companyId: Id, auto: boolean): ActionResult => impl.setAutoManaged(s, companyId, auto);
export const setSourcing = (s: GameState, companyId: Id, p: { sourcing?: 'internal' | 'market'; transferPriceMult?: number }): ActionResult => impl.setSourcing(s, companyId, p);
/** Manually buy commodity for company stock / sell company stock to market. */
export const tradeGood = (s: GameState, companyId: Id, good: GoodId, qty: number /* +buy / -sell */): ActionResult => impl.tradeGood(s, companyId, good, qty);
export const openMarket = (s: GameState, companyId: Id, countryId: Id): ActionResult => impl.openMarket(s, companyId, countryId);
export const takeLoan = (s: GameState, companyId: Id, amount: number, termMonths: number): ActionResult => impl.takeLoan(s, companyId, amount, termMonths);
export const repayLoan = (s: GameState, companyId: Id, loanId: Id, amount: number): ActionResult => impl.repayLoan(s, companyId, loanId, amount);
export const setDividend = (s: GameState, companyId: Id, payout: number): ActionResult => impl.setDividend(s, companyId, payout);
/** IPO: sell fraction (0.1-0.49) of a player company's shares to the public; cash goes to the company. */
export const ipo = (s: GameState, companyId: Id, fraction: number): ActionResult => impl.ipo(s, companyId, fraction);
/** Holding buys (+) / sells (-) shares of any public company at current price (price impact applied). */
export const tradeShares = (s: GameState, companyId: Id, shares: number): ActionResult => impl.tradeShares(s, companyId, shares);
/** Tender offer: buy all remaining shares at premium -> company moves into player holding. Requires >=50% ownership or enough cash. */
export const acquireCompany = (s: GameState, companyId: Id): ActionResult => impl.acquireCompany(s, companyId);
/** Cost to acquire (for UI preview). */
export const acquisitionCost = (s: GameState, companyId: Id): number => impl.acquisitionCost(s, companyId);
export const sellCompany = (s: GameState, companyId: Id): ActionResult => impl.sellCompany(s, companyId);
export const renameCompany = (s: GameState, companyId: Id, name: string): ActionResult => impl.renameCompany(s, companyId, name);
