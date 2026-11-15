'use strict';

// Shared browser/Node validation. Return a fresh, whitelisted copy, never the input object.
const RoomoryData = (() => {
  const MAX_BYTES = 5 * 1024 * 1024;
  const types = new Set(['wardrobe', 'dresser', 'shelf', 'desk', 'bed', 'nightstand']);
  function validate(input, backup = false) {
    const fail = message => { throw new Error(message); };
    const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    if (!object(input) || input.version !== 1) fail('Неподдерживаемый формат или версия проекта. Нужна версия 1.');
    if (backup && input.format !== 'roomory-backup') fail('Это не резервная копия Roomory.');
    const ids = new Set();
    const id = (value, where) => {
      if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(value) || ids.has(value)) fail(`${where}: неверный или повторяющийся идентификатор.`);
      ids.add(value); return value;
    };
    const text = (value, max, where, empty = false) => {
      if (typeof value !== 'string' || value.length > max || (!empty && !value.trim())) fail(`${where}: ${empty ? 'текст' : 'название'} должно содержать ${empty ? 'не более' : 'от 1 до'} ${max} символов.`);
      return value.trim();
    };
    const list = (value, limit, where) => {
      if (!Array.isArray(value) || value.length > limit) fail(`${where}: ожидается список, не более ${limit} записей.`);
      return value;
    };
    const size = (value, where) => {
      if (!Number.isFinite(value) || value < .1 || value > 30) fail(`${where}: размер должен быть от 0,1 до 30 м.`);
      return value;
    };
    let itemCount = 0;
    const rooms = list(input.rooms, 100, 'Комнаты').map((r, ri) => {
      const where = `Комната ${ri + 1}`;
      if (!object(r)) fail(`${where}: неверная запись.`);
      const result = { id: id(r.id, where), name: text(r.name, 60, where), width: size(r.width, where), depth: size(r.depth, where) };
      result.furniture = list(r.furniture, 500, where).map((f, fi) => {
        const place = `${where}, мебель ${fi + 1}`;
        if (!object(f) || !types.has(f.type)) fail(`${place}: неизвестный тип мебели.`);
        const item = { id: id(f.id, place), name: text(f.name, 60, place), type: f.type, width: size(f.width, place), depth: size(f.depth, place), x: f.x, y: f.y, rotation: f.rotation };
        if (!Number.isFinite(f.x) || !Number.isFinite(f.y) || f.x < 0 || f.y < 0 || f.x + f.width > r.width + 1e-8 || f.y + f.depth > r.depth + 1e-8) fail(`${place}: мебель выходит за границы комнаты.`);
        if (![0, 90, 180, 270].includes(f.rotation)) fail(`${place}: угол должен быть 0, 90, 180 или 270°.`);
        const names = new Set(); let systemCount = 0;
        item.sections = list(f.sections, 200, place).map((s, si) => {
          const shelf = `${place}, место ${si + 1}`;
          if (!object(s) || (s.system !== undefined && typeof s.system !== 'boolean')) fail(`${shelf}: неверная запись места хранения.`);
          const section = { id: id(s.id === undefined ? `section-${crypto.randomUUID()}` : s.id, shelf), name: text(s.name, 60, shelf), items: [] };
          if (s.system === true) { section.system = true; systemCount++; if (section.name !== 'Без отдельной полки') fail(`${shelf}: системное место должно называться «Без отдельной полки».`); }
          const key = section.name.toLocaleLowerCase('ru');
          if (names.has(key)) fail(`${place}: повторяется название места хранения.`);
          names.add(key);
          section.items = list(s.items, 10000, shelf).map(i => {
            if (++itemCount > 20000) fail('В проекте слишком много вещей: максимум 20000 записей.');
            if (!object(i)) fail(`${shelf}: неверная запись вещи.`);
            const value = { id: id(i.id, shelf), name: text(i.name, 80, shelf), quantity: i.quantity, note: text(i.note ?? '', 1000, shelf, true), icon: text(i.icon ?? '▣', 8, shelf, true) || '▣' };
            if (!Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 999999) fail(`${shelf}: количество должно быть целым от 1 до 999999.`);
            return value;
          });
          return section;
        });
        if (systemCount > 1) fail(`${place}: несколько системных мест хранения.`);
        if (!systemCount) {
          if (names.has('без отдельной полки')) fail(`${place}: название «Без отдельной полки» зарезервировано.`);
          item.sections.push({ id: id(`section-${crypto.randomUUID()}`, place), name: 'Без отдельной полки', system: true, items: [] });
        }
        // Keep the unassigned section last, as expected by the content editor.
        item.sections.sort((a, b) => Number(Boolean(a.system)) - Number(Boolean(b.system)));
        return item;
      });
      return result;
    });
    const room = rooms.find(r => r.id === input.roomId) || rooms[0];
    return { version: 1, rooms, roomId: room?.id || null, selectedId: room?.furniture.find(f => f.id === input.selectedId)?.id || room?.furniture[0]?.id || null };
  }
  function parse(text, backup = false) {
    let input;
    try { input = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw new Error('Файл не содержит корректный JSON.'); }
    return validate(input, backup);
  }
  function summary(project) {
    const furniture = project.rooms.flatMap(r => r.furniture);
    return { rooms: project.rooms.length, furniture: furniture.length, items: furniture.flatMap(f => f.sections.flatMap(s => s.items)).length };
  }
  return { MAX_BYTES, validate, parse, summary };
})();
if (typeof module !== 'undefined') module.exports = RoomoryData;
