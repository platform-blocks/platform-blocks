# Stacked Area Chart

Area chart with multiple series stacked to show cumulative contributions.

## Metadata

- Canonical name: `StackedAreaChart`
- Package: `@platform-blocks/charts`
- Import: `import { StackedAreaChart } from '@platform-blocks/charts';`
- Category: charts
- Tags: chart, area, stacked
- Docs: https://react-ui-library.com/components/StackedAreaChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/StackedAreaChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `series` | LineChartSeries[] | Yes |  | Data series to stack |
| `stackOrder` | 'normal' \| 'reverse' | No | 'normal' | Order layers are stacked in |
| `smooth` | boolean | No | true | Smooth (curved) area tops |
| `opacity` | number | No | 0.55 | Base opacity for the stacked layers |
| `stackMode` | 'absolute' \| 'percentage' | No | 'absolute' | Stack values as absolute totals or normalized to 100% |
| `lineColor` | string | No |  | Line color (for single series) |
| `lineThickness` | number | No |  | Line thickness (for single series) |
| `lineStyle` | 'solid' \| 'dashed' \| 'dotted' | No |  | Line style (for single series) |
| `showPoints` | boolean | No |  | Show data points (for single series) |
| `pointSize` | number | No |  | Point size (for single series) |
| `pointColor` | string | No |  | Point color (for single series) |
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
| `xScaleType` | 'linear' \| 'log' \| 'time' | No | 'linear' | X axis scale type |
| `yScaleType` | 'linear' \| 'log' \| 'time' | No | 'linear' | Y axis scale type |
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
| `animationDuration` | number | No | 800 | Animation duration in ms |
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
ID: `StackedAreaChart.basic` • Category: charts

```tsx
return (
    <StackedAreaChart
      title="Active users by surface"
      subtitle="Monthly totals"
      height={340}
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
