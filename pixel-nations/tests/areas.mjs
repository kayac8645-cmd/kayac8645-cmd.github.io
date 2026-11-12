import {generateWorld} from '../js/worldgen.js';
import {NATIONS} from '../js/data.js';
for (const seed of [1234,77,2024]) {
const w=generateWorld(seed); const a=new Array(15).fill(0); for(const o of w.owner0) if(o>=0)a[o]++;
console.log(seed, NATIONS.map((n,i)=>n.short.slice(0,4)+':'+a[i]+'/'+w.nationCities[i].length).join(' '), 'comps', w.compSizes.filter(s=>s>40).join(','));
}
