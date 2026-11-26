// Ana menü: yeni oyun (tohum, harita, rakip, zorluk), devam, kayıtlar, izleyici modu, ayarlar
import { h, clear, btn } from './dom.js';
import { listSaves, loadGame, saveSettings } from '../core/storage.js';
import { MAP_SIZES } from '../world/mapgen.js';
import { DIFFICULTY } from '../data/ai.js';
import { t } from '../i18n/i18n.js';

export function showMenu(app) {
  const root = app.ui; clear(root);
  const st = { seed: (Math.random() * 1e6) | 0, size: 'small', ai: 4, diff: 1, exp24: false };
  const wrap = h('div', { class: 'menu' });
  const title = h('div', { class: 'mtitle' }, h('img', { class: 'logo', src: app.logo, alt: '' }), h('h1', {}, t('title')), h('p', {}, t('subtitle')));
  const main = () => {
    clear(wrap).append(title, h('div', { class: 'mbtns' },
      btn(t('m_new'), () => newGame(), 'big'),
      btn(t('m_continue'), async () => { const d = await loadGame('auto').catch(() => null); if (d) app.startFromSave(d); else app.flash(t('no_save')); }, 'big'),
      btn(t('m_load'), () => saves(), 'big'),
      btn(t('m_spectate'), () => app.startNew({ seed: st.seed, size: MAP_SIZES.small, countries: 6, difficulty: 2, allAI: true, player: 0 }), 'big'),
      btn(t('m_settings'), () => settings(), 'big')),
      h('p', { class: 'small foot' }, 'v0.15 · Kenney CC0 · Pixelify Sans OFL'));
  };
  const newGame = () => {
    const sel = (opts, cur, on) => h('div', { class: 'seg' }, opts.map(([v, l]) => btn(l, () => { on(v); newGame(); }, cur === v ? 'on' : '')));
    const maxAI = st.exp24 ? 23 : 7;
    clear(wrap).append(h('h2', {}, t('m_new')),
      h('label', {}, t('m_seed')), h('div', { class: 'row' }, h('input', { type: 'number', value: st.seed, oninput: (e) => (st.seed = (+e.target.value) | 0) }), btn('🎲', () => { st.seed = (Math.random() * 1e6) | 0; newGame(); })),
      h('label', {}, t('m_size')), sel([['small', t('sz_small')], ['medium', t('sz_medium')], ['large', t('sz_large')]], st.size, (v) => (st.size = v)),
      h('label', {}, `${t('m_ai')}: ${st.ai}`), h('input', { type: 'range', min: 1, max: maxAI, value: Math.min(st.ai, maxAI), oninput: (e) => { st.ai = +e.target.value; e.target.previousSibling.textContent = `${t('m_ai')}: ${st.ai}`; } }),
      h('label', { class: 'chk' }, h('input', { type: 'checkbox', checked: st.exp24, onchange: (e) => { st.exp24 = e.target.checked; if (!st.exp24) st.ai = Math.min(st.ai, 7); newGame(); } }), t('m_exp24')),
      h('label', {}, t('m_diff')), sel(DIFFICULTY.map((d, k) => [k, t('diff_' + d.id)]), st.diff, (v) => (st.diff = v)),
      h('div', { class: 'mbtns' }, btn(t('m_start'), () => app.startNew({ seed: st.seed, size: MAP_SIZES[st.size], countries: st.ai + 1, difficulty: st.diff, player: 0 }), 'big ok'), btn(t('m_back'), main)));
  };
  const saves = async () => {
    const s = await listSaves().catch(() => ({}));
    clear(wrap).append(h('h2', {}, t('m_load')), ...['auto', 'slot1', 'slot2', 'slot3'].map((k) => h('div', { class: 'row' }, h('span', { class: 'grow' }, `${k === 'auto' ? t('autosave') : t('slot') + ' ' + k.slice(4)}: ${s[k] ? `${s[k].country} · ${t('day')} ${s[k].day + 1} · ${new Date(s[k].time).toLocaleString('tr-TR')}` : t('empty')}`),
      s[k] ? btn('📂', async () => { const d = await loadGame(k); if (d) app.startFromSave(d); }) : '')), h('div', { class: 'mbtns' }, btn(t('m_back'), main)));
  };
  const settings = () => {
    const s = app.settings; const set = (k, v) => { s[k] = v; saveSettings(s); app.applySettings(); settings(); };
    clear(wrap).append(h('h2', {}, t('m_settings')),
      h('label', {}, t('s_quality')), h('div', { class: 'seg' }, ['q_low', 'q_med', 'q_high'].map((q, k) => btn(t(q), () => set('quality', k), s.quality === k ? 'on' : ''))),
      h('label', {}, t('s_sound')), h('div', { class: 'seg' }, btn(t('s_on'), () => set('sound', true), s.sound ? 'on' : ''), btn(t('s_off'), () => set('sound', false), s.sound ? '' : 'on')),
      h('label', {}, t('s_renderer')), h('div', { class: 'seg' }, [['auto', 'WebGL2'], ['2d', 'Canvas 2D']].map(([v, l]) => btn(l, () => { set('renderer', v); app.flash('↻'); }, s.renderer === v ? 'on' : ''))),
      h('div', { class: 'mbtns' }, btn(t('m_back'), main)));
  };
  main(); root.append(wrap);
}
