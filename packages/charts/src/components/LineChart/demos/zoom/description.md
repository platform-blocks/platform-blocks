---
title: Zoom & pan
order: 20
tags: [zoom, pan, wheel, brush, interaction]
status: stable
hidden: false
---

Interactive zoom and pan on desktop web. **Scroll** the wheel over the plot to zoom, **drag** to pan, hold **Shift and drag** a box to zoom into a region, and **double-click** to reset.

Note that wheel zoom requires both `enableWheelZoom` **and** `enablePanZoom` — the wheel handler is a no-op when panning is disabled. `zoomMode="x"` constrains zooming to the time axis.
