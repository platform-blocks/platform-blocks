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
export function generateTicks(
  min: number,
  max: number,
  targetCount: number = 5
): number[] {
  if (min === max) {
    return [min];
  }
  
  const range = max - min;
  const roughStep = range / (targetCount - 1);
  
  // Find the power of 10 that's less than or equal to roughStep
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  
  // Normalize the step to a nice value
  const normalizedStep = roughStep / magnitude;
  let step;
  
  if (normalizedStep <= 1) {
    step = magnitude;
  } else if (normalizedStep <= 2) {
    step = 2 * magnitude;
  } else if (normalizedStep <= 5) {
    step = 5 * magnitude;
  } else {
    step = 10 * magnitude;
  }
  
  // Generate ticks
  const ticks: number[] = [];
  const start = Math.ceil(min / step) * step;
  
  for (let tick = start; tick <= max + step * 0.01; tick += step) {
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
// Validated categorical palette (light surface). The slot order is the CVD-safety
// mechanism — see colors.ts `paletteDefaultLight`. Keep in sync with that export.
const FALLBACK_DEFAULT_SCHEME = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
] as const;

export const colorSchemes: { default: string[]; pastel: string[] } = {
  default: [...FALLBACK_DEFAULT_SCHEME],
  pastel: [
    '#93c5fd', // blue-300
    '#fca5a5', // red-300
    '#6ee7b7', // green-300
    '#fcd34d', // amber-300
    '#c4b5fd', // violet-300
    '#fdba74', // orange-300
    '#67e8f9', // cyan-300
    '#f9a8d4', // pink-300
  ],
};

/**
 * Replace the default categorical palette while preserving reference identity for consumers.
 */
export function setDefaultColorScheme(palette?: string[]) {
  const next = Array.isArray(palette) && palette.length ? palette : [...FALLBACK_DEFAULT_SCHEME];
  colorSchemes.default = next.map(color => `${color}`);
  return colorSchemes.default;
}

/**
 * Get color from scheme
 */
export function getColorFromScheme(
  index: number,
  scheme: string[] = colorSchemes.default
): string {
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
