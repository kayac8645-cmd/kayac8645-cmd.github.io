// Tek ülke ayrıntı dökümü (geliştirme aracı)
import { Simulation } from '../src/sim/sim.js';
import { BUILDINGS } from '../src/data/buildings.js';
import { RES } from '../src/data/defs.js';
import { F } from '../src/core/ecs.js';
const ticks = +(process.argv[2] || 1000), cid = +(process.argv[3] || 1);
const sim = new Simulation({ seed: 4242, size: 256, countries: 6, allAI: true, difficulty: 2 });
sim.debug = true;
const notes = [];
for (let k = 0; k < ticks; k++) { sim.step(); for (const ev of sim.events) if (ev.k === 'note' && ev.c === cid) notes.push(ev.t + ':' + ev.key + ' ' + ev.args.join(',')); sim.events.length = 0; }
const e = sim.e, co = sim.countries[cid];
console.log('para', co.money | 0, 'res', RES.map((r, i) => r + ':' + co.res[i].toFixed(0)).join(' '));
for (let i = 0; i < e.hi; i++) {
  if (e.kind[i] !== 1 || e.owner[i] !== cid) continue;
  const b = BUILDINGS[e.def[i]]; const fl = [];
  for (const [n, v] of Object.entries(F)) if (e.flags[i] & v) fl.push(n);
  console.log(String(i).padStart(4), b.id.padEnd(12), 'hp', (e.hp[i] | 0) + '/' + e.maxhp[i], 'sat', e.sat[i].toFixed(2), 'item', e.item[i], 'st', e.state[i], 'tm', e.timer[i].toFixed(0), 'buf', e.buf[i].toFixed(1), 'res', e.res[i], fl.join('|'));
}
console.log(notes.slice(-25).join('\n'));
