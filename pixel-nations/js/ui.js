// UI Engine: oyun HUD'u, paneller, pencereler, grafikler, bildirimler (simülasyondan ayrı; yalnızca okur ve komut verir)
import { fmt, sgn, pct, popStr, dateStr, dayStr, clamp, dist, W } from './util.js';
import { RES, NR, BLD, BLD_KEYS, UNITS, UNIT_KEYS, GOV, TECHS, TECH_AREAS, TECH_BY, NATIONS, NN, POLICY_DEFAULT, MEM, T } from './data.js';
import { ui, atWar, allied, pactR, sanctioned, hasTrade, cityAt } from './state.js';
import { icon, flagImg, ICON_NAMES } from './icons.js';
import { build, buildInfo, cancelBuild, setPolicy, setResPol, borrow, repay, printMoney, startResearch, techState, popTier, bldCap, creditLimit } from './economy.js';
import { queueUnit, canRecruit, unitCost, cancelProd, orderHold, splitArmy, mergeAt, groupArmies, ungroup, disband, retreat, count, armyPower, airRange, orderMove } from './military.js';
import { evaluate, propose, declareWar, makePeace, breakTreaty, sanction, gift, militaryAid, threaten, spyOp, SPY_OPS, opinionBreakdown, alliesOf, warsOf, answerInbox, canDeclare, typeName, memScore } from './diplomacy.js';
import { resolveEvent, EVENTS } from './events.js';
import { saveGame, loadGame, listSaves, deleteSave } from './save.js';

export const G = { S: null, R: null, sel: { armies: [], city: null, nation: null }, hold: 0, hooks: {} };
const $ = (id) => document.getElementById(id);
const P = () => G.S.nations[G.S.player];
const num = (v, d = 0) => fmt(v, d);
export function toast(text, sev = 0) {
  const el = document.createElement('div'); el.className = 'toast s' + sev; el.textContent = text; $('toasts').appendChild(el);
  while ($('toasts').children.length > 5) $('toasts').firstChild.remove(); setTimeout(() => el.remove(), 6500);
}
const res = (r) => { if (r && r.msg) toast(r.msg, r.ok === false ? 2 : 1); refresh(true); return r; };
const arrow = (v, eps = 0.01) => (v > eps ? '<span class="pos">▲</span>' : v < -eps ? '<span class="neg">▼</span>' : '<span class="mut">■</span>');
const col = (v) => (v > 0.0001 ? 'pos' : v < -0.0001 ? 'neg' : 'mut');
const bar = (v, max = 100, c) => `<div class="bar"><i style="width:${clamp(v / max * 100, 0, 100)}%;${c ? 'background:' + c : ''}"></i></div>`;
const stabCol = (s) => (s > 60 ? '#5cd05c' : s > 35 ? '#e0b030' : '#e05050');

// ---------------- HUD
export function buildHud() {
  const dock = [['country', 'country', 'Ülke'], ['eco', 'eco', 'Ekonomi'], ['army', 'army', 'Ordu'], ['tech', 'tech', 'Teknoloji'], ['dip', 'dip', 'Diplomasi'], ['stats', 'stats', 'İstatistik'], ['events', 'event', 'Olaylar'], ['menu', 'menu', 'Menü']];
  $('dock').innerHTML = dock.map(([id, ic, t]) => `<button data-a="win" data-w="${id}" id="dk-${id}" class="px" title="${t}">${icon(ic)}<span>${t.slice(0, 7)}</span></button>`).join('');
  $('timebar').className = 'px';
  $('timebar').innerHTML = `<button data-a="speed" data-v="0" id="sp0" title="Duraklat (Boşluk)">⏸</button>` + [1, 2, 5, 10].map((v) => `<button data-a="speed" data-v="${v}" id="sp${v}" title="${v}x hız">${v}x</button>`).join('') + `<div class="date" id="datebox"></div><button data-a="qsave" title="Hızlı kayıt">${icon('check', 's')}</button>`;
}
export function updateHud() {
  const S = G.S; if (!S) return; const n = P();
  const net = n.netEma || 0;
  const chips = [
    `<div class="chip nat px" data-a="win" data-w="country">${flagImg(n)}<div><b>${n.short}</b><br><small>${GOV[n.gov].name}</small></div></div>`,
    `<div class="chip" data-a="win" data-w="eco" title="Hazine / günlük net">${icon('money')}<div><b>${num(n.money)}</b><br><small class="${col(net)}">${sgn(net)}/gün</small></div></div>`,
    `<div class="chip" data-a="win" data-w="eco" title="Borç">${icon('debt')}<div><b>${num(n.debt)}</b><br><small>${pct(n.debt / Math.max(1, n.gdp))} GSYH</small></div></div>`,
    `<div class="chip" data-a="win" data-w="eco" title="Enflasyon / Büyüme">${icon('infl')}<div><b class="${n.inflation > 0.08 ? 'neg' : ''}">${pct(n.inflation, 1)}</b><br><small class="${col(n.growth)}">büy ${pct(n.growth, 1)}</small></div></div>`,
    `<div class="chip" data-a="win" data-w="stats" title="Nüfus">${icon('pop')}<div><b>${popStr(n.pop)}</b><br><small>${arrow(S.cities.filter((c) => c.owner === n.id).reduce((s, c) => s + c.growth, 0), 0)} büyüme</small></div></div>`,
    `<div class="chip" data-a="win" data-w="country" title="İstikrar">${icon('stab')}<div style="width:60px"><b>${n.stab.toFixed(0)}</b>${bar(n.stab, 100, stabCol(n.stab))}</div></div>`,
    `<div class="chip" data-a="win" data-w="army" title="İnsan gücü / askerî güç">${icon('army')}<div><b>${num(n.manpower)}</b><br><small>güç ${num(n.milPower)}</small></div></div>`,
    `<div class="chip" data-a="win" data-w="tech" title="Araştırma puanı/gün">${icon('science')}<div><b>${n.rp.toFixed(1)}</b><br><small>${n.research ? Math.round(n.research.progress / TECH_BY[n.research.id].rp * 100) + '%' : 'boş'}</small></div></div>`,
    ...RES.map((r, i) => `<div class="chip" data-a="win" data-w="eco" title="${r.name}: stok ${num(n.stock[i])} | üretim ${num(n.prod[i], 1)} | tüketim ${num(n.cons[i], 1)}">${icon(r.id)}<div><b class="${n.sat[i] < 0.98 ? 'neg' : ''}">${num(n.stock[i])}</b><br><small class="${col(n.net[i])}">${sgn(n.net[i], n.net[i] < 10 ? 1 : 0)}</small></div></div>`),
  ];
  $('topbar').innerHTML = chips.join('');
  $('datebox').textContent = dateStr(S.t) + ' ' + String(Math.floor(S.t % 24)).padStart(2, '0') + ':00';
  for (const v of [0, 1, 2, 5, 10]) { const b = $('sp' + v); if (b) b.classList.toggle('on', ui.get().paused ? v === 0 : v === ui.get().speed); }
  const nb = S.pending.length + S.inbox.length; for (const id of ['dip', 'events']) { const b = $('dk-' + id); if (b) { const k = id === 'dip' ? S.inbox.length : S.pending.length; let bd = b.querySelector('.badge'); if (k && !bd) { bd = document.createElement('i'); bd.className = 'badge'; b.appendChild(bd); } if (bd) { if (k) bd.textContent = k; else bd.remove(); } } }
  for (const id of ['country', 'eco', 'army', 'tech', 'dip', 'stats', 'events', 'menu']) { const b = $('dk-' + id); if (b) b.classList.toggle('on', ui.get().win === id); }
}

// ---------------- Yan panel
export function renderSide() {
  const S = G.S, el = $('side'); const s = G.sel;
  let html = '';
  if (s.armies.length) html = armyPanel(); else if (s.city !== null) html = cityPanel(S.cities[s.city]); else if (s.nation !== null) html = nationPanel(S.nations[s.nation]);
  if (!html) { el.classList.remove('open'); return; }
  const top = el.scrollTop; el.className = 'px open'; el.innerHTML = html; el.scrollTop = top;
}
function nationPanel(n) {
  const S = G.S, me = P(), isMe = n.id === me.id;
  const cs = S.cities.filter((c) => c.owner === n.id); const op = isMe ? 100 : S.dip.op[n.id][me.id]; const pk = isMe ? {} : pactR(S, me.id, n.id);
  const tags = isMe ? '' : [pk.war ? '<span class="neg">⚔ SAVAŞ</span>' : '', pk.ally ? '🤝 İttifak' : '', pk.trade ? '📦 Ticaret' : '', pk.nap > S.day ? '🕊 Saldırmazlık' : '', pk.access ? '🛤 Geçiş' : '', sanctioned(S, me.id, n.id) ? '⛔ Yaptırım' : ''].filter(Boolean).join(' · ');
  return `<div class="hd">${flagImg(n, 'l')}<div><h2>${n.short}</h2><div class="mut">${n.name}</div></div><button class="x sm" data-a="desel">✕</button></div>
  <div class="mut">${GOV[n.gov].name} · ${n.trait}</div>
  <div class="kv" style="margin:8px 0"><span>Başkent</span><span>${S.cities[n.capital].name}</span><span>Şehir</span><span>${cs.length}</span><span>Nüfus</span><span>${popStr(n.pop)}</span><span>GSYH (yıllık)</span><span>${num(n.gdp)} ¤</span><span>Askerî güç</span><span>${num(n.milPower)}</span><span>İstikrar</span><span>${n.stab.toFixed(0)}</span><span>Hazine</span><span>${num(n.money)}</span><span>Teknoloji</span><span>${Object.keys(n.techs).length}/32</span>${n.alive ? '' : '<span>Durum</span><span class="neg">Yok oldu</span>'}</div>
  ${isMe ? '' : `<div class="card"><div class="row sp"><span>Bize bakışı</span><b class="${col(op)}">${op.toFixed(0)}</b></div>${bar(op + 100, 200, op > 20 ? '#5cd05c' : op > -20 ? '#e0b030' : '#e05050')}<div style="margin-top:4px">${tags || '<span class="mut">Anlaşma yok</span>'}</div></div>`}
  <div class="row"><button data-a="win" data-w="${isMe ? 'country' : 'dip'}" ${isMe ? '' : `data-n="${n.id}"`} class="gold">${icon('dip', 's')} ${isMe ? 'Ülkem' : 'Diplomasi'}</button><button data-a="focusN" data-n="${n.id}">Başkente git</button></div>
  <h3>Şehirler</h3>${cs.map((c) => `<div class="card click row sp" data-a="selCity" data-c="${c.id}"><span>${c.id === n.capital ? '★ ' : ''}${c.name}</span><span class="mut">${popStr(c.pop)}</span></div>`).join('')}`;
}
function cityPanel(c) {
  const S = G.S, n = S.nations[c.owner], me = P(), own = c.owner === me.id; const tier = ['Köy', 'Kasaba', 'Şehir', 'Metropol'][popTier(c.pop) - 1];
  let h = `<div class="hd">${flagImg(n)}<div><h2>${c.name}</h2><div class="mut">${tier} · ${n.short}${n.capital === c.id ? ' · Başkent' : ''}</div></div><button class="x sm" data-a="desel">✕</button></div>
  <div class="kv"><span>Nüfus</span><span>${popStr(c.pop)} <small class="${col(c.growth)}">${(c.growth * 100).toFixed(1)}%/yıl</small></span><span>Savunma (milis)</span><span>${num(c.militia)} / ${num(Math.sqrt(c.pop) * 8 + c.bld.fort * 120 + 60)}</span><span>Tahkimat</span><span>Sv.${c.bld.fort}</span><span>İş gücü verimi</span><span>${pct(c.lf)}</span><span>Ekonomik değer</span><span>${num(c.gdp * (n.priceLevel))} ¤/gün</span><span>Altyapı</span><span>Sv.${c.bld.infra}</span>${c.occ > 0 ? `<span>Karışıklık</span><span class="warnc">${c.occ} gün</span>` : ''}${c.dmg > 0.02 ? `<span>Hasar</span><span class="neg">${pct(c.dmg)}</span>` : ''}</div>
  <h3>Kaynak Potansiyeli</h3><div class="row">${['food', 'iron', 'coal', 'oil', 'gold', 'wood', 'stone'].map((k) => `<span title="${k}">${icon(k, 's')}<b>${c.pot[k].toFixed(1)}</b></span>`).join('')}</div>`;
  if (!own) return h + `<div class="row" style="margin-top:8px"><button data-a="win" data-w="dip" data-n="${n.id}">Diplomasi</button><button data-a="selNation" data-n="${n.id}">Ülke</button></div>`;
  h += `<h3>Binalar</h3>`;
  for (const k of BLD_KEYS) {
    const b = BLD[k]; if (b.needsCoast && !c.coastal) continue; const info = buildInfo(S, me, c, k);
    if (b.pot && c.pot[b.pot] < (b.pot === 'food' ? 0.5 : 0.8) && !c.bld[k]) continue;
    const costTxt = Object.entries(info.cost).map(([r, v]) => `${r === 'money' ? '¤' : RES.find((x) => x.id === r)?.name}:${num(v)}`).join(' ');
    h += `<div class="card row sp" title="${b.desc}"><span>${icon(b.ic, 's')} ${b.name} <b>${c.bld[k]}</b></span><button class="sm ${info.why ? 'dis' : 'green'}" ${info.why ? 'disabled' : ''} data-a="build" data-c="${c.id}" data-k="${k}" title="${info.why || costTxt + ' · ' + info.days + ' gün'}">${info.why ? info.why.slice(0, 14) : '+ ' + num(info.cost.money)}</button></div>`;
  }
  if (c.queue.length) h += `<h3>İnşaat</h3>` + c.queue.map((q, i) => `<div class="card row sp"><span>${BLD[q.key].name} → ${q.lvl}</span><span>${Math.ceil(q.left)} gün <button class="sm red" data-a="cancelB" data-c="${c.id}" data-i="${i}">✕</button></span></div>`).join('');
  h += `<h3>Asker Topla</h3><div class="row">${UNIT_KEYS.map((u) => { const why = canRecruit(S, me, c, u, 1); return `<button class="sm ${why ? 'dis' : ''}" ${why ? 'disabled' : ''} data-a="recruit" data-c="${c.id}" data-u="${u}" title="${why || 'Kuyruğa al'}">${icon(u === 'inf' ? 'inf' : u === 'tank' ? 'tank' : u === 'art' ? 'art' : u === 'air' ? 'plane' : 'ship', 's')} ${UNITS[u].name} ${num(unitCost(S, me, u, 1).money)}¤</button>`; }).join('')}</div>`;
  return h;
}
function armyPanel() {
  const S = G.S, list = G.sel.armies.map((id) => S.armies.find((a) => a.id === id)).filter(Boolean); if (!list.length) { G.sel.armies = []; return ''; }
  const a = list[0], n = S.nations[a.owner], own = a.owner === S.player;
  let h = `<div class="hd">${flagImg(n)}<div><h2>${list.length > 1 ? list.length + ' birlik' : UNITS[a.type].name}</h2><div class="mut">${n.short}${a.group ? ' · grup' : ''}</div></div><button class="x sm" data-a="desel">✕</button></div>`;
  for (const u of list) {
    const eta = u.path && u.path.length ? Math.round(u.path.length / Math.max(0.05, UNITS[u.type].speed) / 1.0) : 0;
    h += `<div class="card ${u.id === a.id ? 'sel' : ''}"><div class="row sp"><b>${UNITS[u.type].name} ×${count(u)}</b><span class="mut">${u.engaged >= 0 ? '<span class="neg">SAVAŞTA</span>' : u.state === 'out' ? '✈ görevde' : u.path.length ? 'Yolda ~' + eta + ' sa' : u.entrench > 20 ? 'Tahkim' : 'Bekliyor'}</span></div>
    <div class="kv"><span>Can</span><span>${num(u.hp)} / ${num(u.max)}</span><span>Moral</span><span>${u.morale.toFixed(0)}</span><span>İkmal</span><span class="${u.supply < 30 ? 'neg' : ''}">${u.supply.toFixed(0)}</span>${u.type === 'air' ? `<span>Menzil</span><span>${airRange(S, u).toFixed(0)} kare</span>` : ''}</div>${bar(u.hp, u.max, '#5cd05c')}</div>`;
  }
  if (!own) return h;
  h += `<div class="mut" style="margin:6px 0">${a.type === 'air' ? 'Haritada hedef kareye dokunun → hava harekâtı' : a.type === 'navy' ? 'Denize dokunun → hareket; kıyıya dokunun → bombardıman' : 'Hedef kareye dokunun → hareket/saldırı. Düşman şehrine dokunun → kuşatma.'}</div>
  <div class="row"><button data-a="hold">${icon('fort', 's')} Dur/Savun</button>${a.type !== 'air' ? `<button data-a="retreat">Geri çekil</button>` : `<button data-a="airloop" class="${a.loop ? 'green' : ''}">${a.loop ? 'Sürekli: AÇIK' : 'Sürekli sorti'}</button>`}<button data-a="split">Böl</button><button data-a="merge">Birleştir</button>
  ${list.length > 1 ? '<button data-a="group">Grupla</button>' : ''}${a.group ? '<button data-a="ungroup">Gruptan çık</button>' : ''}<button class="red" data-a="disband">Dağıt</button></div>
  <div class="row" style="margin-top:6px"><button data-a="multi" class="${ui.get().multi ? 'gold' : ''}">Çoklu seçim ${ui.get().multi ? 'AÇIK' : ''}</button><button data-a="selSame">Aynı kareyi seç</button></div>`;
  return h;
}

// ---------------- Pencereler
let curWin = null, winOpts = {};
export function openWin(id, opts = {}) {
  if (ui.get().win === id && !opts.force) { closeWin(); return; }
  curWin = id; winOpts = { ...winOpts, ...opts }; ui.set({ win: id }); if (!ui.get().paused && id !== 'menu') {} renderWin(); $('win').classList.remove('hidden');
}
export function closeWin() { curWin = null; ui.set({ win: null }); $('win').classList.add('hidden'); $('win').innerHTML = ''; }
const WTITLE = { country: ['country', 'Ülke Yönetimi'], eco: ['eco', 'Ekonomi'], army: ['army', 'Ordu'], tech: ['tech', 'Teknoloji'], dip: ['dip', 'Diplomasi'], stats: ['stats', 'İstatistikler'], events: ['event', 'Olaylar ve Haberler'], menu: ['menu', 'Sistem Menüsü'] };
export function renderWin() {
  if (!curWin) return; const S = G.S; const el = $('win'); const old = el.querySelector('.body'); const top = old ? old.scrollTop : 0;
  const [ic, title] = WTITLE[curWin];
  const body = ({ country: winCountry, eco: winEco, army: winArmy, tech: winTech, dip: winDip, stats: winStats, events: winEvents, menu: winMenu })[curWin]();
  el.innerHTML = `<div class="w px"><div class="wh">${icon(ic, 'l')}<h2>${title}</h2><button class="x" data-a="closeWin">✕ Kapat</button></div><div class="body">${body}</div></div>`;
  const nb = el.querySelector('.body'); if (nb) nb.scrollTop = top;
  drawCharts();
}
const tabs = (id, items) => `<div class="tabs">${items.map(([k, t]) => `<button data-a="wtab" data-win="${id}" data-t="${k}" class="${(winOpts[id + 'Tab'] || items[0][0]) === k ? 'on' : ''}">${t}</button>`).join('')}</div>`;
const tabOf = (id, def) => winOpts[id + 'Tab'] || def;
const slider = (key, label, min, max, step, fmtf) => { const v = P().pol[key]; return `<div class="sl"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-s="${key}"><span class="v" id="sv-${key}">${fmtf(v)}</span></div>`; };

function winCountry() {
  const n = P(), S = G.S; const t = tabOf('country', 'tax'); let h = tabs('country', [['tax', 'Vergi & Bütçe'], ['spend', 'Harcamalar'], ['pop', 'Nüfus'], ['res', 'Kaynak Yönetimi']]);
  const rv = n.bud.rev, ex = n.bud.exp; const tr = rv.income + rv.corp + rv.tariff, te = Object.values(ex).reduce((a, b) => a + b, 0);
  if (t === 'tax') {
    h += `<div class="grid2"><div class="card"><h3>Vergi Oranları</h3>${slider('taxIncome', 'Gelir vergisi', 0, 0.6, 0.01, (v) => pct(v))}${slider('taxCorp', 'Şirket vergisi', 0, 0.6, 0.01, (v) => pct(v))}${slider('tariff', 'Gümrük tarifesi', 0, 0.4, 0.01, (v) => pct(v))}<p class="mut">Yüksek vergi gelir getirir ama büyümeyi ve istikrarı bastırır; çok düşük vergi yatırımı artırır.</p></div>
    <div class="card"><h3>Günlük Bütçe</h3><table><tr><th>Gelir</th><th></th></tr><tr><td>Gelir vergisi</td><td>${num(rv.income)}</td></tr><tr><td>Şirket vergisi</td><td>${num(rv.corp)}</td></tr><tr><td>Tarife</td><td>${num(rv.tariff)}</td></tr><tr><td><b>Toplam</b></td><td><b>${num(tr)}</b></td></tr></table>
    <table><tr><th>Gider</th><th></th></tr>${[['Eğitim', 'edu'], ['Sağlık', 'health'], ['Altyapı', 'infra'], ['Sübvansiyon', 'subs'], ['Bilim', 'sci'], ['Askerî', 'mil'], ['İdare', 'admin'], ['Faiz', 'interest'], ['Diğer', 'other']].map(([l, k]) => `<tr><td>${l}</td><td>${num(ex[k])}</td></tr>`).join('')}<tr><td><b>Toplam</b></td><td><b>${num(te)}</b></td></tr></table><h3 class="${col(tr - te)}">Net: ${sgn(tr - te)} ¤/gün</h3></div></div>`;
  } else if (t === 'spend') {
    h += `<div class="card"><h3>Kamu Harcamaları (GSYH payı)</h3>${slider('edu', 'Eğitim', 0, 0.12, 0.002, pct1)}${slider('health', 'Sağlık', 0, 0.12, 0.002, pct1)}${slider('infra', 'Altyapı', 0, 0.1, 0.002, pct1)}${slider('agri', 'Tarım desteği', 0, 0.06, 0.002, pct1)}${slider('industry', 'Sanayi desteği', 0, 0.06, 0.002, pct1)}${slider('science', 'Bilim/Ar-Ge', 0, 0.07, 0.002, pct1)}${slider('military', 'Askerî bütçe', 0, 0.2, 0.002, pct1)}
    <div class="grid3" style="margin-top:8px"><div>${icon('school', 's')} Eğitim endeksi<br><b>${n.idx.edu.toFixed(0)}</b>${bar(n.idx.edu)}</div><div>${icon('hospital', 's')} Sağlık endeksi<br><b>${n.idx.health.toFixed(0)}</b>${bar(n.idx.health)}</div><div>${icon('infra', 's')} Altyapı endeksi<br><b>${n.idx.infra.toFixed(0)}</b>${bar(n.idx.infra)}</div><div>${icon('shield', 's')} Hazırlık<br><b>${n.idx.mil.toFixed(0)}</b>${bar(n.idx.mil)}</div></div>
    <p class="mut">Askerî bütçe birlik bakım maliyetinin üstündeyse ordu hazırlığı (moral/saldırı) artar. Harcamalar endeksleri yavaşça değiştirir.</p></div>`;
  } else if (t === 'pop') {
    h += `<div class="card"><h3>Nüfus Yönetimi</h3>${slider('mobilization', 'Seferberlik', 0.05, 1, 0.01, (v) => pct(v))}${slider('immigration', 'Göç politikası', -1, 1, 0.05, (v) => (v > 0 ? 'Açık ' : v < 0 ? 'Kapalı ' : '') + Math.abs(v * 100).toFixed(0) + '%')}${slider('natalism', 'Doğum teşviki', -1, 1, 0.05, (v) => (v > 0 ? '+' : '') + (v * 100).toFixed(0) + '%')}
    <div class="kv"><span>Nüfus</span><span>${popStr(n.pop)}</span><span>İnsan gücü</span><span>${num(n.manpower)} / ${num(n.manpowerMax)}</span><span>İşsizlik</span><span>${pct(n.unemp, 1)}</span><span>Gıda memnuniyeti</span><span class="${n.sat[0] < 1 ? 'neg' : ''}">${pct(n.sat[0])}</span><span>İstikrar</span><span>${n.stab.toFixed(0)}</span></div>
    <p class="mut">Yüksek seferberlik daha çok asker demektir ama istikrarı düşürür. Göç nüfusu büyütür, istikrarı zorlar.</p></div>`;
  } else {
    h += `<div class="card"><h3>Kaynak Politikası</h3><table><tr><th>Kaynak</th><th>Stok</th><th>Net</th><th>Gün</th><th>Politika</th></tr>${RES.map((r, i) => `<tr><td>${icon(r.id, 's')} ${r.name}</td><td>${num(n.stock[i])}</td><td class="${col(n.net[i])}">${sgn(n.net[i], 1)}</td><td>${(n.stock[i] / Math.max(0.1, n.cons[i])).toFixed(0)}</td><td><select data-sel="respol" data-r="${i}">${[['auto', 'Otomatik'], ['hoard', 'Biriktir (ihracat yok)'], ['export', 'Agresif ihracat'], ['block', 'İthalat yok']].map(([k, t2]) => `<option value="${k}" ${n.resPol[i] === k ? 'selected' : ''}>${t2}</option>`).join('')}</select></td></tr>`).join('')}</table></div>`;
  }
  return h;
}
const pct1 = (v) => (v * 100).toFixed(1) + '%';

function winEco() {
  const S = G.S, n = P(); const t = tabOf('eco', 'res'); let h = tabs('eco', [['res', 'Kaynaklar'], ['trade', 'Ticaret'], ['fin', 'Borç & Para'], ['cities', 'Şehirler']]);
  if (t === 'res') {
    h += `<table><tr><th>Kaynak</th><th>Stok</th><th>Üretim</th><th>Tüketim</th><th>Net</th><th>Fiyat</th><th>Trend</th></tr>${RES.map((r, i) => { const hist = S.market.hist; const prev = hist.length > 3 ? hist[hist.length - 4][i] : S.market.price[i]; return `<tr><td>${icon(r.id, 's')} ${r.name}</td><td>${num(n.stock[i])}</td><td>${num(n.prod[i], 1)}</td><td>${num(n.cons[i], 1)}</td><td class="${col(n.net[i])}">${sgn(n.net[i], 1)}</td><td>${S.market.price[i].toFixed(1)} ¤</td><td>${arrow(S.market.price[i] - prev, 0.05)}</td></tr>`; }).join('')}</table>
    <h3>Dünya piyasa fiyatları</h3><canvas class="chart" data-chart="prices" width="900" height="220" style="width:100%;height:220px"></canvas>`;
  } else if (t === 'trade') {
    const fl = Object.values(S.flows).filter((f) => f.from === n.id || f.to === n.id).sort((a, b) => b.v - a.v);
    h += `<div class="kv" style="max-width:420px"><span>İhracat (gün)</span><span class="pos">${num(n.trade.expVal)} ¤</span><span>İthalat (gün)</span><span class="neg">${num(n.trade.impVal)} ¤</span></div><h3>Ticaret Rotaları</h3>` + (fl.length ? `<table><tr><th>Yön</th><th>Ortak</th><th>Değer/gün</th><th>Mallar</th></tr>${fl.map((f) => { const out = f.from === n.id; const o = S.nations[out ? f.to : f.from]; return `<tr><td>${out ? '➜ İhracat' : '⬅ İthalat'}</td><td>${flagImg(o, 's')} ${o.short}</td><td>${num(f.v)}</td><td>${RES.map((r, i) => (f.res[i] > 0.05 ? `${icon(r.id, 's')}${f.res[i].toFixed(1)} ` : '')).join('')}</td></tr>`; }).join('')}</table>` : '<p class="mut">Aktif ticaret yok. Diplomasi → Ticaret anlaşması imzalayın; fazla/eksik kaynaklarınız otomatik alınıp satılır.</p>') + `<p class="mut">Gümrük tarifesi ve Kaynak Politikası (Ülke penceresi) ticareti etkiler. Haritada ticaret gemileri ve kervanları bu rotaları gösterir.</p>`;
  } else if (t === 'fin') {
    h += `<div class="grid2"><div class="card"><h3>Borç</h3><div class="kv"><span>Hazine</span><span>${num(n.money)} ¤</span><span>Borç</span><span>${num(n.debt)} ¤</span><span>Kredi sınırı</span><span>${num(creditLimit(n))} ¤</span><span>Enflasyon</span><span>${pct(n.inflation, 1)}</span><span>Fiyat düzeyi</span><span>×${n.priceLevel.toFixed(2)}</span></div>
    <div class="row" style="margin-top:8px"><button data-a="borrow" data-v="2000">Borçlan 2K</button><button data-a="borrow" data-v="10000">10K</button><button data-a="repay" data-v="2000" class="green">Öde 2K</button><button data-a="repay" data-v="10000" class="green">10K</button><button data-a="repay" data-v="all" class="green">Hepsi</button></div></div>
    <div class="card"><h3>Para Basımı</h3><p class="mut">Acil nakit sağlar ama enflasyonu ve itibar kaybını tetikler.</p><div class="row"><button class="red" data-a="print" data-v="2000">2K bas</button><button class="red" data-a="print" data-v="10000">10K bas</button></div></div></div>
    <canvas class="chart" data-chart="own" data-keys="money,debt" width="900" height="200" style="width:100%;height:200px"></canvas>`;
  } else {
    h += `<table><tr><th>Şehir</th><th>Nüfus</th><th>İş gücü</th><th>Değer/gün</th><th>Üretim</th><th></th></tr>${S.cities.filter((c) => c.owner === n.id).map((c) => `<tr class="click" data-a="selCity" data-c="${c.id}" data-close="1"><td>${c.id === n.capital ? '★ ' : ''}${c.name}</td><td>${popStr(c.pop)}</td><td>${pct(c.lf)}</td><td>${num(c.gdp * n.priceLevel)}</td><td>${RES.map((r, i) => (c.out[i] > 0.5 ? `${icon(r.id, 's')}${c.out[i].toFixed(0)} ` : '')).join('')}</td><td>${c.queue.length ? '🔨' : ''}</td></tr>`).join('')}</table>`;
  }
  return h;
}

function winArmy() {
  const S = G.S, n = P(); const mine = S.armies.filter((a) => a.owner === n.id); const up = n.upkeep || {};
  const by = {}; mine.forEach((a) => (by[a.type] = (by[a.type] || 0) + a.hp / UNITS[a.type].hp));
  let h = `<div class="grid3"><div class="card"><b>İnsan gücü</b><br>${num(n.manpower)} / ${num(n.manpowerMax)}${bar(n.manpower, n.manpowerMax, '#4a8ee0')}</div><div class="card"><b>Günlük bakım</b><br>${num((up.money || 0) * n.priceLevel, 1)} ¤ · ${num(up.food || 0, 1)} gıda · ${num(up.oil || 0, 1)} petrol</div><div class="card"><b>Güç</b> ${num(n.milPower)}<br>${UNIT_KEYS.map((u) => `${UNITS[u].name}: ${(by[u] || 0).toFixed(1)}`).join(' · ')}</div></div>
  <h3>Üretim Kuyruğu</h3>` + (n.prodQueue.length ? n.prodQueue.map((q) => `<div class="card row sp"><span>${UNITS[q.type].name} ×${q.cnt} → ${S.cities[q.city].name}</span><span>${bar(q.total - q.left, q.total, '#e0b030')}<small>${q.left} saat</small> <button class="sm red" data-a="cancelP" data-q="${q.id}">✕</button></span></div>`).join('') : '<p class="mut">Kuyruk boş. Bir şehri seçip “Asker Topla” ile ya da aşağıdan üretim ekleyin.</p>');
  h += `<h3>Toplu Üretim</h3><div class="row"><select id="rc-city">${S.cities.filter((c) => c.owner === n.id).map((c) => `<option value="${c.id}">${c.name}</option>`).join('')}</select><select id="rc-unit">${UNIT_KEYS.map((u) => `<option value="${u}">${UNITS[u].name} (${num(unitCost(S, n, u, 1).money)}¤)</option>`).join('')}</select><select id="rc-n">${[1, 2, 3, 5, 10].map((k) => `<option>${k}</option>`).join('')}</select><button class="gold" data-a="recruitSel">Üret</button></div>
  <h3>Birlikler</h3><table><tr><th>Tür</th><th>Sayı</th><th>Can</th><th>Moral</th><th>İkmal</th><th>Konum</th><th>Durum</th></tr>${mine.map((a) => { const c = cityAt(S, a.tile); return `<tr class="click" data-a="selArmy" data-id="${a.id}" data-close="1"><td>${UNITS[a.type].name}${a.group ? ' ⛓' : ''}</td><td>${count(a)}</td><td>${pct(a.hp / a.max)}</td><td>${a.morale.toFixed(0)}</td><td class="${a.supply < 30 ? 'neg' : ''}">${a.supply.toFixed(0)}</td><td>${c ? c.name : (a.tile % W) + ',' + ((a.tile / W) | 0)}</td><td>${a.engaged >= 0 ? '<span class="neg">savaşta</span>' : a.path.length ? 'yolda' : a.state === 'out' ? 'uçuşta' : '—'}</td></tr>`; }).join('')}</table>`;
  return h;
}

function winTech() {
  const S = G.S, n = P(); let h = '';
  const r = n.research;
  h += `<div class="card row sp"><span>${icon('science')} Araştırma puanı: <b>${n.rp.toFixed(1)}/gün</b></span><span>${r ? `<b>${TECH_BY[r.id].name}</b> ${Math.round(r.progress)}/${TECH_BY[r.id].rp}` : 'Aktif araştırma yok'}</span></div>${r ? bar(r.progress, TECH_BY[r.id].rp, '#4a8ee0') : ''}<div class="grid3" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-top:8px">`;
  for (const A of TECH_AREAS) {
    h += `<div class="card"><h3>${A.name}</h3>` + TECHS.filter((t) => t.area === A.id).map((t) => {
      const st = techState(n, t); const cost = t.money * n.priceLevel;
      return `<div class="card ${st === 'done' ? 'sel' : ''}" style="opacity:${st === 'locked' ? 0.5 : 1}"><b>${st === 'done' ? '✔ ' : st === 'locked' ? '🔒 ' : ''}${t.name}</b><div class="mut">${t.desc}</div><div class="row sp"><small>${t.rp} RP · ${num(cost)}¤</small>${st === 'avail' ? `<button class="sm green" data-a="research" data-t="${t.id}" ${n.money < cost ? 'disabled' : ''}>Araştır</button>` : st === 'active' ? '<small class="warnc">Sürüyor</small>' : ''}</div></div>`;
    }).join('') + '</div>';
  }
  return h + '</div>';
}

function winDip() {
  const S = G.S, me = P(); let sel = winOpts.dipN; if (sel === undefined || sel === me.id || !S.nations[sel].alive) sel = S.nations.find((x) => x.alive && x.id !== me.id).id; winOpts.dipN = sel;
  const o = S.nations[sel], P_ = pactR(S, me.id, sel), op = S.dip.op[sel][me.id], intel = S.dip.intel[me.id][sel] > S.day || allied(S, me.id, sel);
  let list = `<div style="max-height:62vh;overflow:auto">` + S.nations.filter((x) => x.id !== me.id).map((x) => { const p = pactR(S, me.id, x.id); const v = S.dip.op[x.id][me.id]; return `<div class="card click row sp ${x.id === sel ? 'sel' : ''}" data-a="dipSel" data-n="${x.id}" style="${x.alive ? '' : 'opacity:.4'}"><span>${flagImg(x, 's')} ${x.short} ${p.war ? '⚔' : ''}${p.ally ? '🤝' : ''}${p.trade ? '📦' : ''}</span><b class="${col(v)}">${x.alive ? v.toFixed(0) : '✝'}</b></div>`; }).join('') + '</div>';
  let inbox = S.inbox.length ? `<div class="card" style="border-color:var(--gold)"><h3>Gelen Teklifler</h3>${S.inbox.map((m) => `<div class="row sp" style="margin:4px 0"><span>${flagImg(S.nations[m.from], 's')} ${S.nations[m.from].short}: ${typeName(m.type)}</span><span><button class="sm green" data-a="inbox" data-id="${m.id}" data-v="1">Kabul</button> <button class="sm red" data-a="inbox" data-id="${m.id}" data-v="0">Reddet</button></span></div>`).join('')}</div>` : '';
  const ev = (type) => { const e = evaluate(S, me.id, sel, type); return e; };
  const chance = (e) => (!e.ok && e.why ? `<small class="neg">${e.why}</small>` : `<small class="${e.score >= 10 ? 'pos' : e.score >= 0 ? 'warnc' : 'neg'}">${e.score >= 20 ? 'Çok olası' : e.score >= 5 ? 'Olası' : e.score >= 0 ? 'Zor' : 'Reddeder'} (${e.score.toFixed(0)})</small>`);
  const act = (type, label, ic) => { const e = ev(type); const dis = !e.ok && e.why; return `<button class="${dis ? 'dis' : ''}" ${dis ? 'disabled' : ''} data-a="dip" data-t="${type}" data-n="${sel}">${icon(ic, 's')} ${label}</button> ${chance(e)}`; };
  const giftAmt = Math.max(300, Math.round(me.gdpDay * 0.5));
  const br = opinionBreakdown(S, sel, me.id), mem = memScore(S, sel, me.id);
  let h = inbox + `<div class="grid2" style="grid-template-columns:230px 1fr"><div>${list}</div><div class="card"><div class="hd">${flagImg(o, 'l')}<div><h2>${o.short}</h2><div class="mut">${o.name} · ${GOV[o.gov].name}</div><div class="mut">${o.trait}</div></div></div>
  <div class="kv"><span>Bize bakışı</span><span class="${col(op)}"><b>${op.toFixed(0)}</b></span><span>Askerî güç</span><span>${num(o.milPower)} (bizim ${num(me.milPower)})</span><span>Nüfus / GSYH</span><span>${popStr(o.pop)} / ${num(o.gdp)}</span><span>Hazine</span><span>${intel ? num(o.money) : '~' + num(Math.round(o.money / 1000) * 1000)}</span><span>İtibar</span><span>${o.rep.toFixed(0)}</span>${intel ? `<span>Planı</span><span>${{ expand: 'Yayılma', trade: 'Ticaret', tech: 'Teknoloji', fortify: 'Savunma', industry: 'Sanayi', consolidate: 'Güçlenme' }[o.ai.plan.kind]}${o.ai.plan.target >= 0 ? ' → ' + S.nations[o.ai.plan.target].short : ''}` + '</span>' : ''}</div>
  <div class="row" style="margin:6px 0">${P_.war ? '<b class="neg">SAVAŞ HALİ</b>' : ''}${P_.ally ? '<b class="pos">İTTİFAK</b>' : ''}${P_.trade ? '📦 Ticaret' : ''}${P_.nap > S.day ? '🕊 Saldırmazlık' : ''}${P_.access ? '🛤 Askerî geçiş' : ''}${S.dip.sanc[me.id][sel] ? '⛔ Yaptırımımız' : ''}${S.dip.sanc[sel][me.id] ? '⛔ Yaptırım altındayız' : ''}${P_.truce > S.day ? `🏳 Ateşkes ${P_.truce - S.day} gün` : ''}</div>
  ${o.alive ? `<div class="grid2" style="margin-top:6px"><div>${P_.war ? act('peace', 'Barış teklif et', 'dip') : act('alliance', 'İttifak', 'dip')}<br>${act('trade', 'Ticaret anlaşması', 'market')}<br>${act('nap', 'Saldırmazlık paktı', 'shield')}<br>${act('access', 'Askerî geçiş', 'army')}</div>
  <div><button data-a="dip" data-t="gift" data-n="${sel}">${icon('money', 's')} İlişki geliştir (${num(giftAmt)}¤)</button><br><button data-a="dip" data-t="aid" data-n="${sel}">${icon('swords', 's')} Askerî destek (40 demir, 12 petrol)</button><br><button data-a="dip" data-t="threat" data-n="${sel}">Tehdit et</button><br><button data-a="dip" data-t="${S.dip.sanc[me.id][sel] ? 'unsanction' : 'sanction'}" data-n="${sel}">${S.dip.sanc[me.id][sel] ? 'Yaptırımı kaldır' : 'Ekonomik yaptırım'}</button></div></div>
  <h3>Casusluk</h3><div class="row">${Object.entries(SPY_OPS).map(([k, v]) => `<button class="sm" data-a="spy" data-op="${k}" data-n="${sel}" title="${v.desc}">${icon('spy', 's')} ${v.name} (${num(v.cost * me.priceLevel)}¤)</button>`).join('')}</div>
  <div class="row" style="margin-top:10px">${!P_.war ? `<button class="red" data-a="dip" data-t="war" data-n="${sel}">⚔ SAVAŞ İLAN ET</button>` : ''}${P_.ally ? `<button class="sm" data-a="dip" data-t="breakAlly" data-n="${sel}">İttifakı boz</button>` : ''}${P_.trade ? `<button class="sm" data-a="dip" data-t="breakTrade" data-n="${sel}">Ticareti kes</button>` : ''}</div>` : '<p class="neg">Bu devlet artık yok.</p>'}
  <h3>Görüş Nedenleri ${intel ? '' : '<small class="mut">(ittifak/istihbarat ile hafıza ayrıntısı)</small>'}</h3><table>${br.parts.filter((p) => intel || !p.mem).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 14).map((p) => `<tr><td>${p.mem ? '🧠 ' : ''}${p.t}</td><td class="${col(p.v)}">${sgn(p.v, 0)}</td></tr>`).join('')}</table></div></div>`;
  return h;
}

const METRICS = { gdp: 'GSYH (yıllık)', pop: 'Nüfus (bin)', army: 'Askerî güç', stab: 'İstikrar', infl: 'Enflasyon %', growth: 'Büyüme %', debt: 'Borç', money: 'Net varlık' };
function winStats() {
  const S = G.S; const m = winOpts.metric || 'gdp'; const alive = S.nations.filter((n) => n.alive).sort((a, b) => b.gdp - a.gdp);
  return `<div class="tabs">${Object.entries(METRICS).map(([k, t]) => `<button data-a="metric" data-m="${k}" class="${m === k ? 'on' : ''}">${t}</button>`).join('')}</div><canvas class="chart" data-chart="all" data-m="${m}" width="1000" height="300" style="width:100%;height:300px"></canvas>
  <h3>Sıralama</h3><table><tr><th>#</th><th>Devlet</th><th>GSYH</th><th>Nüfus</th><th>Ordu</th><th>İstikrar</th><th>Şehir</th><th>Hazine</th><th>Enf.</th></tr>${alive.map((n, i) => `<tr class="click ${n.id === S.player ? 'pos' : ''}" data-a="selNation" data-n="${n.id}" data-close="1"><td>${i + 1}</td><td>${flagImg(n, 's')} ${n.short}</td><td>${num(n.gdp)}</td><td>${popStr(n.pop)}</td><td>${num(n.milPower)}</td><td>${n.stab.toFixed(0)}</td><td>${S.cities.filter((c) => c.owner === n.id).length}</td><td>${num(n.money)}</td><td>${pct(n.inflation, 1)}</td></tr>`).join('')}</table>`;
}
function winEvents() {
  const S = G.S; const f = winOpts.evf || 'all';
  const rows = S.log.slice().reverse().filter((e) => f === 'all' || (f === 'mine' && (e.nid === S.player || e.inv.includes(S.player))) || e.tag === f).slice(0, 120);
  return `<div class="tabs">${[['all', 'Hepsi'], ['mine', 'Bizimle ilgili'], ['war', 'Savaş'], ['dip', 'Diplomasi'], ['event', 'Olaylar'], ['tech', 'Teknoloji']].map(([k, t]) => `<button data-a="evf" data-f="${k}" class="${f === k ? 'on' : ''}">${t}</button>`).join('')}</div>` + rows.map((e) => `<div class="card" style="border-left:4px solid ${['#4a8ee0', '#5cd05c', '#e0b030', '#e05050'][e.sev]}"><small class="mut">${dayStr(Math.floor(e.t / 24))}</small> ${e.text}</div>`).join('');
}
function winMenu() {
  const s = ui.get().settings; const sv = listSaves();
  return `<div class="grid2"><div class="card"><h3>Kayıt / Yükle</h3>${['auto', '1', '2', '3'].map((k) => `<div class="card row sp"><span><b>${k === 'auto' ? 'Otomatik' : 'Slot ' + k}</b><br><small class="mut">${sv[k] ? `${sv[k].nation} · ${sv[k].date}` : 'boş'}</small></span><span>${k !== 'auto' ? `<button class="sm green" data-a="save" data-k="${k}">Kaydet</button> ` : ''}<button class="sm" ${sv[k] ? '' : 'disabled'} data-a="load" data-k="${k}">Yükle</button></span></div>`).join('')}</div>
  <div class="card"><h3>Ayarlar</h3>${[['names', 'İsim etiketleri'], ['units', 'Birim çubukları'], ['water', 'Su animasyonu'], ['tradeVis', 'Ticaret araçları'], ['autosave', 'Otomatik kayıt']].map(([k, t]) => `<label class="row sp" style="margin:6px 0"><span>${t}</span><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''}></label>`).join('')}<div class="sl"><span>Ses</span><input type="range" min="0" max="1" step="0.05" value="${s.sound}" data-set="sound"><span class="v">${Math.round(s.sound * 100)}%</span></div>
  <div class="row" style="margin-top:12px"><button data-a="closeWin" class="green">Devam et</button><button data-a="toTitle" class="red">Ana menü</button></div><p class="mut">Kısayollar: Boşluk duraklat · 1-4 hız · WASD/oklar kaydır · +/- yakınlaştır · Esc seçimi kaldır · Shift+sürükle kutu seçimi</p></div></div>`;
}

// ---------------- Grafikler
const PAL = ['#e8c04a', '#e05050', '#4a8ee0', '#5cd05c', '#a07be0', '#e0873a', '#5fd8ff', '#e86aa0'];
function lineChart(cv, series, title) {
  const x = cv.getContext('2d'), w = cv.width, h = cv.height; x.clearRect(0, 0, w, h); x.fillStyle = '#080d16'; x.fillRect(0, 0, w, h);
  let mx = -1e18, mn = 1e18, len = 0; for (const s of series) { len = Math.max(len, s.data.length); for (const v of s.data) { mx = Math.max(mx, v); mn = Math.min(mn, v); } }
  if (len < 2) { x.fillStyle = '#8fa0b8'; x.font = '16px system-ui'; x.fillText('Veri birikiyor… (10 günde bir kayıt)', 20, h / 2); return; }
  if (mx === mn) { mx += 1; mn -= 1; } const pad = 36, L = 70;
  x.strokeStyle = '#1e2c46'; x.fillStyle = '#8fa0b8'; x.font = '12px system-ui'; x.textAlign = 'right';
  for (let i = 0; i <= 4; i++) { const y = pad / 2 + (h - pad) * i / 4; x.beginPath(); x.moveTo(L, y); x.lineTo(w - 10, y); x.stroke(); x.fillText(fmt(mx - (mx - mn) * i / 4, 1), L - 6, y + 4); }
  series.forEach((s, k) => { x.strokeStyle = s.color || PAL[k % PAL.length]; x.lineWidth = s.bold ? 3 : 1.6; x.beginPath(); s.data.forEach((v, i) => { const px = L + (w - L - 10) * i / (len - 1), py = pad / 2 + (h - pad) * (1 - (v - mn) / (mx - mn)); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); });
  x.textAlign = 'left'; let lx = L + 6; series.slice(0, 16).forEach((s, k) => { x.fillStyle = s.color || PAL[k % PAL.length]; x.fillRect(lx, h - 14, 10, 8); x.fillStyle = '#c9d6ea'; x.fillText(s.name, lx + 14, h - 6); lx += x.measureText(s.name).width + 30; });
}
function drawCharts() {
  const S = G.S; document.querySelectorAll('canvas.chart').forEach((cv) => {
    const k = cv.dataset.chart;
    if (k === 'prices') lineChart(cv, RES.map((r, i) => ({ name: r.name, color: r.col, data: S.market.hist.map((h) => h[i] / RES[i].base) })).filter((s, i) => i !== 4));
    else if (k === 'own') lineChart(cv, cv.dataset.keys.split(',').map((kk, i) => ({ name: kk === 'money' ? 'Net varlık' : 'Borç', data: P().hist[kk], bold: true })));
    else if (k === 'all') { const m = cv.dataset.m; lineChart(cv, S.nations.filter((n) => n.alive || n.hist[m].length).map((n) => ({ name: n.short, color: n.col, bold: n.id === S.player, data: n.hist[m] }))); }
  });
}

// ---------------- Olay penceresi
export function checkModal() {
  const S = G.S, m = $('modal'); if (!m.classList.contains('hidden')) return; const ev = S.pending[0]; if (!ev) return;
  ui.set({ paused: true });
  m.classList.remove('hidden'); m.innerHTML = `<div class="m px"><h2 style="color:${['#4a8ee0', '#5cd05c', '#e0b030', '#e05050'][ev.sev]}">${ev.title}</h2><p>${ev.text}</p><div>${ev.choices.map((c, i) => `<button class="ch" data-a="choice" data-id="${ev.id}" data-i="${i}">${c.t}<small>${c.d}</small></button>`).join('')}</div></div>`;
}
export function gameOverModal() {
  const m = $('modal'); m.classList.remove('hidden'); m.innerHTML = `<div class="m px"><h2 class="neg">Devletiniz yıkıldı</h2><p>${P().name} tarihe karıştı. Yeni bir dünya deneyin.</p><button class="ch gold" data-a="toTitle">Ana menü</button></div>`;
}

// ---------------- Kontrol
export function refresh(force) {
  if (!G.S) return; updateHud();
  const busy = Date.now() < G.hold; if (!busy || force) { renderSide(); if (curWin) renderWin(); }
}
export const holdUI = (ms = 1200) => { G.hold = Date.now() + ms; };

export function initUIEvents(actions) {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-a]'); if (!t) return; if (t.disabled) return; const a = t.dataset.a; const f = actions[a]; if (f) { f(t.dataset, t, e); }
  });
  document.addEventListener('input', (e) => {
    const t = e.target; if (t.dataset.s) { holdUI(); const v = parseFloat(t.value); setPolicy(G.S, G.S.player, t.dataset.s, v); const lbl = $('sv-' + t.dataset.s); if (lbl) { const fm = { taxIncome: pct, taxCorp: pct, tariff: pct, mobilization: pct }; lbl.textContent = fm[t.dataset.s] ? fm[t.dataset.s](v) : t.dataset.s === 'immigration' || t.dataset.s === 'natalism' ? (v * 100).toFixed(0) + '%' : pct1(v); } }
    if (t.dataset.set) { const s = { ...ui.get().settings }; s[t.dataset.set] = t.type === 'checkbox' ? t.checked : parseFloat(t.value); ui.set({ settings: s }); actions.saveSettings && actions.saveSettings(); }
  });
  document.addEventListener('change', (e) => { const t = e.target; if (t.dataset.sel === 'respol') { setResPol(G.S, G.S.player, +t.dataset.r, t.value); } });
  document.addEventListener('pointerdown', (e) => { if (e.target.closest('#win,#side')) holdUI(1500); });
}
export { toast as notify, winOpts, res, curWin };
export const setWinOpt = (k, v) => { winOpts[k] = v; };
