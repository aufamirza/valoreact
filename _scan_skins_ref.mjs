import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const hits = [...t.matchAll(/`\bskins\b`/g)].map(m => m.index);
console.log('`skins` refs:', hits.length);
for (const i of hits.slice(0, 12)) {
  console.log('--- @', i, '::', t.slice(Math.max(0, i - 220), i + 220).replace(/\n/g, ' '));
}
