import { Simulation } from '../src/core/simulation';
import { DEFAULT_PARAMS } from '../src/core/types';
const sim = Simulation.generate({ ...DEFAULT_PARAMS });
const s = sim.s;
const ids = s.species.map((x) => x.id);
const line = () => {
  const st = sim.stats(0);
  console.log(`yr ${(s.day / 365).toFixed(1)}`, st.species.map((x) => `${x.id}:${x.count.toExponential(1)}`).join(' '), `forest ${st.forestPct.toFixed(1)} grass ${st.grassPct.toFixed(1)}`);
};
line();
for (let y = 0; y < 40; y++) { for (let k = 0; k < 36; k++) sim.step(10); if (y % 4 === 3) line(); }
void ids;
