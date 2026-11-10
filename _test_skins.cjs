// UI test: open homepage, then the settings/skins drawer, list controls, try equipping a skin
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const alerts = [];
  page.on('pageerror', e => alerts.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') alerts.push('CONSOLE: ' + m.text()); });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  // open settings drawer from hero
  await page.locator('button.play-button').click({ timeout: 4000 });
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /^Settings$/i }).click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(800);

  const ui = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('dialog, [role="dialog"], .drawer, .settings, aside, form').forEach((el, i) => {
      if (i < 8 && el.offsetParent) out.push(el.className.slice(0, 60) + ' :: ' + el.innerText.slice(0, 250).replace(/\n/g, ' | '));
    });
    // all selects/buttons inside visible panel
    const sel = [...document.querySelectorAll('select')].filter(s => s.offsetParent).map(s => ({ cls: s.className.slice(0, 40), opts: [...s.options].slice(0, 8).map(o => o.value + ':' + o.text) }));
    const btns = [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.innerText.trim().slice(0, 30)).filter(Boolean);
    const bodySnip = document.body.innerText.match(/SP\s*[0-9,.kKmM]+/)?.[0];
    return { panels: out, selects: sel, buttons: btns.slice(0, 40), sp: bodySnip };
  });
  console.log(JSON.stringify(ui, null, 1));
  await page.screenshot({ path: '_shot_settings.png' });

  // if a skin select exists, try switching to another skin
  const sel = page.locator('select:visible').first();
  if (await sel.count()) {
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value));
    const target = opts.find(v => v && v !== 'rgx' && v !== 'vandal_default') || opts[0];
    console.log('switching skin to:', target);
    await sel.selectOption(target);
    await page.waitForTimeout(800);
    // find an equip/save/apply button
    const applyBtn = page.locator('button:visible', { hasText: /equip|apply|save|use/i }).first();
    const applyInfo = await applyBtn.evaluate(b => b.innerText).catch(() => null);
    console.log('apply candidate:', applyInfo);
    if (applyBtn.count()) { await applyBtn.click({ timeout: 3000 }).catch(e => console.log('apply click fail', e.message.split('\n')[0])); }
    await page.waitForTimeout(1200);
    const alertText = await page.evaluate(() => document.body.innerText.match(/system alert[\s\S]{0,80}|request failed[\s\S]{0,40}/i)?.[0] || null);
    console.log('system alert after equip:', alertText);
    const sp = await page.evaluate(() => document.body.innerText.match(/SP\s*[0-9,.kKmM]+/)?.[0]);
    console.log('SP display:', sp);
    await page.screenshot({ path: '_shot_equip.png' });
  }
  console.log('ERRORS:', alerts.slice(0, 10));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
