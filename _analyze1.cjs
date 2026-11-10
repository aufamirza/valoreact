// Extract context around keywords from trainer asset chunks
const fs = require('fs');
const path = require('path');

const files = [
  'assets/_slug-Dqzh4z3t.js',
  'assets/_slug-CaZ_XNPj.js',
  'assets/flash-dodge-CjFQkHO_.js',
  'assets/flash-dodge-DFlYjv5K.js',
];

const kws = process.argv.slice(2);
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const T = fs.readFileSync(f, 'utf8');
  console.log('\n########## ' + f + ' (' + T.length + ' bytes)');
  for (const kw of kws) {
    let i = -1, c = 0;
    while ((i = T.indexOf(kw, i + 1)) >= 0 && c < 6) {
      console.log('\n== [' + kw + '] @', i);
      console.log(T.slice(Math.max(0, i - 260), i + 340).replace(/\n/g, ' '));
      c++;
    }
  }
}
