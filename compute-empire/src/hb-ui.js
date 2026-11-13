/* ============================================================
   COMPUTE EMPIRE v13 — HOLDING 2 ARAYÜZÜ (Şirket → Holding, en üstte)
   Portföy tablosu + seçim + toplu işlemler: Satın al · Sat · Politika · Ambargo · Yatırım · Otomasyon
   ============================================================ */
(function(){
  if (typeof BIZ_VIEWS === 'undefined' || !BIZ_VIEWS.hold || typeof hbPlan !== 'function') return;
  const U = { sel: new Set(), sec: 'all', st: 'all', mode: 'buy', tgt: 0.51, bmode: 'target', bud: '', bids: true, sell: 0, tpl: 'cheap', rv: null, tier: 0, open: true };
  const e = s => esc(String(s));
  const pc = x => hdPctStr(x);
  const mny = x => money(x);
  const sgn = (x, f) => (x >= 0 ? '+' : '−') + f(Math.abs(x));
  const ST = [['all', 'Hepsi'], ['ctl', 'Kontrol sende'], ['own', 'Payın var'], ['rv', 'Rakip kontrolünde'], ['free', 'Serbest ≥%20']];
  function list(){
    return HD_COS.filter(c => (U.sec === 'all' || c.sec === U.sec)).filter(c => {
      const st = S.hold.cos[c.id], ctl = hdCtl(S, c.id);
      return U.st === 'all' || (U.st === 'ctl' && ctl === -1) || (U.st === 'own' && st.own >= 0.01) || (U.st === 'rv' && ctl != null && ctl >= 0) || (U.st === 'free' && hdFloat(S, c.id) >= 0.2);
    });
  }
  const selIds = () => [...U.sel].filter(id => S.hold.cos[id]);
  function secRow(){
    const snap = hbSnapshot(S);
    return `<div class="hbsecs">${HD_SECS.map(s => { const x = snap.sec[s.id], r = Math.min(100, Math.round(x.risk)), heat = hbHeat(S, s.id);
      return `<button class="hbsec ${U.sec === s.id ? 'on' : ''}" data-a="hbsec" data-v="${s.id}"><b>${e(s.short)}</b><span>Payın ${pc(x.sh)}</span><span>Sana ${hdX(x.me)} · rakip ${hdX(x.rv)}</span>
        <i class="hbrisk"><i style="width:${r}%;background:var(${r > 70 ? '--bad' : r > 40 ? '--warn' : '--cool'})"></i></i>${heat > 0.005 ? `<span class="t-warn">Fiyat +${Math.round(heat * 100)}%</span>` : ''}</button>`; }).join('')}</div>`;
  }
  function table(L){
    const all = L.length && L.every(c => U.sel.has(c.id));
    const rows = L.map(c => { const st = S.hold.cos[c.id], ctl = hdCtl(S, c.id), d = st.own >= 0.01 ? hdDaily(S, c.id).net : 0, tpl = st.m.tpl && hbTplOf(S, st.m.tpl);
      return `<tr class="${U.sel.has(c.id) ? 'on' : ''}"><td><input type="checkbox" data-a="hbpick" data-v="${c.id}" ${U.sel.has(c.id) ? 'checked' : ''} aria-label="${e(c.name)} seç"></td>
        <td class="nm"><b>${e(c.name)}</b><span class="dim">${e(HD_SEC[c.sec].short)}${tpl ? ' · ' + e(tpl.n) : ''}</span></td>
        <td class="r">${st.own >= 0.01 ? pc(st.own) : '—'}<span class="dim">${hbLvlName(st.own)}</span></td>
        <td>${ctl === -1 ? '<span class="pill good">Sen</span>' : ctl != null ? `<span class="pill bad">${e(RIVALS[ctl].name)}</span>` : '<span class="dim">Bağımsız</span>'}</td>
        <td class="r">${pc(hdFloat(S, c.id))}</td><td class="r">${mny(hdVal(S, c.id))}</td><td class="r ${d >= 0 ? 'up' : 'dn'}">${st.own >= 0.01 ? sgn(d, mny) : ''}</td></tr>`; }).join('');
    return `<div class="hbtbl"><table><thead><tr><th><input type="checkbox" data-a="hball" ${all ? 'checked' : ''} aria-label="Hepsini seç"></th><th>Şirket</th><th class="r">Pay</th><th>Kontrol</th><th class="r">Serbest</th><th class="r">Değer</th><th class="r">Günlük</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function delta(b, a){
    const secs = HD_SECS.filter(s => Math.abs(a.sec[s.id].me - b.sec[s.id].me) > 0.004 || Math.abs(a.sec[s.id].rv - b.sec[s.id].rv) > 0.004 || Math.abs(a.sec[s.id].sh - b.sec[s.id].sh) > 0.001 || a.sec[s.id].add !== b.sec[s.id].add);
    const risk = HD_SECS.map(s => ({ s, x: a.sec[s.id] })).filter(o => o.x.add > 0);
    return `<dl class="kv hbkv"><dt>Günlük net (temettü − yönetim)</dt><dd class="${a.net >= b.net ? 'up' : 'dn'}">${sgn(b.net, mny)} → ${sgn(a.net, mny)}</dd>
      <dt>Yönetim gideri</dt><dd>${mny(b.adm)} → ${mny(a.adm)} <span class="dim">(${a.n} iştirak, her biri +%15)</span></dd>
      ${secs.map(s => `<dt>${e(s.short)}</dt><dd>payın ${pc(b.sec[s.id].sh)} → ${pc(a.sec[s.id].sh)} · sana ${hdX(b.sec[s.id].me)} → ${hdX(a.sec[s.id].me)} · rakip ${hdX(b.sec[s.id].rv)} → ${hdX(a.sec[s.id].rv)}</dd>`).join('')}
      ${risk.length ? `<dt>Soruşturma riski</dt><dd class="dn">${risk.map(o => `${e(o.s.short)}: ${o.x.days === 0 ? 'ceza eşiğinde' : '~' + o.x.days + ' günde ceza'}`).join(' · ')}</dd>` : '<dt>Soruşturma riski</dt><dd class="up">yok</dd>'}</dl>`;
  }
  function buyPane(ids){
    const tg = [[0.01, 'Temettü %1'], [0.10, 'Kurul %10'], [0.25, 'Veto %25'], [0.51, 'Kontrol %51'], [1, 'Tam %100']];
    const head = `<div class="hdc"><button class="chip ${U.bmode === 'target' ? 'on' : ''}" data-a="hbbm" data-v="target">Hedef paya çık</button><button class="chip ${U.bmode === 'budget' ? 'on' : ''}" data-a="hbbm" data-v="budget">Bütçeyle en çok kontrol</button></div>
      ${U.bmode === 'target' ? `<div class="hdc">${tg.map(([v, n]) => `<button class="chip ${Math.abs(U.tgt - v) < 1e-6 ? 'on' : ''}" data-a="hbtgt" data-v="${v}">${n}</button>`).join('')}</div>
        <label class="small hbchk"><input type="checkbox" data-a="hbbids" ${U.bids ? 'checked' : ''}> Serbest pay yetmezse rakip paylarına teklif ver (~%60 kabul fiyatıyla, tutar bloke edilir)</label>`
      : `<div class="row" style="gap:6px"><input id="hbBud" class="inp" data-hdq="hbbud" inputmode="numeric" placeholder="Bütçe, ör. 2000000" value="${e(U.bud)}" style="flex:1"><button class="btn sm" data-a="hbbud">Hesapla</button></div>
        <div class="small dim">Motor, sektör etkisi başına en ucuz kontrol (%51) yollarını seçer. Seçim yapmazsan tüm liste değerlendirilir.</div>`}`;
    const bud = +String(U.bud).replace(/[^\d]/g, '');
    if (U.bmode === 'budget' && !(bud > 0)) return head;
    const pl = hbPlan(S, U.bmode === 'budget' && !ids.length ? list().map(c => c.id) : ids, U.bmode, U.bmode === 'budget' ? bud : U.tgt, U.bids);
    if (!pl.rows.length) return head + '<div class="small dim" style="margin-top:8px">Bu hedefle alınacak pay yok.</div>';
    const rows = pl.rows.map(r => `<div class="hbrow"><span class="sp">${e(HD_BY[r.id].name)}</span>${r.buy ? `<span>+${pc(r.buy)} · ${mny(r.cost)}</span>` : ''}${(r.bids || []).map(b => `<span class="dim">teklif ${e(RIVALS[b.rv].name)} ${pc(b.pct)} · ${mny(b.price)} · %${Math.round(b.pr * 100)}</span>`).join('')}${r.short ? `<span class="t-warn">${pc(r.short)} eksik kalır</span>` : ''}</div>`).join('');
    const can = pl.cashAfter >= 0;
    return `${head}<div class="hbprev">${rows}${delta(pl.before, pl.after)}
      <div class="row small" style="margin-top:6px"><span class="sp">Toplam: <b>${mny(pl.cost)}</b>${pl.esc ? ` + bloke ${mny(pl.esc)}` : ''} · sonra nakit <b class="${can ? '' : 't-bad'}">${sgn(pl.cashAfter, mny)}</b></span></div>
      <div class="small dim">Aynı sektörde art arda alım kalan şirketleri pahalandırır (fiyat ısısı, günde %3 söner). Büyük toplu alım rakiplerden karşı hamle ve gündemde tepki doğurur.</div>
      <button class="btn pri" data-a="hbgo" ${can ? '' : 'disabled'} style="width:100%;margin-top:8px">${can ? 'Toplu alımı onayla' : 'Nakit yetmiyor'}</button></div>`;
  }
  function sellPane(ids){
    const tg = [[0, 'Tamamen çık'], [0.10, '%10\'a indir'], [0.25, '%25\'e indir'], [0.51, '%51\'e indir']];
    const pv = hbSellPreview(S, ids, U.sell);
    return `<div class="hdc">${tg.map(([v, n]) => `<button class="chip ${U.sell === v ? 'on' : ''}" data-a="hbsell" data-v="${v}">${n}</button>`).join('')}</div>
      <div class="hbprev">${pv.n ? `<div class="row small"><span class="sp">${pv.n} şirket · tahmini gelir</span><b class="up">+${mny(pv.gain)}</b></div><button class="btn" data-a="hbsellgo" style="width:100%;margin-top:8px">Toplu satışı onayla</button>` : '<div class="small dim">Seçilenlerde bu seviyenin üstünde payın yok.</div>'}</div>`;
  }
  function tplPane(ids){
    const T = { ...HB_TPL, ...(S.hb.tpl || {}) };
    const pv = hbTplPreview(S, ids, U.tpl);
    const first = ids.find(id => hdCtl(S, id) === -1);
    return `<div class="hbtpls">${Object.keys(T).map(k => `<button class="choice ${U.tpl === k ? 'on' : ''}" data-a="hbtpl" data-v="${k}"><b>${e(T[k].n)}</b><span>${e(T[k].d)}</span></button>`).join('')}</div>
      <div class="hbprev">${pv && pv.n ? `${delta(pv.before, pv.after)}<button class="btn pri" data-a="hbtplgo" style="width:100%;margin-top:8px">${pv.n} şirkete uygula</button>` : '<div class="small dim">Politika yalnız kontrol ettiğin (%51+) şirketlere uygulanır. Seçimde böyle şirket yok.</div>'}
      ${first ? `<button class="btn sm" data-a="hbtplsave" data-v="${first}" style="margin-top:6px">${e(HD_BY[first].name)} ayarlarını şablon olarak kaydet</button>` : ''}</div>`;
  }
  function embPane(ids){
    const rv = S.rivals.map((r, i) => i).filter(i => hdRvAlive(S, i)).sort((a, b) => S.rivals[b].q - S.rivals[a].q).slice(0, 10);
    if (U.rv == null || !rv.includes(U.rv)) U.rv = rv[0];
    const n = ids.filter(id => hdCtl(S, id) === -1 && HD_BY[id].sec !== 'exons').length;
    return `<div class="hdc">${rv.map(i => `<button class="chip ${U.rv === i ? 'on' : ''}" data-a="hbrv" data-v="${i}">${e(RIVALS[i].name)}</button>`).join('')}</div>
      <div class="hbprev"><div class="small">${n} şirkette uygulanabilir. Ambargo 90 gün sürer; kaldırınca 60 gün beklenir; şirket başına en fazla 3 rakip. Ambargo Rekabet Kurumu riskini hızla büyütür ve kamuoyunu düşürür.</div>
      <div class="row" style="gap:6px;margin-top:8px"><button class="btn" data-a="hbemb" data-v="1" ${n ? '' : 'disabled'} style="flex:1">Ambargo başlat</button><button class="btn" data-a="hbemb" data-v="0" ${n ? '' : 'disabled'} style="flex:1">Ambargoyu kaldır</button></div></div>`;
  }
  function invPane(ids){
    const pv = hbInvestCost(S, ids, U.tier);
    return `<div class="hdc">${HD_INV.map((t, k) => `<button class="chip ${U.tier === k ? 'on' : ''}" data-a="hbtier" data-v="${k}">+%${Math.round(t.add * 100)} · ${t.days} gün</button>`).join('')}</div>
      <div class="hbprev">${pv.n ? `<div class="row small"><span class="sp">${pv.n} şirket</span><b>${mny(pv.cost)}</b></div><button class="btn" data-a="hbinv" style="width:100%;margin-top:8px" ${S.cash >= pv.cost ? '' : 'disabled'}>Yatırımı başlat</button>` : '<div class="small dim">Yatırım için kontrol (%51) gerekir.</div>'}
      <div class="small dim" style="margin-top:6px">Kâr aktarımı %100'ün altındaysa içte kalan kâr birikir ve kendiliğinden kapasite yatırımına döner.</div></div>`;
  }
  function autoPane(){
    const A = S.hb.auto, R = S.hb.rule, fee = hbAutoFee(S);
    const tg = (k, n, d) => `<label class="small hbchk"><input type="checkbox" data-a="hbauto" data-v="${k}" ${A[k] ? 'checked' : ''}> <b>${n}</b> <span class="dim">${d}</span></label>`;
    const cm = [0, 1e5, 1e6, 1e7, 1e8];
    return `<div class="hbprev"><div class="row"><b class="sp">Otomatik holding yöneticisi</b><button class="btn sm ${A.on ? 'pri' : ''}" data-a="hbauto" data-v="on">${A.on ? 'Açık' : 'Kapalı'}</button></div>
      <div class="small dim">Haftada bir çalışır. Gideri: pay değerinin günlük %0,004'ü (şu an ${mny(fee)}/gün).</div>
      ${tg('defend', 'Kontrolü savun', 'rakip %25 toplarsa payı %60\'a çıkarır')}${tg('risk', 'Cezadan kaçın', 'sektör riski %70\'i geçince ambargoları kaldırır, fiyatı yumuşatır')}
      ${tg('payout', 'Nakit koruması', 'nakit alt sınırın altına inerse içte tutulan kârı serbest bırakır')}${tg('cap', 'Darboğaz yatırımı', 'arzı en dar sektörde kapasite açar')}
      <div class="small" style="margin-top:6px">Harcamalarda korunacak nakit alt sınırı</div><div class="hdc">${cm.map(v => `<button class="chip ${A.cashMin === v ? 'on' : ''}" data-a="hbcash" data-v="${v}">${v ? mny(v) : 'Yok'}</button>`).join('')}</div>
      ${A.log.length ? `<div class="hdsec">Yönetici günlüğü</div>${A.log.slice(0, 6).map(x => `<div class="small"><span class="dim">${ago(x.d)} ·</span> ${e(x.t)}</div>`).join('')}` : ''}</div>
      <div class="hbprev"><div class="row"><b class="sp">Gelen teklif kuralları</b><button class="btn sm ${R.on ? 'pri' : ''}" data-a="hbrule" data-v="on">${R.on ? 'Açık' : 'Kapalı'}</button></div>
      <div class="small" style="margin-top:6px">Rakip payını şu katın üstünde isterse sat (kontrolü kaybettirecekse asla)</div><div class="hdc">${[1.3, 1.5, 1.8, 2.2].map(v => `<button class="chip ${R.acc === v ? 'on' : ''}" data-a="hbrule" data-v="acc:${v}">${hdX(v)}</button>`).join('')}</div>
      <div class="small">Şu katın altını reddet</div><div class="hdc">${[1, 1.1, 1.2, 1.3].map(v => `<button class="chip ${R.rej === v ? 'on' : ''}" data-a="hbrule" data-v="rej:${v}">${hdX(v)}</button>`).join('')}</div>
      <div class="small">Karşı teklifi şu kata kadar kabul et</div><div class="hdc">${[1.1, 1.25, 1.4, 1.6].map(v => `<button class="chip ${R.ctr === v ? 'on' : ''}" data-a="hbrule" data-v="ctr:${v}">${hdX(v)}</button>`).join('')}</div></div>`;
  }
  function bulkCard(){
    if (!S.hold) return '';
    hbEnsure(S);
    const L = list(), ids = selIds();
    const MODES = [['buy', 'Satın al'], ['sell', 'Sat'], ['tpl', 'Politika'], ['emb', 'Ambargo'], ['inv', 'Yatırım'], ['auto', 'Otomasyon']];
    const pane = { buy: buyPane, sell: sellPane, tpl: tplPane, emb: embPane, inv: invPane, auto: autoPane }[U.mode];
    const needSel = U.mode !== 'auto' && !(U.mode === 'buy' && U.bmode === 'budget') && !ids.length;
    const ops = S.hb.ops.slice(0, 4);
    return `<div class="card hbcard"><div class="h"><h2>Portföy ve toplu işlemler</h2><button class="link" data-a="hbopen">${U.open ? 'Gizle' : 'Aç'}</button></div>
      ${U.open ? `${secRow()}
      <div class="hdc"><button class="chip ${U.sec === 'all' ? 'on' : ''}" data-a="hbsec" data-v="all">Tüm sektörler</button>${ST.map(([k, n]) => `<button class="chip ${U.st === k ? 'on' : ''}" data-a="hbst" data-v="${k}">${n}</button>`).join('')}</div>
      ${table(L)}
      <div class="hbbar"><span class="small"><b>${ids.length}</b> seçili</span><button class="link" data-a="hbclr" ${ids.length ? '' : 'disabled'}>Temizle</button></div>
      <div class="seg wrap hbmodes">${MODES.map(([k, n]) => `<button data-a="hbmode" data-v="${k}" class="${U.mode === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      ${needSel ? '<div class="small dim" style="margin-top:8px">Önce tablodan şirket seç (başlıktaki kutu listedekilerin hepsini seçer).</div>' : pane(ids)}
      ${ops.length ? `<div class="hdsec">Son işlemler</div>${ops.map(o => `<div class="small"><span class="dim">${ago(o.d)} ·</span> ${e(o.t)}</div>`).join('')}` : ''}` : ''}</div>`;
  }
  const _view = BIZ_VIEWS.hold;
  BIZ_VIEWS.hold = function(){ let top = ''; try { top = bulkCard(); } catch (err) { console.error('hb ui', err); } return top + _view(); };

  const num0 = v => +v;
  const _hh = handleHub;
  handleHub = function(a, el){
    if (!a || a.slice(0, 2) !== 'hb') return _hh(a, el);
    const v = el.dataset.v || '';
    switch (a){
      case 'hbopen': U.open = !U.open; break;
      case 'hbsec': U.sec = U.sec === v && v !== 'all' ? 'all' : v; break;
      case 'hbst': U.st = v; break;
      case 'hbpick': if (U.sel.has(v)) U.sel.delete(v); else U.sel.add(v); break;
      case 'hball': { const L = list(); const all = L.every(c => U.sel.has(c.id)); for (const c of L) all ? U.sel.delete(c.id) : U.sel.add(c.id); break; }
      case 'hbclr': U.sel.clear(); break;
      case 'hbmode': U.mode = v; break;
      case 'hbbm': U.bmode = v; break;
      case 'hbtgt': U.tgt = num0(v); break;
      case 'hbbids': U.bids = !U.bids; break;
      case 'hbbud': { const i = document.getElementById('hbBud'); U.bud = i ? i.value : U.bud; break; }
      case 'hbgo': { const i = document.getElementById('hbBud'); if (i) U.bud = i.value; const bud = +String(U.bud).replace(/[^\d]/g, ''); const ids = U.bmode === 'budget' && !selIds().length ? list().map(c => c.id) : selIds();
        result(hbBuy(S, ids, U.bmode, U.bmode === 'budget' ? bud : U.tgt, U.bids)); return true; }
      case 'hbsell': U.sell = num0(v); break;
      case 'hbsellgo': if (!arm('hbsell')){ refresh(); return true; } result(hbSell(S, selIds(), U.sell)); return true;
      case 'hbtpl': U.tpl = v; break;
      case 'hbtplgo': result(hbApplyTpl(S, selIds(), U.tpl)); return true;
      case 'hbtplsave': result(hbSaveTpl(S, v)); return true;
      case 'hbrv': U.rv = num0(v); break;
      case 'hbemb': result(hbEmbargo(S, selIds(), U.rv, v === '1')); return true;
      case 'hbtier': U.tier = num0(v); break;
      case 'hbinv': result(hbInvest(S, selIds(), U.tier)); return true;
      case 'hbauto': { const A = S.hb.auto; if (v === 'on'){ A.on = !A.on; A.next = S.day; } else A[v] = !A[v]; break; }
      case 'hbcash': S.hb.auto.cashMin = num0(v); break;
      case 'hbrule': { const R = S.hb.rule; if (v === 'on') R.on = !R.on; else { const [k, x] = v.split(':'); R[k] = +x; } break; }
      default: return _hh(a, el);
    }
    refresh(); return true;
  };
  // Genel bakışta ve holding özetinde kısayol
  if (typeof OVW_TOP !== 'undefined') OVW_TOP.push(() => S && S.hb && S.hb.auto.on && S.hb.auto.log[0] && S.hb.auto.log[0].d === S.day ? `<div class="card flat"><div class="row"><span class="small sp"><b>Holding yöneticisi:</b> ${esc(S.hb.auto.log[0].t)}</span><button class="btn sm" data-a="hdgo">Holding</button></div></div>` : '');
})();
