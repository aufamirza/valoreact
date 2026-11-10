// Drive homepage arena: PLAY -> pick "Left peek" -> PLAY in briefing -> screenshot with enemies
const { chromium } = require('playwright-core');

(async () => {
  const base = 'http://localhost:4173';
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);

  const clickPlay = async (nth) => {
    try {
      await page.getByRole('button', { name: /^Play$/i }).nth(nth).click({ timeout: 3000 });
      return true;
    } catch { return false; }
  };
  // hero PLAY
  console.log('play1', await clickPlay(0));
  await page.waitForTimeout(800);
  // hub start button
  try { await page.locator('button.hub-start-btn').click({ timeout: 4000 }); console.log('start clicked'); }
  catch { console.log('start click failed'); }
  await page.waitForTimeout(1200);
  // Arena needs pointer-lock-look; headless falls back to drag/click mode. Wiggle + wait for spawns.
  for (let i = 0; i < 14; i++) {
    await page.mouse.move(540 + i * 22, 420 + (i % 3) * 25);
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(3500);
  const state = await page.evaluate(() => ({
    enemies: [...document.querySelectorAll('img.enemy')].map(e => ({
      src: e.getAttribute('src'),
      cls: e.className,
      complete: e.complete,
      nw: e.naturalWidth,
    })),
    text: document.body.innerText.slice(0, 500),
  }));
  console.log(JSON.stringify(state, null, 1));
  console.log('ERRORS:', errors.slice(0, 8));
  await page.screenshot({ path: '_shot_arena.png' });
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
