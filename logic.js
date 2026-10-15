// reelPull: written by local model (qwen2.5:7b), verified with node
function reelPull(layers, color, capacity) {
    while (capacity > 0 && layers.length > 0) {
        let i = layers[0].indexOf(color);
        if (i === -1) break;
        layers[0].splice(i, 1);
        capacity--;
        if (layers[0].length === 0) layers.shift();
    }
    return Math.max(capacity, 0);
}
const COLORS=['#e53935','#1e88e5','#43a047','#fdd835','#8e24aa','#fb8c00'];
function rng(s){return()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}}
function makeLevel(n,seed){
  const r=rng(seed*7919+n), nc=Math.min(2+Math.floor(n/2),6), nl=2+Math.floor(n/3), per=6+n;
  const pool=[];const reels=[];
  for(let c=0;c<nc;c++){let cnt=Math.ceil(nl*per/nc);
    while(cnt>0){const cap=Math.min(cnt,2+Math.floor(r()*4));reels.push({c,cap});cnt-=cap;}
  }
  reels.forEach(x=>{for(let i=0;i<x.cap;i++)pool.push(x.c)});
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  for(let i=reels.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[reels[i],reels[j]]=[reels[j],reels[i]]}
  const layers=[];for(let l=0;l<nl;l++)layers.push(pool.splice(0,Math.ceil(pool.length/(nl-l))));
  return {layers,supply:reels.map(x=>[x.c,x.cap])};
}
// state: layers, supply[[c,cap]], rack[[c,cap]]; move = play reel from supply idx or rack idx
function applyMove(s,src,i){
  const L=s.layers.map(a=>a.slice()),S=s.supply.slice(),R=s.rack.slice();
  const [c,cap]=(src==='s'?S:R).splice(i,1)[0];
  const left=reelPull(L,c,cap);
  if(left>0){if(R.length>=5)return null;R.push([c,left]);}
  return {layers:L,supply:S,rack:R};
}
function solve(s0,limit=200000){
  const seen=new Set();let n=0;
  function key(s){return JSON.stringify([s.layers,s.supply,s.rack.slice().sort()])}
  function dfs(s){
    if(!s.layers.length)return true;
    if(++n>limit)return false;const k=key(s);if(seen.has(k))return false;seen.add(k);
    const moves=[];
    s.rack.forEach((_,i)=>moves.push(['r',i]));s.supply.forEach((_,i)=>moves.push(['s',i]));
    for(const[m,i]of moves){const t=applyMove(s,m,i);if(t&&(t.layers.flat().length<s.layers.flat().length||m==='s')&&dfs(t))return true}
    return false;
  }
  return dfs(s0);
}
function buildLevels(){const out=[];for(let n=0;n<10;n++){for(let seed=1;;seed++){const lv=makeLevel(n,seed);
  if(solve({layers:lv.layers,supply:lv.supply,rack:[]})){out.push(lv);break}}}return out}
if(typeof module!=='undefined')module.exports={reelPull,makeLevel,solve,buildLevels,applyMove};
