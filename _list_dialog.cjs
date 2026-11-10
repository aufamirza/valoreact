// after hero PLAY, list visible buttons in the briefing dialog
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: /^Play$/i }).first().click({ timeout: 3000 });
  await page.waitForTimeout(1200);
  const btns = await page.evaluate(() =>
    [...document.querySelectorAll('button,a,[role="button"]')]
      .filter(b => b.offsetParent)
      .map(b => ({ t: b.innerText.trim().slice(0, 60).replace(/\n/g, ' | '), cls: String(b.className).slice(0, 60) }))
      .filter(b => b.t || b.cls)
  );
  console.log(JSON.stringify(btns, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
