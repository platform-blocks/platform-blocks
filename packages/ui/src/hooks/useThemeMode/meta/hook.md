---
title: useThemeMode
category: theme
order: 20
tags: [theme, dark-mode, color-scheme, persistence]
status: stable
hidden: false
---

Read and change the user's color-scheme choice (`'light'`, `'dark'` or `'auto'`) along with the scheme it resolves to, for building a theme switcher. Available below a `PlocksProvider` given `themeModeConfig`, which persists the choice (to `localStorage` on web by default); it throws without one.
