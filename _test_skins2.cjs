// UI test 2: PLAY -> brief -> click gear/settings icon -> drawer -> switch skin -> check alert
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const alerts = [];
  page.on('pageerror', e => alerts.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') alerts.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  await page.locator('button.play-button').click({ timeout: 4000 });
  await page.waitForTimeout(800);

  // find the gear icon button (settings) among icon buttons
  const icons = page.locator('button.topbar-icon-btn, button.flex.size-9, button.relative.z-10.flex.size-10');
  console.log('icon buttons:', await icons.count());
  // try each small icon button, look for the settings drawer opening (skin list should appear)
  let drawer = null;
  const n = await icons.count();
  for (let i = 0; i < n && !drawer; i++) {
    const b = icons.nth(i);
    try { await b.click({ timeout: 2000 }); } catch { continue; }
    await page.waitForTimeout(600);
    const hasSkinUi = await page.evaluate(() => {
      const t = document.body.innerText.toLowerCase();
      return (t.includes('skin') || t.includes('crosshair')) && (t.includes('equip') || t.includes('crosshair'));
    });
    if (hasSkinUi) { drawer = i; console.log('drawer opened via icon', i); break; }
    // close if a dialog opened
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  console.log('drawer index:', drawer);

  const sel = page.locator('select:visible');
  const selCount = await sel.count();
  console.log('visible selects:', selCount);
  const info = await page.evaluate(() => {
    const selects = [...document.querySelectorAll('select')].filter(s => s.offsetParent).map(s => ({ cls: s.className.slice(0, 50), opts: [...s.options].slice(0, 50).map(o => `${o.value}`) }));
    const buttons = [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.innerText.trim().slice(0, 24)).filter(Boolean).slice(0, 40);
    return { selects, buttons };
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 2500));
  await page.screenshot({ path: '_shot_drawer.png' });

  if (info.selects.length) {
    // the skin select is the one with many options
    const target = info.selects.reduce((a, b) => (b.opts.length > a.opts.length ? b : a));
    const idx = info.selects.indexOf(target);
    console.log('skin select idx', idx, 'options', target.opts.length, 'sample', target.opts.slice(0, 6));
    const newSkin = target.opts.find(v => v && v !== 'rgx' && v !== 'vandal_default');
    await sel.nth(idx).selectOption(newSkin);
    await page.waitForTimeout(1000);
    // equip / save
    const applyBtn = page.locator('button:visible', { hasText: /equip|apply|save|use/i }).first();
    if (await applyBtn.count()) { await applyBtn.click({ timeout: 3000 }); console.log('clicked apply'); }
    await page.waitForTimeout(1500);
    const alertText = await page.evaluate(() => document.body.innerText.match(/system alert[\s\S]{0,80}|request failed[\s\S]{0,40}/i)?.[0] || null);
    console.log('alert after equip:', alertText);
    await page.screenshot({ path: '_shot_equip2.png' });
  }
  console.log('ERRORS:', alerts.slice(0, 10));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
