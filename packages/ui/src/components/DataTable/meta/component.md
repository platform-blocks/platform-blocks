---
playground: true
title: DataTable
description: A powerful data table component with sorting, pagination, and selection
source: ui/src/components/DataTable
status: stable
category: data
props:
  - name: data
    type: any[]
    description: Array of data objects to display
  - name: columns
    type: DataTableColumn[]
    description: Column configuration array
  - name: sortBy
    type: DataTableSort[]
    description: Current sort configuration
  - name: onSortChange
    type: function
    description: Callback when sort changes
  - name: pagination
    type: DataTablePagination
    description: Pagination configuration
  - name: onPaginationChange
    type: function
    description: Callback when pagination changes
  - name: manualPagination
    type: boolean
    description: Server-side pagination — render `data` as the current page verbatim and use `pagination.total` as the authoritative count (no client slicing/filtering/sorting)
    default: false
  - name: paginationProps
    type: "Omit<PaginationProps, 'current' | 'total' | 'onChange'>"
    description: Props forwarded to the footer Pagination component (siblings, boundaries, variant, size, showFirst, labels, etc.)
  - name: selectedRows
    type: (string|number)[]
    description: Array of selected row IDs
  - name: onRowSelectionChange
    type: function
    description: Callback when row selection changes
  - name: loading
    type: boolean
    description: Whether table is in loading state
    default: false
  - name: striped
    type: boolean
    description: Whether to show striped rows
    default: false
  - name: highlightOnHover
    type: boolean
    description: Whether to highlight rows on hover
    default: true
  - name: verticalSpacing
    type: string
    description: Vertical spacing between rows
    default: md
  - name: headerTextProps
    type: "Omit<TextProps, 'children'>"
    description: Override props applied to every column header `<Text>` (style, weight, ff, size, colorVariant)
  - name: cellTextProps
    type: "Omit<TextProps, 'children'>"
    description: Override props applied to default-rendered cell text (cells without a custom `cell` renderer)
examples:
  - basic
  - advanced-filtering
  - row-selection
  - enhanced-styling
  - expandable-rows
  - grouping
  - fixed-height
  - server-side
---

The DataTable component provides a feature-rich interface for displaying tabular data with sorting, pagination, row selection, and customizable columns.
