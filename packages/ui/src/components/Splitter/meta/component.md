---
title: Splitter
description: Resizable layout with adjacent panes and keyboard handles.
source: "@plocks/ui"
status: "beta"
category: layout
accessibility: "Each handle is a focusable separator with orientation, value, and controls attributes. Arrow keys resize; Home/End move to limits; Enter toggles a collapsible pane."
related:
  - "Flex"
props:
  - name: "orientation"
    type: "'horizontal' | 'vertical'"
    description: "Direction in which panes are arranged."
    default: "horizontal"
  - name: "sizes"
    type: "SplitterPaneSize[]"
    description: "Controlled pane sizes."
  - name: "step"
    type: number
    description: "Keyboard arrow step, as a percentage."
    default: 1
examples:
  - basic
---

A number or percent size is flexible; a px or rem size stays fixed as the container changes.
