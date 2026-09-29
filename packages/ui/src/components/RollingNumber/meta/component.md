---
title: RollingNumber
category: display
tags: [number, counter, animation, odometer, metric]
playground: true
---

RollingNumber displays a number and animates every digit that changes, rolling it to its new position. Use it for counters, live totals, prices and metric readouts where the change itself is part of the information.

## Accessibility

Assistive technology only gets the final formatted value (or `accessibilityLabel`): the rolling digit strips are hidden, and the readable text changes once per value change — never per animation frame — so a surrounding live region announces the new value once. Reduced motion (or `transitionDuration={0}`) snaps straight to the new digits.
