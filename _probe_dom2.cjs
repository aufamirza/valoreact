// Probe: after selecting a skin, dump every button + inputs in the drawer (incl. footer/save)
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.locator('button.play-button').click({ timeout: 4000 });
  await page.waitForTimeout(800);
  const icons = page.locator('button.topbar-icon-btn, button.flex.size-9, button.relative.z-10.flex.size-10');
  await icons.nth(1).click({ timeout: 3000 });
  await page.waitForTimeout(700);
  await page.locator('button:visible', { hasText: /choose skin/i }).first().click({ timeout: 4000 });
  await page.waitForTimeout(600);
  await page.locator('button.skin-card', { hasText: 'Kuronami' }).first().click({ timeout: 5000 });
  await page.waitForTimeout(800);

  const dump = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(b => b.offsetParent && !b.className.includes('skin-card') && !b.className.includes('skin-tab')).map(b => `${b.tagName}.${String(b.className).slice(0, 70)} :: ${b.innerText.trim().replace(/\n/g, '|').slice(0, 40)}`);
    const panels = [...document.querySelectorAll('aside, section, dialog, [role="dialog"]')].filter(e => e.offsetParent && e.innerText.toLowerCase().includes('skin')).map(e => ({ cls: e.className.slice(0, 60), buttons: [...e.querySelectorAll('button')].map(b => `${b.className.slice(0, 50)} :: ${b.innerText.trim().replace(/\n/g, '|').slice(0, 36)}`) }));
    return { btns, panels };
  });
  console.log(JSON.stringify(dump, null, 1).slice(0, 4000));
  await page.screenshot({ path: '_shot_probe2.png' });
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
