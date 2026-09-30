---
title: useTheme
category: theme
order: 10
tags: [theme, tokens, colors, design-tokens]
status: stable
hidden: false
---

Read the active `PlocksTheme` (color ramps, text and background roles, spacing, radii, font sizes) to style your own primitives; outside a provider it returns `DEFAULT_THEME`. Use `useThemeVisuals()` when a component reads only colors (`colors`, `text`, `backgrounds`, `states`, `colorScheme`, `primaryColor`), so layout-token changes don't re-render it. Use `useThemeLayout()` when it reads only layout tokens (`spacing`, `radii`, `fontSizes`, `shadows`, `breakpoints`, `controlSizes`, `zIndices`, fonts), so color changes don't re-render it.
