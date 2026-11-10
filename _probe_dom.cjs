// Probe: open skin dropdown, dump the list container structure (classes/tags), no blind clicks
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

  const dump = await page.evaluate(() => {
    // find element containing 'Kuronami'
    const el = [...document.querySelectorAll('*')].find(e => e.innerText?.trim().startsWith('Kuronami') && e.children.length === 0);
    if (!el) return 'not found';
    const parts = [];
    let node = el;
    for (let d = 0; d < 6 && node; d++) {
      parts.push(`${node.tagName}.${String(node.className).slice(0, 80)} :: ${node.innerText?.trim().slice(0, 30)}`);
      node = node.parentElement;
    }
    // also grab the sibling buttons inside the list container
    const list = el.closest('div');
    const siblings = list ? [...list.querySelectorAll('button')].slice(0, 5).map(b => `${b.tagName}.${String(b.className).slice(0, 50)} :: ${b.innerText.trim().slice(0, 30)}`) : [];
    const tabButtons = [...document.querySelectorAll('button')].filter(b => b.offsetParent && /store|my skins|all/i.test(b.innerText)).map(b => `${b.className.slice(0, 60)} :: ${b.innerText.trim()}`);
    return { ancestors: parts, siblingButtons: siblings, tabButtons };
  });
  console.log(JSON.stringify(dump, null, 1));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message.split('\n')[0]); process.exit(1); });
