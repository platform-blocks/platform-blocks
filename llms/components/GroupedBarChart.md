# Grouped Bar Chart

Bar chart grouping multiple series side-by-side for comparison.

## Metadata

- Canonical name: `GroupedBarChart`
- Package: `@platform-blocks/charts`
- Import: `import { GroupedBarChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, bar, grouped
- Docs: https://react-ui-library.com/components/GroupedBarChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/GroupedBarChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `series` | StackedBarSeries[] | Yes |  | Grouped series data to render |
| `barSpacing` | number | No | 0.2 | Gap between grouped categories |
| `innerBarSpacing` | number | No | 0.1 | Gap between bars inside a group |
| `legend` | ChartLegend | No | { show: true, position: 'bottom', align: 'center' } | Legend configuration |
| `xAxis` | ChartAxis | No |  | X-axis configuration |
| `yAxis` | ChartAxis | No |  | Y-axis configuration |
| `grid` | ChartGrid | No |  | Grid line configuration |
| `animation` | ChartAnimation | No |  | Animation configuration |
| `colorOptions` | GroupedBarColorOptions | No |  | Palette and hashing options for bar colors |
| `valueLabels` | GroupedBarValueLabelConfig | No |  | Optional bar value label configuration |
| `multiTooltip` | boolean | No |  | Enable multi-series aggregated tooltip content |
| `liveTooltip` | boolean | No |  | Keep tooltip visible while pointer moves within chart |
| `enableCrosshair` | boolean | No |  | Toggle crosshair overlay and events (defaults to enabled) |
| `width` | number | No | 400 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 300 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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

### Basic
ID: `GroupedBarChart.basic` • Category: charts

```tsx
return (
		<GroupedBarChart
			title="Product revenue by segment"
			subtitle="Comparison vs targets"
			height={320}
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

### Experiment Variant By Geo
ID: `GroupedBarChart.experiment-variant-by-geo` • Category: charts

```tsx
return (
    <GroupedBarChart
      title="Experiment conversion uplift by region"
      subtitle="Completed purchases per 100 sessions"
      height={340}
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

### Feature Usage By Platform
ID: `GroupedBarChart.feature-usage-by-platform` • Category: charts

```tsx
return (
    <GroupedBarChart
      title="Feature usage by platform"
      subtitle="Weekly active users per capability (in thousands)"
      height={360}
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

### Sales Pipeline By Industry
ID: `GroupedBarChart.sales-pipeline-by-industry` • Category: charts

```tsx
return (
    <GroupedBarChart
      title="Sales pipeline by industry"
      subtitle="Qualified pipeline this quarter (USD millions)"
      height={360}
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

### Student Assessment By Grade
ID: `GroupedBarChart.student-assessment-by-grade` • Category: charts

```tsx
return (
    <GroupedBarChart
      title="Assessment results by grade level"
      subtitle="Spring benchmark proficiency rates"
      height={360}
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

### Supplier On Time By Partner
ID: `GroupedBarChart.supplier-on-time-by-partner` • Category: charts

```tsx
return (
    <GroupedBarChart
      title="On-time delivery by logistics partner"
      subtitle="Share of shipments delivered within committed window"
      height={360}
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
