// Klik persis di tengah musuh di local vs prod: apa elemen teratas? apakah hit tercatat?
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
    const reqs = [];
    page.on('response', (r) => {
      const u = r.url();
      if (!/googleads|doubleclick|googletagmanager|googlesyndication|crisp|tawk|plausible/.test(u))
        reqs.push(`${r.status()} ${u.replace(base, '')}`);
    });
    try {
      await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1000);
      try { await page.getByRole('button', { name: /^Play$/i }).nth(0).click({ timeout: 3000 }); } catch {}
      await page.waitForTimeout(700);
      try { await page.locator('button.hub-start-btn').click({ timeout: 4000 }); } catch {}
      for (let i = 0; i < 8; i++) { await page.mouse.move(500 + i * 20, 430 + (i % 3) * 20); await page.waitForTimeout(140); }
      // Ensure the ready-lock overlay is dismissed (needs a real pointerdown inside arena)
      for (let t = 0; t < 24; t++) {
        await page.waitForTimeout(500);
        const st = await page.evaluate(() => document.querySelector('.enemy') ? 'enemy' : (document.querySelector('.ready-focus-overlay') ? 'ready' : 'none'));
        if (st === 'enemy') break;
        await page.mouse.click(700 + (t % 5) * 30, 450).catch(() => {});
      }

      const before = await page.evaluate(() => {
        const e = document.querySelector('.enemy');
        if (!e) return { noEnemy: true };
        const r = e.getBoundingClientRect();
        return {
          rect: { x: r.x, y: r.y, w: r.width, h: r.height },
          cx: r.x + r.width / 2, cy: r.y + r.height / 2,
        };
      });
      if (before.noEnemy) { console.log(`[${label}] NO ENEMY SPAWNED`); await page.close(); continue; }

      // Klik di pusat musuh dan lihat apa yang terjadi
      const cx = before.cx, cy = before.cy;
      await page.mouse.click(cx, cy);
      await page.waitForTimeout(400);

      const after = await page.evaluate(({ cx, cy }) => {
        const top = document.elementFromPoint(cx, cy);
        const e = document.querySelector('.enemy');
        const r = e && e.getBoundingClientRect();
        const arena = document.querySelector('.game-arena');
        const cs = arena && getComputedStyle(arena);
        const stage = document.querySelector('.stage');
        const scs = stage && getComputedStyle(stage);
        return {
          topAtEnemyCenter: top ? top.tagName + '.' + String(top.className).slice(0, 60) : null,
          isEnemyItself: top === e || (top && top.contains && top.contains(e)),
          enemyAfter: r && { x: r.x, y: r.y, w: r.width, h: r.height },
          scoreText: (document.querySelector('.game-score') || {}).textContent || null,
          bestVal: (document.querySelector('.best-score-val') || {}).textContent || null,
          arenaBg: cs && cs.backgroundImage.slice(0, 90) + ' | size=' + cs.backgroundSize + ' pos=' + cs.backgroundPosition,
          arenaRect: arena && { w: arena.getBoundingClientRect().width, h: arena.getBoundingClientRect().height },
          stageUnit: scs && scs.fontSize,
          weaponImg: [...document.querySelectorAll('img')].find(i => /weapon|vandal|gun/i.test(i.src))?.src?.slice(-60) || null,
        };
      }, { cx, cy });

      const out = { before, clickAt: { cx, cy }, after, reqs };
      fs.writeFileSync(`_probe_click_${label}.json`, JSON.stringify(out, null, 1));
      await page.screenshot({ path: `_shot_click_${label}.png` });
      console.log(`[${label}] topAt=${after.topAtEnemyCenter} isEnemy=${after.isEnemyItself} score=${after.scoreText} best=${after.bestVal}`);
      console.log(`[${label}] arenaBg=${after.arenaBg} rect=${JSON.stringify(after.arenaRect)} unit=${after.stageUnit}`);
    } catch (e) {
      console.log(`[${label}] FATAL ${e.message}`);
    }
    await page.close();
  }
  await browser.close();
})();
