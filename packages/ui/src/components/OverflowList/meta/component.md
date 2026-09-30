---
title: OverflowList
description: Collapses entries that do not fit into a compact overflow item.
source: "@plocks/ui"
status: "beta"
category: layout
accessibility: "Visible items keep their own semantics; the hidden measuring copy is removed from the accessibility tree. Give the overflow control an accessible name."
related:
  - "Badge"
  - "HoverCard"
props:
  - name: "data"
    type: "readonly T[]"
    description: "Items to fit."
  - name: "maxRows"
    type: number
    description: "Maximum number of visible rows."
    default: 1
  - name: "collapseFrom"
    type: "'start' | 'end'"
    description: "Which side collapses first."
    default: "end"
examples:
  - basic
  - maxRows
  - collapseStart
---

Items are measured offscreen before the list is shown. The overflow item receives the hidden entries.
