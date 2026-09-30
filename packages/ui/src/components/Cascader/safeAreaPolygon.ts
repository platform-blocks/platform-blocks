interface Point { x: number; y: number }
interface ColumnBounds { left: number; right: number; top: number; bottom: number }

function signedArea(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

/** Keep the current branch open while the pointer crosses the triangle leading to its child column. */
export function isInSafeArea(point: Point, origin: Point, column: ColumnBounds, isRTL: boolean, buffer: number) {
  const edge = isRTL ? column.left : column.right;
  const top = { x: edge, y: column.top - buffer };
  const bottom = { x: edge, y: column.bottom + buffer };
  const a = signedArea(origin, top, point);
  const b = signedArea(top, bottom, point);
  const c = signedArea(bottom, origin, point);
  return (a >= 0 && b >= 0 && c >= 0) || (a <= 0 && b <= 0 && c <= 0);
}
