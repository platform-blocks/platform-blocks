---
title: System color scheme
category: basics
order: 10
tags: [theme, dark-mode, system]
status: stable
hidden: false
---

`useColorScheme()` returns `'light' | 'dark'` from the OS and needs no provider. Switch your system appearance to see it update; the docs site's own theme toggle doesn't affect it. Static rendering has no OS to ask, so the server renders `'light'` and the client corrects it before first paint.
