---
title: Themed with a brand palette
order: 7
tags: [color, theme]
---
**Key settings**
- The chart sets no color props. Bars take palette slot 1 and the density line takes slot 2 from the nearest `ChartThemeProvider`.
- A nested provider re-themes only its own subtree: it inherits text, grid and surface colors from the app's theme and overrides just `accentPalette`.
