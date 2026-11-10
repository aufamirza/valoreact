// Local smart mirror server for MEOW (localhost use only)
import { createServer } from 'node:http';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4173);
const LIVE = 'https://okiaimx.app';
const PAGES = path.join(ROOT, '_pages'); // cached SSR pages
const SERVE_404_LIVE = true; // auto-fetch missing paths from the live site and cache them

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webmanifest': 'application/manifest+json',
};

function sendJson(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(obj));
}

// Offline API stubs so the SPA never receives HTML where it expects JSON.
// Also fakes a signed-in user so skins/settings work offline (login removed locally).
import { readFileSync } from 'node:fs';
const SP_FILE = path.join(ROOT, '_sp_state.json');

const FAKE_USER = {
  id: 'local-player',
  name: 'Player',
  email: 'player@localhost',
  image: null,
  createdAt: '2025-01-01T00:00:00.000Z',
};

// Derive every skin id from the client's fallback catalog so everything is "owned"
function allSkinIds() {
  try {
    const t = readFileSync(path.join(ROOT, 'assets', 'coach-recording-status-D_DcydMW.js'), 'utf8');
    const ids = new Set(['rgx']);
    for (const m of t.matchAll(/id:`([\w-]+)`/g)) ids.add(m[1]);
    return [...ids];
  } catch {
    return ['rgx'];
  }
}

function spState() {
  try { return JSON.parse(readFileSync(SP_FILE, 'utf8')); } catch {}
  return { equipped: [{ skinId: 'rgx' }], owned: allSkinIds() };
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

async function handleApi(req, url, res) {
  const apiPath = url.split('?')[0].replace(/\/+$/, '') || '/api';

  // The SPA's api-client only accepts an envelope `{code:0, data:<payload>}`;
  // anything else throws ApiError("Request failed") → system alert in the UI.
  const ok = (res, data) => sendJson(res, 200, { code: 0, data });

  if (apiPath === '/api/config/public') return ok(res, {});
  if (apiPath === '/api/user/permissions') return ok(res, {});
  if (apiPath === '/api/user/membership') {
    return ok(res, { currentPeriodEnd: null, canceledEndAt: null });
  }
  if (apiPath === '/api/auth/get-session') {
    return sendJson(res, 200, {
      user: FAKE_USER,
      session: { userId: FAKE_USER.id, expires: '2099-01-01T00:00:00.000Z' },
    });
  }
  if (apiPath === '/api/auth/token') return sendJson(res, 401, { error: 'offline' });
  // let the client fall back to its own embedded catalog (has all skins + prices)
  if (apiPath === '/api/game/skin-catalog') return sendJson(res, 200, { code: -1, message: 'offline' });
  if (apiPath === '/api/leaderboard') {
    return ok(res, { entries: [], modes: [], nextUpdateAt: null });
  }
  if (apiPath === '/api/user/sp') {
    const s = spState();
    return ok(res, {
      equipped: s.equipped,
      owned: s.owned,
      wallet: { balance: 9999999999 },
      membership: { isMember: true, plan: 'local', autoRenew: false },
    });
  }
  if (apiPath === '/api/user/sp/skins/equip') {
    const body = await readBody(req);
    const skinId = String(body?.skinId || '');
    if (!skinId) return sendJson(res, 200, { code: 1, message: 'skinId required' });
    const s = spState();
    s.equipped = [{ skinId }];
    if (!s.owned.includes(skinId)) s.owned.push(skinId);
    try { await writeFile(SP_FILE, JSON.stringify(s)); } catch {}
    return ok(res, { ok: true, equipped: s.equipped });
  }
  if (apiPath === '/api/user/sp/skins/purchase') {
    const body = await readBody(req);
    const skinId = String(body?.skinId || '');
    if (!skinId) return sendJson(res, 200, { code: 1, message: 'skinId required' });
    const s = spState();
    if (!s.owned.includes(skinId)) s.owned.push(skinId);
    s.equipped = [{ skinId }];
    try { await writeFile(SP_FILE, JSON.stringify(s)); } catch {}
    return ok(res, { ok: true, owned: s.owned });
  }
  if (apiPath === '/api/user/sp/transactions') {
    return ok(res, { items: [], total: 0, page: 1, pageSize: 20 });
  }
  if (apiPath === '/api/user/sp/training-sessions') {
    return ok(res, { id: `local-${Date.now()}` });
  }
  if (apiPath === '/api/user/sp/daily-login') {
    return ok(res, { claimed: false, reward: 0 });
  }
  if (apiPath.startsWith('/api/user/aim-trainer/training-records')) {
    if (req.method === 'GET') return ok(res, { items: [], total: 0 });
    return ok(res, {});
  }
  if (apiPath === '/api/user/aim-trainer/best-scores') {
    return ok(res, []);
  }
  return sendJson(res, 200, { code: 1, message: 'offline', path: apiPath });
}

async function statFile(p) {
  try {
    const s = await stat(p);
    if (s.isFile()) return p;
  } catch {}
  return null;
}

async function resolveLocal(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0]);
  p = path.normalize(p).replace(/^(\.\.[\/\\])+/, '');
  // exact file on disk (hashed assets, images, sounds, fonts, ...)
  const f = await statFile(path.join(ROOT, p));
  if (f) return f;

  if (!path.extname(p)) {
    const safe = p.replace(/[^A-Za-z0-9._-]+/g, '_');
    const name = safe === '' || safe === '/' ? '_root' : safe.slice(1);
    // previously cached SSR page for this route
    const cached = await statFile(path.join(PAGES, name + '.html'));
    if (cached) return cached;
    // directory with static index.html
    const d = p.endsWith('/') || p === '' ? p : p + '/';
    const idx = await statFile(path.join(ROOT, d, 'index.html'));
    if (idx) return idx;
    return 'LIVE'; // fetch from the live site
  }
  return null;
}

// Fetch a path from the live site, save it into the cache, return the body
async function fetchLive(req, res, urlPath) {
  const safe = urlPath.split('?')[0].replace(/[^A-Za-z0-9._-]+/g, '_') || '_root';
  const savePath = path.join(PAGES, (safe.length > 1 ? safe.slice(1) : '_root') + '.html');
  try {
    const r = await fetch(LIVE + urlPath, {
      method: req.method,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'accept': req.headers.accept || '*/*',
      },
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
      duplex: 'half',
    });
    if (!r.ok) return false;
    const ct = r.headers.get('content-type') || 'application/octet-stream';
    const buf = Buffer.from(await r.arrayBuffer());
    // cache HTML pages; also save static assets once so later loads stay offline
    if (ct.includes('text/html')) {
      try { await mkdir(PAGES, { recursive: true }); await writeFile(savePath, buf); } catch {}
    } else if (req.method === 'GET') {
      try { await mkdir(path.dirname(savePath), { recursive: true }); await writeFile(savePath, buf); } catch {}
    }
    res.writeHead(r.status, { 'Content-Type': ct, 'Cache-Control': 'no-store' });
    res.end(buf);
    console.log('LIVEFETCH OK', urlPath.split('?')[0], r.status, buf.length);
    return true;
  } catch (e) {
    console.log('LIVEFETCH FAIL', urlPath.split('?')[0], e.message || e);
    return false;
  }
}

createServer(async (req, res) => {
  try {
    if (req.url.startsWith('/api/')) {
      handleApi(req, req.url, res);
      return;
    }
    const resolved = await resolveLocal(req.url);
    if (resolved && resolved !== 'LIVE') {
      const body = await readFile(resolved);
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(resolved).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      res.end(body);
      return;
    }
    if ((resolved === 'LIVE' || resolved === null) && SERVE_404_LIVE && (await fetchLive(req, res, req.url))) return;
    // last resort: serve the local home page's index.html
    const idx = path.join(ROOT, 'index.html');
    if (path.extname(decodeURIComponent(req.url.split('?')[0])) === '') {
      const body = await readFile(idx);
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
      res.end(body);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end(`404 ${req.url}`);
  } catch (e) {
    res.writeHead(500);
    res.end('500 ' + e.message);
  }
}).listen(PORT, () => {
  console.log(`MEOW local mirror running at http://localhost:${PORT}/`);
});
