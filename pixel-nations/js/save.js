// Save/Load Engine: localStorage slotları, otomatik kayıt, seed ile dünya yeniden üretimi
import { RNG, N } from './util.js';
import { generateWorld } from './worldgen.js';
import { rebuildOwner } from './state.js';
import { rebuildSupply } from './military.js';
import { computeNeighbors } from './diplomacy.js';
import { dateStr } from './util.js';

const SKIP = new Set(['W', 'ownerGrid', 'supply', 'occ', 'rng', '_cities']);
export function serialize(S) {
  const json = JSON.stringify(S, (k, v) => (SKIP.has(k) || (typeof k === 'string' && k[0] === '_') ? undefined : v));
  return JSON.stringify({ rng: S.rng.s, data: json });
}
export function deserialize(str) {
  const { rng, data } = JSON.parse(str); const S = JSON.parse(data);
  Object.defineProperty(S, 'W', { value: generateWorld(S.seed), enumerable: false, writable: true });
  S.rng = new RNG(1); S.rng.s = rng; S.ownerGrid = new Int8Array(N); S.supply = {}; S.occ = new Map(); S.visDirty = true; S.notify = []; S.fx = []; S.fxSeq = 0; S.battles = [];
  S.nations.forEach((n) => { n._cities = []; });
  rebuildOwner(S); rebuildSupply(S); computeNeighbors(S);
  return S;
}
const KEY = (slot) => 'pn_save_' + slot, META = 'pn_meta';
export function listSaves() { try { return JSON.parse(localStorage.getItem(META) || '{}'); } catch (e) { return {}; } }
export function saveGame(S, slot = 'auto') {
  try {
    localStorage.setItem(KEY(slot), serialize(S));
    const m = listSaves(); m[slot] = { nation: S.nations[S.player].name, date: dateStr(S.t), seed: S.seed, real: Date.now(), col: S.nations[S.player].col }; localStorage.setItem(META, JSON.stringify(m));
    return { ok: true, msg: 'Oyun kaydedildi' };
  } catch (e) { return { ok: false, msg: 'Kayıt başarısız (depolama dolu olabilir)' }; }
}
export function loadGame(slot = 'auto') {
  try { const s = localStorage.getItem(KEY(slot)); if (!s) return null; return deserialize(s); } catch (e) { console.error(e); return null; }
}
export function deleteSave(slot) { try { localStorage.removeItem(KEY(slot)); const m = listSaves(); delete m[slot]; localStorage.setItem(META, JSON.stringify(m)); } catch (e) {} }
export function lastSlot() { const m = listSaves(); let best = null; for (const k in m) if (!best || m[k].real > m[best].real) best = k; return best; }
export function loadSettings(def) { try { return { ...def, ...JSON.parse(localStorage.getItem('pn_settings') || '{}') }; } catch (e) { return def; } }
export function saveSettings(s) { try { localStorage.setItem('pn_settings', JSON.stringify(s)); } catch (e) {} }
