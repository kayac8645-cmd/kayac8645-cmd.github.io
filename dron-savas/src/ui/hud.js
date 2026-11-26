// HUD: üst şerit (kaynaklar, elektrik, tarih, hız), alt bağlam menüsü, bildirimler, mini harita, şehir etiketleri
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
    this.labels = h('div', { class: 'labels' }); this.mini = h('canvas', { class: 'minimap', width: 128, height: 128 });
    this.side = h('div', { class: 'sidebtns' });
    this.panelEl = h('div', { class: 'panel hidden' });
    this.debug = h('div', { class: 'debug' });
    root.append(this.labels, this.top, this.toasts, this.banner, this.mini, this.side, this.bottom, this.panelEl, this.debug);
    this.panels = new Panels(this);
    this.mini.addEventListener('pointerdown', (e) => { const r = this.mini.getBoundingClientRect(); const m = game.sim.map; game.jumpTo((e.clientX - r.left) / r.width * m.W, (e.clientY - r.top) / r.height * m.H); e.stopPropagation(); });
    this.buildTop(); this.buildSide(); this.renderContext();
    this.tAcc = 0; this.miniAcc = 0; this.labelPool = [];
    this.toast(t('tut_1'), -1, -1, 0, 6000);
    if (!game.spectator) setTimeout(() => this.toast(t('tut_2'), -1, -1, 0, 7000), 2500);
  }
  destroy() { clear(this.root); }
  icon(name, tint, scale = 2) { const k = name + '|' + tint + '|' + scale; let v = this.icons.get(k); if (!v) { v = frameIcon(this.g.app.atlas, name, scale, tint); this.icons.set(k, v); } return h('img', { class: 'ico', src: v, alt: '' }); }

  // ---------- üst şerit ----------
  buildTop() {
    const g = this.g; const T_ = this.top;
    this.tMoney = h('span'); this.tPower = h('span'); this.tPop = h('span'); this.tRes = h('span', { class: 'res' }); this.tDate = h('span', { class: 'date' });
    this.spBtns = [0, 1, 2, 4].map((s) => btn(s === 0 ? '❚❚' : s + 'x', () => { if (s === 0) g.paused = !g.paused; else { g.speed = s; g.paused = false; } this.updateTop(); }, 'sp'));
    T_.append(h('div', { class: 'row' }, h('span', { class: 'stat money' }, '¤ ', this.tMoney), h('span', { class: 'stat power' }, '⚡ ', this.tPower), h('span', { class: 'stat pop' }, '☺ ', this.tPop), this.tDate),
      h('div', { class: 'row' }, this.tRes, h('div', { class: 'speed' }, this.spBtns)));
  }
  updateTop() {
    const g = this.g, sim = g.sim, co = sim.countries[g.player], env = sim.env;
    this.tMoney.textContent = fmt(co.money);
    const ps = co.power.supply | 0, pd = co.power.demand | 0; this.tPower.textContent = `${ps}/${pd} MW`;
    this.tPower.parentElement.className = 'stat power ' + (ps >= pd ? 'ok' : ps >= pd * 0.6 ? 'warn' : 'bad');
    this.tPower.parentElement.title = t('r_power');
    this.tPop.textContent = `${fmt(co.pop)} · ${(co.morale * 100) | 0}%`;
    const R_ = ['steel', 'fuel', 'electronics', 'supply', 'iron', 'coal'];
    this.tRes.textContent = R_.map((r) => `${t('r_' + r).slice(0, 3)} ${fmt(co.res[R[r]])}`).join(' · ');
    const hh = Math.floor(env.hour), mm = Math.floor((env.hour - hh) * 60);
    this.tDate.textContent = `${t('day')}${env.day + 1} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${['❀', '☀', '❦', '❄'][env.season]}${{ clear: '', rain: ' ☂', fog: ' ≋', storm: ' ϟ', snow: ' ❅' }[env.weather]}${env.mud ? ' ' + t('mud') : ''}`; this.tDate.title = t('season_' + env.season) + ' · ' + t('w_' + env.weather);
    this.spBtns.forEach((b, k) => b.classList.toggle('on', k === 0 ? g.paused : !g.paused && g.speed === [0, 1, 2, 4][k]));
  }
  buildSide() {
    const g = this.g;
    const L = btn('◧ ' + t('l_normal'), () => { const k = (LAYERS.indexOf(g.view.layer) + 1) % LAYERS.length; g.view.layer = LAYERS[k]; L.textContent = '◧ ' + t('l_' + LAYERS[k]); }, 'side');
    this.side.append(L,
      btn('▤ ' + t('p_prod'), () => this.panels.open('prod'), 'side'),
      btn('⚗ ' + t('p_research'), () => this.panels.open('research'), 'side'),
      btn('⚑ ' + t('p_diplo'), () => this.panels.open('diplo'), 'side'),
      btn('◉ ' + t('p_intel'), () => this.panels.open('intel'), 'side'),
      btn('¤ ' + t('p_market'), () => this.panels.open('market'), 'side'),
      btn('☰ ' + t('p_log'), () => this.panels.open('log'), 'side'),
      btn('⚙ ' + t('p_menu'), () => this.panels.open('menu'), 'side'));
    if (g.spectator) [...this.side.children].slice(1, 6).forEach((b) => (b.style.display = 'none'));
  }
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
    if (this.miniAcc > 1) { this.miniAcc = 0; this.drawMini(); }
    this.drawMiniView(); this.updateLabels();
    const g = this.g;
    if (g.app.settings.debug) this.debug.textContent = `${g.fps | 0} FPS · tick ${g.tickMs.toFixed(1)}ms · ${g.sim.e.count} varlık · ${g.view.parts.n} parçacık · ${g.app.renderer.kind}`;
    g.app.audio.ambient(g.sim.env.weather, this.visibleDrones || 0);
    if (g.bus.desync && !this.desyncShown) { this.desyncShown = true; this.toast('DESYNC!', -1, -1, 3); }
  }
  drawMini() {
    const g = this.g, sim = g.sim, map = sim.map, c = this.mini, x = c.getContext('2d');
    const S = 128; if (!this.miniImg) this.miniImg = x.createImageData(S, S);
    const d = this.miniImg.data; const co = sim.countries[g.player];
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) {
      const mx = (xx * map.W / S) | 0, my = (y * map.H / S) | 0, i = my * map.W + mx;
      let col = TER_COL[map.ter[i]];
      const o = map.owner[i]; let r = col[0], gg = col[1], b = col[2];
      if (o !== 255) { const tc = PRGB[TEAM[o % TEAM.length]]; r = r * 0.55 + tc[0] * 0.45; gg = gg * 0.55 + tc[1] * 0.45; b = b * 0.55 + tc[2] * 0.45; }
      if (!g.spectator) { const vi = ((my / VIS_CELL) | 0) * co.vw + ((mx / VIS_CELL) | 0); const f = co.visNow[vi] ? 1 : co.vis[vi] ? 0.65 : 0.3; r *= f; gg *= f; b *= f; }
      const k = (y * S + xx) * 4; d[k] = r; d[k + 1] = gg; d[k + 2] = b; d[k + 3] = 255;
    }
    // ögeler
    const e = sim.e; let drones = 0;
    for (let i = 0; i < e.hi; i++) {
      const k = e.kind[i]; if (!k || (e.flags[i] & F.DEAD) || k === KIND.PROJ) continue;
      if (!g.view.visibleTo(i)) continue;
      if (k === KIND.AIR) drones++;
      const px = (e.x[i] / map.W * S) | 0, py = (e.y[i] / map.H * S) | 0; if (px < 0 || py < 0 || px >= S || py >= S) continue;
      const kk = (py * S + px) * 4; const own = e.owner[i] === g.player;
      if (k === KIND.CITY) { d[kk] = 255; d[kk + 1] = 255; d[kk + 2] = 255; }
      else { d[kk] = own ? 120 : 255; d[kk + 1] = own ? 200 : 60; d[kk + 2] = own ? 255 : 50; }
    }
    this.visibleDrones = drones;
    x.putImageData(this.miniImg, 0, 0);
    this.miniBase = x.getImageData(0, 0, S, S);
  }
  drawMiniView() {
    const g = this.g, x = this.mini.getContext('2d'), map = g.sim.map, r = g.app.renderer, S = 128;
    if (!this.miniBase) return; x.putImageData(this.miniBase, 0, 0);
    const c = g.view.cam; const w = r.W / c.zoom / 16 / map.W * S, hh = r.H / c.zoom / 16 / map.H * S;
    x.strokeStyle = '#fff'; x.lineWidth = 1; x.strokeRect(c.x / 16 / map.W * S - w / 2, c.y / 16 / map.H * S - hh / 2, w, hh);
  }
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
  }

  // ---------- alt bağlam menüsü ----------
  refreshContext() {
    const sig = this.ctxSig(); if (sig !== this.lastSig) this.renderContext();
  }
  ctxSig() {
    const g = this.g, e = g.sim.e; let s = (g.mode || '') + '|' + [...g.view.sel].join(',');
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
      B.append(h('div', { class: 'ctx-title' }, this.icon(`b:${bd.id}:0`, PAL[TEAM[g.player]], 1), t('b_' + bd.id), gh && !gh.ok ? h('span', { class: 'err' }, ' — ' + t(gh.reason)) : ''),
        h('div', { class: 'acts' }, btn('✓ ' + t('confirm'), () => g.confirmBuild(), gh && gh.ok ? 'ok' : 'dis'), btn('✗ ' + t('cancel'), () => g.setMode(null))));
      return;
    }
    if (g.mode) { B.append(h('div', { class: 'acts' }, btn('✗ ' + t('cancel'), () => g.setMode(null)))); return; }
    const sel = [...g.view.sel].filter((i) => e.alive(i));
    if (!sel.length) {
      B.append(h('div', { class: 'acts' }, g.spectator ? '' : btn('⚒ ' + t('p_build'), () => this.panels.open('build'), 'big'),
        btn('⌖', () => { const c = sim.world.countries[g.player].capital; g.jumpTo(c.x, c.y); }, '', { title: 'Başkent' }),
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
