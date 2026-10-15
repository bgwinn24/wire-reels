// Wire Reels v2 — conveyor sort puzzle. All art drawn in code.
(()=>{
const VW=390,VH=844,cv=document.getElementById('c'),ui=document.getElementById('ui');let cx=cv.getContext('2d');
const PAL=WR.PALETTE,SPEED=220,FLY=0.3,{BT,BB,BLx,BRx,CR}=WR.G;
const Q=new URLSearchParams(location.search),DEV=Q.get('dev')==='wr',AUTO=DEV&&Q.get('auto');
let scale=1,ox=0,oy=0;
function resize(){const d=devicePixelRatio||1,w=innerWidth,h=innerHeight;scale=Math.min(w/VW,h/VH);ox=(w-VW*scale)/2;oy=(h-VH*scale)/2;
 cv.width=w*d;cv.height=h*d;cv.style.width=w+'px';cv.style.height=h+'px';cx.setTransform(d*scale,0,0,d*scale,d*ox,d*oy)}
addEventListener('resize',resize);resize();
// ---------- progress ----------
const SK='wirereels.v2';let prog;try{prog=JSON.parse(localStorage.getItem(SK))||{}}catch(e){prog={}}
prog.unlocked=prog.unlocked||1;prog.stars=prog.stars||{};const save=()=>{try{localStorage.setItem(SK,JSON.stringify(prog))}catch(e){}};
const NS=SHIPPED.length;
function levelData(i){if(i<NS){const s=SHIPPED[i],{W,H,g}=WR.parse(WR.PICTURES[s.pic],false);return{W,H,g,lanes:s.lanes,rack:s.rack}}
 return WR.makeLevel(i,{tries:10,trials:16,limit:20000})||levelData(i%NS)}
// ---------- game state (rules live in WR.Sim, shared with the solver tests) ----------
let S=null,mood={kind:'idle',t:0},time=0;
function start(i){const L=levelData(i),sim=new WR.Sim(L,{speed:SPEED});
 S={i,sim,W:L.W,H:L.H,orig:L.g.slice(),cs:sim.geo.cs,bx:sim.geo.bx,by:sim.geo.by,fly:[],fx:[],zap:[],state:'play',t:0,shake:{},dirty:true,auto:null};
 for(const k of['g','lanes','li','rack','belt','queue','peak'])Object.defineProperty(S,k,{get:()=>sim[k]});hide();mood={kind:'idle',t:0}}
const belt=s=>WR.beltPt(s);
const cellXY=i=>[S.bx+(i%S.W+.5)*S.cs,S.by+(Math.floor(i/S.W)+.5)*S.cs];
// ---------- input ----------
const RACKX=i=>128+i*52,RACKY=486,LANEX=i=>52+i*95,LANEY=598;
cv.addEventListener('pointerdown',e=>{const x=(e.clientX-ox)/scale,y=(e.clientY-oy)/scale;if(!S)return;
 if(y<64){if(x<70)menu();else if(x>320)start(S.i);return}
 if(S.state!=='play')return;
 if(Math.abs(y-RACKY)<34)for(let i=0;i<S.rack.length;i++)if(Math.abs(x-RACKX(i))<26&&S.rack[i]){send('r'+i);return}
 if(y>540)for(let i=0;i<4;i++)if(Math.abs(x-LANEX(i))<47){send('l'+i);return}});
function send(src){if(!S.sim.send(src))S.shake[src]=time}
// ---------- update ----------
function step(dt){if(!S)return;time+=dt;S.t+=dt;mood.t+=dt;const sim=S.sim;
 if(S.state==='play'){if(S.auto)S.auto();sim.tick(dt);
  for(const e of sim.ev){if(e.t==='pull'){S.dirty=true;const from=cellXY(e.cell);S.fly.push({c:e.reel.c,from,r:e.reel,t:0});S.zap.push({a:from,r:e.reel,t:0})}
   else if(e.t==='pop'&&S.state==='play')mood={kind:'happy',t:0};
   else if(e.t==='win'){S.state='reveal';S.t=0;mood={kind:'win',t:0};for(let i=0;i<40;i++)burst([195,257],['Y','O','W','R','B','G'][i%6],1)}
   else if(e.t==='lose')lose()}sim.ev.length=0}
 for(const r of sim.belt)if(r.popT>=.3&&!r.burst){r.burst=1;burst(belt(r.trav),r.c)}
 for(const f of S.fly)f.t+=dt/FLY;S.fly=S.fly.filter(f=>f.t<1);for(const z of S.zap)z.t+=dt*6;S.zap=S.zap.filter(z=>z.t<1);
 for(const p of S.fx)p.t+=dt;S.fx=S.fx.filter(p=>p.t<p.life);
 if(S.state==='reveal'&&S.t>1.8){S.state='won';win()}
 if(S.state==='play'){const used=S.rack.filter(Boolean).length;if(!(mood.kind==='happy'&&mood.t<1.2))mood.kind=used>=S.rack.length-1?'worried':'idle'}}
function burst(p,c,big){for(let i=0;i<(big?1:14);i++){const a=Math.random()*6.283,v=(big?120:60)+Math.random()*120;S.fx.push({x:p[0],y:p[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v,c,t:0,life:big?1.4:.6})}
 S.fx.push({ring:1,x:p[0],y:p[1],c,t:0,life:.45})}
// ---------- drawing ----------
function rr(x,y,w,h,r){cx.beginPath();cx.roundRect(x,y,w,h,r)}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return`rgb(${f(r)},${f(g)},${f(b)})`}
function bg(){const g=cx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#f3e3c4');g.addColorStop(1,'#d9b98a');cx.fillStyle=g;cx.fillRect(0,0,VW,VH);
 cx.strokeStyle='rgba(140,95,50,.12)';cx.lineWidth=2;for(let y=530;y<VH;y+=28){cx.beginPath();cx.moveTo(0,y);cx.lineTo(VW,y);cx.stroke()}}
function header(){rr(6,6,378,54,14);cx.fillStyle='#f7ecd6';cx.fill();cx.strokeStyle='#a87b4f';cx.lineWidth=2.5;cx.stroke();
 btn(14,13,44,40);cx.fillStyle='#6b4325';for(let i=0;i<3;i++)cx.fillRect(25,23+i*8,22,4);
 btn(332,13,44,40);cx.strokeStyle='#6b4325';cx.lineWidth=4;cx.beginPath();cx.arc(354,33,10,.6,5.6);cx.stroke();cx.beginPath();cx.moveTo(361,17);cx.lineTo(363,27);cx.lineTo(353,26);cx.fillStyle='#6b4325';cx.fill();
 cx.fillStyle='#5a3418';cx.font='bold 25px Georgia,serif';cx.textAlign='left';cx.fillText('Wire Reels',68,42);
 rr(214,15,110,36,10);cx.fillStyle='#fffaf0';cx.fill();cx.strokeStyle='#c49a6c';cx.lineWidth=1.5;cx.stroke();cx.fillStyle='#5a3418';cx.textAlign='center';
 cx.font='bold 13px sans-serif';cx.font='bold 16px sans-serif';cx.fillText('Level '+(S.i+1),269,39)}
function btn(x,y,w,h){rr(x,y,w,h,10);cx.fillStyle='#fff6e6';cx.fill();cx.strokeStyle='#a87b4f';cx.lineWidth=2;cx.stroke()}
function frame(){// metal frame + belt
 rr(10,72,370,370,22);cx.fillStyle='#4a4f57';cx.fill();rr(10,72,370,370,22);cx.strokeStyle='#2c3036';cx.lineWidth=3;cx.stroke();
 cx.strokeStyle='#6f757d';cx.lineWidth=26;rr(BLx,BT,BRx-BLx,BB-BT,CR);cx.stroke();
 cx.save();cx.setLineDash([3,9]);cx.lineDashOffset=-time*SPEED;cx.strokeStyle='#565b62';cx.lineWidth=22;rr(BLx,BT,BRx-BLx,BB-BT,CR);cx.stroke();cx.restore();
 cx.strokeStyle='#8c939b';cx.lineWidth=1.5;rr(BLx-13,BT-13,BRx-BLx+26,BB-BT+26,24);cx.stroke();rr(BLx+13,BT+13,BRx-BLx-26,BB-BT-26,6);cx.stroke();
 for(const[x,y]of[[22,84],[368,84],[22,430],[368,430]]){cx.fillStyle='#9aa0a7';cx.beginPath();cx.arc(x,y,8,0,7);cx.fill();cx.fillStyle='#5d636b';cx.beginPath();cx.arc(x,y,3.5,0,7);cx.fill()}
 rr(44,106,302,302,6);cx.fillStyle='#1d2127';cx.fill();
 cx.strokeStyle='rgba(255,255,255,.05)';cx.lineWidth=1;const{W,H,cs,bx,by}=S;
 for(let x=0;x<=W;x++){cx.beginPath();cx.moveTo(bx+x*cs,by);cx.lineTo(bx+x*cs,by+H*cs);cx.stroke()}for(let y=0;y<=H;y++){cx.beginPath();cx.moveTo(bx,by+y*cs);cx.lineTo(bx+W*cs,by+y*cs);cx.stroke()}}
function stitch(x,y,c,s,glow){const h=s*.36,col=PAL[c];cx.lineCap='round';cx.lineWidth=s*.3;
 cx.strokeStyle=shade(col,-.35);cx.beginPath();cx.moveTo(x-h,y-h+1);cx.lineTo(x+h,y+h+1);cx.moveTo(x+h,y-h+1);cx.lineTo(x-h,y+h+1);cx.stroke();
 cx.strokeStyle=glow?shade(col,.25):col;cx.beginPath();cx.moveTo(x-h,y-h);cx.lineTo(x+h,y+h);cx.stroke();cx.beginPath();cx.moveTo(x+h,y-h);cx.lineTo(x-h,y+h);cx.stroke();
 cx.strokeStyle='rgba(255,255,255,.35)';cx.lineWidth=s*.08;cx.beginPath();cx.moveTo(x+h*.7,y-h*.8);cx.lineTo(x-h*.2,y+h*.1);cx.stroke()}
const bc=document.createElement('canvas');bc.width=bc.height=640;
function board(){const reveal=S.state!=='play';
 if(!reveal){if(S.dirty){S.dirty=false;const o=cx;cx=bc.getContext('2d');cx.setTransform(2,0,0,2,0,0);cx.clearRect(0,0,320,320);cx.translate(-35,-97);
   for(let i=0;i<S.g.length;i++)if(S.g[i]){const[x,y]=cellXY(i);stitch(x,y,S.g[i],S.cs)}cx=o}cx.drawImage(bc,35,97,320,320);return}const g=S.orig;
 {cx.save();cx.shadowColor='#ffd54a';cx.shadowBlur=18+8*Math.sin(time*6)}
 for(let i=0;i<g.length;i++)if(g[i]){const[x,y]=cellXY(i);stitch(x,y,g[i],S.cs,reveal)}if(reveal)cx.restore()}
function reel(x,y,s,c,n,opt={}){// s = width
 const w=s,h=s*.78,fl=s*.16,col=PAL[c];cx.save();cx.translate(x,y);const k=opt.k||1;cx.scale(k,k);
 if(opt.hi){cx.shadowColor='#ffcf4d';cx.shadowBlur=16}
 cx.fillStyle='#7a4a26';cx.beginPath();cx.ellipse(0,h/2,w/2,fl,0,0,7);cx.fill();cx.shadowBlur=0;
 cx.fillStyle=shade(col,-.2);cx.fillRect(-w*.42,-h/2,w*.84,h);
 cx.strokeStyle=shade(col,.25);cx.lineWidth=Math.max(1,s*.035);for(let i=1;i<7;i++){const yy=-h/2+i*h/7;cx.beginPath();cx.moveTo(-w*.42,yy);cx.quadraticCurveTo(0,yy+s*.05,w*.42,yy);cx.stroke()}
 cx.fillStyle='rgba(0,0,0,.18)';cx.fillRect(w*.22,-h/2,w*.2,h);
 cx.fillStyle='#c58b52';cx.beginPath();cx.ellipse(0,-h/2,w/2,fl,0,0,7);cx.fill();cx.fillStyle='#e0aa70';cx.beginPath();cx.ellipse(0,-h/2-1,w/2-2,fl-2,0,0,7);cx.fill();
 if(opt.big&&n!=null){cx.fillStyle='#fffaf0';cx.beginPath();cx.arc(0,-2,13,0,7);cx.fill();cx.strokeStyle=shade(col,-.4);cx.lineWidth=2;cx.stroke();cx.fillStyle=shade(col,-.55);cx.font='bold 17px sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(n,0,-1);cx.textBaseline='alphabetic'}
 else if(n!=null){cx.fillStyle='#fffaf0';cx.beginPath();cx.ellipse(0,-h/2-1,w*.27,fl*.8,0,0,7);cx.fill();cx.fillStyle=shade(col,-.45);cx.font=`bold ${Math.round(s*.3)}px sans-serif`;cx.textAlign='center';cx.textBaseline='middle';cx.fillText(n,0,-h/2);cx.textBaseline='alphabetic'}
 cx.restore()}
function beltReels(){for(const r of S.belt){const[x,y]=belt(r.trav),p=r.popT>=.3?r.popT-.3:-1;cx.globalAlpha=p>=0?Math.max(0,1-p/.15):1;reel(x,y,42,r.c,r.n,{k:p>=0?1+p*5:1,big:1});cx.globalAlpha=1}}
function zaps(){for(const z of S.zap){const b=belt(z.r.trav);cx.globalAlpha=1-z.t;cx.strokeStyle='#fff3b0';cx.lineWidth=3;cx.beginPath();cx.moveTo(z.a[0],z.a[1]);cx.lineTo(b[0],b[1]);cx.stroke();
 cx.fillStyle='#fff3b0';cx.beginPath();cx.arc(z.a[0],z.a[1],S.cs*.7*(1-z.t)+2,0,7);cx.fill();cx.globalAlpha=1}}
function flies(){for(const f of S.fly){const to=belt(f.r.trav),t=f.t,e=t*t*(3-2*t),x=f.from[0]+(to[0]-f.from[0])*e,y=f.from[1]+(to[1]-f.from[1])*e-Math.sin(t*3.14)*30;
 cx.strokeStyle=PAL[f.c];cx.lineWidth=2.5;cx.globalAlpha=.7;cx.beginPath();cx.moveTo(f.from[0],f.from[1]);cx.quadraticCurveTo((f.from[0]+x)/2,(f.from[1]+y)/2-20,x,y);cx.stroke();cx.globalAlpha=1;stitch(x,y,f.c,S.cs*(1-.4*t))}}
function effects(){for(const p of S.fx){const a=1-p.t/p.life;if(p.ring){cx.strokeStyle=PAL[p.c];cx.globalAlpha=a;cx.lineWidth=5*a;cx.beginPath();cx.arc(p.x,p.y,8+p.t*90,0,7);cx.stroke();cx.globalAlpha=1;continue}
 cx.fillStyle=PAL[p.c];cx.globalAlpha=a;cx.beginPath();cx.arc(p.x+p.vx*p.t,p.y+p.vy*p.t+120*p.t*p.t,3.5,0,7);cx.fill();cx.globalAlpha=1}}
function rack(){rr(104,452,280,70,12);cx.fillStyle='#7b4f2c';cx.fill();rr(108,456,272,62,10);cx.fillStyle='#5b3a1f';cx.fill();
 for(let i=0;i<5;i++){const x=RACKX(i);rr(x-24,461,48,52,8);if(i>=S.rack.length){cx.fillStyle='#8a6a48';cx.fill();cx.fillStyle='#5b3a1f';cx.fillRect(x-8,486,16,13);cx.strokeStyle='#5b3a1f';cx.lineWidth=3;cx.beginPath();cx.arc(x,486,6,3.14,0);cx.stroke();continue}cx.fillStyle='#ead8b8';cx.fill();cx.strokeStyle='#b89468';cx.setLineDash([4,3]);cx.lineWidth=1.5;cx.stroke();cx.setLineDash([]);
  const r=S.rack[i];if(r){const sh=S.shake['r'+i]&&time-S.shake['r'+i]<.3?Math.sin(time*60)*3:0;reel(x+sh,RACKY+6,36,r.c,r.n)}}}
function lanes(){rr(8,536,374,300,14);cx.fillStyle='#6d4426';cx.fill();
 for(let i=0;i<4;i++){const x=LANEX(i);rr(x-44,546,88,282,10);cx.fillStyle='#4a2f1a';cx.fill();
  const l=S.lanes[i],st=S.li[i];const sh=S.shake['l'+i]&&time-S.shake['l'+i]<.3?Math.sin(time*60)*3:0;
  for(let j=Math.min(l.length-1,st+3);j>=st;j--){const d=j-st;reel(x+(d?0:sh),LANEY+d*64,d?62:70,l[j].c,d?null:l[j].n,{hi:!d&&S.state==='play'})}
  for(let j=st+1;j<=Math.min(l.length-1,st+3);j++){const y=LANEY+(j-st)*64+10;cx.fillStyle='#fffaf0';cx.beginPath();cx.roundRect(x-15,y-10,30,20,9);cx.fill();cx.strokeStyle=shade(PAL[l[j].c],-.3);cx.lineWidth=1.5;cx.stroke();cx.fillStyle=shade(PAL[l[j].c],-.5);cx.font='bold 14px sans-serif';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(l[j].n,x,y+1);cx.textBaseline='alphabetic'}
  if(l.length-st>4){cx.fillStyle='#f3e3c4';cx.font='bold 13px sans-serif';cx.textAlign='center';cx.fillText('+'+(l.length-st-4)+' more',x,824)}}}
// ---------- mascot: little light-bulb helper ----------
function bulb(x,y,s,kind,t){cx.save();cx.translate(x,y);cx.scale(s,s);
 let bob=Math.sin(t*3)*2,glow=.25,arm=0.4;if(kind==='happy'){bob=-Math.abs(Math.sin(t*9))*10;glow=.8;arm=-1}if(kind==='win'){bob=-Math.abs(Math.sin(t*7))*12;glow=1;arm=-1.3}
 if(kind==='worried'){bob=0;cx.translate(Math.sin(t*25)*1.2,0)}cx.translate(0,bob);
 if(glow>.3){const g=cx.createRadialGradient(0,-8,4,0,-8,48*glow+10);g.addColorStop(0,'rgba(255,225,110,.8)');g.addColorStop(1,'rgba(255,225,110,0)');cx.fillStyle=g;cx.beginPath();cx.arc(0,-8,60,0,7);cx.fill()}
 if(kind==='win'){cx.strokeStyle='#ffd23a';cx.lineWidth=3;for(let i=0;i<8;i++){const a=i*.785+t;cx.beginPath();cx.moveTo(Math.cos(a)*28,-8+Math.sin(a)*28);cx.lineTo(Math.cos(a)*38,-8+Math.sin(a)*38);cx.stroke()}}
 cx.strokeStyle='#5a3418';cx.lineWidth=3;cx.lineCap='round';// legs & arms
 cx.beginPath();cx.moveTo(-5,22);cx.lineTo(-7,32);cx.moveTo(5,22);cx.lineTo(7,32);cx.stroke();
 cx.beginPath();cx.moveTo(-17,0);cx.lineTo(-27,4+arm*12);cx.moveTo(17,0);cx.lineTo(27,4+arm*12);cx.stroke();
 cx.fillStyle='#5a3418';cx.beginPath();cx.ellipse(-8,33,4,2.4,0,0,7);cx.ellipse(8,33,4,2.4,0,0,7);cx.fill();
 cx.fillStyle='#8f969e';rr(-9,8,18,15,3);cx.fill();cx.strokeStyle='#646a72';cx.lineWidth=1.5;for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(-9,12+i*4);cx.lineTo(9,10+i*4);cx.stroke()}
 const gl=kind==='worried'?'#f4ecd0':kind==='idle'?'#fff2b3':'#ffe36b';cx.fillStyle=gl;cx.beginPath();cx.arc(0,-8,19,0,7);cx.fill();cx.strokeStyle='#c9a24a';cx.lineWidth=1.5;cx.stroke();
 cx.strokeStyle='rgba(255,255,255,.8)';cx.lineWidth=2.5;cx.beginPath();cx.arc(0,-8,14,3.6,4.4);cx.stroke();
 cx.strokeStyle='#e0a030';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(-4,8);cx.lineTo(-4,0);cx.lineTo(0,-4);cx.lineTo(4,0);cx.lineTo(4,8);cx.stroke();
 cx.fillStyle='#3b2412';const blink=(t%3.2)<.12;
 if(kind==='happy'||kind==='win'){cx.strokeStyle='#3b2412';cx.lineWidth=2;cx.beginPath();cx.arc(-6,-10,3,3.4,6);cx.stroke();cx.beginPath();cx.arc(6,-10,3,3.4,6);cx.stroke()}
 else{cx.beginPath();cx.ellipse(-6,-10,2.2,blink?.4:3,0,0,7);cx.ellipse(6,-10,2.2,blink?.4:3,0,0,7);cx.fill()}
 cx.strokeStyle='#3b2412';cx.lineWidth=2;cx.beginPath();
 if(kind==='worried'){cx.moveTo(-6,-1);cx.quadraticCurveTo(0,-5,6,-1);cx.stroke();cx.beginPath();cx.moveTo(-10,-17);cx.lineTo(-3,-15);cx.moveTo(10,-17);cx.lineTo(3,-15);cx.stroke();
  cx.fillStyle='#7cc4f0';cx.beginPath();cx.moveTo(15,-20);cx.quadraticCurveTo(20,-12,15,-10);cx.quadraticCurveTo(10,-12,15,-20);cx.fill()}
 else{cx.arc(0,-5,kind==='idle'?4:6,.3,2.8);cx.stroke()}
 cx.fillStyle='rgba(240,110,110,.45)';cx.beginPath();cx.arc(-12,-4,3,0,7);cx.arc(12,-4,3,0,7);cx.fill();cx.restore()}
function mascots(){const k=mood.kind,tt=time;bulb(52,488,1,k,tt);// main helper by the rack
 bulb(352,66,.55,k==='worried'?'worried':k,tt+1.3);// buddy riding the belt corner
 if(k==='worried'){cx.fillStyle='#fffaf0';rr(0,436,0,0,0);}
 const msg={happy:'Popped!',worried:'Rack\'s filling!',win:'Wired up!'}[k];if(msg&&S.state!=='won'){cx.font='bold 12px sans-serif';const w=cx.measureText(msg).width+14;rr(52-w/2,436,w,20,8);cx.fillStyle='#fffaf0';cx.fill();cx.strokeStyle='#a87b4f';cx.lineWidth=1;cx.stroke();cx.fillStyle='#5a3418';cx.textAlign='center';cx.fillText(msg,52,450)}}
function mini(){const m=document.getElementById('mb');if(!m||ui.style.display==='none')return;const o=cx;cx=m.getContext('2d');cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,m.width,m.height);bulb(60,62,1.5,m.dataset.k,time);cx=o}
function draw(){mini();bg();if(!S)return;header();frame();board();zaps();beltReels();rack();lanes();flies();effects();mascots();
 if(S.state==='play'){cx.fillStyle='rgba(255,250,240,.75)';cx.font='11px sans-serif';cx.textAlign='center';cx.fillText('Belt '+(S.belt.length+S.queue.length)+'/'+S.sim.cap,195,438)}}
// ---------- screens ----------
function show(h){ui.innerHTML=h;ui.style.display='flex'}function hide(){ui.style.display='none'}
const stars=n=>'<div class="stars">'+[1,2,3].map(i=>`<span class="${i<=n?'on':''}">★</span>`).join('')+'</div>';
function win(){const R=S.rack.length,st=S.peak<=Math.floor(R*.4)?3:S.peak<R?2:1;prog.stars[S.i]=Math.max(prog.stars[S.i]||0,st);prog.unlocked=Math.max(prog.unlocked,S.i+2);save();
 if(S.i===NS-1&&!prog.allDone){prog.allDone=1;save();show(`<div class="card"><canvas id="mb" data-k="win" width="120" height="110"></canvas><h2>All ${NS} pictures wired!</h2><p>Every crafted level is done. Your bulb buddy is beaming.</p>${stars(st)}<button data-a="next">Endless mode ▶</button><button data-a="menu" class="alt">Levels</button></div>`);return}
 show(`<div class="card"><canvas id="mb" data-k="win" width="120" height="110"></canvas><h2>Level ${S.i+1} complete!</h2>${stars(st)}<p>Dock peak: ${S.peak}/${S.rack.length}</p><button data-a="next">Next level ▶</button><button data-a="menu" class="alt">Levels</button></div>`)}
function lose(){if(S.state!=='play')return;S.state='lost';mood={kind:'worried',t:0};show(`<div class="card"><canvas id="mb" data-k="worried" width="120" height="110"></canvas><h2>Dock overloaded!</h2><p>No room left for that reel. Plan which lane to pull from.</p><button data-a="retry">Try again</button><button data-a="menu" class="alt">Levels</button></div>`)}
function menu(){const n=Math.max(NS,prog.unlocked);let h='<div class="card wide"><h2>Pick a picture</h2><div class="grid">';
 for(let i=0;i<n;i++){const lock=i+1>prog.unlocked;h+=`<button class="lv" ${lock?'disabled':''} data-l="${i}">${i+1}<small>${i<NS?'':'Endless'}</small><i>${'★'.repeat(prog.stars[i]||0)}</i></button>`}
 show(h+'</div></div>')}
ui.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
 if(b.dataset.l)start(+b.dataset.l);else if(a==='next')start(S.i+1);else if(a==='retry')start(S.i);else if(a==='menu')menu()});
// ---------- loop (fixed 1/120 s sim steps so slow frames never slow the belt) ----------
let last=performance.now(),acc=0,frames=0,slow=0,worst=0;function frameLoop(now){const real=(now-last)/1000;last=now;frames++;if(real>1/50)slow++;if(frames>30)worst=Math.max(worst,real);
 acc+=Math.min(.05,real)*(AUTO==='win'?12:1);while(acc>=1/120){step(1/120);acc-=1/120}draw();requestAnimationFrame(frameLoop)}
start(DEV&&Q.has('level')?Math.max(0,+Q.get('level')-1):Math.min(prog.unlocked-1,NS-1));requestAnimationFrame(frameLoop);
// hidden dev modes (?dev=wr&auto=play|win|lose) used for headless screenshots
function lanePulls(){return S.lanes.findIndex((l,i)=>{const r=l[S.li[i]];return r&&WR.lap(S.g.slice(),S.W,S.H,r.c,r.n)<r.n})}
if(AUTO==='play'){setTimeout(()=>send('l'+lanePulls()),300);setTimeout(()=>send('l'+lanePulls()),900)}
if(AUTO==='lose')S.auto=()=>{for(let i=0;i<4;i++)if(S.li[i]<S.lanes[i].length&&S.sim.canSend()){send('l'+i);break}};
if(AUTO==='win'){const L=levelData(S.i),path=WR.solve(L).path,sol={g:L.g.slice(),lanes:L.lanes,li:L.lanes.map(()=>0),rack:[],rmax:L.rack};let k=0;
 S.auto=()=>{if(!S.sim.idle()||k>=path.length)return;const mv=path[k++];let src='l'+mv[1];if(mv[0]==='r'){const r=sol.rack[mv[1]];src='r'+S.rack.findIndex(x=>x&&x.c===r.c&&x.n===r.n)}Object.assign(sol,WR.apply(sol,L.W,L.H,mv));send(src)}}
window.__wr={get S(){return S},start,get fps(){return{frames,slow,worst}}};
})();
