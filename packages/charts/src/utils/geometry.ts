// Canonical polar/geometry helpers for the charts package.
//
// SINGLE ANGLE CONVENTION for the whole library:
//   - angles are in DEGREES
//   - 0° points straight UP (12 o'clock)
//   - positive angles rotate CLOCKWISE
//
// This matches the pre-existing radial helpers (PieChart and RadialBarChart
// both subtracted 90° from a standard math angle). All radial charts
// and hit-testers MUST delegate here rather than re-deriving the transform, so
// the top-origin / clockwise convention is defined in exactly one place.

/** Degrees → radians in the canonical (0° = up, clockwise) frame. */
export function polarAngleToRadians(angleDeg: number): number {
  // Subtracting 90° rotates the math frame (0° = +x, CCW) so that 0° points up.
  return ((angleDeg - 90) * Math.PI) / 180;
}

/**
 * Convert a polar coordinate to cartesian, using the canonical convention
 * (0° = up, clockwise positive).
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = polarAngleToRadians(angleDeg);
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * Inverse of {@link polarToCartesian}: given a pixel relative to a center,
 * return its angle (canonical: 0° = up, clockwise, normalized to [0, 360)) and
 * radius. Used by radial/radar hit-testing.
 */
export function angleFromPoint(
  cx: number,
  cy: number,
  px: number,
  py: number,
): { angleDeg: number; radius: number } {
  const dx = px - cx;
  const dy = py - cy;
  const radius = Math.hypot(dx, dy);
  // atan2 gives the math-frame angle (0 = +x, CCW). Undo the -90° rotation and
  // flip to clockwise so it round-trips with polarAngleToRadians.
  let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  angleDeg = ((angleDeg % 360) + 360) % 360;
  return { angleDeg, radius };
}

/**
 * Whether a point falls inside an annular sector (arc slice): between
 * [innerRadius, outerRadius] and within the [startAngle, endAngle] sweep.
 * Angles use the canonical convention. `startAngle`/`endAngle` are normalized
 * so wrap-around sweeps (e.g. 350° → 10°) are handled.
 */
export function isPointInSlice(
  cx: number,
  cy: number,
  px: number,
  py: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): boolean {
  const { angleDeg, radius } = angleFromPoint(cx, cy, px, py);
  if (radius < innerRadius || radius > outerRadius) return false;
  return angleInSweep(angleDeg, startAngle, endAngle);
}

/** True if `angleDeg` lies within the clockwise sweep from start→end. */
export function angleInSweep(angleDeg: number, startAngle: number, endAngle: number): boolean {
  const norm = (a: number) => ((a % 360) + 360) % 360;
  const a = norm(angleDeg);
  const s = norm(startAngle);
  let e = norm(endAngle);
  // Represent the sweep as [s, s + span] where span ∈ (0, 360].
  let span = e - s;
  if (span <= 0) span += 360;
  let rel = a - s;
  if (rel < 0) rel += 360;
  return rel <= span;
}
