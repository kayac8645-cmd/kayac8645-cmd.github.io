import {generateWorld,asciiMap} from '../js/worldgen.js';
const seed=+process.argv[2]||1234;
let t=Date.now(); const w=generateWorld(seed); console.log('gen ms',Date.now()-t);
console.log(asciiMap(w));
console.log('comps',w.compSizes.slice(0,8), 'cities',w.cities.length);
console.log(w.nationCities.map((c,i)=>i+':'+c.length).join(' '));
const prov=new Array(w.cities.length).fill(0); for(const p of w.prov) if(p>=0) prov[p]++;
console.log('prov tiles',prov.join(','));
console.log('rivers',w.riverPaths.length,'roads',w.road.reduce((a,b)=>a+b,0));
