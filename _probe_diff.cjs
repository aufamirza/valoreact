// Bandingkan arena localhost:4173 vs prod dengan langkah persis sama.
// Capture: network requests, errors, screenshot, dan state game in-page.
const { chromium } = require('playwright-core');
const fs = require('fs');

const TARGETS = [
  ['local', 'http://localhost:4173'],
  ['prod', 'https://valoreaction.vercel.app'],
];

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  for (const [label, base] of TARGETS) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    const errors = [];
    const reqs = [];
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
    page.on('response', (r) => {
      if (r.url().includes('/api/') || r.status() >= 400)
        reqs.push(`${r.status()} ${r.request().method()} ${r.url().replace(base, '')}`);
    });
    try {
      await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1200);
      try { await page.getByRole('button', { name: /^Play$/i }).nth(0).click({ timeout: 3000 }); } catch {}
      await page.waitForTimeout(800);
      try { await page.locator('button.hub-start-btn').click({ timeout: 4000 }); } catch {}
      for (let i = 0; i < 14; i++) {
        await page.mouse.move(540 + i * 22, 420 + (i % 3) * 25);
        await page.waitForTimeout(160);
      }
      await page.waitForTimeout(3500);
      const state = await page.evaluate(() => {
        const enemy = document.querySelector('.enemy');
        const r = enemy && enemy.getBoundingClientRect();
        return {
          enemies: document.querySelectorAll('.enemy').length,
          enemyRect: r && { x: r.x, y: r.y, w: r.width, h: r.height },
          enemyCountVisible: [...document.querySelectorAll('.enemy')].filter((e) => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0; }).length,
          bodySample: document.body.innerText.replace(/\s+/g, ' ').slice(0, 260),
        };
      });
      fs.writeFileSync(`_probe_diff_${label}.json`, JSON.stringify({ state, reqs, errors }, null, 1));
      await page.screenshot({ path: `_shot_diff_${label}.png` });
      console.log(`[${label}] enemies=${state.enemies} errors=${errors.length} reqs=${reqs.length}`);
    } catch (e) {
      console.log(`[${label}] FATAL ${e.message}`);
      fs.writeFileSync(`_probe_diff_${label}.json`, JSON.stringify({ fatal: e.message, reqs, errors }, null, 1));
    }
    await page.close();
  }
  await browser.close();
})();
