// Sahne çizimi: arazi chunk'ları, gölgeler, binalar/şehirler/birimler (y-sıralı), hava ve mermiler,
// parçacıklar, ışık haritası (gece), savaş sisi, hava durumu, harita katmanları, seçim ve rota.
import { KIND, C, F } from '../core/ecs.js';
import { BUILDINGS } from '../data/buildings.js';
import { UNITS, PROJS, AD_SYS, CLS } from '../data/defs.js';
import { PRGB, TEAM, P32, PAL } from '../data/palette.js';
import { T, RD } from '../world/map.js';
import { hash2, hash2f } from '../core/rng.js';
import { rgba, withAlpha } from './gl.js';
import { TerrainBaker } from './terrain.js';
import { Particles, PT } from './particles.js';
import { TILE, BUILD_TOP, DIRS } from './sprites.js';
import { VIS_CELL } from '../sim/country.js';
import { LAUNCHERS } from '../sim/missiles.js';

const TS = TILE;
const teamCol = (o, a = 255) => { const c = PRGB[TEAM[o % TEAM.length]] || [200, 200, 200]; return rgba(c[0], c[1], c[2], a); };
const pcol = (k, a = 255) => { const c = PRGB[k]; return rgba(c[0], c[1], c[2], a); };
const WHITE = 0xffffffff;
export const LAYERS = ['normal', 'power', 'logistics', 'airdef', 'ew', 'resources', 'front'];
const SYM = { inf: 'inf', armor: 'armor', mech: 'mech', artillery: 'arty', engineer: 'eng', ad_bat: 'ad', ew_bat: 'ew', mlrs: 'mlrs', sam_long: 'ad', sam_med: 'ad', sam_short: 'ad', corvette: 'ship' };
const GEN_DIR = { 'gen:quad': 'quad', 'gen:fpv': 'fpv', 'gen:hexa': 'hexa', 'gen:delta': 'delta', 'gen:uav': 'uav', 'gen:male': 'male', 'gen:mother': 'mother' };

export class View {
  constructor(renderer, atlas, sim, player) {
    this.r = renderer; this.A = atlas; this.sim = sim; this.player = player;
    this.tex = renderer.createTexture(atlas.canvas);
    this.terrain = new TerrainBaker(renderer, atlas, sim.map);
    this.terrain.warFn = (a, b) => sim.atWar(a, b);
    this.parts = new Particles(3000);
    this.cam = { x: 0, y: 0, zoom: 3 };
    this.layer = 'normal'; this.quality = 1; this.time = 0;
    this.fogImg = null; this.fogTex = null; this.fogTick = -1;
    this.houses = new Map();
    this.sel = new Set(); this.hover = -1; this.ghost = null; this.routeDraft = null; this.targetMarker = null;
    this.shake = 0; this.spectator = !!sim.opts.allAI;
    this.stats = { sprites: 0 };
    this.labels = [];
  }
  setQuality(q) { this.quality = q; this.parts.setCap([1500, 3000, 5000][q]); this.r.setLightScale([4, 2, 2][q]); }
  visibleTo(id) {
    const e = this.sim.e, p = this.player; const o = e.owner[id];
    if (this.spectator || o === p) return true;
    if (o < 24 && this.sim.diplo.allied(p, o)) return true;
    return ((e.seenBy[id] >>> p) & 1) === 1;
  }

  // -------- sim olayları -> efektler --------
  consume(events, audio) {
    const P = this.parts, sim = this.sim, e = sim.e;
    const onScreen = (x, y) => Math.abs(x * TS - this.cam.x) < this.r.W / this.cam.zoom && Math.abs(y * TS - this.cam.y) < this.r.H / this.cam.zoom;
    for (const ev of events) {
      switch (ev.k) {
        case 'boom': {
          if (!this.visiblePoint(ev.x, ev.y) && !ev.air) break;
          const X = ev.x * TS, Y = ev.y * TS, s = ev.big;
          P.emit(PT.FLASH, X, Y, ev.air ? 30 : 2, 0, 0, 0, 0.18 + s * 0.08, 8 + s * 10, pcol('l1'));
          P.emit(PT.RING, X, Y, 0, 0, 0, 0, 0.35 + s * 0.1, 4 + s * 4, ev.air ? pcol('k7', 180) : pcol('l1', 200));
          const nS = (ev.air ? 3 : 6 + s * 8) * (this.quality + 1) / 2;
          for (let k = 0; k < nS; k++) { const a = Math.random() * 6.28, sp = 20 + Math.random() * 60 * (1 + s); P.emit(PT.SPARK, X, Y, ev.air ? 30 : 2, Math.cos(a) * sp, Math.sin(a) * sp * 0.6, 20 + Math.random() * 40, 0.3 + Math.random() * 0.4, 1, Math.random() < 0.5 ? pcol('l0') : pcol('o1')); }
          if (!ev.air) {
            for (let k = 0; k < 3 + s * 4; k++) { const a = Math.random() * 6.28, sp = 5 + Math.random() * 15; P.emit(PT.SMOKE, X + Math.cos(a) * 3, Y + Math.sin(a) * 3, 3, Math.cos(a) * sp, Math.sin(a) * sp * 0.5 - 4, 6, 1.5 + Math.random() * 2 + s, 3 + s, Math.random() < 0.5 ? pcol('k2', 200) : pcol('k3', 190)); }
            for (let k = 0; k < 2 + s * 3; k++) { const a = Math.random() * 6.28, sp = 15 + Math.random() * 25; P.emit(PT.DEBRIS, X, Y, 2, Math.cos(a) * sp, Math.sin(a) * sp * 0.6, 30 + Math.random() * 30, 0.7 + Math.random() * 0.5, 1, pcol('b1')); }
            if (ev.water) for (let k = 0; k < 8; k++) P.emit(PT.SPLASH, X, Y, 2, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, 30 + Math.random() * 30, 0.6, 1, pcol('w5'));
          } else { for (let k = 0; k < 2; k++) P.emit(PT.SMOKE, X, Y, 30, (Math.random() - 0.5) * 6, -2, 0, 1.4, 2, pcol('k4', 180)); }
          if (onScreen(ev.x, ev.y)) { this.shake = Math.min(6, this.shake + (ev.air ? 0.5 : 1 + s * 1.5)); audio?.boom(s, ev.air); }
          break;
        }
        case 'intercept': { const X = ev.x * TS, Y = ev.y * TS; P.emit(PT.FLASH, X, Y, (ev.z || 10) * 2, 0, 0, 0, 0.2, ev.hit ? 12 : 6, ev.hit ? pcol('l1') : pcol('k6')); if (onScreen(ev.x, ev.y)) audio?.boom(0, true); break; }
        case 'tracer': if (this.visiblePoint(ev.x, ev.y)) { P.emit(PT.TRACER, ev.x * TS, ev.y * TS, 2, 0, 0, 0, 0.12, 1, pcol('l0'), ev.tx * TS, ev.ty * TS - (ev.z || 0) * 2); if (onScreen(ev.x, ev.y)) audio?.gun(); } break;
        case 'laser': if (this.visiblePoint(ev.x, ev.y)) { P.emit(PT.LASER, ev.x * TS, ev.y * TS - 8, 2, 0, 0, 0, 0.15, 1, pcol('w5'), ev.tx * TS, ev.ty * TS - (ev.z || 0) * 2); } break;
        case 'shot': if (this.visiblePoint(ev.x, ev.y)) P.emit(PT.TRACER, ev.x * TS, ev.y * TS, 2, 0, 0, 0, 0.08, 1, pcol('l1', 200), ev.tx * TS, ev.ty * TS); break;
        case 'launch': if (this.visiblePoint(ev.x, ev.y)) { const X = ev.x * TS, Y = ev.y * TS; P.emit(PT.FLASH, X, Y, 3, 0, 0, 0, 0.12, ev.big ? 10 : 5, pcol('l1')); for (let k = 0; k < (ev.big ? 8 : 3); k++) P.emit(PT.SMOKE, X, Y, 2, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 10, 3, 1.5, 3, pcol('k5', 160)); if (onScreen(ev.x, ev.y)) audio?.launch(ev.big, ev.sam); } break;
        case 'down': if (this.visiblePoint(ev.x, ev.y) && ev.kind === KIND.AIR) { const X = ev.x * TS, Y = ev.y * TS; P.emit(PT.FLASH, X, Y, (ev.z || 3) * 2, 0, 0, 0, 0.15, 5, pcol('o1')); for (let k = 0; k < 4; k++) P.emit(PT.DEBRIS, X, Y, (ev.z || 3) * 2, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, 10, 0.8, 1, pcol('k3')); P.emit(PT.SMOKE, X, Y, (ev.z || 3) * 2, 0, 0, -4, 1.5, 2, pcol('k2', 200)); } break;
        case 'ruin': if (this.visiblePoint(ev.x, ev.y)) { for (let k = 0; k < (ev.big ? 20 : 10); k++) P.emit(PT.SMOKE, ev.x * TS + (Math.random() - 0.5) * 20, ev.y * TS + (Math.random() - 0.5) * 14, 2, (Math.random() - 0.5) * 10, -3, 8, 3 + Math.random() * 2, 4, pcol('k1', 220)); if (onScreen(ev.x, ev.y)) audio?.boom(2, false); } break;
        case 'release': P.emit(PT.FLASH, ev.x * TS, ev.y * TS, 20, 0, 0, 0, 0.1, 4, pcol('k7')); break;
        case 'season': this.terrain.setSeason(ev.season); break;
        case 'built': case 'repaired': this.houses.clear(); break;
        case 'flood': this.shake = 4; break;
      }
    }
  }
  visiblePoint(x, y) {
    if (this.spectator) return true;
    const co = this.sim.countries[this.player]; const cx = (x / VIS_CELL) | 0, cy = (y / VIS_CELL) | 0;
    if (cx < 0 || cy < 0 || cx >= co.vw || cy >= co.vh) return false;
    return co.visNow[cy * co.vw + cx] > 0;
  }

  // -------- şehir evleri (deterministik yerleşim) --------
  cityHouses(id) {
    const e = this.sim.e, map = this.sim.map; const R = e.prog[id] | 0; let h = this.houses.get(id);
    if (h && h.R === R && h.v === map.version >> 6) return h.list;
    const list = []; const cx = e.x[id] | 0, cy = e.y[id] | 0; const info = this.sim.cityInfo.get(id);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const x = cx + dx, y = cy + dy; if (!map.inb(x, y) || !map.inb(x, y - 1)) continue;
      const d2 = dx * dx + dy * dy; if (d2 > R * R) continue;
      const i = y * map.W + x; if (!map.isLand(i) || map.road[i] || map.occ[i] || map.ter[i] === T.MOUNTAIN || map.ter[i] === T.PEAK) continue;
      const hh = hash2(x, y, info.seed);
      if ((hh & 255) / 255 > 0.5 - (d2 / (R * R + 1)) * 0.38) continue;
      if (((x + y) & 1) && d2 > 4) continue; // sokak dokusu
      if (map.occ[i - map.W]) continue;
      const big = d2 < 4 && R > 4;
      list.push([x, y, hh, big]);
    }
    list.sort((a, b) => a[1] - b[1]);
    this.houses.set(id, { R, v: map.version >> 6, list });
    return list;
  }

  // -------- ana çizim --------
  draw(alpha, dt) {
    const r = this.r, sim = this.sim, e = sim.e, map = sim.map, A = this.A, env = sim.env;
    this.time += dt; this.parts.update(dt, env.windX, env.windY); this.terrain.frame++;
    if (this.terrain.season !== env.season) this.terrain.setSeason(env.season);
    if (map.dirtyChunks.size) { this.terrain.invalidate(map.dirtyChunks); map.dirtyChunks.clear(); }
    const z = this.cam.zoom;
    let sx = 0, sy = 0; if (this.shake > 0.1) { sx = (Math.random() - 0.5) * this.shake; sy = (Math.random() - 0.5) * this.shake; this.shake *= 0.86; }
    r.setView(Math.round((this.cam.x + sx) * z) / z, Math.round((this.cam.y + sy) * z) / z, z);
    r.clear(0.06, 0.12, 0.22);
    const vw = r.W / z, vh = r.H / z; const x0 = this.cam.x - vw / 2, y0 = this.cam.y - vh / 2, x1 = x0 + vw, y1 = y0 + vh;
    this.view = { x0, y0, x1, y1 };
    // 1) arazi
    const budget = { n: this.quality >= 2 ? 3 : 2 };
    const cx0 = Math.max(0, Math.floor(x0 / 512)), cy0 = Math.max(0, Math.floor(y0 / 512));
    const cx1 = Math.min(Math.ceil(map.W / 32) - 1, Math.floor(x1 / 512)), cy1 = Math.min(Math.ceil(map.H / 32) - 1, Math.floor(y1 / 512));
    // önce merkeze yakın chunk'lar pişsin
    const order = [];
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) order.push([cx, cy, Math.abs(cx * 512 + 256 - this.cam.x) + Math.abs(cy * 512 + 256 - this.cam.y)]);
    order.sort((a, b) => a[2] - b[2]);
    for (const [cx, cy] of order) {
      const t = this.terrain.get(cx, cy, budget);
      if (t) r.quad(t, 0, 0, 512, 512, cx * 512, cy * 512, 512, 512, WHITE);
      else r.quad(this.tex, A.white.x, A.white.y, 1, 1, cx * 512, cy * 512, 512, 512, pcol('g2'));
    }
    // 2) toplama + kesme
    const pad = 64;
    const ground = [], air = [], projs = [], cities = [];
    for (let i = 0; i < e.hi; i++) {
      const k = e.kind[i]; if (!k || (e.flags[i] & F.DEAD)) continue;
      const px = (e.px[i] + (e.x[i] - e.px[i]) * alpha) * TS, py = (e.py[i] + (e.y[i] - e.py[i]) * alpha) * TS;
      if (px < x0 - pad || px > x1 + pad || py < y0 - pad || py > y1 + pad * 2) continue;
      if (k === KIND.CITY) { cities.push(i); continue; }
      if (k === KIND.BUILDING) { if (BUILDINGS[e.def[i]].id === 'bridge') continue; if (!this.visibleTo(i) && !this.knownBuilding(i)) continue; ground.push([py + BUILDINGS[e.def[i]].size[1] * TS / 2, 0, i, px, py]); continue; }
      if (!this.visibleTo(i)) continue;
      if (k === KIND.AIR) air.push([i, px, py]);
      else if (k === KIND.PROJ) projs.push([i, px, py]);
      else ground.push([py, 1, i, px, py]);
    }
    for (const c of cities) {
      if (!this.spectator && e.owner[c] !== this.player && !this.sim.countries[this.player].known.has(c) && !this.visibleTo(c)) continue;
      const hp = e.hp[c] / e.maxhp[c];
      for (const [hx, hy, hh, big] of this.cityHouses(c)) ground.push([(hy + 1) * TS, 2, c, hx, hy, hh, big, hp]);
    }
    ground.sort((a, b) => a[0] - b[0]);
    // 3) gölgeler
    const dl = env.daylight;
    const shOn = dl > 0.15 && this.quality > 0;
    const sdx = (env.hour - 12.5) / 6 * 0.9, sdy = -0.45, slen = 0.35 + (1 - dl) * 0.5, sa = (0.32 * Math.min(1, dl * 2)) | 0;
    const shadowCol = rgba(0, 0, 0, Math.round(70 * Math.min(1, dl * 2)));
    if (shOn) for (const g of ground) {
      if (g[1] === 0) {
        const i = g[2]; const bd = BUILDINGS[e.def[i]]; const v = e.flags[i] & F.RUINED ? 2 : e.hp[i] < e.maxhp[i] * 0.5 ? 1 : 0;
        const f = A.get(`b:${bd.id}:${v}`); if (!f) continue;
        const bx = e.ox[i] * TS, by = e.oy[i] * TS + bd.size[1] * TS; const hgt = f.h * slen;
        r.quad4(this.tex, f.x, f.y, f.w, f.h, bx + sdx * hgt, by + sdy * hgt, bx + f.w + sdx * hgt, by + sdy * hgt, bx + f.w, by, bx, by, shadowCol);
      }
    }
    // 4) yer nesneleri
    let spr = 0;
    for (const g of ground) {
      if (g[1] === 0) { this.drawBuilding(g[2]); spr++; }
      else if (g[1] === 2) { this.drawHouse(g); spr++; }
      else { this.drawGroundUnit(g[2], g[3], g[4], shOn); spr++; }
    }
    // 5) mermiler ve hava birimleri
    for (const [i, px, py] of projs) this.drawProj(i, px, py, alpha);
    for (const [i, px, py] of air) this.drawAir(i, px, py, alpha, shOn);
    this.emitAmbient(dt, ground, air);
    // 6) parçacıklar
    this.drawParticles();
    // 7) ışık haritası
    if (dl < 0.97 && this.quality >= 0) this.drawLights(ground, air, projs, dl);
    // 8) savaş sisi
    if (!this.spectator) this.drawFog();
    // 9) katmanlar ve arayüz öğeleri (dünya uzayı)
    this.drawLayer();
    this.drawSelection(alpha);
    // 10) hava durumu (ekran uzayı)
    this.drawWeather(dt);
    r.end();
    this.stats.sprites = spr;
  }
  knownBuilding(i) { const co = this.sim.countries[this.player]; return co.known.has(i); }

  drawBuilding(i) {
    const e = this.sim.e, r = this.r, A = this.A; const bd = BUILDINGS[e.def[i]];
    const known = this.visibleTo(i); const kn = known ? null : this.sim.countries[this.player].known.get(i);
    const ruined = known ? e.flags[i] & F.RUINED : kn && kn.ruined;
    const v = ruined ? 2 : (known ? e.hp[i] / e.maxhp[i] : kn.hp) < 0.5 ? 1 : 0;
    const f = A.get(`b:${bd.id}:${v}`); if (!f) return;
    const bx = e.ox[i] * TS, by = e.oy[i] * TS - BUILD_TOP;
    const building = e.flags[i] & F.BUILDING;
    let col = WHITE;
    if (!known) col = rgba(150, 150, 165, 255); // eski istihbarat: soluk
    if (building) col = rgba(255, 255, 255, 110);
    // kapsam dışı (elektriksiz) binalar hafif koyu
    else if (known && e.owner[i] < 24 && !(e.flags[i] & F.POWERED) && bd.power < 0 && !ruined) col = rgba(185, 185, 195, 255);
    r.quad(this.tex, f.x, f.y, f.w, f.h, bx, by, f.w, f.h, col);
    const m = A.get(`b:${bd.id}:${v}:m`);
    if (m && e.owner[i] < 24) r.quad(this.tex, m.x, m.y, m.w, m.h, bx, by, m.w, m.h, teamCol(e.owner[i], building ? 110 : 255));
    if (bd.id === 'radar' && !ruined && f.meta && f.meta.dish) { // dönen radar çanağı
      const [dx, dy] = f.meta.dish; const on = known && (e.flags[i] & F.EMIT_ON) && (e.flags[i] & F.POWERED);
      const t = on ? this.time * 2 : 0; const w = Math.round(Math.abs(Math.cos(t)) * 9) + 1;
      r.quad(this.tex, A.white.x, A.white.y, 1, 1, bx + dx - w / 2, by + dy - 2, w, 4, pcol(on ? 'k6' : 'k4'));
      r.quad(this.tex, A.white.x, A.white.y, 1, 1, bx + dx - 0.5, by + dy + 2, 1, 4, pcol('k3'));
    }
    if (building) { // inşaat ilerleme çubuğu
      const p = e.prog[i] / (bd.time * (e.flags[i] & F.HARDENED ? 1.6 : 1));
      this.bar(bx, by + BUILD_TOP - 4, f.w, p, pcol('l0'));
    } else if (known && e.hp[i] < e.maxhp[i] && !ruined && this.cam.zoom >= 2) this.bar(bx, by + BUILD_TOP - 4, f.w, e.hp[i] / e.maxhp[i], pcol(e.hp[i] < e.maxhp[i] * 0.5 ? 'e2' : 'g4'));
    // uyarı ikonları: girdisiz fabrika (sarı ünlem), bağlantısız (kırmızı kesik)
    if (known && e.owner[i] === this.player && !building && !ruined && this.cam.zoom >= 2) {
      if ((e.mask[i] & C.FACTORY) && (e.flags[i] & F.JAMMED) && e.item[i]) this.icon('!', bx + f.w - 5, by + BUILD_TOP - 2, pcol('l0'));
      if (!(e.flags[i] & F.CONNECTED) && bd.id !== 'hq' && bd.cat !== 'none') this.icon('x', bx + 1, by + BUILD_TOP - 2, pcol('e2'));
    }
  }
  icon(kind, x, y, col) {
    const r = this.r, A = this.A;
    r.quad(this.tex, A.white.x, A.white.y, 1, 1, x - 1, y - 1, 5, 7, pcol('k0'));
    if (kind === '!') { r.quad(this.tex, A.white.x, A.white.y, 1, 1, x + 1, y, 1, 3, col); r.quad(this.tex, A.white.x, A.white.y, 1, 1, x + 1, y + 4, 1, 1, col); }
    else { r.quad(this.tex, A.white.x, A.white.y, 1, 1, x, y + 2, 3, 1, col); }
  }
  bar(x, y, w, p, col) {
    const r = this.r, A = this.A; p = Math.max(0, Math.min(1, p));
    r.quad(this.tex, A.white.x, A.white.y, 1, 1, x, y, w, 2, pcol('k0', 200));
    r.quad(this.tex, A.white.x, A.white.y, 1, 1, x, y, Math.max(1, w * p), 2, col);
  }
  drawHouse(g) {
    const r = this.r, A = this.A; const [, , c, hx, hy, hh, big, hp] = g;
    const e = this.sim.e; const x = hx * TS, y = hy * TS;
    const ruined = (hh >>> 9 & 255) / 255 > hp + 0.05;
    if (big) {
      const f = A.get('kb:' + [8, 10, 9][hh % 3]);
      r.quad(this.tex, f.x, f.y, 16, 16, x, y - 6, 16, 16, ruined ? rgba(90, 85, 80) : WHITE);
      r.quad(this.tex, f.x, f.y, 16, 16, x, y - 16, 16, 12, ruined ? rgba(0, 0, 0, 0) : rgba(230, 232, 240));
      return;
    }
    const wall = A.get('kt:' + (84 + (hh % 8))), roof = A.get('kt:' + ((hh >> 4) & 1 ? 63 : 67));
    if (ruined) { const d = A.get('kb:5'); r.quad(this.tex, d.x, d.y, 16, 16, x, y, 16, 16, rgba(120, 110, 100)); return; }
    r.quad(this.tex, wall.x, wall.y, 16, 16, x, y, 16, 16, WHITE);
    r.quad(this.tex, roof.x, roof.y, 16, 16, x, y - 12, 16, 16, WHITE);
    if (this.cam.zoom >= 3 && ((hh >> 6) & 7) === 0 && e.owner[c] < 24) r.quad(this.tex, A.white.x, A.white.y, 1, 1, x + 12, y - 9, 2, 2, teamCol(e.owner[c]));
  }
  drawGroundUnit(i, px, py, shOn) {
    const e = this.sim.e, r = this.r, A = this.A, u = UNITS[e.def[i]], o = e.owner[i];
    const z = this.cam.zoom; const kind = e.kind[i];
    if (kind === KIND.CONVOY) {
      const f = A.get('kb:' + (e.state[i] >= 1 ? 96 : 95)); const flip = e.vx[i] < 0;
      if (shOn) r.quad(this.tex, f.x, f.y, 16, 16, px - 6, py - 4, 12, 12, rgba(0, 0, 0, 60), flip);
      r.quad(this.tex, f.x, f.y, 16, 16, px - 7, py - 10, 14, 14, teamCol(o), flip);
      if (e.state[i] === 2 && z >= 2) this.icon('!', px + 5, py - 12, pcol('g5'));
      return;
    }
    if (z <= 1) { // stratejik zoom: NATO sembolü
      const hostile = o !== this.player && this.sim.atWar(this.player, o);
      const f = A.get(`sym:${SYM[u.id] || 'inf'}:${hostile ? 'h' : 'f'}`);
      r.quad(this.tex, f.x, f.y, f.w, f.h, px - 6, py - 5, f.w, f.h, teamCol(o));
      return;
    }
    let name = u.spr; const flip = e.vx[i] < -0.01;
    let f = A.get(name), m = A.get(name + ':m');
    if (!f) { f = A.get('kb:106'); m = null; }
    const w = (u.sz || 1) * 16;
    if (shOn) r.quad(this.tex, f.x, f.y, f.w, f.h, px - w / 2 + 2, py - w + 6, w, w - 2, rgba(0, 0, 0, 55), flip);
    if (name.startsWith('kb:')) r.quad(this.tex, f.x, f.y, f.w, f.h, px - w / 2, py - w + 3, w, w, teamCol(o), flip);
    else { r.quad(this.tex, f.x, f.y, f.w, f.h, px - w / 2, py - w + 3, w, w, WHITE, flip); if (m) r.quad(this.tex, m.x, m.y, m.w, m.h, px - w / 2, py - w + 3, w, w, teamCol(o), flip); }
    // tahkimat: kum torbası halkası
    if (e.entrench[i] > 0.3 && kind === KIND.GROUND) { const n = Math.round(e.entrench[i] * 6); for (let k = 0; k < n; k++) r.quad(this.tex, A.white.x, A.white.y, 1, 1, px - 7 + k * 2.4, py + 2, 2, 1, pcol('b4')); }
    if (z >= 2 && e.hp[i] < e.maxhp[i]) this.bar(px - 6, py - w + 1, 12, e.hp[i] / e.maxhp[i], pcol('g4'));
    if (z >= 3 && e.owner[i] === this.player && e.supply[i] < 0.3) this.icon('!', px + 6, py - w + 2, pcol('o1'));
    // sahiplik şekli (renk körü için): düşmanda kırmızı eşkenar dörtgen köşe
    if (o !== this.player && this.sim.atWar(this.player, o) && z >= 2) { r.quad(this.tex, A.white.x, A.white.y, 1, 1, px - 1, py + 3, 2, 2, pcol('e2')); }
  }
  drawAir(i, px, py, alpha, shOn) {
    const e = this.sim.e, r = this.r, A = this.A, u = UNITS[e.def[i]], o = e.owner[i];
    const zz = (e.pz[i] + (e.z[i] - e.pz[i]) * alpha) * 2;
    const gen = GEN_DIR[u.spr];
    const dir = ((Math.round(Math.atan2(e.vy[i], e.vx[i]) / (Math.PI * 2) * DIRS) % DIRS) + DIRS) % DIRS;
    let f, m, flip = false;
    if (gen) { f = A.get(`gen:${gen}:${dir}`); m = A.get(`gen:${gen}:${dir}:m`); }
    else { f = A.get(u.spr); flip = e.vx[i] < 0; }
    const s = u.sz === 2 ? 1 : 1; const w = f.w * s, h = f.h * s;
    if (shOn && e.kind[i] === KIND.AIR) r.quad(this.tex, f.x, f.y, f.w, f.h, px - w / 2 + zz * 0.35, py - h / 2 + zz * 0.25, w, h, rgba(0, 0, 0, 50), flip);
    const ty = py - zz;
    if (gen) { r.quad(this.tex, f.x, f.y, f.w, f.h, px - w / 2, ty - h / 2, w, h, WHITE); if (m) r.quad(this.tex, m.x, m.y, m.w, m.h, px - w / 2, ty - h / 2, w, h, teamCol(o)); }
    else r.quad(this.tex, f.x, f.y, f.w, f.h, px - w / 2, ty - h / 2, w, h, e.kind[i] === KIND.NAVAL ? teamCol(o) : teamCol(o), flip);
    // pervane titreşimi
    if (u.cls === CLS.DRONE && this.cam.zoom >= 3 && ((this.time * 30 + i) & 1)) r.quad(this.tex, A.white.x, A.white.y, 1, 1, px - 1, ty - 1, 2, 2, rgba(255, 255, 255, 120));
    // bağlantı kaybı / karıştırma göstergesi
    if ((e.flags[i] & (F.LINKLOST | F.JAMMED)) && o === this.player && this.cam.zoom >= 2) this.icon('x', px + 4, ty - 8, pcol('o1'));
    if (this.cam.zoom <= 1) { const hostile = o !== this.player; r.quad(this.tex, A.white.x, A.white.y, 1, 1, px - 1.5, ty - 1.5, 3, 3, hostile ? pcol('e2') : teamCol(o)); }
  }
  drawProj(i, px, py, alpha) {
    const e = this.sim.e, r = this.r, A = this.A, p = PROJS[e.def[i]];
    if (e.timer[i] <= 0) return;
    const zz = (e.pz[i] + (e.z[i] - e.pz[i]) * alpha) * 2;
    const vx = e.vx[i], vy = e.vy[i] - (p.arc ? (1 - 2 * e.prog[i]) * 0.4 : 0);
    const dir = ((Math.round(Math.atan2(vy, vx) / (Math.PI * 2) * DIRS) % DIRS) + DIRS) % DIRS;
    const nm = p.intercept ? 'intc' : p.id === 'cruise' || p.id === 'antiship' || p.id === 'arm' ? 'cruise' : p.id === 'ballistic' ? 'ballistic' : p.id === 'bomb' ? 'bomb' : 'rocket';
    const f = A.get(`gen:${nm}:${dir}`);
    r.quad(this.tex, f.x, f.y, f.w, f.h, px - f.w / 2, py - zz - f.h / 2, f.w, f.h, WHITE);
    // iz
    if (Math.random() < (this.quality + 1) / 3 && p.id !== 'bomb') this.parts.emit(PT.TRAIL, px - vx * 4, py - zz - vy * 4, 0, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0, p.intercept ? 0.5 : 0.9, 1.5, p.intercept ? pcol('k7', 200) : pcol('k6', 180));
    // gelen füze uyarı çizgisi (oyuncu toprağına)
    if (e.owner[i] !== this.player && !p.intercept && p.cls >= CLS.CRUISE) {
      const map = this.sim.map; const tx = e.tx[i] | 0, ty = e.ty[i] | 0;
      if (map.inb(tx, ty) && map.owner[map.idx(tx, ty)] === this.player) this.dashLine(px, py, e.tx[i] * TS, e.ty[i] * TS, pcol('e2', 200));
    }
  }
  line(x0, y0, x1, y1, w, col) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy) || 1; const nx = -dy / L * w / 2, ny = dx / L * w / 2;
    const A = this.A;
    this.r.quad4(this.tex, A.white.x, A.white.y, 1, 1, x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny, col);
  }
  dashLine(x0, y0, x1, y1, col, w) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy); const n = Math.min(80, Math.floor(L / 8));
    const lw = w || 1.5 / Math.max(1, this.cam.zoom / 2);
    for (let k = 0; k < n; k += 2) this.line(x0 + dx * k / n, y0 + dy * k / n, x0 + dx * (k + 1) / n, y0 + dy * (k + 1) / n, lw, col);
  }
  circle(x, y, rad, col, w, fill) {
    const n = Math.max(24, Math.min(96, (rad / 4) | 0)); const lw = w || 1.2;
    let px = x + rad, py = y;
    for (let k = 1; k <= n; k++) {
      const a = k / n * Math.PI * 2, nx = x + Math.cos(a) * rad, ny = y + Math.sin(a) * rad;
      if (fill) this.r.quad4(this.tex, this.A.white.x, this.A.white.y, 1, 1, x, y, px, py, nx, ny, x, y, fill);
      this.line(px, py, nx, ny, lw, col); px = nx; py = ny;
    }
  }
  emitAmbient(dt, ground, air) {
    const e = this.sim.e, P = this.parts, A = this.A, env = this.sim.env;
    const rate = dt * [0.6, 1, 1.6][this.quality];
    for (const g of ground) {
      if (g[1] !== 0) continue; const i = g[2];
      if (!this.visibleTo(i)) continue;
      const bd = BUILDINGS[e.def[i]]; const bx = e.ox[i] * TS, by = e.oy[i] * TS - BUILD_TOP;
      if (e.flags[i] & F.BURNING) {
        const W = bd.size[0] * TS, H = bd.size[1] * TS;
        if (Math.random() < rate * 6) P.emit(PT.SMOKE, bx + Math.random() * W, by + BUILD_TOP + Math.random() * H * 0.6, 4, env.windX * 4, -6, 6, 4 + Math.random() * 4, 3, Math.random() < 0.6 ? pcol('k1', 210) : pcol('k2', 200));
        if (Math.random() < rate * 10) P.emit(PT.FIRE, bx + Math.random() * W, by + BUILD_TOP + H * 0.3 + Math.random() * H * 0.5, 2, 0, -8, 4, 0.5 + Math.random() * 0.3, 1, WHITE);
      }
      if (!(e.flags[i] & F.RUINED) && (e.flags[i] & F.POWERED || bd.power > 0) && !(e.flags[i] & F.BUILDING)) {
        const f = A.get(`b:${bd.id}:0`); if (!f || !f.meta) continue;
        for (const s of f.meta.smoke) if (Math.random() < rate * (s[2] ? 3 : 2)) P.emit(s[2] ? PT.STEAM : PT.SMOKE, bx + s[0], by + s[1], 2, env.windX * 3, -8, 0, 3 + Math.random() * 3, 2, s[2] ? pcol('k7', 150) : pcol('k4', 170));
        for (const s of f.meta.flame) if (Math.random() < rate * 12) P.emit(PT.FIRE, bx + s[0], by + s[1], 0, 0, -6, 0, 0.35, 1, WHITE);
      }
    }
  }
  drawParticles() {
    const P = this.parts, d = P.d, r = this.r, A = this.A;
    const puff = [A.get('puff0'), A.get('puff1'), A.get('puff2'), A.get('puff3')], fire = [A.get('fire0'), A.get('fire1'), A.get('fire2')];
    const ring = A.get('ring'), flash = A.get('flash');
    for (let i = 0; i < P.n; i++) {
      const o = i * 13; const x = d[o], y = d[o + 1] - d[o + 2], life = d[o + 6] / d[o + 7], sz = d[o + 8], t = d[o + 9]; const col = P.col[i];
      switch (t) {
        case PT.SMOKE: case PT.STEAM: { const f = puff[Math.min(3, (sz / 2) | 0)]; const s = f.w * (0.6 + sz * 0.15); r.quad(this.tex, f.x, f.y, f.w, f.h, x - s / 2, y - s / 2, s, s, withAlpha(col, (col >>> 24) * Math.min(1, life * 1.5))); break; }
        case PT.FIRE: { const f = fire[(i + (this.time * 12 | 0)) % 3]; r.quad(this.tex, f.x, f.y, f.w, f.h, x - 2, y - 5, 5, 7, withAlpha(WHITE, 255 * Math.min(1, life * 2))); break; }
        case PT.SPARK: case PT.DEBRIS: case PT.SPLASH: case PT.TRAIL: { const s = t === PT.TRAIL ? 1 + (1 - life) * 2 : 1; const f = t === PT.TRAIL ? puff[0] : A.white; r.quad(this.tex, f.x, f.y, f.w, f.h, x - s / 2, y - s / 2, s, s, withAlpha(col, (col >>> 24) * Math.min(1, life * 1.4))); break; }
        case PT.FLASH: { const s = sz * (1.2 - life * 0.4); r.quad(this.tex, flash.x, flash.y, flash.w, flash.h, x - s / 2, y - s / 2, s, s, withAlpha(col, 255 * life)); break; }
        case PT.RING: { const s = sz * 2 + (1 - life) * sz * 5; r.quad(this.tex, ring.x, ring.y, ring.w, ring.h, x - s / 2, y - s / 2 * 0.7, s, s * 0.7, withAlpha(col, (col >>> 24) * life)); break; }
        case PT.TRACER: case PT.LASER: { const k = t === PT.LASER ? 1.6 : 0.8; this.line(x, y, P.x2[i], P.y2[i], k, withAlpha(col, 255 * life)); break; }
      }
    }
  }
  drawLights(ground, air, projs, dl) {
    const r = this.r, A = this.A, e = this.sim.e, soft = A.get('soft');
    const night = 1 - dl; const dusk = Math.max(0, 1 - Math.abs(dl - 0.45) * 3);
    const amb = [1 - night * 0.8 + dusk * 0.05, 1 - night * 0.78 - dusk * 0.05, 1 - night * 0.62 - dusk * 0.12];
    r.beginLights(amb[0], amb[1], amb[2]);
    const L = (x, y, rad, col) => r.quad(this.tex, soft.x, soft.y, soft.w, soft.h, x - rad, y - rad, rad * 2, rad * 2, col);
    const win = rgba(255, 200, 110, Math.round(200 * night)), lamp = rgba(255, 220, 150, Math.round(150 * night)), red = rgba(255, 60, 40, Math.round(220 * night)), blue = rgba(140, 190, 255, Math.round(220 * night));
    for (const g of ground) {
      if (g[1] === 0) {
        const i = g[2]; if (!this.visibleTo(i)) continue;
        const bd = BUILDINGS[e.def[i]]; const f = A.get(`b:${bd.id}:0`);
        const ruined = e.flags[i] & F.RUINED;
        const bx = e.ox[i] * TS, by = e.oy[i] * TS - BUILD_TOP;
        if (e.flags[i] & F.BURNING) L(bx + bd.size[0] * 8, by + BUILD_TOP + bd.size[1] * 8, 22 + bd.size[0] * 6, rgba(255, 120, 40, 200));
        if (ruined || !(e.flags[i] & F.POWERED) || !f || !f.meta) continue;
        for (const [lx, ly, k] of f.meta.lights) L(bx + lx, by + ly, k === 3 ? 14 : k === 2 ? 7 : 5, k === 2 ? (bd.id === 'airbase' ? blue : red) : k === 3 ? rgba(255, 140, 50, 220) : win);
      } else if (g[1] === 2) {
        const c = g[2]; if (!(e.flags[c] & F.POWERED)) continue; // elektriksiz şehir karanlık
        const [, , , hx, hy, hh, big] = g; const x = hx * TS + 8, y = hy * TS + 8;
        if (big) { L(x, y - 6, 14, win); continue; }
        if ((hh & 3) !== 0) L(x, y + 2, 7, win);
        if ((hh & 15) === 5) L(x + 8, y + 8, 16, lamp);
      }
    }
    for (const [i, px, py] of projs) { const zz = e.z[i] * 2; L(px, py - zz, 10, rgba(255, 170, 80, 220)); }
    for (const [i, px, py] of air) if (((this.time * 2 + i) | 0) % 2) L(px, py - e.z[i] * 2, 4, red);
    // parçacık ışıkları
    const P = this.parts, d = P.d;
    for (let k = 0; k < P.n; k++) {
      const o = k * 13, t = d[o + 9]; const life = d[o + 6] / d[o + 7];
      if (t === PT.FLASH) L(d[o], d[o + 1] - d[o + 2], d[o + 8] * 4, rgba(255, 200, 120, 255 * life));
      else if (t === PT.FIRE && (k & 3) === 0) L(d[o], d[o + 1] - d[o + 2], 12, rgba(255, 130, 50, 140 * life));
      else if (t === PT.LASER) L(d[o], d[o + 1], 10, rgba(140, 220, 255, 255 * life));
    }
    r.endLights();
  }
  drawFog() {
    const sim = this.sim, co = sim.countries[this.player], r = this.r;
    if (!this.fogImg || this.fogImg.width !== co.vw) { this.fogImg = new ImageData(co.vw, co.vh); this.fogTex = null; }
    if (this.fogTick !== sim.tick - (sim.tick % 5) || !this.fogTex) {
      this.fogTick = sim.tick - (sim.tick % 5);
      const d = this.fogImg.data, tq = sim.tick / 10;
      for (let k = 0; k < co.vis.length; k++) {
        let a;
        if (co.visNow[k]) a = 0; else if (!co.vis[k]) a = 215; else { const age = tq - (co.vis[k] - 1); a = Math.min(165, 70 + age * 0.15); }
        d[k * 4] = 12; d[k * 4 + 1] = 16; d[k * 4 + 2] = 28; d[k * 4 + 3] = a;
      }
      if (!this.fogTex) this.fogTex = r.createTexture(this.fogImg, true); else r.updateTexture(this.fogTex, this.fogImg);
      if (r.kind !== 'webgl2') { const c = this.fogCv || (this.fogCv = document.createElement('canvas')); c.width = co.vw; c.height = co.vh; c.getContext('2d').putImageData(this.fogImg, 0, 0); r.updateTexture(this.fogTex, c); }
    }
    const W = co.vw * VIS_CELL * TS, H = co.vh * VIS_CELL * TS;
    r.quad(this.fogTex, 0, 0, co.vw, co.vh, 0, 0, W, H, WHITE);
  }
  drawLayer() {
    const L = this.layer; if (L === 'normal') return;
    const sim = this.sim, e = sim.e, map = sim.map; const p = this.player;
    const mine = (o) => this.spectator || o === p;
    const seg = (arr, colFn, w) => { for (let k = 0; k < arr.length; k += 5) { const o = arr[k + 4] & 0xff; if (!mine(o)) continue; this.line(arr[k] * TS, arr[k + 1] * TS, arr[k + 2] * TS, arr[k + 3] * TS, (arr[k + 4] & 0x100 ? 0.6 : 1) * w, colFn(arr[k + 4])); } };
    if (L === 'power') {
      seg(sim.net.power, (v) => v & 0x100 ? pcol('l0', 140) : pcol('l0', 230), 1.5);
      e.each(C.BUILDING, (i) => { if (!mine(e.owner[i])) return; const bd = BUILDINGS[e.def[i]]; if (!bd.power && bd.id !== 'substation') return; const ok = e.flags[i] & F.POWERED; this.ringMark(e.x[i] * TS, e.y[i] * TS, bd.power > 0 ? pcol('g5') : ok ? pcol('l0') : pcol('e2')); });
      e.each(C.CITY, (i) => { if (!mine(e.owner[i])) return; this.ringMark(e.x[i] * TS, e.y[i] * TS, e.flags[i] & F.POWERED ? pcol('l0') : pcol('e2'), 6); });
    } else if (L === 'logistics') {
      seg(sim.net.fuel, () => pcol('k1', 220), 2);
      e.each(C.CONVOY, (i) => { if (!mine(e.owner[i])) return; const rt = e.routes.get(i); if (!rt) return; let px = e.x[i] * TS, py = e.y[i] * TS; for (let k = e.wp[i]; k < rt.length; k += 3) { const nx = (rt[k] % map.W + 0.5) * TS, ny = (((rt[k] / map.W) | 0) + 0.5) * TS; this.line(px, py, nx, ny, 1, pcol('g5', 160)); px = nx; py = ny; } });
      e.each(C.DEPOT, (i) => { if (!mine(e.owner[i])) return; this.circle(e.x[i] * TS, e.y[i] * TS, 18 * sim.mod(e.owner[i], 'supplyRange', 1) * TS, pcol('g5', 120), 1); });
      seg(sim.net.comms || [], () => pcol('w5', 160), 1);
    } else if (L === 'airdef') {
      const co = sim.countries[p];
      e.each(C.AD, (i) => { if (!mine(e.owner[i]) && !this.visibleTo(i)) return; const sys = AD_SYS[e.kind[i] === KIND.BUILDING ? BUILDINGS[e.def[i]].ad : UNITS[e.def[i]].ad]; const fr = mine(e.owner[i]); this.circle(e.x[i] * TS, e.y[i] * TS, sys.range * TS, fr ? pcol('u2', 200) : pcol('e2', 200), 1.2, fr ? pcol('u2', 22) : pcol('e2', 22)); });
      e.each(C.RADAR, (i) => { if (!mine(e.owner[i])) return; const on = e.flags[i] & F.EMIT_ON; this.circle(e.x[i] * TS, e.y[i] * TS, BUILDINGS[e.def[i]].radar * sim.mod(e.owner[i], 'radarRange', 1) * TS, on ? pcol('g5', 160) : pcol('k4', 120), 1); });
      if (!this.spectator) for (const [id, k] of co.known) { if (k.kind !== KIND.BUILDING && k.kind !== KIND.GROUND) continue; const sys = k.kind === KIND.BUILDING ? (BUILDINGS[k.def].ad && AD_SYS[BUILDINGS[k.def].ad]) : (UNITS[k.def] && UNITS[k.def].ad && AD_SYS[UNITS[k.def].ad]); if (!sys || k.ruined || !sim.atWar(p, k.owner)) continue; this.circle(k.x * TS, k.y * TS, sys.range * TS, pcol('e2', 150), 1, pcol('e2', 18)); }
    } else if (L === 'ew') {
      e.each(C.JAMMER, (i) => { if (!mine(e.owner[i]) && !this.visibleTo(i)) return; const rr = e.kind[i] === KIND.BUILDING ? BUILDINGS[e.def[i]].jam : UNITS[e.def[i]].jam; const on = e.flags[i] & F.EMIT_ON; this.circle(e.x[i] * TS, e.y[i] * TS, rr * TS, on ? pcol('t4', 200) : pcol('k4', 120), 1.2, on ? pcol('t4', 30) : 0); });
      e.each(C.BASE, (i) => { if (!mine(e.owner[i])) return; const bd = BUILDINGS[e.def[i]]; if (bd.control) this.circle(e.x[i] * TS, e.y[i] * TS, bd.control * TS, pcol('g5', 140), 1); });
      e.each(C.SIGINT, (i) => { if (!mine(e.owner[i])) return; const rr = e.kind[i] === KIND.BUILDING ? BUILDINGS[e.def[i]].sigint : UNITS[e.def[i]].sigint; this.circle(e.x[i] * TS, e.y[i] * TS, rr * TS, pcol('w5', 90), 1); });
      if (!this.spectator) for (const [, v] of sim.countries[p].emitters) { const x = v.x * TS, y = v.y * TS, age = (sim.tick - v.t) / 600; this.circle(x, y, 10 + age * 20, pcol('t4', 220 * (1 - age)), 1.5); this.ringMark(x, y, pcol('t4')); }
    } else if (L === 'resources') {
      const { x0, y0, x1, y1 } = this.view; const RC = ['', 'f2', 'k1', 'k0', 'n1', 'o1', 'g5', 'u2'];
      for (let ty = Math.max(0, (y0 / TS) | 0); ty < Math.min(map.H, y1 / TS); ty++) for (let tx = Math.max(0, (x0 / TS) | 0); tx < Math.min(map.W, x1 / TS); tx++) {
        const rr = map.res[ty * map.W + tx]; if (!rr) continue;
        this.r.quad(this.tex, this.A.white.x, this.A.white.y, 1, 1, tx * TS + 3, ty * TS + 3, 10, 10, pcol(RC[rr], 170));
      }
    } else if (L === 'front') {
      e.each(C.GROUND, (i) => { if (!this.visibleTo(i)) return; const rt = e.routes.get(i); if (rt && mine(e.owner[i])) this.dashLine(e.x[i] * TS, e.y[i] * TS, e.tx[i] * TS, e.ty[i] * TS, pcol('l0', 200)); });
    }
  }
  ringMark(x, y, col, s = 4) { const A = this.A; this.r.quad(this.tex, A.white.x, A.white.y, 1, 1, x - s / 2, y - s / 2, s, s, col); }
  drawSelection(alpha) {
    const e = this.sim.e, A = this.A, r = this.r;
    for (const i of this.sel) {
      if (!e.alive(i)) { this.sel.delete(i); continue; }
      const px = (e.px[i] + (e.x[i] - e.px[i]) * alpha) * TS, py = (e.py[i] + (e.y[i] - e.py[i]) * alpha) * TS;
      if (e.kind[i] === KIND.BUILDING) {
        const bd = BUILDINGS[e.def[i]]; const x = e.ox[i] * TS, y = e.oy[i] * TS, w = bd.size[0] * TS, h = bd.size[1] * TS;
        this.corners(x - 1, y - 1, w + 2, h + 2, pcol('k7'));
        if (bd.id === 'drone_base') this.circle(e.x[i] * TS, e.y[i] * TS, bd.control * TS, pcol('g5', 160), 1);
        if (LAUNCHERS[bd.id]) for (const rr of new Set(Object.values(LAUNCHERS[bd.id]))) this.circle(e.x[i] * TS, e.y[i] * TS, rr * TS, pcol('o1', 120), 1);
      } else {
        const zz = e.kind[i] === KIND.AIR ? e.z[i] * 2 : 0;
        this.corners(px - 7, py - 12 - zz, 14, 14, pcol('k7'));
        const rt = e.routes.get(i);
        if (rt && e.kind[i] === KIND.AIR) { let x = px, y = py - zz; for (let k = e.wp[i] * 2; k < rt.length; k += 2) { this.dashLine(x, y, rt[k] * TS, rt[k + 1] * TS, pcol('l1', 180)); x = rt[k] * TS; y = rt[k + 1] * TS; } }
        else if (rt) this.dashLine(px, py, e.tx[i] * TS, e.ty[i] * TS, pcol('l1', 180));
        const u = UNITS[e.def[i]]; if (u.role === 'mlrs') this.circle(px, py, LAUNCHERS.mlrs.rocket * TS, pcol('o1', 110), 1);
        if (u.ad) this.circle(px, py, AD_SYS[u.ad].range * TS, pcol('u2', 110), 1);
      }
    }
    if (this.routeDraft && this.routeDraft.length >= 4) { const d = this.routeDraft; for (let k = 2; k < d.length; k += 2) this.line(d[k - 2] * TS, d[k - 1] * TS, d[k] * TS, d[k + 1] * TS, 1.5, pcol('l0', 220)); for (let k = 0; k < d.length; k += 2) this.ringMark(d[k] * TS, d[k + 1] * TS, pcol('l1'), 3); }
    if (this.targetMarker) { const [x, y] = this.targetMarker; const s = 6 + Math.sin(this.time * 8) * 2; this.circle(x * TS, y * TS, s, pcol('e2'), 1.5); }
    if (this.areaSel) { const [ax, ay, bx, by] = this.areaSel; this.corners(Math.min(ax, bx) * TS, Math.min(ay, by) * TS, Math.abs(bx - ax) * TS, Math.abs(by - ay) * TS, pcol('l1')); }
    if (this.ghost) {
      const g = this.ghost; const bd = BUILDINGS[g.def]; const f = this.A.get(`b:${bd.id}:0`);
      const x = g.x * TS, y = g.y * TS; r.quad(this.tex, f.x, f.y, f.w, f.h, x, y - BUILD_TOP, f.w, f.h, rgba(255, 255, 255, 150));
      r.quad(this.tex, A.white.x, A.white.y, 1, 1, x, y, bd.size[0] * TS, bd.size[1] * TS, g.ok ? pcol('g5', 70) : pcol('e2', 90));
      this.corners(x, y, bd.size[0] * TS, bd.size[1] * TS, g.ok ? pcol('g5') : pcol('e2'));
      if (bd.power > 0 || bd.id === 'substation') this.circle(x + bd.size[0] * 8, y + bd.size[1] * 8, 14 * TS, pcol('l0', 120), 1);
      if (bd.radar) this.circle(x + bd.size[0] * 8, y + bd.size[1] * 8, bd.radar * TS, pcol('g5', 120), 1);
      if (bd.ad) this.circle(x + bd.size[0] * 8, y + bd.size[1] * 8, AD_SYS[bd.ad].range * TS, pcol('u2', 120), 1);
      if (bd.control) this.circle(x + bd.size[0] * 8, y + bd.size[1] * 8, bd.control * TS, pcol('g5', 120), 1);
      if (bd.jam) this.circle(x + bd.size[0] * 8, y + bd.size[1] * 8, bd.jam * TS, pcol('t4', 120), 1);
    }
  }
  corners(x, y, w, h, col) {
    const A = this.A, r = this.r, L = Math.max(3, Math.min(w, h) / 4), t = Math.max(1, 2 / this.cam.zoom * 1.5);
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      r.quad(this.tex, A.white.x, A.white.y, 1, 1, sx > 0 ? cx : cx - L, sy > 0 ? cy : cy - t, L, t, col);
      r.quad(this.tex, A.white.x, A.white.y, 1, 1, sx > 0 ? cx : cx - t, sy > 0 ? cy : cy - L, t, L, col);
    }
  }
  drawWeather(dt) {
    const env = this.sim.env, r = this.r, A = this.A; const w = env.weather;
    r.screenSpace();
    const W = r.W, H = r.H;
    if (w === 'fog') r.quad(this.tex, A.white.x, A.white.y, 1, 1, 0, 0, W, H, rgba(200, 205, 215, Math.round(85 * env.intensity + 30)));
    if (w === 'storm' || w === 'rain') r.quad(this.tex, A.white.x, A.white.y, 1, 1, 0, 0, W, H, rgba(30, 40, 60, 40));
    if (w === 'storm' && Math.random() < dt * 0.25) this.lightning = 0.25;
    if (this.lightning > 0) { this.lightning -= dt; r.quad(this.tex, A.white.x, A.white.y, 1, 1, 0, 0, W, H, rgba(230, 235, 255, Math.round(this.lightning * 400))); }
    if (w === 'rain' || w === 'storm' || w === 'snow') {
      const n = Math.round([200, 450, 800][this.quality] * (0.5 + env.intensity * 0.5));
      const snow = w === 'snow'; const P = this.parts; const s = Math.max(1, Math.round(W / 400));
      for (let k = 0; k < n; k++) {
        if (!P.ws[k]) { P.wx[k] = Math.random() * W; P.wy[k] = Math.random() * H; P.ws[k] = 0.5 + Math.random(); }
        const sp = (snow ? 60 : 700) * P.ws[k] * s * dt;
        P.wx[k] += (env.windX * (snow ? 60 : 200) * s) * dt + (snow ? Math.sin(this.time * 2 + k) * 0.5 : 0); P.wy[k] += sp;
        if (P.wy[k] > H) { P.wy[k] -= H; P.wx[k] = Math.random() * W; } if (P.wx[k] < 0) P.wx[k] += W; if (P.wx[k] > W) P.wx[k] -= W;
        if (snow) r.quad(this.tex, A.white.x, A.white.y, 1, 1, P.wx[k], P.wy[k], s * 2, s * 2, rgba(240, 245, 255, 210));
        else this.line(P.wx[k], P.wy[k], P.wx[k] + env.windX * 6 * s, P.wy[k] + 10 * s, s, rgba(170, 190, 230, 120));
      }
    }
    r.worldSpace();
  }
}
