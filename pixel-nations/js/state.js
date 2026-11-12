// Merkezi durum: zustand benzeri store (UI durumu) + simülasyon durumu yardımcıları
import { N, dateStr } from './util.js';
import { NN } from './data.js';

export function createStore(initial) {
  let state = initial; const subs = new Set();
  return {
    get: () => state,
    set: (p) => { const patch = typeof p === 'function' ? p(state) : p; state = { ...state, ...patch }; subs.forEach((f) => f(state)); },
    subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
  };
}

// UI durum deposu (seçim, pencere, hız...). Simülasyon verisi ayrı ve değiştirilebilir (mutable) tutulur.
export const ui = createStore({
  screen: 'title', selection: null, win: null, winTab: null, speed: 1, paused: true, focusNation: null,
  cmdMode: null, multi: false, settings: { sound: 0.5, names: true, units: true, water: true, autosave: true, uiScale: 1, tradeVis: true },
});

export const pkey = (a, b) => (a < b ? a * 32 + b : b * 32 + a);
const EMPTY = Object.freeze({ war: 0, truce: 0, ally: 0, nap: 0, trade: 0, access: 0, since: 0 });
export const pactR = (S, a, b) => S.dip.pacts[pkey(a, b)] || EMPTY;
export function pact(S, a, b) { const k = pkey(a, b); return S.dip.pacts[k] || (S.dip.pacts[k] = { war: 0, truce: 0, ally: 0, nap: 0, trade: 0, access: 0, since: 0 }); }
export const atWar = (S, a, b) => a !== b && pactR(S, a, b).war === 1;
export const allied = (S, a, b) => a !== b && pactR(S, a, b).ally === 1;
export const sanctioned = (S, a, b) => !!(S.dip.sanc[a][b] || S.dip.sanc[b][a]);
export const hasTrade = (S, a, b) => a !== b && pactR(S, a, b).trade === 1 && !pactR(S, a, b).war && !sanctioned(S, a, b);
export const canPass = (S, a, b) => a === b || b < 0 || atWar(S, a, b) || allied(S, a, b) || pactR(S, a, b).access === 1;

export const nationAt = (S, tile) => S.ownerGrid[tile];
export function rebuildOwner(S) {
  const p = S.W.prov, g = S.ownerGrid;
  for (let i = 0; i < N; i++) { const c = p[i]; g[i] = c < 0 ? -1 : S.cities[c].owner; }
  S.ownerVer++;
}
export const alive = (S) => S.nations.filter((n) => n.alive);
export const cityAt = (S, tile) => { const c = S.W.prov[tile]; return c >= 0 && S.cities[c].t === tile ? S.cities[c] : null; };

// Olay günlüğü + bildirimler. sev: 0 bilgi, 1 iyi, 2 uyarı, 3 kritik
export function logEvent(S, nid, text, sev = 0, opts = {}) {
  const e = { id: ++S.eid, t: S.t, nid, text, sev, tag: opts.tag || '', inv: opts.inv || [] };
  S.log.push(e); if (S.log.length > 600) S.log.shift();
  const mine = nid === S.player || e.inv.includes(S.player);
  if (mine || opts.global) S.notify.push({ ...e, mine });
  return e;
}
export function addMem(S, a, b, kind, scale = 1) { // a, b hakkında hatırlıyor
  const m = S.dip.mem[a][b]; m.push({ k: kind, d: S.t / 24, s: scale });
  if (m.length > 40) m.shift();
}
export function stamp(S) { return dateStr(S.t); }
export { NN };
