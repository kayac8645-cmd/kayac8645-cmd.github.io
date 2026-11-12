const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; p.on('console', m => { if (m.type()==='error') errs.push(m.text()); }); p.on('pageerror', e => errs.push('PAGEERR '+e.message));
  p.on('dialog', d => d.accept());
  await p.goto('http://localhost:8123/index.html'); await p.waitForFunction(() => window.__pn, null, {timeout:60000});
  await p.evaluate(() => { const pn = window.__pn; pn.S.player = 1; pn.startGame(pn.S); });
  await p.waitForTimeout(800);
  for (const w of ['country','eco','army','tech','dip','stats','events','menu']) { await p.click('#dk-'+w); await p.waitForTimeout(250); await p.screenshot({ path: `/tmp/shots/w_${w}.png` }); }
  await p.keyboard.press('Escape');
  // speed 10 for a while, interact
  await p.evaluate(() => { const pn = window.__pn; pn.A.speed({v:10}); });
  await p.waitForTimeout(12000);
  await p.evaluate(() => { const pn = window.__pn; const S = pn.S; const c = S.cities.find(c=>c.owner===S.player); pn.A.selCity({c:c.id}); });
  await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/shots/city.png' });
  await p.evaluate(() => { const pn = window.__pn; const S = pn.S; const a = S.armies.find(a=>a.owner===S.player&&a.type==='inf'); pn.A.selArmy({id:a.id}); });
  await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/shots/army.png' });
  // save/load
  const r = await p.evaluate(async () => { const pn = window.__pn; pn.A.save({k:'2'}); await pn.A.load({k:'2'}); return pn.S.day; });
  await p.waitForTimeout(1500);
  console.log('day after load', r, 'errors', errs.slice(0,10));
  await p.screenshot({ path: '/tmp/shots/after.png' });
  await b.close();
})();
