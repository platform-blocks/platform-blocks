---
title: Build a custom pager
category: basics
order: 10
tags: [pagination, headless]
status: stable
hidden: false
---

`usePagination({ total, value?, defaultValue?, onChange?, siblings?, boundaries? })` returns `{ page, range, setPage, next, previous, first, last }`. `range` lists the page numbers to render, with `'ellipsis'` for each gap. It is always the same length for a given `total`, so the pager keeps its width as you page through.

`siblings` (default 1) sets how many pages show on each side of the current one, and `boundaries` (default 1) how many at each end. An ellipsis never stands in for a single page: that page is shown instead. Pass `value` + `onChange` to control the page. Out-of-range pages are clamped, and moves to the current page are ignored. The plain `getPaginationRange(page, total, siblings, boundaries)` function is exported too.
