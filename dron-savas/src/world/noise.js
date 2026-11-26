// Değer gürültüsü + fBm (yalnız aritmetik -> deterministik)
import { hash2f } from '../core/rng.js';

export function valueNoise(x, y, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2f(xi, yi, seed), b = hash2f(xi + 1, yi, seed);
  const c = hash2f(xi, yi + 1, seed), d = hash2f(xi + 1, yi + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, seed, oct = 5, lac = 2, gain = 0.5) {
  let sum = 0, amp = 1, norm = 0, f = 1;
  for (let i = 0; i < oct; i++) {
    sum += valueNoise(x * f, y * f, seed + i * 1013) * amp;
    norm += amp; amp *= gain; f *= lac;
  }
  return sum / norm;
}
// sırt gürültüsü: dağ zincirleri için
export function ridged(x, y, seed, oct = 4) {
  let sum = 0, amp = 1, norm = 0, f = 1;
  for (let i = 0; i < oct; i++) {
    const n = 1 - Math.abs(valueNoise(x * f, y * f, seed + i * 7919) * 2 - 1);
    sum += n * n * amp; norm += amp; amp *= 0.5; f *= 2;
  }
  return sum / norm;
}
