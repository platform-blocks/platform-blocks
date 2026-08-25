---
playground: true
title: ColorPicker
description: A compact swatch-only color picker — a single preview trigger that opens a small preset palette.
source: ui/src/components/ColorPicker
status: stable
category: input
props:
  - name: value
    type: string
    description: Current color value in hex format (controlled)
  - name: defaultValue
    type: string
    description: Initial color value for uncontrolled usage
  - name: onChange
    type: function
    description: Callback fired when a swatch is selected
  - name: swatches
    type: string[]
    description: Preset colors to choose from
  - name: size
    type: number
    description: Size of the trigger + swatches in pixels
    default: 28
  - name: columns
    type: number
    description: Number of swatches per row in the popover
    default: 5
  - name: disabled
    type: boolean
    description: Whether the picker is disabled
    default: false
examples:
  - basic
---

ColorPicker is a lightweight alternative to ColorInput for cases where a full hex input and dropdown chrome are unnecessary. It renders a single color preview that toggles a compact popover of preset swatches — no text input, no positioning engine.
