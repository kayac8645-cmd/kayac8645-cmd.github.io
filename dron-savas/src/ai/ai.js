// Düşman yapay zekâsı: kişilik + üç katmanlı karar (stratejik / operasyonel / taktik).
// Hesaplar ülkeler arasında zamana yayılır. Aynı kurallar ve aynı savaş sisi: yalnız co.known/emitters/seenBy okunur.
import { RNG } from '../core/rng.js';
import { KIND, C, F } from '../core/ecs.js';
import { CMD } from '../core/commands.js';
import { BUILDINGS } from '../data/buildings.js';
import { UNITS, ITEMS, ITEM_BY, AD_SYS, BANDS, CLS } from '../data/defs.js';
import { DIFFICULTY } from '../data/ai.js';
import { militaryStrength } from '../sim/diplomacy.js';
import { census, planEconomy, planProduction } from './aieco.js';
import { LAUNCHERS } from '../sim/missiles.js';
import { GM } from '../sim/ground.js';

const usable = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));

export function initAI(sim) {
  sim.ai = sim.countries.map((co) => {
    if (!co.ai) return null;
    const p = co.personality; const diff = DIFFICULTY[sim.opts.difficulty ?? 1];
    return { c: co.id, p, diff, rng: new RNG((sim.opts.seed * 31 + co.id * 977) >>> 0), home: null, front: null,
      nextS: 30 + co.id * 13, nextO: 10 + co.id * 7, nextT: 3 + co.id * 3, enemy: -1, enemyDrones: 0, jamLoss: 0, lastLoss: 0, emcon: 0, strikeAt: 0 };
  });
}

export function updateAI(sim) {
  if (!sim.ai) return;
  const t = sim.tick;
  for (const b of sim.ai) {
    if (!b) continue; const co = sim.countries[b.c]; if (!co.alive || !co.placed) continue;
    if (!b.home) { const cp = sim.world.countries[b.c].capital; b.home = [cp.x, cp.y]; }
    // aynı tick'te en fazla bir katman ağır iş yapar (8 ülke telefonu yormasın)
    if (t >= b.nextS) { b.nextS = t + b.diff.strat; strategic(sim, b); continue; }
    if (t >= b.nextO) { b.nextO = t + b.diff.oper; operational(sim, b); continue; }
    if (t >= b.nextT) { b.nextT = t + b.diff.tact; tactical(sim, b); }
  }
}

const noisy = (b) => b.rng.next() < b.diff.noise;

// ---------------- STRATEJİK ----------------
function strategic(sim, b) {
  const c = b.c, co = sim.countries[c], d = sim.diplo, p = b.p;
  const myS = militaryStrength(sim, c);
  const others = sim.countries.filter((x) => x.alive && x.id !== c);
  // ana rakip: en yakın başkent
  let nearest = null, nd = 1e18;
  for (const o of others) { const cp = sim.world.countries[o.id].capital; if (!cp) continue; const dd = (cp.x - b.home[0]) ** 2 + (cp.y - b.home[1]) ** 2; if (dd < nd) { nd = dd; nearest = o; } }
  const atWarWith = others.filter((o) => d.atWar(c, o.id));
  b.enemy = atWarWith.length ? atWarWith.sort((a, b2) => militaryStrength(sim, a.id) - militaryStrength(sim, b2.id))[0].id : nearest ? nearest.id : -1;
  if (b.enemy >= 0) { const cp = sim.world.countries[b.enemy].capital; b.front = [(b.home[0] + cp.x) / 2, (b.home[1] + cp.y) / 2]; }
  // savaş kararı
  // ilk günler barış: insan oyuncuya kurulum süresi (zorluk düştükçe uzar)
  const grace = 4300 - p.aggr * 1500 + [3000, 1200, 0, -600][b.diff === DIFFICULTY[0] ? 0 : b.diff === DIFFICULTY[1] ? 1 : b.diff === DIFFICULTY[2] ? 2 : 3];
  if (sim.tick > grace && !noisy(b)) {
    if (!atWarWith.length) {
      let target = null, best = 0;
      for (const o of others) {
        if (d.allied(c, o.id) || d.get(c, o.id) === 2) continue;
        const cp = sim.world.countries[o.id].capital; const dist = Math.sqrt((cp.x - b.home[0]) ** 2 + (cp.y - b.home[1]) ** 2);
        const ratio = myS / Math.max(1, militaryStrength(sim, o.id));
        const busy = d.warCount(o.id) > 0 ? p.opportun * 0.8 : 0;
        const score = ratio * (0.6 + p.aggr) + busy - dist / (sim.map.W * 1.2) - d.relOf(c, o.id) / 120;
        if (score > best) { best = score; target = o; }
      }
      const threshold = 1.55 - p.aggr * 0.6 - (sim.tick > 12000 ? 0.4 : 0) - (sim.tick > 36000 ? 0.5 : 0);
      if (target && best > threshold) sim.issue({ type: CMD.DIPLO, c, action: 'war', target: target.id });
    } else {
      // kaybediyorsa ateşkes/barış dene
      if (co.territory < (co.territoryMax || co.territory0) * 0.75 && b.rng.next() < 0.5) sim.issue({ type: CMD.DIPLO, c, action: b.rng.next() < 0.5 ? 'ceasefire' : 'peace', target: atWarWith[0].id });
      // ittifak arayışı: ortak düşman
      if (p.alliance > 0.5) for (const o of others) {
        if (d.allied(c, o.id) || d.atWar(c, o.id)) continue;
        if (atWarWith.some((en) => d.atWar(o.id, en.id)) && b.rng.next() < p.alliance * 0.5) { sim.issue({ type: CMD.DIPLO, c, action: 'alliance', target: o.id }); break; }
      }
      // ihanet: fırsatçı, zayıf müttefike saldırır
      if (p.opportun > 0.8 && b.rng.next() < 0.1) for (const o of others) {
        if (d.allied(c, o.id) && militaryStrength(sim, o.id) < myS * 0.5) { sim.issue({ type: CMD.DIPLO, c, action: 'war', target: o.id }); break; }
      }
    }
  }
  // bant değişimi: karıştırma kayıpları yüksekse
  const total = co.lossByJam + co.lossByOther;
  if (total > 6) {
    b.jamLoss = co.lossByJam / total;
    if (b.jamLoss > 0.45) {
      const opts = []; for (let k = 0; k < BANDS.length; k++) if (((co.bands >>> k) & 1) && k !== co.band) opts.push(k);
      if (opts.length) sim.issue({ type: CMD.SET_BAND, c, band: opts[(b.rng.next() * opts.length) | 0] });
      co.lossByJam = 0; co.lossByOther = 0;
    }
  }
}

// ---------------- OPERASYONEL ----------------
function operational(sim, b) {
  const c = b.c, e = sim.e; const cs = census(sim, c);
  planEconomy(sim, b, c, cs);
  planProduction(sim, b, c, cs);
  // onarım öncelikleri
  for (const id of ['coal_plant', 'gas_plant', 'nuclear', 'substation', 'radar', 'hq']) for (const i of cs.list[id] || []) if (e.prio[i] !== 3 && e.hp[i] < e.maxhp[i]) sim.issue({ type: CMD.REPAIR_PRIO, c, e: i, prio: 3 });
  deployArmy(sim, b, cs);
  if (sim.diplo.warCount(c) > 0) planStrikes(sim, b, cs);
  // mühendisler hasarlı binalara/köprülere
  const eng = cs.units.engineer || [];
  if (eng.length) {
    const dmg = []; e.each(C.BUILDING, (i) => {
      if (e.hp[i] >= e.maxhp[i] * 0.95 || (e.flags[i] & F.BUILDING)) return;
      const own = e.owner[i] === c || (e.owner[i] >= sim.countries.length && sim.map.owner[sim.map.idx(e.x[i] | 0, e.y[i] | 0)] === c);
      if (own) dmg.push(i);
    });
    dmg.sort((a, b2) => e.hp[a] / e.maxhp[a] - e.hp[b2] / e.maxhp[b2]);
    eng.forEach((u, k) => { const tgt = dmg[k % Math.max(1, dmg.length)]; if (tgt !== undefined && e.dist2(u, tgt) > 16 && !e.routes.get(u)) sim.issue({ type: CMD.MOVE_UNITS, c, ids: [u], x: e.x[tgt], y: e.y[tgt] + 1.5, mode: GM.MOVE }); });
  }
}

function deployArmy(sim, b, cs) {
  const c = b.c, e = sim.e, map = sim.map;
  b.ordered = b.ordered || {};
  const fresh = (i) => !e.routes.get(i) && sim.tick - (b.ordered[i] ?? -1e9) > 400; // aynı birime sık emir verme (pahalı yol araması)
  const mark = (ids) => { for (const i of ids) b.ordered[i] = sim.tick; if (sim.tick % 2000 < 60) for (const k in b.ordered) if (!e.alive(+k)) delete b.ordered[k]; };
  const line = [...(cs.units.inf || []), ...(cs.units.mech || []), ...(cs.units.armor || [])].filter(fresh);
  const ad = [...(cs.units.ad_bat || []), ...(cs.units.sam_short || []), ...(cs.units.sam_med || []), ...(cs.units.sam_long || [])];
  const war = b.enemy >= 0 && sim.atWar(c, b.enemy);
  // hava savunması: başkent ve kritik binaların çevresine
  const crit = [...(cs.list.coal_plant || []), ...(cs.list.hq || []), ...(cs.list.drone_fac || []), ...(cs.list.refinery || []), ...(cs.list.missile_fac || [])];
  ad.forEach((u, k) => {
    if (!fresh(u) || !crit.length) return; b.ordered[u] = sim.tick;
    const t = crit[k % crit.length];
    if (e.dist2(u, t) > 25) sim.issue({ type: CMD.MOVE_UNITS, c, ids: [u], x: e.x[t] + ((k % 3) - 1) * 2, y: e.y[t] + 2, mode: GM.HOLD === 0 ? GM.MOVE : GM.MOVE });
  });
  if (!line.length) return;
  if (!war) { // sınıra doğru savunma hattı
    if (!b.front) return;
    const fx = (b.home[0] * 2 + b.front[0]) / 3, fy = (b.home[1] * 2 + b.front[1]) / 3;
    const far = line.filter((i) => (e.x[i] - fx) ** 2 + (e.y[i] - fy) ** 2 > 60);
    if (far.length) { mark(far); sim.issue({ type: CMD.MOVE_UNITS, c, ids: far, x: fx, y: fy, mode: GM.MOVE }); }
    return;
  }
  // savaşta: hedef seç (istihbarattan); %30 savunmada kalır
  const co = sim.countries[c];
  let target = null, best = -1e18;
  for (const [id, k] of co.known) {
    if (k.owner !== b.enemy) continue;
    if (k.kind !== KIND.CITY && k.kind !== KIND.BUILDING) continue;
    const dist = Math.sqrt((k.x - b.home[0]) ** 2 + (k.y - b.home[1]) ** 2);
    const val = (k.kind === KIND.CITY ? 40 : 10) + (sim.e.flags[id] & F.CAPITAL ? 30 : 0) - dist;
    if (val > best) { best = val; target = k; }
  }
  if (!target) { const cp = sim.world.countries[b.enemy].capital; target = { x: cp.x, y: cp.y }; }
  if (noisy(b) && b.front) target = { x: b.front[0], y: b.front[1] };
  const nAtk = Math.ceil(line.length * (0.55 + b.p.aggr * 0.3));
  const atk = line.slice(0, nAtk);
  if (atk.length >= 2) { mark(atk); sim.issue({ type: CMD.MOVE_UNITS, c, ids: atk, x: target.x, y: target.y, mode: GM.ATTACK }); }
  const art = (cs.units.artillery || []).filter(fresh); mark(art);
  if (art.length && atk.length) { const a0 = atk[0]; sim.issue({ type: CMD.MOVE_UNITS, c, ids: art, x: (e.x[a0] + b.home[0]) / 2 * 0.3 + e.x[a0] * 0.7, y: (e.y[a0] + b.home[1]) / 2 * 0.3 + e.y[a0] * 0.7, mode: GM.MOVE }); }
  const ew = cs.units.ew_bat || [];
  if (ew.length && atk.length) sim.issue({ type: CMD.MOVE_UNITS, c, ids: ew, x: e.x[atk[0]] - 2, y: e.y[atk[0]] - 2, mode: GM.MOVE });
  void map;
}

// hedef değeri: kişilik ve taktiklere göre
function targetValue(sim, b, k) {
  const p = b.p;
  if (k.kind === KIND.BUILDING) {
    if (k.ruined) return -1;
    const bd = BUILDINGS[k.def]; if (!bd) return -1;
    let v = 2;
    if (bd.radar) v = 10 + p.sead * 12;
    else if (bd.ad) v = 8 + p.sead * 8;
    else if (bd.id === 'substation') v = 9 + p.aggr * 4;
    else if (bd.caps && bd.caps.includes('power')) v = 11 + p.aggr * 4;
    else if (bd.id === 'refinery' || bd.id === 'depot') v = 9;
    else if (bd.caps && bd.caps.includes('factory')) v = 7;
    else if (bd.id === 'drone_base' || bd.id === 'missile_base' || bd.id === 'airbase') v = 8;
    else if (bd.id === 'bridge') v = 5;
    else if (bd.id === 'hydro') v = 10;
    if (b.diff.tactics === 0) v = 5 + (k.def % 5); // kolay: hedef seçimi zayıf
    return v * (k.exact ? 1 : 0.6);
  }
  if (k.kind === KIND.CONVOY) return sim.tick - k.t < 40 ? 8 : -1;
  if (k.kind === KIND.GROUND) { const u = UNITS[k.def]; return sim.tick - k.t > 60 ? -1 : u.ad ? 9 + p.sead * 5 : u.role === 'mlrs' || u.role === 'arty' ? 8 : 5; }
  return -1;
}

function planStrikes(sim, b, cs) {
  const c = b.c, e = sim.e, co = sim.countries[c];
  const cand = [];
  for (const [id, k] of co.known) {
    if (!sim.atWar(c, k.owner)) continue;
    const v = targetValue(sim, b, k); if (v <= 0) continue;
    cand.push([v + b.rng.next() * 2, id, k]);
  }
  if (!cand.length) { reconMission(sim, b, cs); return; }
  cand.sort((a, b2) => b2[0] - a[0]);
  const pickN = b.diff.noise > 0.3 ? Math.min(5, cand.length) : 1;
  const [, tid, tk] = cand[(b.rng.next() * pickN) | 0];
  // fırlatma üssü
  const bases = (cs.list.drone_base || []).filter((i) => usable(e, i));
  const stock = (id) => co.items[ITEM_BY[id]];
  const distFrom = (i) => Math.sqrt((e.x[i] - tk.x) ** 2 + (e.y[i] - tk.y) ** 2);
  bases.sort((a, b2) => distFrom(a) - distFrom(b2));
  const base = bases[0];
  const isAD = tk.kind === KIND.BUILDING ? !!(BUILDINGS[tk.def].radar || BUILDINGS[tk.def].ad) : !!(tk.kind === KIND.GROUND && UNITS[tk.def].ad);
  // doyurma: önce ucuz dron sürüsü, sonra pahalı füze
  let sent = false;
  if (base !== undefined) {
    const d = distFrom(base);
    if (d < 26 && stock('fpv') >= 2 && tk.kind !== KIND.BUILDING || (d < 26 && stock('fpv') >= 4 && isAD)) {
      const n = Math.min(stock('fpv'), b.diff.tactics >= 1 ? 6 : 3);
      sim.issue({ type: CMD.MISSION, c, base, item: 'fpv', n, tx: tk.x, ty: tk.y, target: tk.kind === KIND.BUILDING ? -1 : tid });
      sent = true;
    } else if (stock('lr_kamikaze') >= 1 && d < 600) {
      const n = Math.min(stock('lr_kamikaze'), b.diff.tactics >= 2 ? 4 : 2);
      sim.issue({ type: CMD.MISSION, c, base, item: 'lr_kamikaze', n, tx: tk.x, ty: tk.y });
      sent = true;
    } else if (stock('bomber_quad') >= 1 && d < 28 && tk.kind !== KIND.BUILDING) {
      sim.issue({ type: CMD.MISSION, c, base, item: 'bomber_quad', n: Math.min(2, stock('bomber_quad')), tx: tk.x, ty: tk.y, target: tid }); sent = true;
    } else if (stock('fpv') >= 3 && d < 26) {
      sim.issue({ type: CMD.MISSION, c, base, item: 'fpv', n: Math.min(5, stock('fpv')), tx: tk.x, ty: tk.y }); sent = true;
    }
  }
  // füzeler: doyurmanın ardından
  const mb = (cs.list.missile_base || []).filter((i) => usable(e, i) && e.cool[i] <= 0);
  if (mb.length && b.diff.tactics >= 1) {
    const L = mb[0]; const d = Math.sqrt((e.x[L] - tk.x) ** 2 + (e.y[L] - tk.y) ** 2);
    let item = null;
    if (isAD && tk.kind === KIND.BUILDING && BUILDINGS[tk.def].radar && stock('arm') >= 1 && d < LAUNCHERS.missile_base.arm) item = 'arm';
    else if (stock('cruise') >= 1 && d < LAUNCHERS.missile_base.cruise && tk.kind === KIND.BUILDING) item = 'cruise';
    else if (stock('ballistic') >= 1 && d < LAUNCHERS.missile_base.ballistic && tk.kind === KIND.BUILDING && targetValue(sim, b, tk) > 10) item = 'ballistic';
    if (item) sim.issue({ type: CMD.FIRE_MISSILE, c, launcher: L, item, n: item === 'cruise' ? 2 : 1, tx: tk.x, ty: tk.y, target: item === 'arm' ? tid : -1, tick: sim.tick + (sent ? 15 : 1) });
  }
  // MALE devriyesi
  if (stock('male') >= 1 && base !== undefined && b.rng.next() < 0.3) sim.issue({ type: CMD.MISSION, c, base, item: 'male', n: 1, tx: tk.x, ty: tk.y, mode: 'patrol' });
  if (!sent) reconMission(sim, b, cs);
}

function reconMission(sim, b, cs) {
  const c = b.c, e = sim.e, co = sim.countries[c];
  const bases = (cs.list.drone_base || []).filter((i) => usable(e, i)); if (!bases.length || b.enemy < 0) return;
  const cp = sim.world.countries[b.enemy].capital;
  const base = bases[0];
  const [dx, dy] = b.rng.disk();
  const tx = Math.max(1, Math.min(sim.map.W - 2, (e.x[base] + cp.x) / 2 + dx * 12)), ty = Math.max(1, Math.min(sim.map.H - 2, (e.y[base] + cp.y) / 2 + dy * 12));
  if (co.items[ITEM_BY.recon_uav] >= 1) sim.issue({ type: CMD.MISSION, c, base, item: 'recon_uav', n: 1, tx: cp.x, ty: cp.y });
  else if (co.items[ITEM_BY.recon_quad] >= 1) sim.issue({ type: CMD.MISSION, c, base, item: 'recon_quad', n: 1, tx, ty });
}

// ---------------- TAKTİK ----------------
function tactical(sim, b) {
  const c = b.c, e = sim.e, co = sim.countries[c];
  const bit = (1 << c) >>> 0;
  let enemyDrones = 0, armThreat = false;
  const mlrs = [], radars = [], bases = [];
  for (let i = 0; i < e.hi; i++) {
    const k = e.kind[i]; if (!k || (e.flags[i] & F.DEAD)) continue;
    if (e.owner[i] === c) {
      if (k === KIND.GROUND && UNITS[e.def[i]].role === 'mlrs') mlrs.push(i);
      else if (k === KIND.BUILDING && (e.mask[i] & C.RADAR)) radars.push(i);
      else if (k === KIND.BUILDING && BUILDINGS[e.def[i]].id === 'drone_base' && usable(e, i)) bases.push(i);
      continue;
    }
    if (!(e.seenBy[i] & bit) || !sim.atWar(c, e.owner[i])) continue;
    if (k === KIND.AIR && UNITS[e.def[i]].cls <= CLS.UAV) enemyDrones++;
    if (k === KIND.PROJ && sim.pdef(i).arm) armThreat = true;
  }
  b.enemyDrones = enemyDrones;
  // radar emisyon kontrolü (ARM tehdidi)
  if (b.diff.tactics >= 2) {
    if (armThreat && !b.emcon) { b.emcon = sim.tick + 120; for (const r of radars) sim.issue({ type: CMD.TOGGLE_EMIT, c, e: r, on: false }); }
    else if (b.emcon && sim.tick > b.emcon) { b.emcon = 0; for (const r of radars) sim.issue({ type: CMD.TOGGLE_EMIT, c, e: r, on: true }); }
  }
  // önleyici dronlar
  if (enemyDrones >= 2 && co.items[ITEM_BY.interceptor_drone] >= 2 && bases.length) {
    const base = bases[0];
    sim.issue({ type: CMD.MISSION, c, base, item: 'interceptor_drone', n: Math.min(4, co.items[ITEM_BY.interceptor_drone]), tx: e.x[base], ty: e.y[base] - 4 });
  }
  // MLRS: vur-kaç
  if (sim.diplo.warCount(c) > 0) for (const m of mlrs) {
    if (e.cool[m] > 0) { // ateşten sonra yer değiştir
      if (e.cool[m] > 50 && !e.routes.get(m) && b.diff.tactics >= 1) { const [dx, dy] = b.rng.disk(); sim.issue({ type: CMD.MOVE_UNITS, c, ids: [m], x: e.x[m] + dx * 6, y: e.y[m] + dy * 6, mode: GM.MOVE }); }
      continue;
    }
    const R = 30; let best = null, bs = -1;
    for (const [id, k] of co.known) {
      if (!sim.atWar(c, k.owner)) continue;
      const d2 = (k.x - e.x[m]) ** 2 + (k.y - e.y[m]) ** 2; if (d2 > R * R) continue;
      const v = targetValue(sim, b, k); if (v > bs) { bs = v; best = [id, k]; }
    }
    if (best && co.items[ITEM_BY.rocket] >= 3) {
      const item = co.items[ITEM_BY.guided_rocket] >= 2 && best[1].kind === KIND.BUILDING ? 'guided_rocket' : 'rocket';
      sim.issue({ type: CMD.FIRE_MISSILE, c, launcher: m, item, n: item === 'rocket' ? 6 : 2, tx: best[1].x, ty: best[1].y });
    }
  }
}
