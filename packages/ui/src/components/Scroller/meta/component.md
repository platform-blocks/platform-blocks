---
title: Scroller
description: Horizontal scrolling with controls shown at overflowing edges.
source: "@plocks/ui"
status: "beta"
category: layout
accessibility: "The edge buttons have Scroll start and Scroll end labels; native touch scrolling remains available."
related:
  - "Tabs"
  - "ScrollView"
props:
  - name: "scrollAmount"
    type: number
    description: "Pixels moved per control press."
    default: 200
  - name: "draggable"
    type: boolean
    description: "Enables mouse drag scrolling on web."
    default: true
  - name: "controlSize"
    type: SizeValue
    description: "Size of the edge controls."
examples:
  - basic
  - custom
---

Use Scroller for horizontal content that should preserve native scrolling and expose visible navigation controls.
