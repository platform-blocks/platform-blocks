<p align="center">
  <a href="https://platform-blocks.com/" rel="noopener" target="_blank"><img width="75" height="75" src="https://raw.githubusercontent.com/platform-blocks/platform-blocks/refs/heads/main/apps/platform-blocks.com/assets/favicon.png" alt="Platform Blocks logo"/></a>
</p>

<h1 align="center">@platform-blocks/charts</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/platform-blocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@platform-blocks/charts)](https://www.npmjs.com/package/@platform-blocks/charts)
[![Discord](https://img.shields.io/badge/Chat%20on-Discord-%235865f2)](https://discord.gg/kbHjwzgXbc)

</div>

Data visualization components for React Native and React Native Web. Part of the [Platform Blocks](https://platform-blocks.com/) ecosystem.

## Features

- **25 chart types** — Bar, Line, Area, Pie, Scatter, Radar, Heatmap, Candlestick, Funnel, Donut, Gauge, Sparkline, and more
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
      width={320}
      height={220}
      data={data}
      xKey="month"
      yKey="value"
    />
  );
}
```

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

Full documentation, interactive examples, and API reference are available at [platform-blocks.com](https://platform-blocks.com).

- [Getting started](https://platform-blocks.com/getting-started)
- [Charts](https://platform-blocks.com/charts)
- [llms.txt](https://platform-blocks.com/llms.txt) — Full API reference for LLMs and AI assistants

## Contributing

See the [contributing guide](https://github.com/platform-blocks/platform-blocks/blob/main/CONTRIBUTING.md) for setup instructions.

## License

[MIT](https://github.com/platform-blocks/platform-blocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)