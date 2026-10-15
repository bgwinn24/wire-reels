// node test.js — rule unit tests + solver verification of every shipped level + endless sample
const WR=require('./logic.js'),assert=require('assert');global.window={};require('./levels.js');const SH=window.SHIPPED;
// exposure: only first stitch along a line of sight is pullable
let g=['R','B',0,0];assert.equal(WR.target(g,2,2,0),0);assert.equal(WR.lap(g.slice(),2,2,'B',5),4);
g=['R','B','R','R'];const h=g.slice();assert.equal(WR.lap(h,2,2,'B',1),0);assert.equal(h[1],0);
assert.equal(WR.beltLen(10,12),44);
let fails=0;SH.forEach((s,i)=>{const p=WR.PICTURES[s.pic],{W,H,g}=WR.parse(p[1],false,p[2]);
 const cnt={},sup={};g.forEach(c=>c&&(cnt[c]=(cnt[c]||0)+1));s.lanes.flat().forEach(r=>sup[r.c]=(sup[r.c]||0)+r.n);assert.deepEqual(cnt,sup,'supply matches picture '+s.name);
 const r=WR.solve({W,H,g,lanes:s.lanes},500000);if(!r.ok)fails++;
 console.log(String(i+1).padStart(2),s.name.padEnd(16),W+'x'+H,'reels',s.lanes.flat().length,'winnable',r.ok,'nodes',r.nodes,'randomWin',Math.round(s.winRate*100)+'%')});
assert.equal(new Set(SH.map(s=>s.pic)).size,SH.length,'distinct pictures');
for(const i of [20,27,45]){const lv=WR.makeLevel(i,{tries:10,trials:16,limit:20000});assert(lv,'endless '+i);console.log('endless',i+1,lv.name,'ok')}
assert.equal(fails,0);console.log('ALL PASS');
