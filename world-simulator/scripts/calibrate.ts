import { Simulation } from '../src/core/simulation';
import { DEFAULT_PARAMS } from '../src/core/types';
import { SIM_GEOM, SIM_H, SIM_W } from '../src/core/grid';

const t0 = performance.now();
const sim = Simulation.generate({ ...DEFAULT_PARAMS, seed: process.argv[2] ?? '1337' }, (m, f) => console.log('  ', m, f));
console.log('generate ms', Math.round(performance.now() - t0));
const s = sim.s;
function zonal(name: string, field: Float32Array, landOnly = false) {
  const rows: string[] = [];
  for (let y = 0; y < SIM_H; y += 8) {
    let t = 0, n = 0;
    for (let x = 0; x < SIM_W; x++) {
      const i = y * SIM_W + x;
      if (landOnly && s.f.landFrac[i] < 0.5) continue;
      t += field[i]; n++;
    }
    rows.push(`${SIM_GEOM.lat[y].toFixed(0)}:${n ? (t / n).toFixed(1) : '-'}`);
  }
  console.log(name, rows.join(' '));
}
function report() {
  const st = sim.stats(0);
  console.log(`day ${st.day.toFixed(0)} T=${st.meanTemp.toFixed(2)} land=${st.meanLandTemp.toFixed(1)} sea=${st.meanSeaTemp.toFixed(1)} P=${st.meanPrecip.toFixed(0)} cloud=${st.meanCloud.toFixed(2)} RH=${st.meanHumidity.toFixed(2)} forest=${st.forestPct.toFixed(1)}% grass=${st.grassPct.toFixed(1)}% desert=${st.desertPct.toFixed(1)}% ice=${st.iceAreaPct.toFixed(1)}% sea=${st.seaLevel.toFixed(2)} co2=${st.co2ppm.toFixed(1)} humans=${Math.round(st.humans)} settl=${st.settlements} tech=${st.maxTech.toFixed(2)} biomass=${st.plantBiomassGt.toFixed(0)}Gt`);
  console.log('  species', st.species.map((x) => `${x.id}:${x.count.toExponential(2)}${x.extinct ? 'X' : ''}`).join(' '));
}
report();
zonal('temp', s.f.temp);
zonal('precipAnn', s.f.precipAnn);
zonal('tree(land)', s.f.tree, true);
zonal('soilW(land)', s.f.soilW, true);
let t1 = performance.now();
for (let k = 0; k < 100; k++) sim.step(1);
console.log('step(1 day) ms', ((performance.now() - t1) / 100).toFixed(2));
t1 = performance.now();
for (let k = 0; k < 36 * 5; k++) sim.step(10);
console.log('5 years dt10: ms/step', ((performance.now() - t1) / 180).toFixed(2));
report();
console.log('log', s.log.slice(-8).map((l) => l.text));
t1 = performance.now();
for (let k = 0; k < 50; k++) sim.stepGeo(20);
console.log('1000 yr geo ms', Math.round(performance.now() - t1));
report();
console.log('log', s.log.slice(-8).map((l) => l.text));
