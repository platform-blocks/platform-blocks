---
title: Measure a container
category: basics
order: 10
tags: [layout, measure]
status: stable
hidden: false
---

Resize the window to watch the box's own size update. `useElementSize()` returns `{ width, height, measured, onLayout }`: pass `onLayout` to the element to measure. `measured` is `false` until the first layout event, while `width` and `height` are still 0.

On the web React Native Web backs `onLayout` with a ResizeObserver, so the size follows the element, not just the window. The returned object keeps its identity until the size changes. To also run your own `onLayout`, call both from one handler.
