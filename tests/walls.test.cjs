const {test}=require('node:test');const assert=require('node:assert/strict');const WG=require('../wall-geometry.js');const data=require('../data.js');
const room={width:5,depth:4,wallHeight:2.7};
for(const wall of Object.keys(WG.labels)) test(`${wall}: wall projection round-trips to the same top-view position`,()=>{
 const f=WG.fromWall({wall,width:1.2,depth:.3,height:.08,elevation:1.4},room,.8,1.6);
 const p=WG.project(f,room); assert.ok(Math.abs(p.u-.8)<1e-8);assert.equal(p.z,1.6);assert.ok(WG.valid(f,room));
 assert.deepEqual(WG.fromWall(f,room,p.u,p.z),f);
});
test('two shelves share a footprint but preserve independent heights',()=>{const f={wall:'north',width:1.2,depth:.3,height:.08};const a=WG.fromWall(f,room,.5,1.2),b=WG.fromWall(f,room,.5,1.8);assert.equal(a.x,b.x);assert.equal(a.y,b.y);assert.notEqual(a.elevation,b.elevation);});
test('rejects ceiling overflow and preserves wall when room grows',()=>{const f={wall:'east',x:4, y:.5,width:1,depth:.3,height:1,elevation:2};assert.equal(WG.valid(f,room),false);const moved=WG.pin({...f,elevation:0},{...room,width:6});assert.equal(moved.x,5);assert.equal(moved.y,.5);assert.ok(WG.valid(moved,{...room,width:6}));});
test('JSON backup preserves wall geometry and rejects conflicting wall anchor',()=>{const f={id:'f',name:'Полка',type:'shelf',width:1,depth:.3,x:.5,y:0,rotation:0,wall:'north',height:.08,elevation:1.8,sections:[]};const p={version:1,rooms:[{id:'r',name:'Комната',...room,furniture:[f]}]};const validated=data.validate(p);assert.equal(validated.rooms[0].furniture[0].elevation,1.8);assert.equal(validated.rooms[0].wallHeight,2.7);f.y=.3;assert.throws(()=>data.validate(p),/стеной/);});
