// Önyükleme: başlık ekranı, oyun döngüsü, girdi (fare/klavye/dokunmatik), komut eşleme
import { W, H, TS, clamp, dist, popStr, fmt, dateStr } from './util.js';
import { NATIONS, GOV, UNITS } from './data.js';
import { ui, atWar, cityAt } from './state.js';
import { newGame, stepHour } from './game.js';
import { MapRenderer } from './render.js';
import { flagImg, icon } from './icons.js';
import * as UI from './ui.js';
import { G, toast } from './ui.js';
import { saveGame, loadGame, listSaves, lastSlot, loadSettings, saveSettings } from './save.js';
import { build, cancelBuild, borrow, repay, printMoney, startResearch } from './economy.js';
import { queueUnit, cancelProd, orderMove, orderHold, orderStrike, splitArmy, mergeAt, groupArmies, ungroup, disband, retreat } from './military.js';
import { propose, declareWar, breakTreaty, sanction, gift, militaryAid, threaten, spyOp, answerInbox } from './diplomacy.js';
import { resolveEvent } from './events.js';

const $ = (id) => document.getElementById(id);
const canvas = $('map'); const R = new MapRenderer(canvas); G.R = R;
let S = null, preview = null, sel = G.sel, hoverTile = -1, box = null, acc = 0, last = performance.now(), lastHud = 0, lastPanel = 0, lastMini = 0, titleSeed = 1936, pickNation = 0, loadingReal = false;
const HPS = { 1: 3, 2: 6, 5: 15, 10: 30 };

// ---- ses
let AC = null;
function beep(f = 520, d = 0.06, v = 0.05) { const vol = ui.get().settings.sound; if (!vol) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(); o.type = 'square'; o.frequency.value = f; g.gain.value = v * vol; o.connect(g); g.connect(AC.destination); o.start(); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + d); o.stop(AC.currentTime + d); } catch (e) {} }
document.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) beep(660, 0.04, 0.04); });

function setLoading(on, txt, p) { const l = $('loading'); l.classList.toggle('off', !on); if (txt) $('ldtxt').textContent = txt; if (p !== undefined) $('ldbar').style.width = Math.round(p * 100) + '%'; }

async function prepare(seed, loaded) {
  setLoading(true, 'Dünya üretiliyor…', 0.02); await new Promise((r) => setTimeout(r, 30));
  const s = loaded || newGame(seed, 0);
  await R.init(s.W, (p) => setLoading(true, 'Haritaya hayat veriliyor…', 0.1 + p * 0.9));
  R.mini = $('minimap'); R.polVer = -1; setLoading(false);
  return s;
}

// ---- başlık ekranı
function showTitle(view = 'main') {
  ui.set({ screen: 'title', paused: true }); $('hud').classList.add('hidden'); $('side').classList.remove('open'); UI.closeWin(); $('modal').classList.add('hidden');
  const t = $('title'); t.classList.add('on'); const sv = listSaves(); const has = Object.keys(sv).length;
  if (view === 'main') {
    t.innerHTML = `<div class="tt"><div class="logo">PIXEL<br>NATIONS</div><div class="sub">HD piksel sanatı büyük strateji — 15 devlet, tek dünya</div><div class="menu">${has ? `<button class="gold" data-t="continue">Devam Et</button>` : ''}<button class="${has ? '' : 'gold'}" data-t="new">Yeni Oyun</button><button data-t="load" ${has ? '' : 'disabled'}>Oyun Yükle</button><button data-t="settings">Ayarlar</button><button data-t="quit">Çıkış</button></div><p class="mut" style="margin-top:30px">Tarayıcıda çalışır · Dokunmatik ve fare/klavye desteği · v1.0</p></div>`;
  } else if (view === 'new') {
    const cards = preview.nations.map((n) => `<div class="ncard ${n.id === pickNation ? 'sel' : ''}" data-t="pick" data-n="${n.id}"><div class="row">${flagImg(n)}<div><b>${n.short}</b><br><small class="mut">${GOV[n.gov].name}</small></div></div><div class="mut" style="margin:4px 0">${n.trait}</div><small>Şehir ${preview.cities.filter((c) => c.owner === n.id).length} · Nüfus ${popStr(n.pop)} · Ordu ${fmt(n.milPower)}<br>GSYH ${fmt(n.gdp)} · ${preview.nations[n.id].tr.aggr > 0.6 ? '⚔ saldırgan' : preview.nations[n.id].tr.merc > 0.7 ? '📦 tüccar' : preview.nations[n.id].tr.para > 0.7 ? '🛡 savunmacı' : '⚖ dengeli'}</small></div>`).join('');
    t.innerHTML = `<div class="tt"><h1 class="logo" style="font-size:24px">YENİ OYUN</h1><div class="row" style="justify-content:center;margin:14px 0"><span>Dünya tohumu (seed):</span><input type="number" id="seedin" value="${titleSeed}" style="width:130px"><button data-t="reseed">Uygula</button><button data-t="rand">🎲 Rastgele</button></div>
    <div class="row" style="justify-content:center"><span>Zorluk:</span><select id="diff"><option value="1.6">Kolay</option><option value="1" selected>Normal</option><option value="0.6">Zor</option></select></div><p class="mut">Bir devlet seçin (haritada vurgulanır):</p><div class="ngrid">${cards}</div><div class="row" style="justify-content:center;position:sticky;bottom:10px"><button data-t="main">‹ Geri</button><button class="gold" data-t="start" style="font-size:15px;padding:10px 24px">BAŞLA — ${preview.nations[pickNation].short}</button></div></div>`;
  } else if (view === 'load') {
    t.innerHTML = `<div class="tt"><h1 class="logo" style="font-size:24px">OYUN YÜKLE</h1><div class="menu" style="max-width:420px;margin-top:20px">${['auto', '1', '2', '3'].map((k) => `<button data-t="loadslot" data-k="${k}" ${sv[k] ? '' : 'disabled'}>${k === 'auto' ? 'Otomatik' : 'Slot ' + k}: ${sv[k] ? `${sv[k].nation} — ${sv[k].date}` : 'boş'}</button>`).join('')}<button data-t="main">‹ Geri</button></div></div>`;
  } else if (view === 'settings') {
    const s = ui.get().settings;
    t.innerHTML = `<div class="tt"><h1 class="logo" style="font-size:24px">AYARLAR</h1><div class="card" style="max-width:420px;margin:20px auto;text-align:left">${[['names', 'İsim etiketleri'], ['units', 'Birim çubukları'], ['water', 'Su animasyonu'], ['tradeVis', 'Ticaret araçları'], ['autosave', 'Otomatik kayıt']].map(([k, tx]) => `<label class="row sp" style="margin:8px 0"><span>${tx}</span><input type="checkbox" data-set="${k}" ${s[k] ? 'checked' : ''}></label>`).join('')}<div class="sl"><span>Ses</span><input type="range" min="0" max="1" step="0.05" value="${s.sound}" data-set="sound"><span class="v">${Math.round(s.sound * 100)}%</span></div></div><button data-t="main">‹ Geri</button></div>`;
  }
}
$('title').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-t]'); if (!b || b.disabled) return; const k = b.dataset.t;
  if (k === 'main' || k === 'load' || k === 'settings') showTitle(k);
  else if (k === 'new') showTitle('new');
  else if (k === 'pick') { pickNation = +b.dataset.n; showTitle('new'); R.focusTile(preview.cities[preview.nations[pickNation].capital].t, 1.4); G.sel.nation = pickNation; }
  else if (k === 'rand' || k === 'reseed') { titleSeed = k === 'rand' ? Math.floor(Math.random() * 99999) + 1 : (+$('seedin').value || 1); $('title').classList.remove('on'); preview = await prepare(titleSeed); pickNation = 0; G.sel.nation = null; R.fitAll(true); showTitle('new'); }
  else if (k === 'start') { const df = +($('diff') ? $('diff').value : 1); preview.player = pickNation; preview.difficulty = df; const n = preview.nations[pickNation]; n.money = Math.round(n.money * df); startGame(preview); preview = null; }
  else if (k === 'continue') { const sl = lastSlot(); const s = loadGame(sl); if (s) { $('title').classList.remove('on'); const ss = await prepare(s.seed, s); startGame(ss, true); } }
  else if (k === 'loadslot') { const s = loadGame(b.dataset.k); if (s) { $('title').classList.remove('on'); const ss = await prepare(s.seed, s); startGame(ss, true); } else toast('Yükleme başarısız', 3); }
  else if (k === 'quit') { window.close(); $('title').innerHTML = `<div class="tt"><div class="logo">GÜLE GÜLE</div><p class="sub">Sekmeyi kapatabilirsiniz.</p><button data-t="main">Ana menüye dön</button></div>`; }
});
$('title').addEventListener('input', (e) => { const t = e.target; if (t.dataset.set) { const s = { ...ui.get().settings }; s[t.dataset.set] = t.type === 'checkbox' ? t.checked : parseFloat(t.value); ui.set({ settings: s }); saveSettings(s); } });

function startGame(s, loaded) {
  S = s; G.S = S; $('title').classList.remove('on'); $('hud').classList.remove('hidden'); ui.set({ screen: 'game', paused: false, speed: 1 });
  sel.armies = []; sel.city = null; sel.nation = null; UI.buildHud(); R.polVer = -1; S.visDirty = true;
  const cap = S.cities[S.nations[S.player].capital]; R.focusTile(cap.t, window.innerWidth < 820 ? 1.6 : 2); R.cam.x = R.cam.tx; R.cam.y = R.cam.ty; R.cam.z = R.cam.tz;
  UI.refresh(true); toast(loaded ? 'Oyun yüklendi' : `${S.nations[S.player].name} yönetimi sizde. Kolay gelsin!`, 1);
}

// ---- komutlar
const A = {
  win: (d) => { if (d.n !== undefined) UI.setWinOpt('dipN', +d.n); UI.openWin(d.w, { force: d.n !== undefined }); },
  closeWin: () => UI.closeWin(),
  speed: (d) => { const v = +d.v; if (v === 0) ui.set({ paused: true }); else ui.set({ paused: false, speed: v }); UI.updateHud(); },
  qsave: () => UI.res(saveGame(S, '1')),
  desel: () => { sel.armies = []; sel.city = null; sel.nation = null; UI.renderSide(); },
  selCity: (d) => { sel.armies = []; sel.city = +d.c; sel.nation = null; UI.closeWin(); UI.renderSide(); R.focusTile(S.cities[+d.c].t); },
  selNation: (d) => { sel.armies = []; sel.city = null; sel.nation = +d.n; if (d.close) UI.closeWin(); UI.renderSide(); },
  focusN: (d) => { R.focusTile(S.cities[S.nations[+d.n].capital].t, 2); },
  build: (d) => UI.res(build(S, S.player, +d.c, d.k)),
  cancelB: (d) => { cancelBuild(S, S.player, +d.c, +d.i); UI.refresh(true); },
  recruit: (d) => UI.res(queueUnit(S, S.player, +d.c, d.u, 1)),
  recruitSel: () => UI.res(queueUnit(S, S.player, +$('rc-city').value, $('rc-unit').value, +$('rc-n').value)),
  cancelP: (d) => { cancelProd(S, S.player, +d.q); UI.refresh(true); },
  hold: () => { for (const a of selArmies()) orderHold(S, a); UI.refresh(true); },
  retreat: () => { for (const a of selArmies()) retreat(S, a); UI.refresh(true); },
  airloop: () => { for (const a of selArmies()) a.loop = !a.loop; UI.refresh(true); },
  split: () => { const l = selArmies(); const b = l[0] && splitArmy(S, l[0]); if (b) sel.armies.push(b.id); else toast('Bölünemez (en az 2 birim)', 2); UI.refresh(true); },
  merge: () => { const l = selArmies(); let n = 0; for (const a of l) n += mergeAt(S, a); sel.armies = sel.armies.filter((id) => S.armies.some((a) => a.id === id)); toast(n ? `${n} birlik birleştirildi` : 'Aynı karede aynı türden birlik yok', n ? 1 : 2); UI.refresh(true); },
  group: () => { toast(groupArmies(S, selArmies()) ? 'Gruplandı: birlikte hareket eder (kara)' : 'Gruplanamadı (en az 2 kara birliği)', 1); UI.refresh(true); },
  ungroup: () => { for (const a of selArmies()) ungroup(S, a); UI.refresh(true); },
  disband: () => { if (confirm('Seçili birlikler dağıtılsın mı?')) { for (const a of selArmies()) disband(S, a); sel.armies = []; UI.refresh(true); } },
  multi: () => { ui.set({ multi: !ui.get().multi }); UI.refresh(true); },
  selSame: () => { const a = selArmies()[0]; if (a) sel.armies = S.armies.filter((x) => x.owner === a.owner && x.tile === a.tile).map((x) => x.id); UI.refresh(true); },
  selArmy: (d) => { const a = S.armies.find((x) => x.id === +d.id); if (a) { sel.armies = [a.id]; sel.city = null; sel.nation = null; if (d.close) UI.closeWin(); R.focusTile(a.tile, 2); UI.renderSide(); } },
  wtab: (d) => { UI.setWinOpt(d.win + 'Tab', d.t); UI.renderWin(); },
  borrow: (d) => UI.res(borrow(S, S.player, +d.v)),
  repay: (d) => UI.res(repay(S, S.player, d.v === 'all' ? 1e12 : +d.v)),
  print: (d) => { if (confirm('Para basımı enflasyonu artırır. Emin misiniz?')) UI.res(printMoney(S, S.player, +d.v)); },
  research: (d) => UI.res(startResearch(S, S.player, d.t)),
  dipSel: (d) => { UI.setWinOpt('dipN', +d.n); UI.renderWin(); },
  inbox: (d) => { answerInbox(S, +d.id, d.v === '1'); UI.refresh(true); },
  dip: (d) => {
    const me = S.player, o = +d.n, t = d.t;
    if (['alliance', 'trade', 'nap', 'access', 'peace'].includes(t)) UI.res(propose(S, me, o, t));
    else if (t === 'gift') UI.res(gift(S, me, o, Math.max(300, Math.round(S.nations[me].gdpDay * 0.5))));
    else if (t === 'aid') UI.res(militaryAid(S, me, o));
    else if (t === 'threat') UI.res(threaten(S, me, o));
    else if (t === 'sanction') UI.res(sanction(S, me, o, true)); else if (t === 'unsanction') UI.res(sanction(S, me, o, false));
    else if (t === 'war') { if (confirm(`${S.nations[o].short} devletine SAVAŞ ilan edilsin mi? Müttefikler devreye girebilir.`)) UI.res(declareWar(S, me, o, 'aggr')); }
    else if (t === 'breakAlly') { breakTreaty(S, me, o, 'alliance'); UI.refresh(true); } else if (t === 'breakTrade') { breakTreaty(S, me, o, 'trade'); UI.refresh(true); }
  },
  spy: (d) => UI.res(spyOp(S, S.player, +d.n, d.op)),
  metric: (d) => { UI.setWinOpt('metric', d.m); UI.renderWin(); },
  evf: (d) => { UI.setWinOpt('evf', d.f); UI.renderWin(); },
  save: (d) => UI.res(saveGame(S, d.k)),
  load: async (d) => { const s = loadGame(d.k); if (s) { UI.closeWin(); const ss = await prepare(s.seed, s); startGame(ss, true); } },
  toTitle: async () => { UI.closeWin(); $('modal').classList.add('hidden'); if (S) saveGame(S, 'auto'); S = null; G.S = null; preview = await prepare(titleSeed); R.fitAll(true); showTitle('main'); },
  choice: (d) => { resolveEvent(S, +d.id, +d.i); $('modal').classList.add('hidden'); UI.refresh(true); },
  saveSettings: () => saveSettings(ui.get().settings),
};
const selArmies = () => sel.armies.map((id) => S.armies.find((a) => a.id === id)).filter((a) => a && a.owner === S.player);
UI.initUIEvents(A);

// ---- girdi
const ptrs = new Map(); let drag = null, pinch = null;
function worldOrder(sx, sy) {
  const arm = selArmies(); if (!arm.length) return false;
  let tile = R.tileAt(sx, sy); const c = R.pickCity(S, sx, sy); if (c) tile = c.t; if (tile < 0) return true;
  let ok = 0, msg = '';
  const seen = new Set();
  for (const a of arm) { if (a.group && seen.has(a.group)) continue; if (a.group) seen.add(a.group); const r = a.type === 'air' ? orderStrike(S, a, tile) : orderMove(S, a, tile); if (r.ok) ok++; else msg = r.msg; }
  if (ok) { beep(440, 0.05); S.fx.push({ k: 'order', tile, t: S.t, n: S.fxSeq++ }); R.parts.push({ k: 'ring', x: (tile % W) * TS + 8, y: ((tile / W) | 0) * TS + 8, life: 0.8, r: 2 }); } else toast(msg || 'Emir verilemedi', 2);
  UI.renderSide(); return true;
}
function tap(sx, sy, shift) {
  if (!S) return;
  const army = R.pickArmy(S, sx, sy, S.player); const own = army && army.owner === S.player;
  if (selArmies().length && !(own && (shift || ui.get().multi || !selArmies().includes(army) && false))) {
    if (own && !sel.armies.includes(army.id)) { sel.armies = [army.id]; selectGroup(army); UI.renderSide(); return; }
    if (own && sel.armies.includes(army.id) && !shift && !ui.get().multi) { UI.renderSide(); return; }
  }
  if (own && (shift || ui.get().multi) && selArmies().length) { const i = sel.armies.indexOf(army.id); if (i >= 0) sel.armies.splice(i, 1); else sel.armies.push(army.id); UI.renderSide(); return; }
  if (selArmies().length) { worldOrder(sx, sy); return; }
  if (army) { sel.armies = [army.id]; sel.city = null; sel.nation = null; if (own) selectGroup(army); UI.renderSide(); return; }
  const c = R.pickCity(S, sx, sy); if (c) { sel.city = c.id; sel.nation = null; sel.armies = []; UI.renderSide(); return; }
  const t = R.tileAt(sx, sy); const o = t >= 0 ? S.ownerGrid[t] : -1;
  sel.armies = []; sel.city = null; sel.nation = o >= 0 ? o : null; UI.renderSide();
}
function selectGroup(a) { if (a.group) sel.armies = S.armies.filter((x) => x.group === a.group).map((x) => x.id); }
canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); if (S && selArmies().length) worldOrder(e.offsetX, e.offsetY); });
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.offsetX, y: e.offsetY, sx: e.offsetX, sy: e.offsetY, t: performance.now() });
  if (ptrs.size === 1) { drag = { moved: false, box: e.shiftKey && e.button === 0 && e.pointerType === 'mouse', lx: e.offsetX, ly: e.offsetY, btn: e.button, shift: e.shiftKey, lt: performance.now(), vx: 0, vy: 0 }; R.vel.x = R.vel.y = 0; }
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; drag = null; box = null; }
});
canvas.addEventListener('pointermove', (e) => {
  const p = ptrs.get(e.pointerId);
  if (!p) { if (S && ui.get().screen === 'game') hoverTile = R.tileAt(e.offsetX, e.offsetY); return; }
  p.x = e.offsetX; p.y = e.offsetY;
  if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2; R.zoomAt(cx, cy, d / pinch.d); R.pan(cx - pinch.cx, cy - pinch.cy); pinch = { d, cx, cy }; return; }
  if (!drag) return;
  const dx = e.offsetX - drag.lx, dy = e.offsetY - drag.ly;
  if (!drag.moved && Math.hypot(e.offsetX - p.sx, e.offsetY - p.sy) > 7) drag.moved = true;
  if (drag.moved) {
    if (drag.box) box = { x0: p.sx, y0: p.sy, x1: e.offsetX, y1: e.offsetY };
    else { R.pan(dx, dy); const now = performance.now(), dt = Math.max(1, now - drag.lt); drag.vx = dx / dt * 16; drag.vy = dy / dt * 16; drag.lt = now; }
  }
  drag.lx = e.offsetX; drag.ly = e.offsetY;
});
function up(e) {
  const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null;
  if (!drag || !p) return;
  if (box && S) { const l = R.armiesInBox(S, box.x0, box.y0, box.x1, box.y1, S.player); if (l.length) { sel.armies = l.map((a) => a.id); sel.city = null; sel.nation = null; UI.renderSide(); } box = null; }
  else if (!drag.moved && e.type === 'pointerup' && S && ui.get().screen === 'game' && drag.btn === 0) tap(e.offsetX, e.offsetY, drag.shift);
  else if (drag.moved) { R.vel.x = drag.vx * 0.9; R.vel.y = drag.vy * 0.9; }
  drag = null;
}
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); R.zoomAt(e.offsetX, e.offsetY, e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
const mm = $('minimap');
const mmMove = (e) => { const r = mm.getBoundingClientRect(); R.cam.tx = (e.clientX - r.left) / r.width * W * TS; R.cam.ty = (e.clientY - r.top) / r.height * H * TS; R.clampCam(); };
mm.addEventListener('pointerdown', (e) => { mm.setPointerCapture(e.pointerId); mmMove(e); mm._d = true; }); mm.addEventListener('pointermove', (e) => { if (mm._d) mmMove(e); }); mm.addEventListener('pointerup', () => { mm._d = false; });
const keys = new Set();
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input,select,textarea')) return; keys.add(e.key.toLowerCase());
  if (!S || ui.get().screen !== 'game') return;
  if (e.key === ' ') { e.preventDefault(); ui.set({ paused: !ui.get().paused }); }
  else if ('1234'.includes(e.key) && e.key.length === 1) A.speed({ v: [1, 2, 5, 10][+e.key - 1] });
  else if (e.key === 'Escape') { if (UI.curWin) UI.closeWin(); else A.desel(); }
  else if (e.key === '+' || e.key === '=') R.zoomAt(R.vw / 2, R.vh / 2, 1.2); else if (e.key === '-') R.zoomAt(R.vw / 2, R.vh / 2, 1 / 1.2);
  else { const m = { e: 'eco', c: 'country', o: 'army', t: 'tech', d: 'dip', i: 'stats', n: 'events' }[e.key.toLowerCase()]; if (m) UI.openWin(m); }
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('resize', () => { R.resize(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && S && ui.get().settings.autosave) saveGame(S, 'auto'); });
document.addEventListener('touchmove', (e) => { if (e.target === canvas) e.preventDefault(); }, { passive: false });

// ---- döngü
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  const u = ui.get();
  if (S && u.screen === 'game') {
    const k = keys; const sp = 600 * dt / R.cam.z; if (k.has('arrowleft') || k.has('a')) { R.cam.tx -= sp; R.cam.x = R.cam.tx; } if (k.has('arrowright') || k.has('d')) { R.cam.tx += sp; R.cam.x = R.cam.tx; } if (k.has('arrowup') || k.has('w')) { R.cam.ty -= sp; R.cam.y = R.cam.ty; } if (k.has('arrowdown') || k.has('s')) { R.cam.ty += sp; R.cam.y = R.cam.ty; }
    if (!u.paused && !S.gameOver && S.pending.length === 0) {
      acc += dt * HPS[u.speed]; let n = 0; while (acc >= 1 && n < 12) { stepHour(S); acc--; n++; if (S.pending.length) break; } if (acc > 24) acc = 0;
      if (S.t % (24 * 30) === 0 && n && u.settings.autosave && S.day > 0 && S._as !== S.day) { S._as = S.day; saveGame(S, 'auto'); }
    }
    while (S.notify.length) { const e = S.notify.shift(); toast(e.text, e.sev); if (e.sev >= 2) beep(e.sev === 3 ? 220 : 330, 0.12, 0.06); }
    if (S.pending.length) UI.checkModal();
    if (S.gameOver && !S._go) { S._go = true; UI.gameOverModal(); }
    if (now - lastHud > 250) { lastHud = now; UI.updateHud(); }
    if (now - lastPanel > 900) { lastPanel = now; UI.refresh(false); }
    if (now - lastMini > 500) { lastMini = now; if (R.mini) R.drawMini(S, S.player); }
    R.draw(S, { settings: u.settings, selNation: sel.nation, selCity: sel.city, selArmies: sel.armies, hoverTile, box });
  } else if (u.screen === 'title') {
    if (preview) { R.cam.tx += dt * 14; R.cam.x = R.cam.tx; if (R.cam.tx > W * TS * 0.75) R.cam.tx = W * TS * 0.25; R.clampCam(); R.draw(preview, { settings: { ...u.settings, names: true }, selNation: sel.nation, selCity: null, selArmies: [], hoverTile: -1, box: null }); }
  }
}
(async function boot() {
  ui.set({ settings: loadSettings(ui.get().settings) });
  R.resize();
  try { preview = await prepare(titleSeed); R.cam.tz = R.cam.z = Math.max(R.vw / (W * TS), R.vh / (H * TS)) * 1.3; R.cam.tx = R.cam.x = W * TS * 0.3; R.cam.ty = R.cam.y = H * TS * 0.5; }
  catch (e) { console.error(e); $('ldtxt').textContent = 'Hata: ' + e.message; return; }
  showTitle('main'); requestAnimationFrame(frame);
  window.__pn = { get S() { return S || preview; }, R, A, UI, startGame, showTitle, setPreviewPlayer: (i) => { pickNation = i; } };
})();
