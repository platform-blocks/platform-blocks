---
playground: true
title: Heatmap Chart
tags: [chart, heatmap, matrix]
category: charts
order: 9
---
Color-coded matrix for intensity visualization across two dimensions.

## Color

With no `colorScale`, cells use a single-hue ramp built from the theme's first palette color. Pass a shared config to change it:

- `sequential`: one ramp, low to high. Add `interpolation: 'log'` for data that spans orders of magnitude.
- `diverging`: two arms around a `midpoint`.
- `threshold`: flat bands split at `thresholds`. The gradient legend shows hard band edges.

`domain` sets the value extent and `nullColor` paints empty cells. The legacy `linear` / `log` / `quantize` configs (with `min` / `max`) still work unchanged.
