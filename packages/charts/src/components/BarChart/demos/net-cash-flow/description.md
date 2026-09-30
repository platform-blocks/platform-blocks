---
title: Diverging from zero
order: 20
tags: [color, diverging]
---
**Key settings**
- `colorScale={{ type: 'diverging', midpoint: 0, colors: [low, high] }}` colors each bar by its value. The scale's domain always includes zero, where bars start.
- Both arms are symmetric around the midpoint, so a $40k loss and a $40k gain carry the same intensity.
