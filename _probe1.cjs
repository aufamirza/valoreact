// Probe flash-dodge engine: find start/pause/pointer-lock/spawn gating
const fs = require('fs');
const T = fs.readFileSync('assets/flash-dodge-CjFQkHO_.js', 'utf8');
const kws = ['pointerLock', '`active`', '`paused`', '`ready`', '`idle`', 'roundStarted', 'await new Promise', 'new Audio', 'loadSkin', 'Image(', 'onError', 'visibilitychange'];
for (const kw of kws) {
  let i = -1, c = 0;
  while ((i = T.indexOf(kw, i + 1)) >= 0 && c < 3) {
    console.log('== [' + kw + '] @', i);
    console.log(T.slice(Math.max(0, i - 220), i + 260).replace(/\n/g, ' '));
    c++;
  }
}
