# Marimekko Chart

Visualize categorical mix alongside overall weight with a mosaic-style variable-width column chart.

## Metadata

- Canonical name: `MarimekkoChart`
- Package: `@platform-blocks/charts`
- Import: `import { MarimekkoChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, marimekko, mosaic
- Docs: https://react-ui-library.com/components/MarimekkoChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/MarimekkoChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | MarimekkoCategory[] | Yes |  | Categories rendered as variable-width columns. |
| `legend` | ChartLegend | No |  | Optional legend configuration. |
| `xAxis` | ChartAxis | No |  | Optional x-axis configuration. |
| `yAxis` | ChartAxis | No |  | Optional y-axis configuration (defaults to percentage scale). |
| `grid` | ChartGrid | No |  | Grid configuration applied to the background. |
| `columnGap` | number | No | 12 | Gap (in pixels) inserted between columns. |
| `segmentBorderRadius` | number | No | 2 | Corner radius applied to each segment rectangle. |
| `padding` | { top: number; right: number; bottom: number; left: number } | No |  | Override padding around the chart plot area. |
| `categoryLabelFormatter` | (category: MarimekkoCategory, index: number) => string | No |  | Formatter applied to categorical labels along the x-axis. |
| `width` | number | No | 640 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 400 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
| `animationDuration` | number | No | DEFAULT_ANIMATION_DURATION | Animation duration in ms |
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
ID: `MarimekkoChart.basic` • Category: charts

Variable-width columns reveal how each pipeline channel and region contributes to total qualified pipeline.

```tsx
return (
    <MarimekkoChart
      title="Pipeline contribution by segment"
      subtitle="Quarter to date"
      height={440}
      data={PIPELINE_COMPOSITION}
      columnGap={16}
      legend={{ show: true, position: 'bottom' }}
      yAxis={{ title: 'Segment share (%)' }}
      grid={{ show: true, style: 'dotted' }}
      categoryLabelFormatter={(category) => category.label}
    />
  );
}
```

### Budget Allocation
ID: `MarimekkoChart.budget-allocation` • Category: charts

Lay out the company plan to see both department budgets and how each team invests within their allocation.

```tsx
return (
    <MarimekkoChart
      title="FY26 budget allocation"
      subtitle="Percentage of total discretionary spend"
      height={420}
      data={BUDGET_PLAN}
      segmentBorderRadius={3}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      yAxis={{ title: 'Share of category (%)' }}
      categoryLabelFormatter={(category) => `${category.label} (${category.segments.reduce((sum, seg) => sum + seg.value, 0)}%)`}
    />
  );
}
```

### Product Portfolio
ID: `MarimekkoChart.product-portfolio` • Category: charts

Compare how revenue mixes across product tiers and sales motions within a single view.

```tsx
return (
    <MarimekkoChart
      title="ARR by product tier and motion"
      subtitle="Current quarter"
      height={460}
      data={PRODUCT_MIX}
      segmentBorderRadius={4}
      legend={{ show: true, position: 'right' }}
      yAxis={{ title: 'Revenue share (%)' }}
      categoryLabelFormatter={(category) => `${category.label}\n(${category.data?.region ?? 'Global'})`}
    />
  );
}
```

### Regional Mix
ID: `MarimekkoChart.regional-mix` • Category: charts

Explore regional totals and the mix of revenue streams side by side.

```tsx
return (
    <MarimekkoChart
      title="Revenue mix by region"
      subtitle="Trailing twelve months"
      height={440}
      data={REGIONAL_REVENUE}
      columnGap={20}
      legend={{ show: true, position: 'bottom', align: 'start' }}
      grid={{ show: true, style: 'dotted' }}
      yAxis={{ title: 'Share within region (%)' }}
    />
  );
}
```
