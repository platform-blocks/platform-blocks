---
title: Gauge
description: Radial measurement with ranges, ticks, labels, and an animated needle.
source: "@plocks/ui"
status: "beta"
category: data
accessibility: "The gauge exposes its name, minimum, maximum, current value, and active range to assistive technology."
related:
  - "Progress"
  - "Ring"
props:
  - name: "value"
    type: number
    description: "Current value, clamped between min and max."
  - name: "min"
    type: number
    description: "Minimum value."
    default: 0
  - name: "max"
    type: number
    description: "Maximum value."
    default: 100
  - name: "ranges"
    type: "GaugeRange[]"
    description: "Colored value bands."
examples:
  - basic
  - ranges
---

Use Gauge for a value within a known range. Configure ranges, ticks, and labels or compose its parts directly.
