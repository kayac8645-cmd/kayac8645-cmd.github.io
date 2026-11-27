// Ülke durumu: stoklar, teknoloji, istihbarat belleği, savaş sisi
import { RES, ITEMS, R, ITEM_BY } from '../data/defs.js';
import { TECHS } from '../data/tech.js';

export const VIS_CELL = 4; // savaş sisi hücresi (karo)

export function createCountry(info, map, isAI, personality) {
  const vw = Math.ceil(map.W / VIS_CELL), vh = Math.ceil(map.H / VIS_CELL);
  const c = {
    id: info.id, name: info.name, full: info.full, color: info.color, flag: info.flag,
    capitalName: info.capitalName, alive: true, placed: false, ai: isAI, personality: personality || null,
    capitalCity: -1, hq: -1,
    res: new Float64Array(RES.length), money: 0,
    items: new Float64Array(ITEMS.length),
    tech: new Uint8Array(TECHS.length), researching: -1, rprog: 0, rpoints: 0,
    mods: {}, bands: 0b1111, band: 2, // açık bantlar (900M,1.2G,2.4G,5.8G); aktif bant
    // istatistik / denge
    stats: { adSpent: 0, adShots: 0, kills: 0, losses: 0, dronesLost: 0, jammedLost: 0, launched: 0, produced: 0, buildingsLost: 0 },
    known: new Map(), // varlık id -> {t,x,y,def,kind,hp,owner}
    emitters: new Map(), // varlık id -> {t,x,y,kind}
    vis: new Uint16Array(vw * vh), vw, vh, // son görülme (tick/10)+1
    visNow: new Uint8Array(vw * vh),
    power: { supply: 0, demand: 0 }, workforce: 0, workDemand: 0, workSat: 1,
    pop: 0, morale: 0.7, territory: 0, territory0: 0, surrenderScore: 0,
    lossByJam: 0, lossByOther: 0, repairPts: 0, incomeLast: 0,
    trades: [], // {with, give, get, amt}
  };
  // küçük başlangıç: biraz para, maden stokları ve (foundCountry'de) bir santral
  c.res[R.steel] = 90; c.res[R.fuel] = 60; c.res[R.coal] = 120; c.res[R.iron] = 60; c.res[R.electronics] = 20;
  c.res[R.composite] = 10; c.res[R.explosives] = 10; c.res[R.supply] = 40; c.res[R.gas] = 20; c.res[R.oil] = 20; c.res[R.copper] = 20;
  c.money = 7000;
  c.fp = new Float64Array(RES.length); c.fc = new Float64Array(RES.length); c.fbyP = []; c.fbyC = [];
  c.flowP = new Float64Array(RES.length); c.flowC = new Float64Array(RES.length); c.flowByP = []; c.flowByC = [];
  return c;
}
