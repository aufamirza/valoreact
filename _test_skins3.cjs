// UI test 3: open settings drawer -> "Choose skin" -> pick a skin -> equip -> check alerts
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

  // open the Choose skin dropdown
  const choose = page.locator('button:visible', { hasText: /choose skin/i }).first();
  console.log('choose btn count:', await choose.count());
  await choose.click({ timeout: 4000 });
  await page.waitForTimeout(600);
  // list options in the opened listbox
  const opts = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[role="option"], [data-radix-collection-item], li, div')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 80 && e.innerText && e.innerText.trim().length && e.innerText.trim().length < 40);
    return items.map(e => e.innerText.trim()).slice(0, 60);
  });
  console.log('options visible:', JSON.stringify(opts).slice(0, 1500));
  await page.screenshot({ path: '_shot_skin_list.png' });

  // pick a non-default skin
  const pick = page.getByText(/(prime|oni|reaver|kuronami|glitch)/i).first();
  console.log('pick count:', await pick.count());
  if (await pick.count()) {
    await pick.click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: '_shot_skin_picked.png' });
    // equip: there may be a Buy/Equip/Use button
    const use = page.locator('button:visible', { hasText: /equip|buy|use|apply|save/i }).first();
    const useTxt = await use.innerText().catch(() => null);
    console.log('use button:', useTxt);
    if (await use.count()) { await use.click({ timeout: 3000 }); }
    await page.waitForTimeout(1500);
    const alertText = await page.evaluate(() => document.body.innerText.match(/system alert[\s\S]{0,100}|request failed[\s\S]{0,60}/i)?.[0] || null);
    console.log('alert:', alertText);
    await page.screenshot({ path: '_shot_skin_equip.png' });
  }
  console.log('api calls:', apiCalls);
  console.log('ERRORS:', alerts.slice(0, 10));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
