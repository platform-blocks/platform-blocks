---
title: Show and hide by breakpoint
category: basics
order: 10
tags: [visibility, responsive, breakpoints, color-scheme]
status: stable
hidden: false
---

Two of the four tags render at any time: one per breakpoint rule, one per color scheme. `useVisibility(props)` returns `false` when `hiddenFrom="md"` and the viewport is `md` or wider, when `visibleFrom="md"` and it is narrower, or when `lightHidden` / `darkHidden` matches the current scheme; a hidden component should return `null` rather than hide with styles. Components built with `factory` (every library component) already handle these props, so the hook is for components you write yourself. It only subscribes to the viewport while `hiddenFrom` or `visibleFrom` is set, and static rendering assumes the `xl` breakpoint until hydration.
