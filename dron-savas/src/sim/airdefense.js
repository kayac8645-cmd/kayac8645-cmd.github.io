// Hava savunma: radar ağı (algılama, alçak irtifa/RCS/hava etkisi), katmanlı angajman, önleme hesabı,
// atış başına maliyet istatistiği, gelen füze uyarıları
import { KIND, C, F } from '../core/ecs.js';
import { UNITS, PROJS, AD_SYS, ITEM_BY, ITEMS, PROJ_BY, CLS } from '../data/defs.js';
import { BUILDINGS } from '../data/buildings.js';
import { applyDamage } from './damage.js';

const usable = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));

// hedef sınıfı ve radar izi
export function targetInfo(sim, j) {
  const e = sim.e;
  if (e.kind[j] === KIND.PROJ) {
    const p = PROJS[e.def[j]]; if (p.intercept || p.drop || p.id === 'shell') return null;
    const rcs = p.cls === CLS.BALLISTIC ? 3 : p.cls === CLS.CRUISE ? 0.25 * sim.mod(e.owner[j], 'cruiseStealth', 1) : 0.15;
    return { cls: p.cls, rcs, low: !!p.low };
  }
  if (e.kind[j] === KIND.AIR) { const u = UNITS[e.def[j]]; return { cls: u.cls, rcs: u.rcs, low: !!(e.flags[j] & F.LOWALT) }; }
  return null;
}

function sensorsOf(sim) {
  const e = sim.e, nC = sim.countries.length, out = [];
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || (e.flags[i] & F.DEAD) || e.owner[i] >= nC) continue;
    if (e.mask[i] & C.RADAR) {
      if (!usable(e, i) || !(e.flags[i] & F.EMIT_ON) || (e.sat[i] < 0.35 && !(e.flags[i] & F.GENERATOR))) continue;
      out.push(i, BUILDINGS[e.def[i]].radar * sim.mod(e.owner[i], 'radarRange', 1), 1);
    } else if (e.mask[i] & C.AD) {
      const sys = AD_SYS[e.kind[i] === KIND.BUILDING ? BUILDINGS[e.def[i]].ad : UNITS[e.def[i]].ad];
      if (!usable(e, i)) continue;
      if (!(e.flags[i] & F.EMIT_ON) && !sys.gun) continue;
      out.push(i, sys.radar * (sys.gun ? Math.max(0.5, sim.env.visMul) : 1), 2);
    }
  }
  return out;
}

export function updateSensors(sim) {
  const e = sim.e, nC = sim.countries.length;
  // hava ve mermi varlıklarının seenBy'ı her tick yenilenir (sahip her zaman görür)
  for (let i = 0; i < e.hi; i++) {
    const k = e.kind[i]; if (k !== KIND.AIR && k !== KIND.PROJ) continue;
    e.seenBy[i] = e.owner[i] < 32 ? (1 << e.owner[i]) >>> 0 : 0;
  }
  const S = sensorsOf(sim); sim.sensors = S;
  const lowMul = (c) => 0.42 * sim.mod(c, 'lowDetect', 1);
  for (let s = 0; s < S.length; s += 3) {
    const i = S[s], R = S[s + 1], c = e.owner[i];
    const linked = (e.flags[i] & F.LINKED) || S[s + 2] === 2;
    if (!linked) continue; // ağa bağlı olmayan radar verisi paylaşılamaz
    const bit = (1 << c) >>> 0;
    sim.grid.query(e.x[i], e.y[i], R * 1.3, (j, d2) => {
      const kj = e.kind[j]; if (kj !== KIND.AIR && kj !== KIND.PROJ) return;
      if (e.owner[j] === c) return;
      const ti = targetInfo(sim, j); if (!ti) return;
      let f = Math.min(1.3, 0.3 + 0.75 * Math.sqrt(ti.rcs));
      if (ti.low) f *= lowMul(c);
      if (sim.env.weather === 'storm') f *= 0.85;
      if (d2 <= R * R * f * f) e.seenBy[j] |= bit;
    });
  }
  // görsel algılama (birimlerin gözü)
  for (let i = 0; i < e.hi; i++) {
    const k = e.kind[i]; if ((k !== KIND.GROUND && k !== KIND.NAVAL && k !== KIND.AIR) || (e.flags[i] & F.DEAD) || e.owner[i] >= nC) continue;
    if ((sim.tick + i) % 2) continue;
    const v = UNITS[e.def[i]].vision * 0.7 * sim.env.visMul; const bit = (1 << e.owner[i]) >>> 0, c = e.owner[i];
    sim.grid.query(e.x[i], e.y[i], v, (j) => { const kj = e.kind[j]; if ((kj === KIND.AIR || kj === KIND.PROJ) && e.owner[j] !== c) e.seenBy[j] |= bit; });
  }
  // ittifak paylaşımı + gelen füze uyarısı
  const map = sim.map;
  for (let j = 0; j < e.hi; j++) {
    const k = e.kind[j]; if ((k !== KIND.AIR && k !== KIND.PROJ) || (e.flags[j] & F.DEAD)) continue;
    let sb = e.seenBy[j];
    for (let a = 0; a < nC; a++) if ((sb >>> a) & 1) for (let b = 0; b < nC; b++) if (a !== b && sim.diplo.allied(a, b)) sb |= (1 << b) >>> 0;
    e.seenBy[j] = sb >>> 0;
    if (k === KIND.PROJ && sim.tick % 5 === 0) {
      const p = PROJS[e.def[j]]; if (p.intercept || p.cls < CLS.CRUISE) continue;
      const tx = e.tx[j] | 0, ty = e.ty[j] | 0; if (!map.inb(tx, ty)) continue;
      const vic = map.owner[map.idx(tx, ty)];
      if (vic < nC && ((sb >>> vic) & 1)) {
        const co = sim.countries[vic];
        if (!co.lastIncoming || sim.tick - co.lastIncoming > 120) { co.lastIncoming = sim.tick; sim.notify(vic, 'n_incoming', ['p_' + p.id], tx, ty, 3); }
      }
    }
  }
}

export function updateAD(sim) {
  const e = sim.e, nC = sim.countries.length, eng = sim.engaged;
  for (let i = 0, n = e.hi; i < n; i++) {
    if (!(e.mask[i] & C.AD) || !usable(e, i) || e.owner[i] >= nC) continue;
    if (e.cool[i] > 0) { e.cool[i]--; continue; }
    const isB = e.kind[i] === KIND.BUILDING; const c = e.owner[i], co = sim.countries[c];
    const sys = AD_SYS[isB ? BUILDINGS[e.def[i]].ad : UNITS[e.def[i]].ad];
    if (isB && e.sat[i] < (sys.laser ? 0.6 : 0.3) && !(e.flags[i] & F.GENERATOR)) continue;
    if (!isB && e.supply[i] < 0.02) continue;
    const linked = !!(e.flags[i] & F.LINKED);
    const ownR = (e.flags[i] & F.EMIT_ON) || sys.gun ? sys.radar * (sys.gun ? Math.max(0.5, sim.env.visMul) : 1) : 0;
    const bit = (1 << c) >>> 0;
    const bmd = sim.mod(c, 'bmd', 0);
    let best = -1, bs = -1e9, bestCls = 0;
    sim.grid.query(e.x[i], e.y[i], sys.range, (j, d2) => {
      const kj = e.kind[j]; if (kj !== KIND.AIR && kj !== KIND.PROJ) return;
      const oj = e.owner[j]; if (!sim.atWar(c, oj)) return;
      const ti = targetInfo(sim, j); if (!ti) return;
      const visible = (linked && (e.seenBy[j] & bit)) || d2 <= ownR * ownR * (ti.low && !sys.gun ? 0.6 : 1);
      if (!visible) return;
      let pk = sys.pk[ti.cls]; if (ti.cls === CLS.BALLISTIC && sys === AD_SYS.long && bmd) pk = 0.55;
      if (!pk) return;
      // pahalı önleyiciyi ucuz drona harcama: uzak dronları atla
      if (!sys.gun && !sys.laser && sys.range > 12 && ti.cls === CLS.DRONE && d2 > 100) return;
      if (eng[j] >= (ti.cls >= CLS.CRUISE ? 2 : 1) && !sys.gun && !sys.laser) return;
      const threat = [4, 5, 6, 8, 10, 3, 0, 0][ti.cls];
      const s = threat * 10 - Math.sqrt(d2) + pk * 5;
      if (s > bs) { bs = s; best = j; bestCls = ti.cls; }
    });
    if (best < 0) continue;
    const j = best;
    let pk = sys.pk[bestCls]; if (bestCls === CLS.BALLISTIC && sys === AD_SYS.long && bmd) pk = 0.55;
    if (e.kind[j] === KIND.AIR && (e.flags[j] & F.LOWALT) && sys.range > 12) pk *= 0.85;
    if (e.kind[j] === KIND.AIR) pk *= 1 - sim.mod(e.owner[j], 'droneEvade', 0);
    if (sys.gun || sys.laser) {
      e.cool[i] = sys.cool;
      if (!isB) e.supply[i] = Math.max(0, e.supply[i] - 0.002);
      sim.emit({ k: sys.laser ? 'laser' : 'tracer', x: e.x[i], y: e.y[i], tx: e.x[j], ty: e.y[j], z: e.z[j], owner: c });
      if (sim.rng.next() < pk) {
        if (e.kind[j] === KIND.PROJ) { sim.emit({ k: 'boom', x: e.x[j], y: e.y[j], r: 0.8, big: 0, air: true }); e.kill(j); co.stats.kills++; }
        else applyDamage(sim, j, sys.laser ? 60 : 25, c, { cause: 'aa' });
      }
      co.stats.adShots++; co.stats.adSpent += sys.laser ? 2 : 1;
      continue;
    }
    const ii = ITEM_BY[sys.item];
    if (co.items[ii] < 1) { if (!co.lastNoAmmo || sim.tick - co.lastNoAmmo > 600) { co.lastNoAmmo = sim.tick; sim.notify(c, 'n_noammo', ['i_' + sys.item], e.x[i], e.y[i], 2); } e.cool[i] = 20; continue; }
    co.items[ii] -= 1; co.stats.adShots++; co.stats.adSpent += ITEMS[ii].cost.money;
    const pid = sim.spawnProj(c, PROJ_BY[sys.item], e.x[i], e.y[i], e.x[j], e.y[j], { target: j, from: i });
    if (pid >= 0) {
      e.ammo[pid] = pk; e.z[pid] = 1; eng[j]++;
      const dx = e.x[j] - e.x[i], dy = e.y[j] - e.y[i], d = Math.sqrt(dx * dx + dy * dy) || 1; e.vx[pid] = dx / d; e.vy[pid] = dy / d;
      e.flags[i] |= F.REVEALED; sim.reveal.set(i, sim.tick + 60);
    }
    e.cool[i] = sys.cool;
    sim.emit({ k: 'launch', x: e.x[i], y: e.y[i], sam: true, owner: c });
  }
}
