# GaugeChart

Visualises progress toward a bounded target using a semicircular gauge with configurable ranges, ticks, labels, and animated needle. Ported from the UI Gauge component to the charts package so it can slot into chart demos, interaction providers, and theming helpers.

The chart also supports `markers` for spotlighting thresholds (for example SLO limits or compliance baselines). Markers can render as secondary ticks or complementary needles, emit focus callbacks, and feed into the legend so demos can narrate multiple guardrails on the same gauge.

Additional niceties include gradient range fills, `innerRadiusRatio` for donut style layouts, and interaction hooks (`onValueChange`, `onMarkerFocus`) so dashboards can synchronise copy or annotations as the gauge updates.

## Metadata

- Canonical name: `GaugeChart`
- Package: `@platform-blocks/charts`
- Import: `import { GaugeChart } from '@platform-blocks/charts';`
- Category: charts
- Docs: https://react-ui-library.com/components/GaugeChart
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/charts/src/components/GaugeChart

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | number | Yes |  | Current value |
| `min` | number | No | 0 | Minimum value |
| `max` | number | No | 100 | Maximum value |
| `startAngle` | number | No |  | Gauge start angle (degrees, 0 = top) |
| `endAngle` | number | No | 135 | Gauge end angle (degrees, 0 = top) |
| `rotationOffset` | number | No | 0 | Rotation offset applied to the entire gauge |
| `thickness` | number | No | 12 | Base arc thickness |
| `innerRadiusRatio` | number | No |  | Ratio of inner radius to outer radius when rendering donut style gauges |
| `track` | GaugeChartTrackConfig | No |  | Track configuration |
| `ranges` | GaugeChartRange[] | No | [] | Value ranges displayed on the gauge |
| `ticks` | GaugeChartTickConfig | No |  | Tick configuration |
| `labels` | GaugeChartLabelConfig | No |  | Label configuration |
| `needle` | GaugeChartNeedleConfig | No |  | Needle configuration |
| `centerLabel` | GaugeChartCenterLabelConfig | No |  | Center label configuration |
| `legend` | ChartLegend | No |  | Legend configuration |
| `markers` | GaugeChartMarker[] | No |  | Discrete markers rendered along the gauge arc |
| `markerFocusStrategy` | 'closest' \| 'leading' | No | 'closest' | Strategy used to decide which marker is considered focused |
| `markerFocusThreshold` | number | No |  | Threshold in value units before switching focus when using the closest strategy |
| `valueFormatter` | (value: number, percentage: number) => string | No |  | Optional formatted output for external display |
| `onValueChange` | (value: number, percentage: number, previousValue: number) => void | No |  | Fired when the gauge value updates |
| `onMarkerFocus` | (marker: GaugeChartMarker \| null) => void | No |  | Fired when the active marker changes |
| `width` | number | No | 320 | Chart width in px. Omit it and the chart fills the box it is placed in, redrawing when that box changes. A number is honoured up to the width the container can actually give it — a chart never draws wider than its slot. |
| `height` | number | No | 240 | Chart height in px. Defaults to the chart's resting height, or `width / aspectRatio`. |
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
| `animationDuration` | number | No | 600 | Animation duration in ms |
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

## Examples

### Basic
ID: `GaugeChart.basic` • Category: charts

```tsx
return (
    <GaugeChart
      title="System Health"
      subtitle="Live CPU utilisation"
      maxWidth={320}
      height={240}
      value={68}
      min={0}
      max={100}
      thickness={16}
      track={{ opacity: 0.2 }}
      ranges={RANGES}
      ticks={{ major: 5, minor: 4, color: '#94A3B8' }}
      labels={{ formatter: (v) => `${Math.round(v)}%`, offset: 26 }}
      needle={{ length: 0.85, centerSize: 6, showCenter: true }}
      centerLabel={{ show: true, formatter: (val) => `${Math.round(val)}%`, secondaryText: (_, pct) => `${Math.round(pct * 100)}% of max` }}
      legend={{ show: true, position: 'bottom' }}
    />
  );
}
```
