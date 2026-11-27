// 0.17 akışı: başkent seçimi, 32 px grafik, şehir adaları, uzak görünüm
const { chromium } = require('playwright'); const path = require('path'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + '\n' + e.stack)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const t0 = Date.now();
  await p.goto('file://' + path.resolve('dist/index.html')); await p.waitForSelector('.menu', { timeout: 60000 });
  console.log('açılış', Date.now() - t0, 'ms');
  await p.evaluate(() => window.__app.startNew({ seed: 4242, size: 512, countries: 5, difficulty: 1, player: 0 })); await p.waitForTimeout(2500);
  await p.screenshot({ path: out + '/s1.png' });
  await p.evaluate(() => { const g = window.__app.game; const W = g.sim.map.W; const c = g.sim.world.cand[5]; g.siteSel = [c % W, (c / W) | 0]; g.jumpTo(c % W, (c / W) | 0); g.view.cam.zoom = 1 / 4; g.hud.renderContext(); }); await p.waitForTimeout(800);
  await p.screenshot({ path: out + '/s2.png' });
  await p.evaluate(() => window.__app.game.foundCapital()); await p.waitForTimeout(1500);
  await p.evaluate(() => { const g = window.__app.game; g.speed = 4; }); await p.waitForTimeout(4000);
  await p.screenshot({ path: out + '/s3.png' });
  await p.evaluate(() => { const g = window.__app.game; g.view.cam.zoom = 1; }); await p.waitForTimeout(1500); await p.screenshot({ path: out + '/s4.png' });
  await p.evaluate(() => { const g = window.__app.game; g.view.cam.zoom = g.fitZoom(); }); await p.waitForTimeout(1500); await p.screenshot({ path: out + '/s5.png' });
  // izleyici: savaş + yangın
  await p.evaluate(() => window.__app.startNew({ seed: 4242, size: 512, countries: 6, difficulty: 2, allAI: true, player: 0 })); await p.waitForTimeout(2500);
  await p.evaluate(() => { const g = window.__app.game; for (let k = 0; k < 17000; k++) g.sim.step(); g.sim.events.length = 0; const s = g.sim; let t = s.fireTiles[0]; if (t !== undefined) g.jumpTo(t % s.map.W, (t / s.map.W) | 0); else { const c = s.world.countries[2].capital; g.jumpTo(c.x, c.y); } g.view.cam.zoom = 2; });
  await p.waitForTimeout(3000); await p.screenshot({ path: out + '/s6.png' });
  await p.evaluate(() => { const g = window.__app.game; const c = g.sim.world.countries[3].capital; g.jumpTo(c.x, c.y); g.view.cam.zoom = 2; }); await p.waitForTimeout(2500); await p.screenshot({ path: out + '/s7.png' });
  console.log(JSON.stringify(await p.evaluate(() => { const g = window.__app.game; return { fps: g.fps | 0, tickMs: g.tickMs.toFixed(2), fire: g.sim.fireTiles.length }; })));
  console.log(errs.slice(0, 8).join('\n')); await b.close();
})();
