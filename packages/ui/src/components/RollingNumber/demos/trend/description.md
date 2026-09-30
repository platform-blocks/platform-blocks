---
title: Trend
category: features
order: 35
tags: [direction, trend, odometer]
highlightLines: []
status: stable
hidden: false
---

By default the digits roll up when the number grows and down when it shrinks, so 19 → 20 carries the ones column forward like an odometer. `trend={1}` or `trend={-1}` fix the direction, `trend={0}` moves each digit straight to its new value, and a function `(previous, value) => number` decides per change.
