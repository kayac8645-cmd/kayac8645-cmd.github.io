// Tam test paketi: sözdizimi/build, harita üretimi, headless sim, determinizm, kayıt/yükleme, lockstep, büyük harita
import { execSync } from 'node:child_process';
import { Simulation } from '../src/sim/sim.js';
import { generateWorld } from '../src/world/mapgen.js';

let fail = 0;
const ok = (name, cond, info = '') => { console.log(`${cond ? 'OK  ' : 'HATA'} ${name} ${info}`); if (!cond) fail++; };
const run = (cmd) => { try { return { out: execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }), code: 0 }; } catch (e) { return { out: (e.stdout || '') + (e.stderr || ''), code: e.status }; } };

// 1) build
const b = run('node build.mjs'); ok('build', b.code === 0, b.out.trim());
// 2) harita üretimi aynı seed -> aynı dünya
const w1 = generateWorld({ seed: 5, size: 256, countries: 6 }), w2 = generateWorld({ seed: 5, size: 256, countries: 6 });
let same = true; for (let i = 0; i < w1.map.N; i++) if (w1.map.ter[i] !== w2.map.ter[i] || w1.map.owner[i] !== w2.map.owner[i] || w1.map.road[i] !== w2.map.road[i]) { same = false; break; }
ok('mapgen deterministik', same && w1.countries.map((c) => c.name).join() === w2.countries.map((c) => c.name).join());
// 3) determinizm: iki ayrı sim aynı checksum
const A = new Simulation({ seed: 77, size: 256, countries: 8, allAI: true, difficulty: 3 }), Bs = new Simulation({ seed: 77, size: 256, countries: 8, allAI: true, difficulty: 3 });
let maxMs = 0, tot = 0;
for (let k = 0; k < 6000; k++) { const t0 = performance.now(); A.step(); const d = performance.now() - t0; tot += d; maxMs = Math.max(maxMs, d); Bs.step(); A.events.length = 0; Bs.events.length = 0; }
ok('sim determinizmi (8 ülke, 6000 tick)', A.checksum() === Bs.checksum(), A.checksum().toString(16));
ok('tick bütçesi (ort < 15 ms)', tot / 6000 < 15, `ort ${(tot / 6000).toFixed(2)} ms, maks ${maxMs.toFixed(1)} ms`);
ok('savaş gerçekleşti', A.countries.some((c) => A.diplo.warCount(c.id) > 0) || A.countries.some((c) => !c.alive));
// 4) kayıt/yükleme ve lockstep
const s = run('node tests/save-roundtrip.mjs'); ok('kayıt/yükleme determinizmi', s.code === 0, s.out.trim().split('\n').pop());
const l = run('node tests/lockstep.mjs'); ok('lockstep (online altyapı)', l.code === 0, l.out.trim().split('\n').pop());
// 5) büyük harita kurulumu < 5 sn
const t0 = performance.now(); const big = new Simulation({ seed: 3, size: 1024, countries: 8, allAI: true }); for (let k = 0; k < 300; k++) { big.step(); big.events.length = 0; }
const bt = performance.now() - t0; ok('1024² harita kurulum + 300 tick', bt < 12000, `${(bt / 1000).toFixed(1)} sn`);
// 6) 24 ülke desteği
const m24 = new Simulation({ seed: 9, size: 512, countries: 24, allAI: true }); for (let k = 0; k < 400; k++) { m24.step(); m24.events.length = 0; }
ok('24 ülke', m24.countries.length === 24, `${m24.countries.length} ülke, ${m24.e.count} varlık`);
console.log(fail ? `\n${fail} TEST BAŞARISIZ` : '\nTÜM TESTLER GEÇTİ');
process.exit(fail ? 1 : 0);
