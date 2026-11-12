import { describe, expect, it } from 'vitest';
import { advance } from '../sim';
import { makeGame } from './helpers';

describe('determinism', () => {
  it('same seed + same days → identical state JSON', () => {
    const a = makeGame({ seed: 777 });
    const b = makeGame({ seed: 777 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    advance(a, 120);
    advance(b, 120);
    expect(a.day).toBe(120);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('different seeds diverge', () => {
    const a = makeGame({ seed: 1 });
    const b = makeGame({ seed: 2 });
    advance(a, 60);
    advance(b, 60);
    expect(JSON.stringify(a.commodities)).not.toBe(JSON.stringify(b.commodities));
  });

  it('a save/load (JSON roundtrip) mid-game resumes the exact same sequence', () => {
    const a = makeGame({ seed: 99 });
    advance(a, 45);
    const b = JSON.parse(JSON.stringify(a));
    advance(a, 75);
    advance(b, 75);
    expect(JSON.stringify(b)).toBe(JSON.stringify(a));
  });
});
