'use strict';
// Buildings share room records through buildingId; footprints never contain room data.
const RoomoryEstate = (() => {
  const shapes = { rectangle: [[0,0,1,1]], l: [[0,0,.5,1],[.5,.5,.5,.5]], t: [[0,0,1,.4],[.35,.4,.3,.6]], u: [[0,0,.3,1],[.7,0,.3,1],[.3,.65,.4,.35]] };
  const defaults = () => ({ plot: { width: 30, depth: 24 }, buildings: [{ id: 'main-house', name: 'Мой дом', kind: 'house', shape: 'rectangle', x: 3, y: 3, width: 12, depth: 10, rotation: 0 }] });
  function parameters(b) { return { c: b.shape === 't' ? .3 : b.shape === 'u' ? .3 : .5, d: b.shape === 't' ? .4 : b.shape === 'u' ? .35 : .5, e: .3, ...b.shapeParams }; }
  function rectangles(b) {
    const {c,d,e} = parameters(b);
    return b.shape === 'l' ? [[0,0,c,1],[c,1-d,1-c,d]] : b.shape === 't' ? [[0,0,1,d],[(1-c)/2,d,c,1-d]] : b.shape === 'u' ? [[0,0,c,1],[1-e,0,e,1],[c,1-d,1-c-e,d]] : shapes.rectangle;
  }
  function validParameters(b) {
    if (b.shapeParams !== undefined && (!b.shapeParams || typeof b.shapeParams !== 'object' || Array.isArray(b.shapeParams))) return false;
    if (b.shape === 'rectangle') return true;
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
  function valid(b, plot, buildings = []) {
    if (![b.x,b.y,b.width,b.depth].every(Number.isFinite) || b.width < 1 || b.depth < 1 || b.x < 0 || b.y < 0 || b.x+b.width > plot.width+1e-8 || b.y+b.depth > plot.depth+1e-8 || !shapes[b.shape] || ![0,90,180,270].includes(b.rotation) || !validParameters(b)) return false;
    const overlaps = (a,c) => a.x < c.x+c.width-1e-8 && a.x+a.width > c.x+1e-8 && a.y < c.y+c.depth-1e-8 && a.y+a.depth > c.y+1e-8;
    return !buildings.some(other => other.id !== b.id && parts(b).some(a => parts(other).some(c => overlaps(a,c))));
  }
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
    const occupied=parts({...b,x:0,y:0,width:1,depth:1,rotation:0});
    const area=occupied.reduce((sum,p)=>sum+Math.max(0,Math.min(rect.x+rect.width,p.x+p.width)-Math.max(rect.x,p.x))*Math.max(0,Math.min(rect.y+rect.depth,p.y+p.depth)-Math.max(rect.y,p.y)),0);
    if(area+1e-8<rect.width*rect.depth)return false;
    return !otherRects.some(p=>rect.x<p.x+p.width-1e-8&&rect.x+rect.width>p.x+1e-8&&rect.y<p.y+p.depth-1e-8&&rect.y+rect.depth>p.y+1e-8);
  }
  function initialRooms(b) {
    const base=canonical(b),result=[];
    for(const p of parts({...base,width:1,depth:1})) {
      const cols=Math.ceil(p.width*base.width/30),rows=Math.ceil(p.depth*base.depth/30);
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)result.push({x:p.x+x*p.width/cols,y:p.y+y*p.depth/rows,width:p.width/cols,depth:p.depth/rows});
    }
    return result;
  }
  function centered(b, plot, buildings) {
    if (!Number.isFinite(b.width) || !Number.isFinite(b.depth) || b.width > plot.width || b.depth > plot.depth) return null;
    const cx = (plot.width-b.width)/2, cy = (plot.depth-b.depth)/2;
    const candidate = {...b,x:cx,y:cy};
    if (valid(candidate,plot,buildings)) return candidate;
    const occupied = buildings.filter(o=>o.id!==b.id).flatMap(parts);
    const xs = new Set([0,cx,plot.width-b.width]), ys = new Set([0,cy,plot.depth-b.depth]);
    occupied.forEach(p=>{xs.add(p.x-b.width);xs.add(p.x+p.width);ys.add(p.y-b.depth);ys.add(p.y+p.depth);});
    // Include footprint-recess alignments, so irregular buildings can fit in a free cut-out.
    const local = parts({...b,x:0,y:0});
    occupied.forEach(p=>local.forEach(q=>{xs.add(p.x-q.x-q.width);xs.add(p.x+p.width-q.x);ys.add(p.y-q.y-q.depth);ys.add(p.y+p.depth-q.y);}));
    const points=[]; for(const x of xs)for(const y of ys)if(x>=0&&y>=0&&x+b.width<=plot.width+1e-8&&y+b.depth<=plot.depth+1e-8)points.push({x,y});
    points.sort((a,z)=>Math.hypot(a.x-cx,a.y-cy)-Math.hypot(z.x-cx,z.y-cy));
    for(const point of points){const next={...b,...point};if(valid(next,plot,buildings))return next;}
    return null;
  }
  return { defaults, shapes, parameters, validParameters, parts, valid, centered, canonical, rotateRect, splitRoomRect, roomRectValid, initialRooms };
})();
if (typeof module !== 'undefined') module.exports = RoomoryEstate;
