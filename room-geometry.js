'use strict';
// Storage keeps legacy width=X and depth=Y. UI names them length and width.
const RoomoryRoomGeometry=(()=>{
  const corners=['nw','ne','se','sw'];
  function validCut(r){const c=r.cut;return c==null||typeof c==='object'&&!Array.isArray(c)&&corners.includes(c.corner)&&Number.isFinite(c.length)&&Number.isFinite(c.width)&&c.length>=.1&&c.width>=.1&&c.length<=r.width-.1+1e-8&&c.width<=r.depth-.1+1e-8;}
  function removed(r){if(!r.cut)return null;const c=r.cut;return{x:['ne','se'].includes(c.corner)?r.width-c.length:0,y:['se','sw'].includes(c.corner)?r.depth-c.width:0,width:c.length,depth:c.width};}
  function contains(f,r){if(!validCut(r)||![f.x,f.y,f.width,f.depth].every(Number.isFinite)||f.width<=0||f.depth<=0||f.x< -1e-8||f.y< -1e-8||f.x+f.width>r.width+1e-8||f.y+f.depth>r.depth+1e-8)return false;const c=removed(r);return !c||!(f.x<c.x+c.width-1e-8&&f.x+f.width>c.x+1e-8&&f.y<c.y+c.depth-1e-8&&f.y+f.depth>c.y+1e-8);}
  function area(r){return r.width*r.depth-(r.cut?r.cut.length*r.cut.width:0);}
  function polygon(r,rotation=0){
    let points=[[0,0],[1,0],[1,1],[0,1]];
    if(r.cut){const x=r.cut.length/r.width,y=r.cut.width/r.depth;points=({nw:[[x,0],[1,0],[1,1],[0,1],[0,y],[x,y]],ne:[[0,0],[1-x,0],[1-x,y],[1,y],[1,1],[0,1]],se:[[0,0],[1,0],[1,1-y],[1-x,1-y],[1-x,1],[0,1]],sw:[[0,0],[1,0],[1,1],[x,1],[x,1-y],[0,1-y]]})[r.cut.corner];}
    return points.map(p=>{let[x,y]=p;for(let n=0;n<rotation/90;n++)[x,y]=[1-y,x];return[x,y];});
  }
  function clip(r,rotation=0){return 'polygon('+polygon(r,rotation).map(([x,y])=>`${x*100}% ${y*100}%`).join(',')+')';}
  function place(f,r){
    const c=removed(r),xs=[f.x,0,r.width-f.width],ys=[f.y,0,r.depth-f.depth];if(c){xs.push(c.x+c.width,c.x-f.width);ys.push(c.y+c.depth,c.y-f.depth);}
    const candidates=[];for(const x of xs)for(const y of ys){const next={...f,x,y};if(f.wall==='north')next.y=0;if(f.wall==='south')next.y=r.depth-f.depth;if(f.wall==='west')next.x=0;if(f.wall==='east')next.x=r.width-f.width;if(contains(next,r))candidates.push(next);}
    candidates.sort((a,b)=>Math.hypot(a.x-f.x,a.y-f.y)-Math.hypot(b.x-f.x,b.y-f.y));return candidates[0]||null;
  }
  function blockedWall(r,wall){
    if(!r.cut)return null;const c=r.cut,len=c.length,w=c.width;
    const mapping={nw:{north:[0,len],west:[r.depth-w,w]},ne:{north:[r.width-len,len],east:[0,w]},se:{south:[0,len],east:[r.depth-w,w]},sw:{south:[r.width-len,len],west:[0,w]}};
    const segment=mapping[c.corner][wall];return segment?{u:segment[0],span:segment[1]}:null;
  }
  return{corners,validCut,removed,contains,area,polygon,clip,place,blockedWall};
})();
if(typeof module!=='undefined')module.exports=RoomoryRoomGeometry;
