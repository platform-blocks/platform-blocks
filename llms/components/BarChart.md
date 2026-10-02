# Bar Chart

Discrete / categorical bar chart visualization component.

## Metadata

- Import: `import { BarChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, bar, categorical
- Docs: https://plocks.dev/charts/BarChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/BarChart

## Props

- `data` (required): BarChartDataPoint[] — Data points
- `series`: BarChartSeries[] — Optional multi-series data
- `barColor`: ChartFill — Bar fill for a single-series chart — a color or a gradient
- `barSpacing`: number = 0.2 — Bar spacing (0-1)
- `barBorderRadius`: number = 4 — Bar border radius
- `orientation`: 'vertical' | 'horizontal' = 'vertical' — Orientation
- `layout`: 'single' | 'grouped' | 'stacked' — Layout strategy for multi-series data
- `stackMode`: 'normal' | '100%' = 'normal' — Stacked layout mode
- `valueFormatter`: (value: number, datum: BarChartDataPoint, index: number) => string — Optional value formatter for tooltip display
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid configuration
- `legend`: ChartLegend = { show: true, position: 'bottom', align: 'center' } — Legend configuration
- `legendToggleEnabled`: boolean — Allow toggling series visibility from the legend
- `thresholds`: BarChartThreshold[] — Reference lines overlaid on the chart
- `valueLabel`: BarChartValueLabelConfig — Value label configuration
- `colorScale`: BarColorScale — Color bars by value (shared scale config) or with a function. Outranks `barColor`.
- `tooltip`: ChartTooltip<BarChartDataPoint> — Tooltip configuration
- `animation`: ChartAnimation — Animation configuration
- `multiTooltip`: boolean — Shared multi-series tooltip
- `enableCrosshair`: boolean — Crosshair enable
- `liveTooltip`: boolean — Live pointer-follow tooltip

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface BarChartDataPoint {
  /** Unique identifier */
  id?: string | number;
  /** Category/label */
  category: string;
  /** Value */
  value: number;
  /** Color override */
  color?: string;
  /** Custom data for interactions */
  data?: any;
}

export interface BarChartSeries {
  /** Unique identifier for the series */
  id: string;
  /** Display name for the legend */
  name?: string;
  /** Optional base color for all data points in the series */
  color?: string;
  /** Data points belonging to this series */
  data: BarChartDataPoint[];
}

export interface BarChartThreshold {
  /** Threshold value rendered as a reference line */
  value: number;
  /** Optional label displayed alongside the line */
  label?: string;
  /** Line color */
  color?: string;
  /** Line thickness */
  width?: number;
  /** Dash pattern */
  style?: 'solid' | 'dashed';
  /** Offset the label from the line (px) */
  labelOffset?: number;
  /** Render the line above or below bars */
  position?: 'front' | 'back';
}

export interface BarChartValueLabelConfig {
  /** Show value labels above or inside bars */
  show?: boolean;
  /** Custom formatter for the value label */
  formatter?: (value: number, datum: BarChartDataPoint, index: number) => string;
  /** Text color */
  color?: string;
  /** Font size */
  fontSize?: number;
  /** Font weight */
  fontWeight?: string | number;
  /** Offset in pixels from the anchor position */
  offset?: number;
  /** Label position relative to the bar */
  position?: 'inside' | 'outside';
}

export type BarColorScale = ColorScaleConfig | ((context: BarColorScaleContext) => string | undefined);

export interface BarColorScaleContext {
  datum: BarChartDataPoint;
  series: BarChartSeries;
  seriesIndex: number;
  categoryIndex: number;
}
```

## Examples

### Basics

Basic BarChart usage with a title.

```tsx
import { BarChart } from '@plocks/charts';

import { QUARTERLY_REVENUE } from './data';

export function Demo() {
  return (
    <BarChart
      title="Quarterly revenue"
      subtitle="North America"
      h={260}
      data={QUARTERLY_REVENUE}
      barSpacing={0.25}
      barBorderRadius={6}
      valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
      xAxis={{ show: true }}
      yAxis={{
        show: true,
        labelFormatter: (value) => `$${(value / 1000).toFixed(0)}k`,
      }}
      grid={{ show: true, style: 'dotted' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.category}: $${point.value.toLocaleString()}`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

`data.ts`

```ts
export const QUARTERLY_REVENUE = [
  { id: 'q1', category: 'Q1', value: 420_000 },
  { id: 'q2', category: 'Q2', value: 515_000 },
  { id: 'q3', category: 'Q3', value: 468_500 },
  { id: 'q4', category: 'Q4', value: 590_200 },
];
```

### Diverging from zero

**Key settings** - `colorScale={{ type: 'diverging', midpoint: 0, colors: [low, high] }}` colors each bar by its value. The scale's domain always includes zero, where bars start. - Both arms are symmetric around the midpoint, so a $40k loss and a $40k gain carry the same intensity.

```tsx
import { BarChart } from '@plocks/charts';

import { NET_CASH_FLOW } from './data';

export function Demo() {
  return (
    <BarChart
      title="Monthly net cash flow"
      subtitle="Diverging from zero: red months lost money, blue months made it"
      h={340}
      data={NET_CASH_FLOW}
      barSpacing={0.24}
      legend={{ show: false }}
      colorScale={{ type: 'diverging', midpoint: 0, colors: ['#e34948', '#2a78d6'] }}
      yAxis={{
        show: true,
        title: 'Net cash flow (USD thousands)',
        labelFormatter: (value) => `$${value}k`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      valueFormatter={(value) => `${value < 0 ? '-' : '+'}$${Math.abs(value)}k`}
    />
  );
}
```

`data.ts`

```ts
export const NET_CASH_FLOW = [
  { category: 'Jan', value: -42 },
  { category: 'Feb', value: -18 },
  { category: 'Mar', value: 12 },
  { category: 'Apr', value: 35 },
  { category: 'May', value: 28 },
  { category: 'Jun', value: -6 },
  { category: 'Jul', value: 44 },
  { category: 'Aug', value: 61 },
  { category: 'Sep', value: 38 },
  { category: 'Oct', value: 15 },
  { category: 'Nov', value: -24 },
  { category: 'Dec', value: 52 },
];
```

### Gradient bars

**Key settings** - `barColor` takes a gradient as well as a color: `{ angle, stops, extent }`. - `extent: 'plot'` lays one gradient across the whole plot, so each bar shows the slice behind it. The default, `extent: 'mark'`, gives every bar the full gradient.

```tsx
import { BarChart } from '@plocks/charts';

import { HOURLY_REQUESTS } from './data';

export function Demo() {
  return (
    <BarChart
      title="API requests by hour"
      subtitle="One gradient spans the plot, so busier hours reach the deeper end"
      h={320}
      data={HOURLY_REQUESTS}
      barSpacing={0.28}
      legend={{ show: false }}
      barBorderRadius={6}
      barColor={{
        angle: 90,
        extent: 'plot',
        stops: [
          { offset: 0, color: '#12805a' },
          { offset: 1, color: '#8fdcbf' },
        ],
      }}
      yAxis={{
        show: true,
        title: 'Requests (millions)',
        labelFormatter: (value) => `${value}M`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      valueFormatter={(value) => `${value}M requests`}
    />
  );
}
```

`data.ts`

```ts
export const HOURLY_REQUESTS = [
  { category: '00h', value: 1.2 },
  { category: '03h', value: 0.7 },
  { category: '06h', value: 2.4 },
  { category: '09h', value: 6.8 },
  { category: '12h', value: 8.1 },
  { category: '15h', value: 7.4 },
  { category: '18h', value: 5.2 },
  { category: '21h', value: 3.1 },
];
```

### Coloring with a function

**Key settings** - `colorScale` also accepts a function, `({ datum, series, seriesIndex, categoryIndex }) => color`. Here each region is green when it beat its goal and red when it missed. Return `undefined` to fall back to `barColor`. - Green and red are status colors, so the value labels state every variance: color is never the only cue.

```tsx
import { BarChart } from '@plocks/charts';

import { REGIONAL_REVENUE } from './data';

// Status colors: the value labels spell out each variance, so color is never the only cue.
const BEAT_PLAN = '#0ca30c';
const MISSED_PLAN = '#d03b3b';

const formatMillions = (value: number) => `$${value.toFixed(2)}M`;

const formatVariance = (value: number, datum: (typeof REGIONAL_REVENUE)[number]) => {
  const goal = datum.data?.goal ?? 0;
  const diff = value - goal;
  const direction = diff >= 0 ? '+' : '-';
  return `${direction}$${Math.abs(diff).toFixed(2)}M vs goal`;
};

export function Demo() {
  return (
    <BarChart
      title="Quarterly Revenue by Region"
      subtitle="Q3 actuals with variance to plan"
      h={420}
      data={REGIONAL_REVENUE}
      barSpacing={0.32}
      colorScale={({ datum }) => (datum.value >= (datum.data?.goal ?? 0) ? BEAT_PLAN : MISSED_PLAN)}
      legend={{ show: false }}
      valueFormatter={(value, datum) => {
        const goal = datum.data?.goal;
        return goal != null
          ? `${formatMillions(value)} actual (goal ${formatMillions(goal)})`
          : formatMillions(value);
      }}
      valueLabel={{
        formatter: (value, datum) => formatVariance(value, datum as (typeof REGIONAL_REVENUE)[number]),
        color: '#1f2937',
        fontSize: 12,
        fontWeight: '600',
        offset: 12,
      }}
      yAxis={{
        show: true,
        title: 'Revenue (USD millions)',
        titleFontSize: 12,
        labelFormatter: (value) => `$${value.toFixed(1)}M`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const goal = datum.data?.goal ?? 0;
          const diff = datum.value - goal;
          const pct = goal ? (diff / goal) * 100 : 0;
          const direction = diff >= 0 ? '+' : '-';
          const varianceValue = `${direction}${formatMillions(Math.abs(diff))}`;
          const variancePct = `${direction}${Math.abs(pct).toFixed(1)}%`;
          return [
            `${datum.category}`,
            `Actual: ${formatMillions(datum.value)}`,
            `Goal: ${formatMillions(goal)}`,
            `Variance: ${varianceValue} (${variancePct})`,
            datum.data?.focus ? `Focus: ${datum.data.focus}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const REGIONAL_REVENUE = [
  {
    id: 'na',
    category: 'North America',
    value: 5.84,
    data: { goal: 5.6, focus: 'Enterprise upsell momentum' },
  },
  {
    id: 'emea',
    category: 'EMEA',
    value: 4.35,
    data: { goal: 4.1, focus: 'Channel partner acceleration' },
  },
  {
    id: 'apac',
    category: 'APAC',
    value: 3.92,
    data: { goal: 4.0, focus: 'Pipeline impacted by onboarding capacity' },
  },
  {
    id: 'latam',
    category: 'LATAM',
    value: 2.48,
    data: { goal: 2.2, focus: 'New reseller footprint' },
  },
];
```

### Feature Adoption By Tier

```tsx
import { BarChart } from '@plocks/charts';

import { FEATURE_ADOPTION } from './data';

const formatAccounts = (value: number) => `${value.toLocaleString()} accounts`;

export function Demo() {
  return (
    <BarChart
      title="Feature adoption by customer tier"
      subtitle="Accounts live on the experimentation canvas within 45 days"
      h={400}
      data={FEATURE_ADOPTION}
      barSpacing={0.26}
      barBorderRadius={12}
      legend={{ show: false }}
      valueFormatter={(value, datum) => {
        const segmentTotal = datum.data?.accounts ?? value;
        const rate = datum.data?.adoptionRate ?? value / segmentTotal;
        const percentage = `${Math.round((rate ?? 0) * 100)}% adoption`;
        return `${formatAccounts(value)} (${percentage})`;
      }}
      valueLabel={{
        position: 'inside',
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
        formatter: (value) => value.toLocaleString(),
      }}
      yAxis={{
        show: true,
        title: 'Activated accounts',
        titleFontSize: 12,
        labelFormatter: (value) => value.toLocaleString(),
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const accounts = datum.data?.accounts ?? datum.value;
          const adoptionRate = datum.data?.adoptionRate ?? datum.value / accounts;
          return [
            datum.category,
            `Activated: ${formatAccounts(datum.value)}`,
            `Account base: ${accounts.toLocaleString()}`,
            `Adoption rate: ${(adoptionRate * 100).toFixed(1)}%`,
          ].join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const FEATURE_ADOPTION = [
  {
    id: 'enterprise',
    category: 'Enterprise',
    value: 1280,
    data: { accounts: 1640, adoptionRate: 0.78 },
  },
  {
    id: 'midmarket',
    category: 'Mid-market',
    value: 930,
    data: { accounts: 1310, adoptionRate: 0.71 },
  },
  {
    id: 'growth',
    category: 'Growth',
    value: 610,
    data: { accounts: 980, adoptionRate: 0.62 },
  },
  {
    id: 'starter',
    category: 'Starter',
    value: 340,
    data: { accounts: 720, adoptionRate: 0.47 },
  },
];
```

### Marketing Spend Multi Touch

```tsx
import { BarChart } from '@plocks/charts';

import { CAMPAIGN_SPEND, TOTAL_SPEND } from './data';

const formatSpend = (value: number) => `$${value.toLocaleString()}k`;

export function Demo() {
  return (
    <BarChart
      title="Marketing spend by channel"
      subtitle="Multi-touch journey campaign mix"
      h={420}
      data={CAMPAIGN_SPEND}
      barSpacing={0.28}
      legend={{ show: false }}
      valueFormatter={(value) => `${formatSpend(value)} invested`}
      valueLabel={{
        color: '#1f2937',
        fontSize: 12,
        offset: 12,
        formatter: (value) => {
          const share = TOTAL_SPEND ? (value / TOTAL_SPEND) * 100 : 0;
          return `${share.toFixed(1)}% of spend`;
        },
      }}
      yAxis={{
        show: true,
        title: 'Investment (USD thousands)',
        titleFontSize: 12,
        labelFormatter: (value) => `$${value.toFixed(0)}k`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const share = TOTAL_SPEND ? (datum.value / TOTAL_SPEND) * 100 : 0;
          return [
            datum.category,
            `Spend: ${formatSpend(datum.value)}`,
            `Share: ${share.toFixed(1)}% of program`,
            datum.data?.objective ? `Objective: ${datum.data.objective}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const CAMPAIGN_SPEND = [
  {
    id: 'paid-search',
    category: 'Paid search',
    value: 820,
    data: { objective: 'Capture late-stage demand' },
  },
  {
    id: 'paid-social',
    category: 'Paid social',
    value: 540,
    data: { objective: 'Net new persona awareness' },
  },
  {
    id: 'field-events',
    category: 'Field events',
    value: 460,
    data: { objective: 'Pipeline acceleration' },
  },
  {
    id: 'webinars',
    category: 'Webinars & workshops',
    value: 380,
    data: { objective: 'Activation & nurture' },
  },
  {
    id: 'content',
    category: 'Content syndication',
    value: 295,
    data: { objective: 'Top-of-funnel scale' },
  },
  {
    id: 'partners',
    category: 'Partner marketing',
    value: 260,
    data: { objective: 'Co-sell influence' },
  },
];

export const TOTAL_SPEND = CAMPAIGN_SPEND.reduce((sum, item) => sum + item.value, 0);
```

### New Hire Recruiting Cycles

```tsx
import { BarChart } from '@plocks/charts';

import { RECRUITING_PROGRESS } from './data';

const formatDelta = (value: number, datum: (typeof RECRUITING_PROGRESS)[number]) => {
  const previous = datum.data?.previous ?? 0;
  const delta = value - previous;
  if (delta === 0) return 'No change vs last cycle';
  const sign = delta > 0 ? '+' : '-';
  return `${sign}${Math.abs(delta)} vs last cycle`;
};

export function Demo() {
  return (
    <BarChart
      title="New hires secured this recruiting cycle"
      subtitle="Compared with winter intake"
      h={440}
      orientation="horizontal"
      data={RECRUITING_PROGRESS}
      barSpacing={0.25}
      legend={{ show: false }}
      valueFormatter={(value) => `${value} hires`}
      valueLabel={{
        formatter: (value, datum) => formatDelta(value, datum as (typeof RECRUITING_PROGRESS)[number]),
        color: '#1f2937',
        fontSize: 12,
        offset: 10,
      }}
      xAxis={{
        title: 'Hires confirmed',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const previous = datum.data?.previous ?? 0;
          const delta = datum.value - previous;
          const direction = delta >= 0 ? '+' : '-';
          return [
            `${datum.category}`,
            `This cycle: ${datum.value} hires`,
            `Last cycle: ${previous} hires`,
            `Delta: ${direction}${Math.abs(delta)}`,
            datum.data?.priority ? `Focus: ${datum.data.priority}` : undefined,
            datum.data?.openRoles != null ? `Open roles: ${datum.data.openRoles}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const RECRUITING_PROGRESS = [
  {
    id: 'engineering',
    category: 'Engineering',
    value: 48,
    data: { previous: 42, openRoles: 6, priority: 'Backend & AI platform' },
  },
  {
    id: 'product',
    category: 'Product',
    value: 21,
    data: { previous: 18, openRoles: 3, priority: 'Activation journeys' },
  },
  {
    id: 'sales',
    category: 'Revenue',
    value: 27,
    data: { previous: 24, openRoles: 4, priority: 'Enterprise AEs' },
  },
  {
    id: 'success',
    category: 'Customer Success',
    value: 19,
    data: { previous: 16, openRoles: 2, priority: 'Strategic segments' },
  },
  {
    id: 'support',
    category: 'Support',
    value: 15,
    data: { previous: 14, openRoles: 2, priority: 'Follow-the-sun coverage' },
  },
];
```

### Sla Compliance By Team

```tsx
import { BarChart } from '@plocks/charts';

import { SLA_COMPLIANCE } from './data';

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function Demo() {
  return (
    <BarChart
      title="SLA compliance by response team"
      subtitle="Rolling 12-month attainment"
      h={420}
      orientation="horizontal"
      data={SLA_COMPLIANCE}
      barSpacing={0.3}
      legend={{ show: false }}
      valueFormatter={(value) => `${formatPercent(value)} SLA met`}
      valueLabel={{
        color: '#111827',
        fontSize: 12,
        offset: 12,
        formatter: (value) => formatPercent(value),
      }}
      xAxis={{
        title: 'Tickets meeting SLA target',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      yAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const last = datum.data?.lastQuarter ?? datum.value;
          const delta = datum.value - last;
          const direction = delta >= 0 ? '+' : '-';
          return [
            datum.category,
            `Current: ${formatPercent(datum.value)}`,
            `Last quarter: ${formatPercent(last)}`,
            `Change: ${direction}${Math.abs(delta).toFixed(1)} pts`,
          ].join('\n');
        },
      }}
    />
  );
}
```

`data.ts`

```ts
export const SLA_COMPLIANCE = [
  {
    id: 'enterprise',
    category: 'Enterprise support',
    value: 97.6,
    color: '#16a34a',
    data: { lastQuarter: 96.8 },
  },
  {
    id: 'commercial',
    category: 'Commercial support',
    value: 94.8,
    color: '#f59e0b',
    data: { lastQuarter: 92.4 },
  },
  {
    id: 'success',
    category: 'Customer success',
    value: 96.2,
    color: '#22c55e',
    data: { lastQuarter: 95.1 },
  },
  {
    id: 'platform',
    category: 'Platform incidents',
    value: 91.5,
    color: '#ef4444',
    data: { lastQuarter: 89.7 },
  },
];
```
