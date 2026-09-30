---
title: Adapt per breakpoint
category: basics
order: 10
tags: [responsive, breakpoints, columns]
status: stable
hidden: false
---

`useBreakpoint()` returns a `Breakpoint`: `base` below `xs`, then `xs` (480), `sm` (576), `md` (768), `lg` (992) and `xl` (1200) by default. The widths come from `theme.breakpoints`; wrap a subtree in `<BreakpointProvider breakpoints={{ md: 900 }}>` to override some of them there. `resolveResponsiveValue(value, breakpoint)` picks the entry of a `{ base, sm, … }` map defined at or nearest below the current breakpoint, and parses the result as a px number. Breakpoints follow the window, not the preview container, and static rendering assumes `xl` until hydration.
