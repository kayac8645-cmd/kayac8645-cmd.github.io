// Giriş noktası: font, çizici, atlas, menü, oyun oturumu
import { createRenderer } from './render/gl.js';
import { buildAtlas, frameIcon } from './render/sprites.js';
import { Simulation, PERSONALITIES } from './sim/sim.js';
import { DIFFICULTY } from './data/ai.js';
import { restore } from './sim/serialize.js';
import { Synth } from './audio/synth.js';
import { loadSettings } from './core/storage.js';
import { Game } from './ui/game.js';
import { showMenu } from './ui/menu.js';
import { h, clear } from './ui/dom.js';
import { t } from './i18n/i18n.js';
import fontLatin from '../node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-400-normal.woff2';
import fontExt from '../node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-ext-400-normal.woff2';

const app = {
  canvas: document.getElementById('game'), ui: document.getElementById('ui'),
  settings: loadSettings(), audio: new Synth(), game: null, dpr: 1,
};
window.__app = app;

async function loadFonts() {
  try {
    const a = new FontFace('Pixel', `url(${fontLatin})`, { unicodeRange: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' });
    const b = new FontFace('Pixel', `url(${fontExt})`, { unicodeRange: 'U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF' });
    await Promise.all([a.load(), b.load()]); document.fonts.add(a); document.fonts.add(b);
  } catch (e) { console.warn('font', e); }
}
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 3); app.dpr = dpr;
  const w = window.innerWidth, hh = window.innerHeight;
  app.canvas.style.width = w + 'px'; app.canvas.style.height = hh + 'px';
  app.renderer.resize(Math.round(w * dpr), Math.round(hh * dpr));
  if (app.game) app.game.input.dpr = dpr;
}
app.applySettings = () => {
  const s = app.settings; app.audio.setOn(s.sound); app.audio.setVolume(s.volume);
  if (app.game) app.game.view.setQuality(s.quality);
};
app.flash = (msg) => { const el = h('div', { class: 'toast lvl1 flash' }, msg); app.ui.append(el); setTimeout(() => el.remove(), 2500); };
function loading(msg) { clear(app.ui).append(h('div', { class: 'loading' }, h('div', { class: 'spinner' }), h('p', {}, msg))); return new Promise((r) => setTimeout(r, 30)); }
app.toMenu = () => { if (app.game) { app.game.destroy(); app.game = null; } showMenu(app); app.idle(); };
app.startNew = async (opts) => {
  app.audio.resume(); await loading(t('loading'));
  if (app.game) { app.game.destroy(); app.game = null; }
  const sim = new Simulation(opts);
  app.game = new Game(app, sim);
};
app.startFromSave = async (data) => {
  app.audio.resume(); await loading(t('loading'));
  if (app.game) { app.game.destroy(); app.game = null; }
  try { const sim = restore(Simulation, data, { PERSONALITIES, DIFFICULTY }); app.game = new Game(app, sim); app.flash(t('loaded')); }
  catch (e) { console.error(e); app.flash(t('save_err') + ': ' + e.message); showMenu(app); }
};
// menüde arka plan: koyu gökyüzü + rastgele parıltı (çizici boşta)
app.idle = () => {
  const r = app.renderer; const loop = () => { if (app.game) return; r.clear(0.05, 0.07, 0.11); r.end(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
};

async function boot() {
  await loading(t('loading_art'));
  await loadFonts();
  app.renderer = createRenderer(app.canvas, app.settings.renderer === '2d');
  resize(); window.addEventListener('resize', resize);
  app.atlas = await buildAtlas();
  app.logo = frameIcon(app.atlas, 'gen:male:12', 4, '#3f7fe0');
  app.applySettings();
  document.addEventListener('visibilitychange', () => { if (document.hidden && app.game) app.game.autosave(); });
  document.addEventListener('pointerdown', () => app.audio.resume(), { once: true });
  showMenu(app); app.idle();
}
boot().catch((e) => { document.body.innerHTML = '<pre style="color:#f88;padding:16px;white-space:pre-wrap">Başlatma hatası:\n' + (e && e.stack || e) + '</pre>'; });
