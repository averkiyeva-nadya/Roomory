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

const STORAGE_KEY = 'roomory.project.v1';
let selectedId = 'wardrobe';
let foundItemId = null;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved?.version === 1 && validRooms(saved.rooms)) {
    rooms.splice(0, rooms.length, ...saved.rooms);
    room = rooms.find(candidate => candidate.id === saved.roomId) || rooms[0] || emptyProjectRoom();
    selectedId = room.furniture.find(f => f.id === saved.selectedId)?.id || room.furniture[0]?.id || null;
  } else if (saved !== null) showStorageNotice();
} catch { showStorageNotice(); }
function emptyProjectRoom() { return { id: null, name: 'Нет комнат', width: 5, depth: 4, furniture: [] }; }
function validRooms(value) {
  const seen = new Set();
  const idValid = id => typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id) && !seen.has(id) && (seen.add(id), true);
  const numberValid = n => Number.isFinite(n) && n >= .1 && n <= 30;
  return Array.isArray(value) && value.every(r => r && idValid(r.id) && typeof r.name === 'string' && r.name.trim() && numberValid(r.width) && numberValid(r.depth) && Array.isArray(r.furniture) && r.furniture.every(f => f && idValid(f.id) && typeof f.name === 'string' && numberValid(f.width) && numberValid(f.depth) && Number.isFinite(f.rotation) && f.rotation % 90 === 0 && Number.isFinite(f.x) && Number.isFinite(f.y) && fits(f, r) && Array.isArray(f.sections) && f.sections.every(section => section && typeof section.name === 'string' && Array.isArray(section.items) && section.items.every(item => item && typeof item.id === 'string' && typeof item.name === 'string' && Number.isFinite(item.quantity)))));
}

function showStorageNotice() {
  const status = document.querySelector('#storage-status');
  status.hidden = false;
  status.textContent = 'Не удалось прочитать или сохранить проект в браузере. Не закрывайте страницу, если хотите сохранить текущую работу.';
}
function saveSelection() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, rooms, roomId: room.id, selectedId })); }
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
  plan.style.width = `min(100%, ${520 * room.width / room.depth}px)`;
  plan.style.marginInline = 'auto';
  plan.style.backgroundSize = `${.5 / room.width * 100}% ${.5 / room.depth * 100}%`;
  plan.setAttribute('aria-label', `План комнаты ${room.name}. Выберите мебель`);
  document.querySelector('.dimension-top span').textContent = `${room.width} м`;
  document.querySelector('.dimension-left span').textContent = `${room.depth} м`;
  document.querySelector('#empty-room').hidden = room.furniture.length > 0;
  document.querySelector('#empty-room h3').textContent = room.id ? 'Здесь начинается порядок' : 'Ваш дом начинается с комнаты';
  document.querySelector('#empty-room p').textContent = room.id ? 'Разместите первый предмет мебели — укажите название и размеры, затем передвиньте его на плане.' : 'Создайте комнату, задайте её размеры и разместите мебель.';
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
    button.addEventListener('click', () => { if (!button.suppressClick) selectFurniture(furniture.id); });
    attachMovement(button, furniture);
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
  document.querySelector('#object-position').textContent = `От левой стены: ${format(furniture.x)} м · от верхней: ${format(furniture.y)} м · поворот ${furniture.rotation}°`;
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
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !event.ctrlKey && !event.metaKey && !event.altKey && !document.querySelector('#editor-dialog').open) { event.preventDefault(); search.focus(); }
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
  document.querySelector('#edit-room').disabled = !room.id;
  document.querySelector('#new-furniture').disabled = !room.id;
  document.querySelector('#back-to-bedroom').textContent = room.id ? 'Добавить мебель ＋' : 'Создать первую комнату ＋';
  document.querySelector('.rooms-heading span').textContent = String(rooms.length).padStart(2, '0');
  const navigation = document.querySelector('#room-navigation');
  navigation.replaceChildren();
  rooms.forEach(candidate => {
    const button = element('button', 'room-tab');
    button.type = 'button';
    if (candidate.id === room.id) button.setAttribute('aria-current', 'page');
    const label = element('span', 'room-tab-label', candidate.name);
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
}
document.querySelector('#back-to-bedroom').addEventListener('click', () => openEditor(room.id ? 'new-furniture' : 'new-room'));

// Rectangle dimensions describe its current footprint. Rotation swaps width/depth.
function fits(f, r) { return f.x >= 0 && f.y >= 0 && f.x + f.width <= r.width + 1e-8 && f.y + f.depth <= r.depth + 1e-8; }
function format(n) { return n.toLocaleString('ru', { maximumFractionDigits: 2 }); }
function notify(message) { document.querySelector('#editor-status').textContent = message; }
function currentFurniture() { return room.furniture.find(f => f.id === selectedId); }
function commit(message) { foundItemId = null; search.value = ''; results.hidden = true; saveSelection(); renderRoom(); notify(message); }
function snapWithin(n, max) { return Math.max(0, Math.min(Math.round(n * 10) / 10, Math.floor((max + 1e-8) * 10) / 10)); }
function moveObject(f, x, y) {
  f.x = snapWithin(x, room.width - f.width);
  f.y = snapWithin(y, room.depth - f.depth);
}
function focusFurniture() { document.querySelector(`.furniture[data-id="${selectedId}"]`)?.focus({ preventScroll: true }); }
function attachMovement(button, f) {
  button.style.touchAction = 'none';
  let drag = null;
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    selectFurniture(f.id);
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
    if (!delta) return;
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
  const existing = mode.startsWith('edit') ? (isRoom ? room : currentFurniture()) : null;
  if (mode === 'edit-furniture' && !existing) return;
  document.querySelector('#edit-fields').hidden = false;
  document.querySelector('#dialog-title').textContent = ({ 'new-room': 'Новая комната', 'edit-room': 'Параметры комнаты', 'new-furniture': 'Новая мебель', 'edit-furniture': 'Параметры мебели' })[mode];
  document.querySelector('#dialog-description').textContent = isRoom ? 'Размеры в метрах, от 0,1 до 30. При уменьшении вся мебель должна помещаться в новых границах.' : 'Размеры текущего положения на плане. Шаг перемещения — 10 см. Пересечение мебели допускается.';
  document.querySelector('#edit-name').value = existing?.name || '';
  document.querySelector('#edit-width').value = existing?.width || (isRoom ? 5 : 1);
  document.querySelector('#edit-depth').value = existing?.depth || (isRoom ? 4 : .6);
  document.querySelector('#edit-type').value = existing?.type || 'wardrobe';
  document.querySelector('#type-label').hidden = isRoom;
  document.querySelector('#delete-room').hidden = mode !== 'edit-room';
  document.querySelector('#dialog-error').textContent = '';
  document.querySelector('#save-dialog').textContent = existing ? 'Сохранить' : 'Создать';
  document.querySelector('#save-dialog').classList.remove('danger-button');
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
  const f = currentFurniture(); if (!f) return;
  const candidate = { ...f, width: f.depth, depth: f.width };
  if (!fits(candidate, room)) { notify('Поворот не выполнен: мебель выйдет за границы. Сдвиньте её от стены или увеличьте комнату.'); return; }
  Object.assign(f, candidate, { rotation: (f.rotation + 90) % 360 });
  commit(`${f.name}: поворот на 90° сохранён.`);
}
for (const id of ['new-room', 'edit-room', 'new-furniture', 'edit-furniture']) document.querySelector(`#${id}`).addEventListener('click', () => openEditor(id));
document.querySelector('#rotate-furniture').addEventListener('click', rotateSelected);
for (const id of ['close-dialog', 'cancel-dialog']) document.querySelector(`#${id}`).addEventListener('click', () => dialog.close());
document.querySelector('#delete-furniture').addEventListener('click', () => {
  const f = currentFurniture(); if (!f) return;
  askDeletion(`Удалить «${f.name}»?`, `Будут удалены мебель, все её отделения и вещи (${itemsOf(f).length} названий). Отменить удаление после подтверждения нельзя.`, () => {
    room.furniture.splice(room.furniture.indexOf(f), 1); selectedId = room.furniture[0]?.id || null; commit('Мебель удалена.');
  });
});
document.querySelector('#delete-room').addEventListener('click', () => {
  const target = room;
  askDeletion(`Удалить «${room.name}»?`, `Будет удалена комната со всей мебелью (${room.furniture.length}) и вещами (${room.furniture.flatMap(itemsOf).length} названий). Отменить удаление после подтверждения нельзя.`, () => {
    rooms.splice(rooms.indexOf(target), 1); room = rooms[0] || emptyProjectRoom(); selectedId = room.furniture[0]?.id || null; commit('Комната удалена.');
  });
});
document.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => {
  const f = currentFurniture(); if (!f) return;
  const [dx, dy] = { left: [-.1, 0], right: [.1, 0], up: [0, -.1], down: [0, .1] }[button.dataset.move];
  moveObject(f, f.x + dx, f.y + dy); commit(`${f.name}: положение сохранено.`);
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
  if (editorMode === 'new-room') {
    room = { id: `room-${crypto.randomUUID()}`, name, width, depth, furniture: [] }; rooms.push(room); selectedId = null;
  } else if (editorMode === 'edit-room') {
    const conflicts = room.furniture.filter(f => !fits(f, { width, depth }));
    if (conflicts.length) { error.textContent = `Изменения не сохранены. За новыми границами: ${conflicts.map(f => f.name).join(', ')}. Сначала переместите или уменьшите эту мебель либо увеличьте размеры комнаты.`; return; }
    Object.assign(room, { name, width, depth });
  } else {
    const existing = editorMode === 'edit-furniture' ? currentFurniture() : null;
    const candidate = { x: existing?.x || 0, y: existing?.y || 0, width, depth };
    if (!fits(candidate, room)) { error.textContent = 'Мебель не помещается в комнате в этом положении. Уменьшите размеры или сначала переместите её.'; return; }
    const type = document.querySelector('#edit-type').value;
    if (existing) Object.assign(existing, { name, width, depth, type });
    else { const f = { id: `furniture-${crypto.randomUUID()}`, name, type, ...candidate, rotation: 0, sections: [] }; room.furniture.push(f); selectedId = f.id; }
  }
  dialog.close(); commit('Изменения сохранены в этом браузере.');
});
renderRoom();
