---
title: Column Filters
category: behavior
order: 20
tags: [datatable, filters]
highlightLines: []
status: stable
since: 1.0.0
hidden: false
---

Mark columns `filterable` and set `filterType` to pick the control: an input for `text`/`number`/`date`, a dropdown for `select`/`boolean` (options auto-derived from the data when `filterOptions` is omitted). `showColumnFilters` renders those controls as a persistent row under the headers; omit it to keep them in each header's filter menu.