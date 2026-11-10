const fs = require('fs');
const t = fs.readFileSync('_dump_routes.txt', 'utf8');
const lines = t.split('\n');
for (const kw of ['Equip', 'equip', 'purchase', 'unnecessary', 'Sign in', 'sign-in', '/api/user/skins', '/api/user/sp/equip', 'Buy', 'search transforming']) {
  lines.forEach((l, i) => { if (l.includes(kw)) console.log(kw, '@line', i + 1); });
}
