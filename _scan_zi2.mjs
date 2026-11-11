import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const zi = t.indexOf('function zi({');
const seg = t.slice(zi, zi + 14000);
const probes = [
  ['skin-wallet|wallet', /skin[-\w]*wallet[\w-]*/g],
  ['skin-balance', /skin[-\w]*balance[\w-]*/g],
  ['toLocaleString', () => null],
  ['sp-label|topbar', /sp[-\w]*balance[\w-]*/g],
];
for (const [name, rx] of probes) {
  if (rx) {
    for (const m of seg.matchAll(rx)) {
      console.log(name, '@', zi + m.index, '::', seg.slice(Math.max(0, m.index - 160), m.index + 200).replace(/\n/g, ' '));
    }
  } else {
    for (const m of seg.matchAll(/toLocaleString/g)) {
      console.log(name, '@', zi + m.index, '::', seg.slice(Math.max(0, m.index - 160), m.index + 200).replace(/\n/g, ' '));
    }
  }
}
