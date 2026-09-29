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
    type: "Omit<PaginationProps, 'value' | 'defaultValue' | 'current' | 'total' | 'onChange'>"
    description: Props forwarded to the footer Pagination component (siblings, boundaries, variant, size, showFirst, labels, etc.)
  - name: selectedRows
    type: (string|number)[]
    description: Selected row IDs (controlled). Omit it to let the table manage selection
  - name: onSelectionChange
    type: (selected) => void
    description: Called with the selected row IDs when the selection changes
  - name: onRowClick
    type: (row, index) => void
    description: Fires when a body cell is pressed, or activated with Enter / Space. Makes the table an ARIA grid with arrow-key cell navigation (web)
  - name: loading
    type: boolean
    description: Whether table is in loading state
    default: false
  - name: striped
    type: boolean
    description: Whether to show striped rows
    default: false
  - name: hoverHighlight
    type: boolean
    description: Whether to highlight rows on hover
    default: true
  - name: hoverColor
    type: string
    description: Row hover fill (defaults to the theme's hover background)
  - name: headerBackgroundColor
    type: string
    description: Header row background (defaults to the theme's subtle background)
  - name: borderColor
    type: string
    description: Default color for the outer border, row dividers and column dividers
  - name: density
    type: "'compact' | 'normal' | 'comfortable'"
    description: Row density
    default: normal
  - name: enhancedLoading
    type: boolean
    description: Skeleton rows while loading; `false` shows a plain "Loading…" row
    default: true
  - name: enhancedEmptyState
    type: boolean
    description: Illustrated empty state; `false` shows `emptyMessage` as a plain row
    default: true
  - name: enhancedSelection
    type: boolean
    description: Accent bar on the leading edge of selected rows
    default: true
  - name: virtual
    type: boolean
    description: Virtualize rows with @shopify/flash-list inside a bounded viewport (`h`, 420 by default)
    default: false
  - name: headerTextProps
    type: "Omit<TextProps, 'children'>"
    description: Override props applied to every column header `<Text>` (style, fw, ff, size, c)
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

## Accessibility

- Read-only tables render with `table` / `row` / `columnheader` / `cell` roles; with `onRowClick` or edit mode the table becomes an ARIA `grid` (`treegrid` with expandable rows) whose cells share one tab stop — arrow keys move between cells, Home / End jump to the row ends, PageUp / PageDown move ten rows, and Enter / Space activate the cell.
- Sortable headers are buttons, and their column header reports the current order through `aria-sort`.
- Selection checkboxes are labelled "Select all rows" / "Select row n"; the header checkbox reports the mixed state when some rows are selected.
- Pass `ariaLabel` to name the table.
