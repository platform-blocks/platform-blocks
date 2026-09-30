---
title: useColorScheme
category: theme
order: 30
tags: [theme, dark-mode, color-scheme, system]
status: stable
hidden: false
---

Read the operating system's light/dark preference and re-render when it changes (`prefers-color-scheme` on web, `Appearance` on native). It ignores the app's own mode; for the scheme the app is actually rendering, read `useTheme().colorScheme`.
