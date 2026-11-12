import * as THREE from 'three';
import { HR_H, HR_W, EARTH_RADIUS_KM, latLonToVec, vecToLatLon } from '../core/grid';
import { seedToInt } from '../core/rng';
import { dayOfYear } from '../core/calendar';
import type { FramePayload, SettlementLite } from '../worker/protocol';
import { CameraController, type CameraMode } from './CameraController';
import { TerrainSampler } from './terrainSampler';
import { SurfacePatch } from './SurfacePatch';
import { EffectsManager } from './Effects';
import { atmosphereMaterial, makeStars } from './materials';

export type Quality = 'low' | 'medium' | 'high';
const QUALITY = {
  low: { seg: [160, 80], patch: 48, trees: 600, dpr: 1 },
  medium: { seg: [320, 160], patch: 72, trees: 1800, dpr: 1.5 },
  high: { seg: [640, 320], patch: 110, trees: 4000, dpr: 2 },
} as const;

export interface RendererCallbacks {
  onTap: (lat: number, lon: number, repeat: boolean) => void;
  onModeChange: (m: CameraMode) => void;
  onHover?: (lat: number, lon: number) => void;
}

export class PlanetRenderer {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  controller: CameraController;
  terrain = new TerrainSampler();
  private starScene = new THREE.Scene();
  private starCam: THREE.PerspectiveCamera;
  private planet: THREE.Mesh;
  private water: THREE.Mesh;
  private clouds: THREE.Mesh;
  private atmo: THREE.Mesh;
  private atmoMat: THREE.ShaderMaterial;
  private sun = new THREE.DirectionalLight(0xffffff, 2.4);
  private surfaceTex: THREE.DataTexture;
  private cloudTex: THREE.DataTexture;
  private patch: SurfacePatch;
  private effects: EffectsManager;
  private brush: THREE.Mesh;
  private selection: THREE.Mesh;
  private settlementPts: THREE.Points;
  private baseDirs: Float32Array = new Float32Array(0);
  quality: Quality = 'high';
  private raf = 0;
  private last = performance.now();
  private frames = 0;
  private fpsT = performance.now();
  fps = 0;
  private day = 0;
  private showClouds = true;
  private atmoDensity = 1;
  private globalTint = new THREE.Color(1, 1, 1);
  private resizeObs: ResizeObserver;
  private hasTerrain = false;
  private hideUniforms = { dir: { value: new THREE.Vector3(0, 1, 0) }, cos: { value: 2 } };

  constructor(private container: HTMLElement, cb: RendererCallbacks) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.touchAction = 'none';
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10);
    this.starCam = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    this.starScene.add(makeStars());

    this.surfaceTex = new THREE.DataTexture(new Uint8Array(HR_W * HR_H * 4), HR_W, HR_H, THREE.RGBAFormat);
    this.surfaceTex.colorSpace = THREE.SRGBColorSpace;
    this.surfaceTex.wrapS = THREE.RepeatWrapping;
    this.surfaceTex.magFilter = THREE.LinearFilter;
    this.surfaceTex.minFilter = THREE.LinearMipmapLinearFilter;
    this.surfaceTex.generateMipmaps = true;
    this.surfaceTex.anisotropy = 4;
    this.cloudTex = new THREE.DataTexture(new Uint8Array(HR_W * HR_H * 4), HR_W, HR_H, THREE.RGBAFormat);
    this.cloudTex.colorSpace = THREE.SRGBColorSpace;
    this.cloudTex.magFilter = THREE.LinearFilter;
    this.cloudTex.minFilter = THREE.LinearFilter;

    const planetMat = new THREE.MeshStandardMaterial({ map: this.surfaceTex, roughness: 0.92, metalness: 0 });
    // The base mesh is hidden where the high-detail LOD patch is drawn (avoids z-fighting between LODs).
    planetMat.onBeforeCompile = (sh) => {
      sh.uniforms.uHideDir = this.hideUniforms.dir;
      sh.uniforms.uHideCos = this.hideUniforms.cos;
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjDir;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjDir = normalize(position);');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObjDir;\nuniform vec3 uHideDir;\nuniform float uHideCos;')
        .replace('void main() {', 'void main() {\n  if (dot(normalize(vObjDir), uHideDir) > uHideCos) discard;');
    };
    this.planet = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), planetMat);
    this.water = new THREE.Mesh(
      new THREE.SphereGeometry(1, 160, 80),
      new THREE.MeshStandardMaterial({ color: 0x0f3a5e, roughness: 0.22, metalness: 0.15, transparent: true, opacity: 0.5, depthWrite: false }),
    );
    this.water.renderOrder = 1;
    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.032, 128, 64),
      new THREE.MeshLambertMaterial({ map: this.cloudTex, transparent: true, depthWrite: false }),
    );
    this.clouds.renderOrder = 3;
    this.atmoMat = atmosphereMaterial(new THREE.Color(0.35, 0.65, 1.0), 1.1);
    this.atmo = new THREE.Mesh(new THREE.SphereGeometry(1.085, 96, 48), this.atmoMat);
    this.atmo.renderOrder = 4;
    this.scene.add(this.planet, this.water, this.clouds, this.atmo);
    this.scene.add(this.sun, new THREE.AmbientLight(0x6688aa, 0.32), new THREE.HemisphereLight(0x9ec9ff, 0x1a1408, 0.25));
    this.scene.add(this.sun.target);

    const patchMat = new THREE.MeshStandardMaterial({ map: this.surfaceTex, roughness: 0.95, metalness: 0 });
    this.patch = new SurfacePatch(this.terrain, patchMat, 1, QUALITY.high.patch, QUALITY.high.trees);
    this.scene.add(this.patch.group);
    this.effects = new EffectsManager(this.terrain);
    this.scene.add(this.effects.group);

    this.brush = new THREE.Mesh(
      new THREE.RingGeometry(0.94, 1, 72),
      new THREE.MeshBasicMaterial({ color: 0x4fe3d6, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthTest: false }),
    );
    this.brush.renderOrder = 10;
    this.brush.visible = false;
    this.selection = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 1, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthTest: false }),
    );
    this.selection.renderOrder = 11;
    this.selection.visible = false;
    this.scene.add(this.brush, this.selection);

    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 200), 3));
    sg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(3 * 200), 3));
    this.settlementPts = new THREE.Points(sg, new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false }));
    this.settlementPts.frustumCulled = false;
    this.settlementPts.renderOrder = 5;
    this.scene.add(this.settlementPts);

    this.controller = new CameraController(this.camera, this.renderer.domElement, this.terrain, {
      onTap: (x, y, rep) => {
        const ll = this.pick(x, y);
        if (ll) cb.onTap(ll.lat, ll.lon, rep);
      },
      onModeChange: (m) => cb.onModeChange(m),
      onHover: (x, y) => {
        if (!this.brush.userData.radiusKm) return;
        const ll = this.pick(x, y);
        if (ll) {
          this.placeRing(this.brush, ll.lat, ll.lon, this.brush.userData.radiusKm);
          this.brush.visible = true;
          cb.onHover?.(ll.lat, ll.lon);
        } else this.brush.visible = false;
      },
    });
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    this.setQuality('high');
    this.resize();
    this.loop();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.controller.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private resize() {
    const w = this.container.clientWidth || 1, h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.starCam.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.starCam.updateProjectionMatrix();
  }

  setQuality(q: Quality) {
    this.quality = q;
    const Q = QUALITY[q];
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, Q.dpr));
    const old = this.planet.geometry;
    const g = new THREE.SphereGeometry(1, Q.seg[0], Q.seg[1]);
    this.baseDirs = Float32Array.from(g.getAttribute('position').array as Float32Array);
    this.planet.geometry = g;
    old.dispose();
    this.patch.setQuality(Q.patch, Q.trees);
    // mipmap regeneration on every texture upload is the main GPU cost on weak devices
    const mips = q !== 'low';
    this.surfaceTex.generateMipmaps = mips;
    this.surfaceTex.minFilter = mips ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    this.surfaceTex.needsUpdate = true;
    if (this.hasTerrain) this.applyDisplacement();
    this.resize();
  }

  setSeed(seed: string) {
    this.patch.setSeed(seedToInt(seed));
  }

  setExaggeration(x: number) {
    this.terrain.exaggeration = x;
    if (this.hasTerrain) this.applyDisplacement();
  }

  setAtmosphere(density: number) {
    this.atmoDensity = density;
  }

  setShowClouds(b: boolean) {
    this.showClouds = b;
  }

  setTerrain(hrElev: Float32Array, seaLevel: number) {
    this.terrain.hrElev = hrElev;
    this.terrain.seaLevel = seaLevel;
    this.hasTerrain = true;
    this.applyDisplacement();
  }

  private applyDisplacement() {
    const g = this.planet.geometry as THREE.SphereGeometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const { widthSegments: ws, heightSegments: hs } = g.parameters;
    const b = this.baseDirs;
    for (let iy = 0; iy <= hs; iy++) {
      const lat = 90 - (iy / hs) * 180;
      for (let ix = 0; ix <= ws; ix++) {
        const k = iy * (ws + 1) + ix;
        const lon = (ix / ws) * 360 - 180;
        const r = this.terrain.radiusFor(this.terrain.elevAt(lat, lon));
        pos.setXYZ(k, b[k * 3] * r, b[k * 3 + 1] * r, b[k * 3 + 2] * r);
      }
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    g.computeBoundingSphere();
    this.patch.invalidate();
  }

  setFrame(fr: FramePayload) {
    (this.surfaceTex.image as { data: Uint8Array }).data = new Uint8Array(fr.surface.buffer);
    this.surfaceTex.needsUpdate = true;
    (this.cloudTex.image as { data: Uint8Array }).data = new Uint8Array(fr.clouds.buffer);
    this.cloudTex.needsUpdate = true;
    this.terrain.tree = fr.tree;
    this.terrain.ice = fr.ice;
    if (Math.abs(fr.seaLevel - this.terrain.seaLevel) > 0.5) {
      this.terrain.seaLevel = fr.seaLevel;
      this.applyDisplacement();
    }
    this.patch.dataVersion++;
    this.effects.sync(fr.events);
    this.updateSettlements(fr.settlements);
    this.day = fr.stats.day;
    const ice = fr.events.some((e) => e.type === 'iceAge');
    const warm = fr.events.some((e) => e.type === 'climateChange');
    this.globalTint.setRGB(warm ? 1.25 : ice ? 0.8 : 1, ice ? 1.05 : warm ? 0.85 : 1, ice ? 1.3 : warm ? 0.7 : 1);
    const haze = Math.min(1, fr.stats.aerosol * 0.15);
    this.globalTint.lerp(new THREE.Color(0.75, 0.6, 0.45), haze);
  }

  private updateSettlements(list: SettlementLite[]) {
    const g = this.settlementPts.geometry;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const col = g.getAttribute('color') as THREE.BufferAttribute;
    const n = Math.min(200, list.length);
    for (let i = 0; i < n; i++) {
      const s = list[i];
      const r = this.terrain.surfaceRadius(s.lat, s.lon) + 0.003;
      const v = latLonToVec(s.lat, s.lon);
      pos.setXYZ(i, v[0] * r, v[1] * r, v[2] * r);
      const t = Math.min(1, s.tech / 10);
      col.setXYZ(i, 1, 0.75 + 0.2 * t, 0.35 + 0.5 * t);
    }
    g.setDrawRange(0, n);
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }

  setBrush(radiusKm: number | null) {
    this.brush.userData.radiusKm = radiusKm;
    if (!radiusKm) this.brush.visible = false;
  }

  setSelection(lat: number | null, lon = 0) {
    if (lat === null) {
      this.selection.visible = false;
      return;
    }
    this.placeRing(this.selection, lat, lon, 60);
    this.selection.visible = true;
  }

  private placeRing(m: THREE.Mesh, lat: number, lon: number, radiusKm: number) {
    const v = latLonToVec(lat, lon);
    const n = new THREE.Vector3(v[0], v[1], v[2]);
    m.position.copy(n).multiplyScalar(this.terrain.surfaceRadius(lat, lon) + 0.002);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    const alt = Math.max(0.002, this.camera.position.length() - 1);
    const minR = alt * 0.02;
    m.scale.setScalar(Math.max(minR, radiusKm / EARTH_RADIUS_KM));
  }

  /** Ray–heightfield intersection (march + bisection). */
  pick(clientX: number, clientY: number): { lat: number; lon: number } | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const o = ray.ray.origin, d = ray.ray.direction;
    // bounding sphere r = 1.05
    const b = o.dot(d), c = o.lengthSq() - 1.05 * 1.05;
    const disc = b * b - c;
    if (disc < 0) return null;
    let t0 = Math.max(0, -b - Math.sqrt(disc));
    const t1 = -b + Math.sqrt(disc);
    const p = new THREE.Vector3();
    const below = (t: number) => {
      p.copy(o).addScaledVector(d, t);
      const ll = vecToLatLon(p.x, p.y, p.z);
      return p.length() <= this.terrain.surfaceRadius(ll.lat, ll.lon);
    };
    const steps = 160;
    const dt = (t1 - t0) / steps;
    let hit = -1;
    for (let k = 1; k <= steps; k++) {
      const t = t0 + k * dt;
      if (below(t)) {
        hit = t;
        break;
      }
    }
    if (hit < 0) return null;
    let lo = hit - dt, hi = hit;
    for (let k = 0; k < 20; k++) {
      const m = (lo + hi) / 2;
      if (below(m)) hi = m;
      else lo = m;
    }
    t0 = hi;
    p.copy(o).addScaledVector(d, t0);
    return vecToLatLon(p.x, p.y, p.z);
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.frames++;
    if (now - this.fpsT > 1000) {
      this.fps = (this.frames * 1000) / (now - this.fpsT);
      this.frames = 0;
      this.fpsT = now;
    }
    this.controller.update(dt);
    const alt = this.camera.position.length() - 1;
    const surfaceMode = this.controller.mode === 'surface';
    const f = this.controller.sfCur;
    this.patch.update(surfaceMode && alt < 0.3, f.lat, f.lon, f.range);
    const patchOn = this.patch.group.visible;
    this.hideUniforms.dir.value.copy(this.patch.hideDir);
    this.hideUniforms.cos.value = patchOn ? this.patch.hideCos : 2;
    this.effects.update(dt);
    // sun: seasonal declination; azimuth follows the view so the lit hemisphere faces the user
    const decl = 23.44 * Math.sin((2 * Math.PI * (dayOfYear(this.day) - 80)) / 365) * (Math.PI / 180);
    const cp = this.camera.position;
    const az = Math.atan2(cp.z, cp.x) - 0.75;
    const sunDir = new THREE.Vector3(Math.cos(decl) * Math.cos(az), Math.sin(decl), Math.cos(decl) * Math.sin(az));
    if (surfaceMode) sunDir.lerp(cp.clone().normalize(), 0.5).normalize();
    this.sun.position.copy(sunDir).multiplyScalar(10);
    this.atmoMat.uniforms.uSunDir.value.copy(sunDir);
    const ad = this.atmoDensity;
    this.atmoMat.uniforms.uIntensity.value = (0.5 + 0.6 * Math.sqrt(ad)) * (surfaceMode ? 0.6 : 1);
    (this.atmoMat.uniforms.uColor.value as THREE.Color).setRGB(0.35 * this.globalTint.r, 0.65 * this.globalTint.g, 1.0 * this.globalTint.b);
    this.atmo.visible = alt > 0.01;
    const cm = this.clouds.material as THREE.MeshLambertMaterial;
    this.clouds.visible = this.showClouds;
    cm.opacity = Math.max(0.12, Math.min(1, (alt - 0.02) / 0.15));
    this.starCam.quaternion.copy(this.camera.quaternion);
    this.starCam.fov = this.camera.fov;
    this.renderer.clear();
    this.renderer.render(this.starScene, this.starCam);
    this.renderer.render(this.scene, this.camera);
  };
}
export type { CameraMode };
