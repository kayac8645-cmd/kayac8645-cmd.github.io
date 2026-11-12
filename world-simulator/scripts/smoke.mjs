// End-to-end smoke test (real browser): node scripts/smoke.mjs [url]
// Uses DOM clicks for UI buttons so it also works on software-rendered (slow GPU) CI machines.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = await import('playwright')); }
const url = process.argv[2] ?? 'http://localhost:5173/?quality=low';
const out = process.env.SHOTS ?? 'smoke-shots';
await import('node:fs').then((fs) => fs.mkdirSync(out, { recursive: true }));
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); };
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];

async function open(viewport, extra = {}) {
  const page = await browser.newPage({ viewport, ...extra });
  page.setDefaultTimeout(60000);
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url);
  await page.waitForSelector('[data-testid=loading]', { state: 'detached', timeout: 120000 });
  return page;
}
const click = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) throw new Error('missing ' + s); el.click(); }, sel);
const clickText = (page, scope, text) => page.evaluate(([sc, t]) => { const el = [...document.querySelectorAll(sc)].find((e) => e.textContent.trim() === t); if (!el) throw new Error('missing ' + t); el.click(); }, [scope, text]);
const text = (page, sel) => page.evaluate((s) => document.querySelector(s)?.textContent ?? '', sel);
const state = (page) => page.evaluate(() => { const r = window.__renderer; return { mode: r.controller.mode, alt: r.camera.position.length() - 1, fps: r.fps }; });

const t0 = Date.now();
const page = await open({ width: 1000, height: 680 });
check('1. planet generated', true, `${Date.now() - t0} ms`);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/01-space.png` });

// rotate
const before = await page.evaluate(() => ({ ...window.__renderer.controller.spCur }));
const box = await page.locator('.planet-view canvas').boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx - 150, cy + 30, { steps: 6 }); await page.mouse.up();
await page.waitForTimeout(1500);
const after = await page.evaluate(() => ({ ...window.__renderer.controller.spCur }));
check('2. planet rotates (drag)', Math.abs(after.lon - before.lon) > 5, `lon ${before.lon.toFixed(1)} → ${after.lon.toFixed(1)}`);

// zoom
const d0 = after.dist;
await page.mouse.move(cx, cy);
for (let k = 0; k < 4; k++) await page.mouse.wheel(0, -300);
await page.waitForTimeout(1200);
const d1 = await page.evaluate(() => window.__renderer.controller.spCur.dist);
check('3a. zoom in (wheel)', d1 < d0, `dist ${d0.toFixed(2)} → ${d1.toFixed(2)}`);

// surface mode & back
await click(page, '[data-testid=to-surface]');
await page.waitForFunction(() => window.__renderer.camera.position.length() - 1 < 0.1, null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(500);
let st = await state(page);
check('3b/4. surface mode (camera near surface)', st.mode === 'surface' && st.alt < 0.1, `alt ${st.alt.toFixed(4)}`);
await page.screenshot({ path: `${out}/02-surface.png` });
await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx - 80, cy - 60, { steps: 5 }); await page.mouse.up();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/03-surface-pan.png` });
await click(page, '[data-testid=to-space]');
await page.waitForFunction(() => window.__renderer.camera.position.length() - 1 > 0.3, null, { timeout: 30000 }).catch(() => {});
st = await state(page);
check('4. back to space mode', st.mode === 'space' && st.alt > 0.3, `alt ${st.alt.toFixed(2)}`);

// time
const date = () => text(page, '.date');
const s0 = await date();
await click(page, '[data-testid=speed-1000]');
await click(page, '[data-testid=play]');
await page.waitForTimeout(5000);
const s1 = await date();
check('5/6. simulation runs at 1000x', s0 !== s1, `${s0} → ${s1} (${await text(page, '[data-testid=sim-status]')})`);
await click(page, '[data-testid=play]');
await page.waitForTimeout(800);
const s2 = await date();
await page.waitForTimeout(1500);
check('5. pause stops time', s2 === (await date()), s2);

// select region (tap)
await page.mouse.click(cx, cy);
await page.waitForSelector('[data-testid=region-card]', { timeout: 20000 }).catch(() => {});
const region = await text(page, '[data-testid=region-card]');
check('10. region panel shows simulated values', /Sıcaklık/.test(region) && /Yağış/.test(region), (await text(page, '.rc-title')));
await page.screenshot({ path: `${out}/04-region.png` });

// disasters change environment
const statsBefore = await page.evaluate(() => {
  const rc = document.querySelector('[data-testid=region-card]');
  return rc?.textContent ?? '';
});
await clickText(page, '.tabs button', 'Felaketler');
await click(page, '[data-testid=dis-asteroid]');
await click(page, '[data-testid=start-disaster]');
await page.waitForTimeout(1500);
const aod = await page.evaluate(() => [...document.querySelectorAll('.kv')].find((e) => e.textContent.includes('Aerosol'))?.textContent ?? '');
check('7/8a. asteroid raises global aerosol', /Aerosol \(AOD\)[0-9.]+/.test(aod) && !/0\.000$/.test(aod), aod);
await click(page, '[data-testid=dis-wildfire]');
await click(page, '[data-testid=start-disaster]');
await click(page, '[data-testid=dis-drought]');
await click(page, '[data-testid=start-disaster]');
const evs = await page.evaluate(() => document.querySelectorAll('.ev-list li').length);
check('7. multiple disasters active', evs >= 2, `${evs} active`);
await click(page, '[data-testid=play]');
await page.waitForTimeout(4000);
await click(page, '[data-testid=play]');
await page.waitForTimeout(1500);
const statsAfter = await text(page, '[data-testid=region-card]');
check('8b. region values changed after disasters', statsBefore !== statsAfter, (statsAfter.match(/Ekolojik durum([^Y]*)/)?.[1] ?? '').trim());
await page.screenshot({ path: `${out}/05-disasters.png` });
for (const l of ['Sıcaklık', 'Felaket']) { await clickText(page, '.chips button', l); await page.waitForTimeout(1500); await page.screenshot({ path: `${out}/06-layer-${l}.png` }); }
await clickText(page, '.chips button', 'Normal');

// populations change
const hist = await page.evaluate(() => document.querySelectorAll('.spark canvas').length);
const sp1 = await text(page, '.mini-species');
const yearOf = (d) => Number((d.match(/Yıl ([\d.]+)/)?.[1] ?? '0').replace(/\./g, ''));
const waitYears = async (from, n) => page.waitForFunction(([f, k]) => {
  const m = document.querySelector('.date')?.textContent.match(/Yıl ([\d.]+)/);
  return m && Number(m[1].replace(/\./g, '')) >= f + k && !document.querySelector('.jumps progress');
}, [from, n], { timeout: 180000 });
const y0 = yearOf(await date());
await click(page, '[data-testid=jump-100]');
await waitYears(y0, 99);
const sp2 = await text(page, '.mini-species');
check('9. plant/animal populations change (100-year jump)', sp1 !== sp2 && hist > 0, '');
check('10b. stats update from simulation', yearOf(await date()) >= y0 + 99, `Yıl ${y0} → ${await date()}`);

// save & load
await clickText(page, '.top-actions button', 'Kayıtlar');
await click(page, '[data-testid=save-now]');
await page.waitForSelector('[data-testid=save-item]', { timeout: 30000 }).catch(() => {});
const nSaves = await page.evaluate(() => document.querySelectorAll('[data-testid=save-item]').length);
const savedDate = await date();
await click(page, '.modal-head .icon-btn');
await click(page, '[data-testid=jump-10]');
await waitYears(yearOf(savedDate), 10);
const movedDate = await date();
await clickText(page, '.top-actions button', 'Kayıtlar');
await page.waitForSelector('[data-testid=load-save]');
await click(page, '[data-testid=load-save]');
await page.waitForSelector('[data-testid=loading]', { state: 'detached', timeout: 60000 });
await page.waitForTimeout(1500);
const loadedDate = await date();
check('11. save & load (IndexedDB)', nSaves > 0 && loadedDate === savedDate && movedDate !== savedDate, `saved ${savedDate}, moved ${movedDate}, loaded ${loadedDate}`);
await page.close();

// mobile
const m = await open({ width: 390, height: 780 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await m.waitForTimeout(1200);
await m.screenshot({ path: `${out}/07-mobile.png` });
await m.tap('[aria-label=Araçlar]');
await m.waitForTimeout(600);
const open1 = await m.evaluate(() => document.querySelector('.panel.left')?.classList.contains('open'));
await m.screenshot({ path: `${out}/08-mobile-tools.png` });
await m.tap('.scrim', { position: { x: 370, y: 300 } });
await m.waitForTimeout(400);
await m.tap('.planet-view canvas', { position: { x: 195, y: 380 } });
await m.waitForSelector('[data-testid=region-card]', { timeout: 20000 }).catch(() => {});
const mcard = await m.evaluate(() => !!document.querySelector('[data-testid=region-card]'));
await m.tap('[data-testid=play]');
await m.waitForTimeout(2500);
const mstatus = await m.evaluate(() => document.querySelector('[data-testid=sim-status]')?.textContent);
check('12. mobile: drawer, touch select, play', !!open1 && mcard && /Çalışıyor/.test(mstatus ?? ''), mstatus ?? '');
await m.screenshot({ path: `${out}/09-mobile-region.png` });

check('no runtime errors', errors.length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `SMOKE FAILED (${failed.length})` : `SMOKE OK (${results.length} checks)`);
process.exit(failed.length ? 1 : 0);
