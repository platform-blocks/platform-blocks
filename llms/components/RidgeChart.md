# Ridge Chart

Layered density plots (joyplot) comparing distributions across categories.

## Metadata

- Canonical name: `RidgeChart`
- Package: `@platform-blocks/charts`
- Import: `import { RidgeChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, ridge, density
- Docs: https://react-ui-library.com/components/RidgeChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/RidgeChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `series` | DensitySeries[] | Yes |  | Density series rendered in the ridge chart |
| `samples` | number | No |  | Density sample resolution |
| `bandwidth` | number | No |  | Kernel bandwidth override |
| `bandPadding` | number | No |  | Fractional padding between ridge bands (0 - 0.8) |
| `amplitudeScale` | number | No |  | Amplitude scaling applied to each ridge (0.1 - 1) |
| `xAxis` | ChartAxis | No |  | X-axis configuration |
| `yAxis` | ChartAxis | No |  | Y-axis configuration |
| `grid` | ChartGrid | No |  | Grid line configuration |
| `statsMarkers` | RidgeStatsMarkersConfig | No |  | Optional statistic marker configuration |
| `width` | number | No |  | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No |  | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
| `disabled` | boolean | No |  | Whether chart is disabled |
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

## Examples

### Api Latency Endpoints
ID: `RidgeChart.api-latency-endpoints` • Category: charts

```tsx
return (
    <RidgeChart
      title="API latency distribution by endpoint"
      subtitle="Density of response times across rolling deployments"
      height={450}
      series={SERIES}
      samples={128}
      bandwidth={16}
      bandPadding={0.24}
      amplitudeScale={0.92}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Latency (ms)',
        labelFormatter: (value) => formatLatency(value as number),
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

### Basic
ID: `RidgeChart.basic` • Category: charts

```tsx
return (
		<RidgeChart
			title="Customer satisfaction distribution"
			subtitle="Annual NPS density"
			height={360}
			series={SERIES}
			samples={96}
			bandwidth={3}
			statsMarkers={{ enabled: true, showP90: true, showLabels: true }}
		/>
	);
}
```

### Daily Active Users Cohorts
ID: `RidgeChart.daily-active-users-cohorts` • Category: charts

```tsx
return (
    <RidgeChart
      title="Daily active users across feature cohorts"
      subtitle="Distribution of session counts over the last six months"
      height={480}
      series={SERIES}
      samples={128}
      bandwidth={18}
      bandPadding={0.32}
      amplitudeScale={0.95}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Daily active users',
        labelFormatter: (value) => formatThousands.format(Math.round(value as number)),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

### Employee Satisfaction Survey
ID: `RidgeChart.employee-satisfaction-survey` • Category: charts

```tsx
return (
    <RidgeChart
      title="Employee satisfaction score distribution"
      subtitle="Quarterly pulse survey responses by team"
      height={420}
      series={SERIES}
      samples={110}
      bandwidth={0.35}
      bandPadding={0.3}
      amplitudeScale={0.85}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Satisfaction score (1-5)',
        labelFormatter: (value) => (value as number).toFixed(1),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

### Revenue Transaction Density
ID: `RidgeChart.revenue-transaction-density` • Category: charts

```tsx
return (
    <RidgeChart
      title="Revenue per transaction by product line"
      subtitle="Transaction value distributions across seasonal cycles"
      height={440}
      series={SERIES}
      samples={128}
      bandwidth={14}
      bandPadding={0.28}
      amplitudeScale={0.9}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Revenue per transaction',
        labelFormatter: (value) => currencyFormatter.format(value as number),
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```

### Shipping Time Carriers
ID: `RidgeChart.shipping-time-carriers` • Category: charts

```tsx
return (
    <RidgeChart
      title="Shipping time distribution by carrier"
      subtitle="Parcel delivery performance across recent quarters"
      height={420}
      series={SERIES}
      samples={110}
      bandwidth={0.45}
      bandPadding={0.3}
      amplitudeScale={0.9}
      grid={{ show: true, showMinor: false }}
      xAxis={{
        show: true,
        title: 'Delivery time (days)',
        labelFormatter: (value) => formatDays(value as number),
        tickLength: 6,
      }}
      yAxis={{
        show: true,
        tickLength: 6,
      }}
    />
  );
}
```
