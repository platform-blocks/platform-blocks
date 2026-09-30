---
title: Gradient area fill
order: 4
tags: [color, gradient]
---
**Key settings**
- `fillColor` accepts a gradient as well as a color. A plain color fades from `fillOpacity` at the line to transparent at the baseline; a gradient is used exactly as given.
- `extent: 'plot'` spans one gradient across the whole plot, so peaks reach the deep end while quiet hours stay pale. Set `fillColor` on an individual series to give each area its own gradient.
