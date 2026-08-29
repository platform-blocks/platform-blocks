---
displayName: Pagination
description: A navigation component for dividing content across multiple pages with customizable controls.
category: navigation
status: stable
since: 1.0.0
tags: [pagination, navigation, pages, data]
playground: true
props:
  currentPage: The currently active page number
  totalPages: Total number of pages available
  onPageChange: Callback fired when page changes
  showFirstLast: Whether to show first/last page buttons
  showPrevNext: Whether to show previous/next buttons
  size: Size variant of the pagination component
  variant: Visual style variant
  maxVisiblePages: Maximum number of page buttons to show
  showTotal: Render an "X-Y of N" summary (boolean or custom render function); requires totalItems
  totalItems: Total number of items across all pages (used by showTotal and the size changer)
  showSizeChanger: Show a rows-per-page selector; requires onPageSizeChange
  pageSizeOptions: Available page sizes for the size changer
  pageSize: Current page size (used by showTotal ranges and the size-changer label)
  onPageSizeChange: Callback fired when the page size changes
  disabled: Whether pagination is disabled
  loading: Whether pagination is in loading state
  textStyle: Raw TextStyle escape hatch applied to every page label
  activeTextStyle: Raw TextStyle for the active page label
  labelProps: Override props applied to every page-button label `<Text>` (style, weight, ff, size, color)
  activeLabelProps: Extra props merged on top of `labelProps` for the active page only
related:
  - Table
  - List
  - DataTable
examples:
  - Basic pagination with page numbers
  - Pagination with first/last buttons
  - Different size variants
  - Advanced pagination with custom controls
  - Total & size changer (showTotal / showSizeChanger)
  - Label customization (labelProps / activeLabelProps)
---

A comprehensive pagination component that provides intuitive navigation through large datasets. The component offers flexible configuration options and consistent styling across different use cases.
