// Altyapı ağları graf olarak: elektrik, yakıt (boru hattı), haberleşme, su, ulaşım.
// Bir düğüm vurulunca bileşenler yeniden hesaplanır -> etki ağ boyunca yayılır.
import { KIND, C, F } from '../core/ecs.js';
import { BUILDINGS } from '../data/buildings.js';
import { R } from '../data/defs.js';
import { T } from '../world/map.js';

const ok = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));

function uf(n) { const p = new Int32Array(n); for (let i = 0; i < n; i++) p[i] = i; return p; }
function find(p, a) { while (p[a] !== a) { p[a] = p[p[a]]; a = p[a]; } return a; }
function union(p, a, b) { a = find(p, a); b = find(p, b); if (a !== b) { if (a < b) p[b] = a; else p[a] = b; } }

export function updateNetworks(sim) {
  const t = sim.tick, d = sim.dirty;
  if (d.roads) { sim.map.computeRoadComponents(); d.roads = false; updateTransport(sim); }
  else if (t % 50 === 7) updateTransport(sim);
  if (d.power || t % 10 === 0) { updatePower(sim); d.power = false; }
  if (d.fuel || t % 30 === 1) { updateFuel(sim); d.fuel = false; }
  if (d.comms || t % 20 === 2) { updateComms(sim); d.comms = false; }
  if (d.water || t % 30 === 4) { updateWater(sim); d.water = false; }
}

// ---------- ELEKTRİK ----------
function updatePower(sim) {
  const e = sim.e, nC = sim.countries.length;
  const nodes = [], cons = [];
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || (e.flags[i] & F.DEAD)) continue;
    if (e.kind[i] === KIND.CITY) { cons.push(i); continue; }
    if (e.kind[i] !== KIND.BUILDING || e.owner[i] >= nC) continue;
    const bd = BUILDINGS[e.def[i]];
    if ((e.mask[i] & C.POWER) && ok(e, i)) nodes.push(i);
    else if (bd.power < 0) cons.push(i);
  }
  const p = uf(nodes.length);
  const edges = [];
  for (let a = 0; a < nodes.length; a++) {
    const ia = nodes[a], ca = e.owner[ia]; const ra = 14 * sim.mod(ca, 'gridRange', 1);
    for (let b = a + 1; b < nodes.length; b++) {
      const ib = nodes[b]; if (e.owner[ib] !== ca) continue;
      const dx = e.x[ia] - e.x[ib], dy = e.y[ia] - e.y[ib];
      if (dx * dx + dy * dy <= ra * ra) { union(p, a, b); edges.push(e.x[ia], e.y[ia], e.x[ib], e.y[ib], ca); }
    }
  }
  const nComp = nodes.length; const sup = new Float64Array(nComp), dem = new Float64Array(nComp);
  const daylight = sim.env.daylight;
  // üretim (yakıt tüketimi 10 tick'lik)
  for (let a = 0; a < nodes.length; a++) {
    const i = nodes[a]; const bd = BUILDINGS[e.def[i]]; if (bd.power <= 0) continue;
    const co = sim.countries[e.owner[i]];
    let out = bd.power * Math.max(0.2, e.hp[i] / e.maxhp[i]);
    if (bd.solar) out *= 0.15 + 0.85 * daylight * (sim.env.weather === 'clear' ? 1 : 0.55);
    if (bd.fuelRes) {
      const r = R[bd.fuelRes]; const need = bd.burn * 10;
      if (co.res[r] >= need) co.res[r] -= need; else { out *= co.res[r] / need; co.res[r] = 0; }
    }
    if (bd.id === 'hydro' && sim.env.season === 1) out *= 0.7; // yaz kuraklığı
    e.sat[i] = 1;
    sup[find(p, a)] += out;
  }
  // tüketici -> en yakın düğüm
  const attach = new Int32Array(cons.length).fill(-1);
  for (let k = 0; k < cons.length; k++) {
    const i = cons[k], c = e.owner[i]; const isCity = e.kind[i] === KIND.CITY;
    const maxR = (isCity ? 12 : 9) * sim.mod(c, 'gridRange', 1); let best = -1, bd2 = maxR * maxR;
    for (let a = 0; a < nodes.length; a++) {
      const n = nodes[a]; if (e.owner[n] !== c) continue;
      const dx = e.x[n] - e.x[i], dy = e.y[n] - e.y[i], dd = dx * dx + dy * dy;
      if (dd <= bd2) { bd2 = dd; best = a; }
    }
    attach[k] = best;
    if (best >= 0) {
      const dm = consumerDemand(sim, i);
      dem[find(p, best)] += dm;
      edges.push(e.x[i], e.y[i], e.x[nodes[best]], e.y[nodes[best]], c | 0x100); // ince dağıtım hattı
    }
  }
  const sat = new Float64Array(nComp);
  for (let a = 0; a < nComp; a++) if (find(p, a) === a) sat[a] = dem[a] > 0 ? Math.min(1, sup[a] / dem[a]) : 1;
  for (const co of sim.countries) { co.power.supply = 0; co.power.demand = 0; }
  for (let a = 0; a < nComp; a++) if (find(p, a) === a) {
    const c = e.owner[nodes[a]]; sim.countries[c].power.supply += sup[a]; sim.countries[c].power.demand += dem[a];
  }
  const hasGen = (c) => sim.mod(c, 'generators', 0) > 0;
  for (let k = 0; k < cons.length; k++) {
    const i = cons[k]; let s = attach[k] >= 0 ? sat[find(p, attach[k])] : 0;
    const bd = e.kind[i] === KIND.BUILDING ? BUILDINGS[e.def[i]] : null;
    const prev = e.flags[i] & F.POWERED;
    e.flags[i] &= ~F.GENERATOR;
    // jeneratör: radarlar her zaman, diğer kritik binalar teknolojiyle
    if (s < 0.5 && bd && ((e.mask[i] & C.RADAR) || ((e.mask[i] & (C.AD | C.BASE | C.COMMS | C.JAMMER)) && hasGen(e.owner[i])))) {
      const co = sim.countries[e.owner[i]];
      if (co.res[R.fuel] > 0.1) { co.res[R.fuel] -= 0.1; s = 0.75; e.flags[i] |= F.GENERATOR; }
    }
    e.sat[i] = s;
    if (s >= 0.35) e.flags[i] |= F.POWERED; else e.flags[i] &= ~F.POWERED;
    if (prev && !(e.flags[i] & F.POWERED) && !(e.flags[i] & (F.RUINED | F.BUILDING))) {
      if (e.kind[i] === KIND.CITY) { sim.emit({ k: 'blackout', id: i }); if (sim.tick > 20) sim.notify(e.owner[i], 'n_blackout', [sim.cityInfo.get(i)?.name || ''], e.x[i], e.y[i], 2); }
    }
  }
  // kendi elektriğini üreten düğümler POWERED
  for (const i of nodes) e.flags[i] |= F.POWERED;
  sim.net.power = edges;
}
export function consumerDemand(sim, i) {
  const e = sim.e;
  if (e.kind[i] === KIND.CITY) return (e.buf[i] / 1000) * 2.2 * sim.mod(e.owner[i], 'powerUse', 1);
  if (e.flags[i] & (F.RUINED | F.BUILDING)) return 0;
  const bd = BUILDINGS[e.def[i]];
  let dm = -bd.power * sim.mod(e.owner[i], 'powerUse', 1);
  if ((e.mask[i] & (C.RADAR | C.JAMMER)) && !(e.flags[i] & F.EMIT_ON)) dm *= 0.2;
  if ((e.mask[i] & C.FACTORY) && !e.item[i] && bd.caps && !bd.caps.includes('research')) dm *= 0.3;
  return dm;
}

// ---------- YAKIT (boru hattı) ----------
function updateFuel(sim) {
  const e = sim.e, nodes = [];
  e.each(C.FUELNET, (i) => { if (ok(e, i)) nodes.push(i); else e.flags[i] &= ~F.FUELED; });
  const p = uf(nodes.length), edges = [];
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
    const ia = nodes[a], ib = nodes[b]; if (e.owner[ia] !== e.owner[ib]) continue;
    const dx = e.x[ia] - e.x[ib], dy = e.y[ia] - e.y[ib];
    if (dx * dx + dy * dy <= 16 * 16) { union(p, a, b); edges.push(e.x[ia], e.y[ia], e.x[ib], e.y[ib], e.owner[ia]); }
  }
  const hasRef = new Set(), hasDep = new Set();
  for (let a = 0; a < nodes.length; a++) {
    const id = BUILDINGS[e.def[nodes[a]]].id;
    if (id === 'refinery') hasRef.add(find(p, a));
    if (id === 'depot' || id === 'hq' || id === 'port') hasDep.add(find(p, a));
  }
  for (let a = 0; a < nodes.length; a++) {
    const i = nodes[a], r = find(p, a), id = BUILDINGS[e.def[i]].id;
    const piped = id === 'well' ? hasRef.has(r) || hasDep.has(r) : hasDep.has(r);
    if (piped) e.flags[i] |= F.FUELED; else e.flags[i] &= ~F.FUELED;
  }
  sim.net.fuel = edges;
}

// ---------- HABERLEŞME ----------
function updateComms(sim) {
  const e = sim.e, nodes = [];
  e.each(C.COMMS, (i) => { if (ok(e, i) && (e.flags[i] & F.POWERED || BUILDINGS[e.def[i]].id === 'hq' || e.flags[i] & F.GENERATOR)) nodes.push(i); });
  const p = uf(nodes.length), edges = [];
  const rng = (i) => BUILDINGS[e.def[i]].comms || 15;
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
    const ia = nodes[a], ib = nodes[b]; if (e.owner[ia] !== e.owner[ib]) continue;
    const r = Math.max(rng(ia), rng(ib));
    const dx = e.x[ia] - e.x[ib], dy = e.y[ia] - e.y[ib];
    if (dx * dx + dy * dy <= r * r) { union(p, a, b); edges.push(e.x[ia], e.y[ia], e.x[ib], e.y[ib], e.owner[ia]); }
  }
  const linkedRoot = new Set();
  for (let a = 0; a < nodes.length; a++) if (BUILDINGS[e.def[nodes[a]]].id === 'hq') linkedRoot.add(find(p, a));
  const linked = nodes.filter((_, a) => linkedRoot.has(find(p, a)));
  sim.net.commsNodes = linked;
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || (e.flags[i] & F.DEAD) || e.owner[i] >= sim.countries.length) continue;
    const k = e.kind[i]; if (k === KIND.PROJ || k === KIND.CONVOY || k === KIND.CITY) continue;
    let L = false; const c = e.owner[i];
    for (const n of linked) {
      if (e.owner[n] !== c) continue;
      const r = rng(n) * 1.2; const dx = e.x[n] - e.x[i], dy = e.y[n] - e.y[i];
      if (dx * dx + dy * dy <= r * r) { L = true; break; }
    }
    if (L) e.flags[i] |= F.LINKED; else e.flags[i] &= ~F.LINKED;
  }
  sim.net.comms = edges;
}

// ---------- SU ----------
function updateWater(sim) {
  const e = sim.e, map = sim.map, src = [];
  e.each(C.WATER, (i) => { if (ok(e, i) && (e.flags[i] & F.POWERED || BUILDINGS[e.def[i]].id === 'hydro')) src.push(i); });
  const edges = [];
  e.each(C.CITY, (i) => {
    const c = e.owner[i]; let w = false;
    for (const s of src) {
      if (e.owner[s] !== c) continue;
      const dx = e.x[s] - e.x[i], dy = e.y[s] - e.y[i];
      if (dx * dx + dy * dy <= 16 * 16) { w = true; edges.push(e.x[s], e.y[s], e.x[i], e.y[i], c); break; }
    }
    if (!w) { // doğal kaynak (nehir/göl kıyısı) kısmi su sağlar
      const cx = e.x[i] | 0, cy = e.y[i] | 0;
      for (let dy = -4; dy <= 4 && !w; dy++) for (let dx = -4; dx <= 4; dx++) {
        if (!map.inb(cx + dx, cy + dy)) continue; const t = map.ter[(cy + dy) * map.W + cx + dx];
        if (t === T.RIVER || t === T.LAKE) { w = true; break; }
      }
      e.timer[i] = w ? 0.6 : 0; // su seviyesi
    } else e.timer[i] = 1;
    if (w) e.flags[i] |= F.WATERED; else e.flags[i] &= ~F.WATERED;
  });
  sim.net.water = edges;
}

// ---------- ULAŞIM ----------
export function updateTransport(sim) {
  const e = sim.e, map = sim.map, nC = sim.countries.length;
  const depotComps = Array.from({ length: nC }, () => new Set());
  e.each(C.DEPOT, (i) => { if (ok(e, i) && e.aux[i] >= 0 && e.owner[i] < nC) { const rc = map.roadComp[e.aux[i]]; if (rc >= 0) depotComps[e.owner[i]].add(rc); } });
  sim.depotComps = depotComps;
  e.each(C.BUILDING, (i) => {
    if (e.owner[i] >= nC) return;
    const rc = e.aux[i] >= 0 ? map.roadComp[e.aux[i]] : -1;
    if (rc >= 0 && depotComps[e.owner[i]].has(rc)) e.flags[i] |= F.CONNECTED; else e.flags[i] &= ~F.CONNECTED;
  });
}
