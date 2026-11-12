import * as THREE from 'three';

export function atmosphereMaterial(color: THREE.Color, intensity: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uIntensity: { value: intensity },
      uSunDir: { value: new THREE.Vector3(1, 0, 0) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vWorld;
      void main() {
        vNormal = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform vec3 uSunDir;
      varying vec3 vNormal;
      varying vec3 vWorld;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float rim = 1.0 - abs(dot(viewDir, vNormal));
        float glow = pow(rim, 3.0) * uIntensity;
        float day = clamp(dot(normalize(vWorld), uSunDir) * 0.8 + 0.45, 0.08, 1.0);
        gl_FragColor = vec4(uColor * glow * day, glow * day);
      }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}

export function makeStars(count = 4000) {
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  let seed = 12345;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    pos.set([r * Math.cos(th) * 50, u * 50, r * Math.sin(th) * 50], i * 3);
    const b = 0.5 + rnd() * 0.5;
    const tint = rnd();
    col.set([b * (0.85 + 0.15 * tint), b * 0.9, b * (1.05 - 0.2 * tint)], i * 3);
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
  return new THREE.Points(g, m);
}

/** Simple low-poly tree (trunk + cone), merged into one geometry with vertex colors. */
export function treeGeometry() {
  const cone = new THREE.ConeGeometry(0.35, 1.0, 6, 1);
  cone.translate(0, 0.75, 0);
  const trunk = new THREE.CylinderGeometry(0.07, 0.09, 0.4, 5, 1);
  trunk.translate(0, 0.2, 0);
  const merged = new THREE.BufferGeometry();
  const parts = [cone.toNonIndexed(), trunk.toNonIndexed()];
  const cols: number[] = [];
  const posArr: number[] = [];
  const norArr: number[] = [];
  parts.forEach((p, k) => {
    p.computeVertexNormals();
    const pa = p.getAttribute('position').array as ArrayLike<number>;
    const na = p.getAttribute('normal').array as ArrayLike<number>;
    for (let i = 0; i < pa.length; i++) {
      posArr.push(pa[i]);
      norArr.push(na[i]);
    }
    const c = k === 0 ? [1, 1, 1] : [0.45, 0.32, 0.22];
    for (let i = 0; i < pa.length / 3; i++) cols.push(...c);
  });
  merged.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
  merged.setAttribute('normal', new THREE.Float32BufferAttribute(norArr, 3));
  merged.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  return merged;
}
