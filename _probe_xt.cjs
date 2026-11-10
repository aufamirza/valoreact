// find local definition of xt in index chunk + leaderboard consumer helper
const fs = require('fs');
const t = fs.readFileSync('assets/index-C0hdXSfM.js', 'utf8');
const m = [...t.matchAll(/xt\s*=/g)].map(x => x.index);
for (const i of m.slice(0, 6)) console.log('xt= @', i, ':', t.slice(Math.max(0, i - 120), i + 160), '\n---');
// leaderboard usage in routes chunk
const r = fs.readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
let j = r.indexOf('/api/leaderboard');
console.log('leaderboard ctx:', r.slice(Math.max(0, j - 240), j + 240));
const k = r.indexOf('/api/user/aim-trainer/best-scores');
console.log('best-scores ctx:', r.slice(Math.max(0, k - 200), k + 200));
