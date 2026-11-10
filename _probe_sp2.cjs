// Locate every consumer of /api/user/sp and /api/user/permissions (+ which client)
const fs = require('fs');
for (const f of fs.readdirSync('assets')) {
  if (!f.endsWith('.js')) continue;
  const t = fs.readFileSync('assets/' + f, 'utf8');
  for (const needle of ['/api/user/sp`', '/api/user/sp/', '/api/user/permissions`', '/api/game/skin-catalog`']) {
    let i = t.indexOf(needle);
    if (i >= 0) {
      console.log('== ' + f + ' ' + needle + ' ==');
      console.log(t.slice(Math.max(0, i - 260), i + 260));
      console.log();
    }
  }
}
