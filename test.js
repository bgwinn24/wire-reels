const g=require('./logic.js');
let L=[['r','r','r','b']];console.assert(g.reelPull(L,'r',2)===0&&L[0].length===2);
L=[['b']];console.assert(g.reelPull(L,'r',2)===2);
L=[['r'],['r','b']];console.assert(g.reelPull(L,'r',5)===3&&L.length===1);
const t=Date.now();const lv=g.buildLevels();
lv.forEach((l,i)=>console.log('level',i+1,'segs',l.layers.flat().length,'reels',l.supply.length,'winnable',g.solve({layers:l.layers,supply:l.supply,rack:[]})));
console.log('ms',Date.now()-t);
