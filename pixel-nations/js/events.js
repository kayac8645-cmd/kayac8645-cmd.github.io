// Event Engine: dünya koşullarına bağlı dinamik olaylar (kriz, isyan, darbe, afet, kıtlık, ticaret/diplomasi gerginliği...)
import { clamp, fmt, dist } from './util.js';
import { NN, F, IR, OI, GOV, UNITS, T, RES } from './data.js';
import { logEvent, atWar, hasTrade, pactR, addMem, pact } from './state.js';
import { printMoney, militiaMax } from './economy.js';
import { neighbors, warsOf } from './diplomacy.js';
import { retreat } from './military.js';

const tmp = (n, k, v, days) => n.modsTemp.push({ k, v, days });
const nm = (S, i) => S.nations[i].short;

// w: koşullu ağırlık (gün başı olasılık), make: bağlam üretir, choices: [{t, d, fx, ai}]
export const EVENTS = {
  econ_crisis: {
    sev: 3, title: 'Ekonomik Kriz',
    w: (S, n) => (n.inflation > 0.12 ? 0.012 : 0) + (n.debt > n.gdp * 1.0 ? 0.01 : 0) + (n.growth < -0.07 ? 0.01 : 0) + (n.money < 5 && n.debt > n.gdp * 0.5 ? 0.012 : 0),
    text: (S, n) => `${n.name} ekonomisi sarsılıyor. Enflasyon %${(n.inflation * 100).toFixed(0)}, borç/GSYH %${(n.debt / n.gdp * 100).toFixed(0)}. Halk sokakta.`,
    choices: [
      { t: 'Kemer sıkma paketi', d: 'İstikrar -5 (60 gün), GSYH -3%; hazineye +20 günlük gelir.', fx: (S, n) => { tmp(n, 'stab', -5, 60); tmp(n, 'gdp', -0.03, 60); n.money += n.gdpDay * 20; }, ai: (n) => 1 },
      { t: 'Para bas', d: 'Hazineye 8% GSYH eklenir; enflasyon fırlar.', fx: (S, n) => { printMoney(S, n.id, n.gdp * 0.08); }, ai: (n) => 0.5 + n.tr.aggr },
      { t: 'Dış kredi', d: 'Borç +10% GSYH, nakit girişi; itibar -3.', fx: (S, n) => { n.debt += n.gdp * 0.1; n.money += n.gdp * 0.1; n.rep -= 3; }, ai: (n) => 0.8 },
    ],
  },
  revolt: {
    sev: 3, title: 'İsyan!',
    w: (S, n) => (n.stab < 38 ? 0.018 * (1 + (38 - n.stab) / 15) : 0) + (S.cities.some((c) => c.owner === n.id && c.occ > 60) ? 0.004 : 0),
    make: (S, n) => { const cs = S.cities.filter((c) => c.owner === n.id); return { city: cs.sort((a, b) => (b.occ > 0) - (a.occ > 0) || b.pop - a.pop)[S.rng.int(Math.min(3, cs.length))].id }; },
    text: (S, n, ctx) => `${S.cities[ctx.city].name} şehrinde isyan çıktı! İstikrar: ${n.stab.toFixed(0)}.`,
    choices: [
      { t: 'Bastır', d: 'Milis tükenir, nüfus -3%, istikrar +3; üretim aksamaz.', fx: (S, n, ctx) => { const c = S.cities[ctx.city]; c.militia *= 0.4; c.pop *= 0.97; n.stab = clamp(n.stab + 3, 0, 100); n.rep -= 1; }, ai: (n) => 0.6 + n.tr.aggr },
      { t: 'Taviz ver', d: 'GSYH -2% (90 gün), istikrar +7.', fx: (S, n) => { tmp(n, 'gdp', -0.02, 90); n.stab = clamp(n.stab + 7, 0, 100); }, ai: (n) => 1 },
      { t: 'Görmezden gel', d: 'Şehir üretimi -20%; istikrar daha da düşer.', fx: (S, n, ctx) => { const c = S.cities[ctx.city]; c.dmg = Math.min(0.5, c.dmg + 0.2); n.stab = clamp(n.stab - 4, 0, 100); }, ai: (n) => 0.1 },
    ],
  },
  coup: {
    sev: 3, title: 'Darbe Girişimi',
    w: (S, n) => (n.stab < 28 && (GOV[n.gov].mil > 1.1 || n.idx.mil > 55) ? 0.014 : 0) + (n.stab < 20 ? 0.01 : 0),
    text: (S, n) => `${n.name} ordusunun bir kesimi hükümeti devirmeye hazırlanıyor.`,
    choices: [
      { t: 'Orduya ayrıcalık', d: '25 günlük gelir harcanır; darbe ihtimali düşer.', fx: (S, n) => { n.money -= n.gdpDay * 25; n.idx.mil = Math.min(100, n.idx.mil + 10); n.stab = clamp(n.stab + 5, 0, 100); }, ai: (n) => 1 },
      { t: 'Subaylara tasfiye', d: 'Ordunun %10\'u kaybolur, istikrar +8.', fx: (S, n) => { for (const a of S.armies) if (a.owner === n.id) { a.hp *= 0.9; a.morale = Math.max(30, a.morale - 15); } n.stab = clamp(n.stab + 8, 0, 100); }, ai: (n) => 0.6 + n.tr.aggr * 0.4 },
      { t: 'Bir şey yapma', d: 'Darbe %55 ihtimalle başarılı olur.', fx: (S, n) => { if (S.rng.next() < 0.55) { coupHappens(S, n); } else { n.stab = clamp(n.stab + 4, 0, 100); logEvent(S, n.id, `${n.short}: darbe girişimi bastırıldı`, 1, { tag: 'event' }); } }, ai: (n) => 0.15 },
    ],
  },
  disaster: {
    sev: 2, title: 'Doğal Afet',
    w: (S, n) => 0.0035,
    make: (S, n) => {
      const cs = S.cities.filter((c) => c.owner === n.id); const c = cs[S.rng.int(cs.length)]; const W = S.W;
      let near = { river: 0, mount: 0, desert: 0, sea: 0 };
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = c.x + dx, y = c.y + dy; if (x < 0 || y < 0 || x >= 160 || y >= 96) continue; const i = y * 160 + x; if (W.river[i]) near.river++; const t = W.terr[i]; if (t === T.MOUNTAIN || t === T.HILLS) near.mount++; if (t === T.DESERT) near.desert++; if (t <= T.SEA) near.sea++; }
      const opts = [['Sel', 0.3 + near.river * 0.6], ['Deprem', 0.2 + near.mount * 0.12], ['Kuraklık', 0.2 + near.desert * 0.15], ['Kasırga', 0.1 + near.sea * 0.12], ['Salgın', 0.4]];
      let tot = opts.reduce((s, o) => s + o[1], 0), r = S.rng.next() * tot, kind = 'Salgın'; for (const o of opts) { r -= o[1]; if (r <= 0) { kind = o[0]; break; } }
      return { city: c.id, kind };
    },
    text: (S, n, ctx) => `${S.cities[ctx.city].name} bölgesini ${ctx.kind.toLowerCase()} vurdu!`,
    choices: [
      { t: 'Acil yardım seferberliği', d: '12 günlük gelir harcanır, hasar azalır.', fx: (S, n, ctx) => { n.money -= n.gdpDay * 12; applyDisaster(S, n, ctx, 0.4); }, ai: (n) => 1 },
      { t: 'Kendi haline bırak', d: 'Tam hasar.', fx: (S, n, ctx) => { applyDisaster(S, n, ctx, 1); }, ai: (n) => 0.5 },
    ],
  },
  shortage: {
    sev: 3, title: 'Gıda Kıtlığı',
    w: (S, n) => (n.sat[F] < 0.95 && n.stock[F] < n.cons[F] * 6 ? 0.03 : 0),
    text: (S, n) => `${n.name}'de gıda stokları tükeniyor; halk aç. Stok: ${fmt(n.stock[F])}.`,
    choices: [
      { t: 'Acil ithalat', d: 'Piyasa fiyatının 2 katıyla 15 günlük gıda satın alınır.', fx: (S, n) => { const q = n.cons[F] * 15; n.money -= q * S.market.price[F] * 2; n.stock[F] += q; }, ai: (n) => (n.money > n.gdpDay * 20 ? 1 : 0.1) },
      { t: 'Karne uygula', d: 'Tüketim %12 düşer (30 gün), istikrar -4.', fx: (S, n) => { n.stock[F] += n.cons[F] * 4; tmp(n, 'stab', -4, 30); }, ai: (n) => 0.7 },
    ],
  },
  trade_dispute: {
    sev: 2, title: 'Ticaret Anlaşmazlığı',
    w: (S, n) => 0.0015 * (S.nations.some((o) => o.alive && o.id !== n.id && hasTrade(S, n.id, o.id) && S.dip.op[n.id][o.id] < 0) ? 3 : 0.3),
    make: (S, n) => { const cand = S.nations.filter((o) => o.alive && o.id !== n.id && hasTrade(S, n.id, o.id)); if (!cand.length) return null; return { other: cand.sort((a, b) => S.dip.op[n.id][a.id] - S.dip.op[n.id][b.id])[0].id }; },
    text: (S, n, ctx) => `${nm(S, ctx.other)} ile ticaret anlaşmazlığı çıktı; tarife savaşı kapıda.`,
    choices: [
      { t: 'Taviz ver', d: 'Karşı tarafa yardım gönder (80 ¤ ×fiyat): ilişkiler düzelir.', fx: (S, n, ctx) => { n.money -= 80 * n.priceLevel; S.nations[ctx.other].money += 80 * n.priceLevel; addMem(S, ctx.other, n.id, 'gift', 0.8); }, ai: (n) => 0.6 + n.tr.dipl },
      { t: 'Karşılık ver', d: 'Anlaşma feshedilir, ilişkiler bozulur.', fx: (S, n, ctx) => { pact(S, n.id, ctx.other).trade = 0; S.dip.op[ctx.other][n.id] -= 10; addMem(S, ctx.other, n.id, 'refused', 2); }, ai: (n) => 0.3 + n.tr.aggr },
    ],
  },
  political: {
    sev: 2, title: 'Siyasi Kriz',
    w: (S, n) => (n.stab < 50 ? 0.004 : 0.0008) * (['democracy', 'republic', 'federation', 'confed'].includes(n.gov) ? 2 : 1),
    text: (S, n) => `${n.name} siyasetinde tıkanma: koalisyon ve meclis çatışıyor.`,
    choices: [
      { t: 'Reform paketi', d: '15 günlük gelir; istikrar +6, eğitim endeksi +4.', fx: (S, n) => { n.money -= n.gdpDay * 15; n.stab = clamp(n.stab + 6, 0, 100); n.idx.edu = Math.min(100, n.idx.edu + 4); }, ai: (n) => 0.8 },
      { t: 'Sert önlemler', d: 'İstikrar +3 ama itibar -3.', fx: (S, n) => { n.stab = clamp(n.stab + 3, 0, 100); n.rep -= 3; }, ai: (n) => 0.4 + n.tr.aggr * 0.5 },
    ],
  },
  tech_break: {
    sev: 1, title: 'Bilimsel Atılım',
    w: (S, n) => (n.rp > 6 ? 0.003 * Math.min(3, n.rp / 6) : 0.0008),
    text: (S, n) => `${n.name} bilim insanları beklenmedik bir keşif yaptı.`,
    choices: [
      { t: 'Araştırmaya aktar', d: 'Mevcut araştırmaya +80 puan.', fx: (S, n) => { n.sciStolen = (n.sciStolen || 0) + 80; }, ai: (n) => 1 },
      { t: 'Sanayiye uygula', d: 'GSYH +4% (120 gün).', fx: (S, n) => { tmp(n, 'gdp', 0.04, 120); }, ai: (n) => 0.8 },
    ],
  },
  tension: {
    sev: 2, title: 'Diplomatik Gerilim',
    w: (S, n) => (S.nations.some((o) => o.alive && o.id !== n.id && S.border[n.id][o.id] > 0 && S.dip.op[n.id][o.id] < -12 && !atWar(S, n.id, o.id)) ? 0.006 : 0),
    make: (S, n) => { const c = S.nations.filter((o) => o.alive && o.id !== n.id && S.border[n.id][o.id] > 0 && S.dip.op[n.id][o.id] < -12 && !atWar(S, n.id, o.id)); return c.length ? { other: c.sort((a, b) => S.dip.op[n.id][a.id] - S.dip.op[n.id][b.id])[0].id } : null; },
    text: (S, n, ctx) => `${nm(S, ctx.other)} sınırında bir çatışma/olay yaşandı; iki başkent karşılıklı suçluyor.`,
    choices: [
      { t: 'Özür dile / sakinleştir', d: 'İlişkiler +8; itibar sabit.', fx: (S, n, ctx) => { S.dip.op[ctx.other][n.id] += 8; S.dip.op[n.id][ctx.other] += 4; }, ai: (n) => 0.5 + n.tr.dipl },
      { t: 'Sert tepki', d: 'İlişkiler -12; savaş riski artar.', fx: (S, n, ctx) => { S.dip.op[ctx.other][n.id] -= 12; S.dip.op[n.id][ctx.other] -= 8; addMem(S, ctx.other, n.id, 'threat', 0.6); }, ai: (n) => 0.2 + n.tr.aggr },
      { t: 'Görmezden gel', d: 'Etki yok.', fx: () => {}, ai: (n) => 0.6 },
    ],
  },
  harvest: {
    sev: 1, title: 'Bol Hasat',
    w: (S, n) => (n.sat[F] >= 1 ? 0.0025 : 0.0006),
    text: (S, n) => `${n.name} çiftçileri rekor hasat topladı.`,
    choices: [{ t: 'Harika!', d: 'Gıda stoku +20 günlük tüketim, istikrar +3.', fx: (S, n) => { n.stock[F] += n.cons[F] * 20; n.stab = clamp(n.stab + 3, 0, 100); }, ai: () => 1 }],
  },
  discovery: {
    sev: 1, title: 'Yeni Maden Yatağı',
    w: (S, n) => 0.0012,
    make: (S, n) => { const cs = S.cities.filter((c) => c.owner === n.id); const c = cs[S.rng.int(cs.length)]; const k = S.rng.pick(['iron', 'coal', 'oil', 'gold', 'stone']); return { city: c.id, k }; },
    text: (S, n, ctx) => `${S.cities[ctx.city].name} yakınlarında yeni bir ${RES.find((r) => r.id === ctx.k).name.toLowerCase()} yatağı keşfedildi.`,
    choices: [{ t: 'Değerlendir', d: 'Bölge potansiyeli artar.', fx: (S, n, ctx) => { S.cities[ctx.city].pot[ctx.k] += ctx.k === 'gold' ? 2 : 3; }, ai: () => 1 }],
  },
};

function coupHappens(S, n) {
  n.gov = 'junta'; n.stab = 45; n.rep -= 10; n.pol.military = Math.min(0.12, n.pol.military + 0.03); n.tr.aggr = Math.min(1, n.tr.aggr + 0.2);
  for (const o of S.nations) if (o.alive && o.id !== n.id) addMem(S, o.id, n.id, 'refused', 1);
  logEvent(S, n.id, `${n.short}'de askerî darbe! Yeni rejim: ${GOV.junta.name}`, 3, { tag: 'event', global: true });
}
function applyDisaster(S, n, ctx, f) {
  const c = S.cities[ctx.city];
  const k = ctx.kind;
  if (k === 'Sel') { c.dmg = Math.min(0.5, c.dmg + 0.2 * f); c.pop *= 1 - 0.02 * f; n.stock[F] *= 1 - 0.12 * f; }
  else if (k === 'Deprem') { c.dmg = Math.min(0.5, c.dmg + 0.3 * f); c.pop *= 1 - 0.04 * f; const ks = Object.keys(c.bld).filter((q) => c.bld[q] > 0); if (ks.length && f > 0.6) c.bld[S.rng.pick(ks)]--; c.militia *= 0.7; }
  else if (k === 'Kuraklık') { tmp(n, 'gdp', -0.03 * f, 90); n.stock[F] *= 1 - 0.25 * f; }
  else if (k === 'Kasırga') { c.dmg = Math.min(0.5, c.dmg + 0.15 * f); n.stock[OI] *= 1 - 0.08 * f; c.pop *= 1 - 0.01 * f; }
  else { c.pop *= 1 - 0.06 * f; tmp(n, 'stab', -3 * f, 40); }
  S.visDirty = true;
}

// ---------- motor
export function dailyEvents(S) {
  for (const n of S.nations) {
    if (!n.alive) continue;
    for (const id in EVENTS) {
      const E = EVENTS[id]; const p = E.w(S, n);
      if (p <= 0 || S.rng.next() >= p) continue;
      if (S.eventCool[n.id + id] > S.day) continue;
      const ctx = E.make ? E.make(S, n) : {}; if (ctx === null) continue;
      S.eventCool[n.id + id] = S.day + 45;
      fire(S, n, id, ctx); break;
    }
  }
}
export function fire(S, n, id, ctx) {
  const E = EVENTS[id]; const text = E.text(S, n, ctx);
  if (n.id === S.player) {
    S.pending.push({ id: ++S.eid, ev: id, ctx, title: E.title, text, sev: E.sev, t: S.t, choices: E.choices.map((c) => ({ t: c.t, d: c.d })) });
    logEvent(S, n.id, `${E.title}: ${text}`, E.sev, { tag: 'event' });
  } else {
    // AI: ağırlıklı seçim
    const ws = E.choices.map((c) => Math.max(0.01, c.ai(n))); let r = S.rng.next() * ws.reduce((a, b) => a + b, 0), i = 0; for (; i < ws.length - 1; i++) { r -= ws[i]; if (r <= 0) break; }
    E.choices[i].fx(S, n, ctx);
    logEvent(S, n.id, `${E.title} — ${n.short}: ${text}`, E.sev >= 3 ? 2 : 0, { tag: 'event', inv: ctx.other !== undefined ? [ctx.other] : [] });
  }
}
export function resolveEvent(S, pid, choice) {
  const i = S.pending.findIndex((p) => p.id === pid); if (i < 0) return; const p = S.pending[i]; S.pending.splice(i, 1);
  const E = EVENTS[p.ev]; const n = S.nations[S.player]; E.choices[choice].fx(S, n, p.ctx);
  logEvent(S, n.id, `Karar: ${E.choices[choice].t}`, 0, { tag: 'event' });
}
