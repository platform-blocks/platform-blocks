---
title: useDeviceInfo
category: platform
order: 10
tags: [device, responsive, platform]
status: beta
since: 0.4.0
hidden: false
---

Gather a complete snapshot of runtime details, OS metadata, safe area insets, screen metrics, locale, input capabilities, and helper booleans.

All instances share one set of platform listeners, and the hook is hydration-safe: server rendering and the hydration pass see deterministic defaults (`meta.ready` is `false`), then the live values arrive. `appearance.reducedMotion` is the same value `useReducedMotion()` returns.
