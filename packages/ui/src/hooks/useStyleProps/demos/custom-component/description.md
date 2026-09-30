---
title: Style props on your own component
category: basics
order: 10
tags: [style-props, spacing, custom-components]
status: stable
hidden: false
---

`Tag` accepts every style prop by typing its props as `StyleProps`, splitting them off with `extractStyleProps(props)` (which returns `{ styleProps, otherProps }`) and resolving them with `useStyleProps(styleProps)`. Spacing tokens resolve through `theme.spacing`, `bg` accepts background tokens (`'surface'`, `'subtle'`), palette names (a subtle tint) or `'primary.5'` shade syntax, and `'full'` sizes become `'100%'`. Horizontal spacing uses logical start/end properties so it mirrors in right-to-left layouts, and edge props win over the shorthands covering them (`pt` over `py` over `p`). The result is memoized on the prop values; `resolveStyleProps(props, theme?)` is the non-hook version.
