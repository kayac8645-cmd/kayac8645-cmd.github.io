import { HR_H, HR_W, SIM_H, SIM_W, sampleBilinear, latLonToGrid } from '../core/grid';

/** Main-thread view of terrain used by the renderer and camera. */
export class TerrainSampler {
  hrElev = new Float32Array(HR_W * HR_H);
  seaLevel = 0;
  tree = new Float32Array(SIM_W * SIM_H);
  ice = new Float32Array(SIM_W * SIM_H);
  exaggeration = 20;

  get k() {
    return this.exaggeration / 6_371_000;
  }

  elevAt(lat: number, lon: number): number {
    const { gx, gy } = latLonToGrid(lat, lon, HR_W, HR_H);
    return sampleBilinear(this.hrElev, HR_W, HR_H, gx, gy);
  }

  simAt(field: Float32Array, lat: number, lon: number): number {
    const { gx, gy } = latLonToGrid(lat, lon, SIM_W, SIM_H);
    return sampleBilinear(field, SIM_W, SIM_H, gx, gy);
  }

  /** Render radius for a metres-above-datum elevation. Land gets a small lift above the water sphere. */
  radiusFor(e: number): number {
    const h = e - this.seaLevel;
    if (h > 0) return 1.0004 + h * this.k;
    return 0.9985 + h * this.k * 0.35;
  }

  waterRadius() {
    return 1.0;
  }

  surfaceRadius(lat: number, lon: number) {
    return Math.max(this.waterRadius(), this.radiusFor(this.elevAt(lat, lon)));
  }
}
