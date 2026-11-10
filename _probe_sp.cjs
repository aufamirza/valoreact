// Map which api helper each /api/user/sp call site uses
const fs = require('fs');
const t = fs.readFileSync('assets/index-C0hdXSfM.js', 'utf8');
// import statements that reference client-CHaFmaA-.js
for (const m of t.matchAll(/import\{([^}]*)\}from[`'"]\.?\/?client-CHaFmaA-\.js[`'"]/g)) {
  console.log('IMPORT:', m[1]);
}
const xt = t.indexOf('(`/api/user/membership`)');
console.log('membership ctx:', t.slice(Math.max(0, xt - 150), xt + 250));
// find the sp query: search 'api/user/sp'
let i = t.indexOf('/api/user/sp`');
console.log('sp idx:', i);
if (i < 0) i = t.indexOf('/api/user/sp');
console.log(t.slice(Math.max(0, i - 400), i + 500));
