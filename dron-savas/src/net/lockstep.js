// Komut otobüsü: oyuncu komutları buradan geçer.
// LocalBus: tek oyunculu (doğrudan sim kuyruğu). LockstepBus: deterministik kilit adım (girdi gecikmesi + checksum).
export class LocalBus {
  constructor(sim) { this.sim = sim; this.desync = false; }
  submit(cmd) { this.sim.issue(cmd); }
  canStep() { return true; }
  afterStep() {}
}

// Her eş, T+DELAY tick'i için komutlarını (boş olsa da) yollar. Sim, tüm eşlerin T paketi gelince T'yi oynar.
export class LockstepBus {
  constructor(sim, transport, me, peers, delay = 4) {
    this.sim = sim; this.t = transport; this.me = me; this.peers = peers; this.delay = delay;
    this.local = []; this.inbox = new Map(); // tick -> Map(peer -> cmds)
    this.hashes = new Map(); this.desync = false; this.sentUpTo = sim.tick + delay - 1;
    this.t.onmessage((m) => this.receive(m));
    for (let k = sim.tick; k < sim.tick + delay; k++) this.put(k, me, []); // ilk boşluk
    for (let k = sim.tick; k < sim.tick + delay; k++) for (const p of peers) this.put(k, p, []);
  }
  put(tick, peer, cmds) { let m = this.inbox.get(tick); if (!m) this.inbox.set(tick, (m = new Map())); m.set(peer, cmds); }
  submit(cmd) { this.local.push(cmd); }
  receive(m) {
    if (m.type === 'cmds') this.put(m.tick, m.from, m.cmds);
    else if (m.type === 'hash') { const mine = this.hashes.get(m.tick); if (mine !== undefined && mine !== m.hash) this.desync = true; else this.hashes.set('p' + m.tick, m.hash); }
  }
  // bu karede gönderilecek paket
  flush() {
    const tick = this.sim.tick + this.delay;
    if (tick <= this.sentUpTo) return;
    const cmds = this.local.map((c) => ({ ...c, tick })); this.local = [];
    this.put(tick, this.me, cmds); this.sentUpTo = tick;
    this.t.send({ type: 'cmds', from: this.me, tick, cmds });
  }
  canStep() {
    this.flush(); this.t.pump && this.t.pump();
    const m = this.inbox.get(this.sim.tick); if (!m) return false;
    if (!m.has(this.me)) return false;
    for (const p of this.peers) if (!m.has(p)) return false;
    // komutları deterministik sırada kuyruğa koy
    const all = [];
    for (const [peer, cmds] of [...m.entries()].sort((a, b) => a[0] - b[0])) for (const c of cmds) all.push({ ...c, tick: this.sim.tick });
    for (const c of all) this.sim.cmds.push(c);
    this.inbox.delete(this.sim.tick);
    return true;
  }
  afterStep() {
    const t = this.sim.tick;
    if (t % 50 === 0) {
      const h = this.sim.checksum(); this.hashes.set(t, h);
      const ph = this.hashes.get('p' + t); if (ph !== undefined && ph !== h) this.desync = true;
      this.t.send({ type: 'hash', from: this.me, tick: t, hash: h });
    }
  }
}
