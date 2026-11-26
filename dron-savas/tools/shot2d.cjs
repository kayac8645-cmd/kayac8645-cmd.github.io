// Canvas 2D yedek çizici duman testi
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message));
  await p.addInitScript(() => localStorage.setItem('ds_settings', JSON.stringify({ renderer: '2d', quality: 0 })));
  await p.goto('file://' + path.resolve('dist/index.html')); await p.waitForTimeout(2000);
  await p.getByText('Yeni Oyun').click(); await p.getByText('Başlat').click(); await p.waitForTimeout(4000);
  await p.screenshot({ path: process.argv[2] + '/c2d.png' });
  console.log(JSON.stringify(await p.evaluate(() => ({ r: window.__app.renderer.kind, fps: window.__app.game.fps | 0, tick: window.__app.game.sim.tick }))), errs.join('\n'));
  await b.close();
})();
