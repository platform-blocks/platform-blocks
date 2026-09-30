---
title: Pick a color scheme
category: basics
order: 10
tags: [theme, dark-mode, color-scheme]
status: stable
hidden: false
---

`useThemeMode()` returns `{ mode, setMode, cycleMode, actualColorScheme }`: `mode` is the stored choice, `actualColorScheme` the `'light'` / `'dark'` it resolves to (`'auto'` follows the OS), and `cycleMode` steps light → dark → auto. Picking a mode here switches the whole docs site. `themeModeConfig` takes `initialMode` (default `'auto'`), `persistence: { get, set }` (default: `localStorage` on web, none on native, so pass a synchronous store there) and `domConfig` for the class and attribute written to `<html>` on web.
