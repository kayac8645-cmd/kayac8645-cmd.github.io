/* ============================================================
   COMPUTE EMPIRE v13 — HOLDING 2: TOPLU SATIN ALMA VE YÖNETİM (HB)
   Tedarik zinciri şirketleri (maden · HBM · GPU · elektrik · RAM/depolama · EXONS) için:
   toplu alım (hedef pay / bütçe), rakip paylarına otomatik teklif, piyasa tepkisi, toplu satış,
   politika şablonları, toplu ambargo ve yatırım, kâr içte tutma → kapasite, gelen teklif kuralları,
   otomatik holding yöneticisi. Tüm işlemler mevcut tekil eylemlerden geçer: kurallar aynı kalır.
   Durum: S.hb
   ============================================================ */
const HB_LV = [[0.01, 'Temettü'], [0.10, 'Kurul'], [0.25, 'Veto'], [0.51, 'Kontrol'], [1, 'Tam sahip']];
const HB_TPL = {
  cheap:   { n: 'Ucuz tedarik',    d: 'Kendi maliyetin düşer, kâr azalır.',               m: { sp: 0.6, rp: 1, qt: 0.3, dv: 0.5 } },
  profit:  { n: 'Kâr makinesi',    d: 'Rakiplere pahalı sat, kârın hepsini aktar.',       m: { sp: 1, rp: 1.5, qt: 0, dv: 1 } },
  squeeze: { n: 'Rakibi sık',      d: 'Rakip maliyeti zirve, önde gelen 2 rakibe ambargo. Ceza riski çok yüksek.', m: { sp: 0.8, rp: 2, qt: 0.6, dv: 0.7 }, emb: 2 },
  safe:    { n: 'Denetim dostu',   d: 'Ambargolar kalkar, fiyatlar ılımlı. Ceza riski düşer.', m: { sp: 0.85, rp: 1, qt: 0.1, dv: 0.7 }, emb: -1 },
  growth:  { n: 'Büyüme',          d: 'Kârın %80\'i içte kalır ve otomatik kapasite yatırımına döner.', m: { sp: 0.9, rp: 1.1, qt: 0.1, dv: 0.2 } },
};
const HB_HEAT_STEP = 0.03, HB_HEAT_MAX = 0.25, HB_HEAT_DECAY = 0.97;   // piyasa tepkisi
const HB_BID_P = 0.6;                                                  // otomatik teklif hedef kabul olasılığı
const HB_AUTO_FEE = 0.00004;                                           // otomatik yönetici: pay değerinin günlük oranı (~%0,12/ay)

function hbState(){ return { v: 1, heat: {}, tpl: {}, auto: { on: false, cashMin: 0, log: [], next: 0, defend: true, risk: true, payout: true, cap: true }, rule: { on: false, acc: 1.5, rej: 1.1, ctr: 1.25 }, ops: [], st: { bought: 0, spent: 0, bids: 0, auto: 0 } }; }
function hbEnsure(S){
  if (!S.hb || S.hb.v !== 1) S.hb = hbState();
  const b = hbState(); for (const k in b) if (!(k in S.hb)) S.hb[k] = b[k];
  for (const k in b.auto) if (!(k in S.hb.auto)) S.hb.auto[k] = b.auto[k];
  for (const k in b.rule) if (!(k in S.hb.rule)) S.hb.rule[k] = b.rule[k];
  return S.hb;
}
const hbHeat = (S, sec) => (S.hb && S.hb.heat[sec]) || 0;
function hbLvlName(o){ let n = ''; for (const [t, x] of HB_LV) if (o >= t - 1e-9) n = x; return n; }
function hbOp(S, t){ const H = hbEnsure(S); H.ops.unshift({ d: S.day, t }); if (H.ops.length > 20) H.ops.length = 20; }

/* ---------- Piyasa tepkisi: oyuncu alımı sektör fiyatını ısıtır ---------- */
const _hbBuyPrice = hdBuyPrice;
hdBuyPrice = function(S, id, d, who){ const p = _hbBuyPrice(S, id, d, who); return who === -1 ? Math.round(p * (1 + hbHeat(S, HD_BY[id].sec))) : p; };
const _hbActBuy = actHoldBuy;
actHoldBuy = function(S, id, d){
  const r = _hbActBuy(S, id, d);
  if (r && r.ok !== false){ const H = hbEnsure(S), sec = HD_BY[id].sec; H.heat[sec] = Math.min(HB_HEAT_MAX, (H.heat[sec] || 0) + HB_HEAT_STEP * Math.min(1, d / 0.1 + 0.3)); }
  return r;
};

/* ---------- Simülasyon yardımcıları (geçici değişiklik → ölç → geri al) ---------- */
function hbWith(S, mut, fn){
  const H = S.hold, saved = {};
  for (const id in mut){ const c = H.cos[id]; saved[id] = { own: c.own, m: { ...c.m, emb: { ...c.m.emb } } }; const x = mut[id]; if (x.own != null) c.own = x.own; if (x.m) Object.assign(c.m, x.m); if (x.emb) c.m.emb = x.emb; }
  hdCacheClr();
  try { return fn(); } finally { for (const id in saved){ const c = H.cos[id]; c.own = saved[id].own; c.m = saved[id].m; } hdCacheClr(); }
}
function hbSnapshot(S){
  let net = 0, adm = 0, gross = 0, tv = 0;
  for (const id in S.hold.cos){ const c = S.hold.cos[id]; if (c.own >= 0.01){ const d = hdDaily(S, id); net += d.net; adm += d.adm; gross += d.gross * d.div; tv += hdStakeVal(S, id); } }
  const sec = {};
  for (const s of HD_SECS){
    const sh = hdShare(S, s.id), eb = hdEmbCount(S, s.id), X = s.id === 'exons';
    let add = X ? (sh > 0 ? 1.2 : 0) + eb * 0.8 : (sh > 0.5 ? 1.2 + (sh - 0.5) * 6 : 0) + eb * 1.5;
    if (add > 0 && hdActiveFines(S).some(f => f.sec === s.id)) add *= X ? 1.25 : 1.5;
    const risk = S.hold.risk[s.id] || 0;
    let rv = 0, n = 0; for (let i = 0; i < S.rivals.length; i++) if (hdRvAlive(S, i)){ rv += hdPass(S, s.id, i); n++; }
    sec[s.id] = { sh, add, risk, days: add > 0 ? Math.max(0, Math.ceil((100 - risk) / add)) : null, me: s.id === 'elec' || s.id === 'exons' ? hdPass(S, s.id, -1) : hdPass(S, s.id, -1), rv: n ? rv / n : 1 };
  }
  return { net, adm, gross, tv, n: hdNStakes(S), sec };
}

/* ---------- Toplu alım planı ---------- */
// Rakip payına ~%60 kabul olasılığı veren fiyat
function hbBidFor(S, id, rv, pct){
  const fair = hdVal(S, id) * pct; let best = null;
  for (let p = 1.0; p <= 2.6 + 1e-9; p += 0.05){ const price = Math.round(fair * p), pr = hdBidProb(S, id, rv, pct, price); best = { rv, pct, price, pr }; if (pr >= HB_BID_P) break; }
  return best;
}
// mode: 'target' (val = hedef pay 0–1) · 'budget' (val = bütçe $) · bids: rakip paylarına teklif hazırla
function hbPlan(S, ids, mode, val, bids){
  hbEnsure(S);
  const H = S.hold, rows = [], heat = { ...S.hb.heat };
  const priceAt = (id, d) => { const sec = HD_BY[id].sec, p = _hbBuyPrice(S, id, d, -1) * (1 + (heat[sec] || 0)); return Math.round(p); };
  const bump = (id, d) => { const sec = HD_BY[id].sec; heat[sec] = Math.min(HB_HEAT_MAX, (heat[sec] || 0) + HB_HEAT_STEP * Math.min(1, d / 0.1 + 0.3)); };
  let cost = 0, esc = 0;
  if (mode === 'budget'){
    // kontrol başına en çok etki: sektör çarpanı × şirket ağırlığı / kontrol maliyeti
    const cand = ids.map(id => { const c = H.cos[id]; if (hdCtl(S, id) === -1) return null; const need = 0.51 - c.own, fl = hdFloat(S, id); if (need <= 0 || fl + 1e-9 < need) return null;
      const co = HD_BY[id], score = HD_SEC[co.sec].mult * Math.max(0.05, co.w); const p = priceAt(id, need); return { id, need, p, eff: score / p }; }).filter(Boolean).sort((a, b) => b.eff - a.eff);
    for (const x of cand){ const p = priceAt(x.id, x.need); if (cost + p > val) continue; cost += p; bump(x.id, x.need); rows.push({ id: x.id, buy: +x.need.toFixed(3), cost: p, to: H.cos[x.id].own + x.need }); }
  } else {
    const t = clamp(val, 0.01, 1);
    for (const id of ids){
      const c = H.cos[id]; let need = Math.round((t - c.own) * 1000) / 1000; if (need < 0.01) continue;
      const fl = Math.floor(hdFloat(S, id) * 1000) / 1000, buy = Math.min(need, fl), row = { id, buy: 0, cost: 0, to: c.own };
      if (buy >= 0.01){ row.buy = buy; row.cost = priceAt(id, buy); bump(id, buy); cost += row.cost; row.to += buy; need = +(need - buy).toFixed(3); }
      if (need >= 0.01 && bids){
        const hs = Object.keys(c.h).map(Number).filter(i => hdRvAlive(S, i) && c.h[i] > 0).sort((a, b) => c.h[b] - c.h[a]);
        row.bids = [];
        for (const i of hs){ if (need < 0.01) break; if (S.hold.bids.some(b => b.id === id && b.rv === i)) continue; const pct = Math.min(need, c.h[i]); if (pct < 0.01) continue;
          const b = hbBidFor(S, id, i, +pct.toFixed(3)); row.bids.push(b); esc += b.price; need = +(need - pct).toFixed(3); }
      }
      if (need >= 0.01) row.short = need;
      if (row.buy || (row.bids && row.bids.length) || row.short) rows.push(row);
    }
  }
  // etki önizlemesi
  const before = hbSnapshot(S);
  const mut = {}; for (const r of rows) mut[r.id] = { own: Math.min(1, r.to) };
  const after = hbWith(S, mut, () => hbSnapshot(S));
  return { mode, val, rows, cost, esc, cashAfter: S.cash - cost - esc, before, after, heat };
}
function hbBuy(S, ids, mode, val, bids){
  const pl = hbPlan(S, ids, mode, val, bids); let n = 0, spent = 0, nb = 0, fail = [];
  for (const r of pl.rows){
    if (r.buy >= 0.01){ const cash0 = S.cash, res = actHoldBuy(S, r.id, r.buy); if (res && res.ok !== false){ n++; spent += cash0 - S.cash; } else fail.push(HD_BY[r.id].name + ': ' + (res && res.msg)); }
    for (const b of r.bids || []){ const res = actHoldBid(S, r.id, b.rv, b.pct, b.price); if (res && res.ok !== false) nb++; else fail.push(HD_BY[r.id].name + ': ' + (res && res.msg)); }
  }
  if (!n && !nb) return R_NO(fail[0] || 'Alınacak pay yok.');
  const H = S.hb; H.st.bought += n; H.st.spent += spent; H.st.bids += nb;
  const secs = [...new Set(pl.rows.filter(r => r.buy).map(r => HD_BY[r.id].sec))];
  const t = `Toplu alım: ${n} şirkette pay alındı (${fmtMoney(spent)})${nb ? `, ${nb} rakibe teklif verildi` : ''}.`;
  log(S, t, 'good'); hdEv(S, t); hbOp(S, t);
  if (n >= 3) hbReact(S, secs, n);
  return R_OK(t + (fail.length ? ` ${fail.length} işlem yapılamadı.` : ''));
}
// Toplu alımın yankısı: rakipler sektörde serbest payı kapar, gündem oluşur
function hbReact(S, secs, n){
  const H = S.hold;
  for (const sec of secs){
    const live = S.rivals.map((r, i) => i).filter(i => hdRvAlive(S, i)).sort((a, b) => ((HD_AFF[(RIVAL_AI[b] || {}).pers] || {})[sec] || 0) - ((HD_AFF[(RIVAL_AI[a] || {}).pers] || {})[sec] || 0)).slice(0, 2);
    for (const i of live){
      if (rnd(S) > 0.5) continue;
      const pool = HD_LIST[sec].filter(c => hdCtl(S, c.id) !== -1 && hdFloat(S, c.id) >= 0.05); if (!pool.length) continue;
      const c = pickArr(S, pool), st = H.cos[c.id], d = Math.min(hdFloat(S, c.id), Math.round(rr(S, 0.05, 0.12) * 100) / 100), price = hdBuyPrice(S, c.id, d, i), rv = S.rv[i];
      if (d >= 0.01 && rv && price <= rv.c * 0.3){ rv.c -= price; st.h[i] = +((st.h[i] || 0) + d).toFixed(4); hdBump(S); const t = `${RIVALS[i].name} karşı hamle yaptı: ${c.name} şirketinde ${hdPctStr(d)} pay aldı.`; log(S, t, 'rival'); hdEv(S, t); hbOp(S, t); }
    }
  }
  if (typeof smShift === 'function' && S.sm){
    try {
      smShift(S, { t: -Math.min(4, n * 0.5) }, `Tedarik zincirinde toplu satın alma (${n} şirket)`, ['med', 'eth', 'inv'], true);
      smAgPush(S, { id: 'hb:' + Math.floor(S.day / 15), tag: smTag(S.brand + ' Tedarik Zinciri'), n: 'Tedarik zinciri alımları', t: 't', pol: -1, heat: 18 + n * 4 });
      if (n >= 5) addPost(S, { a: newsAuthor(S), title: `${S.brand} Labs tedarik zincirinde ${n} şirkete birden ortak oldu`, text: `Analistler hamlenin GPU, bellek ve enerji fiyatlarını etkileyebileceğini söylüyor. Rekabet Kurumu'nun dosyayı inceleyip incelemeyeceği merak konusu.`, topic: 'general', ctx: { b: S.brand }, tag: smTag(S.brand + ' Tedarik Zinciri'), nComments: 3 });
    } catch (e) {}
  }
}
function hbSell(S, ids, target){
  let n = 0, gain = 0;
  for (const id of ids){ const c = S.hold.cos[id]; const d = +(c.own - target).toFixed(3); if (d < 0.01) continue; const g0 = S.cash, r = actHoldSell(S, id, target <= 0 ? 1 : d); if (r && r.ok !== false){ n++; gain += S.cash - g0; } }
  if (!n) return R_NO('Satılacak pay yok.');
  const t = `Toplu satış: ${n} şirket, +${fmtMoney(gain)}.`; hbOp(S, t); hdEv(S, t); return R_OK(t);
}
function hbSellPreview(S, ids, target){ let g = 0, n = 0; for (const id of ids){ const c = S.hold.cos[id], d = c.own - target; if (d >= 0.01){ g += hdSellGain(S, id, target <= 0 ? c.own : d); n++; } } return { gain: g, n }; }

/* ---------- Politika şablonları ---------- */
function hbTplOf(S, k){ return HB_TPL[k] || (S.hb && S.hb.tpl[k]); }
function hbTopRivals(S, n){ return S.rivals.map((r, i) => i).filter(i => hdRvAlive(S, i)).sort((a, b) => S.rivals[b].q - S.rivals[a].q).slice(0, n); }
function hbTplMut(S, ids, T){
  const mut = {};
  for (const id of ids){
    if (hdCtl(S, id) !== -1) continue; const c = S.hold.cos[id], sec = HD_BY[id].sec, m = {};
    for (const k in T.m){ if (k === 'ql' && sec !== 'gpu') continue; const r = HD_KEYS[k]; m[k] = clamp(T.m[k], r[0], r[1]); }
    let emb = null;
    if (T.emb > 0 && sec !== 'exons'){ emb = { ...c.m.emb }; for (const i of hbTopRivals(S, T.emb)) if (!emb[i] && !((c.m.cool[i] || 0) > S.day) && Object.values(emb).filter(u => u > S.day).length < 3) emb[i] = S.day + HD_DAYS.emb; }
    if (T.emb < 0) emb = {};
    mut[id] = { m, ...(emb ? { emb } : {}) };
  }
  return mut;
}
function hbTplPreview(S, ids, k){
  const T = hbTplOf(S, k); if (!T) return null;
  const mut = hbTplMut(S, ids, T), n = Object.keys(mut).length;
  return { n, before: hbSnapshot(S), after: n ? hbWith(S, mut, () => hbSnapshot(S)) : hbSnapshot(S) };
}
function hbApplyTpl(S, ids, k){
  const T = hbTplOf(S, k); if (!T) return R_NO('Şablon yok.');
  const mut = hbTplMut(S, ids, T); let n = 0, ne = 0;
  for (const id in mut){
    const x = mut[id]; for (const key in x.m) actHoldSet(S, id, key, x.m[key]);
    const c = S.hold.cos[id];
    if (x.emb){ const want = new Set(Object.keys(x.emb).filter(i => x.emb[i] > S.day).map(Number)), have = Object.keys(c.m.emb).filter(i => c.m.emb[i] > S.day).map(Number);
      for (const i of have) if (!want.has(i)){ actHoldEmbargo(S, id, i); ne++; }
      for (const i of want) if (!have.includes(i)){ const r = actHoldEmbargo(S, id, i); if (r && r.ok !== false) ne++; } }
    c.m.tpl = k; n++;
  }
  if (!n) return R_NO('Seçilenler arasında kontrolün olan şirket yok (%51).');
  const t = `"${T.n}" politikası ${n} şirkete uygulandı${ne ? ` (${ne} ambargo değişikliği)` : ''}.`; hbOp(S, t); hdEv(S, t); return R_OK(t);
}
function hbSaveTpl(S, id, name){
  const c = S.hold.cos[id]; if (!c) return R_NO('Şirket yok.');
  const H = hbEnsure(S), k = 'u' + (Object.keys(H.tpl).length + 1);
  if (Object.keys(H.tpl).length >= 6) return R_NO('En fazla 6 özel şablon.');
  H.tpl[k] = { n: String(name || 'Şablonum ' + (Object.keys(H.tpl).length + 1)).slice(0, 24), d: HD_BY[id].name + ' ayarlarından', m: { sp: c.m.sp, rp: c.m.rp, qt: c.m.qt, dv: c.m.dv, ql: c.m.ql } };
  return R_OK(`Şablon kaydedildi: ${H.tpl[k].n}`);
}

/* ---------- Toplu ambargo ve yatırım ---------- */
function hbEmbargo(S, ids, rv, on){
  let n = 0, why = '';
  for (const id of ids){ if (hdCtl(S, id) !== -1 || HD_BY[id].sec === 'exons') continue; const c = S.hold.cos[id], is = hdEmbOn(S, c, rv); if (is === on) continue; const r = actHoldEmbargo(S, id, rv); if (r && r.ok !== false) n++; else why = r && r.msg; }
  if (!n) return R_NO(why || 'Uygun şirket yok.');
  const t = `${RIVALS[rv].name}: ${n} şirkette ambargo ${on ? 'başlatıldı' : 'kaldırıldı'}.`; hbOp(S, t); return R_OK(t);
}
function hbInvest(S, ids, tier){
  let n = 0, cost = 0, why = '';
  for (const id of ids){ if (hdCtl(S, id) !== -1) continue; const c0 = S.cash, r = actHoldInvest(S, id, tier); if (r && r.ok !== false){ n++; cost += c0 - S.cash; } else why = r && r.msg; }
  if (!n) return R_NO(why || 'Uygun şirket yok.');
  const t = `Kapasite yatırımı: ${n} şirket, ${fmtMoney(cost)}.`; hbOp(S, t); return R_OK(t);
}
function hbInvestCost(S, ids, tier){ let c = 0, n = 0; for (const id of ids) if (hdCtl(S, id) === -1){ c += hdInvCost(S, id, tier); n++; } return { cost: c, n }; }

/* ---------- Kâr içte tutma → kapasite (kâr aktarımı ayarına anlam kazandırır) ---------- */
function hbRetainDaily(S){
  for (const id in S.hold.cos){
    if (hdCtl(S, id) !== -1) continue; const c = S.hold.cos[id], m = c.m; if (m.dv >= 0.999) continue;
    const d = hdDaily(S, id); m.rf = (m.rf || 0) + d.gross * (1 - m.dv);
    const need = hdInvCost(S, id, 0);
    if (m.rf >= need && m.inv.filter(x => x.at > S.day).length < 3){ m.rf -= need; m.inv.push({ at: S.day + HD_INV[0].days, add: HD_INV[0].add * 0.75 }); hdBump(S); hdEv(S, `${HD_BY[id].name}: içte tutulan kârla kapasite yatırımı başladı`); }
  }
}

/* ---------- Gelen teklif kuralları ---------- */
function hbRulesDaily(S){
  const R = S.hb.rule; if (!R.on) return;
  const H = S.hold;
  for (let k = H.offers.length - 1; k >= 0; k--){
    const o = H.offers[k], fair = hdVal(S, o.id) * o.pct, x = o.price / Math.max(1, fair);
    const keepCtl = hdCtl(S, o.id) === -1 && H.cos[o.id].own - o.pct < 0.51;
    if (x >= R.acc && !keepCtl){ const r = actHoldOffer(S, k, true); if (r.ok !== false) hbOp(S, `Kural: ${RIVALS[o.rv].name} teklifi kabul edildi (${HD_BY[o.id].name}, değerin ${x.toFixed(2).replace('.', ',')} katı)`); }
    else if (x <= R.rej || keepCtl){ actHoldOffer(S, k, false); hbOp(S, `Kural: ${RIVALS[o.rv].name} teklifi reddedildi (${HD_BY[o.id].name}${keepCtl ? ', kontrol korunuyor' : ''})`); }
  }
  for (let k = H.counters.length - 1; k >= 0; k--){
    const b = H.counters[k], fair = hdVal(S, b.id) * b.pct, x = b.price / Math.max(1, fair);
    if (x <= R.ctr){ const r = actHoldCounter(S, k, true); if (r.ok !== false) hbOp(S, `Kural: karşı teklif kabul edildi (${HD_BY[b.id].name})`); }
    else { actHoldCounter(S, k, false); hbOp(S, `Kural: pahalı karşı teklif reddedildi (${HD_BY[b.id].name})`); }
  }
}

/* ---------- Otomatik holding yöneticisi ---------- */
function hbAutoFee(S){ return S.hold ? S.hold.tv * HB_AUTO_FEE : 0; }
function hbAutoLog(S, t){ const A = S.hb.auto; A.log.unshift({ d: S.day, t }); if (A.log.length > 16) A.log.length = 16; S.hb.st.auto++; }
function hbAutoDaily(S){
  const A = S.hb.auto; if (!A.on || !S.hold.on) return;
  const fee = hbAutoFee(S); if (fee > 0){ S.cash -= fee; if (typeof addExtra === 'function') addExtra(S, 'hbauto', 'Holding yöneticisi', -fee); }
  if (S.day < A.next) return; A.next = S.day + 7;
  const H = S.hold, spare = () => S.cash - A.cashMin;
  // 1) kontrol savunması
  if (A.defend) for (const id in H.cos){
    if (hdCtl(S, id) !== -1) continue; const c = H.cos[id], t = hdTop(c);
    if (t && t.s >= 0.25 && c.own < 0.6){ const d = Math.min(hdFloat(S, id), +(0.6 - c.own).toFixed(3)); if (d >= 0.01){ const p = hdBuyPrice(S, id, d, -1); if (p <= spare() * 0.25){ const r = actHoldBuy(S, id, d); if (r.ok !== false) hbAutoLog(S, `${HD_BY[id].name}: ${RIVALS[t.i].name} %${Math.round(t.s * 100)} topladı, kontrol savunuldu (+${hdPctStr(d)}, ${fmtMoney(p)})`); } } }
  }
  // 2) ceza riski
  if (A.risk) for (const s of HD_SECS){
    if ((H.risk[s.id] || 0) < 70) continue; let ch = 0;
    for (const c of HD_LIST[s.id]){ if (hdCtl(S, c.id) !== -1) continue; const m = H.cos[c.id].m;
      for (const k of Object.keys(m.emb)) if (m.emb[k] > S.day){ actHoldEmbargo(S, c.id, +k); ch++; }
      if (m.rp > 1.1){ actHoldSet(S, c.id, 'rp', 1.1); ch++; } }
    if (ch) hbAutoLog(S, `${s.short}: soruşturma riski %${Math.round(H.risk[s.id])}, ${ch} ayar yumuşatıldı`);
  }
  // 3) kâr aktarımı: nakit alt sınırın altına inerse içte tutulan kâr serbest bırakılır
  if (A.payout && S.cash < A.cashMin + 1){
    let ch = 0; for (const id in H.cos){ if (hdCtl(S, id) !== -1) continue; const m = H.cos[id].m; if (m.dv < 0.999){ actHoldSet(S, id, 'dv', 1); ch++; } }
    if (ch) hbAutoLog(S, `Nakit alt sınırın altında: ${ch} şirkette kârın tamamı aktarılıyor`);
  }
  // 4) darboğaz: senin maliyetin yüksek sektörde kapasite
  if (A.cap){
    const worst = HD_SECS.filter(s => s.id !== 'elec' && s.id !== 'exons').map(s => ({ s, sup: hdSup(S, s.id) })).sort((a, b) => a.sup - b.sup)[0];
    if (worst && worst.sup < 1.05){ const c = HD_LIST[worst.s.id].filter(c => hdCtl(S, c.id) === -1 && S.hold.cos[c.id].m.inv.filter(x => x.at > S.day).length < 2).sort((a, b) => b.w - a.w)[0];
      if (c){ const cost = hdInvCost(S, c.id, 0); if (cost <= spare() * 0.2){ const r = actHoldInvest(S, c.id, 0); if (r.ok !== false) hbAutoLog(S, `${c.name}: ${worst.s.short} arzı dar, kapasite +%20 (${fmtMoney(cost)})`); } } }
  }
}

/* ---------- Günlük döngü ---------- */
const _hbTick = tick;
tick = function(S){
  const d0 = S.day; const r = _hbTick(S);
  if (S.day !== d0 && S.hold){
    hbEnsure(S);
    try {
      for (const k in S.hb.heat){ S.hb.heat[k] *= HB_HEAT_DECAY; if (S.hb.heat[k] < 0.002) delete S.hb.heat[k]; }
      hbRetainDaily(S); hbRulesDaily(S); hbAutoDaily(S);
    } catch (e) { if (typeof globalThis !== 'undefined' && globalThis.__hbDebug) throw e; S.hb.err = (e && e.message) || 'hata'; }
  }
  return r;
};
const _hbNewGame = newGame;
newGame = function(a, b){ const S = _hbNewGame(a, b); if (S) S.hb = hbState(); return S; };
if (typeof MIGRATIONS !== 'undefined') MIGRATIONS.push(st => { if (st && st.hold) hbEnsure(st); });
if (typeof module !== 'undefined' && module.exports) Object.assign(module.exports, { hbPlan, hbBuy, hbSell, hbApplyTpl, hbTplPreview, hbEmbargo, hbInvest, hbSnapshot });
