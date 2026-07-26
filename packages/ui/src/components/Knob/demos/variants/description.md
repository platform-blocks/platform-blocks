---
title: Visual Variants
category: variants
order: 15
tags: [variant, style, preset]
highlightLines: []
status: experimental
since: 1.0.0
hidden: false
---

`variant` picks the dial's look, independent of `behavior`. Each preset sets stroke weights, caps, body fill, and which indicator carries the value, taking its colors from the theme so the same knob reads correctly in light and dark. Presets are merged *under* `appearance`, so any single property stays overridable.
