'use strict';

// Geometry is in metres. The plan converts it to percentages without pixel-based data.
const bedroom = {
  id: 'bedroom', name: 'Спальня', width: 5, depth: 4,
  furniture: [
    { id: 'wardrobe', name: 'Шкаф', type: 'wardrobe', x: .18, y: .12, width: 1.8, depth: .65, rotation: 0,
      sections: [{ name: 'Верхняя полка', items: [{ id: 'blanket', name: 'Плед', icon: '▤', quantity: 1 }, { id: 'scarf', name: 'Зимний шарф', icon: '≋', quantity: 2 }] }, { name: 'Основное отделение', items: [{ id: 'sweater', name: 'Свитер', icon: '♧', quantity: 3 }, { id: 'jacket', name: 'Куртка', icon: '♧', quantity: 1 }] }] },
    { id: 'bed', name: 'Кровать', type: 'bed', x: 2.55, y: .24, width: 1.6, depth: 2, rotation: 0,
      sections: [{ name: 'Ящик под кроватью', items: [{ id: 'linen', name: 'Постельное бельё', icon: '▤', quantity: 2 }] }] },
    { id: 'nightstand', name: 'Тумба', type: 'nightstand', x: 4.3, y: .35, width: .52, depth: .55, rotation: 0,
      sections: [{ name: 'Ящик', items: [{ id: 'charger', name: 'Зарядка для телефона', icon: 'ϟ', quantity: 1 }, { id: 'book', name: 'Книга', icon: '▥', quantity: 1 }] }] },
    { id: 'shelf', name: 'Стеллаж', type: 'shelf', x: .18, y: 1.35, width: .55, depth: 1.65, rotation: 90,
      sections: [{ name: 'Средняя полка', items: [{ id: 'notebooks', name: 'Тетради', icon: '▥', quantity: 5 }, { id: 'album', name: 'Фотоальбом', icon: '▧', quantity: 1 }] }] },
    { id: 'dresser', name: 'Комод', type: 'dresser', x: 1.65, y: 3.16, width: 1.3, depth: .65, rotation: 0,
      sections: [{ name: 'Верхний ящик', items: [{ id: 'passport', name: 'Паспорт', icon: '▣', quantity: 1 }, { id: 'documents', name: 'Документы', icon: '▤', quantity: 1 }] }] },
    { id: 'desk', name: 'Стол', type: 'desk', x: 3.45, y: 3.05, width: 1.3, depth: .75, rotation: 0,
      sections: [{ name: 'Ящик стола', items: [{ id: 'headphones', name: 'Наушники', icon: 'Ω', quantity: 1 }, { id: 'pens', name: 'Ручки', icon: '╱', quantity: 4 }] }] },
  ],
};

const rooms = [bedroom, {
  id: 'office', name: 'Кабинет', width: 4, depth: 3,
  furniture: [
    { id: 'office-desk', name: 'Рабочий стол', type: 'desk', x: 1.3, y: .15, width: 1.8, depth: .75, rotation: 0,
      sections: [{ name: 'Правый ящик', items: [{ id: 'usb', name: 'Флешка', icon: '▣', quantity: 2 }, { id: 'office-headphones', name: 'Наушники', icon: 'Ω', quantity: 1 }] }] },
    { id: 'office-shelf', name: 'Стеллаж', type: 'shelf', x: .15, y: .2, width: .6, depth: 1.5, rotation: 90,
      sections: [{ name: 'Верхняя полка', items: [{ id: 'office-books', name: 'Книги по информатике', icon: '▥', quantity: 4 }] }] },
    { id: 'office-cabinet', name: 'Комод', type: 'dresser', x: 2.5, y: 2.15, width: 1.2, depth: .65, rotation: 0, sections: [] },
  ],
}, { id: 'living', name: 'Гостиная', width: 5, depth: 3.5, furniture: [] }];
let room = bedroom;

const STORAGE_KEY = 'roomory.ui.v2';
let selectedId = 'wardrobe';
let foundItemId = null;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved?.version === 2) {
    room = rooms.find(candidate => candidate.id === saved.roomId) || bedroom;
    selectedId = room.furniture.find(f => f.id === saved.selectedId)?.id || room.furniture[0]?.id || null;
  }
} catch { showStorageNotice(); }

function showStorageNotice() {
  const status = document.querySelector('#storage-status');
  status.hidden = false;
  status.textContent = 'Не удалось прочитать или сохранить выбор мебели. Остальные функции доступны.';
}
function saveSelection() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, roomId: room.id, selectedId })); }
  catch { showStorageNotice(); }
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function itemWord(n) {
  if (n % 100 >= 11 && n % 100 <= 14) return 'вещей';
  return n % 10 === 1 ? 'вещь' : n % 10 >= 2 && n % 10 <= 4 ? 'вещи' : 'вещей';
}
function itemsOf(furniture) { return furniture.sections.flatMap(section => section.items); }
function renderPlan() {
  const plan = document.querySelector('#floor-plan');
  plan.style.aspectRatio = `${room.width} / ${room.depth}`;
  plan.style.backgroundSize = `${.5 / room.width * 100}% ${.5 / room.depth * 100}%`;
  plan.setAttribute('aria-label', `План комнаты ${room.name}. Выберите мебель`);
  document.querySelector('.dimension-top span').textContent = `${room.width} м`;
  document.querySelector('.dimension-left span').textContent = `${room.depth} м`;
  document.querySelector('#empty-room').hidden = room.furniture.length > 0;
  plan.classList.toggle('is-empty', !room.furniture.length);
  plan.querySelectorAll('.furniture').forEach(node => node.remove());
  room.furniture.forEach(furniture => {
    const button = element('button', `furniture ${furniture.type}`);
    button.type = 'button';
    button.dataset.id = furniture.id;
    button.style.left = `${furniture.x / room.width * 100}%`;
    button.style.top = `${furniture.y / room.depth * 100}%`;
    button.style.width = `${furniture.width / room.width * 100}%`;
    button.style.height = `${furniture.depth / room.depth * 100}%`;
    button.setAttribute('aria-label', `${furniture.name}, посмотреть содержимое`);
    button.append(element('span', 'furniture-name', furniture.name));
    const count = itemsOf(furniture).length;
    button.append(element('span', 'furniture-items', `${count} ${itemWord(count)}`));
    button.addEventListener('click', () => selectFurniture(furniture.id));
    plan.append(button);
  });
}
function selectFurniture(id, itemId = null) {
  selectedId = id;
  foundItemId = itemId;
  saveSelection();
  renderDetails();
}
function renderDetails() {
  const furniture = room.furniture.find(f => f.id === selectedId);
  document.querySelectorAll('.furniture').forEach(button => {
    const selected = button.dataset.id === selectedId;
    button.classList.toggle('is-selected', selected);
    button.classList.toggle('is-match', selected && foundItemId !== null);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('.details-card').classList.toggle('has-no-selection', !furniture);
  document.querySelector('#empty-details').hidden = Boolean(furniture);
  if (!furniture) return;
  document.querySelector('#furniture-number').textContent = `0${room.furniture.indexOf(furniture) + 1}`;
  document.querySelector('#furniture-name').textContent = furniture.name;
  const count = itemsOf(furniture).length;
  document.querySelector('#item-count').textContent = `${count} ${itemWord(count)}`;
  document.querySelector('#contents-total').textContent = String(count).padStart(2, '0');
  document.querySelector('#furniture-meta').textContent = `${room.name} · ${furniture.width.toLocaleString('ru')} × ${furniture.depth.toLocaleString('ru')} м`;
  // Fixed, application-owned SVG illustration; user data is always rendered with textContent.
  document.querySelector('#furniture-illustration').innerHTML = '<svg viewBox="0 0 100 100" fill="none"><ellipse cx="50" cy="91" rx="36" ry="5" fill="#edf0e5"/><path d="M22 18 71 10 83 19v66l-50 7-11-8V18Z" fill="#e5eadb" stroke="#95a385" stroke-width="1.5"/><path d="m22 18 11 8 50-7M33 26v66M58 23v65M71 10v9" stroke="#95a385" stroke-width="1.5"/><path d="m52 51-1 13m12-14-1 13" stroke="#7c8f6c" stroke-width="2" stroke-linecap="round"/><path d="M28 87v7m49-8v6" stroke="#95a385" stroke-width="2"/></svg>';
  if (furniture.type !== 'wardrobe') {
    const shapes = {
      dresser: '<rect x="20" y="25" width="60" height="58" rx="4" fill="#e9dfc9"/><path d="M20 44h60M20 63h60M46 35h9M46 54h9M46 73h9M26 83v7M74 83v7"/>',
      desk: '<path d="M13 35h75v9H13z" fill="#e9dfc9"/><path d="M20 44v42M81 44v42M58 44v27h23M58 57h23M67 50h6M67 64h6"/>',
      shelf: '<rect x="25" y="13" width="50" height="75" rx="3" fill="#e5eadb"/><path d="M25 38h50M25 63h50M31 36V22h8v14M41 36V19h6v17M50 36l-3-14M31 61V47h12v14M49 61V45h15v16M32 86V73h28v13"/>',
      nightstand: '<rect x="23" y="31" width="54" height="48" rx="4" fill="#e9dfc9"/><path d="M23 55h54M46 43h9M46 67h9M30 79v9M70 79v9"/>',
      bed: '<rect x="20" y="13" width="60" height="76" rx="6" fill="#e7e5da"/><rect x="26" y="20" width="21" height="16" rx="3" fill="#fffdf5"/><rect x="53" y="20" width="21" height="16" rx="3" fill="#fffdf5"/><path d="M20 43h60M27 89v5M73 89v5"/>',
    };
    document.querySelector('#furniture-illustration').innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="#91a080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">${shapes[furniture.type] || shapes.dresser}</svg>`;
  }
  const contents = document.querySelector('#contents');
  contents.replaceChildren();
  if (!count) {
    const empty = element('div', 'empty-contents');
    empty.append(element('span', '', '▱'), element('h3', '', 'Пока ничего не лежит'), element('p', '', 'Здесь появится список вещей. Добавление содержимого — на следующем этапе.'));
    contents.append(empty);
  }
  furniture.sections.forEach(section => {
    const group = element('section', 'storage-group');
    group.append(element('h3', '', section.name));
    section.items.forEach(item => {
      const row = element('div', `item${item.id === foundItemId ? ' is-found' : ''}`);
      const icon = element('span', 'item-icon', item.icon);
      icon.setAttribute('aria-hidden', 'true');
      row.append(icon, element('span', '', item.name), element('small', '', `${item.quantity} шт.`));
      group.append(row);
    });
    contents.append(group);
  });
}
const search = document.querySelector('#search');
const results = document.querySelector('#search-results');
function renderSearch() {
  const query = search.value.trim().toLocaleLowerCase('ru');
  results.replaceChildren();
  foundItemId = null;
  renderDetails();
  if (!query) {
    results.hidden = true;
    document.querySelector('#search-status').textContent = '';
    return;
  }
  const matches = [];
  rooms.forEach(matchRoom => matchRoom.furniture.forEach(furniture => furniture.sections.forEach(section => section.items.forEach(item => {
    if (item.name.toLocaleLowerCase('ru').includes(query)) matches.push({ matchRoom, furniture, section, item });
  }))));
  results.hidden = false;
  document.querySelector('#search-status').textContent = matches.length ? `Найдено: ${matches.length}` : 'Ничего не найдено';
  if (!matches.length) results.append(element('p', 'no-results', 'Пока ничего не нашли. Попробуйте «паспорт», «шарф» или «зарядка».'));
  matches.forEach(({ matchRoom, furniture, section, item }) => {
    const button = element('button', 'search-result');
    button.type = 'button';
    button.append(element('strong', '', item.name), element('small', '', `${matchRoom.name} → ${furniture.name} → ${section.name}`));
    button.addEventListener('click', () => {
      room = matchRoom;
      renderRoom();
      selectFurniture(furniture.id, item.id);
      results.hidden = true;
      document.querySelector('#search-status').textContent = `${item.name}: ${room.name}, ${furniture.name}, ${section.name}`;
      document.querySelector(`.furniture[data-id="${furniture.id}"]`).focus({ preventScroll: true });
      document.querySelector('.details-card').scrollIntoView({ behavior: 'instant', block: 'nearest' });
    });
    results.append(button);
  });
}
search.addEventListener('input', renderSearch);
search.addEventListener('focus', () => { if (search.value.trim()) renderSearch(); });
search.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' && !results.hidden) { event.preventDefault(); results.querySelector('button')?.focus(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') results.hidden = true;
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); search.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.search-section')) results.hidden = true; });
function selectRoom(id) {
  room = rooms.find(candidate => candidate.id === id);
  selectedId = room.furniture[0]?.id || null;
  foundItemId = null;
  search.value = '';
  results.hidden = true;
  document.querySelector('#search-status').textContent = '';
  saveSelection();
  renderRoom();
}
function renderRoom() {
  const navigation = document.querySelector('#room-navigation');
  navigation.replaceChildren();
  rooms.forEach(candidate => {
    const button = element('button', 'room-tab');
    button.type = 'button';
    if (candidate.id === room.id) button.setAttribute('aria-current', 'page');
    const label = element('span', 'room-tab-label', candidate.name);
    label.append(element('small', '', `${(candidate.width * candidate.depth).toLocaleString('ru')} м² · ${candidate.furniture.length ? 'демокомната' : 'пустая комната'}`));
    button.append(element('span', 'room-symbol', candidate.id === 'bedroom' ? '▧' : candidate.id === 'office' ? '▤' : '⌂'), label, element('span', 'room-count', candidate.furniture.length));
    button.addEventListener('click', () => selectRoom(candidate.id));
    navigation.append(button);
  });
  document.querySelector('#breadcrumb-room').textContent = room.name;
  document.querySelector('#room-title').textContent = room.name;
  document.querySelector('.card-header p').textContent = `Вид сверху · ${room.width} × ${room.depth} м`;
  document.querySelector('#room-area').textContent = `${(room.width * room.depth).toLocaleString('ru')} м²`;
  const total = room.furniture.flatMap(itemsOf).length;
  document.querySelector('#room-stats').textContent = `${room.furniture.length} ${room.furniture.length === 3 ? 'места' : 'мест'} хранения · ${total} ${itemWord(total)}`;
  renderPlan();
  renderDetails();
}
document.querySelector('#back-to-bedroom').addEventListener('click', () => selectRoom('bedroom'));
renderRoom();
