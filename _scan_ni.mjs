import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const i = t.indexOf('spBalance');
console.log('first spBalance @', i);
console.log(t.slice(i - 200, i + 1500).replace(/\n/g, ' '));
