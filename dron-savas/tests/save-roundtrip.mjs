// Kayıt doğrulama: serileştir -> geri yükle -> iki kopya aynı checksum'la ilerlemeli (determinizm)
import { Simulation, PERSONALITIES } from '../src/sim/sim.js';
import { DIFFICULTY } from '../src/data/ai.js';
import { serialize, restore } from '../src/sim/serialize.js';
const a = new Simulation({ seed: 99, size: 256, countries: 5, allAI: true, difficulty: 2 });
for (let k = 0; k < 2500; k++) { a.step(); a.events.length = 0; }
const json = JSON.stringify(serialize(a));
const b = restore(Simulation, JSON.parse(json), { PERSONALITIES, DIFFICULTY });
console.log('kayıt boyutu', (json.length / 1024).toFixed(0), 'KB', 'a', a.checksum().toString(16), 'b', b.checksum().toString(16));
let ok = a.checksum() === b.checksum();
for (let k = 0; k < 1500; k++) { a.step(); b.step(); a.events.length = 0; b.events.length = 0; if (a.checksum() !== b.checksum()) { console.log('SAPMA tick', a.tick); ok = false; break; } }
console.log(ok ? 'KAYIT/YÜKLEME DETERMİNİSTİK: OK' : 'HATA'); process.exit(ok ? 0 : 1);
