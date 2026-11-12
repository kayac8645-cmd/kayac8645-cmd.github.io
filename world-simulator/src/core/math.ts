export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}
/** Saturation vapour pressure (hPa), Magnus formula. */
export function satVap(tC: number): number {
  const t = tC < -60 ? -60 : tC > 60 ? 60 : tC;
  return 6.112 * Math.exp((17.67 * t) / (t + 243.5));
}
/**
 * Exact solution of dx/dt = a·x − b·x² over dt (Bernoulli / logistic).
 * Stable for any dt and any sign of a — used for every population update.
 */
export function logisticStep(x: number, a: number, b: number, dt: number): number {
  if (x <= 0) return 0;
  const adt = a * dt;
  if (Math.abs(adt) < 1e-7) return x / (1 + b * x * dt);
  const e = Math.exp(adt > 60 ? 60 : adt);
  const den = a + b * x * (e - 1);
  if (den === 0 || !isFinite(den)) return a > 0 && b > 0 ? a / b : 0;
  const r = (a * x * e) / den;
  return r > 0 && isFinite(r) ? r : 0;
}
/** For T(t)=m+A·sin(t): fraction of the year with T > thr. */
export function fracAbove(m: number, A: number, thr: number): number {
  const d = m - thr;
  if (A <= 1e-6) return d > 0 ? 1 : 0;
  const r = clamp(d / A, -1, 1);
  return 0.5 + Math.asin(r) / Math.PI;
}
/** Mean of max(0, T−thr) over a sinusoidal year (positive degree-days per day). */
export function meanPositive(m: number, A: number, thr: number): number {
  const d = m - thr;
  if (A <= 1e-6 || d >= A) return Math.max(0, d);
  if (d <= -A) return 0;
  const r = d / A;
  return (d * (Math.PI / 2 + Math.asin(r)) + A * Math.sqrt(1 - r * r)) / Math.PI;
}
