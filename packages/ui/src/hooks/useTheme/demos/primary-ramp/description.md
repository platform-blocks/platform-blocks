---
title: Read theme tokens
category: basics
order: 10
tags: [theme, tokens, colors]
status: stable
hidden: false
---

`useTheme()` returns the active `PlocksTheme`. The demo renders `theme.colors.primary`, a ten-shade ramp with the base color at index 5, and re-renders when the color scheme switches (dark ramps run darkest to lightest). `theme.text`, `theme.backgrounds` and `theme.surfaces` hold semantic colors; `theme.spacing`, `theme.radii` and `theme.fontSizes` hold CSS pixel strings such as `'16px'`, so convert them with `resolveSpacing` / `resolveRadius` / `resolveFontSize` before handing them to a React Native style. Prefer component props (`c`, `bg`, `p`, `radius`) where they exist.
