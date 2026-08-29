---
title: Slider
category: input
tags: [slider, range, input, numeric, control]
playground: true
props:
  value: Current value (single Slider) or [min, max] tuple (RangeSlider)
  onChange: Callback fired when the value changes
  min: Minimum value (default 0)
  max: Maximum value (default 100)
  step: Step increment (default 1)
  size: Size token (xs–3xl) controlling track and thumb scaling
  orientation: 'horizontal' | 'vertical'
  fullWidth: Stretch to fill the parent
  color: Palette token, 'primary.6' shade syntax, or any CSS color — drives active track + thumb
  trackColor: Inactive-track color override
  activeTrackColor: Active-track color override
  thumbColor: Thumb color override
  tickColor: Inactive tick mark color override
  activeTickColor: Active tick mark color override
  trackStyle: Style applied to the inactive track view
  activeTrackStyle: Style applied to the active track view
  thumbStyle: Style applied to the thumb view
  tickStyle: Style applied to inactive tick marks
  activeTickStyle: Style applied to active tick marks
  tickLabelProps: Text props applied to each tick label (style, ff, weight, size, color)
  valueLabel: Formatter for the thumb tooltip; pass `null` to disable
  valueLabelAlwaysOn: Keep the tooltip visible even when not interacting
  valueLabelPosition: Tooltip placement — 'top'/'bottom' for horizontal, 'left'/'right' for vertical
  valueLabelOffset: Pixel gap between the thumb and the tooltip
  valueLabelStyle: Style applied to the tooltip wrapper (Card or View)
  valueLabelProps: Text props for the tooltip text (ff, weight, size, color, style)
  valueLabelAsCard: Wrap the tooltip in a Card (default true) — set false for a flat tooltip
  showTicks: Render automatic tick marks based on step
  ticks: Custom tick definitions
  restrictToTicks: Snap value changes to tick positions
examples:
  - Basic horizontal slider
  - Range slider with two thumbs
  - Ticks and marks
  - Vertical orientation
  - Value label customization (position, ff, custom Card style)
  - Slot styling (track / thumb / tick / label overrides + per-tick `style`)
---

The Slider component allows users to select a value or range of values by moving a handle along a track. Supports single values, ranges, vertical layouts, and rich customization hooks for the value-label tooltip.
