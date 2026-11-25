/* ============================================================
   COMPUTE EMPIRE v13 — LABORATUVAR SATIN ALMA VE İŞTİRAKLER (LAB) + RAKİP BİRLEŞMELERİ
   Satın alınan laboratuvar artık silinmez. Politika:
     ind  · Bağımsız marka: simülasyonda yaşar, kâr/zarar sana yansır, AGI'ye ulaşırsa zafer senin
     int  · Entegre et: 45 günde kadro, kullanıcı, nakit ve Ar-Ge sana geçer (kültür kaybıyla)
     strip· Parçala: nakit + varlık satışı hemen; itibar ve kamuoyu bedeli
   İlk 3'teki laboratuvarlar da alınabilir ama Rekabet Kurumu incelemesinden geçer.
   Rakipler de birbirini satın alır. Durum: S.lab
   ============================================================ */
const LAB_INT_DAYS = 45, LAB_REVIEW_DAYS = 30, LAB_MERGE_MAX = 6;
function labState(){ return { v: 1, subs: {}, pend: [], log: [], merges: 0, nextM: 120 }; }
function labEnsure(S){ if (!S.lab || S.lab.v !== 1) S.lab = labState(); const b = labState(); for (const k in b) if (!(k in S.lab)) S.lab[k] = b[k]; return S.lab; }
const labOwned = (S, i) => !!(S.lab && S.lab.subs[i]);
function labLog(S, t, k){ const L = labEnsure(S); L.log.unshift({ d: S.day, t }); if (L.log.length > 20) L.log.length = 20; log(S, t, k || 'info'); }
function labAlive(S, i){ const r = S.rivals[i]; return r && !r.acq && !(S.rv && S.rv[i] && S.rv[i].dead); }
function labRank(S, i){ return S.rivals.map((r, k) => k).filter(k => labAlive(S, k) && !labOwned(S, k)).sort((a, b) => S.rivals[b].q - S.rivals[a].q).indexOf(i); }
function labBase(S, i){ const r = S.rivals[i]; return Math.max(rivalValue(S, i), Math.round(1.5e6 * Math.pow(1 + S.day / 300, 2) * Math.max(0.3, (r.q || 100) / 300))); }
function labPrice(S, i){
  const rk = labRank(S, i), rv = S.rv && S.rv[i];
  const prem = rk === 0 ? 2.2 : rk >= 0 && rk < 3 ? 1.6 : 1.3;
  return Math.round(labBase(S, i) * prem + Math.max(0, rv ? rv.c : 0) * 0.9 + (rv ? rv.fv * 0.4 : 0));
}
function labCheck(S, i){
  labEnsure(S);
  if (!labAlive(S, i)) return { ok: false, why: 'Bu laboratuvar artık bağımsız değil.' };
  if (labOwned(S, i)) return { ok: false, why: 'Zaten senin iştirakin.' };
  if (S.lab.pend.some(p => p.i === i)) return { ok: false, why: 'Bu laboratuvar için inceleme sürüyor.' };
  const cost = labPrice(S, i), rk = labRank(S, i), review = rk >= 0 && rk < 3;
  if (S.cash < cost) return { ok: false, cost, review, why: `${fmtMoney(cost)} nakit gerekli.` };
  if (valuation(S) < cost * 1.2) return { ok: false, cost, review, why: `Değerlemen en az ${fmtMoney(cost * 1.2)} olmalı.` };
  const ints = Object.values(S.lab.subs).filter(s => s.pol === 'int').length;
  return { ok: true, cost, review, ints, appr: review ? labApproval(S) : 1 };
}
function labApproval(S){ const n = Object.keys(S.lab.subs).length; const lead = S.models.length && bestScore(S) >= topRivalScore(S); return clamp(0.8 - 0.12 * n - (lead ? 0.2 : 0), 0.1, 0.8); }
// canAcquire / actAcquire eski arayüzle uyumlu kalır (Pazar tablosundaki buton)
canAcquire = function(S, i){ const c = labCheck(S, i); return { ok: c.ok, cost: c.cost, why: c.why }; };
actAcquire = function(S, i){ return actLabBuy(S, i, 'ind'); };
function actLabBuy(S, i, pol){
  i = +i; if (!['ind', 'int', 'strip'].includes(pol)) return R_NO('Geçersiz politika.');
  const c = labCheck(S, i); if (!c.ok) return R_NO(c.why);
  if (pol === 'int' && c.ints >= 2) return R_NO('Aynı anda en fazla 2 entegrasyon yürütülebilir.');
  S.cash -= c.cost;
  if (c.review){
    S.lab.pend.push({ i, pol, cost: c.cost, until: S.day + LAB_REVIEW_DAYS, p: c.appr });
    labLog(S, `${RIVALS[i].name} için ${fmtMoney(c.cost)} teklif onaylandı; Rekabet Kurumu ${LAB_REVIEW_DAYS} gün inceleyecek (onay ihtimali %${Math.round(c.appr * 100)}). Tutar bloke edildi.`, 'info');
    if (S.social) try { addPost(S, { a: newsAuthor(S), title: `${S.brand} Labs, ${TR.ek(RIVALS[i].name, 'i')} satın almak istiyor`, text: `Sektörün en büyüklerinden birine yönelik teklif Rekabet Kurumu incelemesine takıldı.`, topic: 'general', ctx: { b: S.brand }, tag: smTag(S.brand + ' ' + RIVALS[i].name), nComments: 3 }); } catch (e) {}
    return R_OK(`Teklif incelemede: ${LAB_REVIEW_DAYS} gün.`);
  }
  return labClose(S, i, pol, c.cost);
}
function labClose(S, i, pol, cost){
  const L = labEnsure(S), R = RIVALS[i];
  L.subs[i] = { pol: 'ind', d: S.day, cost, div: 0.5, prof: 0 };
  S.stats.acq = (S.stats.acq || 0) + 1; S.hype = Math.min(100, S.hype + 8);
  labLog(S, `${R.name} ${TR.ek(fmtMoney(cost), 'e')} satın alındı.`, 'good');
  if (typeof smShift === 'function' && S.sm) try { smShift(S, { q: 2, t: -1.5 }, `${R.name} satın alındı`, ['inv', 'med', 'dev'], true); smAgPush(S, { id: 'lab:' + i, tag: smTag(S.brand + ' ' + R.name), n: R.name + ' satın alımı', t: 'q', pol: 0, heat: 30 }); } catch (e) {}
  if (pol !== 'ind') return actLabPolicy(S, i, pol);
  return R_OK(`${R.name} artık iştirakin (bağımsız marka).`);
}
function actLabPolicy(S, i, pol){
  const L = labEnsure(S), s = L.subs[i]; if (!s) return R_NO('İştirak bulunamadı.');
  if (s.pol !== 'ind') return R_NO('Bu iştirakte süreç başladı, değiştirilemez.');
  const R = RIVALS[i], rv = S.rv[i], r = S.rivals[i];
  if (pol === 'int'){
    if (Object.values(L.subs).filter(x => x.pol === 'int').length >= 2) return R_NO('Aynı anda en fazla 2 entegrasyon.');
    s.pol = 'int'; s.start = S.day; s.end = S.day + LAB_INT_DAYS; s.loss = 0;
    labLog(S, `${R.name} entegrasyonu başladı (${LAB_INT_DAYS} gün).`, 'info');
    return R_OK(`${R.name}: entegrasyon başladı.`);
  }
  if (pol === 'strip'){
    const gain = Math.round(Math.max(0, rv.c) + rv.fv * 0.55);
    S.cash += gain; S.rep = Math.max(0, S.rep - 3);
    labEnd(S, i);
    labLog(S, `${R.name} parçalandı: nakit ve donanım satışıyla +${fmtMoney(gain)}. Çalışanlar ve kullanıcılar dağıldı.`, 'bad');
    if (typeof smShift === 'function' && S.sm) try { smShift(S, { t: -4, q: -1 }, `${R.name} parçalanıp kapatıldı`, null, true); } catch (e) {}
    if (S.social) try { addPost(S, { a: newsAuthor(S), title: `${S.brand} Labs, satın aldığı ${TR.ek(R.name, 'i')} kapattı`, text: `Varlıklar satıldı, ekip dağıtıldı. Kullanıcılar alternatif arıyor.`, topic: 'crisis', ctx: { b: S.brand }, mood: -0.6, nComments: 4 }); } catch (e) {}
    return R_OK(`+${fmtMoney(gain)}`);
  }
  if (pol === 'div0' || pol === 'div5' || pol === 'div1'){ s.div = { div0: 0, div5: 0.5, div1: 1 }[pol]; return R_OK('Kâr aktarımı güncellendi.'); }
  return R_NO('Geçersiz.');
}
function labEnd(S, i){
  const r = S.rivals[i], rv = S.rv[i];
  r.acq = true; r.by = -1; rv.c = 0; rv.fl = {}; rvStat(rv); rv.job = null;
  delete S.lab.subs[i];
  if (S.hold) for (const id in S.hold.cos){ const c = S.hold.cos[id]; if (c.h[i]){ c.own = Math.min(1, +(c.own + c.h[i]).toFixed(4)); delete c.h[i]; } }
  if (typeof hdBump === 'function' && S.hold) hdBump(S);
}
function labIntegrate(S, i){
  const s = S.lab.subs[i], r = S.rivals[i], rv = S.rv[i], R = RIVALS[i], keep = 1 - (s.loss || 0);
  const res = Math.round(rv.res * 0.6 * keep), eng = Math.round(rv.eng * 0.6 * keep);
  S.staff.res += res; S.staff.eng += eng;
  const users = (r.users || 0) * 0.5 * keep, served = S.slots.some(x => x >= 0);
  if (served){ const tot = Math.max(1, S.seg[0] + S.seg[1] + S.seg[2]); for (let k = 0; k < 3; k++) S.seg[k] += users * (S.seg[k] / tot || 1 / 3); }
  const cash = Math.round(Math.max(0, rv.c) + rv.fv * 0.6);
  S.cash += cash; S.rp = (S.rp || 0) + Math.round((rv.rp || 0) * 0.5);
  labEnd(S, i);
  if (typeof recompute === 'function') recompute(S);
  labLog(S, `${R.name} entegrasyonu tamamlandı: +${res} araştırmacı, +${eng} mühendis${served ? `, +${fmtShort(users)} kullanıcı` : ''}, +${fmtMoney(cash)} (nakit ve donanım satışı).`, 'good');
}
function labDaily(S){
  const L = labEnsure(S);
  // inceleme sonuçları
  for (let k = L.pend.length - 1; k >= 0; k--){
    const p = L.pend[k]; if (S.day < p.until) continue; L.pend.splice(k, 1);
    if (!labAlive(S, p.i)){ S.cash += p.cost; labLog(S, `${RIVALS[p.i].name} artık satılık değil; tutar iade edildi.`); continue; }
    if (rnd(S) < p.p){ labLog(S, `Rekabet Kurumu ${RIVALS[p.i].name} satın alımını onayladı.`, 'good'); labClose(S, p.i, p.pol, p.cost); }
    else { S.cash += p.cost; labLog(S, `Rekabet Kurumu ${RIVALS[p.i].name} satın alımını reddetti; tutar iade edildi.`, 'bad'); if (typeof smShift === 'function' && S.sm) try { smShift(S, { t: -1 }, 'Satın alma Rekabet Kurumu\'ndan döndü', ['med', 'inv'], true); } catch (e) {} }
  }
  for (const k in L.subs){
    const i = +k, s = L.subs[k], rv = S.rv[i], r = S.rivals[i];
    if (!rv || rv.dead){ delete L.subs[k]; labLog(S, `İştirakin ${RIVALS[i].name} iflas etti.`, 'bad'); continue; }
    if (s.pol === 'ind'){
      // birleşik kâr/zarar: kârın payı sana, zarar senden
      const pr = (rv.rev || 0) - (rv.cost || 0);
      if (pr > 0 && s.div > 0){ const x = pr * s.div; rv.c -= x; S.cash += x; s.prof += x; if (typeof addExtra === 'function') addExtra(S, 'labdiv', 'İştirak kârı', x); }
      if (rv.c < 0){ const x = -rv.c; rv.c = 0; S.cash -= x; s.prof -= x; if (typeof addExtra === 'function') addExtra(S, 'labloss', 'İştirak zararı', -x); }
      // iştirak AGI'ye ulaşırsa zafer senin
      if (r.q >= AGI_SCORE && !S.won && !S.rivalAgi){ S.won = true; S.wonDay = S.day; r.agi = true; labLog(S, `İştirakin ${RIVALS[i].name} AGI'ye ulaştı. Zafer senin!`, 'good'); }
    } else if (s.pol === 'int'){
      if (rnd(S) < 0.02){ s.loss = Math.min(0.4, (s.loss || 0) + 0.1); labLog(S, `${RIVALS[i].name}: kilit çalışanlar ayrıldı (entegrasyon kaybı %${Math.round(s.loss * 100)}).`, 'bad'); }
      if (S.day >= s.end) labIntegrate(S, i);
    }
  }
  if (S.day >= L.nextM) labMerges(S);
}
/* ---------- Rakip birleşmeleri ---------- */
function labMerges(S){
  const L = S.lab; L.nextM = S.day + 30 + Math.floor(rnd(S) * 40);
  if (L.merges >= LAB_MERGE_MAX || rnd(S) > 0.45) return;
  const live = S.rivals.map((r, i) => i).filter(i => labAlive(S, i) && !labOwned(S, i));
  if (live.length <= 8) return;
  const byQ = live.slice().sort((a, b) => S.rivals[b].q - S.rivals[a].q);
  const buyers = byQ.slice(0, 6).filter(i => ['leader', 'counter', 'cheap'].includes((RIVAL_AI[i] || {}).pers));
  for (const a of buyers){
    const ra = S.rivals[a], va = S.rv[a];
    const tg = byQ.slice(3).filter(t => t !== a && S.rivals[t].q < ra.q * 0.8 && !S.lab.pend.some(p => p.i === t));
    if (!tg.length) continue;
    const t = pickArr(S, tg), price = Math.round(labBase(S, t) * 1.2);
    if (va.c < price * 1.1) continue;
    const rt = S.rivals[t], vt = S.rv[t];
    va.c -= price; ra.users = (ra.users || 0) + (rt.users || 0) * 0.6;
    for (const g in vt.fl) rvAddGpu(va, +g, Math.round(vt.fl[g] * 0.7));
    va.res += Math.round(vt.res * 0.5); va.eng += Math.round(vt.eng * 0.5);
    if (S.hold) for (const id in S.hold.cos){ const c = S.hold.cos[id]; if (c.h[t]){ c.h[a] = +((c.h[a] || 0) + c.h[t]).toFixed(4); delete c.h[t]; } }
    rt.acq = true; rt.by = a; vt.c = 0; vt.fl = {}; rvStat(vt); vt.job = null;
    L.merges++;
    const txt = `${RIVALS[a].name}, ${TR.ek(RIVALS[t].name, 'i')} ${TR.ek(fmtMoney(price), 'e')} satın aldı.`;
    labLog(S, txt, 'rival'); if (typeof notify === 'function') notify(S, txt, 'deal');
    if (S.social) try { addPost(S, { a: newsAuthor(S), title: txt, text: `Pazar konsolide oluyor: ${RIVALS[a].name} kullanıcı tabanını ve GPU filosunu büyüttü.`, topic: 'rival', ctx: smFacts(S, null).v, tag: smTag(RIVALS[a].name + ' ' + RIVALS[t].name), nComments: 3, reach: 1.4 }); } catch (e) {}
    if (S.hold && typeof hdBump === 'function') hdBump(S);
    return;
  }
}
/* ---------- Kancalar: iştirakler sana saldırmaz, AGI zaferi senin ---------- */
function labHideOwned(S, fn){
  if (!S || !S.lab) return fn();
  const ids = Object.keys(S.lab.subs).map(Number), was = ids.map(i => S.rivals[i].acq);
  ids.forEach(i => { S.rivals[i].acq = true; });
  try { return fn(); } finally { ids.forEach((i, k) => { S.rivals[i].acq = was[k]; }); }
}
if (typeof s3JabSpawn === 'function'){ const _f = s3JabSpawn; s3JabSpawn = function(S){ return labHideOwned(S, () => _f(S)); }; }
if (typeof roThreat === 'function'){ const _f = roThreat; roThreat = function(S, i, kind){ if (labOwned(S, i)) return null; return _f(S, i, kind); }; }
if (typeof RV_MONTHLY !== 'undefined') for (let k = 0; k < RV_MONTHLY.length; k++){ const f = RV_MONTHLY[k]; RV_MONTHLY[k] = (S, i) => labOwned(S, i) ? undefined : f(S, i); }
if (typeof rivalsTick === 'function'){ const _f = rivalsTick; rivalsTick = function(S){ if (S.lab) for (const k in S.lab.subs){ const r = S.rivals[+k]; if (r && r.q >= AGI_SCORE && !S.won && !S.rivalAgi){ S.won = true; S.wonDay = S.day; r.agi = true; labLog(S, `İştirakin ${RIVALS[+k].name} AGI'ye ulaştı. Zafer senin!`, 'good'); } } return _f(S); }; }
const _labTick = tick;
tick = function(S){ const d0 = S.day; const r = _labTick(S); if (S.day !== d0 && S.rv){ try { labDaily(S); } catch (e) { if (typeof globalThis !== 'undefined' && globalThis.__labDebug) throw e; labEnsure(S).err = e && e.message; } } return r; };
const _labNewGame = newGame;
newGame = function(a, b){ const S = _labNewGame(a, b); if (S) S.lab = labState(); return S; };
if (typeof MIGRATIONS !== 'undefined') MIGRATIONS.push(st => { if (st && st.rivals) labEnsure(st); });
if (typeof module !== 'undefined' && module.exports) Object.assign(module.exports, { labCheck, labPrice, actLabBuy, actLabPolicy, labDaily });
