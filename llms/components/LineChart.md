# Line Chart

Basic line chart visualization component.

## Metadata

- Import: `import { LineChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, line, timeseries
- Docs: https://plocks.dev/charts/LineChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/LineChart

## Props

- `data`: ChartDataPoint[] — Data points (single series) or array of series (multiseries)
- `series`: LineChartSeries[] — Multiple data series
- `lineColor`: string — Line color (for single series)
- `lineThickness`: number = 2 — Line thickness (for single series)
- `lineStyle`: 'solid' | 'dashed' | 'dotted' = 'solid' — Line style (for single series)
- `showPoints`: boolean = true — Show data points (for single series)
- `pointSize`: number = 4 — Point size (for single series)
- `pointColor`: string — Point color (for single series)
- `smooth`: boolean = false — Smooth curve
- `fill`: boolean = false — Fill area under line
- `fillColor`: ChartFill — Area fill. A color fades from `fillOpacity` at the line to transparent at the baseline; a gradient is used exactly as given.
- `fillOpacity`: number = 0.3 — Fill opacity
- `areaFillMode`: 'single' | 'series' = 'single' — How to distribute fill across series when multiple are present
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid configuration
- `legend`: ChartLegend — Legend configuration
- `tooltip`: ChartTooltip<ChartDataPoint> — Tooltip configuration
- `animation`: ChartAnimation — Animation configuration
- `enableCrosshair`: boolean — Show a vertical crosshair that follows the nearest point
- `enableSeriesToggle`: boolean — Enable toggling series visibility from legend
- `liveTooltip`: boolean — Update tooltip continuously while moving (not just on press)
- `multiTooltip`: boolean — Show multi-series aggregated tooltip aligned to crosshair
- `enablePanZoom`: boolean — Enable pan and pinch zoom interactions
- `zoomMode`: 'x' | 'y' | 'both' — Which axes can zoom
- `minZoom`: number — Minimum zoom factor relative to original domain (e.g. 0.1 = 10%)
- `onDomainChange`: (xDomain: [number, number], yDomain: [number, number]) => void — Callback when visible data domain changes
- `enableWheelZoom`: boolean — Enable wheel zoom on web
- `wheelZoomStep`: number — Wheel zoom step factor (default 0.1)
- `invertWheelZoom`: boolean — Invert wheel zoom direction
- `resetOnDoubleTap`: boolean — Double-tap (or double-click on web) resets zoom
- `clampToInitialDomain`: boolean — Clamp pan/zoom so domains never exceed original data bounds
- `invertPinchZoom`: boolean — Invert pinch gesture direction (scale grows when fingers move closer)
- `disableAnimations`: boolean — Disable all Reanimated-driven animations (debug / perf fallback)
- `decimationThreshold`: number — Apply LTOB data decimation above this point count
- `xScaleType`: 'linear' | 'log' | 'time' — X axis scale type
- `yScaleType`: 'linear' | 'log' | 'time' — Y axis scale type
- `enableBrushZoom`: boolean — Enable shift+drag brush to zoom (web)
- `annotations`: ChartAnnotation[] — Optional chart annotations/markers

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface LineChartSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Series name */
  name?: string;
  /** Data points for this series */
  data: ChartDataPoint[];
  /** Line color for this series */
  color?: string;
  /** Line thickness for this series */
  thickness?: number;
  /** Optional alias for line thickness */
  lineThickness?: number;
  /** Line style for this series */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Optional alias for line style */
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  /** Show points for this series */
  showPoints?: boolean;
  /** Point size for this series */
  pointSize?: number;
  /** Point color for this series */
  pointColor?: string;
  /** Whether this series is visible */
  visible?: boolean;
  /** Custom metadata for interactions */
  metadata?: any;
  /** Override fill visibility for area charts */
  areaFill?: boolean;
  /**
   * Area fill for this series. A color fades from `fillOpacity` at the line to
   * transparent at the baseline; a gradient is used exactly as given.
   */
  fillColor?: ChartFill;
  /** Optional fill opacity for the series area */
  fillOpacity?: number;
  /** Override smooth setting per series */
  smooth?: boolean;
}
```

## Examples

### Basics

Simple random data line chart with title.

```tsx
import { LineChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      // title="Monthly active customers"
      // subtitle="FY25"
      h={320}
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

`data.ts`

```ts
export const SERIES = [
  {
    id: 'north-america',
    name: 'North America',
    data: [
      { x: 1, y: 120 },
      { x: 2, y: 138 },
      { x: 3, y: 152 },
      { x: 4, y: 167 },
      { x: 5, y: 176 },
      { x: 6, y: 189 },
      { x: 7, y: 205 },
      { x: 8, y: 220 },
      { x: 9, y: 232 },
      { x: 10, y: 246 },
      { x: 11, y: 260 },
      { x: 12, y: 278 },
    ],
  },
  {
    id: 'emea',
    name: 'EMEA',
    data: [
      { x: 1, y: 96 },
      { x: 2, y: 108 },
      { x: 3, y: 117 },
      { x: 4, y: 126 },
      { x: 5, y: 134 },
      { x: 6, y: 142 },
      { x: 7, y: 150 },
      { x: 8, y: 158 },
      { x: 9, y: 168 },
      { x: 10, y: 175 },
      { x: 11, y: 182 },
      { x: 12, y: 191 },
    ],
  },
];
```

### Smooth Area

Smoothed dual-series line chart with gradient fill and custom legend.

```tsx
import { LineChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="Revenue trajectory"
      subtitle="Smoothed forecast vs. actuals"
      h={320}
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

`data.ts`

```ts
export const SERIES = [
  {
    id: 'projected-revenue',
    name: 'Projected revenue',
    data: [
      { x: 1, y: 940 },
      { x: 2, y: 980 },
      { x: 3, y: 1020 },
      { x: 4, y: 1090 },
      { x: 5, y: 1175 },
      { x: 6, y: 1260 },
      { x: 7, y: 1340 },
      { x: 8, y: 1415 },
      { x: 9, y: 1490 },
      { x: 10, y: 1575 },
      { x: 11, y: 1660 },
      { x: 12, y: 1740 },
    ],
  },
  {
    id: 'actual-revenue',
    name: 'Actual revenue',
    data: [
      { x: 1, y: 910 },
      { x: 2, y: 960 },
      { x: 3, y: 1005 },
      { x: 4, y: 1088 },
      { x: 5, y: 1150 },
      { x: 6, y: 1225 },
      { x: 7, y: 1312 },
      { x: 8, y: 1384 },
      { x: 9, y: 1478 },
      { x: 10, y: 1532 },
      { x: 11, y: 1610 },
      { x: 12, y: 1705 },
    ],
  },
];
```

### Time Series

Time-series interaction example with brush zoom and custom tooltip formatting.

```tsx
import { LineChart } from '@plocks/charts';

import { SERIES, formatter } from './data';

export function Demo() {
  return (
    <LineChart
      title="Web analytics"
      subtitle="Sessions and goals over time"
      h={360}
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

`data.ts`

```ts
export const date = (month: number, value: number) => ({ x: Date.UTC(2024, month, 1), y: value });

export const SERIES = [
  {
    id: 'sessions',
    name: 'Sessions',
    data: [
      date(0, 4200),
      date(1, 4680),
      date(2, 5120),
      date(3, 5560),
      date(4, 6025),
      date(5, 6480),
      date(6, 7020),
      date(7, 7385),
      date(8, 7810),
      date(9, 8050),
      date(10, 8320),
      date(11, 8585),
    ],
  },
  {
    id: 'goal-completions',
    name: 'Goal completions',
    data: [
      date(0, 520),
      date(1, 560),
      date(2, 595),
      date(3, 640),
      date(4, 705),
      date(5, 760),
      date(6, 812),
      date(7, 860),
      date(8, 905),
      date(9, 948),
      date(10, 980),
      date(11, 1015),
    ],
  },
];

export const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
```

### Gradient area fill

**Key settings** - `fillColor` accepts a gradient as well as a color. A plain color fades from `fillOpacity` at the line to transparent at the baseline; a gradient is used exactly as given. - `extent: 'plot'` spans one gradient across the whole plot, so peaks reach the deep end while quiet hours stay pale. Set `fillColor` on an individual series to give each area its own gradient.

```tsx
import { LineChart } from '@plocks/charts';

import { CONCURRENT_VIEWERS } from './data';

export function Demo() {
  return (
    <LineChart
      title="Concurrent viewers"
      subtitle="One gradient spans the plot: the evening peak reaches the deepest blue"
      h={320}
      data={CONCURRENT_VIEWERS}
      smooth
      fill
      showPoints={false}
      lineThickness={2.5}
      fillColor={{
        angle: 90,
        extent: 'plot',
        stops: [
          { offset: 0, color: '#1c5cab', opacity: 0.9 },
          { offset: 1, color: '#86b6ef', opacity: 0.12 },
        ],
      }}
      grid={{ show: true }}
      xAxis={{
        show: true,
        title: 'Hour',
        labelFormatter: (value) => `${String(Math.round(value)).padStart(2, '0')}:00`,
      }}
      yAxis={{
        show: true,
        title: 'Viewers (thousands)',
        labelFormatter: (value) => `${Math.round(value)}k`,
      }}
      tooltip={{
        show: true,
        formatter: (point) => `${point.y}k viewers at ${String(point.x).padStart(2, '0')}:00`,
      }}
    />
  );
}
```

`data.ts`

```ts
// Concurrent viewers (thousands) across a 24-hour broadcast day.
export const CONCURRENT_VIEWERS = [
  { x: 0, y: 18 }, { x: 1, y: 14 }, { x: 2, y: 11 }, { x: 3, y: 9 },
  { x: 4, y: 8 }, { x: 5, y: 10 }, { x: 6, y: 16 }, { x: 7, y: 24 },
  { x: 8, y: 31 }, { x: 9, y: 28 }, { x: 10, y: 26 }, { x: 11, y: 29 },
  { x: 12, y: 38 }, { x: 13, y: 35 }, { x: 14, y: 30 }, { x: 15, y: 32 },
  { x: 16, y: 37 }, { x: 17, y: 45 }, { x: 18, y: 58 }, { x: 19, y: 72 },
  { x: 20, y: 81 }, { x: 21, y: 76 }, { x: 22, y: 54 }, { x: 23, y: 33 },
];
```

### Zoom & pan

Interactive zoom and pan on desktop web. **Scroll** the wheel over the plot to zoom, **drag** to pan, hold **Shift and drag** a box to zoom into a region, and **double-click** to reset. Note that wheel zoom requires both `enableWheelZoom` **and** `enablePanZoom` — the wheel handler is a no-op when panning is disabled. `zoomMode="x"` constrains zooming to the time axis.

```tsx
import { LineChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="Product engagement"
      subtitle="Scroll to zoom · drag to pan · Shift-drag to box-zoom · double-click to reset"
      h={340}
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

`data.ts`

```ts
export // A denser series so zooming reveals detail. Two years of weekly-ish points.
const makeSeries = (id: string, name: string, color: string, base: number, amp: number, phase: number) => ({
  id,
  name,
  color,
  data: Array.from({ length: 104 }, (_, i) => ({
    x: i,
    y: Math.round(
      base +
        amp * Math.sin(i / 6 + phase) +
        (i / 104) * amp * 1.5 +
        Math.sin(i / 2.3) * amp * 0.25
    ),
  })),
});

export const SERIES = [
  makeSeries('sessions', 'Sessions', '#4C6EF5', 420, 90, 0),
  makeSeries('signups', 'Signups', '#20C997', 180, 55, 1.2),
];
```

### Arr Progress Forecast

**Story focus** - Compares current ARR performance for each GTM region against the latest forecast trajectory. - Highlights the forward-looking window so teams can inspect upside or downside risk. - Uses matching dashed overlays to keep forecast lines aligned with their actual counterparts. **Key settings** - Provides paired solid and dashed series per region, sharing colors for quick comparison. - Applies a range annotation to tint the forecast horizon on the right side of the chart. - Enables multi-series tooltip formatting with ARR values expressed in millions.

```tsx
import { LineChart } from '@plocks/charts';

import { FORECAST_END, FORECAST_START, MONTH_LABELS, SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="ARR Progression vs. Forecast"
      subtitle="GTM regions actualized ARR with forward-looking plans"
      h={440}
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

`data.ts`

```ts
export type RegionKey = 'americas' | 'emea' | 'apac';

export const MONTH_LABELS = [
  'Jan 2024',
  'Feb 2024',
  'Mar 2024',
  'Apr 2024',
  'May 2024',
  'Jun 2024',
  'Jul 2024',
  'Aug 2024',
  'Sep 2024',
  'Oct 2024',
  'Nov 2024',
  'Dec 2024',
  'Jan 2025',
  'Feb 2025',
  'Mar 2025',
  'Apr 2025',
];

export const REGION_COLORS: Record<RegionKey, string> = {
  americas: '#2563EB',
  emea: '#22C55E',
  apac: '#F59E0B',
};

export const ACTUAL_VALUES: Record<RegionKey, number[]> = {
  americas: [118, 124, 131, 139, 147, 156, 166, 177, 189, 202, 214, 228],
  emea: [86, 91, 96, 102, 107, 113, 119, 125, 131, 138, 144, 151],
  apac: [62, 66, 70, 74, 79, 84, 90, 96, 103, 110, 118, 125],
};

export const FORECAST_DELTA: Record<RegionKey, number[]> = {
  americas: [240, 255, 271, 288],
  emea: [159, 168, 177, 187],
  apac: [133, 142, 152, 163],
};

export const buildActualSeries = (region: RegionKey) => ({
  id: `${region}-actual`,
  name: `${region.toUpperCase()} Actual`,
  color: REGION_COLORS[region],
  data: ACTUAL_VALUES[region].map((value, index) => ({
    x: index,
    y: value,
    data: { label: MONTH_LABELS[index], region },
  })),
});

export const buildForecastSeries = (region: RegionKey) => {
  const actual = ACTUAL_VALUES[region];
  const forecast = FORECAST_DELTA[region];
  const baselineIndex = actual.length - 1;
  const baselineValue = actual[baselineIndex];
  return {
    id: `${region}-forecast`,
    name: `${region.toUpperCase()} Forecast`,
    color: REGION_COLORS[region],
    lineStyle: 'dashed' as const,
    showPoints: false,
    data: [
      { x: baselineIndex, y: baselineValue, data: { label: MONTH_LABELS[baselineIndex], region, type: 'baseline' } },
      ...forecast.map((value, offset) => {
        const index = baselineIndex + 1 + offset;
        return {
          x: index,
          y: value,
          data: { label: MONTH_LABELS[index], region, type: 'forecast' },
        };
      }),
    ],
  };
};

export const SERIES = [
  buildActualSeries('americas'),
  buildActualSeries('emea'),
  buildActualSeries('apac'),
  buildForecastSeries('americas'),
  buildForecastSeries('emea'),
  buildForecastSeries('apac'),
];

export const FORECAST_START = ACTUAL_VALUES.americas.length - 0.5;

export const FORECAST_END = MONTH_LABELS.length - 1 + 0.25;
```

### Cohort Retention Curves

**Story focus** - Visualizes how recent signup cohorts retain through the first 120 days of product usage. - Calls out steady improvement quarter-over-quarter with the newest cohort holding above 50%. - Reinforces the retention target so growth teams can spot which cohorts beat the goal. **Key settings** - Keeps straight segments (`smooth={false}`) to preserve milestone-to-milestone retention steps. - Adds a horizontal annotation line at the 45% goal for quick benchmarking. - Expands tooltips to include cohort and milestone context in the retention readout.

```tsx
import { LineChart } from '@plocks/charts';

import { MILESTONES, SERIES, TARGET_RETENTION } from './data';

export function Demo() {
  return (
    <LineChart
      title="Cohort Retention Across Milestones"
      subtitle="Weekly retention milestones by signup quarter"
      h={440}
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

`data.ts`

```ts
export const MILESTONES = ['Signup', 'Day 7', 'Day 30', 'Day 60', 'Day 90', 'Day 120'];

export const COHORT_VALUES = {
  '2024 Q1 Cohort': [100, 64, 51, 44, 39, 36],
  '2024 Q2 Cohort': [100, 68, 55, 48, 43, 40],
  '2024 Q3 Cohort': [100, 72, 59, 52, 47, 44],
  '2024 Q4 Cohort': [100, 75, 63, 57, 54, 50],
} as const;

export const SERIES = Object.entries(COHORT_VALUES).map(([name, values]) => ({
  id: name,
  name,
  data: values.map((value, index) => ({
    x: index,
    y: value,
    data: { milestone: MILESTONES[index], cohort: name },
  })),
  pointSize: 5,
}));

export const TARGET_RETENTION = 45;
```

### Energy Consumption Portfolio

**Story focus** - Benchmarks energy usage across three global offices as efficiency projects roll out. - Highlights the hot-weather season where cooling demand spikes so facilities can react. - Tracks progress against the 360 MWh portfolio target while flagging retrofit milestones. **Key settings** - Demonstrates per-series smoothing choices (`smooth` on each series) while the chart default remains unsmoothed. - Utilizes range, vertical, and horizontal annotations to spotlight seasonal context and program milestones. - Formats tooltip readouts with building names and month labels for facilities reporting.

```tsx
import { LineChart } from '@plocks/charts';

import { COOLING_SEASON, MONTHS, PORTFOLIO_TARGET, SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="Energy Consumption Across Office Portfolio"
      subtitle="Monthly MWh usage benchmarking against 360 MWh target"
      h={440}
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

`data.ts`

```ts
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const BUILDINGS = {
  'New York HQ': {
    smooth: true,
    values: [412, 405, 398, 384, 372, 367, 362, 358, 361, 369, 378, 389],
  },
  'Amsterdam Campus': {
    smooth: true,
    values: [308, 302, 296, 288, 281, 277, 274, 272, 275, 279, 284, 290],
  },
  'Singapore Hub': {
    smooth: false,
    values: [352, 348, 345, 341, 338, 336, 334, 331, 333, 336, 340, 343],
  },
} as const;

export const SERIES = Object.entries(BUILDINGS).map(([name, meta]) => ({
  id: name,
  name,
  smooth: meta.smooth,
  lineThickness: meta.smooth ? 3 : 2,
  data: meta.values.map((value, index) => ({
    x: index,
    y: value,
    data: { building: name, month: MONTHS[index], value },
  })),
}));

export const COOLING_SEASON = { start: 5.5, end: 8.5 };

export const PORTFOLIO_TARGET = 360;
```

### Incident Volume Moving Average

**Story focus** - Shows how daily incident intake surged around a major outage and eventually normalized. - Overlays 7-day and 14-day moving averages so reliability leads can compare short- vs. medium-term trendlines. - Highlights a stabilization period driven by the SRE playbook after the spike. **Key settings** - Draws dashed and dotted overlay series using the new per-series `lineStyle` support. - Adds vertical and range annotations to call out root cause analysis and remediation windows. - Turns on multi-series tooltips so moving averages and raw volume can be read together.

```tsx
import { LineChart } from '@plocks/charts';

import { DAYS, MAJOR_OUTAGE_DAY, SERIES, STABILIZATION_END, STABILIZATION_START } from './data';

export function Demo() {
  return (
    <LineChart
      title="Incident Volume with Moving Averages"
      subtitle="SRE daily incident intake and trailing trends"
      h={440}
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

`data.ts`

```ts
export const DAYS = Array.from({ length: 30 }, (_, index) => `Day ${index + 1}`);

export const INCIDENT_COUNT = [
  28, 26, 32, 34, 30, 28, 25, 33, 38, 44,
  41, 36, 34, 39, 42, 48, 62, 71, 56, 44,
  38, 34, 31, 28, 32, 36, 40, 37, 33, 30,
];

export const mapSeries = (values: number[]) =>
  values.map((value, index) => ({
    x: index,
    y: value,
    data: { dayLabel: DAYS[index], value },
  }));

export const computeMovingAverage = (values: number[], window: number) => {
  const points: { x: number; y: number }[] = [];
  let rollingTotal = 0;
  for (let index = 0; index < values.length; index += 1) {
    rollingTotal += values[index];
    if (index >= window) {
      rollingTotal -= values[index - window];
    }
    if (index >= window - 1) {
      points.push({ x: index, y: +(rollingTotal / window).toFixed(2) });
    }
  }
  return points.map((point) => ({
    ...point,
    data: { dayLabel: DAYS[point.x], window },
  }));
};

export const SERIES = [
  {
    id: 'incidents',
    name: 'Daily Incidents',
    data: mapSeries(INCIDENT_COUNT),
    pointSize: 4,
  },
  {
    id: 'ma-7',
    name: '7-day Moving Average',
    lineStyle: 'dashed' as const,
    showPoints: false,
    data: computeMovingAverage(INCIDENT_COUNT, 7),
  },
  {
    id: 'ma-14',
    name: '14-day Moving Average',
    lineStyle: 'dotted' as const,
    showPoints: false,
    data: computeMovingAverage(INCIDENT_COUNT, 14),
  },
];

export const MAJOR_OUTAGE_DAY = 17;

export const STABILIZATION_START = 20.5;

export const STABILIZATION_END = 26.5;
```

### Nps Trend Release Markers

**Story focus** - Tracks the steady climb in NPS as successive product experiences ship throughout the year. - Annotates each launch so teams can correlate release timing with sentiment jumps. - Keeps a green performance line so customer orgs know when the brand clears the NPS target. **Key settings** - Enables area fill to spotlight the magnitude of the NPS climb across months. - Uses vertical annotations with labels to mark major releases on the timeline. - Adds a horizontal annotation at the 55-point goal for immediate benchmarking.

```tsx
import { LineChart } from '@plocks/charts';

import { MONTHS, RELEASE_MARKERS, SERIES } from './data';

export function Demo() {
  return (
    <LineChart
      title="NPS Trend with Product Releases"
      subtitle="Quarterly sentiment lift alongside major launches"
      h={420}
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

`data.ts`

```ts
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export const NPS_VALUES = [43, 45, 47, 52, 54, 58, 61, 64];

export const SERIES = [
  {
    id: 'nps-score',
    name: 'NPS',
    areaFill: true,
    fillOpacity: 0.25,
    data: NPS_VALUES.map((value, index) => ({
      x: index,
      y: value,
      data: { month: MONTHS[index], value },
    })),
  },
];

export const RELEASE_MARKERS = [
  { id: 'apr-release', x: 3, label: 'Onboarding revamp' },
  { id: 'jun-release', x: 5, label: 'Mobile UI refresh' },
  { id: 'jul-release', x: 6.5, label: 'Insights launch' },
];
```
