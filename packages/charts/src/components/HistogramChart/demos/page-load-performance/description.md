---
title: Threshold coloring
order: 2
tags: [color, threshold]
---
**Key settings**
- `colorScale={{ type: 'threshold', thresholds: [2.5, 3.2] }}` splits bins into three bands by where they sit on the x axis. A bin whose midpoint lands on a breakpoint takes the band above it.
- Band colors are status colors (good, warning, critical), and `labels` gives each band a legend entry, so a band's meaning never rides on color alone.
