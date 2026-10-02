# Radar Chart

Displays multivariate data across axes starting from the same origin.

## Metadata

- Import: `import { RadarChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, radar, polar
- Docs: https://plocks.dev/charts/RadarChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/RadarChart

## Props

- `series` (required): RadarChartSeries[] — Radar series to display
- `maxValue`: number — Maximum value displayed across axes
- `radialGrid`: RadarGridConfig — Grid styling configuration
- `smooth`: boolean | number — Smooth the polygon edges; pass a number between 0 and 1 to control tension
- `fill`: boolean = true — Fill the radar area
- `enableCrosshair`: boolean — Enable radial crosshair highlights
- `multiTooltip`: boolean — Enable multi-series tooltip aggregation
- `liveTooltip`: boolean — Follow pointer with tooltip
- `legend`: ChartLegend — Legend configuration
- `tooltip`: ChartTooltip<RadarAxisPoint> — Tooltip configuration

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface RadarChartSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Data points included in the series */
  data: RadarAxisPoint[];
  /** Base color applied to the series */
  color?: string;
  /** Whether the series is visible */
  visible?: boolean;
  /** Opacity applied to the filled area */
  opacity?: number;
  /** Show point markers at each axis */
  showPoints?: boolean;
  /** Size of the point markers */
  pointSize?: number;
  /** Additional metadata associated with the series */
  metadata?: any;
}

export interface RadarGridConfig {
  /** Number of concentric rings rendered */
  rings?: number;
  /** Shape used for the grid (circle or polygon) */
  shape?: 'circle' | 'polygon';
  /** Whether to render axis spokes */
  showAxes?: boolean;
  /** Placement of axis labels */
  axisLabelPlacement?: 'inside' | 'edge' | 'outside';
  /** Offset in pixels applied to axis labels */
  axisLabelOffset?: number;
  /** Keep full spoke labels on narrow charts even when they would shrink the plot. */
  showFullLabelsOnNarrow?: boolean;
  /** Custom formatter for axis labels */
  axisLabelFormatter?: (
    axis: string | number,
    context: { index: number; total: number; label?: string }
  ) => string;
  /** Optional labels for each ring */
  ringLabels?:
    | string[]
    | ((context: { index: number; ringCount: number; value: number; maxValue: number }) => string);
  /** Where to position ring labels relative to the ring */
  ringLabelPosition?: 'inside' | 'outside';
  /** Offset in pixels applied to ring labels */
  ringLabelOffset?: number;
}

export interface RadarAxisPoint {
  /** Axis key associated with the point */
  axis: string | number;
  /** Value plotted on the axis */
  value: number;
  /** Optional label displayed for the point */
  label?: string;
  /** Color override for the point */
  color?: string;
  /** Optional value override used for tooltip output */
  formattedValue?: string | number;
  /** Custom tooltip content for the point */
  tooltip?: ReactNode | ((point: RadarAxisPoint, context: { axisIndex: number; seriesIndex: number; series: RadarChartSeries }) => ReactNode);
  /** Additional metadata associated with the point */
  meta?: any;
}
```

## Examples

### Skill Comparison

Comparison of three engineering guilds with polygon grid, crosshair, and aggregated tooltip.

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Engineering guild comparison"
      subtitle="Quarterly capability radar"
      maw={700}
      h={440}
      series={SERIES}
      maxValue={100}
      radialGrid={{ rings: 5, shape: 'polygon', showAxes: true }}
      enableCrosshair
      multiTooltip
      liveTooltip
      legend={{ show: true, position: 'right', align: 'start' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${Math.round(point.value)}%`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const AXES = [
  'Code quality',
  'Delivery speed',
  'Testing coverage',
  'Observability',
  'Collaboration',
  'Innovation',
];

export const buildSeriesData = (values: number[]) =>
  AXES.map((axis, index) => ({ axis, value: values[index] }));

export const SERIES = [
  {
    id: 'frontend-guild',
    name: 'Frontend guild',
    showPoints: true,
    pointSize: 4,
    data: buildSeriesData([92, 84, 78, 86, 90, 74]),
  },
  {
    id: 'platform-guild',
    name: 'Platform guild',
    showPoints: true,
    pointSize: 4,
    data: buildSeriesData([88, 79, 91, 93, 82, 70]),
  },
  {
    id: 'qa-guild',
    name: 'QA guild',
    showPoints: true,
    pointSize: 4,
    data: buildSeriesData([80, 72, 95, 88, 76, 68]),
  },
];
```

### Product Health

Product health snapshot with circular grid, point markers, and custom tooltip messaging.

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Product health radar"
      subtitle="Operational score vs. strategic goal"
      maw={580}
      h={440}
      series={SERIES}
      maxValue={10}
      radialGrid={{ rings: 4, shape: 'circle', showAxes: false }}
      enableCrosshair
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value.toFixed(1)} / 10`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const AXES = [
  'Availability',
  'Latency',
  'NPS',
  'Feature velocity',
  'Security posture',
  'Cost efficiency',
];

export const makeSeriesData = (values: number[]) =>
  AXES.map((axis, index) => ({ axis, value: values[index] }));

export const SERIES = [
  {
    id: 'current-health',
    name: 'Current health',
    showPoints: true,
    pointSize: 3,
    data: makeSeriesData([8.4, 7.2, 6.8, 7.5, 8.8, 6.2]),
  },
  {
    id: 'target-health',
    name: 'Target health',
    showPoints: true,
    pointSize: 3,
    data: makeSeriesData([9.2, 8.6, 8.1, 8.5, 9.0, 7.5]),
  },
];
```

### Basics

Displays multivariate data across axes starting from the same origin.

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Team capability radar"
      maw={560}
      h={380}
      series={SERIES}
      maxValue={60}
      radialGrid={{ rings: 5, shape: 'polygon', showAxes: true }}
      smooth
      fill
      enableCrosshair
      multiTooltip
      liveTooltip
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value}`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'current',
    name: 'Current quarter',
    data: [
      { axis: 'Sales', value: 42 },
      { axis: 'Marketing', value: 30 },
      { axis: 'R&D', value: 50 },
      { axis: 'Support', value: 35 },
      { axis: 'Operations', value: 24 },
      { axis: 'Finance', value: 18 },
    ],
  },
  {
    id: 'target',
    name: 'Target',
    data: [
      { axis: 'Sales', value: 48 },
      { axis: 'Marketing', value: 36 },
      { axis: 'R&D', value: 44 },
      { axis: 'Support', value: 40 },
      { axis: 'Operations', value: 28 },
      { axis: 'Finance', value: 22 },
    ],
  },
];
```

### Data Platform Maturity

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Data platform maturity"
      subtitle="Governance and enablement dimensions"
      maw={620}
      h={480}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'bottom', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 24,
        ringLabels: [
          'Ad hoc',
          'Emerging',
          'Defined',
          'Managed',
          'Optimized',
        ],
        ringLabelPosition: 'outside',
        ringLabelOffset: 16,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 5`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const AXES = [
  { axis: 'governance', label: 'Data\nGovernance' },
  { axis: 'quality', label: 'Data\nQuality' },
  { axis: 'lineage', label: 'Lineage &\nCataloguing' },
  { axis: 'selfServe', label: 'Self-service\nEnablement' },
  { axis: 'automation', label: 'Automation &\nObservability' },
  { axis: 'culture', label: 'Culture &\nLiteracy' },
];

export const maturityLabel = (value: number) => {
  if (value >= 4.5) return 'Optimized';
  if (value >= 3.5) return 'Managed';
  if (value >= 2.5) return 'Defined';
  if (value >= 1.5) return 'Emerging';
  return 'Ad hoc';
};

export const assembleSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value.toFixed(1)} / 5`,
      tooltip: `${value.toFixed(1)} / 5 • ${maturityLabel(value)}`,
    };
  });

export const SERIES = [
  {
    id: 'current',
    name: 'Current state',
    showPoints: true,
    pointSize: 4,
    data: assembleSeries([2.3, 2.8, 2.2, 1.9, 2.5, 2.1]),
  },
  {
    id: 'target',
    name: 'Target FY24',
    showPoints: true,
    pointSize: 4,
    data: assembleSeries([3.6, 3.8, 3.4, 3.2, 3.5, 3.3]),
  },
  {
    id: 'leader',
    name: 'Industry leader benchmark',
    showPoints: true,
    pointSize: 4,
    data: assembleSeries([4.5, 4.6, 4.4, 4.2, 4.5, 4.3]),
  },
];
```

### Engineering Readiness

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Engineering readiness radar"
      subtitle="Security, reliability, scalability, performance, maintainability"
      maw={600}
      h={440}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      legend={{ show: true, position: 'bottom' }}
      radialGrid={{
        rings: 5,
        shape: 'circle',
        showAxes: true,
        axisLabelPlacement: 'outside',
        ringLabels: [
          'Reactive',
          'Developing',
          'Consistent',
          'Resilient',
          'Elite',
        ],
        ringLabelPosition: 'inside',
        ringLabelOffset: 18,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.axis}: ${point.value.toFixed(1)} readiness`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const AXES = ['Security', 'Reliability', 'Scalability', 'Performance', 'Maintainability'];

export const createSeries = (values: number[]) =>
  AXES.map((axis, index) => {
    const value = values[index];
    return {
      axis,
      value,
      formattedValue: `${value.toFixed(1)} / 5`,
    };
  });

export const SERIES = [
  {
    id: 'current',
    name: 'Current posture',
    showPoints: true,
    pointSize: 4,
    data: createSeries([2.6, 3.1, 2.8, 3.4, 2.9]),
  },
  {
    id: 'target',
    name: 'Target readiness',
    showPoints: true,
    pointSize: 4,
    data: createSeries([4.2, 4.4, 4.1, 4.3, 4.0]),
  },
];
```

### Market Perception Interviews

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Market perception signal"
      subtitle="Customer interview scorecard"
      maw={700}
      h={460}
      series={SERIES}
      maxValue={5}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'right', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 18,
        ringLabels: ({ index }) => ['Poor', 'Fair', 'Good', 'Great', 'Exceptional'][index],
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 5`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const AXES = [
  { axis: 'ease', label: 'Ease of\nUse' },
  { axis: 'feature', label: 'Feature\nDepth' },
  { axis: 'innovation', label: 'Innovation\nStory' },
  { axis: 'trust', label: 'Trust &\nCredibility' },
  { axis: 'support', label: 'Support\nExperience' },
  { axis: 'value', label: 'Value for\nMoney' },
];

export const buildSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value.toFixed(1)} / 5`,
    };
  });

export const SERIES = [
  {
    id: 'customers',
    name: 'Existing customers',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([4.6, 4.1, 4.3, 4.4, 4.7, 4.2]),
  },
  {
    id: 'prospects',
    name: 'Active prospects',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([4.2, 3.8, 4.0, 4.1, 3.9, 4.0]),
  },
  {
    id: 'analysts',
    name: 'Industry analysts',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([4.4, 4.3, 4.5, 4.2, 4.0, 4.1]),
  },
];
```

### Product Capability Benchmark

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Product capability vs. competition"
      subtitle="Benchmarking core differentiators"
      maw={620}
      h={460}
      series={SERIES}
      maxValue={10}
      fill
      enableCrosshair
      legend={{ show: true, position: 'bottom', align: 'center' }}
      radialGrid={{
        rings: 5,
        shape: 'polygon',
        showAxes: true,
        axisLabelPlacement: 'outside',
        axisLabelOffset: 20,
        ringLabels: [
          'Baseline',
          'Market ready',
          'Parity',
          'Differentiated',
          'Category leader',
        ],
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${point.value.toFixed(1)} / 10`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const AXES = [
  { axis: 'ai', label: 'AI Assist' },
  { axis: 'integrations', label: 'Integration\nEcosystem' },
  { axis: 'analytics', label: 'Analytics\nDepth' },
  { axis: 'scale', label: 'Enterprise\nScalability' },
  { axis: 'security', label: 'Security\n& Compliance' },
  { axis: 'ux', label: 'User\nExperience' },
];

export const buildSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value.toFixed(1)} / 10`,
    };
  });

export const SERIES = [
  {
    id: 'ours',
    name: 'Our platform',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([8.4, 7.8, 8.9, 8.7, 9.4, 8.6]),
  },
  {
    id: 'competitor-a',
    name: 'Competitor Alpha',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([7.6, 8.4, 8.1, 8.2, 8.9, 7.5]),
  },
  {
    id: 'competitor-b',
    name: 'Competitor Beta',
    showPoints: true,
    pointSize: 4,
    data: buildSeries([6.8, 7.4, 7.5, 7.9, 8.1, 6.9]),
  },
];
```

### Skills Gap Role Family

```tsx
import { RadarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <RadarChart
      title="Role family skills gap analysis"
      subtitle="Percent attainment against competency targets"
      maw={720}
      h={480}
      series={SERIES}
      maxValue={100}
      fill
      enableCrosshair
      multiTooltip
      legend={{ show: true, position: 'right', align: 'start' }}
      radialGrid={{
        rings: 4,
        shape: 'polygon',
        axisLabelPlacement: 'outside',
        axisLabelOffset: 24,
        ringLabels: ({ value }) => `${Math.round(value)} pts`,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.label ?? point.axis}: ${Math.round(point.value)} / 100`,
      }}
    />
  );
}
```

`data.ts`

```ts
export const AXES = [
  { axis: 'strategy', label: 'Product\nStrategy' },
  { axis: 'delivery', label: 'Delivery\nExecution' },
  { axis: 'customer', label: 'Customer\nInsight' },
  { axis: 'collaboration', label: 'Cross-team\nCollaboration' },
  { axis: 'quality', label: 'Quality &\nReliability' },
];

export const makeSeries = (values: number[]) =>
  AXES.map(({ axis, label }, index) => {
    const value = values[index];
    return {
      axis,
      value,
      label,
      formattedValue: `${value} pts`,
    };
  });

export const SERIES = [
  {
    id: 'target',
    name: 'Target capability',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([92, 90, 95, 94, 93]),
  },
  {
    id: 'engineering',
    name: 'Engineering org',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([88, 82, 76, 84, 80]),
  },
  {
    id: 'product',
    name: 'Product org',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([86, 78, 90, 88, 82]),
  },
  {
    id: 'design',
    name: 'Design org',
    showPoints: true,
    pointSize: 4,
    data: makeSeries([80, 70, 88, 90, 76]),
  },
];
```
