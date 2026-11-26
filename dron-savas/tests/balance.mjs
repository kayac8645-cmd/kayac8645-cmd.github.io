// Denge testi: birden çok seed ile YZ vs YZ; eleme zamanları, kazanan kişilik, maç süresi.
import { Simulation } from '../src/sim/sim.js';
const seeds = (process.argv[2] || '11,22,33').split(',').map(Number), maxT = +(process.argv[3] || 40000), nc = +(process.argv[4] || 6), diff = +(process.argv[5] ?? 1);
const res = [];
for (const seed of seeds) {
  const sim = new Simulation({ seed, size: 256, countries: nc, allAI: true, difficulty: diff });
  const elim = []; let firstWar = -1;
  while (sim.tick < maxT && !sim.over) {
    sim.step();
    for (const ev of sim.events) {
      if (ev.k === 'eliminated') elim.push(`${sim.countries[ev.c].personality.id}@g${(sim.tick / 1440).toFixed(1)}`);
      if (ev.k === 'war' && firstWar < 0) firstWar = sim.tick;
    }
    sim.events.length = 0;
  }
  const w = sim.winner >= 0 ? sim.countries[sim.winner].personality.id : '-';
  const alive = sim.countries.filter((c) => c.alive).map((c) => `${c.personality.id}(${c.territory})`).join(' ');
  res.push({ seed, gun: (sim.tick / 1440).toFixed(1), ilkSavas: (firstWar / 1440).toFixed(1), kazanan: w, elim: elim.join(', '), sag: alive });
  console.log(JSON.stringify(res[res.length - 1]));
}
