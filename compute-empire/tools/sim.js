// Otomatik oyuncu + sosyal kalite ölçümü.
// Kullanım: node tools/sim.js <oyun.html> [gün=365] [tohum=7] [--dump dosya.txt]
const fs = require('fs'), vm = require('vm'), path = require('path');
const load = require('./load-engine');
const file = process.argv[2], DAYS = +(process.argv[3] || 365), SEED = +(process.argv[4] || 7);
const dumpIdx = process.argv.indexOf('--dump'), dumpFile = dumpIdx > 0 ? process.argv[dumpIdx + 1] : null;
const C = load(file);
const trc = { module: { exports: {} } }; vm.createContext(trc);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/tr.js'), 'utf8') + ';this.TR=TR', trc);
const TR = trc.TR;

const S = C.newGame(1, SEED);
S.brand = S.brand || 'Nebula';
let ver = 1, t0 = Date.now(), stalls = 0;
const ok = r => r && r.ok !== false;

function bot(){
  if (S.pending){ C.actResolve(S, 0); }
  for (const c of S.crises || []) if (!c.handled){ try { const o = C.crisisOptions(S, c).find(o => !o.cost || o.cost < S.cash * 0.3); if (o) C.actCrisis(S, c.uid, o.id); } catch (e) {} }
  // yayın
  try { const q = C.relPending && C.relPending(S); if (q){ if (q.m.open) C.actRelease(S, {}, 0); else { const f = C.fairIn(q.m); C.actRelease(S, { pIn: f, pOut: f * C.PR_OUT_RATIO }, 0); } } } catch (e) {}
  // servis katmanları: en iyi kapalı model
  if (S.models.length){
    let bi = -1; S.models.forEach((m, i) => { if (!m.open && !m.retired && (bi < 0 || m.score > S.models[bi].score)) bi = i; });
    if (bi >= 0) for (let s = 0; s < 3; s++) if (S.slots[s] !== bi) try { C.actSetSlot(S, s, bi); } catch (e) {}
  }
  // eğitim
  if (!S.job && !(C.relPending && C.relPending(S))){
    for (const P of [70e9, 30e9, 14e9, 8e9, 3e9, 1e9, 4e8, 1e8]){
      const d = { P, ratio: 20, arch: P >= 30e9 ? 1 : 0, ctx: 1, spec: S.day % 3, open: ver % 4 === 0, series: 'Nova', ver: ver + '.0' };
      let pv; try { pv = C.previewDesign(S, C.normDesign(d)); } catch (e) { break; }
      if (pv.vramOk && pv.dataCost < S.cash * 0.35 && pv.days <= 45){ if (ok(C.actTrainDesign(S, d))){ ver++; } break; }
    }
  }
  // GPU
  if (S.cash > 60000 && S.day % 7 === 0){
    let best = 0; for (let i = 0; i < 16; i++) try { if (C.gpuAvailable(S, i)) best = i; } catch (e) {}
    try { C.actBuyGPUAuto(S, best, Math.floor(S.cash * 0.25 / C.gpuPrice(S, best))); } catch (e) {}
  }
  if (S.day % 30 === 5 && S.cash > 40000) try { C.actHire(S, 'res', 1); C.actHire(S, 'eng', 1); } catch (e) {}
  if (S.day % 60 === 10) try { C.actRaise(S); } catch (e) {}
  if (S.day % 3 === 0) try { if (!S.researching){ const t = (C.TECHS || []).find(t => C.techAvailable(S, t.id) && !S.techs.includes(t.id)); if (t) C.actResearch(S, t.id); } } catch (e) {}
  // sosyal: duyuru, yanıt, soruya cevap
  try {
    if (S.day % 6 === 0){ const tg = C.postTargets(S, 'announce'); if (tg.length) C.actPost(S, 'announce', tg[0]); else if (S.day % 12 === 0) C.actPost(S, S.sent < -15 ? 'apology' : 'meme'); }
    const mine = S.social.posts.find(p => p.mine && S.day - p.day <= 3);
    if (mine && S.day % 2 === 0){ const c = mine.comments.find(c => !c.rp && !c.me); if (c && C.actReplyAny) C.actReplyAny(S, mine.id, c.id, c.tone === 'neg' ? 'sorry' : 'thanks', ''); }
    if (C.c10AnswerOptions) for (const p of S.social.posts.slice(0, 8)) for (const c of p.comments) if (c.c10q && !c.c10q.a){ const o = C.c10AnswerOptions(S, p, c); if (o){ C.c10Answer(S, p.id, c.id, S.day % 5 ? 'truth' : 'spin'); } }
  } catch (e) {}
}

// ---------- ölçüm ----------
const seenC = new Set(), seenR = new Set(), rows = [];
const norm = t => t.toLocaleLowerCase('tr').replace(/@\S+/g, '').replace(/\d+([.,]\d+)?/g, '#').replace(/[^\p{L}#\s]/gu, ' ').replace(/\s+/g, ' ').trim();
const sh = t => { const w = norm(t).split(' '); const s = new Set(); for (let i = 0; i + 2 < w.length; i++) s.add(w[i] + ' ' + w[i + 1] + ' ' + w[i + 2]); if (w.length < 3) s.add(w.join(' ')); return s; };
const jac = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / (a.size + b.size - n || 1); };
let collectMs = 0;
function collect(){ const c0 = Date.now(); collect0(); collectMs += Date.now() - c0; }
function collect0(){
  for (const p of S.social.posts) for (const c of p.comments){
    const k = p.id + ':' + c.id;
    if (!c.me && !seenC.has(k)){ seenC.add(k); rows.push({ k: 'c', t: c.t, h: c.a && c.a.h, d: S.day, ptxt: p.text }); }
    (c.r || []).forEach((r, i) => { const kk = k + ':' + i + ':' + (r.t || '').slice(0, 20); if (!r.me && !seenR.has(kk)){ seenR.add(kk); rows.push({ k: 'r', t: r.t, h: r.a && r.a.h, d: S.day, parent: c.t }); } });
  }
}
let maxStall = 0, sentSum = 0;
for (let i = 0; i < DAYS; i++){
  const d0 = S.day; bot(); C.tick(S);
  if (S.day === d0){ stalls++; S.pending = null; C.tick(S); }
  if (S.bankrupt){ S.bankrupt = false; S.cash = 1e5; S.debtDays = 0; }
  collect(); sentSum += S.social.sent;
}
const ms = Date.now() - t0 - collectMs;
// metrikler
const txt = rows.map(r => r.t);
const exact = new Set(txt.map(norm)).size;
const shs = rows.map(r => sh(r.t));
let near = 0; for (let i = 0; i < shs.length; i++){ for (let j = Math.max(0, i - 400); j < i; j++) if (jac(shs[i], shs[j]) >= 0.5){ near++; break; } }
const gram = txt.reduce((a, t) => a + TR.errors(t), 0);
const gramTexts = txt.filter(t => TR.errors(t) > 0);
const factRe = /\d|%/;
const facts = txt.filter(t => factRe.test(t)).length;
const reps = rows.filter(r => r.k === 'r');
const generic = reps.filter(r => norm(r.t).split(' ').length <= 5).length;
// tutarlılık: yanıt, üst yorumdaki bir konu sözcüğünü ya da sayıyı paylaşıyor mu
const TOPG = { q: /puan|fark|test|önde|geride|kod|matematik|muhakeme|benchmark|model/, p: /fiyat|pahalı|ucuz|token|kat daha|zam/, r: /servis|kesinti|çök|yavaş|sorunsuz|istikrar|kapasite/,
  t: /güven|yalan|söz|itibar|dürüst|şeffaf/, s: /güvenlik|sızıntı|saldırı|fidye/, o: /açık|ağırlık|lisans|indir/, u: /kullanıcı|gelir|kazan|büyü/ };
const topics = t => { const l = String(t || '').toLocaleLowerCase('tr').replace(/[@#]\S+/g, ''); return Object.keys(TOPG).filter(k => TOPG[k].test(l)); };
const coh = reps.filter(r => { const a = topics(r.parent), b = topics(r.t); return a.some(x => b.includes(x)) || (/\?/.test(r.t) && (r.parent.match(/\d+/g) || []).some(n => n.length > 1 && r.t.includes(n))); }).length;
const ppl = new Map(); rows.forEach(r => { if (r.h) ppl.set(r.h, (ppl.get(r.h) || 0) + 1); });
const out = {
  dosya: path.basename(file), gun: S.day, sure_ms: ms, ms_gun: +(ms / Math.max(1, S.day)).toFixed(2), takilma: stalls,
  yorum: rows.filter(r => r.k === 'c').length, yanit: reps.length,
  benzersiz_oran: +(exact / txt.length).toFixed(3), yakin_tekrar_oran: +(near / txt.length).toFixed(3),
  ek_hatasi: gram, ek_hatali_metin: gramTexts.length,
  veri_atif_oran: +(facts / txt.length).toFixed(3),
  bos_yanit_oran: +(generic / Math.max(1, reps.length)).toFixed(3),
  yanit_tutarlilik_oran: +(coh / Math.max(1, reps.length)).toFixed(3),
  farkli_kisi: ppl.size, kayit_kb: Math.round(JSON.stringify(S).length / 1024),
  modeller: S.models.length, kamuoyu: Math.round(S.social.sent), kamuoyu_ort: Math.round(sentSum / DAYS), nakit: Math.round(S.cash),
};
console.log(JSON.stringify(out, null, 1));
if (dumpFile){
  fs.writeFileSync(dumpFile, rows.map(r => `[${r.d}] ${r.k === 'r' ? '   ↳ ' : ''}${r.t}${r.k === 'r' ? '\n        (üst: ' + (r.parent || '').slice(0, 90) + ')' : ''}`).join('\n') + '\n\n--- EK HATALARI ---\n' + gramTexts.slice(0, 80).join('\n'));
}
