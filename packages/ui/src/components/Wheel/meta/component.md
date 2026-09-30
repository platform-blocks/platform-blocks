---
title: Wheel
description: Spinning picker column for choosing one value.
source: "@plocks/ui"
status: "beta"
category: input
accessibility: "A Wheel is one adjustable control. Arrow keys and assistive actions move between items; its label and selected value are announced."
related:
  - "TimePicker"
props:
  - name: "items"
    type: "WheelItem[]"
    description: "Values and labels shown in the column."
  - name: "value"
    type: "string | number"
    description: "Controlled selected value."
  - name: "label"
    type: string
    description: "Accessible name for the column."
  - name: "h"
    type: number
    description: "Height of the column in pixels."
    default: 200
examples:
  - basic
  - time
---

Use one Wheel for a single choice or place columns together for related values.
