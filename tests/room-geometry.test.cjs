const {test}=require('node:test');
const assert=require('node:assert/strict');
const g=require('../room-geometry.js');
const walls=require('../wall-geometry.js');
const data=require('../data.js');
const room=corner=>({id:'r',name:'Комната',width:4,depth:3,cut:{corner,length:1,width:1},furniture:[]});
test('all four room corner cuts exclude their area and preserve the remaining floor',()=>{
 for(const corner of g.corners){const r=room(corner),c=g.removed(r);assert.equal(g.validCut(r),true);assert.equal(g.area(r),11);assert.equal(g.polygon(r).length,6);assert.equal(g.contains({...c},r),false);assert.equal(g.contains({x:1,y:1,width:2,depth:1},r),true);assert.equal(g.contains({x:0,y:0,width:4,depth:3},r),false);assert.equal(walls.valid({x:c.x,y:c.y,width:.5,depth:.5,type:'chair'},r),false);}
 const r=room('nw');assert.equal(g.contains({x:1,y:0,width:1,depth:1},r),true);assert.equal(g.contains({x:.99,y:0,width:1,depth:1},r),false);
});
test('new furniture can be placed outside the cut, or fails when no valid rectangle exists',()=>{
 const r=room('nw'),f={x:0,y:0,width:1.6,depth:2,rotation:0,type:'bed'};
 const placed=g.place(f,r);assert.ok(placed);assert.equal(g.contains(placed,r),true);assert.ok(placed.x>=1||placed.y>=1);assert.equal(Math.hypot(placed.x,placed.y),1);
 assert.equal(g.place({...f,width:4,depth:3},r),null);
 const shelf=g.place({...f,width:1,depth:.2,wall:'north'},r);assert.equal(shelf.y,0);assert.ok(shelf.x>=1);
});
test('cut geometry survives JSON without swapping horizontal and vertical dimensions',()=>{
 const r=room('nw');r.furniture=[{id:'f',name:'Стул',type:'chair',x:3,y:2,width:.5,depth:.5,rotation:0,sections:[]}];
 const first=data.validate({version:1,rooms:[r],roomId:'r'});assert.deepEqual(data.parse(JSON.stringify(first)),first);assert.equal(first.rooms[0].width,4);assert.equal(first.rooms[0].depth,3);assert.deepEqual(first.rooms[0].cut,r.cut);
 for(const cut of [{corner:'bad',length:1,width:1},{corner:'nw',length:4,width:1},{corner:'nw',length:.05,width:1},{corner:'nw',length:1,width:NaN},{corner:'se',length:1,width:1}]){const bad=structuredClone(r);bad.cut=cut;assert.throws(()=>data.validate({version:1,rooms:[bad]}));}
});
test('wall openings correspond to cut corners and limit wall furniture placement',()=>{
 const r=room('ne');assert.deepEqual(g.blockedWall(r,'north'),{u:3,span:1});assert.deepEqual(g.blockedWall(r,'east'),{u:0,span:1});assert.equal(g.blockedWall(r,'south'),null);
 const f={x:0,y:0,width:.5,depth:.3,type:'wall-shelf',wall:'north',height:.08,elevation:1.4};
 assert.equal(walls.valid(walls.fromWall(f,r,3.2,1.4),r),false);assert.equal(walls.valid(walls.fromWall(f,r,2.5,1.4),r),true);
});
