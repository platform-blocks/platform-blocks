# Scatter Chart

Plots data points in two-dimensional space for correlation analysis.

## Metadata

- Canonical name: `ScatterChart`
- Package: `@platform-blocks/charts`
- Import: `import { ScatterChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, scatter, xy
- Docs: https://react-ui-library.com/components/ScatterChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/ScatterChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | ChartDataPoint[] | Yes |  | Data points |
| `series` | ScatterSeries[] | No |  | Optional multi-series data (overrides top-level data if provided) |
| `pointSize` | number | No | 6 | Point size |
| `pointColor` | string | No |  | Point color |
| `pointOpacity` | number | No | 1 | Point opacity |
| `allowAddPoints` | boolean | No | false | Allow adding points by tapping |
| `showTrendline` | boolean \| 'overall' \| 'per-series' | No | false | Show trend line. true\|'overall' for single combined regression, 'per-series' for one per series |
| `trendlineColor` | string | No |  | Trend line color |
| `enablePanZoom` | boolean | No |  | Enable pan & zoom interactions |
| `zoomMode` | 'x' \| 'y' \| 'both' | No |  | Zoom mode (axes constrained) |
| `minZoom` | number | No |  | Minimum zoom scale (domain fraction) |
| `enableWheelZoom` | boolean | No |  | Enable wheel zoom (web) |
| `wheelZoomStep` | number | No |  | Wheel zoom step |
| `invertWheelZoom` | boolean | No |  | Invert wheel zoom direction |
| `resetOnDoubleTap` | boolean | No |  | Reset zoom on double tap |
| `clampToInitialDomain` | boolean | No |  | Clamp pan/zoom to initial full domain |
| `invertPinchZoom` | boolean | No |  | Invert pinch gesture direction (scale grows when fingers move closer) |
| `xAxis` | ChartAxis | No |  | X-axis configuration |
| `yAxis` | ChartAxis | No |  | Y-axis configuration |
| `grid` | ChartGrid | No |  | Grid configuration |
| `legend` | ChartLegend | No |  | Legend configuration |
| `tooltip` | ChartTooltip<ChartDataPoint> | No |  | Tooltip configuration |
| `animation` | ChartAnimation | No |  | Animation configuration |
| `multiTooltip` | boolean | No |  | Enable multi-series shared tooltip popover |
| `enableCrosshair` | boolean | No |  | Enable crosshair |
| `liveTooltip` | boolean | No |  | Live (follow pointer) tooltip selection |
| `xScaleType` | 'linear' \| 'log' \| 'time' | No |  | X scale type |
| `yScaleType` | 'linear' \| 'log' \| 'time' | No |  | Y scale type |
| `quadrants` | ScatterQuadrantConfig | No |  | Optional quadrant overlay configuration |
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

### Api Error Rate Volume
ID: `ScatterChart.api-error-rate-volume` • Category: charts

```tsx
const describeQuadrant = (x: number, y: number) => {
  const labels = QUADRANTS.labels;
  if (!labels) return null;
  const isRight = x >= QUADRANTS.x;
  const isTop = y >= QUADRANTS.y;
  if (isRight && isTop) return labels.topRight ?? null;
  if (!isRight && isTop) return labels.topLeft ?? null;
  if (isRight && !isTop) return labels.bottomRight ?? null;
  return labels.bottomLeft ?? null;
};
  return (
    <ScatterChart
      title="API error rate vs. request volume"
      subtitle="Each point represents a service, sized by throughput"
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.9}
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xScaleType="log"
      xAxis={{
        show: true,
        title: 'Requests per minute (thousands)',
        labelFormatter: (value: number) => `${Math.round(value)}k`,
      }}
      yAxis={{
        show: true,
        title: 'Error rate (%)',
        labelFormatter: (value: number) => `${value.toFixed(1)}%`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#12263A',
        textColor: '#F4F6FB',
        formatter: (point) => {
          const quadrantNote = describeQuadrant(point.x, point.y);
          const lines = [
            point.label ?? 'Service',
            `Volume ${Math.round(point.x)}k rpm · Errors ${point.y.toFixed(1)}%`,
          ];
          if (quadrantNote) {
            lines.push(quadrantNote);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
```

### Basic
ID: `ScatterChart.basic` • Category: charts

```tsx
return (
    <ScatterChart
      title="Spend vs. qualified leads"
      subtitle="Campaign cohort"
      height={340}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      showTrendline="per-series"
      enableCrosshair
      enablePanZoom
      zoomMode="both"
      multiTooltip
      liveTooltip
      xAxis={{
        show: true,
        title: 'Spend (USD thousands)',
        labelFormatter: (value) => `$${value}`,
      }}
      yAxis={{
        show: true,
        title: 'Qualified leads',
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.x}k spend → ${point.y} leads`,
      }}
    />
  );
}
```

### Campaign Spend Revenue
ID: `ScatterChart.campaign-spend-revenue` • Category: charts

```tsx
const resolveAction = (x: number, y: number) => {
  const labels = QUADRANTS.labels;
  if (!labels) return null;
  const right = x >= QUADRANTS.x;
  const top = y >= QUADRANTS.y;
  if (!right && top) return labels.topLeft ?? null;
  if (right && top) return labels.topRight ?? null;
  if (!right && !top) return labels.bottomLeft ?? null;
  return labels.bottomRight ?? null;
};
  return (
    <ScatterChart
      title="Campaign spend vs. attributed revenue"
      subtitle="Ad set performance, each marker sized by budget grouping"
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.86}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Spend (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      yAxis={{
        show: true,
        title: 'Attributed revenue (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#0B1220',
        textColor: '#F1F5F9',
        formatter: (point) => {
          const action = resolveAction(point.x, point.y);
          const lines = [
            point.label ?? 'Ad set',
            `Spend $${point.x}k · Revenue $${point.y}k`,
          ];
          if (action) {
            lines.push(action);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
```

### Customer Ltv Vs Cac
ID: `ScatterChart.customer-ltv-vs-cac` • Category: charts

```tsx
const resolveQuadrantLabel = (x: number, y: number) => {
  const horizontal = x >= QUADRANTS.x ? 'Right' : 'Left';
  const vertical = y >= QUADRANTS.y ? 'Top' : 'Bottom';
  const labels = QUADRANTS.labels;
  if (!labels) return null;
  if (horizontal === 'Left' && vertical === 'Top') return labels.topLeft ?? null;
  if (horizontal === 'Right' && vertical === 'Top') return labels.topRight ?? null;
  if (horizontal === 'Left' && vertical === 'Bottom') return labels.bottomLeft ?? null;
  if (horizontal === 'Right' && vertical === 'Bottom') return labels.bottomRight ?? null;
  return null;
};
  return (
    <ScatterChart
      title="Customer LTV vs. Acquisition Cost"
      subtitle="Segment performance across recent cohorts"
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      quadrants={QUADRANTS}
      pointOpacity={0.9}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Acquisition cost (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      yAxis={{
        show: true,
        title: 'Lifetime value (USD thousands)',
        labelFormatter: (value: number) => `$${value}k`,
      }}
      tooltip={{
        show: true,
        backgroundColor: '#101218',
        textColor: '#F8FAFC',
        formatter: (point) => {
          const quadrantLabel = resolveQuadrantLabel(point.x, point.y);
          const lines = [
            point.label ?? 'Segment',
            `CAC $${point.x}k · LTV $${point.y}k`,
          ];
          if (quadrantLabel) {
            lines.push(quadrantLabel);
          }
          return lines.join('\n');
        },
      }}
    />
  );
}
```

### Feature Usage Vs Satisfaction
ID: `ScatterChart.feature-usage-vs-satisfaction` • Category: charts

```tsx
return (
    <ScatterChart
      title="Feature usage vs. satisfaction"
      subtitle="Weekly feature interactions mapped to CSAT by cohort"
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      pointOpacity={0.85}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      xAxis={{
        show: true,
        title: 'Weekly feature uses',
        labelFormatter: (value: number) => `${value}x`,
      }}
      yAxis={{
        show: true,
        title: 'Customer satisfaction (1-10)',
        labelFormatter: (value: number) => value.toFixed(1),
      }}
      tooltip={{
        show: true,
        formatter: (point) =>
          `${point.label ?? 'Cohort'}\nUsage ${point.x.toFixed(1)}x | CSAT ${point.y.toFixed(1)}`,
      }}
    />
  );
}
```

### Performance Vs Tenure
ID: `ScatterChart.performance-vs-tenure` • Category: charts

```tsx
return (
    <ScatterChart
      title="Performance rating vs. tenure"
      subtitle="Team-by-team view with marker size scaled to total compensation (USD thousands)"
      height={360}
      data={SERIES.flatMap((serie) => serie.data)}
      series={SERIES}
      pointOpacity={0.88}
      showTrendline="per-series"
      enableCrosshair
      multiTooltip
      liveTooltip
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      xAxis={{
        show: true,
        title: 'Tenure (years)',
        labelFormatter: (value: number) => `${value.toFixed(1)} yrs`,
      }}
      yAxis={{
        show: true,
        title: 'Performance rating (1-5)',
        labelFormatter: (value: number) => value.toFixed(1),
      }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const compensation = point.data?.compensation;
          const compensationText = typeof compensation === 'number' ? `$${compensation}k` : 'n/a';
          return `${point.label ?? 'Team member'}\nRating ${point.y.toFixed(1)} | Tenure ${point.x.toFixed(1)} yrs\nComp ${compensationText}`;
        },
      }}
    />
  );
}
```
