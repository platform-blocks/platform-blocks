---
title: Respect reduced motion
category: basics
order: 10
tags: [motion, animation, accessibility]
status: stable
hidden: false
---

`useReducedMotion()` returns a boolean: the square spins while it is `false` and snaps to its resting angle when it turns `true`. With the switch off the value follows your OS setting; switched on, it wraps the square in `<ReducedMotionProvider reducedMotion>`, the way an in-app preference would. The provider takes `true` / `false` to force the value for its subtree or `'system'` to follow the OS, and inherits its parent's setting when the prop is omitted; `PlocksProvider` mounts one from its own `reducedMotion` prop. Server rendering always reads `false`.
