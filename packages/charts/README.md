<p align="center">
  <a href="https://plocks.dev/" rel="noopener" target="_blank"><img height="64" src="https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png" alt="plocks"/></a>
</p>

<h1 align="center">@plocks/charts</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/plocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@plocks/charts)](https://www.npmjs.com/package/@plocks/charts)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/kbHjwzgXbc)

</div>

Data visualization components for React Native and React Native Web. Part of the [plocks](https://plocks.dev/) ecosystem.

## Features

- **24 chart types** — Bar, Line, Area, Pie, Scatter, Radar, Heatmap, Candlestick, Funnel, Donut, Sparkline, and more
- **Responsive by default** — a chart fills the box it is placed in and redraws when that box changes
- **Animated** — Smooth transitions powered by `react-native-reanimated`
- **Interactive** — Built-in tooltips, popovers, pan & zoom, and streaming data support
- **Accessible** — Screen reader support via the `ChartAccessibility` layer
- **Themeable** — Full theming via `ChartThemeContext`
- **Cross-platform** — Works on iOS, Android, and Web
- **Tree-shakeable** — ESM build with no side effects

## Installation

```bash
npm install @plocks/charts
```

### Peer dependencies

Ensure the following are installed in your project:

| Package | Version |
| --- | --- |
| `react` | `>=18.0.0 <20.0.0` |
| `react-native` | `>=0.73.0` |
| `react-native-reanimated` | `>=3.4.0` |
| `react-native-svg` | `>=13.0.0` |
| `react-dom` *(optional — web only)* | `>=18.0.0 <20.0.0` |

## Quick start

```tsx
import { AreaChart } from '@plocks/charts';

const data = [
  { x: 1, y: 120 },
  { x: 2, y: 180 },
  { x: 3, y: 165 },
];

export function RevenueChart() {
  return (
    <AreaChart
      h={220}
      data={data}
    />
  );
}
```

## Sizing

Leave `w` off and the chart measures the space it was given, fills it, and
redraws when that space changes — in a flex row, a resizing window, a phone in
landscape. Nothing else is required to make a chart responsive.

```tsx
<View style={{ flex: 1, padding: 16 }}>
  <LineChart data={data} h={240} />   {/* as wide as the padded box */}
</View>
```

| Prop | Effect |
| --- | --- |
| `w` | Pins the width. Still capped by the container — a chart never draws wider than the box it is in. |
| `h` | Pins the height. Defaults to the chart's resting height. |
| `aspectRatio` | Height as `w / aspectRatio`, when `h` is omitted. `2` stays twice as wide as it is tall at every size. |
| `maw` / `miw` | Bounds on the resolved width. `maw` is the usual way to keep a radial chart from stretching across a wide column. |
| `mah` / `mih` | Bounds on a height derived from `aspectRatio`. |

Margins are measured, not fixed: the space reserved for tick labels, axis titles,
legends, and the chart title comes from the text that will actually be drawn. A
chart with `$0`–`$500k` on its value axis spends less width on the axis than one
labelled `1,250,000`.

### Narrow chart behavior

These rules use the chart's **measured width**, so they also apply to a narrow
dashboard column on a large screen:

- Below 480 px, side legends move below the plot. Titles and subtitles use at
  most two lines, and the second title on a dual-axis chart is omitted while
  its series remains identified by the legend and tooltip.
- Long single-word tick labels are truncated instead of breaking mid-word;
  multiword labels may wrap onto two lines. Annotation labels stay within the
  plot and stagger when several markers are close together. Grouped bars omit
  value labels that cannot fit within their bars; their values remain in tooltips.
- Below 400 px, PieChart hides outside slice labels when tooltips are enabled
  and reveals the selected slice in a contained tooltip. Set
  `showLabelsOnNarrow` to keep outside labels.
- Below 400 px, RadialBarChart puts values in its visible legend instead of
  crowding the center with arc-tip labels. Set `showValueLabelsOnNarrow` to
  keep the tip labels. Ring thickness and gaps shrink together when needed
  to keep every series visible and leave room for the center readout.
- Below 400 px, RadarChart numbers its spokes and adds a full-name axis key
  when long labels would reduce the web below a readable size. The tooltip
  also includes the full axis name. Set `radialGrid.showFullLabelsOnNarrow`
  to keep the original spoke labels.
- Heatmap cell text and Bar value labels are omitted when they cannot fit.
  Narrow heatmaps retain at least 24 px row height when the requested cell
  height and available vertical space allow it.
  On charts below 400 px, Scatter quadrant captions move into point tooltips;
  Violin statistic labels move into the selected distribution's tooltip when
  live tooltips are enabled. The plotted fills and statistic markers remain.
- On touch devices, chart tooltips stay visible for eight seconds after
  release so values can be read without keeping a finger over the chart.

Run `npm run docs:visual:charts-mobile` from the repository root to check
all 24 chart types at 320 px and 390 px in light and dark mode. The suite
compares every public demo at 320 px, the first demo of each chart at 390 px,
and a selected-value state for each chart at both widths. Touch checks also
verify that tooltips stay near their chart and dismiss after eight seconds.

Gallery images are written to
`test-results/visual-gallery/charts-mobile/<Chart>/<light|dark>/`.
Reference images live beside the Playwright specs in
`apps/docs/tests/*spec.ts-snapshots/`.

## Available charts

| Chart | Component |
| --- | --- |
| Area | `AreaChart` |
| Bar | `BarChart` |
| Bubble | `BubbleChart` |
| Candlestick | `CandlestickChart` |
| Combo | `ComboChart` |
| Donut | `DonutChart` |
| Funnel | `FunnelChart` |
| Grouped Bar | `GroupedBarChart` |
| Heatmap | `HeatmapChart` |
| Histogram | `HistogramChart` |
| Line | `LineChart` |
| Marimekko | `MarimekkoChart` |
| Network | `NetworkChart` |
| Pareto | `ParetoChart` |
| Pie | `PieChart` |
| Radar | `RadarChart` |
| Radial Bar | `RadialBarChart` |
| Ridge | `RidgeChart` |
| Sankey | `SankeyChart` |
| Scatter | `ScatterChart` |
| Sparkline | `SparklineChart` |
| Stacked Area | `StackedAreaChart` |
| Stacked Bar | `StackedBarChart` |
| Violin | `ViolinChart` |

## Hooks

| Hook | Description |
| --- | --- |
| `useChartAnimation` | Animation timing and transitions |
| `useChartData` | Data management and updates |
| `useDataDecimation` | Optimize rendering of large datasets |
| `useDomains` | Calculate value ranges |
| `useChartPointer` | Normalized pointer events + hit-testing for interaction |
| `usePanZoom` | Pan and zoom gesture handling |
| `useStreamingData` | Handle real-time data feeds |
| `useChartAutoSize` | Resolve a drawing box from size props plus the measured container |

## Color

Every chart colors its marks in the same order. The first match wins:

1. The data item's own `color`
2. The series' `color`
3. `colorScale`: a config or a function. A function returning `undefined` falls through.
4. The chart-level prop (`barColor`, `lineColor`, …)
5. The theme's `accentPalette`, assigned by slot

Set a palette once with `ChartThemeProvider`. A nested provider re-themes only its own subtree:

```tsx
<ChartThemeProvider value={{ colors: { accentPalette: ['#7c5cdb', '#d9731a'] } }}>
  <HistogramChart data={values} />
</ChartThemeProvider>
```

Every chart reads its palette from the nearest provider.

Charts that color marks by data take a shared `ColorScaleConfig` (`sequential`, `diverging` or `threshold`). Filled marks take a `ChartFill`, which is a color or a gradient:

| Chart | `colorScale` config reads | `ChartFill` props |
|---|---|---|
| HistogramChart | bin position (`by: 'x'`) or count (`by: 'count'`) | `barColor` |
| BarChart | each bar's value | `barColor` |
| BubbleChart | the `dataKey.color` field, or `by: 'x' \| 'y' \| 'z'` | none |
| HeatmapChart | each cell's value | none |
| LineChart, AreaChart | none | `fillColor` (chart or per series) |
| StackedAreaChart | none | per-series `fillColor` |
| PieChart | none | slice `style.gradient` |

```tsx
<HistogramChart
  data={loadTimes}
  colorScale={{ type: 'threshold', thresholds: [2.5, 3.2], labels: ['Within SLO', 'At risk', 'Breaching'] }}
/>
<HistogramChart
  data={values}
  barColor={{ angle: 90, extent: 'plot', stops: [{ offset: 0, color: '#1c5cab' }, { offset: 1, color: '#86b6ef' }] }}
/>
```

`createColorScale`, `interpolateColor` and `ChartGradientDef` are exported for custom charts.

## Shared tooltip provider

When you need multiple charts to share a single tooltip, wrap them in `ChartsProvider` and set `useOwnInteractionProvider={false}` on each chart:

```tsx
import { ChartsProvider, BarChart, LineChart } from '@plocks/charts';

export function Dashboard() {
  return (
    <ChartsProvider>
      <BarChart useOwnInteractionProvider={false} /* ... */ />
      <LineChart useOwnInteractionProvider={false} /* ... */ />
    </ChartsProvider>
  );
}
```

## Documentation

Full documentation, interactive examples, and API reference are available at [plocks.dev](https://plocks.dev).

- [Getting started](https://plocks.dev/getting-started)
- [Charts](https://plocks.dev/charts)
- [llms.txt](https://plocks.dev/llms.txt) — Full API reference for LLMs and AI assistants

## Contributing

See the [contributing guide](https://github.com/platform-blocks/plocks/blob/main/CONTRIBUTING.md) for setup instructions.

## License

[MIT](https://github.com/platform-blocks/plocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
