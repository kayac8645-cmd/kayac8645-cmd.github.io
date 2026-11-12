// Piksel ikonlar (10x10) ve bayrak üretimi — tamamı kodla çizilir, dış dosya yok
const PAL = { k: '#10141c', w: '#ffffff', y: '#f5c93a', o: '#d9822b', r: '#d64545', g: '#5cc45a', G: '#2f8f46', b: '#4a8ee0', c: '#5fd8ff', n: '#9a6a3a', N: '#6e4824', e: '#8d99ab', l: '#cfd8e6', d: '#3b3f4d', p: '#9a6be0', P: '#6a46b0', s: '#f0dca8', m: '#e86aa0', t: '#2fa59a' };
const ICONS = {
  food: ['.....n....', '....nG....', '..rrrnrr..', '.rrrrrrrr.', '.rrwrrrrr.', '.rrwrrrrr.', '.rrrrrrrr.', '..rrrrrr..', '...rrrr...', '..........'],
  iron: ['..........', '..........', '...eeee...', '..elllle..', '.eeeeeeee.', '..........', '.eeee.eeee', 'ellllellle', 'eeeeeeeeee', '..........'],
  coal: ['..........', '....dd....', '...dedd...', '..ddeedd..', '.ddeddedd.', '.dedddded.', '.dddeddd..', '..dddddd..', '..........', '..........'],
  oil: ['....pp....', '....pp....', '...pppp...', '..pppppp..', '.ppwppppp.', '.ppwppppp.', '.pppppppP.', '..pppPPP..', '...PPPP...', '..........'],
  gold: ['...yyyy...', '..yooooy..', '.yoyyyyoy.', '.yoyooyoy.', '.yoyooyoy.', '.yoyyyyoy.', '..yooooy..', '...yyyy...', '..........', '..........'],
  wood: ['...nnnn...', '..nsssnn..', '.nsnnnsnN.', '.nsnssnsN.', '.nsnssnsN.', '.nsnnnsnN.', '..nsssnN..', '...nNNN...', '..........', '..........'],
  stone: ['..........', '....lll...', '...lllee..', '..lllleee.', '.lllleeee.', 'llllleeeee', 'eeeeeeeeee', '..........', '..........', '..........'],
  power: ['......yy..', '.....yy...', '....yy....', '...yyyyyy.', '.....yy...', '....yy....', '...yy.....', '..y.......', '..........', '..........'],
  money: ['..........', 'GGGGGGGGGG', 'GgggggggGG', 'Ggg.yy.ggG', 'Ggy.yy.ygG', 'Ggg.yy.ggG', 'GgggggggGG', 'GGGGGGGGGG', '..........', '..........'],
  pop: ['...cccc...', '..cccccc..', '..cccccc..', '...cccc...', '..bbbbbb..', '.bbbbbbbb.', '.bbbbbbbb.', '.bb.bb.bb.', '.bb.bb.bb.', '..........'],
  army: ['..e....e..', '..ee..ee..', '...eeee...', '....ee....', '...eeee...', '..ee..ee..', '.ee....ee.', 'nn......nn', 'n........n', '..........'],
  tech: ['....bb....', '...bbbb...', '.bbb..bbb.', 'bbb.cc.bbb', 'bb.cccc.bb', 'bb.cccc.bb', 'bbb.cc.bbb', '.bbb..bbb.', '...bbbb...', '....bb....'],
  dip: ['..........', '.ss.....ss', '.ssssssss.', '..ssssss..', '.ssrrrrss.', '.ssssssss.', '..ssssss..', '.ss.....ss', '..........', '..........'],
  eco: ['..........', '.......gg.', '.......gg.', '....gg.gg.', '....gg.gg.', '.gg.gg.gg.', '.gg.gg.gg.', '.gg.gg.gg.', 'kkkkkkkkkk', '..........'],
  stats: ['..........', '.........c', '........c.', '..c.c..c..', '.c.c.cc...', 'c...c.....', 'kkkkkkkkkk', '..........', '..........', '..........'],
  event: ['....yy....', '...yyyy...', '..yyyyyy..', '..yyyyyy..', '.yyyyyyyy.', '.yyyyyyyy.', 'yyyyyyyyyy', '....oo....', '..........', '..........'],
  menu: ['..........', 'llllllllll', '..........', 'llllllllll', '..........', 'llllllllll', '..........', '..........', '..........', '..........'],
  country: ['e.e.ee.e.e', 'eeeeeeeeee', '.eeeeeeee.', '.eeellleee', '.eeelkleee', '.eeelkleee', '.eeelkleee', 'eeeeeeeeee', '..........', '..........'],
  stab: ['..rr..rr..', '.rrrrrrrr.', 'rrrrrrrrrr', 'rrrrrrrrrr', '.rrrrrrrr.', '..rrrrrr..', '...rrrr...', '....rr....', '..........', '..........'],
  infl: ['....rr....', '...rrrr...', '..rr..rr..', '.rr.rr.rr.', '....rr....', '....rr....', '....rr....', '..........', '..........', '..........'],
  growth: ['..........', '........gg', '.......ggg', '......g.g.', '.g...g....', '.gg.g.....', '..ggg.....', '...g......', '..........', '..........'],
  debt: ['..........', '.rrrrrrrr.', '.rrwwwwrr.', '.rrw..wrr.', '.rrwwwwrr.', '.rrw..wrr.', '.rrw..wrr.', '.rrrrrrrr.', '..........', '..........'],
  science: ['...ll.....', '...ll.....', '..cccc....', '.cccccc...', '.cccccc...', 'bbbbbbbb..', '..........', '..........', '..........', '..........'],
  shield: ['eeeeeeeeee', 'ellllllle.', 'elllbbllle', 'ellbbbblle', 'ellbbbblle', '.ellbbble.', '..ellble..', '...elle...', '....ee....', '..........'],
  farm: ['..........', '....y.y...', '...yyyyy..', '...yyyyy..', '..GGGGGGG.', '.GGggGGgG.', '.gGGgGGgG.', 'gggggggggg', '..........', '..........'],
  factory: ['..e.......', '..e..e.e..', '..e..e.e..', 'eeeeeeeeee', 'eblebleble', 'eeeeeeeeee', 'eblebleble', 'eeeeeeeeee', '..........', '..........'],
  market: ['rwrwrwrwrw', 'rwrwrwrwrw', '..........', '.nn....nn.', '.nn.yy.nn.', '.nn.yy.nn.', 'nnnnnnnnnn', '..........', '..........', '..........'],
  port: ['....e.....', '...eee....', '....e.....', '..eeeee...', '.e..e..e..', '.ee.e.ee..', '..eeeee...', 'bbbbbbbbbb', '.bbbbbbbb.', '..........'],
  school: ['....rr....', '...rrrr...', '..rrrrrr..', 'llllllllll', '.l.l..l.l.', '.l.l..l.l.', '.l.l..l.l.', 'llllllllll', '..........', '..........'],
  hospital: ['wwwwwwwwww', 'wwwwrrwwww', 'wwwwrrwwww', 'wrrrrrrrrw', 'wrrrrrrrrw', 'wwwwrrwwww', 'wwwwrrwwww', 'wwwwwwwwww', '..........', '..........'],
  barracks: ['..r.......', '..rr......', '..r.......', 'nnnnnnnnnn', 'nsnnnnnnsn', 'nsnnkknnsn', 'nsnnkknnsn', 'nnnnkknnnn', '..........', '..........'],
  fort: ['e.e.ee.e.e', 'eeeeeeeeee', 'elleeeelle', 'elleeeelle', 'eeeeeeeeee', 'eeeekkeeee', 'eeeekkeeee', 'eeeekkeeee', '..........', '..........'],
  infra: ['..........', '..........', 'llllllllll', 'e.e.e.e.e.', 'e.e.e.e.e.', 'nnnnnnnnnn', '..........', '..........', '..........', '..........'],
  clock: ['...llll...', '..lwwwwl..', '.lwwkwwwl.', '.lwwkwwwl.', '.lwwkkkwl.', '.lwwwwwwl.', '..lwwwwl..', '...llll...', '..........', '..........'],
  swords: ['e........e', '.e......e.', '..e....e..', '...e..e...', '....ee....', '...e..e...', '..nn..nn..', '.n......n.', '..........', '..........'],
  plane: ['....ee....', '....ee....', '...eeee...', 'eeeeeeeeee', '.eeeeeeee.', '....ee....', '...eeee...', '..eeeeee..', '..........', '..........'],
  ship: ['..........', '....e.....', '....ee....', '..eeeeee..', 'eeeeeeeeee', '.eeeeeeee.', '..bbbbbb..', 'bbbbbbbbbb', '..........', '..........'],
  tank: ['..........', '....ee....', '..eeeeee..', 'eeeeeeeeee', 'eddddddddd', 'edededede.', '.dddddddd.', '..........', '..........', '..........'],
  inf: ['...ee.....', '..eeee....', '..effe....', '...ff.....', '..gggg..e.', '.gggggg.e.', '.gg.gg..n.', '.gg.gg....', '.kk.kk....', '..........'],
  art: ['..........', '.......ee.', '.....eeee.', '..eeeee...', 'ddeeee....', 'dd.dd.....', 'ddddd.....', '..........', '..........', '..........'],
  lock: ['...eeee...', '..e....e..', '..e....e..', '.yyyyyyyy.', '.yyykkyyy.', '.yyyyyyyy.', '.yyyyyyyy.', '..........', '..........', '..........'],
  check: ['..........', '.........g', '........gg', '.g.....gg.', '.gg...gg..', '..gg.gg...', '...ggg....', '....g.....', '..........', '..........'],
  plus: ['....gg....', '....gg....', '....gg....', 'gggggggggg', 'gggggggggg', '....gg....', '....gg....', '....gg....', '..........', '..........'],
  spy: ['...dddd...', '..dddddd..', 'dddddddddd', '..ssssss..', '..skssks..', '..ssssss..', '...dddd...', '..dddddd..', '..........', '..........'],
  flag: ['nrrrrr....', 'nrrrrrrr..', 'nrrrrr....', 'n.........', 'n.........', 'n.........', 'n.........', 'n.........', '..........', '..........'],
};
const cache = {};
export function iconURL(name, scale = 1) {
  const key = name + scale; if (cache[key]) return cache[key];
  const rows = ICONS[name]; if (!rows) return '';
  const c = document.createElement('canvas'); c.width = 10; c.height = 10; const x = c.getContext('2d');
  rows.forEach((r, y) => { for (let i = 0; i < r.length; i++) { const ch = r[i]; if (ch !== '.' && PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i, y, 1, 1); } } });
  // koyu kontur
  const out = document.createElement('canvas'); out.width = 12; out.height = 12; const o = out.getContext('2d');
  o.drawImage(c, 1, 1);
  const id = o.getImageData(0, 0, 12, 12), src = new Uint8ClampedArray(id.data);
  const al = (xx, yy) => (xx < 0 || yy < 0 || xx > 11 || yy > 11 ? 0 : src[(yy * 12 + xx) * 4 + 3]);
  for (let yy = 0; yy < 12; yy++) for (let xx = 0; xx < 12; xx++) { if (al(xx, yy) === 0 && (al(xx - 1, yy) || al(xx + 1, yy) || al(xx, yy - 1) || al(xx, yy + 1))) { const k = (yy * 12 + xx) * 4; id.data[k] = 16; id.data[k + 1] = 20; id.data[k + 2] = 28; id.data[k + 3] = 200; } }
  o.putImageData(id, 0, 0);
  return (cache[key] = out.toDataURL());
}
export const ICON_NAMES = Object.keys(ICONS);
export const icon = (name, cls = '') => `<img class="ic ${cls}" src="${iconURL(name)}" alt="" draggable="false">`;
export function iconCanvas(name) { const i = new Image(); i.src = iconURL(name); return i; }

// ---- bayraklar
const fcache = {};
export function flagCanvas(n, w = 30, h = 20) {
  const key = n.id + '_' + w + n.col + n.col2 + n.gov; if (fcache[key]) return fcache[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const [pat, i1, i2, i3] = n.flag; const cols = [n.col, n.col2, '#f4f4f4']; const A = cols[i1 % 3], B = cols[i2 % 3], C = cols[i3 % 3];
  const R = (col, a, b, cw, ch) => { x.fillStyle = col; x.fillRect(Math.round(a), Math.round(b), Math.round(cw), Math.round(ch)); };
  R(A, 0, 0, w, h);
  switch (pat) {
    case 'hstripe3': R(B, 0, h / 3, w, h / 3); R(C, 0, 2 * h / 3, w, h / 3 + 1); break;
    case 'vstripe3': R(B, w / 3, 0, w / 3, h); R(C, 2 * w / 3, 0, w / 3 + 1, h); break;
    case 'nordic': R(B, w * 0.28, 0, w * 0.18, h); R(B, 0, h * 0.4, w, h * 0.22); break;
    case 'diag': for (let i = 0; i < h; i++) R(B, w * (i / h) - 2, i, w, 1); for (let i = 0; i < h; i++) R(A, 0, i, w * (i / h) - 2, 1); R(C, w * 0.15, h * 0.1, 4, 4); break;
    case 'disc': x.fillStyle = B; x.beginPath(); x.arc(w / 2, h / 2, h * 0.32, 0, 7); x.fill(); R(C, w / 2 - 1, h / 2 - 3, 2, 6); break;
    case 'quarter': R(B, w / 2, 0, w / 2, h / 2); R(B, 0, h / 2, w / 2, h / 2); R(C, w * 0.45, h * 0.4, w * 0.1, h * 0.2); break;
    case 'chevron': x.fillStyle = B; x.beginPath(); x.moveTo(0, 0); x.lineTo(w * 0.5, h / 2); x.lineTo(0, h); x.fill(); R(C, w * 0.12, h * 0.4, 4, 4); break;
    case 'saltire': x.strokeStyle = B; x.lineWidth = 4; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke(); R(C, w / 2 - 2, h / 2 - 2, 4, 4); break;
    case 'hsplit2': R(B, 0, h / 2, w, h / 2); R(C, w * 0.38, h * 0.3, w * 0.24, h * 0.4); break;
    case 'border': R(B, 2, 2, w - 4, h - 4); R(C, w / 2 - 3, h / 2 - 3, 6, 6); break;
  }
  x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 1; x.strokeRect(0.5, 0.5, w - 1, h - 1);
  return (fcache[key] = c);
}
export function flagURL(n, w = 30, h = 20) { const c = flagCanvas(n, w, h); if (!c._url) c._url = c.toDataURL(); return c._url; }
export const flagImg = (n, cls = '') => `<img class="flag ${cls}" src="${flagURL(n)}" alt="" draggable="false">`;
