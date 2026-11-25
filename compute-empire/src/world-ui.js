/* ============================================================
   COMPUTE EMPIRE v13 — YENİ SİSTEMLER ARAYÜZÜ (Şirket → Devlet ve veri)
   ============================================================ */
(function(){
  if (typeof BIZ_VIEWS === 'undefined' || typeof actWdBid !== 'function') return;
  const e = s => esc(String(s));
  const U = { px: {}, bx: 2, sx: 1.3 };
  function tenderCard(){
    const T = S.wd.tn;
    const list = T.list.map(t => {
      const px = U.px[t.id] || 1, sc = wdTenderScore(S, t, px);
      return `<div class="item"><div class="row"><b class="sp">${e(t.who)}</b><span class="pill">${t.until - S.day} gün</span></div>
        <div class="small">${e(t.n)} · <b>${money(t.pay)}</b>/gün · ${t.days} gün</div>
        <div class="small dim">${e(t.d)} En az ${t.minScore} puan, güvenlik duruşu ${t.sec}${t.open === true ? ', açık model' : t.open === false ? ', kapalı model' : ''}.</div>
        ${t.bid ? `<div class="small t-good" style="margin-top:6px">Teklif verildi (${money(t.pay * t.bid.px)}/gün) · kazanma ihtimali %${Math.round(t.bid.p * 100)}</div>` : `
        <div class="hdc">${[[0.8, 'Ucuz %−20'], [1, 'Liste fiyatı'], [1.2, 'Pahalı %+20']].map(([v, n]) => `<button class="chip ${px === v ? 'on' : ''}" data-a="wdpx" data-v="${t.id}:${v}">${n}</button>`).join('')}</div>
        ${sc.ok ? `<div class="row small"><span class="sp">Kazanma ihtimali <b>%${Math.round(sc.p * 100)}</b> · ${sc.comp} rakip uygun · dosya bedeli ${money(t.pay * 3)}</span><button class="btn sm pri" data-a="wdbid" data-v="${t.id}">Teklif ver</button></div>` : `<div class="small t-bad">${e(sc.why)}</div>`}`}</div>`;
    }).join('');
    const act = T.act.map(c => `<div class="item"><div class="row"><b class="sp">${e(c.who)}</b><span class="pill good">${money(c.pay)}/gün</span></div><div class="small dim">${e(c.n)} · ${Math.max(0, c.end - S.day)} gün kaldı${c.bad > 2 ? ` · <b class="t-bad">SLA uyarısı ${Math.round(c.bad)}/6</b>` : ''}</div></div>`).join('');
    return `<div class="card"><div class="h"><h2>Devlet ihaleleri</h2><span class="x">${T.won} kazanıldı · ${T.lost} kaybedildi</span></div>
      ${act ? `<div class="hdsec">Süren sözleşmeler</div><div class="list">${act}</div>` : ''}
      <div class="hdsec">Açık ihaleler</div>${list ? `<div class="list">${list}</div>` : '<div class="small dim">Şu an açık ihale yok. Modelin olduğunda 1–2 ayda bir yeni ihale açılır.</div>'}
      <div class="small dim" style="margin-top:6px">Servis %90'ın altına inerse ya da güvenlik duruşu düşerse SLA ihlali birikir; 6'da sözleşme feshedilir ve 30 günlük ödeme ceza kesilir.</div>
      ${T.exp.length ? `<div class="hdsec">İhracat kısıtları</div>${T.exp.slice(0, 3).map(x => `<div class="small"><span class="dim">${ago(x.d)} ·</span> ${e(x.t)}</div>`).join('')}` : ''}</div>`;
  }
  function dataCard(){
    const L = S.wd.data.lic, b = wdDataBonus(S);
    return `<div class="card"><div class="h"><h2>Veri pazarı</h2><span class="x">Veri kalitesi ${b >= 0 ? '+' : '−'}%${Math.abs(Math.round(b * 100))}</span></div>
      <div class="list">${WD_DATA.map(x => { const on = (L[x.id] || 0) > S.day, cost = wdDataCost(S, x.id);
        return `<div class="item"><div class="row"><b class="sp">${e(x.n)}</b><span class="pill ${on ? 'good' : ''}">${on ? (L[x.id] - S.day) + ' gün' : '+%' + Math.round(x.q * 100)}</span></div>
          <div class="small dim">${e(x.d)}</div><div class="row" style="margin-top:6px"><span class="small sp">${on ? 'Lisans aktif' : cost ? money(cost) + ' · 180 gün' : 'Bedava · 180 gün'}</span><button class="btn sm ${on ? '' : 'pri'}" data-a="wddata" data-v="${x.id}" ${on || S.cash >= cost ? '' : 'disabled'}>${on ? 'Bırak' : 'Lisansla'}</button></div></div>`; }).join('')}</div>
      <div class="small dim" style="margin-top:6px">Veri kalitesi yeni başlattığın eğitimlerin puanını artırır. Yalnız sentetik veriyle 120 günden uzun eğitim model çöküşüne yol açar.</div></div>`;
  }
  function talentCard(){
    const L = wdStarList(S), hired = lcHired(S).length, cd = S.wd.tr.cd;
    const rows = L.slice(0, 8).map(({ s, at }) => { const p = wdPoachProb(S, s, at, U.bx, U.sx), cost = wdPoachCost(S, s, U.bx), wait = Math.max(0, (cd[s.id] || 0) - S.day);
      return `<div class="item"><div class="row"><b class="sp">${e(s.n)}</b><span class="pill cool">${LC_TYPE_NAMES[s.t]}</span></div><div class="small dim">${e(RIVALS[at].name)} · ${e(s.bio)}</div>
        <div class="row small" style="margin-top:6px"><span class="sp">${lcStarEff(s)} · prim ${money(cost)} · ihtimal %${Math.round(p * 100)}</span><button class="btn sm" data-a="wdpoach" data-v="${s.id}" ${wait || hired >= LC_MAX_STARS || S.cash < cost ? 'disabled' : ''}>${wait ? wait + ' gün' : 'Teklif ver'}</button></div></div>`; }).join('');
    return `<div class="card"><div class="h"><h2>Yetenek pazarı</h2><span class="x">${hired}/${LC_MAX_STARS} yıldız</span></div>
      <div class="small">İmza primi</div><div class="hdc">${[1, 2, 3].map(v => `<button class="chip ${U.bx === v ? 'on' : ''}" data-a="wdbx" data-v="${v}">×${v}</button>`).join('')}</div>
      <div class="small">Maaş</div><div class="hdc">${[1, 1.3, 1.6].map(v => `<button class="chip ${U.sx === v ? 'on' : ''}" data-a="wdsx" data-v="${v}">×${String(v).replace('.', ',')}</button>`).join('')}</div>
      ${rows ? `<div class="list">${rows}</div>` : '<div class="small dim">Rakiplerde transfer edilebilecek yıldız yok.</div>'}
      <div class="small dim" style="margin-top:6px">Lider rakipler çalışanlarına daha sadıktır. Reddedilen teklifin primin %5'i kaybolur ve 60 gün beklenir; kazanılan transfer rakibin Ar-Ge'sini yavaşlatır.</div>
      ${S.wd.tr.log.length ? `<div class="hdsec">Son transferler</div>${S.wd.tr.log.slice(0, 3).map(x => `<div class="small"><span class="dim">${ago(x.d)} ·</span> ${e(x.t)}</div>`).join('')}` : ''}</div>`;
  }
  if (typeof SUBS !== 'undefined') SUBS.push(['gov', 'Devlet, veri, yetenek']);
  BIZ_VIEWS.gov = () => { if (!S.rivals) return ''; wdEnsure(S); return `<div class="grid">${tenderCard()}${dataCard()}${talentCard()}</div>`; };
  const _hh = handleHub;
  handleHub = function(a, el){
    const v = el.dataset.v || '';
    switch (a){
      case 'wdpx': { const [id, x] = v.split(':'); U.px[+id] = +x; refresh(); return true; }
      case 'wdbid': result(actWdBid(S, +v, U.px[+v] || 1)); return true;
      case 'wddata': result(actWdData(S, v)); return true;
      case 'wdbx': U.bx = +v; refresh(); return true;
      case 'wdsx': U.sx = +v; refresh(); return true;
      case 'wdpoach': result(actWdPoach(S, v, U.bx, U.sx)); return true;
    }
    return _hh(a, el);
  };
})();
