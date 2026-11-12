const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto('http://localhost:8123/index.html'); await p.waitForFunction(() => window.__pn, null, {timeout:60000});
  const info = await p.evaluate(async () => { const pn = window.__pn; const S = pn.S; S.player = 3; pn.startGame(S);
    const { stepHour } = await import('./js/game.js'); let tile=-1;
    for (let h=0; h<24*400 && tile<0; h++){ stepHour(S); if (h%6===0 && S.battles.length) tile = S.battles[0].tile; }
    if (tile>=0) { pn.R.focusTile(tile, 3); pn.R.cam.x=pn.R.cam.tx; pn.R.cam.y=pn.R.cam.ty; pn.R.cam.z=pn.R.cam.tz; }
    return {day:S.day, tile}; });
  await p.waitForTimeout(1200); await p.screenshot({ path: '/tmp/shots/battle.png' });
  console.log(info, errs.slice(0,5)); await b.close();
})();
