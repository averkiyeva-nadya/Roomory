const { test } = require('node:test');
const assert = require('node:assert/strict');
const data = require('../data.js');
function fixture() {
  return { format: 'roomory-backup', version: 1, roomId: 'r', selectedId: 'f', rooms: [{ id: 'r', name: 'Комната', width: 3, depth: 2, furniture: [{ id: 'f', name: 'Шкаф', type: 'wardrobe', width: 1, depth: .5, x: 0, y: 0, rotation: 0, sections: [{ id: 's', name: 'Полка', items: [{ id: 'i', name: 'Кабель', quantity: 2, note: 'В чехле' }] }] }] }] };
}
test('JSON round trip preserves records, notes, geometry and selection', () => {
  const first = data.validate(fixture(), true);
  assert.deepEqual(data.parse(JSON.stringify({ format: 'roomory-backup', ...first }), true), first);
  assert.deepEqual(data.summary(first), { rooms: 1, furniture: 1, items: 1 });
  assert.equal(first.rooms[0].furniture[0].sections[0].items[0].note, 'В чехле');
});
test('validation copies input and migrates older sections without mutating originals', () => {
  const input = fixture(); delete input.rooms[0].furniture[0].sections[0].id;
  const result = data.validate(input);
  assert.equal(input.rooms[0].furniture[0].sections.length, 1);
  assert.ok(result.rooms[0].furniture[0].sections[0].id);
  assert.equal(result.rooms[0].furniture[0].sections.at(-1).system, true);
  assert.notEqual(result.rooms, input.rooms);
});
test('rejects duplicates at room, furniture, section and item level', () => {
  for (const level of ['room', 'furniture', 'section', 'item']) {
    const input = fixture(); const r = input.rooms[0], f = r.furniture[0], s = f.sections[0];
    if (level === 'room') input.rooms.push(structuredClone(r));
    if (level === 'furniture') r.furniture.push(structuredClone(f));
    if (level === 'section') f.sections.push(structuredClone(s));
    if (level === 'item') s.items.push(structuredClone(s.items[0]));
    assert.throws(() => data.validate(input, true), /идентификатор/);
  }
});
test('rejects out-of-bounds furniture, invalid quantities, angles and oversized notes', () => {
  for (const mutate of [
    p => { p.rooms[0].width = 0; },
    p => { p.rooms[0].furniture[0].x = 3; },
    p => { p.rooms[0].furniture[0].rotation = 45; },
    p => { p.rooms[0].furniture[0].sections[0].items[0].quantity = 1.5; },
    p => { p.rooms[0].furniture[0].sections[0].items[0].quantity = 0; },
    p => { p.rooms[0].furniture[0].sections[0].items[0].note = 'a'.repeat(1001); },
  ]) { const input = fixture(); mutate(input); assert.throws(() => data.validate(input, true)); }
});
test('rejects invalid JSON, wrong format and unknown version', () => {
  assert.throws(() => data.parse('{broken', true), /JSON/);
  assert.throws(() => data.validate({ ...fixture(), version: 2 }, true), /версия/);
  assert.throws(() => data.validate({ ...fixture(), format: 'other' }, true), /резервная копия/);
});
test('empty project can be restored; arbitrary keys are not copied', () => {
  assert.deepEqual(data.validate({ version: 1, rooms: [] }), { version: 1, rooms: [], roomId: null, selectedId: null });
  const input = fixture(); input.rooms[0].injected = 'ignored';
  assert.equal(data.validate(input).rooms[0].injected, undefined);
});
test('a BOM-prefixed UTF-8 backup is accepted', () => assert.equal(data.parse('\uFEFF' + JSON.stringify(fixture()), true).rooms.length, 1));
