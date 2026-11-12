import { Rng } from './rng';

const SYL_A = ['ka', 'ra', 'mo', 'zan', 'tel', 'vor', 'li', 'sa', 'dor', 'en', 'is', 'ul', 'ba', 'kir', 'nes', 'ta', 'ya', 'gor', 'mi', 'ar', 'el', 'ost', 'un', 'pa', 'ze'];
const SYL_B = ['ya', 'ra', 'nia', 'ta', 'dor', 'lis', 'van', 'mar', 'kan', 'tia', 'ros', 'vel', 'dun', 'gar', 'lin', 'zor'];

export function makeName(rng: Rng, syllables = 2): string {
  let s = '';
  for (let i = 0; i < syllables; i++) s += rng.pick(SYL_A);
  s += rng.pick(SYL_B);
  return s[0].toUpperCase() + s.slice(1);
}

export function directionName(lat: number, lon: number): string {
  const ns = lat > 25 ? 'Kuzey' : lat < -25 ? 'Güney' : '';
  const ew = lon > 60 ? 'Doğu' : lon < -60 ? 'Batı' : '';
  if (ns && ew) return `${ns}${ew.toLowerCase()}`;
  return ns || ew || 'Orta';
}
