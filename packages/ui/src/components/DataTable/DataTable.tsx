import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, ScrollView, Pressable, TextInput as RNTextInput, Platform } from 'react-native';
import { resolveOptionalModule } from '../../utils/optionalModule';

/**
 * Resolved lazily so apps that never render a virtual DataTable neither bundle
 * @shopify/flash-list nor need it installed. Without it, `virtual` quietly
 * downgrades to the plain (non-virtualized) table rendering below.
 */
const resolveFlashList = () =>
  resolveOptionalModule<any>('@shopify/flash-list', {
    accessor: (mod) => mod?.FlashList,
    devWarning:
      '@shopify/flash-list is not installed; <DataTable virtual> renders every row without virtualization instead.',
  });

import { useTheme } from '../../core';
import { useDirection } from '../../core/providers/DirectionProvider';
import { SpacingProps, getSpacingStyles, extractSpacingProps, mergeSlotProps } from '../../core/utils';
import { DESIGN_TOKENS } from '../../core/design-tokens';
import { Text } from '../Text';
import { Input } from '../Input';
import { Select } from '../Select';
import { Button } from '../Button';
import { Flex } from '../Flex';
import { Menu, MenuItem, MenuLabel, MenuDivider, MenuDropdown } from '../Menu';
import { Popover } from '../Popover';
import { Checkbox } from '../Checkbox';
import { ToggleButton, ToggleGroup } from '../Toggle';
import { Pagination } from '../Pagination';
import { Table, TableTh, TableTd, TableTr } from '../Table';
import { Icon } from '../Icon';
import { Tooltip, resolveTooltipProps, getTooltipText } from '../Tooltip';
import { Collapse } from '../Collapse';
import { useRowSelection } from './hooks/useRowSelection';
import { useDataTableState } from './hooks/useDataTableState';
import { AdvancedFilterControl } from './AdvancedFilterControl';
import { ColumnFilterInput } from './ColumnFilterInput';
import {
  computeAggregate,
  DEFAULT_COLUMN_WIDTH,
  EXPAND_COL_WIDTH,
  filterData,
  formatValue,
  getColumnAlign,
  getColumnFilterType,
  getValue,
  isNumericType,
  SELECT_COL_WIDTH,
  sortData,
} from './utils';
import type {
  DataTableProps,
  DataTableColumn,
  DataTableFilter,
  DataTableSort,
  DataTablePagination,
  SortDirection,
  FilterType,
  ColumnDataType
} from './types';
import { ComponentWithDisclaimer } from '../_internal/Disclaimer';
import { Row } from '../Layout';
export type { DataTableProps, DataTableColumn, DataTableFilter, DataTableSort, DataTablePagination, SortDirection, FilterType, ColumnDataType } from './types';

// Types moved to separate file (types.ts)

// DataTable component
export const DataTable = <T,>({
  id,
  data,
  columns,
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  searchable = true,
  searchPlaceholder = 'Search...',
  searchValue: controlledSearchValue,
  onSearchChange,
  sortBy = [],
  onSortChange,
  filters = [],
  onFilterChange,
  showColumnFilters = false,
  pagination,
  onPaginationChange,
  paginationProps,
  manualPagination = false,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (_, index) => index,
  onRowClick,
  editMode = false,
  onEditModeChange,
  onCellEdit,
  bulkActions = [],
  variant = 'default',
  striped: stripedProp,
  density = 'normal',
  height,
  virtual = false,
  style,
  hoverHighlight = true,
  enableColumnResizing = false,
  rowFeatureToggle,
  initialHiddenColumns = [],
  onColumnVisibilityChange,
  showColumnVisibilityManager = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  showRowsPerPageControl = true,
  rowActions,
  actionsColumnWidth = 100,
  fullWidth = true,
  // Border styling props
  showRowDividers,
  rowBorderWidth,
  rowBorderColor,
  rowBorderStyle = 'solid',
  columnBorderWidth,
  columnBorderColor,
  columnBorderStyle = 'solid',
  showOuterBorder = true,
  outerBorderWidth = 1,
  outerBorderColor,
  // Expandable rows props
  expandableRowRender,
  initialExpandedRows = [],
  expandedRows: controlledExpandedRows,
  onExpandedRowsChange,
  allowMultipleExpanded = true,
  expandIcon,
  collapseIcon,
  headerTextProps,
  cellTextProps,
  ariaLabel,
  exportable = false,
  exportFileName = 'data.csv',
  onExport,
  enableColumnReordering = false,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
  groupBy,
  groupsDefaultExpanded = true,
  renderGroupHeader,
  showFooterTotals = false,
  footerLabel = 'Total',
  ...props
}: DataTableProps<T>) => {
  const { spacingProps, otherProps } = extractSpacingProps(props);
  const theme = useTheme();
  const { isRTL } = useDirection();
  const isStriped = stripedProp ?? variant === 'striped';
  
  // Local state
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [editingCell, setEditingCell] = useState<{ row: number; column: string } | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  // Uncontrolled column filters state (used when onFilterChange not provided)
  const [internalFilters, setInternalFilters] = useState<DataTableFilter[]>([]);

  const [hoveredHeader, setHoveredHeader] = useState<string | null>(null);
  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);

  // Read a persisted view preference (keyed by the `id` prop). Returns
  // `fallback` when there is no `id`, no stored value, or storage is unavailable.
  const readPref = useCallback(<V,>(suffix: string, fallback: V): V => {
    if (typeof window !== 'undefined' && id) {
      try {
        const raw = window.localStorage.getItem(`datatable:${id}:${suffix}`);
        if (raw) return JSON.parse(raw) as V;
      } catch { /* storage unavailable */ }
    }
    return fallback;
  }, [id]);

  const [columnWidths, setColumnWidths] = useState<Record<string, number | string>>(() => {
    const initial: Record<string, number | string> = {};
    columns.forEach(c => { if (c.width) initial[c.key] = c.width; });
    return { ...initial, ...readPref<Record<string, number | string>>('columnWidths', {}) };
  });
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(() =>
    readPref<string[]>('hiddenColumns', initialHiddenColumns)
  );
  // Runtime column pinning overrides the static `column.sticky` (menu-driven).
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, 'left' | 'right'>>(() => {
    const fromColumns: Record<string, 'left' | 'right'> = {};
    columns.forEach(c => { if (c.sticky) fromColumns[c.key] = c.sticky; });
    return readPref<Record<string, 'left' | 'right'>>('pinnedColumns', fromColumns);
  });
  const [internalExpandedRows, setInternalExpandedRows] = useState<(string | number)[]>(initialExpandedRows);
  const resizingColRef = useRef<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef<number>(0);

  const searchValue = controlledSearchValue !== undefined ? controlledSearchValue : internalSearchValue;
  const expandedRows = controlledExpandedRows !== undefined ? controlledExpandedRows : internalExpandedRows;

  // Process data
  // Determine active filters (controlled vs uncontrolled)
  const activeFilters = onFilterChange ? filters : internalFilters;

  // Full filtered + sorted row set (before pagination). Grouping and grand-total
  // aggregation operate on this so groups/totals span all matching rows, not
  // just the current page. Empty in manual mode (the server owns filter/sort).
  const fullRows = useMemo(() => {
    if (manualPagination) return data;

    // 1. Filter & search (row-level overrides considered)
    const filtered = filterData(data, activeFilters, columns, searchValue, rowFeatureToggle);

    // 2. Apply sorting only to rows permitting it; preserve original order for non-sortable rows
    let sortableRows: { row: T; originalIndex: number }[] = [];
    let fixedRows: { row: T; originalIndex: number }[] = [];
    filtered.forEach((r, i) => {
      const features = rowFeatureToggle?.(r, i) || {} as any;
      if (features.sortable === false) fixedRows.push({ row: r, originalIndex: i });
      else sortableRows.push({ row: r, originalIndex: i });
    });

    let sortedPortion = sortableRows.map(s => s.row);
    if (sortBy.length) {
      sortedPortion = sortData(sortedPortion, sortBy, columns);
    }
    // Reattach fixed rows after sorted portion, preserving relative order
    return [...sortedPortion, ...fixedRows.map(f => f.row)];
  }, [data, activeFilters, sortBy, searchValue, columns, rowFeatureToggle, manualPagination]);

  const processedData = useMemo(() => {
    if (manualPagination) return data;
    // Grouping renders every group (pagination is bypassed), so show all rows.
    if (groupBy) return fullRows;
    if (pagination) {
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      return fullRows.slice(startIndex, startIndex + pagination.pageSize);
    }
    return fullRows;
  }, [fullRows, data, pagination, manualPagination, groupBy]);

  const totalFiltered = useMemo(() => {
    // In manual mode the server owns the count; trust `pagination.total`.
    if (manualPagination) return pagination?.total ?? data.length;
    return filterData(data, activeFilters, columns, searchValue, rowFeatureToggle).length;
  }, [manualPagination, pagination?.total, data, activeFilters, columns, searchValue, rowFeatureToggle]);

  // Client-side page clamp: when filtering/search shrinks the result set below
  // the current page, snap back to the last valid page so the table never shows
  // an empty page the user has to manually click away from. Skipped in manual
  // mode, where the server decides which page exists.
  useEffect(() => {
    if (manualPagination || !pagination || !onPaginationChange) return;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pagination.pageSize));
    if (pagination.page > totalPages) {
      onPaginationChange({ ...pagination, page: totalPages });
    }
  }, [manualPagination, pagination, onPaginationChange, totalFiltered]);

  // Persist a view preference under `datatable:${id}:${suffix}` (no-op without `id`).
  const writePref = useCallback((suffix: string, value: any) => {
    if (typeof window !== 'undefined' && id) {
      try { window.localStorage.setItem(`datatable:${id}:${suffix}`, JSON.stringify(value)); }
      catch { /* storage unavailable */ }
    }
  }, [id]);

  // Persist hidden columns (+ notify).
  useEffect(() => {
    writePref('hiddenColumns', hiddenColumns);
    onColumnVisibilityChange?.(hiddenColumns);
  }, [hiddenColumns, writePref, onColumnVisibilityChange]);

  // Persist column widths and pin state so they survive reloads.
  useEffect(() => { writePref('columnWidths', columnWidths); }, [columnWidths, writePref]);
  useEffect(() => { writePref('pinnedColumns', pinnedColumns); }, [pinnedColumns, writePref]);

  // Column ordering (drag-reorder). Uncontrolled unless `columnOrder` is passed.
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[] | null>(() =>
    readPref<string[] | null>('columnOrder', null)
  );
  const columnOrder = controlledColumnOrder ?? internalColumnOrder;
  const dragColKeyRef = useRef<string | null>(null);
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);

  // Persist the uncontrolled column order.
  useEffect(() => {
    if (internalColumnOrder) writePref('columnOrder', internalColumnOrder);
  }, [internalColumnOrder, writePref]);

  // Apply the active order (if any), then append any columns not listed in it
  // (e.g. newly added ones) so nothing silently disappears.
  const orderedColumns = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) return columns;
    const byKey = new Map(columns.map(c => [c.key, c]));
    const ordered = columnOrder.map(k => byKey.get(k)).filter(Boolean) as DataTableColumn<T>[];
    const missing = columns.filter(c => !columnOrder.includes(c.key));
    return [...ordered, ...missing];
  }, [columns, columnOrder]);

  const visibleColumns = useMemo(
    () => orderedColumns.filter(c => !hiddenColumns.includes(c.key)),
    [orderedColumns, hiddenColumns]
  );

  /**
   * Width of the hairline between rows. `showRowDividers` decides when it is
   * set; otherwise the `bordered` variant implies dividers. `rowBorderWidth`
   * is the explicit override and is honored even at 0 (to switch them off).
   */
  const rowDividerWidth = rowBorderWidth ?? ((showRowDividers ?? variant === 'bordered') ? 1 : 0);

  /**
   * Vertical rule for a cell, opt-in via `columnBorderWidth`. Drawn on every
   * section (header, filter row, body, group/footer) so the rule runs the full
   * height of the table. Skipped on the trailing column, where it would double
   * up with the outer border — unless an actions column follows it.
   *
   * `colIdx` is the index within `visibleColumns`; pass -1 for the leading
   * helper cells (select / expand), which are never last.
   */
  const columnDividerStyle = useCallback((colIdx: number) => {
    if (!columnBorderWidth) return null;
    const isTrailing = colIdx === visibleColumns.length - 1 && !rowActions;
    if (isTrailing) return null;
    return {
      borderRightWidth: columnBorderWidth,
      borderRightColor: columnBorderColor || theme.colors.gray[2],
      borderRightStyle: columnBorderStyle,
    };
  }, [columnBorderWidth, columnBorderColor, columnBorderStyle, rowActions, theme, visibleColumns.length]);

  // Move column `fromKey` to `toKey`'s position within the full order.
  const reorderColumn = useCallback((fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    const base = (columnOrder && columnOrder.length ? columnOrder : columns.map(c => c.key)).slice();
    const from = base.indexOf(fromKey);
    const to = base.indexOf(toKey);
    if (from === -1 || to === -1) return;
    base.splice(from, 1);
    base.splice(to, 0, fromKey);
    if (!controlledColumnOrder) setInternalColumnOrder(base);
    onColumnOrderChange?.(base);
  }, [columnOrder, columns, controlledColumnOrder, onColumnOrderChange]);

  // Column reordering uses native HTML5 drag-and-drop, but RN Web's View strips
  // `draggable` / drag-event props — so we attach them imperatively to each
  // header cell's DOM node (obtained via ref). `dragStateRef` keeps the latest
  // reorder/setDrop callbacks so the listeners stay stable.
  const headerNodeRefs = useRef<Record<string, any>>({});
  const dragStateRef = useRef<{ from: string | null; reorder: (f: string, t: string) => void; setDrop: (k: string | null) => void }>({
    from: null,
    reorder: () => {},
    setDrop: () => {},
  });
  dragStateRef.current.reorder = reorderColumn;
  dragStateRef.current.setDrop = setDropTargetKey;

  useEffect(() => {
    if (Platform.OS !== 'web' || !enableColumnReordering) return;
    const cleanups: Array<() => void> = [];
    visibleColumns.forEach(col => {
      const node = headerNodeRefs.current[col.key];
      if (!node?.setAttribute) return;
      node.setAttribute('draggable', 'true');
      const onDragStart = (e: any) => {
        dragStateRef.current.from = col.key;
        if (e?.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          try { e.dataTransfer.setData('text/plain', col.key); } catch { /* ignore */ }
        }
      };
      const onDragOver = (e: any) => { e?.preventDefault?.(); if (e?.dataTransfer) e.dataTransfer.dropEffect = 'move'; dragStateRef.current.setDrop(col.key); };
      const onDragLeave = () => dragStateRef.current.setDrop(null);
      const onDrop = (e: any) => {
        e?.preventDefault?.();
        const from = dragStateRef.current.from;
        if (from) dragStateRef.current.reorder(from, col.key);
        dragStateRef.current.from = null;
        dragStateRef.current.setDrop(null);
      };
      const onDragEnd = () => { dragStateRef.current.from = null; dragStateRef.current.setDrop(null); };
      node.addEventListener('dragstart', onDragStart);
      node.addEventListener('dragover', onDragOver);
      node.addEventListener('dragleave', onDragLeave);
      node.addEventListener('drop', onDrop);
      node.addEventListener('dragend', onDragEnd);
      cleanups.push(() => {
        node.removeAttribute?.('draggable');
        node.removeEventListener('dragstart', onDragStart);
        node.removeEventListener('dragover', onDragOver);
        node.removeEventListener('dragleave', onDragLeave);
        node.removeEventListener('drop', onDrop);
        node.removeEventListener('dragend', onDragEnd);
      });
    });
    return () => cleanups.forEach(fn => fn());
  }, [enableColumnReordering, visibleColumns]);

  // --- Row grouping & aggregation ------------------------------------------
  // Grouping applies in the non-virtual path only (virtual rows can be
  // unmounted). Groups are built from the full filtered+sorted set so they span
  // all pages. Per-group expansion is tracked as a set of keys toggled away from
  // the `groupsDefaultExpanded` default.
  const groupingActive = !!groupBy && !virtual;
  const [toggledGroups, setToggledGroups] = useState<Set<string>>(() => new Set());
  const isGroupExpanded = useCallback(
    (key: string) => (groupsDefaultExpanded ? !toggledGroups.has(key) : toggledGroups.has(key)),
    [groupsDefaultExpanded, toggledGroups]
  );
  const toggleGroup = useCallback((key: string) => {
    setToggledGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const groups = useMemo(() => {
    if (!groupingActive) return null;
    const col = columns.find(c => c.key === groupBy);
    const order: Array<{ key: string; value: any }> = [];
    const byKey = new Map<string, T[]>();
    fullRows.forEach(row => {
      const value = col ? getValue(row, col.accessor) : undefined;
      const key = String(value);
      if (!byKey.has(key)) { byKey.set(key, []); order.push({ key, value }); }
      byKey.get(key)!.push(row);
    });
    return order.map(o => ({ key: o.key, value: o.value, rows: byKey.get(o.key)! }));
  }, [groupingActive, columns, groupBy, fullRows]);

  // Format an aggregate for a column: honor a per-column formatter, else use the
  // column's dataType (rounding averages to 2 dp), else the raw value.
  const formatAggregate = useCallback((column: DataTableColumn<T>, value: number | string): React.ReactNode => {
    if (value === '' || value === null || value === undefined) return null;
    if (column.aggregateFormat) return column.aggregateFormat(value);
    if (typeof value === 'number' && column.aggregate === 'count') return String(value);
    if (typeof value === 'number') {
      const rounded = column.aggregate === 'avg' ? Math.round(value * 100) / 100 : value;
      return formatValue(rounded, column.dataType);
    }
    return String(value);
  }, []);

  // Export the current view (filtered + sorted, all pages) as CSV using the
  // visible columns. On web, triggers a file download; if `onExport` is given it
  // receives the CSV string instead (also the only path on native).
  const handleExport = useCallback(() => {
    const cols = visibleColumns;
    const rows = manualPagination
      ? data
      : sortData(filterData(data, activeFilters, columns, searchValue, rowFeatureToggle), sortBy, columns);
    // RFC-4180 escaping: wrap in quotes and double any embedded quotes when the
    // value contains a comma, quote, or newline.
    const esc = (v: any) => {
      const s = v == null ? '' : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headerLine = cols.map(c => esc(typeof c.header === 'string' ? c.header : c.key)).join(',');
    const bodyLines = rows.map(row =>
      cols.map(c => esc(formatValue(getValue(row, c.accessor), c.dataType))).join(',')
    );
    const csv = [headerLine, ...bodyLines].join('\r\n');

    if (onExport) { onExport(csv, rows); return; }
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [visibleColumns, manualPagination, data, activeFilters, columns, searchValue, sortBy, rowFeatureToggle, onExport, exportFileName]);

  // --- Sticky (pinned) columns ---------------------------------------------
  // `column.sticky: 'left' | 'right'` freezes a column in place during
  // horizontal scroll via CSS `position: sticky`. This has no native RN
  // equivalent, so it is web-only (a documented no-op elsewhere). Offsets are
  // the cumulative pixel width of the helper columns and any preceding pinned
  // columns on the same side. Pinned columns should declare an explicit numeric
  // `width` so their offsets line up exactly.
  const stickyEnabled = Platform.OS === 'web';

  // Effective pin side = runtime override (menu) falling back to static `sticky`.
  const effectiveSticky = useCallback(
    (c: DataTableColumn<T>): 'left' | 'right' | undefined => pinnedColumns[c.key] ?? c.sticky,
    [pinnedColumns]
  );

  const resolveNumericWidth = useCallback((c: DataTableColumn<T>): number => {
    const w = columnWidths[c.key] ?? c.width;
    if (typeof w === 'number') return w;
    if (typeof c.minWidth === 'number') return c.minWidth;
    return DEFAULT_COLUMN_WIDTH;
  }, [columnWidths]);

  const sticky = useMemo(() => {
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};
    let lastLeftKey: string | null = null;
    let firstRightKey: string | null = null;
    if (stickyEnabled) {
      let runningLeft = (selectable ? SELECT_COL_WIDTH : 0) + (expandableRowRender ? EXPAND_COL_WIDTH : 0);
      for (const c of visibleColumns) {
        if (effectiveSticky(c) === 'left') {
          left[c.key] = runningLeft;
          runningLeft += resolveNumericWidth(c);
          lastLeftKey = c.key; // rightmost left-pinned column → draws the divider
        }
      }
      let runningRight = rowActions ? actionsColumnWidth : 0;
      for (let i = visibleColumns.length - 1; i >= 0; i--) {
        const c = visibleColumns[i];
        if (effectiveSticky(c) === 'right') {
          right[c.key] = runningRight;
          runningRight += resolveNumericWidth(c);
          firstRightKey = c.key; // leftmost right-pinned column → draws the divider
        }
      }
    }
    return { left, right, lastLeftKey, firstRightKey };
  }, [stickyEnabled, visibleColumns, selectable, expandableRowRender, rowActions, actionsColumnWidth, resolveNumericWidth, effectiveSticky]);

  const hasStickyColumns = useMemo(
    () => stickyEnabled && visibleColumns.some(c => !!effectiveSticky(c)),
    [stickyEnabled, visibleColumns, effectiveSticky]
  );

  // Build the sticky positioning style for a header/body cell, or null when the
  // column isn't pinned. `bg` must be opaque so scrolled cells don't bleed
  // through the frozen column; `elevated` (header) sits above body sticky cells.
  const getStickyCellStyle = useCallback((column: DataTableColumn<T>, bg: string, elevated = false): any => {
    const side = effectiveSticky(column);
    if (!stickyEnabled || !side) return null;
    const isLeft = side === 'left';
    const offset = isLeft ? sticky.left[column.key] : sticky.right[column.key];
    if (offset === undefined) return null;
    const isDivider = isLeft ? sticky.lastLeftKey === column.key : sticky.firstRightKey === column.key;
    return {
      position: 'sticky' as const,
      [isLeft ? 'left' : 'right']: offset,
      zIndex: elevated ? 4 : 3,
      backgroundColor: bg,
      // A subtle edge shadow on the boundary column signals the frozen region.
      ...(isDivider
        ? { boxShadow: isLeft ? '2px 0 4px rgba(0,0,0,0.06)' : '-2px 0 4px rgba(0,0,0,0.06)' }
        : {}),
    };
  }, [stickyEnabled, sticky, effectiveSticky]);

  // Set / clear a column's pin side (runtime, persisted).
  const setColumnPin = useCallback((columnKey: string, side: 'left' | 'right' | null) => {
    setPinnedColumns(prev => {
      const next = { ...prev };
      if (side) next[columnKey] = side; else delete next[columnKey];
      return next;
    });
  }, []);

  // Move a column one slot left/right among the visible columns.
  const moveColumn = useCallback((columnKey: string, dir: -1 | 1) => {
    const idx = visibleColumns.findIndex(c => c.key === columnKey);
    const targetIdx = idx + dir;
    if (idx === -1 || targetIdx < 0 || targetIdx >= visibleColumns.length) return;
    reorderColumn(columnKey, visibleColumns[targetIdx].key);
  }, [visibleColumns, reorderColumn]);

  // --- Accessibility (web ARIA grid semantics) -----------------------------
  // RN Web forwards `role` / `aria-*` to the DOM; native RN ignores unknown
  // aria props (and would warn), so these are emitted web-only. Screen readers
  // use the grid/row/columnheader/gridcell roles plus aria-sort / aria-selected
  // to announce structure and state. Row/column indices are 1-based with the
  // header occupying row 1.
  const web = Platform.OS === 'web';
  const helperColsBefore = (selectable ? 1 : 0) + (expandableRowRender ? 1 : 0);
  const totalColCount = helperColsBefore + visibleColumns.length + (rowActions ? 1 : 0);
  const pageOffset = pagination ? (pagination.page - 1) * pagination.pageSize : 0;
  const gridA11y: any = web
    ? {
        role: expandableRowRender ? 'treegrid' : 'grid',
        'aria-label': ariaLabel ?? 'Data table',
        'aria-rowcount': totalFiltered + 1,
        'aria-colcount': totalColCount,
        ...(loading ? { 'aria-busy': true } : {}),
      }
    : {};
  const ariaSortFor = useCallback(
    (columnKey: string): 'ascending' | 'descending' | 'none' => {
      const s = sortBy.find(x => x.column === columnKey);
      return s?.direction === 'asc' ? 'ascending' : s?.direction === 'desc' ? 'descending' : 'none';
    },
    [sortBy]
  );

  // --- Keyboard grid navigation (web, non-virtual) -------------------------
  // Roving focus via `aria-activedescendant`: the grid container holds DOM focus
  // and points at the "active" body cell; Arrow / Home / End / PageUp / PageDown
  // move it and Enter/Space activates it (start editing in edit mode, otherwise
  // fire the row click). Disabled on native and in virtual mode, where rows can
  // be unmounted and thus not addressable by id.
  const reactId = React.useId();
  const gridDomId = id ? `datatable-${id}` : `datatable-${reactId.replace(/:/g, '')}`;
  const keyboardNavEnabled = web && !virtual && !groupBy;
  const gridRef = useRef<any>(null);
  const [focusedCell, setFocusedCell] = useState<{ r: number; c: number } | null>(null);
  const cellDomId = useCallback((r: number, c: number) => `${gridDomId}-r${r}-c${c}`, [gridDomId]);
  // Latest values for the (stable) keydown listener to read without re-binding.
  const navRef = useRef<any>({});

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchValue(value);
    }
  }, [onSearchChange]);

  const handleSort = useCallback((columnKey: string) => {
    if (!onSortChange) return;

    const currentSort = sortBy.find(s => s.column === columnKey);
    let newDirection: SortDirection = 'asc';
    
    if (currentSort) {
      if (currentSort.direction === 'asc') {
        newDirection = 'desc';
      } else if (currentSort.direction === 'desc') {
        newDirection = null;
      }
    }

    const newSort = sortBy.filter(s => s.column !== columnKey);
    if (newDirection) {
      newSort.unshift({ column: columnKey, direction: newDirection });
    }

    onSortChange(newSort);
  }, [sortBy, onSortChange]);

  const handleRowExpand = useCallback((rowId: string | number) => {
    const newExpanded = [...expandedRows];
    const isExpanded = newExpanded.includes(rowId);
    
    if (isExpanded) {
      // Collapse the row
      const index = newExpanded.indexOf(rowId);
      newExpanded.splice(index, 1);
    } else {
      // Expand the row
      if (!allowMultipleExpanded) {
        newExpanded.length = 0; // Clear all other expanded rows
      }
      newExpanded.push(rowId);
    }
    
    if (onExpandedRowsChange) {
      onExpandedRowsChange(newExpanded);
    } else {
      setInternalExpandedRows(newExpanded);
    }
  }, [expandedRows, allowMultipleExpanded, onExpandedRowsChange]);

  const beginResize = (e: any, column: DataTableColumn<T>) => {
    if (!enableColumnResizing || !column.resizable) return;
    const clientX = e?.nativeEvent?.pageX || e?.clientX || 0;
    resizingColRef.current = column.key;
    resizeStartX.current = clientX;
    const currentWidth = columnWidths[column.key];
    const numeric = typeof currentWidth === 'number' ? currentWidth : (column.minWidth || 120);
    resizeStartWidth.current = numeric;
    const moveListener = (ev: any) => {
      if (!resizingColRef.current) return;
      const moveX = ev.pageX || ev.touches?.[0]?.pageX || 0;
      const delta = moveX - resizeStartX.current;
      const base = resizeStartWidth.current;
      let newW = base + delta;
      if (column.minWidth) newW = Math.max(column.minWidth, newW);
      if (column.maxWidth) newW = Math.min(column.maxWidth, newW);
      setColumnWidths(w => ({ ...w, [column.key]: Math.max(40, newW) }));
    };
    const upListener = () => {
      resizingColRef.current = null;
      document.removeEventListener('mousemove', moveListener as any);
      document.removeEventListener('mouseup', upListener as any);
      document.removeEventListener('touchmove', moveListener as any);
      document.removeEventListener('touchend', upListener as any);
    };
    document.addEventListener('mousemove', moveListener as any);
    document.addEventListener('mouseup', upListener as any);
    document.addEventListener('touchmove', moveListener as any);
    document.addEventListener('touchend', upListener as any);
  };

  // Get all row IDs for current page/view
  const allRowIds = useMemo(() => 
    processedData.map((row, index) => getRowId(row, index)),
    [processedData, getRowId]
  );

  // Enhanced row selection with shift-click and range selection
  const rowSelection = useRowSelection({
    allRowIds,
    selectedRows,
    onSelectionChange,
    persistAcrossPagination: true
  });

  // Portal-based column settings
  const handleCellDoublePress = useCallback((rowIndex: number, columnKey: string) => {
    if (!editMode) return;
    
    const column = columns.find(col => col.key === columnKey);
    if (!column?.editable) return;

    // Resolve against the rows actually rendered (which differ from
    // `processedData` when grouping interleaves group-header rows).
    const row = activeRowsRef.current[rowIndex];
    if (row === undefined) return;
    const currentValue = getValue(row, column.accessor);

    setEditingCell({ row: rowIndex, column: columnKey });
    setEditValue(currentValue);
  }, [editMode, columns]);

  const handleCellEditSave = useCallback(() => {
    if (!editingCell || !onCellEdit) return;

    const column = columns.find(col => col.key === editingCell.column);
    if (column?.validate) {
      const error = column.validate(editValue);
      if (error) {
        // Handle validation error
        return;
      }
    }

    onCellEdit(editingCell.row, editingCell.column, editValue);
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onCellEdit, columns]);

  const handleCellEditCancel = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  // Keep the keydown listener's view of state current without re-binding it.
  navRef.current = {
    rows: processedData.length,
    cols: visibleColumns.length,
    isRTL,
    focused: focusedCell,
    processedData,
    visibleColumns,
    onRowClick,
    editMode,
    handleCellDoublePress,
    setFocusedCell,
  };

  // Drop a stale focused cell whenever the visible row set changes (paging,
  // filtering, sorting) so the highlight can't point at a since-removed row.
  useEffect(() => {
    setFocusedCell(null);
  }, [processedData.length, visibleColumns.length]);

  // Bind a single keydown listener to the grid container's DOM node (web only).
  useEffect(() => {
    if (!keyboardNavEnabled) return;
    const node = gridRef.current as any;
    if (!node || typeof node.addEventListener !== 'function') return;
    node.tabIndex = 0;
    (node.style || {}).outline = 'none';

    const onKeyDown = (e: KeyboardEvent) => {
      const s = navRef.current;
      if (!s.rows || !s.cols) return;
      // First navigation key lands on the top-left cell rather than moving.
      if (!s.focused && ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End','PageDown','PageUp'].includes(e.key)) {
        e.preventDefault();
        s.setFocusedCell({ r: 0, c: 0 });
        return;
      }
      let { r, c } = s.focused ?? { r: 0, c: 0 };
      const back = s.isRTL ? 1 : -1;
      const fwd = s.isRTL ? -1 : 1;
      const clampC = (v: number) => Math.min(s.cols - 1, Math.max(0, v));
      const clampR = (v: number) => Math.min(s.rows - 1, Math.max(0, v));
      let handled = true;
      switch (e.key) {
        case 'ArrowDown': r = clampR(r + 1); break;
        case 'ArrowUp': r = clampR(r - 1); break;
        case 'ArrowRight': c = clampC(c + fwd); break;
        case 'ArrowLeft': c = clampC(c + back); break;
        case 'Home': c = 0; if (e.ctrlKey || e.metaKey) r = 0; break;
        case 'End': c = s.cols - 1; if (e.ctrlKey || e.metaKey) r = s.rows - 1; break;
        case 'PageDown': r = clampR(r + 10); break;
        case 'PageUp': r = clampR(r - 10); break;
        case 'Enter':
        case ' ': {
          const row = s.processedData[r];
          const col = s.visibleColumns[c];
          if (s.editMode && col?.editable) s.handleCellDoublePress(r, col.key);
          else s.onRowClick?.(row, r);
          e.preventDefault();
          return;
        }
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        s.setFocusedCell({ r, c });
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [keyboardNavEnabled]);

  // Mirror the focused cell to `aria-activedescendant` so assistive tech follows
  // the roving highlight, and scroll it into view so keyboard navigation stays
  // visible in scrollable tables (fixed `height` vertical scroll, or wide /
  // sticky-column horizontal scroll). `block/inline: 'nearest'` is a no-op when
  // the cell is already visible, so it won't jitter or hijack page scroll.
  useEffect(() => {
    if (!keyboardNavEnabled) return;
    const node = gridRef.current as any;
    if (!node?.setAttribute) return;
    if (focusedCell) {
      node.setAttribute('aria-activedescendant', cellDomId(focusedCell.r, focusedCell.c));
      const cell = typeof document !== 'undefined'
        ? document.getElementById(cellDomId(focusedCell.r, focusedCell.c))
        : null;
      cell?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    } else {
      node.removeAttribute('aria-activedescendant');
    }
  }, [keyboardNavEnabled, focusedCell, cellDomId]);

  // Render functions
  const renderHeader = () => (
    <View style={{ 
      flexDirection: isRTL ? 'row-reverse' : 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: DESIGN_TOKENS.spacing.md,
      paddingHorizontal: DESIGN_TOKENS.spacing.xs
    }}>
      <Flex gap={DESIGN_TOKENS.spacing.md} align="center">
        {selectedRows.length > 0 && bulkActions.length > 0 && (
          <Flex gap={8}>
            <Text variant="small" color="muted">
              {selectedRows.length} selected
            </Text>
            {bulkActions.map(action => (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                startIcon={action.icon}
                onPress={() => action.action(selectedRows, data)}
              >
                {action.label}
              </Button>
            ))}
          </Flex>
        )}
      </Flex>

      <Flex gap={8}>
        {/* Search & Filter Popover */}
        {(searchable || columns.some(c => c.filterable)) && (
          <Popover position="bottom-end" offset={{ mainAxis: 12 }} w={320} trapFocus>
            <Popover.Target>
              <Button
                variant="outline"
                size="sm"
                startIcon={<Icon name="search" size={14} />}
              >
                Search
                {(searchValue || activeFilters.length > 0) && (
                  <View style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.colors.primary[5],
                    marginLeft: 4
                  }} />
                )}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Flex direction="column" gap={DESIGN_TOKENS.spacing.md} style={{ width: 320 }}>
                <Text variant="small" weight="semibold">
                  Search & Filter
                </Text>

                {searchable && (
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.gray[2],
                      paddingBottom: DESIGN_TOKENS.spacing.sm,
                    }}
                  >
                    <Flex direction="column" gap={DESIGN_TOKENS.spacing.xs}>
                      <Text variant="small" weight="semibold">
                        Search
                      </Text>
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChangeText={handleSearchChange}
                        startSection={<Icon name="menu" size={16} />}
                        size="sm"
                      />
                    </Flex>
                  </View>
                )}

                {columns.some(c => c.filterable) && (
                  <Flex direction="column" gap={DESIGN_TOKENS.spacing.sm}>
                    <Flex direction="row" justify="space-between" align="center">
                      <Text variant="small" weight="semibold">
                        Filters
                      </Text>
                      {activeFilters.length > 0 && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onPress={() => {
                            setInternalFilters([]);
                          }}
                        >
                          Clear all
                        </Button>
                      )}
                    </Flex>

                    {activeFilters.length > 0 && (
                      <Flex
                        direction="column"
                        gap={DESIGN_TOKENS.spacing.xs}
                        style={{ marginBottom: DESIGN_TOKENS.spacing.sm }}
                      >
                        {activeFilters.map((filter, idx) => {
                          const column = columns.find(c => c.key === filter.column);
                          return (
                            <View
                              key={idx}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: theme.colors.primary[1],
                                paddingHorizontal: DESIGN_TOKENS.spacing.sm,
                                paddingVertical: DESIGN_TOKENS.spacing.xs,
                                borderRadius: DESIGN_TOKENS.radius.sm,
                                gap: DESIGN_TOKENS.spacing.xs
                              }}
                            >
                              <Text variant="small" style={{ color: theme.colors.primary[8] }}>
                                {column?.header || filter.column}: {filter.operator} "{filter.value}"
                              </Text>
                              <Pressable
                                onPress={() => {
                                  setInternalFilters(filters => filters.filter((_, i) => i !== idx));
                                }}
                              >
                                <Icon name="x" size={12} color={theme.colors.primary[6]} />
                              </Pressable>
                            </View>
                          );
                        })}
                      </Flex>
                    )}

                    <Flex direction="column" gap={DESIGN_TOKENS.spacing.sm}>
                      {columns.filter(c => c.filterable).map(column => {
                        const currentFilter = getColumnFilter(column.key);
                        return (
                          <View key={`${column.key}-${currentFilter?.value || 'no-filter'}`}>
                            {renderFilterControl(column)}
                          </View>
                        );
                      })}
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Popover.Dropdown>
          </Popover>
        )}
        
        {onEditModeChange && (
          <Button
            variant={editMode ? 'filled' : 'outline'}
            size="sm"
            onPress={() => onEditModeChange(!editMode)}
          >
            {editMode ? 'Exit Edit' : 'Edit'}
          </Button>
        )}
        {exportable && (
          <Button
            variant="outline"
            size="sm"
            startIcon={<Icon name="download" size={14} />}
            onPress={handleExport}
            accessibilityLabel="Export as CSV"
          >
            Export
          </Button>
        )}
        {showColumnVisibilityManager && (
          <Popover position="bottom-end" offset={{ mainAxis: 12 }} w={280} trapFocus>
            <Popover.Target>
              <Button
                variant="outline"
                size="sm"
                startIcon={<Icon name="eye" size={14} />}
              >
                Columns
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <View style={{ padding: 8, maxHeight: 300, width: 260 }}>
                <ComponentWithDisclaimer
                  disclaimer="Selected view determines the layout style"
                  disclaimerProps={{ color: 'muted', size: 'sm' }}
                >
                  <Row>
                    <Button
                      size="xs"
                      title="Deselect All"
                      variant={
                        hiddenColumns.length === columns.length ? 'filled' : 'outline'
                      }
                      onPress={() => setHiddenColumns(columns.map(c => c.key))}
                      style={{ marginBottom: 8 }}
                    />
                    <Button
                      size="xs"
                      title="Select All"
                      variant={
                        hiddenColumns.length === 0 ? 'filled' : 'outline'
                      }
                      onPress={() => setHiddenColumns([])}
                      style={{ marginBottom: 8 }}
                    />
                  </Row>
                </ComponentWithDisclaimer>

                <ScrollView style={{ maxHeight: 200 }}>
                  {columns.map(col => (
                    <Checkbox
                      key={col.key}
                      label={col.header}
                      onChange={() => {
                        if (hiddenColumns.includes(col.key)) {
                          setHiddenColumns(prev => prev.filter(h => h !== col.key));
                        } else {
                          setHiddenColumns(prev => [...prev, col.key]);
                        }
                      }}
                      style={{ marginBottom: 4 }}
                    />
                  ))}
                </ScrollView>
              </View>
            </Popover.Dropdown>
          </Popover>
        )}
      </Flex>
    </View>
  );

  const renderCell = useCallback((column: DataTableColumn<T>, row: T, rowIndex: number) => {
    const value = getValue(row, column.accessor);
    const isEditing = editingCell?.row === rowIndex && editingCell?.column === column.key;

    if (isEditing && column.editable) {
      return (
        <RNTextInput
          value={String(editValue)}
          onChangeText={setEditValue}
          onBlur={handleCellEditSave}
          onSubmitEditing={handleCellEditSave}
          autoFocus
          style={{
            borderWidth: 1,
            borderColor: theme.colors.primary[5],
            borderRadius: 4,
            backgroundColor: theme.colors.gray[0],
            color: theme.text.primary,
            fontSize: DESIGN_TOKENS.typography.fontSize.sm
          }}
        />
      );
    }

    if (column.cell) {
      return column.cell(value, row, rowIndex);
    }

    const numeric = isNumericType(column.dataType);
    return (
      <Text
        {...mergeSlotProps(
          {
            variant: 'p' as const,
            style: {
              textAlign: getColumnAlign(column),
              color: theme.text.primary,
              // Let long unbroken tokens (emails, urls, ids) wrap to the next
              // line on web instead of overflowing the column and painting over
              // the neighbouring cell. Native RN already breaks long words.
              ...(Platform.OS === 'web'
                ? { wordBreak: 'break-word' as const, overflowWrap: 'anywhere' as const }
                : {}),
              ...(numeric && Platform.OS === 'web'
                ? { fontVariant: ['tabular-nums' as const] }
                : {})
            },
          },
          cellTextProps,
        )}
      >
        {formatValue(value, column.dataType)}
      </Text>
    );
  }, [editValue, editingCell, handleCellEditSave, theme, cellTextProps]);

  // Sort indicator icon: stacked up/down chevrons when unsorted, a single
  // directional chevron when actively sorted. Color stays neutral in every
  // state — only the icon shape (and opacity) signals the sort direction.
  const getSortIcon = (columnKey: string) => {
    const sort = sortBy.find(s => s.column === columnKey);
    if (!sort?.direction) return 'selector-vertical';
    return sort.direction === 'asc' ? 'chevron-up' : 'chevron-down';
  };

  const updateFilter = useCallback((columnKey: string, value: any, operator?: DataTableFilter['operator']) => {
    const op: DataTableFilter['operator'] = operator || 'contains';
    if (onFilterChange) {
      // Controlled mode - derive next filters array from provided filters prop
      const next = (filters || []).filter(f => f.column !== columnKey);
      if (value !== '' && value !== null && value !== undefined) {
        next.push({ column: columnKey, value, operator: op });
      }
      onFilterChange(next);
    } else {
      setInternalFilters(prev => {
        const next = prev.filter(f => f.column !== columnKey);
        if (value !== '' && value !== null && value !== undefined) {
          next.push({ column: columnKey, value, operator: op });
        }
        return next;
      });
    }
  }, [onFilterChange, filters]);

  const clearFilter = useCallback((columnKey: string) => {
    updateFilter(columnKey, undefined);
  }, [updateFilter]);

  const getColumnFilter = useCallback((columnKey: string) => {
    return (onFilterChange ? filters : internalFilters).find(f => f.column === columnKey);
  }, [onFilterChange, filters, internalFilters]);

  const renderFilterControl = (col: DataTableColumn<T>, showOperators = false, autoFocus = false) => {
    const currentFilter = getColumnFilter(col.key);

    return (
      <AdvancedFilterControl
        column={{ ...col, filterType: getColumnFilterType(col) }}
        currentFilter={currentFilter}
        data={data}
        showOperators={showOperators}
        autoFocus={autoFocus}
        onFilterChange={(filter) => {
          if (filter) {
            updateFilter(filter.column, filter.value, filter.operator);
          } else {
            clearFilter(col.key);
          }
        }}
      />
    );
  };

  const headerRow = (
    <TableTr
      {...(web ? { role: 'row', 'aria-rowindex': 1 } : {})}
      style={{
        backgroundColor: theme.colors.surface[1],
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.gray[3]
      }}>
      {selectable && (
        <TableTh w={50} style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} {...(web ? { role: 'columnheader', 'aria-colindex': 1 } : {})}>
          <Checkbox
            size="sm"
            checked={rowSelection.isAllSelected}
            indeterminate={rowSelection.isIndeterminate}
            onChange={() => rowSelection.toggleAll()}
            accessibilityLabel="Select all rows"
          />
        </TableTh>
      )}

      {expandableRowRender && <TableTh w={50} style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} {...(web ? { role: 'columnheader', 'aria-colindex': (selectable ? 2 : 1) } : {})} />}

      {visibleColumns.map((column, colIdx) => {
        const width = columnWidths[column.key] || column.width;
        const hasFilter = !!getColumnFilter(column.key);
        const controlsVisible =
          Platform.OS !== 'web' ||
          hoveredHeader === column.key ||
          openFilterColumn === column.key ||
          hasFilter;
        return (
          <TableTh
            key={column.key}
            w={width}
            minWidth={column.minWidth}
            maxWidth={column.maxWidth}
            align={getColumnAlign(column)}
            {...(web ? {
              role: 'columnheader',
              'aria-colindex': helperColsBefore + colIdx + 1,
              ...(column.sortable ? { 'aria-sort': ariaSortFor(column.key) } : {}),
            } : {})}
            ref={enableColumnReordering && web
              ? (node: any) => {
                  if (node) headerNodeRefs.current[column.key] = node;
                  else delete headerNodeRefs.current[column.key];
                }
              : undefined}
            style={{
              position: 'relative',
              // paddingVertical: 16,
              borderBottomWidth: 0,
              // Header content spans the full cell so the sort/filter/menu
              // controls can sit flush right regardless of the column's
              // text alignment (which is applied to the label instead).
              alignItems: 'stretch',
              ...columnDividerStyle(colIdx),
              backgroundColor: theme.colors.surface[1],
              ...getStickyCellStyle(column, theme.colors.surface[1], true),
              // Drop-target indicator while dragging a column over this header.
              ...(dropTargetKey === column.key && dragColKeyRef.current && dragColKeyRef.current !== column.key
                ? { borderLeftWidth: 2, borderLeftColor: theme.colors.primary[5] }
                : {}),
              ...(enableColumnReordering && Platform.OS === 'web' ? ({ cursor: 'grab' } as any) : {}),
            }}
          >
            <View
              {...(Platform.OS === 'web'
                ? {
                    onMouseEnter: () => setHoveredHeader(column.key),
                    onMouseLeave: () =>
                      setHoveredHeader(prev => (prev === column.key ? null : prev))
                  }
                : {})}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
                gap: 2,
              }}
            >
              {/* Label takes the remaining space (honouring the column's
                  alignment) so the control cluster stays pinned right. */}
              <Pressable
                onPress={() => column.sortable && handleSort(column.key)}
                disabled={!column.sortable}
                accessibilityRole={column.sortable ? 'button' : undefined}
                accessibilityLabel={
                  column.sortable && typeof column.header === 'string'
                    ? `Sort by ${column.header}`
                    : undefined
                }
                {...(web && column.sortable ? { focusable: true } : {})}
                style={{
                  flexGrow: 1,
                  flexShrink: 1,
                  minWidth: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent:
                    getColumnAlign(column) === 'center'
                      ? 'center'
                      : getColumnAlign(column) === 'right'
                        ? 'flex-end'
                        : 'flex-start'
                }}
              >
                <Text
                  {...mergeSlotProps(
                    {
                      variant: 'p' as const,
                      weight: 'semibold' as const,
                      style: {
                        color: theme.text.primary,
                        fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                        flexDirection: 'row' as const,
                        display: 'flex' as const,
                      },
                    },
                    headerTextProps,
                  )}
                >
                  {column.header}
                </Text>
              </Pressable>
              {/* Sort indicator lives with the right-aligned controls but stays
                  visible off-hover so the active sort direction is never hidden. */}
              {column.sortable && (
                <Pressable
                  onPress={() => handleSort(column.key)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    typeof column.header === 'string'
                      ? `Sort by ${column.header}`
                      : 'Sort column'
                  }
                  {...(web ? { focusable: true } : {})}
                  style={({ pressed }: { pressed: boolean }) => ({
                    padding: 2,
                    borderRadius: 4,
                    opacity: pressed ? 0.6 : 1
                  })}
                >
                  <Icon
                    name={getSortIcon(column.key)}
                    size={18}
                    stroke={2.75}
                    color={theme.colors.gray[7]}
                    style={{
                      opacity: sortBy.some(s => s.column === column.key && s.direction) ? 1 : 0.5
                    }}
                  />
                </Pressable>
              )}
              <View
                pointerEvents={controlsVisible ? 'auto' : 'none'}
                style={{ opacity: controlsVisible ? 1 : 0, flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
              {column.filterable && (
                <Popover
                  position="bottom-end"
                  offset={{ mainAxis: 8 }}
                  w={260}
                  trapFocus
                  opened={openFilterColumn === column.key}
                  onChange={(o: boolean) => setOpenFilterColumn(o ? column.key : null)}
                >
                  <Popover.Target>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Filter ${typeof column.header === 'string' ? column.header : 'column'}`}
                      style={{
                        padding: 4,
                        borderRadius: 4,
                        backgroundColor: hasFilter ? theme.colors.primary[1] : 'transparent'
                      }}
                    >
                      <Icon
                        name="filter"
                        size={16}
                        stroke={2.5}
                        color={hasFilter ? theme.colors.primary[6] : theme.colors.gray[6]}
                        variant={hasFilter ? 'filled' : 'outlined'}
                      />
                    </Pressable>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <View style={{ gap: DESIGN_TOKENS.spacing.xs }}>
                      {renderFilterControl(column, true, openFilterColumn === column.key)}
                    </View>
                  </Popover.Dropdown>
                </Popover>
              )}
              <Menu position="bottom-end" offset={4}>
                <MenuDropdown>
                  <MenuLabel>
                    {typeof column.header === 'string' ? column.header : 'Column'}
                  </MenuLabel>
                  <MenuItem
                    startSection={<Icon name="eye" size={14} color={theme.colors.gray[7]} />}
                    disabled={visibleColumns.length === 1}
                    onPress={() => {
                      if (visibleColumns.length === 1) return;
                      setHiddenColumns(h => [...new Set([...h, column.key])]);
                    }}
                  >
                    Hide column
                  </MenuItem>
                  {column.sortable && (
                    <MenuItem
                      startSection={<Icon name="chevron-up" size={14} color={theme.colors.gray[7]} />}
                      onPress={() =>
                        onSortChange && onSortChange([{ column: column.key, direction: 'asc' }])
                      }
                    >
                      Sort ascending
                    </MenuItem>
                  )}
                  {column.sortable && (
                    <MenuItem
                      startSection={<Icon name="chevron-down" size={14} color={theme.colors.gray[7]} />}
                      onPress={() =>
                        onSortChange && onSortChange([{ column: column.key, direction: 'desc' }])
                      }
                    >
                      Sort descending
                    </MenuItem>
                  )}
                  {column.sortable && sortBy.some(s => s.column === column.key) && (
                    <MenuItem
                      startSection={<Icon name="x" size={14} color={theme.colors.gray[7]} />}
                      onPress={() => onSortChange?.(sortBy.filter(s => s.column !== column.key))}
                    >
                      Clear sort
                    </MenuItem>
                  )}

                  {stickyEnabled && (
                    <>
                      <MenuDivider />
                      {effectiveSticky(column) !== 'left' && (
                        <MenuItem
                          startSection={<Icon name="pin" size={14} color={theme.colors.gray[7]} />}
                          onPress={() => setColumnPin(column.key, 'left')}
                        >
                          Pin left
                        </MenuItem>
                      )}
                      {effectiveSticky(column) !== 'right' && (
                        <MenuItem
                          startSection={<Icon name="pin" size={14} color={theme.colors.gray[7]} />}
                          onPress={() => setColumnPin(column.key, 'right')}
                        >
                          Pin right
                        </MenuItem>
                      )}
                      {effectiveSticky(column) && (
                        <MenuItem
                          startSection={<Icon name="x" size={14} color={theme.colors.gray[7]} />}
                          onPress={() => setColumnPin(column.key, null)}
                        >
                          Unpin
                        </MenuItem>
                      )}
                    </>
                  )}

                  {enableColumnReordering && (
                    <>
                      <MenuDivider />
                      <MenuItem
                        startSection={<Icon name="arrow-left" size={14} color={theme.colors.gray[7]} />}
                        disabled={visibleColumns[0]?.key === column.key}
                        onPress={() => moveColumn(column.key, -1)}
                      >
                        Move left
                      </MenuItem>
                      <MenuItem
                        startSection={<Icon name="arrow-right" size={14} color={theme.colors.gray[7]} />}
                        disabled={visibleColumns[visibleColumns.length - 1]?.key === column.key}
                        onPress={() => moveColumn(column.key, 1)}
                      >
                        Move right
                      </MenuItem>
                    </>
                  )}
                </MenuDropdown>
                <Pressable
                  onPress={() => {}}
                  style={({ pressed }) => ({
                    padding: 4,
                    borderRadius: 4,
                    opacity: pressed ? 0.6 : 1
                  })}
                >
                  <Icon name="dots" variant="filled" size={16} color={theme.colors.gray[6]} />
                </Pressable>
              </Menu>
              </View>
            </View>
            {enableColumnResizing && column.resizable && (
              <Pressable
                onPress={e => e.stopPropagation?.()}
                onStartShouldSetResponder={() => true}
                onResponderGrant={e => beginResize(e, column)}
                style={{
                  position: 'absolute',
                  right: -4,
                  top: 0,
                  bottom: 0,
                  width: 8,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <View
                  style={{
                    width: 2,
                    height: '60%',
                    backgroundColor: theme.colors.gray[3],
                    borderRadius: 1
                  }}
                />
              </Pressable>
            )}
          </TableTh>
        );
      })}
    </TableTr>
  );

  // Optional always-visible filter row rendered directly beneath the header.
  // Mirrors the header's column layout (helper cells + one cell per visible
  // column + trailing actions spacer) so the inline controls stay aligned.
  const filterRow = showColumnFilters ? (
    <TableTr
      {...(web ? { role: 'row' } : {})}
      style={{
        backgroundColor: theme.colors.surface[1],
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray[3],
      }}
    >
      {selectable && <TableTh w={50} style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} />}
      {expandableRowRender && <TableTh w={50} style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} />}
      {visibleColumns.map((column, colIdx) => {
        const width = columnWidths[column.key] || column.width;
        return (
          <TableTh
            key={column.key}
            w={width}
            minWidth={column.minWidth}
            maxWidth={column.maxWidth}
            style={{
              paddingVertical: 6,
              borderBottomWidth: 0,
              ...columnDividerStyle(colIdx),
              backgroundColor: theme.colors.surface[1],
              ...getStickyCellStyle(column, theme.colors.surface[1], true),
            }}
          >
            {column.filterable ? (
              <ColumnFilterInput
                column={column}
                filterType={getColumnFilterType(column)}
                currentFilter={getColumnFilter(column.key)}
                data={data}
                align={getColumnAlign(column)}
                onCommit={(value, operator) => {
                  if (value === undefined) {
                    clearFilter(column.key);
                  } else {
                    updateFilter(column.key, value, operator);
                  }
                }}
              />
            ) : null}
          </TableTh>
        );
      })}
      {rowActions && <TableTh style={{ borderBottomWidth: 0, width: actionsColumnWidth }} />}
    </TableTr>
  ) : null;

  const emptyStateRow = (
    <TableTr>
      <TableTd
        style={{
          // padding: 60,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 64,
              // height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.gray[1],
              alignItems: 'center',
              justifyContent: 'center',
              // marginBottom: 16
            }}
          >
            <Icon name="menu" size={24} color={theme.colors.gray[5]} />
          </View>
          <Text
            variant="h6"
            color="muted"
            style={{ marginBottom: 8, fontWeight: '600' }}
          >
            No Data Available
          </Text>
          <Text
            variant="p"
            color="muted"
            style={{ textAlign: 'center', maxWidth: 280 }}
          >
            {emptyMessage ||
              'There are no items to display. Try adjusting your filters or add some data.'}
          </Text>
        </View>
      </TableTd>
    </TableTr>
  );

  const buildRow = useCallback((row: T, rowIndex: number) => {
    const rowId = getRowId(row, rowIndex);
    const isSelected = rowSelection.isRowSelected(rowId);
    const rowFeatures = rowFeatureToggle?.(row, rowIndex) || {};
    const rowSelectable =
      rowFeatures.selectable !== undefined ? rowFeatures.selectable : selectable;

    const isExpanded = expandedRows.includes(rowId);
    const totalColumns =
      (selectable ? 1 : 0) + (expandableRowRender ? 1 : 0) + visibleColumns.length + (rowActions ? 1 : 0);

    // Opaque background for pinned cells so scrolled columns don't show through
    // the frozen region. Mirrors the row's own background (selected / striped /
    // base surface). Hover tint is intentionally not mirrored here.
    const stickyRowBg = isSelected
      ? theme.colors.primary[1]
      : isStriped && rowIndex % 2 === 1
        ? theme.colors.gray[1]
        : (theme.backgrounds?.surface ?? theme.colors.gray[0]);

    const rowElement = (
      <>
        <TableTr
          selected={isSelected}
          hoverable={hoverHighlight}
          {...(web ? {
            role: 'row',
            'aria-rowindex': pageOffset + rowIndex + 2,
            ...(rowSelectable ? { 'aria-selected': isSelected } : {}),
          } : {})}
          bg={
            isSelected
              ? undefined
              : isStriped && rowIndex % 2 === 1
                ? theme.colors.gray[1]
                : 'transparent'
          }
          onPress={() => onRowClick?.(row, rowIndex)}
          style={{
            borderLeftWidth: 2,
            borderLeftColor: isSelected ? theme.colors.primary[5] : 'transparent',
            borderBottomWidth: rowDividerWidth,
            borderBottomColor: rowBorderColor || theme.colors.gray[2],
            borderBottomStyle: rowBorderStyle,
            minHeight: density === 'compact' ? 40 : density === 'comfortable' ? 56 : 48
          }}
        >
          {rowSelectable && (
            <TableTd style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} {...(web ? { role: 'gridcell', 'aria-colindex': 1 } : {})}>
              <Checkbox
                size="sm"
                checked={isSelected}
                onChange={() => rowSelection.toggleRow(rowId)}
                accessibilityLabel={`Select row ${pageOffset + rowIndex + 1}`}
              />
            </TableTd>
          )}

          {expandableRowRender && (
            <TableTd style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} {...(web ? { role: 'gridcell', 'aria-colindex': (selectable ? 2 : 1) } : {})}>
              <Pressable
                onPress={() => handleRowExpand(rowId)}
                accessibilityRole="button"
                accessibilityState={{ expanded: isExpanded }}
                accessibilityLabel={isExpanded ? 'Collapse row' : 'Expand row'}
                style={{
                  width: 24,
                  height: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4
                }}
              >
                {isExpanded
                  ? collapseIcon || (
                      <Icon name="chevron-down" size={16} color={theme.colors.gray[6]} />
                    )
                  : expandIcon || (
                      <Icon name="chevron-right" size={16} color={theme.colors.gray[6]} />
                    )}
              </Pressable>
            </TableTd>
          )}

          {visibleColumns.map((column, colIdx) => {
           const isFocusedCell =
             keyboardNavEnabled && focusedCell?.r === rowIndex && focusedCell?.c === colIdx;
           return (
            <Pressable
              key={column.key}
              onPress={() => handleCellDoublePress(rowIndex, column.key)}
              {...((web ? {
                role: 'gridcell',
                'aria-colindex': helperColsBefore + colIdx + 1,
                ...(keyboardNavEnabled ? { id: cellDomId(rowIndex, colIdx) } : {}),
              } : {}) as any)}
              style={{
                flex: 1,
                // Honor the column's min/max width so the body cell stays
                // aligned with its header (which applies the same bounds), and
                // clip any overflow so wide content never overlaps the
                // adjacent column. Defaults to minWidth 0 so unconstrained
                // columns can still shrink to share the row.
                minWidth: column.minWidth ?? 0,
                maxWidth: column.maxWidth,
                overflow: 'hidden',
                width:
                  typeof columnWidths[column.key] === 'number'
                    ? (columnWidths[column.key] as number)
                    : undefined,
                ...getStickyCellStyle(column, stickyRowBg),
                // Roving-focus ring for the active keyboard cell (web).
                ...(isFocusedCell
                  ? ({ outline: `2px solid ${theme.colors.primary[5]}`, outlineOffset: -2, zIndex: 2 } as any)
                  : {}),
              }}
            >
              <TableTd
                align={getColumnAlign(column)}
                style={{
                  // Row separation is owned by the TableTr border logic
                  // (variant / rowBorderWidth); suppress the cell's default
                  // hairline so it doesn't draw an extra divider on every row.
                  borderBottomWidth: 0,
                  ...columnDividerStyle(colIdx)
                }}
              >
                {renderCell(column, row, rowIndex)}
              </TableTd>
            </Pressable>
           );
          })}
          {rowActions && (
            <TableTd align="center" style={{ width: actionsColumnWidth, borderBottomWidth: 0 }} {...(web ? { role: 'gridcell', 'aria-colindex': totalColCount } : {})}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: DESIGN_TOKENS.spacing.xs
                }}
              >
                {rowActions(row, rowIndex)
                  ?.filter(action => !action.hidden)
                  .map(action => {
                    const button = (
                      <Pressable
                        onPress={() => action.onPress?.(row, rowIndex)}
                        disabled={action.disabled}
                        accessibilityRole="button"
                        accessibilityLabel={action.label || getTooltipText(action.tooltip) || action.key}
                        style={({ pressed }) => ({
                          opacity: action.disabled ? 0.4 : pressed ? 0.6 : 1,
                          padding: 8,
                          borderRadius: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: pressed ? theme.colors.gray[1] : 'transparent',
                          borderWidth: 1,
                          borderColor: 'transparent'
                        })}
                      >
                        {action.icon || (
                          <Icon name="menu" size={16} color={theme.colors.gray[6]} />
                        )}
                      </Pressable>
                    );
                    const actionTooltip = resolveTooltipProps(action.tooltip);
                    return actionTooltip
                      ? (
                        <Tooltip key={action.key} {...actionTooltip}>
                          {button}
                        </Tooltip>
                      )
                      : <React.Fragment key={action.key}>{button}</React.Fragment>;
                  })}
              </View>
            </TableTd>
          )}
        </TableTr>

        {expandableRowRender && (
          <TableTr style={{ borderBottomWidth: 0 }}>
            <TableTd
              colSpan={totalColumns}
              style={{ padding: 0, backgroundColor: theme.colors.gray[0], borderBottomWidth: 0 }}
            >
              <Collapse isCollapsed={!isExpanded} duration={250}>
                <View style={{ padding: 16 }}>{expandableRowRender(row, rowIndex)}</View>
              </Collapse>
            </TableTd>
          </TableTr>
        )}
      </>
    );

    return { key: String(rowId), element: rowElement };
  }, [actionsColumnWidth, cellDomId, collapseIcon, columnDividerStyle, columnWidths, density, expandableRowRender, expandIcon, expandedRows, focusedCell, getRowId, getStickyCellStyle, handleCellDoublePress, handleRowExpand, helperColsBefore, hoverHighlight, isStriped, keyboardNavEnabled, onRowClick, pageOffset, renderCell, rowActions, rowBorderColor, rowBorderStyle, rowDividerWidth, rowFeatureToggle, rowSelection, selectable, theme, totalColCount, visibleColumns, web]);

  const nonVirtualRows = useMemo(() => {
    if (virtual) return null;
    return processedData.map((row, rowIndex) => {
      const { key, element } = buildRow(row, rowIndex);
      return <React.Fragment key={key}>{element}</React.Fragment>;
    });
  }, [buildRow, processedData, virtual]);

  // A group-header / footer-totals row: leading helper-cell placeholders, then a
  // label+toggle+count in the first data column and each aggregate column's
  // value in its own cell (so totals line up under their columns).
  const buildAggregateRow = useCallback((
    opts: {
      keyPrefix: string;
      rows: T[];
      label: React.ReactNode;
      expanded?: boolean;
      onToggle?: () => void;
      isFooter?: boolean;
    }
  ) => {
    const { keyPrefix, rows, label, expanded, onToggle, isFooter } = opts;
    const bg = isFooter ? theme.colors.surface[1] : theme.colors.gray[1];
    return (
      <TableTr
        key={keyPrefix}
        {...(web ? { role: isFooter ? 'row' : 'row' } : {})}
        style={{
          backgroundColor: bg,
          borderTopWidth: isFooter ? 2 : 0,
          borderTopColor: theme.colors.gray[3],
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.gray[2],
          minHeight: density === 'compact' ? 36 : 44,
        }}
      >
        {selectable && <TableTd style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} />}
        {expandableRowRender && <TableTd style={{ borderBottomWidth: 0, ...columnDividerStyle(-1) }} />}
        {visibleColumns.map((column, colIdx) => {
          const first = colIdx === 0;
          const aggValue = column.aggregate !== undefined
            ? formatAggregate(column, computeAggregate(column.aggregate, rows, column))
            : null;
          return (
            <TableTd
              key={column.key}
              align={getColumnAlign(column)}
              style={{ borderBottomWidth: 0, ...columnDividerStyle(colIdx), backgroundColor: bg }}
            >
              {first ? (
                <Pressable
                  onPress={onToggle}
                  disabled={!onToggle}
                  accessibilityRole={onToggle ? 'button' : undefined}
                  accessibilityState={onToggle ? { expanded: !!expanded } : undefined}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  {onToggle && (
                    <Icon
                      name={expanded ? 'chevron-down' : 'chevron-right'}
                      size={14}
                      color={theme.colors.gray[6]}
                    />
                  )}
                  {typeof label === 'string' || typeof label === 'number'
                    ? <Text weight="semibold" style={{ color: theme.text.primary }}>{label}</Text>
                    : label}
                </Pressable>
              ) : (
                aggValue != null
                  ? <Text weight={isFooter ? 'semibold' : 'medium'} style={{ textAlign: getColumnAlign(column), color: theme.text.primary }}>{aggValue}</Text>
                  : null
              )}
            </TableTd>
          );
        })}
        {rowActions && <TableTd style={{ borderBottomWidth: 0, width: actionsColumnWidth }} />}
      </TableTr>
    );
  }, [theme, density, selectable, expandableRowRender, visibleColumns, rowActions, actionsColumnWidth, columnDividerStyle, web, formatAggregate]);

  // Flat list of the data rows currently rendered (group headers excluded), in
  // render order — used to resolve a cell's row from its index for editing.
  const activeRowsRef = useRef<T[]>([]);

  // Grouped body: interleave group-header rows with each group's (optionally
  // collapsed) rows, keeping a running index so buildRow/editing stay aligned.
  const groupedRows = useMemo(() => {
    if (!groupingActive || !groups) return null;
    const items: React.ReactNode[] = [];
    const flat: T[] = [];
    groups.forEach(group => {
      const expanded = isGroupExpanded(group.key);
      const label = renderGroupHeader
        ? renderGroupHeader({ value: group.value, rows: group.rows, count: group.rows.length, expanded, toggle: () => toggleGroup(group.key) })
        : `${group.value == null || group.value === 'undefined' ? '—' : String(group.value)} (${group.rows.length})`;
      items.push(buildAggregateRow({
        keyPrefix: `group-${group.key}`,
        rows: group.rows,
        label,
        expanded,
        onToggle: () => toggleGroup(group.key),
      }));
      if (expanded) {
        group.rows.forEach(row => {
          const idx = flat.length;
          flat.push(row);
          const { element } = buildRow(row, idx);
          items.push(<React.Fragment key={`grp-${group.key}-${idx}`}>{element}</React.Fragment>);
        });
      }
    });
    return { items, flat };
  }, [groupingActive, groups, isGroupExpanded, renderGroupHeader, toggleGroup, buildAggregateRow, buildRow]);

  // Keep the edit/index lookup pointed at whatever rows are actually rendered.
  activeRowsRef.current = groupingActive && groupedRows ? groupedRows.flat : processedData;

  // Grand-total footer row across all filtered rows.
  const footerRow = useMemo(() => {
    if (!showFooterTotals) return null;
    const hasAggregates = visibleColumns.some(c => c.aggregate !== undefined);
    if (!hasAggregates) return null;
    return buildAggregateRow({ keyPrefix: 'footer-totals', rows: fullRows, label: footerLabel, isFooter: true });
  }, [showFooterTotals, visibleColumns, fullRows, footerLabel, buildAggregateRow]);

  // The body rows to render in the non-virtual path (grouped or flat).
  const bodyRows = groupingActive ? groupedRows?.items : nonVirtualRows;

  const estimatedRowHeight =
    density === 'compact' ? 44 : density === 'comfortable' ? 60 : 52;
  const estimatedItemSize = expandableRowRender ? estimatedRowHeight + 120 : estimatedRowHeight;

  const flashListSizingProps = useMemo(() => ({ estimatedItemSize }), [estimatedItemSize]);
  const flashListExtraData = useMemo(() => ({
    expandedRows,
    selectedRows: rowSelection.selectedRows,
    columnWidths,
    visibleColumns: visibleColumns.map(col => col.key)
  }), [columnWidths, expandedRows, rowSelection.selectedRows, visibleColumns]);

  const renderVirtualRow = useCallback(({ item, index }: { item: T; index: number }) => {
    const { element } = buildRow(item, index);
    return <React.Fragment>{element}</React.Fragment>;
  }, [buildRow]);

  const minWidthValue = fullWidth ? undefined : 800;
  const resolvedHeight = height ?? (virtual ? 420 : undefined);

  const tableBorderStyle = {
    height: resolvedHeight,
    borderWidth: showOuterBorder ? outerBorderWidth : 0,
    borderColor: outerBorderColor || theme.colors.gray[3],
    borderRadius: showOuterBorder ? 8 : 0
  } as const;

  // Minimum comfortable width for the current column set. When the container is
  // narrower than this the table scrolls horizontally instead of squeezing
  // columns (which forces content to wrap); when it's wider the table grows to
  // fill (fullWidth). Explicit `minWidth`/numeric `width` win, otherwise a
  // sensible per-column default is used.
  const scrollMinWidth = useMemo(() => {
    const widthFor = (c: DataTableColumn<T>) => {
      if (c.minWidth) return c.minWidth;
      const w = columnWidths[c.key] ?? c.width;
      return typeof w === 'number' ? w : DEFAULT_COLUMN_WIDTH;
    };
    let total =
      (selectable ? SELECT_COL_WIDTH : 0) +
      (expandableRowRender ? EXPAND_COL_WIDTH : 0) +
      (rowActions ? actionsColumnWidth : 0);
    total += visibleColumns.reduce((sum, c) => sum + widthFor(c), 0);
    return total;
  }, [selectable, expandableRowRender, rowActions, actionsColumnWidth, visibleColumns, columnWidths]);

  // Shared <Table> config for the (possibly split) header/body sections so a
  // pinned header renders identically to the scrolling body and stays aligned.
  const tableSectionProps = {
    striped: isStriped,
    withTableBorder: variant === 'bordered',
    withRowBorders: variant !== 'default',
    verticalSpacing: (density === 'compact' ? 'xs' : density === 'comfortable' ? 'lg' : 'sm') as 'xs' | 'lg' | 'sm',
    fullWidth,
    // ARIA rowgroup so the grid > rowgroup > row > gridcell tree is valid (web).
    ...(web ? { role: 'rowgroup' } : {}),
  };
  // When a fixed height is set on a non-virtual table, pin the header and let
  // the body scroll vertically within the remaining space.
  const bodyScrollsVertically = !virtual && resolvedHeight != null;

  if (loading) {
    return (
      <View style={[{ overflow: 'hidden' }, fullWidth && { width: '100%' }, getSpacingStyles(spacingProps), style]} {...otherProps}>
        {renderHeader()}

        <Table
          striped={isStriped}
          withTableBorder={variant === 'bordered'}
          withRowBorders={variant !== 'default'}
          verticalSpacing={density === 'compact' ? 'xs' : density === 'comfortable' ? 'lg' : 'sm'}
          fullWidth={fullWidth}
        >
          <TableTr style={{ backgroundColor: theme.colors.gray[0] }}>
            {selectable && (
              <TableTh w={50}>
                <View style={{ width: 20, height: 20, backgroundColor: theme.colors.gray[2], borderRadius: 4 }} />
              </TableTh>
            )}
            {expandableRowRender && (
              <TableTh w={50}>
                <View style={{ width: 20, height: 20, backgroundColor: theme.colors.gray[2], borderRadius: 4 }} />
              </TableTh>
            )}
            {visibleColumns.map(column => (
              <TableTh key={column.key} w={column.width || columnWidths[column.key]} minWidth={column.minWidth}>
                <View
                  style={{
                    height: 20,
                    backgroundColor: theme.colors.gray[2],
                    borderRadius: 4,
                    width: '70%'
                  }}
                />
              </TableTh>
            ))}
          </TableTr>

          {Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => (
            <TableTr key={index} hoverable={hoverHighlight}>
              {selectable && (
                <TableTd>
                  <View style={{ width: 20, height: 20, backgroundColor: theme.colors.gray[1], borderRadius: 4 }} />
                </TableTd>
              )}
              {expandableRowRender && (
                <TableTd>
                  <View style={{ width: 20, height: 20, backgroundColor: theme.colors.gray[1], borderRadius: 4 }} />
                </TableTd>
              )}
              {visibleColumns.map(column => (
                <TableTd key={column.key}>
                  <View
                    style={{
                      height: 16,
                      backgroundColor: theme.colors.gray[1],
                      borderRadius: 4,
                      width: `${Math.random() * 60 + 40}%`,
                      opacity: 0.8 - index * 0.1
                    }}
                  />
                </TableTd>
              ))}
            </TableTr>
          ))}
        </Table>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[{ overflow: 'hidden' }, fullWidth && { width: '100%' }, getSpacingStyles(spacingProps), style]} {...otherProps}>
        {renderHeader()}

        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.error[0],
            borderRadius: theme.radii.lg,
            borderWidth: 1,
            borderColor: theme.colors.error[2]
          }}
        >
          <Icon name="error" size={32} color={theme.colors.error[5]} style={{ marginBottom: 12 }} />
          <Text variant="h6" color={theme.colors.error[7]} style={{ marginBottom: 8 }}>
            Error Loading Data
          </Text>
          <Text variant="p" color="muted" style={{ textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  const FlashList = virtual ? resolveFlashList() : null;

  return (
    <View style={[{ overflow: 'hidden' }, fullWidth && { width: '100%' }, getSpacingStyles(spacingProps), style]} {...otherProps}>
      {renderHeader()}

      {virtual && FlashList ? (
        <View style={[{ width: '100%', overflow: 'hidden' }, tableBorderStyle]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={Platform.OS === 'web'}
            contentContainerStyle={minWidthValue ? { minWidth: minWidthValue } : undefined}
          >
            <View style={{ flex: 1 }} {...gridA11y}>
              <Table {...(web ? { role: 'rowgroup' } : {})}
                striped={isStriped}
                withTableBorder={variant === 'bordered'}
                withRowBorders={variant !== 'default'}
                verticalSpacing={
                  density === 'compact' ? 'xs' : density === 'comfortable' ? 'lg' : 'sm'
                }
                fullWidth={fullWidth}
              >
                {headerRow}
                {filterRow}
              </Table>

              {processedData.length === 0 ? (
                <Table
                  striped={isStriped}
                  withTableBorder={variant === 'bordered'}
                  withRowBorders={variant !== 'default'}
                  verticalSpacing={
                    density === 'compact' ? 'xs' : density === 'comfortable' ? 'lg' : 'sm'
                  }
                  fullWidth={fullWidth}
                >
                  {emptyStateRow}
                </Table>
              ) : (
                <FlashList
                  data={processedData}
                  keyExtractor={(item: T, index: number) => String(getRowId(item, index))}
                  renderItem={renderVirtualRow}
                  {...(flashListSizingProps as Record<string, unknown>)}
                  extraData={flashListExtraData}
                  contentContainerStyle={{ flexGrow: 1 }}
                  showsVerticalScrollIndicator={Platform.OS === 'web'}
                />
              )}
            </View>
          </ScrollView>
        </View>
      ) : (
        <View style={[{ width: '100%', overflow: 'hidden' }, tableBorderStyle]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={Platform.OS === 'web'}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* minWidth floors the table at its comfortable width so columns
                don't squeeze (the ScrollView scrolls instead); flexGrow lets it
                stretch to fill wider containers when fullWidth. */}
            <View ref={gridRef} style={{ minWidth: scrollMinWidth, flexGrow: fullWidth ? 1 : 0 }} {...gridA11y}>
              {/* Header is its own <Table> so it stays pinned above the body. */}
              <Table {...tableSectionProps}>{headerRow}{filterRow}</Table>

              {processedData.length === 0 ? (
                <Table {...tableSectionProps}>{emptyStateRow}</Table>
              ) : bodyScrollsVertically ? (
                <ScrollView
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={Platform.OS === 'web'}
                >
                  <Table {...tableSectionProps}>{bodyRows}</Table>
                </ScrollView>
              ) : (
                <Table {...tableSectionProps}>{bodyRows}</Table>
              )}

              {/* Grand-total footer row (renders below the body, aligned to columns). */}
              {footerRow && processedData.length > 0 && (
                <Table {...tableSectionProps}>{footerRow}</Table>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Pagination footer — fully delegated to the Pagination component
          (page buttons, "X-Y of N" total, and rows-per-page size changer).
          Hidden while grouping, which renders every group across all pages. */}
      {pagination && onPaginationChange && !groupingActive && (
        <View style={{
          marginTop: DESIGN_TOKENS.spacing.xl,
          width: '100%',
          paddingTop: DESIGN_TOKENS.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.gray[2]
        }}>
          <Pagination
            current={pagination.page}
            total={Math.max(1, Math.ceil(totalFiltered / pagination.pageSize))}
            onChange={(page) => onPaginationChange({ ...pagination, page })}
            showTotal
            totalItems={totalFiltered}
            pageSize={pagination.pageSize}
            showSizeChanger={showRowsPerPageControl}
            pageSizeOptions={rowsPerPageOptions}
            onPageSizeChange={(size) => {
              if (size === pagination.pageSize) return;
              // Reset to the first page for clarity when page size changes.
              onPaginationChange({ ...pagination, page: 1, pageSize: size });
            }}
            {...paginationProps}
          />
        </View>
      )}
    </View>
  );
};

export default DataTable;
