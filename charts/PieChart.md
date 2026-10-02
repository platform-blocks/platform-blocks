# Pie Chart

Proportional slice chart for categorical part-to-whole representation.

## Metadata

- Import: `import { PieChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, pie, categorical
- Docs: https://plocks.dev/charts/PieChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/PieChart

## Props

- `data` (required): PieChartDataPoint[] — Data points
- `innerRadius`: number — Inner radius (for donut chart)
- `outerRadius`: number — Outer radius
- `startAngle`: number — Start angle in degrees
- `endAngle`: number — End angle in degrees
- `padAngle`: number — Padding between slices
- `showLabels`: boolean — Show labels
- `showLabelsOnNarrow`: boolean — Keep outside labels visible below 400 px instead of showing details on selection.
- `labelPosition`: 'inside' | 'outside' | 'center' — Label position
- `labelStrategy`: 'auto' | 'inside' | 'outside' | 'center' — Automatically choose label placement
- `labelAutoSwitchAngle`: number — Minimum slice angle (deg) to keep label inside when strategy is auto
- `wrapLabels`: boolean — Automatically wrap labels that exceed width
- `labelMaxCharsPerLine`: number — Maximum characters per label line when wrapping
- `labelMaxLines`: number — Maximum number of lines when wrapping
- `showLeaderLines`: boolean — Render leader lines for outside labels
- `leaderLineColor`: string — Leader line stroke color
- `leaderLineWidth`: number — Leader line stroke width
- `labelTextStyle`: PieChartLabelTextStyle — Style overrides applied to rendered labels
- `labelFormatter`: (dataPoint: PieChartDataPoint) => string — Label formatter
- `showValues`: boolean — Show values
- `valueFormatter`: (value: number, total: number) => string — Value formatter
- `legend`: ChartLegend — Legend configuration
- `tooltip`: ChartTooltip<PieChartDataPoint> — Tooltip configuration
- `animation`: ChartAnimation — Animation configuration
- `highlightOnHover`: boolean — Enable hover highlighting
- `onSliceHover`: (slice: PieChartDataPoint | null) => void — Callback when hover target changes
- `defaultSliceStyle`: PieChartSliceStyle — Default style applied to slices
- `layers`: PieChartLayer[] — Additional rings rendered around the base series
- `legendToggleEnabled`: boolean — Allow toggling slice visibility from the legend
- `keyboardNavigation`: boolean — Enable keyboard navigation between slices
- `ariaLabelFormatter`: (slice: PieChartDataPoint, percentage: number) => string — Accessible label formatter

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface PieChartDataPoint {
  /** Unique identifier */
  id?: string | number;
  /** Value of the slice */
  value: number;
  /** Label for the slice */
  label: string;
  /** Color of the slice */
  color?: string;
  /** Custom data for interactions */
  data?: any;
  /** Style overrides for the slice */
  style?: PieChartSliceStyle;
}

export interface PieChartLabelTextStyle {
  /** Label text color */
  color?: string;
  /** Label font size */
  fontSize?: number;
  /** Label font weight */
  fontWeight?: string;
  /** Label font family */
  fontFamily?: string;
  /** Line height applied between wrapped lines */
  lineHeight?: number;
}

export interface PieChartSliceStyle {
  /** Stroke color override */
  strokeColor?: string;
  /** Stroke width override */
  strokeWidth?: number;
  /** Stroke opacity */
  strokeOpacity?: number;
  /** Fill opacity */
  fillOpacity?: number;
  /** Rounded corner radius in pixels (best with non-zero innerRadius) */
  cornerRadius?: number;
  /** Gradient fill configuration */
  gradient?: PieChartSliceGradient;
  /** Drop shadow configuration */
  shadow?: PieChartSliceShadow;
}

export interface PieChartLayer {
  /** Optional identifier for the layer */
  id?: string;
  /** Data points rendered in this ring */
  data: PieChartDataPoint[];
  /** Inner radius for the layer */
  innerRadius: number;
  /** Outer radius for the layer */
  outerRadius: number;
  /** Optional start angle override */
  startAngle?: number;
  /** Optional end angle override */
  endAngle?: number;
  /** Optional pad angle override */
  padAngle?: number;
}

export type PieChartSliceGradient = Omit<ChartGradient, 'extent'>;

export interface PieChartSliceShadow {
  /** Shadow color */
  color?: string;
  /** Horizontal offset */
  dx?: number;
  /** Vertical offset */
  dy?: number;
  /** Blur radius */
  blur?: number;
  /** Shadow opacity */
  opacity?: number;
}
```

## Examples

### Basics

Proportional slice chart for categorical part-to-whole representation.

```tsx
import { PieChart } from '@plocks/charts';

import { TRAFFIC_SOURCES } from './data';

export function Demo() {
  return (
    <PieChart
      title="Traffic sources"
      maw={560}
      h={360}
      data={TRAFFIC_SOURCES}
      innerRadius={70}
      outerRadius={150}
      showLabels={true}
      labelPosition="outside"
      showValues={true}
      valueFormatter={(value) => `${value}%`}
      legend={{ show: true, position: 'right' }}
      tooltip={{
        show: true,
        formatter: (segment) => `${segment.label}: ${segment.value}%`,
      }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

`data.ts`

```ts
export const TRAFFIC_SOURCES = [
  { id: 'direct', label: 'Direct', value: 55 },
  { id: 'organic', label: 'Organic', value: 25 },
  { id: 'referral', label: 'Referral', value: 15 },
  { id: 'social', label: 'Social', value: 5 },
];
```

### Browser Usage Share

```tsx
import { PieChart, type PieChartDataPoint } from '@plocks/charts';

import { BROWSER_USAGE } from './data';

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${slice.value}%`;

const formatTooltip = (slice: PieChartDataPoint) => `${slice.label}: ${slice.value}% of sessions`;

export function Demo() {
  return (
    <PieChart
      title="Browser usage share"
      subtitle="Active sessions"
      maw={520}
      h={420}
      data={BROWSER_USAGE}
      outerRadius={150}
      showLabels
      labelPosition="outside"
      padAngle={1.5}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'spiral', duration: 900 }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

`data.ts`

```ts
export const BROWSER_USAGE = [
  { id: 'chrome', label: 'Chrome', value: 52 },
  { id: 'safari', label: 'Safari', value: 28 },
  { id: 'edge', label: 'Edge', value: 11 },
  { id: 'firefox', label: 'Firefox', value: 6 },
  { id: 'other', label: 'Other', value: 3 },
];
```

### Bug Type Distribution

```tsx
import { PieChart, type PieChartDataPoint } from '@plocks/charts';

import { BUG_TYPES } from './data';

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${slice.value}%`;

const formatTooltip = (slice: PieChartDataPoint) => `${slice.label}: ${slice.value}% of release defects`;

export function Demo() {
  return (
    <PieChart
      title="Bug type distribution"
      subtitle="Latest release cycle"
      maw={560}
      h={380}
      data={BUG_TYPES}
      innerRadius={70}
      outerRadius={150}
      showLabels
      labelPosition="center"
      labelFormatter={formatLabel}
      padAngle={1}
      legend={{ show: true, position: 'right' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'bounce', duration: 800, stagger: 80 }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

`data.ts`

```ts
export const BUG_TYPES = [
  { id: 'ui', label: 'UI', value: 38 },
  { id: 'api', label: 'API', value: 24 },
  { id: 'performance', label: 'Performance', value: 18 },
  { id: 'data', label: 'Data Quality', value: 12 },
  { id: 'security', label: 'Security', value: 5 },
  { id: 'infrastructure', label: 'Infrastructure', value: 3 },
];
```

### Operating Expense Composition

```tsx
import { PieChart, type PieChartDataPoint } from '@plocks/charts';

import { OPERATING_EXPENSES, TOTAL_EXPENSE } from './data';

const formatTooltip = (slice: PieChartDataPoint) => {
  const share = Math.round((slice.value / TOTAL_EXPENSE) * 100);
  return `${slice.label}: $${slice.value}M (${share}%)`;
};

export function Demo() {
  return (
    <PieChart
      title="Operating expense mix"
      subtitle="FY25 year-to-date"
      maw={520}
      h={440}
      data={OPERATING_EXPENSES}
      innerRadius={90}
      outerRadius={160}
      showLabels
      labelPosition="outside"
      padAngle={1.5}
      labelFormatter={(slice) => `${slice.label} · $${slice.value}M`}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

`data.ts`

```ts
export const OPERATING_EXPENSES = [
  { id: 'rnd', label: 'R&D', value: 42 },
  { id: 'marketing', label: 'Sales & Marketing', value: 34 },
  { id: 'operations', label: 'Operations', value: 28 },
  { id: 'ga', label: 'General & Admin', value: 18 },
  { id: 'it', label: 'IT & Security', value: 14 },
  { id: 'facilities', label: 'Facilities', value: 11 },
];

export const TOTAL_EXPENSE = OPERATING_EXPENSES.reduce((sum, slice) => sum + slice.value, 0);
```

### Support Channel Share

```tsx
import { PieChart, type PieChartDataPoint } from '@plocks/charts';

import { SUPPORT_CHANNELS, TOTAL_INTERACTIONS } from './data';

const toShare = (value: number) => Math.round((value / TOTAL_INTERACTIONS) * 100);

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${toShare(slice.value)}%`;

const formatTooltip = (slice: PieChartDataPoint) => {
  const share = toShare(slice.value);
  return `${slice.label}: ${slice.value.toLocaleString()} interactions (${share}%)`;
};

export function Demo() {
  return (
    <PieChart
      title="Support contact mix"
      subtitle="Last 30 days"
      maw={580}
      h={380}
      data={SUPPORT_CHANNELS}
      innerRadius={80}
      outerRadius={150}
      showLabels
      labelPosition="outside"
      padAngle={1}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'right' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      startAngle={-70}
      endAngle={290}
    />
  );
}
```

`data.ts`

```ts
export const SUPPORT_CHANNELS = [
  { id: 'chat', label: 'Live chat', value: 460 },
  { id: 'email', label: 'Email', value: 380 },
  { id: 'phone', label: 'Phone', value: 240 },
  { id: 'self-service', label: 'Self-service', value: 310 },
  { id: 'social', label: 'Social', value: 90 },
];

export const TOTAL_INTERACTIONS = SUPPORT_CHANNELS.reduce((sum, slice) => sum + slice.value, 0);
```

### Training Completion Share

```tsx
import { PieChart, type PieChartDataPoint } from '@plocks/charts';

import { TOTAL_COMPLETIONS, TRAINING_COMPLETIONS } from './data';

const toPercent = (value: number) => Math.round((value / TOTAL_COMPLETIONS) * 100);

const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${toPercent(slice.value)}%`;

const formatTooltip = (slice: PieChartDataPoint) => {
  const share = toPercent(slice.value);
  return `${slice.label}: ${slice.value.toLocaleString()} completions (${share}%)`;
};

export function Demo() {
  return (
    <PieChart
      title="Training completion share"
      subtitle="Annual compliance program"
      maw={520}
      h={440}
      data={TRAINING_COMPLETIONS}
      innerRadius={100}
      outerRadius={160}
      showLabels
      labelPosition="outside"
      padAngle={1.2}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'wave', duration: 900, stagger: 70 }}
      startAngle={-100}
      endAngle={260}
    />
  );
}
```

`data.ts`

```ts
export const TRAINING_COMPLETIONS = [
  { id: 'engineering', label: 'Engineering', value: 320 },
  { id: 'product', label: 'Product', value: 180 },
  { id: 'success', label: 'Customer Success', value: 150 },
  { id: 'sales', label: 'Sales', value: 210 },
  { id: 'operations', label: 'Operations', value: 140 },
  { id: 'people', label: 'People', value: 90 },
];

export const TOTAL_COMPLETIONS = TRAINING_COMPLETIONS.reduce((sum, slice) => sum + slice.value, 0);
```
