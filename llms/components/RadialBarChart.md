# Radial Bar Chart

Circular bar segments representing values radially.

## Metadata

- Canonical name: `RadialBarChart`
- Package: `@platform-blocks/charts`
- Import: `import { RadialBarChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, radial, bar
- Docs: https://react-ui-library.com/components/RadialBarChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/RadialBarChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | RadialBarDatum[] | Yes |  | Radial bar data to render |
| `radius` | number | No |  | Radius of outer ring (auto if not provided) |
| `barThickness` | number | No | 14 | Thickness of each arc |
| `gap` | number | No | 8 | Gap (px) between concentric bars |
| `startAngle` | number | No | -90 | Start angle in degrees (default -90 = top) |
| `endAngle` | number | No | 270 | End angle in degrees (default 270 for full circle) |
| `showValueLabels` | boolean | No | true | Show value labels at the tip of each arc |
| `valueFormatter` | (value: number, datum: RadialBarDatum, index: number) => string | No |  | Format value for label |
| `centerLabel` | string | No |  | Primary text rendered in the empty center (e.g. an aggregate value) |
| `centerSubLabel` | string | No |  | Secondary text rendered beneath the center label |
| `multiTooltip` | boolean | No | true | Enable aggregated tooltip across arcs |
| `liveTooltip` | boolean | No | true | Keep tooltip following the pointer |
| `enableCrosshair` | boolean | No | false | Highlight the hovered ring (dim the others) on pointer interaction. Default false. |
| `legend` | ChartLegend | No |  | Legend configuration |
| `tooltip` | ChartTooltip<RadialBarDatum> | No |  | Tooltip configuration |
| `width` | number | No | 240 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 240 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
| `animationDuration` | number | No | 800 | Animation duration in ms |
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

### Multi-Metric KPIs
ID: `RadialBarChart.basic` • Category: charts

Concentric rings compare progress across several metrics, with tip labels and a center average.

```tsx
return (
		<RadialBarChart
			title="Quarterly KPIs"
			subtitle="Progress toward goals"
			maxWidth={400}
			height={400}
			data={METRICS}
			barThickness={18}
			gap={12}
			showValueLabels
			valueFormatter={(value) => `${value}%`}
			centerLabel={`${AVG}%`}
			centerSubLabel="Avg score"
			multiTooltip
			liveTooltip
			legend={{ show: true, position: 'bottom' }}
		/>
	);
}
```

### Goal Progress Ring
ID: `RadialBarChart.goal-progress` • Category: charts

A single thick ring with a center readout — ideal for one headline metric.

```tsx
return (
		<RadialBarChart
			title="Fundraising Goal"
			subtitle="$74k raised of $100k"
			maxWidth={300}
			height={300}
			data={GOAL}
			barThickness={24}
			showValueLabels={false}
			centerLabel="74%"
			centerSubLabel="of goal"
			multiTooltip
			liveTooltip
		/>
	);
}
```

### Semicircle Gauge
ID: `RadialBarChart.satisfaction-gauge` • Category: charts

Set startAngle/endAngle to a 180° sweep for a speedometer-style gauge that fills the space.

```tsx
return (
		<RadialBarChart
			title="Customer Satisfaction"
			subtitle="Rolling 30-day CSAT"
			maxWidth={340}
			height={240}
			startAngle={-90}
			endAngle={90}
			data={SCORE}
			barThickness={24}
			showValueLabels={false}
			centerLabel="82"
			centerSubLabel="out of 100"
			multiTooltip
			liveTooltip
		/>
	);
}
```
