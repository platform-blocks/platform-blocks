---
title: usePopoverPositioning
category: overlay
order: 30
tags: [overlay, positioning, popover, tooltip, dropdown]
status: stable
hidden: false
---

The measure-and-place engine under `useFloating`: attach `anchorRef` (and `popoverRef`) and it returns where the popover fits in the viewport — coordinates, the side it landed on after flipping, and the space available. `useTooltipPositioning` is a preset with tooltip defaults, and `useDropdownPositioning` adds `showOverlay` / `hideOverlay` to render the result through the overlay host; for most uses, reach for `useFloating` instead.
