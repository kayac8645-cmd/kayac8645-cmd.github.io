// Teknoloji ağacı: dallar -> teknolojiler. effects: mod çarpanları; unlock kalemleri tanımlardaki `tech` alanı ile bağlanır.
export const BRANCHES = ['drone', 'missile', 'ad', 'ew', 'industry', 'energy', 'logistics'];
export const TECHS = [
  // Dronlar
  { id: 'd_uav', br: 'drone', cost: 300, req: [] },
  { id: 'd_lr', br: 'drone', cost: 500, req: ['d_uav'] },
  { id: 'd_fiber', br: 'drone', cost: 450, req: [] },
  { id: 'd_relay', br: 'drone', cost: 400, req: ['d_uav'] },
  { id: 'd_swarm', br: 'drone', cost: 600, req: ['d_lr'], fx: { droneSpeed: 1.1, droneEvade: 0.15 } },
  { id: 'd_mother', br: 'drone', cost: 800, req: ['d_swarm'] },
  { id: 'd_male', br: 'drone', cost: 1000, req: ['d_uav', 'd_relay'] },
  { id: 'd_naval', br: 'drone', cost: 650, req: ['d_lr'] },
  { id: 'd_battery', br: 'drone', cost: 550, req: [], fx: { droneRange: 1.3 } },
  { id: 'd_thermal', br: 'drone', cost: 600, req: ['d_uav'], fx: { nightVision: 1 } },
  { id: 'd_autoreturn', br: 'drone', cost: 500, req: ['d_battery'], fx: { autoReturn: 1 } },
  // Füzeler
  { id: 'm_guided', br: 'missile', cost: 350, req: [] },
  { id: 'm_cruise', br: 'missile', cost: 800, req: ['m_guided'] },
  { id: 'm_arm', br: 'missile', cost: 700, req: ['m_guided'] },
  { id: 'm_antiship', br: 'missile', cost: 650, req: ['m_cruise'] },
  { id: 'm_ballistic', br: 'missile', cost: 1400, req: ['m_cruise'] },
  { id: 'm_terrain', br: 'missile', cost: 700, req: ['m_cruise'], fx: { cruiseStealth: 0.5 } },
  { id: 'm_ins', br: 'missile', cost: 600, req: ['m_guided'], fx: { gpsResist: 0.6 } },
  // Hava savunma
  { id: 'a_med', br: 'ad', cost: 500, req: [] },
  { id: 'a_long', br: 'ad', cost: 1100, req: ['a_med'] },
  { id: 'a_ciws', br: 'ad', cost: 600, req: [] },
  { id: 'a_intdrone', br: 'ad', cost: 500, req: [] },
  { id: 'a_bmd', br: 'ad', cost: 1600, req: ['a_long'], fx: { bmd: 1 } },
  { id: 'a_laser', br: 'ad', cost: 1800, req: ['a_ciws', 'p_grid'] },
  { id: 'a_radar', br: 'ad', cost: 700, req: [], fx: { radarRange: 1.25, lowDetect: 1.5 } },
  // Elektronik harp
  { id: 'e_jam', br: 'ew', cost: 450, req: [] },
  { id: 'e_sigint', br: 'ew', cost: 550, req: ['e_jam'] },
  { id: 'e_band1', br: 'ew', cost: 400, req: [], fx: { band: 4 } },
  { id: 'e_band2', br: 'ew', cost: 600, req: ['e_band1'], fx: { band: 5 } },
  { id: 'e_hop', br: 'ew', cost: 900, req: ['e_band1'], fx: { hop: 0.5 } },
  { id: 'e_adapt', br: 'ew', cost: 700, req: ['e_jam'], fx: { adaptFast: 0.4 } },
  { id: 'e_spoof', br: 'ew', cost: 900, req: ['e_jam'], fx: { spoof: 1 } },
  { id: 'e_sat', br: 'ew', cost: 1000, req: ['e_sigint'] },
  // Sanayi
  { id: 'i_auto', br: 'industry', cost: 500, req: [], fx: { prod: 1.15 } },
  { id: 'i_lean', br: 'industry', cost: 700, req: ['i_auto'], fx: { prod: 1.15, workers: 0.85 } },
  { id: 'i_mining', br: 'industry', cost: 450, req: [], fx: { mine: 1.3 } },
  { id: 'i_repair', br: 'industry', cost: 500, req: [], fx: { repair: 1.5 } },
  { id: 'l_armor', br: 'industry', cost: 600, req: [] },
  { id: 'l_air', br: 'industry', cost: 1200, req: ['i_auto'] },
  // Enerji
  { id: 'p_grid', br: 'energy', cost: 500, req: [], fx: { gridRange: 1.3 } },
  { id: 'p_solar', br: 'energy', cost: 450, req: [] },
  { id: 'p_nuclear', br: 'energy', cost: 1500, req: ['p_grid'] },
  { id: 'p_eff', br: 'energy', cost: 700, req: ['p_grid'], fx: { powerUse: 0.85 } },
  { id: 'p_gen', br: 'energy', cost: 450, req: [], fx: { generators: 1 } },
  // Lojistik
  { id: 'g_rail', br: 'logistics', cost: 600, req: [] },
  { id: 'g_trucks', br: 'logistics', cost: 450, req: [], fx: { convoySpeed: 1.3, convoyCap: 1.3 } },
  { id: 'g_supply', br: 'logistics', cost: 600, req: ['g_trucks'], fx: { supplyRange: 1.4 } },
  { id: 'l_comms', br: 'logistics', cost: 500, req: [] },
  { id: 'g_fort', br: 'logistics', cost: 550, req: [], fx: { entrench: 1.6 } },
];
export const TECH_BY = Object.fromEntries(TECHS.map((t, i) => [t.id, i]));
