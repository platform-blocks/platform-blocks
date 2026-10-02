# Stacked Area Chart

Area chart with multiple series stacked to show cumulative contributions.

## Metadata

- Import: `import { StackedAreaChart } from '@plocks/charts';`
- Install: `npm install @plocks/charts` — a separate package from `@plocks/ui`
- Tags: chart, area, stacked
- Docs: https://plocks.dev/charts/StackedAreaChart
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/charts/src/components/StackedAreaChart

## Props

- `series` (required): LineChartSeries[] — Data series to stack
- `stackOrder`: 'normal' | 'reverse' = 'normal' — Order layers are stacked in
- `smooth`: boolean = true — Smooth (curved) area tops
- `opacity`: number = 0.55 — Base opacity for the stacked layers
- `stackMode`: 'absolute' | 'percentage' = 'absolute' — Stack values as absolute totals or normalized to 100%

Plus the `LineChart` props (`lineColor` `lineThickness` `lineStyle` `showPoints` `pointSize` `pointColor` `fillColor` `fillOpacity` `areaFillMode` `xAxis` `yAxis` `grid` `legend` `tooltip` `animation` `enableCrosshair` `enableSeriesToggle` `liveTooltip` `multiTooltip` `enablePanZoom` `zoomMode` `minZoom` `onDomainChange` `enableWheelZoom` `wheelZoomStep` `invertWheelZoom` `resetOnDoubleTap` `clampToInitialDomain` `invertPinchZoom` `disableAnimations` `decimationThreshold` `xScaleType` `yScaleType` `enableBrushZoom` `annotations`): https://plocks.dev/llms/components/LineChart.md

Also accepts the shared props — chart (`w` `h` `aspectRatio` `maw` `miw` `mah` `mih` `testID` `style` `accessibilityLabel` `accessibilityHint` `accessibilityRole` `accessible` `importantForAccessibility` `animationDuration` `animationEasing` `disabled` `title` `subtitle` `useOwnInteractionProvider` `suppressPopover`), chart events (`onPress` `onDataPointPress`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Area chart with multiple series stacked to show cumulative contributions.

```tsx
import { StackedAreaChart } from '@plocks/charts';

import { SERIES } from './data';

export function Demo() {
  return (
    <StackedAreaChart
      title="Active users by surface"
      subtitle="Monthly totals"
      h={340}
      series={SERIES}
      stackOrder="normal"
      opacity={0.65}
      xAxis={{ show: true, title: 'Month', labelFormatter: (value) => `M${value}` }}
      yAxis={{
        show: true,
        title: 'Active users (thousands)',
        labelFormatter: (value) => `${value}`,
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      enableCrosshair
      multiTooltip
      liveTooltip
    />
  );
}
```

`data.ts`

```ts
export const SERIES = [
  {
    id: 'mobile',
    name: 'Mobile',
    data: [
      { x: 1, y: 22 },
      { x: 2, y: 26 },
      { x: 3, y: 28 },
      { x: 4, y: 32 },
      { x: 5, y: 36 },
      { x: 6, y: 38 },
      { x: 7, y: 42 },
      { x: 8, y: 44 },
      { x: 9, y: 47 },
      { x: 10, y: 50 },
      { x: 11, y: 52 },
      { x: 12, y: 55 },
    ],
  },
  {
    id: 'web',
    name: 'Web',
    data: [
      { x: 1, y: 18 },
      { x: 2, y: 20 },
      { x: 3, y: 22 },
      { x: 4, y: 25 },
      { x: 5, y: 26 },
      { x: 6, y: 27 },
      { x: 7, y: 28 },
      { x: 8, y: 30 },
      { x: 9, y: 32 },
      { x: 10, y: 33 },
      { x: 11, y: 34 },
      { x: 12, y: 35 },
    ],
  },
  {
    id: 'api',
    name: 'API',
    data: [
      { x: 1, y: 12 },
      { x: 2, y: 14 },
      { x: 3, y: 15 },
      { x: 4, y: 16 },
      { x: 5, y: 18 },
      { x: 6, y: 19 },
      { x: 7, y: 21 },
      { x: 8, y: 22 },
      { x: 9, y: 23 },
      { x: 10, y: 24 },
      { x: 11, y: 25 },
      { x: 12, y: 27 },
    ],
  },
];
```
