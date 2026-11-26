// Elektronik harp: bant karıştırma + uyum yarışı, GPS karıştırma/sahte sinyal, SIGINT,
// savaş sisi (ülke başına son görülme ızgarası) ve istihbarat belleği
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { UNITS, BANDS } from '../data/defs.js';
import { BUILDINGS } from '../data/buildings.js';
import { VIS_CELL } from './country.js';
import { visionMul } from './weather.js';

const usable = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));
const DEFAULT_JAM = (1 << 2) | (1 << 3); // 2.4 + 5.8 GHz
const popc = (m) => { let n = 0; while (m) { n += m & 1; m >>>= 1; } return n; };

function jammers(sim) {
  const e = sim.e, out = [];
  e.each(C.JAMMER, (i) => {
    if (!usable(e, i) || !(e.flags[i] & F.EMIT_ON)) return;
    if (e.kind[i] === KIND.BUILDING && e.sat[i] < 0.35 && !(e.flags[i] & F.GENERATOR)) return;
    if (!e.jamBands[i]) e.jamBands[i] = DEFAULT_JAM;
    const r = e.kind[i] === KIND.BUILDING ? BUILDINGS[e.def[i]].jam : UNITS[e.def[i]].jam;
    out.push(i, r);
  });
  return out;
}

export function updateEW(sim) {
  const e = sim.e, J = jammers(sim); sim.jammerList = J;
  const t = sim.tick;
  // hava varlıkları ve güdümlü mermiler için karıştırma durumu (5 tick'te bir zar)
  for (let i = 0, n = e.hi; i < n; i++) {
    const k = e.kind[i];
    if ((k !== KIND.AIR && k !== KIND.PROJ && k !== KIND.NAVAL) || (e.flags[i] & F.DEAD)) continue;
    const c = e.owner[i];
    let gps = false, spoof = false, jam = false;
    const u = k === KIND.PROJ ? null : UNITS[e.def[i]];
    for (let s = 0; s < J.length; s += 2) {
      const j = J[s], r = J[s + 1]; const oj = e.owner[j];
      if (!sim.atWar(c, oj)) continue;
      const dx = e.x[j] - e.x[i], dy = e.y[j] - e.y[i], d2 = dx * dx + dy * dy;
      if (d2 > r * r * 1.4) continue;
      gps = true; if (sim.mod(oj, 'spoof', 0)) spoof = true;
      if (u && u.link && !u.fiber && d2 <= r * r && ((e.jamBands[j] >>> e.band[i]) & 1)) jam = true;
      // uyum: jammer sahibi bu bandı görürse öğrenir
      if (u && u.link && !u.fiber && ((e.seenBy[i] >>> oj) & 1) && !((e.jamBands[j] >>> e.band[i]) & 1)) {
        if (e.res[j] !== e.band[i] + 1) { e.res[j] = e.band[i] + 1; e.prog[j] = 0; }
        e.prog[j] += 1 + sim.mod(oj, 'adaptFast', 0) * 2;
        if (e.prog[j] >= 160) {
          let m = e.jamBands[j] | (1 << e.band[i]); const max = sim.mod(oj, 'adaptFast', 0) ? 3 : 2;
          while (popc(m) > max) { for (let b = 0; b < 8; b++) if (((m >>> b) & 1) && b !== e.band[i]) { m &= ~(1 << b); break; } }
          e.jamBands[j] = m; e.prog[j] = 0; e.res[j] = 0;
          sim.notify(oj, 'n_jam_adapt', [BANDS[e.band[i]]], e.x[j], e.y[j], 1);
          if (!sim.countries[c].ai) sim.notify(c, 'n_band_jammed', [BANDS[e.band[i]]], e.x[i], e.y[i], 2);
        }
      }
    }
    if (gps) e.flags[i] |= F.GPSJAM; else e.flags[i] &= ~F.GPSJAM;
    if (spoof) e.flags[i] |= F.SPOOFED; else e.flags[i] &= ~F.SPOOFED;
    if ((t + i) % 5 === 0) {
      if (jam) {
        const resist = (u.ew || 0) + sim.mod(c, 'hop', 0) * 0.5;
        if (sim.rng.next() >= resist) e.flags[i] |= F.JAMMED; else e.flags[i] &= ~F.JAMMED;
      } else e.flags[i] &= ~F.JAMMED;
    }
  }
}

// ---------- SAVAŞ SİSİ ----------
export function updateVisibility(sim) {
  const e = sim.e, map = sim.map, nC = sim.countries.length; const tq = ((sim.tick / 10) | 0) + 1;
  for (let c = 0; c < nC; c++) {
    const co = sim.countries[c]; if (!co.alive) continue;
    const vn = co.visNow; const vw = co.vw, vh = co.vh;
    if (sim.opts.fog === false) { vn.fill(1); co.vis.fill(tq); continue; } // sis kapalı: herkes her şeyi görür (YZ dahil)
    vn.fill(0);
    // kendi toprakları (halk istihbaratı)
    for (let cy = 0; cy < vh; cy++) for (let cx = 0; cx < vw; cx++) {
      const x = Math.min(map.W - 1, cx * VIS_CELL + 2), y = Math.min(map.H - 1, cy * VIS_CELL + 2);
      if (map.owner[y * map.W + x] === c) vn[cy * vw + cx] = 1;
    }
    const vm = visionMul(sim, c);
    for (let i = 0; i < e.hi; i++) {
      if (!e.kind[i] || e.owner[i] !== c || (e.flags[i] & F.DEAD)) continue;
      const k = e.kind[i]; let r = 0;
      if (k === KIND.BUILDING) { if (!usable(e, i)) continue; r = BUILDINGS[e.def[i]].vision || 3; }
      else if (k === KIND.GROUND || k === KIND.NAVAL || k === KIND.AIR) { if (e.flags[i] & F.LINKLOST) continue; r = UNITS[e.def[i]].vision * (k === KIND.AIR ? 1 : 1); }
      else if (k === KIND.CONVOY) r = 3; else continue;
      r *= k === KIND.BUILDING ? 1 : vm;
      stamp(vn, vw, vh, e.x[i], e.y[i], r);
    }
    const v = co.vis;
    for (let k = 0; k < vn.length; k++) if (vn[k]) v[k] = tq;
  }
  // ittifak görüş paylaşımı
  for (let a = 0; a < nC; a++) for (let b = 0; b < nC; b++) {
    if (a === b || !sim.diplo.allied(a, b)) continue;
    const A = sim.countries[a], B = sim.countries[b];
    for (let k = 0; k < A.visNow.length; k++) if (B.visNow[k]) A.visNow[k] = 2;
  }
  // seenBy (yer varlıkları) + istihbarat belleği
  for (let i = 0; i < e.hi; i++) {
    const k = e.kind[i]; if (!k || k === KIND.AIR || k === KIND.PROJ || (e.flags[i] & F.DEAD)) continue;
    const cx = (e.x[i] / VIS_CELL) | 0, cy = (e.y[i] / VIS_CELL) | 0;
    let sb = e.owner[i] < 32 ? (1 << e.owner[i]) >>> 0 : 0;
    for (let c = 0; c < nC; c++) {
      const co = sim.countries[c]; if (!co.alive || c === e.owner[i]) continue;
      let seen = co.visNow[cy * co.vw + cx] > 0;
      if (!seen && (e.flags[i] & F.REVEALED) && sim.atWar(c, e.owner[i])) seen = true; // vur-kaç ifşası
      if (!seen) continue;
      sb |= (1 << c) >>> 0;
      if (k === KIND.BUILDING || k === KIND.CITY || k === KIND.GROUND || k === KIND.NAVAL || k === KIND.CONVOY) {
        const o = e.owner[i]; if (o >= nC) { if (k !== KIND.BUILDING) continue; }
        co.known.set(i, { t: sim.tick, x: e.x[i], y: e.y[i], kind: k, def: e.def[i], owner: o, hp: e.hp[i] / (e.maxhp[i] || 1), ruined: !!(e.flags[i] & F.RUINED), exact: true });
      }
    }
    e.seenBy[i] = sb >>> 0;
  }
  // bellek temizliği: görülen hücrede olmayan / ölmüş varlıklar
  if (sim.tick % 20 === 0) for (const co of sim.countries) {
    if (!co.alive) continue;
    for (const [id, k] of co.known) {
      const cx = (k.x / VIS_CELL) | 0, cy = (k.y / VIS_CELL) | 0;
      const vis = co.visNow[cy * co.vw + cx];
      if (!e.alive(id) || e.kind[id] !== k.kind) { if (vis || sim.tick - k.t > 6000) co.known.delete(id); continue; }
      if (vis && !((e.seenBy[id] >>> co.id) & 1) && k.kind !== KIND.BUILDING) co.known.delete(id);
      else if ((k.kind === KIND.GROUND || k.kind === KIND.CONVOY || k.kind === KIND.NAVAL) && sim.tick - k.t > 1500) co.known.delete(id);
    }
  }
}
function stamp(vn, vw, vh, x, y, r) {
  const rc = r / VIS_CELL, cx = x / VIS_CELL, cy = y / VIS_CELL;
  const x0 = Math.max(0, (cx - rc) | 0), x1 = Math.min(vw - 1, (cx + rc) | 0), y0 = Math.max(0, (cy - rc) | 0), y1 = Math.min(vh - 1, (cy + rc) | 0);
  const r2 = rc * rc;
  for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
    const dx = xx + 0.5 - cx, dy = yy + 0.5 - cy; if (dx * dx + dy * dy <= r2) vn[yy * vw + xx] = 1;
  }
}

// ---------- SİNYAL İSTİHBARATI ----------
export function updateSigint(sim) {
  const e = sim.e, nC = sim.countries.length;
  const recv = [];
  e.each(C.SIGINT, (i) => {
    if (!usable(e, i) || e.owner[i] >= nC) return;
    if (e.kind[i] === KIND.BUILDING && e.sat[i] < 0.35) return;
    recv.push(i, e.kind[i] === KIND.BUILDING ? BUILDINGS[e.def[i]].sigint : UNITS[e.def[i]].sigint);
  });
  // radarlar da kaba yön bulma yapar (kısa menzil)
  const em = [];
  e.each(C.EMIT, (i) => { if (usable(e, i) && (e.flags[i] & F.EMIT_ON)) em.push(i); });
  for (const i of sim.reveal.keys()) if (e.alive(i) && !(e.mask[i] & C.EMIT)) em.push(i);
  for (let s = 0; s < recv.length; s += 2) {
    const r = recv[s], R = recv[s + 1], c = e.owner[r], co = sim.countries[c];
    for (const i of em) {
      const o = e.owner[i]; if (o === c || o >= nC || !sim.atWar(c, o)) continue;
      const d2 = e.dist2(r, i); if (d2 > R * R) continue;
      const err = Math.sqrt(d2) / 25; const [a, b] = sim.rng.disk();
      const x = e.x[i] + a * err, y = e.y[i] + b * err;
      const isNew = !co.emitters.has(i);
      co.emitters.set(i, { t: sim.tick, x, y, kind: e.kind[i], def: e.def[i], owner: o });
      if (!co.known.has(i) || !co.known.get(i).exact) co.known.set(i, { t: sim.tick, x, y, kind: e.kind[i], def: e.def[i], owner: o, hp: 1, ruined: false, exact: false });
      if (isNew && !co.ai) sim.notify(c, 'n_sigint', [], x, y, 0);
    }
  }
  for (const co of sim.countries) for (const [id, v] of co.emitters) if (sim.tick - v.t > 600 || !e.alive(id)) co.emitters.delete(id);
}

// oyun kuralı: savaş sisi aç/kapat (yalnız insan oyuncu)
registerCommand(CMD.RULE, (sim, cmd) => {
  if (sim.countries[cmd.c].ai) return false;
  if (cmd.fog !== undefined) { sim.opts.fog = !!cmd.fog; sim.notify(cmd.c, cmd.fog ? 'n_fog_on' : 'n_fog_off', [], -1, -1, 1); }
});
registerCommand(CMD.SET_BAND, (sim, cmd) => {
  const co = sim.countries[cmd.c]; const b = cmd.band | 0;
  if (!((co.bands >>> b) & 1)) return false;
  co.band = b;
});
registerCommand(CMD.SET_JAM, (sim, cmd) => {
  const e = sim.e; if (!e.alive(cmd.e) || e.owner[cmd.e] !== cmd.c || !(e.mask[cmd.e] & C.JAMMER)) return false;
  let m = cmd.mask >>> 0; const max = sim.mod(cmd.c, 'adaptFast', 0) ? 3 : 2;
  if (popc(m) > max || !m) return false;
  e.jamBands[cmd.e] = m;
});
