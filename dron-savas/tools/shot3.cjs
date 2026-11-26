// İnşa paneli, yerleştirme, yatak kartı ve sis kapalı görünümü
const { chromium } = require('playwright'); const path = require('path'); const out = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.message + '\n' + e.stack));
  await p.goto('file://' + path.resolve('dist/index.html')); await p.waitForTimeout(2000);
  await p.evaluate(() => window.__app.startNew({ seed: 4242, size: 256, countries: 4, difficulty: 1, player: 0, fog: false })); await p.waitForTimeout(2500);
  await p.getByText('İnşa').first().click(); await p.waitForTimeout(400); await p.screenshot({ path: out + '/b1.png' });
  await p.getByText('Enerji').click(); await p.waitForTimeout(300); await p.screenshot({ path: out + '/b2.png' });
  await p.evaluate(() => { const g = window.__app.game; document.querySelector('.panel .phead .x').click(); g.startBuild(16, false); }); await p.waitForTimeout(600); await p.screenshot({ path: out + '/b3.png' });
  await p.evaluate(() => { const g = window.__app.game; g.setMode(null); const d = g.deposits.list.find((x) => x.n > 4 && g.sim.map.owner[x.tiles[0]] === 0 && !g.sim.map.occ[x.tiles[0]]) || g.deposits.list[0]; g.depSel = d.id; g.jumpTo(d.x, d.y); g.view.cam.zoom = 3; g.hud.renderContext(); }); await p.waitForTimeout(800); await p.screenshot({ path: out + '/b4.png' });
  await p.evaluate(() => { const g = window.__app.game; g.view.cam.zoom = 1; const c = g.sim.world.countries[1].capital; g.jumpTo(c.x, c.y); }); await p.waitForTimeout(1500); await p.screenshot({ path: out + '/b5.png' });
  console.log(errs.join('\n')); await b.close();
})();
