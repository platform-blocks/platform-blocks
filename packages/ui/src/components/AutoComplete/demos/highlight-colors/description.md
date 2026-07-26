---
title: Highlight colours
category: styling
order: 70
tags: [highlight, palette, theme]
highlightLines: []
status: stable
since: 1.0.0
hidden: false
---

`highlightMatches` bolds and tints the part of each suggestion that matches what
you typed. That tint is derived from `theme.colors.primary` by default; pass
`highlightColor` (and optionally `highlightBackgroundColor`) to override it —
here with shades from `theme.colors.highlight`. Pick a swatch while the menu is
open to see the match repaint.