// YZ kişilikleri (ağırlıklar 0..1) ve zorluk seviyeleri (karar kalitesi; hile yok)
export const PERSONALITIES = [
  { id: 'aggressive', aggr: 0.9, defense: 0.35, industry: 0.5, opportun: 0.6, alliance: 0.2, drones: 0.7, missiles: 0.6, sead: 0.8 },
  { id: 'defensive', aggr: 0.25, defense: 0.9, industry: 0.6, opportun: 0.3, alliance: 0.6, drones: 0.5, missiles: 0.4, sead: 0.4 },
  { id: 'industrial', aggr: 0.4, defense: 0.55, industry: 0.95, opportun: 0.4, alliance: 0.5, drones: 0.55, missiles: 0.5, sead: 0.5 },
  { id: 'opportunist', aggr: 0.6, defense: 0.5, industry: 0.6, opportun: 0.95, alliance: 0.35, drones: 0.75, missiles: 0.55, sead: 0.6 },
  { id: 'alliance', aggr: 0.45, defense: 0.6, industry: 0.6, opportun: 0.3, alliance: 0.95, drones: 0.55, missiles: 0.45, sead: 0.5 },
  { id: 'technocrat', aggr: 0.5, defense: 0.6, industry: 0.75, opportun: 0.5, alliance: 0.5, drones: 0.9, missiles: 0.8, sead: 0.9 },
];
// period: karar aralıkları (tick); noise: hatalı karar olasılığı; tactics: gelişmiş taktik kullanımı
export const DIFFICULTY = [
  { id: 'easy', strat: 240, oper: 90, tact: 30, noise: 0.35, tactics: 0, buildPer: 1 },
  { id: 'normal', strat: 160, oper: 60, tact: 20, noise: 0.18, tactics: 1, buildPer: 1 },
  { id: 'hard', strat: 120, oper: 40, tact: 12, noise: 0.08, tactics: 2, buildPer: 2 },
  { id: 'expert', strat: 90, oper: 30, tact: 8, noise: 0.02, tactics: 3, buildPer: 2 },
];
