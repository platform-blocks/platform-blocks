# Combo Chart

Combines multiple chart types (e.g., bars and line) for richer comparison.

## Metadata

- Canonical name: `ComboChart`
- Package: `@platform-blocks/charts`
- Import: `import { ComboChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, combo, mixed
- Docs: https://react-ui-library.com/components/ComboChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/ComboChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `layers` | ComboChartLayer[] | Yes |  | Ordered set of layers to render in the combo chart |
| `enableCrosshair` | boolean | No | true | Enable crosshair indicator across layers |
| `multiTooltip` | boolean | No | true | Enable multi-series tooltip aggregation |
| `liveTooltip` | boolean | No | true | Follow pointer live with tooltip |
| `xDomain` | [number, number] | No |  | Explicit override for the shared x-domain |
| `yDomain` | [number, number] | No |  | Explicit override for the primary y-domain |
| `yDomainRight` | [number, number] | No |  | Explicit override for the secondary y-domain |
| `xAxis` | ChartAxis | No |  | Axis configuration for the shared x-axis |
| `yAxis` | ChartAxis | No |  | Axis configuration for the primary y-axis |
| `yAxisRight` | ChartAxis | No |  | Axis configuration for the secondary y-axis |
| `grid` | ChartGrid | No |  | Grid line configuration |
| `legend` | ChartLegend | No |  | Legend display options |
| `width` | number | No | 520 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 320 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
| `aspectRatio` | number | No |  | Height as a fraction of the resolved width (`width / height`), used when `height` is omitted. `2` keeps the chart twice as wide as it is tall at every container size. |
| `maxWidth` | number | No |  | Upper bound on the resolved width. Useful for radial charts in wide columns. |
| `minWidth` | number | No |  | Lower bound on the resolved width. |
| `maxHeight` | number | No |  | Upper bound on a height derived from `aspectRatio`. |
| `minHeight` | number | No |  | Lower bound on a height derived from `aspectRatio`. |
| `testID` | string | No |  | Chart test ID for testing |
| `style` | any | No |  | Additional styles |
| `accessibilityLabel` | string | No |  | Accessibility label surfaced to assistive tech |
| `accessibilityHint` | string | No |  | Accessibility hint describing chart interaction |
| `accessibilityRole` | string | No |  | Accessibility role override |
| `accessible` | boolean | No |  | Whether the chart container is accessible |
| `importantForAccessibility` | 'auto' \| 'yes' \| 'no' \| 'no-hide-descendants' | No |  | Platform specific accessibility importance |
| `animationDuration` | number | No |  | Animation duration in ms |
| `animationEasing` | string | No |  | Animation easing function |
| `disabled` | boolean | No | false | Whether chart is disabled |
| `title` | string | No |  | Chart title |
| `subtitle` | string | No |  | Chart subtitle |
| `useOwnInteractionProvider` | boolean | No |  | If false, chart expects a parent interaction provider (shared context). |
| `suppressPopover` | boolean | No |  | Force suppress or show internal popover (auto suppressed when useOwnInteractionProvider=false if undefined). |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `onPress` | (event: ChartInteractionEvent<TData>) => void | No |  | Called when chart is tapped/clicked |
| `onDataPointPress` | (dataPoint: TData, event: ChartInteractionEvent<TData>) => void | No |  | Called when data point is selected |

## Examples

### Basic
ID: `ComboChart.basic` • Category: charts

```tsx
return (
		<ComboChart
			title="Revenue vs. active users"
			subtitle="First half of FY25"
			height={340}
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
