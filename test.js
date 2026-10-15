// node test.js — rule unit tests + solver verification of every shipped level + endless sample
const WR=require('./logic.js'),assert=require('assert');global.window={};require('./levels.js');const SH=window.SHIPPED;
// exposure: only first stitch along a line of sight is pullable
let g=['R','B',0,0];assert.equal(WR.target(g,2,2,0),0);assert.equal(WR.lap(g.slice(),2,2,'B',5),4);
g=['R','B','R','R'];const h=g.slice();assert.equal(WR.lap(h,2,2,'B',1),0);assert.equal(h[1],0);
assert.equal(WR.beltLen(10,12),44);
let fails=0;SH.forEach((s,i)=>{const {W,H,g}=WR.parse(WR.PICTURES[s.pic],false);
 const cnt={},sup={};g.forEach(c=>c&&(cnt[c]=(cnt[c]||0)+1));s.lanes.flat().forEach(r=>sup[r.c]=(sup[r.c]||0)+r.n);assert.deepEqual(cnt,sup,'supply matches picture '+s.pic);
 const lv={W,H,g,lanes:s.lanes,rack:s.rack},r=WR.solve(lv,500000),rp=r.ok&&WR.replay(lv,r.path);if(!r.ok||!rp)fails++;const sz=s.lanes.flat().map(x=>x.n);
 console.log(String(i+1).padStart(2),WR.PICTURES[s.pic][0].padEnd(12),W+'x'+H,'reels',s.lanes.flat().length,'stitches',g.filter(Boolean).length,'dock',s.rack,'sizes',Math.min(...sz)+'-'+Math.max(...sz),'winnable',r.ok,'realtimeReplay',rp,'nodes',r.nodes,'casualWin',Math.round(s.winRate*100)+'%')});
assert.equal(new Set(SH.map(s=>s.pic)).size,SH.length,'distinct pictures');
for(const i of [20,27,45]){const lv=WR.makeLevel(i,{tries:10,trials:16,limit:20000});assert(lv,'endless '+i);console.log('endless',i+1,WR.PICTURES[i%20][0],'reels',lv.lanes.flat().length,'ok')}
assert(SH.every(s=>s.lanes.flat().length>=20),'>=20 reels');
// one lap only: a reel that can't finish docks after exactly PER px
{const lv={W:3,H:3,g:['R','B','R',0,0,0,0,0,0],lanes:[[{c:'B',n:5}],[],[],[]],rack:5},sim=new WR.Sim(lv);sim.send('l0');let t=0;while(!sim.rack[0]&&t<2000){sim.tick(1/120);t++}assert(sim.rack[0]&&sim.rack[0].n===4,'docked after one lap');assert(Math.abs(t/120*sim.speed-sim.PER)<3,'exactly one lap')}
// concurrent same-colour reels: stitch goes to whichever reaches first; total conserved
{const lv={W:2,H:1,g:['R','R'],lanes:[[{c:'R',n:1}],[{c:'R',n:1}],[],[]],rack:5},sim=new WR.Sim(lv);sim.send('l0');sim.send('l1');for(let i=0;i<4000&&sim.state==='play';i++)sim.tick(1/120);assert.equal(sim.state,'won')}assert.equal(fails,0);console.log('ALL PASS');
