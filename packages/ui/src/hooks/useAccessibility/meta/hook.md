---
title: useAccessibility
category: accessibility
order: 60
tags: [accessibility, announce, screen-reader, provider]
status: stable
hidden: false
---

Read the whole `AccessibilityProvider` context at once: `announce()`, the announcement log, focus tracking, and screen reader and reduced-motion state. It re-renders on every change, so when you only need one of these, use `announce` or `useReducedMotion` instead.
