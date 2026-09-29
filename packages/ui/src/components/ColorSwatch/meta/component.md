---
name: ColorSwatch
title: ColorSwatch
category: display
tags: [color, swatch, palette, picker]
playground: true
---
A simple square component for displaying colors, designed as a building block for color pickers and palette interfaces.

## Accessibility

- Without `onPress` the swatch is a display chip; it is only exposed to assistive technology (as an image) when `accessibilityLabel` is set.
- With `onPress` it is a button named "Color &lt;color&gt;" (override with `accessibilityLabel`). Passing `selected` makes it a toggle (`aria-pressed`).
- Inside a group, set `role="radio"` (selection exposed as `aria-checked`) or `role="option"` (`aria-selected`); `tabIndex`, `onKeyDown` and `onFocus` let the group run a roving tab stop.
- Disabled swatches are not pressable and report `aria-disabled`.
