---
title: FloatingWindow
description: Draggable, resizable viewport window for persistent tools.
source: "@plocks/ui"
status: "beta"
category: overlay
accessibility: "DragHandle is the move surface. ResizeHandle is a focusable separator with arrow and Home/End keyboard controls on web."
related:
  - "ActionBar"
props:
  - name: "initialPosition"
    type: "{ top?: number; left?: number; right?: number; bottom?: number }"
    description: "Initial viewport insets."
  - name: "constrainToViewport"
    type: boolean
    description: "Keeps the window inside the viewport."
    default: true
  - name: "dimensions"
    type: FloatingWindowDimensions
    description: "Initial size and resize limits."
examples:
  - basic
---

Use DragHandle when controls inside the window need their own pointer interactions. Without it, the whole surface can be dragged.
