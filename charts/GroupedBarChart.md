# Grouped Bar Chart

Bar chart grouping multiple series side-by-side for comparison.

## Metadata

- Import: `import { GroupedBarChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, bar, grouped
- Docs: https://plocks.dev/charts/GroupedBarChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/GroupedBarChart

## Props

- `series` (required): StackedBarSeries[] — Grouped series data to render
- `barSpacing`: number = 0.2 — Gap between grouped categories
- `innerBarSpacing`: number = 0.1 — Gap between bars inside a group
- `legend`: ChartLegend = { show: true, position: 'bottom', align: 'center' } — Legend configuration
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid line configuration
- `animation`: ChartAnimation — Animation configuration
- `colorOptions`: GroupedBarColorOptions — Palette and hashing options for bar colors
- `valueLabels`: GroupedBarValueLabelConfig — Optional bar value label configuration
- `multiTooltip`: boolean — Enable multi-series aggregated tooltip content
- `liveTooltip`: boolean — Keep tooltip visible while pointer moves within chart
- `enableCrosshair`: boolean — Toggle crosshair overlay and events (defaults to enabled)

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface GroupedBarColorOptions {
  /** Palette name or array used for automatic colors */
  palette?: string | any;
  /** Enable color hashing based on category labels */
  hash?: boolean;
}

export interface GroupedBarValueLabelConfig {
  /** Display numeric labels for each bar */
  show?: boolean;
  /** Position strategy for labels */
  position?: 'inside' | 'outside' | 'auto';
  /** Custom formatter for label text */
  formatter?: (params: GroupedBarValueLabelFormatterParams) => string | number;
  /** Text color */
  color?: string;
  /** Font size */
  fontSize?: number;
  /** Font weight */
  fontWeight?: string | number;
  /** Font family override */
  fontFamily?: string;
  /** Pixel offset applied to label placement */
  offset?: number;
  /** Minimum bar height (px) required to keep labels inside */
  minBarHeightForInside?: number;
}

export interface GroupedBarValueLabelFormatterParams {
  /** Raw numeric value for the bar */
  value: number;
  /** Category the bar belongs to */
  category: string;
  /** Zero-based index of the category */
  categoryIndex: number;
  /** Identifier for the series */
  seriesId: string;
  /** Optional human readable series name */
  seriesName?: string;
  /** Zero-based index of the series */
  seriesIndex: number;
  /** Original datum backing the bar */
  datum: BarChartDataPoint;
}
```

## Examples

### Basics

Bar chart grouping multiple series side-by-side for comparison.

```tsx
import { GroupedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
	return (
		<GroupedBarChart
			title="Product revenue by segment"
			subtitle="Comparison vs targets"
			h={320}
			series={SERIES}
			barSpacing={0.15}
			innerBarSpacing={0.2}
			xAxis={{ show: true, title: 'Segment' }}
			yAxis={{
				show: true,
				title: 'Revenue (USD thousands)',
				labelFormatter: (value) => `$${value}`,
			}}
			grid={{ show: true }}
			legend={{ show: true, position: 'bottom' }}
			animation={{ duration: 450 }}
			colorOptions={{ hash: false }}
		/>
	);
}
```

`data.ts`

```ts
export const SERIES = [
	{
		id: '2024',
		name: '2024',
		data: [
			{ id: 'analytics-24', category: 'Analytics', value: 420 },
			{ id: 'automation-24', category: 'Automation', value: 365 },
			{ id: 'integrations-24', category: 'Integrations', value: 298 },
		],
	},
	{
		id: '2025',
		name: '2025',
		data: [
			{ id: 'analytics-25', category: 'Analytics', value: 512 },
			{ id: 'automation-25', category: 'Automation', value: 418 },
			{ id: 'integrations-25', category: 'Integrations', value: 342 },
		],
	},
	{
		id: 'target',
		name: 'Target',
		color: '#FF922B',
		data: [
			{ id: 'analytics-target', category: 'Analytics', value: 540 },
			{ id: 'automation-target', category: 'Automation', value: 440 },
			{ id: 'integrations-target', category: 'Integrations', value: 360 },
		],
	},
];
```

### Experiment Variant By Geo

```tsx
import { GroupedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="Experiment conversion uplift by region"
      subtitle="Completed purchases per 100 sessions"
      h={340}
      series={SERIES}
      barSpacing={0.22}
      innerBarSpacing={0.18}
      xAxis={{
        show: true,
        title: 'Region',
      }}
      yAxis={{
        show: true,
        title: 'Conversion rate (%)',
        labelFormatter: (value) => `${value.toFixed(1)}%`,
        ticks: [3, 4, 5, 6],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      multiTooltip
      liveTooltip
      valueLabels={{
        show: true,
        position: 'outside',
        formatter: ({ value }) => `${value.toFixed(1)}%`,
        color: '#1F1F24',
        fontWeight: '600',
        offset: 8,
      }}
      animation={{ duration: 420 }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'control',
    name: 'Control',
    data: [
      { id: 'na-control', category: 'North America', value: 4.8 },
      { id: 'emea-control', category: 'EMEA', value: 4.2 },
      { id: 'apac-control', category: 'APAC', value: 3.9 },
      { id: 'latam-control', category: 'LATAM', value: 3.6 },
    ],
  },
  {
    id: 'variant-a',
    name: 'Variant A',
    data: [
      { id: 'na-var-a', category: 'North America', value: 5.6 },
      { id: 'emea-var-a', category: 'EMEA', value: 4.9 },
      { id: 'apac-var-a', category: 'APAC', value: 4.4 },
      { id: 'latam-var-a', category: 'LATAM', value: 4.1 },
    ],
  },
  {
    id: 'variant-b',
    name: 'Variant B',
    data: [
      { id: 'na-var-b', category: 'North America', value: 6.1 },
      { id: 'emea-var-b', category: 'EMEA', value: 5.3 },
      { id: 'apac-var-b', category: 'APAC', value: 4.8 },
      { id: 'latam-var-b', category: 'LATAM', value: 4.5 },
    ],
  },
];
```

### Feature Usage By Platform

```tsx
import { GroupedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="Feature usage by platform"
      subtitle="Weekly active users per capability (in thousands)"
      h={360}
      series={SERIES}
      barSpacing={0.18}
      innerBarSpacing={0.16}
      xAxis={{
        show: true,
        title: 'Product capability',
      }}
      yAxis={{
        show: true,
        title: 'Weekly active users (thousands)',
        labelFormatter: (value) => `${value}k`,
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'inside',
        formatter: ({ value }) => `${value}k`,
        color: 'rgba(255,255,255,0.96)',
        fontWeight: '600',
        minBarHeightForInside: 24,
      }}
      animation={{ duration: 420 }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'web',
    name: 'Web',
    data: [
      { id: 'dashboard-web', category: 'Dashboard', value: 82 },
      { id: 'automation-web', category: 'Workflow automation', value: 68 },
      { id: 'notifications-web', category: 'Notifications', value: 74 },
      { id: 'reporting-web', category: 'Reporting', value: 59 },
      { id: 'integrations-web', category: 'Integrations', value: 65 },
    ],
  },
  {
    id: 'ios',
    name: 'iOS',
    data: [
      { id: 'dashboard-ios', category: 'Dashboard', value: 61 },
      { id: 'automation-ios', category: 'Workflow automation', value: 52 },
      { id: 'notifications-ios', category: 'Notifications', value: 78 },
      { id: 'reporting-ios', category: 'Reporting', value: 46 },
      { id: 'integrations-ios', category: 'Integrations', value: 54 },
    ],
  },
  {
    id: 'android',
    name: 'Android',
    data: [
      { id: 'dashboard-android', category: 'Dashboard', value: 57 },
      { id: 'automation-android', category: 'Workflow automation', value: 63 },
      { id: 'notifications-android', category: 'Notifications', value: 85 },
      { id: 'reporting-android', category: 'Reporting', value: 51 },
      { id: 'integrations-android', category: 'Integrations', value: 49 },
    ],
  },
];
```

### Sales Pipeline By Industry

```tsx
import { GroupedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="Sales pipeline by industry"
      subtitle="Qualified pipeline this quarter (USD millions)"
      h={360}
      series={SERIES}
      barSpacing={0.2}
      innerBarSpacing={0.22}
      xAxis={{
        show: true,
        title: 'Industry vertical',
      }}
      yAxis={{
        show: true,
        title: 'Pipeline value (USD millions)',
        labelFormatter: (value) => `$${value.toFixed(1)}M`,
        ticks: [0, 2, 4, 6],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'outside',
        formatter: ({ value }) => `$${value.toFixed(1)}M`,
        color: '#2F2F35',
        fontWeight: '600',
        offset: 10,
      }}
      animation={{ duration: 440 }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'new-business',
    name: 'New business',
    data: [
      { id: 'tech-new', category: 'Technology', value: 5.8 },
      { id: 'health-new', category: 'Healthcare', value: 4.1 },
      { id: 'finance-new', category: 'Financial services', value: 4.7 },
      { id: 'retail-new', category: 'Retail', value: 3.9 },
      { id: 'manufacturing-new', category: 'Manufacturing', value: 3.1 },
    ],
  },
  {
    id: 'expansion',
    name: 'Upsell / expansion',
    data: [
      { id: 'tech-expansion', category: 'Technology', value: 4.6 },
      { id: 'health-expansion', category: 'Healthcare', value: 3.4 },
      { id: 'finance-expansion', category: 'Financial services', value: 5.2 },
      { id: 'retail-expansion', category: 'Retail', value: 2.7 },
      { id: 'manufacturing-expansion', category: 'Manufacturing', value: 2.2 },
    ],
  },
];
```

### Student Assessment By Grade

```tsx
import { GroupedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="Assessment results by grade level"
      subtitle="Spring benchmark proficiency rates"
      h={360}
      series={SERIES}
      barSpacing={0.18}
      innerBarSpacing={0.18}
      xAxis={{
        show: true,
        title: 'Subject area',
      }}
      yAxis={{
        show: true,
        title: 'Students meeting or exceeding standard (%)',
        labelFormatter: (value) => `${value}%`,
        ticks: [60, 70, 80, 90, 100],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'inside',
        formatter: ({ value }) => `${Math.round(value)}%`,
        color: 'rgba(255,255,255,0.94)',
        fontWeight: '600',
        minBarHeightForInside: 20,
      }}
      animation={{ duration: 430 }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'grade-3',
    name: 'Grade 3',
    data: [
      { id: 'g3-math', category: 'Mathematics', value: 78 },
      { id: 'g3-science', category: 'Science', value: 81 },
      { id: 'g3-language', category: 'Language arts', value: 74 },
      { id: 'g3-social', category: 'Social studies', value: 69 },
      { id: 'g3-stem', category: 'STEM lab', value: 76 },
    ],
  },
  {
    id: 'grade-4',
    name: 'Grade 4',
    data: [
      { id: 'g4-math', category: 'Mathematics', value: 84 },
      { id: 'g4-science', category: 'Science', value: 86 },
      { id: 'g4-language', category: 'Language arts', value: 81 },
      { id: 'g4-social', category: 'Social studies', value: 77 },
      { id: 'g4-stem', category: 'STEM lab', value: 83 },
    ],
  },
  {
    id: 'grade-5',
    name: 'Grade 5',
    data: [
      { id: 'g5-math', category: 'Mathematics', value: 89 },
      { id: 'g5-science', category: 'Science', value: 91 },
      { id: 'g5-language', category: 'Language arts', value: 86 },
      { id: 'g5-social', category: 'Social studies', value: 83 },
      { id: 'g5-stem', category: 'STEM lab', value: 88 },
    ],
  },
];
```

### Supplier On Time By Partner

```tsx
import { GroupedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <GroupedBarChart
      title="On-time delivery by logistics partner"
      subtitle="Share of shipments delivered within committed window"
      h={360}
      series={SERIES}
      barSpacing={0.18}
      innerBarSpacing={0.16}
      xAxis={{
        show: true,
        title: 'Logistics partner',
      }}
      yAxis={{
        show: true,
        title: 'On-time shipments (%)',
        labelFormatter: (value) => `${value}%`,
        ticks: [80, 85, 90, 95, 100],
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'inside',
        formatter: ({ value }) => `${Math.round(value)}%`,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
        minBarHeightForInside: 22,
      }}
      animation={{ duration: 440 }}
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'tier-1',
    name: 'Tier 1 suppliers',
    data: [
      { id: 'tier1-apex', category: 'Apex Logistics', value: 97 },
      { id: 'tier1-northstar', category: 'NorthStar Freight', value: 95 },
      { id: 'tier1-coastal', category: 'Coastal Courier', value: 93 },
      { id: 'tier1-summit', category: 'Summit Express', value: 96 },
    ],
  },
  {
    id: 'tier-2',
    name: 'Tier 2 suppliers',
    data: [
      { id: 'tier2-apex', category: 'Apex Logistics', value: 93 },
      { id: 'tier2-northstar', category: 'NorthStar Freight', value: 90 },
      { id: 'tier2-coastal', category: 'Coastal Courier', value: 88 },
      { id: 'tier2-summit', category: 'Summit Express', value: 91 },
    ],
  },
  {
    id: 'new-suppliers',
    name: 'New suppliers',
    data: [
      { id: 'new-apex', category: 'Apex Logistics', value: 88 },
      { id: 'new-northstar', category: 'NorthStar Freight', value: 85 },
      { id: 'new-coastal', category: 'Coastal Courier', value: 82 },
      { id: 'new-summit', category: 'Summit Express', value: 86 },
    ],
  },
];
```
