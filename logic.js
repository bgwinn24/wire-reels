// Core rules shared by game + solver. Belt positions: top L->R, right T->B, bottom R->L, left B->T.
(function(root){
const P=typeof PICTURES!=='undefined'?{PICTURES,PALETTE}:require('./pictures.js');
const RACK=5,LANES=4;
function inPoly(x,y,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[a,b]=P[i],[e,f]=P[j];if((b>y)!==(f>y)&&x<(e-a)*(y-b)/(f-b)+a)c=!c}return c}
function hit(sh,x,y){const t=sh[0],a=sh.slice(2);switch(t){case'r':return x>=a[0]&&x<a[2]&&y>=a[1]&&y<a[3];case'c':return(x-a[0])**2+(y-a[1])**2<=a[2]**2;
 case'e':return((x-a[0])/a[2])**2+((y-a[1])/a[3])**2<=1;case'p':return inPoly(x,y,a[0]);
 case'l':{const[x0,y0,x1,y1,w]=a,dx=x1-x0,dy=y1-y0,t=Math.max(0,Math.min(1,((x-x0)*dx+(y-y0)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-x0-t*dx,y-y0-t*dy)<=w/2}}}
function parse(pic,mirror){const[,W0,H0,shapes]=pic,k=Math.min(1.25,25/Math.max(W0,H0)),W=Math.round(W0*k),H=Math.round(H0*k),g=new Array(W*H).fill(0);
 for(const sh of shapes)for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(hit(sh,(x+.5)/k,(y+.5)/k))g[y*W+(mirror?W-1-x:x)]=sh[1]==='.'?0:sh[1];return{W,H,g}}
function beltLen(W,H){return 2*W+2*H}
// first stitch seen from belt position p (index into g) or -1
function target(g,W,H,p){let x,y,dx,dy;
 if(p<W){x=p;y=0;dx=0;dy=1}else if(p<W+H){x=W-1;y=p-W;dx=-1;dy=0}
 else if(p<2*W+H){x=2*W+H-1-p;y=H-1;dx=0;dy=-1}else{x=0;y=2*W+2*H-1-p;dx=1;dy=0}
 while(x>=0&&y>=0&&x<W&&y<H){const i=y*W+x;if(g[i])return i;x+=dx;y+=dy}return -1}
// one full lap; mutates g; returns remaining count
function lap(g,W,H,color,n){const L=beltLen(W,H);for(let p=0;p<L&&n>0;p++){const t=target(g,W,H,p);if(t>=0&&g[t]===color){g[t]=0;n--}}return n}
function rng(s){s=s>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>17;s^=s<<5;s>>>=0;return s/4294967296}}
// moves from a state {g,lanes:[[{c,n}]],li:[idx],rack:[{c,n}]}
function moves(st,W,H){const m=[];st.lanes.forEach((l,i)=>{if(st.li[i]<l.length)m.push(['l',i])});
 st.rack.forEach((r,i)=>{const g=st.g.slice();if(lap(g,W,H,r.c,r.n)<r.n)m.push(['r',i])});return m}
function apply(st,W,H,mv){const g=st.g.slice(),li=st.li.slice(),rack=st.rack.slice();let reel;
 if(mv[0]==='l'){reel=st.lanes[mv[1]][li[mv[1]]];li[mv[1]]++}else{reel=rack.splice(mv[1],1)[0]}
 const left=lap(g,W,H,reel.c,reel.n);if(left>0){if(rack.length>=(st.rmax||RACK))return null;rack.push({c:reel.c,n:left})}
 return{g,lanes:st.lanes,li,rack,rmax:st.rmax,pulled:reel.n-left}}
const done=st=>!st.g.some(v=>v);
function key(st){return st.g.map(v=>v||'.').join('')+'|'+st.li.join(',')+'|'+st.rack.map(r=>r.c+r.n).sort().join(',')}
// DFS solver with memo; returns {ok,nodes,path}
function solve(lv,limit=300000){const{W,H}=lv,seen=new Set();let nodes=0;const path=[];
 const st0={g:lv.g.slice(),lanes:lv.lanes,li:lv.lanes.map(()=>0),rack:[],rmax:lv.rack||RACK};
 function dfs(st){if(done(st))return true;if(++nodes>limit)return false;const k=key(st);if(seen.has(k))return false;seen.add(k);
  const ch=[];for(const mv of moves(st,W,H)){const s=apply(st,W,H,mv);if(s)ch.push([s,mv])}
  ch.sort((a,b)=>(b[0].pulled-a[0].pulled)||(a[0].rack.length-b[0].rack.length));
  for(const[s,mv]of ch){path.push(mv);if(dfs(s))return true;path.pop()}return false}
 const ok=dfs(st0);return{ok,nodes,path:path.slice()}}
function randomWinRate(lv,trials,r){let w=0;for(let t=0;t<trials;t++){let st={g:lv.g.slice(),lanes:lv.lanes,li:lv.lanes.map(()=>0),rack:[],rmax:lv.rack||RACK};
 for(;;){if(done(st)){w++;break}const m=moves(st,lv.W,lv.H);if(!m.length)break;const nx=m.map(mv=>apply(st,lv.W,lv.H,mv)).filter(Boolean);if(!nx.length)break;const good=nx.filter(x=>x.pulled>0);const pool=good.length&&r()<0.6?good:nx;st=pool[Math.floor(r()*pool.length)];if(!st)break}}return w/trials}
// build supply lanes from picture colour counts
function build(pic,seed,diff,mirror,opts={}){const{W,H,g}=parse(pic,mirror),r=rng(seed*2654435761+7);
 const cnt={};g.forEach(c=>{if(c)cnt[c]=(cnt[c]||0)+1});
 const total=g.filter(Boolean).length,avg=total/opts.reels,reels=[];
 const CAPS=[4,6,8,10,12,14,16,18,20,24,28,32].filter(c=>c>=Math.max(4,avg*(.5+diff*.5))&&c<=avg*(1.6+diff));const caps=CAPS.length?CAPS:[Math.round(avg)];
 for(const c in cnt){let n=cnt[c];while(n>0){let sz=caps[Math.floor(Math.pow(r(),0.7)*caps.length)];if(sz>=n||n-sz<4)sz=n;reels.push({c,n:sz});n-=sz}}
 // easy order: colours roughly in the order they become reachable; shuffle more as diff rises
 const gg=g.slice(),order=[];for(let k=0;k<2000&&gg.some(v=>v);k++){const L=beltLen(W,H);for(let p=0;p<L;p++){const t=target(gg,W,H,p);if(t>=0){order.push(gg[t]);gg[t]=0;break}}}
 const firstSeen=c=>order.indexOf(c);const h=Math.min(1,diff*2.2);reels.forEach(x=>{const f=firstSeen(x.c)/order.length;x.k=f*(1-2*h)+r()*(0.15+Math.min(h,1-h)*0.8)});
 reels.sort((a,b)=>a.k-b.k);const lanes=[[],[],[],[]];reels.forEach((x,i)=>{const li=diff<0.2?i%LANES:Math.floor(r()*LANES);lanes[li].push({c:x.c,n:x.n})});
 return{name:pic[0],W,H,g,lanes,seed,diff}}
// pick, among seeds, a winnable layout whose random-play win rate is near the target
function makeLevel(idx,opts={}){const pics=P.PICTURES,np=pics.length,pic=pics[opts.pic!=null?opts.pic:idx%np],cycle=Math.floor(idx/np);
 const t=Math.min(1,idx/(np-1)),diff=Math.min(1,0.02+t*0.85+cycle*0.08),target=Math.max(0.03,0.95-t*0.9-cycle*0.05);
 const tries=opts.tries||24,r=rng(idx+99);let best=null;
 for(let s=1;s<=tries;s++){const lv=build(pic,idx*1000+s,diff,cycle%2===1,{reels:Math.round(22+t*42+cycle*4)});lv.rack=t<0.12?5:[5,4,3][s%3];if(lv.lanes.some(l=>!l.length))continue;
  const so=solve(lv,opts.limit||60000);if(!so.ok)continue;const wr=randomWinRate(lv,opts.trials||60,r);const sc=Math.abs(wr-target);
  if(!best||sc<best.sc){best={lv,sc,wr,nodes:so.nodes,moves:so.path.length}}if(sc<0.04)break}
 if(!best)return null;Object.assign(best.lv,{index:idx,winRate:best.wr,solverNodes:best.nodes,solutionMoves:best.moves,targetRate:target});return best.lv}
// ---- belt geometry (virtual 390x844 layout) ----
const G={BT:90,BB:424,BLx:28,BRx:362,CR:22,BOX:290,CX:195,CY:257};G.SA=G.BRx-G.BLx-2*G.CR;G.SB=G.BB-G.BT-2*G.CR;G.QA=Math.PI*G.CR/2;G.PER=2*G.SA+2*G.SB+4*G.QA;
function geo(W,H){const cs=Math.min(G.BOX/W,G.BOX/H),bx=G.CX-cs*W/2,by=G.CY-cs*H/2,{BT,BB,BLx,BRx,CR,SA,SB,QA}=G,sp=[];
 for(let p=0;p<beltLen(W,H);p++)sp.push(p<W?bx+(p+.5)*cs-(BLx+CR):p<W+H?SA+QA+by+(p-W+.5)*cs-(BT+CR):p<2*W+H?SA+SB+2*QA+(BRx-CR)-(bx+(2*W+H-1-p+.5)*cs):2*SA+SB+3*QA+(BB-CR)-(by+(2*W+2*H-1-p+.5)*cs));
 return{cs,bx,by,sp,PER:G.PER}}
function beltPt(s){const{BT,BB,BLx,BRx,CR,SA,SB,QA,PER}=G;s=((s%PER)+PER)%PER;const segs=[SA,QA,SB,QA,SA,QA,SB,QA],P2=Math.PI/2;
 const st=[[BLx+CR,BT,0],[BRx-CR,BT+CR,-P2],[BRx,BT+CR,P2],[BRx-CR,BB-CR,0],[BRx-CR,BB,Math.PI],[BLx+CR,BB-CR,P2],[BLx,BB-CR,-P2],[BLx+CR,BT+CR,Math.PI]];
 for(let i=0;i<8;i++){const len=segs[i];if(s<=len||i===7){const t=Math.min(s,len),[x,y,a]=st[i];if(i%2===0)return[x+Math.cos(a)*t,y+Math.sin(a)*t];const b=a+t/CR;return[x+Math.cos(b)*CR,y+Math.sin(b)*CR]}s-=len}}
// Sim: the single source of truth for play. Pulls happen the instant a reel crosses a row/column.
// A reel does exactly one lap. Several reels may share the belt; a stitch goes to whichever matching reel reaches its line first.
function Sim(lv,o={}){const gm=geo(lv.W,lv.H);Object.assign(this,{W:lv.W,H:lv.H,g:lv.g.slice(),lanes:lv.lanes.map(l=>l.map(r=>({c:r.c,n:r.n}))),li:lv.lanes.map(()=>0),
 rack:new Array(lv.rack||RACK).fill(null),belt:[],queue:[],state:'play',peak:0,ev:[],speed:o.speed||170,cap:o.cap||5,gap:o.gap||46,sp:gm.sp,PER:gm.PER,geo:gm,uid:0})}
Sim.prototype.canSend=function(){return this.belt.filter(r=>r.n>0).length+this.queue.length<this.cap};
Sim.prototype.send=function(src){if(this.state!=='play'||!this.canSend())return false;let r;
 if(src[0]==='l'){const i=+src.slice(1);if(this.li[i]>=this.lanes[i].length)return false;r=this.lanes[i][this.li[i]++]}else{const i=+src.slice(1);r=this.rack[i];if(!r)return false;this.rack[i]=null}
 this.queue.push({id:++this.uid,c:r.c,n:r.n,trav:0,popT:-1});return true};
Sim.prototype.tick=function(dt){if(this.state!=='play')return;const L=this.sp.length;
 if(this.queue.length&&!this.belt.some(r=>r.trav<this.gap))this.belt.push(this.queue.shift());
 for(const r of this.belt){if(r.popT>=0){r.popT+=dt;r.trav+=this.speed*dt;continue}const prev=r.trav;r.trav=Math.min(this.PER,r.trav+this.speed*dt);
  for(let k=0;k<L&&r.n>0;k++){const s=this.sp[k];if(s>prev&&s<=r.trav){const t=target(this.g,this.W,this.H,k);if(t>=0&&this.g[t]===r.c){this.g[t]=0;r.n--;this.ev.push({t:'pull',cell:t,reel:r})}}}
  if(r.n===0){r.popT=0;this.ev.push({t:'pop',reel:r})}
  else if(r.trav>=this.PER){r.gone=1;const i=this.rack.indexOf(null);if(i<0){this.state='lost';this.ev.push({t:'lose',why:'rack'});return}this.rack[i]={c:r.c,n:r.n};this.ev.push({t:'dock',slot:i,reel:r})}}
 this.belt=this.belt.filter(r=>!r.gone&&!(r.popT>0.45));this.peak=Math.max(this.peak,this.rack.filter(Boolean).length);
 if(!this.g.some(v=>v)){this.state='won';this.ev.push({t:'win'});return}
 if(!this.belt.length&&!this.queue.length&&this.li.every((v,i)=>v>=this.lanes[i].length)&&!this.rack.some(r=>r&&lap(this.g.slice(),this.W,this.H,r.c,r.n)<r.n)){this.state='lost';this.ev.push({t:'lose',why:'stuck'})}};
Sim.prototype.idle=function(){return!this.belt.length&&!this.queue.length};
// replay a solver path in the real-time Sim (one reel at a time) -> proves the game agrees with the solver
function replay(lv,path,o={}){const sim=new Sim(lv,o),sol={g:lv.g.slice(),lanes:lv.lanes,li:lv.lanes.map(()=>0),rack:[],rmax:lv.rack||RACK};let k=0,steps=0;
 while(sim.state==='play'&&steps++<2e6){if(sim.idle()){if(k>=path.length)break;const mv=path[k++];let src;
  if(mv[0]==='l')src='l'+mv[1];else{const r=sol.rack[mv[1]];src='r'+sim.rack.findIndex(x=>x&&x.c===r.c&&x.n===r.n)}
  Object.assign(sol,apply(sol,lv.W,lv.H,mv));if(!sim.send(src))return false}sim.tick(1/60)}return sim.state==='won'}
const api={G,geo,beltPt,Sim,replay,apply,RACK,LANES,parse,beltLen,target,lap,solve,randomWinRate,build,makeLevel,rng,PALETTE:P.PALETTE,PICTURES:P.PICTURES};
root.WR=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
