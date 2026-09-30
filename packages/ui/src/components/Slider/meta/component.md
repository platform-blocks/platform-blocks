---
title: Slider
category: input
tags: [slider, range, input, numeric, control]
playground: true
props:
  value: Current value (single Slider) or [min, max] tuple (RangeSlider)
  defaultValue: Initial value for uncontrolled usage (RangeSlider default [min, max])
  onChange: Callback fired with every change (each drag frame, each key press)
  onChangeEnd: Callback fired once an interaction settles — drag released, or after each key press
  min: Minimum value (default 0)
  max: Maximum value (default 100)
  step: Step increment (default 1)
  largeStep: PageUp / PageDown distance (default a tenth of the range)
  label: Field label (ReactNode); names the thumb (RangeSlider — the thumb group)
  description: Supporting text under the label
  error: Error message; marks the thumb(s) invalid and is announced
  helperText: Text under the slider while there is no error
  inverted: Reverse the direction (max at the start / bottom)
  tooltip: When the value bubble shows — 'hover' (default: hovered, dragged or focused) | 'always' | 'never'
  showMarks: Label the track ends with the min / max values
  minRange: (RangeSlider) minimum distance kept between the thumbs
  allowCross: (RangeSlider) let a dragged thumb pass the other one
  rangeLabels: (RangeSlider) accessible names of the two thumbs (default Minimum / Maximum)
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

Slider lets users select a value or range by moving handles along a track.
