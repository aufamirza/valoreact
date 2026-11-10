const fs = require('fs');
const t = fs.readFileSync('_pages/trainers_challenge.html', 'utf8');
const ms = [...t.matchAll(/src="(\/assets\/[^"]+)"/g)].map(m => m[1]);
console.log('src matches:', ms.length, ms.slice(0, 8));
const raw = [...new Set([...t.matchAll(/\/assets\/[\w./-]+/g)].map(m => m[0]))];
console.log('raw asset refs:', raw.length);
let miss = [];
for (const p of raw) if (!fs.existsSync(p.replace(new RegExp('/', 'g'), '\\'))) miss.push(p);
console.log('missing on disk:', miss.length ? miss : '(none)');
