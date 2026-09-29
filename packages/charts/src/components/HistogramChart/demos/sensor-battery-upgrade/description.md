---
title: Diverging from a target
order: 3
tags: [color, diverging]
---
**Key settings**
- `colorScale={{ type: 'diverging', midpoint: 3.9, colors: [low, high] }}` colors bins by which side of the target they fall on. A neutral gray middle is added automatically.
- The arms are symmetric: bins the same distance from the midpoint get the same intensity, even though the data reaches further below the target than above it.
