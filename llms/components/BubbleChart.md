# Bubble Chart

Scatter-style plot where point radius encodes a third quantitative dimension.

## Metadata

- Canonical name: `BubbleChart`
- Package: `@platform-blocks/charts`
- Import: `import { BubbleChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, bubble, scatter
- Docs: https://react-ui-library.com/components/BubbleChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/BubbleChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | T[] | Yes | [] | Dataset to render |
| `dataKey` | BubbleChartDataKey<T> | Yes |  | Mapping between dataset keys and chart dimensions |
| `range` | [number, number] | No | [36, 576] | Bubble area range (min/max) used to derive radius. Defaults to [36, 576]. |
| `minBubbleSize` | number | No |  | Optional minimum bubble radius override (px). |
| `maxBubbleSize` | number | No |  | Optional maximum bubble radius override (px). |
| `color` | string | No |  | Base fill color when data does not provide one. |
| `colorScale` | (value: any, record: T, index: number) => string \| undefined | No |  | Optional color scale function allowing categorical values to resolve to palette entries. |
| `bubbleOpacity` | number | No |  | Bubble fill opacity. Defaults to 0.85. |
| `bubbleStrokeColor` | string | No | 'rgba(0,0,0,0.12)' | Bubble outline color. |
| `bubbleStrokeWidth` | number | No | 1 | Bubble outline width. Defaults to 1. |
| `textColor` | string | No |  | Axis/grid text color override. |
| `gridColor` | string | No |  | Grid line color override. |
| `label` | string | No |  | Optional label shown inside the plot area. |
| `valueFormatter` | (value: number, record: T, index: number) => string | No |  | Custom formatter for bubble size values (tooltip + legend). |
| `withTooltip` | boolean | No | true | Disable tooltip interactions. Defaults to true (tooltip enabled). |
| `tooltip` | ChartTooltip<{ record: T; value: number; label: string; rawX: any; rawY: any; index: number; color: string; }> | No |  | Advanced tooltip configuration |
| `grid` | ChartGrid \| boolean | No | true | Supply custom grid configuration or disable grid entirely. |
| `legend` | ChartLegend | No |  | Legend configuration. |
| `xAxis` | ChartAxis | No | {} | X axis configuration (ticks, formatting, labels). |
| `yAxis` | ChartAxis | No | {} | Y axis configuration (ticks, formatting, labels). |
| `h` | number | No |  | Height alias |
| `width` | number | No | 400 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
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
ID: `BubbleChart.basic` • Category: charts

```tsx
return (
    <BubbleChart
      title="Revenue vs Growth"
      subtitle="Bubble size shows valuation (in millions)"
      height={360}
      data={companies}
      dataKey={{
        x: 'revenue',
        y: 'growth',
        z: 'valuation',
        label: 'company',
        id: 'company',
      }}
      xAxis={{
        title: 'Annual revenue (USD millions)',
        labelFormatter: (value) => `${Math.round(value)}m`,
      }}
      yAxis={{
        title: 'YoY growth %',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      valueFormatter={(value) => `$${Math.round(value)}m`}
      grid={{ show: true }}
      withTooltip
      range={[64, 1152]}
    />
  );
}
```

### Cities Talent Footprint
ID: `BubbleChart.cities-talent-footprint` • Category: charts

```tsx
const formatFootprint = (value: number) => `${value.toFixed(0)}k sq ft`;
  return (
    <BubbleChart
      title="Global Talent Hubs"
      subtitle="Talent depth vs cost of living — bubble size represents active office footprint"
      height={440}
      data={cities}
      dataKey={{
        x: 'costOfLivingIndex',
        y: 'talentDepth',
        z: 'officeFootprintKsqft',
        label: 'city',
        color: 'region',
        id: 'city',
      }}
      colorScale={(value) => (value && regionPalette[value as Region]) || regionPalette.Americas}
      grid={{ show: true }}
      xAxis={{
        title: 'Cost of living index (base 100 = SF)',
        labelFormatter: (value) => value.toFixed(0),
      }}
      yAxis={{
        title: 'Tech talent depth (0–100 readiness)',
        labelFormatter: (value) => value.toFixed(0),
      }}
      valueFormatter={(value) => formatFootprint(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Office footprint: ${formatFootprint(value)}`,
          `Remote ready: ${record.remoteReady}% • Avg tenure: ${record.averageTenure.toFixed(1)} yrs`,
          `Anchor university: ${record.anchorUniversity}`,
        ].join('\n'),
      }}
      range={[81, 1764]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
```

### Customer Account Health
ID: `BubbleChart.customer-account-health` • Category: charts

```tsx
const formatArr = (value: number) => `$${value.toFixed(2)}M ARR`;
  return (
    <BubbleChart
      title="Customer Account Health vs Expansion"
      subtitle="Bubble size reflects current ARR; use upper-right quadrant to spot ready-to-expand logos"
      height={440}
      data={accounts}
      dataKey={{
        x: 'healthScore',
        y: 'expansionPotential',
        z: 'arr',
        label: 'account',
        id: 'account',
      }}
      xAxis={{
        title: 'Account health score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Expansion potential score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      grid={{ show: true }}
      valueFormatter={(value) => formatArr(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          formatArr(value),
          `Segment: ${record.segment} • CSM: ${record.csOwner}`,
          `Last touch: ${record.lastTouch}`,
        ].join('\n'),
      }}
      range={[96, 1728]}
    />
  );
}
```

### Engineering Epic Risk
ID: `BubbleChart.engineering-epic-risk` • Category: charts

```tsx
const formatMultiplier = (value: number) => `${value.toFixed(1)}× risk`;
  return (
    <BubbleChart
      title="Epic Risk Landscape"
      subtitle="Story points vs defect density — bubble area communicates composite risk multiplier"
      height={420}
      data={epics}
      dataKey={{
        x: 'storyPoints',
        y: 'defectDensity',
        z: 'riskMultiplier',
        label: 'epic',
        color: 'squad',
        id: 'epic',
      }}
      colorScale={(value) => (value ? squadPalette[value as Squad] : squadPalette['Platform Reliability'])}
      grid={{ show: true }}
      xAxis={{
        title: 'Estimated effort (story points)',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Defect density (per 1000 lines)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      valueFormatter={(value) => formatMultiplier(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          formatMultiplier(value),
          `Critical paths: ${record.criticalPaths}`,
          `Squad: ${record.squad} • Phase: ${record.phase}`,
        ].join('\n'),
      }}
      range={[64, 1296]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
```

### Product Strategy Portfolio
ID: `BubbleChart.product-strategy-portfolio` • Category: charts

```tsx
const formatMillions = (value: number) => `$${value.toFixed(1)}M`;
  return (
    <BubbleChart
      title="Product Initiative Portfolio"
      subtitle="Strategic value vs execution effort — bubble scales with projected revenue"
      height={440}
      data={initiatives}
      dataKey={{
        x: 'executionEffort',
        y: 'strategicValue',
        z: 'projectedRevenue',
        label: 'initiative',
        id: 'initiative',
      }}
      grid={{ show: true }}
      xAxis={{
        title: 'Execution effort (1=low, 10=high)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      yAxis={{
        title: 'Strategic value (1=low, 10=high)',
        labelFormatter: (value) => value.toFixed(1),
      }}
      valueFormatter={(value) => formatMillions(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Projected revenue: ${formatMillions(value)}`,
          `Confidence: ${record.confidence}%`,
          `Owner: ${record.owner} • Horizon: ${record.horizon}`,
        ].join('\n'),
      }}
      range={[72, 1440]}
    />
  );
}
```

### Vendor Contracts Scoring
ID: `BubbleChart.vendor-contracts-scoring` • Category: charts

```tsx
const formatSpend = (value: number) => `$${value.toFixed(1)}M`;
  return (
    <BubbleChart
      title="Vendor Contract Health"
      subtitle="Compliance vs renewal probability — bubble area encodes annual spend"
      height={420}
      data={contracts}
      dataKey={{
        x: 'complianceScore',
        y: 'renewalProbability',
        z: 'annualSpendMillions',
        label: 'vendor',
        color: 'category',
        id: 'vendor',
      }}
      colorScale={(value) => (value && categoryPalette[value as Category]) || categoryPalette.Cloud}
      grid={{ show: true }}
      xAxis={{
        title: 'Compliance readiness score',
        labelFormatter: (value) => `${Math.round(value)}`,
      }}
      yAxis={{
        title: 'Renewal probability %',
        labelFormatter: (value) => `${Math.round(value)}%`,
      }}
      valueFormatter={(value) => formatSpend(value)}
      tooltip={{
        formatter: ({ record, value }) => [
          `Annual spend: ${formatSpend(value)}`,
          `Owner: ${record.owner} • Term ends: ${record.termEnds}`,
          `Risk: ${record.riskLevel}`,
        ].join('\n'),
      }}
      range={[72, 1620]}
      legend={{ show: true, position: 'right', align: 'start' }}
    />
  );
}
```
