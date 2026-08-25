---
name: Indicator
title: Indicator
category: data
tags: [indicator, badge, status, count, dot]
playground: true
props:
  size: Size token (xs–3xl) or pixel number — controls dot diameter
  color: Background color of the dot (defaults to theme.colors.success[5])
  borderColor: Color of the border ring (defaults to theme.colors.surface[0])
  borderWidth: Border thickness (default 1)
  placement: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' (default 'bottom-right')
  offset: Pixel offset from the corner
  label: Text content (typically a count) — dot expands to a pill to fit
  labelProps: Override props applied to the label `<Text>`
  children: Free-form custom content (use `label` for plain text counts instead)
  invisible: Hide the indicator without unmounting parent
examples:
  - basic
  - placements
  - sizes
  - statuses
  - labels
---
The Indicator component renders a small dot or pill-shaped badge in the corner of a parent container — perfect for online status, unread counts, or "new" markers. Pass `label` for text content (the dot auto-expands to fit multi-digit counts); use `children` for arbitrary custom content like icons.