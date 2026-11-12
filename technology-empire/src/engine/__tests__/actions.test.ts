import { describe, expect, it } from 'vitest';
import * as A from '../actions';
import { previewProduct, loanOffer } from '../preview';
import { CATEGORIES, SECTORS } from '../data/defs';
import { makeGame, playerCompany } from './helpers';
import type { SpecSelection } from '../types';

describe('action validation', () => {
  it('designProduct with a locked tech fails and charges nothing', () => {
    const s = makeGame({ seed: 3 });
    const c = playerCompany(s);
    const def = CATEGORIES.gpu;
    const spec: SpecSelection = {};
    for (const f of def.fields) spec[f.key] = 0;
    spec.node = 4; // 3nm requires node3 — nobody has it at start
    expect(s.globalTechs).not.toContain('node3');
    expect(previewProduct(s, c.id, { category: 'gpu', spec, qualityFocus: 50 }).locked.length).toBeGreaterThan(0);
    const cash = c.cash, n = Object.keys(s.products).length;
    const r = A.designProduct(s, c.id, { category: 'gpu', name: 'Kilitli', spec, qualityFocus: 50, price: 900, marketing: 0 });
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
    expect(c.cash).toBe(cash);
    expect(Object.keys(s.products).length).toBe(n);
  });

  it('designProduct with unlocked spec succeeds', () => {
    const s = makeGame({ seed: 3 });
    const c = playerCompany(s);
    const spec: SpecSelection = {};
    for (const f of CATEGORIES.gpu.fields) spec[f.key] = 0;
    c.cash = Math.max(c.cash, 50_000_000);
    const r = A.designProduct(s, c.id, { category: 'gpu', name: 'Açık', spec, qualityFocus: 50, price: 500, marketing: 0 });
    expect(r.ok, r.error).toBe(true);
    expect(r.id && s.products[r.id]).toBeTruthy();
  });

  it('foundCompany without enough holding cash fails', () => {
    const s = makeGame({ seed: 3 });
    const h = s.holdings[s.playerHoldingId];
    h.cash = SECTORS.hardware.foundingCost - 1;
    const n = Object.keys(s.companies).length;
    const r = A.foundCompany(s, { name: 'Fakir AŞ', sector: 'hardware', countryId: 'TR', initialCapital: 1_000_000 });
    expect(r.ok).toBe(false);
    expect(Object.keys(s.companies).length).toBe(n);
    expect(h.cash).toBe(SECTORS.hardware.foundingCost - 1);
  });

  it('foundCompany with cash succeeds and debits holding', () => {
    const s = makeGame({ seed: 3 });
    const h = s.holdings[s.playerHoldingId];
    h.cash = 50_000_000;
    const r = A.foundCompany(s, { name: 'Zengin AŞ', sector: 'cloud', countryId: 'TR', initialCapital: 2_000_000 });
    expect(r.ok, r.error).toBe(true);
    expect(h.cash).toBeLessThanOrEqual(50_000_000 - 2_000_000 - SECTORS.cloud.foundingCost + 1e-6);
    expect(h.cash).toBeGreaterThanOrEqual(0);
  });

  it('takeLoan over the offer limit fails; within limit succeeds', () => {
    const s = makeGame({ seed: 3 });
    const c = playerCompany(s);
    const offer = loanOffer(s, c.id);
    const cash = c.cash, loans = c.loans.length;
    const bad = A.takeLoan(s, c.id, offer.maxAmount + 10_000_000, 24);
    expect(bad.ok).toBe(false);
    expect(c.cash).toBe(cash);
    expect(c.loans.length).toBe(loans);
    if (offer.maxAmount >= 100_000) {
      const good = A.takeLoan(s, c.id, 100_000, 24);
      expect(good.ok, good.error).toBe(true);
      expect(c.cash).toBeCloseTo(cash + 100_000, 2);
    }
  });

  it('rejects nonsense inputs', () => {
    const s = makeGame({ seed: 3 });
    const c = playerCompany(s);
    expect(A.takeLoan(s, c.id, -5, 12).ok).toBe(false);
    expect(A.transferCash(s, c.id, Number.NaN).ok).toBe(false);
    expect(A.transferCash(s, 'no-such-company', 1000).ok).toBe(false);
    // cannot overdraw the holding
    const h = s.holdings[s.playerHoldingId];
    expect(A.transferCash(s, c.id, h.cash + 1).ok).toBe(false);
    // cannot act on rival companies
    const rival = Object.values(s.companies).find((x) => x.holdingId !== s.playerHoldingId);
    if (rival) expect(A.transferCash(s, rival.id, 1000).ok).toBe(false);
  });
});
