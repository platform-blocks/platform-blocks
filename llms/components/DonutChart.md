# Donut Chart

Circular proportional chart with a hollow center (variant of pie chart).

## Metadata

- Canonical name: `DonutChart`
- Package: `@platform-blocks/charts`
- Import: `import { DonutChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, donut, circular
- Docs: https://react-ui-library.com/components/DonutChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/DonutChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | DonutChartDataPoint[] | No |  | Data points rendered in the donut |
| `rings` | DonutChartRing[] | No |  | Optional multi-ring configuration. When provided, the top-level data acts as a fallback |
| `size` | number | No | 280 | Convenience size that sets both width and height when explicit values are omitted |
| `innerRadiusRatio` | number | No | 0.55 | Ratio (0-1) of the inner radius relative to the outer radius when thickness is not provided |
| `thickness` | number | No |  | Explicit ring thickness override (outerRadius - innerRadius) |
| `ringGap` | number | No |  | Gap in chart units between concentric rings (defaults to 8 for multi-ring charts) |
| `padAngle` | number | No | 1.5 | Padding between slices in degrees |
| `startAngle` | number | No | -90 | Starting angle for the first slice (degrees) |
| `endAngle` | number | No | 270 | Ending angle for the last slice (degrees) |
| `primaryRingIndex` | number | No | 0 | Index of the ring used for center totals and value formatting (defaults to 0) |
| `legendRingIndex` | number | No |  | Index of the ring whose slices feed the legend (defaults to primaryRingIndex) |
| `inheritColorByLabel` | boolean | No | true | When true, slices across rings reuse colors based on their label/id |
| `legend` | ChartLegend | No |  | Legend configuration |
| `tooltip` | ChartTooltip<DonutChartDataPoint> | No |  | Tooltip configuration |
| `animation` | ChartAnimation | No |  | Animation configuration |
| `centerLabel` | string \| DonutCenterLabelFormatter | No |  | Primary label rendered in the center (string or formatter) |
| `centerSubLabel` | string \| DonutCenterLabelFormatter | No |  | Secondary label rendered beneath the primary center label |
| `centerValueFormatter` | DonutCenterValueFormatter | No |  | Formatter for the numerical value shown in the center |
| `renderCenterContent` | DonutChartCenterRenderer | No |  | Custom renderer for the center content. When provided, overrides default labels |
| `emptyLabel` | string | No | 'No data' | Label displayed when no data is provided |
| `padding` | { top: number; right: number; bottom: number; left: number } | No |  | Optional padding override for the chart container |
| `isolateOnClick` | boolean | No | false | When true, clicking a slice isolates it (toggles other slices off) and another click restores |
| `labels` | DonutChartLabelsConfig | No |  | Global label rendering configuration |
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

### Annual Expense Allocation
ID: `DonutChart.annual-expense-allocation` • Category: charts

```tsx
const formatBudget = (value: number) => `$${Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}M`;
  return (
    <DonutChart
      title="Annual Expense Allocation"
      subtitle="FY26 operating plan"
      size={300}
      data={DEPARTMENT_ALLOCATIONS}
      padAngle={1.8}
      legend={{ position: 'bottom' }}
      centerLabel={() => 'Budget'}
      centerSubLabel={() => 'Allocation by function'}
      centerValueFormatter={(value) => formatBudget(value)}
    />
  );
}
```

### Basic
ID: `DonutChart.basic` • Category: charts

```tsx
return (
		<DonutChart
			title="Team allocation"
			size={260}
			data={SEGMENTS}
		/>
	);
}
```

### Customer Segment Growth
ID: `DonutChart.customer-segment-growth` • Category: charts

```tsx
const formatMillions = (value: number) => `${Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}M`;
const getRingId = (slice?: DonutChartDataPoint | null) => (slice as any)?.ringId as string | undefined;
  return (
    <DonutChart
      title="ARR Mix by Segment"
      subtitle="FY26 to date"
      size={320}
      ringGap={16}
      rings={[
        {
          id: 'arr',
          label: 'Annual Recurring Revenue',
          data: ARR_SEGMENTS,
          padAngle: 1.8,
          showInLegend: true,
        },
        {
          id: 'growth',
          label: 'YoY Growth Contribution',
          data: GROWTH_CONTRIBUTION,
          thicknessRatio: 0.16,
          padAngle: 1.2,
          showInLegend: false,
        },
      ]}
      primaryRingIndex={0}
      legendRingIndex={0}
      centerLabel={(total, _data, focused) => {
        if (focused) {
          return focused.label;
        }
        return 'Total ARR';
      }}
      centerSubLabel={(total, _data, focused) => {
        if (!focused) return 'YoY growth vs. FY25';
        return getRingId(focused) === 'growth' ? 'Growth contribution' : 'Segment share';
      }}
      centerValueFormatter={(value, _total, focused) => {
        if (focused && getRingId(focused) === 'growth') {
          return `${value.toFixed(0)}%`;
        }
        return `$${formatMillions(value)}`;
      }}
      legend={{ position: 'bottom' }}
    />
  );
}
```

### Data Center Power
ID: `DonutChart.data-center-power` • Category: charts

```tsx
const formatMegawatts = (value: number) => `${value.toFixed(1)} MW`;
  return (
    <DonutChart
      title="Data Center Power Draw"
      subtitle="May 2025 peak load"
      size={320}
      data={POWER_BY_SUBSYSTEM}
      padAngle={2}
      legend={{ position: 'right', align: 'start' }}
      padding={{ top: 140, right: 168, bottom: 72, left: 72 }}
      centerLabel={() => 'Power load'}
      centerSubLabel={() => 'Across campus subsystems'}
      centerValueFormatter={(value) => formatMegawatts(value)}
      labels={{
        show: true,
        position: 'outside',
        showPercentage: true,
        showValue: true,
        valueFormatter: ({ value }) => formatMegawatts(value),
        leaderLine: { width: 1.5 },
      }}
    />
  );
}
```

### Employee Geography Workstyle
ID: `DonutChart.employee-geography-workstyle` • Category: charts

```tsx
const formatHeadcount = (value: number) => Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
  return (
    <DonutChart
      title="Employee Distribution"
      subtitle="Geography and work style"
      size={320}
      ringGap={18}
      rings={[
        {
          id: 'region',
          label: 'Regional distribution',
          data: REGION_HEADCOUNT,
          padAngle: 2.2,
          thicknessRatio: 0.3,
          showInLegend: false,
        },
        {
          id: 'work-style',
          label: 'Work style mix',
          data: WORK_STYLE,
          thicknessRatio: 0.18,
          padAngle: 1.5,
          showInLegend: true,
        },
      ]}
      primaryRingIndex={0}
      legendRingIndex={1}
      renderCenterContent={({ focusedSlice, primaryRing, total }) => {
        const isWorkStyle = focusedSlice?.ringId === 'work-style';
        const headline = focusedSlice ? focusedSlice.label : 'Headcount';
        const valueText = focusedSlice
          ? isWorkStyle
            ? `${Math.round((focusedSlice.percentage || 0) * 100)}%`
            : formatHeadcount(focusedSlice.value)
          : formatHeadcount(primaryRing?.total ?? total);
        const helperText = focusedSlice
          ? isWorkStyle
            ? 'of workforce'
            : 'global headcount'
          : `Remote ${Math.round(remoteRatio * 100)}%`;
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                textTransform: 'uppercase',
                color: '#868E96',
                marginBottom: 2,
              }}
            >
              {headline}
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '700',
                color: '#212529',
              }}
            >
              {valueText}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#495057',
                marginTop: 4,
              }}
            >
              {helperText}
            </Text>
          </View>
        );
      }}
      labels={{
        show: true,
        rings: ['work-style'],
        position: 'outside',
        showPercentage: true,
        leaderLine: { width: 1.4 },
      }}
      legend={{ position: 'bottom' }}
    />
  );
}
```

### Marketplace Fulfillment Mix
ID: `DonutChart.marketplace-fulfillment-mix` • Category: charts

```tsx
const formatOrders = (value: number) => `${value.toFixed(2)}M`;
  return (
    <DonutChart
      title="Marketplace Fulfillment Mix"
      subtitle="Orders fulfilled in Q3"
      size={300}
      data={FULFILLMENT_PARTNERS}
      padAngle={1.6}
      isolateOnClick
      legend={{ position: 'bottom' }}
      centerLabel={() => 'Orders'}
      centerSubLabel={() => 'Fulfilled volume by partner'}
      centerValueFormatter={(value) => `${formatOrders(value)} total`}
    />
  );
}
```
