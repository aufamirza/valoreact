// Bedah struktur game DOM: video/canvas/iframe/img.enemy di local vs prod
const { chromium } = require('playwright-core');

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
    const frames = [];
    page.on('frameattached', (f) => frames.push(f.url()));
    await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1000);
    try { await page.getByRole('button', { name: /^Play$/i }).nth(0).click({ timeout: 3000 }); } catch {}
    await page.waitForTimeout(700);
    try { await page.locator('button.hub-start-btn').click({ timeout: 4000 }); } catch {}
    for (let i = 0; i < 10; i++) { await page.mouse.move(500 + i * 20, 430 + (i % 3) * 20); await page.waitForTimeout(140); }
    await page.waitForTimeout(2500);
    const dump = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')].map((e) => ({ cls: e.className, src: (e.getAttribute('src') || '').slice(0, 140), w: e.getBoundingClientRect().width }));
      return {
        videos: [...document.querySelectorAll('video')].map((v) => ({ src: v.currentSrc || v.src, paused: v.paused, url: v.baseURI, sizable: [v.videoWidth, v.videoHeight] })),
        canvases: [...document.querySelectorAll('canvas')].map((c) => ({ w: c.width, h: c.height, cls: c.className })),
        iframes: [...document.querySelectorAll('iframe')].map((f) => f.src).slice(0, 5),
        enemies: [...document.querySelectorAll('.enemy')].map((e) => ({ src: e.getAttribute('src'), rect: e.getBoundingClientRect().toJSON(), cls: e.className })),
        webglVendors: [...document.querySelectorAll('canvas')].map((c) => { try { return c.getContext('webgl2') || c.getContext('webgl') ? 'webgl-ctx' : null; } catch { return null; } }),
        frameCount: window.frames.length,
      };
    });
    console.log('[' + label + '] ' + JSON.stringify(dump, null, 1).slice(0, 1800));
    await page.screenshot({ path: `_shot_anatomy_${label}.png` });
    console.log('[' + label + '] frames attached:', frames.filter(Boolean).slice(0, 6).join(' | '));
    await page.close();
  }
  await browser.close();
})();
