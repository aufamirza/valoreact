// Vercel Serverless Function: replika stubs /api/* dari server.mjs
// Tujuan: perilaku online identik dengan localhost (fake user, semua skin terbuka, tanpa paywall).
export const config = { runtime: 'nodejs' };

const FINE = JSON.stringify({ code: 0 });
const OK = (data) => ({ code: 0, data });
const FAIL = (message, extra = {}) => ({ code: 1, message, ...extra });

const FAKE_USER = {
  id: 'local-player',
  name: 'Player',
  email: 'player@localhost',
  image: null,
  createdAt: '2025-01-01T00:00:00.000Z',
};

// State in-memory per instance warm (cukup untuk parity furnish; cold start balik ke default)
const state = { equipped: [{ skinId: 'rgx' }], owned: new Set(['rgx']) };

async function readBody(req) {
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function handler(req, res) {
  const url = new URL(req.url, 'http://local');
  const p = url.pathname.replace(/\/+$/, '') || '/api';
  const json = (status, obj) => {
    res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(typeof obj === 'string' ? obj : JSON.stringify(obj));
  };

  if (p === '/api/config/public') return json(200, OK({}));
  if (p === '/api/user/permissions') return json(200, OK({}));
  if (p === '/api/user/membership')
    return json(200, OK({ isMember: true, plan: 'local', currentPeriodEnd: null, canceledEndAt: null }));
  if (p === '/api/auth/get-session') {
    return json(200, {
      user: FAKE_USER,
      session: { userId: FAKE_USER.id, expires: '2099-01-01T00:00:00.000Z' },
    });
  }
  if (p === '/api/auth/token') return json(401, { error: 'offline' });
  // Buka katalog berdarahkan fallback milik client (memiliki seluruh skin + harga)
  if (p === '/api/game/skin-catalog') return json(200, { code: -1, message: 'offline' });
  if (p === '/api/leaderboard') return json(200, OK({ entries: [], modes: [], nextUpdateAt: null }));
  if (p === '/api/user/sp') {
    return json(200, OK({
      equipped: state.equipped,
      owned: [...state.owned],
      wallet: { balance: 9999999999 },
      membership: { isMember: true, plan: 'local', autoRenew: false },
    }));
  }
  if (p === '/api/user/sp/skins/equip') {
    const body = await readBody(req);
    const skinId = String(body?.skinId || '');
    if (!skinId) return json(200, FAIL('skinId required'));
    state.equipped = [{ skinId }];
    state.owned.add(skinId);
    return json(200, OK({ ok: true, equipped: state.equipped }));
  }
  if (p === '/api/user/sp/skins/purchase') {
    const body = await readBody(req);
    const skinId = String(body?.skinId || '');
    if (!skinId) return json(200, FAIL('skinId required'));
    state.owned.add(skinId);
    state.equipped = [{ skinId }];
    return json(200, OK({ ok: true, owned: [...state.owned] }));
  }
  if (p === '/api/user/sp/transactions')
    return json(200, OK({ items: [], total: 0, page: 1, pageSize: 20 }));
  if (p === '/api/user/sp/training-sessions') return json(200, OK({ id: `local-${Date.now()}` }));
  if (p === '/api/user/sp/daily-login') return json(200, OK({ claimed: false, reward: 0 }));
  if (p.startsWith('/api/user/aim-trainer/training-records')) {
    if (req.method === 'GET') return json(200, OK({ items: [], total: 0 }));
    return json(200, OK({}));
  }
  if (p === '/api/user/aim-trainer/best-scores') return json(200, OK([]));
  // Unknown -> envelope code:1 seperti di localhost (dibolehkan fallback client)
  return json(200, FAIL('offline', { path: p }));
}

export default handler;
