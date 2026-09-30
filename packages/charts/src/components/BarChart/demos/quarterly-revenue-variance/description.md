---
title: Coloring with a function
order: 40
tags: [color, status]
---
**Key settings**
- `colorScale` also accepts a function, `({ datum, series, seriesIndex, categoryIndex }) => color`. Here each region is green when it beat its goal and red when it missed. Return `undefined` to fall back to `barColor`.
- Green and red are status colors, so the value labels state every variance: color is never the only cue.
