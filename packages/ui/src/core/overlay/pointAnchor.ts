/**
 * A virtual anchor for overlays opened at a point rather than next to an
 * element — context menus at the pointer / long-press location.
 *
 * Set it as `useFloating`'s reference (`floating.refs.setReference(anchor)`):
 * the positioner measures it like a 1×1 element at `{ x, y }`, so flipping,
 * shifting and viewport clamping all work as for an element anchor.
 *
 * Coordinates are viewport coordinates on web (`clientX` / `clientY`) and page
 * coordinates on native (`pageX` / `pageY`), matching what the positioner's
 * element measurement returns on each platform.
 */
export interface PointAnchor {
  /** Web: read by `measureElement`. */
  getBoundingClientRect: () => {
    x: number;
    y: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  /** Native: read by `measureElement`. */
  measure: (
    callback: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void
  ) => void;
}

/** A point has no size; 1px keeps the positioner from treating it as unmounted. */
const POINT_SIZE = 1;

export function createPointAnchor(point: { x: number; y: number }): PointAnchor {
  const x = Number.isFinite(point.x) ? point.x : 0;
  const y = Number.isFinite(point.y) ? point.y : 0;
  return {
    getBoundingClientRect: () => ({
      x,
      y,
      top: y,
      left: x,
      right: x + POINT_SIZE,
      bottom: y + POINT_SIZE,
      width: POINT_SIZE,
      height: POINT_SIZE,
    }),
    measure: (callback) => callback(0, 0, POINT_SIZE, POINT_SIZE, x, y),
  };
}
