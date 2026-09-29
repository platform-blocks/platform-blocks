---
name: ControlField
title: ControlField
category: input
tags: [control, field, checkbox, switch, radio, toggle, form, selection, row]
playground: true
props:
  checked: Controlled on/selected state (deprecated alias `isSelected`)
  defaultChecked: Initial state for uncontrolled usage (deprecated alias `defaultSelected`)
  onChange: Callback fired with the next state (deprecated alias `onSelectedChange`)
  variant: Built-in indicator control — 'checkbox' | 'radio' | 'switch' (default 'switch')
  label: Primary label (ReactNode)
  description: Supporting text shown beneath the label (ReactNode)
  error: Error shown below the row; marks the field invalid. `true` marks it invalid without a message (deprecated alias `isInvalid`)
  required: Renders a required asterisk and announces it (deprecated alias `isRequired`)
  disabled: Disables the field (deprecated alias `isDisabled`)
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

The row itself is the control: it carries the `switch` / `checkbox` / `radio` role and `aria-checked`, is named by the label and described by the description and error, and toggles with Space on the web. The indicator inside is only a picture of the state, so there is exactly one tab stop per row.

`ControlField.Group`'s `title` uses the theme's `sectionLabel` text role; restyle it with `titleProps`.
