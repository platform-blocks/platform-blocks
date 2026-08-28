---
title: RollingNumber
category: display
tags: [number, counter, animation, odometer, metric]
playground: true
---

RollingNumber displays a number and animates every digit that changes, rolling it to its new position. Use it for counters, live totals, prices and metric readouts where the change itself is part of the information.

Each digit is its own column holding a `0`–`9` strip, so only the columns that actually changed move. Digits are keyed by place value rather than by string position, which means crossing a magnitude (`999` → `1,000`) rolls the ones column from `9` to `0` instead of restarting every column.

Formatting mirrors the usual number-input options — `prefix`, `suffix`, `thousandSeparator`, `decimalScale` and `fixedDecimalScale` — so a currency readout needs no external formatter.

The animated columns are hidden from assistive tech and, on web, from selection: each column contains all ten digits, so reading or copying them directly would produce `0123456789` per position. The component exposes the formatted value as its accessibility label and, on web, lays a transparent copy of that text over the row, so selecting and copying always yields what is on screen. `transitionDuration={0}` and an active reduced-motion preference both snap straight to the new value.
