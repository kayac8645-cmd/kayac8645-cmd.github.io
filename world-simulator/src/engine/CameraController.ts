import * as THREE from 'three';
import { latLonToVec, vecToLatLon } from '../core/grid';
import type { TerrainSampler } from './terrainSampler';

export type CameraMode = 'space' | 'surface';
const D2R = Math.PI / 180;

export interface ControllerCallbacks {
  onTap: (clientX: number, clientY: number, repeat: boolean) => void;
  onModeChange: (m: CameraMode) => void;
  onHover?: (clientX: number, clientY: number) => void;
}

function v3(lat: number, lon: number, r = 1) {
  const a = latLonToVec(lat, lon);
  return new THREE.Vector3(a[0] * r, a[1] * r, a[2] * r);
}

/** Local tangent frame at a lat/lon (east, north, up). */
function frame(lat: number, lon: number) {
  const up = v3(lat, lon);
  const north = v3(Math.min(89.999, lat + 0.01), lon).sub(v3(Math.max(-89.999, lat - 0.01), lon)).normalize();
  if (!isFinite(north.x) || north.lengthSq() < 0.5) north.set(0, 1, 0);
  const east = new THREE.Vector3().crossVectors(north, up).normalize();
  north.crossVectors(up, east).normalize();
  return { up, north, east };
}

export class CameraController {
  mode: CameraMode = 'space';
  // space state (desired + current)
  sp = { lat: 20, lon: 10, dist: 3.2 };
  spCur = { lat: 20, lon: 10, dist: 3.2 };
  // surface state
  sf = { lat: 0, lon: 0, heading: 0, pitch: 30, range: 0.06 };
  sfCur = { lat: 0, lon: 0, heading: 0, pitch: 30, range: 0.06 };
  enabled = true;
  autoRotate = false;
  private transition: { t: number; dur: number; fromPos: THREE.Vector3; fromQuat: THREE.Quaternion } | null = null;
  private pointers = new Map<number, { x: number; y: number; sx: number; sy: number; t: number; button: number }>();
  private pinch0 = 0;
  private mid0 = { x: 0, y: 0 };
  private holdTimer = 0;
  private moved = false;
  private keys = new Set<string>();

  constructor(
    private camera: THREE.PerspectiveCamera,
    private el: HTMLElement,
    private terrain: TerrainSampler,
    private cb: ControllerCallbacks,
  ) {
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointercancel', this.onUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKeyUp);
    // portrait screens: start further away so the whole planet fits
    const aspect = (el.clientWidth || 1) / (el.clientHeight || 1);
    if (aspect < 1) {
      this.sp.dist = this.spCur.dist = 1 + 2.2 / Math.max(0.4, aspect);
    }
  }

  dispose() {
    this.el.removeEventListener('pointerdown', this.onDown);
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerup', this.onUp);
    this.el.removeEventListener('pointercancel', this.onUp);
    this.el.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKeyUp);
    clearInterval(this.holdTimer);
  }

  /** Camera altitude above the surface (planet radii). */
  altitude() {
    return this.mode === 'space' ? this.spCur.dist - 1 : this.sfCur.range * Math.sin(this.sfCur.pitch * D2R) + 0.002;
  }

  focusLatLon(): { lat: number; lon: number } {
    return this.mode === 'space' ? { lat: this.spCur.lat, lon: this.spCur.lon } : { lat: this.sfCur.lat, lon: this.sfCur.lon };
  }

  private startTransition(dur = 1.4) {
    this.transition = { t: 0, dur, fromPos: this.camera.position.clone(), fromQuat: this.camera.quaternion.clone() };
  }

  enterSurface(lat: number, lon: number, range = 0.05) {
    this.sf = { lat, lon, heading: 0, pitch: 32, range };
    this.sfCur = { ...this.sf };
    this.mode = 'surface';
    this.startTransition();
    this.cb.onModeChange('surface');
  }

  exitToSpace(dist = 2.6) {
    const c = this.focusLatLon();
    this.sp = { lat: c.lat, lon: c.lon, dist };
    this.spCur = { ...this.sp };
    this.mode = 'space';
    this.startTransition();
    this.cb.onModeChange('space');
  }

  flyTo(lat: number, lon: number) {
    if (this.mode === 'space') {
      this.sp.lat = lat;
      this.sp.lon = lon;
      this.sp.dist = Math.min(this.sp.dist, 2.4);
    } else {
      this.sf.lat = lat;
      this.sf.lon = lon;
      this.sfCur.lat = lat;
      this.sfCur.lon = lon;
      this.startTransition(1.0);
    }
  }

  // ---------------------------------------------------------------- input
  private onDown = (e: PointerEvent) => {
    if (!this.enabled) return;
    this.el.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), button: e.button });
    this.moved = false;
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
      this.mid0 = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      clearInterval(this.holdTimer);
    } else if (this.pointers.size === 1) {
      const cx = e.clientX, cy = e.clientY;
      clearInterval(this.holdTimer);
      const start = performance.now();
      this.holdTimer = window.setInterval(() => {
        if (this.moved || this.pointers.size !== 1) return clearInterval(this.holdTimer);
        if (performance.now() - start > 450) this.cb.onTap(cx, cy, true);
      }, 220);
    }
  };

  private onMove = (e: PointerEvent) => {
    this.cb.onHover?.(e.clientX, e.clientY);
    const p = this.pointers.get(e.pointerId);
    if (!p || !this.enabled) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 7) this.moved = true;
    const h = this.el.clientHeight || 800;
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (this.pinch0 > 0) this.zoom(this.pinch0 / Math.max(d, 1));
      this.pinch0 = d;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const mdx = mid.x - this.mid0.x, mdy = mid.y - this.mid0.y;
      this.mid0 = mid;
      if (this.mode === 'surface') this.rotate(mdx * 0.5, mdy * 0.5);
      else this.orbit(mdx, mdy, h);
      return;
    }
    const rotateMode = p.button === 2 || e.shiftKey || e.ctrlKey;
    if (this.mode === 'space') this.orbit(dx, dy, h);
    else if (rotateMode) this.rotate(dx * 0.4, dy * 0.4);
    else this.pan(dx, dy, h);
  };

  private onUp = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    clearInterval(this.holdTimer);
    if (!p) return;
    if (!this.moved && performance.now() - p.t < 450 && this.pointers.size === 0) this.cb.onTap(e.clientX, e.clientY, false);
    this.pinch0 = 0;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!this.enabled) return;
    this.zoom(Math.exp(e.deltaY * 0.0012));
  };

  private onKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    this.keys.add(e.key.toLowerCase());
  };
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());

  private orbit(dx: number, dy: number, h: number) {
    const k = (110 * (this.sp.dist - 1)) / h;
    this.sp.lon -= dx * k;
    this.sp.lat = Math.max(-85, Math.min(85, this.sp.lat + dy * k));
  }

  private pan(dx: number, dy: number, h: number) {
    const k = (this.sf.range * 1.6) / h; // radians per px
    const hd = this.sf.heading * D2R;
    const fwd = dy * k, side = -dx * k;
    const dN = fwd * Math.cos(hd) - side * Math.sin(hd);
    const dE = fwd * Math.sin(hd) + side * Math.cos(hd);
    this.sf.lat = Math.max(-88, Math.min(88, this.sf.lat + dN / D2R));
    this.sf.lon += dE / D2R / Math.max(0.05, Math.cos(this.sf.lat * D2R));
    this.sf.lon = ((((this.sf.lon + 180) % 360) + 360) % 360) - 180;
  }

  private rotate(dx: number, dy: number) {
    this.sf.heading = (this.sf.heading - dx + 360) % 360;
    this.sf.pitch = Math.max(6, Math.min(88, this.sf.pitch + dy));
  }

  zoom(f: number) {
    if (this.transition) return;
    if (this.mode === 'space') {
      this.sp.dist = Math.max(1.12, Math.min(9, 1 + (this.sp.dist - 1) * f));
      if (this.sp.dist <= 1.13 && f < 1) this.enterSurface(this.spCur.lat, this.spCur.lon, 0.12);
    } else {
      this.sf.range *= f;
      if (this.sf.range > 0.42) this.exitToSpace(1.6);
      this.sf.range = Math.max(0.0012, Math.min(0.42, this.sf.range));
    }
  }

  // ---------------------------------------------------------------- per-frame
  private livePose(): { pos: THREE.Vector3; target: THREE.Vector3; up: THREE.Vector3 } {
    if (this.mode === 'space') {
      const c = this.spCur;
      return { pos: v3(c.lat, c.lon, c.dist), target: new THREE.Vector3(0, 0, 0), up: new THREE.Vector3(0, 1, 0) };
    }
    const c = this.sfCur;
    const fr = frame(c.lat, c.lon);
    const r = this.terrain.surfaceRadius(c.lat, c.lon);
    const target = fr.up.clone().multiplyScalar(r);
    const hd = c.heading * D2R, pt = c.pitch * D2R;
    const fwd = fr.north.clone().multiplyScalar(Math.cos(hd)).add(fr.east.clone().multiplyScalar(Math.sin(hd)));
    const pos = target.clone()
      .add(fwd.multiplyScalar(-Math.cos(pt) * c.range))
      .add(fr.up.clone().multiplyScalar(Math.sin(pt) * c.range));
    // keep camera above terrain
    const ll = vecToLatLon(pos.x, pos.y, pos.z);
    const ground = this.terrain.surfaceRadius(ll.lat, ll.lon) + c.range * 0.05 + 0.0004;
    if (pos.length() < ground) pos.setLength(ground);
    return { pos, target, up: fr.up };
  }

  update(dt: number) {
    const k = 1 - Math.exp(-dt * 8);
    // keyboard
    if (this.keys.size) {
      const h = this.el.clientHeight || 800;
      const step = 600 * dt;
      if (this.mode === 'surface') {
        if (this.keys.has('w') || this.keys.has('arrowup')) this.pan(0, step, h);
        if (this.keys.has('s') || this.keys.has('arrowdown')) this.pan(0, -step, h);
        if (this.keys.has('a') || this.keys.has('arrowleft')) this.pan(step, 0, h);
        if (this.keys.has('d') || this.keys.has('arrowright')) this.pan(-step, 0, h);
        if (this.keys.has('q')) this.rotate(-90 * dt, 0);
        if (this.keys.has('e')) this.rotate(90 * dt, 0);
      } else {
        if (this.keys.has('w') || this.keys.has('arrowup')) this.orbit(0, step, h);
        if (this.keys.has('s') || this.keys.has('arrowdown')) this.orbit(0, -step, h);
        if (this.keys.has('a') || this.keys.has('arrowleft')) this.orbit(step, 0, h);
        if (this.keys.has('d') || this.keys.has('arrowright')) this.orbit(-step, 0, h);
      }
      if (this.keys.has('+') || this.keys.has('=')) this.zoom(Math.exp(-dt * 1.5));
      if (this.keys.has('-')) this.zoom(Math.exp(dt * 1.5));
    }
    if (this.autoRotate && this.mode === 'space' && this.pointers.size === 0) this.sp.lon += dt * 4;
    // damping
    if (this.mode === 'space') {
      let dl = this.sp.lon - this.spCur.lon;
      dl = ((((dl + 180) % 360) + 360) % 360) - 180;
      this.spCur.lon += dl * k;
      this.spCur.lat += (this.sp.lat - this.spCur.lat) * k;
      this.spCur.dist += (this.sp.dist - this.spCur.dist) * k;
    } else {
      let dl = this.sf.lon - this.sfCur.lon;
      dl = ((((dl + 180) % 360) + 360) % 360) - 180;
      this.sfCur.lon += dl * k;
      this.sfCur.lat += (this.sf.lat - this.sfCur.lat) * k;
      let dh = this.sf.heading - this.sfCur.heading;
      dh = ((((dh + 180) % 360) + 360) % 360) - 180;
      this.sfCur.heading += dh * k;
      this.sfCur.pitch += (this.sf.pitch - this.sfCur.pitch) * k;
      this.sfCur.range += (this.sf.range - this.sfCur.range) * k;
    }
    const pose = this.livePose();
    const cam = this.camera;
    const m = new THREE.Matrix4().lookAt(pose.pos, pose.target, pose.up);
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    if (this.transition) {
      const tr = this.transition;
      tr.t += dt / tr.dur;
      const t = Math.min(1, tr.t);
      const s = t * t * (3 - 2 * t);
      const la = tr.fromPos.length(), lb = pose.pos.length();
      const dir = tr.fromPos.clone().normalize();
      const qd = new THREE.Quaternion().setFromUnitVectors(dir, pose.pos.clone().normalize());
      const qi = new THREE.Quaternion().slerp(qd, s);
      // arc out a little so the camera does not skim through mountains
      const lift = Math.sin(Math.PI * s) * 0.25 * Math.max(0, Math.min(1, dir.angleTo(pose.pos) * 2));
      cam.position.copy(dir.applyQuaternion(qi).multiplyScalar(la + (lb - la) * s + lift));
      cam.quaternion.copy(tr.fromQuat).slerp(q, s);
      if (t >= 1) this.transition = null;
    } else {
      cam.position.copy(pose.pos);
      cam.quaternion.copy(q);
    }
    cam.up.copy(pose.up);
    const alt = Math.max(0.0004, cam.position.length() - 1);
    cam.near = Math.max(0.00005, alt * 0.08);
    cam.far = alt + 4;
    cam.updateProjectionMatrix();
  }
}
