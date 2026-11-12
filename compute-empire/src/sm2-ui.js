/* ============================================================
   COMPUTE EMPIRE v13 — SOSYAL MOTOR 2 ARAYÜZÜ
   Gündem sayfasına: kamuoyu haritası (kesim × konu), gündem yaşam döngüsü, "neden değişti", motor istatistikleri.
   Yorumlara: tartışma turu, yanlış bilgi ve yanıt türü rozetleri.
   ============================================================ */
(function(){
  if (typeof opinionSub !== 'function' || typeof smEnsure !== 'function') return;
  const SM_TS = { q: 'Kalite', p: 'Fiyat', r: 'Servis', t: 'Güven', s: 'Güvnl.', o: 'Açık' };
  const SM_SS = { dev: 'Geliştirici', ent: 'Kurumsal', usr: 'Kullanıcı', inv: 'Yatırımcı', med: 'Basın', eth: 'Etik' };
  const sg = x => { const r = Math.round(x); return (r >= 0 ? '+' : '−') + Math.abs(r); };
  const sg1 = x => { const r = Math.round(x * 10) / 10; return (r >= 0 ? '+' : '−') + Math.abs(r).toFixed(1).replace('.', ','); };
  const e = s => (typeof esc === 'function' ? esc(s) : String(s));
  const cell = v => {
    const a = Math.min(70, Math.round(Math.abs(v) * 0.9));
    const bg = v >= 0 ? `color-mix(in srgb, var(--good) ${a}%, transparent)` : `color-mix(in srgb, var(--bad) ${a}%, transparent)`;
    return `<td class="smc" style="background:${bg}" title="${sg(v)}">${sg(v)}</td>`;
  };
  function spark(S){
    const H = S.sm.hist; if (H.length < 3) return '';
    const W = 220, Ht = 40, xs = H.map(h => h[0]), x0 = xs[0], x1 = xs[xs.length - 1] || x0 + 1;
    const pts = H.map(h => `${((h[0] - x0) / Math.max(1, x1 - x0) * W).toFixed(1)},${(Ht / 2 - clamp(h[1], -100, 100) / 100 * (Ht / 2 - 2)).toFixed(1)}`).join(' ');
    return `<svg class="smspark" viewBox="0 0 ${W} ${Ht}" preserveAspectRatio="none" aria-label="Genel görüş geçmişi"><line x1="0" y1="${Ht / 2}" x2="${W}" y2="${Ht / 2}" class="z"/><polyline points="${pts}"/></svg>`;
  }
  function mapCard(S){
    const o = smOverall(S), pull = smPull(S);
    const head = `<tr><th></th>${SM_TOP.map(t => `<th title="${SM_TN[t]}">${SM_TS[t]}</th>`).join('')}<th>Genel</th></tr>`;
    const rows = SM_SEG.map(s => `<tr><th class="l" title="${s.n} · nüfusun %${Math.round(s.w * 100)}">${SM_SS[s.id]}</th>${SM_TOP.map(t => cell(S.sm.m[s.id][t])).join('')}${cell(smSegScore(S, s.id))}</tr>`).join('');
    const tot = `<tr class="tot"><th class="l">Toplam</th>${SM_TOP.map(t => cell(smTopicScore(S, t))).join('')}${cell(o)}</tr>`;
    return `<div class="card smcard"><div class="h"><h2>Kamuoyu haritası</h2><span class="x">Genel ${sg(o)} · kamuoyuna ${sg1(pull)}/gün</span></div>
      <div class="smtbl"><table>${head}${rows}${tot}</table></div>
      <div class="row small dim" style="margin-top:6px;gap:10px;align-items:center">${spark(S)}<span>Her kesim farklı konulara önem verir: geliştirici kaliteye ve açıklığa, kurumsal müşteri güvenilirliğe, etik çevresi güvenliğe bakar. Basın tüm kesimleri etkiler. Servis, kriz ve liderlik kamuoyuna zaten doğrudan yansır; bu harita bunlara ek olarak fiyat, açıklık, dürüstlük, gündem ve rakip hamlelerini ekler.</span></div></div>`;
  }
  function agCard(S){
    const A = S.sm.ag;
    const rows = A.length ? A.map(a => {
      const st = smAgStage(S, a), neg = a.pol < 0;
      return `<div class="smag"><div class="row small"><b class="sp">${e(a.tag)}</b><span class="pill ${neg ? 'bad' : a.pol > 0 ? 'good' : ''}" style="padding:2px 6px">${st}</span></div>
        <div class="row small dim"><span class="sp">${e(a.n)} · ${SM_TN[a.t] || SM_TL[a.t] || ''}${a.esc ? ' · <b class="t-bad">' + (a.esc > 1 ? 'Linç' : 'Basında') + '</b>' : ''}</span><span class="num">${Math.round(a.heat)}</span></div>
        <div class="smbar"><i style="width:${Math.round(a.heat)}%;background:${neg ? 'var(--bad)' : 'var(--good)'}"></i></div></div>`;
    }).join('') : '<div class="small dim">Şu an öne çıkan bir konu yok.</div>';
    const hot = A.some(a => a.pol < 0 && a.heat >= 40);
    return `<div class="card smcard"><div class="h"><h2>Gündem</h2><span class="x">${A.length} konu</span></div>${rows}
      ${hot ? '<div class="small t-warn" style="margin-top:8px">Olumsuz bir konu kızışıyor. "Açıklama / özür" paylaşımı ısıyı yaklaşık yarıya indirir; mizah paylaşımı ters teper. 60 ısıda basına, 85 ısıda linç kampanyasına dönüşür.</div>' : '<div class="small dim" style="margin-top:8px">Konular kıvılcım → yükseliş → zirve → sönüş döngüsünden geçer. Büyük bir konu küçükleri gündemden iter.</div>'}</div>`;
  }
  function whyCard(S){
    const W = S.sm.why.slice(0, 8);
    const rows = W.length ? W.map(w => `<div class="row small smwhy"><span class="dim">${typeof ago === 'function' ? ago(w.d) : w.d}</span><span class="sp">${e(w.txt)}${w.n > 1 ? ' <span class="dim">(' + w.n + ' gün)</span>' : ''}</span><span class="num ${w.v >= 0 ? 'up' : 'dn'}">${sg1(w.v)} ${SM_TN[w.t] ? '<span class="dim">' + SM_TN[w.t] + '</span>' : ''}</span></div>`).join('') : '<div class="small dim">Henüz kayda değer bir değişim yok.</div>';
    const st = S.sm.st;
    return `<div class="card smcard"><div class="h"><h2>Neden değişti?</h2></div>${rows}
      <div class="small dim" style="margin-top:8px">Sosyal motor: ${num(st.gen)} yorum üretildi · ${num(st.dup)} tekrar ve ${num(st.real)} gerçek dışı iddia elendi · ${num(st.rep)} bağlamlı yanıt · ${num(st.thr)} tartışma turu · ${num(st.conc)} geri adım</div></div>`;
  }
  function smCards(){
    if (!S || !S.social) return '';
    try { smEnsure(S); return `<div class="grid g2 smgrid">${mapCard(S)}${agCard(S)}</div>${whyCard(S)}`; } catch (err) { console.error('sm2 ui', err); return ''; }
  }
  const _op = opinionSub;
  opinionSub = function(){ return smCards() + _op(); };

  // Yorum rozetleri
  if (typeof cBadge === 'function'){
    const _cb = cBadge;
    cBadge = function(c){
      let h = _cb(c);
      if (c.smThr) h += ` <span class="cbadge deb">Tartışma · ${c.smThr + 1} tur</span>`;
      if (c.smw && c.r && c.r.some(r => r.sm && r.sm.act === 'fix')) h += ' <span class="cbadge smfix">Yanlış bilgi</span>';
      return h;
    };
  }
  const ACT = { fix: ['Düzeltme', 'smfix'], rebut: ['Karşı görüş', 'smreb'], agree: ['Destek', 'smagr'], ask: ['Kaynak istedi', 'smask'], answer: ['Cevap', 'smask'], dbl: ['Üsteledi', 'smreb'], cede: ['Geri adım', 'smagr'], src: ['Kaynak', 'smask'] };
  if (typeof commentHtml === 'function'){
    const _ch = commentHtml;
    commentHtml = function(p, c){
      let h = _ch(p, c);
      if (!c.r || !c.r.length || !c.r.some(r => r.sm)) return h;
      let at = h.indexOf('class="replies"'); if (at < 0) return h;
      for (const r of c.r){
        const needle = `<b>${e(r.a.n)}</b>`, i = h.indexOf(needle, at); if (i < 0) continue;
        const j = i + needle.length;
        if (r.sm && ACT[r.sm.act]){ const [n, cls] = ACT[r.sm.act]; h = h.slice(0, j) + ` <span class="cbadge ${cls}">${n}</span>` + h.slice(j); at = j + 40; }
        else at = j;
      }
      return h;
    };
  }
})();
