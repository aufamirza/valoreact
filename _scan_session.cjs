const fs = require('fs');
for (const f of ['assets/api-client-DJFTeBhA.js', 'assets/routes-CMD43i4T.js', 'assets/flash-dodge-CjFQkHO_.js', 'assets/app-layout-D0wLoO-b.js']) {
  const t = fs.readFileSync(f, 'utf8');
  console.log('\n##########', f);
  for (const kw of ['get-session', ['`user`', 'user/sp'], 'sp/equip', 'skin-catalog', 'owned', 'equipped', 'isMember']) {
    const k = Array.isArray(kw) ? kw[0] : kw;
    let i = -1, c = 0;
    while ((i = t.indexOf(k, i + 1)) >= 0 && c < 4) {
      console.log('-- [' + k + '] @', i, ' :: ', t.slice(Math.max(0, i - 200), i + 260).replace(/\s+/g, ' '));
      c++;
    }
  }
}
