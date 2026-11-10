// List every 4xx request on the homepage game
const { chromium } = require('playwright-core');

(async () => {
  const base = 'http://localhost:4173';
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  const fails = new Set();
  page.on('response', r => { if (r.status() >= 400) fails.add(r.status() + ' ' + r.url()); });
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  console.log('--- on load ---');
  [...fails].forEach(f => console.log(f));

  // start the game
  const playBtn = page.locator('button.btn-tactical-primary, button:has-text("Play"), button:has-text("Mulai")').first();
  try { await playBtn.click({ timeout: 4000 }); } catch {}
  await page.waitForTimeout(1000);
  const fails2 = [...fails].filter(f => ![...fails].includes(f));
  for (let i = 0; i < 12; i++) { await page.mouse.move(600 + i * 25, 400 + (i % 2) * 40); await page.waitForTimeout(150); }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '_shot_home2.png' });
  console.log('--- during play ---');
  [...fails].forEach(f => console.log(f));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
