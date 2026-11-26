// Dokunmatik giriş: tek parmak kaydırma, iki parmak yakınlaştırma (tam sayı kademeler), dokunma = seç,
// basılı tut + sürükle = alan seçimi, rota modu: parmakla rota çiz. Fare/teker masaüstü testi için.
export class Input {
  constructor(canvas, h) {
    this.c = canvas; this.h = h; // h: {pan(dx,dy), zoomAt(sx,sy,delta), tap(sx,sy), area(x0,y0,x1,y1,done), route(points, done), mode()}
    this.p = new Map(); this.pinch = null; this.dpr = 1;
    const o = { passive: false };
    canvas.addEventListener('pointerdown', (e) => this.down(e), o);
    canvas.addEventListener('pointermove', (e) => this.move(e), o);
    canvas.addEventListener('pointerup', (e) => this.up(e), o);
    canvas.addEventListener('pointercancel', (e) => this.up(e, true), o);
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); this.h.zoomAt(e.offsetX * this.dpr, e.offsetY * this.dpr, e.deltaY < 0 ? 1 : -1); }, o);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  pos(e) { const r = this.c.getBoundingClientRect(); return [(e.clientX - r.left) * this.dpr, (e.clientY - r.top) * this.dpr]; }
  down(e) {
    e.preventDefault(); this.c.setPointerCapture?.(e.pointerId);
    const [x, y] = this.pos(e);
    this.p.set(e.pointerId, { x, y, sx: x, sy: y, t: performance.now(), moved: false });
    if (this.p.size === 2) {
      const [a, b] = [...this.p.values()]; this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
      clearTimeout(this.lp); this.areaOn = false; this.routeOn = false;
      return;
    }
    if (this.p.size === 1) {
      this.routeOn = this.h.mode() === 'route';
      if (this.routeOn) { this.route = [x, y]; this.h.route(this.route, false); }
      clearTimeout(this.lp);
      this.lp = setTimeout(() => { const q = this.p.get(e.pointerId); if (q && !q.moved && this.p.size === 1 && !this.routeOn) { this.areaOn = true; this.h.area(q.sx, q.sy, q.x, q.y, false); navigator.vibrate?.(15); } }, 420);
    }
  }
  move(e) {
    const q = this.p.get(e.pointerId); if (!q) return; e.preventDefault();
    const [x, y] = this.pos(e); const dx = x - q.x, dy = y - q.y; q.x = x; q.y = y;
    if (!q.moved && Math.hypot(x - q.sx, y - q.sy) > 10 * this.dpr) { q.moved = true; if (!this.areaOn) clearTimeout(this.lp); }
    if (this.p.size === 2 && this.pinch) {
      const [a, b] = [...this.p.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      this.h.pan(cx - this.pinch.cx, cy - this.pinch.cy); this.pinch.cx = cx; this.pinch.cy = cy;
      const ratio = d / this.pinch.d;
      if (ratio > 1.35) { this.h.zoomAt(cx, cy, 1); this.pinch.d = d; } else if (ratio < 0.72) { this.h.zoomAt(cx, cy, -1); this.pinch.d = d; }
      return;
    }
    if (this.areaOn) { this.h.area(q.sx, q.sy, x, y, false); return; }
    if (this.routeOn) { const L = this.route; const lx = L[L.length - 2], ly = L[L.length - 1]; if (Math.hypot(x - lx, y - ly) > 28 * this.dpr) { L.push(x, y); this.h.route(L, false); } return; }
    if (q.moved) this.h.pan(dx, dy);
  }
  up(e, cancel) {
    const q = this.p.get(e.pointerId); if (!q) return; this.p.delete(e.pointerId); clearTimeout(this.lp);
    if (this.pinch) { if (this.p.size < 2) this.pinch = null; return; }
    if (cancel) { this.areaOn = this.routeOn = false; return; }
    if (this.areaOn) { this.areaOn = false; this.h.area(q.sx, q.sy, q.x, q.y, true); return; }
    if (this.routeOn) { this.routeOn = false; if (q.moved) { this.route.push(q.x, q.y); this.h.route(this.route, true); } else this.h.route([q.x, q.y], true); return; }
    if (!q.moved && performance.now() - q.t < 600) this.h.tap(q.x, q.y);
  }
}
