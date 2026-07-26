---
title: Fixed height & sticky columns
category: layout
order: 70
tags: [datatable, height, scroll, sticky-header, sticky, pinned, columns]
highlightLines: []
status: stable
since: 1.0.0
hidden: false
---

Pass a fixed `height` to cap the table's size — the header row stays pinned while the body scrolls, so a long list fits a constrained panel without paginating. Pin columns to the edges with `sticky: 'left'` or `sticky: 'right'` so they stay put while the rest scroll horizontally; give each pinned column an explicit numeric `width` so its frozen offset lines up. Sticky positioning is web-only (a no-op on native).
