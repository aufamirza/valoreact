import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const i = t.indexOf('skin-sp-balance-badge');
// ambil 1200 chars sebelum badge untuk konteks header modal
console.log('=== BEFORE ===');
console.log(t.slice(i - 1200, i).replace(/\n/g, ' '));
console.log('=== guide link def ===');
const j = t.indexOf('skin-sp-guide-link');
console.log(t.slice(j - 600, j + 50).replace(/\n/g, ' '));
