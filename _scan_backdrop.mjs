import fs from 'node:fs';
for (const f of fs.readdirSync('assets')) {
  if (!f.endsWith('.js')) continue;
  const t = fs.readFileSync('assets/' + f, 'utf8');
  const hits = [];
  for (const k of ['enemies/', 'map-ascent', '<video', 'createElement(`video', 'createElement("video', '.mp4', 'requestAnimationFrame),'])
    if (t.includes(k)) hits.push(k);
  if (hits.length) console.log(f.padEnd(36), hits.join(','));
}
