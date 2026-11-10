// Verify every local asset referenced by cached trainer pages exists on disk
const fs = require('fs');
const path = require('path');
const files = fs.readdirSync('_pages').filter(f => /trainer|challenge|training|games/.test(f));
let missing = new Set(), ok = 0;
for (const f of files) {
  const t = fs.readFileSync(path.join('_pages', f), 'utf8');
  for (const m of t.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    const p = m[1].split('?')[0];
    if (fs.existsSync(p.replace(/\//g, path.sep))) ok++; else missing.add(p);
  }
}
console.log('ok refs:', ok);
console.log('missing refs:', [...missing].slice(0, 60).join('\n') || '(none)');
console.log('rgx ui exists:', fs.existsSync('assets/skins/rgx/ui.png'));
const deps = ['assets/_slug-Dqzh4z3t.js', 'assets/reaction-test-DGv5E8mp.js', 'assets/flash-dodge-CjFQkHO_.js', 'assets/coach-recording-status-D_DcydMW.js', 'assets/trainer-comments-BX1R8Z61.js', 'assets/index-tMVGJeld.js', 'assets/messages-CC6DXzhU.js'];
for (const d of deps) console.log(d, fs.existsSync(d));
