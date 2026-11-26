// Render arka ucu: WebGL2 sprite batch (tek shader, tint çarpımı, ışık haritası FBO'su) + Canvas 2D yedek.
// Koordinatlar dünya pikseli; kamera tam sayı yakınlaştırma (piksel bozulması yok).
const VS = `#version 300 es
layout(location=0) in vec2 aPos; layout(location=1) in vec2 aUV; layout(location=2) in vec4 aCol;
uniform vec4 uView; out vec2 vUV; out vec4 vCol;
void main(){ vUV=aUV; vCol=aCol; gl_Position=vec4(aPos*uView.xy+uView.zw,0.0,1.0); }`;
const FS = `#version 300 es
precision mediump float; uniform sampler2D uTex; in vec2 vUV; in vec4 vCol; out vec4 o;
void main(){ vec4 t=texture(uTex,vUV); o=t*vCol; if(o.a<0.003) discard; }`;

const MAXQ = 16384, STRIDE = 20;

export class GLRenderer {
  constructor(canvas) {
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('webgl2 yok');
    this.gl = gl; this.canvas = canvas; this.kind = 'webgl2';
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    this.prog = p; gl.useProgram(p); this.uView = gl.getUniformLocation(p, 'uView');
    this.buf = new ArrayBuffer(MAXQ * 4 * STRIDE); this.f32 = new Float32Array(this.buf); this.u32 = new Uint32Array(this.buf);
    this.vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo); gl.bufferData(gl.ARRAY_BUFFER, this.buf.byteLength, gl.DYNAMIC_DRAW);
    const idx = new Uint16Array(MAXQ * 6); // 16384*4 > 65535 -> iki parçalı çizim
    for (let i = 0, v = 0; i < MAXQ; i++, v += 4) { const k = i * 6, vv = v & 0xffff; idx[k] = vv; idx[k + 1] = vv + 1; idx[k + 2] = vv + 2; idx[k + 3] = vv; idx[k + 4] = vv + 2; idx[k + 5] = vv + 3; }
    this.maxQ = 16383; // 4*16383 < 65536
    this.ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    this.vao = gl.createVertexArray(); gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE, 8);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.UNSIGNED_BYTE, true, STRIDE, 16);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DEPTH_TEST);
    this.n = 0; this.tex = null; this.texW = 1; this.texH = 1; this.drawCalls = 0;
    this.light = null; this.lightScale = 2;
  }
  createTexture(src, linear = false) {
    const gl = this.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    const f = linear ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { t, w: src.width, h: src.height, linear };
  }
  updateTexture(h, src) {
    const gl = this.gl; if (this.tex === h) this.flush();
    gl.bindTexture(gl.TEXTURE_2D, h.t);
    if (src.width !== h.w || src.height !== h.h) { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); h.w = src.width; h.h = src.height; }
    else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    this.tex = null;
  }
  deleteTexture(h) { if (h) { if (this.tex === h) this.flush(); this.gl.deleteTexture(h.t); } }
  resize(w, h) { this.canvas.width = w; this.canvas.height = h; this.W = w; this.H = h; this.gl.viewport(0, 0, w, h); this._lightFB(); }
  // kamera: dünya pikseli -> ekran
  setView(camX, camY, zoom) {
    this.flush();
    const W = this.W, H = this.H;
    const ox = Math.round(W / 2 - camX * zoom), oy = Math.round(H / 2 - camY * zoom);
    this.view = [2 * zoom / W, -2 * zoom / H, ox * 2 / W - 1, 1 - oy * 2 / H];
    this.gl.uniform4f(this.uView, ...this.view);
  }
  clear(r, g, b) { const gl = this.gl; gl.clearColor(r, g, b, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
  _bind(h) {
    if (this.tex === h) return;
    this.flush(); this.tex = h; this.texW = h.w; this.texH = h.h;
    this.gl.bindTexture(this.gl.TEXTURE_2D, h.t);
  }
  // src: piksel (atlas), dst: dünya px; col: 0xAABBGGRR
  quad(h, sx, sy, sw, sh, dx, dy, dw, dh, col = 0xffffffff, flip = false) {
    this._bind(h); if (this.n >= this.maxQ) this.flush();
    const iw = 1 / this.texW, ih = 1 / this.texH;
    let u0 = sx * iw, u1 = (sx + sw) * iw; const v0 = sy * ih, v1 = (sy + sh) * ih;
    if (flip) { const t = u0; u0 = u1; u1 = t; }
    const f = this.f32, u = this.u32; let o = this.n * 20;
    f[o] = dx; f[o + 1] = dy; f[o + 2] = u0; f[o + 3] = v0; u[o + 4] = col;
    f[o + 5] = dx + dw; f[o + 6] = dy; f[o + 7] = u1; f[o + 8] = v0; u[o + 9] = col;
    f[o + 10] = dx + dw; f[o + 11] = dy + dh; f[o + 12] = u1; f[o + 13] = v1; u[o + 14] = col;
    f[o + 15] = dx; f[o + 16] = dy + dh; f[o + 17] = u0; f[o + 18] = v1; u[o + 19] = col;
    this.n++;
  }
  // serbest dörtgen (gölge eğimi, çizgiler): köşeler sol-üst, sağ-üst, sağ-alt, sol-alt
  quad4(h, sx, sy, sw, sh, x0, y0, x1, y1, x2, y2, x3, y3, col, flip = false) {
    this._bind(h); if (this.n >= this.maxQ) this.flush();
    const iw = 1 / this.texW, ih = 1 / this.texH;
    let u0 = sx * iw, u1 = (sx + sw) * iw; const v0 = sy * ih, v1 = (sy + sh) * ih;
    if (flip) { const t = u0; u0 = u1; u1 = t; }
    const f = this.f32, u = this.u32; let o = this.n * 20;
    f[o] = x0; f[o + 1] = y0; f[o + 2] = u0; f[o + 3] = v0; u[o + 4] = col;
    f[o + 5] = x1; f[o + 6] = y1; f[o + 7] = u1; f[o + 8] = v0; u[o + 9] = col;
    f[o + 10] = x2; f[o + 11] = y2; f[o + 12] = u1; f[o + 13] = v1; u[o + 14] = col;
    f[o + 15] = x3; f[o + 16] = y3; f[o + 17] = u0; f[o + 18] = v1; u[o + 19] = col;
    this.n++;
  }
  flush() {
    if (!this.n) return;
    const gl = this.gl;
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.f32, 0, this.n * 20);
    gl.drawElements(gl.TRIANGLES, this.n * 6, gl.UNSIGNED_SHORT, 0);
    this.n = 0; this.drawCalls++;
  }
  // ---- ışık haritası ----
  _lightFB() {
    const gl = this.gl; const w = Math.max(1, Math.ceil(this.W / this.lightScale)), h = Math.max(1, Math.ceil(this.H / this.lightScale));
    if (this.light) { gl.deleteFramebuffer(this.light.fb); gl.deleteTexture(this.light.tex.t); }
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.light = { fb, tex: { t, w, h }, w, h }; this.tex = null;
  }
  setLightScale(s) { if (s !== this.lightScale) { this.lightScale = s; if (this.W) this._lightFB(); } }
  beginLights(r, g, b) {
    this.flush(); const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.light.fb); gl.viewport(0, 0, this.light.w, this.light.h);
    gl.clearColor(r, g, b, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // eklemeli
    // ekran koordinatlarını FBO'ya ölçekle (aynı görünüm)
    const v = this.view; gl.uniform4f(this.uView, v[0], -v[1], v[2], -v[3]);
  }
  endLights() {
    this.flush(); const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.W, this.H);
    gl.uniform4f(this.uView, 2 / this.W, -2 / this.H, -1, 1);
    gl.blendFunc(gl.DST_COLOR, gl.ZERO); // çarpım
    this.quad(this.light.tex, 0, 0, this.light.w, this.light.h, 0, 0, this.W, this.H, 0xffffffff);
    this.flush();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform4f(this.uView, ...this.view);
  }
  additive(on) { this.flush(); const gl = this.gl; if (on) gl.blendFunc(gl.SRC_ALPHA, gl.ONE); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); }
  screenSpace() { this.flush(); this.gl.uniform4f(this.uView, 2 / this.W, -2 / this.H, -1, 1); }
  worldSpace() { this.flush(); this.gl.uniform4f(this.uView, ...this.view); }
  end() { this.flush(); }
}

// ---------------- Canvas 2D yedek ----------------
export class C2DRenderer {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false }); this.kind = 'canvas2d';
    this.ctx.imageSmoothingEnabled = false; this.drawCalls = 0; this.lightScale = 4;
    this.lc = document.createElement('canvas'); this.lx = this.lc.getContext('2d');
  }
  createTexture(src) { return { img: src, w: src.width, h: src.height }; }
  updateTexture(h, src) { h.img = src; h.w = src.width; h.h = src.height; }
  deleteTexture() {}
  resize(w, h) { this.canvas.width = w; this.canvas.height = h; this.W = w; this.H = h; this.ctx.imageSmoothingEnabled = false; this.lc.width = Math.ceil(w / this.lightScale); this.lc.height = Math.ceil(h / this.lightScale); }
  setLightScale(s) { this.lightScale = Math.max(2, s); if (this.W) this.resize(this.W, this.H); }
  setView(x, y, z) { this.z = z; this.ox = Math.round(this.W / 2 - x * z); this.oy = Math.round(this.H / 2 - y * z); this.ctx.setTransform(z, 0, 0, z, this.ox, this.oy); this.cur = this.ctx; }
  clear(r, g, b) { const c = this.ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = `rgb(${r * 255},${g * 255},${b * 255})`; c.fillRect(0, 0, this.W, this.H); c.restore(); }
  quad(h, sx, sy, sw, sh, dx, dy, dw, dh, col = 0xffffffff, flip = false) {
    const c = this.cur || this.ctx; const a = (col >>> 24) / 255; if (a < 0.01) return;
    const r = col & 255, g = (col >> 8) & 255, b = (col >> 16) & 255;
    if (r < 8 && g < 8 && b < 8 && !this.inLight) { // gölge: yarı saydam koyu dikdörtgen yerine atla (performans)
      return;
    }
    c.globalAlpha = a;
    if (h.solid || (sw <= 1 && sh <= 1)) { c.fillStyle = `rgb(${r},${g},${b})`; c.fillRect(dx, dy, dw, dh); }
    else if (flip) { c.save(); c.translate(dx + dw, dy); c.scale(-1, 1); c.drawImage(h.img, sx, sy, sw, sh, 0, 0, dw, dh); c.restore(); }
    else c.drawImage(h.img, sx, sy, sw, sh, dx, dy, dw, dh);
    c.globalAlpha = 1; this.drawCalls++;
  }
  quad4(h, sx, sy, sw, sh, x0, y0, x1, y1, x2, y2, x3, y3, col, flip) {
    if (this.inLight) return;
    const c = this.cur || this.ctx; const a = (col >>> 24) / 255; const r = col & 255, g = (col >> 8) & 255, b = (col >> 16) & 255;
    // çizgi/dörtgen: çokgen doldur
    c.globalAlpha = a; c.fillStyle = `rgb(${r},${g},${b})`;
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); c.fill(); c.globalAlpha = 1;
  }
  flush() {}
  beginLights(r, g, b) {
    const l = this.lx; l.setTransform(1, 0, 0, 1, 0, 0); l.globalCompositeOperation = 'source-over';
    l.fillStyle = `rgb(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0})`; l.fillRect(0, 0, this.lc.width, this.lc.height);
    l.globalCompositeOperation = 'lighter'; const s = 1 / this.lightScale;
    l.setTransform(this.z * s, 0, 0, this.z * s, this.ox * s, this.oy * s); this.cur = l; this.inLight = true;
  }
  endLights() {
    this.inLight = false; this.cur = this.ctx; const c = this.ctx;
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'multiply'; c.imageSmoothingEnabled = true;
    c.drawImage(this.lc, 0, 0, this.W, this.H); c.restore(); c.imageSmoothingEnabled = false;
  }
  additive(on) { (this.cur || this.ctx).globalCompositeOperation = on ? 'lighter' : 'source-over'; }
  screenSpace() { this.ctx.setTransform(1, 0, 0, 1, 0, 0); }
  worldSpace() { this.ctx.setTransform(this.z, 0, 0, this.z, this.ox, this.oy); }
  end() { this.ctx.globalCompositeOperation = 'source-over'; }
}

export function createRenderer(canvas, prefer2D = false) {
  if (!prefer2D) { try { return new GLRenderer(canvas); } catch (e) { console.warn('WebGL2 yok, Canvas2D yedeğe geçiliyor', e); } }
  return new C2DRenderer(canvas);
}

// renk yardımcıları
export const rgba = (r, g, b, a = 255) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
export const withAlpha = (c, a) => ((c & 0x00ffffff) | (Math.max(0, Math.min(255, a | 0)) << 24)) >>> 0;
