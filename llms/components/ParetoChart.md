# Pareto Chart

Highlight the small number of categories that drive the majority of impact with a bar plus cumulative line visualization.

## Metadata

- Canonical name: `ParetoChart`
- Package: `@platform-blocks/charts`
- Import: `import { ParetoChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, pareto, quality
- Docs: https://react-ui-library.com/components/ParetoChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/ParetoChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | ParetoChartDatum[] | Yes |  | Raw categories to render inside the Pareto analysis. |
| `sortDirection` | 'desc' \| 'asc' \| 'none' | No | 'desc' | Sorting direction applied before calculating cumulative percentages. |
| `valueSeriesLabel` | string | No | 'Frequency' | Display label for the bar series. |
| `cumulativeSeriesLabel` | string | No | 'Cumulative %' | Display label for the cumulative line series. |
| `barColor` | string | No |  | Base color used for the bar series when data points do not provide one. |
| `lineColor` | string | No |  | Base color used for the cumulative line series. |
| `categoryLabelFormatter` | (category: string, index: number) => string | No |  | Optional formatter applied to the categorical axis labels. |
| `enableCrosshair` | boolean | No |  | Enable crosshair indicator across layers |
| `multiTooltip` | boolean | No |  | Enable multi-series tooltip aggregation |
| `liveTooltip` | boolean | No |  | Follow pointer live with tooltip |
| `xDomain` | [number, number] | No |  | Explicit override for the shared x-domain |
| `yDomain` | [number, number] | No |  | Explicit override for the primary y-domain |
| `yDomainRight` | [number, number] | No |  | Explicit override for the secondary y-domain |
| `xAxis` | ChartAxis | No |  | Axis configuration for the shared x-axis |
| `yAxis` | ChartAxis | No |  | Axis configuration for the primary y-axis |
| `yAxisRight` | ChartAxis | No |  | Axis configuration for the secondary y-axis |
| `grid` | ChartGrid | No |  | Grid line configuration |
| `legend` | ChartLegend | No |  | Legend display options |
| `width` | number | No | 640 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 360 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
ID: `ParetoChart.basic` • Category: charts

Simple Pareto chart showing how cumulative contribution highlights the dominant defect categories.

```tsx
return (
    <ParetoChart
      title="Monthly defect analysis"
      subtitle="Product QA triage"
      height={420}
      data={DEFECT_BREAKDOWN}
      valueSeriesLabel="Defects"
      cumulativeSeriesLabel="Cumulative impact"
      grid={{ show: true, style: 'dotted' }}
      legend={{ show: true, position: 'bottom' }}
      yAxis={{ title: 'Defects reported' }}
      yAxisRight={{ title: 'Cumulative share' }}
    />
  );
}
```

### Customer Support Hotspots
ID: `ParetoChart.customer-support-hotspots` • Category: charts

Highlight how a handful of ticket categories drive the majority of support backlog volume.

```tsx
return (
    <ParetoChart
      title="Support backlog concentration"
      subtitle="Top ten case drivers this quarter"
      height={440}
      data={SUPPORT_CASES}
      valueSeriesLabel="Cases"
      cumulativeSeriesLabel="Cumulative ticket share"
      yAxis={{ title: 'Case volume' }}
      yAxisRight={{ title: 'Cumulative share' }}
    />
  );
}
```

### Incident Root Causes
ID: `ParetoChart.incident-root-causes` • Category: charts

Root-cause analysis illustrating which failure modes dominate incident volume.

```tsx
return (
    <ParetoChart
      title="Incident root causes"
      subtitle="Rolling twelve months"
      height={420}
      data={POSTMORTEM_CAUSES}
      valueSeriesLabel="Incidents"
      cumulativeSeriesLabel="Cumulative impact"
      sortDirection="none"
      categoryLabelFormatter={(label) => label.replace(' ', '\n')}
      legend={{ show: true, position: 'right' }}
    />
  );
}
```

### Revenue Concentration
ID: `ParetoChart.revenue-concentration` • Category: charts

Examine how a few strategic accounts make up the bulk of recurring revenue.

```tsx
return (
    <ParetoChart
      title="Annual revenue concentration"
      subtitle="Top enterprise accounts"
      height={460}
      data={ACCOUNT_REVENUE}
      valueSeriesLabel="ARR"
      cumulativeSeriesLabel="Cumulative revenue"
      lineColor="#F97316"
      yAxis={{
        title: 'Recurring revenue',
        labelFormatter: (value) => `$${(value / 1_000_000).toFixed(1)}M`,
      }}
      yAxisRight={{
        title: 'Revenue share',
      }}
    />
  );
}
```
