import React, { useCallback, useId, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform/flags';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { VisibilityProps } from '../../core/types/base';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { warnOnce } from '../../core/utils/logger';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { Pagination } from '../Pagination';
import { Table } from '../Table';
import { AdvancedFilterControl } from './AdvancedFilterControl';
import { downloadCsv } from './exportCsv';
import { useColumnLayout } from './hooks/useColumnLayout';
import { useColumnReorder } from './hooks/useColumnReorder';
import { useColumnResize } from './hooks/useColumnResize';
import { useGridNavigation } from './hooks/useGridNavigation';
import { useRowSelection } from './hooks/useRowSelection';
import { useStickyColumns } from './hooks/useStickyColumns';
import { useTableData } from './hooks/useTableData';
import { useTableFilters } from './hooks/useTableFilters';
import { useCellEditing } from './hooks/useCellEditing';
import { useExpandedRows } from './hooks/useExpandedRows';
import { DataTableFilterRow, DataTableHeaderRow, type HeaderSharedProps } from './parts/DataTableHeader';
import { DataTableRow, type RowSharedProps } from './parts/DataTableRow';
import { DataTableAggregateRow, DataTableEmptyRow, DataTableError, DataTableSkeleton } from './parts/DataTableStates';
import { DataTableToolbar } from './parts/DataTableToolbar';
import {
  ESTIMATED_ROW_HEIGHT,
  TABLE_VERTICAL_SPACING,
  sideBorderStyle,
  useDataTableColors,
} from './parts/shared';
import {
  buildCsv,
  DEFAULT_COLUMN_WIDTH,
  EXPAND_COL_WIDTH,
  filterData,
  getColumnFilterType,
  getValue,
  nextSort,
  SELECT_COL_WIDTH,
  sortData,
} from './utils';
import type { DataTableColumn, DataTableFilter, DataTableProps, DataTableRowId } from './types';

export type {
  DataTableProps,
  DataTableColumn,
  DataTableFilter,
  DataTableSort,
  DataTablePagination,
  SortDirection,
  FilterType,
  ColumnDataType,
} from './types';

interface FlashListLikeProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  estimatedItemSize?: number;
  extraData?: unknown;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
}
type FlashListComponent = <T>(props: FlashListLikeProps<T>) => React.ReactElement | null;

/**
 * Resolved lazily so apps that never render a virtual DataTable neither bundle
 * @shopify/flash-list nor need it installed. Without it, `virtual` quietly
 * downgrades to the plain (non-virtualized) table rendering below.
 */
const resolveFlashList = () =>
  resolveOptionalModule<FlashListComponent>('@shopify/flash-list', {
    accessor: (mod: { FlashList?: FlashListComponent } | null) => mod?.FlashList,
    devWarning:
      '@shopify/flash-list is not installed; <DataTable virtual> renders every row without virtualization instead.',
  });

const defaultGetRowId = (_row: unknown, index: number): DataTableRowId => index;
const NO_EXPANDED: DataTableRowId[] = [];
const NO_KEYS: string[] = [];
const NO_SORT: NonNullable<DataTableProps['sortBy']> = [];
const NO_FILTERS: DataTableFilter[] = [];
const NO_BULK_ACTIONS: NonNullable<DataTableProps['bulkActions']> = [];
const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];
/** Default viewport height of a virtualized table (the list must be bounded to virtualize). */
const DEFAULT_VIRTUAL_HEIGHT = 420;

function DataTableInner<T>(props: DataTableProps<T>, ref: React.ForwardedRef<View>) {
  const {
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
    sortBy = NO_SORT,
    onSortChange,
    filters = NO_FILTERS,
    onFilterChange,
    showColumnFilters = false,
    pagination,
    onPaginationChange,
    paginationProps,
    manualPagination = false,
    selectable = false,
    selectedRows: controlledSelectedRows,
    onSelectionChange,
    getRowId = defaultGetRowId,
    onRowClick,
    editMode = false,
    onEditModeChange,
    onCellEdit,
    bulkActions = NO_BULK_ACTIONS,
    variant = 'default',
    striped: stripedProp,
    density = 'normal',
    h: frameHeight,
    virtual = false,
    style,
    testID,
    hoverHighlight: hoverHighlightProp,
    enhancedHover,
    hoverColor,
    headerBackgroundColor,
    enhancedLoading = true,
    enhancedEmptyState = true,
    enhancedSelection = true,
    borderColor,
    enableColumnResizing = false,
    rowFeatureToggle,
    initialHiddenColumns = NO_KEYS,
    onColumnVisibilityChange,
    showColumnVisibilityManager = true,
    rowsPerPageOptions = DEFAULT_PAGE_SIZES,
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
    initialExpandedRows = NO_EXPANDED,
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
    columnOrder,
    onColumnOrderChange,
    groupBy,
    groupsDefaultExpanded = true,
    renderGroupHeader,
    showFooterTotals = false,
    footerLabel = 'Total',
    ...rest
  } = props;

  if (enhancedHover !== undefined) {
    warnOnce('DataTable.enhancedHover', 'DataTable: `enhancedHover` is deprecated. Use `hoverHighlight`.');
  }
  const hoverHighlight = hoverHighlightProp ?? enhancedHover ?? true;

  const { styleProps } = extractStyleProps(rest);
  const theme = useTheme();
  const isStriped = stripedProp ?? variant === 'striped';
  const colors = useDataTableColors({
    headerBackgroundColor,
    hoverColor,
    borderColor,
    rowBorderColor,
    columnBorderColor,
    outerBorderColor,
  });

  // --- Search & filters ------------------------------------------------------
  const filtersState = useTableFilters({ searchValue: controlledSearchValue, onSearchChange, filters, onFilterChange });
  const { searchValue, activeFilters, getColumnFilter, updateFilter, clearFilter } = filtersState;

  // --- Columns ---------------------------------------------------------------
  const layout = useColumnLayout({
    id,
    columns,
    initialHiddenColumns,
    onColumnVisibilityChange,
    columnOrder,
    onColumnOrderChange,
  });
  const { visibleColumns, columnWidths } = layout;

  // --- Rows ------------------------------------------------------------------
  const groupingActive = !!groupBy && !virtual;
  const tableData = useTableData({
    data,
    columns,
    activeFilters,
    searchValue,
    sortBy,
    rowFeatureToggle,
    manualPagination,
    pagination,
    onPaginationChange,
    groupBy,
    groupingActive,
    groupsDefaultExpanded,
  });
  const { fullRows, processedData, totalFiltered, groups, flatRows } = tableData;

  const allRowIds = useMemo(() => processedData.map((row, index) => getRowId(row, index)), [processedData, getRowId]);

  // Row selection with shift-click range selection; persists across pages.
  const selection = useRowSelection({
    allRowIds,
    selectedRows: controlledSelectedRows,
    onSelectionChange,
    persistAcrossPagination: true,
  });

  const expansion = useExpandedRows({
    expandedRows: controlledExpandedRows,
    initialExpandedRows,
    onExpandedRowsChange,
    allowMultipleExpanded,
  });

  const handleSort = useLatestCallback((columnKey: string) => onSortChange?.(nextSort(sortBy, columnKey)));

  // --- Editing / activation ----------------------------------------------------
  const editing = useCellEditing({ columns, onCellEdit });
  const { editingCell, editValue } = editing;

  // Press / Enter / Space on a body cell: edit it in edit mode, else fire the row click.
  const activateCell = useLatestCallback((rowIndex: number, columnKey: string) => {
    const row = flatRows[rowIndex];
    if (row === undefined) return;
    const column = columns.find((col) => col.key === columnKey);
    if (editMode && column?.editable) editing.beginEdit(rowIndex, columnKey, getValue(row, column.accessor));
    else onRowClick?.(row, rowIndex);
  });

  // --- Accessibility & keyboard grid navigation -------------------------------
  // An interactive table (row click / edit mode) is an ARIA grid (treegrid with
  // expandable rows) with roving-tabindex cell navigation; otherwise it is a
  // plain table. Rows are 1-indexed with the header (and filter) rows first.
  const interactive = !!onRowClick || editMode;
  const headerRowCount = showColumnFilters ? 2 : 1;
  const helperColsBefore = (selectable ? 1 : 0) + (expandableRowRender ? 1 : 0);
  const totalColCount = helperColsBefore + visibleColumns.length + (rowActions ? 1 : 0);
  // Rows on earlier pages (client or server paging); grouping shows every row on one page.
  const pageOffset = pagination && !groupingActive ? (pagination.page - 1) * pagination.pageSize : 0;
  const reactId = useId();
  const gridDomId = id ? `datatable-${id}` : `datatable-${reactId.replace(/:/g, '')}`;

  const nav = useGridNavigation({
    enabled: isWeb && interactive && !virtual && !groupingActive,
    rowCount: flatRows.length,
    columnCount: visibleColumns.length,
    onActivate: (row, col) => {
      const column = visibleColumns[col];
      if (column) activateCell(row, column.key);
    },
  });

  // --- Layout helpers ------------------------------------------------------------
  const sticky = useStickyColumns({
    visibleColumns,
    pinnedColumns: layout.pinnedColumns,
    columnWidths,
    leadingWidth: (selectable ? SELECT_COL_WIDTH : 0) + (expandableRowRender ? EXPAND_COL_WIDTH : 0),
    trailingWidth: rowActions ? actionsColumnWidth : 0,
    dividerColor: colors.strongBorder,
  });

  /**
   * Width of the hairline between rows. `showRowDividers` decides when it is
   * set; otherwise the `bordered` variant implies dividers. `rowBorderWidth`
   * is the explicit override and is honored even at 0 (to switch them off).
   */
  const rowDividerWidth = rowBorderWidth ?? ((showRowDividers ?? variant === 'bordered') ? 1 : 0);

  /**
   * Vertical rule for a cell, opt-in via `columnBorderWidth`, drawn on every
   * section so it runs the full height of the table. Skipped on the trailing
   * column (it would double up with the outer border) unless an actions column
   * follows. `colIdx` is the index within `visibleColumns`; -1 for the leading
   * helper cells (select / expand), which are never last.
   */
  const columnDividerStyle = useCallback(
    (colIdx: number): ViewStyle | null => {
      if (!columnBorderWidth) return null;
      if (colIdx === visibleColumns.length - 1 && !rowActions) return null;
      return {
        borderEndWidth: columnBorderWidth,
        borderEndColor: colors.columnBorder,
        ...sideBorderStyle('end', columnBorderStyle),
      };
    },
    [columnBorderWidth, colors.columnBorder, columnBorderStyle, rowActions, visibleColumns.length]
  );

  const resize = useColumnResize<T>({
    enabled: enableColumnResizing,
    columnWidths,
    setColumnWidths: layout.setColumnWidths,
  });
  const visibleKeys = useMemo(() => visibleColumns.map((c) => c.key), [visibleColumns]);
  const reorder = useColumnReorder({
    enabled: enableColumnReordering,
    columnKeys: visibleKeys,
    reorderColumn: layout.reorderColumn,
  });

  // --- Filter controls ---------------------------------------------------------
  const [openFilterColumn, setOpenFilterColumn] = useState<string | null>(null);
  const handleFilterOpenChange = useCallback((columnKey: string, opened: boolean) => {
    setOpenFilterColumn((current) => (opened ? columnKey : current === columnKey ? null : current));
  }, []);

  const renderFilterControl = useCallback(
    (column: DataTableColumn<T>, showOperators: boolean, autoFocus: boolean) => (
      <AdvancedFilterControl
        column={{ ...column, filterType: getColumnFilterType(column) }}
        currentFilter={getColumnFilter(column.key)}
        data={data}
        showOperators={showOperators}
        autoFocus={autoFocus}
        onFilterChange={(filter) => {
          if (filter) updateFilter(filter.column, filter.value, filter.operator);
          else clearFilter(column.key);
        }}
      />
    ),
    [getColumnFilter, data, updateFilter, clearFilter]
  );

  const hideColumn = useCallback(
    (columnKey: string) => layout.setHiddenColumns((hidden) => (hidden.includes(columnKey) ? hidden : [...hidden, columnKey])),
    [layout]
  );

  // --- Export ----------------------------------------------------------------------
  // The current view (filtered + sorted, all pages) with the visible columns. On
  // web it downloads a file; `onExport` receives the CSV instead (the only path
  // on native).
  const handleExport = useLatestCallback(() => {
    const rows = manualPagination
      ? data
      : sortData(filterData(data, activeFilters, columns, searchValue, rowFeatureToggle), sortBy, columns);
    const csv = buildCsv(rows, visibleColumns);
    if (onExport) onExport(csv, rows);
    else downloadCsv(csv, exportFileName);
  });

  // --- Shared row / header props -------------------------------------------------
  const onToggleRow = selection.toggleRow;

  const rowShared = useMemo<RowSharedProps<T>>(
    () => ({
      columns: visibleColumns,
      columnWidths,
      colors,
      density,
      striped: isStriped,
      hoverHighlight,
      enhancedSelection,
      rowDividerWidth,
      rowBorderStyle,
      selectable,
      rowFeatureToggle,
      expandableRowRender,
      expandIcon,
      collapseIcon,
      rowActions,
      actionsColumnWidth,
      cellTextProps,
      columnDividerStyle,
      getStickyCellStyle: sticky.getStickyCellStyle,
      grid: interactive,
      interactiveCells: interactive,
      helperColsBefore,
      totalColCount,
      firstRowAriaIndex: pageOffset + headerRowCount + 1,
      rowNumberOffset: pageOffset,
      navEnabled: nav.enabled,
      getCellRef: nav.getCellRef,
      onCellKeyDown: nav.onCellKeyDown,
      onCellFocus: nav.onCellFocus,
      onToggleRow,
      onToggleExpand: expansion.toggle,
      onActivateCell: activateCell,
      onEditChange: editing.setEditValue,
      onEditCommit: editing.commitEdit,
      onEditCancel: editing.cancelEdit,
    }),
    [
      visibleColumns,
      columnWidths,
      colors,
      density,
      isStriped,
      hoverHighlight,
      enhancedSelection,
      rowDividerWidth,
      rowBorderStyle,
      selectable,
      rowFeatureToggle,
      expandableRowRender,
      expandIcon,
      collapseIcon,
      rowActions,
      actionsColumnWidth,
      cellTextProps,
      columnDividerStyle,
      sticky.getStickyCellStyle,
      interactive,
      helperColsBefore,
      totalColCount,
      pageOffset,
      headerRowCount,
      nav.enabled,
      nav.getCellRef,
      nav.onCellKeyDown,
      nav.onCellFocus,
      onToggleRow,
      expansion.toggle,
      activateCell,
      editing.setEditValue,
      editing.commitEdit,
      editing.cancelEdit,
    ]
  );

  const headerShared = useMemo<HeaderSharedProps<T>>(
    () => ({
      columns: visibleColumns,
      columnWidths,
      colors,
      selectable,
      expandable: !!expandableRowRender,
      hasActions: !!rowActions,
      actionsColumnWidth,
      helperColsBefore,
      grid: interactive,
      columnDividerStyle,
      sticky,
      getColumnFilter,
    }),
    [
      visibleColumns,
      columnWidths,
      colors,
      selectable,
      expandableRowRender,
      rowActions,
      actionsColumnWidth,
      helperColsBefore,
      interactive,
      columnDividerStyle,
      sticky,
      getColumnFilter,
    ]
  );

  // --- Body rows ---------------------------------------------------------------------
  const activeRow = nav.enabled && visibleColumns.length ? Math.floor(nav.activeIndex / visibleColumns.length) : -1;
  const activeCol = nav.enabled && visibleColumns.length ? nav.activeIndex % visibleColumns.length : -1;

  const renderRow = useCallback(
    (row: T, rowIndex: number, key: React.Key, rowId: DataTableRowId = getRowId(row, rowIndex)) => {
      const isEditingRow = editingCell?.row === rowIndex;
      return (
        <DataTableRow<T>
          key={key}
          shared={rowShared}
          row={row}
          rowIndex={rowIndex}
          rowId={rowId}
          selected={selection.selectedSet.has(rowId)}
          expanded={expansion.expandedSet.has(rowId)}
          activeCol={rowIndex === activeRow ? activeCol : -1}
          editingColumn={isEditingRow ? editingCell.column : null}
          editValue={isEditingRow ? editValue : undefined}
        />
      );
    },
    [rowShared, getRowId, selection.selectedSet, expansion.expandedSet, activeRow, activeCol, editingCell, editValue]
  );

  const aggregateRowProps = useMemo(
    () => ({
      colors,
      density,
      columns: visibleColumns,
      selectable,
      expandable: !!expandableRowRender,
      hasActions: !!rowActions,
      actionsColumnWidth,
      columnDividerStyle,
      grid: interactive,
    }),
    [colors, density, visibleColumns, selectable, expandableRowRender, rowActions, actionsColumnWidth, columnDividerStyle, interactive]
  );

  const bodyRows = useMemo(() => {
    if (virtual) return null;
    if (!groupingActive || !groups) {
      return processedData.map((row, rowIndex) => {
        const rowId = allRowIds[rowIndex];
        return renderRow(row, rowIndex, String(rowId), rowId);
      });
    }
    // Grouped body: interleave group-header rows with each group's (optionally
    // collapsed) rows, keeping a running index aligned with `flatRows`.
    const items: React.ReactNode[] = [];
    let flatIndex = 0;
    groups.forEach((group) => {
      const expanded = tableData.isGroupExpanded(group.key);
      const toggle = () => tableData.toggleGroup(group.key);
      const label = renderGroupHeader
        ? renderGroupHeader({ value: group.value, rows: group.rows, count: group.rows.length, expanded, toggle })
        : `${group.value == null || group.value === 'undefined' ? '—' : String(group.value)} (${group.rows.length})`;
      items.push(
        <DataTableAggregateRow<T>
          key={`group-${group.key}`}
          {...aggregateRowProps}
          rows={group.rows}
          label={label}
          expanded={expanded}
          onToggle={toggle}
        />
      );
      if (expanded) {
        group.rows.forEach((row) => {
          const idx = flatIndex;
          flatIndex += 1;
          items.push(renderRow(row, idx, `grp-${group.key}-${idx}`));
        });
      }
    });
    return items;
  }, [
    virtual,
    groupingActive,
    groups,
    processedData,
    allRowIds,
    renderRow,
    tableData,
    renderGroupHeader,
    aggregateRowProps,
  ]);

  const footerRow =
    showFooterTotals && visibleColumns.some((c) => c.aggregate !== undefined) ? (
      <DataTableAggregateRow<T> {...aggregateRowProps} rows={fullRows} label={footerLabel} isFooter />
    ) : null;

  const renderVirtualItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderRow(item, index, index),
    [renderRow]
  );
  const keyExtractor = useCallback((item: T, index: number) => String(getRowId(item, index)), [getRowId]);

  // --- Frame ---------------------------------------------------------------------------
  const resolvedHeight = frameHeight ?? (virtual ? DEFAULT_VIRTUAL_HEIGHT : undefined);
  const borderWidth = showOuterBorder ? outerBorderWidth : 0;
  const frameStyle: ViewStyle = {
    height: resolvedHeight,
    borderWidth,
    borderColor: colors.outerBorder,
    borderRadius: showOuterBorder ? 8 : 0,
  };

  // Minimum comfortable width for the current column set. When the container is
  // narrower the table scrolls horizontally instead of squeezing columns; when
  // it's wider the table grows to fill (fullWidth).
  const scrollMinWidth = useMemo(() => {
    const widthFor = (c: DataTableColumn<T>) => {
      if (c.minWidth) return c.minWidth;
      const w = columnWidths[c.key] ?? c.width;
      return typeof w === 'number' ? w : DEFAULT_COLUMN_WIDTH;
    };
    return (
      (selectable ? SELECT_COL_WIDTH : 0) +
      (expandableRowRender ? EXPAND_COL_WIDTH : 0) +
      (rowActions ? actionsColumnWidth : 0) +
      visibleColumns.reduce((sum, c) => sum + widthFor(c), 0)
    );
  }, [selectable, expandableRowRender, rowActions, actionsColumnWidth, visibleColumns, columnWidths]);

  // Shared <Table> config for the (possibly split) header/body sections so a
  // pinned header renders identically to the scrolling body and stays aligned.
  const sectionProps = {
    striped: isStriped,
    withTableBorder: variant === 'bordered',
    withRowBorders: variant !== 'default',
    verticalSpacing: TABLE_VERTICAL_SPACING[density],
    fullWidth,
    role: 'rowgroup' as const,
  };

  const gridA11y = {
    id: isWeb ? gridDomId : undefined,
    role: interactive ? (expandableRowRender ? ('treegrid' as const) : ('grid' as const)) : ('table' as const),
    'aria-label': ariaLabel,
    'aria-busy': loading || undefined,
    ...(isWeb ? { 'aria-rowcount': totalFiltered + headerRowCount, 'aria-colcount': totalColCount } : null),
  };

  const rootStyle = [styles.root, fullWidth ? styles.fullWidth : null, resolveStyleProps(styleProps, theme), style];

  const toolbar = (
    <DataTableToolbar<T>
      colors={colors}
      data={data}
      columns={columns}
      selectedRows={selection.selectedRows}
      bulkActions={bulkActions}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      searchValue={searchValue}
      onSearchChange={filtersState.setSearchValue}
      activeFilters={activeFilters}
      getColumnFilter={getColumnFilter}
      onClearFilters={filtersState.clearAllFilters}
      onRemoveFilter={clearFilter}
      renderFilterControl={renderFilterControl}
      editMode={editMode}
      onEditModeChange={onEditModeChange}
      exportable={exportable}
      onExport={handleExport}
      showColumnVisibilityManager={showColumnVisibilityManager}
      hiddenSet={layout.hiddenSet}
      setHiddenColumns={layout.setHiddenColumns}
    />
  );

  if (loading) {
    return (
      <View ref={ref} testID={testID} style={rootStyle} aria-busy>
        {toolbar}
        <Table {...sectionProps} role="table">
          <DataTableSkeleton<T>
            colors={colors}
            columns={visibleColumns}
            columnWidths={columnWidths}
            selectable={selectable}
            expandable={!!expandableRowRender}
            rowCount={pagination?.pageSize || 5}
            hoverHighlight={hoverHighlight}
            enhanced={enhancedLoading}
          />
        </Table>
      </View>
    );
  }

  if (error) {
    return (
      <View ref={ref} testID={testID} style={rootStyle}>
        {toolbar}
        <DataTableError message={error} />
      </View>
    );
  }

  const headerSection = (
    <Table {...sectionProps}>
      <DataTableHeaderRow<T>
        shared={headerShared}
        sortBy={sortBy}
        onSort={handleSort}
        onSortChange={onSortChange}
        openFilterColumn={openFilterColumn}
        onFilterOpenChange={handleFilterOpenChange}
        renderFilterControl={renderFilterControl}
        canHideColumn={visibleColumns.length > 1}
        onHideColumn={hideColumn}
        setColumnPin={layout.setColumnPin}
        enableColumnReordering={enableColumnReordering}
        reorder={reorder}
        moveColumn={layout.moveColumn}
        enableColumnResizing={enableColumnResizing}
        resize={resize}
        headerTextProps={headerTextProps}
        selection={selection}
      />
      {showColumnFilters && (
        <DataTableFilterRow<T> shared={headerShared} data={data} ariaRowIndex={2} onCommit={updateFilter} />
      )}
    </Table>
  );

  const emptyBody = (
    <Table {...sectionProps}>
      <DataTableEmptyRow colors={colors} emptyMessage={emptyMessage} enhanced={enhancedEmptyState} />
    </Table>
  );

  const FlashList = virtual ? resolveFlashList() : null;
  // The virtual path keeps its historical 800px floor when not full-width.
  const scrollContentStyle = [styles.grow, virtual && !fullWidth ? styles.fixedMinWidth : null];
  // Both paths bound the grid to the frame's height: the horizontal ScrollView's
  // content stretches to it (flexGrow), so a fixed-height body — and the
  // virtualized list — get a finite viewport instead of their full content height.
  const bodyScrollsVertically = resolvedHeight != null;

  return (
    <View ref={ref} testID={testID} style={rootStyle}>
      {toolbar}

      <View style={[styles.frame, frameStyle]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={isWeb} contentContainerStyle={scrollContentStyle}>
          {/* minWidth floors the table at its comfortable width so columns
              don't squeeze (the ScrollView scrolls instead); flexGrow lets it
              stretch to fill wider containers when fullWidth. */}
          <View style={[{ minWidth: scrollMinWidth }, fullWidth ? styles.grow : null]} {...gridA11y}>
            {/* Header is its own <Table> so it stays pinned above the body. */}
            {headerSection}

            {processedData.length === 0 ? (
              emptyBody
            ) : virtual && FlashList ? (
              <View style={styles.fill} testID={testID ? `${testID}-virtual-viewport` : undefined}>
                <FlashList
                  data={processedData}
                  keyExtractor={keyExtractor}
                  renderItem={renderVirtualItem}
                  estimatedItemSize={
                    expandableRowRender ? ESTIMATED_ROW_HEIGHT[density] + 120 : ESTIMATED_ROW_HEIGHT[density]
                  }
                  extraData={rowShared}
                  contentContainerStyle={styles.flashContent}
                  showsVerticalScrollIndicator={isWeb}
                />
              </View>
            ) : bodyScrollsVertically ? (
              <ScrollView style={styles.fill} showsVerticalScrollIndicator={isWeb}>
                <Table {...sectionProps}>
                  {virtual ? processedData.map((row, i) => renderRow(row, i, String(allRowIds[i]), allRowIds[i])) : bodyRows}
                </Table>
              </ScrollView>
            ) : (
              <Table {...sectionProps}>{bodyRows}</Table>
            )}

            {/* Grand-total footer row (renders below the body, aligned to columns). */}
            {footerRow && processedData.length > 0 && <Table {...sectionProps}>{footerRow}</Table>}
          </View>
        </ScrollView>
      </View>

      {/* Pagination footer — fully delegated to the Pagination component.
          Hidden while grouping, which renders every group across all pages. */}
      {pagination && onPaginationChange && !groupingActive && (
        <View
          style={[
            styles.paginationBar,
            {
              marginTop: resolveSpacing(theme, 'xl'),
              paddingTop: resolveSpacing(theme, 'md'),
              borderTopColor: colors.hairline,
            },
          ]}
        >
          <Pagination
            value={pagination.page}
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
}

const DataTableBase = factory<{ props: DataTableProps<unknown>; ref: View }>(DataTableInner, {
  displayName: 'DataTable',
});

/**
 * Feature-rich data table: sorting, filtering, search, pagination (client or
 * server), selection, inline editing, expandable rows, grouping & aggregates,
 * pinned / resizable / reorderable columns, CSV export and virtualization.
 * Forwards its ref to the root `View`.
 */
export const DataTable = DataTableBase as unknown as (<T>(
  props: DataTableProps<T> & VisibilityProps & React.RefAttributes<View>
) => React.ReactElement | null) & { displayName?: string };

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  fixedMinWidth: {
    minWidth: 800,
  },
  flashContent: {
    flexGrow: 1,
  },
  frame: {
    overflow: 'hidden',
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  paginationBar: {
    borderTopWidth: 1,
    width: '100%',
  },
  root: {
    overflow: 'hidden',
  },
});

export default DataTable;
