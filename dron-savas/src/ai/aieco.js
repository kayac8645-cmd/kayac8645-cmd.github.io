// YZ ekonomi planlayıcısı: inşa sırası, kaynak yatakları, enerji dengesi, üretim seçimi, araştırma.
// Yalnız komut üretir; oyuncuyla aynı kurallar (maliyet, yerleştirme, teknoloji).
import { KIND, C, F } from '../core/ecs.js';
import { CMD } from '../core/commands.js';
import { BUILDINGS, B } from '../data/buildings.js';
import { ITEMS, ITEM_BY, RECRUITS, RECRUIT_BY, R } from '../data/defs.js';
import { TECHS, TECH_BY } from '../data/tech.js';
import { findSpot, canPlace, PRODUCT } from '../sim/build.js';

const usable = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));

export function census(sim, c) {
  const e = sim.e; const cnt = {}; const list = {}; const units = {};
  for (let i = 0; i < e.hi; i++) {
    if (!e.kind[i] || e.owner[i] !== c || (e.flags[i] & F.DEAD)) continue;
    if (e.kind[i] === KIND.BUILDING) {
      const id = BUILDINGS[e.def[i]].id; cnt[id] = (cnt[id] || 0) + 1; (list[id] = list[id] || []).push(i);
    } else if (e.kind[i] === KIND.GROUND || e.kind[i] === KIND.NAVAL) {
      const id = sim.udef(i).id; (units[id] = units[id] || []).push(i);
    }
  }
  return { cnt, list, units };
}

function tryBuild(sim, brain, c, defId, nx, ny, r = 18, allowDep = false) {
  const d = B[defId]; const bd = BUILDINGS[d];
  if (!sim.techOk(c, bd.tech) || !sim.canAfford(c, bd.cost)) return false;
  const s = findSpot(sim, c, d, nx, ny, r, brain.rng, allowDep);
  if (!s) return false;
  if (canPlace(sim, c, d, s[0], s[1]) !== '') return false;
  sim.issue({ type: CMD.BUILD, c, def: d, x: s[0], y: s[1], hard: bd.cat === 'mil' && brain.p.defense > 0.7 && sim.countries[c].money > 8000 });
  brain.pendingBuild = (brain.pendingBuild || 0) + 1;
  // aynı turda maliyet iki kez harcanmasın
  sim.countries[c].money -= 0; return true;
}

function freeDeposit(sim, c, res, cx, cy) {
  const map = sim.map; let best = null, bd = 1e9; const W = map.W;
  const R0 = 60;
  for (let y = Math.max(0, cy - R0); y < Math.min(map.H, cy + R0); y += 1) for (let x = Math.max(0, cx - R0); x < Math.min(W, cx + R0); x += 1) {
    const i = y * W + x; if (map.res[i] !== res || map.owner[i] !== c || map.occ[i]) continue;
    const d = (x - cx) * (x - cx) + (y - cy) * (y - cy); if (d < bd) { bd = d; best = [x, y]; }
  }
  return best;
}

export function planEconomy(sim, brain, c, cs) {
  const co = sim.countries[c], e = sim.e; const cap = brain.home; const n = (id) => cs.cnt[id] || 0;
  // para fazlası -> eksik malzemeyi ithal et
  if (co.money > 2500) for (const [res, low, amt] of [['steel', 60, 60], ['electronics', 30, 30], ['supply', 40, 60], ['fuel', 40, 60], ['composite', 20, 20], ['explosives', 25, 30], ['coal', 40, 60], ['iron', 30, 40], ['copper', 20, 30]]) {
    if (co.res[R[res]] < low && co.money > 1500 + amt * 50) sim.issue({ type: CMD.MARKET, c, res, amt: Math.round(amt / 2) });
  }
  const p = brain.p; let builds = 0; const maxB = brain.diff.buildPer + (co.money > 12000 ? 1 : 0);
  const under = () => { let k = 0; e.each(C.BUILDING, (i) => { if (e.owner[i] === c && (e.flags[i] & F.BUILDING)) k++; }); return k; };
  if (under() >= 3 + brain.diff.buildPer) return;
  const B_ = (id, x = cap[0], y = cap[1], r = 18, dep = false) => { if (builds >= maxB) return true; if (tryBuild(sim, brain, c, id, x, y, r, dep)) { builds++; return true; } return false; };
  // 1) enerji dengesi
  const ps = co.power.supply, pd = co.power.demand;
  // yakıt durumuna göre santral: kömür madeni/stoku yoksa gaz, o da yoksa güneş (yakıtsız)
  const coalMine = (cs.list.mine || []).some((i) => e.res[i] === 2);
  const gasWell = (cs.list.well || []).some((i) => e.res[i] === 4);
  const coalOK = coalMine || co.res[R.coal] > 150, gasOK = gasWell || co.res[R.gas] > 80;
  if (ps < pd * 1.15 + 25) {
    if (co.res[R.uranium] > 40 && n('nuclear') < 1 && co.money > 12000) B_('nuclear', cap[0] + 10, cap[1] + 6, 26);
    else if (gasOK && n('gas_plant') < 3) B_('gas_plant', cap[0] - 8, cap[1] + 8, 24);
    else if (coalOK && n('coal_plant') < 3) B_('coal_plant', cap[0] + 9, cap[1] + 2, 26);
    else B_('solar', cap[0] + 8, cap[1] - 8, 24);
  }
  if (ps < pd * 0.9 && co.money < 4000) return; // elektrik açığı: önce santral için para biriktir
  // kömürü biten santral için acil ithalat
  if (n('coal_plant') && !coalMine && co.res[R.coal] < 25 && co.money > 400) sim.issue({ type: CMD.MARKET, c, res: 'coal', amt: Math.min(40, Math.floor(co.money / 12)) });
  // her şehrin yakınında trafo
  e.each(C.CITY, (i) => { if (e.owner[i] !== c || builds >= maxB) return; if (!(e.flags[i] & F.POWERED) && sim.tick % 3 === 0) B_('substation', e.x[i] + 2, e.y[i] + 2, 8); });
  // 2) madenler
  const wantMines = [[2, 2 + (p.industry > 0.8 ? 1 : 0)], [1, 3 + (p.industry > 0.8 ? 1 : 0)], [5, 2], [7, 1], [6, sim.has(c, 'p_nuclear') ? 1 : 0]];
  for (const [res, k] of wantMines) {
    const have = (cs.list.mine || []).filter((i) => e.res[i] === res).length;
    if (have < k) { const dep = freeDeposit(sim, c, res, cap[0], cap[1]); if (dep) B_('mine', dep[0], dep[1], 2, true); }
  }
  for (const [res, k] of [[3, 2], [4, 1]]) {
    const have = (cs.list.well || []).filter((i) => e.res[i] === res).length;
    if (have < k) { const dep = freeDeposit(sim, c, res, cap[0], cap[1]); if (dep) B_('well', dep[0], dep[1], 1, true); }
  }
  // 3) sanayi zinciri
  // şehir kurma: kaynak bölgelerine doğru sınırı genişlet
  const nCities = (() => { let k = 0; e.each(C.CITY, (i) => { if (e.owner[i] === c) k++; }); return k; })();
  const wantCities = Math.min(6, 1 + Math.floor(sim.tick / 2500) + (p.industry > 0.7 ? 1 : 0));
  if (nCities + (cs.cnt.city_found || 0) < wantCities && co.money > 3300) foundCityToward(sim, brain, c, cap);
  const seq = [
    ['depot', 1], ['barracks', 1], ['steel_mill', 1], ['substation', 1], ['drone_base', 1], ['refinery', 1], ['electronics', 1], ['munitions', 1], ['drone_fac', 1], ['radar', 1],
    ['textile', 1], ['food', 1], ['vehicle_fac', 1], ['steel_mill', 2], ['missile_fac', 1], ['pump', 1], ['fire_station', 1], ['appliance', 1], ['relay', 2], ['drone_base', 2], ['auto', 1],
    ['electronics', 2], ['aa_gun', 3], ['jammer', 1], ['sigint', 1], ['radar', 2], ['sam_site', 1], ['drone_fac', 2],
    ['missile_base', 1], ['ciws', 2], ['airbase', 1], ['cmd', 1], ['satellite', 1], ['laser', 1], ['bunker', 4],
  ];
  for (const [id, k] of seq) {
    if (builds >= maxB) break;
    if (n(id) >= k) continue;
    const bd = BUILDINGS[B[id]]; if (!sim.techOk(c, bd.tech)) continue;
    let ax = cap[0], ay = cap[1], r = 22;
    if (id === 'drone_base' || id === 'relay' || id === 'jammer' || id === 'bunker') { const f = brain.front || cap; ax = (cap[0] * 2 + f[0]) / 3; ay = (cap[1] * 2 + f[1]) / 3; }
    if (id === 'pump') r = 26;
    if (id === 'radar' && n('radar') >= 1) { const f = brain.front || cap; ax = (cap[0] + f[0]) / 2; ay = (cap[1] + f[1]) / 2; }
    if (!B_(id, ax, ay, r)) { if (sim.countries[c].money < (bd.cost.money || 0)) break; }
  }
}

// sınırdan bir kaynak yatağına doğru yeni şehir
function foundCityToward(sim, brain, c, cap) {
  const map = sim.map, dep = sim.deposits; let best = null, bd = 1e18;
  for (const d of dep.list) {
    if (d.reserve <= 0) continue; const o = map.owner[d.tiles[0]]; if (o === c || (o !== 255)) continue;
    const dd = (d.x - cap[0]) ** 2 + (d.y - cap[1]) ** 2; if (dd > 70 * 70) continue;
    const v = dd / (1 + d.reserve / 2000) * (0.7 + brain.rng.next() * 0.6); if (v < bd) { bd = v; best = d; }
  }
  if (!best) return;
  // başkentten yatağa doğru ilerle: kendi toprağının bittiği yerin 2 karo ötesi
  const dx = best.x - cap[0], dy = best.y - cap[1], L = Math.sqrt(dx * dx + dy * dy) || 1; let px = cap[0], py = cap[1];
  for (let s = 0; s < L; s++) { const x = (cap[0] + dx / L * s) | 0, y = (cap[1] + dy / L * s) | 0; if (!map.inb(x, y)) break; if (map.owner[y * map.W + x] !== c) { px = x + (dx / L * 2) | 0; py = y + (dy / L * 2) | 0; break; } }
  for (let r = 0; r <= 6; r++) for (let oy = -r; oy <= r; oy++) for (let ox = -r; ox <= r; ox++) {
    if (Math.max(Math.abs(ox), Math.abs(oy)) !== r) continue;
    const x = px + ox, y = py + oy;
    if (canPlace(sim, c, B.city_found, x, y) === '') { sim.issue({ type: CMD.BUILD, c, def: B.city_found, x, y }); return; }
  }
}

// fabrika ürünleri
export function planProduction(sim, brain, c, cs) {
  const e = sim.e, co = sim.countries[c], p = brain.p; const war = sim.diplo.warCount(c) > 0;
  const it = (id) => ITEM_BY[id] + 1; const has = (t) => !t || sim.has(c, t);
  const stock = (id) => co.items[ITEM_BY[id]];
  for (const i of cs.list.drone_fac || []) {
    if (!usable(e, i)) continue;
    let pick = 'fpv';
    const r = brain.rng.next();
    if (stock('recon_quad') < 3) pick = 'recon_quad';
    else if (brain.enemyDrones > 3 && has('a_intdrone') && stock('interceptor_drone') < 8) pick = 'interceptor_drone';
    else if (has('d_lr') && r < 0.25 + p.sead * 0.15 && stock('lr_kamikaze') < 12) pick = 'lr_kamikaze';
    else if (has('d_uav') && stock('recon_uav') < 2 && r < 0.4) pick = 'recon_uav';
    else if (has('d_male') && stock('male') < 2 && r < 0.3 && co.money > 4000) pick = 'male';
    else if (has('d_mother') && r < 0.12) pick = 'mothership';
    else if (has('d_fiber') && brain.jamLoss > 0.3 && r < 0.5) pick = 'fpv_fiber';
    else if (r < 0.2) pick = 'bomber_quad';
    if (stock('fpv') > 60 && pick === 'fpv') pick = has('d_lr') ? 'lr_kamikaze' : 'bomber_quad';
    if (e.item[i] !== it(pick) && e.state[i] === 0) sim.issue({ type: CMD.SET_PRODUCT, c, e: i, p: it(pick) });
  }
  const adUnits = (cs.units.sam_short || []).length + (cs.units.corvette || []).length;
  const medU = (cs.units.sam_med || []).length, longU = (cs.units.sam_long || []).length + (cs.cnt.sam_site || 0);
  for (const i of cs.list.missile_fac || []) {
    if (!usable(e, i)) continue;
    let pick = 'sam_s';
    if (adUnits && stock('sam_s') < 8) pick = 'sam_s';
    else if (medU && stock('sam_m') < 8 && has('a_med')) pick = 'sam_m';
    else if (longU && stock('sam_l') < 6 && has('a_long')) pick = 'sam_l';
    else if (war && has('m_arm') && stock('arm') < 4 && p.sead > 0.5) pick = 'arm';
    else if (war && has('m_cruise') && stock('cruise') < 6 && (cs.cnt.missile_base || 0)) pick = 'cruise';
    else if (war && has('m_ballistic') && stock('ballistic') < 3 && p.missiles > 0.6 && (cs.cnt.missile_base || 0)) pick = 'ballistic';
    else if (has('m_guided') && stock('guided_rocket') < 12 && (cs.units.mlrs || []).length) pick = 'guided_rocket';
    else if ((cs.units.male || []).length || stock('male')) pick = 'agm';
    else if (has('l_air') && (cs.cnt.airbase || 0) && stock('fighter') + stock('heli') < 2) pick = brain.rng.next() < 0.5 ? 'fighter' : 'heli';
    if (e.item[i] !== it(pick) && e.state[i] === 0) sim.issue({ type: CMD.SET_PRODUCT, c, e: i, p: it(pick) });
  }
  for (const i of cs.list.munitions || []) {
    if (!usable(e, i)) continue;
    let pick;
    if (co.res[R.explosives] < 20) pick = PRODUCT.RECIPE + 1;
    else if (co.res[R.supply] < 60) pick = PRODUCT.RECIPE + 2;
    else if (stock('rocket') < 40 && (cs.units.mlrs || []).length) pick = it('rocket');
    else pick = PRODUCT.RECIPE + 2;
    if (e.item[i] !== pick && e.state[i] === 0) sim.issue({ type: CMD.SET_PRODUCT, c, e: i, p: pick });
  }
  for (const i of cs.list.electronics || []) {
    if (!usable(e, i)) continue;
    const pick = co.res[R.composite] < co.res[R.electronics] * 0.6 ? PRODUCT.RECIPE + 2 : co.res[R.rare] > 2 ? PRODUCT.RECIPE + 3 : PRODUCT.RECIPE + 1;
    if (e.item[i] !== pick && e.state[i] === 0) sim.issue({ type: CMD.SET_PRODUCT, c, e: i, p: pick });
  }
  // kara birimleri
  const U = (id) => (cs.units[id] || []).length;
  const army = U('inf') + U('armor') + U('mech');
  const wantArmy = 4 + Math.floor(sim.tick / 1500) + (war ? 4 : 0) + Math.floor(p.aggr * 4);
  for (const i of cs.list.barracks || []) {
    if (!usable(e, i)) continue;
    let pick = 0;
    if (U('engineer') < 2) pick = PRODUCT.UNIT + RECRUIT_BY.engineer + 1;
    else if (army < wantArmy && co.money > 600) pick = PRODUCT.UNIT + RECRUIT_BY.inf + 1;
    if (e.item[i] !== pick && e.state[i] === 0) sim.issue({ type: CMD.SET_PRODUCT, c, e: i, p: pick });
  }
  for (const i of cs.list.vehicle_fac || []) {
    if (!usable(e, i)) continue;
    let pick = 0; const r = brain.rng.next();
    const cand = [];
    if (U('sam_short') < 2 + p.defense * 2) cand.push('sam_short');
    if (U('mlrs') < 2 + (war ? 2 : 0)) cand.push('mlrs');
    if (army < wantArmy) cand.push(sim.has(c, 'l_armor') && r < 0.5 ? 'armor' : 'mech');
    if (U('artillery') < 2 + (war ? 1 : 0)) cand.push('artillery');
    if (U('ad_bat') < 2) cand.push('ad_bat');
    if (sim.has(c, 'e_jam') && U('ew_bat') < 1 + (war ? 1 : 0)) cand.push('ew_bat');
    if (sim.has(c, 'a_med') && U('sam_med') < 1 + p.defense) cand.push('sam_med');
    if (sim.has(c, 'a_long') && U('sam_long') < 1) cand.push('sam_long');
    if (cand.length && co.money > 900) pick = PRODUCT.UNIT + RECRUIT_BY[cand[(r * cand.length) | 0]] + 1;
    if (e.item[i] !== pick && e.state[i] === 0) sim.issue({ type: CMD.SET_PRODUCT, c, e: i, p: pick });
  }
  for (const i of cs.list.port || []) {
    if (!usable(e, i)) continue;
    const pick = U('corvette') < 1 && co.money > 3000 ? PRODUCT.UNIT + RECRUIT_BY.corvette + 1 : 0;
    if (e.item[i] !== pick && e.state[i] === 0) sim.issue({ type: CMD.SET_PRODUCT, c, e: i, p: pick });
  }
}

const BR_W = (p) => ({ drone: 0.5 + p.drones, missile: 0.3 + p.missiles, ad: 0.4 + p.defense, ew: 0.3 + p.sead * 0.6, industry: 0.4 + p.industry, energy: 0.5 + p.industry * 0.5, logistics: 0.4 + p.aggr * 0.3 });
export function planResearch(sim, brain, c) {
  const co = sim.countries[c]; if (co.researching >= 0) return;
  const w = BR_W(brain.p); let best = null, bs = -1;
  for (const t of TECHS) {
    const ti = TECH_BY[t.id]; if (co.tech[ti]) continue;
    if (!t.req.every((r) => co.tech[TECH_BY[r]])) continue;
    const s = w[t.br] * (1000 / (t.cost + 300)) * (0.7 + brain.rng.next() * 0.6) * (t.id === 'l_armor' || t.id === 'a_med' || t.id === 'e_jam' || t.id === 'm_guided' ? 1.5 : 1);
    if (s > bs) { bs = s; best = t.id; }
  }
  if (best) sim.issue({ type: CMD.RESEARCH, c, tech: best });
}
