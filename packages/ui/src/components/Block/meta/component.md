---
name: Block
title: Block
description: Polymorphic layout primitive for spacing, layout, and styling with universal props, theming, and accessibility; a foundational replacement for View.
tags: [layout, building-block, polymorphic, foundational]
category: layout
order: 1
status: stable
since: 1.0.0
props:
  bg: Background color — accepts palette names ('primary' → palette[1]), 'palette.shade' syntax ('primary.6'), theme.backgrounds keys ('surface' / 'subtle' / 'elevated' / 'base' / 'border'), or any CSS color
  radius: Border radius (size token or px)
  borderWidth / borderColor: Custom border
  shadow: Shadow depth
  opacity: 0–1
  w / h / minW / maxW / minH / maxH: Dimension props
  fullWidth: Stretch to 100% width
  fluid: flex 1 (full available height)
  direction / align / justify / wrap / gap / grow / shrink / basis: Flexbox layout
  position / top / right / bottom / left / start / end / zIndex: Positioning
  component: Polymorphic — render as any element (default View)
examples:
  - basic
  - bg-shorthand
---

A polymorphic building block component that serves as a foundational element to replace View components throughout the application. Similar to a `<div>` in web development. The `bg` prop resolves through the theme — same lookup rules as `<Card bg=...>`.
