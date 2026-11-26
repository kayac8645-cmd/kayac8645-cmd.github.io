// Açılır paneller: inşa, üretim, bina ürünü, görev, ateş, karıştırma, araştırma, diplomasi, istihbarat, piyasa, olay günlüğü, menü
import { KIND, C, F } from '../core/ecs.js';
import { CMD } from '../core/commands.js';
import { BUILDINGS, B, BUILD_CATS, HARDEN } from '../data/buildings.js';
import { UNITS, ITEMS, ITEM_BY, RECRUITS, RECRUIT_BY, R, RES, BANDS } from '../data/defs.js';
import { TECHS, TECH_BY, BRANCHES } from '../data/tech.js';
import { PAL, TEAM } from '../data/palette.js';
import { PRODUCT } from '../sim/build.js';
import { LAUNCHERS } from '../sim/missiles.js';
import { militaryStrength, DS } from '../sim/diplomacy.js';
import { MARKET_PRICE, marketPrice } from '../sim/economy.js';
import { listSaves, loadGame, saveSettings } from '../core/storage.js';
import { h, clear, fmt, btn, flagCanvas } from './dom.js';
import { t } from '../i18n/i18n.js';

const costStr = (cost, mul = 1) => Object.entries(cost).filter(([, v]) => v > 0).map(([k, v]) => (k === 'money' ? '¤' : t('r_' + k).slice(0, 3) + ' ') + fmt(v * mul)).join(' ');

export class Panels {
  constructor(hud) { this.hud = hud; this.g = hud.g; this.el = hud.panelEl; this.cur = null; this.arg = null; this.state = {}; }
  open(name, arg) { this.cur = name; this.arg = arg; this.el.classList.remove('hidden'); this.render(); }
  close() { this.cur = null; this.el.classList.add('hidden'); clear(this.el); }
  refresh() { if (['build', 'mission', 'fire', 'jam', 'menu', 'product', 'market', 'diplo'].includes(this.cur)) { this.updateDynamic(); return; } this.render(); }
  updateDynamic() { const d = this.el.querySelector('.dyn'); if (d && this.dyn) { const n = this.dyn(); clear(d).append(n); } }
  frame(title, ...body) {
    clear(this.el);
    this.el.append(h('div', { class: 'phead' }, h('span', {}, title), btn('✕', () => this.close(), 'x')), h('div', { class: 'pbody' }, ...body));
  }
  render() {
    this.dyn = null; const f = this['p_' + this.cur]; if (f) f.call(this, this.arg);
  }
  co() { return this.g.sim.countries[this.g.player]; }

  // ---------- İNŞA ----------
  p_build() {
    const g = this.g, sim = g.sim, co = this.co(); const cat = this.state.cat || 'eco'; const hard = !!this.state.hard;
    const tabs = h('div', { class: 'tabs scroll' }, BUILD_CATS.map((c) => btn(t('cat_' + c), () => { this.state.cat = c; this.render(); }, c === cat ? 'on' : '')));
    const mul = hard ? HARDEN.cost : 1;
    const costRow = (cost) => h('div', { class: 'costrow' }, Object.entries(cost).filter(([, v]) => v > 0).map(([k, v]) => {
      const have = k === 'money' ? co.money : co.res[R[k]]; const need = v * mul;
      return h('span', { class: 'cost' + (have < need ? ' miss' : '') }, this.hud.icon('res:' + k, null, 1), fmt(need));
    }));
    const grid = h('div', { class: 'grid bgrid' });
    BUILDINGS.forEach((bd, i) => {
      if (bd.cat !== cat) return;
      const locked = !sim.techOk(g.player, bd.tech); const afford = sim.canAfford(g.player, bd.cost, mul);
      let lp = null;
      const card = h('div', { class: 'card bcard' + (locked ? ' locked' : afford ? '' : ' poor'),
        onpointerdown: () => { lp = setTimeout(() => { lp = 'shown'; this.hud.toast(t('b_' + bd.id) + ': ' + t('desc_' + bd.id), -1, -1, 0, 6000); }, 450); },
        onpointerup: () => { if (lp === 'shown') { lp = null; return; } clearTimeout(lp); lp = null; if (locked) { this.hud.toast(t('err_tech') + ': ' + t('t_' + bd.tech), -1, -1, 1); return; } this.close(); g.startBuild(i, hard); },
        onpointerleave: () => { if (lp && lp !== 'shown') clearTimeout(lp); } },
        h('div', { class: 'bimg' }, this.hud.icon(`b:${bd.id}:0`, PAL[TEAM[g.player]], 2)),
        h('div', { class: 'cname' }, t('b_' + bd.id)),
        locked ? h('div', { class: 'ccost lock' }, '🔒 ' + t('t_' + bd.tech)) : costRow(bd.cost),
        h('div', { class: 'cinfo' }, bd.power > 0 ? h('span', { class: 'okc' }, this.hud.icon('res:power', null, 1), '+' + bd.power) : bd.power < 0 ? h('span', {}, this.hud.icon('res:power', null, 1), bd.power) : '',
          bd.workers ? h('span', {}, this.hud.icon('res:pop', null, 1), bd.workers) : ''));
      grid.append(card);
    });
    this.frame(t('p_build'), tabs,
      h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: hard, onchange: (e) => { this.state.hard = e.target.checked; this.render(); } }), t('hardened')),
      h('p', { class: 'small' }, t('build_hint')), grid);
  }

  // ---------- ÜRETİM (genel) ----------
  p_prod() {
    const g = this.g, sim = g.sim, e = sim.e, co = this.co();
    const stocks = h('div', { class: 'stocks' }, ITEMS.map((it, k) => co.items[k] >= 1 ? h('span', { class: 'stock' }, `${t('i_' + it.id)}: ${co.items[k] | 0}`) : null));
    const res = h('div', { class: 'stocks' }, RES.map((r, k) => h('span', { class: 'stock' }, `${t('r_' + r)}: ${fmt(co.res[k])}`)));
    const facs = h('div', { class: 'list' });
    e.each(C.FACTORY, (i) => {
      if (e.owner[i] !== g.player) return; const bd = BUILDINGS[e.def[i]]; if (bd.caps.includes('research')) return;
      facs.append(h('div', { class: 'row', onclick: () => { g.jumpTo(e.x[i], e.y[i]); g.view.sel.clear(); g.view.sel.add(i); this.hud.renderContext(); this.close(); } },
        this.hud.icon(`b:${bd.id}:0`, PAL[TEAM[g.player]], 1), h('span', { class: 'grow' }, t('b_' + bd.id)),
        h('span', { class: e.flags[i] & F.JAMMED ? 'bad' : '' }, e.item[i] ? this.hud.productName(e.item[i]) + (e.flags[i] & F.JAMMED ? ' ⚠' : ` ${e.state[i] ? (e.timer[i] / this.hud.productTime(bd, e.item[i]) * 100) | 0 : 0}%`) : t('st_idle'))));
    });
    this.frame(t('p_prod'), h('h3', {}, t('st_stock')), stocks, h('h3', {}, 'Kaynaklar'), res, h('h3', {}, t('p_prod')), facs);
  }
  // ---------- BİNA ÜRÜNÜ ----------
  p_product(i) {
    const g = this.g, sim = g.sim, e = sim.e, bd = BUILDINGS[e.def[i]], co = this.co();
    const opts = [];
    (bd.recipes || []).forEach((r, k) => opts.push([PRODUCT.RECIPE + k + 1, t('r_' + r.out) + (r.n > 1 ? ` ×${r.n}` : ''), Object.entries(r.in).map(([k2, v]) => t('r_' + k2).slice(0, 4) + ' ' + v).join(', ') + ` · ${r.t}dk`, true]));
    (bd.items || []).forEach((id) => { const it = ITEMS[ITEM_BY[id]]; opts.push([ITEM_BY[id] + 1, t('i_' + id) + ` (${co.items[ITEM_BY[id]] | 0})`, costStr(it.cost) + ` · ${it.time}dk`, sim.techOk(g.player, it.tech), it.tech]); });
    (bd.units || []).forEach((id) => { const r = RECRUITS[RECRUIT_BY[id]]; opts.push([PRODUCT.UNIT + RECRUIT_BY[id] + 1, t('u_' + id), costStr(r.cost) + ` · ${r.time}dk`, sim.techOk(g.player, r.tech), r.tech]); });
    const list = h('div', { class: 'list' }, btn('⏹ ' + t('a_stop'), () => { g.issue({ type: CMD.SET_PRODUCT, e: i, p: 0 }); this.close(); }, e.item[i] === 0 ? 'on' : ''),
      opts.map(([p, name, cost, ok, tech]) => h('div', { class: 'row opt' + (e.item[i] === p ? ' on' : '') + (ok ? '' : ' locked'), onclick: () => { if (!ok) return; g.issue({ type: CMD.SET_PRODUCT, e: i, p }); this.close(); } },
        h('span', { class: 'grow' }, name), h('span', { class: 'small' }, ok ? cost : '🔒 ' + t('t_' + tech)))));
    this.frame(t('b_' + bd.id) + ' — ' + t('a_product'), list);
  }
  // ---------- GÖREV ----------
  p_mission(b) {
    const g = this.g, sim = g.sim, co = this.co(), bd = BUILDINGS[sim.e.def[b]];
    const items = ITEMS.filter((it) => it.unit && (bd.launches === 'aircraft' ? (it.cat === 'aircraft' || it.id === 'male' || it.id === 'recon_uav') : bd.launches === 'naval' ? it.id === 'naval_drone' : it.cat === 'drone' && it.id !== 'naval_drone'));
    const st = this.state; if (!st.mItem || !items.find((x) => x.id === st.mItem)) st.mItem = (items.find((x) => co.items[ITEM_BY[x.id]] >= 1) || items[0])?.id; st.mN = st.mN || 3;
    this.dyn = () => {
      const list = h('div', { class: 'grid' }, items.map((it) => {
        const n = co.items[ITEM_BY[it.id]] | 0; const u = UNITS.find((x) => x.id === it.unit);
        return h('div', { class: 'card' + (st.mItem === it.id ? ' on' : '') + (n ? '' : ' poor'), onclick: () => { st.mItem = it.id; this.updateDynamic(); } },
          this.hud.icon(u.spr.startsWith('gen:') && !u.spr.startsWith('gen:sam') ? u.spr + ':0' : u.spr, PAL[TEAM[g.player]], 2), h('div', { class: 'cname' }, t('i_' + it.id)), h('div', { class: 'ccost' }, `${t('st_stock')}: ${n}`));
      }));
      const nb = h('div', { class: 'row' }, t('a_count') + ':', [1, 3, 6, 12].map((n) => btn(String(n), () => { st.mN = n; this.updateDynamic(); }, st.mN === n ? 'on' : '')));
      const go = (how) => { if (co.items[ITEM_BY[st.mItem]] < 1) { this.hud.toast(t('err_nostock', ['i_' + st.mItem]), -1, -1, 1); return; } this.close(); g.startMission(b, st.mItem, st.mN, how); };
      return h('div', {}, list, nb, h('div', { class: 'acts' }, btn('⌖ ' + t('a_target'), () => go('target'), 'big'), btn('✎ ' + t('a_route'), () => go('route'), 'big'), btn('⟲ ' + t('a_patrol'), () => go('patrol'))));
    };
    this.frame(t('a_mission') + ' — ' + t('b_' + bd.id), h('div', { class: 'dyn' }, this.dyn()), h('p', { class: 'small' }, t('tut_3')));
  }
  // ---------- ATEŞ ----------
  p_fire(L) {
    const g = this.g, co = this.co(); const items = g.launcherItems(L); const key = g.launcherOf(L); const st = this.state;
    if (!items.includes(st.fItem)) st.fItem = items.find((x) => co.items[ITEM_BY[x]] >= 1) || items[0]; st.fN = st.fN || 1;
    this.dyn = () => h('div', {},
      h('div', { class: 'list' }, items.map((id) => { const ok = g.sim.techOk(g.player, ITEMS[ITEM_BY[id]].tech); return h('div', { class: 'row opt' + (st.fItem === id ? ' on' : '') + (ok ? '' : ' locked'), onclick: () => { if (ok) { st.fItem = id; this.updateDynamic(); } } }, h('span', { class: 'grow' }, t('i_' + id)), h('span', { class: 'small' }, ok ? `${t('st_stock')}: ${co.items[ITEM_BY[id]] | 0} · ${LAUNCHERS[key][id]} km` : '🔒')); })),
      h('div', { class: 'row' }, t('a_count') + ':', [1, 2, 4, 6].map((n) => btn(String(n), () => { st.fN = n; this.updateDynamic(); }, st.fN === n ? 'on' : ''))),
      h('div', { class: 'acts' }, btn('⌖ ' + t('a_target'), () => { this.close(); g.startFire(L, st.fItem, st.fN); }, 'big')));
    this.frame(t('a_fire'), h('div', { class: 'dyn' }, this.dyn()));
  }
  // ---------- KARIŞTIRICI ----------
  p_jam(j) {
    const g = this.g, e = g.sim.e; const max = g.sim.mod(g.player, 'adaptFast', 0) ? 3 : 2; let m = e.jamBands[j] || 12;
    this.dyn = () => h('div', {}, h('p', {}, `${t('a_jam_bands')} (max ${max})`), h('div', { class: 'grid' }, BANDS.map((b, k) => btn(b, () => { let nm = m ^ (1 << k); let c = 0; for (let x = nm; x; x >>= 1) c += x & 1; if (c >= 1 && c <= max) { m = nm; g.issue({ type: CMD.SET_JAM, e: j, mask: m }); } this.updateDynamic(); }, (m >>> k) & 1 ? 'on' : ''))));
    this.frame(t('a_jam_bands'), h('div', { class: 'dyn' }, this.dyn()));
  }
  // ---------- ARAŞTIRMA ----------
  p_research() {
    const g = this.g, co = this.co();
    const body = BRANCHES.map((br) => h('div', { class: 'branch' }, h('h3', {}, t('br_' + br)), h('div', { class: 'techs' }, TECHS.filter((x) => x.br === br).map((tc) => {
      const i = TECH_BY[tc.id]; const done = co.tech[i]; const avail = tc.req.every((r) => co.tech[TECH_BY[r]]); const cur = co.researching === i;
      return h('div', { class: 'tech' + (done ? ' done' : cur ? ' cur' : avail ? '' : ' locked'), onclick: () => { if (!done && avail) { g.issue({ type: CMD.RESEARCH, tech: tc.id }); setTimeout(() => this.render(), 150); } } },
        h('div', { class: 'tname' }, t('t_' + tc.id)), h('div', { class: 'small' }, done ? '✓ ' + t('done') : cur ? `${t('researching')} ${(co.rprog / tc.cost * 100) | 0}%` : avail ? `${tc.cost} ${t('research_pts').toLowerCase()}` : '🔒 ' + tc.req.map((r) => t('t_' + r)).join(', ')));
    }))));
    this.frame(t('p_research'), ...body);
  }
  // ---------- DİPLOMASİ ----------
  p_diplo() {
    const g = this.g, sim = g.sim, d = sim.diplo, p = g.player; const st = this.state;
    const props = d.proposals.filter((x) => x.to === p).map((pr) => h('div', { class: 'row prop' }, h('span', { class: 'grow' }, `${sim.countries[pr.from].name}: ${t('d_' + pr.action)}`), btn(t('d_accept'), () => { g.issue({ type: CMD.DIPLO, action: 'respond', pid: pr.id, accept: true }); setTimeout(() => this.render(), 200); }, 'ok'), btn(t('d_reject'), () => { g.issue({ type: CMD.DIPLO, action: 'respond', pid: pr.id, accept: false }); setTimeout(() => this.render(), 200); })));
    this.dyn = () => h('div', {}, sim.countries.map((c) => {
      if (c.id === p) return null;
      const s = d.get(p, c.id); const stName = c.alive ? t('ds_' + s) : '✗';
      const acts = !c.alive || g.spectator ? [] : [
        s !== DS.WAR ? btn(t('d_war'), () => { if (confirm(t('d_war') + ': ' + c.name + '?')) g.issue({ type: CMD.DIPLO, action: 'war', target: c.id }); }, 'warn') : null,
        s === DS.WAR ? btn(t('d_ceasefire'), () => g.issue({ type: CMD.DIPLO, action: 'ceasefire', target: c.id })) : null,
        s === DS.WAR || s === DS.CEASEFIRE ? btn(t('d_peace'), () => g.issue({ type: CMD.DIPLO, action: 'peace', target: c.id })) : null,
        s === DS.PEACE || s === DS.CEASEFIRE ? btn(t('d_alliance'), () => g.issue({ type: CMD.DIPLO, action: 'alliance', target: c.id })) : null,
        s === DS.ALLIANCE ? btn(t('d_break'), () => g.issue({ type: CMD.DIPLO, action: 'break', target: c.id })) : null,
        s !== DS.WAR ? btn(t('d_trade'), () => g.issue({ type: CMD.DIPLO, action: 'trade', target: c.id, data: { give: st.tGive || 'coal', get: st.tGet || 'electronics', amt: 0.5 } })) : null,
        s !== DS.WAR ? btn(t('d_buy'), () => g.issue({ type: CMD.DIPLO, action: 'buy', target: c.id, data: { item: st.bItem || 'fpv', n: 10 } })) : null,
      ];
      return h('div', { class: 'country' + (c.alive ? '' : ' dead') }, h('div', { class: 'row' }, flagCanvas(c.flag), h('b', { class: 'grow', style: { color: PAL[TEAM[c.id % TEAM.length]] } }, c.full), h('span', { class: 'badge s' + s }, stName)),
        h('div', { class: 'small' }, `${t('rel')}: ${d.relOf(p, c.id)} · ${t('strength')}: ${militaryStrength(sim, c.id) | 0} · ${t('personality')}: ${c.personality ? t('pers_' + c.personality.id) : t('you')}`), h('div', { class: 'acts wrap' }, acts));
    }));
    const sel = (key, opts, def) => h('select', { onchange: (e) => { st[key] = e.target.value; } }, opts.map((o) => h('option', { value: o, selected: (st[key] || def) === o }, t(key === 'bItem' ? 'i_' + o : 'r_' + o))));
    const tradeCfg = h('div', { class: 'row small' }, t('d_trade') + ': ', sel('tGive', RES.slice(0, 12), 'coal'), ' → ', sel('tGet', RES.slice(0, 12), 'electronics'), ' · ', t('d_buy') + ': ', sel('bItem', ITEMS.map((x) => x.id), 'fpv'), ' ×10');
    this.frame(t('p_diplo'), props.length ? h('div', { class: 'props' }, props) : '', tradeCfg, h('div', { class: 'dyn' }, this.dyn()));
  }
  // ---------- İSTİHBARAT ----------
  p_intel() {
    const g = this.g, sim = g.sim, co = this.co(); let kb = 0, ku = 0; const byC = {};
    for (const [, k] of co.known) { if (k.kind === KIND.BUILDING) kb++; else if (k.kind === KIND.GROUND) ku++; byC[k.owner] = (byC[k.owner] || 0) + 1; }
    const s = co.stats;
    const rows = [
      [t('i_known_b'), kb], [t('i_known_u'), ku], [t('i_emitters'), co.emitters.size],
      [t('i_ad_eff'), `${s.adShots} / ¤${fmt(s.adSpent)} (${s.adShots ? ((s.adSpent / s.adShots) | 0) : 0}/atış)`],
      [t('i_kills'), `${s.kills} / ${s.losses}`], [t('i_drones'), `${s.launched} / ${s.dronesLost}`], [t('i_jam'), co.lossByJam],
    ];
    const bands = h('div', { class: 'grid' }, BANDS.map((b, k) => { const ok = (co.bands >>> k) & 1; return btn(b + (ok ? '' : ' 🔒'), () => { if (ok) { g.issue({ type: CMD.SET_BAND, band: k }); setTimeout(() => this.render(), 150); } }, co.band === k ? 'on' : ok ? '' : 'dis'); }));
    this.frame(t('p_intel'), h('div', { class: 'list' }, rows.map(([a, b]) => h('div', { class: 'row' }, h('span', { class: 'grow' }, a), h('b', {}, String(b))))),
      h('h3', {}, t('i_band') + ': ' + BANDS[co.band]), h('p', { class: 'small' }, t('i_change_band')), bands,
      h('h3', {}, 'Tespit edilen tesisler (ülkeye göre)'), h('div', { class: 'list' }, Object.entries(byC).map(([c, n]) => sim.countries[c] ? h('div', { class: 'row' }, h('span', { class: 'grow' }, sim.countries[c].name), n) : null)));
  }
  // ---------- PİYASA ----------
  p_market() {
    const g = this.g, co = this.co();
    this.dyn = () => h('div', { class: 'list' }, Object.keys(MARKET_PRICE).map((r) => h('div', { class: 'row' }, h('span', { class: 'grow' }, `${t('r_' + r)} (${fmt(co.res[R[r]])})`), h('span', { class: 'small' }, '¤' + marketPrice(g.sim, g.player, r)),
      btn('+10', () => g.issue({ type: CMD.MARKET, res: r, amt: 10 })), btn('+50', () => g.issue({ type: CMD.MARKET, res: r, amt: 50 })), btn('−10', () => g.issue({ type: CMD.MARKET, res: r, amt: 10, sell: true })))));
    this.frame(t('p_market'), h('p', { class: 'small' }, t('mk_hint')), h('div', { class: 'dyn' }, this.dyn()));
  }
  // ---------- OLAY GÜNLÜĞÜ ----------
  p_log() {
    const g = this.g, sim = g.sim; const L = sim.log.filter((n) => n.c === g.player || n.c === -1).slice(-80).reverse();
    this.frame(t('p_log'), h('div', { class: 'list' }, L.map((n) => h('div', { class: 'row lvl' + n.lvl, onclick: () => { if (n.x >= 0) { g.jumpTo(n.x, n.y); this.close(); } } }, h('span', { class: 'small' }, `${t('day')} ${Math.floor((n.t + 420) / 1440) + 1} ${String(Math.floor(((n.t + 420) % 1440) / 60)).padStart(2, '0')}:${String((n.t + 420) % 60).padStart(2, '0')}`), ' ', t(n.key, n.args)))));
  }
  // ---------- MENÜ ----------
  async p_menu() {
    const g = this.g, app = g.app, s = app.settings;
    const saves = await listSaves().catch(() => ({}));
    const slot = (k) => h('div', { class: 'row' }, h('span', { class: 'grow' }, `${k === 'auto' ? t('autosave') : t('slot') + ' ' + k.slice(4)}: ${saves[k] ? `${saves[k].country} · ${t('day')} ${saves[k].day + 1}` : t('empty')}`),
      k !== 'auto' && !g.spectator ? btn('💾', async () => { await g.autosave(k); this.render(); }) : '', saves[k] ? btn('📂', async () => { const d = await loadGame(k); if (d) app.startFromSave(d); }) : '');
    const set = (k, v) => { s[k] = v; saveSettings(s); app.applySettings(); this.render(); };
    this.frame(t('p_menu'),
      h('h3', {}, t('m_load')), ['auto', 'slot1', 'slot2', 'slot3'].map(slot),
      h('h3', {}, t('m_settings')),
      h('div', { class: 'row' }, t('s_quality') + ':', ['q_low', 'q_med', 'q_high'].map((q, k) => btn(t(q), () => set('quality', k), s.quality === k ? 'on' : ''))),
      h('div', { class: 'row' }, t('s_sound') + ':', btn(s.sound ? t('s_on') : t('s_off'), () => set('sound', !s.sound)), [0.3, 0.6, 1].map((v) => btn(String(v * 100 | 0) + '%', () => set('volume', v), s.volume === v ? 'on' : ''))),
      g.spectator ? '' : h('div', { class: 'row' }, t('s_fog') + ':', btn(g.sim.opts.fog !== false ? t('s_on') : t('s_off'), () => { g.issue({ type: CMD.RULE, fog: g.sim.opts.fog === false }); setTimeout(() => this.render(), 200); })),
      h('div', { class: 'row' }, t('s_vibrate') + ':', btn(s.vibrate ? t('s_on') : t('s_off'), () => set('vibrate', !s.vibrate)), ' FPS:', btn(s.debug ? t('s_on') : t('s_off'), () => set('debug', !s.debug))),
      h('div', { class: 'row small' }, `${t('s_renderer')}: ${app.renderer.kind}`),
      h('div', { class: 'acts' }, btn('⌂ ' + t('m_back'), () => { if (!g.spectator) g.autosave(); app.toMenu(); }, 'warn')));
  }
}
