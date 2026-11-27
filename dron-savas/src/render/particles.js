// Parçacık havuzu (SoA, sabit kapasite -> çöp toplayıcı baskısı yok): duman, ateş, kıvılcım, parlama, şok halkası,
// enkaz, füze izi, iz mermisi, su sıçraması. Hava (yağmur/kar) ekran-uzayı ayrı havuzda.
export const PT = { SMOKE: 0, FIRE: 1, SPARK: 2, FLASH: 3, RING: 4, DEBRIS: 5, TRAIL: 6, TRACER: 7, SPLASH: 8, STEAM: 9, LASER: 10 };
const F = 13; // alan sayısı: x y z vx vy vz life max size type r g b(renk anahtarı) + x2 y2
export class Particles {
  constructor(cap = 5000, scale = 1) { this.sc = scale; this.setCap(cap); this.wx = new Float32Array(1200); this.wy = new Float32Array(1200); this.ws = new Float32Array(1200); }
  setCap(cap) {
    this.cap = cap; this.n = 0;
    this.d = new Float32Array(cap * F); this.x2 = new Float32Array(cap); this.y2 = new Float32Array(cap); this.col = new Uint32Array(cap);
  }
  emit(type, x, y, z, vx, vy, vz, life, size, col = 0xffffffff, x2 = 0, y2 = 0) {
    if (this.n >= this.cap) { // en eskinin üstüne yaz (dairesel)
      this._w = ((this._w || 0) + 1) % this.cap; var i = this._w;
    } else i = this.n++;
    const o = i * F, d = this.d, sc = this.sc; // ölçek: 32 px karoda hız/boyut/yükseklik büyür
    d[o] = x; d[o + 1] = y; d[o + 2] = z * sc; d[o + 3] = vx * sc; d[o + 4] = vy * sc; d[o + 5] = vz * sc; d[o + 6] = life; d[o + 7] = life; d[o + 8] = size * sc; d[o + 9] = type;
    this.col[i] = col; this.x2[i] = x2; this.y2[i] = y2;
  }
  update(dt, windX, windY) {
    const d = this.d; let n = this.n;
    for (let i = 0; i < n; i++) {
      const o = i * F;
      d[o + 6] -= dt;
      if (d[o + 6] <= 0) { // swap-remove
        n--; if (i !== n) { const s = n * F; for (let k = 0; k < F; k++) d[o + k] = d[s + k]; this.col[i] = this.col[n]; this.x2[i] = this.x2[n]; this.y2[i] = this.y2[n]; }
        i--; continue;
      }
      const t = d[o + 9];
      if (t === PT.SMOKE || t === PT.STEAM) { d[o + 3] += windX * 6 * this.sc * dt; d[o + 4] += windY * 6 * this.sc * dt; d[o + 8] += dt * (t === PT.STEAM ? 7 : 5) * this.sc; }
      if (t === PT.DEBRIS || t === PT.SPARK) d[o + 5] -= 60 * this.sc * dt;
      d[o] += d[o + 3] * dt; d[o + 1] += d[o + 4] * dt; d[o + 2] = Math.max(0, d[o + 2] + d[o + 5] * dt);
    }
    this.n = n;
  }
}
