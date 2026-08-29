---
title: Value label customization
order: 35
tags: [tooltip, valueLabel, valueLabelProps, valueLabelPosition, customization]
highlightLines: []
status: stable
since: 1.0.0
hidden: false
---

`valueLabelPosition` chooses where the thumb tooltip sits (`top` / `bottom` for horizontal, `left` / `right` for vertical). `valueLabelOffset` tunes the gap from the thumb. `valueLabelProps` accepts any `<Text>` props — `ff`, `weight`, `size`, `color`, `style` — and `valueLabelStyle` overrides the wrapper Card's style. Set `valueLabelAsCard={false}` for a flat tooltip with no Card chrome. Both `<Slider>` and `<RangeSlider>` accept the same set of props.
