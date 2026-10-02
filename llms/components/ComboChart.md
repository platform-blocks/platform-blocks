# Combo Chart

Combines multiple chart types (e.g., bars and line) for richer comparison.

## Metadata

- Import: `import { ComboChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, combo, mixed
- Docs: https://plocks.dev/charts/ComboChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/ComboChart

## Props

- `layers` (required): ComboChartLayer[] — Ordered set of layers to render in the combo chart
- `enableCrosshair`: boolean = true — Enable crosshair indicator across layers
- `multiTooltip`: boolean = true — Enable multi-series tooltip aggregation
- `liveTooltip`: boolean = true — Follow pointer live with tooltip
- `xDomain`: [number, number] — Explicit override for the shared x-domain
- `yDomain`: [number, number] — Explicit override for the primary y-domain
- `yDomainRight`: [number, number] — Explicit override for the secondary y-domain
- `xAxis`: ChartAxis — Axis configuration for the shared x-axis
- `yAxis`: ChartAxis — Axis configuration for the primary y-axis
- `yAxisRight`: ChartAxis — Axis configuration for the secondary y-axis
- `grid`: ChartGrid — Grid line configuration
- `legend`: ChartLegend — Legend display options

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Combines multiple chart types (e.g., bars and line) for richer comparison.

```tsx
import { ComboChart } from '@plocks/charts';

import { LAYERS } from './data';

export function Demo() {
	return (
		<ComboChart
			title="Revenue vs. active users"
			subtitle="First half of FY25"
			h={340}
			layers={LAYERS}
			enableCrosshair
			multiTooltip
			liveTooltip
			xAxis={{
				show: true,
				title: 'Month',
				labelFormatter: (value) => `M${value}`,
			}}
			yAxis={{
				show: true,
				title: 'Revenue (USD thousands)',
				labelFormatter: (value) => `$${value}`,
			}}
			yAxisRight={{
				show: true,
				title: 'Active users (thousands)',
				labelFormatter: (value) => `${value}k`,
			}}
			yDomain={[0, 650]}
			yDomainRight={[80, 200]}
			grid={{ show: true, style: 'dashed' }}
			legend={{ show: true, position: 'bottom' }}
		/>
	);
}
```

`data.ts`

```ts
export const LAYERS = [
	{
		type: 'bar' as const,
		id: 'revenue',
		name: 'Monthly revenue',
		data: [
			{ x: 1, y: 420 },
			{ x: 2, y: 455 },
			{ x: 3, y: 508 },
			{ x: 4, y: 480 },
			{ x: 5, y: 532 },
			{ x: 6, y: 575 },
		],
		opacity: 0.85,
	},
	{
		type: 'line' as const,
		id: 'active-users',
		name: 'Active users',
		targetAxis: 'right' as const,
		data: [
			{ x: 1, y: 110 },
			{ x: 2, y: 134 },
			{ x: 3, y: 149 },
			{ x: 4, y: 158 },
			{ x: 5, y: 166 },
			{ x: 6, y: 172 },
		],
		thickness: 3,
		showPoints: true,
		pointSize: 6,
	},
];
```
