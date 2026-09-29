---
playground: true
title: Histogram Chart
tags: [chart, histogram, distribution]
category: charts
order: 15
---
Distribution of continuous data split into bins.

## Interaction highlights

- Emits `HistogramBinSummary` via `onBinFocus` / `onBinBlur` so external UI can react to the active bin.
- Pointer metadata now includes cumulative counts, density ratios, and percentile—ideal for shared popovers.

## Color

Bar color resolves in this order, and the bars, tooltip swatches and legend always agree:

1. `colorScale`: per-bin color, either a config or a function `(bin) => color`. A function that returns `undefined` falls through.
2. `barColor`: one color or a gradient (`{ angle, stops, extent }`).
3. The theme's first palette slot. The density line defaults to the second slot.

`colorScale` configs come in three types:

- `sequential`: one ramp, low to high. Use it for magnitude.
- `diverging`: two arms around a `midpoint`. Use it for above or below a target.
- `threshold`: flat bands split at `thresholds`, with optional legend `labels`.

`by: 'x'` (the default) reads each bin's midpoint and `by: 'count'` reads its sample count. Leave out `colors` and the scale builds them from the theme.
