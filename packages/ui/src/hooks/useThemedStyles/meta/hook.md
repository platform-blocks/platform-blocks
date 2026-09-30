---
title: useThemedStyles
category: theme
order: 40
tags: [theme, styles, stylesheet, performance, memoization]
status: stable
hidden: false
---

Build a style table from the theme once per theme and dependency list instead of on every render. `createThemedStyles` is the module-level variant: a style factory cached per theme and argument list, for tables keyed by size, variant and the like.
