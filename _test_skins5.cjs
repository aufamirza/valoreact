// UI test 5: click skin-card directly (equip), then STORE tab card (buy+equip). Verify no system alert.
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const alerts = [];
  const apiCalls = [];
  page.on('pageerror', e => alerts.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') alerts.push('CONSOLE: ' + m.text()); });
  page.on('request', r => { if (r.url().includes('/api/user/sp')) apiCalls.push(r.method() + ' ' + r.url().replace('http://localhost:4173', '') + ' ' + (r.postData() || '')); });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.locator('button.play-button').click({ timeout: 4000 });
  await page.waitForTimeout(800);
  const icons = page.locator('button.topbar-icon-btn, button.flex.size-9, button.relative.z-10.flex.size-10');
  await icons.nth(1).click({ timeout: 3000 });
  await page.waitForTimeout(700);
  await page.locator('button:visible', { hasText: /choose skin/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(600);

  // 1) equip an owned skin by clicking its card
  const kuronami = page.locator('button.skin-card', { hasText: 'Kuronami' }).first();
  console.log('kuronami card:', await kuronami.count(), await kuronami.getAttribute('class'));
  await kuronami.click({ timeout: 5000 });
  await page.waitForTimeout(1200);
  let t = await page.evaluate(() => document.body.innerText.match(/system alert[\s\S]{0,100}|request failed[\s\S]{0,60}/i)?.[0] || null);
  console.log('after card click alert:', t);
  const kurCls = await kuronami.getAttribute('class');
  console.log('kuronami class now:', kurCls);
  await page.screenshot({ path: '_shot_card_equip.png' });

  // 2) STORE tab: pick a paid skin and buy
  await page.locator('button.skin-tab-btn', { hasText: 'STORE' }).click({ timeout: 4000 });
  await page.waitForTimeout(700);
  const cards = await page.evaluate(() =>
    [...document.querySelectorAll('button.skin-card')].filter(b => b.offsetParent).slice(0, 60).map(b => `${b.className.includes('is-owned') ? 'OWNED ' : 'STORE '}${b.innerText.trim().replace(/\n/g, ' | ').slice(0, 50)}`)
  );
  console.log('store cards sample:', JSON.stringify(cards.slice(0, 12), null, 1));
  // find a not-owned card
  const storeCard = page.locator('button.skin-card:not(.is-owned)').first();
  if (await storeCard.count()) {
    const txt = await storeCard.innerText();
    console.log('buying card:', txt.replace(/\n/g, ' | '));
    await storeCard.click({ timeout: 5000 });
    await page.waitForTimeout(900);
    // possible buy/confirm button appears
    const buy = page.locator('button:visible', { hasText: /buy|purchase/i }).first();
    if (await buy.count()) { console.log('confirm buy btn:', (await buy.innerText()).replace(/\n/g, '|')); await buy.click({ timeout: 4000 }); }
    await page.waitForTimeout(1500);
    t = await page.evaluate(() => document.body.innerText.match(/system alert[\s\S]{0,100}|request failed[\s\S]{0,60}/i)?.[0] || null);
    console.log('after buy alert:', t);
    await page.screenshot({ path: '_shot_store_after.png' });
  } else console.log('no store card found');
  console.log('api calls:', [...new Set(apiCalls)]);
  console.log('ERRORS:', alerts.slice(0, 10));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
