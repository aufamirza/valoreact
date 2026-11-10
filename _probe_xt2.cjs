const fs = require('fs');
const t = fs.readFileSync('assets/index-C0hdXSfM.js', 'utf8');
for (const m of t.matchAll(/import\{([^}]+)\}from[`'"]\.\/api-client[^/]*\.js[`'"]/g)) console.log('IMPORT api-client:', m[1]);
for (const m of t.matchAll(/import\{([^}]+)\}from[`'"]\.\/client-[^/]*\.js[`'"]/g)) console.log('IMPORT client:', m[1]);
// find what xt is bound to
const i = t.indexOf('queryFn:()=>xt(`/api/user/membership`)');
const seg = t.slice(Math.max(0, i - 8000), i);
const defs = [...seg.matchAll(/xt=(?:async )?\(?e\)?=>|function xt\(/g)];
console.log('xt defs near:', defs.map(d => seg.slice(d.index - 100, d.index + 200)).slice(-2));
