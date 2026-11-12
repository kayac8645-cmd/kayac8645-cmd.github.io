/* ============================================================
   COMPUTE EMPIRE v13 — SOSYAL MOTOR 2 (SM2)
   Tek giriş noktası: olay kanalı → kitle matrisi → gündem → içerik → konuşma zinciri.
   Eski katmanlar (v4/v5/v8/cmt10) içerik kaynağı olarak SM2'nin ALTINDA çalışır;
   her yorum ve yanıt SM2 hattından geçer: üret → cilala → gerçeklik denetimi → doygunluk → tekrar denetimi.
   Durum: S.sm  ·  Rastgelelik: rnd(S) (tohumlu, kayıtla aynı sonuç)
   ============================================================ */

/* ---------- 0) Sabitler ---------- */
const SM_SEG = [
  // id, ad, nüfus ağırlığı, önem: q kalite · p fiyat · r güvenilirlik · t güven · s güvenlik · o açıklık
  { id: 'dev', n: 'Geliştiriciler',   w: 0.22, c: { q: .9, p: .6, r: .8, t: .4, s: .3, o: .8 } },
  { id: 'ent', n: 'Kurumsal',         w: 0.18, c: { q: .7, p: .5, r: 1., t: .7, s: .8, o: .1 } },
  { id: 'usr', n: 'Genel kullanıcı',  w: 0.32, c: { q: .8, p: .9, r: .6, t: .4, s: .3, o: .2 } },
  { id: 'inv', n: 'Yatırımcılar',     w: 0.10, c: { q: .8, p: .3, r: .5, t: .6, s: .4, o: .2 } },
  { id: 'med', n: 'Basın',            w: 0.08, c: { q: .5, p: .3, r: .6, t: 1., s: .8, o: .4 } },
  { id: 'eth', n: 'Etik ve güvenlik', w: 0.10, c: { q: .2, p: .1, r: .3, t: .9, s: 1., o: .7 } },
];
const SM_TOP = ['q', 'p', 'r', 't', 's', 'o'];
const SM_TN = { q: 'Kalite', p: 'Fiyat', r: 'Güvenilirlik', t: 'Güven', s: 'Güvenlik', o: 'Açıklık' };
const SM_TL = { q: 'kalite', p: 'fiyat', r: 'servis', t: 'güven', s: 'güvenlik', o: 'açık kaynak', u: 'büyüme' };
const SM_SEG_BY = Object.fromEntries(SM_SEG.map(s => [s.id, s]));
const SM_RING = 500;            // tekrar denetimi halkası
const SM_SAT_DAY = 3;           // aynı konu imzası bir günde en fazla
const SM_AG_MAX = 8;            // gündemde en fazla konu
let _smIn = 0;                  // eski kamuoyu çağrılarının matrise ikinci kez yansımasını engeller
function smLegacySent(S, d){ _smIn++; try { addSent(S, d); } finally { _smIn--; } }

/* ---------- 1) Durum ---------- */
function smState(){
  const m = {}; for (const s of SM_SEG){ m[s.id] = {}; for (const t of SM_TOP) m[s.id][t] = 0; }
  return { v: 1, m, why: [], ag: [], seq: 0, ring: [], sat: { d: -1, k: {} }, rel: {}, hist: [], st: { gen: 0, rej: 0, dup: 0, real: 0, satr: 0, fix: 0, own: 0, rep: 0, thr: 0, conc: 0 },
           ev: { srv: 1, outRun: 0, caught: 0, pk: -999, pf: -999, lastRel: -999 }, flag: {} };
}
function smEnsure(S){
  if (!S.sm || S.sm.v !== 1){ S.sm = smState(); S.sm.ev.caught = (S.c10 && S.c10.st && S.c10.st.caught) || 0; }
  const b = smState(); for (const k in b) if (!(k in S.sm)) S.sm[k] = b[k];
  for (const k in b.st) if (!(k in S.sm.st)) S.sm.st[k] = 0;
  for (const s of SM_SEG){ if (!S.sm.m[s.id]) S.sm.m[s.id] = {}; for (const t of SM_TOP) if (typeof S.sm.m[s.id][t] !== 'number') S.sm.m[s.id][t] = 0; }
  return S.sm;
}

/* ---------- 2) Olay kanalı ---------- */
const SM_ON = {};
function smOn(type, fn){ (SM_ON[type] = SM_ON[type] || []).push(fn); }
function smEmit(S, type, data){
  if (!S || !S.social) return;
  smEnsure(S);
  for (const fn of SM_ON[type] || []) try { fn(S, data || {}); } catch (e) { smErr(S, type, e); }
}
function smErr(S, where, e){ if (S && S.sm){ S.sm.err = (S.sm.err || 0) + 1; S.sm.lastErr = where + ': ' + (e && e.message); } if (typeof globalThis !== 'undefined' && globalThis.__smDebug) throw e; }

/* ---------- 3) Kitle matrisi ---------- */
// d: { q:+5, t:-3 }  · seg: yalnız bu kesimler (yoksa hepsi, önem oranında)  · why: gerekçe metni
// ext: eski kamuoyu modelinin görmediği bir etki (fiyat, açıklık, dürüstlük, gündem, rakip PR, paylaşım) → kamuoyuna da yansır
function smShift(S, d, why, seg, ext){
  const M = smEnsure(S).m; let tot = 0;
  for (const s of SM_SEG){
    if (seg && !seg.includes(s.id)) continue;
    for (const t in d){
      const k = s.c[t] ?? 0.5, v = M[s.id][t];
      let x = d[t] * (0.35 + 0.65 * k);
      if (x * v > 0) x *= Math.max(0.05, 1 - Math.abs(v) / 105);   // aynı yöne itildikçe etki azalır
      M[s.id][t] = clamp(v + x, -100, 100); tot += x * s.w;
    }
  }
  if (ext) S.sm.x = clamp((S.sm.x || 0) + tot, -80, 80);
  if (why && Math.abs(tot) >= 0.6){
    const W = S.sm.why, top = Object.keys(d).sort((a, b) => Math.abs(d[b]) - Math.abs(d[a]))[0];
    const key = why.replace(/[%\d.,+−-]+/g, '#'), old = W.find(w => w.k === key && S.day - w.d <= 5 && S.day - (w.d0 ?? w.d) < 7);
    if (old){ old.v += tot; old.d = S.day; old.txt = why; old.n = (old.n || 1) + 1; W.splice(W.indexOf(old), 1); W.unshift(old); }
    else { W.unshift({ d: S.day, d0: S.day, t: top, v: tot, txt: why, k: key }); if (W.length > 14) W.length = 14; }
  }
}
function smSegScore(S, sid){ const s = SM_SEG_BY[sid], m = smEnsure(S).m[sid]; let a = 0, b = 0; for (const t of SM_TOP){ a += m[t] * s.c[t]; b += s.c[t]; } return a / b; }
function smTopicScore(S, t){ let a = 0; for (const s of SM_SEG) a += smEnsure(S).m[s.id][t] * s.w; return a; }
function smPull(S){ return clamp(S.sm.x || 0, -60, 60) * 0.012; }   // denge: kalıcı etki ≈ x × 0,4
function smOverall(S){ let a = 0; for (const s of SM_SEG) a += smSegScore(S, s.id) * s.w; return a; }
function smDailyMatrix(S){
  const M = S.sm.m, med = M.med, dev = M.dev;
  for (const s of SM_SEG) for (const t of SM_TOP){
    let v = M[s.id][t] * 0.993;                                   // hafıza: yavaş unutma
    if (s.id !== 'med') v += (med[t] - v) * 0.012;                // basın herkesi etkiler
    if (s.id === 'ent' || s.id === 'usr') v += (dev[t] - v) * 0.008;  // geliştiriciler önce dener
    M[s.id][t] = clamp(v, -100, 100);
  }
  // kamuoyu = eski hedef modeli (itibar, servis, kriz, liderlik) + konu matrisinden gelen sapma (denge: ±overall/3)
  const o = smOverall(S);
  S.sm.x = (S.sm.x || 0) * 0.99;
  if (S.social) S.social.sent = clamp(S.social.sent + smPull(S), -100, 100);
  if (S.day % 5 === 0){ S.sm.hist.push([S.day, Math.round(o), ...SM_TOP.map(t => Math.round(smTopicScore(S, t)))]); if (S.sm.hist.length > 120) S.sm.hist.shift(); }
}
// Kişi → kesim
function smSegOf(d){
  if (!d) return 'usr';
  if (d.lv === 'journo') return 'med';
  if (d.lv === 'expert') return hashStr(d.h) % 3 === 0 ? 'eth' : 'dev';
  const r = d.role || '';
  if (/Yazılım|Geliştir|Mühendis|Veri|Akademi/.test(r)) return 'dev';
  if (/Girişim|Muhasebe|Esnaf/.test(r)) return 'ent';
  if (/Yatırım/.test(r)) return 'inv';
  return hashStr(d.h + 's') % 9 === 0 ? 'eth' : 'usr';
}
function smTrait(d, k){ return (hashStr(d.h + k) % 100) / 100; }   // c: inatçılık · a: etkinlik

/* ---------- 4) Gerçekler (oyun verisinden, konu ve yön etiketli) ---------- */
// Her gerçek: { t: konu, pol: +1/−1, s: [kalıplar] }  · kalıplar TR.fill ile dolar ({x:ek} destekli)
const SM_FACT = [
  // kalite / rakip farkı
  { k: 'up',   t: 'q', pol: 1,  s: ['{mn}, {rm:i} {up} puan geride bıraktı', '{rn:den} {up} puan öndeler', '{mn:in} {rm:den} {up} puan farkı var', 'puan tablosunda {rn:in} {up} puan önündeler'] },
  { k: 'mc',   t: 'q', pol: 1,  s: ['{mc} testinde {rn:den} %{mcd} iyiler', '{mc} tarafında {rm} %{mcd} geride kalıyor'] },
  { k: 'c1',   t: 'q', pol: 1,  s: ['{c1} testinde {c1s} puan almışlar', '{mn} {c1} sorularında {c1s} puanda'] },
  { k: 'dn',   t: 'q', pol: -1, s: ['{rm} hâlâ {dn} puan önde', '{mn}, {rm:in} {dn} puan gerisinde', '{rn:in} modeli {dn} puan daha iyi', 'puan tablosunda {rn:in} {dn} puan gerisindeler'] },
  { k: 'rc',   t: 'q', pol: -1, s: ['{rc} testinde {rn} %{rcd} önde', '{rc} tarafında {rm:e} %{rcd} fark yiyorlar'] },
  { k: 'c2',   t: 'q', pol: -1, s: ['{c2} testinde sadece {c2s} puan var', '{c2} tarafı {c2s} puanda kalmış'] },
  // fiyat
  { k: 'pxl',  t: 'p', pol: 1,  s: ['adil fiyatın %{pxl} altında satıyorlar', 'fiyat piyasa değerinin %{pxl} altında'] },
  { k: 'prl',  t: 'p', pol: 1,  s: ['{rn} {prl} kat daha pahalı', '{rn:in} fiyatı bunun {prl} katı'] },
  { k: 'pxh',  t: 'p', pol: -1, s: ['fiyat adil seviyenin {pxh} katı', 'bu kaliteye {pxh} kat fazla fiyat biçilmiş'] },
  { k: 'prh',  t: 'p', pol: -1, s: ['{rn:den} {prh} kat pahalılar', 'aynı iş için {rn} {prh} kat ucuz'] },
  { k: 'pin',  t: 'p', pol: 0,  s: ['1M giriş tokeni {pin}', 'giriş fiyatı {pin}/1M token'] },
  // güvenilirlik
  { k: 'srvg', t: 'r', pol: 1,  s: ['servis oranı %{srvg}', 'istekler %{srvg} oranında karşılanıyor', 'servis %{srvg} seviyesinde, sorun yok'] },
  { k: 'calmd',t: 'r', pol: 1,  s: ['{calmd} gündür ciddi bir kesinti yok', 'son kesintinin üzerinden {calmd} gün geçti'] },
  { k: 'srvb', t: 'r', pol: -1, s: ['servis %{srvb} seviyesinde', 'isteklerin ancak %{srvb} kadarı karşılanıyor', 'servis oranı %{srvb:e} düştü'] },
  { k: 'outn', t: 'r', pol: -1, s: ['son 90 günde {outn} kesinti yaşandı', '3 ayda {outn} kez çöktüler'] },
  { k: 'outd', t: 'r', pol: -1, s: ['son kesinti daha {outd} gün önceydi', '{outd} gün önce yine çöktü'] },
  // güven
  { k: 'reph', t: 't', pol: 1,  s: ['itibar %{reph} seviyesinde', 'itibar puanları %{reph}'] },
  { k: 'pkd',  t: 't', pol: 1,  s: ['{pkd} gün önce verdikleri sözü tuttular', 'yol haritası sözünü {pkd} gün önce yerine getirdiler'] },
  { k: 'tru',  t: 't', pol: 1,  s: ['sorulara {tru} kez rakamla, dürüst cevap verdiler', 'şimdiye kadar {tru} soruya açık açık cevap verdiler'] },
  { k: 'repl', t: 't', pol: -1, s: ['itibar %{repl:e} kadar düştü', 'itibar %{repl} seviyesinde'] },
  { k: 'pfd',  t: 't', pol: -1, s: ['{pfd} gün önce verdikleri söz tutulmadı', 'yol haritası sözü {pfd} gün önce çöpe gitti'] },
  { k: 'cau',  t: 't', pol: -1, s: ['daha önce {cau} kez yalan söylerken yakalandılar', 'kayıtlara geçmiş {cau} yalanları var'] },
  // güvenlik
  { k: 'cri',  t: 's', pol: -1, s: ['{cri} hâlâ çözülmedi', 'şu an {cri} sürüyor'] },
  { k: 'sec',  t: 's', pol: 1,  s: ['{sec} yatırımı yapılmış', '{sec} devrede'] },
  // açıklık
  { k: 'om',   t: 'o', pol: 1,  s: ['{om} açık ağırlıklı olarak yayında', '{om} herkesin indirebileceği şekilde açık'] },
  { k: 'cls',  t: 'o', pol: -1, s: ['hiçbir modelleri açık değil', 'tek bir açık ağırlıklı model bile yok'] },
  // büyüme
  { k: 'usr',  t: 'u', pol: 1,  s: ['{usr} kullanıcıya ulaştılar', 'kullanıcı sayısı {usr}'] },
  { k: 'rev',  t: 'u', pol: 1,  s: ['günlük gelir {rev}', 'günde {rev} kazanıyorlar'] },
];
const SM_REAL_K = { q: ['up', 'dn'], r: ['srvb', 'srvg', 'outd', 'outn', 'calmd'], p: ['pxh', 'prh', 'pxl', 'prl'] };
const SM_FACT_BY = Object.fromEntries(SM_FACT.map(f => [f.k, f]));
let _smFc = null;
function smFacts(S, about){
  const key = S.day * 64 + ((about && about.i) ?? 63);
  if (_smFc && _smFc.key === key && _smFc.S === S) return _smFc.F;
  let v = {};
  try { v = Object.assign({}, c10Facts(S, null, about || { k: 'market' }).v); } catch (e) { v = { b: S.brand + ' Labs' }; }
  const C = S.c10 || {}, st = C.st || {};
  if (st.truth >= 2) v.tru = String(st.truth);
  if (st.caught > 0) v.cau = String(st.caught);
  const cr = (S.crises || []).find(c => !c.handled && CRISES[c.t]);
  if (cr) v.cri = CRISES[cr.t].name.toLocaleLowerCase('tr');
  if (typeof has === 'function'){ if (has(S, 'g3')) v.sec = 'uçtan uca şifreleme'; else if (has(S, 'g2')) v.sec = 'güvenlik operasyon merkezi'; else if (has(S, 'g1')) v.sec = 'sıfır güven mimarisi'; }
  const om = S.models.filter(m => m.open).sort((a, b) => b.score - a.score)[0];
  if (om) v.om = om.name; else if (S.models.length >= 3) v.cls = '1';
  const F = { v, pos: {}, neg: {}, neu: {}, all: [] };
  for (const f of SM_FACT){
    const need = (f.s[0].match(/\{(\w+)/g) || []).map(x => x.slice(1));
    if (need.length ? !need.every(n => v[n] !== undefined) : v[f.k] === undefined) continue;
    const box = f.pol > 0 ? F.pos : f.pol < 0 ? F.neg : F.neu;
    (box[f.t] = box[f.t] || []).push(f); F.all.push(f);
  }
  _smFc = { key, S, F };
  return F;
}
// Gerçeğin o anki yönü (gerçeklik denetimi için): +1 iyi, −1 kötü, 0 belirsiz
function smReality(S, t){
  const F = smFacts(S, null), p = (F.pos[t] || []).length, n = (F.neg[t] || []).length;
  const v = F.v;
  if (t === 'r'){ if (v.srvb || (v.outd !== undefined && +v.outd <= 10)) return -1; if (v.srvg && !v.outd) return 1; return 0; }
  if (t === 'q') return v.up ? 1 : v.dn ? -1 : 0;
  if (t === 'p') return v.pxh || v.prh ? -1 : v.pxl || v.prl ? 1 : 0;
  return p > n ? 1 : n > p ? -1 : 0;
}
function smFactText(S, f, F){
  const opts = f.s.map(s => TR.fill(s, F.v)).filter(Boolean);
  return opts.length ? pickArr(S, opts) : null;
}
// Gerçek aileleri: aynı veriyi farklı sözle ya da güncellenmiş rakamla tekrar etmeyi engeller
const SM_FAM = [
  [/servis|isteklerin/, ['srvb', 'srvg']], [/kesinti|çöktü|çök/, ['outn', 'outd', 'calmd']], [/puan (geri|ön)|puan fark|gerisinde|önündeler|geride bıraktı|daha iyi/, ['up', 'dn']],
  [/testinde|tarafında/, ['rc', 'mc', 'c1', 'c2']], [/kat (daha )?(pahalı|ucuz)|katı|adil fiyat|piyasa değeri/, ['pxh', 'pxl', 'prh', 'prl']], [/giriş (tokeni|fiyatı)/, ['pin']],
  [/kullanıcı/, ['usr']], [/gelir|kazanıyor/, ['rev']], [/itibar/, ['reph', 'repl']], [/söz/, ['pkd', 'pfd']], [/soruya/, ['tru']], [/yalan/, ['cau']], [/açık ağırlık|indirebileceği/, ['om', 'cls']],
];
const SM_K2F = { srv: ['srvb', 'srvg'], out: ['outn', 'outd', 'calmd'], gap: ['up', 'dn', 'rc', 'mc'], price: ['pxh', 'pxl', 'prh', 'prl', 'pin'], mod: ['c1', 'c2'], usr: ['usr'], rev: ['rev'], prom: ['pkd', 'pfd'] };
function smFamOf(c){
  const l = String(c && c.t || '').toLocaleLowerCase('tr'), out = new Set();
  for (const [re, ks] of SM_FAM) if (re.test(l)) ks.forEach(k => out.add(k));
  if (c && c.sm && c.sm.f) (SM_FAM.find(x => x[1].includes(c.sm.f)) || [0, [c.sm.f]])[1].forEach(k => out.add(k));
  if (c && c.c10 && c.c10.k) for (const k of c.c10.k) (SM_K2F[k] || []).forEach(x => out.add(x));
  return [...out];
}
let _smAvoidNums = null, _smAvoidFam = null;   // yanıt kurulurken üst yorumdaki rakamlar tekrar edilmez
function smPickFact(S, F, t, pol, avoid){
  const box = pol > 0 ? F.pos : pol < 0 ? F.neg : F.neu;
  let c = (box[t] || []).filter(f => !(avoid || []).includes(f.k) && !(_smAvoidFam && _smAvoidFam.includes(f.k)));
  for (let k = 0; k < 3 && c.length; k++){
    const f = pickArr(S, c), txt = smFactText(S, f, F);
    if (txt && !(_smAvoidNums && _smAvoidNums.some(n => txt.includes(n)))) return { f, txt };
    c = c.filter(x => x !== f);
  }
  return null;
}

/* ---------- 5) İddia çözümleyici (her metin için: hangi konu, hangi yön) ---------- */
const SM_LEX = {
  q: /puan|benchmark|test|kalite|akıllı|zeki|önde|geride|geçti|geçmiş|fark|matematik|kod|muhakeme|halüsinasyon|saçmal/,
  p: /fiyat|pahalı|ucuz|token başı|\/1m|zam|indirim|abonelik|ücret/,
  u: /kullanıcı|gelir|kazan|büyü|takipçi|abone/,
  r: /servis|kesinti|çök|yavaş|zaman aşımı|gecikme|sorunsuz|istikrar|ayakta|bekle|sıra|sunucu|kapasite/,
  t: /güven|yalan|şeffaf|söz|dürüst|açıklama|itibar|saklı|kandır/,
  s: /güvenlik|sızıntı|sızdı|saldırı|fidye|jailbreak|veri|gizlilik|hack/,
  o: /açık kaynak|açık ağırlık|açık model|lisans|indir|yerel/,
};
const SM_NEG = /kötü|pahalı|yavaş|kesinti|çök|geride|hayal kırıklığı|vermem|sıfır|berbat|rezalet|olmaz|eksik|düştü|saçma|sınıfta|vasat|bahane|şikâyet|yalan|abart|sorun|problem|bozuk|yetişemez|kaybı|😤|👎|🙄|😒|🤡|geçiyorum|silerim|sildim/;
const SM_POS = /harika|iyi|güçlü|önde|makul|sorunsuz|tebrik|helal|bravo|başarı|sevindim|bayıldım|memnun|ucuz|rahat|güzel|hak edil|sağlık|💪|🔥|👏|🚀|😍|istikrar/;
const SM_CT = ['q', 'p', 'r', 't', 's', 'o', 'u'];
function smPolOf(l){ const n = SM_NEG.test(l), p = SM_POS.test(l); return n && !p ? -1 : p && !n ? 1 : 0; }
function smClaim(text){
  const l = String(text || '').toLocaleLowerCase('tr').replace(/[@#]\S+/g, '');
  const ts = SM_CT.filter(t => SM_LEX[t].test(l));
  // "X ama Y" yapısında yargıyı Y taşır
  const k = Math.max(l.lastIndexOf(' ama '), l.lastIndexOf(' fakat '), l.lastIndexOf(' ancak '));
  let pol = k > 0 ? smPolOf(l.slice(k)) : 0;
  if (!pol) pol = smPolOf(l);
  const lv = l.replace(/[\p{L}]+(?:\s[\p{L}]+)?\s\d+(?:\.\d+)+/gu, ' ').replace(/[\p{L}]+\s\d{1,2}(?![\d.,%])/gu, ' ');
  const nums = (lv.match(/%?\d+(?:[.,]\d+)?/g) || []).filter(x => x.replace(/\D/g, '').length >= 2 || x[0] === '%');
  return { ts, pol, nums, q: /\?/.test(l) };
}

// Yorumun iddiası: önce yapısal etiket (SM2 / cmt10), yoksa sözcük çözümleme
const SM_K2T = { mod: 'q', gap: 'q', price: 'p', srv: 'r', out: 'r', short: 'r', prom: 't', usr: 'u', rev: 'u', gpu: 'u' };
const SM_G2P = { sup: 1, rsup: -1, crit: -1, mock: -1, emp: -1 };
function smClaimOf(c){
  const base = smClaim(c && c.t);
  if (c && c.sm && c.sm.t && c.sm.pol) return { ...base, ts: [c.sm.t].concat(base.ts.filter(x => x !== c.sm.t)), pol: c.sm.pol, sure: true };
  if (c && c.c10 && c.c10.s && SM_G2P[c.c10.s] !== undefined){
    const ks = (c.c10.k || []).map(k => SM_K2T[k]).filter(Boolean);
    return { ...base, ts: [...new Set(ks.concat(base.ts))], pol: SM_G2P[c.c10.s], sure: ks.length > 0 };
  }
  return base;
}

/* ---------- 6) Metin cilası ---------- */
// Özel isimlerin yazımını koru (argo/kısaltma üslubu küçük harfe çevirse bile)
let _smNames = null;
function smNames(S){
  if (_smNames && _smNames.S === S && _smNames.d === S.day && _smNames.n === S.models.length) return _smNames;
  const set = new Set();
  if (S.brand) set.add(S.brand + ' Labs'), set.add(S.brand);
  for (const m of S.models) set.add(m.name);
  if (typeof RIVALS !== 'undefined') RIVALS.forEach((R, i) => { set.add(R.name); const r = S.rivals && S.rivals[i]; if (r && r.models) for (const m of r.models.slice(-3)) if (m && m.name) set.add(m.name); });
  const list = [...set].filter(x => x && x.length >= 3 && /^[A-ZÇĞİÖŞÜ]/.test(x)).sort((a, b) => b.length - a.length);
  const esc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = list.length ? new RegExp('(^|[^\\p{L}\\d])(' + list.map(esc).join('|') + ')(?![\\p{L}\\d])', 'giu') : null;
  const canon = new Map(list.map(x => [x.toLocaleLowerCase('tr'), x]));
  return (_smNames = { S, d: S.day, n: S.models.length, re, canon });
}
function smFixNames(S, t){
  const N = smNames(S); if (!N.re) return t;
  return t.replace(N.re, (all, pre, w) => pre + (N.canon.get(w.toLocaleLowerCase('tr')) || w));
}
function smTag(name){ return '#' + String(name).replace(/\.0\b/g, '').replace(/(\d)\.(\d)/g, '$1$2').split(/[^0-9A-Za-zÇĞİÖŞÜçğıöşü]+/).filter(Boolean).map(w => w[0].toLocaleUpperCase('tr') + w.slice(1)).join(''); }
function smPolish(S, t, keepLow){
  if (!t) return t;
  const keep = []; let s = String(t).replace(/[@#][^\s,.!?;:]+(?:\.[^\s,.!?;:]+)*/g, m => { keep.push(m); return '\u0001' + (keep.length - 1) + '\u0002'; });
  s = s.replace(/\s+([,.!?;:])/g, '$1').replace(/([,.!?;:])(?=[^\s\d"')\]….,!?\u0001])/g, '$1 ').replace(/\s{2,}/g, ' ').replace(/\.{2}(?!\.)/g, '.').replace(/([!?])\./g, '$1').trim();
  s = s.replace(/(\d) ([.,]) (\d)/g, '$1$2$3').replace(/(\d)([.,]) (\d)/g, '$1$2$3');   // 70, 9 → 70,9
  // cümle başları büyük harf (@hitap ve kasıtlı küçük harf açılışı hariç)
  s = s.replace(/([.!?]\s+)([a-zçğıöşü])/g, (_, a, b) => a + b.toLocaleUpperCase('tr'));
  if (!keepLow){ const m = s.match(/^((?:@\S+\s+)*)([a-zçğıöşü])/); if (m) s = m[1] + m[2].toLocaleUpperCase('tr') + s.slice(m[0].length); }
  if (S && S.models) s = smFixNames(S, s);
  let f = TR.fix(s); if (f !== s && S && S.sm) S.sm.st.fix++;
  f = f.replace(/\u0001(\d+)\u0002/g, (_, i) => keep[+i]);
  return f;
}

/* ---------- 7) Tekrar ve doygunluk denetimi ---------- */
const smNorm = t => String(t).toLocaleLowerCase('tr').replace(/@\S+/g, '').replace(/\d+([.,]\d+)?/g, '#').replace(/[^\p{L}#\s]/gu, ' ').replace(/\s+/g, ' ').trim();
function smShingles(t){ const w = smNorm(t).split(' '), o = []; for (let i = 0; i + 2 < w.length; i++) o.push(hashStr(w[i] + ' ' + w[i + 1] + ' ' + w[i + 2]) % 1048576); if (!o.length) o.push(hashStr(w.join(' ')) % 1048576); return o; }
// Halka kayıtta dizi olarak durur; ters dizin (kalıp → kayıt) bellekte, gerektiğinde yeniden kurulur
let _smIx = null;
function smIndex(S){
  const R = S.sm.ring;
  if (_smIx && _smIx.S === S && _smIx.R === R && _smIx.len === R.length + _smIx.base) return _smIx;
  const ix = { S, R, base: 0, len: R.length, m: new Map(), sz: [] };
  R.forEach((b, i) => { const u = [...new Set(b)]; ix.sz[i] = u.length; for (const x of u){ let l = ix.m.get(x); if (!l) ix.m.set(x, l = []); l.push(i); } });
  return (_smIx = ix);
}
function smSimilar(S, t, th){
  const A = [...new Set(smShingles(t))], ix = smIndex(S), cnt = new Map();
  for (const x of A){ const l = ix.m.get(x); if (l) for (const i of l) cnt.set(i, (cnt.get(i) || 0) + 1); }
  for (const [i, n] of cnt){ const j = n / (A.length + ix.sz[i] - n || 1); if (j >= th) return true; }
  return false;
}
function smRemember(S, t){
  const R = S.sm.ring, sh = smShingles(t);
  R.push(sh);
  if (R.length > SM_RING + 100){ R.splice(0, R.length - SM_RING); _smIx = null; return; }
  const ix = _smIx && _smIx.S === S && _smIx.R === R ? _smIx : null;
  if (ix){ const i = R.length - 1, u = [...new Set(sh)]; ix.sz[i] = u.length; for (const x of u){ let l = ix.m.get(x); if (!l) ix.m.set(x, l = []); l.push(i); } ix.len = R.length; }
}
function smSatKey(t){ const c = smClaim(t); const n = c.nums.slice(0, 2).join('|'); return n ? c.ts.join('') + ':' + n : null; }
function smOpenKey(t){ const w = smNorm(t).split(' ').filter(x => x !== '#'); return w.length >= 5 ? w.slice(0, 3).join(' ') : null; }
function smSatOk(S, t){
  const Z = S.sm.sat; if (Z.d !== S.day){ Z.d = S.day; Z.k = {}; }
  const k = smSatKey(t); if (k && (Z.k[k] || 0) >= SM_SAT_DAY) return false;
  const o = smOpenKey(t), O = S.sm.open || (S.sm.open = {});
  if (o && O[o]){ const recent = O[o].filter(d => S.day - d < 3); if (recent.length >= 2) return false; }
  return true;
}
function smSatAdd(S, t){
  const k = smSatKey(t); if (k) S.sm.sat.k[k] = (S.sm.sat.k[k] || 0) + 1;
  const o = smOpenKey(t), O = S.sm.open || (S.sm.open = {});
  if (o){ const a = (O[o] || []).filter(d => S.day - d < 3); a.push(S.day); O[o] = a; }
  if (S.day % 10 === 0 && Object.keys(O).length > 400) for (const x in O) if (!O[x].some(d => S.day - d < 3)) delete O[x];
}
// Gerçeklik: metin, bir konuda gerçekle ters yönde net bir iddia taşıyor mu? (döner: konu ya da null)
function smWrongClaim(S, t, cobj){
  const c = cobj ? smClaimOf(cobj) : smClaim(t); if (!c.pol || c.q) return null;
  if (cobj && cobj.sm && cobj.sm.own) return null;
  for (const x of c.ts){ if (x !== 'r' && x !== 'q' && x !== 'p') continue; const r = smReality(S, x); if (r && r === -c.pol) return x; }
  return null;
}
// Yorum kabul hattı: { ok, wrong }
function smGate(S, text, who, cobj){
  const st = S.sm.st;
  if (!text) return { ok: false };
  if (smSimilar(S, text, 0.5)){ st.dup++; return { ok: false, why: 'dup' }; }
  if (!smSatOk(S, text)){ st.satr++; return { ok: false, why: 'sat' }; }
  const w = smWrongClaim(S, text, cobj);
  if (w && !(who && who.lv === 'troll') && rnd(S) < 0.75){ st.real++; return { ok: false, why: 'real' }; }
  return { ok: true, wrong: w };
}
function smAccept(S, text){ smRemember(S, text); smSatAdd(S, text); }

/* ---------- 8) Söz dağarcığı ---------- */
const SM_W = {
  openPos: ['Açık konuşayım, ', 'Bence ', 'Hakkını vermek lazım, ', 'Şunu kabul edelim: ', 'Ben ikna oldum, ', 'Sayılar ortada: ', 'Bir süredir izliyorum, ', 'İtiraf edeyim, '],
  openNeg: ['Kusura bakmayın ama ', 'Kimse söylemiyor ama ', 'Gerçekçi olalım: ', 'Tablo şu: ', 'Hatırlatayım, ', 'Şunu unutmayalım: ', 'Ortada bir sorun var: ', 'Açık söyleyeyim, '],
  closePos: [' Böyle devam.', ' Hak edilmiş bir sonuç.', ' Takipteyim.', ' Bu işi biliyorlar.', ' Bu tempo sürerse zirve uzak değil.', ''],
  closeNeg: [' Bu böyle gitmez.', ' Bir açıklama bekliyoruz.', ' Toparlanmaları lazım.', ' Kimse bunu görmezden gelmesin.', ' Bahane istemiyoruz.', ''],
  agr: ['Aynen, ', 'Katılıyorum, ', 'Kesinlikle, ', '+1, ', 'Tam olarak, ', 'Doğru, '],
  agrAdd: ['üstelik ', 'bir de ', 'buna ek olarak ', 'üstüne bir de ', 'hatta '],
  reb: ['Öyle değil, ', 'Katılmıyorum, ', 'Rakamlar başka söylüyor: ', 'Biraz abartıyorsun, ', 'Yanlış hatırlıyorsun, ', 'Bir saniye, '],
  conc: ['{T} konusunda haklı olabilirsin ama ', '{T} meselesini kabul ediyorum, öte yandan ', '{T} tarafı tartışılır ama ', '{T} için bir şey demem, yalnız '],
  fix: ['Düzeltme: ', 'Küçük bir not: ', 'Bilgi kirliliği olmasın: ', 'Kayıtlara geçsin: '],
  ask: ['Bu {n} nereden çıktı? Kaynak var mı?', '{n} rakamını nereden aldın?', '{n} resmî rakam mı, yoksa tahmin mi?', 'Kaynak paylaşır mısın, {n} bana fazla geldi.'],
  dbl: ['Yine de ', 'Ben fikrimi değiştirmedim: ', 'Sen ne dersen de, ', 'Konu değiştirme, ', 'Asıl mesele şu: '],
  cede: ['Tamam, {t} konusunda haklısın.', 'Peki, o rakamı bilmiyordum, haklısın.', 'Kabul, {t} tarafında yanılmışım.', 'Doğru diyorsun, bir daha baktım.'],
  foe: ['Yine sen 😄 ', 'Her konuda karşımdasın ama ', 'Bu {k}. tartışmamız, yine de '],
  pal: ['Yine aynı yerden bakıyoruz, ', 'Sen de fark etmişsin, ', ''],
  segTail: {
    dev: { pos: [' API tarafında da memnunum.', ' Entegrasyon kolay.', ''], neg: [' Üretimde bu riskli.', ' Geliştirici deneyimi zarar görüyor.', ''] },
    ent: { pos: [' Kurumsal tarafta bu güven verir.', ' Sözleşme masasında artı puan.', ''], neg: [' Bu tabloyla SLA imzalanmaz.', ' Satın alma ekibi bunu sorar.', ''] },
    inv: { pos: [' Değerleme için güçlü sinyal.', ' Büyüme hikâyesi sağlam.', ''], neg: [' Değerleme bunu kaldırmaz.', ' Yatırımcı tarafı tedirgin.', ''] },
    eth: { pos: [' Sorumlu bir yaklaşım.', ''], neg: [' Denetim şart.', ' Şeffaflık raporu bekliyoruz.', ''] },
    med: { pos: [''], neg: [' Şirketten açıklama istedik.', ' Konuyu takip ediyoruz.', ''] },
    usr: { pos: [''], neg: [''] },
  },
};

/* ---------- 9) Yorum kurucu (SM2'nin kendi yorumları) ---------- */
// Konu seçimi: gündem sıcaklığı + kişinin kesiminin önem verdiği konular + gönderinin konusu
function smChooseTopic(S, p, seg, F){
  const w = {}, C = SM_SEG_BY[seg].c;
  for (const t of SM_TOP){ const n = (F.pos[t] || []).length + (F.neg[t] || []).length; if (n) w[t] = C[t] * (0.5 + n * 0.3); }
  if ((F.pos.u || []).length) w.u = 0.25;
  for (const a of S.sm.ag) if (w[a.t] !== undefined) w[a.t] += a.heat / 40;
  const pc = smClaim((p.title || '') + ' ' + p.text);
  for (const t of pc.ts) if (w[t] !== undefined) w[t] += 0.9;
  const keys = Object.keys(w); if (!keys.length) return null;
  return pickW(S, w);
}
function smSegPol(S, seg, t, d, ps){
  // kesimin o konudaki görüşü + kişinin kişisel duruşu + gerçek → +1 / −1
  const o = (S.sm.m[seg] && S.sm.m[seg][t]) || 0, st = ps ? ps.st : 0, real = t === 'u' ? 1 : smReality(S, t);
  const x = o / 60 + st * 0.9 + real * 0.8 + (rnd(S) - 0.5) * 0.9 + (d && d.lv === 'troll' ? -0.4 : 0);
  return x >= 0 ? 1 : -1;
}
function smCompose(S, p, d, ps){
  const about = p.about || (typeof inferAbout === 'function' ? inferAbout(S, p) : { k: 'market' });
  const F = smFacts(S, about), seg = smSegOf(d);
  const t = smChooseTopic(S, p, seg, F); if (!t) return null;
  let pol = smSegPol(S, seg, t, d, ps);
  let a = smPickFact(S, F, t, pol);
  if (!a){ pol = -pol; a = smPickFact(S, F, t, pol); }
  if (!a) return null;
  const pos = pol > 0, W = SM_W, tails = (W.segTail[seg] || W.segTail.usr)[pos ? 'pos' : 'neg'];
  const form = rnd(S);
  let txt;
  if (form < 0.36){
    txt = pickArr(S, pos ? W.openPos : W.openNeg) + a.txt + '.' + pickArr(S, pos ? W.closePos : W.closeNeg);
  } else if (form < 0.62){
    const b = smPickFact(S, F, t, pol, [a.f.k]) || smPickFact(S, F, pickArr(S, SM_TOP), pol, [a.f.k]);
    txt = TR.up1(a.txt) + (b ? ', ' + pickArr(S, ['üstelik ', 'bir de ', 'ayrıca ']) + b.txt : '') + '.' + pickArr(S, tails);
  } else if (form < 0.78){
    // karşıtlık: iyi bir şey ama kötü bir şey (ya da tersi)
    const o = smPickFact(S, F, pickArr(S, Object.keys(pos ? F.neg : F.pos)), -pol);
    if (o) txt = TR.up1(a.txt) + ' ama ' + o.txt + '.' + (pos ? pickArr(S, [' Yine de olumlu bakıyorum.', ' Terazide iyi taraf ağır basıyor.', ' Genel tablo fena değil.', ' Ben yine de devam ederim.', '']) : pickArr(S, [' Bu yetmez.', ' Önce bunu çözsünler.', ' İyi taraf bunu kapatmıyor.', ' Bu dengesizlik uzun sürmez.', '']));
    else txt = TR.up1(a.txt) + '.' + pickArr(S, tails);
  } else if (form < 0.9){
    const tag = (S.sm.ag.find(x => x.t === t) || {}).tag;
    const lead = tag ? pickArr(S, [tag + ' konuşuluyor ama ', tag + ' etiketine bakan herkes şunu görmeli: ', tag + ' tartışmasında gözden kaçan şu: ', tag + ' dendiğinde ', ]) : pickArr(S, ['Herkes başka şey konuşuyor ama ', 'Gündem başka yerde ama ', 'Kimse sormuyor ama ']);
    txt = lead + (/: $/.test(lead) ? '' : /dendiğinde $/.test(lead) ? 'akla gelmesi gereken şu: ' : 'bence asıl mesele şu: ') + a.txt + '.';
  } else {
    txt = TR.up1(a.txt) + '. ' + (pos ? pickArr(S, ['Bunu kimse beklemiyordu.', 'Rakipler ne diyecek merak ediyorum.', 'Sırada ne var?']) : pickArr(S, ['Bunu nasıl açıklayacaklar?', 'Resmî bir açıklama gelecek mi?', 'Ne zaman düzelecek?']));
  }
  txt = txt.replace(/\.\./g, '.');
  try { if (typeof c10Voice === 'function') txt = c10Voice(S, d, txt, pos ? 'sup' : 'crit', false); } catch (e) {}
  return { text: txt, t, pol, f: a.f.k };
}

/* ---------- 10) Yanıt kurucu: üst yorumun iddiasına cevap ---------- */
function smRelKey(a, b){ return a < b ? a + '|' + b : b + '|' + a; }
function smRelBase(a, b){ const h = hashStr(smRelKey(a, b)); return h % 23 === 0 ? 1 : h % 17 === 0 ? -1 : 0; }
function smRel(S, a, b){ const R = S.sm.rel, k = smRelKey(a, b); return R[k] || { w: smRelBase(a, b), n: 0 }; }
function smRelAdd(S, a, b, dw){
  const R = S.sm.rel, k = smRelKey(a, b), r = R[k] || (R[k] = { w: smRelBase(a, b), n: 0 });
  r.n++; r.w = clamp(r.w + dw, -3, 3);
  const keys = Object.keys(R); if (keys.length > 600) for (const x of keys.slice(0, 150)) delete R[x];
  return r;
}
function smPickReplier(S, p, c, wantFoe){
  const avoid = new Set([c.a && c.a.h]); for (const x of c.r || []) avoid.add(x.a && x.a.h);
  if (wantFoe != null && c.a && rnd(S) < 0.6){
    // önce bilinen ilişkiler, sonra örneklem
    const R = S.sm.rel, h = c.a.h, known = [];
    for (let k = 0; k < 30; k++){ const d = C10_PEOPLE[Math.floor(rnd(S) * C10_PEOPLE.length)]; if (avoid.has(d.h) || d.lv === 'journo') continue; const r = R[smRelKey(h, d.h)]; const w = r ? r.w : smRelBase(h, d.h); if (wantFoe ? w < 0 : w > 0) known.push(d); if (known.length >= 3) break; }
    if (known.length) return pickArr(S, known);
  }
  for (let k = 0; k < 12; k++){ const d = C10_PEOPLE[Math.floor(rnd(S) * C10_PEOPLE.length)]; if (!avoid.has(d.h) && d.lv !== 'journo') return d; }
  return null;
}
// c: üst yorum. Dönüş: yanıt nesnesi ya da null
function smReplyTo(S, p, c, forceAct){
  const pc = smClaimOf(c), F = smFacts(S, p.about || { k: 'market' });
  const wrong = c.smw || smWrongClaim(S, c.t, c);
  let act = forceAct;
  if (!act){
    const w = { agree: 1, rebut: 1.1, ask: pc.nums.length ? 0.45 : 0, joke: 0.25 };
    if (wrong) w.fix = 2.2;
    if (pc.q) { w.answer = 2.5; w.rebut = 0.2; }
    act = pickW(S, w);
  }
  const wantFoe = act === 'rebut' || act === 'fix' ? true : act === 'agree' ? false : null;
  const d = smPickReplier(S, p, c, wantFoe); if (!d) return null;
  const ps = typeof c10Per === 'function' ? c10Per(S, d) : { st: 0 };
  const t = pc.ts.find(x => (F.pos[x] || F.neg[x])) || null;
  const pol = pc.pol || (c.tone === 'neg' ? -1 : c.tone === 'pos' ? 1 : 0);
  const rel = c.a ? smRel(S, c.a.h, d.h) : { w: 0, n: 0 };
  const W = SM_W; let txt = null, tone = 'neu';
  _smAvoidNums = pc.nums.map(n => n.replace('%', '')).filter(n => n.length >= 2);
  _smAvoidFam = act === 'fix' ? null : smFamOf(c);
  try {
  const pre = rel.w < 0 && rel.n >= 2 && rnd(S) < 0.5 ? TR.fill(pickArr(S, W.foe), { k: rel.n + 1 }) : rel.w > 0 && rnd(S) < 0.4 ? pickArr(S, W.pal) : '';
  if (act === 'fix' && wrong){
    const real = smReality(S, wrong), keyF = SM_REAL_K[wrong] || [], box = real > 0 ? F.pos : F.neg;
    const cand = (box[wrong] || []).filter(x => keyF.includes(x.k)), ff = cand.length ? pickArr(S, cand) : null;
    const f = ff ? { f: ff, txt: smFactText(S, ff, F) } : smPickFact(S, F, wrong, real);
    if (f){ txt = pickArr(S, W.fix) + f.txt + '. ' + (pol > 0 ? pickArr(S, ['Bu tabloya "her şey yolunda" denmez.', 'Övmeden önce rakama bakmak lazım.', 'Yani durum anlatıldığı kadar parlak değil.']) : pickArr(S, ['Durum anlatıldığı kadar kötü değil.', 'Yani bu kadar karamsar olmaya gerek yok.', 'Rakamlar bu eleştiriyi desteklemiyor.'])); tone = real > 0 ? 'pos' : 'neg'; }
    else act = 'rebut';
  }
  if (!txt && act === 'answer'){
    const tt = t || smChooseTopic(S, p, smSegOf(d), F);
    const f = tt && (smPickFact(S, F, tt, 1) || smPickFact(S, F, tt, -1) || smPickFact(S, F, tt, 0));
    if (f){ txt = pickArr(S, ['Bildiğim kadarıyla ', 'Rakamlara göre ', 'Resmî verilere göre ', 'Ben baktım: ']) + f.txt + '.'; tone = f.f.pol > 0 ? 'pos' : f.f.pol < 0 ? 'neg' : 'neu'; }
    else act = 'ask';
  }
  if (!txt && act === 'agree' && pol){
    const f = (t && smPickFact(S, F, t, pol)) || smPickFact(S, F, pickArr(S, SM_TOP), pol);
    if (f){ txt = pre + (pre ? TR.low1(pickArr(S, W.agr)) : pickArr(S, W.agr)) + pickArr(S, W.agrAdd) + f.txt + '.'; tone = pol > 0 ? 'pos' : 'neg'; }
  }
  if (!txt && act === 'rebut' && pol){
    // önce aynı konuda karşı gerçek; yoksa taviz + başka konuda karşı gerçek
    let f = t && smPickFact(S, F, t, -pol);
    if (f) txt = pre + (pre ? TR.low1(pickArr(S, W.reb)) : pickArr(S, W.reb)) + f.txt + '.';
    else {
      const ot = Object.keys(pol > 0 ? F.neg : F.pos); f = ot.length ? smPickFact(S, F, pickArr(S, ot), -pol) : null;
      if (f && t){ const cc = TR.fill(pickArr(S, W.conc), { T: TR.up1(SM_TL[t] || 'bu') }); txt = pre + (pre ? TR.low1(cc) : cc) + f.txt + '.'; S.sm.st.conc++; }
      else if (f) txt = pre + (pre ? TR.low1(pickArr(S, W.reb)) : pickArr(S, W.reb)) + f.txt + '.';
    }
    if (txt) tone = -pol > 0 ? 'pos' : 'neg';
  }
  if (!txt && (act === 'ask' || act === 'rebut') && pc.nums.length){ txt = TR.fill(pickArr(S, W.ask), { n: pc.nums[0] }); tone = 'q'; act = 'ask'; }
  } finally { _smAvoidNums = null; _smAvoidFam = null; }
  if (!txt) return null;
  try { if (typeof c10Voice === 'function') txt = c10Voice(S, d, txt, tone === 'pos' ? 'sup' : tone === 'neg' ? 'crit' : 'ask', false); } catch (e) {}
  txt = smPolish(S, (c.a ? '@' + c.a.h + ' ' : '') + txt, false);
  if (c.a && C10_BY_H[c.a.h]) smRelAdd(S, c.a.h, d.h, act === 'agree' ? 0.5 : act === 'rebut' || act === 'fix' ? -0.6 : 0);
  return { a: c10Author(d), t: txt, tone, l: Math.round(Math.exp(rr(S, 0, 3.4)) * (act === 'fix' ? 1.8 : 1)), d: S.day, sm: { act, t: t || wrong || '' }, c10: { s: tone === 'pos' ? 'sup' : tone === 'neg' ? 'crit' : 'ask', k: [] } };
}
// Zincir: asıl yorumcu geri döner (inatçıysa üsteler, değilse geri adım atar)
function smCounter(S, p, c){
  const last = c.r[c.r.length - 1]; if (!last || !last.sm || !['rebut', 'fix', 'ask'].includes(last.sm.act)) return null;
  const d = c.a && C10_BY_H[c.a.h]; if (!d) return null;
  const F = smFacts(S, p.about || { k: 'market' }), pc = smClaimOf(c), t = last.sm.t || pc.ts[0];
  const stub = smTrait(d, 'c') + (d.lv === 'troll' ? 0.3 : 0) - (last.sm.act === 'fix' ? 0.35 : 0);
  let txt, act;
  if (last.sm.act === 'ask'){
    const f = t && (smPickFact(S, F, t, pc.pol || 1) || smPickFact(S, F, t, -(pc.pol || 1)));
    if (!f) return null; txt = pickArr(S, ['Resmî tabloda var: ', 'Kaynak şirketin kendi verisi: ', 'Kendim baktım: ']) + f.txt + '.'; act = 'src';
  } else if (stub > 0.55 && pc.pol){
    const f = smPickFact(S, F, pickArr(S, Object.keys(pc.pol > 0 ? F.pos : F.neg).concat(t ? [t] : [])), pc.pol);
    if (!f) return null; txt = pickArr(S, SM_W.dbl) + f.txt + '.'; act = 'dbl';
  } else {
    txt = TR.fill(pickArr(S, SM_W.cede), { t: SM_TL[t] || 'bu' }); act = 'cede';
    if (typeof c10Per === 'function'){ const ps = c10Per(S, d); ps.st = clamp(ps.st + (last.tone === 'pos' ? 0.12 : last.tone === 'neg' ? -0.12 : 0), -1, 1); }
    S.sm.st.conc++;
  }
  try { if (typeof c10Voice === 'function') txt = c10Voice(S, d, txt, 'crit', true); } catch (e) {}
  txt = smPolish(S, '@' + last.a.h + ' ' + txt, false);
  if (smSimilar(S, txt, 0.6)) return null;
  smRemember(S, txt);
  smRelAdd(S, d.h, last.a.h, act === 'cede' ? 0.4 : -0.5);
  c.smThr = (c.smThr || 0) + 1;
  return { a: c10Author(d), t: txt, tone: act === 'cede' ? 'pos' : c.tone, l: Math.round(Math.exp(rr(S, 0, 3))), d: S.day, sm: { act, t: t || '' } };
}

/* ---------- 11) Gündem ---------- */
function smAgFind(S, id){ return S.sm.ag.find(a => a.id === id); }
function smAgPush(S, o){
  const A = S.sm.ag; let a = smAgFind(S, o.id) || A.find(x => x.tag === o.tag);
  if (a){ a.heat = Math.min(100, a.heat + o.heat * 0.6); a.last = S.day; if (o.pol) a.pol = o.pol; return a; }
  if (o.heat >= 50) for (const x of A) x.heat *= 0.8;               // haber döngüsü: büyük konu küçükleri gömer
  a = { id: o.id, tag: o.tag, n: o.n, t: o.t, pol: o.pol || 0, heat: Math.min(100, o.heat), pk: o.heat, born: S.day, last: S.day, esc: 0, rel: o.rel ?? -1 };
  A.unshift(a); A.sort((x, y) => y.heat - x.heat); if (A.length > SM_AG_MAX) A.length = SM_AG_MAX;
  return a;
}
function smAgStage(S, a){ return S.day - a.born <= 1 ? 'Kıvılcım' : a.heat >= a.pk * 0.92 && a.pk >= 35 ? 'Zirvede' : a.heat >= a.prev ? 'Yükselişte' : 'Sönüyor'; }
function smAgDaily(S){
  const A = S.sm.ag;
  for (const a of A){
    a.prev = a.heat;
    a.heat *= a.pol < 0 && a.esc ? 0.9 : 0.86;
    for (const p of S.social.posts){ if (p.day !== S.day) break; if (p.tag && p.tag === a.tag) a.heat = Math.min(100, a.heat + 4); }
    a.pk = Math.max(a.pk, a.heat);
    // tırmanma: olumsuz konu eşikleri geçerse
    if (a.pol < 0 && a.heat >= 60 && a.esc < 1){ a.esc = 1; smShift(S, { t: -3 }, a.tag + ' büyüdü, basına taşındı', null, true);
      smPostSafe(S, { a: newsAuthor(S), title: `${a.n} tartışması büyüyor`, text: `${S.brand} Labs hakkında ${a.tag} etiketi gündemin üst sıralarına çıktı. Şirketten henüz kapsamlı bir açıklama gelmedi.`, topic: 'crisis', ctx: { b: S.brand, k: a.n }, tag: a.tag, mood: -0.6, nComments: 3 }); }
    if (a.pol < 0 && a.heat >= 85 && a.esc < 2){ a.esc = 2; smShift(S, { t: -5, q: -2 }, a.tag + ' linç kampanyasına dönüştü', null, true); 
      smPostSafe(S, { a: inflAuthor(S), text: `${a.tag} artık bir linç kampanyası. ${S.brand} Labs ya şimdi konuşur ya hiç.`, topic: 'crisis', ctx: { b: S.brand }, tag: a.tag, mood: -0.8, nComments: 4, reach: 1.6 });
      if (typeof notify === 'function') try { notify(S, `${a.tag} linç kampanyasına dönüştü. Açıklama yapmak tırmanmayı keser.`, 'bad'); } catch (e) {} }
  }
  for (let i = A.length - 1; i >= 0; i--) if (A[i].heat < 4) A.splice(i, 1);
  A.sort((x, y) => y.heat - x.heat);
  // gündemden ortam gönderisi
  const top = A[0];
  if (top && top.heat >= 18 && rnd(S) < 0.35){
    const neg = top.pol < 0, F = smFacts(S, null), f = smPickFact(S, F, top.t, neg ? -1 : 1) || smPickFact(S, F, top.t, 0);
    const lead = pickArr(S, neg ? ['Herkes aynı şeyi konuşuyor: ', 'Gündem değişmiyor: ', 'Bugün de konu aynı: '] : ['Günün konusu: ', 'Akış bununla dolu: ', 'Herkes bundan bahsediyor: ']);
    const au = rnd(S) < 0.4 ? inflAuthor(S) : rnd(S) < 0.5 ? newsAuthor(S) : randUser(S);
    smPostSafe(S, { a: au, text: lead + top.tag + (f ? '. ' + TR.up1(f.txt) + '.' : '.'), topic: neg ? (top.t === 'r' ? 'latency' : 'crisis') : top.t === 'q' ? 'release' : 'general', ctx: smFacts(S, null).v, tag: top.tag, mood: neg ? -0.4 : 0.4, nComments: 2 + (top.heat > 50 ? 2 : 0) });
  }
}
function smPostSafe(S, o){ try { return addPost(S, o); } catch (e) { smErr(S, 'post', e); return null; } }

/* ---------- 12) Rakip PR tepkileri ---------- */
function smRivalReact(S, kind, a){
  if (!S.rivals || rnd(S) > 0.55) return;
  const live = S.rivals.map((r, i) => i).filter(i => !S.rivals[i].acq && S.rivals[i].models && S.rivals[i].models.length && !(S.rv && S.rv[i] && S.rv[i].dead));
  if (!live.length) return;
  const agg = live.filter(i => ['leader', 'counter'].includes(RIVAL_AI[i] && RIVAL_AI[i].pers));
  const i = pickArr(S, agg.length ? agg : live), R = RIVALS[i];
  let text;
  if (kind === 'out') text = pickArr(S, [`Bugün servisimiz yine kesintisizdi. Kimseyi kastetmiyoruz 😉 ${a.tag}`, `Kesintiden bıkanlar için kapımız açık. Geçiş ücretsiz. ${a.tag}`, `İstikrar bir özellik değil, standarttır. ${a.tag}`]);
  else if (kind === 'lead') text = pickArr(S, ['Benchmark tablosu bir günlük fotoğraftır. Asıl sınav üretimde.', 'Tebrikler. Biz de hazırlanıyoruz, görüşürüz.', 'Puanlar güzel, müşteriler ne diyor ona bakalım.']);
  else if (kind === 'price') text = pickArr(S, [`Fiyat artışından etkilenen geliştiricilere: ilk ay bizden. ${a.tag}`, `Bizde fiyat değişmedi. Sadece söylüyoruz. ${a.tag}`]);
  else if (kind === 'trust') text = pickArr(S, [`Şeffaflık raporumuzu her çeyrek yayımlıyoruz. ${a.tag}`, `Güven pazarlamayla kazanılmaz. ${a.tag}`]);
  if (!text) return;
  smPostSafe(S, { a: rivalAuthor(i), text, topic: 'rival', ctx: smFacts(S, null).v, tag: a.tag, nComments: 3, reach: 1.2 });
  smShift(S, kind === 'out' ? { r: -1.5 } : kind === 'price' ? { p: -1.5 } : kind === 'trust' ? { t: -1 } : { q: -0.5 }, `${R.name} bu konuyu kullandı`, null, true);
}

/* ---------- 13) Olay dinleyicileri ---------- */
smOn('release', (S, x) => {
  const m = x.m; if (!m) return;
  const t = topRivalInfo(S), gap = m.score - (t.q || 0), rel = gap / Math.max(1, t.q || 1);
  const d = clamp(rel * 40, -6, 10);
  smShift(S, { q: d }, `${m.name} yayınlandı (${gap >= 0 ? '+' : '−'}${Math.abs(Math.round(gap))} puan rakibe göre)`);
  if (m.open) smShift(S, { o: 8, t: 1 }, `${m.name} açık ağırlıklı yayınlandı`, ['dev', 'eth', 'med', 'usr'], true);
  if (hasPrice(m)){ const px = priceX(m); smShift(S, { p: clamp((1 - px) * 18, -10, 8) }, `${m.name} fiyatı ${px > 1.15 ? 'yüksek bulundu' : px < 0.9 ? 'uygun bulundu' : 'makul bulundu'}`, null, true); }
  const a = smAgPush(S, { id: 'rel:' + m.name, tag: smTag(m.name), n: m.name, t: 'q', pol: gap >= 0 ? 1 : -1, heat: 28 + clamp(rel * 60, -10, 30) });
  if (gap > 0 && rel > 0.03) smRivalReact(S, 'lead', a);
  S.sm.ev.lastRel = S.day;
});
smOn('rivalRelease', (S, x) => {
  const bm = bestModel(S); if (!bm || !x.flag) return;
  if (x.flag.score > bm.score && x.old <= bm.score){ smShift(S, { q: -4 }, `${RIVALS[x.i].name}, ${x.flag.name} ile seni geçti`); smAgPush(S, { id: 'rr:' + x.flag.name, tag: smTag(x.flag.name), n: x.flag.name, t: 'q', pol: -1, heat: 30 }); }
});
smOn('crisis', (S, x) => {
  const c = x.c, C = CRISES[c.t]; if (!C) return;
  const f = [0, 1, 1.6, 2.3][c.sev] || 1;
  const d = { leak: { s: -9, t: -6 }, ransom: { s: -8, r: -4 }, outage: { r: -9 }, lawsuit: { t: -5 }, pr: { t: -9 } }[c.t] || { t: -4 };
  for (const k in d) d[k] *= f;
  smShift(S, d, C.name + ' (' + (SEV_NAMES[c.sev] || '') + ')');
  const a = smAgPush(S, { id: 'cr:' + c.uid, tag: smTag(S.brand + ' ' + C.name), n: C.name, t: Object.keys(d)[0], pol: -1, heat: 35 + c.sev * 15 });
  if (c.t === 'outage') smRivalReact(S, 'out', a); else if (c.t === 'pr' || c.t === 'leak') smRivalReact(S, 'trust', a);
});
smOn('crisisHandled', (S, x) => {
  smShift(S, { t: 3 }, 'Krize hızlı müdahale edildi');
  for (const a of S.sm.ag) if (a.id === 'cr:' + x.uid) a.heat *= 0.6;
});
smOn('price', (S, x) => {
  const m = x.m; if (!m || !hasPrice(m)) return;
  const old = x.oldX || 1, nx = priceX(m), dx = nx - old;
  if (Math.abs(dx) < 0.05) return;
  smShift(S, { p: clamp(-dx * 25, -12, 10) }, `${m.name} fiyatı ${dx > 0 ? 'arttı' : 'düştü'} (%${Math.round(Math.abs(dx) / old * 100)})`, ['dev', 'usr', 'ent'], true);
  if (dx > 0.15){ const a = smAgPush(S, { id: 'pr:' + m.name + S.day, tag: smTag(m.name + ' Zam'), n: m.name + ' zammı', t: 'p', pol: -1, heat: 20 + dx * 40 }); smRivalReact(S, 'price', a); }
});
smOn('open', (S, x) => { smShift(S, { o: 10, t: 2 }, `${x.name || 'Model'} ağırlıkları açıldı`, ['dev', 'eth', 'med', 'usr'], true); smAgPush(S, { id: 'op:' + x.name, tag: smTag((x.name || 'Açık') + ' Açık'), n: (x.name || 'Model') + ' açıldı', t: 'o', pol: 1, heat: 25 }); });
smOn('answer', (S, x) => {
  if (x.choice === 'truth') smShift(S, { t: 1.5 }, 'Bir soruya dürüst cevap verildi', null, true);
  if (x.caught) { smShift(S, { t: -9 }, 'Yalan yakalandı', null, true); const a = smAgPush(S, { id: 'lie:' + S.day, tag: smTag(S.brand + ' Yalan'), n: 'Yalan iddiası', t: 't', pol: -1, heat: 55 }); smRivalReact(S, 'trust', a); }
});
smOn('post', (S, x) => {
  if (x.type === 'apology'){ let hit = false; for (const a of S.sm.ag) if (a.pol < 0){ a.heat *= 0.55; hit = true; } if (hit) smShift(S, { t: 2.5 }, 'Şeffaf açıklama gündemi yatıştırdı', null, true); }
  if (x.type === 'blog') smShift(S, { q: 1.2, o: 1 }, 'Teknik blog yazısı ilgi gördü', ['dev', 'eth'], true);
  if (x.type === 'meme'){ const neg = S.sm.ag.some(a => a.pol < 0 && a.heat > 40); smShift(S, neg ? { t: -2 } : { q: 0.6 }, neg ? 'Kriz ortasında mizah paylaşımı tepki çekti' : 'Mizah paylaşımı sevildi', neg ? null : ['usr'], true); }
  if (x.type === 'announce' || x.type === 'demo') smShift(S, { q: 0.8 }, 'Model tanıtımı ilgi gördü', ['usr', 'dev', 'inv'], true);
});
smOn('legacySent', (S, x) => {     // eski katmanların kamuoyu değişimleri matrise yansır
  const t = S.sm.ctxT || (x.d < 0 ? 't' : 'q');
  smShift(S, { [t]: x.d * 0.6 }, null);
});
smOn('day', (S) => {
  const L = S.lastDay, E = S.sm.ev;
  if (L && S.slots && S.slots.some(i => i >= 0)){
    const sv = L.served ?? 1;
    if (sv < 0.9){ E.outRun++; smShift(S, { r: -Math.min(2.2, (0.9 - sv) * 14) }, `Servis %${Math.round(sv * 100)} seviyesine düştü`, ['dev', 'ent', 'usr']);
      if (E.outRun === 2 || (E.outRun > 2 && E.outRun % 6 === 2)){ const a = smAgPush(S, { id: 'out:' + Math.floor(S.day / 20), tag: smTag(S.brand + ' Çöktü Mü'), n: 'Servis kesintileri', t: 'r', pol: -1, heat: 22 + E.outRun * 5 }); smRivalReact(S, 'out', a); } }
    else { E.outRun = 0; if (sv >= 0.99) smShift(S, { r: 0.25 }, null, ['dev', 'ent']); }
  }
  const C = S.c10;
  if (C && C.ev){
    if (C.ev.pk === S.day) { smShift(S, { t: 5 }, 'Yol haritası sözü tutuldu', null, true); smAgPush(S, { id: 'pk:' + S.day, tag: smTag(S.brand + ' Sözünü Tuttu'), n: 'Söz tutuldu', t: 't', pol: 1, heat: 24 }); }
    if (C.ev.pf === S.day) { smShift(S, { t: -6 }, 'Yol haritası sözü tutulmadı', null, true); smAgPush(S, { id: 'pf:' + S.day, tag: smTag(S.brand + ' Söz'), n: 'Tutulmayan söz', t: 't', pol: -1, heat: 34 }); }
    if (C.st && C.st.caught > E.caught){ if (S.day > 1) smEmit(S, 'answer', { caught: true }); E.caught = C.st.caught; }
  }
  smDailyMatrix(S);
  smAgDaily(S);
  smThreadsDaily(S);
});

/* ---------- 14) Günlük konuşma zincirleri ---------- */
function smThreadsDaily(S){
  const posts = S.social.posts.filter(p => S.day - p.day <= 4).slice(0, 14);
  let n = 0, budget = 2 + Math.floor(rnd(S) * 3);
  for (const p of posts){
    if (n >= budget) break;
    for (const c of p.comments){
      if (n >= budget || c.me || !c.r) continue;
      const last = c.r[c.r.length - 1];
      if (last && last.sm && !last.me && last.d < S.day && c.r.length < 7 && (c.smThr || 0) < 2 && rnd(S) < 0.45){
        const r = smCounter(S, p, c); if (r){ c.r.push(r); n++; S.sm.st.thr++; p.cn++; }
        // karşı taraf da bazen bir kez daha döner
        if (r && r.sm.act === 'dbl' && rnd(S) < 0.35 && c.r.length < 7){ const back = smReplyTo(S, p, { ...c, t: r.t, a: r.a, r: c.r }, rnd(S) < 0.5 ? 'rebut' : 'ask'); if (back && !smSimilar(S, back.t, 0.6)){ smRemember(S, back.t); c.r.push(back); n++; } }
      } else if (!c.r.length && (c.smw || (c.l > 30 && rnd(S) < 0.18))){
        const r = smReplyTo(S, p, c, c.smw ? 'fix' : null); if (r && !smSimilar(S, r.t, 0.6)){ smRemember(S, r.t); c.r.push(r); n++; p.cn++; }
      }
    }
  }
}

/* ---------- 15) Mevcut hatta bağlanma (tek kanca noktası) ---------- */
const _smGenComment = genComment;
genComment = function(S, p){
  smEnsure(S); const st = S.sm.st; st.gen++;
  let best = null;
  for (let k = 0; k < 4; k++){
    let c = null, own = false;
    const mediaPost = p.ugc || (p.topic && String(p.topic).indexOf('ms') === 0);
    if (!mediaPost && rnd(S) < (k ? 0.55 : 0.34)){
      try {
        const about = p.about || (typeof inferAbout === 'function' ? inferAbout(S, p) : { k: 'market' });
        const d = c10PickPerson(S, p, about), ps = c10Per(S, d), r = smCompose(S, p, d, ps);
        if (r){ c = { id: p.id * 100 + p.comments.length + 1, a: c10Author(d), t: r.text, tone: r.pol > 0 ? 'pos' : 'neg', l: Math.round(Math.exp(rr(S, 0.2, 4.4))), d: S.day, r: [], rp: false, pt: d.t, c10: { s: r.pol > 0 ? 'sup' : 'crit', k: [] }, sm: { t: r.t, pol: r.pol, f: r.f, own: 1 } }; own = true; ps.n++; ps.last = S.day; ps.ls = r.pol > 0 ? 'sup' : 'crit'; }
      } catch (e) { smErr(S, 'compose', e); }
    }
    if (!c) c = _smGenComment(S, p);
    if (!c) continue;
    const keepLow = c.a && c.a.h && C10_BY_H[c.a.h] && ['slang', 'abbr'].includes(C10_BY_H[c.a.h].vo);
    c.t = smPolish(S, c.t, keepLow);
    const g = smGate(S, c.t, c.a && C10_BY_H[c.a.h], c);
    if (g.ok){ if (g.wrong) c.smw = g.wrong; smAccept(S, c.t); if (own) st.own++; return c; }
    st.rej++;
    if (!best) best = c;
  }
  if (best){ smAccept(S, best.t); }
  return best;
};
const _smGenReply = genReply;
genReply = function(S, p, c){
  smEnsure(S);
  try {
    if (c && !c.me && !c.intent && !c.debate && !c.fight && rnd(S) < 0.85){
      for (let k = 0; k < 3; k++){ const r = smReplyTo(S, p, c); if (r && !smSimilar(S, r.t, 0.55)){ smRemember(S, r.t); S.sm.st.rep++; return r; } }
    }
  } catch (e) { smErr(S, 'reply', e); }
  const r = _smGenReply(S, p, c);
  if (r && r.t){ r.t = smPolish(S, r.t, true); smRemember(S, r.t); }
  return r;
};
const _smAddPost = addPost;
addPost = function(S, o){
  if (o && S && S.social){
    smEnsure(S);
    if (o.text) o.text = smPolish(S, o.text, false);
    if (o.title) o.title = smPolish(S, o.title, false);
    // gönderi etiketi gündemdeki bir konuyla eşleşiyorsa ısıt
    if (o.tag) for (const a of S.sm.ag) if (a.tag === o.tag) a.heat = Math.min(100, a.heat + 2);
    const t = smClaim((o.title || '') + ' ' + (o.text || '')).ts[0]; S.sm.ctxT = t || null;
  }
  const p = _smAddPost(S, o);
  if (S && S.sm) S.sm.ctxT = null;
  return p;
};
const _smAddSent = addSent;
addSent = function(S, d){ _smAddSent(S, d); if (S && S.social && d && !_smIn){ _smIn++; try { smEmit(S, 'legacySent', { d }); } finally { _smIn--; } } };
const _smOnModelReleased = onModelReleased;
onModelReleased = function(S, m, a, b){ const r = _smOnModelReleased(S, m, a, b); smEmit(S, 'release', { m }); return r; };
const _smOnRivalRelease = onRivalRelease;
onRivalRelease = function(S, i, flag, fresh, old){ const r = _smOnRivalRelease(S, i, flag, fresh, old); smEmit(S, 'rivalRelease', { i, flag, old }); return r; };
const _smOnCrisis = onCrisis;
onCrisis = function(S, c){ _smIn++; let r; try { r = _smOnCrisis(S, c); } finally { _smIn--; } smEmit(S, 'crisis', { c }); return r; };
const _smActCrisis = actCrisis;
actCrisis = function(S, uid, optId){ const r = _smActCrisis(S, uid, optId); if (r && r.ok !== false) smEmit(S, 'crisisHandled', { uid }); return r; };
const _smActSetPrice = actSetPrice;
actSetPrice = function(S, idx, pIn, pOut){ const m = S.models[idx], ox = m && hasPrice(m) ? priceX(m) : 1; const r = _smActSetPrice(S, idx, pIn, pOut); if (r && r.ok !== false) smEmit(S, 'price', { m, oldX: ox }); return r; };
const _smActOpen = actOpenWeights;
actOpenWeights = function(S, i){ const m = S.models[i], was = m && m.open; const r = _smActOpen.apply(null, arguments); if (m && !was && m.open) smEmit(S, 'open', { name: m.name }); return r; };
const _smActPost = actPost;
actPost = function(S, type, target, text){ const r = _smActPost(S, type, target, text); if (r && r.ok !== false) smEmit(S, 'post', { type }); return r; };
const _smC10Answer = c10Answer;
c10Answer = function(S, pid, cid, choice){ const r = _smC10Answer(S, pid, cid, choice); if (r && r.ok !== false) smEmit(S, 'answer', { choice }); return r; };
// kesim görüşü kişinin duruşunu etkiler
const _smC10Stance = c10Stance;
c10Stance = function(S, d, ps, about, force){
  if (force || !S.sm || !ps) return _smC10Stance(S, d, ps, about, force);
  const o = smSegScore(S, smSegOf(d)) / 120, st0 = ps.st;
  ps.st = clamp(st0 + o, -1, 1);
  try { return _smC10Stance(S, d, ps, about, force); } finally { ps.st = st0; }
};
const _smTick = tick;
tick = function(S){
  const d0 = S.day; const r = _smTick(S);
  if (S.day !== d0 && S.social){ smEnsure(S); smEmit(S, 'day', {}); }
  return r;
};
const _smNewGame = newGame;
newGame = function(a, b){ const S = _smNewGame(a, b); if (S) S.sm = smState(); return S; };
if (typeof MIGRATIONS !== 'undefined') MIGRATIONS.push(st => { if (st && st.social) smEnsure(st); });
if (typeof module !== 'undefined' && module.exports) Object.assign(module.exports, { smEnsure, smEmit, smShift, smOverall, smSegScore, smTopicScore, smFacts, smClaim, smReplyTo, TR });
