'use strict';
// Independent editable showcase; uses its own localStorage key.
const RoomoryDemo={
  "version": 1,
  "plot": {
    "width": 32,
    "depth": 26
  },
  "buildings": [
    {
      "id": "main-house",
      "name": "Дом под яблоней",
      "kind": "house",
      "shape": "rectangle",
      "x": 3,
      "y": 3,
      "width": 12,
      "depth": 10,
      "rotation": 0
    },
    {
      "id": "cozy-workshop",
      "name": "Садовая мастерская",
      "kind": "shed",
      "shape": "rectangle",
      "x": 21,
      "y": 3,
      "width": 4,
      "depth": 5,
      "rotation": 0
    },
    {
      "id": "cozy-gazebo",
      "name": "Беседка для чая",
      "kind": "gazebo",
      "shape": "rectangle",
      "x": 20,
      "y": 16,
      "width": 5,
      "depth": 5,
      "rotation": 0
    }
  ],
  "trees": [
    {
      "id": "cozy-apple",
      "variety": "fruit",
      "name": "Яблоня",
      "kind": "tree",
      "x": 3,
      "y": 17,
      "diameter": 4
    },
    {
      "id": "cozy-oak",
      "variety": "oak",
      "name": "Дуб",
      "kind": "tree",
      "x": 12,
      "y": 18,
      "diameter": 5
    },
    {
      "id": "cozy-garden-bench",
      "kind": "bench",
      "name": "Лавочка у яблони",
      "x": 7,
      "y": 17,
      "width": 2,
      "depth": 0.6,
      "diameter": 2,
      "rotation": 0
    },
    {
      "id": "cozy-garden-table",
      "kind": "table",
      "name": "Стол для летних завтраков",
      "x": 25,
      "y": 17,
      "width": 2,
      "depth": 1,
      "diameter": 2,
      "rotation": 0
    }
  ],
  "rooms": [
    {
      "id": "cozy-room-16",
      "name": "Гостиная у камина",
      "width": 6,
      "depth": 5,
      "buildingId": "main-house",
      "buildingRect": {
        "x": 0,
        "y": 0,
        "width": 0.5,
        "depth": 0.5
      },
      "wallHeight": 2.8,
      "furniture": [
        {
          "id": "cozy-furniture-4",
          "name": "Льняной диван",
          "type": "sofa",
          "x": 0.4,
          "y": 1,
          "width": 2.2,
          "depth": 0.9,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-1",
              "name": "Без отдельной полки",
              "system": true,
              "items": [
                {
                  "id": "cozy-item-2",
                  "name": "Плед",
                  "quantity": 2,
                  "note": "Зелёный и молочный; для вечеров с книгой",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-3",
                  "name": "Подушка",
                  "quantity": 3,
                  "note": "Льняные чехлы",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-10",
          "name": "Книжный стеллаж",
          "type": "shelf",
          "x": 0.2,
          "y": 0.1,
          "width": 2,
          "depth": 0.35,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-5",
              "name": "Верхняя полка",
              "items": [
                {
                  "id": "cozy-item-6",
                  "name": "Хоббит",
                  "quantity": 1,
                  "note": "Подарочное издание",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-7",
                  "name": "Альбом путешествий",
                  "quantity": 2,
                  "note": "Рядом с книгами",
                  "icon": "▣"
                }
              ]
            },
            {
              "id": "cozy-section-8",
              "name": "Нижняя полка",
              "items": [
                {
                  "id": "cozy-item-9",
                  "name": "Настольные игры",
                  "quantity": 4,
                  "note": "Коробки подписаны",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-14",
          "name": "Журнальный столик",
          "type": "coffee-table",
          "x": 3,
          "y": 2,
          "width": 1,
          "depth": 0.6,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-11",
              "name": "Ящик",
              "items": [
                {
                  "id": "cozy-item-12",
                  "name": "Свечи",
                  "quantity": 6,
                  "note": "В небольшой коробке",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-13",
                  "name": "Спички",
                  "quantity": 2,
                  "note": "Держать вдали от детей",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-15",
          "name": "Кресло для чтения",
          "type": "armchair",
          "x": 4.6,
          "y": 0.4,
          "width": 0.9,
          "depth": 0.9,
          "rotation": 0,
          "sections": []
        }
      ],
      "door": {
        "wall": "south",
        "offset": 4,
        "width": 0.9
      }
    },
    {
      "id": "cozy-room-31",
      "name": "Спальня под крышей",
      "width": 6,
      "depth": 5,
      "buildingId": "main-house",
      "buildingRect": {
        "x": 0.5,
        "y": 0,
        "width": 0.5,
        "depth": 0.5
      },
      "wallHeight": 2.8,
      "furniture": [
        {
          "id": "cozy-furniture-20",
          "name": "Дубовая кровать",
          "type": "bed",
          "x": 2,
          "y": 0.4,
          "width": 1.8,
          "depth": 2.1,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-17",
              "name": "Под кроватью",
              "items": [
                {
                  "id": "cozy-item-18",
                  "name": "Постельное бельё",
                  "quantity": 3,
                  "note": "Льняные комплекты",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-19",
                  "name": "Плед",
                  "quantity": 1,
                  "note": "Запасной, шерстяной",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-26",
          "name": "Шкаф у окна",
          "type": "wardrobe",
          "x": 0.2,
          "y": 0.2,
          "width": 1.5,
          "depth": 0.65,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-21",
              "name": "Верхняя полка",
              "items": [
                {
                  "id": "cozy-item-22",
                  "name": "Зимний шарф",
                  "quantity": 2,
                  "note": "В тканевом кофре",
                  "icon": "▣"
                }
              ]
            },
            {
              "id": "cozy-section-23",
              "name": "Вешалки",
              "items": [
                {
                  "id": "cozy-item-24",
                  "name": "Пальто",
                  "quantity": 1,
                  "note": "",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-25",
                  "name": "Рубашка",
                  "quantity": 5,
                  "note": "Светлые слева",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-30",
          "name": "Прикроватная тумба",
          "type": "nightstand",
          "x": 4,
          "y": 0.5,
          "width": 0.55,
          "depth": 0.5,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-27",
              "name": "Ящик",
              "items": [
                {
                  "id": "cozy-item-28",
                  "name": "Зарядка",
                  "quantity": 1,
                  "note": "USB-C",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-29",
                  "name": "Маска для сна",
                  "quantity": 1,
                  "note": "",
                  "icon": "▣"
                }
              ]
            }
          ]
        }
      ],
      "door": {
        "wall": "south",
        "offset": 0.5,
        "width": 0.8
      }
    },
    {
      "id": "cozy-room-45",
      "name": "Кабинет картографа",
      "width": 6,
      "depth": 5,
      "buildingId": "main-house",
      "buildingRect": {
        "x": 0,
        "y": 0.5,
        "width": 0.5,
        "depth": 0.5
      },
      "wallHeight": 2.8,
      "furniture": [
        {
          "id": "cozy-furniture-35",
          "name": "Письменный стол",
          "type": "desk",
          "x": 2,
          "y": 0.5,
          "width": 1.8,
          "depth": 0.8,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-32",
              "name": "Правый ящик",
              "items": [
                {
                  "id": "cozy-item-33",
                  "name": "Флешка",
                  "quantity": 2,
                  "note": "Одна — резервная копия курсовой",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-34",
                  "name": "Карандаш",
                  "quantity": 8,
                  "note": "",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-39",
          "name": "Полка с камерой",
          "type": "shelf",
          "x": 1,
          "y": 0,
          "width": 1.6,
          "depth": 0.3,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-36",
              "name": "На полке",
              "items": [
                {
                  "id": "cozy-item-37",
                  "name": "Фотоаппарат",
                  "quantity": 1,
                  "note": "Нижняя настенная полка, 1,2 м от пола",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-38",
                  "name": "Объектив",
                  "quantity": 2,
                  "note": "В чёрном футляре",
                  "icon": "▣"
                }
              ]
            }
          ],
          "wall": "north",
          "height": 0.1,
          "elevation": 1.2
        },
        {
          "id": "cozy-furniture-43",
          "name": "Полка с архивом",
          "type": "shelf",
          "x": 1,
          "y": 0,
          "width": 1.6,
          "depth": 0.3,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-40",
              "name": "На полке",
              "items": [
                {
                  "id": "cozy-item-41",
                  "name": "Документы",
                  "quantity": 4,
                  "note": "Верхняя настенная полка, 1,9 м от пола",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-42",
                  "name": "Карта Средиземья",
                  "quantity": 1,
                  "note": "В тубусе",
                  "icon": "▣"
                }
              ]
            }
          ],
          "wall": "north",
          "height": 0.1,
          "elevation": 1.9
        },
        {
          "id": "cozy-furniture-44",
          "name": "Рабочий стул",
          "type": "chair",
          "x": 2.7,
          "y": 1.7,
          "width": 0.55,
          "depth": 0.55,
          "rotation": 0,
          "sections": []
        }
      ],
      "door": {
        "wall": "east",
        "offset": 3.5,
        "width": 0.8
      }
    },
    {
      "id": "cozy-room-56",
      "name": "Кухня и чайная",
      "width": 6,
      "depth": 5,
      "buildingId": "main-house",
      "buildingRect": {
        "x": 0.5,
        "y": 0.5,
        "width": 0.5,
        "depth": 0.5
      },
      "wallHeight": 2.8,
      "furniture": [
        {
          "id": "cozy-furniture-51",
          "name": "Чайный шкаф",
          "type": "wardrobe",
          "x": 0.2,
          "y": 0.2,
          "width": 1.2,
          "depth": 0.5,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-46",
              "name": "Верхняя полка",
              "items": [
                {
                  "id": "cozy-item-47",
                  "name": "Чашка",
                  "quantity": 6,
                  "note": "Керамические, ручная работа",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-48",
                  "name": "Чай с жасмином",
                  "quantity": 2,
                  "note": "Банки по 100 г",
                  "icon": "▣"
                }
              ]
            },
            {
              "id": "cozy-section-49",
              "name": "Ящик",
              "items": [
                {
                  "id": "cozy-item-50",
                  "name": "Салфетка",
                  "quantity": 8,
                  "note": "Льняные",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-54",
          "name": "Большой стол",
          "type": "desk",
          "x": 2,
          "y": 2,
          "width": 2,
          "depth": 1,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-52",
              "name": "Без отдельной полки",
              "system": true,
              "items": [
                {
                  "id": "cozy-item-53",
                  "name": "Ваза",
                  "quantity": 1,
                  "note": "Сухоцветы",
                  "icon": "▣"
                }
              ]
            }
          ]
        },
        {
          "id": "cozy-furniture-55",
          "name": "Стул у стола",
          "type": "chair",
          "x": 2.6,
          "y": 3.3,
          "width": 0.55,
          "depth": 0.55,
          "rotation": 0,
          "sections": []
        }
      ],
      "door": {
        "wall": "west",
        "offset": 1,
        "width": 0.9
      },
      "cut": {
        "corner": "se",
        "length": 1,
        "width": 1
      }
    },
    {
      "id": "cozy-room-57",
      "name": "Инструменты и семена",
      "buildingId": "cozy-workshop",
      "buildingRect": {
        "x": 0,
        "y": 0,
        "width": 1,
        "depth": 1
      },
      "width": 4,
      "depth": 5,
      "furniture": [
        {
          "id": "cozy-furniture-64",
          "name": "Стеллаж садовника",
          "type": "shelf",
          "x": 0.2,
          "y": 0.2,
          "width": 1.8,
          "depth": 0.5,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-58",
              "name": "Инструменты",
              "items": [
                {
                  "id": "cozy-item-59",
                  "name": "Секатор",
                  "quantity": 1,
                  "note": "В зелёном чехле",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-60",
                  "name": "Перчатки",
                  "quantity": 3,
                  "note": "Размеры S и M",
                  "icon": "▣"
                }
              ]
            },
            {
              "id": "cozy-section-61",
              "name": "Семена",
              "items": [
                {
                  "id": "cozy-item-62",
                  "name": "Семена лаванды",
                  "quantity": 4,
                  "note": "Для клумбы у беседки",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-63",
                  "name": "Семена ромашки",
                  "quantity": 2,
                  "note": "Посадить весной",
                  "icon": "▣"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "cozy-room-65",
      "name": "Чайный уголок",
      "buildingId": "cozy-gazebo",
      "buildingRect": {
        "x": 0.2,
        "y": 0.2,
        "width": 0.6,
        "depth": 0.6
      },
      "width": 3,
      "depth": 3,
      "furniture": [
        {
          "id": "cozy-furniture-69",
          "name": "Скамья с сундуком",
          "type": "bench",
          "x": 0.2,
          "y": 0.2,
          "width": 1.8,
          "depth": 0.5,
          "rotation": 0,
          "sections": [
            {
              "id": "cozy-section-66",
              "name": "Под сиденьем",
              "items": [
                {
                  "id": "cozy-item-67",
                  "name": "Плед",
                  "quantity": 2,
                  "note": "Для прохладных вечеров",
                  "icon": "▣"
                },
                {
                  "id": "cozy-item-68",
                  "name": "Подушка",
                  "quantity": 4,
                  "note": "Убрать в мастерскую перед дождём",
                  "icon": "▣"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "activeBuildingId": "main-house",
  "roomId": "cozy-room-16",
  "selectedId": "cozy-furniture-4"
};
if(typeof module!=='undefined')module.exports=RoomoryDemo;
