// i18n: tüm metinler tablodan; {0} {1} parametreleri; parametre bir anahtar ise o da çevrilir.
import tr from './tr.js';
const LANGS = { tr };
let cur = tr;
export function setLang(code) { cur = LANGS[code] || tr; }
export function t(key, args) {
  let s = cur[key]; if (s === undefined) return key;
  if (args && args.length) s = s.replace(/\{(\d)\}/g, (_, n) => { const a = args[+n]; return a === undefined ? '' : (typeof a === 'string' && cur[a] !== undefined ? cur[a] : String(a)); });
  return s;
}
export function has(key) { return cur[key] !== undefined; }
