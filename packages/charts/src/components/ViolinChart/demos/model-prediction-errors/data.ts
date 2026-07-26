import type { ViolinStatsMarkersConfig, ViolinValueBand } from '../../types';
import type { DensitySeries } from '../../../RidgeChart/types';

export const createDistribution = (mean: number, spread: number, count: number, floor = 0.2) =>
  Array.from({ length: count }, (_, index) => {
    const angle = index * 0.35;
    const variance = Math.sin(angle) * spread + Math.cos(angle * 0.49) * spread * 0.58;
    const drift = ((index % 12) - 6) * 0.04 * spread;
    const value = Math.max(floor, mean + variance + drift);
    return Number(value.toFixed(3));
  });

export const ERROR_SERIES: DensitySeries[] = [
  {
    id: 'v1',
    name: 'Model v1 — baseline',
    values: createDistribution(2.85, 0.45, 150, 1.1),
    strokeColor: '#868E96',
    fillOpacity: 0.28,
  },
  {
    id: 'v2',
    name: 'Model v2 — feature store refresh',
    values: createDistribution(2.12, 0.38, 150, 0.9),
    fillOpacity: 0.32,
  },
  {
    id: 'v3',
    name: 'Model v3 — explainable boosting',
    values: createDistribution(1.46, 0.33, 150, 0.7),
    fillOpacity: 0.34,
  },
  {
    id: 'v4',
    name: 'Model v4 — ensemble',
    values: createDistribution(1.08, 0.28, 150, 0.6),
    fillOpacity: 0.36,
  },
];

export const VALUE_BANDS: ViolinValueBand[] = [
  {
    id: 'target-zone',
    from: 0.8,
    to: 1.6,
    label: 'Target MAE window',
    color: '#69DB7C',
    opacity: 0.18,
    labelPosition: 'right',
    labelColor: '#2F9E44',
  },
  {
    id: 'alert-zone',
    from: 2.4,
    to: 3.4,
    label: 'Alert threshold',
    color: '#FFA8A8',
    opacity: 0.22,
    labelPosition: 'left',
    labelColor: '#C92A2A',
  },
];

export const STATS: ViolinStatsMarkersConfig = {
  showMedian: true,
  showQuartiles: true,
  showMean: true,
  showLabels: true,
  colors: {
    median: '#364FC7',
    quartile: '#15AABF',
    mean: '#0B7285',
  },
  markerWidthRatio: 0.76,
};
