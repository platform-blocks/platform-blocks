# Candlestick Chart

Visualizes financial OHLC price movements over time.

## Metadata

- Import: `import { CandlestickChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, financial, ohlc
- Docs: https://plocks.dev/charts/CandlestickChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/CandlestickChart

## Props

- `series` (required): CandlestickSeries[] — One or more candlestick series to render
- `movingAveragePeriods`: number[] = [] — Periods for moving average overlay lines (e.g. [20,50])
- `movingAverageColors`: string[] = [] — Colors for moving average overlays (falls back to series palette)
- `showMovingAverages`: boolean = true — Show moving average overlays (defaults true if periods provided)
- `showVolume`: boolean = false — Show volume bars underneath (reserved)
- `volumeHeightRatio`: number = 0.22 — Relative height ratio for volume sub-chart (0-0.5)
- `xAxis`: ChartAxis — Configuration for the horizontal axis
- `yAxis`: ChartAxis — Configuration for the vertical axis
- `grid`: ChartGrid — Background grid configuration
- `legend`: ChartLegend — Legend display options
- `tooltip`: ChartTooltip<CandlestickDataPoint> — Tooltip configuration
- `animation`: ChartAnimation — Animation configuration
- `enableCrosshair`: boolean — Enable crosshair indicator
- `multiTooltip`: boolean — Enable shared tooltip for multiple series
- `liveTooltip`: boolean — Follow pointer live with tooltip
- `enablePanZoom`: boolean — Allow interactive pan and zoom
- `zoomMode`: 'x' | 'y' | 'both' — Which axes support zooming
- `minZoom`: number — Minimum zoom factor relative to original domain
- `enableWheelZoom`: boolean — Enable wheel-based zooming (web only)
- `wheelZoomStep`: number — Step factor applied to wheel zoom operations
- `invertWheelZoom`: boolean — Invert wheel zoom direction
- `resetOnDoubleTap`: boolean — Reset zoom on double-tap or double-click
- `clampToInitialDomain`: boolean — Clamp panning to the initial data domain
- `invertPinchZoom`: boolean — Invert pinch zoom direction
- `xScaleType`: 'linear' | 'log' | 'time' = 'time' — Scale type used for the x axis
- `yScaleType`: 'linear' | 'log' | 'time' = 'linear' — Scale type used for the y axis
- `annotations`: ChartAnnotation[] — Additional annotations to render on the chart

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface CandlestickSeries {
  /** Unique identifier for the series */
  id?: string | number;
  /** Display name for the series */
  name?: string;
  /** Candlestick data points to plot */
  data: CandlestickDataPoint[];
  /** Fill/stroke color used for bullish candles */
  colorBull?: string;
  /** Fill/stroke color used for bearish candles */
  colorBear?: string;
  /** Wick color applied to the candle */
  wickColor?: string;
  /** Whether the series is visible */
  visible?: boolean;
}

export interface CandlestickDataPoint {
  /** Unique identifier for the data point */
  id?: string | number;
  /** X coordinate for the candle (typically time) */
  x: number | Date;
  /** Opening price for the period */
  open: number;
  /** Highest price reached within the period */
  high: number;
  /** Lowest price reached within the period */
  low: number;
  /** Closing price for the period */
  close: number;
  /** Optional traded volume for the period */
  volume?: number;
  /** Arbitrary metadata associated with the data point */
  data?: any;
}
```

## Examples

### Basics

Visualizes financial OHLC price movements over time.

```tsx
import { CandlestickChart } from '@plocks/charts';

import { PRICE_SERIES } from './data';

export function Demo() {
  return (
    <CandlestickChart
      title="AAPL daily candles"
      subtitle="Includes 3 & 5-day moving averages"
      h={360}
      series={[
        {
          id: 'apple',
          name: 'Apple Inc.',
          data: PRICE_SERIES,
          colorBull: '#34C38F',
          colorBear: '#F56565',
          wickColor: '#6B7280',
        },
      ]}
      movingAveragePeriods={[3, 5]}
      xAxis={{
        show: true,
        labelFormatter: (value) => new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        title: 'Trading day',
      }}
      yAxis={{
        show: true,
        title: 'Price (USD)',
        labelFormatter: (value) => `$${value.toFixed(0)}`,
      }}
      grid={{ show: true, color: '#E5EAF7' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) =>
          `O: $${candle.open.toFixed(2)} • H: $${candle.high.toFixed(2)} • L: $${candle.low.toFixed(2)} • C: $${candle.close.toFixed(2)}`,
      }}
      enableCrosshair
      liveTooltip
      animation={{ duration: 400 }}
      enablePanZoom
      zoomMode="both"
      minZoom={0.2}
      resetOnDoubleTap
      clampToInitialDomain
      xScaleType="time"
    />
  );
}
```

`data.ts`

```ts
export const PRICE_SERIES = [
  { x: new Date('2023-10-02'), open: 154, high: 158, low: 153, close: 157 },
  { x: new Date('2023-10-03'), open: 157, high: 161, low: 156, close: 160 },
  { x: new Date('2023-10-04'), open: 160, high: 164, low: 159, close: 162 },
  { x: new Date('2023-10-05'), open: 162, high: 166, low: 161, close: 165 },
  { x: new Date('2023-10-06'), open: 165, high: 168, low: 163, close: 164 },
  { x: new Date('2023-10-09'), open: 164, high: 167, low: 162, close: 166 },
  { x: new Date('2023-10-10'), open: 166, high: 170, low: 165, close: 169 },
  { x: new Date('2023-10-11'), open: 169, high: 172, low: 167, close: 168 },
];
```

### Battery Material Pricing

```tsx
import { CandlestickChart } from '@plocks/charts';

import { LITHIUM_SERIES, NICKEL_SERIES, negotiationMarkers } from './data';

const formatWeek = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});

export function Demo() {
  return (
    <CandlestickChart
      title="Battery Material Pricing"
      subtitle="Negotiation window tracked across lithium and nickel contracts"
      h={420}
      series={[
        {
          id: 'lithium',
          name: 'Lithium carbonate (USD/ton)',
          data: LITHIUM_SERIES,
          colorBull: '#0ea5e9',
          colorBear: '#bfdbfe',
          wickColor: '#1d4ed8',
        },
        {
          id: 'nickel',
          name: 'Nickel sulfate (USD/ton)',
          data: NICKEL_SERIES,
          colorBull: '#facc15',
          colorBear: '#fef08a',
          wickColor: '#ca8a04',
        },
      ]}
      movingAveragePeriods={[3]}
      movingAverageColors={['#6366f1']}
      annotations={negotiationMarkers}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => `Open $${candle.open.toLocaleString('en-US')} • Close $${candle.close.toLocaleString('en-US')} \nRange $${candle.low.toLocaleString('en-US')} – $${candle.high.toLocaleString('en-US')}`,
      }}
      xAxis={{
        show: true,
        title: 'Week of shipment',
        labelFormatter: formatWeek,
      }}
      yAxis={{
        show: true,
        title: 'Spot price (USD per metric ton)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US')}`,
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
```

`data.ts`

```ts
export const LITHIUM_SERIES = [
  { x: new Date('2024-09-02'), open: 36200, high: 37180, low: 35420, close: 36840 },
  { x: new Date('2024-09-09'), open: 36840, high: 37510, low: 36080, close: 37200 },
  { x: new Date('2024-09-16'), open: 37200, high: 37840, low: 36520, close: 36610 },
  { x: new Date('2024-09-23'), open: 36610, high: 36950, low: 35840, close: 36020 },
  { x: new Date('2024-09-30'), open: 36020, high: 36480, low: 35260, close: 35510 },
  { x: new Date('2024-10-07'), open: 35510, high: 36040, low: 34800, close: 35160 },
  { x: new Date('2024-10-14'), open: 35160, high: 35590, low: 34420, close: 34780 },
  { x: new Date('2024-10-21'), open: 34780, high: 35200, low: 34060, close: 34920 },
];

export const NICKEL_SERIES = [
  { x: new Date('2024-09-02'), open: 18940, high: 19480, low: 18620, close: 19260 },
  { x: new Date('2024-09-09'), open: 19260, high: 19850, low: 19010, close: 19530 },
  { x: new Date('2024-09-16'), open: 19530, high: 20040, low: 19300, close: 19780 },
  { x: new Date('2024-09-23'), open: 19780, high: 20360, low: 19420, close: 19890 },
  { x: new Date('2024-09-30'), open: 19890, high: 20540, low: 19610, close: 20330 },
  { x: new Date('2024-10-07'), open: 20330, high: 20810, low: 20060, close: 20210 },
  { x: new Date('2024-10-14'), open: 20210, high: 20640, low: 19880, close: 20140 },
  { x: new Date('2024-10-21'), open: 20140, high: 20520, low: 19710, close: 19940 },
];

export const negotiationMarkers = [
  {
    id: 'kickoff',
    shape: 'vertical-line' as const,
    x: new Date('2024-09-16').getTime(),
    color: '#f97316',
    opacity: 0.55,
  },
  {
    id: 'conclusion',
    shape: 'vertical-line' as const,
    x: new Date('2024-10-14').getTime(),
    color: '#0ea5e9',
    opacity: 0.55,
  },
];
```

### Cloud Infra Cost Swings

```tsx
import { CandlestickChart } from '@plocks/charts';

import { COST_SERIES, CloudCandle, annotations } from './data';

export function Demo() {
  return (
    <CandlestickChart
      title="Cloud Spend Volatility"
      subtitle="Optimization window captured a 4.7% cost reduction"
      h={420}
      series={[
        {
          id: 'cloud-costs',
          name: 'Daily infrastructure cost',
          data: COST_SERIES,
          colorBull: '#10b981',
          colorBear: '#ef4444',
          wickColor: '#475569',
        },
      ]}
      movingAveragePeriods={[3, 5, 8]}
      movingAverageColors={['#38bdf8', '#6366f1', '#f97316']}
      showMovingAverages
      showVolume
      volumeHeightRatio={0.24}
      annotations={annotations}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => {
          const delta = candle.close - candle.open;
          const deltaLabel = `${delta >= 0 ? '+' : ''}$${delta.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          const note = (candle as CloudCandle).note ? `\n• ${ (candle as CloudCandle).note }` : '';
          return [
            `Start: $${candle.open.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            `End: $${candle.close.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${deltaLabel})`,
            `Compute hours: ${(candle.volume ?? 0).toLocaleString('en-US')}`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Billing day',
        labelFormatter: (value) => new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }}
      yAxis={{
        show: true,
        title: 'Daily cloud cost (USD)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      }}
      enableCrosshair
      liveTooltip
      xScaleType="time"
    />
  );
}
```

`data.ts`

```ts
export type CloudCandle = {
  x: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  note?: string;
};

export const COST_SERIES: CloudCandle[] = [
  { x: new Date('2025-03-03'), open: 54250, high: 55840, low: 53620, close: 55180, volume: 1180 },
  { x: new Date('2025-03-04'), open: 55180, high: 56210, low: 54240, close: 54560, volume: 1340, note: 'CPU credits burst during load test' },
  { x: new Date('2025-03-05'), open: 54560, high: 54980, low: 53880, close: 54120, volume: 1225 },
  { x: new Date('2025-03-06'), open: 54120, high: 54820, low: 52940, close: 53280, volume: 1560, note: 'Rightsizing experiment kicked off' },
  { x: new Date('2025-03-07'), open: 53280, high: 53840, low: 52460, close: 52810, volume: 1490 },
  { x: new Date('2025-03-10'), open: 52810, high: 53350, low: 51980, close: 52140, volume: 1415 },
  { x: new Date('2025-03-11'), open: 52140, high: 53400, low: 51860, close: 53020, volume: 1305 },
  { x: new Date('2025-03-12'), open: 53020, high: 54680, low: 52510, close: 54440, volume: 1380, note: 'Idle clusters paused overnight' },
  { x: new Date('2025-03-13'), open: 54440, high: 55280, low: 53860, close: 54990, volume: 1255 },
  { x: new Date('2025-03-14'), open: 54990, high: 55710, low: 54480, close: 54620, volume: 1190 },
];

export const annotations = [
  {
    id: 'budget-cap',
    shape: 'horizontal-line' as const,
    y: 56000,
    color: '#f97316',
    opacity: 0.55,
  },
  {
    id: 'rightsizing-window',
    shape: 'box' as const,
    x1: new Date('2025-03-05').getTime(),
    x2: new Date('2025-03-11').getTime(),
    y1: 55200,
    y2: 52000,
    color: '#0ea5e9',
    backgroundColor: 'rgba(14,165,233,0.12)',
  },
];
```

### Crypto Treasury Balances

```tsx
import { CandlestickChart } from '@plocks/charts';

import { TREASURY_SERIES, TreasuryCandle, annotations } from './data';

const formatWeek = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});

export function Demo() {
  return (
    <CandlestickChart
      title="Crypto Treasury Balances"
      subtitle="Weekly BTC position changes with treasury policy markers"
      h={420}
      series={[
        {
          id: 'btc',
          name: 'BTC holdings (USD equivalent)',
          data: TREASURY_SERIES,
          colorBull: '#0ea5e9',
          colorBear: '#f97316',
          wickColor: '#1f2937',
        },
      ]}
      movingAveragePeriods={[2, 4, 6]}
      movingAverageColors={['#38bdf8', '#6366f1', '#facc15']}
      showMovingAverages
      showVolume
      volumeHeightRatio={0.2}
      annotations={annotations}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => {
          const delta = candle.close - candle.open;
          const deltaLabel = `${delta >= 0 ? '+' : '-'}$${Math.abs(delta).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
          const note = (candle as TreasuryCandle).note ? `\n• ${(candle as TreasuryCandle).note}` : '';
          return [
            `Open $${candle.open.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
            `Close $${candle.close.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${deltaLabel})`,
            `Flow: ${(candle.volume ?? 0).toLocaleString('en-US')} BTC`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Week of',
        labelFormatter: formatWeek,
      }}
      yAxis={{
        show: true,
        title: 'USD value (thousands)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US')}`,
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
```

`data.ts`

```ts
export type TreasuryCandle = {
  x: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  note?: string;
};

export const TREASURY_SERIES: TreasuryCandle[] = [
  { x: new Date('2024-05-06'), open: 42800, high: 44150, low: 42340, close: 43820, volume: 145 },
  { x: new Date('2024-05-13'), open: 43820, high: 44760, low: 43080, close: 43310, volume: 162, note: 'Sold 12 BTC to fund R&D' },
  { x: new Date('2024-05-20'), open: 43310, high: 44480, low: 42840, close: 44160, volume: 138 },
  { x: new Date('2024-05-27'), open: 44160, high: 45400, low: 43620, close: 45030, volume: 174 },
  { x: new Date('2024-06-03'), open: 45030, high: 46240, low: 44720, close: 45890, volume: 181 },
  { x: new Date('2024-06-10'), open: 45890, high: 47120, low: 45560, close: 46640, volume: 205, note: 'Derisked 8% into stablecoins' },
  { x: new Date('2024-06-17'), open: 46640, high: 47980, low: 46200, close: 47670, volume: 216 },
  { x: new Date('2024-06-24'), open: 47670, high: 48840, low: 46880, close: 47210, volume: 188 },
  { x: new Date('2024-07-01'), open: 47210, high: 48580, low: 46940, close: 48330, volume: 199 },
  { x: new Date('2024-07-08'), open: 48330, high: 49720, low: 47810, close: 49580, volume: 231 },
  { x: new Date('2024-07-15'), open: 49580, high: 50960, low: 48740, close: 49220, volume: 214 },
  { x: new Date('2024-07-22'), open: 49220, high: 50110, low: 48230, close: 48970, volume: 176, note: 'Compliance sign-off to rebalance' },
];

export const annotations = [
  {
    id: 'policy-shift',
    shape: 'vertical-line' as const,
    x: new Date('2024-06-10').getTime(),
    color: '#38bdf8',
    opacity: 0.65,
  },
  {
    id: 'risk-band',
    shape: 'horizontal-line' as const,
    y: 50000,
    color: '#f97316',
    opacity: 0.5,
  },
];
```

### Saas Usage Peaks

```tsx
import { CandlestickChart } from '@plocks/charts';

import { USAGE_SERIES, UsageCandle, annotations } from './data';

const formatDay = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});

export function Demo() {
  return (
    <CandlestickChart
      title="SaaS Usage Peaks"
      subtitle="Daily active sessions during phased launch with capacity guardrails"
      h={420}
      series={[
        {
          id: 'active-sessions',
          name: 'Concurrent sessions',
          data: USAGE_SERIES,
          colorBull: '#22c55e',
          colorBear: '#ef4444',
          wickColor: '#0f172a',
        },
      ]}
      movingAveragePeriods={[3, 5]}
      movingAverageColors={['#0ea5e9', '#f97316']}
      showMovingAverages
      showVolume
      volumeHeightRatio={0.24}
      annotations={annotations}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => {
          const delta = candle.close - candle.open;
          const deltaLabel = `${delta >= 0 ? '+' : ''}${delta.toLocaleString('en-US')}`;
          const note = (candle as UsageCandle).note ? `\n• ${(candle as UsageCandle).note}` : '';
          return [
            `Start ${candle.open.toLocaleString('en-US')} sessions`,
            `End ${candle.close.toLocaleString('en-US')} (${deltaLabel})`,
            `Peak ${candle.high.toLocaleString('en-US')} • Floor ${candle.low.toLocaleString('en-US')}`,
            `Requests ${(candle.volume ?? 0).toLocaleString('en-US')}`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Day',
        labelFormatter: formatDay,
      }}
      yAxis={{
        show: true,
        title: 'Concurrent sessions',
        labelFormatter: (value) => value.toLocaleString('en-US'),
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
```

`data.ts`

```ts
export type UsageCandle = {
  x: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  note?: string;
};

export const USAGE_SERIES: UsageCandle[] = [
  { x: new Date('2024-10-14'), open: 1240, high: 1380, low: 1210, close: 1345, volume: 24200 },
  { x: new Date('2024-10-15'), open: 1345, high: 1480, low: 1320, close: 1452, volume: 26840 },
  { x: new Date('2024-10-16'), open: 1452, high: 1610, low: 1405, close: 1576, volume: 30230, note: 'Feature flags enabled for 35% cohort' },
  { x: new Date('2024-10-17'), open: 1576, high: 1730, low: 1530, close: 1694, volume: 32560 },
  { x: new Date('2024-10-18'), open: 1694, high: 1820, low: 1645, close: 1762, volume: 31890 },
  { x: new Date('2024-10-21'), open: 1762, high: 1885, low: 1710, close: 1856, volume: 34120 },
  { x: new Date('2024-10-22'), open: 1856, high: 1980, low: 1795, close: 1924, volume: 35680, note: 'Marketing launch day' },
  { x: new Date('2024-10-23'), open: 1924, high: 2035, low: 1860, close: 1898, volume: 33140 },
  { x: new Date('2024-10-24'), open: 1898, high: 1975, low: 1805, close: 1832, volume: 28760 },
  { x: new Date('2024-10-25'), open: 1832, high: 1910, low: 1760, close: 1876, volume: 27410 },
];

export const annotations = [
  {
    id: 'launch',
    shape: 'vertical-line' as const,
    x: new Date('2024-10-22').getTime(),
    color: '#6366f1',
    opacity: 0.65,
  },
  {
    id: 'capacity-band',
    shape: 'horizontal-line' as const,
    y: 2000,
    color: '#f97316',
    opacity: 0.55,
  },
];
```

### Subscription Mrr Dynamics

```tsx
import { CandlestickChart } from '@plocks/charts';

import { MRR_SERIES, MrrCandle, annotations } from './data';

const formatMonth = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  year: 'numeric',
});

export function Demo() {
  return (
    <CandlestickChart
      title="Subscription MRR Momentum"
      subtitle="Expansion revenue outpaced churn across a pricing refresh"
      h={420}
      series={[
        {
          id: 'mrr',
          name: 'Monthly recurring revenue',
          data: MRR_SERIES,
          colorBull: '#22c55e',
          colorBear: '#ef4444',
          wickColor: '#0f172a',
        },
      ]}
      movingAveragePeriods={[2, 3]}
      movingAverageColors={['#14b8a6', '#6366f1']}
      showMovingAverages
      showVolume
      volumeHeightRatio={0.22}
      annotations={annotations}
      grid={{ show: true, color: '#E3E8F4' }}
      legend={{ show: true }}
      tooltip={{
        show: true,
        formatter: (candle) => {
          const net = candle.close - candle.open;
          const netLabel = `${net >= 0 ? '+' : '-'}$${Math.abs(net).toLocaleString('en-US')}`;
          const note = (candle as MrrCandle).note ? `\n• ${(candle as MrrCandle).note}` : '';
          return [
            `Open $${candle.open.toLocaleString('en-US')}`,
            `Close $${candle.close.toLocaleString('en-US')} (${netLabel})`,
            `Net expansions: ${(candle.volume ?? 0).toLocaleString('en-US')} accounts`,
          ].join(' • ') + note;
        },
      }}
      xAxis={{
        show: true,
        title: 'Month',
        labelFormatter: formatMonth,
      }}
      yAxis={{
        show: true,
        title: 'MRR (USD)',
        labelFormatter: (value) => `$${value.toLocaleString('en-US')}`,
      }}
      enableCrosshair
      liveTooltip
      multiTooltip
      xScaleType="time"
    />
  );
}
```

`data.ts`

```ts
export type MrrCandle = {
  x: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  note?: string;
};

export const MRR_SERIES: MrrCandle[] = [
  { x: new Date('2024-02-01'), open: 182000, high: 185400, low: 180600, close: 184900, volume: 58 },
  { x: new Date('2024-03-01'), open: 184900, high: 188200, low: 183300, close: 186700, volume: 62 },
  { x: new Date('2024-04-01'), open: 186700, high: 192500, low: 184200, close: 191400, volume: 96, note: 'Expansion push launched' },
  { x: new Date('2024-05-01'), open: 191400, high: 196300, low: 188100, close: 193800, volume: 104 },
  { x: new Date('2024-06-01'), open: 193800, high: 197600, low: 192200, close: 194100, volume: 71 },
  { x: new Date('2024-07-01'), open: 194100, high: 199900, low: 191500, close: 198600, volume: 109 },
  { x: new Date('2024-08-01'), open: 198600, high: 203200, low: 196700, close: 202800, volume: 122, note: 'New usage-based plan introduced' },
  { x: new Date('2024-09-01'), open: 202800, high: 208400, low: 200200, close: 206100, volume: 118 },
  { x: new Date('2024-10-01'), open: 206100, high: 209900, low: 201800, close: 203300, volume: 84, note: 'Churn spike from legacy tiers' },
  { x: new Date('2024-11-01'), open: 203300, high: 210800, low: 202100, close: 209200, volume: 131 },
  { x: new Date('2024-12-01'), open: 209200, high: 216500, low: 207600, close: 214800, volume: 144 },
  { x: new Date('2025-01-01'), open: 214800, high: 221400, low: 213100, close: 219500, volume: 152 },
];

export const annotations = [
  {
    id: 'pricing-refresh',
    shape: 'vertical-line' as const,
    x: new Date('2024-08-01').getTime(),
    color: '#22c55e',
    opacity: 0.65,
  },
  {
    id: 'churn-band',
    shape: 'box' as const,
    x1: new Date('2024-09-01').getTime(),
    x2: new Date('2024-10-15').getTime(),
    y1: 208000,
    y2: 198000,
    color: '#f97316',
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
];
```
