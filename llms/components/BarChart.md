# Bar Chart

Discrete / categorical bar chart visualization component.

## Metadata

- Canonical name: `BarChart`
- Package: `@platform-blocks/charts`
- Import: `import { BarChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, bar, categorical
- Docs: https://react-ui-library.com/components/BarChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/BarChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | BarChartDataPoint[] | Yes |  | Data points |
| `series` | BarChartSeries[] | No |  | Optional multi-series data |
| `barColor` | string | No |  | Bar color |
| `barSpacing` | number | No | 0.2 | Bar spacing (0-1) |
| `barBorderRadius` | number | No | 4 | Bar border radius |
| `orientation` | 'vertical' \| 'horizontal' | No | 'vertical' | Orientation |
| `layout` | 'single' \| 'grouped' \| 'stacked' | No |  | Layout strategy for multi-series data |
| `stackMode` | 'normal' \| '100%' | No | 'normal' | Stacked layout mode |
| `valueFormatter` | (value: number, datum: BarChartDataPoint, index: number) => string | No |  | Optional value formatter for tooltip display |
| `xAxis` | ChartAxis | No |  | X-axis configuration |
| `yAxis` | ChartAxis | No |  | Y-axis configuration |
| `grid` | ChartGrid | No |  | Grid configuration |
| `legend` | ChartLegend | No | { show: true, position: 'bottom', align: 'center' } | Legend configuration |
| `legendToggleEnabled` | boolean | No |  | Allow toggling series visibility from the legend |
| `thresholds` | BarChartThreshold[] | No |  | Reference lines overlaid on the chart |
| `valueLabel` | BarChartValueLabelConfig | No |  | Value label configuration |
| `colorScale` | (context: { datum: BarChartDataPoint; series: BarChartSeries; seriesIndex: number; categoryIndex: number; }) => string \| undefined | No |  | Custom color scale resolver |
| `tooltip` | ChartTooltip<BarChartDataPoint> | No |  | Tooltip configuration |
| `animation` | ChartAnimation | No |  | Animation configuration |
| `multiTooltip` | boolean | No |  | Shared multi-series tooltip |
| `enableCrosshair` | boolean | No |  | Crosshair enable |
| `liveTooltip` | boolean | No |  | Live pointer-follow tooltip |
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

### BarChart Basic
ID: `BarChart.basic` • Tags: basic, getting-started • Category: charts • Status: stable • Since: 1.0.0

Basic BarChart usage with a title.

```tsx
return (
    <BarChart
      title="Quarterly revenue"
      subtitle="North America"
      height={260}
      data={QUARTERLY_REVENUE}
      barSpacing={0.25}
      barBorderRadius={6}
      valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
      xAxis={{ show: true }}
      yAxis={{
        show: true,
        labelFormatter: (value) => `$${(value / 1000).toFixed(0)}k`,
      }}
      grid={{ show: true, style: 'dotted' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.category}: $${point.value.toLocaleString()}`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

### Feature Adoption By Tier
ID: `BarChart.feature-adoption-by-tier` • Category: charts

```tsx
const formatAccounts = (value: number) => `${value.toLocaleString()} accounts`;
  return (
    <BarChart
      title="Feature adoption by customer tier"
      subtitle="Accounts live on the experimentation canvas within 45 days"
      height={400}
      data={FEATURE_ADOPTION}
      barSpacing={0.26}
      barBorderRadius={12}
      legend={{ show: false }}
      valueFormatter={(value, datum) => {
        const segmentTotal = datum.data?.accounts ?? value;
        const rate = datum.data?.adoptionRate ?? value / segmentTotal;
        const percentage = `${Math.round((rate ?? 0) * 100)}% adoption`;
        return `${formatAccounts(value)} (${percentage})`;
      }}
      valueLabel={{
        position: 'inside',
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '600',
        formatter: (value) => value.toLocaleString(),
      }}
      yAxis={{
        show: true,
        title: 'Activated accounts',
        titleFontSize: 12,
        labelFormatter: (value) => value.toLocaleString(),
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const accounts = datum.data?.accounts ?? datum.value;
          const adoptionRate = datum.data?.adoptionRate ?? datum.value / accounts;
          return [
            datum.category,
            `Activated: ${formatAccounts(datum.value)}`,
            `Account base: ${accounts.toLocaleString()}`,
            `Adoption rate: ${(adoptionRate * 100).toFixed(1)}%`,
          ].join('\n');
        },
      }}
    />
  );
}
```

### Marketing Spend Multi Touch
ID: `BarChart.marketing-spend-multi-touch` • Category: charts

```tsx
const formatSpend = (value: number) => `$${value.toLocaleString()}k`;
  return (
    <BarChart
      title="Marketing spend by channel"
      subtitle="Multi-touch journey campaign mix"
      height={420}
      data={CAMPAIGN_SPEND}
      barSpacing={0.28}
      legend={{ show: false }}
      valueFormatter={(value) => `${formatSpend(value)} invested`}
      valueLabel={{
        color: '#1f2937',
        fontSize: 12,
        offset: 12,
        formatter: (value) => {
          const share = TOTAL_SPEND ? (value / TOTAL_SPEND) * 100 : 0;
          return `${share.toFixed(1)}% of spend`;
        },
      }}
      yAxis={{
        show: true,
        title: 'Investment (USD thousands)',
        titleFontSize: 12,
        labelFormatter: (value) => `$${value.toFixed(0)}k`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const share = TOTAL_SPEND ? (datum.value / TOTAL_SPEND) * 100 : 0;
          return [
            datum.category,
            `Spend: ${formatSpend(datum.value)}`,
            `Share: ${share.toFixed(1)}% of program`,
            datum.data?.objective ? `Objective: ${datum.data.objective}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

### New Hire Recruiting Cycles
ID: `BarChart.new-hire-recruiting-cycles` • Category: charts

```tsx
const formatDelta = (value: number, datum: (typeof RECRUITING_PROGRESS)[number]) => {
  const previous = datum.data?.previous ?? 0;
  const delta = value - previous;
  if (delta === 0) return 'No change vs last cycle';
  const sign = delta > 0 ? '+' : '-';
  return `${sign}${Math.abs(delta)} vs last cycle`;
};
  return (
    <BarChart
      title="New hires secured this recruiting cycle"
      subtitle="Compared with winter intake"
      height={440}
      orientation="horizontal"
      data={RECRUITING_PROGRESS}
      barSpacing={0.25}
      legend={{ show: false }}
      valueFormatter={(value) => `${value} hires`}
      valueLabel={{
        formatter: (value, datum) => formatDelta(value, datum as (typeof RECRUITING_PROGRESS)[number]),
        color: '#1f2937',
        fontSize: 12,
        offset: 10,
      }}
      xAxis={{
        title: 'Hires confirmed',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const previous = datum.data?.previous ?? 0;
          const delta = datum.value - previous;
          const direction = delta >= 0 ? '+' : '-';
          return [
            `${datum.category}`,
            `This cycle: ${datum.value} hires`,
            `Last cycle: ${previous} hires`,
            `Delta: ${direction}${Math.abs(delta)}`,
            datum.data?.priority ? `Focus: ${datum.data.priority}` : undefined,
            datum.data?.openRoles != null ? `Open roles: ${datum.data.openRoles}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

### Quarterly Revenue Variance
ID: `BarChart.quarterly-revenue-variance` • Category: charts

```tsx
const formatMillions = (value: number) => `$${value.toFixed(2)}M`;
const formatVariance = (value: number, datum: (typeof REGIONAL_REVENUE)[number]) => {
  const goal = datum.data?.goal ?? 0;
  const diff = value - goal;
  const direction = diff >= 0 ? '+' : '-';
  return `${direction}$${Math.abs(diff).toFixed(2)}M vs goal`;
};
  return (
    <BarChart
      title="Quarterly Revenue by Region"
      subtitle="Q3 actuals with variance to plan"
      height={420}
      data={REGIONAL_REVENUE}
      barSpacing={0.32}
      legend={{ show: false }}
      valueFormatter={(value, datum) => {
        const goal = datum.data?.goal;
        return goal != null
          ? `${formatMillions(value)} actual (goal ${formatMillions(goal)})`
          : formatMillions(value);
      }}
      valueLabel={{
        formatter: (value, datum) => formatVariance(value, datum as (typeof REGIONAL_REVENUE)[number]),
        color: '#1f2937',
        fontSize: 12,
        fontWeight: '600',
        offset: 12,
      }}
      yAxis={{
        show: true,
        title: 'Revenue (USD millions)',
        titleFontSize: 12,
        labelFormatter: (value) => `$${value.toFixed(1)}M`,
      }}
      xAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const goal = datum.data?.goal ?? 0;
          const diff = datum.value - goal;
          const pct = goal ? (diff / goal) * 100 : 0;
          const direction = diff >= 0 ? '+' : '-';
          const varianceValue = `${direction}${formatMillions(Math.abs(diff))}`;
          const variancePct = `${direction}${Math.abs(pct).toFixed(1)}%`;
          return [
            `${datum.category}`,
            `Actual: ${formatMillions(datum.value)}`,
            `Goal: ${formatMillions(goal)}`,
            `Variance: ${varianceValue} (${variancePct})`,
            datum.data?.focus ? `Focus: ${datum.data.focus}` : undefined,
          ]
            .filter(Boolean)
            .join('\n');
        },
      }}
    />
  );
}
```

### Sla Compliance By Team
ID: `BarChart.sla-compliance-by-team` • Category: charts

```tsx
const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  return (
    <BarChart
      title="SLA compliance by response team"
      subtitle="Rolling 12-month attainment"
      height={420}
      orientation="horizontal"
      data={SLA_COMPLIANCE}
      barSpacing={0.3}
      legend={{ show: false }}
      valueFormatter={(value) => `${formatPercent(value)} SLA met`}
      valueLabel={{
        color: '#111827',
        fontSize: 12,
        offset: 12,
        formatter: (value) => formatPercent(value),
      }}
      xAxis={{
        title: 'Tickets meeting SLA target',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      yAxis={{ show: true }}
      grid={{ show: true }}
      tooltip={{
        formatter: (datum) => {
          const last = datum.data?.lastQuarter ?? datum.value;
          const delta = datum.value - last;
          const direction = delta >= 0 ? '+' : '-';
          return [
            datum.category,
            `Current: ${formatPercent(datum.value)}`,
            `Last quarter: ${formatPercent(last)}`,
            `Change: ${direction}${Math.abs(delta).toFixed(1)} pts`,
          ].join('\n');
        },
      }}
    />
  );
}
```
