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
// Two independent shelves at one floor-plan footprint demonstrate vertical storage.
rooms[1].furniture.push(
  { id: 'demo-shelf-lower', name: 'Нижняя полка', type: 'shelf', x: 1.3, y: 0, width: 1.4, depth: .25, rotation: 0, wall: 'north', height: .08, elevation: 1.2, sections: [{ name: 'На полке', items: [{ id: 'demo-shelf-camera', name: 'Фотоаппарат', quantity: 1, note: 'Нижняя полка', icon: '▣' }] }] },
  { id: 'demo-shelf-upper', name: 'Верхняя полка', type: 'shelf', x: 1.3, y: 0, width: 1.4, depth: .25, rotation: 0, wall: 'north', height: .08, elevation: 1.8, sections: [{ name: 'На полке', items: [{ id: 'demo-shelf-box', name: 'Архивные документы', quantity: 1, note: 'В серой коробке', icon: '▤' }] }] }
);
const estateDefaults = RoomoryEstate.defaults();
let plot = estateDefaults.plot;
const buildings = estateDefaults.buildings;
let activeBuildingId = 'main-house';
let plotOpen = false;
let estateMovingId = null;
rooms.forEach(r => { r.buildingId = 'main-house'; });
function buildingRooms() { return rooms.filter(r => r.buildingId === activeBuildingId); }
function activeBuilding() { return buildings.find(b => b.id === activeBuildingId) || buildings[0]; }
function buildingName(r) { return buildings.find(b => b.id === r.buildingId)?.name || 'Мой дом'; }
let room = bedroom;
let viewMode = 'top';
let activeWall = 'north';
let homeOpen = false;
let movingId = null;
let lastRouteKey = null;
let lastSpaceKey = null;
let lastDetailId = null;
const WG = RoomoryWallGeometry;

const STORAGE_KEY = 'roomory.project.v1';
let selectedId = 'wardrobe';
let foundItemId = null;
let storageReadFailed = false;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== null) {
    const saved = RoomoryData.parse(raw);
    plot = saved.plot; buildings.splice(0, buildings.length, ...saved.buildings); activeBuildingId = saved.activeBuildingId;
    rooms.splice(0, rooms.length, ...saved.rooms);
    room = rooms.find(candidate => candidate.id === saved.roomId) || emptyProjectRoom();
    selectedId = saved.selectedId; homeOpen = !room.id;
  }
} catch { storageReadFailed = true; showStorageNotice(); }
function emptyProjectRoom() { return { id: null, buildingId: activeBuildingId, name: 'Нет комнат', width: 5, depth: 4, furniture: [] }; }

function showStorageNotice() {
  const status = document.querySelector('#storage-status');
  status.hidden = false;
  status.textContent = storageReadFailed ? 'Сохранённый проект повреждён: показан демонстрационный пример. Исходная запись не перезаписывается. Для восстановления импортируйте проверенную копию JSON.' : 'Браузер не смог сохранить изменения. Пока они доступны только в этой вкладке. Скачайте резервную копию JSON перед закрытием.';
}
function saveSelection() {
  if (storageReadFailed) { showStorageNotice(); return false; }
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projectSnapshot())); document.querySelector('#storage-status').hidden = true; return true; }
  catch { showStorageNotice(); return false; }
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
function ensureSections(furniture) {
  furniture.sections.forEach(section => { if (!section.id) section.id = `section-${crypto.randomUUID()}`; });
  if (!furniture.sections.some(section => section.system === true)) furniture.sections.push({ id: `section-${crypto.randomUUID()}`, name: 'Без отдельной полки', system: true, items: [] });
}
function renderPlan() {
  const plan = document.querySelector('#floor-plan');
  plan.style.aspectRatio = `${room.width} / ${room.depth}`;
  plan.style.width = `min(100%, ${520 * room.width / room.depth}px)`;
  plan.style.marginInline = 'auto';
  plan.style.backgroundSize = `${.5 / room.width * 100}% ${.5 / room.depth * 100}%`;
  plan.setAttribute('aria-label', `План комнаты ${room.name}. Выберите мебель`);
  document.querySelector('.dimension-top span').textContent = `${room.width} м`;
  document.querySelector('.dimension-left span').textContent = `${room.depth} м`;
  document.querySelector('#empty-room').hidden = room.furniture.length > 0;
  document.querySelector('#empty-room h3').textContent = room.id ? 'Нет мебели' : 'Нет комнат';
  document.querySelector('#empty-room p').textContent = room.id ? 'Разместите первый предмет мебели — укажите название и размеры, затем передвиньте его на плане.' : 'Создайте комнату, задайте её размеры и разместите мебель.';
  plan.classList.toggle('is-empty', !room.furniture.length);
  plan.querySelectorAll('.furniture').forEach(node => node.remove());
  room.furniture.forEach(furniture => {
    const button = element('button', `furniture ${furniture.type}${['shelf','wall-shelf'].includes(furniture.type) && WG.heightOf(furniture) < .3 ? ' is-floating' : ''}`);
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
    const levels = room.furniture.filter(other => Math.abs(other.x - furniture.x) < .01 && Math.abs(other.y - furniture.y) < .01 && Math.abs(other.width - furniture.width) < .01 && Math.abs(other.depth - furniture.depth) < .01);
    if (levels.length > 1) { button.classList.add('is-stacked'); button.dataset.levels = String(levels.length); }
    if (levels.length > 1) button.append(element('span', 'level-badge', `${levels.length} уровня`));
    button.addEventListener('click', () => { if (!button.suppressClick) selectFurniture(furniture.id); });
    attachMovement(button, furniture);
    plan.append(button);
  });
}
function selectFurniture(id, itemId = null) {
  if (selectedId !== id) movingId = null;
  selectedId = id;
  foundItemId = itemId;
  saveSelection();
  renderDetails();
  renderWallView();
}
function renderDetails() {
  const furniture = room.furniture.find(f => f.id === selectedId);
  document.querySelectorAll('.furniture, .wall-object, .mini-object').forEach(button => {
    const selected = button.dataset.id === selectedId;
    button.classList.toggle('is-selected', selected);
    button.classList.toggle('is-match', selected && foundItemId !== null);
    button.setAttribute('aria-pressed', String(selected));
    const unlocked = movingId === button.dataset.id;
    button.classList.toggle('is-movable', unlocked);
    if (button.matches('.furniture, .wall-object')) button.style.touchAction = unlocked ? 'none' : 'auto';
    if (button.matches('.furniture.is-stacked')) { const f = room.furniture.find(item => item.id === button.dataset.id); button.querySelector('.furniture-name').textContent = selected ? f.name : `Полки: ${button.dataset.levels}`; }
  });
  const detailsPanel = document.querySelector('.details-card');
  detailsPanel.removeAttribute('aria-labelledby');
  detailsPanel.setAttribute('aria-label', furniture ? `Содержимое: ${furniture.name}` : 'Содержимое мебели');
  detailsPanel.classList.toggle('has-no-selection', !furniture);
  document.querySelector('#empty-details').hidden = Boolean(furniture);
  if (!furniture) return;
  const moving = movingId === furniture.id;
  document.querySelector('#toggle-move').textContent = moving ? 'Зафиксировать' : 'Переместить';
  document.querySelector('#toggle-move').setAttribute('aria-pressed', String(moving));
  document.querySelector('#move-hint').textContent = moving ? 'Перетаскивайте предмет или используйте стрелки. Шаг — 10 см.' : 'Расположение зафиксировано.';
  document.querySelectorAll('[data-move]').forEach(button => { button.disabled = !moving; });
  document.querySelector('#rotate-furniture').disabled = !moving;
  document.querySelector('#object-position').textContent = `${furniture.wall ? WG.labels[furniture.wall] + ' · ' : ''}${furniture.elevation > 0 ? `Нижний край: ${format(furniture.elevation)} м от пола` : 'Стоит на полу'} · высота: ${format(WG.heightOf(furniture))} м`;
  document.querySelector('#show-object-wall').hidden = !furniture.wall;
  const stacked = document.querySelector('#stacked-items'); stacked.replaceChildren();
  const neighbours = room.furniture.filter(f => f.x < furniture.x + furniture.width && f.x + f.width > furniture.x && f.y < furniture.y + furniture.depth && f.y + f.depth > furniture.y && f.wall && f.wall === furniture.wall);
  stacked.hidden = neighbours.length < 2;
  if (neighbours.length > 1) {
    stacked.append(element('p', '', 'На этом участке стены'));
    neighbours.sort((a,b) => (a.elevation || 0) - (b.elevation || 0)).forEach(f => { const b = element('button', '', `${f.name} · ${format(f.elevation || 0)} м`); b.type='button'; b.setAttribute('aria-pressed', String(f.id === selectedId)); b.addEventListener('click', () => { viewMode='wall'; activeWall=f.wall; selectFurniture(f.id); }); stacked.append(b); });
  }
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
    Object.assign(shapes,{
      sofa:'<rect x="18" y="29" width="64" height="39" rx="10" fill="#d5dfbf"/><path d="M18 48h64M50 48v20M13 48h12v29H13zM75 48h12v29H75zM20 77v8M80 77v8"/>',
      armchair:'<rect x="27" y="20" width="46" height="43" rx="12" fill="#d5dfbf"/><path d="M27 48h46M21 46h12v32H21zM67 46h12v32H67zM28 78v9M72 78v9"/>',
      chair:'<rect x="30" y="14" width="40" height="40" rx="5" fill="#e7d6b5"/><path d="M26 55h48v9H26zM32 64v24M68 64v24M43 21v25M57 21v25"/>',
      bench:'<path d="M15 45h70v12H15zM22 57v27M78 57v27M22 72h56" fill="#e7d6b5"/>',
      table:'<rect x="12" y="34" width="76" height="13" rx="4" fill="#e7d6b5"/><path d="M22 47v39M78 47v39"/>',
      'wall-shelf':'<path d="M13 53h74v9H13zM25 62v20l14-20M75 62v20L61 62" fill="#e7d6b5"/><path d="M25 52V23h9v29M39 52V18h10v34M57 52V31h18v21"/>',
      chest:'<path d="M18 46q0-25 32-25t32 25v35H18z" fill="#e7d6b5"/><path d="M18 48h64M33 25v55M67 25v55M46 45h8v14h-8z"/>'
    });
    const aliases={'bookcase':'shelf','cabinet':'nightstand','shoe-rack':'shelf','rack':'shelf','storage-box':'chest','kitchen-cabinet':'dresser','dining-table':'table','coffee-table':'table','workbench':'desk'};
    document.querySelector('#furniture-illustration').innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="#91a080" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">${shapes[furniture.type] || shapes[aliases[furniture.type]] || shapes.dresser}</svg>`;
  }
  ensureSections(furniture);
  const contents = document.querySelector('#contents');
  contents.replaceChildren();
  if (!count) {
    const empty = element('div', 'empty-contents');
    empty.append(element('span', '', '▱'), element('h3', '', 'Пока ничего не лежит'), element('p', '', 'Добавьте первую вещь: выберите полку или оставьте её без отдельного места.'));
    contents.append(empty);
  }
  furniture.sections.forEach(section => {
    const group = element('section', 'storage-group');
    const heading = element('div', 'section-heading');
    heading.append(element('h3', '', section.name));
    if (!section.system) {
      const edit = element('button', 'section-edit', 'Изменить');
      edit.type = 'button';
      edit.setAttribute('aria-label', `Изменить место «${section.name}»`);
      edit.addEventListener('click', () => openContent('section', section));
      heading.append(edit);
    }
    group.append(heading);
    if (!section.items.length) group.append(element('p', 'section-empty', section.system ? 'Вещи без привязки к полке или ящику.' : 'Здесь пока нет вещей.'));
    section.items.forEach(item => {
      const row = element('button', `item${item.id === foundItemId ? ' is-found' : ''}`);
      row.type = 'button';
      row.dataset.itemId = item.id;
      row.setAttribute('aria-label', `Редактировать вещь «${item.name}», ${item.quantity} шт.`);
      const icon = element('span', 'item-icon', item.icon || '▣');
      icon.setAttribute('aria-hidden', 'true');
      const label = element('span', 'item-label');
      label.append(element('span', 'item-name', item.name));
      if (item.note) label.append(element('span', 'item-note', item.note));
      row.append(icon, label, element('small', '', `${item.quantity} шт.`));
      row.addEventListener('click', () => openContent('item', item, section));
      group.append(row);
    });
    contents.append(group);
  });
  if (lastDetailId !== furniture.id) {
    lastDetailId = furniture.id;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const node of [contents, document.querySelector('.details-title')]) { node.getAnimations().forEach(a => a.cancel()); node.animate([{ opacity: .6, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 190, easing: 'ease-out' }); }
    }
  }
}
const search = document.querySelector('#search');
const results = document.querySelector('#search-results');
function renderSearch() {
  const query = search.value.trim().normalize('NFKC').toLocaleLowerCase('ru');
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
    if (item.name.normalize('NFKC').toLocaleLowerCase('ru').includes(query)) matches.push({ matchRoom, furniture, section, item });
  }))));
  results.hidden = false;
  document.querySelector('#search-status').textContent = matches.length ? `Найдено: ${matches.length}` : 'Ничего не найдено';
  if (matches.length) results.append(element('p', 'results-caption', `Найдено: ${matches.length}. Выберите нужное место.`));
  if (!matches.length) results.append(element('p', 'no-results', 'Ничего не найдено. Проверьте название или попробуйте часть слова.'));
  matches.forEach(({ matchRoom, furniture, section, item }) => {
    const button = element('button', 'search-result');
    button.type = 'button';
    button.append(element('strong', '', item.name), element('small', '', `${buildingName(matchRoom)} → ${matchRoom.name} → ${furniture.name} → ${section.name}${furniture.wall ? ` · ${WG.labels[furniture.wall]}, ${format(furniture.elevation ?? 0)} м от пола` : ''}`));
    button.addEventListener('click', () => {
      movingId = null; room = matchRoom; activeBuildingId = room.buildingId; plotOpen = false; homeOpen = false;
      viewMode = furniture.wall ? 'wall' : 'top'; if (furniture.wall) activeWall = furniture.wall;
      renderRoom();
      selectFurniture(furniture.id, item.id);
      results.hidden = true;
      document.querySelector('#search-status').textContent = `${item.name}: ${buildingName(room)}, ${room.name}, ${furniture.name}, ${section.name}`;
      focusFurniture();
      document.querySelector('.item.is-found')?.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    results.append(button);
  });
}
search.addEventListener('input', renderSearch);
search.addEventListener('focus', () => { if (search.value.trim()) renderSearch(); });
results.addEventListener('keydown', event => {
  const buttons = [...results.querySelectorAll('button')];
  const index = buttons.indexOf(document.activeElement);
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus(); }
  if (event.key === 'Escape') { search.focus(); results.hidden = true; }
});
search.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' && !results.hidden) { event.preventDefault(); results.querySelector('button')?.focus(); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') results.hidden = true;
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !event.ctrlKey && !event.metaKey && !event.altKey && !document.querySelector('#editor-dialog').open && !document.querySelector('#content-dialog').open && !document.querySelector('#import-dialog').open && !document.querySelector('#genius-dialog').open && !document.querySelector('#estate-dialog').open) { event.preventDefault(); search.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('.search-section')) results.hidden = true; });
function selectRoom(id) {
  movingId = null;
  homeOpen = false; plotOpen = false; viewMode = 'top'; estateMovingId = null;
  room = rooms.find(candidate => candidate.id === id);
  activeBuildingId = room.buildingId;
  selectedId = room.furniture[0]?.id || null;
  foundItemId = null;
  search.value = '';
  results.hidden = true;
  document.querySelector('#search-status').textContent = '';
  saveSelection();
  renderRoom();
}
function renderRoom() {
  document.querySelector('#workspace').classList.toggle('project-is-empty', !room.id);
  document.querySelector('.empty-details p').textContent = room.id ? 'Выберите мебель на плане — здесь появятся её отделения и содержимое.' : 'Сначала создайте комнату и добавьте мебель.';
  document.querySelector('#edit-room').disabled = !room.id;
  document.querySelector('#new-furniture').disabled = !room.id;
  document.querySelector('#back-to-bedroom').textContent = room.id ? 'Добавить мебель ＋' : 'Перейти в «Мой дом»';
  document.querySelector('.rooms-heading span').textContent = String(buildingRooms().length).padStart(2, '0');
  const navigation = document.querySelector('#room-navigation');
  navigation.replaceChildren();
  buildingRooms().forEach(candidate => {
    const button = element('button', 'room-tab');
    button.type = 'button';
    if (candidate.id === room.id && !homeOpen) button.setAttribute('aria-current', 'page');
    const label = element('span', 'room-tab-label');
    const roomName = element('span', 'room-tab-name', candidate.name); roomName.title = candidate.name; label.append(roomName);
    label.append(element('small', '', `${(candidate.width * candidate.depth).toLocaleString('ru')} м² · ${candidate.furniture.length ? 'мебель на плане' : 'пустая комната'}`));
    button.append(element('span', 'room-symbol', candidate.id === 'bedroom' ? '▧' : candidate.id === 'office' ? '▤' : '⌂'), label, element('span', 'room-count', candidate.furniture.length));
    button.addEventListener('click', () => selectRoom(candidate.id));
    navigation.append(button);
  });
  document.querySelector('#breadcrumb-room').textContent = room.name;
  document.querySelector('#room-title').textContent = room.name;
  document.querySelector('.card-header p').textContent = `Вид сверху · ${room.width} × ${room.depth} м`;
  document.querySelector('#room-area').textContent = `${(room.width * room.depth).toLocaleString('ru')} м²`;
  const total = room.furniture.flatMap(itemsOf).length;
  document.querySelector('#room-stats').textContent = `${room.furniture.length} ${room.furniture.length % 10 === 1 && room.furniture.length % 100 !== 11 ? 'место' : [2,3,4].includes(room.furniture.length % 10) && ![12,13,14].includes(room.furniture.length % 100) ? 'места' : 'мест'} хранения · ${total} ${itemWord(total)}`;
  renderPlan();
  renderDetails();
  renderWallView();
  renderHome();
  renderEstate();
  renderRoomInventory();
  animateNavigation();
}
document.querySelector('#back-to-bedroom').addEventListener('click', () => { if (room.id) openEditor('new-furniture'); else { homeOpen = true; renderRoom(); document.querySelector('#new-room').focus(); } });

// Rectangle dimensions describe its current footprint. Rotation swaps width/depth.
function fits(f, r) { return f.x >= 0 && f.y >= 0 && f.x + f.width <= r.width + 1e-8 && f.y + f.depth <= r.depth + 1e-8; }
function format(n) { return n.toLocaleString('ru', { maximumFractionDigits: 2 }); }
function notify(message) { const node = document.querySelector('#editor-status'); node.textContent = message; if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.getAnimations().forEach(a => a.cancel()); node.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 180, easing: 'ease-out' }); } }
function currentFurniture() { return room.furniture.find(f => f.id === selectedId); }
function commit(message) { foundItemId = null; search.value = ''; results.hidden = true; document.querySelector('#search-status').textContent = ''; const saved = saveSelection(); renderRoom(); notify(saved ? message : 'Изменения только в этой вкладке: сохранение недоступно. Скачайте экспорт JSON.'); }
function snapWithin(n, max) { return Math.max(0, Math.min(Math.round(n * 10) / 10, Math.floor((max + 1e-8) * 10) / 10)); }
function moveObject(f, x, y) {
  f.x = snapWithin(x, room.width - f.width);
  f.y = snapWithin(y, room.depth - f.depth);
  if (f.wall) Object.assign(f, WG.pin(f, room));
}
function focusFurniture() { document.querySelector(`${viewMode === 'wall' ? '.wall-object' : '.furniture'}[data-id="${selectedId}"]`)?.focus({ preventScroll: true }); }
function attachMovement(button, f) {
  button.style.touchAction = movingId === f.id ? 'none' : 'auto';
  let drag = null;
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    selectFurniture(f.id);
    if (movingId !== f.id) return;
    const plan = document.querySelector('#floor-plan');
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originalX: f.x, originalY: f.y, width: plan.clientWidth, depth: plan.clientHeight, moved: false };
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    moveObject(f, drag.originalX + dx / drag.width * room.width, drag.originalY + dy / drag.depth * room.depth);
    button.style.left = `${f.x / room.width * 100}%`;
    button.style.top = `${f.y / room.depth * 100}%`;
    renderDetails();
  });
  function finish(event, cancelled) {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const moved = drag.moved;
    if (cancelled) { f.x = drag.originalX; f.y = drag.originalY; }
    drag = null;
    if (moved) { button.suppressClick = true; commit(cancelled ? 'Перемещение отменено.' : `${f.name}: положение сохранено.`); focusFurniture(); }
  }
  button.addEventListener('pointerup', event => finish(event, false));
  button.addEventListener('pointercancel', event => finish(event, true));
  button.addEventListener('keydown', event => {
    const delta = { ArrowLeft: [-.1, 0], ArrowRight: [.1, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1] }[event.key];
    if (!delta || movingId !== f.id) return;
    event.preventDefault(); moveObject(f, f.x + delta[0], f.y + delta[1]); commit(`${f.name}: положение сохранено.`); focusFurniture();
  });
}
const dialog = document.querySelector('#editor-dialog');
const form = document.querySelector('#editor-form');
let editorMode = null;
let deletionAction = null;
function openEditor(mode) {
  editorMode = mode;
  deletionAction = null;
  const isRoom = mode.endsWith('room');
  lastPresetName=null;
  const existing = mode.startsWith('edit') ? (isRoom ? room : currentFurniture()) : null;
  if (mode === 'edit-furniture' && !existing) return;
  document.querySelector('#edit-fields').hidden = false;
  document.querySelector('#dialog-title').textContent = ({ 'new-room': 'Новая комната', 'edit-room': 'Параметры комнаты', 'new-furniture': 'Новая мебель', 'edit-furniture': 'Параметры мебели' })[mode];
  document.querySelector('#dialog-description').textContent = isRoom ? `Постройка: ${activeBuilding().name}. Размеры в метрах, от 0,1 до 30. При уменьшении вся мебель должна помещаться в новых границах.` : 'Размеры текущего положения на плане. Шаг перемещения — 10 см. Пересечение мебели допускается.';
  document.querySelector('#edit-name').value = existing?.name || '';
  document.querySelector('#edit-width').value = existing?.width || (isRoom ? 5 : 1);
  document.querySelector('#edit-depth').value = existing?.depth || (isRoom ? 4 : .6);
  document.querySelector('#edit-type').value = existing?.type || 'wardrobe';
  document.querySelector('#type-label').hidden = isRoom;
  document.querySelector('#elevation-label').hidden = isRoom;
  document.querySelector('#wall-field-label').hidden = isRoom;
  document.querySelector('#edit-height').min = isRoom ? '.5' : '.05';
  document.querySelector('#edit-height').value = isRoom ? WG.ceiling(existing || room) : existing ? WG.heightOf(existing) : 1;
  document.querySelector('#edit-elevation').value = existing?.elevation ?? 0;
  document.querySelector('#edit-wall').value = existing?.wall || (!isRoom && viewMode === 'wall' ? activeWall : '');
  document.querySelector('#edit-elevation').disabled = Boolean(existing && !isRoom && movingId !== existing.id);
  document.querySelector('#edit-wall').disabled = Boolean(existing && !isRoom && movingId !== existing.id);
  document.querySelector('#delete-room').hidden = mode !== 'edit-room';
  document.querySelector('#dialog-error').textContent = '';
  document.querySelector('#save-dialog').textContent = existing ? 'Сохранить' : 'Создать';
  document.querySelector('#save-dialog').classList.remove('danger-button');
  if(mode==='new-furniture')applyFurniturePreset();
  dialog.showModal();
  document.querySelector('#edit-name').focus();
}
function askDeletion(title, description, action) {
  // Confirmation includes contents so destructive editing is explicit.
  deletionAction = action;
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-description').textContent = description;
  document.querySelector('#edit-fields').hidden = true;
  document.querySelector('#delete-room').hidden = true;
  document.querySelector('#dialog-error').textContent = '';
  document.querySelector('#save-dialog').textContent = 'Удалить';
  document.querySelector('#save-dialog').classList.add('danger-button');
  if (!dialog.open) dialog.showModal();
  document.querySelector('#cancel-dialog').focus();
}
function rotateSelected() {
  const f = currentFurniture(); if (!f || movingId !== f.id) return;
  const candidate = WG.pin({ ...f, width: f.depth, depth: f.width }, room);
  if (!fits(candidate, room)) { notify('Поворот не выполнен: мебель выйдет за границы. Сдвиньте её от стены или увеличьте комнату.'); return; }
  Object.assign(f, candidate, { rotation: (f.rotation + 90) % 360 });
  commit(`${f.name}: поворот на 90° сохранён.`);
}
for (const id of ['new-room', 'edit-room', 'new-furniture', 'edit-furniture']) document.querySelector(`#${id}`).addEventListener('click', () => openEditor(id));
document.querySelector('#rotate-furniture').addEventListener('click', rotateSelected);
for (const id of ['close-dialog', 'cancel-dialog']) document.querySelector(`#${id}`).addEventListener('click', () => dialog.close());
document.querySelector('#delete-furniture').addEventListener('click', () => {
  const f = currentFurniture(); if (!f) return;
  if (itemsOf(f).length) { notify(`В «${f.name}» есть вещи. Чтобы не потерять содержимое, сначала переместите их в другую мебель или удалите по отдельности.`); return; }
  askDeletion(`Удалить «${f.name}»?`, `Будут удалены мебель, все её отделения и вещи (${itemsOf(f).length} названий). Отменить удаление после подтверждения нельзя.`, () => {
    room.furniture.splice(room.furniture.indexOf(f), 1); selectedId = room.furniture[0]?.id || null; commit('Мебель удалена.');
  });
});
document.querySelector('#delete-room').addEventListener('click', () => {
  const target = room;
  if (room.furniture.flatMap(itemsOf).length) { dialog.close(); notify('В комнате есть вещи. Сначала перенесите их в другую комнату или удалите по отдельности. Удаление комнаты заблокировано.'); return; }
  askDeletion(`Удалить «${room.name}»?`, `Будет удалена комната со всей мебелью (${room.furniture.length}) и вещами (${room.furniture.flatMap(itemsOf).length} названий). Отменить удаление после подтверждения нельзя.`, () => {
    rooms.splice(rooms.indexOf(target), 1); room = buildingRooms()[0] || emptyProjectRoom(); selectedId = room.furniture[0]?.id || null; commit('Комната удалена.');
  });
});
document.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => {
  const f = currentFurniture(); if (!f || movingId !== f.id) return;
  const [dx, dy] = { left: [-.1, 0], right: [.1, 0], up: [0, -.1], down: [0, .1] }[button.dataset.move];
  if (viewMode === 'wall' && f.wall === activeWall) moveOnWall(f, dx, -dy); else moveObject(f, f.x + dx, f.y + dy); commit(`${f.name}: положение сохранено.`);
}));
form.addEventListener('submit', event => {
  event.preventDefault();
  if (deletionAction) { const action = deletionAction; deletionAction = null; action(); dialog.close(); return; }
  const error = document.querySelector('#dialog-error');
  const name = document.querySelector('#edit-name').value.trim();
  const width = document.querySelector('#edit-width').valueAsNumber;
  const depth = document.querySelector('#edit-depth').valueAsNumber;
  if (!name || name.length > 60) { error.textContent = 'Введите название от 1 до 60 символов.'; return; }
  if (![width, depth].every(n => Number.isFinite(n) && n >= .1 && n <= 30)) { error.textContent = 'Укажите оба размера от 0,1 до 30 метров.'; return; }
  const height = document.querySelector('#edit-height').valueAsNumber;
  const elevation = document.querySelector('#edit-elevation').valueAsNumber;
  const wall = document.querySelector('#edit-wall').value || null;
  const isRoom = editorMode.endsWith('room');
  if (!Number.isFinite(height) || height < (isRoom ? .5 : .05) || height > 10) { error.textContent = isRoom ? 'Высота стен: от 0,5 до 10 м.' : 'Высота предмета: от 0,05 до 10 м.'; return; }
  if (!isRoom && (!Number.isFinite(elevation) || elevation < 0 || elevation + height > WG.ceiling(room) + 1e-8)) { error.textContent = 'Высота предмета и отступ от пола должны помещаться под потолком.'; return; }
  if (editorMode === 'new-room') {
    room = { id: `room-${crypto.randomUUID()}`, buildingId: activeBuildingId, name, width, depth, wallHeight: height, furniture: [] }; rooms.push(room); selectedId = null; homeOpen = false; viewMode = 'top';
  } else if (editorMode === 'edit-room') {
    const resized = { ...room, width, depth, wallHeight: height };
    const conflicts = room.furniture.filter(f => !WG.valid(WG.pin(f, resized), resized));
    if (conflicts.length) { error.textContent = `Изменения не сохранены. За новыми границами: ${conflicts.map(f => f.name).join(', ')}. Сначала переместите или уменьшите эту мебель либо увеличьте размеры комнаты.`; return; }
    if(room.buildingRect){
      const building=activeBuilding(),base=RoomoryEstate.canonical(building),rect={...room.buildingRect,width:width/base.width,depth:depth/base.depth};
      if(!RoomoryEstate.roomRectValid(rect,building,buildingRooms().filter(r=>r!==room&&r.buildingRect).map(r=>r.buildingRect))){error.textContent='Комната пересекает соседнюю или выходит за контур постройки. Уменьшите размеры.';return;}room.buildingRect=rect;
    }
    Object.assign(room, { name, width, depth, wallHeight: height });
    room.furniture.forEach(f => Object.assign(f, WG.pin(f, room)));
  } else {
    const existing = editorMode === 'edit-furniture' ? currentFurniture() : null;
    const candidate = WG.pin({ x: existing?.x || 0, y: existing?.y || 0, width, depth, wall, height, elevation }, room);
    if (!fits(candidate, room)) { error.textContent = 'Мебель не помещается в комнате в этом положении. Уменьшите размеры или сначала переместите её.'; return; }
    const type = document.querySelector('#edit-type').value;
    if (existing) Object.assign(existing, candidate, { name, type });
    else { const f = { id: `furniture-${crypto.randomUUID()}`, name, type, ...candidate, rotation: 0, sections: [] }; room.furniture.push(f); selectedId = f.id; }
  }
  if (!isRoom && wall) { activeWall = wall; }
  dialog.close(); commit('Изменения сохранены в этом браузере.');
});

const contentDialog = document.querySelector('#content-dialog');
let contentMode = null;
let contentTarget = null;
let contentSection = null;
let contentFurniture = null;
let locationChoices = [];
function openContent(mode, target = null, section = null) {
  contentMode = mode; contentTarget = target; contentSection = section; contentFurniture = currentFurniture();
  if (!contentFurniture) return;
  ensureSections(contentFurniture);
  document.querySelector('#content-title').textContent = mode === 'section' ? (target ? 'Место хранения' : 'Новое место хранения') : (target ? 'Редактировать вещь' : 'Новая вещь');
  document.querySelector('#content-description').textContent = mode === 'section' ? 'Полка, ящик или отделение. При удалении места вещи останутся в этой мебели без отдельной полки.' : 'Выберите место в любой постройке. Чтобы переместить вещь, поменяйте место хранения и сохраните.';
  document.querySelector('#content-name').value = target?.name || '';
  document.querySelector('#content-name').maxLength = mode === 'section' ? 60 : 80;
  document.querySelector('#item-fields').hidden = mode === 'section';
  document.querySelector('#content-quantity').value = target?.quantity || 1;
  document.querySelector('#content-note').value = target?.note || '';
  document.querySelector('#remove-content').hidden = !target;
  document.querySelector('#content-error').textContent = '';
  const select = document.querySelector('#content-location'); select.replaceChildren(); locationChoices = [];
  rooms.forEach(candidateRoom => candidateRoom.furniture.forEach(f => {
    ensureSections(f);
    f.sections.forEach(candidateSection => {
      const option = element('option', '', `${buildingName(candidateRoom)} → ${candidateRoom.name} → ${f.name} → ${candidateSection.name}`);
      option.value = String(locationChoices.length);
      option.selected = f === contentFurniture && (section ? candidateSection === section : candidateSection.system === true);
      locationChoices.push({ room: candidateRoom, furniture: f, section: candidateSection }); select.append(option);
    });
  }));
  contentDialog.showModal(); document.querySelector('#content-name').focus();
}
for (const id of ['close-content', 'cancel-content']) document.querySelector(`#${id}`).addEventListener('click', () => contentDialog.close());
document.querySelector('#add-section').addEventListener('click', () => openContent('section'));
document.querySelector('#add-item').addEventListener('click', () => openContent('item'));
document.querySelector('#content-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#content-name').value.trim();
  const error = document.querySelector('#content-error');
  const surprise = contentMode === 'item' && /шл[еэё]пк/iu.test(name.normalize('NFKC')) && (!contentTarget || !/шл[еэё]пк/iu.test(contentTarget.name.normalize('NFKC')));
  const max = contentMode === 'section' ? 60 : 80;
  if (!name || name.length > max) { error.textContent = `Введите название от 1 до ${max} символов.`; return; }
  if (contentMode === 'section') {
    if (contentFurniture.sections.some(s => s !== contentTarget && s.name.toLocaleLowerCase('ru') === name.toLocaleLowerCase('ru'))) { error.textContent = 'Такое место хранения уже есть в этой мебели.'; return; }
    if (contentTarget) contentTarget.name = name;
    else contentFurniture.sections.splice(contentFurniture.sections.length - 1, 0, { id: `section-${crypto.randomUUID()}`, name, items: [] });
  } else {
    const quantity = document.querySelector('#content-quantity').valueAsNumber;
    const note = document.querySelector('#content-note').value.trim();
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999999) { error.textContent = 'Количество должно быть целым числом от 1 до 999999.'; return; }
    if (note.length > 1000) { error.textContent = 'Заметка должна быть не длиннее 1000 символов.'; return; }
    const location = locationChoices[Number(document.querySelector('#content-location').value)];
    if (!location) { error.textContent = 'Выберите место хранения.'; return; }
    if (contentTarget) {
      Object.assign(contentTarget, { name, quantity, note });
      if (location.section !== contentSection) {
        contentSection.items.splice(contentSection.items.indexOf(contentTarget), 1);
        location.section.items.push(contentTarget);
      }
    } else location.section.items.push({ id: `item-${crypto.randomUUID()}`, name, quantity, note, icon: '▣' });
    room = location.room; activeBuildingId = room.buildingId; plotOpen = false; selectedId = location.furniture.id; homeOpen = false;
    if (location.furniture.wall) { activeWall = location.furniture.wall; viewMode = 'wall'; } else viewMode = 'top';
  }
  contentDialog.close(); commit('Содержимое сохранено в этом браузере.');
  if (surprise) showGenius();
});
document.querySelector('#remove-content').addEventListener('click', () => {
  if (!contentTarget) return;
  const target = contentTarget, section = contentSection, f = contentFurniture;
  contentDialog.close();
  if (contentMode === 'section') {
    askDeletion(`Убрать место «${target.name}»?`, `Все записи (${target.items.length}) будут перенесены в «Без отдельной полки» внутри этой же мебели. Содержимое не удаляется.`, () => {
      f.sections.find(s => s.system === true).items.push(...target.items);
      f.sections.splice(f.sections.indexOf(target), 1);
      commit('Место хранения удалено. Все вещи сохранены без отдельной полки.');
    });
  } else {
    askDeletion(`Удалить вещь «${target.name}»?`, `Будет удалена запись и всё указанное количество (${target.quantity} шт.). Мебель и остальные вещи сохранятся.`, () => {
      section.items.splice(section.items.indexOf(target), 1); commit('Вещь удалена.');
    });
  }
});
rooms.forEach(r => r.furniture.forEach(ensureSections));

function projectSnapshot() { return { version: 1, plot, buildings, activeBuildingId, rooms, roomId: room.id, selectedId }; }
function exportProject() {
  try {
    const project = RoomoryData.validate(projectSnapshot());
    const backup = { format: 'roomory-backup', createdAt: new Date().toISOString(), ...project };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    if (blob.size > RoomoryData.MAX_BYTES) throw new Error('Копия превышает лимит 5 МБ. Сократите объём проекта перед экспортом.');
    const url = URL.createObjectURL(blob);
    const link = element('a'); link.href = url; link.download = `roomory-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Резервная копия JSON подготовлена. Проверьте папку загрузок браузера.');
  } catch (error) { notify(`Не удалось экспортировать проект: ${error.message}`); }
}
const importDialog = document.querySelector('#import-dialog');
const importFile = document.querySelector('#import-file');
let pendingImport = null;
let importGeneration = 0;
for (const id of ['export-project', 'export-before-import']) document.querySelector(`#${id}`).addEventListener('click', exportProject);
document.querySelector('#import-project').addEventListener('click', () => { importFile.value = ''; importFile.click(); });
importFile.addEventListener('change', async () => {
  const generation = ++importGeneration;
  pendingImport = null;
  const file = importFile.files?.[0]; if (!file) return;
  try {
    if (file.size > RoomoryData.MAX_BYTES) throw new Error('Файл слишком большой. Максимальный размер — 5 МБ.');
    const parsed = RoomoryData.parse(await file.text(), true);
    if (generation !== importGeneration) return;
    pendingImport = parsed;
    const count = RoomoryData.summary(parsed);
    document.querySelector('#import-summary').textContent = `${file.name}: участок ${format(pendingImport.plot.width)} × ${format(pendingImport.plot.depth)} м, построек — ${pendingImport.buildings.length}, комнат — ${count.rooms}, мебели — ${count.furniture}, записей вещей — ${count.items}. Файл проверен. После восстановления будет открыт выбранный в копии план.`;
    document.querySelector('#import-error').textContent = '';
    notify('Файл проверен. Подтвердите замену или отмените импорт.');
    importDialog.showModal(); document.querySelector('#cancel-import').focus();
  } catch (error) { if (generation === importGeneration) notify(`Импорт отменён: ${error.message} Текущий проект не изменён.`); }
});
document.querySelector('#cancel-import').addEventListener('click', () => importDialog.close());
importDialog.addEventListener('close', () => { const cancelled = pendingImport !== null; pendingImport = null; if (cancelled) notify('Импорт отменён. Текущий проект не изменён.'); });
document.querySelector('#confirm-import').addEventListener('click', () => {
  if (!pendingImport) return;
  const next = pendingImport;
  try {
    // Persist first: a quota/storage error leaves the current in-memory project intact.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { document.querySelector('#import-error').textContent = 'Браузер не смог сохранить копию. Проект не заменён. Освободите место или разрешите локальное хранение.'; return; }
  movingId = null;
  plot = next.plot; buildings.splice(0, buildings.length, ...next.buildings); activeBuildingId = next.activeBuildingId; plotOpen = false; estateMovingId = null;
  rooms.splice(0, rooms.length, ...next.rooms);
  room = rooms.find(candidate => candidate.id === next.roomId) || emptyProjectRoom(); selectedId = next.selectedId; homeOpen = !room.id;
  pendingImport = null; importDialog.close(); storageReadFailed = false; document.querySelector('#storage-status').hidden = true;
  commit('Резервная копия восстановлена. Участок, постройки, комнаты и вещи сохранены.');
});

// Both views edit the same furniture records; a wall is a projection, not a copy.
function moveOnWall(f, du, dz) {
  const p = WG.project(f, room);
  const u = snapWithin(p.u + du, WG.length(room, f.wall) - p.span);
  const z = snapWithin(p.z + dz, WG.ceiling(room) - p.height);
  Object.assign(f, WG.fromWall(f, room, u, z));
}
function wallButton(wall, className) {
  const button = element('button', className, WG.labels[wall].slice(-1));
  button.type = 'button'; button.dataset.wall = wall;
  button.setAttribute('aria-label', `Проработать: ${WG.labels[wall]}`);
  button.title = WG.labels[wall];
  button.addEventListener('click', () => { activeWall = wall; viewMode = 'wall'; homeOpen = false; renderRoom(); });
  return button;
}
function drawMiniPlan(container, targetRoom, interactive = true) {
  container.replaceChildren(); container.style.aspectRatio = `${targetRoom.width} / ${targetRoom.depth}`;
  targetRoom.furniture.forEach(f => {
    const node = element(interactive ? 'button' : 'span', `mini-object${f.id === selectedId && targetRoom === room ? ' is-selected' : ''}`);
    node.dataset.id = f.id;
    node.style.left = `${f.x / targetRoom.width * 100}%`; node.style.top = `${f.y / targetRoom.depth * 100}%`;
    node.style.width = `${f.width / targetRoom.width * 100}%`; node.style.height = `${f.depth / targetRoom.depth * 100}%`;
    if (interactive) { node.type = 'button'; node.setAttribute('aria-label', `На плане: ${f.name}`); node.addEventListener('click', () => { if (f.wall) activeWall = f.wall; selectFurniture(f.id); }); }
    container.append(node);
  });
  if (interactive) Object.keys(WG.labels).forEach(wall => container.append(wallButton(wall, `mini-wall side-${wall}${activeWall === wall ? ' active' : ''}`)));
}
function renderWallView() {
  const wallView = viewMode === 'wall' && Boolean(room.id);
  document.querySelector('#view-top').setAttribute('aria-pressed', String(!wallView));
  document.querySelector('#view-wall').setAttribute('aria-pressed', String(wallView));
  document.querySelector('#view-wall').disabled = !room.id;
  document.querySelector('#wall-tools').hidden = !wallView;
  document.querySelector('#wall-workspace').hidden = !wallView;
  document.querySelector('.plan-stage').hidden = wallView;
  document.querySelector('.plan-footer').hidden = wallView;
  document.querySelector('#room-title').textContent = wallView ? WG.labels[activeWall] : 'План сверху';
  document.querySelector('.card-header p').textContent = wallView ? 'Вид из центра комнаты' : `Вид сверху · ${format(room.width)} × ${format(room.depth)} м`;
  const plan = document.querySelector('#floor-plan');
  plan.querySelectorAll('.top-wall').forEach(node => node.remove());
  if (room.id) Object.keys(WG.labels).forEach(wall => plan.append(wallButton(wall, `top-wall side-${wall}`)));
  const tabs = document.querySelector('#wall-tabs'); tabs.replaceChildren();
  Object.keys(WG.labels).forEach(wall => {
    const button = wallButton(wall, 'wall-tab'); button.textContent = WG.labels[wall]; button.setAttribute('aria-pressed', String(wall === activeWall)); tabs.append(button);
  });
  if (!wallView) return;
  const elevation = document.querySelector('#wall-elevation'); elevation.replaceChildren();
  const span = WG.length(room, activeWall), ceiling = WG.ceiling(room);
  elevation.style.aspectRatio = `${span} / ${ceiling}`;
  elevation.style.width = `min(100%, ${400 * span / ceiling}px)`;
  elevation.style.backgroundSize = `${.5 / span * 100}% ${.5 / ceiling * 100}%`;
  const objects = room.furniture.filter(f => f.wall === activeWall);
  document.querySelector('#wall-empty').hidden = objects.length > 0;
  document.querySelector('#wall-dimensions').textContent = `${format(span)} × ${format(ceiling)} м`;
  objects.forEach(f => {
    const p = WG.project(f, room);
    const button = element('button', `wall-object ${f.type}${f.id === selectedId ? ' is-selected' : ''}${f.id === selectedId && foundItemId ? ' is-match' : ''}${p.height < .3 ? ' is-shelf' : ''}`);
    button.type = 'button'; button.dataset.id = f.id;
    button.style.left = `${p.u / span * 100}%`; button.style.bottom = `${p.z / ceiling * 100}%`;
    button.style.width = `${p.span / span * 100}%`; button.style.height = `${p.height / ceiling * 100}%`;
    button.setAttribute('aria-label', `${f.name}, ${WG.labels[activeWall]}, от пола ${format(p.z)} м`);
    button.title = `${f.name} · ${format(p.z)} м от пола`;
    button.classList.toggle('is-movable', movingId === f.id);
    button.setAttribute('aria-pressed', String(f.id === selectedId));
    button.append(element('span', 'wall-object-name', f.name), element('span', 'wall-object-height', `${format(p.z)} м от пола`));
    button.addEventListener('click', () => selectFurniture(f.id));
    attachWallDrag(button, f);
    elevation.append(button);
  });
  drawMiniPlan(document.querySelector('#wall-minimap'), room);
  const directions = { north: 'A — верхняя сторона плана. Слева направо: D → B.', east: 'B — правая сторона плана. Слева направо: A → C.', south: 'C — нижняя сторона плана. Слева направо: B → D.', west: 'D — левая сторона плана. Слева направо: C → A.' };
  document.querySelector('#wall-direction').textContent = directions[activeWall];
  const f = currentFurniture();
  document.querySelector('#attach-selected').disabled = !f || f.wall === activeWall || movingId !== f.id;
  document.querySelector('#attach-selected').textContent = f ? `Привязать «${f.name}» к ${WG.labels[activeWall].slice(-1)}` : 'Выберите мебель на мини-плане';
}
function attachWallDrag(button, f) {
  let start = null; button.style.touchAction = movingId === f.id ? 'none' : 'auto';
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || movingId !== f.id) return;
    const p = WG.project(f, room), bounds = document.querySelector('#wall-elevation').getBoundingClientRect();
    start = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, u: p.u, z: p.z, width: bounds.width, height: bounds.height, moved: false, original: { ...f } };
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove', event => {
    if (!start || event.pointerId !== start.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 4) return;
    start.moved = true;
    const p = WG.project(f, room);
    const u = snapWithin(start.u + dx / start.width * WG.length(room, f.wall), WG.length(room, f.wall) - p.span);
    const z = snapWithin(start.z - dy / start.height * WG.ceiling(room), WG.ceiling(room) - p.height);
    Object.assign(f, WG.fromWall(f, room, u, z));
    selectedId = f.id;
    button.style.left = `${u / WG.length(room, f.wall) * 100}%`; button.style.bottom = `${z / WG.ceiling(room) * 100}%`;
    button.querySelector('.wall-object-height').textContent = `${format(z)} м от пола`; renderDetails();
  });
  function finish(event, cancel) {
    if (!start || start.pointerId !== event.pointerId) return;
    const moved = start.moved; if (cancel) Object.assign(f, start.original); start = null;
    if (moved) { commit(cancel ? 'Перемещение отменено.' : 'План и стена обновлены.'); focusFurniture(); }
  }
  button.addEventListener('pointerup', e => finish(e, false)); button.addEventListener('pointercancel', e => finish(e, true));
  button.addEventListener('keydown', event => {
    const delta = { ArrowLeft: [-.1, 0], ArrowRight: [.1, 0], ArrowUp: [0, .1], ArrowDown: [0, -.1] }[event.key];
    if (!delta || movingId !== f.id) return; event.preventDefault(); selectedId = f.id; moveOnWall(f, ...delta); commit('План и стена обновлены.'); focusFurniture();
  });
}
function openBuilding(id) {
  activeBuildingId = id; plotOpen = false; homeOpen = true; movingId = null; estateMovingId = null;
  room = buildingRooms()[0] || emptyProjectRoom(); selectedId = room.furniture[0]?.id || null;
  search.value = ''; results.hidden = true; document.querySelector('#search-status').textContent = '';
  saveSelection(); renderRoom();
}
function renderHome() {
  const ownRooms = buildingRooms(), building = activeBuilding();
  const workspace = document.querySelector('#workspace'); workspace.classList.toggle('home-view', homeOpen && !plotOpen);
  document.querySelector('#home-overview').hidden = !homeOpen || plotOpen;
  document.querySelector('#home-illustration').hidden = !homeOpen || plotOpen;
  document.querySelector('#home-illustration h1').textContent = building.name;
  document.querySelector('#home-illustration').classList.toggle('outbuilding-hero', building.id !== 'main-house');
  const heroImage = document.querySelector('#home-illustration img');
  const imagePath = building.id === 'main-house' ? 'assets/hobbit-home.png' : 'assets/hobbit-workshop.png';
  if (heroImage.getAttribute('src') !== imagePath) heroImage.src = imagePath;
  heroImage.alt = building.id === 'main-house' ? 'Уютный домик в холме с большим деревом' : 'Деревянная мастерская в саду';
  document.querySelector('#home-overview').setAttribute('aria-label', `Комнаты: ${building.name}`);
  document.querySelector('#home-button').setAttribute('aria-pressed', String(!plotOpen && activeBuildingId === 'main-house'));
  document.querySelector('.nav-active').classList.toggle('is-idle', homeOpen);
  document.querySelector('#page-title').textContent = homeOpen ? building.name : room.name;
  const count = `Комнат: ${ownRooms.length} · Мебели: ${ownRooms.flatMap(r => r.furniture).length} · Вещей: ${ownRooms.flatMap(r => r.furniture.flatMap(itemsOf)).length}`;
  document.querySelector('#page-subtitle').textContent = homeOpen ? count : 'План и места хранения';
  document.querySelector('.room-summary>span').textContent = homeOpen ? 'общая площадь комнат' : 'площадь комнаты';
  document.querySelector('#home-summary').textContent = count;
  document.querySelector('#room-area').textContent = homeOpen ? `${format(ownRooms.reduce((sum, r) => sum + r.width * r.depth, 0))} м²` : `${format(room.width * room.depth)} м²`;
  document.querySelector('#breadcrumb-building').textContent = plotOpen ? 'Мой участок' : building.name;
  document.querySelector('#breadcrumb-room').textContent = plotOpen || homeOpen ? 'Обзор' : room.name;
  const floorOverview=document.querySelector('#building-floor-overview');floorOverview.replaceChildren();
  const placedRooms=ownRooms.filter(r=>r.buildingRect);floorOverview.hidden=!homeOpen||plotOpen||!placedRooms.length;
  if(placedRooms.length){floorOverview.append(element('h2','',placedRooms.length===ownRooms.length?'Комнаты на плане':`Комнаты на плане · ${placedRooms.length} из ${ownRooms.length}`));const plan=element('div','building-room-plan');drawBuildingRooms(plan,building,placedRooms,id=>selectRoom(id));floorOverview.append(plan);}
  const overview = document.querySelector('#home-overview'); overview.replaceChildren();
  ownRooms.forEach(candidate => {
    const card = element('button', 'home-room-card'); card.type = 'button';
    const preview = element('div', 'home-mini-plan'); preview.setAttribute('aria-hidden', 'true'); drawMiniPlan(preview, candidate, false);
    card.append(preview, element('h2', '', candidate.name), element('p', '', `${format(candidate.width * candidate.depth)} м² · Мебель: ${candidate.furniture.length} · Вещи: ${candidate.furniture.flatMap(itemsOf).length}`), element('span', 'home-open', 'Открыть комнату ↗'));
    card.addEventListener('click', () => selectRoom(candidate.id)); overview.append(card);
  });
  if (!ownRooms.length) { const empty = element('div', 'estate-empty'); empty.append(element('h2', '', 'Здесь пока нет комнат'), element('p', '', `Добавьте первую комнату в «${building.name}» кнопкой в меню слева.`)); overview.append(empty); }
}
document.querySelector('#home-button').addEventListener('click', () => openBuilding('main-house'));
document.querySelector('.nav-active').addEventListener('click', event => { event.preventDefault(); homeOpen = false; renderRoom(); });
document.querySelector('#view-top').addEventListener('click', () => { viewMode = 'top'; renderRoom(); });
document.querySelector('#view-wall').addEventListener('click', () => { viewMode = 'wall'; const f = currentFurniture(); if (f?.wall) activeWall = f.wall; renderRoom(); });
document.querySelector('#show-object-wall').addEventListener('click', () => { const f = currentFurniture(); if (!f?.wall) return; activeWall = f.wall; viewMode = 'wall'; renderRoom(); });
document.querySelector('#add-wall-shelf').addEventListener('click', () => {
  openEditor('new-furniture');
  document.querySelector('#dialog-title').textContent = 'Настенная полка';
  document.querySelector('#edit-name').value = 'Полка'; document.querySelector('#edit-type').value = 'wall-shelf';
  document.querySelector('#edit-width').value = ['north', 'south'].includes(activeWall) ? 1.2 : .3;
  document.querySelector('#edit-depth').value = ['north', 'south'].includes(activeWall) ? .3 : 1.2;
  document.querySelector('#edit-height').value = .08; document.querySelector('#edit-elevation').value = Math.min(1.4, Math.max(0, WG.ceiling(room) - .08));
});
document.querySelector('#attach-selected').addEventListener('click', () => {
  const f = currentFurniture(); if (!f || movingId !== f.id) return;
  openEditor('edit-furniture');
  document.querySelector('#dialog-title').textContent = 'Разместить на стене';
  document.querySelector('#dialog-description').textContent = 'Укажите высоту нижнего края над полом. 0 м — предмет стоит на полу у стены. Для навесной полки задайте высоту крепления. План сверху обновится после сохранения.';
  document.querySelector('#edit-wall').value = activeWall;
  document.querySelector('#edit-elevation').focus();
});
document.querySelector('#toggle-move').addEventListener('click', () => {
  const f = currentFurniture(); if (!f) return;
  movingId = movingId === f.id ? null : f.id;
  renderDetails(); renderWallView();
});
function animateNavigation() {
  const spaceKey = plotOpen ? 'plot' : homeOpen ? activeBuildingId : room.id;
  const routeKey = plotOpen ? 'plot' : homeOpen ? activeBuildingId : `${room.id}:${viewMode}:${viewMode === 'wall' ? activeWall : ''}`;
  if (routeKey === lastRouteKey) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lastRouteKey !== null && !reduce) {
    const targets = plotOpen ? ['#plot-illustration','#plot-workspace'] : homeOpen ? ['#home-illustration', '#home-overview'] : ['.page-heading', '.workspace-grid'];
    targets.forEach((selector, index) => {
      const node = document.querySelector(selector);
      node.getAnimations().forEach(animation => animation.cancel());
      node.animate([{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, delay: index * 30, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'backwards' });
    });
  }
  if (lastSpaceKey !== null && spaceKey !== lastSpaceKey) window.scrollTo({ top: 0, behavior: reduce ? 'instant' : 'smooth' });
  lastRouteKey = routeKey; lastSpaceKey = spaceKey;
}
const geniusDialog = document.querySelector('#genius-dialog');
function showGenius() {
  if (!geniusDialog.open) geniusDialog.showModal();
  document.querySelector('#dismiss-genius').focus();
}
for (const id of ['close-genius', 'dismiss-genius']) document.querySelector(`#${id}`).addEventListener('click', () => geniusDialog.close());
geniusDialog.addEventListener('click', event => {
  if (event.target !== geniusDialog) return;
  const rect = geniusDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) geniusDialog.close();
});
geniusDialog.addEventListener('close', () => document.querySelector('#add-item')?.focus({ preventScroll: true }));
// Plot editor. Existing room/furniture editors remain scoped to activeBuildingId.
const estateDialog = document.querySelector('#estate-dialog');
let estateEdit = null;
function estateButton(text, action, className = '') {
  const button = element('button', className, text); button.type = 'button'; button.addEventListener('click', action); return button;
}
function footprint(node, b) {
  node.replaceChildren();
  RoomoryEstate.parts({ ...b, x:0, y:0, width:1, depth:1 }).forEach(p => {
    const part = element('span', 'building-part');
    Object.assign(part.style, { left:`${p.x*100}%`, top:`${p.y*100}%`, width:`${p.width*100}%`, height:`${p.depth*100}%` }); node.append(part);
  });
}
function renderEstate() {
  document.querySelector('#workspace').classList.toggle('plot-view', plotOpen);
  document.querySelector('#plot-workspace').hidden = !plotOpen;
  document.querySelector('#plot-illustration').hidden = !plotOpen;
  document.querySelector('#plot-button').setAttribute('aria-pressed', String(plotOpen));
  document.querySelector('#room-navigation').hidden = plotOpen;
  document.querySelector('.rooms-heading').hidden = plotOpen;
  document.querySelector('#new-room').hidden = plotOpen;
  document.querySelector('#new-room').title = `Добавить комнату в «${activeBuilding().name}»`;
  const nav = document.querySelector('#building-navigation'); nav.replaceChildren();
  buildings.filter(b => b.id !== 'main-house').forEach(b => {
    const button = estateButton('', () => openBuilding(b.id), 'building-nav');
    button.append(element('span', '', b.kind === 'garage' ? '▱' : '⌂'), element('span', '', b.name), element('small', '', rooms.filter(r => r.buildingId === b.id).length));
    button.setAttribute('aria-pressed', String(!plotOpen && activeBuildingId === b.id)); nav.append(button);
  });
  document.querySelector('#plot-summary').textContent = `Построек: ${buildings.length} · ${format(plot.width*plot.depth)} м²`;
  document.querySelector('#plot-dimensions').textContent = `${format(plot.width)} × ${format(plot.depth)} м`;
  const plan = document.querySelector('#plot-plan'); plan.replaceChildren();
  plan.style.aspectRatio = `${plot.width} / ${plot.depth}`;
  plan.style.width = `min(100%, ${520*plot.width/plot.depth}px)`;
  plan.style.backgroundSize = `${100/plot.width}% ${100/plot.depth}%`;
  const list = document.querySelector('#plot-building-list'); list.replaceChildren();
  buildings.forEach(b => {
    const moving = estateMovingId === b.id;
    const button = estateButton('', () => { if (!button.suppressClick && !moving) openBuilding(b.id); }, `plot-building kind-${b.kind}${moving ? ' is-moving' : ''}`);
    button.dataset.buildingId = b.id;
    button.setAttribute('aria-label', `${b.name}, ${format(b.width)} × ${format(b.depth)} м, ${moving ? 'перемещение стрелками' : 'открыть комнаты'}`);
    Object.assign(button.style, { left:`${b.x/plot.width*100}%`, top:`${b.y/plot.depth*100}%`, width:`${b.width/plot.width*100}%`, height:`${b.depth/plot.depth*100}%`, touchAction:moving?'none':'auto' });
    const shape = element('span', 'building-footprint'); footprint(shape,b);
    const label = element('span','building-label'); label.append(element('strong','',b.name), element('small','',`${format(b.width)} × ${format(b.depth)} м`));
    button.append(shape,label); attachBuildingMovement(button,b); plan.append(button);
    const card = element('section', `estate-building-card${moving ? ' is-moving' : ''}`);
    const title = estateButton(b.name, () => openBuilding(b.id), 'estate-building-title');
    const own = rooms.filter(r => r.buildingId === b.id);
    card.append(title, element('p','',`Комнат: ${own.length} · Вещей: ${own.flatMap(r=>r.furniture.flatMap(itemsOf)).length}`));
    const actions = element('div','estate-actions');
    actions.append(estateButton('Открыть комнаты ↗',()=>openBuilding(b.id),'estate-open'), estateButton('Параметры',()=>openEstate(b.id)), estateButton(moving?'Зафиксировать':'Переместить',()=>{estateMovingId=moving?null:b.id;renderEstate(); if(!moving) document.querySelector(`[data-building-id="${b.id}"]`)?.focus({preventScroll:true});}));
    if (moving) {
      const controls = element('div','estate-move-controls');
      [['←',-.5,0],['↑',0,-.5],['↓',0,.5],['→',.5,0]].forEach(([label,dx,dy])=>{const arrow=estateButton(label,()=>moveBuilding(b,dx,dy));arrow.setAttribute('aria-label',`${b.name}: сдвинуть ${label} на 0,5 м`);controls.append(arrow);});
      controls.append(estateButton('↶ Влево',()=>rotateBuilding(b,-90)),estateButton('Вправо ↷',()=>rotateBuilding(b,90)));
      card.append(element('p','estate-move-hint','Перетащите на плане или используйте стрелки. Шаг — 0,5 м.'),controls);
    }
    card.append(actions);
    if (b.id !== 'main-house') card.append(estateButton('Удалить постройку',()=>{
      if (own.length) {notify('Сначала удалите комнаты этой постройки. Постройка с комнатами защищена от удаления.');return;}
      askDeletion(`Удалить «${b.name}»?`,'Постройка пустая. Она исчезнет с участка и из меню.',()=>{
        buildings.splice(buildings.indexOf(b),1); if(activeBuildingId===b.id){activeBuildingId='main-house';room=buildingRooms()[0]||emptyProjectRoom();selectedId=room.furniture[0]?.id||null;} estateMovingId=null;commit('Пустая постройка удалена.');
      });
    },'danger-link'));
    list.append(card);
  });
}
function moveBuilding(b,dx,dy) {
  const candidate={...b,x:Math.round((b.x+dx)*100)/100,y:Math.round((b.y+dy)*100)/100};
  if (!RoomoryEstate.valid(candidate,plot,buildings)) {notify('Постройка должна оставаться внутри участка и не пересекаться с другими.');return;}
  Object.assign(b,candidate);commit('Расположение постройки сохранено.');
}
function attachBuildingMovement(button,b) {
  let drag=null;
  button.addEventListener('pointerdown',event=>{
    if(estateMovingId!==b.id || event.button!==0)return;
    const rect=document.querySelector('#plot-plan').getBoundingClientRect();
    drag={id:event.pointerId,cx:event.clientX,cy:event.clientY,x:b.x,y:b.y,w:rect.width,h:rect.height,moved:false};button.setPointerCapture(event.pointerId);
  });
  button.addEventListener('pointermove',event=>{
    if(!drag || event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.cx,dy=event.clientY-drag.cy;if(Math.hypot(dx,dy)<4 && !drag.moved)return;
    drag.moved=true;
    const x=Math.round((drag.x+dx/drag.w*plot.width)*2)/2, y=Math.round((drag.y+dy/drag.h*plot.depth)*2)/2;
    const candidate={...b,x,y};if(!RoomoryEstate.valid(candidate,plot,buildings))return;
    b.x=x;b.y=y;button.style.left=`${x/plot.width*100}%`;button.style.top=`${y/plot.depth*100}%`;
  });
  const finish=event=>{if(!drag||event.pointerId!==drag.id)return;const old=drag;drag=null;if(event.type==='pointercancel'){b.x=old.x;b.y=old.y;}if(old.moved){button.suppressClick=true;commit('Расположение постройки сохранено.');}};
  button.addEventListener('pointerup',finish);button.addEventListener('pointercancel',finish);
  button.addEventListener('keydown',event=>{const d={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,-.5],ArrowDown:[0,.5]}[event.key];if(!d||estateMovingId!==b.id)return;event.preventDefault();moveBuilding(b,...d);document.querySelector(`[data-building-id="${b.id}"]`)?.focus({preventScroll:true});});
}
let estateStage=1;
let estateDraftRotation=0;
let draftRoomSplits=new Map();
let estateNewCandidate=null;
let draftRooms=[];
let draftRoomKey='';
let draftRoomHistory=[];
let draftRoomRedo=[];
let selectedDraftRoom=null;
function drawBuildingRooms(container,b,layout,onSelect,selected=null) {
  container.replaceChildren();const base=RoomoryEstate.canonical(b);
  container.style.aspectRatio=`${b.width} / ${b.depth}`;container.style.width=`min(100%, ${400*b.width/b.depth}px)`;container.style.marginInline='auto';
  layout.forEach((r,index)=>{
    const rect=RoomoryEstate.rotateRect(r.buildingRect,b.rotation),button=estateButton('',()=>onSelect(r.id),'building-room-tile');
    button.dataset.roomId=r.id;button.setAttribute('aria-pressed',String(r.id===selected));
    Object.assign(button.style,{left:`${rect.x*100}%`,top:`${rect.y*100}%`,width:`${rect.width*100}%`,height:`${rect.depth*100}%`});
    button.append(element('span','room-number',String(index+1).padStart(2,'0')),element('strong','',r.name||'Без названия'),element('small','',`${format(rect.width*b.width)} × ${format(rect.depth*b.depth)} м`));
    button.setAttribute('aria-label',`${r.name||'Без названия'}, ${format(rect.width*b.width)} на ${format(rect.depth*b.depth)} м`);container.append(button);
  });
}
function showEstateStage(stage) {
  estateStage=stage;const roomsStage=stage===2,isNew=estateEdit==='new',isPlot=estateEdit==='plot';
  document.querySelector('#building-fields').hidden=roomsStage||isPlot;
  document.querySelector('#shape-designer').hidden=roomsStage;
  document.querySelector('#building-position').hidden=roomsStage||isPlot||isNew;
  document.querySelector('#building-rooms-step').hidden=!roomsStage;
  document.querySelector('#estate-steps').hidden=!isNew;
  document.querySelector('#back-estate').hidden=!roomsStage;
  document.querySelector('#estate-dialog').classList.toggle('is-room-stage',roomsStage);
  document.querySelectorAll('[data-estate-step]').forEach(node=>node.classList.toggle('is-active',Number(node.dataset.estateStep)===stage));
  document.querySelector('#estate-dialog-title').textContent=roomsStage?'Комнаты постройки':isPlot?'Размеры участка':isNew?'Новая постройка':'Параметры постройки';
  document.querySelector('#save-estate').textContent=roomsStage?'Создать и разместить':isNew?'Далее: комнаты':'Сохранить';
  document.querySelector('#estate-description').textContent=roomsStage?'Подпишите помещения и разделите их при необходимости. Каждая комната получит свой план мебели и вещей.':isPlot?'Размеры от 5 до 500 м. Все постройки должны помещаться в новых границах.':isNew?'Выберите форму. Все размеры вводятся в одном блоке под схемой. Затем настройте комнаты.':'Все размеры — под схемой. Поворачивайте контур кнопками влево и вправо; буквы размеров поворачиваются вместе с ним.';
  document.querySelector('#estate-error').textContent='';
  estateDialog.scrollTop=0;
}
function prepareDraftRooms(candidate) {
  const base=RoomoryEstate.canonical(candidate);
  const key=JSON.stringify([base.width,base.depth,candidate.shape,candidate.shapeParams]);
  estateNewCandidate=candidate;
  if(key!==draftRoomKey){
    draftRoomKey=key;draftRoomHistory=[];draftRoomRedo=[];draftRoomSplits=new Map();
    draftRooms=RoomoryEstate.initialRooms(candidate).map((rect,i)=>({id:`room-${crypto.randomUUID()}`,name:`Комната ${i+1}`,buildingRect:rect}));
    selectedDraftRoom=draftRooms[0]?.id;
  }
  renderDraftRooms();
}
function renderDraftRoomPlan() {
  drawBuildingRooms(document.querySelector('#draft-room-plan'),estateNewCandidate,draftRooms,id=>{
    selectedDraftRoom=id;renderDraftRooms();document.querySelector(`[data-draft-room="${id}"] input`)?.focus({preventScroll:true});
  },selectedDraftRoom);
  const r=draftRooms.find(r=>r.id===selectedDraftRoom);if(!r)return;
  const state=roomSplitState(r),value=Number.parseFloat(state.amount),total=roomSplitLength(r,state);
  if(!Number.isFinite(value)||value<.1-1e-8||total-value<.1-1e-8)return;
  const rect=RoomoryEstate.rotateRect(r.buildingRect,estateNewCandidate.rotation),line=element('div',`room-split-guide axis-${state.axis}`);
  if(state.axis==='x')Object.assign(line.style,{left:`${(rect.x+value/estateNewCandidate.width)*100}%`,top:`${rect.y*100}%`,height:`${rect.depth*100}%`});
  else Object.assign(line.style,{left:`${rect.x*100}%`,top:`${(rect.y+value/estateNewCandidate.depth)*100}%`,width:`${rect.width*100}%`});
  line.append(element('span','',`${format(value)} м`));document.querySelector('#draft-room-plan').append(line);
}
function roomSplitState(r) {
  if(!draftRoomSplits.has(r.id)){
    const rect=RoomoryEstate.rotateRect(r.buildingRect,estateNewCandidate.rotation);
    draftRoomSplits.set(r.id,{axis:'x',amount:String(Number((rect.width*estateNewCandidate.width/2).toFixed(3)))});
  }
  return draftRoomSplits.get(r.id);
}
function roomSplitLength(r,state) {
  const rect=RoomoryEstate.rotateRect(r.buildingRect,estateNewCandidate.rotation);
  return state.axis==='x'?rect.width*estateNewCandidate.width:rect.depth*estateNewCandidate.depth;
}
function renderDraftRooms() {
  renderDraftRoomPlan();document.querySelector('#draft-room-count').textContent=String(draftRooms.length);
  document.querySelector('#undo-room-split').disabled=!draftRoomHistory.length;document.querySelector('#redo-room-split').disabled=!draftRoomRedo.length;
  const fields=document.querySelector('#draft-room-fields');fields.replaceChildren();
  draftRooms.forEach((r,index)=>{
    const card=element('div',`draft-room-card${r.id===selectedDraftRoom?' is-selected':''}`);card.dataset.draftRoom=r.id;
    const label=element('label'),caption=element('span','draft-room-caption'),input=element('input');caption.append(element('b','',String(index+1).padStart(2,'0')),document.createTextNode('Название комнаты'));label.append(caption);input.value=r.name;input.maxLength=60;input.required=true;input.setAttribute('aria-label',`Название комнаты ${index+1}`);
    const selectRoom=()=>{selectedDraftRoom=r.id;fields.querySelectorAll('.draft-room-card').forEach(node=>node.classList.toggle('is-selected',node.dataset.draftRoom===r.id));renderDraftRoomPlan();};
    input.addEventListener('input',()=>{r.name=input.value;document.querySelector('#estate-error').textContent='';renderDraftRoomPlan();});input.addEventListener('focus',selectRoom);
    const rect=RoomoryEstate.rotateRect(r.buildingRect,estateNewCandidate.rotation);
    label.append(input);card.append(label,element('p','',`${format(rect.width*estateNewCandidate.width)} × ${format(rect.depth*estateNewCandidate.depth)} м`));
    const state=roomSplitState(r),controls=element('div','measured-split-fields');
    const axisLabel=element('label','','Направление деления'),axis=element('select');axis.setAttribute('aria-label',`Направление деления комнаты ${index+1}`);
    [['x','Слева направо ↔'],['y','Сверху вниз ↕']].forEach(([value,text])=>{const option=element('option','',text);option.value=value;axis.append(option);});axis.value=state.axis;axisLabel.append(axis);
    const sizeLabel=element('label','','Первая часть, м'),amount=element('input');amount.type='number';amount.min='.1';amount.step='.1';amount.value=state.amount;amount.setAttribute('aria-label',`Размер первой части комнаты ${index+1}, м`);sizeLabel.append(amount);
    const hint=element('p','split-remainder');
    function updateHint(){const total=roomSplitLength(r,state),value=Number.parseFloat(state.amount);amount.max=String(Number((total-.1).toFixed(6)));hint.textContent=Number.isFinite(value)&&value>=.1-1e-8&&total-value>=.1-1e-8?`От ${state.axis==='x'?'левого':'верхнего'} края: ${format(value)} м. Останется ${format(total-value)} м.`:`Введите от 0,1 до ${format(Math.max(0,total-.1))} м.`;}
    axis.addEventListener('focus',selectRoom);
    axis.addEventListener('change',()=>{state.axis=axis.value;state.amount=String(Number((roomSplitLength(r,state)/2).toFixed(3)));amount.value=state.amount;selectedDraftRoom=r.id;updateHint();renderDraftRoomPlan();});
    amount.addEventListener('input',()=>{state.amount=amount.value;selectedDraftRoom=r.id;document.querySelector('#estate-error').textContent='';updateHint();renderDraftRoomPlan();});amount.addEventListener('focus',selectRoom);
    controls.append(axisLabel,sizeLabel);updateHint();card.append(controls,hint,estateButton('Разделить по размеру',()=>splitDraftRoom(r),'apply-room-split'));fields.append(card);
  });
  renderDraftRoomPlan();
}
function splitDraftRoom(r) {
  const error=document.querySelector('#estate-error');
  if(rooms.length+draftRooms.length>=100){error.textContent='В проекте может быть не более 100 комнат.';return;}
  const state=roomSplitState(r),value=Number.parseFloat(state.amount),parts=RoomoryEstate.splitRoomRect(r.buildingRect,estateNewCandidate,state.axis,value);
  if(!parts){error.textContent='Укажите размер первой части так, чтобы обе комнаты были не меньше 0,1 м.';return;}
  draftRoomHistory.push(structuredClone(draftRooms));draftRoomRedo=[];r.buildingRect=parts[0];
  let suffix=draftRooms.length+1;while(draftRooms.some(room=>room.name.trim().toLocaleLowerCase('ru')===`комната ${suffix}`))suffix++;
  const next={id:`room-${crypto.randomUUID()}`,name:`Комната ${suffix}`,buildingRect:parts[1]};draftRoomSplits.delete(r.id);
  draftRooms.splice(draftRooms.indexOf(r)+1,0,next);selectedDraftRoom=next.id;error.textContent='';renderDraftRooms();
}

function commitNewBuildingRooms(candidate,error) {
  const base=RoomoryEstate.canonical(candidate),names=new Set();
  if(!draftRooms.length||rooms.length+draftRooms.length>100){error.textContent='В проекте должно быть не более 100 комнат. Уменьшите размер постройки или число помещений.';return false;}
  const created=[];
  for(const draft of draftRooms){
    const name=draft.name.trim(),key=name.toLocaleLowerCase('ru'),rect=draft.buildingRect;
    if(!name||name.length>60||names.has(key)){error.textContent='Введите разные названия комнат от 1 до 60 символов.';return false;}names.add(key);
    const width=Number((rect.width*base.width).toFixed(6)),depth=Number((rect.depth*base.depth).toFixed(6));
    if(![width,depth].every(n=>n>=.1&&n<=30)||!RoomoryEstate.roomRectValid(rect,candidate,draftRooms.filter(r=>r!==draft).map(r=>r.buildingRect))){error.textContent='Комнаты должны помещаться в контуре без пересечений, каждая сторона — от 0,1 до 30 м.';return false;}
    created.push({id:draft.id,name,buildingId:candidate.id,buildingRect:{...rect},width,depth,wallHeight:2.7,furniture:[]});
  }
  buildings.push(candidate);rooms.push(...created);estateMovingId=candidate.id;return true;
}
document.querySelector('#undo-room-split').addEventListener('click',()=>{if(!draftRoomHistory.length)return;draftRoomRedo.push(structuredClone(draftRooms));draftRooms=draftRoomHistory.pop();draftRoomSplits=new Map();selectedDraftRoom=draftRooms[0].id;renderDraftRooms();});
document.querySelector('#redo-room-split').addEventListener('click',()=>{if(!draftRoomRedo.length)return;draftRoomHistory.push(structuredClone(draftRooms));draftRooms=draftRoomRedo.pop();draftRoomSplits=new Map();selectedDraftRoom=draftRooms[0].id;renderDraftRooms();});
document.querySelector('#back-estate').addEventListener('click',()=>showEstateStage(1));

function shapeDraft() {
  const width=document.querySelector('#estate-width').valueAsNumber, depth=document.querySelector('#estate-depth').valueAsNumber;
  return { id:estateEdit, shape:document.querySelector('#building-shape').value, rotation:0,x:0,y:0,width,depth,shapeParams:{c:document.querySelector('#shape-c').valueAsNumber/width,d:document.querySelector('#shape-d').valueAsNumber/depth,e:document.querySelector('#shape-e').valueAsNumber/width} };
}
function resetShapeDimensions(b=null) {
  const width=document.querySelector('#estate-width').valueAsNumber,depth=document.querySelector('#estate-depth').valueAsNumber;
  const shape=document.querySelector('#building-shape').value,p=RoomoryEstate.parameters(b||{shape});
  document.querySelector('#shape-c').value=Number((width*p.c).toFixed(2));
  document.querySelector('#shape-d').value=Number((depth*p.d).toFixed(2));
  document.querySelector('#shape-e').value=Number((width*p.e).toFixed(2));
  renderShapePreview();
}
function renderShapePreview() {
  if(estateEdit==='plot')return;
  const b=shapeDraft(),complex=b.shape!=='rectangle';
  document.querySelector('#shape-extra-fields').hidden=!complex;
  document.querySelector('#shape-e-label').hidden=b.shape!=='u';
  document.querySelector('#shape-c-caption').textContent=b.shape==='t'?'C · Ширина ножки, м':'C · Левое крыло, м';
  document.querySelector('#shape-d-caption').textContent=b.shape==='t'?'D · Глубина перекладины, м':'D · Нижнее крыло, м';
  const preview=document.querySelector('#shape-preview');preview.replaceChildren();
  if(![b.width,b.depth].every(n=>Number.isFinite(n)&&n>=1&&n<=500)||!RoomoryEstate.validParameters(b)){
    preview.append(element('p','shape-invalid','Укажите внешние размеры от 1 м. Крылья должны быть не меньше 0,1 м; между ними должен оставаться вырез.'));
    return;
  }
  const ns='http://www.w3.org/2000/svg';
  const svgNode=(tag,attrs={},text)=>{const n=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;return n;};
  document.querySelector('#draft-rotation').textContent=`${estateDraftRotation}°`;
  const svg=svgNode('svg',{viewBox:'0 0 400 350',role:'group','aria-label':'Размеры выбранной формы: A — ширина, B — длина, C, D и E — размеры крыльев'});
  const scene=svgNode('g',{transform:`rotate(${estateDraftRotation} 200 175)`});svg.append(scene);
  const scale=Math.min(220/b.width,180/b.depth),w=b.width*scale,h=b.depth*scale,x=70+(220-w)/2,y=75+(180-h)/2;
  RoomoryEstate.parts(b).forEach(p=>scene.append(svgNode('rect',{x:x+p.x*scale,y:y+p.y*scale,width:p.width*scale,height:p.depth*scale,class:'shape-preview-part'})));
  const active=document.activeElement.id;
  function measure(letter,inputId,x1,y1,x2,y2,value,tx,ty){
    const g=svgNode('g',{class:`shape-measure${active===inputId?' is-active':''}`,role:'button',tabindex:'0','aria-label':`${letter}: ${format(value)} м, изменить`});
    g.append(svgNode('line',{x1,y1,x2,y2}),svgNode('circle',{cx:x1,cy:y1,r:3}),svgNode('circle',{cx:x2,cy:y2,r:3}));
    const text=svgNode('text',{x:tx,y:ty,'text-anchor':'middle',transform:`rotate(${-estateDraftRotation} ${tx} ${ty})`},`${letter} · ${format(value)} м`);g.append(text);
    const focus=()=>document.querySelector(`#${inputId}`).focus({preventScroll:true});g.addEventListener('click',focus);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();focus();}});scene.append(g);
  }
  measure('A','estate-width',x,45,x+w,45,b.width,x+w/2,32);
  measure('B','estate-depth',330,y,330,y+h,b.depth,343,y+h/2+4);
  if(complex){
    const {c,d,e}=b.shapeParams;
    const cx=b.shape==='t'?x+w*(1-c)/2:x;
    measure('C','shape-c',cx,282,cx+w*c,282,c*b.width,cx+w*c/2,305);
    const dy=b.shape==='t'?y:y+h*(1-d);
    measure('D','shape-d',40,dy,40,dy+h*d,d*b.depth,30,dy+h*d/2+4);
    if(b.shape==='u')measure('E','shape-e',x+w*(1-e),282,x+w,282,e*b.width,x+w*(1-e/2),328);
  }
  preview.append(svg);
  document.querySelector('#shape-help').textContent=complex?'A и B — внешний контур. '+(b.shape==='u'?'C, D и E':'C и D')+' — размеры крыльев. Выбранный размер подсвечивается на схеме.':'A — ширина, B — длина. Меняйте поля: схема обновляется сразу.';
}
for(const id of ['estate-width','estate-depth','shape-c','shape-d','shape-e']){
  const input=document.querySelector(`#${id}`);input.addEventListener('input',renderShapePreview);input.addEventListener('focus',renderShapePreview);
}
document.querySelector('#building-shape').addEventListener('change',()=>resetShapeDimensions());
for(const [id,delta] of [['rotate-draft-left',-90],['rotate-draft-right',90]])document.querySelector(`#${id}`).addEventListener('click',()=>{estateDraftRotation=(estateDraftRotation+delta+360)%360;renderShapePreview();});
function rotateBuilding(b,direction) {
  const candidate={...b,width:b.depth,depth:b.width,rotation:(b.rotation+direction+360)%360};
  if(!RoomoryEstate.valid(candidate,plot,buildings)){notify('Для поворота не хватает места. Сначала передвиньте постройку.');return;}
  Object.assign(b,candidate);commit('Постройка повёрнута.');
}

function openEstate(id) {
  estateEdit=id;const isPlot=id==='plot',b=buildings.find(b=>b.id===id),draft=b||{width:4,depth:3,x:0,y:0};
  estateDraftRotation=b?.rotation||0;
  const odd=b && b.rotation%180!==0;
  document.querySelector('#estate-dialog-title').textContent=isPlot?'Размеры участка':b?'Параметры постройки':'Новая постройка';
  document.querySelector('#estate-description').textContent=isPlot?'Размеры от 5 до 500 м. Все постройки должны помещаться в новых границах.':b?'Настройте размеры по схеме. Контур показан до поворота; на участке сохраняется выбранный ракурс.':'Выберите форму и задайте размеры по схеме. Постройка появится в центре участка или в ближайшем свободном месте — её сразу можно двигать и поворачивать.';
  document.querySelector('#building-fields').hidden=isPlot;document.querySelector('#building-position').hidden=isPlot||!b;
  document.querySelector('#shape-designer').hidden=false;
  document.querySelector('.shape-preview-heading').hidden=isPlot;document.querySelector('#shape-preview').hidden=isPlot;document.querySelector('#shape-rotation-controls').hidden=isPlot;document.querySelector('#shape-help').hidden=isPlot;document.querySelector('#shape-extra-fields').hidden=isPlot;
  document.querySelector('#estate-width-caption').textContent=isPlot?'Ширина, м':'A · Общая ширина, м';
  document.querySelector('#estate-depth-caption').textContent=isPlot?'Длина, м':'B · Общая длина, м';
  document.querySelector('#estate-dialog').classList.toggle('has-shape-designer',!isPlot);
  document.querySelector('#building-name').value=b?.name||'';document.querySelector('#building-kind').value=b?.kind||'shed';document.querySelector('#building-shape').value=b?.shape||'rectangle';
  document.querySelector('#estate-width').value=isPlot?plot.width:odd?draft.depth:draft.width;document.querySelector('#estate-depth').value=isPlot?plot.depth:odd?draft.width:draft.depth;
  document.querySelector('#building-x').value=draft.x;document.querySelector('#building-y').value=draft.y;
  document.querySelector('#estate-error').textContent='';
  if(!isPlot)resetShapeDimensions(b);
  draftRoomKey='';draftRooms=[];draftRoomHistory=[];draftRoomRedo=[];estateNewCandidate=null;showEstateStage(1);
  estateDialog.showModal();document.querySelector(isPlot?'#estate-width':'#building-name').focus();
}
document.querySelector('#estate-form').addEventListener('submit',event=>{
  event.preventDefault();const error=document.querySelector('#estate-error');
  if(estateEdit==='new'&&estateStage===2){
    const candidate=RoomoryEstate.centered(estateNewCandidate,plot,buildings);
    if(!candidate){error.textContent='На участке больше нет свободного места для этой постройки.';return;}
    if(!commitNewBuildingRooms(candidate,error))return;
    estateDialog.close();commit('Постройка с комнатами создана. Перетащите её, поверните и нажмите «Зафиксировать».');
    document.querySelector(`[data-building-id="${candidate.id}"]`)?.focus({preventScroll:true});return;
  }
  const width=document.querySelector('#estate-width').valueAsNumber,depth=document.querySelector('#estate-depth').valueAsNumber;
  if(estateEdit==='plot'){
    if(![width,depth].every(n=>Number.isFinite(n)&&n>=5&&n<=500)){error.textContent='Укажите ширину и длину от 5 до 500 м.';return;}
    const next={width,depth};if(buildings.some(b=>!RoomoryEstate.valid(b,next,buildings))){error.textContent='Участок слишком мал: сначала переместите или уменьшите постройки, выходящие за новые границы.';return;} plot=next;
  }else{
    const name=document.querySelector('#building-name').value.trim();if(!name||name.length>60){error.textContent='Введите название от 1 до 60 символов.';return;}
    const existing=buildings.find(b=>b.id===estateEdit);
    if(!existing&&buildings.length>=50){error.textContent='Можно создать не более 50 построек.';return;}
    const rotation=estateDraftRotation,odd=rotation%180!==0;
    const draft=shapeDraft();
    if(![width,depth].every(n=>Number.isFinite(n)&&n>=1&&n<=500)||!RoomoryEstate.validParameters(draft)){error.textContent='Проверьте размеры на схеме: внешний контур от 1 м, крылья от 0,1 м, с непустым вырезом.';return;}
    let candidate={id:existing?.id||`building-${crypto.randomUUID()}`,name,kind:document.querySelector('#building-kind').value,shape:draft.shape,...(draft.shape!=='rectangle'?{shapeParams:draft.shapeParams}:{}),x:document.querySelector('#building-x').valueAsNumber,y:document.querySelector('#building-y').valueAsNumber,width:odd?depth:width,depth:odd?width:depth,rotation};
    if(!existing){candidate=RoomoryEstate.centered(candidate,plot,buildings);if(!candidate){error.textContent='На участке нет свободного места для этой формы. Уменьшите размеры или освободите место.';return;}}
    if(buildings.some(b=>b.id!==candidate.id&&b.name.toLocaleLowerCase('ru')===name.toLocaleLowerCase('ru'))){error.textContent='Постройка с таким названием уже есть.';return;}
    if(!RoomoryEstate.valid(candidate,plot,buildings)){error.textContent='Проверьте размеры и положение: минимум 1 м, внутри участка, без пересечения с другими постройками.';return;}
    if(!existing){prepareDraftRooms(candidate);showEstateStage(2);return;}
    const updatedRooms=[];
    for(const r of rooms.filter(r=>r.buildingId===existing.id&&r.buildingRect)){
      const base=RoomoryEstate.canonical(candidate),width=Number((r.buildingRect.width*base.width).toFixed(6)),depth=Number((r.buildingRect.depth*base.depth).toFixed(6)),next={...r,width,depth};
      if(!RoomoryEstate.roomRectValid(r.buildingRect,candidate)||![width,depth].every(n=>n>=.1&&n<=30)||r.furniture.some(f=>!WG.valid(WG.pin(f,next),next))){error.textContent='Новый контур или размеры конфликтуют с комнатами и мебелью. Сначала измените комнаты или освободите их.';return;}
      updatedRooms.push({r,next});
    }
    delete existing.shapeParams;Object.assign(existing,candidate);
    updatedRooms.forEach(({r,next})=>{r.width=next.width;r.depth=next.depth;r.furniture.forEach(f=>Object.assign(f,WG.pin(f,r)));});
  }
  estateDialog.close();commit(estateEdit==='new'?'Постройка добавлена. Перетащите её и поверните, затем нажмите «Зафиксировать».':'Участок и постройки сохранены.');
  if(estateEdit==='new')document.querySelector(`[data-building-id="${estateMovingId}"]`)?.focus({preventScroll:true});
});
for(const id of ['close-estate','cancel-estate'])document.querySelector(`#${id}`).addEventListener('click',()=>estateDialog.close());
document.querySelector('#edit-plot').addEventListener('click',()=>openEstate('plot'));
document.querySelector('#new-building').addEventListener('click',()=>openEstate('new'));
document.querySelector('#plot-button').addEventListener('click',()=>{plotOpen=true;homeOpen=false;movingId=null;estateMovingId=null;search.value='';results.hidden=true;document.querySelector('#search-status').textContent='';renderRoom();});

let lastPresetName=null;
const furnitureTypeSelect=document.querySelector('#edit-type');
furnitureTypeSelect.replaceChildren();
for(const groupName of [...new Set(Object.values(RoomoryFurniture.catalog).map(entry=>entry.group))]){
  const group=element('optgroup');group.label=groupName;
  Object.values(RoomoryFurniture.catalog).filter(entry=>entry.group===groupName).forEach(entry=>{const option=element('option','',entry.label);option.value=entry.id;group.append(option);});furnitureTypeSelect.append(group);
}
function applyFurniturePreset() {
  if(editorMode!=='new-furniture')return;
  const preset=RoomoryFurniture.catalog[furnitureTypeSelect.value];if(!preset)return;
  const name=document.querySelector('#edit-name');if(!name.value.trim()||name.value===lastPresetName)name.value=preset.label;lastPresetName=preset.label;
  const wallShelf=preset.id==='wall-shelf',wall=wallShelf?(document.querySelector('#edit-wall').value||activeWall):document.querySelector('#edit-wall').value;
  const eastWest=wallShelf&&['east','west'].includes(wall);
  document.querySelector('#edit-width').value=Math.min(eastWest?preset.depth:preset.width,room.width);
  document.querySelector('#edit-depth').value=Math.min(eastWest?preset.width:preset.depth,room.depth);
  const height=Math.min(preset.height,WG.ceiling(room));document.querySelector('#edit-height').value=height;
  document.querySelector('#edit-elevation').value=wallShelf?Math.min(1.4,Math.max(0,WG.ceiling(room)-height)):0;
  if(wallShelf)document.querySelector('#edit-wall').value=wall;
}
furnitureTypeSelect.addEventListener('change',applyFurniturePreset);
function renderRoomInventory() {
  const section=document.querySelector('#room-inventory');section.hidden=homeOpen||plotOpen||!room.id;
  if(section.hidden)return;
  const rows=[];room.furniture.forEach(f=>f.sections.forEach(s=>s.items.forEach(i=>rows.push({f,s,i}))));
  rows.sort((a,b)=>a.i.name.localeCompare(b.i.name,'ru')||a.f.name.localeCompare(b.f.name,'ru'));
  document.querySelector('#room-inventory-title').textContent=`Все вещи · ${room.name}`;
  document.querySelector('#inventory-count').textContent=`Записей: ${rows.length} · Всего: ${rows.reduce((sum,r)=>sum+r.i.quantity,0)} шт.`;
  const content=document.querySelector('#inventory-content');content.replaceChildren();
  if(!rows.length){content.append(element('p','inventory-empty','В этой комнате пока нет вещей. Добавьте их в мебель — они появятся здесь.'));return;}
  const wrap=element('div','inventory-table-wrap'),table=element('table','inventory-table'),head=element('thead'),header=element('tr');
  ['Вещь','Кол-во','Мебель','Полка / отделение','Заметка'].forEach(name=>{const th=element('th','',name);th.scope='col';header.append(th);});head.append(header);table.append(head);
  const body=element('tbody');
  rows.forEach(({f,s,i})=>{
    const row=element('tr');
    const name=element('td','inventory-name');name.dataset.label='Вещь';
    const button=estateButton(i.name,()=>{
      movingId=null;selectedId=f.id;viewMode=f.wall?'wall':'top';if(f.wall)activeWall=f.wall;renderRoom();selectFurniture(f.id,i.id);
      document.querySelector('.item.is-found')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
    });button.setAttribute('aria-label',`Найти в комнате: ${i.name}, ${f.name}, ${s.name}`);name.append(button);row.append(name);
    [[`${i.quantity} шт.`,'Количество','inventory-quantity'],[f.name,'Мебель','inventory-furniture'],[s.name,'Место','inventory-place'],[i.note||'—','Заметка','inventory-note']].forEach(([value,label,className])=>{const cell=element('td',className,value);cell.dataset.label=label;row.append(cell);});body.append(row);
  });table.append(body);wrap.append(table);content.append(wrap);
}

const requestedView = new URLSearchParams(location.search);
const requestedRoom = rooms.find(candidate => candidate.id === requestedView.get('room'));
if (requestedRoom) { room = requestedRoom; activeBuildingId = room.buildingId; selectedId = room.furniture[0]?.id || null; }
if (requestedView.get('view') === 'wall' && room.id) {
  viewMode = 'wall';
  const requestedWall = requestedView.get('wall');
  if (Object.hasOwn(WG.labels, requestedWall)) activeWall = requestedWall;
  selectedId = room.furniture.find(f => f.wall === activeWall)?.id || selectedId;
}
if (requestedView.get('view') === 'home') homeOpen = true;
if (requestedView.get('view') === 'plot') plotOpen = true;
renderRoom();
