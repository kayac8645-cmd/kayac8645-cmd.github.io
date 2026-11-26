import { generateWorld } from '../src/world/mapgen.js';
import { writeFileSync } from 'node:fs';
const size = +(process.argv[2] || 256), seed = +(process.argv[3] || 12345);
const t0 = performance.now();
const w = generateWorld({ seed, size, countries: 6 });
console.log('gen', size, (performance.now() - t0).toFixed(0) + 'ms', 'bridges', w.bridges.length, w.countries.map(c => c.full + '/' + c.capital.name + ' towns:' + c.towns.length).join(' | '));
const C = [[15,30,58],[31,70,119],[201,181,122],[95,158,75],[40,81,44],[62,79,48],[140,138,60],[118,116,122],[246,250,253],[75,133,181],[43,96,148]];
const m = w.map; let s = `P6 ${m.W} ${m.H} 255\n`; const buf = Buffer.alloc(m.N * 3);
for (let i = 0; i < m.N; i++) { let c = C[m.ter[i]]; if (m.res[i]) c = [220, 60 + m.res[i] * 25, 200]; if (m.road[i]) c = m.road[i] & 4 ? [255, 0, 0] : [40, 40, 40];
  if (m.owner[i] !== 255 && ((i % m.W) + ((i / m.W) | 0)) % 6 === 0) c = [c[0] * 0.6 + (m.owner[i] * 40) % 255 * 0.4, c[1] * 0.6, c[2] * 0.6 + 80];
  buf[i * 3] = c[0]; buf[i * 3 + 1] = c[1]; buf[i * 3 + 2] = c[2]; }
writeFileSync(process.argv[4] || '/tmp/map.ppm', Buffer.concat([Buffer.from(s), buf]));
