import { readFileSync } from 'node:fs';
for (const f of ['assets/skin-catalog-DlXfLO30.js', 'assets/routes-ClRfvbdM.js']) {
  const t = readFileSync(f, 'utf8');
  console.log('===', f);
  let n = 0;
  for (const m of t.matchAll(/owned/g)) {
    if (n++ > 8) break;
    console.log('--- @', m.index);
    console.log(t.slice(Math.max(0, m.index - 200), m.index + 240).replace(/\n/g, ' '));
  }
}
