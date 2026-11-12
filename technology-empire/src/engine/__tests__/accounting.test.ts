// Accounting consistency: every cash change of a company must be mirrored in
// its ledger (ENGINE_NOTES "Accounting"). We step day by day and reconcile:
//   Δcash(company) = ledgerCashFlow(Δledger) + Δdebt + equity/transfer flows
// Equity & transfer flows (holding ↔ company, dividends to shareholders) are
// reconciled at holding level, skipping days where ownership structure changes
// (IPO, share trades, acquisitions, founding, bankruptcy).
import { describe, expect, it } from 'vitest';
import { step } from '../sim';
import { debtOf } from '../selectors';
import { emptyLedger, type Company, type GameState, type Ledger } from '../types';
import { findNonFinite, ledgerCashFlow, makeGame } from './helpers';

const LEDGER_KEYS = Object.keys(emptyLedger()) as (keyof Ledger)[];

interface Snap { cash: number; debt: number; ledger: Ledger; bankrupt: boolean; shares: string; holders: string[] }

const snap = (c: Company): Snap => ({
  cash: c.cash, debt: debtOf(c), ledger: { ...c.ledger }, bankrupt: c.bankrupt,
  shares: JSON.stringify([c.sharesOutstanding, c.shareholders, c.holdingId]),
  holders: [c.holdingId, ...Object.keys(c.shareholders)],
});

/** Ledger accumulated during this step (handles the month-end reset into reports). */
function ledgerDelta(c: Company, before: Snap, day: number): Ledger {
  const d = emptyLedger();
  // month end (day % 30 === 0) converts the ledger into a report and resets it
  const rolled = day % 30 === 0;
  const monthTotal: Ledger = emptyLedger();
  if (rolled && c.reports.length > 0) {
    const r = c.reports[c.reports.length - 1];
    for (const k of LEDGER_KEYS) monthTotal[k] = r[k] + c.ledger[k];
  } else for (const k of LEDGER_KEYS) monthTotal[k] = c.ledger[k];
  for (const k of LEDGER_KEYS) d[k] = monthTotal[k] - before.ledger[k];
  return d;
}

function simulate(s: GameState, days: number) {
  const issues: string[] = [];
  let checkedCompanyDays = 0, checkedHoldingDays = 0;
  for (let i = 0; i < days; i++) {
    const before = new Map<string, Snap>();
    for (const c of Object.values(s.companies)) before.set(c.id, snap(c));
    const hCash = new Map(Object.values(s.holdings).map((h) => [h.id, h.cash]));
    step(s);

    // per company residual (unexplained by ledger + debt change)
    const residual = new Map<string, number>();
    const holdingDirty = new Set<string>();
    for (const c of Object.values(s.companies)) {
      const b = before.get(c.id);
      if (!b) { holdingDirty.add(c.holdingId); continue; } // founded today
      if (b.bankrupt || c.bankrupt || b.shares !== snap(c).shares) {
        holdingDirty.add(c.holdingId);
        for (const h of [...Object.keys(c.shareholders), ...b.holders]) holdingDirty.add(h);
        continue;
      }
      const dl = ledgerDelta(c, b, s.day);
      const r = (c.cash - b.cash) - ledgerCashFlow(dl) - (debtOf(c) - b.debt);
      residual.set(c.id, r);
      checkedCompanyDays++;
    }
    for (const id of before.keys()) if (!s.companies[id]) holdingDirty.add('*');

    // holding level: Σ residual of its companies + Δholding cash − dividends received ≈ 0
    for (const h of Object.values(s.holdings)) {
      if (holdingDirty.has(h.id) || holdingDirty.has('*')) continue;
      let r = h.cash - (hCash.get(h.id) ?? h.cash);
      let scale = Math.abs(h.cash) + 1;
      for (const c of Object.values(s.companies)) {
        const b = before.get(c.id);
        if (!b) continue;
        const own = (c.shareholders[h.id] ?? 0) / c.sharesOutstanding;
        if (own > 0) r -= own * ledgerDelta(c, b, s.day).dividends;
        if (c.holdingId === h.id) { r += residual.get(c.id) ?? 0; scale += Math.abs(c.cash); }
      }
      checkedHoldingDays++;
      const tol = Math.max(1, scale * 1e-9);
      if (Math.abs(r) > tol && issues.length < 15) {
        const detail = Object.values(s.companies).filter((c) => c.holdingId === h.id && Math.abs(residual.get(c.id) ?? 0) > tol)
          .map((c) => `${c.name}(${c.sector}) resid=${(residual.get(c.id) ?? 0).toFixed(2)}`).join(', ');
        issues.push(`day ${s.day} holding ${h.name}: unexplained cash ${r.toFixed(2)} (Δholding=${(h.cash - (hCash.get(h.id) ?? 0)).toFixed(2)}) ${detail}`);
      }
    }
  }
  return { issues, checkedCompanyDays, checkedHoldingDays };
}

describe('accounting consistency', () => {
  it('every cash change is mirrored in ledgers (2 years, all companies)', () => {
    const s = makeGame({ seed: 2024 });
    const { issues, checkedCompanyDays, checkedHoldingDays } = simulate(s, 720);
    expect(checkedCompanyDays).toBeGreaterThan(720);
    expect(checkedHoldingDays).toBeGreaterThan(360);
    expect(issues, issues.join('\n')).toEqual([]);
  });

  it('monthly reports: netIncome = revenue − all expenses incl. depreciation', () => {
    const s = makeGame({ seed: 31 });
    for (let i = 0; i < 360; i++) step(s);
    const bad: string[] = [];
    for (const c of Object.values(s.companies)) {
      expect(c.reports.length).toBeGreaterThan(0);
      for (const r of c.reports) {
        const exp = r.cogsMaterials + r.salaries + r.managerSalaries + r.energy + r.maintenance + r.logistics + r.marketing
          + r.rnd + r.infra + r.other + r.interest + r.tax + r.depreciation;
        const ni = r.revenue - exp;
        if (Math.abs(ni - r.netIncome) > Math.max(1, Math.abs(r.revenue) * 1e-9)) bad.push(`${c.name} day ${r.day}: netIncome ${r.netIncome} vs ${ni}`);
      }
      for (const r of c.reports) if (r.day % 30 !== 0) bad.push(`${c.name}: report not on month end (day ${r.day})`);
    }
    expect(bad.slice(0, 10), bad.slice(0, 10).join('\n')).toEqual([]);
  });

  it('no NaN / Infinity anywhere in state after 2 years', () => {
    const s = makeGame({ seed: 5 });
    for (let i = 0; i < 720; i++) step(s);
    expect(findNonFinite(s)).toEqual([]);
  });
});
