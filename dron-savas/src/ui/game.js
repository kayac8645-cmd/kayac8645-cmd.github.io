// Oyun oturumu: ana döngü (sabit adımlı sim + interpolasyonlu render), kamera, seçim, bağlama göre emirler, modlar.
import { KIND, C, F } from '../core/ecs.js';
import { CMD } from '../core/commands.js';
import { TICK_MS } from '../sim/sim.js';
import { BUILDINGS } from '../data/buildings.js';
import { UNITS } from '../data/defs.js';
import { canPlace } from '../sim/build.js';
import { GM } from '../sim/ground.js';
import { LAUNCHERS, launcherKey } from '../sim/missiles.js';
import { View } from '../render/view.js';
import { Input } from './input.js';
import { HUD } from './hud.js';
import { LocalBus } from '../net/lockstep.js';
import { serialize } from '../sim/serialize.js';
import { saveGame } from '../core/storage.js';
import { t } from '../i18n/i18n.js';

const TS = 16;
export class Game {
  constructor(app, sim) {
    this.app = app; this.sim = sim; this.player = sim.opts.player ?? 0; this.spectator = !!sim.opts.allAI;
    this.bus = app.bus || new LocalBus(sim);
    this.view = new View(app.renderer, app.atlas, sim, this.player);
    this.view.setQuality(app.settings.quality);
    this.speed = 1; this.paused = false; this.acc = 0; this.last = performance.now(); this.mode = null; this.modeData = null;
    this.fps = 60; this.lastAutosave = sim.tick; this.tickMs = 0;
    const cap = sim.world.countries[this.player]?.capital || { x: sim.map.W / 2, y: sim.map.H / 2 };
    this.view.cam.x = cap.x * TS; this.view.cam.y = cap.y * TS; this.view.cam.zoom = 3;
    this.hud = new HUD(this);
    this.input = new Input(app.canvas, {
      pan: (dx, dy) => { const z = this.view.cam.zoom; this.view.cam.x -= dx / z; this.view.cam.y -= dy / z; this.clampCam(); },
      zoomAt: (sx, sy, d) => this.zoomAt(sx, sy, d),
      tap: (sx, sy) => this.tap(sx, sy),
      area: (x0, y0, x1, y1, done) => this.area(x0, y0, x1, y1, done),
      route: (pts, done) => this.route(pts, done),
      mode: () => this.mode,
    });
    this.input.dpr = app.dpr;
    window.__onBack = () => { if (this.mode) { this.setMode(null); return true; } if (this.hud.closePanel()) return true; if (this.view.sel.size) { this.view.sel.clear(); this.hud.renderContext(); return true; } return false; };
    window.__onHostPause = () => this.autosave();
    this.running = true; requestAnimationFrame((n) => this.frame(n));
  }
  destroy() { this.running = false; this.hud.destroy(); window.__onBack = null; }
  clampCam() { const c = this.view.cam, m = this.sim.map; c.x = Math.max(0, Math.min(m.W * TS, c.x)); c.y = Math.max(0, Math.min(m.H * TS, c.y)); }
  zoomAt(sx, sy, d) {
    const c = this.view.cam; const nz = Math.max(1, Math.min(6, c.zoom + d)); if (nz === c.zoom) return;
    const [wx, wy] = this.s2w(sx, sy); c.zoom = nz;
    const r = this.app.renderer; c.x = wx * TS - (sx - r.W / 2) / nz; c.y = wy * TS - (sy - r.H / 2) / nz; this.clampCam();
  }
  s2w(sx, sy) { const c = this.view.cam, r = this.app.renderer; return [(c.x + (sx - r.W / 2) / c.zoom) / TS, (c.y + (sy - r.H / 2) / c.zoom) / TS]; }
  w2s(wx, wy) { const c = this.view.cam, r = this.app.renderer; return [(wx * TS - c.x) * c.zoom + r.W / 2, (wy * TS - c.y) * c.zoom + r.H / 2]; }
  jumpTo(x, y) { if (x < 0) return; this.view.cam.x = x * TS; this.view.cam.y = y * TS; this.clampCam(); }
  issue(cmd) { if (this.spectator) return; this.bus.submit({ ...cmd, c: this.player }); this.app.audio.click(); }
  setMode(m, data) { this.mode = m; this.modeData = data || null; if (m !== 'build') this.view.ghost = null; if (!m) { this.view.targetMarker = null; this.view.routeDraft = null; } this.hud.renderContext(); }

  frame(now) {
    if (!this.running) return;
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    this.fps += (1 / Math.max(dt, 0.001) - this.fps) * 0.05;
    const sim = this.sim;
    if (!this.paused && !sim.over) this.acc += dt * 1000 * this.speed;
    let steps = 0; const t0 = performance.now();
    while (this.acc >= TICK_MS && steps < 8) {
      if (!this.bus.canStep()) { this.acc = Math.min(this.acc, TICK_MS); break; }
      sim.step(); this.bus.afterStep(); this.acc -= TICK_MS; steps++;
    }
    if (steps) this.tickMs += ((performance.now() - t0) / steps - this.tickMs) * 0.1;
    if (this.acc > TICK_MS * 4) this.acc = TICK_MS * 4;
    const alpha = this.paused ? 1 : Math.min(1, this.acc / TICK_MS);
    if (sim.events.length) { const ev = sim.events.splice(0); this.view.consume(ev, this.app.audio); this.hud.events(ev); }
    this.view.draw(alpha, dt);
    this.hud.frame(dt);
    if (sim.tick - this.lastAutosave > 2880 && !this.spectator) this.autosave();
    requestAnimationFrame((n) => this.frame(n));
  }
  async autosave(slot = 'auto') {
    if (this.spectator || this.sim.over && slot === 'auto') return;
    this.lastAutosave = this.sim.tick;
    try {
      const co = this.sim.countries[this.player];
      const size = await saveGame(slot, serialize(this.sim), { day: this.sim.env.day, tick: this.sim.tick, country: co.name, seed: this.sim.opts.seed, size: this.sim.opts.size });
      this.hud.toast(t('saved') + ` (${(size / 1024) | 0} KB)`, -1, -1, 0);
    } catch (e) { this.hud.toast(t('save_err') + ': ' + e.message, -1, -1, 2); }
  }

  // ---- seçim ve emirler ----
  entityAt(wx, wy) {
    const e = this.sim.e, v = this.view; let best = -1, bd = 1.3 * 1.3;
    // hava birimleri (yükseklik ofseti ile)
    for (let i = 0; i < e.hi; i++) {
      const k = e.kind[i]; if (!k || (e.flags[i] & F.DEAD)) continue;
      if (k !== KIND.AIR && k !== KIND.GROUND && k !== KIND.NAVAL && k !== KIND.CONVOY) continue;
      if (!v.visibleTo(i)) continue;
      const zy = k === KIND.AIR ? e.z[i] * 2 / TS : 0.4;
      const dx = e.x[i] - wx, dy = e.y[i] - zy - wy, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    if (best >= 0) return best;
    const map = this.sim.map; const tx = wx | 0, ty = wy | 0;
    for (const [ox, oy] of [[0, 0], [0, 1], [0, 2]]) { // binanın görsel yüksekliği (3/4)
      if (!map.inb(tx + ox, ty + oy)) continue; const o = map.occ[map.idx(tx + ox, ty + oy)];
      if (o && (v.visibleTo(o - 1) || v.knownBuilding(o - 1))) return o - 1;
    }
    let city = -1; e.each(C.CITY, (i) => { const dx = e.x[i] - wx, dy = e.y[i] - wy; if (dx * dx + dy * dy < e.prog[i] * e.prog[i] && (v.visibleTo(i) || v.spectator || this.sim.countries[this.player].known.has(i))) city = i; });
    return city;
  }
  ownSel() { const e = this.sim.e; return [...this.view.sel].filter((i) => e.alive(i) && e.owner[i] === this.player); }
  tap(sx, sy) {
    this.app.audio.resume();
    const [wx, wy] = this.s2w(sx, sy); const sim = this.sim, e = sim.e;
    if (this.mode === 'build') {
      const d = this.modeData.def; const bd = BUILDINGS[d]; const x = Math.round(wx - bd.size[0] / 2), y = Math.round(wy - bd.size[1] / 2);
      const g = this.view.ghost;
      if (g && g.x === x && g.y === y && g.ok) { this.confirmBuild(); return; }
      const reason = canPlace(sim, this.player, d, x, y, { hardened: this.modeData.hard });
      this.view.ghost = { def: d, x, y, ok: !reason, reason }; this.hud.renderContext(); return;
    }
    if (this.mode === 'target') { const tgt = this.entityAt(wx, wy); this.modeData.cb(wx, wy, tgt); return; }
    if (this.mode === 'route') { return; }
    const hit = this.entityAt(wx, wy);
    const own = this.ownSel();
    // seçili birimlerle bağlamsal emir
    if (own.length && !this.spectator) {
      const ground = own.filter((i) => e.kind[i] === KIND.GROUND || (e.kind[i] === KIND.NAVAL && UNITS[e.def[i]].role !== 'naval'));
      const air = own.filter((i) => e.kind[i] === KIND.AIR || (e.kind[i] === KIND.NAVAL && UNITS[e.def[i]].role === 'naval'));
      const hitOwn = hit >= 0 && e.owner[hit] === this.player;
      const hitEnemy = hit >= 0 && e.owner[hit] < 24 && sim.atWar(this.player, e.owner[hit]);
      if ((ground.length || air.length) && !hitOwn) {
        if (ground.length) this.issue({ type: CMD.MOVE_UNITS, ids: ground, x: wx, y: wy, mode: hitEnemy ? GM.ATTACK : GM.MOVE });
        if (air.length) this.issue({ type: CMD.SET_ROUTE, ids: air, route: [wx, wy], target: hitEnemy ? hit : -1 });
        this.view.targetMarker = [wx, wy]; setTimeout(() => { if (!this.mode) this.view.targetMarker = null; }, 700);
        return;
      }
      if (hitOwn && e.kind[hit] === KIND.BUILDING && ground.some((i) => UNITS[e.def[i]].repair) && e.hp[hit] < e.maxhp[hit]) {
        this.issue({ type: CMD.MOVE_UNITS, ids: ground.filter((i) => UNITS[e.def[i]].repair), x: e.x[hit], y: e.y[hit] + 1.5, mode: GM.MOVE }); return;
      }
    }
    this.view.sel.clear();
    if (hit >= 0) this.view.sel.add(hit);
    this.hud.renderContext();
  }
  area(x0, y0, x1, y1, done) {
    const [a, b] = this.s2w(x0, y0), [c, d] = this.s2w(x1, y1);
    this.view.areaSel = done ? null : [a, b, c, d];
    if (!done) return;
    const e = this.sim.e; const xa = Math.min(a, c), xb = Math.max(a, c), ya = Math.min(b, d), yb = Math.max(b, d);
    this.view.sel.clear();
    for (let i = 0; i < e.hi; i++) {
      const k = e.kind[i]; if (!k || (e.flags[i] & F.DEAD) || e.owner[i] !== this.player) continue;
      if (k !== KIND.GROUND && k !== KIND.AIR && k !== KIND.NAVAL) continue;
      if (e.x[i] >= xa && e.x[i] <= xb && e.y[i] >= ya && e.y[i] <= yb) this.view.sel.add(i);
    }
    this.hud.renderContext();
  }
  route(pts, done) {
    const w = []; for (let k = 0; k < pts.length; k += 2) { const [x, y] = this.s2w(pts[k], pts[k + 1]); w.push(x, y); }
    this.view.routeDraft = w;
    if (!done) return;
    const md = this.modeData; this.setMode(null);
    if (md && md.cb) md.cb(w);
  }
  confirmBuild() {
    const g = this.view.ghost; if (!g || !g.ok) return;
    this.issue({ type: CMD.BUILD, def: g.def, x: g.x, y: g.y, hard: !!this.modeData.hard });
    this.view.ghost = null; this.hud.renderContext();
  }
  // görev: dron üssünden
  startMission(base, item, n, how) {
    const go = (extra) => { this.issue({ type: CMD.MISSION, base, item, n, ...extra }); this.setMode(null); };
    if (how === 'route') this.setMode('route', { cb: (w) => { if (w.length >= 2) go({ route: w.length >= 4 ? w : null, tx: w[w.length - 2], ty: w[w.length - 1], auto: false }); } });
    else this.setMode('target', { hint: 'hint_target', cb: (x, y, tgt) => { const e = this.sim.e; go({ tx: x, ty: y, target: tgt >= 0 && e.owner[tgt] !== this.player ? tgt : -1, mode: how === 'patrol' ? 'patrol' : undefined }); } });
  }
  startFire(launcher, item, n) {
    this.setMode('target', { hint: 'hint_target', launcher, item, cb: (x, y, tgt) => { const e = this.sim.e; this.issue({ type: CMD.FIRE_MISSILE, launcher, item, n, tx: x, ty: y, target: tgt >= 0 && e.owner[tgt] !== this.player ? tgt : -1 }); this.setMode(null); } });
  }
  startMove(ids, mode) {
    this.setMode('target', { hint: 'hint_move', cb: (x, y) => { this.issue({ type: CMD.MOVE_UNITS, ids, x, y, mode }); this.setMode(null); } });
  }
  launcherOf(id) { return launcherKey(this.sim, id); }
  launcherItems(id) { const k = launcherKey(this.sim, id); return k ? Object.keys(LAUNCHERS[k]) : []; }
}
