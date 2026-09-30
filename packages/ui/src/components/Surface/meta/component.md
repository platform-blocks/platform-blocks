---
name: Surface
title: Surface
category: layout
tags: [surface, paper, elevation, container, layout]
playground: true
props:
  level: Elevation step — `0` (page) | `1` (resting content, default) | `2` (floating over content) | `3` (takes over the screen). Drives background, border color and default shadow together.
  raised: Derive the level from the enclosing Surface, plus one (clamped at 3). Lets nested surfaces stack without hard-coding numbers.
  withBorder: `'auto'` (default) draws the hairline in dark mode only, where shadow can't convey elevation. Pass `true`/`false` to force it.
  borderColor: Border color override — implies a border
  borderWidth: Border width override in px — implies a border
  bg: Background override — CSS color, a `theme.backgrounds` key, or a palette name / `palette.shade`
  padding: Internal padding — size token ('xs'…'3xl') or pixel number. Surfaces have none by default.
  radius: Corner radius (size token or number, default 'md')
  shadow: Shadow token — overrides the level's default
examples:
  - basic
  - levels
  - nesting
  - as-card
---

Surface provides the base container for the library's elevated components.
