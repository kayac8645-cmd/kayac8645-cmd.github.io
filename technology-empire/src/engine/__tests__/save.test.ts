import { describe, expect, it } from 'vitest';
import { advance } from '../sim';
import type { GameState } from '../types';
import { SAVE_VERSION, migrate, validateState } from '../../save/migrate';
import { exportJson, importJson } from '../../save/storage';
import { makeGame } from './helpers';

const clone = (s: GameState): GameState => JSON.parse(JSON.stringify(s));

describe('save system (pure functions)', () => {
  const base = makeGame({ seed: 4242 });
  advance(base, 40);

  it('fresh and advanced states are valid', () => {
    expect(validateState(makeGame())).toBeNull();
    expect(validateState(base)).toBeNull();
    expect(base.version).toBe(SAVE_VERSION);
    expect(() => migrate(clone(base))).not.toThrow();
  });

  it('rejects corrupt fields', () => {
    const noHolding = clone(base); delete (noHolding.holdings as Record<string, unknown>)[noHolding.playerHoldingId];
    expect(validateState(noHolding)).not.toBeNull();

    const badDay = clone(base); (badDay as unknown as { day: unknown }).day = 'yarın';
    expect(validateState(badDay)).not.toBeNull();

    const nanCash = clone(base); Object.values(nanCash.companies)[0].cash = NaN;
    expect(validateState(nanCash)).not.toBeNull();

    // NaN becomes null after JSON — must also be rejected
    const nullCash = clone(base); (Object.values(nullCash.companies)[0] as unknown as { cash: unknown }).cash = null;
    expect(validateState(nullCash)).not.toBeNull();

    const orphan = clone(base); Object.values(orphan.companies)[0].holdingId = 'nope';
    expect(validateState(orphan)).not.toBeNull();

    const noMarkets = clone(base); delete (noMarkets as unknown as Record<string, unknown>).commodities;
    expect(validateState(noMarkets)).not.toBeNull();

    const badHoldingCash = clone(base); badHoldingCash.holdings[badHoldingCash.playerHoldingId].cash = Infinity;
    expect(validateState(badHoldingCash)).not.toBeNull();

    expect(validateState(null as unknown as GameState)).not.toBeNull();
  });

  it('migrate rejects future and unknown versions', () => {
    const future = clone(base); future.version = SAVE_VERSION + 1;
    expect(() => migrate(future)).toThrow();
    const unknown = clone(base); delete (unknown as unknown as Record<string, unknown>).version;
    expect(() => migrate(unknown)).toThrow();
  });

  it('JSON export/import roundtrip preserves state and continues identically', () => {
    const text = exportJson(base);
    const back = importJson(text);
    expect(JSON.stringify(back)).toBe(JSON.stringify(base));
    const a = clone(base);
    advance(a, 30); advance(back, 30);
    expect(JSON.stringify(back)).toBe(JSON.stringify(a));
  });

  it('import rejects garbage, missing data, corrupt and future saves', () => {
    expect(() => importJson('not json {')).toThrow();
    expect(() => importJson('{}')).toThrow();
    const corrupt = clone(base); corrupt.day = Number.NaN;
    expect(() => importJson(exportJson(corrupt))).toThrow();
    const future = clone(base); future.version = SAVE_VERSION + 5;
    expect(() => importJson(exportJson(future))).toThrow();
  });
});
