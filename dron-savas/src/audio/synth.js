// WebAudio sentezi: patlama, fırlatma, uçaksavar, alarm, tık, dron vızıltısı, rüzgâr. Dosya yok, tamamen kodla.
export class Synth {
  constructor() { this.ctx = null; this.vol = 0.6; this.on = true; this.last = {}; this.noiseBuf = null; }
  ensure() {
    if (this.ctx || !this.on) return !!this.ctx;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = this.vol;
    this.comp = this.ctx.createDynamicsCompressor(); this.master.connect(this.comp); this.comp.connect(this.ctx.destination);
    const n = this.ctx.sampleRate * 2; this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    this.startAmbient();
    return true;
  }
  resume() { if (this.ensure() && this.ctx.state === 'suspended') this.ctx.resume(); }
  setVolume(v) { this.vol = v; if (this.master) this.master.gain.value = v; }
  setOn(on) { this.on = on; if (this.master) this.master.gain.value = on ? this.vol : 0; }
  rate(key, ms) { const t = performance.now(); if (this.last[key] && t - this.last[key] < ms) return false; this.last[key] = t; return true; }
  noise(dur, f0, f1, gain, q = 0.7, type = 'lowpass') {
    const c = this.ctx, t = c.currentTime; const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  tone(type, f0, f1, dur, gain) {
    const c = this.ctx, t = c.currentTime; const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.05);
  }
  boom(size = 0, air = false) {
    if (!this.ctx || !this.on || !this.rate('boom' + size, 60)) return;
    const d = 0.4 + size * 0.5; this.noise(d, air ? 2400 : 1600, 60, 0.5 + size * 0.25);
    this.tone('sine', air ? 160 : 90 - size * 15, 30, d * 0.8, 0.35 + size * 0.15);
  }
  launch(big, sam) { if (!this.ctx || !this.on || !this.rate('launch', 90)) return; this.noise(big ? 1.4 : 0.6, 300, sam ? 4000 : 2000, 0.28, 1.2, 'bandpass'); }
  gun() { if (!this.ctx || !this.on || !this.rate('gun', 70)) return; for (let k = 0; k < 3; k++) setTimeout(() => this.ctx && this.noise(0.05, 3000, 800, 0.12, 1, 'bandpass'), k * 45); }
  alarm() { if (!this.ctx || !this.on || !this.rate('alarm', 2500)) return; const c = this.ctx; for (let k = 0; k < 4; k++) setTimeout(() => c && this.tone('square', k % 2 ? 660 : 880, k % 2 ? 660 : 880, 0.22, 0.08), k * 250); }
  click() { if (!this.ctx || !this.on) return; this.tone('square', 1400, 900, 0.04, 0.05); }
  notify(lvl) { if (!this.ctx || !this.on || !this.rate('n', 400)) return; if (lvl >= 3) this.alarm(); else this.tone('triangle', lvl >= 2 ? 520 : 760, lvl >= 2 ? 390 : 980, 0.15, 0.08); }
  startAmbient() {
    const c = this.ctx; const s = c.createBufferSource(); s.buffer = this.noiseBuf; s.loop = true;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 400; const g = c.createGain(); g.gain.value = 0.0;
    s.connect(f); f.connect(g); g.connect(this.master); s.start(); this.wind = { g, f };
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 180; const og = c.createGain(); og.gain.value = 0; const of = c.createBiquadFilter(); of.type = 'bandpass'; of.frequency.value = 900; of.Q.value = 3;
    o.connect(of); of.connect(og); og.connect(this.master); o.start(); this.buzz = { o, g: og };
  }
  // ortam: hava + görünen dron sayısı
  ambient(weather, drones) {
    if (!this.ctx || !this.wind) return; const t = this.ctx.currentTime;
    const w = weather === 'storm' ? 0.16 : weather === 'rain' ? 0.09 : weather === 'snow' ? 0.05 : 0.025;
    this.wind.g.gain.setTargetAtTime(this.on ? w : 0, t, 0.8); this.wind.f.frequency.setTargetAtTime(weather === 'storm' ? 900 : 450, t, 1);
    this.buzz.g.gain.setTargetAtTime(this.on ? Math.min(0.05, drones * 0.006) : 0, t, 0.3); this.buzz.o.frequency.setTargetAtTime(170 + (drones % 5) * 9 + Math.random() * 6, t, 0.2);
  }
}
