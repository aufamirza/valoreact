const t = require('fs').readFileSync('_live_challenge.html', 'utf8');
console.log('len', t.length);
const m = [...t.matchAll(/[\w.\/-]*\.js/g)].map(x => x[0]);
console.log([...new Set(m)].slice(0, 40).join('\n'));
console.log('--- random excerpt ---');
console.log(t.slice(0, 600));
