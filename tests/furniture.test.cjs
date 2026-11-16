const {test}=require('node:test');
const assert=require('node:assert/strict');
const furniture=require('../furniture.js');
const data=require('../data.js');
const walls=require('../wall-geometry.js');
test('all catalog furniture types retain geometry and contents through JSON backup',()=>{
 const records=Object.values(furniture.catalog).map((p,index)=>({id:`f${index}`,name:p.label,type:p.id,width:p.width,depth:p.depth,x:0,y:0,rotation:0,height:p.height,elevation:p.id==='wall-shelf'?1.4:0,wall:p.id==='wall-shelf'?'north':null,sections:[{id:`s${index}`,name:'Место',items:[{id:`i${index}`,name:'Вещь',quantity:2,note:'Заметка'}]}]}));
 const project=data.validate({version:1,rooms:[{id:'r',name:'Комната',width:10,depth:10,furniture:records}],roomId:'r'});
 assert.equal(project.rooms[0].furniture.length,21);
 assert.deepEqual(data.parse(JSON.stringify({format:'roomory-backup',...project}),true),project);
 for(const p of Object.values(furniture.catalog))assert.equal(walls.heightOf({type:p.id}),p.height);
 assert.equal(project.rooms[0].furniture.find(f=>f.type==='wall-shelf').elevation,1.4);
});
