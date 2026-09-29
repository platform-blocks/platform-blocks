---
name: Switch
description: A toggle switch component for binary on/off states
category: input
subcategory: Form Controls
tags: [input, form, toggle, switch, boolean]
status: stable
since: 1.0.0
playground: true
platform:
  web: true
  ios: true
  android: true
accessibility:
  - role="switch" with aria-checked; one tab stop, Space toggles
  - The label is linked through aria-labelledby and toggles the same control when pressed
  - helperText / error are linked through aria-describedby; errors are announced
related:
  - Checkbox
  - Radio
  - Toggle
examples:
  basic: Basic switch usage
  colors: Different color variants
  sizes: Various sizes
  states: Different states and behaviors
---

Switch components provide a way to toggle between two states, typically representing on/off or enabled/disabled states.
