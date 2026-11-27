// Veri odaklı içerik: kaynaklar, stoklanan kalemler (dron/füze/önleyici), birimler, mermiler.
// Hızlar karo/tick, menziller karo, süreler tick (1 tick = 1 oyun dakikası, 10 tick/sn).
export const RES = ['iron', 'coal', 'oil', 'gas', 'copper', 'uranium', 'rare', 'steel', 'fuel', 'electronics', 'explosives', 'composite', 'supply'];
export const R = Object.fromEntries(RES.map((r, i) => [r, i]));
export const RAW = ['iron', 'coal', 'oil', 'gas', 'copper', 'uranium', 'rare']; // harita yatakları 1..7
// yatak rezervinin gerçek birimi: 1 oyun birimi = k birim
export const RES_UNIT = { iron: ['t', 10], coal: ['t', 10], copper: ['t', 5], uranium: ['t', 0.5], rare: ['t', 1], oil: ['varil', 100], gas: ['m³', 1000] };
export const RES_ICON = { iron: '⛏', coal: '◼', oil: '🛢', gas: '♨', copper: '◆', uranium: '☢', rare: '✦', steel: '▬', fuel: '⛽', electronics: '⚡', explosives: '✸', composite: '▦', supply: '📦' };

// Hava savunma hedef sınıfları
export const CLS = { DRONE: 0, UAV: 1, AIRCRAFT: 2, CRUISE: 3, BALLISTIC: 4, ROCKET: 5, SHIP: 6, GROUND: 7 };

// Elektronik harp bantları
export const BANDS = ['900 MHz', '1.2 GHz', '2.4 GHz', '5.8 GHz', '7.2 GHz', '433 MHz'];

// ---------- Birim tanımları (varlık olarak dünyada bulunanlar) ----------
// role: recon|kamikaze|bomber|male|interceptor|carrier|naval|relay|fighter|heli|line|arty|engineer|ad|ew|mlrs|radar|ship
export const UNITS = [
  // --- Hava: dronlar ---
  { id: 'recon_quad', kind: 'air', role: 'recon', speed: 0.42, fuel: 420, hp: 4, vision: 9, noise: 0.5, rcs: 0.05, ew: 0.15, cls: CLS.DRONE, link: true, reusable: true, alt: 1, spr: 'gen:quad', sz: 1 },
  { id: 'recon_uav', kind: 'air', role: 'recon', speed: 0.55, fuel: 2600, hp: 12, vision: 14, noise: 0.7, rcs: 0.6, ew: 0.4, cls: CLS.UAV, link: true, reusable: true, alt: 2, spr: 'gen:uav', sz: 2, relay: 18 },
  { id: 'fpv', kind: 'air', role: 'kamikaze', speed: 0.62, fuel: 160, hp: 3, vision: 5, noise: 0.6, rcs: 0.04, ew: 0.1, cls: CLS.DRONE, link: true, dmg: 45, r: 1.1, alt: 1, spr: 'gen:fpv', sz: 1 },
  { id: 'fpv_fiber', kind: 'air', role: 'kamikaze', speed: 0.5, fuel: 110, hp: 3, vision: 5, noise: 0.6, rcs: 0.04, ew: 1, cls: CLS.DRONE, link: true, fiber: true, maxDist: 22, dmg: 50, r: 1.1, alt: 1, spr: 'gen:fpv', sz: 1 },
  { id: 'bomber_quad', kind: 'air', role: 'bomber', speed: 0.3, fuel: 480, hp: 8, vision: 6, noise: 0.9, rcs: 0.12, ew: 0.25, cls: CLS.DRONE, link: true, reusable: true, dmg: 30, r: 1.4, ammo: 3, alt: 1, spr: 'gen:hexa', sz: 1 },
  { id: 'lr_kamikaze', kind: 'air', role: 'kamikaze', speed: 0.32, fuel: 2400, hp: 10, vision: 3, noise: 1.0, rcs: 0.35, ew: 0.7, cls: CLS.UAV, autonomous: true, dmg: 140, r: 2.2, alt: 1, spr: 'gen:delta', sz: 2 },
  { id: 'male', kind: 'air', role: 'male', speed: 0.48, fuel: 4200, hp: 30, vision: 16, noise: 0.8, rcs: 0.9, ew: 0.6, cls: CLS.UAV, link: true, reusable: true, ammo: 4, missile: 'agm', alt: 2, spr: 'gen:male', sz: 2, relay: 20 },
  { id: 'interceptor_drone', kind: 'air', role: 'interceptor', speed: 0.9, fuel: 260, hp: 4, vision: 10, noise: 0.5, rcs: 0.05, ew: 0.3, cls: CLS.DRONE, link: true, dmg: 20, r: 0.6, alt: 1, spr: 'gen:fpv', sz: 1, acq: 14 },
  { id: 'mothership', kind: 'air', role: 'carrier', speed: 0.36, fuel: 1800, hp: 26, vision: 8, noise: 1.2, rcs: 1.2, ew: 0.6, cls: CLS.UAV, link: true, carry: 'fpv', carryN: 4, alt: 2, spr: 'gen:mother', sz: 2, relay: 14 },
  { id: 'naval_drone', kind: 'naval', role: 'naval', speed: 0.45, fuel: 1800, hp: 14, vision: 6, noise: 0.7, rcs: 0.2, ew: 0.8, cls: CLS.SHIP, autonomous: true, dmg: 180, r: 1.6, spr: 'gen:boat', sz: 1 },
  { id: 'relay_drone', kind: 'air', role: 'relay', speed: 0.38, fuel: 1600, hp: 8, vision: 7, noise: 0.6, rcs: 0.2, ew: 0.5, cls: CLS.UAV, link: true, reusable: true, alt: 2, spr: 'gen:uav', sz: 1, relay: 22 },
  // --- Klasik hava gücü ---
  { id: 'fighter', kind: 'air', role: 'fighter', speed: 1.35, fuel: 900, hp: 60, vision: 18, noise: 2, rcs: 2.5, ew: 0.9, cls: CLS.AIRCRAFT, reusable: true, autonomous: true, ammo: 4, missile: 'agm', aa: 6, alt: 3, spr: 'gen:jet', sz: 2 },
  { id: 'heli', kind: 'air', role: 'heli', speed: 0.62, fuel: 700, hp: 45, vision: 10, noise: 1.6, rcs: 1.6, ew: 0.8, cls: CLS.AIRCRAFT, reusable: true, autonomous: true, ammo: 6, missile: 'agm', alt: 1, spr: 'gen:heli', sz: 2 },
  // --- Kara: batalyonlar ---
  { id: 'inf', kind: 'ground', role: 'line', hp: 100, atk: 5, def: 9, range: 2.5, speed: 0.045, vision: 7, soft: 1, cls: CLS.GROUND, spr: 'v:inf', fuelUse: 0, supUse: 0.004 },
  { id: 'armor', kind: 'ground', role: 'line', hp: 100, atk: 12, def: 7, range: 3, speed: 0.07, vision: 6, soft: 0.3, cls: CLS.GROUND, spr: 'v:armor', fuelUse: 0.004, supUse: 0.008 },
  { id: 'mech', kind: 'ground', role: 'line', hp: 100, atk: 8, def: 8, range: 2.5, speed: 0.065, vision: 7, soft: 0.6, cls: CLS.GROUND, spr: 'v:mech', fuelUse: 0.003, supUse: 0.006 },
  { id: 'artillery', kind: 'ground', role: 'arty', hp: 70, atk: 9, def: 3, range: 16, speed: 0.04, vision: 5, soft: 0.6, cls: CLS.GROUND, spr: 'v:artillery', fuelUse: 0.002, supUse: 0.01, cool: 12 },
  { id: 'engineer', kind: 'ground', role: 'engineer', hp: 70, atk: 2, def: 4, range: 2, speed: 0.05, vision: 6, soft: 1, cls: CLS.GROUND, spr: 'v:engineer', fuelUse: 0.002, supUse: 0.003, repair: 1.2 },
  { id: 'ad_bat', kind: 'ground', role: 'ad', hp: 60, atk: 2, def: 3, range: 2, speed: 0.055, vision: 7, soft: 0.6, cls: CLS.GROUND, spr: 'v:ad_bat', fuelUse: 0.002, supUse: 0.004, ad: 'gun' },
  { id: 'ew_bat', kind: 'ground', role: 'ew', hp: 50, atk: 1, def: 3, range: 1, speed: 0.05, vision: 6, soft: 0.6, cls: CLS.GROUND, spr: 'v:ew_bat', fuelUse: 0.002, supUse: 0.003, jam: 12, sigint: 40, gps: true },
  { id: 'mlrs', kind: 'ground', role: 'mlrs', hp: 55, atk: 0, def: 3, range: 30, speed: 0.07, vision: 5, soft: 0.5, cls: CLS.GROUND, spr: 'v:mlrs', fuelUse: 0.003, supUse: 0.004, salvo: 6, rocket: 'rocket', reload: 60 },
  { id: 'sam_long', kind: 'ground', role: 'ad', hp: 50, atk: 0, def: 2, range: 0, speed: 0.04, vision: 5, soft: 0.5, cls: CLS.GROUND, spr: 'v:sam_long', fuelUse: 0.002, supUse: 0.004, ad: 'long' },
  { id: 'sam_med', kind: 'ground', role: 'ad', hp: 50, atk: 0, def: 2, range: 0, speed: 0.05, vision: 5, soft: 0.5, cls: CLS.GROUND, spr: 'v:sam_med', fuelUse: 0.002, supUse: 0.004, ad: 'med' },
  { id: 'sam_short', kind: 'ground', role: 'ad', hp: 50, atk: 1, def: 3, range: 1, speed: 0.06, vision: 6, soft: 0.5, cls: CLS.GROUND, spr: 'v:sam_short', fuelUse: 0.002, supUse: 0.004, ad: 'short' },
  // --- Deniz ---
  { id: 'corvette', kind: 'naval', role: 'ship', hp: 160, atk: 6, def: 6, range: 6, speed: 0.12, vision: 12, soft: 0.2, cls: CLS.SHIP, spr: 'gen:corvette', fuelUse: 0.004, supUse: 0.004, ad: 'ship', sz: 2 },
];

// ---------- Mermi / füze tanımları ----------
export const PROJS = [
  { id: 'rocket', speed: 1.4, arc: 4, dmg: 22, r: 1.8, cep: 2.2, cls: CLS.ROCKET, guided: false },
  { id: 'guided_rocket', speed: 1.5, arc: 6, dmg: 45, r: 1.4, cep: 0.4, cls: CLS.ROCKET, guided: true },
  { id: 'cruise', speed: 0.8, arc: 0, dmg: 160, r: 2.4, cep: 0.5, cls: CLS.CRUISE, guided: true, low: true },
  { id: 'ballistic', speed: 3.2, arc: 60, dmg: 320, r: 3.6, cep: 0.9, cls: CLS.BALLISTIC, guided: true },
  { id: 'antiship', speed: 1.0, arc: 0, dmg: 200, r: 1.6, cep: 0.3, cls: CLS.CRUISE, guided: true, low: true, ship: true },
  { id: 'arm', speed: 1.3, arc: 8, dmg: 110, r: 1.5, cep: 0.4, cls: CLS.CRUISE, guided: true, arm: true },
  { id: 'agm', speed: 1.2, arc: 1, dmg: 70, r: 1.2, cep: 0.3, cls: CLS.ROCKET, guided: true },
  { id: 'bomb', speed: 0.5, arc: 0, dmg: 30, r: 1.4, cep: 0.4, cls: CLS.ROCKET, guided: false, drop: true },
  { id: 'shell', speed: 1.6, arc: 5, dmg: 14, r: 1.2, cep: 1.2, cls: CLS.ROCKET, guided: false },
  { id: 'sam_l', speed: 2.4, arc: 0, cls: -1, intercept: true },
  { id: 'sam_m', speed: 2.0, arc: 0, cls: -1, intercept: true },
  { id: 'sam_s', speed: 1.7, arc: 0, cls: -1, intercept: true },
];

// ---------- Stoklanan kalemler (fabrikada üretilir, sayılır) ----------
// unit: fırlatıldığında oluşan varlık; proj: fırlatılan mermi; from: üretim tesisi
const c = (money, el = 0, comp = 0, ex = 0, steel = 0, fuel = 0) => ({ money, electronics: el, composite: comp, explosives: ex, steel, fuel });
export const ITEMS = [
  { id: 'recon_quad', unit: 'recon_quad', from: 'drone_fac', cost: c(40, 1.5, 0.5), time: 40, cat: 'drone' },
  { id: 'recon_uav', unit: 'recon_uav', from: 'drone_fac', cost: c(260, 6, 4), time: 260, cat: 'drone', tech: 'd_uav' },
  { id: 'fpv', unit: 'fpv', from: 'drone_fac', cost: c(25, 1, 0.4, 0.5), time: 25, cat: 'drone' },
  { id: 'fpv_fiber', unit: 'fpv_fiber', from: 'drone_fac', cost: c(70, 1.5, 1, 0.5), time: 50, cat: 'drone', tech: 'd_fiber' },
  { id: 'bomber_quad', unit: 'bomber_quad', from: 'drone_fac', cost: c(80, 2, 1.5, 1), time: 70, cat: 'drone' },
  { id: 'lr_kamikaze', unit: 'lr_kamikaze', from: 'drone_fac', cost: c(160, 3, 4, 3, 0, 1), time: 160, cat: 'drone', tech: 'd_lr' },
  { id: 'male', unit: 'male', from: 'drone_fac', cost: c(1300, 16, 12, 0, 4, 2), time: 800, cat: 'drone', tech: 'd_male' },
  { id: 'interceptor_drone', unit: 'interceptor_drone', from: 'drone_fac', cost: c(35, 1.2, 0.5, 0.2), time: 30, cat: 'drone', tech: 'a_intdrone' },
  { id: 'mothership', unit: 'mothership', from: 'drone_fac', cost: c(500, 8, 8, 0, 2), time: 450, cat: 'drone', tech: 'd_mother' },
  { id: 'naval_drone', unit: 'naval_drone', from: 'drone_fac', cost: c(220, 3, 5, 4, 1, 1), time: 220, cat: 'drone', tech: 'd_naval' },
  { id: 'relay_drone', unit: 'relay_drone', from: 'drone_fac', cost: c(120, 4, 2), time: 120, cat: 'drone', tech: 'd_relay' },
  { id: 'fighter', unit: 'fighter', from: 'missile_fac', cost: c(3600, 24, 16, 0, 24, 8), time: 1600, cat: 'aircraft', tech: 'l_air' },
  { id: 'heli', unit: 'heli', from: 'missile_fac', cost: c(1300, 10, 8, 0, 12, 3), time: 900, cat: 'aircraft', tech: 'l_air' },
  { id: 'rocket', proj: 'rocket', from: 'munitions', cost: c(6, 0, 0, 0.6, 0.3), time: 6, cat: 'munition', batch: 6 },
  { id: 'guided_rocket', proj: 'guided_rocket', from: 'missile_fac', cost: c(60, 1.5, 0.4, 0.8), time: 50, cat: 'missile', tech: 'm_guided' },
  { id: 'cruise', proj: 'cruise', from: 'missile_fac', cost: c(420, 6, 4, 3, 0, 2), time: 380, cat: 'missile', tech: 'm_cruise' },
  { id: 'ballistic', proj: 'ballistic', from: 'missile_fac', cost: c(1800, 14, 8, 8, 4, 8), time: 1000, cat: 'missile', tech: 'm_ballistic' },
  { id: 'antiship', proj: 'antiship', from: 'missile_fac', cost: c(380, 5, 3, 3, 0, 2), time: 320, cat: 'missile', tech: 'm_antiship' },
  { id: 'arm', proj: 'arm', from: 'missile_fac', cost: c(300, 6, 2, 2, 0, 1), time: 260, cat: 'missile', tech: 'm_arm' },
  { id: 'agm', proj: 'agm', from: 'missile_fac', cost: c(70, 1.5, 0.5, 0.8), time: 50, cat: 'missile' },
  { id: 'sam_l', proj: 'sam_l', from: 'missile_fac', cost: c(320, 6, 3, 2, 0, 2), time: 280, cat: 'interceptor' },
  { id: 'sam_m', proj: 'sam_m', from: 'missile_fac', cost: c(130, 3, 1.5, 1), time: 120, cat: 'interceptor' },
  { id: 'sam_s', proj: 'sam_s', from: 'missile_fac', cost: c(45, 1, 0.5, 0.5), time: 45, cat: 'interceptor' },
];

// Kara üretimi (kışla / araç fabrikası): varlık olarak doğar
const g = (money, steel = 0, fuel = 0, el = 0, ex = 0) => ({ money, steel, fuel, electronics: el, explosives: ex });
export const RECRUITS = [
  { id: 'inf', from: 'barracks', cost: g(150, 1, 0, 0, 1), time: 200 },
  { id: 'engineer', from: 'barracks', cost: g(200, 3, 1), time: 220 },
  { id: 'armor', from: 'vehicle_fac', cost: g(600, 14, 3, 1, 1), time: 420, tech: 'l_armor' },
  { id: 'mech', from: 'vehicle_fac', cost: g(420, 9, 2, 1, 1), time: 340 },
  { id: 'artillery', from: 'vehicle_fac', cost: g(380, 8, 1, 0, 2), time: 320 },
  { id: 'mlrs', from: 'vehicle_fac', cost: g(520, 8, 2, 2, 1), time: 380 },
  { id: 'ad_bat', from: 'vehicle_fac', cost: g(380, 6, 1, 3), time: 300 },
  { id: 'ew_bat', from: 'vehicle_fac', cost: g(520, 4, 1, 8), time: 380, tech: 'e_jam' },
  { id: 'sam_short', from: 'vehicle_fac', cost: g(450, 5, 1, 6), time: 320 },
  { id: 'sam_med', from: 'vehicle_fac', cost: g(900, 8, 2, 12), time: 520, tech: 'a_med' },
  { id: 'sam_long', from: 'vehicle_fac', cost: g(1800, 12, 3, 24), time: 900, tech: 'a_long' },
  { id: 'corvette', from: 'port', cost: g(1600, 40, 8, 10), time: 1000 },
];

// Hava savunma sistem tanımları (birim ve bina ortak)
// pk: hedef sınıfına göre vuruş olasılığı [DRONE, UAV, AIRCRAFT, CRUISE, BALLISTIC, ROCKET, SHIP]
export const AD_SYS = {
  long: { range: 40, minAlt: 0, item: 'sam_l', cool: 14, pk: [0.55, 0.85, 0.85, 0.65, 0.0, 0.2, 0], radar: 20, needNet: true },
  med: { range: 22, item: 'sam_m', cool: 10, pk: [0.6, 0.85, 0.8, 0.55, 0, 0.3, 0], radar: 14, needNet: true },
  short: { range: 10, item: 'sam_s', cool: 6, pk: [0.7, 0.75, 0.6, 0.45, 0, 0.4, 0], radar: 12, needNet: false },
  gun: { range: 5, gun: true, cool: 2, pk: [0.35, 0.25, 0.08, 0.1, 0, 0.15, 0], radar: 7, needNet: false },
  ciws: { range: 4, gun: true, cool: 1, pk: [0.45, 0.35, 0.15, 0.35, 0, 0.35, 0], radar: 6, needNet: false },
  laser: { range: 7, laser: true, cool: 3, pk: [0.8, 0.5, 0.05, 0.15, 0, 0.3, 0], radar: 9, needNet: false, power: true },
  ship: { range: 9, item: 'sam_s', cool: 8, pk: [0.55, 0.7, 0.55, 0.5, 0, 0.35, 0], radar: 14, needNet: false },
};

export const UNIT_BY = Object.fromEntries(UNITS.map((u, i) => [u.id, i]));
export const PROJ_BY = Object.fromEntries(PROJS.map((p, i) => [p.id, i]));
export const ITEM_BY = Object.fromEntries(ITEMS.map((p, i) => [p.id, i]));
export const RECRUIT_BY = Object.fromEntries(RECRUITS.map((p, i) => [p.id, i]));
