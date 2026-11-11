// 1) Ganti referensi CSS lama -> globals-NO-SP.css di semua entrypoint HTML
// 2) Patch string harga di bundle routes: "price SP" -> label free
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

let changedHtml = 0;
for (const p of ['index.html', '_live_challenge.html', ...readdirSync('_pages').map(f => '_pages/' + f)]) {
  let t;
  try { t = readFileSync(p, 'utf8'); } catch { continue; }
  const out = t.replaceAll('globals-C33ZCAck.css', 'globals-NO-SP.css');
  if (out !== t) { writeFileSync(p, out); changedHtml++; }
}
console.log('html patched:', changedHtml);

// Patch bundle routes (assets + js copies)
const patches = [
  // badge harga di kartu: children:[e.price,` SP`] -> children:`FREE`
  [',children:[e.price,` SP`]', ',children:`FREE`'],
  // line harga di preview: j.price===0?qe():`${j.price} SP` -> j.price===0?qe():qe()
  ['j.price===0?qe():`${j.price} SP`', 'j.price===0?qe():qe()'],
];
for (const f of ['assets/routes-ClRfvbdM.js', 'assets/routes-CMD43i4T.js']) {
  let t = readFileSync(f, 'utf8');
  let hits = 0;
  for (const [from, to] of patches) {
    const n = t.split(from).length - 1;
    if (n) { t = t.split(from).join(to); hits += n; }
  }
  writeFileSync(f, t);
  console.log(f, 'patched refs:', hits);
}
