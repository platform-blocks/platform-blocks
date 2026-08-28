import type { DensitySeries, ViolinStatsMarkersConfig, ViolinValueBand } from '@platform-blocks/charts';

export const createDistribution = (mean: number, spread: number, count: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = index * 0.39;
    const texture = Math.sin(angle) * spread + Math.cos(angle * 0.57) * spread * 0.52;
    const drift = ((index % 10) - 5) * 0.07 * spread;
    const value = mean + texture + drift;
    return Number(value.toFixed(2));
  });

export const EXPERIMENT_SERIES: DensitySeries[] = [
  {
    id: 'control',
    name: 'Control holdout',
    values: createDistribution(0.1, 0.9, 140),
    strokeColor: '#868E96',
  },
  {
    id: 'variant-a',
    name: 'Variant A — onboarding nudge',
    values: createDistribution(1.8, 1.2, 140),
  },
  {
    id: 'variant-b',
    name: 'Variant B — personalization',
    values: createDistribution(3.6, 1.5, 140),
  },
  {
    id: 'variant-c',
    name: 'Variant C — price emphasis',
    values: createDistribution(-0.6, 1.1, 140),
  },
];

export const VALUE_BANDS: ViolinValueBand[] = [
  {
    id: 'neutral-band',
    from: -1,
    to: 1,
    label: 'Neutral delta corridor',
    color: '#DEE2E6',
    opacity: 0.32,
    labelPosition: 'left',
    labelColor: '#495057',
  },
  {
    id: 'meaningful-lift',
    from: 2,
    to: 6,
    label: 'Meaningful lift zone',
    color: '#51CF66',
    opacity: 0.18,
    labelPosition: 'right',
    labelColor: '#2B8A3E',
  },
];

export const STATS: ViolinStatsMarkersConfig = {
  showMedian: true,
  showMean: true,
  showWhiskers: true,
  showLabels: true,
  markerWidthRatio: 0.72,
  colors: {
    median: '#364FC7',
    mean: '#0B7285',
    whisker: '#868E96',
  },
};
