---
title: FloatingIndicator
description: Animated highlight that follows a target inside a positioned parent.
source: "@plocks/ui"
status: "beta"
category: display
accessibility: "The indicator is decorative and does not intercept pointer events. Targets must carry their own accessible states."
related:
  - "SegmentedControl"
  - "Tabs"
props:
  - name: "target"
    type: "View | HTMLElement | null"
    description: "Element to highlight."
  - name: "parent"
    type: "View | HTMLElement | null"
    description: "Positioned ancestor used for coordinates."
  - name: "transitionDuration"
    type: number
    description: "Movement duration in milliseconds."
    default: 150
examples:
  - basic
---

Give the parent `position: 'relative'`. On native, placement updates when the target or parent changes or the screen dimensions change.
