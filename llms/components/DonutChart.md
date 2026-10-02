# Donut Chart

Circular proportional chart with a hollow center (variant of pie chart).

## Metadata

- Import: `import { DonutChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, donut, circular
- Docs: https://plocks.dev/charts/DonutChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/DonutChart

## Props

- `data`: DonutChartDataPoint[] — Data points rendered in the donut
- `rings`: DonutChartRing[] — Optional multi-ring configuration. When provided, the top-level data acts as a fallback
- `size`: number = 280 — Convenience size that sets both width and height when explicit values are omitted
- `innerRadiusRatio`: number = 0.55 — Ratio (0-1) of the inner radius relative to the outer radius when thickness is not provided
- `thickness`: number — Explicit ring thickness override (outerRadius - innerRadius)
- `ringGap`: number — Gap in chart units between concentric rings (defaults to 8 for multi-ring charts)
- `padAngle`: number = 1.5 — Padding between slices in degrees
- `startAngle`: number = -90 — Starting angle for the first slice (degrees)
- `endAngle`: number = 270 — Ending angle for the last slice (degrees)
- `primaryRingIndex`: number = 0 — Index of the ring used for center totals and value formatting (defaults to 0)
- `legendRingIndex`: number — Index of the ring whose slices feed the legend (defaults to primaryRingIndex)
- `inheritColorByLabel`: boolean = true — When true, slices across rings reuse colors based on their label/id
- `legend`: ChartLegend — Legend configuration
- `tooltip`: ChartTooltip<DonutChartDataPoint> — Tooltip configuration
- `animation`: ChartAnimation — Animation configuration
- `centerLabel`: string | DonutCenterLabelFormatter — Primary label rendered in the center (string or formatter)
- `centerSubLabel`: string | DonutCenterLabelFormatter — Secondary label rendered beneath the primary center label
- `centerValueFormatter`: DonutCenterValueFormatter — Formatter for the numerical value shown in the center
- `renderCenterContent`: DonutChartCenterRenderer — Custom renderer for the center content. When provided, overrides default labels
- `emptyLabel`: string = 'No data' — Label displayed when no data is provided
- `padding`: { top: number; right: number; bottom: number; left: number } — Optional padding override for the chart container
- `isolateOnClick`: boolean = false — When true, clicking a slice isolates it (toggles other slices off) and another click restores
- `labels`: DonutChartLabelsConfig — Global label rendering configuration

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface DonutChartDataPoint {
  /** Unique identifier for the slice */
  id?: string | number;
  /** Display label */
  label: string;
  /** Numerical value */
  value: number;
  /** Optional color override */
  color?: string;
  /** Custom metadata forwarded through interactions */
  data?: any;
}

export interface DonutChartRing {
  /** Unique identifier for the ring */
  id?: string | number;
  /** Human readable label for tooltips or analytics */
  label?: string;
  /** Data rendered in this ring */
  data: DonutChartDataPoint[];
  /** Padding between slices specific to this ring (degrees) */
  padAngle?: number;
  /** Starting angle override (degrees) */
  startAngle?: number;
  /** Ending angle override (degrees) */
  endAngle?: number;
  /** Explicit thickness for the ring */
  thickness?: number;
  /** Thickness ratio (0-1) relative to chart radius when explicit thickness is not provided */
  thicknessRatio?: number;
  /** Explicit inner radius ratio (0-1) relative to chart radius */
  innerRadiusRatio?: number;
  /** Optional palette to cycle through when slice colors are not provided */
  colorPalette?: string[];
  /** Determines whether slices from this ring appear in the legend (default true for primary ring) */
  showInLegend?: boolean;
}

export type DonutCenterLabelFormatter = (
  total: number,
  data: DonutChartDataPoint[],
  focused?: DonutChartDataPoint | null
) => string;

export type DonutCenterValueFormatter = (
  value: number,
  total: number,
  dataPoint?: DonutChartDataPoint | null
) => string;

export type DonutChartCenterRenderer = (context: DonutChartCenterRenderContext) => ReactNode;

export interface DonutChartLabelsConfig {
  /** Enable or disable label rendering */
  show?: boolean;
  /** Target rings by numeric index or id */
  rings?: Array<number | string>;
  /** Place labels inside the ring or outside with leader lines */
  position?: 'inside' | 'outside';
  /** Custom formatter for label lines */
  formatter?: (context: DonutChartLabelFormatterContext) => string | string[] | null | undefined;
  /** Whether to append a formatted value line */
  showValue?: boolean;
  /** Whether to append a percentage line */
  showPercentage?: boolean;
  /** Formatter for the numeric value when showValue is true */
  valueFormatter?: (context: DonutChartLabelFormatterContext) => string;
  /** Minimum slice sweep (degrees) required before labeling */
  minAngle?: number;
  /** Override label font size */
  fontSize?: number;
  /** Override label color */
  textColor?: string;
  /** Override line height for multi-line labels */
  lineHeight?: number;
  /** Offset distance applied beyond the ring edge (for outside labels) */
  offset?: number;
  /** Configuration for leader lines */
  leaderLine?: {
    show?: boolean;
    color?: string;
    width?: number;
    length?: number;
  };
}

export interface DonutChartCenterRenderContext {
  total: number;
  primaryRing?: DonutChartRingDetails;
  rings: DonutChartRingDetails[];
  focusedSlice: DonutChartSliceDetails | null;
}

export interface DonutChartLabelFormatterContext {
  slice: DonutChartSliceDetails;
  ring: DonutChartRingDetails;
  value: number;
  percentage: number;
}
```

## Examples

### Basics

Circular proportional chart with a hollow center (variant of pie chart).

```tsx
import { DonutChart } from '@plocks/charts';

import { SEGMENTS } from './data';

export function Demo() {
	return (
		<DonutChart
			title="Team allocation"
			size={260}
			data={SEGMENTS}
		/>
	);
}
```

`data.ts`

```ts
export const SEGMENTS = [
	{ label: 'Design', value: 28 },
	{ label: 'Engineering', value: 42 },
	{ label: 'Marketing', value: 18 },
	{ label: 'Support', value: 12 },
];
```

### Annual Expense Allocation

```tsx
import { DonutChart } from '@plocks/charts';

import { DEPARTMENT_ALLOCATIONS } from './data';

const formatBudget = (value: number) => `$${Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}M`;

export function Demo() {
  return (
    <DonutChart
      title="Annual Expense Allocation"
      subtitle="FY26 operating plan"
      size={300}
      data={DEPARTMENT_ALLOCATIONS}
      padAngle={1.8}
      legend={{ position: 'bottom' }}
      centerLabel={() => 'Budget'}
      centerSubLabel={() => 'Allocation by function'}
      centerValueFormatter={(value) => formatBudget(value)}
    />
  );
}
```

`data.ts`

```ts
import type { DonutChartDataPoint } from '@plocks/charts';

export const DEPARTMENT_ALLOCATIONS: DonutChartDataPoint[] = [
  { label: 'Product & Engineering', value: 42 },
  { label: 'Go-to-Market', value: 24 },
  { label: 'Customer Success', value: 14 },
  { label: 'G&A', value: 9 },
  { label: 'R&D Partnerships', value: 7 },
  { label: 'Workplace & Ops', value: 4 },
];
```

### Customer Segment Growth

```tsx
import { DonutChart } from '@plocks/charts';
import type { DonutChartDataPoint } from '@plocks/charts';

import { ARR_SEGMENTS, GROWTH_CONTRIBUTION } from './data';

const formatMillions = (value: number) => `${Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}M`;

const getRingId = (slice?: DonutChartDataPoint | null) => (slice as any)?.ringId as string | undefined;

export function Demo() {
  return (
    <DonutChart
      title="ARR Mix by Segment"
      subtitle="FY26 to date"
      size={320}
      ringGap={16}
      rings={[
        {
          id: 'arr',
          label: 'Annual Recurring Revenue',
          data: ARR_SEGMENTS,
          padAngle: 1.8,
          showInLegend: true,
        },
        {
          id: 'growth',
          label: 'YoY Growth Contribution',
          data: GROWTH_CONTRIBUTION,
          thicknessRatio: 0.16,
          padAngle: 1.2,
          showInLegend: false,
        },
      ]}
      primaryRingIndex={0}
      legendRingIndex={0}
      centerLabel={(total, _data, focused) => {
        if (focused) {
          return focused.label;
        }
        return 'Total ARR';
      }}
      centerSubLabel={(total, _data, focused) => {
        if (!focused) return 'YoY growth vs. FY25';
        return getRingId(focused) === 'growth' ? 'Growth contribution' : 'Segment share';
      }}
      centerValueFormatter={(value, _total, focused) => {
        if (focused && getRingId(focused) === 'growth') {
          return `${value.toFixed(0)}%`;
        }
        return `$${formatMillions(value)}`;
      }}
      legend={{ position: 'bottom' }}
    />
  );
}
```

`data.ts`

```ts
import type { DonutChartDataPoint } from '@plocks/charts';

export const ARR_SEGMENTS: DonutChartDataPoint[] = [
  { id: 'enterprise', label: 'Enterprise', value: 82, data: { metric: 'arr' } },
  { id: 'mid-market', label: 'Mid-Market', value: 54, data: { metric: 'arr' } },
  { id: 'smb', label: 'SMB', value: 36, data: { metric: 'arr' } },
  { id: 'self-serve', label: 'Self-Serve', value: 22, data: { metric: 'arr' } },
];

export const GROWTH_CONTRIBUTION: DonutChartDataPoint[] = [
  { id: 'enterprise', label: 'Enterprise', value: 34, data: { metric: 'growth' } },
  { id: 'mid-market', label: 'Mid-Market', value: 28, data: { metric: 'growth' } },
  { id: 'smb', label: 'SMB', value: 22, data: { metric: 'growth' } },
  { id: 'self-serve', label: 'Self-Serve', value: 16, data: { metric: 'growth' } },
];
```

### Data Center Power

```tsx
import { DonutChart } from '@plocks/charts';

import { POWER_BY_SUBSYSTEM } from './data';

const formatMegawatts = (value: number) => `${value.toFixed(1)} MW`;

export function Demo() {
  return (
    <DonutChart
      title="Data Center Power Draw"
      subtitle="May 2025 peak load"
      size={320}
      data={POWER_BY_SUBSYSTEM}
      padAngle={2}
      legend={{ position: 'right', align: 'start' }}
      padding={{ top: 140, right: 168, bottom: 72, left: 72 }}
      centerLabel={() => 'Power load'}
      centerSubLabel={() => 'Across campus subsystems'}
      centerValueFormatter={(value) => formatMegawatts(value)}
      labels={{
        show: true,
        position: 'outside',
        showPercentage: true,
        showValue: true,
        valueFormatter: ({ value }) => formatMegawatts(value),
        leaderLine: { width: 1.5 },
      }}
    />
  );
}
```

`data.ts`

```ts
import type { DonutChartDataPoint } from '@plocks/charts';

export const POWER_BY_SUBSYSTEM: DonutChartDataPoint[] = [
  { label: 'Compute clusters', value: 37 },
  { label: 'Storage arrays', value: 21 },
  { label: 'Networking fabric', value: 14 },
  { label: 'Cooling systems', value: 18 },
  { label: 'Ancillary load', value: 10 },
];
```

### Employee Geography Workstyle

```tsx
import { View, Text } from 'react-native';
import { DonutChart } from '@plocks/charts';

import { REGION_HEADCOUNT, WORK_STYLE, remoteRatio } from './data';

const formatHeadcount = (value: number) => Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);

export function Demo() {
  return (
    <DonutChart
      title="Employee Distribution"
      subtitle="Geography and work style"
      size={320}
      ringGap={18}
      rings={[
        {
          id: 'region',
          label: 'Regional distribution',
          data: REGION_HEADCOUNT,
          padAngle: 2.2,
          thicknessRatio: 0.3,
          showInLegend: false,
        },
        {
          id: 'work-style',
          label: 'Work style mix',
          data: WORK_STYLE,
          thicknessRatio: 0.18,
          padAngle: 1.5,
          showInLegend: true,
        },
      ]}
      primaryRingIndex={0}
      legendRingIndex={1}
      renderCenterContent={({ focusedSlice, primaryRing, total }) => {
        const isWorkStyle = focusedSlice?.ringId === 'work-style';
        const headline = focusedSlice ? focusedSlice.label : 'Headcount';
        const valueText = focusedSlice
          ? isWorkStyle
            ? `${Math.round((focusedSlice.percentage || 0) * 100)}%`
            : formatHeadcount(focusedSlice.value)
          : formatHeadcount(primaryRing?.total ?? total);
        const helperText = focusedSlice
          ? isWorkStyle
            ? 'of workforce'
            : 'global headcount'
          : `Remote ${Math.round(remoteRatio * 100)}%`;

        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                textTransform: 'uppercase',
                color: '#868E96',
                marginBottom: 2,
              }}
            >
              {headline}
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '700',
                color: '#212529',
              }}
            >
              {valueText}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#495057',
                marginTop: 4,
              }}
            >
              {helperText}
            </Text>
          </View>
        );
      }}
      labels={{
        show: true,
        rings: ['work-style'],
        position: 'outside',
        showPercentage: true,
        leaderLine: { width: 1.4 },
      }}
      legend={{ position: 'bottom' }}
    />
  );
}
```

`data.ts`

```ts
import type { DonutChartDataPoint } from '@plocks/charts';

export const REGION_HEADCOUNT: DonutChartDataPoint[] = [
  { id: 'na', label: 'North America', value: 1820 },
  { id: 'emea', label: 'EMEA', value: 1240 },
  { id: 'apac', label: 'APAC', value: 860 },
  { id: 'latam', label: 'LATAM', value: 480 },
];

export const WORK_STYLE: DonutChartDataPoint[] = [
  { id: 'remote', label: 'Remote', value: 2760, data: { kind: 'work-style' } },
  { id: 'onsite', label: 'Onsite', value: 1640, data: { kind: 'work-style' } },
];

export const remoteRatio = WORK_STYLE[0].value / (WORK_STYLE[0].value + WORK_STYLE[1].value);
```

### Marketplace Fulfillment Mix

```tsx
import { DonutChart } from '@plocks/charts';

import { FULFILLMENT_PARTNERS } from './data';

const formatOrders = (value: number) => `${value.toFixed(2)}M`;

export function Demo() {
  return (
    <DonutChart
      title="Marketplace Fulfillment Mix"
      subtitle="Orders fulfilled in Q3"
      size={300}
      data={FULFILLMENT_PARTNERS}
      padAngle={1.6}
      isolateOnClick
      legend={{ position: 'bottom' }}
      centerLabel={() => 'Orders'}
      centerSubLabel={() => 'Fulfilled volume by partner'}
      centerValueFormatter={(value) => `${formatOrders(value)} total`}
    />
  );
}
```

`data.ts`

```ts
import type { DonutChartDataPoint } from '@plocks/charts';

export const FULFILLMENT_PARTNERS: DonutChartDataPoint[] = [
  { label: 'Direct warehouses', value: 1.35 },
  { label: '3PL network', value: 1.08 },
  { label: 'Regional partners', value: 0.82 },
  { label: 'Drop-ship vendors', value: 0.54 },
  { label: 'Micro-fulfillment hubs', value: 0.31 },
];
```
