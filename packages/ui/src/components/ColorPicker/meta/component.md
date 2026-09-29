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
    type: "(color: string) => void"
    description: Callback fired with the normalized `#RRGGBB` value when a swatch is selected
  - name: swatches
    type: string[]
    description: Preset colors to choose from
  - name: swatchLabels
    type: Record<string, string>
    description: Readable names for the swatches, keyed by color (defaults to the color string)
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
  - name: accessibilityLabel
    type: string
    description: Accessible name of the trigger (defaults to "Color <value>" or "Select a color")
examples:
  - basic
---

ColorPicker is a lightweight alternative to ColorInput for cases where a full hex input and field chrome are unnecessary. It renders a single color preview button that opens a compact palette of preset swatches — an anchored dropdown on desktop web, a sheet on native and small screens.

## Accessibility

- The trigger is a button named after the current color (or `accessibilityLabel`) and reports `aria-expanded`.
- The palette is a `radiogroup` of `radio` swatches; on web it has one tab stop, arrow keys move in two dimensions, and Enter or Space picks a swatch. Escape closes the palette and returns focus to the trigger.
