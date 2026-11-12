// Map Renderer: kamera, katmanlar, animasyonlar, seçim/pick, mini harita (UI'dan ayrı, sadece okur)
import { W, H, N, TS, clamp, hash2, shade, hexToRgb, dist } from './util.js';
import { T, UNITS, RES } from './data.js';
import { buildTerrain } from './terrain.js';
import { unitSprite, citySprite } from './sprites.js';
import { flagCanvas, iconCanvas } from './icons.js';
import { popTier } from './economy.js';
import { findPath } from './path.js';
import { count, armySpeed } from './military.js';
import { atWar, hasTrade, cityAt } from './state.js';

const PW = W * TS, PH = H * TS;
const DEP_COL = { 1: '#aab4c6', 2: '#3a3a44', 3: '#7a5ac8', 4: '#f5c93a', 6: '#e6e0cc' };

export class MapRenderer {
  constructor(canvas) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.cam = { x: PW / 2, y: PH / 2, z: 0.8, tx: PW / 2, ty: PH / 2, tz: 0.8 };
    this.vel = { x: 0, y: 0 };
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.terrain = null; this.pol = null; this.polVer = -1; this.hlCache = null; this.parts = []; this.lastFx = 0; this.texts = [];
    this.routes = new Map(); this.labels = []; this.vw = 800; this.vh = 600; this.mini = null; this.depIcons = null;
    this.t0 = performance.now(); this.hover = -1; this.world = null;
  }
  async init(world, progress) {
    this.world = world; this.terrain = await buildTerrain(world, progress);
    this.depList = []; for (let i = 0; i < N; i++) if (world.deposit[i]) this.depList.push(i);
    this.resize(); this.fitAll(true);
  }
  resize() {
    const r = this.cv.getBoundingClientRect(); this.vw = Math.max(200, r.width); this.vh = Math.max(200, r.height);
    this.cv.width = Math.round(this.vw * this.dpr); this.cv.height = Math.round(this.vh * this.dpr);
    this.minZ = Math.max(this.vw / PW, this.vh / PH) * 0.98; this.maxZ = 6;
    this.cam.tz = clamp(this.cam.tz, this.minZ, this.maxZ); this.cam.z = clamp(this.cam.z, this.minZ, this.maxZ);
  }
  fitAll(snap) { this.cam.tz = Math.max(this.vw / PW, this.vh / PH) * 1.02; this.cam.tx = PW / 2; this.cam.ty = PH / 2; if (snap) { this.cam.z = this.cam.tz; this.cam.x = PW / 2; this.cam.y = PH / 2; } }
  focusTile(t, zoom) { this.cam.tx = (t % W) * TS + TS / 2; this.cam.ty = ((t / W) | 0) * TS + TS / 2; if (zoom) this.cam.tz = clamp(zoom, this.minZ, this.maxZ); }
  // koordinat dönüşümü
  s2w(sx, sy) { return [(sx - this.vw / 2) / this.cam.z + this.cam.x, (sy - this.vh / 2) / this.cam.z + this.cam.y]; }
  w2s(wx, wy) { return [(wx - this.cam.x) * this.cam.z + this.vw / 2, (wy - this.cam.y) * this.cam.z + this.vh / 2]; }
  pan(dxs, dys) { this.cam.tx -= dxs / this.cam.z; this.cam.ty -= dys / this.cam.z; this.cam.x = this.cam.tx; this.cam.y = this.cam.ty; this.clampCam(); }
  zoomAt(sx, sy, f) {
    const [wx, wy] = this.s2w(sx, sy); const nz = clamp(this.cam.tz * f, this.minZ, this.maxZ);
    this.cam.tz = nz; this.cam.z = nz; this.cam.x = wx - (sx - this.vw / 2) / nz; this.cam.y = wy - (sy - this.vh / 2) / nz; this.cam.tx = this.cam.x; this.cam.ty = this.cam.y; this.clampCam();
  }
  clampCam() {
    const hw = this.vw / this.cam.z / 2, hh = this.vh / this.cam.z / 2;
    const cl = (v, h, size) => (h * 2 >= size ? size / 2 : clamp(v, h - 40, size - h + 40));
    this.cam.x = cl(this.cam.x, hw, PW); this.cam.y = cl(this.cam.y, hh, PH); this.cam.tx = cl(this.cam.tx, hw, PW); this.cam.ty = cl(this.cam.ty, hh, PH);
  }
  tileAt(sx, sy) { const [wx, wy] = this.s2w(sx, sy); const x = Math.floor(wx / TS), y = Math.floor(wy / TS); return x < 0 || y < 0 || x >= W || y >= H ? -1 : y * W + x; }

  // ---- siyasi katman
  buildPolitical(S) {
    if (!this.pol) { this.pol = document.createElement('canvas'); this.pol.width = PW; this.pol.height = PH; }
    const x = this.pol.getContext('2d'); x.clearRect(0, 0, PW, PH);
    const g = S.ownerGrid, Wd = S.W, prov = Wd.prov;
    const col = S.nations.map((n) => hexToRgb(n.col));
    for (let i = 0; i < N; i++) {
      const o = g[i]; if (o < 0) continue; const px = (i % W) * TS, py = ((i / W) | 0) * TS; const c = col[o];
      x.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.34)`; x.fillRect(px, py, TS, TS);
    }
    const edge = (px, py, dir, w, color) => { // 4'er piksellik dalgalı kenar
      x.fillStyle = color;
      for (let k = 0; k < 4; k++) {
        const off = Math.round((hash2(px + k, py + dir, 5) - 0.5) * 2);
        if (dir === 0) x.fillRect(px + k * 4, py + off + (w > 1 ? 0 : 0), 4, w); else if (dir === 1) x.fillRect(px + k * 4, py + TS - w + off, 4, w);
        else if (dir === 2) x.fillRect(px + off, py + k * 4, w, 4); else x.fillRect(px + TS - w + off, py + k * 4, w, 4);
      }
    };
    for (let i = 0; i < N; i++) {
      const o = g[i]; if (o < 0) continue; const X = i % W, Y = (i / W) | 0, px = X * TS, py = Y * TS;
      const dk = shade(S.nations[o].col, -0.45);
      const nb = [[X, Y - 1, 0], [X, Y + 1, 1], [X - 1, Y, 2], [X + 1, Y, 3]];
      for (const [nx, ny, dir] of nb) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; const q = g[j];
        if (Wd.terr[j] <= T.LAKE) { edge(px, py, dir, 1, 'rgba(10,20,40,.35)'); continue; }
        if (q !== o) edge(px, py, dir, 2, dk);
        else if (prov[j] !== prov[i] && (dir === 1 || dir === 3)) edge(px, py, dir, 1, 'rgba(255,255,255,.22)');
      }
    }
    this.polVer = S.ownerVer;
    // etiket konumları
    const acc = S.nations.map(() => ({ x: 0, y: 0, n: 0, minx: 999, maxx: 0 }));
    for (let i = 0; i < N; i++) { const o = g[i]; if (o < 0) continue; const a = acc[o]; a.x += i % W; a.y += (i / W) | 0; a.n++; a.minx = Math.min(a.minx, i % W); a.maxx = Math.max(a.maxx, i % W); }
    this.labels = acc.map((a, k) => (a.n ? { id: k, x: (a.x / a.n) * TS + 8, y: (a.y / a.n) * TS + 8, n: a.n, w: (a.maxx - a.minx + 1) * TS } : null));
    this.hlCache = null;
    this.updateMini(S, true);
  }
  highlight(S, nid) {
    if (this.hlCache && this.hlCache.id === nid && this.hlCache.ver === S.ownerVer) return this.hlCache.cv;
    const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH; const x = cv.getContext('2d'); const g = S.ownerGrid;
    x.fillStyle = 'rgba(255,255,255,.16)';
    for (let i = 0; i < N; i++) if (g[i] === nid) x.fillRect((i % W) * TS, ((i / W) | 0) * TS, TS, TS);
    x.fillStyle = '#fff';
    for (let i = 0; i < N; i++) if (g[i] === nid) {
      const X = i % W, Y = (i / W) | 0;
      if (Y === 0 || g[i - W] !== nid) x.fillRect(X * TS, Y * TS, TS, 3); if (Y === H - 1 || g[i + W] !== nid) x.fillRect(X * TS, Y * TS + TS - 3, TS, 3);
      if (X === 0 || g[i - 1] !== nid) x.fillRect(X * TS, Y * TS, 3, TS); if (X === W - 1 || g[i + 1] !== nid) x.fillRect(X * TS + TS - 3, Y * TS, 3, TS);
    }
    this.hlCache = { id: nid, ver: S.ownerVer, cv }; return cv;
  }

  // ---- mini harita
  updateMini(S, force) {
    if (!this.mini) return; const m = this.mini, x = m.getContext('2d'); const w = m.width, h = m.height;
    x.imageSmoothingEnabled = true;
    x.drawImage(this.terrain.canvas, 0, 0, w, h);
    if (this.pol) { x.globalAlpha = 0.75; x.drawImage(this.pol, 0, 0, w, h); x.globalAlpha = 1; }
    this.miniBase = x.getImageData(0, 0, w, h);
  }
  drawMini(S, player) {
    if (!this.mini || !this.miniBase) return; const m = this.mini, x = m.getContext('2d'); const w = m.width, h = m.height;
    x.putImageData(this.miniBase, 0, 0);
    for (const a of S.armies) { x.fillStyle = a.owner === player ? '#fff' : S.nations[a.owner].col; x.fillRect(Math.round((a.tile % W) / W * w), Math.round(((a.tile / W) | 0) / H * h), 2, 2); }
    for (const c of S.cities) { x.fillStyle = '#10141c'; x.fillRect(Math.round(c.x / W * w) - 1, Math.round(c.y / H * h) - 1, 3, 3); x.fillStyle = S.nations[c.owner].col; x.fillRect(Math.round(c.x / W * w), Math.round(c.y / H * h), 2, 2); }
    const hw = this.vw / this.cam.z, hh = this.vh / this.cam.z;
    x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.strokeRect((this.cam.x - hw / 2) / PW * w, (this.cam.y - hh / 2) / PH * h, hw / PW * w, hh / PH * h);
  }

  // ---- parçacıklar
  spawnFx(S) {
    for (const f of S.fx) {
      if (f.n <= this.lastFx) continue; this.lastFx = f.n; const x = (f.tile % W) * TS + 8, y = ((f.tile / W) | 0) * TS + 8;
      if (f.k === 'hit') for (let i = 0; i < 5; i++) this.parts.push({ k: 'spark', x: x + (Math.random() - 0.5) * 12, y: y + (Math.random() - 0.5) * 12, vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 0.8, life: 1, c: Math.random() > 0.5 ? '#ffd24a' : '#ff8a30' });
      else if (f.k === 'bomb' || f.k === 'air') { this.parts.push({ k: 'boom', x, y, life: 1, r: 4 }); this.parts.push({ k: 'smoke', x, y, vx: 0, vy: -0.25, life: 1.4, r: 4 }); }
      else if (f.k === 'capture') this.parts.push({ k: 'ring', x, y, life: 1.6, r: 6 });
    }
  }
  stepFx(dt) {
    for (const p of this.parts) { p.life -= dt * 0.9; if (p.vx !== undefined) { p.x += p.vx; p.y += p.vy; } if (p.k === 'smoke') p.r += dt * 6; if (p.k === 'boom') p.r += dt * 22; if (p.k === 'ring') p.r += dt * 26; }
    this.parts = this.parts.filter((p) => p.life > 0); if (this.parts.length > 400) this.parts.splice(0, 100);
  }

  // ---- ticaret rotaları (veriye bağlı)
  routeFor(S, a, b) {
    const key = a + '_' + b; const hit = this.routes.get(key); if (hit && hit.ver === S.ownerVer) return hit.r;
    const ca = S.cities[S.nations[a].capital], cb = S.cities[S.nations[b].capital]; if (!ca || !cb) return null;
    let r = null; const Wd = S.W;
    const landCost = (f, t) => { const tt = Wd.terr[t]; if (tt <= T.LAKE) return -1; return Wd.road[t] ? 0.4 : tt === T.MOUNTAIN ? 6 : 1; };
    let p = ca.land === cb.land ? findPath(ca.t, cb.t, landCost, 0.4, 12000) : null; let kind = 'land';
    if (!p) { // deniz: en yakın limanlar
      const pa = S.cities.filter((c) => c.owner === a && c.portTile >= 0 && c.bld.port > 0).sort((x, y) => dist(x.t, cb.t) - dist(y.t, cb.t))[0];
      const pb = S.cities.filter((c) => c.owner === b && c.portTile >= 0 && c.bld.port > 0).sort((x, y) => dist(x.t, ca.t) - dist(y.t, ca.t))[0];
      if (pa && pb) { p = findPath(pa.portTile, pb.portTile, (f, t) => (Wd.terr[t] <= T.SEA ? 1 : -1), 0.9, 15000); kind = 'sea'; if (p) p.unshift(pa.portTile); }
    } else p.unshift(ca.t);
    if (p) { const pts = p.map((t) => [(t % W) * TS + 8, ((t / W) | 0) * TS + 8]); let len = 0; const cum = [0]; for (let i = 1; i < pts.length; i++) { len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(len); } r = { pts, len, cum, kind }; }
    this.routes.set(key, { ver: S.ownerVer, r }); return r;
  }
  at(route, d) { // d: 0..len
    const { pts, cum } = route; let lo = 0, hi = cum.length - 1; while (lo < hi - 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; }
    const s = (d - cum[lo]) / Math.max(0.0001, cum[hi] - cum[lo]); return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * s, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * s, pts[hi][0] - pts[lo][0]];
  }

  // ---- pick
  pickArmy(S, sx, sy, pref) {
    const [wx, wy] = this.s2w(sx, sy); const sc = this.unitScale(); let best = null, bd = 1e9;
    for (const a of S.armies) { const [x, y] = this.armyPos(S, a); const d = Math.hypot(x - wx, y - wy); const r = 9 * sc * (a.type === 'air' ? 1.1 : 1); if (d < r && d - (a.owner === pref ? 3 : 0) < bd) { bd = d; best = a; } }
    return best;
  }
  pickCity(S, sx, sy) {
    const [wx, wy] = this.s2w(sx, sy); let best = null, bd = 1e9; const rad = Math.max(12, 14 / this.cam.z * 1.2);
    for (const c of S.cities) { const d = Math.hypot(c.x * TS + 8 - wx, c.y * TS + 6 - wy); if (d < rad && d < bd) { bd = d; best = c; } }
    return best;
  }
  armiesInBox(S, x0, y0, x1, y1, owner) {
    const [a, b] = this.s2w(Math.min(x0, x1), Math.min(y0, y1)), [c, d] = this.s2w(Math.max(x0, x1), Math.max(y0, y1));
    return S.armies.filter((u) => { if (u.owner !== owner) return false; const [x, y] = this.armyPos(S, u); return x >= a && x <= c && y >= b && y <= d; });
  }
  unitScale() { return clamp(1.1 / this.cam.z, 1, 2.6); }
  armyPos(S, a) {
    if (a.type === 'air' && a.x !== undefined) return [a.x * TS + 8, a.y * TS + 8];
    const x = (a.tile % W) * TS + 8, y = ((a.tile / W) | 0) * TS + 8;
    if (a.path && a.path.length && a.prog > 0) { const n = a.path[0]; return [x + ((n % W) * TS + 8 - x) * a.prog, y + (((n / W) | 0) * TS + 8 - y) * a.prog]; }
    return [x, y];
  }

  // ---- ana çizim
  draw(S, v) {
    const ctx = this.ctx, cam = this.cam, time = (performance.now() - this.t0) / 1000;
    // yumuşak kamera
    if (cam.x !== cam.tx || cam.y !== cam.ty || cam.z !== cam.tz) {
      const k = 0.2; cam.x += (cam.tx - cam.x) * k; cam.y += (cam.ty - cam.y) * k; cam.z += (cam.tz - cam.z) * k;
      if (Math.abs(cam.x - cam.tx) < 0.2 && Math.abs(cam.y - cam.ty) < 0.2 && Math.abs(cam.z - cam.tz) < 0.0005) { cam.x = cam.tx; cam.y = cam.ty; cam.z = cam.tz; }
    }
    if (Math.abs(this.vel.x) + Math.abs(this.vel.y) > 0.3) { this.pan(this.vel.x, this.vel.y); this.vel.x *= 0.92; this.vel.y *= 0.92; } else { this.vel.x = this.vel.y = 0; }
    if (!this.terrain) return;
    if (this.polVer !== S.ownerVer) this.buildPolitical(S);
    this.spawnFx(S); this.stepFx(1 / 60);
    const z = cam.z, dpr = this.dpr, vw = this.vw, vh = this.vh;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#10243e'; ctx.fillRect(0, 0, this.cv.width, this.cv.height);
    ctx.setTransform(z * dpr, 0, 0, z * dpr, (vw / 2 - cam.x * z) * dpr, (vh / 2 - cam.y * z) * dpr);
    ctx.imageSmoothingEnabled = false;
    const x0 = Math.max(0, cam.x - vw / 2 / z), y0 = Math.max(0, cam.y - vh / 2 / z), x1 = Math.min(PW, cam.x + vw / 2 / z), y1 = Math.min(PH, cam.y + vh / 2 / z);
    const sw = x1 - x0, sh = y1 - y0; if (sw <= 0 || sh <= 0) return;
    const sx0 = Math.floor(x0), sy0 = Math.floor(y0), sw2 = Math.ceil(sw) + 1, sh2 = Math.ceil(sh) + 1;
    const cw = Math.min(sw2, PW - sx0), ch = Math.min(sh2, PH - sy0);
    ctx.drawImage(this.terrain.canvas, sx0, sy0, cw, ch, sx0, sy0, cw, ch);
    const st = v.settings;
    if (st.water) { ctx.globalAlpha = 0.35 + 0.35 * Math.sin(time * 1.7); ctx.drawImage(this.terrain.foam, sx0, sy0, cw, ch, sx0, sy0, cw, ch); ctx.globalAlpha = 0.18 + 0.18 * Math.sin(time * 1.7 + 2.4); ctx.drawImage(this.terrain.foam, sx0, sy0, cw, ch, sx0 + 1, sy0 + 1, cw, ch); ctx.globalAlpha = 1; }
    if (st.water && z > 0.7) this.drawWater(ctx, time, x0, y0, x1, y1, S);
    // siyasi
    if (this.pol) { ctx.globalAlpha = z < 1 ? 0.95 : z < 2 ? 0.8 : 0.6; ctx.drawImage(this.pol, sx0, sy0, cw, ch, sx0, sy0, cw, ch); ctx.globalAlpha = 1; }
    if (v.selNation !== null && v.selNation >= 0) { ctx.globalAlpha = 0.65 + 0.3 * Math.sin(time * 4); ctx.drawImage(this.highlight(S, v.selNation), sx0, sy0, cw, ch, sx0, sy0, cw, ch); ctx.globalAlpha = 1; }
    // maden yatakları
    if (z >= 1.2) this.drawDeposits(ctx, x0, y0, x1, y1);
    // ticaret
    if (st.tradeVis) this.drawTrade(ctx, S, time, x0, y0, x1, y1);
    // şehirler
    this.drawCities(ctx, S, v, time, x0, y0, x1, y1);
    // seçili ordu yolu
    this.drawPaths(ctx, S, v, time);
    // birlikler
    this.drawArmies(ctx, S, v, time, x0, y0, x1, y1);
    // savaş göstergeleri
    this.drawBattles(ctx, S, time);
    this.drawParticles(ctx);
    // hover
    if (v.hoverTile >= 0) { const hx = (v.hoverTile % W) * TS, hy = ((v.hoverTile / W) | 0) * TS; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1 / z * 1.2; ctx.strokeRect(hx + 0.5, hy + 0.5, TS - 1, TS - 1); }
    // etiketler (ekran uzayı)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.drawLabels(ctx, S, v);
    if (v.box) { ctx.strokeStyle = '#7fe08a'; ctx.fillStyle = 'rgba(127,224,138,.15)'; ctx.lineWidth = 1.5; const b = v.box; ctx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); ctx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
  }

  drawWater(ctx, time, x0, y0, x1, y1, S) {
    const tx0 = Math.max(0, Math.floor(x0 / TS)), ty0 = Math.max(0, Math.floor(y0 / TS)), tx1 = Math.min(W - 1, Math.floor(x1 / TS)), ty1 = Math.min(H - 1, Math.floor(y1 / TS));
    const terr = S.W.terr; const tt = (time * 6) | 0;
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
      const t = terr[y * W + x]; if (t > T.LAKE) continue;
      for (let k = 0; k < 2; k++) {
        const ph = (tt + ((hash2(x, y, 200 + k) * 40) | 0)) % 40; if (ph > 3) continue;
        const px = x * TS + ((hash2(x, y, 210 + k) * 13) | 0), py = y * TS + ((hash2(x, y, 220 + k) * 13) | 0);
        ctx.fillRect(px, py, ph === 1 || ph === 2 ? 3 : 1, 1);
      }
    }
    // nehir parıltısı
    ctx.fillStyle = 'rgba(200,235,255,.8)';
    for (const arr of this.terrain.riverPts) for (let i = 0; i < arr.length; i += 2) { const ph = ((time * 8 + i * 0.5) | 0) % 9; if (ph === 0) { const px = arr[i], py = arr[i + 1]; if (px > x0 && px < x1 && py > y0 && py < y1) ctx.fillRect(px | 0, py | 0, 2, 1); } }
  }
  drawDeposits(ctx, x0, y0, x1, y1) {
    const Wd = this.world;
    for (const i of this.depList) {
      const px = (i % W) * TS, py = ((i / W) | 0) * TS; if (px < x0 - 16 || px > x1 || py < y0 - 16 || py > y1) continue;
      const k = Wd.deposit[i], r = Wd.rich[i], col = DEP_COL[k];
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(px + 4, py + 11, 9, 2);
      if (k === 3) { ctx.fillStyle = '#222'; ctx.fillRect(px + 7, py + 3, 2, 9); ctx.fillRect(px + 5, py + 4, 6, 1); ctx.fillStyle = col; ctx.fillRect(px + 6, py + 2, 4, 2); }
      else if (k === 4) { ctx.fillStyle = '#7a5a10'; ctx.fillRect(px + 4, py + 8, 8, 4); ctx.fillStyle = col; ctx.fillRect(px + 5, py + 6, 6, 5); ctx.fillStyle = '#fff6b0'; ctx.fillRect(px + 6, py + 7, 2, 1); }
      else { ctx.fillStyle = '#10141c'; ctx.fillRect(px + 4, py + 6, 9, 6); ctx.fillStyle = col; ctx.fillRect(px + 5, py + 7, 7, 4); ctx.fillStyle = k === 1 ? '#e06050' : k === 2 ? '#666' : '#fff'; ctx.fillRect(px + 7, py + 8, 2, 1); }
      ctx.fillStyle = '#fff'; for (let q = 0; q < r; q++) ctx.fillRect(px + 4 + q * 3, py + 13, 2, 1);
    }
  }
  drawTrade(ctx, S, time, x0, y0, x1, y1) {
    if (S.t === 0) return;
    for (const k in S.flows) {
      const f = S.flows[k]; if (f.v < 6) continue; const r = this.routeFor(S, f.from, f.to); if (!r || r.len < 8) continue;
      const nv = Math.min(4, 1 + Math.floor(Math.log2(1 + f.v / 15)));
      for (let i = 0; i < nv; i++) {
        const d = ((time * (r.kind === 'sea' ? 14 : 10) + (r.len / nv) * i) % r.len); const [x, y, dx] = this.at(r, d);
        if (x < x0 - 10 || x > x1 + 10 || y < y0 - 10 || y > y1 + 10) continue;
        const col = S.nations[f.from].col;
        if (r.kind === 'sea') { ctx.save(); ctx.translate(x, y); if (dx < 0) ctx.scale(-1, 1); ctx.fillStyle = '#10141c'; ctx.fillRect(-4, -1, 9, 3); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(-3, 0, 7, 1); ctx.fillStyle = col; ctx.fillRect(0, -4, 1, 4); ctx.fillRect(1, -4, 3, 2); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-7, 2, 3, 1); ctx.restore(); }
        else { ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#10141c'; ctx.fillRect(-3, -3, 7, 5); ctx.fillStyle = col; ctx.fillRect(-2, -3, 5, 3); ctx.fillStyle = '#7a5430'; ctx.fillRect(-2, 0, 5, 1); ctx.fillStyle = '#222'; ctx.fillRect(-2, 2, 2, 1); ctx.fillRect(1, 2, 2, 1); ctx.restore(); }
      }
    }
  }
  drawCities(ctx, S, v, time, x0, y0, x1, y1) {
    const z = this.cam.z;
    for (const c of S.cities) {
      const cx = c.x * TS + 8, cy = c.y * TS + 8; if (cx < x0 - 40 || cx > x1 + 40 || cy < y0 - 40 || cy > y1 + 40) continue;
      const n = S.nations[c.owner], tier = popTier(c.pop), isCap = n.capital === c.id;
      const spr = citySprite(c, n, tier, Math.min(2, c.bld.fort), isCap);
      const sc = z < 0.9 ? 1.25 : 1;
      const dx = cx - spr._w * sc / 2, dy = cy - spr._h * sc + 7;
      // liman
      if (c.bld.port && c.portTile >= 0) {
        const px = (c.portTile % W) * TS + 8, py = ((c.portTile / W) | 0) * TS + 8; const ang = Math.atan2(py - cy, px - cx);
        ctx.fillStyle = '#6e4a2a'; for (let q = 0; q < 8; q++) ctx.fillRect(Math.round(cx + Math.cos(ang) * (7 + q)), Math.round(cy + Math.sin(ang) * (7 + q)), 2, 2);
        const bob = Math.sin(time * 2 + c.id) * 1; ctx.fillStyle = '#10141c'; ctx.fillRect(px - 3, py + bob - 1, 7, 3); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(px - 2, py + bob, 5, 1); ctx.fillStyle = n.col; ctx.fillRect(px, py + bob - 4, 1, 3);
      }
      if (c.occ > 0) { ctx.globalAlpha = 0.6 + 0.2 * Math.sin(time * 3); }
      ctx.drawImage(spr, dx, dy, spr._w * sc, spr._h * sc); ctx.globalAlpha = 1;
      // bayrak
      const fl = flagCanvas(n, 12, 8); const wave = Math.sin(time * 4 + c.id) * 0.7;
      ctx.fillStyle = '#3a2a1a'; ctx.fillRect(dx + spr._flagX * sc, dy + (spr._flagY - 7) * sc, 1, 9);
      ctx.drawImage(fl, dx + spr._flagX * sc + 1, dy + (spr._flagY - 7) * sc + wave, 8, 5);
      // duman
      if (c.bld.factory && z > 0.9) for (let q = 0; q < 2; q++) { const ph = ((time * 0.6 + q * 0.5 + c.id * 0.13) % 1); ctx.fillStyle = `rgba(210,210,215,${0.5 * (1 - ph)})`; ctx.fillRect(dx + spr._w * sc * 0.75, dy + 2 - ph * 10, 3 + ph * 3, 3 + ph * 3); }
      if (c.dmg > 0.1 && z > 0.9) { ctx.fillStyle = `rgba(60,60,60,${0.4 + 0.2 * Math.sin(time * 5)})`; ctx.fillRect(dx + 6, dy + 4 - ((time * 8) % 6), 3, 3); }
      if (c.siege > 0) { ctx.strokeStyle = '#ff5050'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 11, -1.57, -1.57 + 6.28 * (c.siege / 16)); ctx.stroke(); }
    }
    // seçili şehir halkası
    if (v.selCity !== null && v.selCity >= 0) { const c = S.cities[v.selCity]; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]); ctx.lineDashOffset = -time * 8; ctx.beginPath(); ctx.ellipse(c.x * TS + 8, c.y * TS + 9, 17, 11, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
  }
  drawPaths(ctx, S, v, time) {
    for (const id of v.selArmies) {
      const a = S.armies.find((x) => x.id === id); if (!a) continue;
      let pts = []; const [sx, sy] = this.armyPos(S, a);
      if (a.type === 'air') { if (a.target >= 0 && a.order === 'strike') { pts = [[sx, sy], [(a.target % W) * TS + 8, ((a.target / W) | 0) * TS + 8]]; } }
      else if (a.path.length) { pts = [[sx, sy], ...a.path.map((t) => [(t % W) * TS + 8, ((t / W) | 0) * TS + 8])]; }
      if (pts.length < 2) continue;
      ctx.strokeStyle = a.type === 'air' ? '#ffb040' : '#7fe08a'; ctx.lineWidth = 1.8; ctx.setLineDash([4, 3]); ctx.lineDashOffset = -time * 14; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); ctx.setLineDash([]);
      const e = pts[pts.length - 1]; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(e[0] - 4, e[1] - 4); ctx.lineTo(e[0] + 4, e[1] + 4); ctx.moveTo(e[0] + 4, e[1] - 4); ctx.lineTo(e[0] - 4, e[1] + 4); ctx.stroke();
    }
  }
  drawArmies(ctx, S, v, time, x0, y0, x1, y1) {
    const sc = this.unitScale(); const slot = new Map(); const order = S.armies.slice().sort((a, b) => this.armyPos(S, a)[1] - this.armyPos(S, b)[1]);
    for (const a of order) {
      let [x, y] = this.armyPos(S, a); if (x < x0 - 30 || x > x1 + 30 || y < y0 - 30 || y > y1 + 30) continue;
      const n = S.nations[a.owner]; const dom = UNITS[a.type].dom;
      if (a.type !== 'air' || a.state === 'base') { const key = a.tile + (a.type === 'air' ? 'a' : ''); const k = slot.get(key) || 0; slot.set(key, k + 1); x += (k % 3) * 5 * sc - (k > 0 ? 4 * sc : 0); y += Math.floor(k / 3) * 3 - k * 2 * sc; }
      const emb = dom === 'land' && S.W.terr[a.tile] <= T.SEA;
      const moving = a.path && a.path.length > 0 && a.engaged < 0; const bob = moving ? Math.abs(Math.sin(time * 9 + a.id)) * 1.2 : 0;
      if (a.type === 'air') {
        if (a.state === 'base') { /* park halinde: şehir yanında küçük */ }
        const sp = unitSprite('air', n); const tx = a.target >= 0 && a.state === 'out' ? ((a.target % W) * TS + 8) : null; let ang = 0;
        if (a.state === 'out' || a.state === 'back') { const bc = S.cities[a.base]; const tgt = a.state === 'out' ? [(a.target % W) * TS + 8, ((a.target / W) | 0) * TS + 8] : bc ? [bc.x * TS + 8, bc.y * TS + 8] : [x, y]; ang = Math.atan2(tgt[1] - y, tgt[0] - x) + Math.PI / 2; ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x + 6, y + 9, 5, 2, 0, 0, 7); ctx.fill(); }
        ctx.save(); ctx.translate(x, y - (a.state === 'base' ? 0 : 6)); ctx.rotate(ang); ctx.scale(sc * 0.85, sc * 0.85); ctx.drawImage(sp, -sp._w / 2, -sp._h / 2); ctx.restore();
      } else {
        const sp = unitSprite(emb ? 'trans' : a.type, n); let flip = 1; if (a.path && a.path.length) { const nx = a.path[0] % W; flip = nx < a.tile % W ? -1 : 1; } else if (a.fl) flip = a.fl; a.fl = flip;
        ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 5 * sc, 6 * sc, 2.2 * sc, 0, 0, 7); ctx.fill();
        ctx.save(); ctx.translate(x, y - bob * sc); ctx.scale(sc * (dom === 'sea' || a.type === 'tank' || a.type === 'art' ? 0.8 : 1) * flip, sc * (dom === 'sea' || a.type === 'tank' || a.type === 'art' ? 0.8 : 1)); ctx.drawImage(sp, -sp._w / 2, -sp._h + 5); ctx.restore();
        if (dom === 'sea' && (moving || true)) { ctx.fillStyle = 'rgba(255,255,255,.55)'; const wob = (time * 6) % 4; ctx.fillRect(x - 9 * sc * flip, y + 4 * sc, 4 * sc, 1); ctx.fillRect(x - 12 * sc * flip, y + 5.5 * sc + wob * 0.2, 3 * sc, 1); }
      }
      // durum çubuğu
      const w = 12 * sc, hy = y - 13 * sc, frac = clamp(a.hp / Math.max(1, a.max), 0, 1);
      ctx.fillStyle = '#10141c'; ctx.fillRect(x - w / 2 - 1, hy - 1, w + 2, 4 * (sc > 1.4 ? 1 : 1) + 1); ctx.fillStyle = '#3a1a1a'; ctx.fillRect(x - w / 2, hy, w, 3);
      ctx.fillStyle = frac > 0.5 ? '#5cd05c' : frac > 0.25 ? '#e0c030' : '#e04040'; ctx.fillRect(x - w / 2, hy, w * frac, 2);
      ctx.fillStyle = a.morale > 50 ? '#6ab0ff' : '#c08040'; ctx.fillRect(x - w / 2, hy + 2, w * (a.morale / 100), 1);
      // sayı rozeti
      if (this.cam.z > 0.55) { const cnt = count(a); ctx.font = `bold ${Math.round(6 * sc)}px monospace`; ctx.textAlign = 'center'; const tw = ctx.measureText(cnt).width + 3; ctx.fillStyle = n.col; ctx.fillRect(x + w / 2 - 1, hy - 4 * sc, tw, 5.5 * sc); ctx.strokeStyle = '#10141c'; ctx.lineWidth = 0.8; ctx.strokeRect(x + w / 2 - 1, hy - 4 * sc, tw, 5.5 * sc); ctx.fillStyle = '#fff'; ctx.fillText(cnt, x + w / 2 - 1 + tw / 2, hy + 0.2 * sc); }
      if (a.engaged >= 0) { ctx.fillStyle = (time * 6 | 0) % 2 ? '#ff6040' : '#ffd040'; ctx.fillRect(x - 3, hy - 7 * sc, 6, 2); }
      if (v.selArmies.includes(a.id)) { ctx.strokeStyle = '#7fe08a'; ctx.lineWidth = 1.6; ctx.setLineDash([3, 2]); ctx.lineDashOffset = -time * 10; ctx.beginPath(); ctx.ellipse(x, y + 3, 9 * sc, 6 * sc, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    }
  }
  drawBattles(ctx, S, time) {
    for (const b of S.battles) {
      const x = (b.tile % W) * TS + 8, y = ((b.tile / W) | 0) * TS + 8;
      const sc = this.unitScale(); const t = time * 8;
      for (let i = 0; i < 3; i++) { const a = t + i * 2.1; ctx.fillStyle = i % 2 ? '#ffd24a' : '#ff7a30'; ctx.fillRect(x + Math.cos(a) * 7 * sc - 1, y + Math.sin(a * 1.3) * 5 * sc - 1, 2, 2); }
      ctx.save(); ctx.translate(x, y - 12 * sc); ctx.scale(sc * 0.7, sc * 0.7); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); ctx.stroke(); ctx.strokeStyle = '#d64545'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    }
  }
  drawParticles(ctx) {
    for (const p of this.parts) {
      if (p.k === 'spark') { ctx.globalAlpha = clamp(p.life, 0, 1); ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 2, 2); }
      else if (p.k === 'smoke') { ctx.globalAlpha = clamp(p.life * 0.4, 0, 0.5); ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
      else if (p.k === 'boom') { ctx.globalAlpha = clamp(p.life, 0, 1); ctx.fillStyle = '#ff9a30'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); ctx.fillStyle = '#fff2a0'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.5, 0, 7); ctx.fill(); }
      else if (p.k === 'ring') { ctx.globalAlpha = clamp(p.life, 0, 1); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  drawLabels(ctx, S, v) {
    const z = this.cam.z, st = v.settings; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if (z < 1.25 && st.names) {
      for (const l of this.labels) {
        if (!l || !S.nations[l.id].alive) continue; const [sx, sy] = this.w2s(l.x, l.y); if (sx < -100 || sy < -50 || sx > this.vw + 100 || sy > this.vh + 50) continue;
        const name = S.nations[l.id].short.toUpperCase(); const size = clamp(Math.sqrt(l.n) * 0.62 * z * 3.4, 9, 30);
        ctx.font = `bold ${size}px "Press Start 2P", monospace`; ctx.font = `bold ${Math.round(size)}px system-ui, sans-serif`;
        if ('letterSpacing' in ctx) ctx.letterSpacing = Math.round(size * 0.18) + 'px';
        ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(10,16,28,.85)'; ctx.strokeText(name, sx, sy); ctx.fillStyle = 'rgba(255,255,255,.93)'; ctx.fillText(name, sx, sy);
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
      }
    }
    if (z >= 0.75 && st.names) {
      ctx.font = `bold ${clamp(10 * Math.min(z, 1.6), 9, 14)}px system-ui, sans-serif`;
      for (const c of S.cities) {
        const [sx, sy] = this.w2s(c.x * TS + 8, c.y * TS + 12); if (sx < -80 || sy < -30 || sx > this.vw + 80 || sy > this.vh + 40) continue;
        const cap = S.nations[c.owner].capital === c.id; const lbl = (cap ? '★ ' : '') + c.name;
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,16,28,.9)'; ctx.strokeText(lbl, sx, sy + 8 * z + 2); ctx.fillStyle = cap ? '#ffe28a' : '#fff'; ctx.fillText(lbl, sx, sy + 8 * z + 2);
      }
    }
  }
}
