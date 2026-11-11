import { readFileSync } from 'node:fs';
const t = readFileSync('assets/coach-recording-status-D_DcydMW.js', 'utf8');
const ids = [...new Set([...t.matchAll(/id:`([\w-]+)`/g)].map(m => m[1]))];
console.log('count', ids.length);
console.log(ids.join(','));
