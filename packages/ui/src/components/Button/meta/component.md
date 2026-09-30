---
name: Button
title: Button
category: input
tags: [action, pressable, interactive]
playground: true
resources: [{"label":"Apple HIG – Buttons","href":"https://developer.apple.com/design/human-interface-guidelines/buttons"},{"label":"Material 3 Buttons","href":"https://m3.material.io/components/buttons/overview"}]
props:
  title: Button label (alternative to children)
  variant: 'default' (default) | 'filled' | 'light' | 'subtle' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'link' | 'none'
  size: Size token (xs–3xl)
  color: Tint for the color-bearing variants (filled, light, subtle, outline, gradient) and the text of ghost/link — palette name, 'palette.shade' syntax, or raw CSS color. Ignored by the neutral variants (default, secondary, none)
  textColor: Explicit text color override
  startSection / endSection / icon: Slot content
  loading: Show loader state
  fullWidth: Stretch to fill the parent container (buttons size to their content by default)
  labelProps: Override props applied to the inner label `<Text>` (style, fw, ff, size, c)
  tooltip: Wraps the button in a Tooltip
examples:
  - basic
  - variants
  - colors
  - sizes
  - loading
  - tooltip
  - width
---
A flexible interactive button element supporting variants, sizes, icons, loading state, and full-width layout.