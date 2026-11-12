import type { GameState } from '../engine/types';
export const SAVE_VERSION = 1;

/** Upgrade older save formats step by step. */
export function migrate(raw: GameState): GameState {
  const s = raw;
  if (typeof s.version !== 'number') throw new Error('Kayıt sürümü bilinmiyor.');
  if (s.version > SAVE_VERSION) throw new Error(`Kayıt daha yeni bir sürümden (${s.version}).`);
  // future: if (s.version < 2) { ...; s.version = 2; }
  return s;
}

/** Returns null if valid, else a description of the first problem. */
export function validateState(s: GameState): string | null {
  if (!s || typeof s !== 'object') return 'veri nesne değil';
  if (typeof s.day !== 'number' || !Number.isFinite(s.day)) return 'gün değeri geçersiz';
  if (!s.holdings || !s.holdings[s.playerHoldingId]) return 'oyuncu holdingi yok';
  if (!s.companies || !s.countries || !s.commodities || !s.categories || !s.macro) return 'eksik ana bölüm';
  for (const c of Object.values(s.companies)) {
    if (!Number.isFinite(c.cash)) return `şirket nakdi geçersiz (${c.name})`;
    if (!s.holdings[c.holdingId]) return `şirket sahibi yok (${c.name})`;
  }
  for (const h of Object.values(s.holdings)) if (!Number.isFinite(h.cash)) return `holding nakdi geçersiz (${h.name})`;
  return null;
}
