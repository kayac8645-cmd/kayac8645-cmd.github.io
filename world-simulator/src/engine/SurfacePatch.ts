import * as THREE from 'three';
import { latLonToVec, vecToLatLon } from '../core/grid';
import { Noise3 } from '../core/noise';
import { Rng } from '../core/rng';
import type { TerrainSampler } from './terrainSampler';
import { treeGeometry } from './materials';

/**
 * Level-of-detail patch: a locally refined terrain grid around the camera target with
 * procedural micro-relief and instanced vegetation. Rebuilt only when the view moves enough.
 */
export class SurfacePatch {
  group = new THREE.Group();
  private mesh: THREE.Mesh;
  private trees: THREE.InstancedMesh;
  private noise: Noise3;
  private center = { lat: 999, lon: 999, half: 0 };
  /** Unit vector + cos(angular radius) of the area the base planet mesh must hide (patch coverage). */
  hideDir = new THREE.Vector3(0, 1, 0);
  hideCos = 2;
  private lastBuild = 0;
  dataVersion = 0;
  private builtVersion = -1;

  constructor(
    private terrain: TerrainSampler,
    material: THREE.Material,
    seed: number,
    private res = 96,
    private maxTrees = 3000,
  ) {
    this.noise = new Noise3(seed ^ 0x3c6ef372);
    const g = new THREE.PlaneGeometry(1, 1, res, res);
    this.mesh = new THREE.Mesh(g, material);
    this.mesh.frustumCulled = true;
    this.trees = new THREE.InstancedMesh(treeGeometry(), new THREE.MeshLambertMaterial({ vertexColors: true }), maxTrees);
    this.trees.count = 0;
    this.trees.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.mesh, this.trees);
    this.group.visible = false;
  }

  setSeed(seed: number) {
    this.noise = new Noise3(seed ^ 0x3c6ef372);
    this.builtVersion = -1;
  }

  setQuality(res: number, maxTrees: number) {
    if (res === this.res && maxTrees === this.maxTrees) return;
    this.res = res;
    this.maxTrees = maxTrees;
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.PlaneGeometry(1, 1, res, res);
    const mat = this.trees.material;
    this.group.remove(this.trees);
    this.trees.geometry.dispose();
    this.trees = new THREE.InstancedMesh(treeGeometry(), mat, Math.max(1, maxTrees));
    this.trees.count = 0;
    this.group.add(this.trees);
    this.builtVersion = -1;
  }

  invalidate() {
    this.builtVersion = -1;
  }

  /** Called every frame; rebuilds when necessary. */
  update(visible: boolean, lat: number, lon: number, range: number) {
    this.group.visible = visible;
    if (!visible) return;
    const half = Math.min(0.14, Math.max(0.012, range * 1.8)); // radians
    const moved = (Math.abs(lat - this.center.lat) + Math.abs(lon - this.center.lon) * Math.cos((lat * Math.PI) / 180)) * (Math.PI / 180);
    const now = performance.now();
    const need =
      this.builtVersion < 0 ||
      moved > this.center.half * 0.3 ||
      half / this.center.half > 1.6 ||
      this.center.half / half > 1.6 ||
      (this.builtVersion !== this.dataVersion && now - this.lastBuild > 2500);
    if (need && now - this.lastBuild > 120) this.build(lat, lon, half);
  }

  private build(lat: number, lon: number, half: number) {
    this.lastBuild = performance.now();
    this.builtVersion = this.dataVersion;
    this.center = { lat, lon, half };
    const cv = latLonToVec(lat, lon);
    this.hideDir.set(cv[0], cv[1], cv[2]);
    this.hideCos = Math.cos(half * 0.93);
    const t = this.terrain;
    const c = latLonToVec(lat, lon);
    const up = new THREE.Vector3(c[0], c[1], c[2]);
    const nTmp = latLonToVec(Math.min(89.9, lat + 0.01), lon);
    const north = new THREE.Vector3(nTmp[0], nTmp[1], nTmp[2]).sub(up).normalize();
    const east = new THREE.Vector3().crossVectors(north, up).normalize();
    north.crossVectors(up, east).normalize();
    const g = this.mesh.geometry as THREE.PlaneGeometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const uv = g.getAttribute('uv') as THREE.BufferAttribute;
    const n = this.res + 1;
    const lift = 0.00012;
    const d = new THREE.Vector3();
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i;
        const a = (i / this.res) * 2 - 1, b = (j / this.res) * 2 - 1;
        d.copy(up).addScaledVector(east, a * half).addScaledVector(north, -b * half).normalize();
        const ll = vecToLatLon(d.x, d.y, d.z);
        let e = t.elevAt(ll.lat, ll.lon);
        const edge = Math.max(Math.abs(a), Math.abs(b));
        const w = 1 - Math.min(1, Math.max(0, (edge - 0.7) / 0.3));
        if (e > t.seaLevel) {
          const rug = Math.min(1, (e - t.seaLevel) / 2500);
          const s = 90;
          e += w * (60 + 420 * rug) * this.noise.fbm(d.x * s, d.y * s, d.z * s, 5);
          e = Math.max(t.seaLevel + 1, e);
        }
        const r = Math.max(t.waterRadius() - 0.0006, t.radiusFor(e)) + lift * w;
        pos.setXYZ(k, d.x * r, d.y * r, d.z * r);
        let lo = ll.lon;
        if (lo - lon > 180) lo -= 360;
        if (lo - lon < -180) lo += 360;
        uv.setXY(k, (lo + 180) / 360, (ll.lat + 90) / 180);
      }
    }
    pos.needsUpdate = true;
    uv.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
    // trees
    const rng = new Rng(((lat * 1000) | 0) ^ (((lon * 1000) | 0) << 8));
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    const size = Math.min(0.004, Math.max(0.00012, half * 0.012));
    let count = 0;
    const tries = this.maxTrees * 3;
    for (let k = 0; k < tries && count < this.maxTrees; k++) {
      const a = rng.range(-0.92, 0.92), b = rng.range(-0.92, 0.92);
      d.copy(up).addScaledVector(east, a * half).addScaledVector(north, -b * half).normalize();
      const ll = vecToLatLon(d.x, d.y, d.z);
      const cover = t.simAt(t.tree, ll.lat, ll.lon);
      if (rng.next() > cover * 1.1) continue;
      if (t.simAt(t.ice, ll.lat, ll.lon) > 3) continue;
      const e0 = t.elevAt(ll.lat, ll.lon);
      if (e0 <= t.seaLevel + 2) continue;
      const rug = Math.min(1, (e0 - t.seaLevel) / 2500);
      const s = 90;
      const e = Math.max(t.seaLevel + 1, e0 + (60 + 420 * rug) * this.noise.fbm(d.x * s, d.y * s, d.z * s, 5));
      const r = t.radiusFor(e) + lift;
      p.copy(d).multiplyScalar(r);
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
      const z = size * rng.range(0.6, 1.4);
      sc.set(z, z * rng.range(0.8, 1.5), z);
      m.compose(p, q, sc);
      this.trees.setMatrixAt(count, m);
      const boreal = Math.abs(ll.lat) > 50 ? 1 : 0;
      col.setRGB(0.16 + rng.range(0, 0.08), 0.42 - boreal * 0.12 + rng.range(0, 0.1), 0.18 + boreal * 0.06);
      this.trees.setColorAt(count, col);
      count++;
    }
    this.trees.count = count;
    this.trees.instanceMatrix.needsUpdate = true;
    if (this.trees.instanceColor) this.trees.instanceColor.needsUpdate = true;
    this.trees.computeBoundingSphere();
  }

  raycastTargets(): THREE.Object3D[] {
    return this.group.visible ? [this.mesh] : [];
  }
}
