import { readFileSync } from 'node:fs';
for (const f of ['assets/routes-ClRfvbdM.js', 'assets/index-tMVGJeld.js']) {
  const t = readFileSync(f, 'utf8');
  const keys = [...new Set([...t.matchAll(/localStorage\.(?:get|set)Item\(`([\w.-]+)`/g)].map(m => m[1]))];
  console.log(f, '->', keys.join(' '));
}
