import { describe, expect, it } from 'vitest';
import { step } from '../sim';
import { productAttractiveness } from '../sim/markets';
import { CATEGORY_IDS, GOOD_IDS } from '../data/defs';
import type { GameState, Product } from '../types';
import { makeGame } from './helpers';

describe('market sanity over 2 years', () => {
  it('commodity prices bounded, category sales ≤ demand, stocks never negative', () => {
    const s = makeGame({ seed: 777 });
    const problems: string[] = [];
    const note = (m: string) => { if (problems.length < 20) problems.push(m); };
    for (let i = 0; i < 720; i++) {
      step(s);
      for (const cat of CATEGORY_IDS) {
        const m = s.categories[cat];
        if (m.soldToday > m.demandToday * (1 + 1e-9) + 1e-6) note(`day ${s.day} ${cat}: sold ${m.soldToday} > demand ${m.demandToday}`);
        if (m.soldToday < 0 || m.demandToday < 0) note(`day ${s.day} ${cat}: negative sold/demand`);
      }
      for (const c of Object.values(s.companies)) {
        for (const [g, q] of Object.entries(c.goodsStock)) if ((q ?? 0) < -1e-6) note(`day ${s.day} ${c.name} goodsStock.${g}=${q}`);
        for (const [p, q] of Object.entries(c.productStock)) if (q < -1e-6) note(`day ${s.day} ${c.name} productStock.${p}=${q}`);
      }
      for (const f of Object.values(s.companies).flatMap((c) => c.facilities)) {
        if (f.reserve !== undefined && f.reserve < -1e-6) note(`day ${s.day} ${f.name} reserve=${f.reserve}`);
        if (f.condition < 0 || f.condition > 100) note(`day ${s.day} ${f.name} condition=${f.condition}`);
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
    const out: string[] = [];
    for (const g of GOOD_IDS) {
      const m = s.commodities[g];
      const ratio = m.price / m.basePrice;
      if (!(ratio >= 0.2 && ratio <= 5)) out.push(`${g}: price ${m.price.toFixed(2)} = ${ratio.toFixed(2)}× base`);
      for (const p of m.history) if (!(p > 0)) { out.push(`${g}: non-positive price in history`); break; }
      expect(m.history.length).toBeLessThanOrEqual(180);
    }
    expect(out, out.join('\n')).toEqual([]);
  });
});

function someProduct(s: GameState): Product {
  const p = Object.values(s.products).find((x) => x.active);
  if (!p) throw new Error('no active product in new game (AI should start with products)');
  return p;
}

describe('supply / demand', () => {
  it('raising a product price lowers its attractiveness and share', () => {
    const s = makeGame({ seed: 8 });
    const p = someProduct(s);
    const a0 = productAttractiveness(s, p);
    const hi = { ...p, price: p.price * 1.3 };
    const lo = { ...p, price: p.price * 0.8 };
    const aHi = productAttractiveness(s, hi);
    const aLo = productAttractiveness(s, lo);
    expect(a0).toBeGreaterThan(0);
    expect(aHi).toBeLessThan(a0);
    expect(aLo).toBeGreaterThan(a0);
    // share = A / (ΣA + A0) among the category's active products
    const rivals = Object.values(s.products).filter((x) => x.category === p.category && x.active && x.id !== p.id);
    const sumR = rivals.reduce((acc, x) => acc + productAttractiveness(s, x), 0);
    const share = (a: number) => a / (a + sumR + 0.35);
    expect(share(aHi)).toBeLessThan(share(a0));
  });

  it('more marketing and better performance raise attractiveness', () => {
    const s = makeGame({ seed: 8 });
    const p = someProduct(s);
    const a0 = productAttractiveness(s, p);
    expect(productAttractiveness(s, { ...p, marketing: p.marketing + 50_000 })).toBeGreaterThan(a0);
    expect(productAttractiveness(s, { ...p, performance: p.performance * 1.2 })).toBeGreaterThan(a0);
  });

  it('in simulation, a much higher price sells fewer units than baseline', () => {
    const base = makeGame({ seed: 11 });
    for (let i = 0; i < 30; i++) step(base);
    const pid = someProduct(base).id;
    const a: GameState = JSON.parse(JSON.stringify(base));
    const b: GameState = JSON.parse(JSON.stringify(base));
    b.products[pid].price *= 2;
    const sold0a = a.products[pid].unitsSoldTotal, sold0b = b.products[pid].unitsSoldTotal;
    // freeze AI repricing influence by running a short window
    for (let i = 0; i < 5; i++) { step(a); step(b); }
    const soldA = a.products[pid].unitsSoldTotal - sold0a;
    const soldB = b.products[pid].unitsSoldTotal - sold0b;
    expect(soldB).toBeLessThanOrEqual(soldA);
    if (soldA > 0) expect(soldB).toBeLessThan(soldA);
  });
});
