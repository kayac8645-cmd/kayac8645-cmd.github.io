// Prosedürel kurgusal isimler ve bayraklar (gerçek ülke/şehir yok)
const ON = ['Var', 'Kor', 'Ald', 'Mer', 'Tes', 'Bal', 'Dra', 'Esk', 'Fal', 'Gor', 'Hal', 'Ist', 'Kel', 'Lun', 'Nor', 'Ost', 'Pel', 'Ras', 'Sel', 'Tar', 'Ulm', 'Vel', 'Yar', 'Zan', 'Bor', 'Cer', 'Dun', 'Ered', 'Fen', 'Grav'];
const MID = ['a', 'e', 'i', 'o', 'u', 'ae', 'ia', 'ar', 'en', 'is', 'ol', 'un', 'ir', 'ev', 'an'];
const END = ['nya', 'ria', 'stan', 'dor', 'mar', 'land', 'via', 'gard', 'heim', 'sia', 'tia', 'nor', 'van', 'lia', 'dal'];
const GOV = ['Cumhuriyeti', 'Federasyonu', 'Krallığı', 'Birliği', 'Konfederasyonu', 'Prensliği', 'Devleti'];
const CEND = ['grad', 'ova', 'burg', 'kent', 'polis', 'abad', 'ice', 'stad', 'port', 'ir', 'yaz', 'vik', 'ston', 'mir', 'en'];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function countryName(rng) {
  const base = cap(rng.pick(ON) + rng.pick(MID) + rng.pick(END)).replace(/(.)\1\1/g, '$1$1');
  return { short: base, full: base + ' ' + rng.pick(GOV) };
}
export function cityName(rng) {
  return cap((rng.pick(ON) + (rng.chance(0.5) ? rng.pick(MID) : '') + rng.pick(CEND)).toLowerCase());
}
// Bayrak: düzen + 3 palet rengi + amblem
export const FLAG_LAYOUTS = ['hstripe3', 'vstripe3', 'hstripe2', 'cross', 'canton', 'diag', 'border', 'circle'];
const FLAG_COLORS = ['e1', 'e2', 'u1', 'u2', 'g2', 'g4', 'l0', 'k7', 'k0', 'o1', 'w3', 'f1', 'b3', 'n2'];
export function makeFlag(rng, teamKey) {
  const cols = [teamKey];
  while (cols.length < 3) { const c = rng.pick(FLAG_COLORS); if (!cols.includes(c)) cols.push(c); }
  return { layout: rng.pick(FLAG_LAYOUTS), colors: cols, emblem: rng.int(4) };
}
