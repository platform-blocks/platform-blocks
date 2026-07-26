---
title: Server-side pagination
category: usage
order: 80
tags: [datatable, pagination, server, api, manual]
highlightLines: []
status: stable
since: 1.0.0
hidden: false
---

Set `manualPagination` when the data comes from a paginated API. The `data` prop is treated as the already-fetched current page — the table does no client-side slicing, filtering, or sorting — and `pagination.total` drives the page count and "X-Y of N" summary. The sort, filter, search, and page controls still fire their callbacks (`onSortChange`, `onFilterChange`, `onSearchChange`, `onPaginationChange`) so you can refetch. Pair it with `loading` to show the skeleton during each fetch.
