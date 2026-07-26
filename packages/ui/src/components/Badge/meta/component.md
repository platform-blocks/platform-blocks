---
name: Badge
title: Badge
category: data-display
tags: [chip, tag, badge, label, removable]
playground: true
props:
  variant: 'filled' (default) | 'outline' | 'light' | 'subtle' | 'gradient'
  v: Alias for variant
  color: Theme palette name or CSS color
  c: Alias for color
  size: Size token (xs–3xl)
  startIcon / endIcon: Slot icons
  onRemove: Show a remove button (also `removePosition: 'left' | 'right'`)
  textStyle: Raw TextStyle escape hatch on the inner label
  labelProps: Override props applied to the inner label `<Text>` (style, weight, ff, size, colorVariant)
examples:
  - basic
  - variants
  - colors
  - sizes
  - shadow
  - aliases
---
The Badge component displays compact elements that represent an input, attribute, or action. Supports different colors, sizes, and interactive features like removal. Inner label accepts the full Text-prop API via `labelProps`.
