---
title: Live viewport size
category: basics
order: 10
tags: [responsive, viewport, dimensions]
status: stable
hidden: false
---

`useViewport()` takes no arguments and returns `{ width, height, breakpoint }`: the window size in px (dp on native) and the breakpoint that width falls in, from `theme.breakpoints` or the nearest `BreakpointProvider` override. Every consumer shares one listener (a `resize` handler coalesced to one update per animation frame on web, `Dimensions` `change` on native) that attaches with the first subscriber and detaches with the last. Static rendering and the hydration pass see a desktop default (1200 × 800, `xl`), then the real size, so markup never mismatches. It re-renders on every size change; `useBreakpoint()` re-renders only when the breakpoint changes.
