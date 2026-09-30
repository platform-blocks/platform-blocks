---
title: Gradient fill
order: 5
tags: [color, gradient]
---
**Key settings**
- `barColor` accepts a gradient as well as a color: `{ angle, stops, extent }`. `angle` is in degrees; 90 runs top to bottom.
- `extent: 'plot'` lays one gradient across the whole plot, so each bar shows the slice behind it and taller bins reach the deeper end. The default, `extent: 'mark'`, gives every bar the full gradient.
