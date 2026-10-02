# Stacked Bar Chart

Bar chart with segments stacked to show part-to-whole by category.

## Metadata

- Import: `import { StackedBarChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, bar, stacked
- Docs: https://plocks.dev/charts/StackedBarChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/StackedBarChart

## Props

- `series` (required): StackedBarSeries[] — Stacked bar series to render
- `barSpacing`: number = 0.25 — Gap between stacked groups
- `legend`: ChartLegend = { show: true, position: 'bottom', align: 'center' } — Legend configuration
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid line configuration
- `animation`: ChartAnimation — Animation configuration

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface StackedBarSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Data points contained in the series */
  data: BarChartDataPoint[];
  /** Base color applied to the series */
  color?: string;
  /** Whether the series is visible */
  visible?: boolean;
}
```

## Examples

### Basics

Bar chart with segments stacked to show part-to-whole by category.

```tsx
import { StackedBarChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
	return (
		<StackedBarChart
			title="Quarterly ARR by motion"
			h={320}
			series={SERIES}
			barSpacing={0.25}
			xAxis={{ show: true, title: 'Quarter' }}
			yAxis={{
				show: true,
				title: 'ARR (USD thousands)',
				labelFormatter: (value) => `$${value}`,
			}}
			grid={{ show: true }}
			legend={{ show: true, position: 'bottom' }}
			animation={{ duration: 500 }}
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
			{ id: 'q1-new', category: 'Q1', value: 220 },
			{ id: 'q2-new', category: 'Q2', value: 250 },
			{ id: 'q3-new', category: 'Q3', value: 240 },
			{ id: 'q4-new', category: 'Q4', value: 280 },
		],
	},
	{
		id: 'expansion',
		name: 'Expansion',
		data: [
			{ id: 'q1-exp', category: 'Q1', value: 110 },
			{ id: 'q2-exp', category: 'Q2', value: 135 },
			{ id: 'q3-exp', category: 'Q3', value: 150 },
			{ id: 'q4-exp', category: 'Q4', value: 165 },
		],
	},
	{
		id: 'renewal',
		name: 'Renewal',
		data: [
			{ id: 'q1-renew', category: 'Q1', value: 180 },
			{ id: 'q2-renew', category: 'Q2', value: 172 },
			{ id: 'q3-renew', category: 'Q3', value: 188 },
			{ id: 'q4-renew', category: 'Q4', value: 194 },
		],
	},
];
```
