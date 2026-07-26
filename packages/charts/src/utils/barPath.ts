/**
 * Worklet-safe SVG path builder for a bar with per-corner rounding.
 *
 * Bars round only their DATA-END corners and stay flat on the baseline (per the
 * data-viz mark spec: "4px rounded data-ends anchored to the baseline"). Which
 * corners are rounded is passed as 0/1 multipliers (`tl,tr,br,bl`) decided by the
 * caller from orientation + sign, so the worklet itself branches on nothing.
 *
 * The radius is clamped to half the (animated) width/height, so it collapses to a
 * sharp rectangle while a bar grows from zero and never over-rounds a thin bar.
 *
 * Marked `'worklet'` so it can be called from a reanimated `useAnimatedProps`
 * callback on the UI thread.
 */
export function roundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  tl: number,
  tr: number,
  br: number,
  bl: number,
): string {
  'worklet';
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const rtl = r * tl;
  const rtr = r * tr;
  const rbr = r * br;
  const rbl = r * bl;
  return (
    `M${x + rtl},${y}` +
    `L${x + w - rtr},${y}` +
    (rtr ? `Q${x + w},${y} ${x + w},${y + rtr}` : '') +
    `L${x + w},${y + h - rbr}` +
    (rbr ? `Q${x + w},${y + h} ${x + w - rbr},${y + h}` : '') +
    `L${x + rbl},${y + h}` +
    (rbl ? `Q${x},${y + h} ${x},${y + h - rbl}` : '') +
    `L${x},${y + rtl}` +
    (rtl ? `Q${x},${y} ${x + rtl},${y}` : '') +
    'Z'
  );
}

/**
 * Corner multipliers `{tl,tr,br,bl}` for a bar, given orientation and sign.
 * The data end (top of a positive column, bottom of a negative one, etc.) gets
 * the radius; the baseline end stays square.
 */
export function barCornerMask(
  orientation: 'vertical' | 'horizontal',
  isPositive: boolean,
): { tl: number; tr: number; br: number; bl: number } {
  if (orientation === 'vertical') {
    return isPositive
      ? { tl: 1, tr: 1, br: 0, bl: 0 }
      : { tl: 0, tr: 0, br: 1, bl: 1 };
  }
  return isPositive
    ? { tl: 0, tr: 1, br: 1, bl: 0 }
    : { tl: 1, tr: 0, br: 0, bl: 1 };
}
