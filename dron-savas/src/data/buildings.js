// Bina tanımları. size: [g,y] karo. power: +üretim / -tüketim (MW). workers: iş gücü.
// place: yerleştirme kuralı. caps: sistem bileşenleri. look: sprite üretici anahtarı.
// products: fabrika üretebileceği kalemler (ITEMS id) veya kara birimleri (RECRUITS id).
const m = (money, steel = 0, el = 0, comp = 0) => ({ money, steel, electronics: el, composite: comp });
export const BUILDINGS = [
  { id: 'hq', size: [3, 3], hp: 900, cost: m(0), time: 1, power: 20, workers: 0, caps: ['comms', 'depot', 'vision', 'power'], comms: 24, vision: 12, look: 'hq', cat: 'none' },
  { id: 'cmd', size: [2, 2], hp: 420, cost: m(900, 20, 10), time: 300, power: -10, workers: 60, caps: ['comms', 'vision'], comms: 20, vision: 8, look: 'cmd', cat: 'mil', tech: 'l_comms' },
  { id: 'depot', size: [2, 2], hp: 380, cost: m(350, 10), time: 160, power: -2, workers: 40, caps: ['depot', 'fuelnet'], look: 'depot', cat: 'log' },
  { id: 'rail', size: [2, 1], hp: 240, cost: m(400, 25), time: 200, power: -2, workers: 30, caps: ['rail'], look: 'rail', cat: 'log', tech: 'g_rail' },
  { id: 'mine', size: [2, 2], hp: 300, cost: m(300, 5), time: 150, power: -6, workers: 120, place: 'deposit', rate: 0.15, look: 'mine', cat: 'eco' },
  { id: 'well', size: [1, 1], hp: 160, cost: m(260, 6), time: 120, power: -3, workers: 40, place: 'oilgas', rate: 0.12, caps: ['fuelnet'], look: 'well', cat: 'eco' },
  { id: 'refinery', size: [3, 3], hp: 520, cost: m(900, 30), time: 400, power: -20, workers: 200, caps: ['fuelnet', 'factory'], recipes: [{ out: 'fuel', n: 1, in: { oil: 1.4 }, t: 10 }], look: 'refinery', cat: 'eco' },
  { id: 'steel_mill', size: [3, 2], hp: 480, cost: m(800, 10), time: 380, power: -25, workers: 250, caps: ['factory'], recipes: [{ out: 'steel', n: 1, in: { iron: 1.5, coal: 0.6 }, t: 8 }], look: 'steel', cat: 'eco' },
  { id: 'electronics', size: [2, 2], hp: 360, cost: m(1000, 20), time: 420, power: -22, workers: 220, caps: ['factory'], recipes: [{ out: 'electronics', n: 1, in: { copper: 1.2 }, t: 12 }, { out: 'composite', n: 1, in: { oil: 1, copper: 0.3 }, t: 12 }, { out: 'electronics', n: 2, in: { copper: 1, rare: 0.4 }, t: 12 }], look: 'electronics', cat: 'eco' },
  { id: 'munitions', size: [3, 2], hp: 420, cost: m(850, 25), time: 380, power: -18, workers: 220, caps: ['factory'], recipes: [{ out: 'explosives', n: 1, in: { coal: 0.8, gas: 0.5 }, t: 12 }, { out: 'supply', n: 3, in: { steel: 0.2, fuel: 0.6, explosives: 0.2 }, t: 10 }], items: ['rocket'], look: 'munitions', cat: 'mil' },
  { id: 'drone_fac', size: [3, 2], hp: 380, cost: m(1200, 25, 10), time: 420, power: -20, workers: 180, caps: ['factory'], items: ['fpv', 'recon_quad', 'bomber_quad', 'fpv_fiber', 'lr_kamikaze', 'interceptor_drone', 'recon_uav', 'relay_drone', 'mothership', 'male', 'naval_drone'], look: 'drone_fac', cat: 'mil' },
  { id: 'missile_fac', size: [3, 3], hp: 520, cost: m(2200, 60, 30), time: 700, power: -30, workers: 260, caps: ['factory'], items: ['sam_s', 'sam_m', 'sam_l', 'agm', 'guided_rocket', 'cruise', 'arm', 'antiship', 'ballistic', 'fighter', 'heli'], look: 'missile_fac', cat: 'mil' },
  { id: 'barracks', size: [2, 2], hp: 400, cost: m(500, 10), time: 220, power: -6, workers: 80, caps: ['factory'], units: ['inf', 'engineer'], look: 'barracks', cat: 'mil' },
  { id: 'vehicle_fac', size: [3, 2], hp: 480, cost: m(1400, 40, 10), time: 520, power: -24, workers: 220, caps: ['factory'], units: ['mech', 'artillery', 'mlrs', 'ad_bat', 'sam_short', 'armor', 'ew_bat', 'sam_med', 'sam_long'], look: 'vehicle_fac', cat: 'mil' },
  { id: 'research', size: [2, 2], hp: 300, cost: m(900, 10, 10), time: 360, power: -20, workers: 120, caps: ['research'], rate: 1, look: 'research', cat: 'eco' },
  // Enerji
  { id: 'coal_plant', size: [3, 3], hp: 600, cost: m(1100, 40), time: 500, power: 120, fuelRes: 'coal', burn: 0.03, workers: 150, caps: ['power'], look: 'coal_plant', cat: 'pow' },
  { id: 'gas_plant', size: [2, 2], hp: 420, cost: m(900, 25), time: 380, power: 90, fuelRes: 'gas', burn: 0.025, workers: 90, caps: ['power'], look: 'gas_plant', cat: 'pow' },
  { id: 'hydro', size: [2, 2], hp: 900, cost: m(1600, 60), time: 700, power: 80, workers: 60, place: 'river', caps: ['power', 'water', 'dam'], look: 'dam', cat: 'pow' },
  { id: 'nuclear', size: [3, 3], hp: 1100, cost: m(4000, 120, 40), time: 1400, power: 360, fuelRes: 'uranium', burn: 0.003, workers: 260, caps: ['power'], look: 'nuclear', cat: 'pow', tech: 'p_nuclear' },
  { id: 'solar', size: [2, 2], hp: 160, cost: m(600, 6, 8), time: 200, power: 35, solar: true, workers: 10, caps: ['power'], look: 'solar', cat: 'pow', tech: 'p_solar' },
  { id: 'substation', size: [1, 1], hp: 180, cost: m(180, 6), time: 90, power: 0, workers: 5, caps: ['power', 'sub'], look: 'substation', cat: 'pow' },
  { id: 'pump', size: [1, 1], hp: 160, cost: m(220, 6), time: 100, power: -6, workers: 15, place: 'nearwater', caps: ['water'], look: 'pump', cat: 'pow' },
  // Haberleşme
  { id: 'relay', size: [1, 1], hp: 120, cost: m(260, 8, 4), time: 120, power: -3, workers: 5, caps: ['comms', 'control'], comms: 20, control: 18, look: 'relay', cat: 'mil' },
  { id: 'satellite', size: [2, 2], hp: 300, cost: m(2400, 20, 30), time: 800, power: -25, workers: 60, caps: ['comms', 'emit'], comms: 70, look: 'satellite', cat: 'mil', tech: 'e_sat' },
  // Askeri
  { id: 'drone_base', size: [2, 2], hp: 360, cost: m(700, 12, 8), time: 260, power: -10, workers: 60, caps: ['base', 'control', 'emit', 'vision'], control: 30, vision: 6, launches: 'drone', look: 'drone_base', cat: 'mil' },
  { id: 'airbase', size: [4, 2], hp: 800, cost: m(2600, 80, 20), time: 900, power: -25, workers: 200, caps: ['base', 'vision'], vision: 8, launches: 'aircraft', look: 'airbase', cat: 'mil', tech: 'l_air' },
  { id: 'port', size: [3, 2], hp: 600, cost: m(1500, 50), time: 600, power: -12, workers: 150, place: 'coast', caps: ['base', 'depot', 'factory'], units: ['corvette'], launches: 'naval', look: 'port', cat: 'log' },
  { id: 'missile_base', size: [2, 2], hp: 420, cost: m(1200, 30, 10), time: 420, power: -8, workers: 50, caps: ['launcher'], look: 'missile_base', cat: 'mil', tech: 'm_cruise' },
  { id: 'coastal', size: [2, 1], hp: 300, cost: m(1100, 20, 10), time: 380, power: -6, workers: 30, place: 'coast', caps: ['launcher'], look: 'coastal', cat: 'mil', tech: 'm_antiship' },
  { id: 'radar', size: [2, 2], hp: 260, cost: m(900, 10, 20), time: 360, power: -20, workers: 30, caps: ['radar', 'emit'], radar: 62, look: 'radar', cat: 'def' },
  { id: 'sam_site', size: [2, 2], hp: 300, cost: m(2000, 20, 30), time: 700, power: -10, workers: 40, caps: ['ad'], ad: 'long', look: 'sam_site', cat: 'def', tech: 'a_long' },
  { id: 'aa_gun', size: [1, 1], hp: 160, cost: m(300, 6, 2), time: 120, power: -2, workers: 10, caps: ['ad'], ad: 'gun', look: 'aa_gun', cat: 'def' },
  { id: 'ciws', size: [1, 1], hp: 180, cost: m(700, 8, 8), time: 220, power: -8, workers: 10, caps: ['ad'], ad: 'ciws', look: 'ciws', cat: 'def', tech: 'a_ciws' },
  { id: 'laser', size: [2, 2], hp: 220, cost: m(2600, 20, 40), time: 800, power: -70, workers: 20, caps: ['ad'], ad: 'laser', look: 'laser', cat: 'def', tech: 'a_laser' },
  { id: 'jammer', size: [1, 1], hp: 160, cost: m(800, 6, 16), time: 260, power: -16, workers: 15, caps: ['jammer', 'emit'], jam: 18, gps: true, look: 'jammer', cat: 'def', tech: 'e_jam' },
  { id: 'sigint', size: [2, 2], hp: 220, cost: m(1100, 8, 20), time: 360, power: -14, workers: 40, caps: ['sigint'], sigint: 75, look: 'sigint', cat: 'def', tech: 'e_sigint' },
  { id: 'bunker', size: [1, 1], hp: 500, cost: m(300, 20), time: 160, power: 0, workers: 0, caps: ['vision'], vision: 5, look: 'bunker', cat: 'def', fort: true },
  // Ulaşım (otomatik/özel)
  { id: 'bridge', size: [1, 1], hp: 260, cost: m(0), time: 1, power: 0, workers: 0, look: 'bridge', cat: 'none' },
];
export const B = Object.fromEntries(BUILDINGS.map((b, i) => [b.id, i]));
export const BUILD_CATS = ['eco', 'pow', 'mil', 'def', 'log'];
// Gömülü/dağınık kurulum çarpanları
export const HARDEN = { cost: 1.8, time: 1.6, dmg: 0.4 };
