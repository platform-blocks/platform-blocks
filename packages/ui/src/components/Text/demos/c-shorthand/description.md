---
title: c (color shorthand)
order: 25
tags: [c, color, shorthand, theme]
highlightLines: []
status: stable
since: 1.0.0
hidden: false
---

`c` is a shorthand for `color` that resolves through the theme. Accepts:
- `'dimmed'` → maps to `theme.text.muted`
- Theme text keys (`'primary'`, `'secondary'`, `'muted'`, `'disabled'`, `'link'`)
- Palette names (`'primary'`, `'success'`, …) → palette shade-6 (readable text)
- `'palette.shade'` syntax (`'primary.6'`)
- Any CSS color string
