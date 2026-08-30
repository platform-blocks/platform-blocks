# Line Chart

Basic line chart visualization component.

## Metadata

- Canonical name: `LineChart`
- Package: `@platform-blocks/charts`
- Import: `import { LineChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, line, timeseries
- Docs: https://react-ui-library.com/components/LineChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/LineChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | ChartDataPoint[] | No |  | Data points (single series) or array of series (multiseries) |
| `series` | LineChartSeries[] | No |  | Multiple data series |
| `lineColor` | string | No |  | Line color (for single series) |
| `lineThickness` | number | No | 2 | Line thickness (for single series) |
| `lineStyle` | 'solid' \| 'dashed' \| 'dotted' | No | 'solid' | Line style (for single series) |
| `showPoints` | boolean | No | true | Show data points (for single series) |
| `pointSize` | number | No | 4 | Point size (for single series) |
| `pointColor` | string | No |  | Point color (for single series) |
| `smooth` | boolean | No | false | Smooth curve |
| `fill` | boolean | No | false | Fill area under line |
| `fillColor` | string | No |  | Fill color |
| `fillOpacity` | number | No | 0.3 | Fill opacity |
| `areaFillMode` | 'single' \| 'series' | No | 'single' | How to distribute fill across series when multiple are present |
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
| `animationDuration` | number | No | 1000 | Animation duration in ms |
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
ID: `LineChart.basic` • Category: charts

Simple random data line chart with title.

```tsx
return (
    <LineChart
      title="Monthly active customers"
      subtitle="FY25"
      height={320}
      series={SERIES}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: (value) => `M${value}`,
      }}
      yAxis={{
        show: true,
        title: 'Customers (thousands)',
        labelFormatter: (value) => `${value}`,
      }}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.y}k customers in month ${point.x}`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
      enablePanZoom
      zoomMode="x"
      minZoom={0.3}
    />
  );
}
```

### Smooth Area
ID: `LineChart.smooth-area` • Category: charts

Smoothed dual-series line chart with gradient fill and custom legend.

```tsx
return (
    <LineChart
      title="Revenue trajectory"
      subtitle="Smoothed forecast vs. actuals"
      height={320}
      series={SERIES}
      smooth
      fill
      showPoints={false}
      lineThickness={3}
      fillOpacity={0.28}
      enableCrosshair
      multiTooltip
      liveTooltip
      enablePanZoom
      zoomMode="x"
      minZoom={0.35}
      legend={{ show: true, position: 'top', align: 'center' }}
      grid={{ show: true, style: 'dashed' }}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: (value) => `M${value}`,
      }}
      yAxis={{
        show: true,
        title: 'Revenue (USD thousands)',
        labelFormatter: (value) => `$${Math.round(value)}`,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `$${point.y.toLocaleString()}k in month ${point.x}`,
      }}
      annotations={[
        {
          id: 'midyear-target',
          shape: 'vertical-line',
          x: 6,
          label: 'Mid-year target',
          color: '#6366F1',
          dashArray: [6, 6],
        },
      ]}
    />
  );
}
```

### Time Series
ID: `LineChart.time-series` • Category: charts

Time-series interaction example with brush zoom and custom tooltip formatting.

```tsx
return (
    <LineChart
      title="Web analytics"
      subtitle="Sessions and goals over time"
      height={360}
      series={SERIES}
      xScaleType="time"
      enableCrosshair
      multiTooltip
      liveTooltip
      enablePanZoom
      enableBrushZoom
      zoomMode="x"
      minZoom={0.25}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      grid={{ show: true, style: 'dotted' }}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: (value) => formatter.format(new Date(value)),
      }}
      yAxis={{
        show: true,
        title: 'Count',
        labelFormatter: (value) => value.toLocaleString(),
      }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = formatter.format(new Date(point.x));
          return `${label}: ${point.y.toLocaleString()} ${point.id === 'goal-completions' ? 'goals' : 'sessions'}`;
        },
      }}
      annotations={[
        {
          id: 'holiday-campaign',
          shape: 'range',
          x1: Date.UTC(2024, 10, 1),
          x2: Date.UTC(2024, 11, 31),
          label: 'Holiday campaign',
          color: '#0EA5E9',
          backgroundColor: 'rgba(14,165,233,0.12)',
        },
      ]}
    />
  );
}
```

### Zoom & pan
ID: `LineChart.zoom` • Tags: zoom, pan, wheel, brush, interaction • Category: charts • Status: stable • Since: 1.0.0

Interactive zoom and pan on desktop web. **Scroll** the wheel over the plot to zoom, **drag** to pan, hold **Shift and drag** a box to zoom into a region, and **double-click** to reset. Note that wheel zoom requires both `enableWheelZoom` **and** `enablePanZoom` — the wheel handler is a no-op when panning is disabled. `zoomMode="x"` constrains zooming to the time axis.

```tsx
return (
    <LineChart
      title="Product engagement"
      subtitle="Scroll to zoom · drag to pan · Shift-drag to box-zoom · double-click to reset"
      height={340}
      series={SERIES}
      xAxis={{ show: true, title: 'Week', labelFormatter: (value) => `W${value}` }}
      yAxis={{ show: true, title: 'Count' }}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom' }}
      tooltip={{ show: true }}
      enableCrosshair
      multiTooltip
      liveTooltip
      // Zoom & pan gestures (desktop web):
      enablePanZoom          // drag to pan (and gates wheel zoom)
      enableWheelZoom        // scroll wheel to zoom
      enableBrushZoom        // Shift + drag a box to zoom into it
      resetOnDoubleTap       // double-click to reset the view
      zoomMode="x"           // zoom the x-axis (time) only
      minZoom={0.15}
    />
  );
}
```

### Arr Progress Forecast
ID: `LineChart.arr-progress-forecast` • Category: charts

**Story focus** - Compares current ARR performance for each GTM region against the latest forecast trajectory. - Highlights the forward-looking window so teams can inspect upside or downside risk. - Uses matching dashed overlays to keep forecast lines aligned with their actual counterparts. **Key settings** - Provides paired solid and dashed series per region, sharing colors for quick comparison. - Applies a range annotation to tint the forecast horizon on the right side of the chart. - Enables multi-series tooltip formatting with ARR values expressed in millions.

```tsx
return (
    <LineChart
      title="ARR Progression vs. Forecast"
      subtitle="GTM regions actualized ARR with forward-looking plans"
      height={440}
      series={SERIES}
      smooth
      showPoints
      pointSize={5}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const month = MONTH_LABELS[Math.round(point.x)];
          const region = point.data?.region?.toUpperCase?.() ?? 'Region';
          const label = point.data?.type === 'forecast' ? 'Forecast' : 'Actual';
          return `${month} • ${region} ${label}: $${point.y.toFixed(0)}M ARR`;
        },
      }}
      annotations={[
        {
          id: 'forecast-window',
          shape: 'range',
          x1: FORECAST_START,
          x2: FORECAST_END,
          label: 'Forecast window',
          backgroundColor: '#2563eb1a',
          textColor: '#1f2937',
        },
      ]}
      xAxis={{
        show: true,
        title: 'Timeline',
        labelFormatter: (value: number) => MONTH_LABELS[Math.round(value)] ?? `M${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'ARR ($M)',
        labelFormatter: (value: number) => `$${Math.round(value)}M`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
```

### Cohort Retention Curves
ID: `LineChart.cohort-retention-curves` • Category: charts

**Story focus** - Visualizes how recent signup cohorts retain through the first 120 days of product usage. - Calls out steady improvement quarter-over-quarter with the newest cohort holding above 50%. - Reinforces the retention target so growth teams can spot which cohorts beat the goal. **Key settings** - Keeps straight segments (`smooth={false}`) to preserve milestone-to-milestone retention steps. - Adds a horizontal annotation line at the 45% goal for quick benchmarking. - Expands tooltips to include cohort and milestone context in the retention readout.

```tsx
return (
    <LineChart
      title="Cohort Retention Across Milestones"
      subtitle="Weekly retention milestones by signup quarter"
      height={440}
      series={SERIES}
      smooth={false}
      showPoints
      grid={{ show: true, style: 'dotted' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const milestone = point.data?.milestone ?? `Milestone ${point.x + 1}`;
          const cohort = point.data?.cohort ?? 'Cohort';
          return `${cohort} • ${milestone}: ${point.y.toFixed(0)}% retained`;
        },
      }}
      annotations={[
        {
          id: 'target-retention',
          shape: 'horizontal-line',
          y: TARGET_RETENTION,
          label: 'Target 45% Retention',
          color: '#0EA5E9',
          textColor: '#0F172A',
        },
      ]}
      xAxis={{
        show: true,
        title: 'Customer milestone',
        labelFormatter: (value: number) => MILESTONES[Math.round(value)] ?? `Step ${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Percent of original cohort',
        labelFormatter: (value: number) => `${Math.round(value)}%`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```

### Energy Consumption Portfolio
ID: `LineChart.energy-consumption-portfolio` • Category: charts

**Story focus** - Benchmarks energy usage across three global offices as efficiency projects roll out. - Highlights the hot-weather season where cooling demand spikes so facilities can react. - Tracks progress against the 360 MWh portfolio target while flagging retrofit milestones. **Key settings** - Demonstrates per-series smoothing choices (`smooth` on each series) while the chart default remains unsmoothed. - Utilizes range, vertical, and horizontal annotations to spotlight seasonal context and program milestones. - Formats tooltip readouts with building names and month labels for facilities reporting.

```tsx
return (
    <LineChart
      title="Energy Consumption Across Office Portfolio"
      subtitle="Monthly MWh usage benchmarking against 360 MWh target"
      height={440}
      series={SERIES}
      smooth={false}
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const month = point.data?.month ?? `Month ${point.x + 1}`;
          const building = point.data?.building ?? 'Site';
          return `${building} • ${month}: ${point.y.toFixed(0)} MWh`;
        },
      }}
      annotations={[
        {
          id: 'cooling-season',
          shape: 'range',
          x1: COOLING_SEASON.start,
          x2: COOLING_SEASON.end,
          label: 'Cooling season monitoring',
          backgroundColor: '#0ea5e91a',
          textColor: '#0C4A6E',
        },
        {
          id: 'target-line',
          shape: 'horizontal-line',
          y: PORTFOLIO_TARGET,
          label: 'Target 360 MWh',
          color: '#16A34A',
          textColor: '#14532D',
        },
        {
          id: 'retrofit-complete',
          shape: 'vertical-line',
          x: 3,
          label: 'LED retrofit complete',
          color: '#10B981',
          textColor: '#064E3B',
        },
      ]}
      xAxis={{
        show: true,
        title: '2024 calendar',
        labelFormatter: (value: number) => MONTHS[Math.round(value)] ?? `M${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Energy consumed (MWh)',
        labelFormatter: (value: number) => `${Math.round(value)} MWh`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
```

### Incident Volume Moving Average
ID: `LineChart.incident-volume-moving-average` • Category: charts

**Story focus** - Shows how daily incident intake surged around a major outage and eventually normalized. - Overlays 7-day and 14-day moving averages so reliability leads can compare short- vs. medium-term trendlines. - Highlights a stabilization period driven by the SRE playbook after the spike. **Key settings** - Draws dashed and dotted overlay series using the new per-series `lineStyle` support. - Adds vertical and range annotations to call out root cause analysis and remediation windows. - Turns on multi-series tooltips so moving averages and raw volume can be read together.

```tsx
return (
    <LineChart
      title="Incident Volume with Moving Averages"
      subtitle="SRE daily incident intake and trailing trends"
      height={440}
      series={SERIES}
      smooth
      grid={{ show: true, style: 'solid' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const label = point.data?.window
            ? `${point.data.window}-day avg`
            : 'Incidents';
          const day = DAYS[Math.round(point.x)];
          return `${day} • ${label}: ${point.y.toFixed(1)} incidents`;
        },
      }}
      annotations={[
        {
          id: 'major-outage',
          shape: 'vertical-line',
          x: MAJOR_OUTAGE_DAY - 1,
          label: 'Major outage root cause',
          color: '#DC2626',
          textColor: '#0F172A',
        },
        {
          id: 'stabilization-window',
          shape: 'range',
          x1: STABILIZATION_START,
          x2: STABILIZATION_END,
          label: 'Stabilization playbook',
          backgroundColor: '#22c55e22',
          textColor: '#14532d',
        },
      ]}
      xAxis={{
        show: true,
        title: 'Rolling 30-day window',
        labelFormatter: (value: number) => DAYS[Math.round(value)] ?? `Day ${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Incident count',
        labelFormatter: (value: number) => `${Math.round(value)}`,
      }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
```

### Nps Trend Release Markers
ID: `LineChart.nps-trend-release-markers` • Category: charts

**Story focus** - Tracks the steady climb in NPS as successive product experiences ship throughout the year. - Annotates each launch so teams can correlate release timing with sentiment jumps. - Keeps a green performance line so customer orgs know when the brand clears the NPS target. **Key settings** - Enables area fill to spotlight the magnitude of the NPS climb across months. - Uses vertical annotations with labels to mark major releases on the timeline. - Adds a horizontal annotation at the 55-point goal for immediate benchmarking.

```tsx
return (
    <LineChart
      title="NPS Trend with Product Releases"
      subtitle="Quarterly sentiment lift alongside major launches"
      height={420}
      series={SERIES}
      smooth
      fill
      grid={{ show: true, style: 'dashed' }}
      legend={{ show: false }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const month = point.data?.month ?? `Month ${point.x + 1}`;
          return `${month} NPS: ${point.y.toFixed(0)}`;
        },
      }}
      annotations={[
        ...RELEASE_MARKERS.map((marker) => ({
          id: marker.id,
          shape: 'vertical-line' as const,
          x: marker.x,
          label: marker.label,
          color: '#6366F1',
          textColor: '#312E81',
          backgroundColor: '#E0E7FF',
        })),
        {
          id: 'nps-target',
          shape: 'horizontal-line',
          y: 55,
          label: 'Target 55 NPS',
          color: '#16A34A',
          textColor: '#0F172A',
        },
      ]}
      xAxis={{
        show: true,
        title: '2024 timeline',
        labelFormatter: (value: number) => MONTHS[Math.round(value)] ?? `M${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Net Promoter Score',
        labelFormatter: (value: number) => `${Math.round(value)}`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
```
