// Shared commodity trading helpers (used by production, services, actions, AI).
// All cash flows are recorded in the company ledger here.
import type { Company, GameState, GoodId } from '../types';
import { countryCosts } from '../util';

/** Max units a single buyer can still buy from the world market today (supply-shock aware). */
export function marketAvailable(s: GameState, good: GoodId): number {
  const m = s.commodities[good];
  return Math.max(0, m.npcSupply * m.supplyShock * 0.25 + m.soldToday - m.boughtToday);
}

/** Buy from world market. Returns units actually bought (limited by availability and cash>-credit). */
export function buyFromMarket(s: GameState, c: Company, good: GoodId, qty: number): number {
  if (qty <= 0) return 0;
  const m = s.commodities[good];
  const fee = countryCosts(s, s.countries[c.countryId]).logisticsFee;
  const unit = m.price * (1 + fee);
  const q = Math.min(qty, marketAvailable(s, good));
  if (q <= 0) return 0;
  m.boughtToday += q;
  c.cash -= q * m.price;
  c.ledger.cogsMaterials += q * m.price;
  c.ledger.logistics += q * (unit - m.price);
  c.cash -= q * (unit - m.price);
  c.goodsStock[good] = (c.goodsStock[good] ?? 0) + q;
  return q;
}

/** Sell to world market at market price minus logistics fee. Returns units sold. */
export function sellToMarket(s: GameState, c: Company, good: GoodId, qty: number): number {
  const have = c.goodsStock[good] ?? 0;
  const q = Math.min(qty, have);
  if (q <= 0) return 0;
  const m = s.commodities[good];
  const fee = countryCosts(s, s.countries[c.countryId]).logisticsFee;
  m.soldToday += q;
  c.goodsStock[good] = have - q;
  c.cash += q * m.price;
  c.ledger.revenue += q * m.price;
  c.ledger.logistics += q * m.price * fee;
  c.cash -= q * m.price * fee;
  c.ledger.unitsSold += q;
  return q;
}

/** Buy from sister companies in the same holding at transfer price. Returns units obtained. */
export function buyInternal(s: GameState, c: Company, good: GoodId, qty: number): number {
  if (qty <= 0) return 0;
  let got = 0;
  for (const o of Object.values(s.companies)) {
    if (got >= qty) break;
    if (o.id === c.id || o.holdingId !== c.holdingId || o.bankrupt) continue;
    const have = o.goodsStock[good] ?? 0;
    if (have <= 0) continue;
    const q = Math.min(have, qty - got);
    const price = s.commodities[good].price * o.transferPriceMult;
    o.goodsStock[good] = have - q;
    c.goodsStock[good] = (c.goodsStock[good] ?? 0) + q;
    o.cash += q * price; o.ledger.revenue += q * price; o.ledger.internalRevenue += q * price; o.ledger.unitsSold += q;
    c.cash -= q * price; c.ledger.cogsMaterials += q * price;
    got += q;
  }
  return got;
}

/** Acquire goods into company stock: internal first (if sourcing==='internal'), then market. */
export function acquireGood(s: GameState, c: Company, good: GoodId, qty: number): number {
  const have = c.goodsStock[good] ?? 0;
  let need = qty - have;
  if (need <= 0) return qty;
  if (c.sourcing === 'internal') need -= buyInternal(s, c, good, need);
  if (need > 0) need -= buyFromMarket(s, c, good, need);
  return Math.min(qty, c.goodsStock[good] ?? 0);
}

/** Holding-sister demand flag: does any sister company consume this good? */
export function sisterConsumes(s: GameState, c: Company, good: GoodId, consumes: (o: Company, g: GoodId) => boolean): boolean {
  return Object.values(s.companies).some((o) => o.id !== c.id && o.holdingId === c.holdingId && !o.bankrupt && consumes(o, good));
}
