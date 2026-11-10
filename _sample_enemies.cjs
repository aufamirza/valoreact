// Sample enemy presence over time after starting a Left peek round
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /^Play$/i }).first().click({ timeout: 3000 });
  await page.waitForTimeout(800);
  await page.locator('button.hub-start-btn').click({ timeout: 4000 });
  await page.waitForTimeout(500);

  const samples = [];
  for (let i = 0; i < 25; i++) {
    if (i % 4 === 0) { await page.mouse.click(800, 450); }
    const s = await page.evaluate(() =>
      [...document.querySelectorAll('img.enemy')].map(e => ({
        src: e.getAttribute('src'),
        cls: e.className.replace('enrijd', ''),
        visible: e.className.includes('enemy-visible'),
        complete: e.complete && e.naturalWidth > 0,
      }))
    );
    samples.push(s);
    await page.waitForTimeout(300);
  }
  const any = samples.find(s => s.length);
  console.log('enemy seen:', JSON.stringify(any || 'NONE'));
  console.log('samples-with-enemy:', samples.filter(s => s.length).length, '/', samples.length);
  await page.screenshot({ path: '_shot_arena2.png' });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
