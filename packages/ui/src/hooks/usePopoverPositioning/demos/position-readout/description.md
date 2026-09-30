---
title: Position readout
category: basics
order: 10
tags: [positioning, popover, viewport]
status: stable
hidden: false
---

`usePopoverPositioning(isOpen, options)` returns `{ position, anchorRef, popoverRef, updatePosition, isPositioning }`; while `isOpen` is true, `position` holds the popover's `x` / `y` in viewport coordinates, the physical `placement` (after RTL mirroring and flipping), `flipped` / `shifted` and `maxWidth` / `maxHeight`, and it is `null` while closed. Until `popoverRef` is on a rendered element the popover is assumed to be 200px wide with no height, and drawing it at those coordinates (`position: fixed` on web, a portal on native) is up to you, which is exactly what `useFloating` handles. It re-computes every frame while the page scrolls or resizes on web and after rotation on native, and with `keyboardAvoidance` (on by default) it keeps clear of the keyboard `KeyboardManagerProvider` reports. `useTooltipPositioning(isOpen, placement)` presets `flip`, `shift`, an 8px `offset` and `boundary`, while `useDropdownPositioning({ isOpen, onClose, …options })` also returns `showOverlay(content)` / `hideOverlay()` and closes the overlay when `isOpen` turns false.
