---
displayName: Pagination
description: A navigation component for dividing content across multiple pages with customizable controls.
category: navigation
status: stable
since: 1.0.0
tags: [pagination, navigation, pages, data]
playground: true
props:
  value: The current page number, 1-indexed (controlled; replaces the deprecated `current`)
  defaultValue: Initial page when uncontrolled
  total: Total number of pages available
  onChange: Callback fired with the new page number
  showFirst: Whether to show first/last page buttons
  showPrevNext: Whether to show previous/next buttons
  size: Size of the pagination controls (page items render one step smaller, as compact controls)
  variant: Visual style variant
  color: Accent color of the current page (palette name, shade or CSS color)
  siblings: Number of pages shown on each side of the current page
  boundaries: Number of pages always shown at each end
  accessibilityLabels: Accessible names for the navigation landmark and the controls (for translation)
  showTotal: Render an "X-Y of N" summary (boolean or custom render function); requires totalItems
  totalItems: Total number of items across all pages (used by showTotal and the size changer)
  showSizeChanger: Show a rows-per-page selector; requires onPageSizeChange
  pageSizeOptions: Available page sizes for the size changer
  pageSize: Current page size (used by showTotal ranges and the size-changer label)
  onPageSizeChange: Callback fired when the page size changes
  disabled: Whether pagination is disabled
  textStyle: Raw TextStyle escape hatch applied to every page label
  activeTextStyle: Raw TextStyle for the active page label
  labelProps: Override props applied to every page-button label `<Text>` (style, fw, ff, size, c)
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

Renders a labelled `navigation` landmark: the current page is marked `aria-current="page"`, every control has an accessible name ("Page 3", "Next page"), and the controls share a single tab stop (Arrow keys, Home, End).

A comprehensive pagination component that provides intuitive navigation through large datasets. The component offers flexible configuration options and consistent styling across different use cases.
