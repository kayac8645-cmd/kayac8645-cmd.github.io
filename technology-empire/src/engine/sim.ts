// Simulation orchestrator. One call to step() advances exactly one game day.
// Deterministic: all randomness comes from s.rng.
import type { GameState } from './types';
import { runProductionDay } from './sim/production';
import { runMarketsDay } from './sim/markets';
import { runServicesDay } from './sim/services';
import { runFinanceDay, runMonthEnd } from './sim/finance';
import { runHrDay, runHrMonth, runResearchDay } from './sim/people';
import { runAiDay, runAiMonth } from './ai';
import { runMacroDay, runEventsDay } from './events';

function dayTotals(s: GameState) {
  const m = new Map<string, [number, number]>();
  for (const c of Object.values(s.companies)) {
    const l = c.ledger;
    const cost = l.cogsMaterials + l.salaries + l.managerSalaries + l.energy + l.maintenance + l.logistics + l.marketing + l.rnd + l.infra + l.other + l.interest + l.tax;
    m.set(c.id, [l.revenue, l.revenue - cost]);
  }
  return m;
}

export function step(s: GameState): void {
  const before = dayTotals(s);
  s.day += 1;
  runMacroDay(s);
  runEventsDay(s);
  runHrDay(s);
  runResearchDay(s);
  runProductionDay(s);
  runServicesDay(s);
  runMarketsDay(s);
  runAiDay(s);
  // rolling 30-day revenue / profit (exponential, scaled to 30 days)
  const after = dayTotals(s);
  for (const c of Object.values(s.companies)) {
    const b = before.get(c.id) ?? [0, 0], a = after.get(c.id) ?? [0, 0];
    // ledger resets at month end happen after this, so deltas are valid
    const dr = a[0] - b[0], dp = a[1] - b[1];
    c.revenue30 = c.revenue30 * (29 / 30) + dr;
    c.profit30 = c.profit30 * (29 / 30) + dp;
  }
  runFinanceDay(s);
  if (s.day % 30 === 0) {
    runMonthEnd(s);
    runHrMonth(s);
    runAiMonth(s);
  }
}

/** Advance n days (used by tests and fast-forward). */
export function advance(s: GameState, days: number): void {
  for (let i = 0; i < days; i++) step(s);
}
