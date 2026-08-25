---
playground: true
title: ColorInput
description: A color selection component with various input methods and preset swatches
source: ui/src/components/ColorInput
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
    description: Callback when color changes
  - name: placeholder
    type: string
    description: Placeholder text for the input
  - name: label
    type: string
    description: Label for the color picker
  - name: helperText
    type: string
    description: Additional help text
  - name: disabled
    type: boolean
    description: Whether the picker is disabled
    default: false
  - name: withSwatches
    type: boolean
    description: Whether to show color swatches
    default: true
  - name: swatches
    type: string[]
    description: Custom color swatches array
  - name: size
    type: string
    description: Size variant
    default: md
  - name: variant
    type: string
    description: Visual variant
    default: default
  - name: error
    type: string
    description: Error message to display
examples:
  - basic
  - swatches
  - states
  - variants
---

The ColorInput component provides an intuitive interface for selecting colors through various input methods including color wheel, hex input, and preset swatches.
