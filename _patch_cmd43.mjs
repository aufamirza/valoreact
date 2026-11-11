import { readFileSync, writeFileSync } from 'node:fs';
const f = 'assets/routes-CMD43i4T.js';
let t = readFileSync(f, 'utf8');
const before = t;
t = t.split('M.price===0?xt():`${M.price} SP`').join('M.price===0?xt():xt()');
writeFileSync(f, t);
console.log('changed:', before !== t, 'remaining SP price refs:', t.includes('`${M.price} SP`'));
