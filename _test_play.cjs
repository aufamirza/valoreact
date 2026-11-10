// Drive the local mirror trainer page in headless Chrome:
// press Play, mouse-move to trigger target spawns, then screenshot & count DOM/canvas state.
const { chromium } = require('playwright-core');

(async () => {
  const base = process.env.BASE || 'http://localhost:4173';
  const url = process.argv[2] || '/trainers/challenge';
  const out = process.argv[3] || '_shot_local.png';
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.addInitScript(() => {
    // force non-coarse pointer so the desktop path (pointer lock) is used
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
  });
  await page.goto(base + url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);

  const infoBefore = await page.evaluate(() => ({
    bodyText: document.body.innerText.slice(0, 400),
    canvas: [...document.querySelectorAll('canvas')].map(c => ({ w: c.width, h: c.height, cw: c.clientWidth, ch: c.clientHeight })),
    buttons: [...document.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 20),
  }));
  console.log('BEFORE:', JSON.stringify(infoBefore, null, 1).slice(0, 1500));

  // Click the play/start button (primary big button)
  const playBtn = page.locator('button.btn-tactical-primary, button:has-text("Play"), button:has-text("Start"), button:has-text("Mulai")').first();
  try { await playBtn.click({ timeout: 4000 }); console.log('clicked play'); } catch (e) { console.log('play click failed:', e.message.split('\n')[0]); }

  await page.waitForTimeout(600);
  // pointer lock usually rejected in headless; the game falls back to drag/shoot mode.
  // Move mouse around center to emulate looking, then wait for spawns.
  for (let i = 0; i < 10; i++) {
    await page.mouse.move(700 + i * 8, 450 + ((i % 2) ? 10 : -10));
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(2500);
  // click a few times (shoot)
  for (let i = 0; i < 5; i++) { await page.mouse.click(760 + i * 40, 430); await page.waitForTimeout(200); }

  const infoAfter = await page.evaluate(() => ({
    bodyText: document.body.innerText.slice(0, 400),
    hud: [...document.querySelectorAll('div,span')].map(d => d.textContent).filter(t => t && t.length < 120).slice(0, 5),
  }));
  console.log('AFTER:', JSON.stringify(infoAfter, null, 1).slice(0, 800));
  console.log('ERRORS:', errors.slice(0, 12));
  await page.screenshot({ path: out });
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
