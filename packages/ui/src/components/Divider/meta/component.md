---
name: Divider
title: Divider
category: layout
tags: [divider, separator, line, section]
playground: true
props:
  orientation: 'horizontal' | 'vertical'
  variant: 'solid' | 'dashed' | 'dotted' | 'gradient' — gradient fades transparent → color → transparent
  color: Line color — 'border' (default) | 'subtle' | 'muted' | palette token | 'primary.6' | any CSS color
  size: Thickness in px or size token (default 1)
  opacity: Multiplied with the divider's overall opacity — convenience for `style={{ opacity }}`
  label: Optional content rendered in the middle of the line
  labelPosition: 'left' | 'center' | 'right'
  labelProps: Override props applied to the label `<Text>` (only when `label` is a string)
examples:
  - basic
  - variants
  - colors
  - gradient-opacity
  - sizes
  - labeled
  - vertical
---
The Divider component provides a visual separator between content sections. Supports horizontal and vertical orientations, four visual variants (`solid`, `dashed`, `dotted`, `gradient`), an aligned `color` vocabulary with a soft default tuned for separators, an `opacity` shorthand, and optional labels.
