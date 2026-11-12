// Oyunun motor betiğini (UI hariç) Node'da yükler. Kullanım: const E = require('./load-engine')(htmlPath)
const fs = require('fs'), vm = require('vm');
module.exports = function load(htmlPath){
  const html = fs.readFileSync(htmlPath, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const engine = scripts.find(s => s.includes('OYUN MOTORU'));
  const mem = {};
  const ctx = { console, Math, Date, JSON, setTimeout, clearTimeout,
    localStorage: { getItem: k => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: k => { delete mem[k]; } },
    module: { exports: {} } };
  ctx.globalThis = ctx; ctx.window = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(engine, ctx, { filename: 'engine.js' });
  // const/let bildirimleri global nesnede görünmez: ada göre değerlendiren vekil
  return new Proxy(ctx, { get(t, k){ if (typeof k !== 'string') return t[k]; if (k in t) return t[k]; if (!/^[A-Za-z_$][\w$]*$/.test(k)) return undefined; return vm.runInContext(`typeof ${k} !== 'undefined' ? ${k} : undefined`, t); } });
};
