---
title: Theme-aware styles
category: basics
order: 10
tags: [theme, styles, stylesheet]
status: stable
hidden: false
---

`useThemedStyles(factory, deps?)` calls `factory(theme)` and memoizes whatever it returns (a plain style object or a `StyleSheet.create` table) on the theme object plus `deps`, so the card's styles are rebuilt only when the color scheme switches or `compact` changes. List everything the factory closes over in `deps`; the factory itself is not a dependency, so an inline arrow is fine. For styles shared across instances, `createThemedStyles((theme, ...args) => styles)` returns a function cached per theme and per argument list; the extra arguments must be primitives.
