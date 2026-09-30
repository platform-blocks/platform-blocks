---
title: Row Selection
category: behavior
order: 30
tags: [datatable, selection]
highlightLines: []
status: stable
hidden: false
---

Set `selectable` and wire `selectedRows` / `onSelectionChange` to track checked rows. Pass a stable `getRowId` so selection survives sorting and paging; the table requires it for selection.
