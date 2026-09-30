---
name: Checkbox
title: Checkbox
category: input
tags: [checkbox, input, form, selection, toggle]
playground: true
props:
  checked: Controlled checked state
  onChange: Callback fired when the checkbox state changes
  defaultChecked: Initial checked state for uncontrolled usage
  label: Label displayed beside the checkbox (ReactNode); pressing it toggles the box
  description: Supporting text shown beneath the label (ReactNode)
  helperText: Text shown under the control while there is no error
  size: Size token controlling checkbox + label scaling
  radius: Box corner radius (token or px)
  color: Indicator color — palette token | 'primary.6' | any CSS color
  disabled: Whether the checkbox is disabled
  readOnly: Shows the state but ignores input
  required: Whether the checkbox is required (asterisk + announced)
  error: Error message (ReactNode); replaces helperText and marks the control invalid
  indeterminate: Renders the checkbox in mixed state (`aria-checked="mixed"`)
  labelPosition: 'left' | 'right' | 'top' | 'bottom' (left/right follow the reading direction)
  labelProps: Override props applied to the label `<Text>` (style, fw, ff, etc.)
  descriptionProps: Override props applied to the description `<Text>`
  transitionDuration: Length of the check/uncheck animation in ms; `0` applies the state instantly
examples:
  - Basic checkbox usage
  - Indeterminate state
  - Label customization with labelProps / descriptionProps
---

Checkbox lets users select options individually or in a group.
