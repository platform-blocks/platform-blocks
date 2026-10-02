# Ridge Chart

Layered density plots (joyplot) comparing distributions across categories.

## Metadata

- Import: `import { RidgeChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, ridge, density
- Docs: https://plocks.dev/charts/RidgeChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/RidgeChart

## Props

- `series` (required): DensitySeries[] — Density series rendered in the ridge chart
- `samples`: number — Density sample resolution
- `bandwidth`: number — Kernel bandwidth override
- `bandPadding`: number — Fractional padding between ridge bands (0 - 0.8)
- `amplitudeScale`: number — Amplitude scaling applied to each ridge (0.1 - 1)
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid line configuration
- `statsMarkers`: RidgeStatsMarkersConfig — Optional statistic marker configuration

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface DensitySeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Source values used to compute the density */
  values: number[];
  /** Base color applied to the density curve */
  color?: string;
  /** Whether the series is visible */
  visible?: boolean;
  /** Opacity applied to the filled area */
  fillOpacity?: number;
  /** Stroke color for the ridge outline */
  strokeColor?: string;
  /** Stroke width for the ridge outline */
  strokeWidth?: number;
  /** Unit label appended to tooltip values */
  unit?: string;
  /** Custom formatter for value labels */
  valueFormatter?: (value: number) => string;
  /** Custom tooltip content for each value */
  tooltipFormatter?: (context: RidgeTooltipContext) => ReactNode;
}

export interface RidgeStatsMarkersConfig {
  /** Master enable toggle; defaults to false unless show flags set */
  enabled?: boolean;
  /** Show mean marker (defaults to true when enabled) */
  showMean?: boolean;
  /** Show median marker (defaults to true when enabled) */
  showMedian?: boolean;
  /** Show p90 marker (defaults to false) */
  showP90?: boolean;
  /** Marker line height in px (auto if omitted) */
  markerHeight?: number;
  /** Marker stroke width (defaults to 2) */
  strokeWidth?: number;
  /** Custom colors per statistic */
  colors?: Partial<Record<'mean' | 'median' | 'p90', string>>;
  /** Render value labels near markers */
  showLabels?: boolean;
  /** Offset for labels above marker tip (defaults to 6) */
  labelOffset?: number;
  /** Optional formatter for marker label */
  labelFormatter?: (params: { stat: 'mean' | 'median' | 'p90'; value: number; formattedValue: string; series: DensitySeries }) => string;
}

export interface RidgeTooltipContext {
  value: number;
  /** Normalized (0-1) density height */
  density: number;
  /** Estimated probability mass for this sample */
  probability: number;
  /** Raw probability density function value */
  pdf: number;
  index: number;
  seriesIndex: number;
  series: {
    id?: string | number;
    name?: string;
    color?: string;
    unit?: string;
    stats?: RidgeSeriesStats | null;
  };
}

export interface RidgeSeriesStats {
  mean?: number;
  median?: number;
  p90?: number;
}
```

## Examples

### Basics

Layered density plots (joyplot) comparing distributions across categories.

```tsx
import { RidgeChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
	return (
		<RidgeChart
			title="Customer satisfaction distribution"
			subtitle="Annual NPS density"
			h={360}
			series={SERIES}
			samples={96}
			bandwidth={3}
			statsMarkers={{ enabled: true, showP90: true, showLabels: true }}
		/>
	);
}
```

`data.ts`

```ts
export const SERIES = [
	{
		id: '2019',
		name: '2019',
		values: [
			42, 44, 45, 46, 47, 48, 49, 49, 50, 52, 53, 54, 55, 55, 55, 57, 58, 60, 62,
		],
	},
	{
		id: '2020',
		name: '2020',
		values: [
			38, 39, 40, 41, 42, 43, 44, 46, 48, 50, 51, 51, 52, 53, 53, 54, 55, 57, 59,
		],
	},
	{
		id: '2021',
		name: '2021',
		values: [
			45, 47, 48, 49, 50, 51, 52, 53, 55, 56, 57, 58, 59, 59, 60, 61, 62, 63, 64,
		],
	},
	{
		id: '2022',
		name: '2022',
		values: [
			50, 51, 52, 54, 55, 56, 57, 58, 60, 61, 62, 63, 64, 65, 65, 66, 67, 68, 69,
		],
	},
];
```

### Api Latency Endpoints

```tsx
import { RidgeChart } from '@plocks/charts';

import { SERIES, formatLatency } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="API latency distribution by endpoint"
      subtitle="Density of response times across rolling deployments"
      h={450}
      series={SERIES}
      samples={128}
      bandwidth={16}
      bandPadding={0.24}
      amplitudeScale={0.92}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Latency (ms)',
        labelFormatter: (value) => formatLatency(value as number),
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

`data.ts`

```ts
export const SAMPLE_POINTS = 170;

export const createLatencyProfile = (base: number, jitter: number, tail: number) =>
  Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const diurnal = Math.sin(index / 7) * jitter;
    const deployWave = Math.max(0, Math.sin((index - 28) / 16)) * tail;
    const background = Math.cos(index / 4.5) * jitter * 0.3;
    const heavyTail = Math.pow(Math.sin((index + 12) / 40), 6) * tail * 1.8;
    const value = base + diurnal + deployWave + background + heavyTail;
    return Number(Math.max(48, value).toFixed(1));
  });

export const formatLatency = (value: number) => `${Math.round(value)} ms`;

export const latencyTooltip = ({ value, density, series }: any) => {
  const p90 = series?.stats?.p90;
  const p90Label = p90 != null ? ` • p90 ${formatLatency(p90)}` : '';
  return `${formatLatency(value)} • density ${(density * 100).toFixed(1)}%${p90Label}`;
};

export const SERIES = [
  {
    id: 'projects',
    name: 'GET /projects',
    values: createLatencyProfile(210, 48, 160),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'reports',
    name: 'GET /reports',
    values: createLatencyProfile(260, 52, 210),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'ingest',
    name: 'POST /ingest',
    values: createLatencyProfile(340, 60, 280),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'search',
    name: 'GET /search',
    values: createLatencyProfile(180, 44, 150),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
  {
    id: 'billing',
    name: 'POST /billing',
    values: createLatencyProfile(400, 66, 320),
    fillOpacity: 0.64,
    strokeWidth: 1.2,
    valueFormatter: formatLatency,
    tooltipFormatter: latencyTooltip,
  },
];
```

### Daily Active Users Cohorts

```tsx
import { RidgeChart } from '@plocks/charts';

import { SERIES, formatThousands } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="Daily active users across feature cohorts"
      subtitle="Distribution of session counts over the last six months"
      h={480}
      series={SERIES}
      samples={128}
      bandwidth={18}
      bandPadding={0.32}
      amplitudeScale={0.95}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Daily active users',
        labelFormatter: (value) => formatThousands.format(Math.round(value as number)),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

`data.ts`

```ts
export const DAYS = 180;

export const createCohort = (base: number, amplitude: number, lift: number) =>
  Array.from({ length: DAYS }, (_, day) => {
    const seasonal = Math.sin(day / 12) * amplitude;
    const adoption = Math.max(0, Math.sin((day - 36) / 28)) * lift;
    const engagementCycle = Math.cos(day / 3.6) * amplitude * 0.18;
    const trend = (day / DAYS) * lift * 0.45;
    const value = base + seasonal + adoption + engagementCycle + trend;
    return Math.max(120, Math.round(value));
  });

export const formatUsers = (value: number) => `${Math.round(value).toLocaleString()} users`;

export const userDensityTooltip = ({ value, density, series }: any) => {
  const median = series?.stats?.median;
  const medianLabel = median != null ? ` • median ${Math.round(median).toLocaleString()} users` : '';
  return `${Math.round(value).toLocaleString()} users • density ${(density * 100).toFixed(1)}%${medianLabel}`;
};

export const SERIES = [
  {
    id: 'core-product',
    name: 'Core product cohort',
    values: createCohort(420, 48, 96),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'collaboration-suite',
    name: 'Collaboration suite',
    values: createCohort(360, 42, 78),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'automation',
    name: 'Automation workflows',
    values: createCohort(260, 36, 64),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'ai-features',
    name: 'AI assistant features',
    values: createCohort(180, 34, 72),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
  {
    id: 'mobile-experience',
    name: 'Mobile experience',
    values: createCohort(220, 32, 58),
    fillOpacity: 0.68,
    strokeWidth: 1.4,
    valueFormatter: formatUsers,
    tooltipFormatter: userDensityTooltip,
  },
];

export const formatThousands = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
```

### Employee Satisfaction Survey

```tsx
import { RidgeChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="Employee satisfaction score distribution"
      subtitle="Quarterly pulse survey responses by team"
      h={420}
      series={SERIES}
      samples={110}
      bandwidth={0.35}
      bandPadding={0.3}
      amplitudeScale={0.85}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Satisfaction score (1-5)',
        labelFormatter: (value) => (value as number).toFixed(1),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

`data.ts`

```ts
export const SAMPLE_POINTS = 140;

export const createScoreProfile = (baseline: number, amplitude: number, lift: number) =>
  Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const seasonal = Math.sin(index / 9.5) * amplitude;
    const programLift = Math.max(0, Math.sin((index - 24) / 20)) * lift;
    const sentimentNoise = Math.cos(index / 3.4) * amplitude * 0.2;
    const value = baseline + seasonal + programLift + sentimentNoise;
    const clamped = Math.min(4.95, Math.max(1.05, value));
    return Number(clamped.toFixed(2));
  });

export const formatScore = (value: number) => `${value.toFixed(1)} / 5`;

export const satisfactionTooltip = ({ value, density, series }: any) => {
  const median = series?.stats?.median;
  const medianLabel = median != null ? ` • median ${formatScore(median)}` : '';
  return `${formatScore(value)} • density ${(density * 100).toFixed(1)}%${medianLabel}`;
};

export const SERIES = [
  {
    id: 'product',
    name: 'Product management',
    values: createScoreProfile(3.8, 0.32, 0.42),
    fillOpacity: 0.7,
    strokeWidth: 1.2,
    valueFormatter: formatScore,
    tooltipFormatter: satisfactionTooltip,
  },
  {
    id: 'platform',
    name: 'Platform engineering',
    values: createScoreProfile(4.1, 0.3, 0.36),
    fillOpacity: 0.7,
    strokeWidth: 1.2,
    valueFormatter: formatScore,
    tooltipFormatter: satisfactionTooltip,
  },
  {
    id: 'success',
    name: 'Customer success',
    values: createScoreProfile(3.6, 0.36, 0.48),
    fillOpacity: 0.7,
    strokeWidth: 1.2,
    valueFormatter: formatScore,
    tooltipFormatter: satisfactionTooltip,
  },
  {
    id: 'gtm',
    name: 'Go-to-market teams',
    values: createScoreProfile(3.4, 0.4, 0.52),
    fillOpacity: 0.7,
    strokeWidth: 1.2,
    valueFormatter: formatScore,
    tooltipFormatter: satisfactionTooltip,
  },
];
```

### Revenue Transaction Density

```tsx
import { RidgeChart } from '@plocks/charts';

import { SERIES, currencyFormatter } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="Revenue per transaction by product line"
      subtitle="Transaction value distributions across seasonal cycles"
      h={440}
      series={SERIES}
      samples={128}
      bandwidth={14}
      bandPadding={0.28}
      amplitudeScale={0.9}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Revenue per transaction',
        labelFormatter: (value) => currencyFormatter.format(value as number),
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

`data.ts`

```ts
export const SAMPLE_POINTS = 180;

export const createRevenueProfile = (base: number, amplitude: number, tail: number) =>
  Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const seasonal = Math.sin(index / 9) * amplitude;
    const promotional = Math.max(0, Math.sin((index - 24) / 18)) * tail;
    const variability = Math.cos(index / 4.8) * amplitude * 0.22;
    const enterpriseTail = Math.pow(Math.sin((index + 18) / 48), 4) * tail * 1.4;
    const value = base + seasonal + promotional + variability + enterpriseTail;
    return Number(Math.max(12, value).toFixed(2));
  });

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number) => currencyFormatter.format(Math.max(0, Math.round(value)));

export const revenueTooltip = ({ value, density, series }: any) => {
  const p90 = series?.stats?.p90;
  const p90Label = p90 != null ? ` • p90 ${formatCurrency(p90)}` : '';
  return `${formatCurrency(value)} • density ${(density * 100).toFixed(1)}%${p90Label}`;
};

export const SERIES = [
  {
    id: 'starter',
    name: 'Starter tier',
    values: createRevenueProfile(45, 24, 62),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
  {
    id: 'growth',
    name: 'Growth tier',
    values: createRevenueProfile(68, 32, 74),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
  {
    id: 'enterprise',
    name: 'Enterprise contracts',
    values: createRevenueProfile(110, 42, 96),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
  {
    id: 'add-ons',
    name: 'Usage add-ons',
    values: createRevenueProfile(32, 20, 48),
    fillOpacity: 0.62,
    strokeWidth: 1.3,
    valueFormatter: formatCurrency,
    tooltipFormatter: revenueTooltip,
  },
];
```

### Shipping Time Carriers

```tsx
import { RidgeChart } from '@plocks/charts';

import { SERIES, formatDays } from './data';

export function Demo() {
  return (
    <RidgeChart
      title="Shipping time distribution by carrier"
      subtitle="Parcel delivery performance across recent quarters"
      h={420}
      series={SERIES}
      samples={110}
      bandwidth={0.45}
      bandPadding={0.3}
      amplitudeScale={0.9}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Delivery time (days)',
        labelFormatter: (value) => formatDays(value as number),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

`data.ts`

```ts
export const SAMPLE_POINTS = 150;

export const createShippingProfile = (base: number, variation: number, tail: number) =>
  Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const seasonal = Math.sin(index / 8.5) * variation;
    const disruption = Math.max(0, Math.sin((index - 22) / 16)) * tail;
    const trafficNoise = Math.cos(index / 3.1) * variation * 0.26;
    const value = base + seasonal + disruption + trafficNoise;
    const clamped = Math.min(8.2, Math.max(1.1, value));
    return Number(clamped.toFixed(2));
  });

export const formatDays = (value: number) => `${value.toFixed(1)} days`;

export const shippingTooltip = ({ value, density, series }: any) => {
  const p90 = series?.stats?.p90;
  const p90Label = p90 != null ? ` • p90 ${formatDays(p90)}` : '';
  return `${formatDays(value)} • density ${(density * 100).toFixed(1)}%${p90Label}`;
};

export const SERIES = [
  {
    id: 'northstar',
    name: 'NorthStar Logistics',
    values: createShippingProfile(3.6, 0.55, 1.2),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
  {
    id: 'aero',
    name: 'Aero Freight',
    values: createShippingProfile(2.9, 0.5, 1.1),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
  {
    id: 'urban-express',
    name: 'Urban Express',
    values: createShippingProfile(2.4, 0.42, 0.9),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
  {
    id: 'coastal',
    name: 'Coastal Courier',
    values: createShippingProfile(4.2, 0.6, 1.4),
    fillOpacity: 0.66,
    strokeWidth: 1.1,
    valueFormatter: formatDays,
    tooltipFormatter: shippingTooltip,
  },
];
```
