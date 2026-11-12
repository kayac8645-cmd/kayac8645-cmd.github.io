const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto('http://localhost:8123/index.html'); await p.waitForFunction(() => window.__pn, null, {timeout:60000});
  await p.waitForTimeout(800); await p.screenshot({ path: '/tmp/shots/m_title.png' });
  await p.evaluate(() => { const pn = window.__pn; pn.S.player = 5; pn.startGame(pn.S); });
  await p.waitForTimeout(1500);
  await p.tap('#map', { position: { x: 195, y: 300 } }); await p.waitForTimeout(500);
  await p.screenshot({ path: '/tmp/shots/m_game.png' });
  await p.click('#dk-eco'); await p.waitForTimeout(400); await p.screenshot({ path: '/tmp/shots/m_eco.png' });
  console.log(errs.slice(0,5)); await b.close();
})();
