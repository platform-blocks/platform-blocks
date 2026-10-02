# Marimekko Chart

Visualize categorical mix alongside overall weight with a mosaic-style variable-width column chart.

## Metadata

- Import: `import { MarimekkoChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, marimekko, mosaic
- Docs: https://plocks.dev/charts/MarimekkoChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/MarimekkoChart

## Props

- `data` (required): MarimekkoCategory[] — Categories rendered as variable-width columns.
- `legend`: ChartLegend — Optional legend configuration.
- `xAxis`: ChartAxis — Optional x-axis configuration.
- `yAxis`: ChartAxis — Optional y-axis configuration (defaults to percentage scale).
- `grid`: ChartGrid — Grid configuration applied to the background.
- `columnGap`: number = 12 — Gap (in pixels) inserted between columns.
- `segmentBorderRadius`: number = 2 — Corner radius applied to each segment rectangle.
- `padding`: { top: number; right: number; bottom: number; left: number } — Override padding around the chart plot area.
- `categoryLabelFormatter`: (category: MarimekkoCategory, index: number) => string — Formatter applied to categorical labels along the x-axis.

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface MarimekkoCategory {
  /** Pre-formatted helpers for tooltip rendering. */
  /** Unique identifier (falls back to the label). */
  id?: string | number;
  /** Display label for the category column. */
  label: string;
  /** Optional base color applied to segments that do not override their own color. */
  color?: string;
  /** Segments stacked within this category column. */
  segments: MarimekkoSegment[];
  /** Whether this category column is visible. */
  visible?: boolean;
  /** Arbitrary user data passed through interaction callbacks. */
  data?: any;
}

export interface MarimekkoSegment {
  /** Unique identifier within the category (falls back to the label). */
  id?: string | number;
  /** Display label for the segment. */
  label: string;
  /** Absolute measure represented by the segment. */
  value: number;
  /** Optional color override applied to this segment instance. */
  color?: string;
  /** Whether the segment is visible. */
  visible?: boolean;
  /** Arbitrary user data carried through interaction callbacks. */
  data?: any;
  /** Total for the category after applying legend visibility (injected by the chart). */
  visibleCategoryTotal?: number;
  /** Share of the visible dataset contributed by the category (injected by the chart). */
  visibleCategoryShare?: number;
}
```

## Examples

### Basics

Variable-width columns reveal how each pipeline channel and region contributes to total qualified pipeline.

```tsx
import { MarimekkoChart } from '@plocks/charts';

import { PIPELINE_COMPOSITION } from './data';

export function Demo() {
  return (
    <MarimekkoChart
      title="Pipeline contribution by segment"
      subtitle="Quarter to date"
      h={440}
      data={PIPELINE_COMPOSITION}
      columnGap={16}
      legend={{ show: true, position: 'bottom' }}
      yAxis={{ title: 'Segment share (%)' }}
      grid={{ show: true, style: 'dotted' }}
      categoryLabelFormatter={(category) => category.label}
    />
  );
}
```

`data.ts`

```ts
export const PIPELINE_COMPOSITION = [
  {
    label: 'Inbound',
    segments: [
      { label: 'North America', value: 52 },
      { label: 'EMEA', value: 34 },
      { label: 'APAC', value: 24 },
    ],
  },
  {
    label: 'Outbound',
    segments: [
      { label: 'North America', value: 44 },
      { label: 'EMEA', value: 28 },
      { label: 'APAC', value: 18 },
    ],
  },
  {
    label: 'Partnerships',
    segments: [
      { label: 'North America', value: 29 },
      { label: 'EMEA', value: 22 },
      { label: 'APAC', value: 15 },
    ],
  },
  {
    label: 'Expansion',
    segments: [
      { label: 'North America', value: 37 },
      { label: 'EMEA', value: 18 },
      { label: 'APAC', value: 12 },
    ],
  },
];
```

### Budget Allocation

Lay out the company plan to see both department budgets and how each team invests within their allocation.

```tsx
import { MarimekkoChart } from '@plocks/charts';

import { BUDGET_PLAN } from './data';

export function Demo() {
  return (
    <MarimekkoChart
      title="FY26 budget allocation"
      subtitle="Percentage of total discretionary spend"
      h={420}
      data={BUDGET_PLAN}
      segmentBorderRadius={3}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      yAxis={{ title: 'Share of category (%)' }}
      categoryLabelFormatter={(category) => `${category.label} (${category.segments.reduce((sum, seg) => sum + seg.value, 0)}%)`}
    />
  );
}
```

`data.ts`

```ts
export const BUDGET_PLAN = [
  {
    label: 'Growth',
    segments: [
      { label: 'Paid media', value: 28 },
      { label: 'Field marketing', value: 24 },
      { label: 'Events', value: 18 },
      { label: 'Advocacy', value: 12 },
    ],
  },
  {
    label: 'Product',
    segments: [
      { label: 'Roadmap', value: 26 },
      { label: 'Design', value: 14 },
      { label: 'Research', value: 10 },
      { label: 'Maintenance', value: 22 },
    ],
  },
  {
    label: 'Customer',
    segments: [
      { label: 'Success', value: 18 },
      { label: 'Support', value: 21 },
      { label: 'Education', value: 9 },
      { label: 'Community', value: 7 },
    ],
  },
  {
    label: 'Operations',
    segments: [
      { label: 'Security', value: 15 },
      { label: 'IT', value: 11 },
      { label: 'Finance', value: 14 },
      { label: 'People', value: 13 },
    ],
  },
];
```

### Product Portfolio

Compare how revenue mixes across product tiers and sales motions within a single view.

```tsx
import { MarimekkoChart } from '@plocks/charts';

import { PRODUCT_MIX } from './data';

export function Demo() {
  return (
    <MarimekkoChart
      title="ARR by product tier and motion"
      subtitle="Current quarter"
      h={460}
      data={PRODUCT_MIX}
      segmentBorderRadius={4}
      legend={{ show: true, position: 'right' }}
      yAxis={{ title: 'Revenue share (%)' }}
      categoryLabelFormatter={(category) => `${category.label}\n(${category.data?.region ?? 'Global'})`}
    />
  );
}
```

`data.ts`

```ts
export const PRODUCT_MIX = [
  {
    label: 'Starter',
    segments: [
      { label: 'Self-serve', value: 240 },
      { label: 'Sales assisted', value: 60 },
      { label: 'Channel', value: 45 },
    ],
  },
  {
    label: 'Growth',
    segments: [
      { label: 'Self-serve', value: 180 },
      { label: 'Sales assisted', value: 110 },
      { label: 'Channel', value: 95 },
    ],
  },
  {
    label: 'Scale',
    segments: [
      { label: 'Self-serve', value: 72 },
      { label: 'Sales assisted', value: 148 },
      { label: 'Channel', value: 126 },
    ],
  },
  {
    label: 'Enterprise',
    segments: [
      { label: 'Self-serve', value: 18 },
      { label: 'Sales assisted', value: 205 },
      { label: 'Channel', value: 164 },
    ],
  },
];
```

### Regional Mix

Explore regional totals and the mix of revenue streams side by side.

```tsx
import { MarimekkoChart } from '@plocks/charts';

import { REGIONAL_REVENUE } from './data';

export function Demo() {
  return (
    <MarimekkoChart
      title="Revenue mix by region"
      subtitle="Trailing twelve months"
      h={440}
      data={REGIONAL_REVENUE}
      columnGap={20}
      legend={{ show: true, position: 'bottom', align: 'start' }}
      grid={{ show: true, style: 'dotted' }}
      yAxis={{ title: 'Share within region (%)' }}
    />
  );
}
```

`data.ts`

```ts
export const REGIONAL_REVENUE = [
  {
    label: 'North America',
    segments: [
      { label: 'New business', value: 186 },
      { label: 'Expansion', value: 142 },
      { label: 'Renewal', value: 128 },
      { label: 'Services', value: 94 },
    ],
  },
  {
    label: 'EMEA',
    segments: [
      { label: 'New business', value: 132 },
      { label: 'Expansion', value: 98 },
      { label: 'Renewal', value: 87 },
      { label: 'Services', value: 76 },
    ],
  },
  {
    label: 'APAC',
    segments: [
      { label: 'New business', value: 94 },
      { label: 'Expansion', value: 72 },
      { label: 'Renewal', value: 65 },
      { label: 'Services', value: 48 },
    ],
  },
  {
    label: 'LATAM',
    segments: [
      { label: 'New business', value: 46 },
      { label: 'Expansion', value: 34 },
      { label: 'Renewal', value: 28 },
      { label: 'Services', value: 22 },
    ],
  },
];
```
