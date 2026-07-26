import type { KnobArcConfig } from './types';

export type NormalizedArcConfig = {
  // startAngle is kept in degrees (can be any real number, but normalized into [0,360) for SVG use)
  startAngle: number;
  // positive sweep in degrees (0..360]
  sweepAngle: number;
  // direction the sweep travels from startAngle: 'cw' (clockwise/increasing degrees) or 'ccw'
  direction: 'cw' | 'ccw';
  clampInput: boolean;
  wrap: boolean;
};

const clampNumber = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Normalize any degree value into [0, 360)
export const normalizeDegrees = (deg: number): number => {
  if (!Number.isFinite(deg)) return 0;
  const n = deg % 360;
  return n >= 0 ? n : n + 360;
};

const normalizeSweep = (sweep?: number) => {
  const fallback = 360;
  if (!Number.isFinite(sweep)) return fallback;
  const absolute = Math.abs(sweep as number);
  // allow full-circle as 360, but never 0
  return clampNumber(absolute || fallback, 1, 360);
};

export const normalizeArcConfig = (
  arc?: KnobArcConfig,
  options?: { isEndless?: boolean }
): NormalizedArcConfig => {
  const rawStart = arc?.startAngle ?? 0;
  const rawSweep = arc?.sweepAngle;
  const rawDirection = arc?.direction;

  const sweepAngle = normalizeSweep(rawSweep);
  // If the user provided a direction, honor it. Otherwise, default to 'cw'.
  const direction = rawDirection === 'ccw' ? 'ccw' : 'cw';

  return {
    startAngle: normalizeDegrees(rawStart),
    sweepAngle,
    direction,
    clampInput: arc?.clampInput ?? true,
    wrap: options?.isEndless ? arc?.wrap ?? true : true,
  };
};

export const getArcAngleFromRatio = (arc: NormalizedArcConfig, ratio: number) => {
  if (!Number.isFinite(ratio)) return arc.startAngle;
  const clamped = clampNumber(ratio, 0, 1);
  const multiplier = arc.direction === 'cw' ? 1 : -1;
  const rawAngle = arc.startAngle + multiplier * arc.sweepAngle * clamped;
  return arc.wrap ? normalizeDegrees(rawAngle) : rawAngle;
};

// Given an absolute angle (degrees), return how many degrees along the arc that angle represents
// in the configured direction (0..360). This always returns a positive progress value.
const getArcProgressDegrees = (arc: NormalizedArcConfig, angle: number) => {
  // work with normalized 0..360 values for consistent modular arithmetic
  const normalizedAngle = normalizeDegrees(angle);
  const start = normalizeDegrees(arc.startAngle);

  if (arc.direction === 'cw') {
    // cw progress = (angle - start + 360) % 360
    const delta = (normalizedAngle - start + 360) % 360;
    return delta;
  }
  // ccw progress = (start - angle + 360) % 360
  const delta = (start - normalizedAngle + 360) % 360;
  return delta;
};

// True when an angle falls in the wedge an arc shorter than a full circle leaves uncovered.
// Dragging through the dead zone should clamp to the nearer end, but a *tap* there has no
// meaningful value to jump to, so callers can opt out of acting on it entirely.
export const isAngleInArcDeadZone = (arc: NormalizedArcConfig, angle: number) => {
  if (arc.sweepAngle >= 359.999) return false;
  return getArcProgressDegrees(arc, angle) > arc.sweepAngle;
};

// Signed degrees to travel *along the arc* between two ratios, for arcs drawn from a pivot
// rather than from the start (split/panning progress). This deliberately works in ratio
// space: `getArcAngleFromRatio` wraps into [0,360), so subtracting two of its results can
// run the long way around the circle -- a pivot at 0deg and a value at 292.5deg read as
// +292.5 when the arc actually runs -67.5 the other way. Ratios have no such ambiguity,
// and sweeps wider than 180 degrees survive (a shortest-path fix would collapse them).
export const getSignedArcSweepBetweenRatios = (
  arc: NormalizedArcConfig,
  fromRatio: number,
  toRatio: number
) => {
  if (!Number.isFinite(fromRatio) || !Number.isFinite(toRatio)) return 0;
  const multiplier = arc.direction === 'cw' ? 1 : -1;
  return multiplier * arc.sweepAngle * (toRatio - fromRatio);
};

export const getArcRatioFromAngle = (
  arc: NormalizedArcConfig,
  angle: number,
  options?: { clamp?: boolean }
) => {
  const clampProgress = options?.clamp ?? arc.clampInput;
  const degrees = getArcProgressDegrees(arc, angle);
  if (!arc.sweepAngle) return 0;
  if (!clampProgress || degrees <= arc.sweepAngle) {
    return degrees / arc.sweepAngle;
  }

  // The pointer is in the dead zone -- the wedge an arc shorter than a full circle leaves
  // uncovered, which sits *between* the two ends. Progress is measured from the start and
  // wraps, so every angle in that wedge reads as just-short-of-360 and a plain clamp sends
  // all of it to the far end: one degree past the min end snapped the value to max.
  // Resolve to whichever end is actually nearer, splitting the wedge down the middle.
  const deadZoneMidpoint = arc.sweepAngle + (360 - arc.sweepAngle) / 2;
  return degrees <= deadZoneMidpoint ? 1 : 0;
};

const toRadians = (deg: number) => (deg * Math.PI) / 180;

// Convert degrees (0 at top, increasing clockwise) to SVG coordinates
const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  // angleInDegrees is in the same system we use throughout: 0 = top, increase = clockwise
  const angleInRadians = toRadians(angleInDegrees - 90);
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

// Describe a single arc segment as an SVG arc command from startAngle -> endAngle
// startAngle and endAngle are absolute degrees (can be any real number). We do not
// normalize them here because polarToCartesian handles arbitrary degree values.
const describeArcSegment = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  moveToStart: boolean
) => {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);

  // compute sweep in the straightforward arithmetic sense
  const sweep = endAngle - startAngle;
  if (Math.abs(sweep) < 0.0001) return '';

  // SVG large-arc-flag expects the absolute angle > 180
  const largeArcFlag = Math.abs(sweep) > 180 ? 1 : 0;
  // SVG sweep-flag: 1 means draw the arc in the "positive angle" direction
  const sweepFlag = sweep >= 0 ? 1 : 0;

  const move = moveToStart ? `M ${start.x} ${start.y}` : '';
  return `${move} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
};

// Build a path between two absolute angles. This supports arbitrary signed sweeps and will
// split the path into multiple segments to avoid >180-degree arc issues.
export const buildArcPathBetweenAngles = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  if (radius <= 0) return '';

  // total sweep (signed)
  let totalSweep = endAngle - startAngle;
  if (Math.abs(totalSweep) < 0.0001) return '';

  // We'll progressively carve the sweep into <= 179.999 degree segments
  let remaining = totalSweep;
  let currentStart = startAngle;
  let moveToStart = true;
  let path = '';

  while (Math.abs(remaining) > 0.0001) {
    const direction = remaining >= 0 ? 1 : -1;
    const segmentSweep = direction * Math.min(179.999, Math.abs(remaining));
    const end = currentStart + segmentSweep;
    const segment = describeArcSegment(cx, cy, radius, currentStart, end, moveToStart);
    if (segment) {
      path = `${path} ${segment}`.trim();
    }
    currentStart = end;
    remaining -= segmentSweep;
    moveToStart = false;
  }

  return path;
};

// Path for a band between two ratios of the arc. Angles are derived unwrapped (as in
// `buildArcPathForSweep`) rather than via `getArcAngleFromRatio`, whose [0,360) wrap would
// make a band that crosses 0deg render the long way round.
export const buildArcPathBetweenRatios = (
  arc: NormalizedArcConfig,
  radius: number,
  fromRatio: number,
  toRatio: number,
  center: { cx: number; cy: number }
) => {
  if (radius <= 0) return '';
  const from = clampNumber(fromRatio, 0, 1);
  const to = clampNumber(toRatio, 0, 1);
  if (Math.abs(to - from) < 0.0001) return '';
  const multiplier = arc.direction === 'cw' ? 1 : -1;
  const startAngle = arc.startAngle + multiplier * arc.sweepAngle * from;
  const endAngle = arc.startAngle + multiplier * arc.sweepAngle * to;
  return buildArcPathBetweenAngles(center.cx, center.cy, radius, startAngle, endAngle);
};

export const buildArcPathForSweep = (
  arc: NormalizedArcConfig,
  radius: number,
  ratio: number,
  center: { cx: number; cy: number }
) => {
  const clampedRatio = clampNumber(ratio, 0, 1);
  if (clampedRatio <= 0) return '';
  // compute signed endAngle based on direction
  const sweepDegrees = arc.sweepAngle * clampedRatio;
  const startAngle = arc.startAngle;
  const endAngle = arc.direction === 'cw' ? startAngle + sweepDegrees : startAngle - sweepDegrees;
  return buildArcPathBetweenAngles(center.cx, center.cy, radius, startAngle, endAngle);
};
