// Bandingkan hash semua file statis lokal vs yang disajikan prod.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const PROD = 'https://valoreaction.vercel.app';
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = dir + '/' + f;
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p, out).slice(out.length));
    else out.push(p);
  }
  return out;
}
const files = walk('assets').concat(walk('js')).filter(p => !/\.map$/.test(p));
const mismatches = [];
const ok = [];
for (const p of files) {
  const url = PROD + '/' + p;
  try {
    const res = await fetch(url);
    if (!res.ok) { mismatches.push({ p, status: res.status }); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const local = readFileSync(p);
    const h1 = createHash('sha1').update(buf).digest('hex');
    const h2 = createHash('sha1').update(local).digest('hex');
    if (h1 !== h2) mismatches.push({ p, status: 200, prodBytes: buf.length, localBytes: local.length, diff: true });
    else ok.push(p);
  } catch (e) {
    mismatches.push({ p, error: e.message });
  }
}
console.log('total', files.length, 'identical', ok.length, 'mismatch', mismatches.length);
for (const m of mismatches.slice(0, 40)) console.log('MISMATCH', JSON.stringify(m));
