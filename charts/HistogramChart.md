# Histogram Chart

HistogramChart groups continuous values into bins to show their distribution.

## Metadata

- Import: `import { HistogramChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, histogram, distribution
- Docs: https://plocks.dev/charts/HistogramChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/HistogramChart

## Props

- `data` (required): number[] — Raw values used to build the histogram
- `bins`: number — Explicit number of bins (overrides method)
- `binMethod`: 'sturges' | 'sqrt' | 'fd' = 'sturges' — Bin selection heuristic
- `showDensity`: boolean = true — Show density (KDE) overlay line
- `bandwidth`: number — Gaussian kernel bandwidth (auto if not provided)
- `density`: boolean = true — Normalize histogram to probability density (area=1)
- `barColor`: ChartFill — Bar fill — a color or a gradient. Defaults to the theme's first palette slot.
- `colorScale`: HistogramColorScale — Color each bin by its position or count. Takes precedence over `barColor`.
- `barOpacity`: number = 0.8 — Opacity for bars (0-1)
- `barStroke`: string — Bar outline color
- `barStrokeWidth`: number — Bar outline width in px (defaults to 1 when `barStroke` is set)
- `densityColor`: string — Density line color. Defaults to the theme's second palette slot.
- `densityThickness`: number = 2 — Density line thickness
- `barRadius`: number = 2 — Rounded bar corners
- `barGap`: number = 0.08 — Gap ratio between bars (0-1)
- `multiTooltip`: boolean = true — Enable multi-series tooltip aggregation
- `liveTooltip`: boolean = true — Keep tooltip following the pointer
- `enableCrosshair`: boolean = true — Enable crosshair indicator
- `tooltip`: ChartTooltip<HistogramBin> — Tooltip configuration
- `valueFormatter`: (count: number, bin: HistogramBin) => string — Custom value formatter for tooltips
- `xAxis`: ChartAxis — Customise X axis presentation
- `yAxis`: ChartAxis — Customise Y axis presentation
- `grid`: ChartGrid — Grid line configuration
- `legend`: ChartLegend — Legend configuration
- `annotations`: ChartAnnotation[] — Render annotation markers (thresholds, targets)
- `rangeHighlights`: Array<{ id: string | number; start: number; end: number; color?: string; opacity?: number; }> — Highlight value ranges with background fills
- `onBinFocus`: (bin: HistogramBinSummary) => void — Called whenever the active bin under the pointer changes
- `onBinBlur`: (bin: HistogramBinSummary | null) => void — Called when focus leaves the current bin

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type HistogramColorScale =
  | (ColorScaleConfig & {
      /**
       * What the scale reads from each bin:
       * - `'x'` (default): the bin's midpoint on the x axis — color by *where* values fall.
       * - `'count'`: the bin's sample count — color by *how many*.
       */
      by?: 'x' | 'count';
    })
  | ((bin: HistogramBinSummary) => string | undefined);

export interface HistogramBin {
  /** Inclusive lower bound of the bin */
  start: number;
  /** Exclusive upper bound of the bin */
  end: number;
  /** Number of samples that fell into the bin */
  count: number;
  /** Probability density represented by the bin */
  density: number;
}

export interface HistogramBinSummary extends HistogramBin {
  /** Zero-based index for the bin */
  index: number;
  /** Arithmetic midpoint between start and end */
  midpoint: number;
  /** Width of the bin interval */
  width: number;
  /** Running total count including this bin */
  cumulativeCount: number;
  /** Running density integral including this bin */
  cumulativeDensity: number;
  /** Cumulative density normalized to 0-1 */
  cumulativeDensityRatio: number;
  /** Percentile rank represented by the cumulative count */
  percentile: number;
}
```

## Examples

### Basics

Bins session durations with a density curve. The bars take their color implicitly from the theme's first palette slot; no color props are set.

```tsx
import { HistogramChart } from '@plocks/charts';

import { SESSION_DURATIONS } from './data';

export function Demo() {
	return (
		<HistogramChart
			title="Session duration distribution"
			subtitle="Product analytics cohort"
			h={280}
			data={SESSION_DURATIONS}
			bins={10}
			showDensity
			densityThickness={3}
			densityColor="#12B886"
			barGap={0.15}
			tooltip={{
				show: true,
				formatter: (bin) => `${bin.count} sessions between ${bin.start}-${bin.end} min`,
			}}
			valueFormatter={(count, bin) => `${count} • ${bin.density.toFixed(2)} pdf`}
			enableCrosshair
			liveTooltip
		/>
	);
}
```

`data.ts`

```ts
export const SESSION_DURATIONS = [
	4, 6, 7, 8, 9, 9, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15, 16, 16,
	16, 17, 18, 18, 18, 19, 20, 20, 22, 24, 25,
];
```

### Threshold coloring

**Key settings** - `colorScale={{ type: 'threshold', thresholds: [2.5, 3.2] }}` splits bins into three bands by where they sit on the x axis. A bin whose midpoint lands on a breakpoint takes the band above it. - Band colors are status colors (good, warning, critical), and `labels` gives each band a legend entry, so a band's meaning never rides on color alone.

```tsx
import { useState } from 'react';
import { View, Text } from 'react-native';
import { HistogramChart, HistogramBinSummary } from '@plocks/charts';

import { BREACH_LIMIT, LOAD_TIMES, SLO_TARGET } from './data';

export function Demo() {
  const [focusedBin, setFocusedBin] = useState<HistogramBinSummary | null>(null);

  return (
  <View style={{ width: '100%', maxWidth: '100%' }}>
      <HistogramChart
        title="Page load time distribution"
        subtitle="Bins colored by SLO status"
        h={340}
        data={LOAD_TIMES}
        bins={14}
        density={false}
        showDensity={false}
        barOpacity={0.9}
        colorScale={{
          type: 'threshold',
          by: 'x',
          thresholds: [SLO_TARGET, BREACH_LIMIT],
          colors: ['#0ca30c', '#fab219', '#d03b3b'],
          labels: ['Within SLO', 'At risk', 'Breaching'],
        }}
        legend={{ show: true }}
        annotations={[
          {
            id: 'slo-target',
            shape: 'vertical-line',
            x: SLO_TARGET,
            color: '#71717A',
            label: 'SLO 2.5s',
          },
        ]}
        xAxis={{
          title: 'Page load time (seconds)',
          labelFormatter: (value) => `${value.toFixed(1)}s`,
        }}
        yAxis={{
          title: 'Page views',
        }}
        grid={{ show: true }}
        tooltip={{
          show: true,
          formatter: (bin) => `${bin.count} page views between ${bin.start.toFixed(1)}–${bin.end.toFixed(1)}s`,
        }}
        valueFormatter={(count) => `${count} views`}
        onBinFocus={(summary) => setFocusedBin(summary)}
        onBinBlur={() => setFocusedBin(null)}
      />
  <View style={{ paddingHorizontal: 4, marginTop: 12 }}>
        {focusedBin ? (
          <Text style={{ fontSize: 13, color: '#3F3F46' }}>
            {`${focusedBin.count} loads between ${focusedBin.start.toFixed(2)}–${focusedBin.end.toFixed(2)}s · percentile ${(focusedBin.percentile * 100).toFixed(1)}% · cumulative ${(focusedBin.cumulativeDensityRatio * 100).toFixed(1)}% density`}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: '#52525B' }}>
            Hover a bar to highlight its percentile and cumulative share of traffic.
          </Text>
        )}
      </View>
    </View>
  );
}
```

`data.ts`

```ts
export const LOAD_TIMES = [
  1.2, 1.3, 1.4, 1.5, 1.5, 1.6, 1.6, 1.7, 1.7, 1.8, 1.8, 1.9,
  1.9, 2.0, 2.0, 2.1, 2.1, 2.2, 2.2, 2.3, 2.3, 2.4, 2.4, 2.5,
  2.5, 2.6, 2.6, 2.7, 2.7, 2.8, 2.8, 2.9, 2.9, 3.0, 3.1, 3.1,
  3.2, 3.3, 3.3, 3.4, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 2.2,
  1.8, 1.9, 2.0, 2.1, 2.3, 2.4, 2.5, 2.7, 2.8, 2.9,
];

export const SLO_TARGET = 2.5;

// Loads past this are breaching, not just at risk.
export const BREACH_LIMIT = 3.2;
```

### Diverging from a target

**Key settings** - `colorScale={{ type: 'diverging', midpoint: 3.9, colors: [low, high] }}` colors bins by which side of the target they fall on. A neutral gray middle is added automatically. - The arms are symmetric: bins the same distance from the midpoint get the same intensity, even though the data reaches further below the target than above it.

```tsx
import { HistogramChart } from '@plocks/charts';

import { BATTERY_VOLTAGES, REPLACEMENT_THRESHOLD, TARGET_VOLTAGE } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Sensor battery voltage after firmware upgrade"
      subtitle="Diverging from the 3.9V target: red runs low, blue runs high"
      h={320}
      data={BATTERY_VOLTAGES}
      bins={12}
      binMethod="sturges"
      density={false}
      showDensity={false}
      barOpacity={0.9}
      colorScale={{
        type: 'diverging',
        midpoint: TARGET_VOLTAGE,
        colors: ['#e34948', '#2a78d6'],
      }}
      annotations={[
        {
          id: 'replacement-line',
          shape: 'vertical-line',
          x: REPLACEMENT_THRESHOLD,
          color: '#e34948',
          label: 'Replace below 3.5V',
        },
        {
          id: 'target-line',
          shape: 'vertical-line',
          x: TARGET_VOLTAGE,
          color: '#71717A',
          label: 'Target 3.9V',
        },
      ]}
      xAxis={{
        title: 'Voltage (V)',
        labelFormatter: (value) => `${value.toFixed(2)}V`,
      }}
      yAxis={{
        title: 'Sensors',
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} sensors between ${bin.start.toFixed(2)}–${bin.end.toFixed(2)}V`,
      }}
      valueFormatter={(count) => `${count} sensors`}
    />
  );
}
```

`data.ts`

```ts
export const BATTERY_VOLTAGES = [
  3.42, 3.44, 3.45, 3.46, 3.48, 3.49, 3.51, 3.53, 3.54, 3.55,
  3.57, 3.58, 3.59, 3.60, 3.61, 3.62, 3.63, 3.64, 3.65, 3.66,
  3.68, 3.70, 3.71, 3.72, 3.73, 3.74, 3.76, 3.78, 3.79, 3.80,
  3.82, 3.83, 3.84, 3.85, 3.86, 3.88, 3.89, 3.90, 3.92, 3.94,
  3.96, 3.98, 4.00, 4.02, 4.04, 4.06, 4.08, 4.10, 4.12, 4.15,
];

export const REPLACEMENT_THRESHOLD = 3.5;

export const TARGET_VOLTAGE = 3.9;
```

### Sequential shading by count

**Key settings** - `colorScale={{ type: 'sequential', by: 'count' }}` shades each bin by how many people it holds instead of by where it sits (`by: 'x'`, the default). - With no `colors`, the ramp is built from the bar color itself: a tint that recedes toward the chart surface at the low end, a deeper shade at the high end. On a dark theme the same rule flips the anchor automatically.

```tsx
import { HistogramChart } from '@plocks/charts';

import { TENURE_YEARS, medianTenure } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Employee tenure distribution"
      subtitle="Shaded by headcount: bolder bins hold more people"
      h={320}
      data={TENURE_YEARS}
      bins={12}
      binMethod="sqrt"
      showDensity
      densityThickness={2.5}
      barOpacity={0.9}
      colorScale={{ type: 'sequential', by: 'count' }}
      annotations={[
        {
          id: 'median-tenure',
          shape: 'vertical-line',
          x: Number(medianTenure.toFixed(2)),
          color: '#71717A',
          label: `Median ${medianTenure.toFixed(1)} yrs`,
        },
      ]}
      xAxis={{
        title: 'Tenure (years)',
        labelFormatter: (value) => `${value.toFixed(1)} yrs`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(2),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} teammates between ${bin.start.toFixed(1)}–${bin.end.toFixed(1)} years`,
      }}
      valueFormatter={(count, bin) => `${count} people · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
```

`data.ts`

```ts
export const TENURE_YEARS = [
  0.3, 0.5, 0.7, 0.8, 1.1, 1.3, 1.5, 1.8, 2.1, 2.3,
  2.8, 3.0, 3.2, 3.5, 3.8, 4.1, 4.4, 4.7, 5.0, 5.3,
  5.7, 6.0, 6.3, 6.8, 7.1, 7.4, 7.8, 8.2, 8.6, 9.0,
  9.5, 10.0, 10.5, 11.0, 11.6, 12.2, 12.8, 13.4, 14.0, 14.7,
];

export const medianTenure = (() => {
  const sorted = [...TENURE_YEARS].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
})();
```

### Gradient fill

**Key settings** - `barColor` accepts a gradient as well as a color: `{ angle, stops, extent }`. `angle` is in degrees; 90 runs top to bottom. - `extent: 'plot'` lays one gradient across the whole plot, so each bar shows the slice behind it and taller bins reach the deeper end. The default, `extent: 'mark'`, gives every bar the full gradient.

```tsx
import { HistogramChart } from '@plocks/charts';

import { DELIVERY_MINUTES } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Delivery time distribution"
      subtitle="One gradient spans the plot, so taller bins reach the deeper end"
      h={320}
      data={DELIVERY_MINUTES}
      bins={14}
      density={false}
      showDensity={false}
      barOpacity={1}
      barRadius={4}
      barColor={{
        angle: 90,
        extent: 'plot',
        stops: [
          { offset: 0, color: '#1c5cab' },
          { offset: 1, color: '#86b6ef' },
        ],
      }}
      xAxis={{
        title: 'Minutes from order to door',
        labelFormatter: (value) => `${value.toFixed(0)}m`,
      }}
      yAxis={{
        title: 'Orders',
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} orders in ${bin.start.toFixed(0)}–${bin.end.toFixed(0)} min`,
      }}
      valueFormatter={(count) => `${count} orders`}
    />
  );
}
```

`data.ts`

```ts
export const DELIVERY_MINUTES = [
  18, 21, 22, 24, 25, 26, 26, 27, 28, 28,
  29, 29, 30, 30, 30, 31, 31, 32, 32, 32,
  33, 33, 33, 34, 34, 34, 35, 35, 35, 35,
  36, 36, 36, 37, 37, 38, 38, 39, 39, 40,
  41, 41, 42, 43, 44, 45, 46, 48, 50, 52,
  55, 58, 62, 67, 74,
];
```

### Outlined bars

**Key settings** - A single explicit `barColor` at `barOpacity={0.18}`, outlined with `barStroke` and `barStrokeWidth`. - The density line uses the same accent, so the chart reads as one series.

```tsx
import { HistogramChart } from '@plocks/charts';

import { RESPONSE_HOURS } from './data';

const ACCENT = '#199e70';

export function Demo() {
  return (
    <HistogramChart
      title="Support first-response time"
      subtitle="Outlined bars: a faint fill under a solid stroke"
      h={320}
      data={RESPONSE_HOURS}
      bins={12}
      barColor={ACCENT}
      barOpacity={0.18}
      barStroke={ACCENT}
      barStrokeWidth={1.5}
      barRadius={6}
      barGap={0.16}
      showDensity
      densityColor={ACCENT}
      densityThickness={2}
      xAxis={{
        title: 'Hours to first response',
        labelFormatter: (value) => `${value.toFixed(0)}h`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(2),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} tickets answered in ${bin.start.toFixed(1)}–${bin.end.toFixed(1)}h`,
      }}
      valueFormatter={(count) => `${count} tickets`}
    />
  );
}
```

`data.ts`

```ts
export const RESPONSE_HOURS = [
  0.4, 0.6, 0.8, 0.9, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8,
  1.9, 2.0, 2.1, 2.2, 2.4, 2.5, 2.6, 2.8, 3.0, 3.1,
  3.3, 3.5, 3.6, 3.8, 4.0, 4.3, 4.5, 4.8, 5.1, 5.4,
  5.8, 6.2, 6.7, 7.3, 8.0, 8.8, 9.7, 10.9, 12.4,
];
```

### Themed with a brand palette

**Key settings** - The chart sets no color props. Bars take palette slot 1 and the density line takes slot 2 from the nearest `ChartThemeProvider`. - A nested provider re-themes only its own subtree: it inherits text, grid and surface colors from the app's theme and overrides just `accentPalette`.

```tsx
import { ChartThemeProvider, HistogramChart } from '@plocks/charts';

import { BASKET_TOTALS, BRAND_PALETTE } from './data';

export function Demo() {
  // No color props on the chart: bars take palette slot 1 and the density line
  // slot 2 from the nearest ChartThemeProvider. A nested provider re-themes just
  // its own subtree and inherits everything else from the app's theme.
  return (
    <ChartThemeProvider value={{ colors: { accentPalette: BRAND_PALETTE } }}>
      <HistogramChart
        title="Checkout basket size"
        subtitle="Colored entirely by the surrounding theme's palette"
        h={320}
        data={BASKET_TOTALS}
        bins={12}
        showDensity
        legend={{ show: true }}
        xAxis={{
          title: 'Basket total (USD)',
          labelFormatter: (value) => `$${value.toFixed(0)}`,
        }}
        yAxis={{
          title: 'Probability density',
          labelFormatter: (value) => value.toFixed(3),
        }}
        grid={{ show: true }}
        tooltip={{
          show: true,
          formatter: (bin) => `${bin.count} baskets between $${bin.start.toFixed(0)}–$${bin.end.toFixed(0)}`,
        }}
        valueFormatter={(count) => `${count} baskets`}
      />
    </ChartThemeProvider>
  );
}
```

`data.ts`

```ts
export const BASKET_TOTALS = [
  12, 18, 22, 25, 27, 29, 31, 33, 34, 36,
  37, 38, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 51, 52, 54, 55, 57, 58, 60,
  62, 64, 66, 69, 72, 76, 80, 85, 91, 98,
  106, 115, 128,
];

// Two slots, validated for 3:1 contrast and CVD separation on light and dark surfaces.
export const BRAND_PALETTE = ['#7c5cdb', '#d9731a'];
```

### Contract Length Retention

```tsx
import { HistogramChart } from '@plocks/charts';

import { CONTRACT_LENGTHS, median } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Customer contract length distribution"
      subtitle="Used to calibrate retention and renewal strategy"
      h={320}
      data={CONTRACT_LENGTHS}
      bins={12}
      binMethod="sturges"
      density={false}
      showDensity={false}
      barOpacity={0.82}
      rangeHighlights={[{ id: 'core-subscription', start: 12, end: 24, color: '#22C55E', opacity: 0.14 }]}
      annotations={[
        {
          id: 'one-year',
          shape: 'vertical-line',
          x: 12,
          color: '#22C55E',
          label: '1 year',
        },
        {
          id: 'two-year',
          shape: 'vertical-line',
          x: 24,
          color: '#15803D',
          label: '2 years',
        },
        {
          id: 'median',
          shape: 'vertical-line',
          x: median,
          color: '#F97316',
          label: `Median ${median} mo`,
        },
      ]}
      xAxis={{
        title: 'Contract length (months)',
      }}
      yAxis={{
        title: 'Customer accounts',
        labelFormatter: (value) => `${value.toFixed(0)}`,
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} accounts between ${bin.start.toFixed(0)}–${bin.end.toFixed(0)} months`,
      }}
      valueFormatter={(count) => `${count} customers`}
    />
  );
}
```

`data.ts`

```ts
export const CONTRACT_LENGTHS = [
  6, 6, 6, 7, 8, 9, 9, 10, 10, 11,
  12, 12, 12, 12, 13, 14, 14, 15, 15, 16,
  17, 18, 18, 18, 18, 19, 20, 20, 21, 21,
  22, 24, 24, 24, 24, 25, 26, 26, 27, 28,
  30, 30, 30, 32, 32, 33, 34, 36, 36, 36,
  38, 40, 42, 45, 48,
];

export const sortedLengths = [...CONTRACT_LENGTHS].sort((a, b) => a - b);

export const median = sortedLengths[Math.floor(sortedLengths.length / 2)];
```

### Transaction Amount Fraud

```tsx
import { HistogramChart } from '@plocks/charts';

import { REVIEW_THRESHOLD, TRANSACTION_AMOUNTS } from './data';

export function Demo() {
  return (
    <HistogramChart
      title="Transaction amount distribution"
      subtitle="Identifying anomalous high-value purchases"
      h={320}
      data={TRANSACTION_AMOUNTS}
      bins={16}
      binMethod="fd"
      showDensity
      barOpacity={0.76}
      densityColor="#0EA5E9"
      rangeHighlights={[
        { id: 'high-risk-window', start: 900, end: 1400, color: '#EF4444', opacity: 0.12 },
      ]}
      annotations={[
        {
          id: 'manual-review',
          shape: 'vertical-line',
          x: REVIEW_THRESHOLD,
          color: '#DC2626',
          label: 'Manual review starts',
        },
      ]}
      xAxis={{
        title: 'Transaction amount (USD)',
        labelFormatter: (value) => `$${value.toFixed(0)}`,
      }}
      yAxis={{
        title: 'Probability density',
        labelFormatter: (value) => value.toFixed(3),
      }}
      grid={{ show: true }}
      tooltip={{
        show: true,
        formatter: (bin) => `${bin.count} orders between $${bin.start.toFixed(0)}–$${bin.end.toFixed(0)}`,
      }}
      valueFormatter={(count, bin) => `${count} orders · pdf ${bin.density.toFixed(3)}`}
    />
  );
}
```

`data.ts`

```ts
export const TRANSACTION_AMOUNTS = [
  120, 135, 142, 150, 155, 160, 162, 168, 170, 174,
  180, 184, 188, 192, 198, 205, 210, 218, 225, 230,
  240, 245, 250, 260, 270, 280, 295, 310, 330, 340,
  360, 380, 395, 410, 430, 455, 480, 500, 520, 540,
  560, 580, 600, 620, 640, 660, 690, 720, 750, 780,
  820, 860, 890, 930, 970, 1020, 1080, 1150, 1220, 1310,
];

export const REVIEW_THRESHOLD = 750;
```
