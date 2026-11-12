// Diplomacy Engine: görüş/hafıza, anlaşmalar, savaş-barış, yaptırım, casusluk, değerlendirme
import { clamp, dist, N, W, fmt } from './util.js';
import { NN, MEM, GOV, NR, F, IR, OI } from './data.js';
import { pact, pactR, atWar, allied, hasTrade, sanctioned, logEvent, addMem } from './state.js';
import { nationPower, retreat } from './military.js';

export function initDiplomacy(S) {
  S.dip = { pacts: {}, sanc: Array.from({ length: NN }, () => new Array(NN).fill(0)), mem: Array.from({ length: NN }, () => Array.from({ length: NN }, () => [])), op: Array.from({ length: NN }, () => new Array(NN).fill(0)), intel: Array.from({ length: NN }, () => new Array(NN).fill(0)) };
  S.border = Array.from({ length: NN }, () => new Array(NN).fill(0)); S.near = Array.from({ length: NN }, () => new Array(NN).fill(99));
  S.inbox = []; S.warScore = {}; computeNeighbors(S);
  // başlangıç görüşü: kişilik uyumu
  for (let a = 0; a < NN; a++) for (let b = 0; b < NN; b++) if (a !== b) S.dip.op[a][b] = opinionBreakdown(S, a, b).total * 0.6;
}

export function computeNeighbors(S) {
  const g = S.ownerGrid; const B = S.border; for (const r of B) r.fill(0);
  for (let y = 0; y < 96; y++) for (let x = 0; x < 160; x++) { const i = y * 160 + x, o = g[i]; if (o < 0) continue; if (x < 159) { const p = g[i + 1]; if (p >= 0 && p !== o) { B[o][p]++; B[p][o]++; } } if (y < 95) { const p = g[i + 160]; if (p >= 0 && p !== o) { B[o][p]++; B[p][o]++; } } }
  for (const r of S.near) r.fill(99);
  for (const c of S.cities) for (const d of S.cities) if (c.owner !== d.owner && c.owner >= 0 && d.owner >= 0) { const k = Math.hypot(c.x - d.x, c.y - d.y); if (k < S.near[c.owner][d.owner]) S.near[c.owner][d.owner] = k; }
}
export const neighbors = (S, a, b) => S.border[a][b] > 0 || S.near[a][b] < 22;

export function memScore(S, a, b) {
  const day = S.t / 24, fg = S.nations[a].tr.forgive; let s = 0; const parts = [];
  for (const m of S.dip.mem[a][b]) {
    const k = MEM[m.k]; if (!k) continue; const hl = k.hl * (k.v < 0 ? 1.7 - 1.4 * fg : 1);
    const v = k.v * m.s * Math.pow(0.5, (day - m.d) / hl); if (Math.abs(v) > 0.3) { s += v; parts.push({ t: k.t, v, d: m.d }); }
  }
  return { s, parts };
}
const family = { democracy: 'lib', republic: 'lib', federation: 'lib', confed: 'lib', oligarchy: 'lib', monarchy: 'trad', empire: 'auth', sultanate: 'trad', theocracy: 'auth', junta: 'auth', khanate: 'auth', peoples: 'auth' };

export function opinionBreakdown(S, a, b) {
  const A = S.nations[a], B = S.nations[b], P = pactR(S, a, b), parts = []; const add = (t, v) => { if (Math.abs(v) >= 0.5) parts.push({ t, v }); };
  const fa = family[A.gov], fb = family[B.gov];
  add('Benzer yönetim', fa === fb ? 7 : (fa === 'lib' && fb === 'auth') || (fa === 'auth' && fb === 'lib') ? -8 : 0);
  if (S.border[a][b] > 0) add('Sınır gerilimi', -(3 + 7 * A.tr.expan) * Math.min(1.5, S.border[a][b] / 15 + 0.5));
  const pa = A.milPower || 1, pb = B.milPower || 1;
  if (pb > pa * 1.8 && A.tr.para > 0.5) add('Güçlü komşudan korku', -6 * A.tr.para);
  add('Saldırgan görülüyor', -(B.tr.aggr - 0.4) * 14 * (1 - A.tr.aggr));
  if (P.ally) add('İttifak', 28); if (P.trade) add('Ticaret ortağı', 8); if (P.nap > S.day) add('Saldırmazlık', 5); if (P.access) add('Askerî geçiş', 4);
  if (P.war) add('Savaş halinde', -55); if (sanctioned(S, a, b)) add('Yaptırım', -18);
  let shared = 0, opp = 0;
  for (let c = 0; c < NN; c++) { if (c === a || c === b || !S.nations[c].alive) continue; if (atWar(S, a, c) && atWar(S, b, c)) shared++; if ((atWar(S, a, c) && allied(S, b, c)) || (atWar(S, b, c) && allied(S, a, c))) opp++; }
  add('Ortak düşman', shared * 9); add('Müttefikimizle savaşta', -opp * 10);
  const fl = (S.flows && (S.flows[a + '>' + b] ? S.flows[a + '>' + b].v : 0)) + (S.flows && (S.flows[b + '>' + a] ? S.flows[b + '>' + a].v : 0)); if (fl) add('Ticaret hacmi', Math.min(8, fl / 80));
  add('İtibar', (B.rep - 55) * 0.35 * (0.5 + A.tr.loyal));
  const m = memScore(S, a, b); for (const p of m.parts) parts.push({ t: p.t, v: p.v, mem: true });
  const total = clamp(parts.reduce((s, p) => s + p.v, 0), -100, 100);
  return { total, parts };
}

// ---------- değerlendirme
const need = (n, r) => Math.max(0, Math.max(n.cons[r], 1) * 18 - n.stock[r]) / (Math.max(n.cons[r], 1) * 18);
const surplus = (n, r) => Math.max(0, n.stock[r] - Math.max(n.cons[r], 1) * 24) / (Math.max(n.cons[r], 1) * 24 + 10);
export function complement(S, a, b) {
  let s = 0; const A = S.nations[a], B = S.nations[b];
  for (let r = 0; r < NR - 1; r++) s += Math.min(1, need(A, r) * surplus(B, r)) + Math.min(1, need(B, r) * surplus(A, r));
  return clamp(s * 6, 0, 25);
}
export function warAdvantage(S, a, b) { return (S.warScore[a + '_' + b] || 0) - (S.warScore[b + '_' + a] || 0); }

export function evaluate(S, from, to, type) {
  const F_ = S.nations[from], T_ = S.nations[to], P = pactR(S, from, to), op = S.dip.op[to][from], reasons = [];
  const add = (t, v) => { if (Math.abs(v) >= 0.5) reasons.push({ t, v }); };
  let score = 0, ok = true, why = '';
  const pf = F_.milPower || 1, pt = T_.milPower || 1;
  add('Genel görüş', op); score += op;
  if (!T_.alive || !F_.alive) return { accept: false, score: -99, reasons, why: 'Devlet yok' };
  switch (type) {
    case 'alliance': {
      if (P.war) { ok = false; why = 'Savaş halinde'; break; } if (P.ally) { ok = false; why = 'Zaten müttefik'; break; }
      let ce = 0; for (let c = 0; c < NN; c++) if (c !== from && c !== to && S.nations[c].alive && atWar(S, from, c) && atWar(S, to, c)) ce++;
      add('Ortak düşman', ce * 22); add('İttifak eğilimi', (T_.tr.loyal + T_.tr.dipl) * 8); add('Temkinli yapı', -T_.tr.para * 12 - 22);
      const nAl = Object.keys(S.dip.pacts).filter((k) => S.dip.pacts[k].ally && (Math.floor(k / 32) === to || k % 32 === to)).length; add('Çok sayıda ittifak', -nAl * 10);
      if (pf > pt * 1.3) add('Güçlü ortak', 6);
      const threat = S.nations.filter((c) => c.alive && c.id !== to && c.id !== from && (S.border[to][c.id] > 0) && (c.milPower || 0) > pt * 1.4 && S.dip.op[to][c.id] < -10).length; add('Ortak tehdit', threat * 10);
      score = reasons.reduce((s, r) => s + r.v, 0) - 5; if (op < 18) { ok = false; why = 'Yeterince güvenmiyor'; } break;
    }
    case 'trade': {
      if (P.war || P.trade) { ok = false; why = P.trade ? 'Zaten anlaşma var' : 'Savaş halinde'; break; } if (sanctioned(S, from, to)) { ok = false; why = 'Yaptırım var'; break; }
      add('Tüccar eğilimi', T_.tr.merc * 22 - 8); add('Tamamlayıcı ekonomiler', complement(S, from, to)); score = reasons.reduce((s, r) => s + r.v, 0) + 6; if (op < -22) { ok = false; why = 'İlişkiler çok kötü'; } break;
    }
    case 'nap': {
      if (P.war || P.nap > S.day || P.ally) { ok = false; why = P.ally ? 'Müttefik' : P.war ? 'Savaş halinde' : 'Zaten var'; break; }
      add('Temkin', T_.tr.para * 8); if (pf > pt * 1.5) add('Güçlü komşudan emniyet', 14); if (pt > pf * 1.5) add('Saldırganlık hesabı', -T_.tr.aggr * 22);
      if (T_.ai && T_.ai.plan && T_.ai.plan.target === from) add('Saldırı planı var', -45); if (P.truce > S.day) add('Ateşkes sonrası', 6);
      score = reasons.reduce((s, r) => s + r.v, 0) + 4; break;
    }
    case 'access': {
      if (P.war || P.access) { ok = false; why = P.access ? 'Zaten var' : 'Savaş halinde'; break; } if (P.ally) { ok = false; why = 'Müttefik zaten geçebilir'; break; }
      add('Güvensizlik', -14 - T_.tr.para * 14); score = reasons.reduce((s, r) => s + r.v, 0); if (op < 20) { ok = false; why = 'Yeterince güvenmiyor'; } break;
    }
    case 'peace': {
      if (!P.war) { ok = false; why = 'Savaşta değiliz'; break; }
      const adv = warAdvantage(S, to, from); add('Savaş durumu', -adv * 16); const rp = pt / (pf + 1); add(rp > 1.6 ? 'Güçlü olduğunu düşünüyor' : rp < 0.65 ? 'Zayıf düştü' : 'Denk güçler', rp > 1.6 ? -22 : rp < 0.65 ? 24 : 2);
      add('Savaş yorgunluğu', T_.weariness * 0.7 - 6); add('Savaş süresi', Math.min(18, (S.day - (P.warStart || 0)) / 25)); add('Hırs', -T_.tr.aggr * 16); add('Kin', Math.min(0, op) * 0.2);
      const cap = S.warScore[to + '_' + from] || 0; if (cap) add('Savaş hedefi karşılandı', Math.min(32, cap * 11 - T_.tr.expan * 9));
      if (T_.stab < 25) add('İç karışıklık', 24);
      score = reasons.filter((r) => r.t !== 'Genel görüş').reduce((s, r) => s + r.v, 0); break;
    }
    case 'gift': score = 99; break;
    default: break;
  }
  return { accept: ok && score >= 0, score, reasons, why, ok };
}

// ---------- uygulama
function ally3(S, x) { const out = []; for (const k in S.dip.pacts) { const p = S.dip.pacts[k]; if (p.ally) { const a = Math.floor(k / 32), b = k % 32; if (a === x) out.push(b); else if (b === x) out.push(a); } } return out; }
export const alliesOf = (S, x) => ally3(S, x).filter((o) => S.nations[o].alive);
export const warsOf = (S, x) => S.nations.filter((n) => n.alive && n.id !== x && atWar(S, x, n.id)).map((n) => n.id);

export function applyTreaty(S, a, b, type) {
  const P = pact(S, a, b);
  if (type === 'alliance') { P.ally = 1; P.nap = 0; P.since = S.day; } else if (type === 'trade') P.trade = 1; else if (type === 'nap') P.nap = S.day + 365 * 3; else if (type === 'access') P.access = 1;
  addMem(S, a, b, 'deal'); addMem(S, b, a, 'deal'); S.dip.op[a][b] += 4; S.dip.op[b][a] += 4;
  const names = { alliance: 'ittifak kurdu', trade: 'ticaret anlaşması imzaladı', nap: 'saldırmazlık paktı imzaladı', access: 'askerî geçiş anlaşması yaptı' };
  logEvent(S, a, `${S.nations[a].short} ve ${S.nations[b].short} ${names[type]}`, type === 'alliance' ? 1 : 0, { tag: 'dip', inv: [a, b], global: type === 'alliance' });
}
export function breakTreaty(S, a, b, type, silent) {
  const P = pact(S, a, b);
  if (type === 'alliance') P.ally = 0; if (type === 'trade') P.trade = 0; if (type === 'nap') { if (P.nap > S.day) betray(S, a, b, 0.7); P.nap = 0; } if (type === 'access') P.access = 0;
  if (type === 'alliance' && !silent) betray(S, a, b, 0.6);
  if (!silent) logEvent(S, a, `${S.nations[a].short}, ${S.nations[b].short} ile ${type === 'alliance' ? 'ittifakı' : type === 'trade' ? 'ticaret anlaşmasını' : type === 'nap' ? 'saldırmazlığı' : 'geçiş anlaşmasını'} feshetti`, 2, { tag: 'dip', inv: [a, b] });
}
function betray(S, a, b, scale) { addMem(S, b, a, 'betrayal', scale); S.nations[a].rep = clamp(S.nations[a].rep - 22 * scale, 0, 100); for (let c = 0; c < NN; c++) if (c !== a && c !== b && S.nations[c].alive) addMem(S, c, a, 'betrayal', 0.2 * scale); }

export function canDeclare(S, a, b) {
  if (a === b || !S.nations[a].alive || !S.nations[b].alive) return 'Geçersiz hedef'; if (atWar(S, a, b)) return 'Zaten savaştayız';
  if (S.day < 20) return 'Dünya henüz hazır değil (ilk 20 gün)'; return null;
}
export function declareWar(S, a, b, reason = 'aggr') {
  const why = canDeclare(S, a, b); if (why) return { ok: false, msg: why };
  const P = pact(S, a, b); const A = S.nations[a], B = S.nations[b];
  if (P.ally) { P.ally = 0; betray(S, a, b, 1); } else if (P.nap > S.day) { betray(S, a, b, 1); } else if (P.truce > S.day && reason === 'aggr') { betray(S, a, b, 0.4); }
  P.war = 1; P.warStart = S.day; P.ally = 0; P.nap = 0; P.trade = 0; P.access = 0; P.truce = 0;
  addMem(S, b, a, 'war_on_me');
  for (const x of alliesOf(S, b)) if (x !== a) addMem(S, x, a, 'attacked_ally');
  if (reason === 'aggr') A.rep = clamp(A.rep - 7, 0, 100);
  A.stab = Math.max(0, A.stab - (A.gov === 'democracy' ? 5 : 1.5)); A.weariness += 3;
  S.warScore[a + '_' + b] = 0; S.warScore[b + '_' + a] = 0;
  logEvent(S, a, `${A.short}, ${B.short} devletine SAVAŞ İLAN ETTİ!`, a === S.player || b === S.player ? 3 : 2, { tag: 'war', inv: [a, b], global: true });
  for (const x of S.armies) { if (x.owner === a || x.owner === b) { /* emirler korunur */ } }
  // ittifak çağrıları
  for (const x of alliesOf(S, b)) { if (x === a || atWar(S, x, a) || allied(S, x, a)) continue; callAlly(S, x, b, a, true); }
  for (const x of alliesOf(S, a)) { if (x === b || atWar(S, x, b) || allied(S, x, b)) continue; callAlly(S, x, a, b, reason === 'aggr' ? false : true); }
  S.ownerDirty = true; return { ok: true, msg: `${B.short} devletine savaş ilan edildi` };
}
function callAlly(S, x, caller, foe, defensive) {
  const X = S.nations[x];
  const willing = x === S.player ? true : (defensive ? X.tr.loyal * 0.75 + 0.25 : X.tr.loyal * 0.45 + (S.dip.op[x][foe] < -15 ? 0.3 : 0)) > S.rng.next() * 0.9 && (X.milPower || 1) > 0;
  if (willing && pactR(S, x, foe).truce <= S.day + 0) {
    const r = declareWar(S, x, foe, 'ally'); if (r.ok) { addMem(S, caller, x, 'ally_honored'); S.nations[x].rep = clamp(S.nations[x].rep + 2, 0, 100); }
  } else { addMem(S, caller, x, 'ally_ignored'); if (S.rng.chance(0.5)) breakTreaty(S, caller, x, 'alliance', true); logEvent(S, x, `${X.short}, ${S.nations[caller].short} ittifak çağrısını yanıtsız bıraktı`, 2, { tag: 'dip', inv: [x, caller] }); }
}
export function makePeace(S, a, b) {
  const P = pact(S, a, b); if (!P.war) return;
  P.war = 0; P.truce = S.day + 180; addMem(S, a, b, 'peace'); addMem(S, b, a, 'peace');
  S.nations[a].weariness *= 0.5; S.nations[b].weariness *= 0.5;
  for (const x of S.armies) { if (x.owner === a || x.owner === b) { x.engaged = -1; } }
  for (const x of S.armies) { if (x.type === 'air' || (x.owner !== a && x.owner !== b)) continue; const o = x.owner === a ? b : a; if (S.ownerGrid[x.tile] === o && pactR(S, a, b).access !== 1) retreat(S, x); }
  logEvent(S, a, `${S.nations[a].short} ve ${S.nations[b].short} arasında barış sağlandı`, 1, { tag: 'war', inv: [a, b], global: true });
  S.ownerDirty = true;
}

// Teklif akışı. from teklif eder, to yanıtlar (AI ise değerlendirir; oyuncu ise gelen kutusu)
export function propose(S, from, to, type, opts = {}) {
  if (to === S.player && from !== S.player) { // AI -> oyuncu: gelen kutusu
    if (S.inbox.some((m) => m.from === from && m.type === type)) return { ok: true, msg: 'Zaten bekliyor' };
    S.inbox.push({ id: ++S.eid, from, to, type, t: S.t, exp: S.t + 24 * 15 }); logEvent(S, from, `${S.nations[from].short} size ${typeName(type)} teklif ediyor`, 1, { tag: 'dip', inv: [to, from] }); return { ok: true, msg: 'Teklif iletildi' };
  }
  const ev = evaluate(S, from, to, type);
  if (!ev.ok && ev.why) return { ok: false, msg: ev.why, ev };
  if (ev.accept) { executeProposal(S, from, to, type); return { ok: true, accepted: true, msg: `${S.nations[to].short} kabul etti`, ev }; }
  addMem(S, from, to, 'refused', 0.5); S.dip.op[from][to] -= 1;
  return { ok: true, accepted: false, msg: `${S.nations[to].short} reddetti`, ev };
}
export function executeProposal(S, from, to, type) {
  if (type === 'peace') makePeace(S, from, to); else applyTreaty(S, from, to, type);
}
export const typeName = (t) => ({ alliance: 'ittifak', trade: 'ticaret anlaşması', nap: 'saldırmazlık paktı', access: 'askerî geçiş anlaşması', peace: 'barış' }[t] || t);
export function answerInbox(S, id, accept) {
  const i = S.inbox.findIndex((m) => m.id === id); if (i < 0) return; const m = S.inbox[i]; S.inbox.splice(i, 1);
  if (accept && S.nations[m.from].alive && !(m.type === 'peace' && !atWar(S, m.from, m.to))) executeProposal(S, m.from, m.to, m.type);
  else if (!accept) S.dip.op[m.from][m.to] -= 1;
}

// tek taraflı eylemler
export function sanction(S, a, b, on = true) {
  if (on) { S.dip.sanc[a][b] = 1; pact(S, a, b).trade = 0; addMem(S, b, a, 'sanction'); logEvent(S, a, `${S.nations[a].short}, ${S.nations[b].short} devletine ekonomik yaptırım uyguladı`, 2, { tag: 'dip', inv: [a, b], global: true });
    for (const x of alliesOf(S, a)) if (x !== b && x !== S.player && S.nations[x].tr.loyal > 0.6 && S.rng.chance(0.4)) { S.dip.sanc[x][b] = 1; pact(S, x, b).trade = 0; addMem(S, b, x, 'sanction', 0.6); } }
  else { S.dip.sanc[a][b] = 0; S.dip.op[b][a] += 3; }
  return { ok: true, msg: on ? 'Yaptırım uygulandı' : 'Yaptırım kaldırıldı' };
}
export function gift(S, a, b, amount) {
  const A = S.nations[a], B = S.nations[b]; if (A.money < amount || amount <= 0) return { ok: false, msg: 'Yeterli para yok' };
  A.money -= amount; B.money += amount; addMem(S, b, a, 'gift', clamp(amount / Math.max(60, B.gdpDay * 0.6), 0.3, 3)); S.dip.op[b][a] += 2;
  return { ok: true, msg: `${B.short} devletine ${fmt(amount)} ¤ yardım gönderildi` };
}
export function militaryAid(S, a, b) {
  const A = S.nations[a], B = S.nations[b]; const cost = { iron: 40, oil: 12 }; if (A.stock[IR] < 40 || A.stock[OI] < 12 || A.money < 100) return { ok: false, msg: 'Yetersiz demir/petrol/para' };
  A.stock[IR] -= 40; A.stock[OI] -= 12; A.money -= 100; B.stock[IR] += 40; B.stock[OI] += 12;
  const war = S.nations.some((c) => c.alive && atWar(S, b, c.id) && atWar(S, a, c.id));
  addMem(S, b, a, war ? 'aided' : 'gift', war ? 0.6 : 1.2); return { ok: true, msg: 'Askerî yardım teslim edildi' };
}
export function threaten(S, a, b) {
  const A = S.nations[a], B = S.nations[b]; const rp = (A.milPower || 1) / ((B.milPower || 1) + 1);
  if (rp > 1.6 && B.tr.para + (1 - B.tr.aggr) > 0.9 || rp > 2.4) { const tribute = Math.min(B.money * 0.15, B.gdpDay * 8); B.money -= tribute; A.money += tribute; addMem(S, b, a, 'tribute'); A.rep -= 4; return { ok: true, msg: `${B.short} haraç ödedi: ${fmt(tribute)} ¤` }; }
  addMem(S, b, a, 'threat'); A.rep -= 2; return { ok: true, msg: `${B.short} tehdide boyun eğmedi — ilişkiler bozuldu` };
}
export const SPY_OPS = {
  intel: { name: 'İstihbarat Topla', cost: 120, desc: '90 gün boyunca hedefin planlarını ve hafızasını görürsünüz.' },
  steal: { name: 'Teknoloji Çal', cost: 220, desc: 'Araştırma puanı çalar.' },
  sabotage: { name: 'Sabotaj', cost: 260, desc: 'Bir şehirde üretimi aksatır, stoktan yakar.' },
  unrest: { name: 'Huzursuzluk Kışkırt', cost: 200, desc: 'Hedefin istikrarını düşürür.' },
};
export function spyOp(S, a, b, op) {
  const A = S.nations[a], B = S.nations[b], o = SPY_OPS[op]; if (!o) return { ok: false, msg: 'Geçersiz operasyon' };
  const cost = o.cost * A.priceLevel; if (A.money < cost) return { ok: false, msg: 'Para yetersiz' }; A.money -= cost;
  const p = clamp(0.5 + A.tr.scheme * 0.25 + A.mods.spy * 0.6 - B.mods.spy * 0.5 - (B.cIntel || 0) - (B.stab > 70 ? 0.05 : 0), 0.12, 0.92);
  const succ = S.rng.next() < p, caught = S.rng.next() < (succ ? 0.18 : 0.65);
  let msg = '';
  if (succ) {
    if (op === 'intel') { S.dip.intel[a][b] = S.day + 90; msg = 'İstihbarat ağı kuruldu'; }
    else if (op === 'steal') { const g = 30 + S.rng.next() * 60; A.sciStolen = (A.sciStolen || 0) + g; msg = `${Math.round(g)} araştırma puanı çalındı`; }
    else if (op === 'sabotage') { const cs = S.cities.filter((c) => c.owner === b); const c = cs[S.rng.int(cs.length)]; c.dmg = Math.min(0.5, c.dmg + 0.15); for (const r of [IR, OI]) B.stock[r] *= 0.85; msg = `${c.name} şehrinde sabotaj başarılı`; addMem(S, b, a, 'sabotage', 0.0); }
    else if (op === 'unrest') { B.modsTemp.push({ k: 'stab', v: -9, days: 80 }); msg = 'Hedefte huzursuzluk yayıldı'; }
  } else msg = 'Operasyon başarısız oldu';
  if (caught) { addMem(S, b, a, 'spied'); A.rep = clamp(A.rep - 3, 0, 100); msg += ' — ajanlar yakalandı!'; if (b === S.player) logEvent(S, b, `${A.short} casusları yakalandı!`, 2, { tag: 'dip', inv: [a] }); }
  else if (succ && op !== 'intel' && S.rng.chance(0.3)) { addMem(S, b, a, 'sabotage', 0.5); }
  return { ok: succ, msg, caught };
}

// ---------- günlük
export function dailyDiplomacy(S) {
  const day = S.day;
  if (day % 5 === 0) computeNeighbors(S);
  for (const n of S.nations) if (n.alive) n.milPower = nationPower(S, n.id);
  for (let a = 0; a < NN; a++) { if (!S.nations[a].alive) continue; for (let b = 0; b < NN; b++) { if (a === b || !S.nations[b].alive) continue; const t = opinionBreakdown(S, a, b).total; S.dip.op[a][b] += (t - S.dip.op[a][b]) * 0.08; } }
  for (const k in S.dip.pacts) { const p = S.dip.pacts[k]; if (p.nap && p.nap < day) { p.nap = 0; } }
  S.inbox = S.inbox.filter((m) => m.exp > S.t && S.nations[m.from].alive);
  for (const key in S.warScore) { if (S.warScore[key] > 0 && S.day % 30 === 0) S.warScore[key] *= 0.9; }
  for (const n of S.nations) { if (!n.alive) continue; if (!S.nations.some((o) => o.alive && o.id !== n.id && atWar(S, n.id, o.id))) n.weariness = Math.max(0, n.weariness - 0.3); }
}
