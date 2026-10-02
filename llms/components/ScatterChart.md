# Scatter Chart

Plots data points in two-dimensional space for correlation analysis.

## Metadata

- Import: `import { ScatterChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, scatter, xy
- Docs: https://plocks.dev/charts/ScatterChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/ScatterChart

## Props

- `data` (required): ChartDataPoint[] — Data points
- `series`: ScatterSeries[] — Optional multi-series data (overrides top-level data if provided)
- `pointSize`: number = 6 — Point size
- `pointColor`: string — Point color
- `pointOpacity`: number = 1 — Point opacity
- `allowAddPoints`: boolean = false — Allow adding points by tapping
- `showTrendline`: boolean | 'overall' | 'per-series' = false — Show trend line. true|'overall' for single combined regression, 'per-series' for one per series
- `trendlineColor`: string — Trend line color
- `enablePanZoom`: boolean — Enable pan & zoom interactions
- `zoomMode`: 'x' | 'y' | 'both' — Zoom mode (axes constrained)
- `minZoom`: number — Minimum zoom scale (domain fraction)
- `enableWheelZoom`: boolean — Enable wheel zoom (web)
- `wheelZoomStep`: number — Wheel zoom step
- `invertWheelZoom`: boolean — Invert wheel zoom direction
- `resetOnDoubleTap`: boolean — Reset zoom on double tap
- `clampToInitialDomain`: boolean — Clamp pan/zoom to initial full domain
- `invertPinchZoom`: boolean — Invert pinch gesture direction (scale grows when fingers move closer)
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid configuration
- `legend`: ChartLegend — Legend configuration
- `tooltip`: ChartTooltip<ChartDataPoint> — Tooltip configuration
- `animation`: ChartAnimation — Animation configuration
- `multiTooltip`: boolean — Enable multi-series shared tooltip popover
- `enableCrosshair`: boolean — Enable crosshair
- `liveTooltip`: boolean — Live (follow pointer) tooltip selection
- `xScaleType`: 'linear' | 'log' | 'time' — X scale type
- `yScaleType`: 'linear' | 'log' | 'time' — Y scale type
- `quadrants`: ScatterQuadrantConfig — Optional quadrant overlay configuration

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface ScatterSeries {
  /** Unique identifier for the series */
  id?: string;
  /** Display name for the series */
  name?: string;
  /** Base color applied to the series */
  color?: string;
  /** Data points belonging to the series */
  data: ChartDataPoint[];
  /** Point size override for the series */
  pointSize?: number;
  /** Point color override for the series */
  pointColor?: string;
}

export interface ScatterQuadrantConfig {
  /** X-axis value used to split the chart into left/right quadrants */
  x?: number;
  /** Y-axis value used to split the chart into top/bottom quadrants */
  y?: number;
  /** Background fills applied to the resulting quadrants */
  fills?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
  /** Background fill opacity */
  fillOpacity?: number;
  /** Whether to render dividing guide lines */
  showLines?: boolean;
  /** Color for the dividing guide lines */
  lineColor?: string;
  /** Thickness for the dividing guide lines */
  lineWidth?: number;
  /** Optional labels describing each quadrant */
  labels?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
    bottomRight?: string;
  };
  /** Label color */
  labelColor?: string;
  /** Label font size */
  labelFontSize?: number;
  /** Offset from the quadrant edge for the labels */
  labelOffset?: number;
}
```

## Examples

### Basics

Plots data points in two-dimensional space for correlation analysis.

```tsx
import { ScatterChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <ScatterChart
      title="Spend vs. qualified leads"
      subtitle="Campaign cohort"
      h={340}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      showTrendline="per-series"
      enableCrosshair
      enablePanZoom
      zoomMode="both"
      multiTooltip
      liveTooltip
      xAxis={{
        show: true,
        title: 'Spend (USD thousands)',
        labelFormatter: (value) => `$${value}`,
      }}
      yAxis={{
        show: true,
        title: 'Qualified leads',
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.x}k spend → ${point.y} leads`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'marketing',
    name: 'Marketing spend',
    data: [
      { x: 18, y: 42 },
      { x: 22, y: 48 },
      { x: 25, y: 54 },
      { x: 27, y: 58 },
      { x: 30, y: 61 },
      { x: 34, y: 66 },
      { x: 38, y: 70 },
    ],
    pointSize: 8,
  },
  {
    id: 'events',
    name: 'Event sponsorship',
    data: [
      { x: 12, y: 36 },
      { x: 16, y: 41 },
      { x: 19, y: 44 },
      { x: 23, y: 47 },
      { x: 27, y: 55 },
      { x: 32, y: 62 },
      { x: 35, y: 65 },
    ],
    pointSize: 7,
  },
];
```

### Api Error Rate Volume

```tsx
import { ScatterChart } from '@plocks/charts';

import { QUADRANTS, SERIES } from './data';

const describeQuadrant = (x: number, y: number) => {
  const labels = QUADRANTS.labels;
  if (!labels) return null;
  const isRight = x >= QUADRANTS.x;
  const isTop = y >= QUADRANTS.y;

  if (isRight && isTop) return labels.topRight ?? null;
  if (!isRight && isTop) return labels.topLeft ?? null;
  if (isRight && !isTop) return labels.bottomRight ?? null;
  return labels.bottomLeft ?? null;
};

export function Demo() {
  return (
    <ScatterChart
      title="API error rate vs. request volume"
      subtitle="Each point represents a service, sized by throughput"
      h={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.9}
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xScaleType="log"
      xAxis={{
        show: true,
        title: 'Requests per minute (thousands)',
        labelFormatter: (value: number) => `${Math.round(value)}k`,
      }}
      yAxis={{
        show: true,
        title: 'Error rate (%)',
        labelFormatter: (value: number) => `${value.toFixed(1)}%`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#12263A',
        textColor: '#F4F6FB',
        formatter: (point) => {
          const quadrantNote = describeQuadrant(point.x, point.y);
          const lines = [
            point.label ?? 'Service',
            `Volume ${Math.round(point.x)}k rpm · Errors ${point.y.toFixed(1)}%`,
          ];
          if (quadrantNote) {
            lines.push(quadrantNote);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'core-apis',
    name: 'Core services',
    pointSize: 8,
    data: [
      { id: 'core-auth', x: 520, y: 2.9, label: 'Auth' },
      { id: 'core-catalog', x: 480, y: 2.6, label: 'Catalog' },
      { id: 'core-inventory', x: 410, y: 2.4, label: 'Inventory' },
      { id: 'core-profiles', x: 365, y: 2.1, label: 'Profiles' },
      { id: 'core-checkout', x: 445, y: 2.7, label: 'Checkout' },
    ],
  },
  {
    id: 'payment-apis',
    name: 'Payment services',
    pointSize: 8,
    data: [
      { id: 'pay-processing', x: 260, y: 4.1, label: 'Processor' },
      { id: 'pay-ledger', x: 195, y: 3.1, label: 'Ledger' },
      { id: 'pay-invoicing', x: 220, y: 3.6, label: 'Invoicing' },
      { id: 'pay-fx', x: 180, y: 3.4, label: 'FX gateway' },
      { id: 'pay-risk', x: 240, y: 3.9, label: 'Risk scoring' },
    ],
  },
  {
    id: 'edge-apis',
    name: 'Edge and experimental',
    pointSize: 7,
    data: [
      { id: 'edge-recos', x: 120, y: 4.2, label: 'Recommendations' },
      { id: 'edge-search', x: 95, y: 4.5, label: 'Search beta' },
      { id: 'edge-proto', x: 70, y: 3.9, label: 'Prototype API' },
      { id: 'edge-labs', x: 55, y: 3.6, label: 'Labs checkout' },
      { id: 'edge-content', x: 82, y: 4, label: 'Content sync' },
    ],
  },
];

export const QUADRANTS = {
  x: 180,
  y: 3.5,
  fills: {
    topLeft: 'rgba(255, 193, 7, 0.1)',
    topRight: 'rgba(255, 107, 107, 0.12)',
    bottomLeft: 'rgba(63, 142, 252, 0.08)',
    bottomRight: 'rgba(34, 197, 247, 0.08)',
  },
  fillOpacity: 1,
  lineColor: '#B0C4FE',
  lineWidth: 1,
  labels: {
    topLeft: 'High error - lower volume',
    topRight: 'Critical risk',
    bottomLeft: 'Monitor growth',
    bottomRight: 'Healthy scale',
  },
  labelColor: '#1F2933',
  labelFontSize: 11,
  labelOffset: 12,
};
```

### Campaign Spend Revenue

```tsx
import { ScatterChart } from '@plocks/charts';

import { QUADRANTS, SERIES } from './data';

const resolveAction = (x: number, y: number) => {
  const labels = QUADRANTS.labels;
  if (!labels) return null;
  const right = x >= QUADRANTS.x;
  const top = y >= QUADRANTS.y;

  if (!right && top) return labels.topLeft ?? null;
  if (right && top) return labels.topRight ?? null;
  if (!right && !top) return labels.bottomLeft ?? null;
  return labels.bottomRight ?? null;
};

export function Demo() {
  return (
    <ScatterChart
      title="Campaign spend vs. attributed revenue"
      subtitle="Ad set performance, each marker sized by budget grouping"
      h={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.86}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Spend (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      yAxis={{
        show: true,
        title: 'Attributed revenue (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#0B1220',
        textColor: '#F1F5F9',
        formatter: (point) => {
          const action = resolveAction(point.x, point.y);
          const lines = [
            point.label ?? 'Ad set',
            `Spend $${point.x}k · Revenue $${point.y}k`,
          ];
          if (action) {
            lines.push(action);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'paid-social',
    name: 'Paid social',
    pointSize: 8,
    data: [
  { id: 'social-lifestyle', x: 90, y: 210, size: 9.4, label: 'Lifestyle creatives' },
  { id: 'social-product', x: 78, y: 188, size: 8.9, label: 'Product video' },
  { id: 'social-lookalike', x: 112, y: 265, size: 10.2, label: 'Lookalike expansion' },
  { id: 'social-remarketing', x: 68, y: 160, size: 8.4, label: 'Retargeting carousel' },
  { id: 'social-brand', x: 82, y: 195, size: 9.1, label: 'Brand storytelling' },
    ],
  },
  {
    id: 'paid-search',
    name: 'Paid search',
    pointSize: 7.5,
    data: [
  { id: 'search-brand', x: 55, y: 148, size: 8.1, label: 'Brand keywords' },
  { id: 'search-competitor', x: 72, y: 168, size: 8.8, label: 'Competitor conquest' },
  { id: 'search-feature', x: 48, y: 118, size: 7.8, label: 'Feature launch' },
  { id: 'search-sku', x: 64, y: 152, size: 8.4, label: 'SKU breakout' },
  { id: 'search-automation', x: 60, y: 160, size: 8.2, label: 'Smart bidding' },
    ],
  },
  {
    id: 'display',
    name: 'Programmatic & display',
    pointSize: 7.5,
    data: [
  { id: 'display-ctv', x: 95, y: 205, size: 9.6, label: 'CTV extension' },
  { id: 'display-contextual', x: 74, y: 165, size: 8.7, label: 'Contextual placements' },
  { id: 'display-retarget', x: 88, y: 198, size: 9.3, label: 'High-intent retarget' },
  { id: 'display-prospect', x: 82, y: 170, size: 8.9, label: 'Prospecting bundle' },
  { id: 'display-awareness', x: 90, y: 162, size: 9.2, label: 'Awareness push' },
    ],
  },
];

export const QUADRANTS = {
  x: 80,
  y: 185,
  fills: {
    topLeft: 'rgba(12, 166, 120, 0.12)',
    topRight: 'rgba(66, 99, 235, 0.12)',
    bottomLeft: 'rgba(255, 163, 72, 0.08)',
    bottomRight: 'rgba(255, 107, 107, 0.12)',
  },
  fillOpacity: 1,
  lineColor: '#C0D6FF',
  lineWidth: 1,
  labels: {
    topLeft: 'High ROI champions',
    topRight: 'Scale candidates',
    bottomLeft: 'Creative tune-up',
    bottomRight: 'Pull back spend',
  },
  labelColor: '#1C1D21',
  labelFontSize: 11,
  labelOffset: 14,
};
```

### Customer Ltv Vs Cac

```tsx
import { ScatterChart } from '@plocks/charts';

import { QUADRANTS, SERIES } from './data';

const resolveQuadrantLabel = (x: number, y: number) => {
  const horizontal = x >= QUADRANTS.x ? 'Right' : 'Left';
  const vertical = y >= QUADRANTS.y ? 'Top' : 'Bottom';
  const labels = QUADRANTS.labels;

  if (!labels) return null;
  if (horizontal === 'Left' && vertical === 'Top') return labels.topLeft ?? null;
  if (horizontal === 'Right' && vertical === 'Top') return labels.topRight ?? null;
  if (horizontal === 'Left' && vertical === 'Bottom') return labels.bottomLeft ?? null;
  if (horizontal === 'Right' && vertical === 'Bottom') return labels.bottomRight ?? null;
  return null;
};

export function Demo() {
  return (
    <ScatterChart
      title="Customer LTV vs. Acquisition Cost"
      subtitle="Segment performance across recent cohorts"
      h={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.9}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Acquisition cost (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      yAxis={{
        show: true,
        title: 'Lifetime value (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#101218',
        textColor: '#F8FAFC',
        formatter: (point) => {
          const quadrantLabel = resolveQuadrantLabel(point.x, point.y);
          const lines = [
            point.label ?? 'Segment',
            `CAC $${point.x}k · LTV $${point.y}k`,
          ];
          if (quadrantLabel) {
            lines.push(quadrantLabel);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'enterprise',
    name: 'Enterprise',
    pointSize: 10,
    data: [
      { id: 'ent-a', x: 185, y: 980, label: 'Enterprise A' },
      { id: 'ent-b', x: 172, y: 920, label: 'Enterprise B' },
      { id: 'ent-c', x: 194, y: 1040, label: 'Enterprise C' },
      { id: 'ent-d', x: 168, y: 905, label: 'Enterprise D' },
      { id: 'ent-e', x: 180, y: 965, label: 'Enterprise E' },
    ],
  },
  {
    id: 'mid-market',
    name: 'Mid-market',
    pointSize: 8,
    data: [
      { id: 'mid-a', x: 118, y: 640, label: 'Mid-market A' },
      { id: 'mid-b', x: 110, y: 590, label: 'Mid-market B' },
      { id: 'mid-c', x: 126, y: 705, label: 'Mid-market C' },
      { id: 'mid-d', x: 101, y: 565, label: 'Mid-market D' },
      { id: 'mid-e', x: 134, y: 720, label: 'Mid-market E' },
    ],
  },
  {
    id: 'smb',
    name: 'SMB',
    pointSize: 7,
    data: [
      { id: 'smb-a', x: 72, y: 355, label: 'SMB A' },
      { id: 'smb-b', x: 68, y: 330, label: 'SMB B' },
      { id: 'smb-c', x: 83, y: 410, label: 'SMB C' },
      { id: 'smb-d', x: 58, y: 295, label: 'SMB D' },
      { id: 'smb-e', x: 64, y: 325, label: 'SMB E' },
    ],
  },
];

export const QUADRANTS = {
  x: 110,
  y: 600,
  fills: {
    topLeft: 'rgba(32, 201, 151, 0.12)',
    topRight: 'rgba(76, 110, 245, 0.08)',
    bottomLeft: 'rgba(51, 154, 240, 0.08)',
    bottomRight: 'rgba(255, 107, 107, 0.1)',
  },
  fillOpacity: 1,
  lineColor: '#ADB5FF',
  lineWidth: 1,
  labels: {
    topLeft: 'High value - efficient CAC',
    topRight: 'High value - costly CAC',
    bottomLeft: 'Emerging opportunity',
    bottomRight: 'Reassess acquisition spend',
  },
  labelColor: '#1C1D21',
  labelFontSize: 11,
  labelOffset: 14,
};
```

### Feature Usage Vs Satisfaction

```tsx
import { ScatterChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <ScatterChart
      title="Feature usage vs. satisfaction"
      subtitle="Weekly feature interactions mapped to CSAT by cohort"
      h={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      pointOpacity={0.85}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      xAxis={{
        show: true,
        title: 'Weekly feature uses',
        labelFormatter: (value: number) => `${value}x`,
      }}
      yAxis={{
        show: true,
        title: 'Customer satisfaction (1-10)',
        labelFormatter: (value: number) => value.toFixed(1),
      }}
      tooltip={{
        show: true,
        formatter: (point) =>
          `${point.label ?? 'Cohort'}\nUsage ${point.x.toFixed(1)}x | CSAT ${point.y.toFixed(1)}`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'early-adopters',
    name: 'Early adopters',
    pointSize: 8,
    data: [
      { id: 'ea-1', x: 17, y: 9, label: 'Beta squad' },
      { id: 'ea-2', x: 16, y: 8.6, label: 'Automation guild' },
      { id: 'ea-3', x: 18, y: 9.2, label: 'Platform champions' },
      { id: 'ea-4', x: 15, y: 8.8, label: 'Growth lab' },
    ],
  },
  {
    id: 'power-users',
    name: 'Power users',
    pointSize: 7,
    data: [
      { id: 'pu-1', x: 14, y: 8.2, label: 'Analytics crew' },
      { id: 'pu-2', x: 13, y: 7.9, label: 'Delivery ops' },
      { id: 'pu-3', x: 12, y: 8.1, label: 'Mobile pod' },
      { id: 'pu-4', x: 13.5, y: 8.4, label: 'Rev enablement' },
    ],
  },
  {
    id: 'core-users',
    name: 'Core users',
    pointSize: 6.5,
    data: [
      { id: 'cu-1', x: 9.5, y: 7.4, label: 'North America' },
      { id: 'cu-2', x: 8.8, y: 7.2, label: 'Europe' },
      { id: 'cu-3', x: 10.2, y: 7.6, label: 'APAC' },
      { id: 'cu-4', x: 9.8, y: 7.5, label: 'LATAM' },
    ],
  },
  {
    id: 'at-risk',
    name: 'At-risk',
    pointSize: 6,
    data: [
      { id: 'ar-1', x: 5.5, y: 6.2, label: 'Support desk' },
      { id: 'ar-2', x: 6.3, y: 6.5, label: 'Partner success' },
      { id: 'ar-3', x: 4.8, y: 6, label: 'Finance ops' },
      { id: 'ar-4', x: 5.1, y: 6.3, label: 'Field enablement' },
    ],
  },
];
```

### Performance Vs Tenure

```tsx
import { ScatterChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <ScatterChart
      title="Performance rating vs. tenure"
      subtitle="Team-by-team view with marker size scaled to total compensation (USD thousands)"
      h={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      pointOpacity={0.88}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Tenure (years)',
        labelFormatter: (value: number) => `${value.toFixed(1)} yrs`,
      }}
      yAxis={{
        show: true,
        title: 'Performance rating (1-5)',
        labelFormatter: (value: number) => value.toFixed(1),
      }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const compensation = point.data?.compensation;
          const compensationText = typeof compensation === 'number' ? `$${compensation}k` : 'n/a';
          return `${point.label ?? 'Team member'}\nRating ${point.y.toFixed(1)} | Tenure ${point.x.toFixed(1)} yrs\nComp ${compensationText}`;
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'engineering',
    name: 'Engineering',
    pointSize: 9,
    data: [
      { id: 'eng-1', x: 5.8, y: 4.6, size: 10.5, label: 'Staff engineer', data: { compensation: 195 } },
      { id: 'eng-2', x: 4.2, y: 4.3, size: 9.5, label: 'Senior engineer', data: { compensation: 172 } },
      { id: 'eng-3', x: 8.1, y: 4.8, size: 11, label: 'Principal engineer', data: { compensation: 230 } },
      { id: 'eng-4', x: 3.4, y: 4.1, size: 8.5, label: 'Platform engineer', data: { compensation: 160 } },
      { id: 'eng-5', x: 6.3, y: 4.5, size: 10, label: 'DevOps lead', data: { compensation: 188 } },
    ],
  },
  {
    id: 'sales',
    name: 'Sales',
    pointSize: 8.5,
    data: [
      { id: 'sales-1', x: 5.1, y: 4.4, size: 10, label: 'Enterprise AE', data: { compensation: 210 } },
      { id: 'sales-2', x: 3.8, y: 4, size: 8.8, label: 'Commercial AE', data: { compensation: 165 } },
      { id: 'sales-3', x: 6.8, y: 4.6, size: 10.5, label: 'Regional director', data: { compensation: 220 } },
      { id: 'sales-4', x: 2.9, y: 3.8, size: 8, label: 'SDR lead', data: { compensation: 140 } },
      { id: 'sales-5', x: 4.6, y: 4.1, size: 9.3, label: 'Channel manager', data: { compensation: 170 } },
    ],
  },
  {
    id: 'customer-success',
    name: 'Customer success',
    pointSize: 8,
    data: [
      { id: 'cs-1', x: 4.9, y: 4.3, size: 8.2, label: 'Strategic CSM', data: { compensation: 150 } },
      { id: 'cs-2', x: 3.6, y: 4, size: 7.5, label: 'Enterprise CSM', data: { compensation: 138 } },
      { id: 'cs-3', x: 5.7, y: 4.5, size: 8.8, label: 'Solution architect', data: { compensation: 162 } },
      { id: 'cs-4', x: 2.8, y: 3.7, size: 7, label: 'Onboarding lead', data: { compensation: 120 } },
      { id: 'cs-5', x: 4.2, y: 4.1, size: 7.8, label: 'Renewals manager', data: { compensation: 132 } },
    ],
  },
];
```
