// Headless simülasyon: render yok. Kullanım: node tests/headless.mjs [ticks] [size] [countries] [seed] [difficulty]
import { Simulation } from '../src/sim/sim.js';
import { ITEMS } from '../src/data/defs.js';

const ticks = +(process.argv[2] || 6000), size = +(process.argv[3] || 256), nc = +(process.argv[4] || 6), seed = +(process.argv[5] || 4242);
const diff = +(process.argv[6] ?? 2);
const t0 = performance.now();
const sim = new Simulation({ seed, size, countries: nc, allAI: true, difficulty: diff });
sim.debug = true;
console.log(`kurulum ${(performance.now() - t0).toFixed(0)} ms, varlık ${sim.e.count}`);
let worst = 0, total = 0;
const evc = {};
for (let k = 0; k < ticks; k++) {
  const a = performance.now(); sim.step(); const d = performance.now() - a; total += d; if (d > worst && k > 5) worst = d;
  for (const ev of sim.events) evc[ev.k] = (evc[ev.k] || 0) + 1;
  sim.events.length = 0;
  if (k % 1500 === 1499 || k === ticks - 1) {
    const kinds = {}; for (let i = 0; i < sim.e.hi; i++) if (sim.e.kind[i]) kinds[sim.e.kind[i]] = (kinds[sim.e.kind[i]] || 0) + 1;
    console.log(`t=${sim.tick} gun ${sim.env.day} ${sim.env.weather} ort ${(total / (k + 1)).toFixed(2)}ms max ${worst.toFixed(1)}ms varlik ${JSON.stringify(kinds)}`);
    for (const co of sim.countries) {
      const items = ITEMS.map((it, j) => (co.items[j] >= 1 ? it.id + ':' + (co.items[j] | 0) : '')).filter(Boolean).join(',');
      console.log(`  ${co.id} ${co.alive ? ' ' : 'X'} ${co.name.padEnd(12)} ${co.personality.id.padEnd(11)} $${co.money | 0} pop ${co.pop | 0} mor ${co.morale.toFixed(2)} guc ${co.power.supply | 0}/${co.power.demand | 0} is ${co.workSat.toFixed(2)} toprak ${co.territory} savas ${sim.diplo.warCount(co.id)} tech ${co.tech.reduce((a, b) => a + b)} celik ${co.res[7] | 0} yakit ${co.res[8] | 0} el ${co.res[9] | 0} ikmal ${co.res[12] | 0} [${items}] ${JSON.stringify(co.stats)}`);
    }
  }
}
console.log('olaylar', JSON.stringify(evc));
console.log('checksum', sim.checksum().toString(16), 'kazanan', sim.winner);
