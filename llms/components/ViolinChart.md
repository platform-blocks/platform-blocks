# Violin Chart

ViolinChart shows a data distribution with a mirrored density shape and summary statistics.

## Metadata

- Import: `import { ViolinChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, violin, distribution
- Docs: https://plocks.dev/charts/ViolinChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/ViolinChart

## Props

- `series` (required): ViolinDensitySeries[] — Density series rendered within the violin chart
- `samples`: number — Density sample resolution
- `bandwidth`: number — Kernel bandwidth override
- `violinWidthRatio`: number — Relative width multiplier applied to each violin (0.2 - 1)
- `layout`: 'vertical' | 'horizontal' — Layout orientation
- `stackOverlap`: number — Overlap factor between adjacent violins (0 - 0.95)
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid line configuration
- `statsMarkers`: ViolinStatsMarkersConfig — Statistic marker overlays for each violin
- `valueBands`: ViolinValueBand[] — Value range highlights rendered across the chart
- `legend`: ChartLegend — Legend configuration
- `onSeriesFocus`: (event: ViolinSeriesInteractionEvent) => void — Series focus callback
- `onSeriesBlur`: (event: ViolinSeriesInteractionEvent) => void — Series blur callback
- `onSeriesPress`: (event: ViolinSeriesInteractionEvent) => void — Series press/tap callback

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface ViolinDensitySeries extends DensitySeries {
  /** Pre-computed density points (skip internal KDE) */
  preparedDensity?: ViolinDensityPoint[];
  /** Override bandwidth for this series */
  bandwidth?: number;
  /** Adaptive bandwidth heuristic */
  adaptiveBandwidth?: 'scott' | 'silverman';
}

export interface ViolinStatsMarkersConfig {
  /** Master enable toggle; inferred from child flags when omitted */
  enabled?: boolean;
  /** Render median marker */
  showMedian?: boolean;
  /** Render mean marker */
  showMean?: boolean;
  /** Render interquartile band (Q1-Q3) */
  showQuartiles?: boolean;
  /** Render whiskers spanning min/max */
  showWhiskers?: boolean;
  /** Relative width multiplier for markers (0-1, defaults to 0.85) */
  markerWidthRatio?: number;
  /** Stroke width applied to marker lines (defaults to 2) */
  strokeWidth?: number;
  /** Optional colors per statistic */
  colors?: Partial<Record<'median' | 'mean' | 'quartile' | 'whisker', string>>;
  /** Annotate markers with value labels */
  showLabels?: boolean;
  /** Additional offset in px for labels (defaults to 6) */
  labelOffset?: number;
  /** Custom formatter for marker labels */
  labelFormatter?: (params: {
    stat: 'median' | 'mean' | 'q1' | 'q3' | 'whisker-min' | 'whisker-max';
    value: number;
    series: ViolinDensitySeries;
    formattedValue: string;
  }) => string;
}

export interface ViolinValueBand {
  /** Identifier for the value band */
  id?: string;
  /** Human-readable label rendered inside the band */
  label?: string;
  /** Lower bound of the highlighted range */
  from: number;
  /** Upper bound of the highlighted range */
  to: number;
  /** Fill color applied to the band */
  color?: string;
  /** Override opacity for the band (0-1) */
  opacity?: number;
  /** Text color for the label */
  labelColor?: string;
  /** Label anchor position */
  labelPosition?: 'left' | 'right';
}

export interface ViolinSeriesInteractionEvent {
  series: ViolinDensitySeries;
  seriesIndex: number;
  stats: ViolinSeriesStats | null;
  density: ViolinDensityPoint[];
}

export interface ViolinDensityPoint {
  x: number;
  y: number;
}

export interface ViolinSeriesStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  q1: number;
  q3: number;
  p10: number;
  p90: number;
}
```

## Examples

### Basics

ViolinChart shows a data distribution with a mirrored density shape and summary statistics.

```tsx
import { ViolinChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Delivery time distribution"
      h={360}
      series={SERIES}
      samples={128}
      bandwidth={3.5}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'north',
    name: 'North region',
    values: [
      45, 47, 48, 49, 50, 51, 52, 53, 53, 54, 55, 55, 56, 58, 59, 60, 61,
    ],
  },
  {
    id: 'south',
    name: 'South region',
    values: [
      38, 39, 40, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 52, 53, 54,
    ],
  },
  {
    id: 'west',
    name: 'West region',
    values: [
      52, 53, 54, 55, 56, 57, 58, 59, 60, 60, 61, 62, 63, 64, 65, 65, 66,
    ],
  },
];
```

### Delivery Times

```tsx
import { ViolinChart } from '@plocks/charts';

import { FULFILLMENT_CENTERS, SLA_WINDOW, STATS_MARKERS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Delivery time spread by fulfillment center"
      subtitle="Distribution of hours from order capture to doorstep delivery"
      h={460}
      series={FULFILLMENT_CENTERS}
      samples={96}
      bandwidth={1.6}
      violinWidthRatio={0.82}
      statsMarkers={STATS_MARKERS}
      valueBands={SLA_WINDOW}
      yAxis={{ title: 'Hours to deliver', show: true, labelFormatter: (value) => `${value.toFixed(0)}h` }}
    />
  );
}
```

`data.ts`

```ts
import type { DensitySeries, ViolinStatsMarkersConfig, ViolinValueBand } from '@plocks/charts';

export const createDistribution = (mean: number, spread: number, count: number, floor: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = index * 0.37;
    const wobble = Math.sin(angle) * spread + Math.cos(angle * 0.53) * spread * 0.6;
    const seasonal = ((index % 9) - 4) * 0.12 * spread;
    const value = Math.max(floor, mean + wobble + seasonal);
    return Number(value.toFixed(2));
  });

export const FULFILLMENT_CENTERS: DensitySeries[] = [
  {
    id: 'northeast',
    name: 'Northeast Hub',
    values: createDistribution(27.5, 3.2, 140, 18),
  },
  {
    id: 'pacific',
    name: 'Pacific Hub',
    values: createDistribution(30.4, 3.8, 140, 20),
  },
  {
    id: 'central',
    name: 'Central Sortation',
    values: createDistribution(24.6, 2.9, 140, 16),
  },
  {
    id: 'southern',
    name: 'South Regional',
    values: createDistribution(29.1, 3.4, 140, 18),
  },
];

export const SLA_WINDOW: ViolinValueBand[] = [
  {
    id: 'sla',
    label: 'Target SLA window (22-30 hrs)',
    from: 22,
    to: 30,
    color: '#38D9A9',
    opacity: 0.16,
    labelPosition: 'right',
  },
];

export const STATS_MARKERS: ViolinStatsMarkersConfig = {
  showMedian: true,
  showQuartiles: true,
  showWhiskers: true,
  showLabels: true,
  colors: {
    median: '#0B7285',
    quartile: '#4C6EF5',
    whisker: '#ADB5BD',
  },
};
```

### Experiment Metric Deltas

```tsx
import { ViolinChart } from '@plocks/charts';

import { EXPERIMENT_SERIES, STATS, VALUE_BANDS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Experiment metric deltas vs. control"
      subtitle="Percent change in weekly activation compared to holdout"
      h={460}
      series={EXPERIMENT_SERIES}
      samples={88}
      bandwidth={1.5}
      violinWidthRatio={0.68}
      statsMarkers={STATS}
      valueBands={VALUE_BANDS}
      yAxis={{
        title: 'Percent delta',
        labelFormatter: (value) => `${value.toFixed(1)}%`,
      }}
      xAxis={{ show: true, title: 'Variant cohorts' }}
    />
  );
}
```

`data.ts`

```ts
import type { DensitySeries, ViolinStatsMarkersConfig, ViolinValueBand } from '@plocks/charts';

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
```

### Model Prediction Errors

```tsx
import { ViolinChart } from '@plocks/charts';

import { ERROR_SERIES, STATS, VALUE_BANDS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Prediction error distribution per model version"
      subtitle="Mean absolute error (percentage points) across validation folds"
      h={460}
      series={ERROR_SERIES}
      samples={96}
      bandwidth={0.9}
      violinWidthRatio={0.78}
      statsMarkers={STATS}
      valueBands={VALUE_BANDS}
      yAxis={{
        title: 'MAE (%)',
        labelFormatter: (value) => `${value.toFixed(2)}%`,
      }}
    />
  );
}
```

`data.ts`

```ts
import type { DensitySeries, ViolinStatsMarkersConfig, ViolinValueBand } from '@plocks/charts';

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
```

### Salary Distribution

```tsx
import { ViolinChart } from '@plocks/charts';

import { MARKET_RANGE, SALARY_SERIES, STATS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Total compensation distribution by department"
      subtitle="Annual salary including bonus (USD thousands)"
      h={480}
      series={SALARY_SERIES}
      samples={96}
      bandwidth={2.8}
      violinWidthRatio={0.74}
      statsMarkers={STATS}
      valueBands={MARKET_RANGE}
      yAxis={{
        title: 'Total compensation (k$)',
        labelFormatter: (value) => `$${value.toFixed(0)}k`,
      }}
    />
  );
}
```

`data.ts`

```ts
import type { DensitySeries, ViolinStatsMarkersConfig, ViolinValueBand } from '@plocks/charts';

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
```

### Session Duration By Platform

```tsx
import { ViolinChart } from '@plocks/charts';

import { ENGAGEMENT_BANDS, SESSION_SERIES, STATS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Session duration distribution by platform"
      subtitle="Minutes per active session across major surfaces"
      h={440}
      series={SESSION_SERIES}
      samples={88}
      bandwidth={1.9}
      violinWidthRatio={0.7}
      statsMarkers={STATS}
      valueBands={ENGAGEMENT_BANDS}
      yAxis={{
        title: 'Minutes per session',
        labelFormatter: (value) => `${value.toFixed(1)} min`,
      }}
    />
  );
}
```

`data.ts`

```ts
import type { DensitySeries, ViolinStatsMarkersConfig, ViolinValueBand } from '@plocks/charts';

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
```
