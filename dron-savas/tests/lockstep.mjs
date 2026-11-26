// Online altyapı testi: iki eş, aynı seed, LocalPair üzerinden kilit adım. Komutlar ağdan geçer; checksum eşit kalmalı.
import { Simulation } from '../src/sim/sim.js';
import { LocalPair } from '../src/net/transport.js';
import { LockstepBus } from '../src/net/lockstep.js';
import { CMD } from '../src/core/commands.js';
import { B } from '../src/data/buildings.js';
import { findSpot } from '../src/sim/build.js';
const opts = { seed: 314, size: 256, countries: 4, difficulty: 1 };
const A = new Simulation({ ...opts, player: 0 }), Bs = new Simulation({ ...opts, player: 1 });
A.ai[1] = null; Bs.ai[1] = null; // ülke 1 insan (B eşi), ülke 0 insan (A eşi)
A.ai[0] = null; Bs.ai[0] = null;
const [ta, tb] = LocalPair.create();
const busA = new LockstepBus(A, ta, 0, [1]), busB = new LockstepBus(Bs, tb, 1, [0]);
let stepsA = 0, stepsB = 0;
for (let frame = 0; frame < 4000; frame++) {
  // eşler kendi ülkeleri için komut üretir (her eş yalnız kendi sim kopyasını okur)
  if (frame % 300 === 10) { const s = findSpot(A, 0, B.substation, A.world.countries[0].capital.x + 6, A.world.countries[0].capital.y + 6, 12, A.rng); if (s) busA.submit({ type: CMD.BUILD, c: 0, def: B.substation, x: s[0], y: s[1] }); }
  if (frame % 450 === 20) busB.submit({ type: CMD.RESEARCH, c: 1, tech: 'm_guided' });
  if (frame === 900) busB.submit({ type: CMD.DIPLO, c: 1, action: 'war', target: 0 });
  // ağ gecikmesi simülasyonu: B bazen bir kare geç işler
  if (busA.canStep()) { A.step(); busA.afterStep(); stepsA++; A.events.length = 0; }
  if (frame % 7 !== 3 && busB.canStep()) { Bs.step(); busB.afterStep(); stepsB++; Bs.events.length = 0; }
  tb.pump(); ta.pump();
}
// yetişme
for (let k = 0; k < 2000 && Bs.tick < A.tick; k++) { ta.pump(); tb.pump(); if (busB.canStep()) { Bs.step(); busB.afterStep(); Bs.events.length = 0; } }
const same = A.tick === Bs.tick && A.checksum() === Bs.checksum();
console.log(`A tick ${A.tick} B tick ${Bs.tick} checksum ${A.checksum().toString(16)} / ${Bs.checksum().toString(16)} desync ${busA.desync || busB.desync}`);
console.log(same && !busA.desync && !busB.desync ? 'LOCKSTEP OK' : 'LOCKSTEP HATA'); process.exit(same ? 0 : 1);
