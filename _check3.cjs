const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();
const check = (p) => fs.existsSync(path.join(ROOT, ...p.split('/')));
const files = fs.readdirSync('_pages').filter(f => f.endsWith('.html'));
const allMissing = {};
for (const f of files) {
  const t = fs.readFileSync(path.join('_pages', f), 'utf8');
  for (const m of new Set([...t.matchAll(/\/assets\/[\w./-]+/g)].map(x => x[0]))) {
    if (!check(m)) (allMissing[m] ??= []).push(f);
  }
}
const keys = Object.keys(allMissing);
console.log('missing ref-count:', keys.length);
keys.slice(0, 40).forEach(k => console.log(k));
console.log('--- rgx ui:', check('/assets/skins/rgx/ui.png'));
console.log('--- globals css:', check('/assets/globals-C33ZCAck.css'));
