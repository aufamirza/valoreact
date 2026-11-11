import { readFileSync } from 'node:fs';
const t = readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
// Ni is referenced as Ni,{isEmbedded..., spBalance:L.data?...}. Find Ni definition by scanning for patterns like "function Ni" or "Ni=" assignments.
for (const m of t.matchAll(/(?:function Ni\(|var Ni=|,Ni=| Ni\()(.{0,60})/g)) {
  console.log('Ni ref @', m.index, '::', t.slice(Math.max(0, m.index - 60), m.index + 120).replace(/\n/g, ' '));
}
