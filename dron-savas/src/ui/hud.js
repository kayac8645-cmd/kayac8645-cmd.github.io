// HUD: üst şerit (ikonlu kaynak şeridi, elektrik, tarih, hız), alt bağlam menüsü, bildirimler, şehir ve maden yatağı etiketleri
import { KIND, C, F } from '../core/ecs.js';
import { CMD } from '../core/commands.js';
import { BUILDINGS } from '../data/buildings.js';
import { UNITS, ITEMS, ITEM_BY, RECRUITS, R, BANDS } from '../data/defs.js';
import { PAL, PRGB, TEAM } from '../data/palette.js';
import { T } from '../world/map.js';
import { GM } from '../sim/ground.js';
import { PRODUCT } from '../sim/build.js';
import { LAUNCHERS } from '../sim/missiles.js';
import { LAYERS } from '../render/view.js';
import { frameIcon } from '../render/sprites.js';
import { VIS_CELL } from '../sim/country.js';
import { depositWorked } from '../world/deposits.js';
import { capitalSiteOk, siteSummary } from '../sim/territory.js';
import { RES_UNIT } from '../data/defs.js';
// yatak/kaynak miktarı gerçek birimle (m³, varil, t)
export function fmtReserve(res, units) { const [u, k] = RES_UNIT[res] || ['', 1]; return Math.round(units * k).toLocaleString('tr-TR') + ' ' + u; }
export function fmtHours(hrs) { if (!isFinite(hrs)) return '∞'; return hrs < 48 ? Math.round(hrs) + ' ' + t('hour') : Math.round(hrs / 24) + ' ' + t('day').toLowerCase(); }
import { B } from '../data/buildings.js';
import { h, clear, fmt, btn, flagCanvas } from './dom.js';
import { Panels } from './panels.js';
import { t } from '../i18n/i18n.js';

const TER_COL = ['w1', 'w2', 's1', 'g3', 'g1', 'm1', 'g4', 'r2', 'n1', 'w3', 'w3'].map((k) => PRGB[k]);

export class HUD {
  constructor(game) {
    this.g = game; const root = game.app.ui; this.root = root; clear(root);
    this.icons = new Map();
    this.top = h('div', { class: 'topbar' }); this.bottom = h('div', { class: 'bottombar' });
    this.toasts = h('div', { class: 'toasts' }); this.banner = h('div', { class: 'banner hidden' });
    this.labels = h('div', { class: 'labels' });
    this.side = h('div', { class: 'sidebtns' });
    this.panelEl = h('div', { class: 'panel hidden' });
    this.debug = h('div', { class: 'debug' });
    root.append(this.labels, this.top, this.toasts, this.banner, this.side, this.bottom, this.panelEl, this.debug);
    this.panels = new Panels(this);
    this.tAcc = 0; this.miniAcc = 0; this.labelPool = []; this.depPool = []; this.resHist = []; this.chips = {};
    this.buildTop(); this.buildSide(); this.renderContext();
    this.toast(t('tut_1'), -1, -1, 0, 6000);
    if (!game.spectator) setTimeout(() => this.toast(t('tut_2'), -1, -1, 0, 7000), 2500);
  }
  destroy() { clear(this.root); }
  iconSrc(name, tint, scale = 2) { const k = name + '|' + tint + '|' + scale; let v = this.icons.get(k); if (!v) { v = frameIcon(this.g.app.atlas, name, scale, tint); this.icons.set(k, v); } return v; }
  icon(name, tint, scale = 2) { const k = name + '|' + tint + '|' + scale; let v = this.icons.get(k); if (!v) { v = frameIcon(this.g.app.atlas, name, scale, tint); this.icons.set(k, v); } return h('img', { class: 'ico', src: v, alt: '' }); }

  // ---------- üst şerit ----------
  buildTop() {
    const g = this.g; const T_ = this.top;
    this.tMoney = h('b'); this.tPower = h('b'); this.tPop = h('b'); this.tDate = h('span', { class: 'date' });
    const stat = (ico, el, cls, tip) => h('span', { class: 'stat ' + cls, onclick: () => this.toast(tip(), -1, -1, 0, 3000) }, this.icon('res:' + ico, null, 2), el);
    this.sPower = stat('power', this.tPower, 'power', () => `${t('r_power')}: ${g.sim.countries[g.player].power.supply | 0} / ${g.sim.countries[g.player].power.demand | 0} MW`);
    this.spBtns = [0, 1, 2, 4].map((s) => btn(s === 0 ? '❚❚' : s + 'x', () => { if (s === 0) g.paused = !g.paused; else { g.speed = s; g.paused = false; } this.updateTop(); }, 'sp'));
    this.strip = h('div', { class: 'resstrip' });
    for (const r of ['steel', 'fuel', 'electronics', 'supply', 'explosives', 'composite', 'iron', 'coal', 'copper', 'oil', 'gas', 'rare', 'uranium']) {
      const n = h('b'); const chip = h('span', { class: 'chip', onclick: () => this.resInfo(r) }, this.icon('res:' + r, null, 2), n);
      this.chips[r] = n; this.strip.append(chip);
    }
    T_.append(h('div', { class: 'row' }, stat('money', this.tMoney, 'money', () => `${t('r_money')}: ${fmt(g.sim.countries[g.player].money)} · +${((g.sim.countries[g.player].incomeLast || 0) * 60) | 0}/saat`), this.sPower,
      stat('pop', this.tPop, 'pop', () => `${t('r_pop')}: ${fmt(g.sim.countries[g.player].pop)} · ${t('r_morale')}: ${(g.sim.countries[g.player].morale * 100) | 0}%`), this.tDate),
      h('div', { class: 'row' }, this.strip, h('div', { class: 'speed' }, this.spBtns)));
  }
  resInfo(r) {
    const co = this.g.sim.countries[this.g.player]; const k = R[r];
    const p = co.flowP[k] || 0, c = co.flowC[k] || 0, net = p - c;
    const left = net < -0.01 ? ` · ${t('res_empty_in', [fmtHours(co.res[k] / -net)])}` : '';
    this.toast(`${t('r_' + r)}: ${fmt(co.res[k])} · ${t('res_prod')} +${p.toFixed(1)} · ${t('res_cons')} −${c.toFixed(1)} /${t('hour')}${left}`, -1, -1, net < 0 ? 1 : 0, 4500);
  }
  updateTop() {
    const g = this.g, sim = g.sim, co = sim.countries[g.player], env = sim.env;
    this.tMoney.textContent = fmt(co.money);
    const ps = co.power.supply | 0, pd = co.power.demand | 0; this.tPower.textContent = `${ps}/${pd}`;
    this.sPower.className = 'stat power ' + (ps >= pd ? 'ok' : ps >= pd * 0.6 ? 'warn' : 'bad');
    this.tPop.textContent = `${fmt(co.pop)} ${(co.morale * 100) | 0}%`;
    for (const r in this.chips) { const v = co.res[R[r]]; this.chips[r].textContent = fmt(v); this.chips[r].parentElement.classList.toggle('low', v < 5); }
    if (!this.resHist.length || sim.tick - this.resHist[this.resHist.length - 1].t >= 60) { this.resHist.push({ t: sim.tick, v: Array.from(co.res) }); if (this.resHist.length > 6) this.resHist.shift(); }
    const hh = Math.floor(env.hour), mm = Math.floor((env.hour - hh) * 60);
    this.tDate.textContent = `${t('day')}${env.day + 1} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${['❀', '☀', '❦', '❄'][env.season]}${{ clear: '', rain: ' ☂', fog: ' ≋', storm: ' ϟ', snow: ' ❅' }[env.weather]}${env.mud ? ' ' + t('mud') : ''}`; this.tDate.title = t('season_' + env.season) + ' · ' + t('w_' + env.weather);
    this.spBtns.forEach((b, k) => b.classList.toggle('on', k === 0 ? g.paused : !g.paused && g.speed === [0, 1, 2, 4][k]));
  }
  buildSide() { this.side.style.display = 'none'; } // sol sütun kaldırıldı: tüm paneller Menü'de
  closePanel() { if (this.panelEl.classList.contains('hidden')) return false; this.panels.close(); return true; }

  // ---------- bildirimler ----------
  toast(msg, x, y, lvl = 1, ms = 4000) {
    const el = h('div', { class: 'toast lvl' + lvl, onclick: () => { if (x >= 0) this.g.jumpTo(x, y); el.remove(); } }, msg);
    this.toasts.prepend(el); while (this.toasts.children.length > 4) this.toasts.lastChild.remove();
    setTimeout(() => el.remove(), ms + lvl * 1000);
  }
  events(evs) {
    const g = this.g, p = g.player;
    for (const ev of evs) {
      if (ev.k === 'note') {
        if (ev.c !== -1 && (ev.c !== p || g.spectator)) continue;
        if (ev.lvl === 0 && ev.key === 'n_unit' && g.speed > 1) continue;
        this.toast(t(ev.key, ev.args), ev.x, ev.y, ev.lvl);
        g.app.audio.notify(ev.lvl);
        if (ev.lvl >= 3 && g.app.settings.vibrate) { try { window.AndroidHost ? window.AndroidHost.vibrate(120) : navigator.vibrate?.(120); } catch (e) { /* yok */ } }
      } else if (ev.k === 'victory' || ev.k === 'defeat') this.endScreen(ev);
    }
  }
  endScreen(ev) {
    const g = this.g; const win = ev.k === 'victory' && ev.c === g.player;
    const name = ev.k === 'victory' ? g.sim.countries[ev.c].name : '';
    const m = h('div', { class: 'modal' }, h('h1', {}, win ? t('victory') : ev.k === 'victory' && g.spectator ? t('winner_is', [name]) : t('defeat')),
      h('p', {}, win ? t('victory_txt') : ev.k === 'victory' ? t('winner_is', [name]) : t('defeat_txt')),
      btn(t('new_game'), () => g.app.toMenu(), 'big'));
    this.root.append(m);
  }

  // ---------- kare güncellemesi ----------
  frame(dt) {
    this.tAcc += dt; this.miniAcc += dt;
    if (this.tAcc > 0.25) { this.tAcc = 0; this.updateTop(); this.refreshContext(); if (this.panels.cur) this.panels.refresh(); }
    if (this.miniAcc > 1) { this.miniAcc = 0; this.countDrones(); }
    this.updateLabels();
    const g = this.g;
    if (g.app.settings.debug) this.debug.textContent = `${g.fps | 0} FPS · tick ${g.tickMs.toFixed(1)}ms · ${g.sim.e.count} varlık · ${g.view.parts.n} parçacık · ${g.app.renderer.kind}`;
    g.app.audio.ambient(g.sim.env.weather, this.visibleDrones || 0);
    if (g.bus.desync && !this.desyncShown) { this.desyncShown = true; this.toast('DESYNC!', -1, -1, 3); }
  }
  countDrones() { const g = this.g, e = g.sim.e; let n = 0; e.each(C.AIR, (i) => { if (g.view.visibleTo(i)) n++; }); this.visibleDrones = n; }
  updateLabels() {
    const g = this.g, e = g.sim.e, dpr = g.app.dpr; let n = 0;
    if (g.view.cam.zoom >= 1) e.each(C.CITY, (i) => {
      if (n >= 24) return;
      if (!g.spectator && e.owner[i] !== g.player && !g.view.visibleTo(i) && !g.sim.countries[g.player].known.has(i)) return;
      const [sx, sy] = g.w2s(e.x[i], e.y[i] - e.prog[i] - 1.2);
      if (sx < -80 || sy < -20 || sx > g.app.renderer.W + 80 || sy > g.app.renderer.H) return;
      let el = this.labelPool[n]; if (!el) { el = h('div', { class: 'clabel' }); this.labels.append(el); this.labelPool[n] = el; }
      const info = g.sim.cityInfo.get(i); const pw = e.flags[i] & F.POWERED;
      const txt = (info.capital && e.flags[i] & F.CAPITAL ? '★ ' : '') + info.name + (pw ? '' : ' ⚡✗');
      if (el._t !== txt) { el.textContent = txt; el._t = txt; }
      el.style.transform = `translate(${(sx / dpr) | 0}px,${(sy / dpr) | 0}px) translate(-50%,-100%)`; el.style.display = '';
      el.style.borderColor = PAL[TEAM[e.owner[i] % TEAM.length]];
      n++;
    });
    for (let k = n; k < this.labelPool.length; k++) this.labelPool[k].style.display = 'none';
    // maden yatağı etiketleri: ikon + ad + büyüklük (+ işletiliyorsa ✓)
    const sim0 = g.sim; let m = 0; const W_ = g.app.renderer.W, H_ = g.app.renderer.H; const placed = [];
    const show = (g.view.cam.zoom >= 1 || g.view.layer === 'resources' || sim0.phase === 'setup') && g.view.cam.zoom >= 1 / 8;
    if (show && g.deposits) for (const d of g.deposits.list) {
      if (m >= 40) break; if (d.n < 2 && g.view.layer !== 'resources') continue;
      const [sx, sy] = g.w2s(d.x, d.y + 0.6); if (sx < 80 * dpr || sy < 110 * dpr || sx > W_ - 80 * dpr || sy > H_ - 150 * dpr) continue;
      let el = this.depPool[m];
      if (!el) { el = h('div', { class: 'dlabel' }, h('img', { class: 'ico' }), h('span')); this.labels.append(el); this.depPool[m] = el; }
      const lw = 150 * dpr, lh = 24 * dpr; let hit = false;
      for (const q of placed) if (Math.abs(q[0] - sx) < lw && Math.abs(q[1] - sy) < lh) { hit = true; break; }
      if (hit) continue; placed.push([sx, sy]);
      const worked = depositWorked(g.sim, d) >= 0;
      const txt = `${t('r_' + d.res)} · ${d.reserve > 0 ? fmtReserve(d.res, d.reserve) : t('dep_depleted')}${worked ? ' ✓' : ''}`;
      if (el._t !== txt) { el._t = txt; el.lastChild.textContent = txt; el.firstChild.src = this.iconSrc('res:' + d.res); el.classList.toggle('worked', worked); }
      el.style.transform = `translate(${(sx / dpr) | 0}px,${(sy / dpr) | 0}px) translate(-50%,0)`; el.style.display = '';
      m++;
    }
    for (let k = m; k < this.depPool.length; k++) this.depPool[k].style.display = 'none';
  }

  // ---------- alt bağlam menüsü ----------
  refreshContext() {
    const sig = this.ctxSig(); if (sig !== this.lastSig) this.renderContext();
  }
  ctxSig() {
    const g = this.g, e = g.sim.e; let s = (g.mode || '') + '|' + [...g.view.sel].join(',') + '|d' + g.depSel + '|r' + g.repeatBuild;
    for (const i of g.view.sel) if (e.alive(i)) s += `|${e.flags[i] & (F.RUINED | F.BUILDING | F.EMIT_ON)}|${e.item[i]}|${e.prio[i]}|${(e.hp[i] / e.maxhp[i] * 10) | 0}|${e.state[i]}`;
    if (g.view.ghost) s += '|g' + g.view.ghost.ok;
    return s;
  }
  renderContext() {
    const g = this.g, sim = g.sim, e = sim.e, B = this.bottom; this.lastSig = this.ctxSig(); clear(B);
    // mod afişi
    if (g.mode) {
      const hint = g.mode === 'build' ? t('place_hint') : g.mode === 'route' ? t('hint_route') : t(g.modeData?.hint || 'hint_target');
      this.banner.textContent = hint; this.banner.classList.remove('hidden');
    } else this.banner.classList.add('hidden');
    if (g.mode === 'build') {
      const gh = g.view.ghost; const bd = BUILDINGS[g.modeData.def];
      B.append(h('div', { class: 'ctx-title' }, this.icon(`b:${bd.id}:0`, PAL[TEAM[g.player]], 1), t('b_' + bd.id)),
        h('div', { class: 'lines' }, gh ? (gh.ok ? h('span', { class: 'kv okc' }, '✓ ' + t('place_ok')) : h('span', { class: 'kv bad' }, '✗ ' + t(gh.reason))) : h('span', { class: 'kv' }, t('place_hint'))),
        h('div', { class: 'acts' }, btn('✓ ' + t('build_do'), () => g.confirmBuild(), gh && gh.ok ? 'ok big' : 'dis big'),
          btn('↻ ' + t('build_repeat'), () => { g.repeatBuild = !g.repeatBuild; this.renderContext(); }, g.repeatBuild ? 'on' : ''),
          btn('✗ ' + t('cancel'), () => g.setMode(null), 'warn')));
      return;
    }
    if (g.mode) { B.append(h('div', { class: 'acts' }, btn('✗ ' + t('cancel'), () => g.setMode(null)))); return; }
    const sel = [...g.view.sel].filter((i) => e.alive(i));
    if (sim.phase === 'setup' && !g.spectator) {
      this.banner.textContent = t('setup_hint'); this.banner.classList.remove('hidden');
      if (!g.siteSel) { B.append(h('div', { class: 'ctx-title' }, '★ ' + t('setup_title')), h('div', { class: 'lines' }, t('setup_help')), h('div', { class: 'acts' }, btn('−', () => g.zoomAt(g.app.renderer.W / 2, g.app.renderer.H / 2, -1)), btn('+', () => g.zoomAt(g.app.renderer.W / 2, g.app.renderer.H / 2, 1)))); return; }
      const [x, y] = g.siteSel; const bad = capitalSiteOk(sim, x, y); const sm = siteSummary(sim, x, y);
      const resLine = ['iron', 'coal', 'oil', 'gas', 'copper', 'uranium', 'rare'].filter((r) => sm[r] > 0).map((r) => h('span', { class: 'kv' }, this.icon('res:' + r, null, 1), `${t('r_' + r)} ${fmtReserve(r, sm[r])}`));
      B.append(h('div', { class: 'ctx-title' }, '★ ' + t('setup_site')),
        h('div', { class: 'lines' }, resLine.length ? resLine : h('span', { class: 'kv bad' }, t('setup_nores')), sm.river ? h('span', { class: 'kv okc' }, '≈ ' + t('setup_river')) : '', sm.coast ? h('span', { class: 'kv okc' }, '⚓ ' + t('setup_coast')) : '', bad ? h('span', { class: 'kv bad' }, '✗ ' + t(bad)) : ''),
        h('div', { class: 'acts' }, btn('★ ' + t('setup_found'), () => g.foundCapital(), bad ? 'dis big' : 'ok big'), btn('✕', () => { g.siteSel = null; this.renderContext(); })));
      return;
    }
    if (!sel.length && g.depSel >= 0 && g.deposits) {
      const d = g.deposits.list[g.depSel]; const map = sim.map;
      const own = d.tiles.some((ti) => map.owner[ti] === g.player); const w = depositWorked(sim, d);
      const isWell = d.code === 3 || d.code === 4; const bdef = isWell ? 'well' : 'mine';
      B.append(h('div', { class: 'ctx-title' }, this.icon('res:' + d.res, null, 3), t('dep_title', ['r_' + d.res])),
        h('div', { class: 'lines' }, h('span', { class: 'kv' }, h('b', {}, t('dep_reserve') + ': '), `${fmtReserve(d.res, d.reserve)} / ${fmtReserve(d.res, d.reserve0)}`),
          d.rate > 0 ? h('span', { class: 'kv' }, h('b', {}, t('dep_rate') + ': '), `−${fmtReserve(d.res, d.rate)}/${t('hour')} · ${t('res_empty_in', [fmtHours(d.reserve / d.rate)])}`) : '',
          d.reserve <= 0 ? h('span', { class: 'kv bad' }, t('dep_depleted')) : '',
          h('span', { class: 'kv ' + (w >= 0 ? '' : 'bad') }, h('b', {}, t('dep_state') + ': '), w >= 0 ? t('dep_worked') : t('dep_free')),
          h('span', { class: 'kv' + (own ? '' : ' bad') }, h('b', {}, t('st_owner') + ': '), own ? t('dep_ours') : t('dep_foreign')),
          h('span', { class: 'kv' }, h('b', {}, t('dep_use') + ': '), t('dep_use_' + d.res))),
        h('div', { class: 'acts' }, w < 0 && own && !g.spectator ? btn((isWell ? '🛢 ' : '⛏ ') + t('b_' + bdef), () => g.buildOnDeposit(d, bdef), 'big ok') : '', btn('✕', () => { g.depSel = -1; this.renderContext(); })));
      return;
    }
    if (!sel.length) {
      B.append(h('div', { class: 'acts' }, g.spectator ? '' : btn('⚒ ' + t('p_build'), () => this.panels.open('build'), 'big'),
        btn('☰ ' + t('p_menu'), () => this.panels.open('hub'), 'big'),
        btn('⌖', () => { const c = sim.world.countries[g.player].capital; if (c) { g.jumpTo(c.x, c.y); if (g.view.cam.zoom < 1) g.view.cam.zoom = 2; } }, '', { title: 'Başkent' }),
        btn('−', () => g.zoomAt(g.app.renderer.W / 2, g.app.renderer.H / 2, -1)), btn('+', () => g.zoomAt(g.app.renderer.W / 2, g.app.renderer.H / 2, 1))));
      return;
    }
    const i0 = sel[0]; const own = e.owner[i0] === g.player && !g.spectator; const k = e.kind[i0];
    const lines = []; const acts = [];
    const sv = (lbl, v, cls = '') => h('span', { class: 'kv ' + cls }, h('b', {}, lbl + ': '), v);
    if (k === KIND.BUILDING) {
      const bd = BUILDINGS[e.def[i0]]; const vis = g.view.visibleTo(i0);
      const title = h('div', { class: 'ctx-title' }, this.icon(`b:${bd.id}:0`, e.owner[i0] < 24 ? PAL[TEAM[e.owner[i0] % TEAM.length]] : null, 1), t('b_' + bd.id), e.owner[i0] < 24 && !own ? h('span', { class: 'owner' }, ' · ' + sim.countries[e.owner[i0]].name) : '');
      B.append(title);
      if (!vis) { lines.push(sv(t('st_known'), '')); }
      else {
        lines.push(sv(t('st_hp'), `${(e.hp[i0] / e.maxhp[i0] * 100) | 0}%`, e.flags[i0] & F.RUINED ? 'bad' : ''));
        if (e.flags[i0] & F.RUINED) lines.push(sv('', t('st_ruined'), 'bad'));
        if (e.flags[i0] & F.BUILDING) lines.push(sv(t('st_building'), `${(e.prog[i0] / bd.time * 100) | 0}%`));
        if (own && bd.power < 0) lines.push(sv(t('st_power'), e.flags[i0] & F.GENERATOR ? t('st_gen') : `${(e.sat[i0] * 100) | 0}%`, e.sat[i0] < 0.5 ? 'bad' : ''));
        if (own && bd.power > 0) lines.push(sv(t('st_power'), `+${bd.power} MW`));
        if (own && bd.cat !== 'none' && bd.id !== 'hq') lines.push(sv(t('st_connected'), e.flags[i0] & F.CONNECTED ? '✓' : '✗', e.flags[i0] & F.CONNECTED ? '' : 'bad'));
        if (own) lines.push(sv(t('st_linked'), e.flags[i0] & F.LINKED ? '✓' : '✗'));
        if (own && (bd.id === 'mine' || bd.id === 'well')) lines.push(sv(t('st_stock'), e.buf[i0].toFixed(0) + (e.res[i0] ? ' ' + t('r_' + ['', 'iron', 'coal', 'oil', 'gas', 'copper', 'uranium', 'rare'][e.res[i0]]) : '')));
        if (own && (e.mask[i0] & C.FACTORY) && e.item[i0]) lines.push(sv(t('a_product'), this.productName(e.item[i0]) + (e.flags[i0] & F.JAMMED ? ' (' + t('st_noinput') + ')' : ` ${(e.state[i0] ? (e.timer[i0] / this.productTime(bd, e.item[i0]) * 100) | 0 : 0)}%`), e.flags[i0] & F.JAMMED ? 'bad' : ''));
        if (own && (e.mask[i0] & C.JAMMER)) lines.push(sv(t('a_jam_bands'), BANDS.filter((_, b) => (e.jamBands[i0] >>> b) & 1).join(', ') || '—'));
      }
      if (own && !(e.flags[i0] & F.BUILDING)) {
        if ((bd.items || bd.units || bd.recipes) && !(e.flags[i0] & F.RUINED)) acts.push(btn('⚙ ' + t('a_product'), () => this.panels.open('product', i0)));
        if (bd.launches && !(e.flags[i0] & F.RUINED)) acts.push(btn('✈ ' + t('a_mission'), () => this.panels.open('mission', i0), 'big'));
        if (LAUNCHERS[bd.id] && !(e.flags[i0] & F.RUINED)) acts.push(btn('🚀 ' + t('a_fire'), () => this.panels.open('fire', i0), 'big'));
        if (e.mask[i0] & (C.RADAR | C.JAMMER | C.EMIT) && bd.id !== 'drone_base' && bd.id !== 'satellite') acts.push(btn(e.flags[i0] & F.EMIT_ON ? t('a_emit_on') : t('a_emit_off'), () => g.issue({ type: CMD.TOGGLE_EMIT, e: i0, on: !(e.flags[i0] & F.EMIT_ON) })));
        if (e.mask[i0] & C.JAMMER) acts.push(btn('≋ ' + t('a_jam_bands'), () => this.panels.open('jam', i0)));
        acts.push(btn(t('a_repair_prio') + ': ' + t('prio_' + e.prio[i0]), () => g.issue({ type: CMD.REPAIR_PRIO, e: i0, prio: (e.prio[i0] + 1) % 4 })));
        if (bd.id !== 'hq') acts.push(btn('🗑', () => { if (confirm(t('a_demolish') + '?')) { g.issue({ type: CMD.DEMOLISH, e: i0 }); g.view.sel.clear(); this.renderContext(); } }, 'warn'));
      }
    } else if (k === KIND.CITY) {
      const info = sim.cityInfo.get(i0);
      B.append(h('div', { class: 'ctx-title' }, (e.flags[i0] & F.CAPITAL ? '★ ' : '') + info.name, h('span', { class: 'owner' }, ' · ' + sim.countries[e.owner[i0]].name)));
      lines.push(sv(t('st_pop'), fmt(e.buf[i0])), sv(t('st_morale'), `${(e.supply[i0] * 100) | 0}%`, e.supply[i0] < 0.35 ? 'bad' : ''), sv(t('st_power'), e.flags[i0] & F.POWERED ? '✓' : '✗', e.flags[i0] & F.POWERED ? '' : 'bad'), sv(t('st_water'), e.timer[i0] >= 1 ? '✓' : e.timer[i0] > 0 ? '~' : '✗', e.timer[i0] > 0 ? '' : 'bad'));
    } else {
      const u = k === KIND.CONVOY ? null : UNITS[e.def[i0]];
      const nm = u ? t('u_' + u.id) : t('r_supply');
      B.append(h('div', { class: 'ctx-title' }, u ? this.icon(u.spr.startsWith('gen:') && ['gen:quad', 'gen:fpv', 'gen:hexa', 'gen:delta', 'gen:uav', 'gen:male', 'gen:mother'].includes(u.spr) ? u.spr + ':0' : u.spr, PAL[TEAM[e.owner[i0] % TEAM.length]], 2) : '', sel.length > 1 ? `${sel.length}× ` : '', nm, !own && e.owner[i0] < 24 ? h('span', { class: 'owner' }, ' · ' + sim.countries[e.owner[i0]].name) : ''));
      lines.push(sv(t('st_hp'), `${(e.hp[i0] / e.maxhp[i0] * 100) | 0}%`));
      if (k === KIND.AIR && u) { lines.push(sv(t('st_fuel'), `${(e.fuel[i0] / u.fuel * 100) | 0}%`), sv(t('st_band'), BANDS[e.band[i0]])); if (e.flags[i0] & F.JAMMED) lines.push(sv('', t('st_jammed'), 'bad')); if (e.flags[i0] & F.LINKLOST) lines.push(sv('', t('st_linklost'), 'bad')); }
      if (k === KIND.GROUND && u) { lines.push(sv(t('st_supply'), `${(e.supply[i0] * 100) | 0}%`, e.supply[i0] < 0.3 ? 'bad' : ''), sv(t('st_entrench'), `${(e.entrench[i0] * 100) | 0}%`), sv(t('st_linked'), e.flags[i0] & F.LINKED ? '✓' : '✗')); }
      if (own) {
        const ground = sel.filter((i) => e.kind[i] === KIND.GROUND || (e.kind[i] === KIND.NAVAL && UNITS[e.def[i]].role !== 'naval'));
        const air = sel.filter((i) => e.kind[i] === KIND.AIR);
        if (ground.length) acts.push(btn('➜ ' + t('a_move'), () => g.startMove(ground, GM.MOVE)), btn('⚔ ' + t('a_attack'), () => g.startMove(ground, GM.ATTACK)), btn('⛨ ' + t('a_hold'), () => g.issue({ type: CMD.MOVE_UNITS, ids: ground, x: 0, y: 0, mode: GM.HOLD })));
        const ml = sel.filter((i) => e.kind[i] === KIND.GROUND && UNITS[e.def[i]].role === 'mlrs'); if (ml.length) acts.push(btn('🚀 ' + t('a_fire'), () => this.panels.open('fire', ml[0]), 'big'));
        if (air.length) acts.push(btn('✎ ' + t('a_route'), () => g.setMode('route', { cb: (w) => g.issue({ type: CMD.SET_ROUTE, ids: air, route: w }) })), btn('⌖ ' + t('a_target'), () => g.setMode('target', { hint: 'hint_target', cb: (x, y, tg) => { g.issue({ type: CMD.SET_ROUTE, ids: air, route: [x, y], target: tg }); g.setMode(null); } })), btn('↩ ' + t('a_recall'), () => g.issue({ type: CMD.RECALL, ids: air })));
      }
    }
    if (lines.length) B.append(h('div', { class: 'lines' }, lines));
    acts.push(btn('✕', () => { g.view.sel.clear(); this.renderContext(); }));
    B.append(h('div', { class: 'acts' }, acts));
  }
  productTime(bd, p) { if (p >= PRODUCT.RECIPE) return bd.recipes[p - PRODUCT.RECIPE - 1].t; if (p >= PRODUCT.UNIT) return RECRUITS[p - PRODUCT.UNIT - 1].time; return ITEMS[p - 1].time; }
}
// ürün adı (bina bağlamı gerekmeden)
HUD.prototype.productName = function (p) {
  if (p >= PRODUCT.RECIPE) { const e = this.g.sim.e; for (const i of this.g.view.sel) { if (!e.alive(i)) continue; const bd = BUILDINGS[e.def[i]]; const r = bd.recipes && bd.recipes[p - PRODUCT.RECIPE - 1]; if (r) return t('r_' + r.out); } return '?'; }
  if (p >= PRODUCT.UNIT) return t('u_' + RECRUITS[p - PRODUCT.UNIT - 1].id);
  return t('i_' + ITEMS[p - 1].id);
};
