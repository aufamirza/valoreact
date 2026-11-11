import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-CMD43i4T.js', 'utf8');
for (const pat of [/children:\[e\.price/g, /price===0\?/g, /` SP`/g]) {
  for (const m of t.matchAll(pat)) {
    console.log('--- @', m.index, '::', t.slice(Math.max(0, m.index - 150), m.index + 180).replace(/\n/g, ' '));
  }
}
