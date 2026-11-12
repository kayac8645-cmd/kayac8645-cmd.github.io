// Versioned save system on IndexedDB (idb-keyval) with localStorage fallback.
import { get, set, del, keys } from 'idb-keyval';
import type { GameState } from '../engine/types';
import { SAVE_VERSION, migrate, validateState } from './migrate';

export type SlotId = 'auto' | 'slot1' | 'slot2' | 'slot3';
export const SLOTS: SlotId[] = ['auto', 'slot1', 'slot2', 'slot3'];
export interface SlotMeta { slot: SlotId; holdingName: string; day: number; savedAt: number; netWorth: number; version: number }
interface SaveFile { meta: SlotMeta; data: GameState }

const KEY = (slot: SlotId) => `te-save-${slot}`;
const LAST = 'te-last-slot';

async function rawSet(k: string, v: unknown) {
  try { await set(k, v); } catch { localStorage.setItem(k, JSON.stringify(v)); }
}
async function rawGet<T>(k: string): Promise<T | undefined> {
  try { const v = await get<T>(k); if (v !== undefined) return v; } catch { /* fall back */ }
  const ls = localStorage.getItem(k);
  return ls ? (JSON.parse(ls) as T) : undefined;
}

export async function saveGame(state: GameState, slot: SlotId, netWorth: number): Promise<void> {
  const data = structuredClone(state);
  const meta: SlotMeta = { slot, holdingName: state.holdings[state.playerHoldingId].name, day: state.day, savedAt: Date.now(), netWorth, version: SAVE_VERSION };
  await rawSet(KEY(slot), { meta, data } satisfies SaveFile);
  localStorage.setItem(LAST, slot);
}

/** Loads and migrates a save. Throws a user-readable Error if corrupt. */
export async function loadGame(slot: SlotId): Promise<GameState> {
  const file = await rawGet<SaveFile>(KEY(slot));
  if (!file || !file.data) throw new Error('Bu yuvada kayıt bulunamadı.');
  const migrated = migrate(file.data);
  const problem = validateState(migrated);
  if (problem) throw new Error(`Kayıt bozuk: ${problem}`);
  return migrated;
}

export async function listSlots(): Promise<(SlotMeta | null)[]> {
  return Promise.all(SLOTS.map(async (s) => { try { return (await rawGet<SaveFile>(KEY(s)))?.meta ?? null; } catch { return null; } }));
}
export async function deleteSlot(slot: SlotId): Promise<void> {
  try { await del(KEY(slot)); } catch { /* ignore */ }
  localStorage.removeItem(KEY(slot));
}
export const lastSlot = (): SlotId | null => (localStorage.getItem(LAST) as SlotId | null);
export async function hasAnySave(): Promise<boolean> { try { return (await keys()).some((k) => String(k).startsWith('te-save-')); } catch { return false; } }

/** Export / import as JSON file text. */
export const exportJson = (state: GameState) => JSON.stringify({ version: SAVE_VERSION, data: state });
export function importJson(text: string): GameState {
  let parsed: unknown;
  try { parsed = JSON.parse(text); } catch { throw new Error('Dosya geçerli JSON değil.'); }
  const data = (parsed as { data?: GameState }).data;
  if (!data) throw new Error('Dosyada oyun verisi yok.');
  const m = migrate(data); const p = validateState(m);
  if (p) throw new Error(`Kayıt bozuk: ${p}`);
  return m;
}
