import {newGame,stepHour} from '../js/game.js';
import {fmt} from '../js/util.js';
import {RES,UNITS} from '../js/data.js';
import {atWar} from '../js/state.js';
const seed=+process.argv[2]||1234, years=+process.argv[3]||1;
let t0=Date.now(); const S=newGame(seed,2); console.log('newGame ms',Date.now()-t0);
const rep=(label)=>{
  console.log('==',label,'day',S.day,'errors',S.errors||0);
  for(const n of S.nations){ if(!n.alive){console.log(n.short,'DEAD');continue;}
   const arm=S.armies.filter(a=>a.owner===n.id); const cnt={}; arm.forEach(a=>cnt[a.type]=(cnt[a.type]||0)+a.hp/UNITS[a.type].hp);
   console.log(n.short.padEnd(9),'cities',S.cities.filter(c=>c.owner===n.id).length,'pop',fmt(n.pop),'gdp/d',fmt(n.gdpDay),'money',fmt(n.money),'debt',fmt(n.debt),'infl',(n.inflation*100).toFixed(1),'stab',n.stab.toFixed(0),'foodSat',n.sat[0].toFixed(2),'elec',n.elecF.toFixed(2),'rp',n.rp.toFixed(1),'army',JSON.stringify(Object.fromEntries(Object.entries(cnt).map(([k,v])=>[k,+v.toFixed(1)]))),'pow',fmt(n.milPower),'tech',Object.keys(n.techs).length);
  }
  console.log('prices',S.market.price.map(p=>p.toFixed(1)).join(' '));
  const wars=[]; for(const a of S.nations) for(const b of S.nations) if(a.id<b.id&&a.alive&&b.alive&&atWar(S,a.id,b.id)) wars.push(a.short+'-'+b.short);
  console.log('wars',wars.join(', ')||'none','pacts',Object.values(S.dip.pacts).filter(p=>p.ally).length+' ally',Object.values(S.dip.pacts).filter(p=>p.trade).length+' trade');
};
rep('start');
t0=Date.now();
for(let h=0;h<years*365*24;h++){ stepHour(S); if(S.day>0&&S.t%(24*180)===0) rep('half-year'); }
console.log('sim ms',Date.now()-t0);
rep('end');
console.log('log tail'); S.log.slice(-25).forEach(e=>console.log(Math.floor(e.t/24),e.text));
