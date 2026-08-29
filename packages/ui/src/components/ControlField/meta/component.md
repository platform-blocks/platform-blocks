---
name: ControlField
title: ControlField
category: input
tags: [control, field, checkbox, switch, radio, toggle, form, selection, row]
playground: true
props:
  isSelected: Controlled selected state (alias: checked)
  defaultSelected: Initial selected state for uncontrolled usage
  onSelectedChange: Callback fired with the next selected value (alias: onChange)
  variant: Built-in indicator control — 'checkbox' | 'radio' | 'switch' (default 'switch')
  label: Primary label text
  description: Helper text shown beneath the label
  error: Error message shown below the row when invalid
  isInvalid: Marks the field invalid (defaults to true when error is set)
  isRequired: Renders a required asterisk on the label (alias: required)
  isDisabled: Disables the field (alias: disabled)
  indicatorPosition: Which side the control sits on — 'left' | 'right' (default 'right')
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
