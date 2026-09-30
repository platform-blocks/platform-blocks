---
title: useReducedMotion
category: accessibility
order: 70
tags: [motion, animation, accessibility, reduced-motion]
status: stable
hidden: false
---

Whether animations should be reduced: the OS preference (`prefers-reduced-motion` on web, `AccessibilityInfo` on native), or the override set by the nearest `ReducedMotionProvider`. Works without a provider; when it returns `true`, jump to end states instead of animating.
