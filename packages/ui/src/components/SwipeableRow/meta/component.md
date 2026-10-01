---
name: SwipeableRow
description: Reveal contextual actions on a row with a swipe or an accessible action button
category: data
subcategory: Data
tags: [swipe, row, actions, list]
status: beta
playground: true
platform:
  web: true
  ios: true
  android: true
accessibility:
  - Action button exposes all commands to keyboard and touch users
  - Action buttons have accessible names
examples:
  basic: Swipe actions
---

SwipeableRow reveals actions when swiped and provides an action button for keyboard and touch discovery. Actions use the theme-aware Button primitive. Put the row inside a `GestureHandlerRootView` to enable swipe gestures; the action button remains available without Gesture Handler.
