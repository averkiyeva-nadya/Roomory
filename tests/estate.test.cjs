const {test}=require('node:test');
const assert=require('node:assert/strict');
const estate=require('../estate.js');
const data=require('../data.js');
const building=(id,x,y,width=4,depth=3,shape='rectangle',rotation=0)=>({id,name:id,kind:'shed',x,y,width,depth,shape,rotation});
test('footprints reject overlap and boundaries but allow touching edges',()=>{
 const plot={width:20,depth:20},a=building('a',0,0);
 assert.equal(estate.valid(building('b',3,0),plot,[a]),false);
 assert.equal(estate.valid(building('b',4,0),plot,[a]),true);
 for(const b of [building('b',-1,0),building('b',19,0),building('b',0,19),building('b',NaN,0)])assert.equal(estate.valid(b,plot,[a]),false);
});
test('L shape permits a building in the recess; rotation changes occupied parts',()=>{
 const plot={width:20,depth:20},a=building('a',0,0,10,10,'l');
 const b=building('b',6,0,3,3);
 assert.equal(estate.valid(b,plot,[a]),true);
 assert.equal(estate.valid(b,plot,[{...a,rotation:90}]),false);
 assert.equal(estate.parts({...a,rotation:360}).length,2);
});
test('legacy data migrates all rooms into the main house without modifying input',()=>{
 const old={version:1,rooms:[{id:'r',name:'Комната',width:3,depth:2,furniture:[]}],roomId:'r'};
 const result=data.validate(old);
 assert.equal(result.rooms[0].buildingId,'main-house');assert.equal(old.rooms[0].buildingId,undefined);
 assert.deepEqual(data.parse(JSON.stringify(result)),result);
});
test('separate building room namespaces survive backup; empty building does not select a house room',()=>{
 const input={version:1,...estate.defaults(),activeBuildingId:'shed',rooms:[{id:'r',name:'Комната',width:3,depth:2,furniture:[],buildingId:'main-house'}],roomId:'r'};
 input.buildings.push(building('shed',20,0));
 const next=data.validate(input);assert.equal(next.roomId,null);assert.equal(next.activeBuildingId,'shed');
 next.rooms.push({id:'shed-room',name:'Комната',width:3,depth:2,furniture:[],buildingId:'shed'});next.roomId='shed-room';
 assert.deepEqual(data.parse(JSON.stringify({format:'roomory-backup',...data.validate(next)}),true),data.validate(next));
 for(const mutate of [p=>p.rooms[0].buildingId='missing',p=>{p.buildings[1].x=3;p.buildings[1].y=4;},p=>p.plot.width=5,p=>p.buildings[1].shape='triangle',p=>p.buildings.splice(0,1)]){
  const invalid=structuredClone(next);mutate(invalid);assert.throws(()=>data.validate(invalid));
 }
});
test('custom wing dimensions change footprints and persist through rotated JSON backups',()=>{
 const b={...building('shed',20,0,6,4,'t'),shapeParams:{c:.5,d:.25,e:.3}};
 assert.deepEqual(estate.parts(b),[{x:20,y:0,width:6,depth:1},{x:21.5,y:1,width:3,depth:3}]);
 const input={version:1,...estate.defaults(),rooms:[]};input.buildings.push({...b,width:4,depth:6,rotation:90});
 const saved=data.validate(input);assert.deepEqual(saved.buildings[1].shapeParams,b.shapeParams);
 assert.deepEqual(data.parse(JSON.stringify(saved)),saved);
 for(const params of [{c:0,d:.4},{c:1.1,d:.4},{c:.4,d:NaN},{c:.4,d:.4,e:'bad'}])assert.equal(estate.valid({...b,shapeParams:params},input.plot,[]),false);
 assert.equal(estate.valid({...b,shape:'u',shapeParams:{c:.6,d:.4,e:.5}},input.plot,[]),false);
});
test('new buildings start at center, or a nearby valid location if the center is occupied',()=>{
 const plot={width:30,depth:24},b=building('shed',0,0,4,4);
 const centered=estate.centered(b,plot,[]);assert.equal(centered.x,13);assert.equal(centered.y,10);
 const obstacle=building('main-house',12,9,6,6);
 const nearby=estate.centered(b,plot,[obstacle]);assert.ok(nearby);assert.equal(estate.valid(nearby,plot,[obstacle]),true);
 assert.ok(Math.hypot(nearby.x-13,nearby.y-10)<=5);
 assert.equal(estate.centered(b,plot,[building('main-house',0,0,30,24)]),null);
});
test('room partitions cover each custom footprint without intersecting its cut-outs',()=>{
 for(const shape of ['rectangle','l','t','u']){
  const b={...building('shed',0,0,8,6,shape),shapeParams:{c:.25,d:.4,e:.3}};
  const rects=estate.initialRooms(b);
  rects.forEach((r,i)=>assert.equal(estate.roomRectValid(r,b,rects.filter((_,j)=>i!==j)),true));
  const area=rects.reduce((sum,r)=>sum+r.width*r.depth,0),expected=estate.parts({...b,width:1,depth:1}).reduce((sum,r)=>sum+r.width*r.depth,0);
  assert.ok(Math.abs(area-expected)<1e-8);
 }
 const l=building('shed',0,0,8,6,'l');
 assert.equal(estate.roomRectValid({x:.6,y:0,width:.2,depth:.2},l),false);
 assert.equal(estate.roomRectValid({x:0,y:0,width:.5,depth:1},l,[{x:0,y:0,width:.2,depth:.2}]),false);
});
test('room locations survive backup and reject overlaps or mismatched room sizes',()=>{
 const b=building('shed',20,0,6,4,'t'),base=estate.canonical(b);
 const input={version:1,...estate.defaults(),activeBuildingId:'shed',rooms:[]};input.buildings.push(b);
 input.rooms=estate.initialRooms(b).map((rect,i)=>({id:`r${i}`,name:`Помещение ${i}`,buildingId:'shed',buildingRect:rect,width:rect.width*base.width,depth:rect.depth*base.depth,furniture:[]}));
 const valid=data.validate(input);assert.deepEqual(data.parse(JSON.stringify(valid)),valid);
 for(const mutate of [p=>p.rooms[0].buildingRect.x=-.1,p=>p.rooms[0].width=2,p=>{p.rooms[1]={...p.rooms[0],id:'r1'};}]){const invalid=structuredClone(input);mutate(invalid);assert.throws(()=>data.validate(invalid));}
 assert.equal(input.rooms[0].wallHeight,undefined);
});
test('measured room cuts follow the visible left/top edge at every rotation',()=>{
 const rect={x:.2,y:.1,width:.5,depth:.6};
 for(const rotation of [0,90,180,270])for(const axis of ['x','y']){
  const b=building('shed',0,0,rotation%180?4:6,rotation%180?6:4,'rectangle',rotation);
  const result=estate.splitRoomRect(rect,b,axis,.7);assert.ok(result);
  const visible=estate.rotateRect(rect,rotation),first=estate.rotateRect(result[0],rotation),second=estate.rotateRect(result[1],rotation);
  if(axis==='x'){assert.ok(Math.abs(first.x-visible.x)<1e-8);assert.ok(Math.abs(first.width*b.width-.7)<1e-8);assert.ok(Math.abs(second.x-first.x-first.width)<1e-8);}
  else{assert.ok(Math.abs(first.y-visible.y)<1e-8);assert.ok(Math.abs(first.depth*b.depth-.7)<1e-8);assert.ok(Math.abs(second.y-first.y-first.depth)<1e-8);}
  assert.equal(estate.roomRectValid(result[0],b,[result[1]]),true);
  assert.ok(Math.abs(result.reduce((sum,r)=>sum+r.width*r.depth,0)-rect.width*rect.depth)<1e-8);
  assert.equal(estate.splitRoomRect(rect,b,axis,0),null);assert.equal(estate.splitRoomRect(rect,b,axis,999),null);assert.equal(estate.splitRoomRect(rect,b,axis,NaN),null);
 }
});
