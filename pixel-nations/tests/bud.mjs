import {newGame,stepHour} from '../js/game.js';
import {fmt} from '../js/util.js';
const S=newGame(+process.argv[2]||1234,2);
const days=+process.argv[3]||60;
for(let h=0;h<24*days;h++) stepHour(S);
for(const id of [0,12,14]){ const n=S.nations[id]; console.log(n.short,'day',S.day,'gdpDay',fmt(n.gdpDay),'money',fmt(n.money),'debt',fmt(n.debt),'netEma',fmt(n.netEma));
 console.log(' rev',Object.entries(n.bud.rev).map(([k,v])=>k+':'+v.toFixed(0)).join(' '));
 console.log(' exp',Object.entries(n.bud.exp).map(([k,v])=>k+':'+v.toFixed(0)).join(' '));
 console.log(' pol',Object.entries(n.pol).map(([k,v])=>k+':'+v.toFixed(3)).join(' '));
 console.log(' upkeep',JSON.stringify(n.upkeep), 'prod',n.prod.map(x=>x.toFixed(0)).join(','),'cons',n.cons.map(x=>x.toFixed(0)).join(','),'sat',n.sat.map(x=>x.toFixed(2)).join(','));
}
