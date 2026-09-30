---
name: ControlField
title: ControlField
category: input
tags: [control, field, checkbox, switch, radio, toggle, form, selection, row]
playground: true
props:
  checked: Controlled on/selected state
  defaultChecked: Initial state for uncontrolled usage
  onChange: Callback fired with the next state
  variant: Built-in indicator control — 'checkbox' | 'radio' | 'switch' (default 'switch')
  label: Primary label (ReactNode)
  description: Supporting text shown beneath the label (ReactNode)
  error: Error shown below the row; marks the field invalid. `true` marks it invalid without a message
  required: Renders a required asterisk and announces it
  disabled: Disables the field
  indicatorPosition: Which side the control sits on — 'left' | 'right' (logical: follows the reading direction; default 'right')
  control: Custom control element used instead of the built-in variant indicator
  color: Indicator color (theme color name or literal)
  size: Indicator + label size
examples:
  - Basic switch row
  - Checkbox variant with description and validation
  - Custom control via the Indicator slot
  - Grouped surface with dividers (ControlField.Group)
---
ControlField combines a label, description, and a control (Switch, Checkbox, or Radio) into a single pressable row.