import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const zi = t.indexOf('function zi({');
const seg = t.slice(zi, zi + 13000);
// tulis segmen ke file agar bisa dibaca manusia
import { writeFileSync } from 'node:fs';
writeFileSync('_zi_segment.txt', seg.replace(/,(?=[A-Za-z0-9])/, ',\n'));
console.log('zi @', zi, 'len', seg.length);
// cari pemakaian param r (spBalance) dalam fungsi
console.log([...seg.matchAll(/[(,]r[,)]/g)].length, 'r refs');
const fr = seg.indexOf('r,');
console.log(seg.slice(0, 400));
