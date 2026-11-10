// Final UI test: select skin -> EQUIP; STORE tab -> buy -> equip; verify no system alert + API hits
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const alerts = [];
  const apiCalls = [];
  page.on('pageerror', e => alerts.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') alerts.push('CONSOLE: ' + m.text()); });
  page.on('request', r => {
    if (r.url().includes('/api/user/sp')) apiCalls.push(r.method() + ' ' + r.url().replace('http://localhost:4173', '') + ' ' + (r.postData() || ''));
  });
  const alertProbe = () => page.evaluate(() => document.body.innerText.match(/system alert[\s\S]{0,100}|request failed[\s\S]{0,60}/i)?.[0] || null);

  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.locator('button.play-button').click({ timeout: 4000 });
  await page.waitForTimeout(800);
  const icons = page.locator('button.topbar-icon-btn, button.flex.size-9, button.relative.z-10.flex.size-10');
  await icons.nth(1).click({ timeout: 3000 });
  await page.waitForTimeout(700);
  await page.locator('button:visible', { hasText: /choose skin/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(600);

  // A) equip an owned skin
  await page.locator('button.skin-card', { hasText: 'Kuronami' }).first().click({ timeout: 5000 });
  await page.waitForTimeout(400);
  await page.locator('button.skin-equip-action-btn').click({ timeout: 5000 });
  await page.waitForTimeout(1400);
  console.log('A) alert after EQUIP:', await alertProbe());
  await page.screenshot({ path: '_shot_final_equip.png' });

  // B) STORE: buy a non-owned skin
  await page.locator('button.skin-tab-btn', { hasText: 'STORE' }).first().click({ timeout: 4000 });
  await page.waitForTimeout(700);
  const storeInfo = await page.evaluate(() =>
    [...document.querySelectorAll('button.skin-card')].filter(b => b.offsetParent).slice(0, 8).map(b => (b.className.includes('is-owned') ? 'OWNED ' : 'BUY ') + b.innerText.trim().replace(/\n/g, ' | ').slice(0, 46))
  );
  console.log('B) store cards:', JSON.stringify(storeInfo, null, 1));
  const notOwned = page.locator('button.skin-card:not(.is-owned)').first();
  if (await notOwned.count()) {
    console.log('buying:', (await notOwned.innerText()).replace(/\n/g, ' | '));
    await notOwned.click({ timeout: 5000 });
    await page.waitForTimeout(500);
    const buy = page.locator('button:visible', { hasText: /buy|purchase/i }).first();
    if (await buy.count()) {
      console.log('confirm:', (await buy.innerText()).replace(/\n/g, '|'));
      await buy.click({ timeout: 4000 });
      await page.waitForTimeout(1400);
    }
    console.log('B) alert after BUY:', await alertProbe());
    // equip it right away if button changed to EQUIP
    const eq = page.locator('button.skin-equip-action-btn:visible');
    if (await eq.count()) { await eq.click({ timeout: 3000 }); console.log('equipped newly bought skin'); }
    await page.waitForTimeout(1200);
    console.log('B) alert after equip-bought:', await alertProbe());
    await page.screenshot({ path: '_shot_final_store.png' });
  } else console.log('no non-owned card (all owned already?)');

  console.log('api calls:', [...new Set(apiCalls)]);
  console.log('ERRORS:', alerts.slice(0, 10));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
