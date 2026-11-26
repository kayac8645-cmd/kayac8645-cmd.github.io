// Roket ve füzeler: balistik yay, seyir rotası (alçak, araziye göre), güdüm, stoktan tüketim,
// CEP isabet modeli (keşif verisi + GPS karıştırma/sahte sinyal), radar avcısı (ARM), önleme füzeleri
import { KIND, C, F } from '../core/ecs.js';
import { CMD, registerCommand } from '../core/commands.js';
import { PROJS, PROJ_BY, ITEMS, ITEM_BY, UNITS } from '../data/defs.js';
import { explode, applyDamage, killUnit } from './damage.js';
import { planAirRoute } from './route.js';
import { VIS_CELL } from './country.js';

// fırlatıcı -> izinli mühimmat ve menzil
export const LAUNCHERS = {
  mlrs: { rocket: 30, guided_rocket: 50 },
  missile_base: { cruise: 260, ballistic: 420, arm: 90, guided_rocket: 50 },
  coastal: { antiship: 70, cruise: 200 },
};
const usable = (e, i) => e.kind[i] && !(e.flags[i] & (F.DEAD | F.RUINED | F.BUILDING));

export function launcherKey(sim, id) {
  const e = sim.e;
  if (e.kind[id] === KIND.BUILDING) { const b = sim.bdef(id).id; return LAUNCHERS[b] ? b : null; }
  if (e.kind[id] === KIND.GROUND) { const u = sim.udef(id); return u.role === 'mlrs' ? 'mlrs' : null; }
  return null;
}

// hedef karesi yakın zamanda görüldü mü (keşif verisi)
export function reconFresh(sim, c, x, y, maxAge = 30) {
  const co = sim.countries[c]; const cx = (x / VIS_CELL) | 0, cy = (y / VIS_CELL) | 0;
  if (cx < 0 || cy < 0 || cx >= co.vw || cy >= co.vh) return false;
  const v = co.vis[cy * co.vw + cx]; return v > 0 && (sim.tick / 10 - (v - 1)) <= maxAge;
}

registerCommand(CMD.FIRE_MISSILE, (sim, cmd) => {
  const e = sim.e, co = sim.countries[cmd.c], L = cmd.launcher;
  if (!e.alive(L) || e.owner[L] !== cmd.c || !usable(e, L)) return false;
  const key = launcherKey(sim, L); if (!key) return false;
  const range = LAUNCHERS[key][cmd.item]; if (!range) return false;
  const ii = ITEM_BY[cmd.item]; const it = ITEMS[ii];
  if (!sim.techOk(cmd.c, it.tech)) return false;
  const dx = cmd.tx - e.x[L], dy = cmd.ty - e.y[L];
  if (dx * dx + dy * dy > range * range) { sim.notify(cmd.c, 'err_range', [], cmd.tx, cmd.ty, 1); return false; }
  if (e.cool[L] > 0) return false;
  const n = Math.max(1, Math.min(cmd.n | 0 || 1, key === 'mlrs' ? 6 : 4, Math.floor(co.items[ii])));
  if (co.items[ii] < 1) { sim.notify(cmd.c, 'err_nostock', ['i_' + cmd.item], -1, -1, 1); return false; }
  const pi = PROJ_BY[it.proj]; const p = PROJS[pi];
  const recon = reconFresh(sim, cmd.c, cmd.tx, cmd.ty);
  let route = null;
  if (p.low) route = planAirRoute(sim, cmd.c, e.x[L], e.y[L], cmd.tx, cmd.ty, true);
  for (let k = 0; k < n; k++) {
    const id = sim.spawnProj(cmd.c, pi, e.x[L], e.y[L], cmd.tx, cmd.ty, { target: cmd.target ?? -1, from: L });
    if (id < 0) break;
    co.items[ii] -= 1; co.stats.launched++;
    e.timer[id] = -k * 2; // salvo aralığı
    e.ammo[id] = recon ? 1 : 0; // keşif verisi
    if (route) { e.routes.set(id, Float32Array.from(route)); e.wp[id] = 0; }
    if (p.arm && cmd.target >= 0) e.target[id] = cmd.target;
    e.z[id] = 0;
  }
  e.cool[L] = key === 'mlrs' ? UNITS[e.def[L]].reload : 30;
  // vur-kaç: ateşleme konumu ele verir
  e.flags[L] |= F.REVEALED; sim.reveal.set(L, sim.tick + 250);
  sim.emit({ k: 'launch', x: e.x[L], y: e.y[L], owner: cmd.c, big: p.cls >= 3 });
});

export function updateProjectiles(sim) {
  const e = sim.e;
  for (const [id, t] of sim.reveal) if (t <= sim.tick || !e.alive(id)) { sim.reveal.delete(id); if (e.kind[id]) e.flags[id] &= ~F.REVEALED; }
  // fırlatıcı soğuma
  for (let i = 0, n = e.hi; i < n; i++) {
    const k = e.kind[i]; if (!k || (e.flags[i] & F.DEAD)) continue;
    if (k !== KIND.PROJ) {
      if ((k === KIND.BUILDING || k === KIND.GROUND) && e.cool[i] > 0 && (e.mask[i] & (C.LAUNCHER | C.ARTY))) e.cool[i]--;
      continue;
    }
    const p = PROJS[e.def[i]], c = e.owner[i];
    e.timer[i]++;
    if (e.timer[i] <= 0) continue; // salvo bekleme
    if (p.intercept) { updateInterceptor(sim, i, p); continue; }
    // güdüm: hareketli hedef / radar avcısı
    const t = e.target[i];
    if (t >= 0) {
      if (e.alive(t) && (!p.arm || (e.flags[t] & F.EMIT_ON))) { e.tx[i] = e.x[t]; e.ty[i] = e.y[t]; }
      else if (p.arm) { e.target[i] = -1; e.ammo[i] = 0; } // radar kapandı -> kilit kaybı
    }
    if (p.low) { // seyir: rota boyunca alçak uçuş
      const r = e.routes.get(i); let gx = e.tx[i], gy = e.ty[i];
      if (r && e.wp[i] * 2 < r.length) { gx = r[e.wp[i] * 2]; gy = r[e.wp[i] * 2 + 1]; }
      const dx = gx - e.x[i], dy = gy - e.y[i], d = Math.sqrt(dx * dx + dy * dy);
      if (d <= p.speed) {
        e.x[i] = gx; e.y[i] = gy;
        if (r && e.wp[i] * 2 < r.length) e.wp[i]++;
        else { impact(sim, i, p, c); continue; }
      } else { e.x[i] += dx / d * p.speed; e.y[i] += dy / d * p.speed; e.vx[i] = dx / d; e.vy[i] = dy / d; }
      e.z[i] = 1.5;
      if (e.timer[i] > 3000) e.kill(i);
      continue;
    }
    if (p.drop) { e.z[i] = Math.max(0, 6 - e.timer[i] * 1.5); if (e.timer[i] >= 4) impact(sim, i, p, c); continue; }
    // yay
    const tdx = e.tx[i] - e.ox[i], tdy = e.ty[i] - e.oy[i]; const total = Math.sqrt(tdx * tdx + tdy * tdy) + 0.001;
    e.prog[i] = Math.min(1, e.prog[i] + p.speed / total);
    const tt = e.prog[i];
    e.x[i] = e.ox[i] + tdx * tt; e.y[i] = e.oy[i] + tdy * tt;
    e.z[i] = p.arc * Math.min(4, total / 15) * 4 * tt * (1 - tt) + 1;
    e.vx[i] = tdx / total; e.vy[i] = tdy / total;
    if (tt >= 1) impact(sim, i, p, c);
  }
}

function impact(sim, i, p, c) {
  const e = sim.e;
  let cep = p.cep;
  if (p.guided) {
    if (!e.ammo[i] && !p.arm && e.target[i] < 0) cep *= 2.5; // keşif verisi yok
    if (e.flags[i] & F.GPSJAM) cep *= 1 + 3 * (1 - sim.mod(c, 'gpsResist', 0));
  }
  let [a, b] = sim.rng.disk();
  let x = e.tx[i] + a * cep, y = e.ty[i] + b * cep;
  if ((e.flags[i] & F.SPOOFED) && p.guided) { x += 4 * (1 - sim.mod(c, 'gpsResist', 0)); y += 3 * (1 - sim.mod(c, 'gpsResist', 0)); }
  if (p.ship) { // gemi savar: en yakın deniz hedefi
    let best = -1, bd = 9;
    sim.grid.query(x, y, 3, (j, d2) => { if (e.kind[j] === KIND.NAVAL && sim.atWar(c, e.owner[j]) && d2 < bd) { bd = d2; best = j; } });
    if (best >= 0) { applyDamage(sim, best, p.dmg, c); sim.emit({ k: 'boom', x: e.x[best], y: e.y[best], r: 1.5, big: 1, water: true }); e.kill(i); return; }
  }
  explode(sim, x, y, p.r, p.dmg, c, { ff: p.cls === 5 && !p.guided });
  e.kill(i);
}

function updateInterceptor(sim, i, p) {
  const e = sim.e, t = e.target[i];
  const eng = sim.engaged;
  if (!(t >= 0 && e.alive(t))) {
    if (e.timer[i] > 15) { sim.emit({ k: 'boom', x: e.x[i], y: e.y[i], r: 0.5, big: 0, air: true }); e.kill(i); }
    else { e.x[i] += e.vx[i] * p.speed; e.y[i] += e.vy[i] * p.speed; }
    return;
  }
  const dx = e.x[t] - e.x[i], dy = e.y[t] - e.y[i], d = Math.sqrt(dx * dx + dy * dy);
  e.z[i] += ((e.z[t] || 3) - e.z[i]) * 0.3;
  if (d <= p.speed + 0.4 || e.timer[i] > 120) {
    if (eng && eng[t] > 0) eng[t]--;
    const hit = e.timer[i] <= 120 && sim.rng.next() < e.ammo[i];
    sim.emit({ k: 'intercept', x: e.x[t], y: e.y[t], z: e.z[t], hit });
    if (hit) {
      if (e.kind[t] === KIND.PROJ) { sim.emit({ k: 'boom', x: e.x[t], y: e.y[t], r: 1, big: 1, air: true }); e.kill(t); sim.countries[e.owner[i]].stats.kills++; }
      else applyDamage(sim, t, 120, e.owner[i], { cause: 'sam' });
    }
    e.kill(i);
    return;
  }
  e.x[i] += dx / d * p.speed; e.y[i] += dy / d * p.speed; e.vx[i] = dx / d; e.vy[i] = dy / d;
}
