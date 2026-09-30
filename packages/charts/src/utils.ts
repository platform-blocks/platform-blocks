import { ChartDataPoint, PieChartDataPoint, BarChartDataPoint, ChartInteractionEvent, LineChartSeries } from './types';

/**
 * Chart utility functions
 */

/**
 * Get data domain from multiple series
 */
export function getMultiSeriesDomain(
  series: LineChartSeries[],
  accessor: (d: ChartDataPoint) => number
): [number, number] {
  const allData = series.filter(s => s.visible !== false).flatMap(s => s.data);
  return getDataDomain(allData, accessor);
}

/**
 * Normalize data/series input for LineChart
 */
export function normalizeLineChartData(
  data?: ChartDataPoint[],
  series?: LineChartSeries[]
): LineChartSeries[] {
  if (series && series.length > 0) {
    return series;
  }
  
  if (data && data.length > 0) {
    return [{
      id: 'default',
      name: 'Data Series',
      data,
      visible: true,
    }];
  }
  
  return [];
}

/**
 * Calculate chart dimensions including padding for axes and labels
 */
export function calculateChartDimensions(
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
) {
  return {
    plotArea: {
      x: padding.left,
      y: padding.top,
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom,
    },
    total: { width, height },
    padding,
  };
}

/**
 * Scale a value from data domain to chart range
 */
export function scaleLinear(
  value: number,
  domain: [number, number],
  range: [number, number]
): number {
  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;
  
  if (domainMax === domainMin) {
    return rangeMin;
  }
  
  const ratio = (value - domainMin) / (domainMax - domainMin);
  return rangeMin + ratio * (rangeMax - rangeMin);
}

/** Log scale (base 10) */
export function scaleLog(value: number, domain: [number, number], range: [number, number]): number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const v = Math.max(value, 1e-12);
  const ld0 = Math.log10(Math.max(d0, 1e-12));
  const ld1 = Math.log10(Math.max(d1, 1e-12));
  if (ld1 === ld0) return r0;
  const t = (Math.log10(v) - ld0) / (ld1 - ld0);
  return r0 + t * (r1 - r0);
}

/** Time scale (value = ms epoch) linear wrapper */
export function scaleTime(value: number, domain: [number, number], range: [number, number]): number {
  return scaleLinear(value, domain, range);
}

export function generateLogTicks(domain: [number, number], count: number = 6): number[] {
  const [rawMin, rawMax] = domain;
  const min = Math.max(rawMin, 1e-12);
  const max = Math.max(rawMax, 1e-12);
  if (max <= min) return [min];
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  const ticks: number[] = [];
  const span = logMax - logMin;
  for (let exp = Math.floor(logMin); exp <= Math.ceil(logMax); exp++) {
    [1,2,5].forEach(m => {
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
  while (ticks.length < count) {
    const needed = count - ticks.length;
    for (let i = 0; i < needed; i++) {
      const pos = (i + 1) / (needed + 1);
      ticks.push(Math.pow(10, logMin + span * pos));
    }
    ticks.sort((a,b)=>a-b);
    break;
  }
  return Array.from(new Set(ticks)).sort((a,b)=>a-b);
}

export function generateTimeTicks(domain: [number, number], count: number = 6): number[] {
  const [start, end] = domain;
  if (!(isFinite(start) && isFinite(end)) || end <= start) return [start];
  const span = end - start;
  // Choose nice interval
  const intervals = [
    1000, 5000, 15000, 30000, // seconds
    60000, 300000, 600000, 900000, 1800000, // minutes
    3600000, 7200000, 14400000, 28800000, 43200000, // hours
    86400000, 172800000, 604800000, // days / week
    2592000000, 7776000000, 15552000000, // months approx (30d, 90d, 180d)
    31536000000 // year
  ];
  let interval = intervals[intervals.length -1];
  for (const iv of intervals) { if (span / iv <= count * 1.2) { interval = iv; break; } }
  const first = Math.ceil(start / interval) * interval;
  const ticks: number[] = [];
  for (let t = first; t <= end; t += interval) ticks.push(t);
  if (ticks.length < 2) return [start, end];
  return ticks;
}

/**
 * Get data domain (min/max values) from dataset
 */
export function getDataDomain(
  data: ChartDataPoint[],
  accessor: (d: ChartDataPoint) => number
): [number, number] {
  if (data.length === 0) {
    return [0, 1];
  }
  
  const values = data.map(accessor).filter(v => Number.isFinite(v));
  if (values.length === 0) {
    return [0, 1];
  }
  return [Math.min(...values), Math.max(...values)];
}

/**
 * Generate nice tick values for an axis
 */
/**
 * Picks the "nice" tick step (1, 2, or 5 × a power of ten) that lands closest to
 * `targetCount` ticks across `span`.
 *
 * The old rule rounded the rough step *up* to the next nice value, so a span of
 * 8,800 asked for 5 ticks got a step of 5,000 — and an axis with a single label
 * on it. Choosing by proximity (the thresholds are d3's) keeps the requested
 * density instead.
 */
export function niceTickStep(span: number, targetCount: number = 5): number {
  const absSpan = Math.abs(span);
  if (!Number.isFinite(absSpan) || absSpan === 0) return 0;
  const rough = absSpan / Math.max(1, targetCount);
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const error = rough / power;
  const multiple = error >= Math.sqrt(50) ? 10 : error >= Math.sqrt(10) ? 5 : error >= Math.sqrt(2) ? 2 : 1;
  return multiple * power;
}

export function generateTicks(
  min: number,
  max: number,
  targetCount: number = 5
): number[] {
  if (min === max) {
    return [min];
  }

  const step = niceTickStep(max - min, targetCount);
  if (!Number.isFinite(step) || step <= 0) return [min, max];

  // Generate ticks
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;

  for (let tick = start; tick <= max + step * 1e-6; tick += step) {
    ticks.push(Number(tick.toFixed(10))); // Avoid floating point precision issues
  }

  return ticks;
}

/**
 * Convert chart coordinates to data coordinates
 */
export function chartToDataCoordinates(
  chartX: number,
  chartY: number,
  plotArea: { x: number; y: number; width: number; height: number },
  xDomain: [number, number],
  yDomain: [number, number]
): { x: number; y: number } {
  const relativeX = (chartX - plotArea.x) / plotArea.width;
  const relativeY = (chartY - plotArea.y) / plotArea.height;
  
  const dataX = scaleLinear(relativeX, [0, 1], xDomain);
  const dataY = scaleLinear(1 - relativeY, [0, 1], yDomain); // Flip Y axis
  
  return { x: dataX, y: dataY };
}

/**
 * Convert data coordinates to chart coordinates
 */
export function dataToChartCoordinates(
  dataX: number,
  dataY: number,
  plotArea: { x: number; y: number; width: number; height: number },
  xDomain: [number, number],
  yDomain: [number, number]
): { x: number; y: number } {
  const relativeX = scaleLinear(dataX, xDomain, [0, 1]);
  const relativeY = scaleLinear(dataY, yDomain, [0, 1]);
  
  const chartX = plotArea.x + relativeX * plotArea.width;
  const chartY = plotArea.y + (1 - relativeY) * plotArea.height; // Flip Y axis
  
  return {
    x: Number.isFinite(chartX) ? chartX : 0,
    y: Number.isFinite(chartY) ? chartY : 0,
  };
}

/**
 * Find the closest data point to a chart coordinate
 */
export function findClosestDataPoint(
  chartX: number,
  chartY: number,
  data: ChartDataPoint[],
  plotArea: { x: number; y: number; width: number; height: number },
  xDomain: [number, number],
  yDomain: [number, number],
  maxDistance: number = 20
): { dataPoint: ChartDataPoint; distance: number } | null {
  let closestPoint: ChartDataPoint | null = null;
  let closestDistance = Infinity;
  
  for (const point of data) {
    const chartCoords = dataToChartCoordinates(
      point.x,
      point.y,
      plotArea,
      xDomain,
      yDomain
    );
    
    const distance = Math.sqrt(
      Math.pow(chartX - chartCoords.x, 2) + Math.pow(chartY - chartCoords.y, 2)
    );
    
    if (distance < closestDistance && distance <= maxDistance) {
      closestDistance = distance;
      closestPoint = point;
    }
  }
  
  return closestPoint ? { dataPoint: closestPoint, distance: closestDistance } : null;
}

/**
 * Calculate angle for pie chart slice
 */
export function calculatePieAngle(
  value: number,
  total: number,
  startAngle: number = 0,
  endAngle: number = 360
): { startAngle: number; endAngle: number; centerAngle: number } {
  const totalAngle = endAngle - startAngle;
  const percentage = value / total;
  const sliceAngle = percentage * totalAngle;
  
  const sliceStart = startAngle;
  const sliceEnd = startAngle + sliceAngle;
  const sliceCenter = startAngle + sliceAngle / 2;
  
  return {
    startAngle: sliceStart,
    endAngle: sliceEnd,
    centerAngle: sliceCenter,
  };
}

/**
 * Calculate point on circle for pie chart labels
 */
export function getPointOnCircle(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const x = centerX + radius * Math.cos(angleInRadians - Math.PI / 2);
  const y = centerY + radius * Math.sin(angleInRadians - Math.PI / 2);
  
  return { x, y };
}

/**
 * Create smooth path for line chart
 */
export function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) {
    return '';
  }
  
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    
    if (i === 1) {
      // First curve
      const cp1x = prev.x + (curr.x - prev.x) * 0.3;
      const cp1y = prev.y;
      const cp2x = curr.x - (next ? (next.x - prev.x) * 0.2 : (curr.x - prev.x) * 0.3);
      const cp2y = curr.y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    } else if (i === points.length - 1) {
      // Last curve
      const cp1x = prev.x + (curr.x - points[i - 2].x) * 0.2;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) * 0.3;
      const cp2y = curr.y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    } else {
      // Middle curves
      const cp1x = prev.x + (curr.x - points[i - 2].x) * 0.2;
      const cp1y = prev.y;
      const cp2x = curr.x - (next.x - prev.x) * 0.2;
      const cp2y = curr.y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
  }
  
  return path;
}

/**
 * Default color schemes
 */
/**
 * The palette color for a slot, wrapping past the end. Charts pass the theme's
 * `accentPalette`.
 */
export function getColorFromScheme(index: number, scheme: readonly string[]): string {
  return scheme[index % scheme.length];
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Calculate distance between two points
 */
export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Format number for display
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * How charts render numbers they weren't given a formatter for.
 * - `'compact'` (default): 9000 → "9K", 1,250,000 → "1.3M"
 * - `'full'`: 9000 → "9,000"
 * - a function: used as-is
 */
export type NumberFormat = 'compact' | 'full' | ((value: number) => string);

// Largest first, so a value that rounds up into the next unit (999,950 → "1M")
// lands there instead of rendering as "1000K".
const COMPACT_UNITS: ReadonlyArray<readonly [number, string]> = [
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
];

const compactParts = (value: number, decimals: number): { scaled: number; unit: number; suffix: string } | null => {
  const abs = Math.abs(value);
  if (!Number.isFinite(value) || abs < 1000) return null;
  for (const [unit, suffix] of COMPACT_UNITS) {
    const scaled = Number((abs / unit).toFixed(decimals));
    if (scaled >= 1) return { scaled, unit, suffix };
  }
  return null;
};

/**
 * Format number with a magnitude suffix (K, M, B, T). Values under 1,000 render
 * exactly as `formatNumber` does.
 */
export function formatCompactNumber(
  value: number,
  decimals: number = 1,
  locale: string = 'en-US'
): string {
  const parts = compactParts(value, decimals);
  if (!parts) return Number.isFinite(value) ? formatNumber(value, 2, locale) : String(value);
  return `${formatNumber(value < 0 ? -parts.scaled : parts.scaled, decimals, locale)}${parts.suffix}`;
}

const fullNumber = (value: number) => (Number.isFinite(value) ? formatNumber(value) : String(value));

/**
 * Resolve a `NumberFormat` setting to a formatter for individual values
 * (data labels, center values).
 *
 * `fallback` is the chart's own rendering for any number it doesn't abbreviate —
 * values under 1,000, and every value under `'full'` — so opting out restores
 * exactly what the chart drew before. Defaults to `formatNumber`.
 */
export function resolveNumberFormatter(
  format: NumberFormat = 'compact',
  fallback: (value: number) => string = fullNumber
): (value: number) => string {
  if (typeof format === 'function') return format;
  if (format === 'full') return fallback;
  return (value) => (compactParts(value, 1) ? formatCompactNumber(value, 1) : fallback(value));
}

/**
 * Resolve a `NumberFormat` setting to a formatter for one axis's ticks.
 *
 * A tick label never rounds: compact labels are used only when every tick is
 * exact at one decimal ("2.5K"), or at two once ticks are at least 1,000 apart
 * ("1.05M"). Anything finer — a narrow range at a large magnitude, like a price
 * axis stepping 1,200 / 1,210 / 1,220, or years — renders the whole axis with
 * `fallback`, which reads better there than "1.2K" or "2.01K" on every tick.
 * Pass the axis's previous rendering (e.g. `String`, so a year axis keeps
 * reading "2019" rather than "2,019").
 */
export function createTickFormatter(
  ticks: ReadonlyArray<number | string>,
  format: NumberFormat = 'compact',
  fallback: (value: number) => string = fullNumber
): (value: number) => string {
  if (format !== 'compact') return resolveNumberFormatter(format, fallback);
  const numeric = Array.from(new Set(ticks.map(Number).filter(Number.isFinite))).sort((a, b) => a - b);
  const step = numeric.reduce((min, tick, i) => (i > 0 ? Math.min(min, tick - numeric[i - 1]) : min), Infinity);
  const exactAt = (decimals: number) => numeric.every((tick) => {
    const parts = compactParts(tick, decimals);
    return !parts || Math.abs(parts.scaled * parts.unit - Math.abs(tick)) <= Math.abs(tick) * 1e-9;
  });
  const decimals = exactAt(1) ? 1 : step >= 1000 && exactAt(2) ? 2 : null;
  if (decimals === null) return fallback;
  return (value) => (compactParts(value, decimals) ? formatCompactNumber(value, decimals) : fallback(value));
}

/**
 * Format percentage for display
 */
export function formatPercentage(
  value: number,
  total: number,
  decimals: number = 1
): string {
  const percentage = (value / total) * 100;
  return `${formatNumber(percentage, decimals)}%`;
}
