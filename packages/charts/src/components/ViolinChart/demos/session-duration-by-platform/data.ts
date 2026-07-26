import type { ViolinStatsMarkersConfig, ViolinValueBand } from '../../types';
import type { DensitySeries } from '../../../RidgeChart/types';

export const createDistribution = (mean: number, spread: number, count: number, floor = 0.6) =>
  Array.from({ length: count }, (_, index) => {
    const angle = index * 0.43;
    const contour = Math.sin(angle) * spread + Math.cos(angle * 0.61) * spread * 0.45;
    const usageCycle = ((index % 13) - 6) * 0.05 * spread;
    const value = Math.max(floor, mean + contour + usageCycle);
    return Number(value.toFixed(2));
  });

export const SESSION_SERIES: DensitySeries[] = [
  {
    id: 'ios',
    name: 'iOS',
    values: createDistribution(6.8, 2.4, 150),
  },
  {
    id: 'android',
    name: 'Android',
    values: createDistribution(7.4, 2.8, 150),
  },
  {
    id: 'web',
    name: 'Web',
    values: createDistribution(5.1, 2.2, 150),
  },
  {
    id: 'tv',
    name: 'Smart TV',
    values: createDistribution(11.2, 3.5, 150, 2.2),
  },
];

export const ENGAGEMENT_BANDS: ViolinValueBand[] = [
  {
    id: 'sweet-spot',
    from: 3,
    to: 8,
    label: 'Engagement sweet spot',
    color: '#94D82D',
    opacity: 0.12,
    labelPosition: 'left',
  },
];

export const STATS: ViolinStatsMarkersConfig = {
  showMedian: true,
  showMean: true,
  showLabels: true,
  colors: {
    median: '#364FC7',
    mean: '#2B8A3E',
  },
  markerWidthRatio: 0.8,
};
