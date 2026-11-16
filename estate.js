'use strict';
// Buildings share room records through buildingId; footprints never contain room data.
const RoomoryEstate = (() => {
  const shapes = { rectangle: [[0,0,1,1]], l: [[0,0,.5,1],[.5,.5,.5,.5]], t: [[0,0,1,.4],[.35,.4,.3,.6]], u: [[0,0,.3,1],[.7,0,.3,1],[.3,.65,.4,.35]], ellipse:[[0,0,1,1]],semicircle:[[0,0,1,1]],rounded:[[0,0,1,1]],hexagon:[[0,0,1,1]],octagon:[[0,0,1,1]] };
  const defaults = () => ({ plot: { width: 30, depth: 24 }, trees:[], buildings: [{ id: 'main-house', name: 'Мой дом', kind: 'house', shape: 'rectangle', x: 3, y: 3, width: 12, depth: 10, rotation: 0 }] });
  function parameters(b) { return { c: b.shape === 't' ? .3 : b.shape === 'u' ? .3 : .5, d: b.shape === 't' ? .4 : b.shape === 'u' ? .35 : .5, e: .3, ...b.shapeParams }; }
  function rectangles(b) {
    const {c,d,e} = parameters(b);
    return b.shape === 'l' ? [[0,0,c,1],[c,1-d,1-c,d]] : b.shape === 't' ? [[0,0,1,d],[(1-c)/2,d,c,1-d]] : b.shape === 'u' ? [[0,0,c,1],[1-e,0,e,1],[c,1-d,1-c-e,d]] : shapes.rectangle;
  }
  function validParameters(b) {
    if (b.shapeParams !== undefined && (!b.shapeParams || typeof b.shapeParams !== 'object' || Array.isArray(b.shapeParams))) return false;
    if (b.shape === 'rectangle'||isCurved(b)) return true;
    const {c,d,e} = parameters(b), odd = b.rotation % 180 !== 0;
    const w = odd ? b.depth : b.width, h = odd ? b.width : b.depth;
    return [c,d,e].every(Number.isFinite) && c*w >= .1 && (1-c)*w >= .1 && d*h >= .1 && (1-d)*h >= .1 && (b.shape !== 'u' || e*w >= .1 && (1-c-e)*w >= .1);
  }
  function parts(b) {
    return rectangles(b).map(([x,y,w,h]) => {
      for (let n = 0; n < b.rotation / 90; n++) [x,y,w,h] = [1-y-h,x,h,w];
      return { x:b.x+x*b.width, y:b.y+y*b.depth, width:w*b.width, depth:h*b.depth };
    });
  }
  function isCurved(b){return ['ellipse','semicircle','rounded','hexagon','octagon'].includes(b.shape);}
  function outline(b){
    const {c,d,e}=parameters(b);let points;
    if(b.shape==='ellipse')points=Array.from({length:64},(_,i)=>{const a=i*Math.PI/32;return[.5+.5*Math.cos(a),.5+.5*Math.sin(a)];});
    else if(['hexagon','octagon'].includes(b.shape)){const n=b.shape==='hexagon'?6:8,raw=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[Math.cos(a),Math.sin(a)];}),xs=raw.map(p=>p[0]),ys=raw.map(p=>p[1]),minX=Math.min(...xs),minY=Math.min(...ys),w=Math.max(...xs)-minX,h=Math.max(...ys)-minY;points=raw.map(([x,y])=>[(x-minX)/w,(y-minY)/h]);}
    else if(b.shape==='semicircle')points=Array.from({length:33},(_,i)=>{const a=Math.PI+i*Math.PI/32;return[.5+.5*Math.cos(a),1+Math.sin(a)];});
    else if(b.shape==='rounded'){
      const base=canonical(b),radius=Math.min(base.width,base.depth)*.2,rx=radius/base.width,ry=radius/base.depth;points=[];
      [[1-rx,ry,-Math.PI/2],[1-rx,1-ry,0],[rx,1-ry,Math.PI/2],[rx,ry,Math.PI]].forEach(([x,y,start])=>{for(let i=0;i<=8;i++){const a=start+i*Math.PI/16;points.push([x+rx*Math.cos(a),y+ry*Math.sin(a)]);}});
    }else points=({rectangle:[[0,0],[1,0],[1,1],[0,1]],l:[[0,0],[c,0],[c,1-d],[1,1-d],[1,1],[0,1]],t:[[0,0],[1,0],[1,d],[(1+c)/2,d],[(1+c)/2,1],[(1-c)/2,1],[(1-c)/2,d],[0,d]],u:[[0,0],[c,0],[c,1-d],[1-e,1-d],[1-e,0],[1,0],[1,1],[0,1]]})[b.shape];
    return points.map(point=>{let[x,y]=point;for(let n=0;n<b.rotation/90;n++)[x,y]=[1-y,x];return[x,y];});
  }
  function clip(b){return 'polygon('+outline(b).map(([x,y])=>`${x*100}% ${y*100}%`).join(',')+')';}
  function convexContains(points,x,y){let sign=0;for(let i=0;i<points.length;i++){const a=points[i],z=points[(i+1)%points.length],cross=(z[0]-a[0])*(y-a[1])-(z[1]-a[1])*(x-a[0]);if(Math.abs(cross)<1e-8)continue;const side=Math.sign(cross);if(sign&&side!==sign)return false;sign=side;}return true;}
  function polygonsOverlap(a,b){
    for(const p of [a,b])for(let i=0;i<p.length;i++){const v=p[i],next=p[(i+1)%p.length],axis=[next[1]-v[1],v[0]-next[0]],length=Math.hypot(...axis);if(length<1e-10)continue;const project=q=>q[0]*axis[0]/length+q[1]*axis[1]/length,aa=a.map(project),bb=b.map(project);if(Math.max(...aa)<=Math.min(...bb)+1e-8||Math.max(...bb)<=Math.min(...aa)+1e-8)return false;}
    return true;
  }
  function pieces(b){return isCurved(b)?[outline(b).map(([x,y])=>[b.x+x*b.width,b.y+y*b.depth])]:parts(b).map(r=>[[r.x,r.y],[r.x+r.width,r.y],[r.x+r.width,r.y+r.depth],[r.x,r.y+r.depth]]);}
  function treeBuilding(t){return{id:t.id,kind:'tree',x:t.x,y:t.y,width:(['bench','table'].includes(t.kind)||t.kind==='flowerbed'&&t.shape==='rectangle')?t.width:t.diameter,depth:(['bench','table'].includes(t.kind)||t.kind==='flowerbed'&&t.shape==='rectangle')?t.depth:t.diameter,rotation:0,shape:(['bench','table'].includes(t.kind)||t.kind==='flowerbed'&&t.shape==='rectangle')?'rectangle':'ellipse'};}
  function valid(b,plot,buildings=[],trees=[]){
    if(![b.x,b.y,b.width,b.depth].every(Number.isFinite)||b.width<(b.kind==='tree'?.5:1)||b.depth<(b.kind==='tree'?.5:1)||b.x<0||b.y<0||b.x+b.width>plot.width+1e-8||b.y+b.depth>plot.depth+1e-8||!shapes[b.shape]||![0,90,180,270].includes(b.rotation)||!validParameters(b))return false;
    return ![...buildings,...trees.map(treeBuilding)].some(other=>other.id!==b.id&&pieces(b).some(a=>pieces(other).some(c=>polygonsOverlap(a,c))));
  }
  function validTree(t,plot,buildings=[]){const b=treeBuilding(t);return [b.width,b.depth].every(n=>Number.isFinite(n)&&n>=.5&&n<=15)&&valid(b,plot,buildings);}
  function canonical(b) { return {...b,x:0,y:0,width:b.rotation%180?b.depth:b.width,depth:b.rotation%180?b.width:b.depth,rotation:0}; }
  function rotateRect(rect,rotation) {
    let {x,y,width,depth}=rect;
    for(let n=0;n<rotation/90;n++)[x,y,width,depth]=[1-y-depth,x,depth,width];
    return {x,y,width,depth};
  }
  function splitRoomRect(rect,b,axis,metres) {
    if(!['x','y'].includes(axis)||!Number.isFinite(metres))return null;
    const odd=b.rotation%180!==0,base=canonical(b),localAxis=odd?(axis==='x'?'y':'x'):axis;
    const extent=localAxis==='x'?'width':'depth',start=localAxis,unit=localAxis==='x'?base.width:base.depth;
    const total=rect[extent]*unit;
    if(metres<.1-1e-8||total-metres<.1-1e-8)return null;
    const cut=metres/unit,first={...rect},second={...rect};
    const reverse=axis==='x'?[90,180].includes(b.rotation):[180,270].includes(b.rotation);
    if(reverse){first[start]+=rect[extent]-cut;first[extent]=cut;second[extent]-=cut;}
    else{first[extent]=cut;second[start]+=cut;second[extent]-=cut;}
    return [first,second];
  }
  function roomRectValid(rect,b,otherRects=[]) {
    if(!rect || ![rect.x,rect.y,rect.width,rect.depth].every(Number.isFinite) || rect.x<0 || rect.y<0 || rect.width<=0 || rect.depth<=0 || rect.x+rect.width>1+1e-8 || rect.y+rect.depth>1+1e-8)return false;
    const canonicalShape={...b,x:0,y:0,width:1,depth:1,rotation:0};
    if(isCurved(b)){const polygon=outline({...canonical(b),width:canonical(b).width,depth:canonical(b).depth});if(![[rect.x,rect.y],[rect.x+rect.width,rect.y],[rect.x+rect.width,rect.y+rect.depth],[rect.x,rect.y+rect.depth]].every(([x,y])=>convexContains(polygon,x,y)))return false;}
    const occupied=parts(canonicalShape);
    const area=occupied.reduce((sum,p)=>sum+Math.max(0,Math.min(rect.x+rect.width,p.x+p.width)-Math.max(rect.x,p.x))*Math.max(0,Math.min(rect.y+rect.depth,p.y+p.depth)-Math.max(rect.y,p.y)),0);
    if(area+1e-8<rect.width*rect.depth)return false;
    return !otherRects.some(p=>rect.x<p.x+p.width-1e-8&&rect.x+rect.width>p.x+1e-8&&rect.y<p.y+p.depth-1e-8&&rect.y+rect.depth>p.y+1e-8);
  }
  function initialRooms(b) {
    const base=canonical(b),result=[];
    const inset=(1-Math.SQRT1_2)/2;
    const rectanglesForRooms=['hexagon','octagon'].includes(b.shape)?[{x:.2,y:.2,width:.6,depth:.6}]:b.shape==='ellipse'?[{x:inset,y:inset,width:Math.SQRT1_2,depth:Math.SQRT1_2}]:b.shape==='semicircle'?[{x:inset,y:1-Math.SQRT1_2,width:Math.SQRT1_2,depth:Math.SQRT1_2}]:b.shape==='rounded'?[{x:Math.min(base.width,base.depth)*.2/base.width,y:0,width:1-2*Math.min(base.width,base.depth)*.2/base.width,depth:1}]:parts({...base,width:1,depth:1});
    for(const p of rectanglesForRooms) {
      const cols=Math.ceil(p.width*base.width/30),rows=Math.ceil(p.depth*base.depth/30);
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)result.push({x:p.x+x*p.width/cols,y:p.y+y*p.depth/rows,width:p.width/cols,depth:p.depth/rows});
    }
    return result;
  }
  function centered(b, plot, buildings,trees=[]) {
    if (!Number.isFinite(b.width) || !Number.isFinite(b.depth) || b.width > plot.width || b.depth > plot.depth) return null;
    const cx = (plot.width-b.width)/2, cy = (plot.depth-b.depth)/2;
    const candidate = {...b,x:cx,y:cy};
    if (valid(candidate,plot,buildings,trees)) return candidate;
    const occupied = [...buildings,...trees.map(treeBuilding)].filter(o=>o.id!==b.id).flatMap(parts);
    const xs = new Set([0,cx,plot.width-b.width]), ys = new Set([0,cy,plot.depth-b.depth]);
    occupied.forEach(p=>{xs.add(p.x-b.width);xs.add(p.x+p.width);ys.add(p.y-b.depth);ys.add(p.y+p.depth);});
    // Include footprint-recess alignments, so irregular buildings can fit in a free cut-out.
    const local = parts({...b,x:0,y:0});
    occupied.forEach(p=>local.forEach(q=>{xs.add(p.x-q.x-q.width);xs.add(p.x+p.width-q.x);ys.add(p.y-q.y-q.depth);ys.add(p.y+p.depth-q.y);}));
    const points=[]; for(const x of xs)for(const y of ys)if(x>=0&&y>=0&&x+b.width<=plot.width+1e-8&&y+b.depth<=plot.depth+1e-8)points.push({x,y});
    points.sort((a,z)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(z.x-cx,z.y-cy));
    for(const point of points){const next={...b,...point};if(valid(next,plot,buildings,trees))return next;}
    return null;
  }
  return { isCurved,outline,clip,validTree,treeBuilding,defaults, shapes, parameters, validParameters, parts, valid, centered, canonical, rotateRect, splitRoomRect, roomRectValid, initialRooms };
})();
if (typeof module !== 'undefined') module.exports = RoomoryEstate;
