---
title: ActionBar
description: Viewport-pinned actions for a current selection or task.
source: "@plocks/ui"
status: "beta"
category: overlay
accessibility: "The bar is a labelled group. Its divider is a separator and CloseButton is labelled. Escape can dismiss the topmost layer when enabled."
related:
  - "Button"
  - "IconButton"
props:
  - name: "opened"
    type: boolean
    description: "Controls visibility."
  - name: "position"
    type: "{ top?: number; bottom?: number; start?: number; end?: number }"
    description: "Logical viewport insets."
  - name: "transition"
    type: "'pop' | 'slide-up' | 'fade'"
    description: "Entrance and exit effect."
    default: "pop"
examples:
  - basic
  - placement
---

Use ActionBar for actions that apply to selected content. It stays pinned while the page scrolls.
