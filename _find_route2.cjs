// Where is the second-enemy / sage used, and confirm homepage route usage
const fs = require('fs');
const t = fs.readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const usage = (needle) => { let out = [], i = t.indexOf(needle); while (i >= 0) { out.push(i); i = t.indexOf(needle, i + 1); } return out; };
console.log('sage idx:', usage('sage'));
const i = t.indexOf('Ci=[`chamber`');
console.log(t.slice(i - 500, i + 300));
// enemy selector: find `Math.random` picks
const k = t.indexOf('enemy-second');
console.log('\nenemy-second ctx:', t.slice(k - 800, k + 100));
