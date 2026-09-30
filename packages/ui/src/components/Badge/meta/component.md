---
name: Badge
title: Badge
summary: Compact label for a status, category or count, optionally pressable or removable — use Chip for tags the user selects and Indicator for a dot or count pinned to another element
category: data
tags: [chip, tag, badge, label, removable]
playground: true
props:
  variant: 'filled' (default) | 'outline' | 'light' | 'subtle' | 'gradient'
  v: Alias for variant
  c: Theme palette name or CSS color
  size: Size token (xs–3xl)
  startSection / endSection: Slot content
  onRemove: Show a remove button (also `removePosition: 'left' | 'right'`)
  textStyle: Raw TextStyle escape hatch on the inner label
  labelProps: Override props applied to the inner label `<Text>` (style, fw, ff, size, c)
examples:
  - basic
  - variants
  - colors
  - sizes
  - shadow
  - aliases
---

Badge displays a compact status or count on a parent element.
