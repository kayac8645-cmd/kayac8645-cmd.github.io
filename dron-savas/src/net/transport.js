// Ağ taşıma katmanı: komut kuyruğunu ağa taşır. Hepsi aynı arayüz: send(obj), onmessage(fn), close().
// LocalPair: aynı süreç içi (test/headless), BroadcastChannel: aynı cihazda sekmeler arası, WebSocket: sunucu aracılı.
export class LocalPair {
  static create() {
    const a = new LocalPair(), b = new LocalPair(); a.peer = b; b.peer = a; return [a, b];
  }
  constructor() { this.handlers = []; this.queue = []; this.latency = 0; }
  send(msg) { const s = JSON.stringify(msg); this.peer.queue.push(s); }
  onmessage(fn) { this.handlers.push(fn); }
  pump() { const q = this.queue; this.queue = []; for (const s of q) for (const h of this.handlers) h(JSON.parse(s)); }
  close() { this.handlers = []; }
}
export class ChannelTransport {
  constructor(name, id) { this.id = id; this.bc = new BroadcastChannel(name); this.handlers = []; this.bc.onmessage = (ev) => { if (ev.data.from !== this.id) for (const h of this.handlers) h(ev.data.msg); }; }
  send(msg) { this.bc.postMessage({ from: this.id, msg }); }
  onmessage(fn) { this.handlers.push(fn); }
  pump() {}
  close() { this.bc.close(); }
}
export class SocketTransport {
  constructor(url) { this.handlers = []; this.out = []; this.ws = new WebSocket(url); this.ws.onopen = () => { for (const m of this.out) this.ws.send(m); this.out = []; }; this.ws.onmessage = (ev) => { const m = JSON.parse(ev.data); for (const h of this.handlers) h(m); }; }
  send(msg) { const s = JSON.stringify(msg); if (this.ws.readyState === 1) this.ws.send(s); else this.out.push(s); }
  onmessage(fn) { this.handlers.push(fn); }
  pump() {}
  close() { this.ws.close(); }
}
