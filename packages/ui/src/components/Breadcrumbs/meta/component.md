---
name: Breadcrumbs
title: Breadcrumbs
category: navigation
tags: [navigation, breadcrumb, path, hierarchy]
playground: true
props:
  items: Array of `{ label, href?, icon?, onPress?, disabled? }` objects
  separator: Custom separator (string or React node) — defaults to '/'
  maxItems: Collapse middle items when total exceeds this number
  size: Size token controlling fontSize + icon size + height
  showIcons: Render the per-item icon
  textStyle: Raw TextStyle escape hatch applied to each item label
  separatorStyle: Style applied to the separator wrapper
  labelProps: Override props applied to each item's label `<Text>` (style, fw, ff, size, c)
  separatorProps: Override props applied to string-separator `<Text>` elements
examples:
  - basic
  - separators
  - sizes
---

Breadcrumbs displays the path to the current page as navigation links.
