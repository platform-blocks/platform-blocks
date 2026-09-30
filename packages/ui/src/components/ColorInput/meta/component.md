---
playground: true
title: ColorInput
description: A hex color field with a live preview and a swatch palette
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
    type: "(color: string) => void"
    description: Called with complete hex values while typing, the normalized `#RRGGBB` value on blur / submit / swatch selection, and `''` when cleared
  - name: placeholder
    type: string
    description: Placeholder text for the hex input
    default: Select color
  - name: label
    type: ReactNode
    description: Field label (linked to the hex input)
  - name: description
    type: ReactNode
    description: Description under the label
  - name: helperText
    type: ReactNode
    description: Helper text under the field (hidden while there is an error)
  - name: error
    type: ReactNode
    description: Error message; marks the field invalid and is announced
  - name: required
    type: boolean
    description: Marks the field required
    default: false
  - name: disabled
    type: boolean
    description: Whether the field is disabled
    default: false
  - name: readOnly
    type: boolean
    description: Shows the value without allowing edits or swatch picks
    default: false
  - name: clearable
    type: boolean
    description: Show a clear button while there is a value
    default: false
  - name: withSwatches
    type: boolean
    description: Whether to show the swatch dropdown and its toggle button
    default: true
  - name: swatches
    type: string[]
    description: Custom color swatches array
  - name: swatchLabels
    type: Record<string, string>
    description: Readable names for the swatches, keyed by color (defaults to the color string)
  - name: size
    type: SizeValue
    description: Control size (theme control-size table)
    default: md
  - name: variant
    type: "'default' | 'filled' | 'outline' | 'unstyled'"
    description: Visual variant of the field frame
    default: default
  - name: radius
    type: RadiusValue
    description: Corner radius of the field frame
examples:
  - basic
  - swatches
---

ColorInput combines a hex field with a palette of preset colors.
