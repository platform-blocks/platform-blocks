---
title: Drag a knob
category: basics
order: 10
tags: [gesture, drag, slider]
status: stable
hidden: false
---

`useDragGesture(options)` returns `{ ref, onLayout, surfaceStyle, panHandlers, isDragging, getSurfaceRect }`; put the first four on the same View (composing `onLayout` when you need your own) and give its children `pointerEvents: 'none'` so every press lands on the surface. `onStart`, `onMove` and `onEnd` each receive a `DragPoint` with `x` / `y` relative to the surface, its `width` / `height` (0 until the first layout) and `dx` / `dy` / `distance` travelled since the press, while `onCancel` fires instead of `onEnd` when the gesture is taken away. `axis` sets web `touch-action`: `'x'` here leaves vertical page scrolling alone, `'both'` (the default) claims every direction, and on web a drag also holds page-scroll and text-selection locks until release, cancel or unmount. `claimOnStart: false` with an `activationDistance` lets a tap fall through to something else, and `enabled: false` turns the surface back into ordinary content.
