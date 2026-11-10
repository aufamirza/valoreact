// Apply local gameplay patches to minified chunks (backsups exist in _orig_backup/)
const fs = require('fs');

const WALL_OLD = 'for(let e=-12;e<=12;e+=2)v([e,-6,16],[e,6,16]),v([e,-6,2],[e,-6,16]);for(let e=-6;e<=6;e+=2)v([-12,e,16],[12,e,16]);for(let e=2;e<=16;e+=2)v([-12,-6,e],[12,-6,e]),v([-12,-6,e],[-12,6,e]),v([12,-6,e],[12,6,e]);v([-12,6,16],[12,6,16],`#72d6cf`),v([-12,-6,16],[12,-6,16],`#72d6cf`)';
const WALL_NEW = 'for(let e=-5;e<=5;e+=2)v([e,-6,16],[e,6,16]),v([e,-6,2],[e,-6,16]);for(let e=-6;e<=6;e+=2)v([-5,e,16],[5,e,16]);for(let e=2;e<=16;e+=2)v([-5,-6,e],[5,-6,e]),v([-5,-6,e],[-5,6,e]),v([5,-6,e],[5,6,e]);v([-5,6,16],[5,6,16],`#72d6cf`),v([-5,-6,16],[5,-6,16],`#72d6cf`)';

const TGT_OLD = 'if(n){let r=d.current*h/n.depth;t.fillStyle=l.tracking&&f.current&&b===e.id?`#72d6cf`:`#ee735c`,t.shadowColor=`#ee735c`,t.shadowBlur=14,t.beginPath(),t.arc(n.x,n.y,r,0,Math.PI*2),t.fill(),t.shadowBlur=0,t.strokeStyle=`#ffe6cf`,t.lineWidth=1.5,t.stroke(),t.fillStyle=`#fff3dc`,t.beginPath(),t.arc(n.x,n.y,r*.22,0,Math.PI*2),t.fill()}';
const TGT_NEW = 'if(n){let r=d.current*h/n.depth,cf=l.tracking&&f.current&&b===e.id?`#72d6cf`:`#ee735c`;t.shadowColor=cf,t.shadowBlur=10,t.fillStyle=cf,t.beginPath(),t.ellipse(n.x,n.y+r*.22,r*.44,r*.62,0,0,Math.PI*2),t.fill(),t.beginPath(),t.arc(n.x,n.y-r*.52,r*.3,0,Math.PI*2),t.fill(),t.shadowBlur=0,t.strokeStyle=`#ffe6cf`,t.lineWidth=1.5,t.beginPath(),t.ellipse(n.x,n.y+r*.22,r*.44,r*.62,0,0,Math.PI*2),t.stroke(),t.beginPath(),t.arc(n.x,n.y-r*.52,r*.3,0,Math.PI*2),t.stroke(),t.fillStyle=`#fff3dc`,t.beginPath(),t.arc(n.x,n.y-r*.52,r*.09,0,Math.PI*2),t.fill()}';

const SPAWN_OLD = 'I.current={x:r,y:i},Z.current=[{id:++Gt.current,x:r,y:i,...n,born:s}]}';
const SPAWN_NEW = 'I.current={x:r,y:i},Z.current=L===`micro`||R?[{id:++Gt.current,x:r,y:i,...n,born:s}]:[-16,16,0].map(vh=>({id:++Gt.current,x:It(r+vh,18,82),y:It(i+(vh<0?5:vh>0?-5:0),22,78),...(vh?{dx:vh>0?.15:-.15,dy:0,targetDx:vh>0?.2:-.2,targetDy:0,phase:0,wobble:0,nextTurn:1/0}:n),born:s}))}';

const jobs = [
  ['assets/flash-dodge-CjFQkHO_.js', [['wall', WALL_OLD, WALL_NEW], ['target-draw', TGT_OLD, TGT_NEW]]],
  ['assets/flash-dodge-DFlYjv5K.js', [['wall', WALL_OLD, WALL_NEW], ['target-draw', TGT_OLD, TGT_NEW]]],
  ['assets/reaction-test-DGv5E8mp.js', [['spawn-multi', SPAWN_OLD, SPAWN_NEW]]],
];

for (const [file, reps] of jobs) {
  let t = fs.readFileSync(file, 'utf8');
  for (const [name, oldS, newS] of reps) {
    const c = t.split(oldS).length - 1;
    if (c !== 1) { console.error('ABORT', file, name, 'matches=', c); process.exit(1); }
    t = t.replace(oldS, newS);
    console.log('patched', file, name);
  }
  fs.writeFileSync(file, t);
}
console.log('done');
