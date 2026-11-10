// UI test 4: pick a skin in "MY SKINS" -> equip; then STORE tab -> buy -> equip; check alerts each time
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const alerts = [];
  const apiCalls = [];
  page.on('pageerror', e => alerts.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') alerts.push('CONSOLE: ' + m.text()); });
  page.on('request', r => { if (r.url().includes('/api/user/sp')) apiCalls.push(r.method() + ' ' + r.url().replace('http://localhost:4173', '')); });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  await page.locator('button.play-button').click({ timeout: 4000 });
  await page.waitForTimeout(800);
  const icons = page.locator('button.topbar-icon-btn, button.flex.size-9, button.relative.z-10.flex.size-10');
  await icons.nth(1).click({ timeout: 3000 });
  await page.waitForTimeout(700);
  await page.locator('button:visible', { hasText: /choose skin/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(600);

  const clickItem = async (name, tab) => {
    if (tab) {
      const tb = page.locator('button:visible', { hasText: new RegExp(`^${tab}$`, 'i') }).first();
      if (await tb.count()) { await tb.click({ timeout: 3000 }); await page.waitForTimeout(500); }
    }
    const item = page.locator('li:visible, [role="option"]:visible, [data-radix-collection-item]:visible', { hasText: name }).first();
    const cnt = await item.count();
    if (!cnt) { console.log('item not found:', name, tab); return false; }
    await item.click({ timeout: 4000 });
    console.log('clicked item:', name, tab || '');
    return true;
  };

  const checkAlert = async (label) => {
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => document.body.innerText.match(/system alert[\s\S]{0,100}|request failed[\s\S]{0,60}/i)?.[0] || null);
    console.log(label, '-> alert:', t);
    return t;
  };

  await clickItem('Kuronami', null);
  await page.waitForTimeout(500);
  // after selection the drawer may show an Equip button; click it if present
  let eq = page.locator('button:visible', { hasText: /equip/i }).first();
  if (await eq.count()) { const txt = await eq.innerText(); console.log('equip btn:', txt.replace(/\n/g, '|')); await eq.click({ timeout: 3000 }); await checkAlert('equip'); }
  else console.log('no equip button visible');
  await page.screenshot({ path: '_shot_myskins_equip.png' });

  // STORE tab: buy a skin
  await page.locator('button:visible', { hasText: /choose skin/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(500);
  if (await clickItem('Reaver', 'STORE')) {
    await page.waitForTimeout(500);
    const buy = page.locator('button:visible', { hasText: /buy|purchase|equip/i }).first();
    if (await buy.count()) { const t = await buy.innerText(); console.log('buy btn:', t.replace(/\n/g, '|')); await buy.click({ timeout: 3000 }); await checkAlert('buy'); }
    else console.log('no buy button visible');
    await page.screenshot({ path: '_shot_store_buy.png' });
  }

  console.log('api calls:', [...new Set(apiCalls)]);
  console.log('ERRORS:', alerts.slice(0, 10));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
