---
title: Hover state
category: basics
order: 10
tags: [hover, pressable, web]
status: stable
since: 1.0.0
hidden: false
---

`useHover` returns `[hovered, handlers]`. Handlers cover both RN's `onHoverIn` / `onHoverOut` and DOM's `onMouseEnter` / `onMouseLeave`, so they spread cleanly onto a `<Pressable>` or `<View>` regardless of platform. `<ListGroup.Item>` uses this hook for its hover background.
