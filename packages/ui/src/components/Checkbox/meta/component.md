---
name: Checkbox
title: Checkbox
category: input
tags: [checkbox, input, form, selection, toggle]
playground: true
props:
  checked: Controlled checked state
  onChange: Callback fired when the checkbox state changes
  label: Label text displayed beside the checkbox
  description: Helper text shown beneath the label
  size: Size token controlling checkbox + label scaling
  color: Custom color override (overrides colorVariant)
  colorVariant: Named color from theme — primary | success | warning | error | secondary
  disabled: Whether the checkbox is disabled
  required: Whether the checkbox is required
  error: Error message replacing the description
  indeterminate: Renders the checkbox in mixed state
  labelPosition: 'left' | 'right' | 'top' | 'bottom'
  labelProps: Override props applied to the label `<Text>` (style, weight, ff, etc.)
  descriptionProps: Override props applied to the description `<Text>`
  transitionDuration: Length of the check/uncheck animation in ms; `0` applies the state instantly
examples:
  - Basic checkbox usage
  - Indeterminate state
  - Label customization with labelProps / descriptionProps
---
The Checkbox component allows users to select one or more options from a set. Supports different states, colors, and group functionality.
