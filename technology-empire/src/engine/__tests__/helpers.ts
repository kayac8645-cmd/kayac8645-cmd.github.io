// Shared test helpers (not a test file itself).
import { createNewGame } from '../newGame';
import type { Company, GameState, Ledger, NewGameConfig } from '../types';

export const BASE_CFG: NewGameConfig = {
  holdingName: 'Test Holding',
  companyName: 'Test Donanım',
  color: '#4f8cff',
  icon: '🖥️',
  countryId: 'TR',
  sector: 'hardware',
  difficulty: 'normal',
  seed: 12345,
};

export function makeGame(over: Partial<NewGameConfig> = {}): GameState {
  return createNewGame({ ...BASE_CFG, ...over });
}

export const playerCompany = (s: GameState): Company => {
  const c = Object.values(s.companies).find((x) => x.holdingId === s.playerHoldingId);
  if (!c) throw new Error('player company missing');
  return c;
};

/** Ledger expense fields that are real cash outflows (depreciation is non-cash). */
export const CASH_EXPENSES = [
  'cogsMaterials', 'salaries', 'managerSalaries', 'energy', 'maintenance', 'logistics',
  'marketing', 'rnd', 'infra', 'other', 'interest', 'tax',
] as const satisfies readonly (keyof Ledger)[];

/** Net cash flow implied by a ledger (or a ledger delta). */
export function ledgerCashFlow(l: Ledger): number {
  let v = l.revenue;
  for (const k of CASH_EXPENSES) v -= l[k];
  return v - l.capex - l.dividends;
}

/** Walk any JSON-like value; return paths of non-finite numbers (NaN / ±Infinity). */
export function findNonFinite(v: unknown, path = '$', out: string[] = [], limit = 20): string[] {
  if (out.length >= limit) return out;
  if (typeof v === 'number') { if (!Number.isFinite(v)) out.push(`${path}=${v}`); return out; }
  if (v === null || typeof v !== 'object') return out;
  if (Array.isArray(v)) { v.forEach((x, i) => findNonFinite(x, `${path}[${i}]`, out, limit)); return out; }
  for (const [k, x] of Object.entries(v)) findNonFinite(x, `${path}.${k}`, out, limit);
  return out;
}
