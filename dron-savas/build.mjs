// Build: src/main.js -> tek dosya dist/index.html (JS + CSS gömülü, tamamen offline)
import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const dev = process.argv.includes('--dev');
const t0 = Date.now();
const res = await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: !dev,
  sourcemap: false,
  write: false,
  legalComments: 'none',
  loader: { '.png': 'dataurl', '.woff2': 'dataurl' },
  define: { __DEV__: dev ? 'true' : 'false', __BUILD_TIME__: JSON.stringify(new Date().toISOString()) },
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = readFileSync('src/style.css', 'utf8');
const tpl = readFileSync('src/index.html', 'utf8');
const html = tpl.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', html);
console.log(`dist/index.html ${(html.length / 1024).toFixed(1)} KB, ${Date.now() - t0} ms`);
