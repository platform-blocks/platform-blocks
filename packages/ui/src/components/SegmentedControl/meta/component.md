---
name: SegmentedControl
description: Toggle between preset options with an animated pill indicator
category: input
subcategory: Selection Controls
tags: [input, segmentation, toggle, selection]
status: beta
playground: true
since: 1.0.0
platform:
  web: true
  ios: true
  android: true
accessibility:
  - Uses radiogroup semantics
  - Screen reader labels for each segment
  - Reduced motion aware indicator
examples:
  basic: Basic segmented control
  sizes: Different sizes
  full-width: Full width layout
  orientation: Horizontal and vertical layouts
  colors: Custom colors
  variants: Visual variants
  states: Different states
---

Segmented controls present a small set of exclusive options. The indicator animates between segments with support for horizontal and vertical layouts, optional auto contrast for filled variants, and reduced motion awareness for accessibility.
