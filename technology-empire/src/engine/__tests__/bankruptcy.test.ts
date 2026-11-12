import { describe, expect, it } from 'vitest';
import { advance } from '../sim';
import { debtOf } from '../selectors';
import { makeGame, playerCompany } from './helpers';

describe('bankruptcy', () => {
  it('a company with huge negative cash goes bankrupt after 3 month ends', () => {
    const s = makeGame({ seed: 17 });
    const c = playerCompany(s);
    c.cash = -1e12;
    advance(s, 30);
    expect(c.bankrupt).toBe(false);
    expect(c.distressMonths).toBe(1);
    advance(s, 30);
    expect(c.bankrupt).toBe(false);
    expect(c.distressMonths).toBe(2);
    advance(s, 30);
    expect(c.bankrupt).toBe(true);
    expect(debtOf(c)).toBe(0);
    for (const pid of c.products) expect(s.products[pid]?.active ?? false).toBe(false);
    expect(s.news.some((n) => n.important && n.companyId === c.id)).toBe(true);
    // engine keeps running after a bankruptcy
    expect(() => advance(s, 30)).not.toThrow();
  });

  it('an AI company in deep distress also goes bankrupt', () => {
    const s = makeGame({ seed: 17 });
    const c = Object.values(s.companies).find((x) => x.holdingId !== s.playerHoldingId);
    if (!c) throw new Error('no AI company');
    c.cash = -1e12;
    advance(s, 90);
    expect(c.bankrupt).toBe(true);
  });

  it('distress counter resets when cash recovers', () => {
    const s = makeGame({ seed: 17 });
    const c = playerCompany(s);
    const cash = c.cash;
    c.cash = -1e12;
    advance(s, 30);
    expect(c.distressMonths).toBe(1);
    c.cash = cash + 50_000_000;
    advance(s, 30);
    expect(c.distressMonths).toBe(0);
  });
});
