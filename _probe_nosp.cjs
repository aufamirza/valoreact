// Sanity check: CSS baru ter-serve, chip SP hilang, bundle tanpa error console
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  const cssStatus = [];
  page.on('response', (r) => { if (r.url().includes('globals-')) cssStatus.push(r.status() + ' ' + r.url()); });
  await page.goto(process.argv[2] || 'http://localhost:4173', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  const res = await page.evaluate(() => {
    const chip = document.querySelector('.topbar-sp-balance');
    return {
      chipVisible: chip ? getComputedStyle(chip).display : 'no-element',
      bodySample: document.body.innerText.replace(/\s+/g, ' ').slice(0, 160),
    };
  });
  console.log(JSON.stringify({ ...res, cssStatus, errors: errors.slice(0, 5) }, null, 1));
  await page.screenshot({ path: process.argv[3] || '_shot_nosp_local.png' });
  await browser.close();
})();
