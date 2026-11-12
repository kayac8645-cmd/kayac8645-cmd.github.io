const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; p.on('console', m => { if (m.type()==='error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR '+e.message));
  await p.goto('http://localhost:8123/index.html'); await p.waitForFunction(() => window.__pn, null, {timeout:60000});
  await p.waitForTimeout(1500); await p.screenshot({ path: '/tmp/shots/title.png' });
  await p.evaluate(() => { const pn = window.__pn; pn.showTitle('new'); });
  await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/shots/new.png' });
  await p.evaluate(() => { const pn = window.__pn; pn.S.player = 2; pn.startGame(pn.S); });
  await p.waitForTimeout(2500); await p.screenshot({ path: '/tmp/shots/game.png' });
  await p.evaluate(() => { window.__pn.R.cam.tz = 0.9; });
  await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/shots/zoomout.png' });
  console.log('errors', errs.slice(0,10));
  await b.close();
})();
