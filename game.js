const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const LEVELS=buildLevels(),ROOMS=['Porch','Hallway','Kitchen','Living Room','Dining Room','Bathroom','Bedroom','Office','Garage','Attic'];
let W,H,scr='menu',lvl=0,st,anim=null,btns=[];
let done=JSON.parse(localStorage.getItem('wireReelsDone')||'[]');
function resize(){const d=devicePixelRatio||1;W=Math.min(innerWidth,innerHeight*0.6);H=innerHeight;cv.width=W*d;cv.height=H*d;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize);resize();
function start(n){lvl=n;const L=LEVELS[n];st={layers:L.layers.map(a=>a.slice()),supply:L.supply.slice(),rack:[]};anim=null;scr='play'}
function hasMove(s){const tot=s.layers.flat().length;
  for(const[m,arr]of[['r',s.rack],['s',s.supply]])for(let i=0;i<arr.length;i++){const t=applyMove(s,m,i);if(t&&(m==='s'||t.layers.flat().length<tot))return true}return false}
function play(src,i){if(anim)return;const arr=src==='s'?st.supply:st.rack;const[c,cap]=arr[i];
  const t=applyMove(st,src,i);if(!t){scr='lose';return}
  anim={c,cap,t0:performance.now(),next:t,left:t.rack.length>st.rack.length?t.rack[t.rack.length-1][1]:0};arr.splice(i,1)}
function txt(s,x,y,sz,col='#fff'){ctx.fillStyle=col;ctx.font='bold '+sz+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(s,x,y)}
function btn(x,y,w,h,label,fn,col='#37474f'){ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x,y,w,h,8);ctx.fill();if(label)txt(label,x+w/2,y+h/2,16);btns.push({x,y,w,h,fn})}
function reel(x,y,c,cap,r=16){ctx.fillStyle=COLORS[c];ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(x,y,r*.45,0,7);ctx.fill();txt(cap,x,y,r*.7)}
function drawBoard(cx,cy,R,layers,hl){
  ctx.strokeStyle='#546e7a';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(cx,cy,R+18,0,7);ctx.stroke();ctx.setLineDash([]);
  const n=layers.length;layers.slice().reverse().forEach((L,ri)=>{const li=n-1-ri,rr=R*(1-li*0.8/Math.max(n,1)),w=Math.max(6,R*0.7/Math.max(n,1));
    L.forEach((c,k)=>{const a0=k/L.length*Math.PI*2,a1=(k+1)/L.length*Math.PI*2-0.06;ctx.strokeStyle=COLORS[c];ctx.globalAlpha=li===0?1:0.35;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,rr-w/2,a0,a1);ctx.stroke()})});
  ctx.globalAlpha=1}
function frame(now){btns=[];ctx.fillStyle='#1b2330';ctx.fillRect(0,0,W,H);
  if(scr==='menu'){txt('WIRE REELS',W/2,70,34,'#fdd835');txt('Light up every room',W/2,105,16,'#b0bec5');
    for(let i=0;i<10;i++){const x=W/2-130+(i%2)*140,y=140+Math.floor(i/2)*80,ok=done.includes(i);
      btn(x,y,120,64,'',()=>start(i),ok?'#f9a825':'#37474f');txt((i+1)+'. '+ROOMS[i],x+60,y+24,14,ok?'#222':'#fff');txt(ok?'lit':'dark',x+60,y+46,12,ok?'#222':'#90a4ae')}}
  else{const cx=W/2,cy=H*0.36,R=Math.min(W*0.38,H*0.25);
    txt('Level '+(lvl+1)+' - '+ROOMS[lvl],W/2,26,18);btn(10,8,70,32,'Menu',()=>scr='menu');btn(W-80,8,70,32,'Restart',()=>start(lvl));
    let disp=st.layers;
    if(anim){const p=(now-anim.t0)/1200;if(p>=1){st=anim.next;anim=null;disp=st.layers;
        if(!st.layers.length){scr='win';if(!done.includes(lvl)){done.push(lvl);localStorage.setItem('wireReelsDone',JSON.stringify(done))}}
        else if(!hasMove(st))scr='lose'}
      else{const a=-Math.PI/2+p*Math.PI*2;drawBoard(cx,cy,R,st.layers,1);reel(cx+Math.cos(a)*(R+18),cy+Math.sin(a)*(R+18),anim.c,Math.round(anim.cap-(anim.cap-anim.left)*p),18);disp=null}}
    if(disp)drawBoard(cx,cy,R,disp);
    const ry=cy+R+55;txt('RACK',W/2,ry-22,12,'#90a4ae');
    for(let i=0;i<5;i++){const x=W/2-120+i*60;ctx.strokeStyle='#546e7a';ctx.lineWidth=2;ctx.strokeRect(x-22,ry-4,44,44);
      if(st.rack[i]){reel(x,ry+18,st.rack[i][0],st.rack[i][1]);btns.push({x:x-22,y:ry-4,w:44,h:44,fn:()=>play('r',i)})}}
    const sy=ry+75;txt('SUPPLY ('+st.supply.length+')',W/2,sy-12,12,'#90a4ae');
    const cols=Math.floor((W-20)/46);st.supply.forEach((r,i)=>{const x=10+23+(i%cols)*46,y=sy+20+Math.floor(i/cols)*46;if(y<H-20){reel(x,y,r[0],r[1]);btns.push({x:x-20,y:y-20,w:40,h:40,fn:()=>play('s',i)})}});
    if(scr==='win'||scr==='lose'){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,0,W,H);btns=[];
      if(scr==='win'){ctx.fillStyle='#fdd835';ctx.beginPath();ctx.moveTo(W/2-60,H*.4);ctx.lineTo(W/2,H*.4-50);ctx.lineTo(W/2+60,H*.4);ctx.fill();ctx.fillRect(W/2-50,H*.4,100,70);
        txt(ROOMS[lvl]+' is lit!',W/2,H*.4+110,24,'#fdd835');if(lvl<9)btn(W/2-70,H*.6,140,44,'Next',()=>start(lvl+1),'#f9a825')}
      else{txt('Rack jammed!',W/2,H*.4,28,'#ef5350');btn(W/2-70,H*.6,140,44,'Retry',()=>start(lvl),'#c62828')}
      btn(W/2-70,H*.6+56,140,44,'Levels',()=>scr='menu')}}
  requestAnimationFrame(frame)}
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  for(const b of btns.slice().reverse())if(x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h){b.fn();break}});
requestAnimationFrame(frame);
