// Core rules shared by game + solver. Belt positions: top L->R, right T->B, bottom R->L, left B->T.
(function(root){
const P=typeof PICTURES!=='undefined'?{PICTURES,PALETTE}:require('./pictures.js');
const RACK=5,LANES=4;
function parse(rows,mirror,outline){const W=Math.max(...rows.map(r=>r.length)),H=rows.length,g=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=rows[y][mirror?W-1-x:x]||'.';g.push(c==='.'?0:c)}
 if(outline){const o=g.slice(),e=(x,y)=>x<0||y<0||x>=W||y>=H||!o[y*W+x];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(o[y*W+x]&&!'SK'.includes(o[y*W+x])&&(e(x-1,y)||e(x+1,y)||e(x,y-1)||e(x,y+1)))g[y*W+x]=outline}
 return{W,H,g}}
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
 const left=lap(g,W,H,reel.c,reel.n);if(left>0){if(rack.length>=RACK)return null;rack.push({c:reel.c,n:left})}
 return{g,lanes:st.lanes,li,rack,pulled:reel.n-left}}
const done=st=>!st.g.some(v=>v);
function key(st){return st.g.map(v=>v||'.').join('')+'|'+st.li.join(',')+'|'+st.rack.map(r=>r.c+r.n).sort().join(',')}
// DFS solver with memo; returns {ok,nodes,path}
function solve(lv,limit=300000){const{W,H}=lv,seen=new Set();let nodes=0;const path=[];
 const st0={g:lv.g.slice(),lanes:lv.lanes,li:lv.lanes.map(()=>0),rack:[]};
 function dfs(st){if(done(st))return true;if(++nodes>limit)return false;const k=key(st);if(seen.has(k))return false;seen.add(k);
  const ch=[];for(const mv of moves(st,W,H)){const s=apply(st,W,H,mv);if(s)ch.push([s,mv])}
  ch.sort((a,b)=>(b[0].pulled-a[0].pulled)||(a[0].rack.length-b[0].rack.length));
  for(const[s,mv]of ch){path.push(mv);if(dfs(s))return true;path.pop()}return false}
 const ok=dfs(st0);return{ok,nodes,path:path.slice()}}
function randomWinRate(lv,trials,r){let w=0;for(let t=0;t<trials;t++){let st={g:lv.g.slice(),lanes:lv.lanes,li:lv.lanes.map(()=>0),rack:[]};
 for(;;){if(done(st)){w++;break}const m=moves(st,lv.W,lv.H);if(!m.length)break;st=apply(st,lv.W,lv.H,m[Math.floor(r()*m.length)]);if(!st)break}}return w/trials}
// build supply lanes from picture colour counts
function build(pic,seed,diff,mirror){const{W,H,g}=parse(pic[1],mirror,pic[2]),r=rng(seed*2654435761+7);
 const cnt={};g.forEach(c=>{if(c)cnt[c]=(cnt[c]||0)+1});
 const reels=[];const lo=3,hi=Math.max(4,10-Math.round(diff*6));
 for(const c in cnt){let n=cnt[c];while(n>0){let s=lo+Math.floor(r()*(hi-lo+1));if(n-s<lo&&n-s>0)s=n;s=Math.min(s,n);reels.push({c,n:s});n-=s}}
 // easy order: colours roughly in the order they become reachable; shuffle more as diff rises
 const gg=g.slice(),order=[];for(let k=0;k<400&&gg.some(v=>v);k++){const L=beltLen(W,H);for(let p=0;p<L;p++){const t=target(gg,W,H,p);if(t>=0){order.push(gg[t]);gg[t]=0;break}}}
 const firstSeen=c=>order.indexOf(c);reels.forEach(x=>x.k=firstSeen(x.c)+r()*order.length*(0.1+diff*3));
 reels.sort((a,b)=>a.k-b.k);const lanes=[[],[],[],[]];reels.forEach((x,i)=>{const li=diff<0.3?i%LANES:Math.floor(r()*LANES);lanes[li].push({c:x.c,n:x.n})});
 return{name:pic[0],W,H,g,lanes:lanes.filter(l=>l.length).length===LANES?lanes:lanes.map((l,i)=>l.length?l:[reels[i]].map(x=>({c:x.c,n:x.n})))&&lanes,seed,diff}}
// pick, among seeds, a winnable layout whose random-play win rate is near the target
function makeLevel(idx,opts={}){const pics=P.PICTURES,np=pics.length,pic=pics[opts.pic!=null?opts.pic:idx%np],cycle=Math.floor(idx/np);
 const t=Math.min(1,idx/(np-1)),diff=Math.min(1,0.05+t*0.8+cycle*0.1),target=Math.max(0.03,0.95-t*0.9-cycle*0.05);
 const tries=opts.tries||24,r=rng(idx+99);let best=null;
 for(let s=1;s<=tries;s++){const lv=build(pic,idx*1000+s,diff,cycle%2===1);if(lv.lanes.some(l=>!l.length))continue;
  const so=solve(lv,opts.limit||60000);if(!so.ok)continue;const wr=randomWinRate(lv,opts.trials||60,r);const sc=Math.abs(wr-target);
  if(!best||sc<best.sc){best={lv,sc,wr,nodes:so.nodes,moves:so.path.length}}if(sc<0.04)break}
 if(!best)return null;Object.assign(best.lv,{index:idx,winRate:best.wr,solverNodes:best.nodes,solutionMoves:best.moves,targetRate:target});return best.lv}
const api={RACK,LANES,parse,beltLen,target,lap,solve,randomWinRate,build,makeLevel,rng,PALETTE:P.PALETTE,PICTURES:P.PICTURES};
root.WR=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
