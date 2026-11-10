// Find which route/page the enemy-arena belongs to
const fs = require('fs');
const t = fs.readFileSync('assets/routes-ClRfvbdM.js', 'utf8');
const i = t.indexOf('/assets/enemies/');
const seg = t.slice(Math.max(0, i - 15000), i);
// look for route paths and game names in the surrounding code
const routes = [...seg.matchAll(/\(?\/?[\w-]+\/[\w-]+/g)].map(m => m[0]);
console.log('route-ish strings near enemies:');
console.log([...new Set(routes)].slice(-25).join('\n'));
const names = [...seg.matchAll(/`([A-Za-z][\w &]{3,30})`/g)].map(m => m[1]);
console.log('\nstrings near:', [...new Set(names)].slice(-40).join(' | '));
// route table check: where does this component register
const j = t.lastIndexOf('arena', i);
console.log('\nlast arena occ:', j, t.slice(j - 120, j + 120));
