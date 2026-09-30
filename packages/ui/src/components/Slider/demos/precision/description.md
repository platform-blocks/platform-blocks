---
title: Decimal steps & precision
order: 36
tags: [precision, step, decimal, valueLabel, tooltip]
highlightLines: []
status: stable
hidden: false
---

The thumb tooltip formats its value from the `step`: a fractional step like `0.01` shows two decimals, while an integer step rounds to a whole number (trailing zeros are trimmed, so `0.10` reads as `0.1`). Pass `precision` to force a fixed number of decimals regardless of the step.
