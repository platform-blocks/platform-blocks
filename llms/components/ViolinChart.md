# Violin Chart

Distribution visualization combining box plot and kernel density.

### Highlights
- Adjustable violin width ratio to balance spacing in dense comparisons.
- Overlay statistic markers (median, mean, quartiles, whiskers) with optional value labels.
- Add chart-wide value bands to spotlight SLA windows, target ranges, or alert thresholds.

## Metadata

- Canonical name: `ViolinChart`
- Package: `@platform-blocks/charts`
- Import: `import { ViolinChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, violin, distribution
- Docs: https://react-ui-library.com/components/ViolinChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/ViolinChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `series` | ViolinDensitySeries[] | Yes |  | Density series rendered within the violin chart |
| `samples` | number | No |  | Density sample resolution |
| `bandwidth` | number | No |  | Kernel bandwidth override |
| `violinWidthRatio` | number | No |  | Relative width multiplier applied to each violin (0.2 - 1) |
| `layout` | ViolinLayout | No |  | Layout orientation |
| `stackOverlap` | number | No |  | Overlap factor between adjacent violins (0 - 0.95) |
| `xAxis` | ChartAxis | No |  | X-axis configuration |
| `yAxis` | ChartAxis | No |  | Y-axis configuration |
| `grid` | ChartGrid | No |  | Grid line configuration |
| `statsMarkers` | ViolinStatsMarkersConfig | No |  | Statistic marker overlays for each violin |
| `valueBands` | ViolinValueBand[] | No |  | Value range highlights rendered across the chart |
| `showLegend` | boolean | No |  | Legacy legend toggle (prefer `legend` prop) |
| `legendPosition` | 'top' \| 'bottom' | No |  | Legacy legend position option |
| `legend` | ChartLegend | No |  | Legend configuration |
| `onSeriesFocus` | (event: ViolinSeriesInteractionEvent) => void | No |  | Series focus callback |
| `onSeriesBlur` | (event: ViolinSeriesInteractionEvent) => void | No |  | Series blur callback |
| `onSeriesPress` | (event: ViolinSeriesInteractionEvent) => void | No |  | Series press/tap callback |
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

### Basic
ID: `ViolinChart.basic` • Category: charts

```tsx
return (
    <ViolinChart
      title="Delivery time distribution"
      height={360}
      series={SERIES}
      samples={128}
      bandwidth={3.5}
    />
  );
}
```

### Delivery Times
ID: `ViolinChart.delivery-times` • Category: charts

```tsx
return (
    <ViolinChart
      title="Delivery time spread by fulfillment center"
      subtitle="Distribution of hours from order capture to doorstep delivery"
      height={460}
      series={FULFILLMENT_CENTERS}
      samples={96}
      bandwidth={1.6}
      violinWidthRatio={0.82}
      statsMarkers={STATS_MARKERS}
      valueBands={SLA_WINDOW}
      yAxis={{ title: 'Hours to deliver', show: true, labelFormatter: (value) => `${value.toFixed(0)}h` }}
    />
  );
}
```

### Experiment Metric Deltas
ID: `ViolinChart.experiment-metric-deltas` • Category: charts

```tsx
return (
    <ViolinChart
      title="Experiment metric deltas vs. control"
      subtitle="Percent change in weekly activation compared to holdout"
      height={460}
      series={EXPERIMENT_SERIES}
      samples={88}
      bandwidth={1.5}
      violinWidthRatio={0.68}
      statsMarkers={STATS}
      valueBands={VALUE_BANDS}
      yAxis={{
        title: 'Percent delta',
        labelFormatter: (value) => `${value.toFixed(1)}%`,
      }}
      xAxis={{ show: true, title: 'Variant cohorts' }}
    />
  );
}
```

### Model Prediction Errors
ID: `ViolinChart.model-prediction-errors` • Category: charts

```tsx
return (
    <ViolinChart
      title="Prediction error distribution per model version"
      subtitle="Mean absolute error (percentage points) across validation folds"
      height={460}
      series={ERROR_SERIES}
      samples={96}
      bandwidth={0.9}
      violinWidthRatio={0.78}
      statsMarkers={STATS}
      valueBands={VALUE_BANDS}
      yAxis={{
        title: 'MAE (%)',
        labelFormatter: (value) => `${value.toFixed(2)}%`,
      }}
    />
  );
}
```

### Salary Distribution
ID: `ViolinChart.salary-distribution` • Category: charts

```tsx
return (
    <ViolinChart
      title="Total compensation distribution by department"
      subtitle="Annual salary including bonus (USD thousands)"
      height={480}
      series={SALARY_SERIES}
      samples={96}
      bandwidth={2.8}
      violinWidthRatio={0.74}
      statsMarkers={STATS}
      valueBands={MARKET_RANGE}
      yAxis={{
        title: 'Total compensation (k$)',
        labelFormatter: (value) => `$${value.toFixed(0)}k`,
      }}
    />
  );
}
```

### Session Duration By Platform
ID: `ViolinChart.session-duration-by-platform` • Category: charts

```tsx
return (
    <ViolinChart
      title="Session duration distribution by platform"
      subtitle="Minutes per active session across major surfaces"
      height={440}
      series={SESSION_SERIES}
      samples={88}
      bandwidth={1.9}
      violinWidthRatio={0.7}
      statsMarkers={STATS}
      valueBands={ENGAGEMENT_BANDS}
      yAxis={{
        title: 'Minutes per session',
        labelFormatter: (value) => `${value.toFixed(1)} min`,
      }}
    />
  );
}
```
