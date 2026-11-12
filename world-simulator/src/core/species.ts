import type { SpeciesDef } from './types';

/** Default species. Densities follow Damuth-style allometry (see ecosystem.ts). */
export const DEFAULT_SPECIES: SpeciesDef[] = [
  { id: 'microbe', name: 'Toprak mikroorganizmaları', category: 'microbe', habitat: 'land', diet: { detritus: 1 }, massKg: 1e-12, lifespanYr: 0.02, reproRate: 60, tempMin: -15, tempMax: 55, waterNeed: 0.05, dispersal: 0.5, color: '#9c7bd8' },
  { id: 'plankton', name: 'Plankton', category: 'microbe', habitat: 'ocean', diet: { plankton: 1 }, massKg: 1e-9, lifespanYr: 0.05, reproRate: 50, tempMin: -2, tempMax: 34, waterNeed: 0, dispersal: 0.6, color: '#5fd3c0' },
  { id: 'insect', name: 'Böcekler', category: 'insect', habitat: 'land', diet: { grass: 0.6, shrub: 0.3, tree: 0.1 }, massKg: 0.0005, lifespanYr: 0.4, reproRate: 12, tempMin: -5, tempMax: 45, waterNeed: 0.1, dispersal: 0.4, color: '#d6c24f' },
  { id: 'grazer', name: 'Otlayan memeliler', category: 'herbivore', habitat: 'land', diet: { grass: 0.8, shrub: 0.2 }, massKg: 120, lifespanYr: 18, reproRate: 0.45, tempMin: -25, tempMax: 40, waterNeed: 0.15, dispersal: 0.25, color: '#6fc36b' },
  { id: 'browser', name: 'Orman otçulları', category: 'herbivore', habitat: 'land', diet: { tree: 0.6, shrub: 0.4 }, massKg: 60, lifespanYr: 14, reproRate: 0.55, tempMin: -30, tempMax: 36, waterNeed: 0.25, dispersal: 0.2, color: '#3e9e5a' },
  { id: 'wolf', name: 'Kurt benzeri avcılar', category: 'carnivore', habitat: 'land', diet: { herbivore: 1 }, massKg: 40, lifespanYr: 12, reproRate: 0.5, tempMin: -40, tempMax: 35, waterNeed: 0.1, dispersal: 0.35, color: '#d46a5a' },
  { id: 'cat', name: 'Büyük kediler', category: 'carnivore', habitat: 'land', diet: { herbivore: 1 }, massKg: 150, lifespanYr: 16, reproRate: 0.35, tempMin: -5, tempMax: 45, waterNeed: 0.1, dispersal: 0.2, color: '#e8954a' },
  { id: 'bird', name: 'Kuşlar', category: 'bird', habitat: 'land', diet: { insect: 0.7, grass: 0.3 }, massKg: 0.08, lifespanYr: 5, reproRate: 2.2, tempMin: -30, tempMax: 45, waterNeed: 0.05, dispersal: 0.8, color: '#7fb6f0' },
  { id: 'fish', name: 'Balıklar', category: 'fish', habitat: 'ocean', diet: { plankton: 1 }, massKg: 2, lifespanYr: 8, reproRate: 1.6, tempMin: -2, tempMax: 32, waterNeed: 0, dispersal: 0.5, color: '#4a8fe0' },
];
