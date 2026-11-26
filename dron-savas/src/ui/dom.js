// Küçük DOM yardımcıları
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (k === 'html') el.innerHTML = v; else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(3)) if (c !== null && c !== undefined && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
export const $ = (s, r = document) => r.querySelector(s);
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
export function fmt(n) { n = Math.floor(n); if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (Math.abs(n) >= 1e4) return (n / 1e3).toFixed(0) + 'k'; if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'k'; return String(n); }
export function btn(label, onclick, cls = '', extra = {}) { return h('button', { class: 'btn ' + cls, onclick: (e) => { e.stopPropagation(); onclick(e); }, ...extra }, label); }
// bayrak çizimi (prosedürel spec)
import { PAL } from '../data/palette.js';
export function flagCanvas(flag, w = 30, hgt = 20) {
  const c = document.createElement('canvas'); c.width = w; c.height = hgt; c.className = 'flag'; const x = c.getContext('2d');
  const [a, b, d] = flag.colors.map((k) => PAL[k] || '#888');
  x.fillStyle = a; x.fillRect(0, 0, w, hgt);
  switch (flag.layout) {
    case 'hstripe3': x.fillStyle = b; x.fillRect(0, hgt / 3, w, hgt / 3); x.fillStyle = d; x.fillRect(0, hgt * 2 / 3, w, hgt / 3); break;
    case 'vstripe3': x.fillStyle = b; x.fillRect(w / 3, 0, w / 3, hgt); x.fillStyle = d; x.fillRect(w * 2 / 3, 0, w / 3, hgt); break;
    case 'hstripe2': x.fillStyle = b; x.fillRect(0, hgt / 2, w, hgt / 2); break;
    case 'cross': x.fillStyle = b; x.fillRect(w * 0.3, 0, w * 0.14, hgt); x.fillRect(0, hgt * 0.42, w, hgt * 0.16); break;
    case 'canton': x.fillStyle = b; x.fillRect(0, 0, w * 0.45, hgt * 0.5); x.fillStyle = d; x.fillRect(0, hgt * 0.75, w, hgt * 0.25); break;
    case 'diag': x.fillStyle = b; x.beginPath(); x.moveTo(0, hgt); x.lineTo(w, 0); x.lineTo(w, hgt); x.fill(); break;
    case 'border': x.fillStyle = b; x.fillRect(3, 3, w - 6, hgt - 6); break;
    case 'circle': x.fillStyle = b; x.beginPath(); x.arc(w / 2, hgt / 2, hgt * 0.3, 0, 6.3); x.fill(); break;
  }
  x.fillStyle = d; const e = flag.emblem;
  if (e === 1) { x.fillRect(w / 2 - 2, hgt / 2 - 2, 4, 4); } else if (e === 2) { x.beginPath(); x.moveTo(w / 2, hgt / 2 - 4); x.lineTo(w / 2 + 4, hgt / 2 + 3); x.lineTo(w / 2 - 4, hgt / 2 + 3); x.fill(); }
  x.strokeStyle = '#0c0e14'; x.lineWidth = 2; x.strokeRect(0, 0, w, hgt);
  return c;
}
