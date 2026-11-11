import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const i = t.indexOf('function Ni(');
console.log(t.slice(i, i + 1200).replace(/\n/g, ' '));
