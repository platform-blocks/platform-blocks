---
name: Chip
title: Chip
summary: Compact tag the user can select (`checked` / `onChange`), press or remove — for filters and input tokens; use Badge for static status labels
category: data
tags: [chip, tag, badge, label, removable]
playground: true
props:
  variant: 'filled' (default) | 'outline' | 'light' | 'subtle' | 'surface' | 'gradient'
  color: Theme palette name or CSS color (unused by the `surface` variant)
  size: Size token (xs–3xl)
  startSection / endSection: Slot content
  checked / defaultChecked / onChange: Make the chip selectable — a checkbox (`aria-checked`) drawn in `variant` when checked and `uncheckedVariant` (default 'outline') when not
  onPress: Make the chip a button
  onRemove: Show a remove button named "Remove <label>" (also `removePosition`, `removeButtonLabel`)
  textStyle: Raw TextStyle escape hatch
  labelProps: Override props applied to the inner label `<Text>` (style, fw, ff, size, c)
examples:
  - basic
  - variants
  - theme-matrix
  - colors
  - sizes
  - shadow
  - interactive
  - selectable
---

Chip displays a compact item that can represent a value, choice, or action.
