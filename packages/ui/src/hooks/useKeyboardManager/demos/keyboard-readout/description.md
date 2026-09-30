---
title: Keyboard readout
category: basics
order: 10
tags: [keyboard, focus, native]
status: stable
hidden: false
---

`useKeyboardManager()` returns `isKeyboardVisible`, `keyboardHeight`, `keyboardEndCoordinates` and `keyboardAnimationDuration` / `keyboardAnimationEasing`, plus `dismissKeyboard()` and a focus hand-off: `refocus(id)` marks a target, and the Input, PinInput or AutoComplete whose `keyboardFocusId` matches takes focus (Input and PinInput also match on `name` or `testID`). The metrics come from React Native's `Keyboard` events, so they only move on iOS and Android; on web they stay at hidden and 0. `PlocksProvider` doesn't mount a `KeyboardManagerProvider`, so add one near your app root yourself; `useKeyboardManager` throws without it.
