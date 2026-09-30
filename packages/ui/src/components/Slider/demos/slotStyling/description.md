---
title: Slot styling
order: 38
tags: [trackStyle, activeTrackStyle, thumbStyle, tickStyle, slot-props, customization]
highlightLines: []
status: stable
hidden: false
---

Each visual layer of the slider is independently customizable: `trackStyle` and `activeTrackStyle` for the track halves, `thumbStyle` for the handle, `tickStyle` / `activeTickStyle` for tick marks, and `tickLabelProps` for tick labels. Per-tick `style` overrides on individual `ticks[i].style` win over the global tick styles. Combined with the value-label slot props (`valueLabelStyle`, `valueLabelProps`) you can fully reskin the slider without forking it.
