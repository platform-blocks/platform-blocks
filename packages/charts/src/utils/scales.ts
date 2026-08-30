import { niceTickStep } from '../utils';
// Basic scale abstractions for the chart library
// These are intentionally lightweight and can be extended (time/log/etc.)

/**
 * Scale function interface for mapping data values to visual coordinates
 */
export interface Scale<T = any> {
  /** Map a value from domain to range */
  (value: T): number;
  /** Get the scale's domain */
  domain(): any[];
  /** Get the scale's range */
  range(): number[];
  /** Map a value from range back to domain (if supported) */
  invert?(value: number): T;
  /** Generate evenly-spaced tick values (if supported) */
  ticks?(count?: number): any[];
  /** Get the bandwidth for band/point scales */
  bandwidth?(): number;
}

/**
 * Creates a linear scale that maps numeric values to a range
 * @param domain - Input domain [min, max]
 * @param range - Output range [min, max]
 * @returns Linear scale function with utility methods
 */
export function linearScale(domain: [number, number], range: [number, number]): Scale<number> {
  let [d0, d1] = domain;
  let [r0, r1] = range;
  const m = (r1 - r0) / (d1 - d0 || 1);
  const scale = ((value: number) => r0 + (value - d0) * m) as Scale<number>;
  scale.domain = () => [d0, d1];
  scale.range = () => [r0, r1];
  scale.invert = (val: number) => d0 + (val - r0) / (m || 1);
  scale.ticks = (count: number = 5) => generateNiceTicks(d0, d1, count);
  return scale;
}

/**
 * Creates a base-10 logarithmic scale that maps positive numeric values to a
 * range. Non-positive inputs are clamped to a tiny epsilon so the transform
 * never returns NaN.
 * @param domain - Input domain [min, max] (positive)
 * @param range - Output range [min, max]
 */
export function logScale(domain: [number, number], range: [number, number]): Scale<number> {
  const EPS = 1e-12;
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const ld0 = Math.log10(Math.max(d0, EPS));
  const ld1 = Math.log10(Math.max(d1, EPS));
  const span = ld1 - ld0 || 1;
  const scale = ((value: number) => {
    const t = (Math.log10(Math.max(value, EPS)) - ld0) / span;
    return r0 + t * (r1 - r0);
  }) as Scale<number>;
  scale.domain = () => [d0, d1];
  scale.range = () => [r0, r1];
  scale.invert = (val: number) => {
    const t = (val - r0) / ((r1 - r0) || 1);
    return Math.pow(10, ld0 + t * span);
  };
  scale.ticks = (count: number = 6) => generateLogTicks(d0, d1, count);
  return scale;
}

/**
 * Creates a time scale (domain values are millisecond epochs). Linear under the
 * hood but generates calendar-aware ticks.
 * @param domain - Input domain [startMs, endMs]
 * @param range - Output range [min, max]
 */
export function timeScale(domain: [number, number], range: [number, number]): Scale<number> {
  const base = linearScale(domain, range);
  const scale = ((value: number) => base(value)) as Scale<number>;
  scale.domain = base.domain;
  scale.range = base.range;
  scale.invert = base.invert;
  scale.ticks = (count: number = 6) => generateTimeTicks(domain[0], domain[1], count);
  return scale;
}

/**
 * Options for band scale configuration
 */
export interface BandScaleOptions {
  /** Space between bands (0-1) */
  paddingInner?: number;
  /** Outer padding (0-1) */
  paddingOuter?: number;
  /** Alignment (0=left, 1=right) */
  align?: number;
}

/**
 * Creates a band scale for categorical data
 * @param domain - Array of category names
 * @param range - Output range [min, max]
 * @param opts - Band scale options
 * @returns Band scale function with utility methods
 */
export function bandScale(domain: string[], range: [number, number], opts: BandScaleOptions = {}): Scale<string> {
  const { paddingInner = 0.1, paddingOuter = 0.05, align = 0 } = opts;
  const [r0, r1] = range;
  const step = (r1 - r0) / Math.max(1, domain.length + paddingOuter * 2 - paddingInner);
  const bandwidthValue = step * (1 - paddingInner);
  const start = r0 + (r1 - r0 - (step * domain.length)) * align;
  const indexMap = new Map(domain.map((d, i) => [d, i] as const));
  const scale = ((value: string) => {
    const i = indexMap.get(value);
    if (i == null) return NaN;
    return start + i * step + (step - bandwidthValue) / 2;
  }) as Scale<string>;
  scale.domain = () => domain.slice();
  scale.range = () => [r0, r1];
  scale.bandwidth = () => bandwidthValue;
  return scale;
}

/**
 * Helper function to generate nice tick values for a linear scale
 * @param min - Minimum value
 * @param max - Maximum value
 * @param target - Target number of ticks (default 5)
 * @returns Array of evenly-spaced tick values
 */
export function generateNiceTicks(min: number, max: number, target: number = 5): number[] {
  if (min === max) return [min];
  // One chooser for both generators, so an axis and the gridlines behind it
  // can't disagree about where the ticks are.
  const niceStep = niceTickStep(max - min, target);
  if (!Number.isFinite(niceStep) || niceStep <= 0) return [min, max];
  const first = Math.ceil(min / niceStep) * niceStep;
  const ticks: number[] = [];
  // Stop at the domain, not half a step past it. The old bound emitted a tick
  // above `max` whenever the data didn't end on a round number, and the axis
  // drew its label wherever the scale extrapolated to — outside the plot.
  for (let v = first; v <= max + niceStep * 1e-6; v += niceStep) {
    ticks.push(Number(v.toFixed(12)));
  }
  return ticks;
}

/**
 * Generate 1/2/5-per-decade tick values for a base-10 log scale.
 * @param min - Domain minimum (positive)
 * @param max - Domain maximum (positive)
 * @param count - Target number of ticks (default 6)
 */
export function generateLogTicks(min: number, max: number, count: number = 6): number[] {
  const lo = Math.max(min, 1e-12);
  const hi = Math.max(max, 1e-12);
  if (hi <= lo) return [lo];
  const logMin = Math.log10(lo);
  const logMax = Math.log10(hi);
  const span = logMax - logMin;
  const ticks: number[] = [];
  for (let exp = Math.floor(logMin); exp <= Math.ceil(logMax); exp++) {
    [1, 2, 5].forEach(m => {
      const v = m * Math.pow(10, exp);
      const lv = Math.log10(v);
      if (lv < logMin - 1e-9 || lv > logMax + 1e-9) return;
      ticks.push(v);
    });
  }
  if (ticks.length > count * 1.8) {
    const ratio = Math.ceil(ticks.length / count);
    return ticks.filter((_, i) => i % ratio === 0);
  }
  if (ticks.length < count) {
    const needed = count - ticks.length;
    for (let i = 0; i < needed; i++) {
      const pos = (i + 1) / (needed + 1);
      ticks.push(Math.pow(10, logMin + span * pos));
    }
  }
  return Array.from(new Set(ticks)).sort((a, b) => a - b);
}

/**
 * Generate calendar-aware tick values for a time scale.
 * @param start - Domain start (ms epoch)
 * @param end - Domain end (ms epoch)
 * @param count - Target number of ticks (default 6)
 */
export function generateTimeTicks(start: number, end: number, count: number = 6): number[] {
  if (!(isFinite(start) && isFinite(end)) || end <= start) return [start];
  const span = end - start;
  const intervals = [
    1000, 5000, 15000, 30000, // seconds
    60000, 300000, 600000, 900000, 1800000, // minutes
    3600000, 7200000, 14400000, 28800000, 43200000, // hours
    86400000, 172800000, 604800000, // days / week
    2592000000, 7776000000, 15552000000, // ~months (30d, 90d, 180d)
    31536000000, // year
  ];
  let interval = intervals[intervals.length - 1];
  for (const iv of intervals) { if (span / iv <= count * 1.2) { interval = iv; break; } }
  const first = Math.ceil(start / interval) * interval;
  const ticks: number[] = [];
  for (let t = first; t <= end; t += interval) ticks.push(t);
  if (ticks.length < 2) return [start, end];
  return ticks;
}
