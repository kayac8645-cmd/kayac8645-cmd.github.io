import * as THREE from 'three';
import { latLonToVec, EARTH_RADIUS_KM } from '../core/grid';
import type { DisasterEvent, DisasterType } from '../core/types';
import type { TerrainSampler } from './terrainSampler';

interface Fx {
  obj: THREE.Object3D;
  update: (t: number, dt: number, ev: DisasterEvent) => void;
  dispose: () => void;
}

const AREA_COLORS: Partial<Record<DisasterType, number>> = {
  flood: 0x3a8ee6, drought: 0xd9a04a, coldwave: 0x8fd6ff, heatwave: 0xff5a3c, epidemic: 0xb36bff, wildfire: 0xff7a2a, superstorm: 0x9fb7d0,
};

function placeOnSurface(obj: THREE.Object3D, lat: number, lon: number, r: number) {
  const v = latLonToVec(lat, lon);
  const n = new THREE.Vector3(v[0], v[1], v[2]);
  obj.position.copy(n).multiplyScalar(r);
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
}

export class EffectsManager {
  group = new THREE.Group();
  private fx = new Map<number, Fx>();
  private time = 0;

  constructor(private terrain: TerrainSampler) {}

  sync(events: DisasterEvent[]) {
    const ids = new Set(events.map((e) => e.id));
    for (const [id, f] of this.fx) {
      if (!ids.has(id)) {
        this.group.remove(f.obj);
        f.dispose();
        this.fx.delete(id);
      }
    }
    for (const ev of events) {
      if (!this.fx.has(ev.id)) {
        const f = this.create(ev);
        if (f) {
          this.fx.set(ev.id, f);
          this.group.add(f.obj);
        }
      }
    }
    this.events = events;
  }

  private events: DisasterEvent[] = [];

  update(dt: number) {
    this.time += dt;
    for (const ev of this.events) this.fx.get(ev.id)?.update(this.time, dt, ev);
  }

  private create(ev: DisasterEvent): Fx | null {
    const R = ev.radiusKm / EARTH_RADIUS_KM;
    const surf = () => this.terrain.surfaceRadius(ev.lat, ev.lon) + 0.002;
    // Only geometries are disposed. Materials are left to GC on purpose: disposing them releases the
    // shared WebGL program and forces a shader recompile for the next effect (very costly at high speeds).
    const disposables: { dispose: () => void }[] = [];
    const mk = <T extends object>(x: T) => {
      if (x instanceof THREE.BufferGeometry) disposables.push(x);
      return x;
    };
    const dispose = () => disposables.forEach((d) => d.dispose());
    const ringMat = (color: number, opacity = 0.8) =>
      mk(new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    switch (ev.type) {
      case 'volcano': {
        const g = new THREE.Group();
        const glow = new THREE.Mesh(mk(new THREE.SphereGeometry(0.006, 12, 8)), mk(new THREE.MeshBasicMaterial({ color: 0xff4a10 })));
        g.add(glow);
        const N = 160;
        const pg = mk(new THREE.BufferGeometry());
        const pp = new Float32Array(N * 3);
        const seeds = new Float32Array(N);
        for (let i = 0; i < N; i++) seeds[i] = Math.random();
        pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
        const plume = new THREE.Points(pg, mk(new THREE.PointsMaterial({ color: 0x8a817a, size: 6, sizeAttenuation: false, transparent: true, opacity: 0.75, depthWrite: false })));
        g.add(plume);
        return {
          obj: g,
          dispose,
          update: (t, _dt, e) => {
            placeOnSurface(g, e.lat, e.lon, surf());
            glow.scale.setScalar(1 + 0.3 * Math.sin(t * 9));
            for (let i = 0; i < N; i++) {
              const ph = (seeds[i] + t * 0.25) % 1;
              const h = ph * 0.06 * (0.5 + e.intensity);
              const sp = ph * 0.02;
              pp[i * 3] = Math.cos(seeds[i] * 40) * sp;
              pp[i * 3 + 1] = Math.sin(seeds[i] * 40) * sp;
              pp[i * 3 + 2] = h;
            }
            pg.attributes.position.needsUpdate = true;
          },
        };
      }
      case 'earthquake':
      case 'tsunami':
      case 'epidemic': {
        const color = ev.type === 'earthquake' ? 0xffa040 : ev.type === 'tsunami' ? 0x6fe8ff : 0xb36bff;
        const g = new THREE.Group();
        const rings: THREE.Mesh[] = [];
        for (let k = 0; k < 3; k++) {
          const m = new THREE.Mesh(mk(new THREE.RingGeometry(0.96, 1, 64)), ringMat(color));
          rings.push(m);
          g.add(m);
        }
        return {
          obj: g,
          dispose,
          update: (t, _dt, e) => {
            placeOnSurface(g, e.lat, e.lon, ev.type === 'tsunami' ? 1.0015 : surf());
            const prog = Math.min(1, e.elapsedDays / e.durationDays);
            rings.forEach((m, k) => {
              const ph = (t * (ev.type === 'tsunami' ? 0.35 : 0.8) + k / 3) % 1;
              const rr = ev.type === 'tsunami' ? R * Math.max(0.1, prog) * (0.7 + 0.3 * ph) : R * ph;
              m.scale.setScalar(Math.max(1e-4, rr));
              (m.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - ph);
            });
          },
        };
      }
      case 'hurricane':
      case 'tornado': {
        const g = new THREE.Group();
        if (ev.type === 'tornado') {
          const funnel = new THREE.Mesh(mk(new THREE.ConeGeometry(0.004, 0.03, 16, 1, true)), mk(new THREE.MeshBasicMaterial({ color: 0x9aa4ae, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false })));
          funnel.rotation.x = -Math.PI / 2;
          funnel.position.z = 0.015;
          g.add(funnel);
          return {
            obj: g, dispose,
            update: (t, _dt, e) => {
              placeOnSurface(g, e.lat, e.lon, surf());
              funnel.rotation.y = t * 8;
              funnel.scale.set(1 + 0.15 * Math.sin(t * 13), 1, 1 + 0.15 * Math.cos(t * 11));
            },
          };
        }
        const ring = new THREE.Mesh(mk(new THREE.RingGeometry(0.9, 1, 64, 1, 0, Math.PI * 1.6)), ringMat(0xcfe6ff, 0.45));
        g.add(ring);
        return {
          obj: g, dispose,
          update: (t, _dt, e) => {
            placeOnSurface(g, e.lat, e.lon, 1.035);
            ring.scale.setScalar(R * (0.8 + 0.4 * e.intensity));
            ring.rotation.z = (e.lat >= 0 ? 1 : -1) * t * 2;
          },
        };
      }
      case 'asteroid': {
        const g = new THREE.Group();
        const rock = new THREE.Mesh(mk(new THREE.IcosahedronGeometry(0.012, 1)), mk(new THREE.MeshStandardMaterial({ color: 0x6b5a4a, emissive: 0xff5a10, emissiveIntensity: 0.6 })));
        const flash = new THREE.Mesh(mk(new THREE.SphereGeometry(1, 24, 16)), mk(new THREE.MeshBasicMaterial({ color: 0xffd38a, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })));
        const shock = new THREE.Mesh(mk(new THREE.RingGeometry(0.95, 1, 96)), ringMat(0xffb070));
        g.add(rock, flash, shock);
        const v = latLonToVec(ev.lat, ev.lon);
        const n = new THREE.Vector3(v[0], v[1], v[2]);
        const side = new THREE.Vector3(0, 1, 0).cross(n).normalize();
        const start = n.clone().multiplyScalar(3).addScaledVector(side, 1.5);
        let age = 0;
        return {
          obj: g, dispose,
          update: (_t, dt) => {
            age += dt;
            const fall = Math.min(1, age / 1.6);
            rock.visible = fall < 1;
            rock.position.lerpVectors(start, n.clone().multiplyScalar(1.01), fall * fall);
            rock.rotation.x += dt * 4;
            const after = age - 1.6;
            flash.visible = after > 0 && after < 2.5;
            if (flash.visible) {
              flash.position.copy(n).multiplyScalar(1.0);
              flash.scale.setScalar(R * 0.5 * Math.min(1, after * 2));
              (flash.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - after * 0.36);
            }
            shock.visible = after > 0 && after < 6;
            if (shock.visible) {
              placeOnSurface(shock, ev.lat, ev.lon, 1.006);
              shock.scale.setScalar(R * Math.min(2.5, after * 0.6));
              (shock.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - after * 0.15);
            }
          },
        };
      }
      case 'meteorShower': {
        const N = 24;
        const geo = mk(new THREE.BufferGeometry());
        const arr = new Float32Array(N * 6);
        geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        const lines = new THREE.LineSegments(geo, mk(new THREE.LineBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })));
        const seeds = Array.from({ length: N }, () => [Math.random(), Math.random(), Math.random()]);
        return {
          obj: lines, dispose,
          update: (t, _dt, e) => {
            const v = latLonToVec(e.lat, e.lon);
            const n = new THREE.Vector3(v[0], v[1], v[2]);
            const east = new THREE.Vector3(0, 1, 0).cross(n).normalize();
            const north = n.clone().cross(east).normalize();
            for (let i = 0; i < N; i++) {
              const [a, b, c] = seeds[i];
              const ph = (c + t * 0.6) % 1;
              const off = east.clone().multiplyScalar((a - 0.5) * R * 1.6).add(north.clone().multiplyScalar((b - 0.5) * R * 1.6));
              const head = n.clone().multiplyScalar(1.01 + (1 - ph) * 0.25).add(off).addScaledVector(east, (1 - ph) * 0.12);
              const tail = head.clone().addScaledVector(n, 0.03).addScaledVector(east, 0.02);
              arr.set([head.x, head.y, head.z, tail.x, tail.y, tail.z], i * 6);
            }
            geo.attributes.position.needsUpdate = true;
          },
        };
      }
      case 'iceAge':
      case 'climateChange':
        return null;
      default: {
        const color = AREA_COLORS[ev.type] ?? 0xffffff;
        const disc = new THREE.Mesh(mk(new THREE.CircleGeometry(1, 64)), mk(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })));
        const edge = new THREE.Mesh(mk(new THREE.RingGeometry(0.97, 1, 64)), ringMat(color, 0.7));
        const g = new THREE.Group();
        g.add(disc, edge);
        return {
          obj: g, dispose,
          update: (t, _dt, e) => {
            placeOnSurface(g, e.lat, e.lon, Math.max(1.004, surf()));
            g.scale.setScalar(R);
            (disc.material as THREE.MeshBasicMaterial).opacity = 0.16 + 0.08 * Math.sin(t * 3);
          },
        };
      }
    }
  }
}
