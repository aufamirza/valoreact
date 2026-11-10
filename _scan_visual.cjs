const fs = require('fs');
const t = fs.readFileSync('assets/routes-CMD43i4T.js', 'utf8');
const kws = ['wall', 'inlineStyle', 'translate3d', 'scale(', 'perspective', 'rotateY', 'vmin', 'vw', 'zIndex', 'background-image', 'svg'];
const lines = t.split('\n');
lines.forEach((l, i) => {
  for (const kw of kws) if (l.includes(kw)) { console.log(kw, '-> line', i + 1); break; }
});
