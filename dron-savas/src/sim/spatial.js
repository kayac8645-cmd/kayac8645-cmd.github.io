// Uzamsal hash ızgarası: her tick yeniden kurulur (bağlı liste, TypedArray, GC yok)
export class SpatialGrid {
  constructor(W, H, cap, cell = 8) {
    this.cell = cell; this.cw = Math.ceil(W / cell); this.ch = Math.ceil(H / cell);
    this.head = new Int32Array(this.cw * this.ch); this.next = new Int32Array(cap);
  }
  rebuild(e) {
    const head = this.head, next = this.next, cs = this.cell, cw = this.cw, ch = this.ch;
    head.fill(-1);
    for (let i = 0, n = e.hi; i < n; i++) {
      if (!e.kind[i] || (e.flags[i] & 512)) continue; // F.DEAD
      let cx = (e.x[i] / cs) | 0, cy = (e.y[i] / cs) | 0;
      if (cx < 0) cx = 0; else if (cx >= cw) cx = cw - 1;
      if (cy < 0) cy = 0; else if (cy >= ch) cy = ch - 1;
      const c = cy * cw + cx; next[i] = head[c]; head[c] = i;
    }
  }
  // r yarıçapındaki varlıklar için fn(id, d2); fn true dönerse durur
  query(x, y, r, fn) {
    const cs = this.cell, cw = this.cw, ch = this.ch;
    const x0 = Math.max(0, ((x - r) / cs) | 0), x1 = Math.min(cw - 1, ((x + r) / cs) | 0);
    const y0 = Math.max(0, ((y - r) / cs) | 0), y1 = Math.min(ch - 1, ((y + r) / cs) | 0);
    const r2 = r * r; const ex = this.ex, ey = this.ey;
    for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
      for (let i = this.head[cy * cw + cx]; i !== -1; i = this.next[i]) {
        const dx = ex[i] - x, dy = ey[i] - y, d2 = dx * dx + dy * dy;
        if (d2 <= r2 && fn(i, d2)) return;
      }
    }
  }
  bind(e) { this.ex = e.x; this.ey = e.y; }
}
