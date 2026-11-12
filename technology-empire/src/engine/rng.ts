// Deterministic seeded RNG (mulberry32). State is stored in GameState.rng so
// that simulation runs are reproducible and saves resume the same sequence.
import type { GameState } from './types';

export function nextRandom(state: { rng: number }): number {
  let t = (state.rng = (state.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const rand = (s: GameState | { rng: number }) => nextRandom(s);
export const randRange = (s: { rng: number }, a: number, b: number) => a + (b - a) * nextRandom(s);
export const randInt = (s: { rng: number }, a: number, b: number) => Math.floor(randRange(s, a, b + 1));
export const chance = (s: { rng: number }, p: number) => nextRandom(s) < p;
export function pick<T>(s: { rng: number }, arr: readonly T[]): T {
  return arr[Math.floor(nextRandom(s) * arr.length)];
}
/** Approximately normal(0,1) via sum of uniforms. */
export function gauss(s: { rng: number }): number {
  let x = 0;
  for (let i = 0; i < 6; i++) x += nextRandom(s);
  return (x - 3) / Math.SQRT1_2;
}
export function genId(state: GameState, prefix: string): string {
  return `${prefix}${(state.nextId++).toString(36)}`;
}
