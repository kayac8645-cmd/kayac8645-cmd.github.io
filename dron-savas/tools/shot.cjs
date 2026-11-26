// Tarayıcı duman testi: menü -> yeni oyun -> birkaç saniye oyna, ekran görüntüleri ve konsol hataları
const { chromium } = require('playwright');
const path = require('path');
const out = process.argv[2] || '.'; const wait = +(process.argv[3] || 4000);
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = [];
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + '\n' + e.stack));
  await p.goto('file://' + path.resolve('dist/index.html'));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: out + '/menu.png' });
  await p.getByText('Yeni Oyun').click(); await p.waitForTimeout(300);
  await p.getByText('Başlat').click();
  await p.waitForTimeout(wait);
  await p.screenshot({ path: out + '/game.png' });
  const info = await p.evaluate(() => { const g = window.__app.game; return g ? { tick: g.sim.tick, fps: g.fps | 0, r: window.__app.renderer.kind, tickMs: g.tickMs, ents: g.sim.e.count } : null; });
  console.log(JSON.stringify(info));
  if (process.argv[4] === 'more') {
    await p.evaluate(() => { const g = window.__app.game; g.speed = 4; g.view.cam.zoom = 2; });
    await p.waitForTimeout(8000);
    await p.screenshot({ path: out + '/game2.png' });
    await p.evaluate(() => { const g = window.__app.game; g.view.cam.zoom = 4; g.sim.env.hour = 23; });
    await p.waitForTimeout(500);
    await p.screenshot({ path: out + '/game3.png' });
  }
  console.log(errs.slice(0, 15).join('\n'));
  await b.close();
})();
