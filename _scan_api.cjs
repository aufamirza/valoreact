const fs = require('fs'), path = require('path');
const out = [];
for (const f of fs.readdirSync('assets').filter(x => x.endsWith('.js'))) {
  const t = fs.readFileSync(path.join('assets', f), 'utf8');
  for (const kw of ['/api/user/sp', 'sp/equip', 'skin-catalog', '/api/user/game']) {
    let i = t.indexOf(kw);
    if (i >= 0) {
      out.push('++ ' + f + ' :: ' + kw);
      out.push(t.slice(Math.max(0, i - 260), i + 300).replace(/\n/g, ' '));
    }
  }
}
fs.writeFileSync('_skin_api.txt', out.join('\n\n'));
console.log('written _skin_api.txt', out.length);
