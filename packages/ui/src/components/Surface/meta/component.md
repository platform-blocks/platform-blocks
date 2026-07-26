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
  - levels
  - nesting
  - as-card
---

The base container the rest of the library's elevated components are built from
— what other libraries call "paper".

A Surface owns exactly one decision: **how far off the page it sits.** `level`
resolves background, border color and default shadow as a set from
`theme.surfaces`, so a component can't end up with a level-3 shadow over a
level-0 fill, and no component has to pick a background color itself.

## Why a numeric ladder

Elevation is ordered and nestable, so the scale is numeric rather than a set of
named slots (`secondary`, `tertiary`, …). Two things fall out of that:

- **Nesting composes.** `raised` reads the enclosing Surface's level and adds
  one, so a popover opened inside a card lands a step above the card without
  either one knowing the other's number.
- **Scheme differences live in one place.** Light mode conveys elevation mostly
  with shadow; dark mode can't — shadows are invisible on a near-black page — so
  it uses a progressively lighter fill plus a hairline border. Encoding that in
  the ladder means call sites never branch on `colorScheme`.

## Theming

Override `surfaces` on your theme to retune every elevated component at once:

```ts
createTheme({
  surfaces: {
    0: { background: '#0B0B0F', border: '#1A1A20', shadow: 'none' },
    1: { background: '#16161C', border: '#26262E', shadow: 'xs' },
    2: { background: '#1E1E26', border: '#2E2E38', shadow: 'md' },
    3: { background: '#26262F', border: '#363642', shadow: 'xl' },
  },
})
```

Themes that don't define `surfaces` get a ladder derived from `backgrounds`
(`base` → `surface` → `elevated`), so existing custom themes keep working.

## Used by

Card sits at level 1 (2 for `variant="elevated"`); Menu, Select dropdowns and
Popover at level 2; Dialog at level 3. `useSurfaceLevel()` reports the level of
the surface the caller is rendered on, and `surfaceInteractionTint()` returns
hover/pressed/selected overlays that read correctly at any level.
