# Candlestick Chart

Visualizes financial OHLC price movements over time.

## Metadata

- Canonical name: `CandlestickChart`
- Package: `@platform-blocks/charts`
- Import: `import { CandlestickChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, financial, ohlc
- Docs: https://react-ui-library.com/components/CandlestickChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/CandlestickChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `series` | CandlestickSeries[] | Yes |  | One or more candlestick series to render |
| `movingAveragePeriods` | number[] | No | [] | Periods for moving average overlay lines (e.g. [20,50]) |
| `movingAverageColors` | string[] | No | [] | Colors for moving average overlays (falls back to series palette) |
| `showMovingAverages` | boolean | No | true | Show moving average overlays (defaults true if periods provided) |
| `showVolume` | boolean | No | false | Show volume bars underneath (reserved) |
| `volumeHeightRatio` | number | No | 0.22 | Relative height ratio for volume sub-chart (0-0.5) |
| `xAxis` | ChartAxis | No |  | Configuration for the horizontal axis |
| `yAxis` | ChartAxis | No |  | Configuration for the vertical axis |
| `grid` | ChartGrid | No |  | Background grid configuration |
| `legend` | ChartLegend | No |  | Legend display options |
| `tooltip` | ChartTooltip<CandlestickDataPoint> | No |  | Tooltip configuration |
| `animation` | ChartAnimation | No |  | Animation configuration |
| `enableCrosshair` | boolean | No |  | Enable crosshair indicator |
| `multiTooltip` | boolean | No |  | Enable shared tooltip for multiple series |
| `liveTooltip` | boolean | No |  | Follow pointer live with tooltip |
| `enablePanZoom` | boolean | No |  | Allow interactive pan and zoom |
| `zoomMode` | 'x' \| 'y' \| 'both' | No |  | Which axes support zooming |
| `minZoom` | number | No |  | Minimum zoom factor relative to original domain |
| `enableWheelZoom` | boolean | No |  | Enable wheel-based zooming (web only) |
| `wheelZoomStep` | number | No |  | Step factor applied to wheel zoom operations |
| `invertWheelZoom` | boolean | No |  | Invert wheel zoom direction |
| `resetOnDoubleTap` | boolean | No |  | Reset zoom on double-tap or double-click |
| `clampToInitialDomain` | boolean | No |  | Clamp panning to the initial data domain |
| `invertPinchZoom` | boolean | No |  | Invert pinch zoom direction |
| `xScaleType` | 'linear' \| 'log' \| 'time' | No | 'time' | Scale type used for the x axis |
| `yScaleType` | 'linear' \| 'log' \| 'time' | No | 'linear' | Scale type used for the y axis |
| `annotations` | ChartAnnotation[] | No |  | Additional annotations to render on the chart |
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
ID: `CandlestickChart.basic` • Category: charts

```tsx
return (
    <CandlestickChart
      title="AAPL daily candles"
      subtitle="Includes 3 & 5-day moving averages"
      height={360}
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

### Battery Material Pricing
ID: `CandlestickChart.battery-material-pricing` • Category: charts

```tsx
const formatWeek = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});
  return (
    <CandlestickChart
      title="Battery Material Pricing"
      subtitle="Negotiation window tracked across lithium and nickel contracts"
      height={420}
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

### Cloud Infra Cost Swings
ID: `CandlestickChart.cloud-infra-cost-swings` • Category: charts

```tsx
return (
    <CandlestickChart
      title="Cloud Spend Volatility"
      subtitle="Optimization window captured a 4.7% cost reduction"
      height={420}
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

### Crypto Treasury Balances
ID: `CandlestickChart.crypto-treasury-balances` • Category: charts

```tsx
const formatWeek = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});
  return (
    <CandlestickChart
      title="Crypto Treasury Balances"
      subtitle="Weekly BTC position changes with treasury policy markers"
      height={420}
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

### Saas Usage Peaks
ID: `CandlestickChart.saas-usage-peaks` • Category: charts

```tsx
const formatDay = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
});
  return (
    <CandlestickChart
      title="SaaS Usage Peaks"
      subtitle="Daily active sessions during phased launch with capacity guardrails"
      height={420}
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

### Subscription Mrr Dynamics
ID: `CandlestickChart.subscription-mrr-dynamics` • Category: charts

```tsx
const formatMonth = (value: number) => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  year: 'numeric',
});
  return (
    <CandlestickChart
      title="Subscription MRR Momentum"
      subtitle="Expansion revenue outpaced churn across a pricing refresh"
      height={420}
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
