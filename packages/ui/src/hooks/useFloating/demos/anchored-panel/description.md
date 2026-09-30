---
title: Anchored panel
category: basics
order: 10
tags: [overlay, popover, positioning]
status: stable
hidden: false
---

Spread `getReferenceProps()` on the trigger and `getFloatingProps()` on the panel, then pass the panel to `renderFloating()`, which opens it in the nearest overlay host and renders nothing in place. `placement` (default `'bottom'`, written for LTR and mirrored in RTL) flips when the panel doesn't fit, and the returned `placement` is the side it actually landed on; `offset`, `matchWidth`, `modal`, `role` and `trigger` cover the rest, with `'hover'` / `'focus'` triggers neither taking focus nor closing on outside press. `onDismiss(reason)` fires for Escape, Android back, an outside press, or `'closed-externally'` when something else closed the overlay. Without an `OverlayProvider` (PlocksProvider mounts one) the panel renders inline next to the trigger, without flipping.
