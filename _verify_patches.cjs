// Verify exact patch targets exist in the minified chunks (print count of matches)
const fs = require('fs');

const patches = [
  {
    file: 'assets/flash-dodge-CjFQkHO_.js',
    keys: [
      'for(let e=-12;e<=12;e+=2)v([e,-6,16],[e,6,16]),v([e,-6,2],[e,-6,16]);for(let e=-6;e<=6;e+=2)v([-12,e,16],[12,e,16]);for(let e=2;e<=16;e+=2)v([-12,-6,e],[12,-6,e]),v([-12,-6,e],[-12,6,e]),v([12,-6,e],[12,6,e]);v([-12,6,16],[12,6,16],`#72d6cf`),v([-12,-6,16],[12,-6,16],`#72d6cf`)',
      'if(n){let r=d.current*h/n.depth;t.fillStyle=l.tracking&&f.current&&b===e.id?`#72d6cf`:`#ee735c`,t.shadowColor=`#ee735c`,t.shadowBlur=14,t.beginPath(),t.arc(n.x,n.y,r,0,Math.PI*2),t.fill(),t.shadowBlur=0,t.strokeStyle=`#ffe6cf`,t.lineWidth=1.5,t.stroke(),t.fillStyle=`#fff3dc`,t.beginPath(),t.arc(n.x,n.y,r*.22,0,Math.PI*2),t.fill()}',
    ],
  },
  {
    file: 'assets/flash-dodge-DFlYjv5K.js',
    keys: [
      'for(let e=-12;e<=12;e+=2)v([e,-6,16],[e,6,16]),v([e,-6,2],[e,-6,16]);for(let e=-6;e<=6;e+=2)v([-12,e,16],[12,e,16]);for(let e=2;e<=16;e+=2)v([-12,-6,e],[12,-6,e]),v([-12,-6,e],[-12,6,e]),v([12,-6,e],[12,6,e]);v([-12,6,16],[12,6,16],`#72d6cf`),v([-12,-6,16],[12,-6,16],`#72d6cf`)',
      'if(n){let r=d.current*h/n.depth;t.fillStyle=l.tracking&&f.current&&b===e.id?`#72d6cf`:`#ee735c`,t.shadowColor=`#ee735c`,t.shadowBlur=14,t.beginPath(),t.arc(n.x,n.y,r,0,Math.PI*2),t.fill(),t.shadowBlur=0,t.strokeStyle=`#ffe6cf`,t.lineWidth=1.5,t.stroke(),t.fillStyle=`#fff3dc`,t.beginPath(),t.arc(n.x,n.y,r*.22,0,Math.PI*2),t.fill()}',
    ],
  },
  {
    file: 'assets/reaction-test-DGv5E8mp.js',
    keys: [
      'I.current={x:r,y:i},Z.current=[{id:++Gt.current,x:r,y:i,...n,born:s}]}',
    ],
  },
];

for (const p of patches) {
  const t = fs.readFileSync(p.file, 'utf8');
  console.log('####', p.file);
  for (const k of p.keys) {
    const c = t.split(k).length - 1;
    console.log('  count', c, '::', k.slice(0, 80) + '...');
  }
}
