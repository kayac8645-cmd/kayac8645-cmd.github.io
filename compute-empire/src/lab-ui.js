/* ============================================================
   COMPUTE EMPIRE v13 — İŞTİRAKLER ARAYÜZÜ (Şirket → İştirakler)
   ============================================================ */
(function(){
  if (typeof BIZ_VIEWS === 'undefined' || typeof actLabBuy !== 'function') return;
  const e = s => esc(String(s));
  const POL = { ind: 'Bağımsız marka', int: 'Entegrasyon', strip: 'Parçalanıyor' };
  let focus = null, shown = 12;
  function subsCard(){
    const L = labEnsure(S), ids = Object.keys(L.subs).map(Number);
    const rows = ids.map(i => {
      const s = L.subs[i], r = S.rivals[i], rv = S.rv[i], R = RIVALS[i], day = (rv.rev || 0) - (rv.cost || 0);
      const head = `<div class="row"><b class="sp">${e(R.name)}</b><span class="pill ${s.pol === 'int' ? 'warn' : 'good'}">${POL[s.pol]}</span></div>
        <div class="small dim">Puan ${fmtScore(r.q)} · ${fmtShort(r.users || 0)} kullanıcı · ${fmtShort(rv.n || 0)} GPU · ${S.day - s.d} gündür senin</div>`;
      if (s.pol === 'int'){
        const p = clamp((S.day - s.start) / (s.end - s.start), 0, 1);
        return `<div class="item">${head}<div class="smbar" style="margin-top:6px"><i style="width:${Math.round(p * 100)}%;background:var(--warn)"></i></div>
          <div class="small dim">${Math.max(0, s.end - S.day)} gün kaldı${s.loss ? ` · kilit çalışan kaybı %${Math.round(s.loss * 100)}` : ''}. Bitince kadronun %60'ı, kullanıcıların yarısı, nakdi ve Ar-Ge birikimi sana geçer.</div></div>`;
      }
      return `<div class="item">${head}
        <div class="small" style="margin-top:4px">Günlük kâr/zarar <b class="${day >= 0 ? 'up' : 'dn'}">${day >= 0 ? '+' : '−'}${money(Math.abs(day))}</b> · sana aktarılan toplam <b class="${s.prof >= 0 ? 'up' : 'dn'}">${money(s.prof)}</b></div>
        <div class="small" style="margin-top:6px">Kâr aktarımı</div><div class="hdc">${[['div0', 'Yok (büyüsün)', 0], ['div5', '%50', 0.5], ['div1', '%100', 1]].map(([k, n, v]) => `<button class="chip ${s.div === v ? 'on' : ''}" data-a="labpol" data-v="${i}:${k}">${n}</button>`).join('')}</div>
        <div class="row" style="gap:6px;margin-top:8px"><button class="btn sm" data-a="labpol" data-v="${i}:int" style="flex:1">${armedLabel('labint' + i, 'Entegre et')}</button><button class="btn sm" data-a="labpol" data-v="${i}:strip" style="flex:1">${armedLabel('labstr' + i, 'Parçala')}</button></div>
        <div class="small dim" style="margin-top:4px">Bağımsız marka kendi modellerini çıkarmaya devam eder; zararı da sana yansır. AGI'ye ulaşırsa zafer senin sayılır.</div></div>`;
    }).join('');
    const pend = L.pend.map(p => `<div class="item"><div class="row"><b class="sp">${e(RIVALS[p.i].name)}</b><span class="pill">İncelemede</span></div><div class="small dim">${money(p.cost)} bloke · ${Math.max(0, p.until - S.day)} gün · onay ihtimali %${Math.round(p.p * 100)}</div></div>`).join('');
    return `<div class="card"><div class="h"><h2>İştiraklerin</h2><span class="x">${ids.length} şirket</span></div>${rows || pend ? `<div class="list">${pend}${rows}</div>` : '<div class="small dim">Henüz iştirakin yok. Aşağıdan bir laboratuvar satın alabilirsin.</div>'}</div>`;
  }
  function marketCard(){
    const list = S.rivals.map((r, i) => i).filter(i => labAlive(S, i) && !labOwned(S, i)).sort((a, b) => S.rivals[b].q - S.rivals[a].q);
    if (focus != null && list.includes(focus)){ list.splice(list.indexOf(focus), 1); list.unshift(focus); }
    const rows = list.slice(0, shown).map(i => {
      const r = S.rivals[i], R = RIVALS[i], c = labCheck(S, i);
      const btn = (pol, n) => `<button class="btn sm ${pol === 'ind' ? 'pri' : ''}" data-a="labbuy" data-v="${i}:${pol}" ${c.ok ? '' : 'disabled'} style="flex:1">${armedLabel('lab' + pol + i, n)}</button>`;
      return `<div class="item ${focus === i ? 'hl' : ''}"><div class="row"><b class="sp">${e(R.name)}</b>${c.review ? `<span class="pill warn">İnceleme · onay %${Math.round((c.appr || labApproval(S)) * 100)}</span>` : ''}</div>
        <div class="small dim">Puan ${fmtScore(r.q)} · ${fmtShort(r.users || 0)} kullanıcı · ${fmtShort((S.rv[i] || {}).n || 0)} GPU · fiyat <b>${money(c.cost || labPrice(S, i))}</b></div>
        <div class="row" style="gap:6px;margin-top:6px">${btn('ind', 'Al · bağımsız')}${btn('int', 'Al · entegre')}${btn('strip', 'Al · parçala')}</div>
        ${c.ok ? '' : `<div class="small t-bad" style="margin-top:4px">${e(c.why)}</div>`}</div>`;
    }).join('');
    return `<div class="card"><div class="h"><h2>Satın alınabilir laboratuvarlar</h2><span class="x">${list.length} bağımsız</span></div>
      <div class="small dim">İlk 3'teki laboratuvarlar daha pahalıdır ve Rekabet Kurumu 30 gün inceler; ret olursa para iade edilir. Aynı anda en fazla 2 entegrasyon yürütülür.</div>
      <div class="list" style="margin-top:8px">${rows}</div>${list.length > shown ? `<button class="btn sm" data-a="labmore" style="width:100%;margin-top:8px">Daha fazla göster</button>` : ''}</div>`;
  }
  function consCard(){
    const L = S.lab, m = L.log.filter(l => / satın aldı\./.test(l.t)).slice(0, 5);
    const live = S.rivals.filter((r, i) => labAlive(S, i)).length;
    return `<div class="card"><div class="h"><h2>Sektör konsolidasyonu</h2><span class="x">${live} bağımsız laboratuvar</span></div>
      ${m.length ? m.map(l => `<div class="small"><span class="dim">${ago(l.d)} ·</span> ${e(l.t)}</div>`).join('') : '<div class="small dim">Henüz rakipler arası birleşme olmadı. Büyük rakipler zamanla küçükleri satın alır, kullanıcı ve GPU filolarını büyütür.</div>'}</div>`;
  }
  if (typeof SUBS !== 'undefined') SUBS.push(['labs', 'İştirakler']);
  BIZ_VIEWS.labs = () => { if (!S.rv) return '<div class="card"><div class="small mut">Veri yok.</div></div>'; labEnsure(S); return `<div class="grid">${subsCard()}${marketCard()}${consCard()}</div>`; };
  const _hh = handleHub;
  handleHub = function(a, el){
    const v = el.dataset.v || '';
    if (a === 'acquire'){ focus = +v; tab = 'biz'; bizSub = 'labs'; window.scrollTo(0, 0); refresh(); return true; }
    if (a === 'labmore'){ shown += 12; refresh(); return true; }
    if (a === 'labbuy'){ const [i, pol] = v.split(':'); if (!arm('lab' + pol + i)){ refresh(); return true; } focus = null; result(actLabBuy(S, +i, pol)); return true; }
    if (a === 'labpol'){ const [i, pol] = v.split(':'); if ((pol === 'int' || pol === 'strip') && !arm((pol === 'int' ? 'labint' : 'labstr') + i)){ refresh(); return true; } result(actLabPolicy(S, +i, pol)); return true; }
    return _hh(a, el);
  };
})();
