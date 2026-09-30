---
title: useKeyboardManager
category: input
order: 10
tags: [keyboard, on-screen-keyboard, focus, native]
status: stable
hidden: false
---

Read the on-screen keyboard's visibility, height and animation timing from `KeyboardManagerProvider`, dismiss it, or hand focus to an input by id; for layout that only needs the height, `useKeyboardHeight` is simpler. `useKeyboardMetricsOptional` and `useKeyboardFocusOptional` return one half each, so a consumer re-renders only for what it reads, and like `useKeyboardManagerOptional` they return null instead of throwing without a provider.
