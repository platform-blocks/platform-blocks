<p align="center">
  <a href="https://react-ui-library.com/" rel="noopener" target="_blank"><img width="75" height="75" src="https://raw.githubusercontent.com/platform-blocks/react-ui-library/refs/heads/main/apps/react-ui-library.com/assets/favicon.png" alt="React UI Library logo"/></a>
</p>

<h1 align="center">@platform-blocks/charts</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/react-ui-library/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@platform-blocks/charts)](https://www.npmjs.com/package/@platform-blocks/charts)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/kbHjwzgXbc)

</div>

Data visualization components for React Native and React Native Web. Part of the [React UI Library](https://react-ui-library.com/) ecosystem.

## Features

- **25 chart types** — Bar, Line, Area, Pie, Scatter, Radar, Heatmap, Candlestick, Funnel, Donut, Gauge, Sparkline, and more
- **Responsive by default** — a chart fills the box it is placed in and redraws when that box changes
- **Animated** — Smooth transitions powered by `react-native-reanimated`
- **Interactive** — Built-in tooltips, popovers, pan & zoom, and streaming data support
- **Accessible** — Screen reader support via the `ChartAccessibility` layer
- **Themeable** — Full theming via `ChartThemeContext`
- **Cross-platform** — Works on iOS, Android, and Web
- **Tree-shakeable** — ESM and CJS builds with no side effects

## Installation

```bash
npm install @platform-blocks/charts
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
import { AreaChart } from '@platform-blocks/charts';

export function RevenueChart({ data }) {
  return (
    <AreaChart
      height={220}
      data={data}
      xKey="month"
      yKey="value"
    />
  );
}
```

## Sizing

Leave `width` off and the chart measures the space it was given, fills it, and
redraws when that space changes — in a flex row, a resizing window, a phone in
landscape. Nothing else is required to make a chart responsive.

```tsx
<View style={{ flex: 1, padding: 16 }}>
  <LineChart data={data} height={240} />   {/* as wide as the padded box */}
</View>
```

| Prop | Effect |
| --- | --- |
| `width` | Pins the width. Still capped by the container — a chart never draws wider than the box it is in. |
| `height` | Pins the height. Defaults to the chart's resting height. |
| `aspectRatio` | Height as `width / aspectRatio`, when `height` is omitted. `2` stays twice as wide as it is tall at every size. |
| `maxWidth` / `minWidth` | Bounds on the resolved width. `maxWidth` is the usual way to keep a radial chart from stretching across a wide column. |
| `maxHeight` / `minHeight` | Bounds on a height derived from `aspectRatio`. |

Margins are measured, not fixed: the space reserved for tick labels, axis titles,
legends, and the chart title comes from the text that will actually be drawn. A
chart with `$0`–`$500k` on its value axis spends less width on the axis than one
labelled `1,250,000`, and neither wraps or clips.

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
| Gauge | `GaugeChart` |
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

## Shared tooltip provider

When you need multiple charts to share a single tooltip, wrap them in `ChartsProvider` and set `useOwnInteractionProvider={false}` on each chart:

```tsx
import { ChartsProvider, BarChart, LineChart } from '@platform-blocks/charts';

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

Full documentation, interactive examples, and API reference are available at [react-ui-library.com](https://react-ui-library.com).

- [Getting started](https://react-ui-library.com/getting-started)
- [Charts](https://react-ui-library.com/charts)
- [llms.txt](https://react-ui-library.com/llms.txt) — Full API reference for LLMs and AI assistants

## Contributing

See the [contributing guide](https://github.com/platform-blocks/react-ui-library/blob/main/CONTRIBUTING.md) for setup instructions.

## License

[MIT](https://github.com/platform-blocks/react-ui-library/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)