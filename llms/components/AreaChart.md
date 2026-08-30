# Area Chart

Area (filled) chart for visualizing cumulative or stacked trends.

## Metadata

- Canonical name: `AreaChart`
- Package: `@platform-blocks/charts`
- Import: `import { AreaChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, area, timeseries
- Docs: https://react-ui-library.com/components/AreaChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/AreaChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `layout` | AreaChartLayout | No | 'overlap' | Controls how multiple series are rendered. - `overlap` leaves each area independent (default). - `stacked` cumulatively stacks values and renders using stacked layers. |
| `areaOpacity` | number | No |  | Opacity used when rendering stacked layers (if not provided defaults to fillOpacity). |
| `stackOrder` | 'normal' \| 'reverse' | No |  | Adjust the stacking order when using stacked layouts. |
| `data` | ChartDataPoint[] | No |  | Data points (single series) or array of series (multiseries) |
| `series` | LineChartSeries[] | No |  | Multiple data series |
| `lineColor` | string | No |  | Line color (for single series) |
| `lineThickness` | number | No |  | Line thickness (for single series) |
| `lineStyle` | 'solid' \| 'dashed' \| 'dotted' | No |  | Line style (for single series) |
| `showPoints` | boolean | No |  | Show data points (for single series) |
| `pointSize` | number | No |  | Point size (for single series) |
| `pointColor` | string | No |  | Point color (for single series) |
| `smooth` | boolean | No |  | Smooth curve |
| `fill` | boolean | No |  | Fill area under line |
| `fillColor` | string | No |  | Fill color |
| `fillOpacity` | number | No |  | Fill opacity |
| `areaFillMode` | 'single' \| 'series' | No |  | How to distribute fill across series when multiple are present |
| `xAxis` | ChartAxis | No |  | X-axis configuration |
| `yAxis` | ChartAxis | No |  | Y-axis configuration |
| `grid` | ChartGrid | No |  | Grid configuration |
| `legend` | ChartLegend | No |  | Legend configuration |
| `tooltip` | ChartTooltip<ChartDataPoint> | No |  | Tooltip configuration |
| `animation` | ChartAnimation | No |  | Animation configuration |
| `enableCrosshair` | boolean | No |  | Show a vertical crosshair that follows the nearest point |
| `enableSeriesToggle` | boolean | No |  | Enable toggling series visibility from legend |
| `liveTooltip` | boolean | No |  | Update tooltip continuously while moving (not just on press) |
| `multiTooltip` | boolean | No |  | Show multi-series aggregated tooltip aligned to crosshair |
| `enablePanZoom` | boolean | No |  | Enable pan and pinch zoom interactions |
| `zoomMode` | 'x' \| 'y' \| 'both' | No |  | Which axes can zoom |
| `minZoom` | number | No |  | Minimum zoom factor relative to original domain (e.g. 0.1 = 10%) |
| `onDomainChange` | (xDomain: [number, number], yDomain: [number, number]) => void | No |  | Callback when visible data domain changes |
| `enableWheelZoom` | boolean | No |  | Enable wheel zoom on web |
| `wheelZoomStep` | number | No |  | Wheel zoom step factor (default 0.1) |
| `invertWheelZoom` | boolean | No |  | Invert wheel zoom direction |
| `resetOnDoubleTap` | boolean | No |  | Double-tap (or double-click on web) resets zoom |
| `clampToInitialDomain` | boolean | No |  | Clamp pan/zoom so domains never exceed original data bounds |
| `invertPinchZoom` | boolean | No |  | Invert pinch gesture direction (scale grows when fingers move closer) |
| `disableAnimations` | boolean | No |  | Disable all Reanimated-driven animations (debug / perf fallback) |
| `decimationThreshold` | number | No |  | Apply LTOB data decimation above this point count |
| `xScaleType` | 'linear' \| 'log' \| 'time' | No |  | X axis scale type |
| `yScaleType` | 'linear' \| 'log' \| 'time' | No |  | Y axis scale type |
| `enableBrushZoom` | boolean | No |  | Enable shift+drag brush to zoom (web) |
| `annotations` | ChartAnnotation[] | No |  | Optional chart annotations/markers |
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
ID: `AreaChart.basic` • Category: charts

Simple random data area chart with title.

```tsx
return (
    <AreaChart
      title="Weekly signups"
      subtitle="Organic vs virality"
      height={240}
      data={WEEKLY_SIGNUPS}
      xAxis={{
        show: true,
        labelFormatter: (value: number) => `Week ${value + 1}`,
      }}
      yAxis={{
        show: true,
        labelFormatter: (value: number) => `${value} users`,
      }}
      grid={{ show: true, style: 'dashed' }}
      tooltip={{ show: true }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

### Inventory Levels Warehouses
ID: `AreaChart.inventory-levels-warehouses` • Category: charts

```tsx
return (
    <AreaChart
      title="Inventory Levels by Warehouse"
      subtitle="Safety stock adjustments across the first half"
      height={420}
      series={INVENTORY_SERIES}
      smooth={false}
      grid={{ show: true, style: 'solid' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = formatMonth(Math.round(point.x));
          return `${label} • ${point.data?.warehouse ?? 'Warehouse'}: ${Math.round(point.y)}k units`;
        },
      }}
      xAxis={{
        show: true,
        title: '2025 timeline',
        labelFormatter: (value: number) => formatMonth(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Inventory on hand (thousands)',
        labelFormatter: (value: number) => `${Math.round(value)}k`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

### Mobile Device Sessions
ID: `AreaChart.mobile-device-sessions` • Category: charts

```tsx
const formatPhase = (index: number) => PHASE_LABELS[index] ?? `Week ${index + 1}`;
  return (
    <AreaChart
      title="Active Sessions During Launch"
      subtitle="Layered by device platform"
      height={420}
      series={SESSION_SERIES}
      smooth
      grid={{ show: true, style: 'solid' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      enableSeriesToggle
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = formatPhase(Math.round(point.x));
          const channel = point.data?.label ?? 'Sessions';
          return `${label} • ${channel}: ${Math.round(point.y)}k`;
        },
      }}
      xAxis={{
        show: true,
        title: 'Launch timeline',
        labelFormatter: (value: number) => formatPhase(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Daily sessions (thousands)',
        labelFormatter: (value: number) => `${Math.round(value)}k`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

### Renewable Energy Mix
ID: `AreaChart.renewable-energy-mix` • Category: charts

Stacks monthly solar, wind, and hydro production to highlight how policy shifts increase clean generation share over the first half of 2025.

```tsx
const formatMonth = (index: number) => MONTH_LABELS[index] ?? `M${index + 1}`;
  return (
    <AreaChart
      layout="stacked"
      title="Renewable Energy Generation"
      subtitle="Utility-scale output by source"
      height={420}
      series={RENEWABLE_SERIES}
      smooth
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      xAxis={{
        show: true,
        title: 'Month of 2025',
        labelFormatter: (value: number) => formatMonth(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Generation (GWh)',
        labelFormatter: (value: number) => `${Math.round(value)} GWh`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

### Streaming Minutes Campaign
ID: `AreaChart.streaming-minutes-campaign` • Category: charts

**Story focus** - Tracks how a marketing push shifts audience attention across Originals, TV, film, and live sports week-by-week. - Highlights the share-based stack so teams can see when new content overtakes legacy catalog minutes. - Surfaces total minute contribution per category inside the tooltip for quick campaign readouts. **Key settings** - Uses `layout="stackedPercentage"` to normalize each week to 100% share. - Keeps dashed gridlines and a centered legend for comparative scanning. - Custom tooltip blends absolute minutes with share-of-week for richer context.

```tsx
return (
    <AreaChart
      title="Streaming Minutes During Campaign"
      subtitle="Share of viewing time by content category"
      height={420}
      series={STREAMING_SERIES}
      layout="stackedPercentage"
      stackOrder="normal"
      areaOpacity={0.6}
      smooth
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const index = Math.round(point.x);
          const label = formatWeek(index);
          const minutes = point.data?.minutes ?? 0;
          const total = WEEK_TOTALS[index] ?? 0;
          const share = total > 0 ? (minutes / total) * 100 : 0;
          return `${label} • ${point.data?.category ?? 'Content'}: ${minutes}M min (${share.toFixed(1)}%)`;
        },
      }}
      xAxis={{
        show: true,
        title: 'Campaign cadence',
        labelFormatter: (value: number) => formatWeek(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Share of weekly minutes',
        labelFormatter: (value: number) => `${Math.round(value * 100)}%`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

### Support Severity Over Time
ID: `AreaChart.support-severity-over-time` • Category: charts

**Story focus** - Demonstrates how stacked areas surface the composition of weekly ticket inflow by severity level. - Highlights declining critical volume while medium issues remain the majority of support demand. - Emphasizes stability gains after mid-quarter improvements. **Key settings** - Uses the AreaChart `layout="stacked"` mode to visually sum severities per week. - Enables dashed grid lines and a bottom legend for quick reference. - Applies a week-aware `xAxis.labelFormatter` that translates series indices into friendly timeline labels.

```tsx
const formatWeek = (index: number) => WEEKS[index] ?? `Week ${index + 1}`;
  return (
    <AreaChart
      title="Quarterly Support Ticket Mix"
      subtitle="Stacked by severity level"
      height={420}
      series={SEVERITY_SERIES}
      layout="stacked"
      smooth
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      xAxis={{
        show: true,
        title: 'Quarter timeline',
        labelFormatter: (value: number) => formatWeek(Math.round(value)),
      }}
      yAxis={{
        show: true,
        title: 'Tickets created',
        labelFormatter: (value: number) => `${Math.round(value)}`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```
