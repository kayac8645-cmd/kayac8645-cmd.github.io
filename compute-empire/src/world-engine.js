/* ============================================================
   COMPUTE EMPIRE v13 — YENİ SİSTEMLER (WD)
   1) Yetenek pazarı: rakiplerdeki yıldız araştırmacılara transfer teklifi
   2) Devlet ihaleleri: bölgesel, kapalı zarflı, şartlı, SLA'lı uzun sözleşmeler + ihracat kısıtları
   3) Veri pazarı: lisanslı / gri / sentetik / kullanıcı verisi; kalite, dava ve güven etkileri
   4) Kampanya: 5 bölümlük hikâye, ilerleme tarayıcıda saklanır
   Durum: S.wd
   ============================================================ */
function wdState(){ return { v: 1, tr: { cd: {}, log: [] }, tn: { list: [], act: [], next: 150, seq: 0, won: 0, lost: 0, exp: [] , nextX: 260 }, data: { lic: {}, hist: [] } }; }
function wdEnsure(S){ if (!S.wd || S.wd.v !== 1) S.wd = wdState(); const b = wdState(); for (const k in b) if (!(k in S.wd)) S.wd[k] = b[k]; for (const k in b.tn) if (!(k in S.wd.tn)) S.wd.tn[k] = b.tn[k]; return S.wd; }
const wdScale = S => Math.pow(1 + S.day / 200, 1.6);

/* ---------- 1) Yetenek pazarı ---------- */
// Yıldız rakipteyse (ayrılmış ya da hiç bizde çalışmamış) teklif verilebilir
function wdStarAt(S, s){
  const z = S.lc && S.lc.stars[s.id];
  if (z && z.s === 'hired') return -2;
  if (z && z.rv != null && labAlive(S, z.rv)) return z.rv;
  const live = S.rivals.map((r, i) => i).filter(i => labAlive(S, i)); if (!live.length) return -1;
  return live[hashStr(s.id + (S.lc && S.lc.v)) % live.length];
}
function wdStarList(S){
  if (!S.lc || typeof LC_STARS === 'undefined') return [];
  const offered = new Set((S.lc.offers || []).map(o => o.id));
  return LC_STARS.filter(s => S.day >= (s.d || 0) * 0.6 && !offered.has(s.id)).map(s => ({ s, at: wdStarAt(S, s) })).filter(x => x.at >= 0);
}
// teklif: imza primi çarpanı (1–3 × normal prim) ve maaş çarpanı (1–1,6)
function wdPoachProb(S, s, at, bonusX, salX){
  const pers = (RIVAL_AI[at] || {}).pers, loy = pers === 'leader' ? 0.25 : pers === 'open' ? 0.15 : 0.05;
  const lead = S.models.length && bestScore(S) >= S.rivals[at].q ? 0.12 : -0.05;
  const mor = S.lc ? (S.lc.mor - 60) / 200 : 0;
  return clamp(0.12 + (bonusX - 1) * 0.18 + (salX - 1) * 0.6 + lead + mor - loy, 0.03, 0.9);
}
function wdPoachCost(S, s, bonusX){ return Math.round(lcBonus(s) * bonusX * (1 + S.day / 800)); }
function actWdPoach(S, id, bonusX, salX){
  wdEnsure(S); const s = LC_STAR_BY_ID[id]; if (!s) return R_NO('Kişi bulunamadı.');
  const at = wdStarAt(S, s); if (at < 0) return R_NO('Bu kişi şu an teklif alamaz.');
  if (lcHired(S).length >= LC_MAX_STARS) return R_NO(`En fazla ${LC_MAX_STARS} yıldız çalışabilir.`);
  if ((S.wd.tr.cd[id] || 0) > S.day) return R_NO(`${S.wd.tr.cd[id] - S.day} gün sonra yeniden teklif verebilirsin.`);
  const cost = wdPoachCost(S, s, bonusX); if (S.cash < cost) return R_NO(`İmza primi için ${fmtMoney(cost)} gerekli.`);
  const p = wdPoachProb(S, s, at, bonusX, salX);
  if (rnd(S) < p){
    S.cash -= cost; S.lc.stars[id] = { s: 'hired', loy: 55 + (salX - 1) * 60, day: S.day, mult: salX };
    const rv = S.rv && S.rv[at]; if (rv){ rv.res = Math.max(1, rv.res - 2); rv.rp *= 0.9; }
    const t = `${s.n}, ${RIVALS[at].name}'den transfer edildi (${fmtMoney(cost)} imza primi).`;
    S.wd.tr.log.unshift({ d: S.day, t }); log(S, t, 'good');
    if (S.ro && S.ro.host) S.ro.host[at] = (S.ro.host[at] || 0) + 1;
    if (S.social) try { addPost(S, { a: newsAuthor(S), title: `${s.n} ${TR.ek(S.brand + ' Labs', 'e')} geçti`, text: `${RIVALS[at].name} için ciddi bir kayıp. ${s.bio}`, topic: 'general', ctx: { b: S.brand }, tag: smTag(s.n), nComments: 3, mood: 0.4 }); } catch (e) {}
    return R_OK(t);
  }
  S.cash -= Math.round(cost * 0.05); S.wd.tr.cd[id] = S.day + 60;
  const t = `${s.n} teklifini reddetti; ${RIVALS[at].name} karşı teklif yaptı. 60 gün sonra yeniden deneyebilirsin.`;
  S.wd.tr.log.unshift({ d: S.day, t }); if (S.wd.tr.log.length > 10) S.wd.tr.log.length = 10;
  return R_NO(t);
}

/* ---------- 2) Devlet ihaleleri ---------- */
const WD_REG = [['us', 'ABD Savunma Bakanlığı'], ['eu', 'AB Dijital Ajansı'], ['apac', 'Pasifik Bilim Konseyi'], ['me', 'Körfez Akıllı Şehir Fonu'], ['nordic', 'Kuzey Kamu Sağlığı'], ['tr', 'Ulusal Dijital Dönüşüm Ofisi']];
const WD_KIND = [
  { k: 'def', n: 'Güvenli analiz sistemi', sec: 45, open: false, w: 1.6, d: 'Kapalı model ve yüksek güvenlik duruşu şart.' },
  { k: 'health', n: 'Sağlık kayıtları asistanı', sec: 35, open: null, w: 1.2, d: 'Veri gizliliği kritik; kriz geçmişi puan düşürür.' },
  { k: 'edu', n: 'Eğitim platformu', sec: 15, open: null, w: 0.9, d: 'Geniş kullanıcı tabanı ve uygun fiyat önemli.' },
  { k: 'oss', n: 'Kamu açık model programı', sec: 20, open: true, w: 1.0, d: 'Yalnız açık ağırlıklı modeller katılabilir.' },
  { k: 'city', n: 'Akıllı şehir altyapısı', sec: 30, open: null, w: 1.3, d: 'Bölgede veri merkezi olan şirkete artı puan.' },
];
function wdHasRegion(S, rg){ return (S.dcs || []).some(d => d.rg === rg || (d.reg && d.reg === rg)); }
function wdTenderNew(S){
  const T = S.wd.tn, [rg, who] = pickArr(S, WD_REG), K = pickArr(S, WD_KIND);
  const best = bestScore(S) || topRivalScore(S) * 0.3, minScore = Math.max(10, Math.round(best * rr(S, 0.6, 1.1) / 10) * 10);
  const days = pickArr(S, [180, 240, 360]), pay = Math.round(2500 * wdScale(S) * K.w * rr(S, 0.8, 1.3));
  T.list.push({ id: ++T.seq, rg, who, k: K.k, n: K.n, d: K.d, sec: K.sec, open: K.open, minScore, days, pay, until: S.day + 14, bid: null });
}
function wdSecPosture(S){ try { return secPosture(S); } catch (e) { return 30; } }
function wdTenderEligible(S, t){
  const m = S.models.filter(x => !x.retired && (t.open == null || !!x.open === t.open)).sort((a, b) => b.score - a.score)[0];
  if (!m) return { ok: false, why: t.open ? 'Açık ağırlıklı modelin yok.' : t.open === false ? 'Kapalı modelin yok.' : 'Modelin yok.' };
  if (m.score < t.minScore) return { ok: false, why: `En az ${t.minScore} puanlık model gerekli (seninki ${Math.round(m.score)}).` };
  const sp = wdSecPosture(S); if (sp < t.sec) return { ok: false, why: `Güvenlik duruşu en az ${t.sec} olmalı (seninki ${Math.round(sp)}).` };
  return { ok: true, m, sp };
}
// teklif: fiyat çarpanı 0,8 / 1 / 1,2 (düşük fiyat kazanma şansını artırır, kazancı düşürür)
function wdTenderScore(S, t, px){
  const e = wdTenderEligible(S, t); if (!e.ok) return { ok: false, why: e.why };
  const crises = (S.crises || []).filter(c => !c.handled).length;
  let sc = (e.m.score / Math.max(1, t.minScore)) * 0.9 + (e.sp - t.sec) / 100 + (S.rep - 50) / 100 + (wdHasRegion(S, t.rg) ? 0.15 : 0) - crises * (t.k === 'health' || t.k === 'def' ? 0.25 : 0.08);
  sc += (1 - px) * 1.4;
  const comp = S.rivals.map((r, i) => i).filter(i => labAlive(S, i) && !labOwned(S, i) && S.rivals[i].q >= t.minScore).length;
  const p = clamp(0.45 + (sc - 1) * 0.5 - comp * 0.03, 0.05, 0.9);
  return { ok: true, p, comp };
}
function actWdBid(S, id, px){
  const T = wdEnsure(S).tn, t = T.list.find(x => x.id === id); if (!t) return R_NO('İhale bulunamadı.');
  if (t.bid) return R_NO('Bu ihaleye zaten teklif verdin.');
  px = [0.8, 1, 1.2].includes(+px) ? +px : 1;
  const sc = wdTenderScore(S, t, px); if (!sc.ok) return R_NO(sc.why);
  const fee = Math.round(t.pay * 3); if (S.cash < fee) return R_NO(`Teklif dosyası için ${fmtMoney(fee)} gerekli.`);
  S.cash -= fee; t.bid = { px, p: sc.p };
  return R_OK(`Teklif verildi (${fmtMoney(t.pay * px)}/gün). Sonuç ${t.until - S.day} gün içinde.`);
}
function wdTendersDaily(S){
  const T = S.wd.tn;
  if (S.day >= T.next){ T.next = S.day + 35 + Math.floor(rnd(S) * 40); if (S.models.length && T.list.length < 3) wdTenderNew(S); }
  for (let k = T.list.length - 1; k >= 0; k--){
    const t = T.list[k]; if (S.day < t.until) continue; T.list.splice(k, 1);
    if (!t.bid) continue;
    if (rnd(S) < t.bid.p){
      const c = { id: t.id, n: t.n, who: t.who, pay: Math.round(t.pay * t.bid.px), end: S.day + t.days, bad: 0, sec: t.sec };
      T.act.push(c); T.won++; S.rep = Math.min(100, S.rep + 2);
      const msg = `İhale kazanıldı: ${t.who} · ${t.n} (${fmtMoney(c.pay)}/gün, ${t.days} gün).`; log(S, msg, 'good'); if (typeof notify === 'function') notify(S, msg, 'deal');
      if (S.social) try { addPost(S, { a: newsAuthor(S), title: `${t.who}, ${t.n} ihalesini ${TR.ek(S.brand + ' Labs', 'e')} verdi`, text: `Sözleşme ${t.days} gün sürecek. Rakipler sonuca itiraz edebilir.`, topic: 'general', ctx: { b: S.brand }, tag: smTag(S.brand + ' İhale'), nComments: 3, mood: 0.3 }); } catch (e) {}
      if (typeof smShift === 'function' && S.sm) try { smShift(S, t.k === 'def' ? { q: 1, t: -2 } : { q: 1.5, t: 1 }, `${t.who} ihalesi kazanıldı`, t.k === 'def' ? ['inv', 'ent', 'eth'] : ['inv', 'ent'], true); } catch (e) {}
    } else { T.lost++; log(S, `İhale kaybedildi: ${t.who} · ${t.n}.`, 'info'); }
  }
  // süren sözleşmeler: ödeme ve SLA
  for (let k = T.act.length - 1; k >= 0; k--){
    const c = T.act[k];
    const served = S.lastDay ? (S.lastDay.served ?? 1) : 1, sp = wdSecPosture(S);
    if (served < 0.9 || sp < c.sec * 0.8) c.bad++; else c.bad = Math.max(0, c.bad - 0.2);
    if (c.bad >= 6){ T.act.splice(k, 1); const fine = c.pay * 30; S.cash -= fine; S.rep = Math.max(0, S.rep - 5); if (typeof addExtra === 'function') addExtra(S, 'wdfine', 'İhale cezası', -fine);
      const msg = `${c.who} sözleşmeyi feshetti (SLA ihlali): ${fmtMoney(fine)} ceza, itibar −5.`; log(S, msg, 'bad'); if (typeof notify === 'function') notify(S, msg, 'crisis'); continue; }
    S.cash += c.pay; if (typeof addExtra === 'function') addExtra(S, 'wdpay', 'Devlet sözleşmeleri', c.pay);
    if (S.day >= c.end){ T.act.splice(k, 1); S.rep = Math.min(100, S.rep + 3); log(S, `${c.who} sözleşmesi başarıyla tamamlandı: itibar +3.`, 'good'); }
  }
  // ihracat kısıtları: bir bölgeye çip satışı kısıtlanır → GPU fiyatları geçici artar
  if (S.day >= T.nextX){
    T.nextX = S.day + 180 + Math.floor(rnd(S) * 160);
    const [rg, who] = pickArr(S, WD_REG.slice(0, 4)), days = 60 + Math.floor(rnd(S) * 60), m = rr(S, 1.12, 1.25);
    addMod(S, 'gpuPrice', m, days, 'İhracat kısıtı');
    T.exp.unshift({ d: S.day, t: `${who.split(' ')[0]} bölgesine çip ihracat kısıtı: GPU fiyatları ×${m.toFixed(2).replace('.', ',')}, ${days} gün.` }); if (T.exp.length > 6) T.exp.length = 6;
    log(S, T.exp[0].t, 'warn'); if (typeof notify === 'function') notify(S, T.exp[0].t, 'bad');
    if (S.social) try { addPost(S, { a: newsAuthor(S), title: 'Çip ihracatına yeni kısıtlama', text: T.exp[0].t, topic: 'market', ctx: { b: S.brand }, tag: '#ÇipKısıtı', nComments: 3 }); } catch (e) {}
  }
}

/* ---------- 3) Veri pazarı ---------- */
const WD_DATA = [
  { id: 'web',   n: 'Web taraması',            q: 0.03, cost: 0.6, risk: 0.0025, risk_k: 'lawsuit', d: 'Ucuz ve büyük; telif davası riski taşır.' },
  { id: 'books', n: 'Lisanslı kitap arşivi',   q: 0.05, cost: 2.2, risk: 0, d: 'Pahalı ama temiz; muhakeme ve dil kalitesi.' },
  { id: 'code',  n: 'Kod deposu lisansı',      q: 0.04, cost: 1.5, risk: 0, d: 'Yazılım görevlerinde belirgin artış.' },
  { id: 'news',  n: 'Haber arşivi ortaklığı',  q: 0.03, cost: 1.2, risk: 0, trust: 1, d: 'Basınla iyi ilişki; güven +.' },
  { id: 'synth', n: 'Sentetik veri üretimi',   q: 0.04, cost: 1.0, risk: 0, synth: 1, d: 'Tek başına uzun süre kullanılırsa model çöküşü riski.' },
  { id: 'user',  n: 'Kullanıcı sohbetleriyle eğitim', q: 0.06, cost: 0, risk: 0.003, risk_k: 'leak', trust: -3, d: 'Bedava ve güçlü; gizlilik tepkisi ve sızıntı riski.' },
];
const WD_DATA_BY = Object.fromEntries(WD_DATA.map(x => [x.id, x]));
const WD_LIC_DAYS = 180;
function wdDataCost(S, id){ return Math.round(WD_DATA_BY[id].cost * 60000 * wdScale(S)); }
function wdDataBonus(S){
  if (!S.wd) return 0; const L = S.wd.data.lic; let q = 0, real = 0, syn = 0;
  for (const id in L){ if (L[id] <= S.day) continue; const x = WD_DATA_BY[id]; q += x.q; if (x.synth) syn++; else real++; }
  if (syn && !real && S.wd.data.synthRun > 120) q -= 0.05;   // model çöküşü
  return q;
}
function actWdData(S, id){
  wdEnsure(S); const x = WD_DATA_BY[id]; if (!x) return R_NO('Kaynak yok.');
  const L = S.wd.data.lic;
  if ((L[id] || 0) > S.day){ delete L[id]; return R_OK(`${x.n} lisansı bırakıldı.`); }
  const cost = wdDataCost(S, id); if (S.cash < cost) return R_NO(`${fmtMoney(cost)} gerekli.`);
  S.cash -= cost; L[id] = S.day + WD_LIC_DAYS;
  if (x.trust && typeof smShift === 'function' && S.sm) try { smShift(S, { t: x.trust, s: x.trust < 0 ? -2 : 0 }, `${x.n} kararı`, x.trust < 0 ? null : ['med'], true); } catch (e) {}
  if (x.trust < 0 && S.social) try { addPost(S, { a: newsAuthor(S), title: `${S.brand} Labs kullanıcı sohbetleriyle model eğitecek`, text: 'Gizlilik savunucuları karara tepki gösterdi. Şirket verilerin anonimleştirildiğini söylüyor.', topic: 'crisis', ctx: { b: S.brand }, tag: smTag(S.brand + ' Gizlilik'), mood: -0.6, nComments: 4 }); } catch (e) {}
  return R_OK(`${x.n}: ${WD_LIC_DAYS} gün, veri kalitesi +%${Math.round(x.q * 100)}${cost ? ', ' + fmtMoney(cost) : ''}.`);
}
const _wdDataMult = dataMult;
dataMult = function(S){ return _wdDataMult(S) + wdDataBonus(S); };
function wdDataDaily(S){
  const D = S.wd.data, L = D.lic;
  const synOnly = Object.keys(L).some(id => L[id] > S.day && WD_DATA_BY[id].synth) && !Object.keys(L).some(id => L[id] > S.day && !WD_DATA_BY[id].synth);
  D.synthRun = synOnly ? (D.synthRun || 0) + 1 : 0;
  if (D.synthRun === 121) log(S, 'Yalnız sentetik veriyle eğitim model çöküşü başlattı: veri kalitesi −%5. Gerçek veri kaynağı ekle.', 'bad');
  for (const id in L){
    if (L[id] <= S.day){ if (L[id] === S.day) log(S, `${WD_DATA_BY[id].n} lisansının süresi doldu.`, 'warn'); delete L[id]; continue; }
    const x = WD_DATA_BY[id];
    if (x.risk && rnd(S) < x.risk){
      if (typeof spawnCrisis === 'function' && CRISES[x.risk_k] && (S.crises || []).length < 3){ try { spawnCrisis(S, x.risk_k); } catch (e) {} }
      log(S, `${x.n} nedeniyle ${x.risk_k === 'leak' ? 'veri sızıntısı' : 'telif davası'} başladı.`, 'bad');
    }
  }
}

/* ---------- 4) Kampanya ---------- */
const WD_CAMP_KEY = 'ce.camp.v1';
function wdCampDone(){ try { return JSON.parse(localStorage.getItem(WD_CAMP_KEY) || '{}'); } catch (e) { return {}; } }
function wdCampMark(id){ try { const d = wdCampDone(); d[id] = 1; localStorage.setItem(WD_CAMP_KEY, JSON.stringify(d)); } catch (e) {} }
const WD_CAMP = [
  { id: 'camp1', name: 'Kampanya 1 · Garaj', short: 'İki kurucu, dört GPU ve bir fikir.', story: 'Babanın garajında dört GPU ile başlıyorsun. Yatırımcılar ilk modeli görmeden para vermeyecek.',
    goal: 'İlk 200 günde 3 model yayınla ve 1.000 kullanıcıya ulaş.', limit: 200, setup: S => { S.cash = Math.max(S.cash, 40000); },
    prog: S => ({ pct: clamp(Math.min(S.models.length / 3, totalUsers(S) / 1000), 0, 1), txt: `${S.models.length}/3 model · ${fmtShort(totalUsers(S))}/1.000 kullanıcı` }), win: S => S.models.length >= 3 && totalUsers(S) >= 1000 },
  { id: 'camp2', name: 'Kampanya 2 · İlk yatırım', short: 'Seri A turu kapanmadan büyü.', story: 'Bir fon seninle ilgileniyor. Değerlemeyi kanıtlarsan tur kapanır, kanıtlayamazsan ofis kirasını ödeyemezsin.',
    goal: '400 gün içinde 10 milyon $ değerlemeye ulaş.', limit: 400, setup: S => { S.cash = Math.max(S.cash, 150000); },
    prog: S => ({ pct: clamp(valuation(S) / 1e7, 0, 1), txt: `Değerleme ${fmtMoney(valuation(S))} / $10M` }), win: S => valuation(S) >= 1e7 },
  { id: 'camp3', name: 'Kampanya 3 · Kamuoyu savaşı', short: 'Bir skandalla başlıyorsun.', story: 'Eski bir çalışan şirketi sosyal medyada yerden yere vurdu. Güveni geri kazanmadan kimse modelini kullanmayacak.',
    goal: 'Kamuoyunu +40\'a çıkar ve 60 gün orada tut.', limit: 600, setup: S => { S.cash = Math.max(S.cash, 300000); if (S.social) S.social.sent = -60; S.rep = 30; },
    prog: S => ({ pct: clamp(((S.social ? S.social.sent : 0) + 60) / 100, 0, 1) * 0.6 + clamp((S.scen.streak || 0) / 60, 0, 1) * 0.4, txt: `Kamuoyu ${Math.round(S.social ? S.social.sent : 0)} · seri ${S.scen.streak || 0}/60` }),
    win: S => SC_STREAK(S, S.social && S.social.sent >= 40) >= 60 },
  { id: 'camp4', name: 'Kampanya 4 · Tedarik zinciri', short: 'GPU\'lar yok, fiyatlar uçuyor.', story: 'Rakipler GPU üreticilerini kapattı. Kendi tedarik zincirini kurmadan bir sonraki modeli eğitemezsin.',
    goal: 'GPU sektöründe kontrol payını %40\'a çıkar ve 2 laboratuvarı iştirakine kat.', limit: 900, setup: S => { S.cash = Math.max(S.cash, 2e6); },
    prog: S => { const g = S.hold ? hdShare(S, 'gpu') : 0, n = S.lab ? Object.keys(S.lab.subs).length : 0; return { pct: clamp(g / 0.4, 0, 1) * 0.6 + clamp(n / 2, 0, 1) * 0.4, txt: `GPU payı %${Math.round(g * 100)}/40 · iştirak ${n}/2` }; },
    win: S => S.hold && hdShare(S, 'gpu') >= 0.4 && S.lab && Object.keys(S.lab.subs).length >= 2 },
  { id: 'camp5', name: 'Kampanya 5 · AGI', short: 'Son yarış.', story: 'Her şey bu ana çıktı: devletler ihale açıyor, rakipler birleşiyor, yıldızlar transfer oluyor. İlk sen ulaş.',
    goal: 'AGI\'ye ilk ulaş.', limit: 2000, setup: S => { S.cash = Math.max(S.cash, 5e6); },
    prog: S => ({ pct: clamp(bestScore(S) / AGI_SCORE, 0, 1), txt: `En iyi puan ${fmtShort(bestScore(S))} / ${fmtShort(AGI_SCORE)}` }), win: S => S.won },
];
if (typeof SCENS !== 'undefined'){
  const done = wdCampDone();
  for (const c of WD_CAMP){
    const sc = { ...c, name: c.name + (done[c.id] ? ' ✓' : ''), rules: [c.story, 'Hedef: ' + c.goal, `Süre: ${c.limit} gün.`], camp: true };
    SCENS.push(sc); if (typeof SC_BY !== 'undefined') SC_BY[c.id] = sc;
  }
}

/* ---------- Günlük döngü ---------- */
const _wdTick = tick;
tick = function(S){
  const d0 = S.day; const r = _wdTick(S);
  if (S.day !== d0 && S.rivals){
    wdEnsure(S);
    try { wdTendersDaily(S); wdDataDaily(S); } catch (e) { if (typeof globalThis !== 'undefined' && globalThis.__wdDebug) throw e; S.wd.err = e && e.message; }
    if (S.scen && S.scen.status === 'won' && /^camp/.test(S.scen.id) && !S.scen.cmk){ S.scen.cmk = 1; wdCampMark(S.scen.id); }
  }
  return r;
};
const _wdNewGame = newGame;
newGame = function(a, b){ const S = _wdNewGame(a, b); if (S) S.wd = wdState(); return S; };
if (typeof MIGRATIONS !== 'undefined') MIGRATIONS.push(st => { if (st && st.rivals) wdEnsure(st); });
if (typeof module !== 'undefined' && module.exports) Object.assign(module.exports, { actWdPoach, wdPoachProb, wdStarList, actWdBid, wdTenderScore, actWdData, wdDataBonus, WD_CAMP });
