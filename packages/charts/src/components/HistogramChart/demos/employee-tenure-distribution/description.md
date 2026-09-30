---
title: Sequential shading by count
order: 4
tags: [color, sequential]
---
**Key settings**
- `colorScale={{ type: 'sequential', by: 'count' }}` shades each bin by how many people it holds instead of by where it sits (`by: 'x'`, the default).
- With no `colors`, the ramp is built from the bar color itself: a tint that recedes toward the chart surface at the low end, a deeper shade at the high end. On a dark theme the same rule flips the anchor automatically.
