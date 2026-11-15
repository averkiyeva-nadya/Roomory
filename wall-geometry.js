'use strict';
const RoomoryWallGeometry = (() => {
  const labels = { north: 'Стена A', east: 'Стена B', south: 'Стена C', west: 'Стена D' };
  const heightOf = f => f.height ?? ({ bed: .5, desk: .75, nightstand: .55, dresser: .9, shelf: 1.8, wardrobe: 2 }[f.type] || 1);
  const ceiling = r => r.wallHeight ?? 2.7;
  const length = (r, wall) => ['north', 'south'].includes(wall) ? r.width : r.depth;
  function project(f, r) {
    const span = ['north', 'south'].includes(f.wall) ? f.width : f.depth;
    const u = f.wall === 'north' ? f.x : f.wall === 'east' ? f.y : f.wall === 'south' ? r.width - f.x - f.width : r.depth - f.y - f.depth;
    return { u, span, z: f.elevation ?? 0, height: heightOf(f) };
  }
  function pin(f, r) {
    const p = { ...f };
    if (f.wall === 'north') p.y = 0;
    if (f.wall === 'east') p.x = r.width - f.width;
    if (f.wall === 'south') p.y = r.depth - f.depth;
    if (f.wall === 'west') p.x = 0;
    return p;
  }
  function fromWall(f, r, u, z) {
    const next = { ...f, elevation: z };
    if (f.wall === 'north') { next.x = u; next.y = 0; }
    if (f.wall === 'east') { next.x = r.width - f.width; next.y = u; }
    if (f.wall === 'south') { next.x = r.width - u - f.width; next.y = r.depth - f.depth; }
    if (f.wall === 'west') { next.x = 0; next.y = r.depth - u - f.depth; }
    return next;
  }
  function valid(f, r) {
    const z = f.elevation ?? 0, h = heightOf(f);
    return Number.isFinite(h) && h >= .05 && Number.isFinite(z) && z >= 0 && z + h <= ceiling(r) + 1e-8 && f.x >= -1e-8 && f.y >= -1e-8 && f.x + f.width <= r.width + 1e-8 && f.y + f.depth <= r.depth + 1e-8;
  }
  return { labels, heightOf, ceiling, length, project, pin, fromWall, valid };
})();
if (typeof module !== 'undefined') module.exports = RoomoryWallGeometry;
