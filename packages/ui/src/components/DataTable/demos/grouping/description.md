---
title: Grouping & Totals
category: behavior
order: 60
tags: [datatable, grouping, aggregation, totals, footer]
status: stable
hidden: false
---

Set `groupBy` to a column key to group rows under collapsible group-header rows. Add `aggregate` (`sum`, `avg`, `min`, `max`, `count`, or a function) to any column to show its per-group total in the group header, and set `showFooterTotals` for a grand-total footer row aligned to the same columns. Grouping spans all filtered rows, so client pagination is bypassed while it is active.
