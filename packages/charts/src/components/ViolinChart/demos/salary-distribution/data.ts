import type { DensitySeries, ViolinStatsMarkersConfig, ViolinValueBand } from '@platform-blocks/charts';

export const createDistribution = (median: number, spread: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = index * 0.41;
    const oscillation = Math.sin(angle) * spread + Math.cos(angle * 0.63) * spread * 0.55;
    const progression = ((index % 11) - 5) * 0.09 * spread;
    const value = Math.max(48, median + oscillation + progression);
    return Number(value.toFixed(1));
  });

export const SALARY_SERIES: DensitySeries[] = [
  {
    id: 'engineering',
    name: 'Engineering',
    values: createDistribution(128, 14, 160),
    fillOpacity: 0.32,
  },
  {
    id: 'design',
    name: 'Design',
    values: createDistribution(104, 11, 160),
    fillOpacity: 0.32,
  },
  {
    id: 'product',
    name: 'Product',
    values: createDistribution(118, 12, 160),
    fillOpacity: 0.32,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    values: createDistribution(96, 10, 160),
    fillOpacity: 0.32,
  },
];

export const MARKET_RANGE: ViolinValueBand[] = [
  {
    id: 'market',
    from: 88,
    to: 112,
    label: 'Market reference band',
    color: '#228BE6',
    opacity: 0.14,
    labelPosition: 'left',
    labelColor: '#1C7ED6',
  },
];

export const STATS: ViolinStatsMarkersConfig = {
  showMedian: true,
  showQuartiles: true,
  showMean: true,
  showLabels: true,
  colors: {
    median: '#364FC7',
    quartile: '#1971C2',
    mean: '#2F9E44',
  },
  markerWidthRatio: 0.78,
};
