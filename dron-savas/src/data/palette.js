// TEK palet dosyası: 64 renk (56 sanat + 8 takım). Mevsim/gece palet kaydırma ile üretilir.
export const PAL = {
  k0: '#0c0e14', k1: '#1a1d28', k2: '#2b2f3c', k3: '#4a5061', k4: '#6d7486', k5: '#9aa1b0', k6: '#c9ced8', k7: '#eef1f5',
  g0: '#1d3b23', g1: '#28512c', g2: '#356b35', g3: '#46853f', g4: '#5f9e4b', g5: '#82b65c',
  y0: '#6b6a2f', y1: '#8c8a3c', y2: '#b0a650', y3: '#d2c46b',
  b0: '#2e2117', b1: '#4a3322', b2: '#6b4a2f', b3: '#8c6440', b4: '#ad8456', b5: '#cfa874',
  s1: '#c9b57a', s2: '#e2d29a',
  w0: '#0f1e3a', w1: '#16305a', w2: '#1f4677', w3: '#2b6094', w4: '#4a85b5', w5: '#8cbfdc',
  r0: '#3a3a40', r1: '#56555c', r2: '#76747a', r3: '#99969a',
  n0: '#b9c8d8', n1: '#dce6ef', n2: '#f6fafd',
  e0: '#5a1418', e1: '#8e2026', e2: '#c43a33', o0: '#d9602b', o1: '#f08d35', l0: '#f7c948', l1: '#fff3a8',
  u0: '#203a6b', u1: '#2f5aa8', u2: '#4b85e0',
  m0: '#2c3a26', m1: '#3e4f30',
  c0: '#5c5a57', c1: '#7d7a74', c2: '#a3a09a', f0: '#6e2e24', f1: '#94402f', f2: '#b7593f',
  // takım renkleri (8)
  t0: '#3f7fe0', t1: '#d8423a', t2: '#4cb85c', t3: '#e6b630', t4: '#9b5bd0', t5: '#e07a2a', t6: '#35b8c4', t7: '#d65d9e',
};
export const PAL_NAMES = Object.keys(PAL);
export const PAL_COUNT = PAL_NAMES.length;

export function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
// ABGR uint32 (ImageData little-endian)
export function hexToU32(h) { const [r, g, b] = hexToRgb(h); return (255 << 24 | b << 16 | g << 8 | r) >>> 0; }
export const P32 = Object.fromEntries(PAL_NAMES.map((k) => [k, hexToU32(PAL[k])]));
export const PRGB = Object.fromEntries(PAL_NAMES.map((k) => [k, hexToRgb(PAL[k])]));

// 24 ülke için renk: ilk 8 takım rengi, sonra sanat paletinden ayırt edilebilir tonlar
export const TEAM = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 'u2', 'e2', 'g5', 'l0', 'o1', 'w5', 'f2', 'b5',
  'y3', 'g3', 'u1', 'e1', 'n0', 'b3', 'c2', 'k5'];
export const TEAM_DARK = { t0: 'u1', t1: 'e1', t2: 'g2', t3: 'b3', t4: 'u0', t5: 'f1', t6: 'w3', t7: 'e1' };
export function teamRgb(i) { return PRGB[TEAM[i % TEAM.length]]; }
export function teamHex(i) { return PAL[TEAM[i % TEAM.length]]; }

// Mevsim palet kaydırması: arazi renk anahtarlarını eşler
export const SEASON_MAP = [
  {}, // ilkbahar: temel
  { g3: 'g4', g4: 'y2', g5: 'y3', g2: 'g3', m1: 'y0' }, // yaz: kuru
  { g3: 'b3', g4: 'b4', g5: 'y2', g2: 'b2', g1: 'g1', m1: 'b2' }, // sonbahar: kahverengi
  { g0: 'n0', g1: 'n0', g2: 'n1', g3: 'n1', g4: 'n2', g5: 'n2', y2: 'n1', y3: 'n2', m0: 'r2', m1: 'n0', s1: 'n0', s2: 'n1', b3: 'n0' }, // kış
];
