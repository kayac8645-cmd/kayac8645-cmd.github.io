// Zaman, mevsim, gün ışığı ve hava durumu (simülasyonu gerçekten etkiler)
export const TICKS_PER_DAY = 1440; // 1 tick = 1 oyun dakikası
export const DAYS_PER_SEASON = 10;
export const START_MIN = 7 * 60;
export const WEATHERS = ['clear', 'rain', 'fog', 'storm', 'snow'];
const P = [ // [clear, rain, fog, storm, snow] mevsime göre
  [0.45, 0.35, 0.15, 0.05, 0], [0.78, 0.07, 0.05, 0.1, 0], [0.35, 0.3, 0.25, 0.1, 0], [0.3, 0.02, 0.2, 0.05, 0.43],
];
const VIS = { clear: 1, rain: 0.8, fog: 0.45, storm: 0.6, snow: 0.7 };

export function initEnv(sim) {
  sim.env = { minute: START_MIN, day: 0, hour: 7, season: 0, daylight: 1, weather: 'clear', wxTimer: 300, windX: 0.1, windY: 0.05, visMul: 1, airSpeed: 1, airDrain: 1, groundMul: 1, intensity: 0 };
  updateWeather(sim);
}
export function updateWeather(sim) {
  const env = sim.env;
  const m = sim.tick - (sim.setupTicks || 0) + START_MIN;
  env.minute = m; env.day = Math.floor(m / TICKS_PER_DAY); env.hour = (m % TICKS_PER_DAY) / 60;
  const season = Math.floor(env.day / DAYS_PER_SEASON) % 4;
  if (season !== env.season) { env.season = season; sim.emit({ k: 'season', season }); sim.map.version++; }
  const h = env.hour;
  let dl = 1 - Math.abs(h - 12.5) / 7; dl = dl < 0 ? 0 : dl > 1 ? 1 : dl; env.daylight = dl * dl * (3 - 2 * dl);
  if (--env.wxTimer <= 0) {
    const r = sim.rng.next(); const p = P[env.season]; let acc = 0, w = 'clear';
    for (let k = 0; k < 5; k++) { acc += p[k]; if (r < acc) { w = WEATHERS[k]; break; } }
    if (w !== env.weather) sim.emit({ k: 'weather', w });
    env.weather = w; env.wxTimer = 240 + sim.rng.int(600);
    const s = w === 'storm' ? 1.2 : 0.15 + sim.rng.next() * 0.45;
    const [dx, dy] = sim.rng.disk(); const L = Math.sqrt(dx * dx + dy * dy) || 1;
    env.windX = dx / L * s; env.windY = dy / L * s;
    env.intensity = w === 'clear' ? 0 : 0.4 + sim.rng.next() * 0.6;
  }
  const night = 0.45 + 0.55 * env.daylight;
  env.visMul = VIS[env.weather] * night;
  env.visMulThermal = VIS[env.weather] * (0.85 + 0.15 * env.daylight);
  env.airSpeed = env.weather === 'storm' ? 0.7 : env.weather === 'rain' || env.weather === 'snow' ? 0.9 : 1;
  env.airDrain = env.weather === 'storm' ? 1.6 : env.weather === 'snow' ? 1.25 : 1; // soğuk batarya
  env.mud = (env.season === 0 && (env.weather === 'rain' || env.weather === 'storm')) || (env.season === 2 && env.weather === 'rain');
  env.groundMul = env.mud ? 0.55 : env.season === 3 ? 0.8 : 1;
}
// görüş çarpanı (ülke termal teknolojisine göre)
export function visionMul(sim, c) { return sim.mod(c, 'nightVision', 0) ? sim.env.visMulThermal : sim.env.visMul; }
