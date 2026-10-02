# Heatmap Chart

HeatmapChart shows values in a color-coded grid to reveal patterns across two dimensions.

## Metadata

- Import: `import { HeatmapChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, heatmap, matrix
- Docs: https://plocks.dev/charts/HeatmapChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/HeatmapChart

## Props

- `data` (required): HeatmapCell[] | HeatmapMatrixInput — Heatmap data points or matrix-style input
- `colorScale`: HeatmapColorScaleConfig — Shared color scale. Defaults to a single-hue sequential ramp from the theme.
- `cellSize`: HeatmapCellSize — Explicit cell size overrides
- `gap`: number = 2 — Gap between cells in pixels
- `xAxis`: ChartAxis — X-axis configuration
- `yAxis`: ChartAxis — Y-axis configuration
- `grid`: ChartGrid — Grid line configuration
- `legend`: ChartLegend — Legend configuration (often used for color scales)
- `tooltip`: ChartTooltip<HeatmapCell> | HeatmapTooltipOptions — Tooltip configuration or simplified toggle
- `enableCrosshair`: boolean = true — Highlight row/column under the cursor
- `multiTooltip`: boolean = true — Enable aggregated tooltip for multiple cells
- `liveTooltip`: boolean = false — Keep tooltip following the pointer
- `annotations`: any[] — Additional annotations to display
- `maxAnimatedCells`: number = 400 — Maximum number of cells to animate before switching to fast static rendering
- `disableAnimation`: boolean = false — When true, force fast static rendering (no per-cell animation)
- `showCellLabels`: boolean | HeatmapCellVisibilityPredicate | HeatmapLabelDisplayRule — Control whether cell labels render
- `valueFormatter`: HeatmapValueFormatter | HeatmapValueFormatPreset | { preset: HeatmapValueFormatPreset; decimals?: number; suffix?: string } — Custom formatter for cell labels and tooltip values
- `cellCornerRadius`: number = 2 — Corner radius applied to heatmap cells
- `hoverHighlight`: HeatmapHoverHighlightConfig — Customize hover highlight overlays
- `gradientLegend`: HeatmapGradientLegendConfig — Enable and customize gradient legend display
- `accessibilityTable`: HeatmapAccessibilityTableOptions — Render hidden accessible table representation
- `onDataTable`: (payload: HeatmapDataTablePayload) => void — Callback invoked with flattened data table payload

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface HeatmapCell {
  /** Column index or x-axis value for the cell */
  x: number;
  /** Row index or y-axis value for the cell */
  y: number;
  /** Numeric value represented by the cell */
  value: number;
  /** Optional label displayed for the cell */
  label?: string;
  /** Override color used for the cell */
  color?: string;
  /** Arbitrary metadata associated with the cell */
  data?: any;
  /** Pre-formatted value for display */
  formattedValue?: string;
}

export interface HeatmapMatrixInput {
  /** Row labels for the matrix input */
  rows: (string | number)[];
  /** Column labels for the matrix input */
  cols: (string | number)[];
  /** Matrix of values aligned with rows and columns */
  values: (number | null | undefined)[][];
}

export type HeatmapColorScaleConfig = ColorScaleConfig & {
  /** Color applied when the cell value is null */
  nullColor?: string;
};

export interface HeatmapCellSize {
  /** Width of each heatmap cell in pixels */
  width?: number;
  /** Height of each heatmap cell in pixels */
  height?: number;
}

export interface HeatmapTooltipOptions {
  /** Whether the tooltip should be displayed */
  show?: boolean;
  /** Whether to aggregate values when hovering multiple cells */
  aggregate?: boolean;
}

export type HeatmapCellVisibilityPredicate = (input: {
  /** Cell source metadata */
  cell: HeatmapCell;
  /** Rendered cell width */
  width: number;
  /** Rendered cell height */
  height: number;
  /** Share of row contributed by the cell (0-1) */
  rowPercent: number;
  /** Share of column contributed by the cell (0-1) */
  columnPercent: number;
}) => boolean;

export interface HeatmapLabelDisplayRule {
  /** Minimum absolute value required to show the label */
  minValue?: number;
  /** Minimum share of the row required to show the label (0-1) */
  minRowPercent?: number;
  /** Minimum share of the column required to show the label (0-1) */
  minColumnPercent?: number;
  /** Minimum share of the overall total required to show the label (0-1) */
  minOverallPercent?: number;
}

export type HeatmapValueFormatter = (input: {
  /** Raw numeric value */
  value: number;
  /** Cell source metadata */
  cell: HeatmapCell;
  /** Minimum value observed in dataset */
  min: number;
  /** Maximum value observed in dataset */
  max: number;
  /** Sum of all values in the same row */
  rowSum: number;
  /** Sum of all values in the same column */
  columnSum: number;
  /** Sum of all values across the dataset */
  totalSum: number;
  /** Share of row contributed by the cell (0-1) */
  rowPercent: number;
  /** Share of column contributed by the cell (0-1) */
  columnPercent: number;
  /** Share of entire dataset contributed by the cell (0-1) */
  overallPercent: number;
}) => string;
```

## Examples

### Basics

```tsx
import { HeatmapChart } from '@plocks/charts';

import { DAYS, SESSIONS, UTILIZATION } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Support ticket load"
      subtitle="Average tickets per hour"
      h={320}
      data={{ rows: SESSIONS, cols: DAYS, values: UTILIZATION }}
      cellSize={{ width: 48, height: 44 }}
      gap={4}
      colorScale={{
        domain: [0, 30],
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

`data.ts`

```ts
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const SESSIONS = ['Morning', 'Afternoon', 'Evening'];

export const UTILIZATION = [
  [12, 18, 25, 22, 28],
  [8, 14, 19, 24, 20],
  [6, 9, 12, 15, 11],
];
```

### GitHub Contributions

GitHub-style contribution calendar generated with a 7x53 grid (weeks x weekdays) and a 5-step color scale.

```tsx
import { HeatmapChart } from '@plocks/charts';

import { COLUMNS, CONTRIBUTION_MATRIX, PALETTE, WEEKDAY_LABELS } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Weekly contributions"
      subtitle="GitHub-style activity calendar"
      h={280}
      data={{ rows: WEEKDAY_LABELS, cols: COLUMNS, values: CONTRIBUTION_MATRIX }}
      cellSize={{ width: 12, height: 12 }}
      gap={2}
      colorScale={{ domain: [0, 4], colors: PALETTE }}
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

`data.ts`

```ts
export const WEEKS = 52;

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PALETTE = ['#EBEDF0', '#C6E48B', '#7BC96F', '#239A3B', '#196127'];

export const COLUMNS = Array.from({ length: WEEKS }, (_, index) => `W${index + 1}`);

/** Activity levels (0-4) per weekday/week — deterministic so the demo never shifts. */
export const CONTRIBUTION_MATRIX: number[][] = WEEKDAY_LABELS.map((_, row) =>
  Array.from({ length: WEEKS }, (_, col) => {
    const wave = Math.sin(col / 4) + Math.cos((row + col) / 3);
    const seasonal = Math.cos(col / 12) + row * 0.2;
    const score = wave + seasonal + 2;
    return Math.max(0, Math.min(4, Math.round(score)));
  })
);
```

### Employee Engagement Scores

Visualizes employee engagement survey scores per team across key dimensions to spotlight strengths and low-score focus areas.

```tsx
import { HeatmapChart } from '@plocks/charts';

import { DIMENSIONS, SCORES, TEAMS } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Employee engagement survey"
      subtitle="Dimension scores (1-5) by team"
      h={360}
      data={{ rows: TEAMS, cols: DIMENSIONS, values: SCORES }}
      cellSize={{ width: 96, height: 48 }}
      gap={4}
      colorScale={{
        domain: [1, 5],
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

`data.ts`

```ts
export const TEAMS = ['Product', 'Engineering', 'Sales', 'Customer Success', 'Operations'];

export const DIMENSIONS = ['Leadership', 'Growth', 'Recognition', 'Workload', 'Inclusion', 'Purpose'];

export const SCORES = [
  [4.2, 4.4, 3.9, 3.2, 4.5, 4.1],
  [4.6, 4.1, 3.8, 3.4, 4.3, 3.9],
  [3.8, 3.6, 4.2, 3.1, 3.7, 3.5],
  [4.5, 4.2, 4.0, 3.6, 4.4, 4.1],
  [4.1, 3.9, 3.7, 3.3, 4.0, 3.8],
];
```

### Infrastructure Cpu Utilization

Heatmap of average CPU utilization across infrastructure clusters and daily time blocks, highlighting hotspots that approach saturation bands.

```tsx
import { HeatmapChart } from '@plocks/charts';

import { CLUSTERS, CPU_UTILIZATION, TIME_BLOCKS } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Infrastructure CPU utilization"
      subtitle="Average utilization (%) across compute clusters"
      h={360}
      data={{ rows: CLUSTERS, cols: TIME_BLOCKS, values: CPU_UTILIZATION }}
      cellSize={{ width: 90, height: 44 }}
      gap={6}
      colorScale={{
        domain: [0, 100],
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

`data.ts`

```ts
export const CLUSTERS = ['Edge - West', 'Edge - East', 'Core - EU', 'Core - US', 'Core - APAC'];

export const TIME_BLOCKS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

export const CPU_UTILIZATION = [
  [28, 44, 57, 65, 61, 43],
  [52, 66, 81, 88, 74, 62],
  [47, 58, 70, 83, 79, 60],
  [35, 49, 63, 72, 68, 55],
  [39, 55, 69, 76, 71, 58],
];
```

### Marketing Email Performance

Tracks marketing email click-through rates by segment and day of week to quickly surface best-performing send windows.

```tsx
import { HeatmapChart } from '@plocks/charts';

import { CLICK_RATES, DAYS, SEGMENTS } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Email click-through performance"
      subtitle="Daily CTR (%) across audience segments"
      h={320}
      data={{ rows: SEGMENTS, cols: DAYS, values: CLICK_RATES }}
      cellSize={{ width: 80, height: 44 }}
      gap={4}
      colorScale={{
        domain: [10, 45],
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

`data.ts`

```ts
export const SEGMENTS = ['New leads', 'Free trials', 'Customers', 'Churn risk'];

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CLICK_RATES = [
  [18, 22, 35, 31, 29, 26, 20],
  [24, 28, 38, 36, 33, 30, 27],
  [14, 18, 22, 20, 19, 17, 16],
  [30, 34, 42, 39, 36, 32, 28],
];
```

### Quality Assurance Pass Rates

Shows quality assurance pass rates for each regression suite across release candidates, emphasizing areas that fall below the team’s quality threshold.

```tsx
import { HeatmapChart } from '@plocks/charts';

import { PASS_RATES, RELEASES, SUITES } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="QA pass rates by release"
      subtitle="Regression suites vs. release candidates"
      h={340}
      data={{ rows: SUITES, cols: RELEASES, values: PASS_RATES }}
      cellSize={{ width: 110, height: 48 }}
      gap={4}
      colorScale={{
        domain: [80, 100],
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

`data.ts`

```ts
export const SUITES = ['Authentication', 'Checkout', 'APIs', 'Mobile app', 'Reporting'];

export const RELEASES = ['RC1', 'RC2', 'RC3', 'RC4'];

export const PASS_RATES = [
  [92, 95, 97, 96],
  [88, 91, 93, 94],
  [94, 96, 98, 99],
  [85, 89, 92, 93],
  [90, 92, 95, 96],
];
```

### Support Backlog Priority

Maps support ticket backlog volume across product modules and priority levels to expose severity hot spots.

```tsx
import { HeatmapChart } from '@plocks/charts';

import { BACKLOG, MODULES, PRIORITIES } from './data';

export function Demo() {
  return (
    <HeatmapChart
      title="Support backlog by module"
      subtitle="Open tickets by severity priority"
      h={360}
      data={{ rows: MODULES, cols: PRIORITIES, values: BACKLOG }}
      cellSize={{ width: 108, height: 48 }}
      gap={6}
      colorScale={{
        type: 'sequential',
        interpolation: 'log',
        domain: [1, 32],
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

`data.ts`

```ts
export const MODULES = ['Authentication', 'Billing', 'Analytics', 'Messaging', 'Integrations', 'Admin'];

export const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];

export const BACKLOG = [
  [6, 14, 21, 9],
  [2, 11, 18, 13],
  [5, 13, 25, 19],
  [3, 9, 17, 12],
  [1, 7, 15, 10],
  [0, 6, 12, 9],
];
```
