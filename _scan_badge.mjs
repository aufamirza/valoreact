import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const i = t.indexOf('skin-sp-balance-badge');
console.log(t.slice(i - 100, i + 900).replace(/\n/g, ' '));
