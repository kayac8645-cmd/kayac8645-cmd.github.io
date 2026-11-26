// Gece, inşa paneli ve savaş sahnesi görüntüleri
const { chromium } = require('playwright'); const path = require('path'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + '\n' + e.stack)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.resolve('dist/index.html')); await p.waitForTimeout(2000);
  await p.getByText('İzleyici Modu').click(); await p.waitForTimeout(1500);
  // hızlı ileri sar: savaş başlasın
  await p.evaluate(() => { const g = window.__app.game; for (let k = 0; k < 7000; k++) { g.sim.step(); } g.sim.events.length = 0; });
  // en çok patlamanın olduğu yere git: düşman cephesi -> ilk ülkenin başkenti ile en yakın savaş ülkesi arası
  await p.evaluate(() => { const g = window.__app.game, s = g.sim; let best = null; for (let i = 0; i < s.e.hi; i++) if (s.e.kind[i] === 3) { best = i; break; } if (best !== null) g.jumpTo(s.e.x[best], s.e.y[best]); g.view.cam.zoom = 3; });
  await p.waitForTimeout(2500); await p.screenshot({ path: out + '/war.png' });
  await p.evaluate(() => { const g = window.__app.game; while (Math.abs(g.sim.env.hour - 22) > 0.3) g.sim.step(); g.sim.events.length = 0; const c = g.sim.world.countries[0].capital; g.jumpTo(c.x, c.y); g.view.cam.zoom = 2; });
  await p.waitForTimeout(2000); await p.screenshot({ path: out + '/night.png' });
  await p.evaluate(() => { const g = window.__app.game; g.view.layer = 'airdef'; g.view.cam.zoom = 1; });
  await p.waitForTimeout(1500); await p.screenshot({ path: out + '/layer.png' });
  console.log(JSON.stringify(await p.evaluate(() => { const g = window.__app.game; return { tick: g.sim.tick, fps: g.fps | 0, tickMs: g.tickMs.toFixed(2), ents: g.sim.e.count, parts: g.view.parts.n }; })));
  // oyuncu modu: inşa paneli
  await p.evaluate(() => window.__app.startNew({ seed: 7, size: 256, countries: 4, difficulty: 1, player: 0 })); await p.waitForTimeout(2500);
  await p.getByText('İnşa').first().click(); await p.waitForTimeout(500); await p.screenshot({ path: out + '/build.png' });
  console.log(errs.slice(0, 10).join('\n')); await b.close();
})();
