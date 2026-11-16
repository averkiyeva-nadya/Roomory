'use strict';
const RoomoryFurniture = (() => {
  const entries = [
    ['wardrobe','Шкаф',1.8,.65,2,'Хранение'],['dresser','Комод',1.2,.5,.9,'Хранение'],['shelf','Стеллаж',1,.35,1.8,'Хранение'],['wall-shelf','Настенная полка',1.2,.25,.08,'Хранение'],['bookcase','Книжный шкаф',.9,.35,1.9,'Хранение'],['cabinet','Шкафчик',.8,.45,.9,'Хранение'],['chest','Сундук',1,.55,.55,'Хранение'],['shoe-rack','Обувница',.8,.3,.8,'Хранение'],['rack','Вешалка',1,.45,1.7,'Хранение'],['storage-box','Контейнер',.6,.4,.35,'Хранение'],['kitchen-cabinet','Кухонный шкаф',.8,.6,.9,'Хранение'],
    ['bed','Кровать',1.6,2,.5,'Отдых и сиденья'],['sofa','Диван',2,.9,.85,'Отдых и сиденья'],['armchair','Кресло',.85,.85,.9,'Отдых и сиденья'],['chair','Стул',.45,.5,.9,'Отдых и сиденья'],['bench','Скамья',1.2,.4,.45,'Отдых и сиденья'],['nightstand','Тумба',.5,.45,.55,'Отдых и сиденья'],
    ['desk','Письменный стол',1.2,.65,.75,'Столы'],['dining-table','Обеденный стол',1.4,.8,.75,'Столы'],['coffee-table','Журнальный столик',.9,.5,.45,'Столы'],['workbench','Верстак',1.5,.7,.9,'Столы']
  ];
  const catalog=Object.fromEntries(entries.map(([id,label,width,depth,height,group])=>[id,{id,label,width,depth,height,group}]));
  return {catalog,types:Object.keys(catalog)};
})();
if(typeof module!=='undefined')module.exports=RoomoryFurniture;
