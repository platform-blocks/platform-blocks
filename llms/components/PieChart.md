# Pie Chart

Proportional slice chart for categorical part-to-whole representation.

## Metadata

- Canonical name: `PieChart`
- Package: `@platform-blocks/charts`
- Import: `import { PieChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, pie, categorical
- Docs: https://react-ui-library.com/components/PieChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/PieChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | PieChartDataPoint[] | Yes |  | Data points |
| `innerRadius` | number | No |  | Inner radius (for donut chart) |
| `outerRadius` | number | No |  | Outer radius |
| `startAngle` | number | No |  | Start angle in degrees |
| `endAngle` | number | No |  | End angle in degrees |
| `padAngle` | number | No |  | Padding between slices |
| `showLabels` | boolean | No |  | Show labels |
| `labelPosition` | 'inside' \| 'outside' \| 'center' | No |  | Label position |
| `labelStrategy` | 'auto' \| 'inside' \| 'outside' \| 'center' | No |  | Automatically choose label placement |
| `labelAutoSwitchAngle` | number | No |  | Minimum slice angle (deg) to keep label inside when strategy is auto |
| `wrapLabels` | boolean | No |  | Automatically wrap labels that exceed width |
| `labelMaxCharsPerLine` | number | No |  | Maximum characters per label line when wrapping |
| `labelMaxLines` | number | No |  | Maximum number of lines when wrapping |
| `showLeaderLines` | boolean | No |  | Render leader lines for outside labels |
| `leaderLineColor` | string | No |  | Leader line stroke color |
| `leaderLineWidth` | number | No |  | Leader line stroke width |
| `labelTextStyle` | PieChartLabelTextStyle | No |  | Style overrides applied to rendered labels |
| `labelFormatter` | (dataPoint: PieChartDataPoint) => string | No |  | Label formatter |
| `showValues` | boolean | No |  | Show values |
| `valueFormatter` | (value: number, total: number) => string | No |  | Value formatter |
| `legend` | ChartLegend | No |  | Legend configuration |
| `tooltip` | ChartTooltip<PieChartDataPoint> | No |  | Tooltip configuration |
| `animation` | ChartAnimation | No |  | Animation configuration |
| `highlightOnHover` | boolean | No |  | Enable hover highlighting |
| `onSliceHover` | (slice: PieChartDataPoint \| null) => void | No |  | Callback when hover target changes |
| `defaultSliceStyle` | PieChartSliceStyle | No |  | Default style applied to slices |
| `layers` | PieChartLayer[] | No |  | Additional rings rendered around the base series |
| `legendToggleEnabled` | boolean | No |  | Allow toggling slice visibility from the legend |
| `keyboardNavigation` | boolean | No |  | Enable keyboard navigation between slices |
| `ariaLabelFormatter` | (slice: PieChartDataPoint, percentage: number) => string | No |  | Accessible label formatter |
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
| `onPress` | (event: ChartInteractionEvent<TData>) => void | No |  | Called when chart is tapped/clicked |
| `onDataPointPress` | (dataPoint: TData, event: ChartInteractionEvent<TData>) => void | No |  | Called when data point is selected |

## Examples

### Basic
ID: `PieChart.basic` • Category: charts

```tsx
return (
    <PieChart
      title="Traffic sources"
      maxWidth={560}
      height={360}
      data={TRAFFIC_SOURCES}
      innerRadius={70}
      outerRadius={150}
      showLabels={true}
      labelPosition="outside"
      showValues={true}
      valueFormatter={(value) => `${value}%`}
      legend={{ show: true, position: 'right' }}
      tooltip={{
        show: true,
        formatter: (segment) => `${segment.label}: ${segment.value}%`,
      }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

### Browser Usage Share
ID: `PieChart.browser-usage-share` • Category: charts

```tsx
const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${slice.value}%`;
const formatTooltip = (slice: PieChartDataPoint) => `${slice.label}: ${slice.value}% of sessions`;
  return (
    <PieChart
      title="Browser usage share"
      subtitle="Active sessions"
      maxWidth={520}
      height={420}
      data={BROWSER_USAGE}
      outerRadius={150}
      showLabels
      labelPosition="outside"
      padAngle={1.5}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'spiral', duration: 900 }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

### Bug Type Distribution
ID: `PieChart.bug-type-distribution` • Category: charts

```tsx
const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${slice.value}%`;
const formatTooltip = (slice: PieChartDataPoint) => `${slice.label}: ${slice.value}% of release defects`;
  return (
    <PieChart
      title="Bug type distribution"
      subtitle="Latest release cycle"
      maxWidth={560}
      height={380}
      data={BUG_TYPES}
      innerRadius={70}
      outerRadius={150}
      showLabels
      labelPosition="center"
      labelFormatter={formatLabel}
      padAngle={1}
      legend={{ show: true, position: 'right' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'bounce', duration: 800, stagger: 80 }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

### Operating Expense Composition
ID: `PieChart.operating-expense-composition` • Category: charts

```tsx
const formatTooltip = (slice: PieChartDataPoint) => {
  const share = Math.round((slice.value / TOTAL_EXPENSE) * 100);
  return `${slice.label}: $${slice.value}M (${share}%)`;
};
  return (
    <PieChart
      title="Operating expense mix"
      subtitle="FY25 year-to-date"
      maxWidth={520}
      height={440}
      data={OPERATING_EXPENSES}
      innerRadius={90}
      outerRadius={160}
      showLabels
      labelPosition="outside"
      padAngle={1.5}
      labelFormatter={(slice) => `${slice.label} · $${slice.value}M`}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
```

### Support Channel Share
ID: `PieChart.support-channel-share` • Category: charts

```tsx
const toShare = (value: number) => Math.round((value / TOTAL_INTERACTIONS) * 100);
const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${toShare(slice.value)}%`;
const formatTooltip = (slice: PieChartDataPoint) => {
  const share = toShare(slice.value);
  return `${slice.label}: ${slice.value.toLocaleString()} interactions (${share}%)`;
};
  return (
    <PieChart
      title="Support contact mix"
      subtitle="Last 30 days"
      maxWidth={580}
      height={380}
      data={SUPPORT_CHANNELS}
      innerRadius={80}
      outerRadius={150}
      showLabels
      labelPosition="outside"
      padAngle={1}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'right' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      startAngle={-70}
      endAngle={290}
    />
  );
}
```

### Training Completion Share
ID: `PieChart.training-completion-share` • Category: charts

```tsx
const toPercent = (value: number) => Math.round((value / TOTAL_COMPLETIONS) * 100);
const formatLabel = (slice: PieChartDataPoint) => `${slice.label} ${toPercent(slice.value)}%`;
const formatTooltip = (slice: PieChartDataPoint) => {
  const share = toPercent(slice.value);
  return `${slice.label}: ${slice.value.toLocaleString()} completions (${share}%)`;
};
  return (
    <PieChart
      title="Training completion share"
      subtitle="Annual compliance program"
      maxWidth={520}
      height={440}
      data={TRAINING_COMPLETIONS}
      innerRadius={100}
      outerRadius={160}
      showLabels
      labelPosition="outside"
      padAngle={1.2}
      labelFormatter={formatLabel}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true, formatter: formatTooltip }}
      animation={{ type: 'wave', duration: 900, stagger: 70 }}
      startAngle={-100}
      endAngle={260}
    />
  );
}
```
