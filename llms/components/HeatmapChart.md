# Heatmap Chart

Color-coded matrix for intensity visualization across two dimensions.

## Metadata

- Canonical name: `HeatmapChart`
- Package: `@platform-blocks/charts`
- Import: `import { HeatmapChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, heatmap, matrix
- Docs: https://react-ui-library.com/components/HeatmapChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/HeatmapChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | HeatmapCell[] \| HeatmapMatrixInput | Yes |  | Heatmap data points or matrix-style input |
| `colorScale` | HeatmapColorScaleConfig | No |  | Color scale configuration |
| `cellSize` | HeatmapCellSize | No |  | Explicit cell size overrides |
| `gap` | number | No | 2 | Gap between cells in pixels |
| `xAxis` | ChartAxis | No |  | X-axis configuration |
| `yAxis` | ChartAxis | No |  | Y-axis configuration |
| `grid` | ChartGrid | No |  | Grid line configuration |
| `legend` | ChartLegend | No |  | Legend configuration (often used for color scales) |
| `tooltip` | ChartTooltip<HeatmapCell> \| HeatmapTooltipOptions | No |  | Tooltip configuration or simplified toggle |
| `enableCrosshair` | boolean | No | true | Highlight row/column under the cursor |
| `multiTooltip` | boolean | No | true | Enable aggregated tooltip for multiple cells |
| `liveTooltip` | boolean | No | false | Keep tooltip following the pointer |
| `annotations` | any[] | No |  | Additional annotations to display |
| `maxAnimatedCells` | number | No | 400 | Maximum number of cells to animate before switching to fast static rendering |
| `disableAnimation` | boolean | No | false | When true, force fast static rendering (no per-cell animation) |
| `showCellLabels` | boolean \| HeatmapCellVisibilityPredicate \| HeatmapLabelDisplayRule | No |  | Control whether cell labels render |
| `valueFormatter` | HeatmapValueFormatter \| HeatmapValueFormatPreset \| { preset: HeatmapValueFormatPreset; decimals?: number; suffix?: string } | No |  | Custom formatter for cell labels and tooltip values |
| `cellCornerRadius` | number | No | 2 | Corner radius applied to heatmap cells |
| `hoverHighlight` | HeatmapHoverHighlightConfig | No |  | Customize hover highlight overlays |
| `gradientLegend` | HeatmapGradientLegendConfig | No |  | Enable and customize gradient legend display |
| `accessibilityTable` | HeatmapAccessibilityTableOptions | No |  | Render hidden accessible table representation |
| `onDataTable` | (payload: HeatmapDataTablePayload) => void | No |  | Callback invoked with flattened data table payload |
| `width` | number | No | 420 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 320 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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

### Basic Heatmap
ID: `HeatmapChart.basic` • Category: charts

```tsx
return (
    <HeatmapChart
      title="Support ticket load"
      subtitle="Average tickets per hour"
      height={320}
      data={{ rows: SESSIONS, cols: DAYS, values: UTILIZATION }}
      cellSize={{ width: 48, height: 44 }}
      gap={4}
      colorScale={{
        min: 0,
        max: 30,
        colors: ['#EBF4FF', '#60A5FA', '#1D4ED8'],
      }}
      xAxis={{
        show: true,
        title: 'Weekday',
      }}
      yAxis={{
        show: true,
        title: 'Shift',
      }}
      grid={{ show: false }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Low', color: '#EBF4FF' },
          { label: 'High', color: '#1D4ED8' },
        ],
      }}
      tooltip={{ show: true }}
    />
  );
}
```

### GitHub Contributions
ID: `HeatmapChart.contributions` • Category: charts

GitHub-style contribution calendar generated with a 7x53 grid (weeks x weekdays) and a 5-step color scale.

```tsx
return (
    <HeatmapChart
      title="Weekly contributions"
      subtitle="GitHub-style activity calendar"
      height={280}
      data={{ rows: WEEKDAY_LABELS, cols: COLUMNS, values: CONTRIBUTION_MATRIX }}
      cellSize={{ width: 12, height: 12 }}
      gap={2}
      colorScale={{ min: 0, max: 4, colors: PALETTE }}
      xAxis={{ show: false }}
      yAxis={{
        show: true,
        labelFormatter: (value) => WEEKDAY_LABELS[value] ?? '',
      }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Less', color: PALETTE[0] },
          { label: 'More', color: PALETTE[PALETTE.length - 1] },
        ],
      }}
      tooltip={{ show: true }}
    />
  );
}
```

### Employee Engagement Scores
ID: `HeatmapChart.employee-engagement-scores` • Category: charts

Visualizes employee engagement survey scores per team across key dimensions to spotlight strengths and low-score focus areas.

```tsx
return (
    <HeatmapChart
      title="Employee engagement survey"
      subtitle="Dimension scores (1-5) by team"
      height={360}
      data={{ rows: TEAMS, cols: DIMENSIONS, values: SCORES }}
      cellSize={{ width: 96, height: 48 }}
      gap={4}
      colorScale={{
        min: 1,
        max: 5,
        stops: [
          { value: 2.5, color: '#F97316' },
          { value: 3.5, color: '#FACC15' },
          { value: 4.5, color: '#22C55E' },
        ],
      }}
      valueFormatter={({ value }) => `${value.toFixed(1)} score`}
      showCellLabels
      xAxis={{ show: true, title: 'Engagement dimension' }}
      yAxis={{ show: true, title: 'Team' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Needs focus (< 3.0)', color: '#F97316' },
          { label: 'Steady (3-4)', color: '#FACC15' },
          { label: 'High confidence (> 4)', color: '#22C55E' },
        ],
      }}
      cellCornerRadius={4}
      hoverHighlight={{ rowOpacity: 0.12, columnOpacity: 0.12 }}
      tooltip={{ show: true, aggregate: false }}
    />
  );
}
```

### Infrastructure Cpu Utilization
ID: `HeatmapChart.infrastructure-cpu-utilization` • Category: charts

Heatmap of average CPU utilization across infrastructure clusters and daily time blocks, highlighting hotspots that approach saturation bands.

```tsx
return (
    <HeatmapChart
      title="Infrastructure CPU utilization"
      subtitle="Average utilization (%) across compute clusters"
      height={360}
      data={{ rows: CLUSTERS, cols: TIME_BLOCKS, values: CPU_UTILIZATION }}
      cellSize={{ width: 90, height: 44 }}
      gap={6}
      colorScale={{
        min: 0,
        max: 100,
        stops: [
          { value: 35, color: '#0EA5E9' },
          { value: 60, color: '#FACC15' },
          { value: 80, color: '#F97316' },
          { value: 95, color: '#DC2626' },
        ],
      }}
      valueFormatter={({ value }) => `${Math.round(value)}% utilized`}
      showCellLabels={({ width, height }) => width >= 70 && height >= 38}
      xAxis={{ show: true, title: 'Time block' }}
      yAxis={{ show: true, title: 'Cluster' }}
    grid={{ show: true, style: 'dashed' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Healthy (< 60%)', color: '#0EA5E9' },
          { label: 'Watch (60-80%)', color: '#FACC15' },
          { label: 'Hotspot (> 80%)', color: '#F97316' },
        ],
      }}
      cellCornerRadius={6}
      hoverHighlight={{ rowOpacity: 0.16, columnOpacity: 0.12 }}
      tooltip={{ show: true, aggregate: false }}
    />
  );
}
```

### Marketing Email Performance
ID: `HeatmapChart.marketing-email-performance` • Category: charts

Tracks marketing email click-through rates by segment and day of week to quickly surface best-performing send windows.

```tsx
return (
    <HeatmapChart
      title="Email click-through performance"
      subtitle="Daily CTR (%) across audience segments"
      height={320}
      data={{ rows: SEGMENTS, cols: DAYS, values: CLICK_RATES }}
      cellSize={{ width: 80, height: 44 }}
      gap={4}
      colorScale={{
        min: 10,
        max: 45,
        colors: ['#F5F3FF', '#C4B5FD', '#7C3AED'],
      }}
      valueFormatter={({ value }) => `${Math.round(value)}% CTR`}
      showCellLabels={({ cell }) => cell.value >= 32}
      xAxis={{ show: true, title: 'Day of week' }}
      yAxis={{ show: true, title: 'Segment' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Baseline', color: '#F5F3FF' },
          { label: 'Above average', color: '#C4B5FD' },
          { label: 'Top performing', color: '#7C3AED' },
        ],
      }}
      cellCornerRadius={6}
      hoverHighlight={{ rowOpacity: 0.12, columnOpacity: 0.1 }}
      tooltip={{ show: true, aggregate: false }}
    />
  );
}
```

### Quality Assurance Pass Rates
ID: `HeatmapChart.quality-assurance-pass-rates` • Category: charts

Shows quality assurance pass rates for each regression suite across release candidates, emphasizing areas that fall below the team’s quality threshold.

```tsx
return (
    <HeatmapChart
      title="QA pass rates by release"
      subtitle="Regression suites vs. release candidates"
      height={340}
      data={{ rows: SUITES, cols: RELEASES, values: PASS_RATES }}
      cellSize={{ width: 110, height: 48 }}
      gap={4}
      colorScale={{
        min: 80,
        max: 100,
        stops: [
          { value: 85, color: '#F87171' },
          { value: 92, color: '#FBBF24' },
          { value: 98, color: '#34D399' },
        ],
      }}
      valueFormatter={({ value }) => `${Math.round(value)}% pass`}
      showCellLabels
      xAxis={{ show: true, title: 'Release candidate' }}
      yAxis={{ show: true, title: 'Test suite' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Below target (< 92%)', color: '#F87171' },
          { label: 'At risk (92-97%)', color: '#FBBF24' },
          { label: 'Meets target (> 97%)', color: '#34D399' },
        ],
      }}
      cellCornerRadius={5}
      hoverHighlight={{ rowOpacity: 0.14, columnOpacity: 0.12 }}
      tooltip={{ show: true, aggregate: false }}
    />
  );
}
```

### Support Backlog Priority
ID: `HeatmapChart.support-backlog-priority` • Category: charts

Maps support ticket backlog volume across product modules and priority levels to expose severity hot spots.

```tsx
return (
    <HeatmapChart
      title="Support backlog by module"
      subtitle="Open tickets by severity priority"
      height={360}
      data={{ rows: MODULES, cols: PRIORITIES, values: BACKLOG }}
      cellSize={{ width: 108, height: 48 }}
      gap={6}
      colorScale={{
        type: 'log',
        min: 1,
        max: 32,
        colors: ['#EFF6FF', '#60A5FA', '#1D4ED8'],
      }}
      valueFormatter={({ value }) => `${value} ${value === 1 ? 'ticket' : 'tickets'}`}
      showCellLabels={({ cell }) => cell.value >= 8}
      xAxis={{ show: true, title: 'Priority' }}
      yAxis={{ show: true, title: 'Product module' }}
      legend={{
        show: true,
        position: 'bottom',
        items: [
          { label: 'Low volume', color: '#EFF6FF' },
          { label: 'Rising load', color: '#60A5FA' },
          { label: 'Critical backlog', color: '#1D4ED8' },
        ],
      }}
      cellCornerRadius={4}
      hoverHighlight={{ rowOpacity: 0.14, columnOpacity: 0.12 }}
      tooltip={{ show: true, aggregate: true }}
    />
  );
}
```
