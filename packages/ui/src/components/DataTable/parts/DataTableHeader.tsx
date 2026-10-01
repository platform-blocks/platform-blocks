import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../../core/accessibility/a11yProps';
import { isWeb } from '../../../core/platform/flags';
import { webStyle } from '../../../core/platform/webStyle';
import { mergeSlotProps } from '../../../core/utils/mergeSlotProps';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { resolveFontSize, resolveSpacing } from '../../../core/theme/tokens';
import { useHover } from '../../../hooks/useHover/useHover';
import { Checkbox } from '../../Checkbox';
import { Icon } from '../../Icon';
import { Menu, MenuDivider, MenuDropdown, MenuItem, MenuLabel } from '../../Menu';
import { Popover } from '../../Popover';
import { TableTh, TableTr } from '../../Table';
import { Text, type TextProps } from '../../Text';
import { ColumnFilterInput } from '../ColumnFilterInput';
import { getColumnAlign, getColumnFilterType } from '../utils';
import type { DataTableColumn, DataTableFilter, DataTableSort, DataTableValue } from '../types';
import type { ColumnWidths, PinSide } from '../hooks/useColumnLayout';
import type { ColumnReorderState } from '../hooks/useColumnReorder';
import type { ColumnResizeHandlers } from '../hooks/useColumnResize';
import type { StickyColumns } from '../hooks/useStickyColumns';
import type { DataTableColors } from './shared';

/** Header-level configuration shared by the header and filter rows. */
export interface HeaderSharedProps<T> {
  columns: DataTableColumn<T>[];
  columnWidths: ColumnWidths;
  colors: DataTableColors;
  selectable: boolean;
  expandable: boolean;
  hasActions: boolean;
  actionsColumnWidth: number;
  helperColsBefore: number;
  /** Grid semantics (interactive table). */
  grid: boolean;
  columnDividerStyle: (colIdx: number) => ViewStyle | null;
  sticky: StickyColumns<T>;
  getColumnFilter: (columnKey: string) => DataTableFilter | undefined;
}

const JUSTIFY: Record<'left' | 'center' | 'right', ViewStyle['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const headerLabel = (column: DataTableColumn<unknown>): string | undefined =>
  typeof column.header === 'string' ? column.header : undefined;

interface HeaderCellProps<T> {
  shared: HeaderSharedProps<T>;
  column: DataTableColumn<T>;
  colIdx: number;
  sortBy: DataTableSort[];
  onSort: (columnKey: string) => void;
  onSortChange?: (sort: DataTableSort[]) => void;
  filterOpen: boolean;
  onFilterOpenChange: (columnKey: string, opened: boolean) => void;
  renderFilterControl: (column: DataTableColumn<T>, showOperators: boolean, autoFocus: boolean) => React.ReactNode;
  canHideColumn: boolean;
  onHideColumn: (columnKey: string) => void;
  setColumnPin: (columnKey: string, side: PinSide | null) => void;
  enableColumnReordering: boolean;
  reorder: ColumnReorderState;
  moveColumn: (columnKey: string, dir: -1 | 1) => void;
  isFirst: boolean;
  isLast: boolean;
  enableColumnResizing: boolean;
  showColumnMenu: boolean;
  resize: ColumnResizeHandlers<T>;
  headerTextProps?: Omit<TextProps, 'children'>;
}

function HeaderCell<T>({
  shared,
  column,
  colIdx,
  sortBy,
  onSort,
  onSortChange,
  filterOpen,
  onFilterOpenChange,
  renderFilterControl,
  canHideColumn,
  onHideColumn,
  setColumnPin,
  enableColumnReordering,
  reorder,
  moveColumn,
  isFirst,
  isLast,
  enableColumnResizing,
  showColumnMenu,
  resize,
  headerTextProps,
}: HeaderCellProps<T>) {
  const theme = useTheme();
  const { colors, sticky } = shared;
  const [hovered, hoverHandlers] = useHover();
  const [focusWithin, setFocusWithin] = useState(false);

  const label = headerLabel(column as DataTableColumn<unknown>);
  const align = getColumnAlign(column);
  const sort = sortBy.find((s) => s.column === column.key);
  const sortDirection = sort?.direction ?? null;
  const hasFilter = !!shared.getColumnFilter(column.key);
  // Column controls reveal on hover (web) but stay visible while in use —
  // an open filter, an active filter, or keyboard focus inside the header.
  const controlsVisible = !isWeb || hovered || focusWithin || filterOpen || hasFilter;
  const pinSide = sticky.effectiveSticky(column);
  const width = shared.columnWidths[column.key] || column.width;
  const ariaSort = sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none';
  // Sort indicator: stacked chevrons when unsorted, one chevron when sorted.
  const sortIcon = !sortDirection ? 'selector-vertical' : sortDirection === 'asc' ? 'chevron-up' : 'chevron-down';
  const menuIcon = (name: string) => <Icon name={name} size={14} color={colors.icon} decorative />;
  const labelText = (
    <Text
      {...mergeSlotProps(
        {
          variant: 'p' as const,
          fw: 'semibold' as const,
          numberOfLines: 1,
          ellipsizeMode: 'tail' as const,
          style: { color: colors.text, fontSize: resolveFontSize(theme, 'md') },
        },
        headerTextProps
      )}
    >
      {column.header}
    </Text>
  );

  return (
    <TableTh
      ref={enableColumnReordering && isWeb ? reorder.getHeaderRef(column.key) : undefined}
      w={width}
      miw={column.minWidth}
      maw={column.maxWidth}
      align={align}
      {...(isWeb
        ? {
            'aria-colindex': shared.helperColsBefore + colIdx + 1,
            ...(column.sortable ? { 'aria-sort': ariaSort } : null),
          }
        : null)}
      style={[
        styles.headerCell,
        shared.columnDividerStyle(colIdx),
        { backgroundColor: colors.headerBg },
        sticky.getStickyCellStyle(column, colors.headerBg, true),
        // Drop-target indicator while dragging a column over this header.
        reorder.dropTargetKey === column.key ? { borderStartWidth: 2, borderStartColor: colors.accent } : null,
        enableColumnReordering ? webStyle({ cursor: 'grab' }) : null,
      ]}
    >
      <View
        {...hoverHandlers}
        onFocus={() => setFocusWithin(true)}
        onBlur={() => setFocusWithin(false)}
        style={styles.headerContent}
      >
        {/* The label takes the remaining space (honouring the column's
            alignment) so the control cluster stays pinned to the end. */}
        {column.sortable ? (
          <Pressable
            onPress={() => onSort(column.key)}
            {...a11yProps({ role: 'button' })}
            style={[styles.headerLabel, { justifyContent: JUSTIFY[align] }]}
          >
            {labelText}
          </Pressable>
        ) : (
          <View style={[styles.headerLabel, { justifyContent: JUSTIFY[align] }]}>{labelText}</View>
        )}

        {/* The sort indicator stays visible off-hover so the active sort is
            never hidden. It repeats the label button's action, so it is hidden
            from assistive technology and skipped by Tab. */}
        {column.sortable && (
          <Pressable
            onPress={() => onSort(column.key)}
            {...a11yProps({ hidden: true })}
            {...(isWeb ? { tabIndex: -1 as const } : { accessible: false })}
            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Icon
              name={sortIcon}
              size={18}
              stroke={2.75}
              color={colors.icon}
              decorative
              style={{ opacity: sortDirection ? 1 : 0.5 }}
            />
          </Pressable>
        )}

        <View
          style={[styles.controls, { opacity: controlsVisible ? 1 : 0, pointerEvents: controlsVisible ? 'auto' : 'none' }]}
        >
          {column.filterable && (
            <Popover
              position="bottom-end"
              offset={{ mainAxis: 8 }}
              w={260}
              trapFocus
              opened={filterOpen}
              onChange={(opened: boolean) => onFilterOpenChange(column.key, opened)}
            >
              <Popover.Target>
                <Pressable
                  {...a11yProps({ role: 'button', label: `Filter ${label ?? 'column'}` })}
                  style={[styles.filterButton, { backgroundColor: hasFilter ? colors.selectedBg : 'transparent' }]}
                >
                  <Icon
                    name="filter"
                    size={16}
                    stroke={2.5}
                    color={hasFilter ? colors.accent : colors.icon}
                    variant={hasFilter ? 'filled' : 'outlined'}
                    decorative
                  />
                </Pressable>
              </Popover.Target>
              <Popover.Dropdown>
                <View style={{ gap: resolveSpacing(theme, 'xs') }}>
                  {renderFilterControl(column, true, filterOpen)}
                </View>
              </Popover.Dropdown>
            </Popover>
          )}
          {showColumnMenu && <Menu position="bottom-end" offset={4}>
            <MenuDropdown>
              <MenuLabel>{label ?? 'Column'}</MenuLabel>
              <MenuItem
                startSection={menuIcon('eye')}
                disabled={!canHideColumn}
                onPress={() => {
                  if (canHideColumn) onHideColumn(column.key);
                }}
              >
                Hide column
              </MenuItem>
              {column.sortable && (
                <MenuItem
                  startSection={menuIcon('chevron-up')}
                  onPress={() => onSortChange?.([{ column: column.key, direction: 'asc' }])}
                >
                  Sort ascending
                </MenuItem>
              )}
              {column.sortable && (
                <MenuItem
                  startSection={menuIcon('chevron-down')}
                  onPress={() => onSortChange?.([{ column: column.key, direction: 'desc' }])}
                >
                  Sort descending
                </MenuItem>
              )}
              {column.sortable && !!sort && (
                <MenuItem
                  startSection={menuIcon('x')}
                  onPress={() => onSortChange?.(sortBy.filter((s) => s.column !== column.key))}
                >
                  Clear sort
                </MenuItem>
              )}

              {sticky.stickyEnabled && (
                <>
                  <MenuDivider />
                  {pinSide !== 'left' && (
                    <MenuItem startSection={menuIcon('pin')} onPress={() => setColumnPin(column.key, 'left')}>
                      Pin left
                    </MenuItem>
                  )}
                  {pinSide !== 'right' && (
                    <MenuItem startSection={menuIcon('pin')} onPress={() => setColumnPin(column.key, 'right')}>
                      Pin right
                    </MenuItem>
                  )}
                  {pinSide && (
                    <MenuItem startSection={menuIcon('x')} onPress={() => setColumnPin(column.key, null)}>
                      Unpin
                    </MenuItem>
                  )}
                </>
              )}

              {enableColumnReordering && (
                <>
                  <MenuDivider />
                  <MenuItem
                    startSection={menuIcon('arrow-left')}
                    disabled={isFirst}
                    onPress={() => moveColumn(column.key, -1)}
                  >
                    Move left
                  </MenuItem>
                  <MenuItem
                    startSection={menuIcon('arrow-right')}
                    disabled={isLast}
                    onPress={() => moveColumn(column.key, 1)}
                  >
                    Move right
                  </MenuItem>
                </>
              )}
            </MenuDropdown>
            <Pressable
              {...a11yProps({ role: 'button', label: `${label ?? 'Column'} options` })}
              style={({ pressed }) => [styles.menuButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Icon name="dots" variant="filled" size={16} color={colors.icon} decorative />
            </Pressable>
          </Menu>}
        </View>
      </View>

      {enableColumnResizing && column.resizable && (
        <View
          onStartShouldSetResponder={() => true}
          onResponderGrant={(event) => resize.beginResize(event, column)}
          onResponderMove={resize.onResponderMove}
          onResponderRelease={resize.endResize}
          onResponderTerminate={resize.endResize}
          style={[styles.resizeHandle, webStyle({ cursor: 'col-resize', userSelect: 'none' })]}
        >
          <View style={[styles.resizeGrip, { backgroundColor: colors.strongBorder }]} />
        </View>
      )}
    </TableTh>
  );
}

export interface DataTableHeaderRowProps<T> extends Omit<HeaderCellProps<T>, 'column' | 'colIdx' | 'filterOpen' | 'isFirst' | 'isLast'> {
  openFilterColumn: string | null;
  selection: { isAllSelected: boolean; isIndeterminate: boolean; toggleAll: () => void };
}

/** The column header row: select-all, expand spacer, one header per column, actions spacer. */
export function DataTableHeaderRow<T>(props: DataTableHeaderRowProps<T>) {
  const { shared, openFilterColumn, selection } = props;
  const { colors, columns } = shared;
  const helperStyle = [styles.noBottomBorder, shared.columnDividerStyle(-1), { backgroundColor: colors.headerBg }];

  return (
    <TableTr
      {...(isWeb ? { 'aria-rowindex': 1 } : null)}
      style={{ backgroundColor: colors.headerBg, borderBottomWidth: 2, borderBottomColor: colors.strongBorder }}
    >
      {shared.selectable && (
        <TableTh w={50} {...(isWeb ? { 'aria-colindex': 1 } : null)} style={helperStyle}>
          <Checkbox
            size="sm"
            checked={selection.isAllSelected}
            indeterminate={selection.isIndeterminate}
            onChange={selection.toggleAll}
            accessibilityLabel="Select all rows"
          />
        </TableTh>
      )}

      {shared.expandable && (
        <TableTh
          w={50}
          aria-label="Expand"
          {...(isWeb ? { 'aria-colindex': shared.selectable ? 2 : 1 } : null)}
          style={helperStyle}
        />
      )}

      {columns.map((column, colIdx) => (
        <HeaderCell
          key={column.key}
          {...props}
          column={column}
          colIdx={colIdx}
          filterOpen={openFilterColumn === column.key}
          isFirst={colIdx === 0}
          isLast={colIdx === columns.length - 1}
        />
      ))}

      {shared.hasActions && (
        <TableTh
          aria-label="Actions"
          {...(isWeb ? { 'aria-colindex': shared.helperColsBefore + columns.length + 1 } : null)}
          style={[styles.noBottomBorder, { width: shared.actionsColumnWidth, backgroundColor: colors.headerBg }]}
        />
      )}
    </TableTr>
  );
}

export interface DataTableFilterRowProps<T> {
  shared: HeaderSharedProps<T>;
  data: T[];
  ariaRowIndex: number;
  onCommit: (columnKey: string, value: DataTableValue, operator: DataTableFilter['operator']) => void;
}

/**
 * Optional always-visible filter row beneath the header. Mirrors the header's
 * column layout (helper cells + one cell per visible column + trailing actions
 * spacer) so the inline controls stay aligned.
 */
export function DataTableFilterRow<T>({ shared, data, ariaRowIndex, onCommit }: DataTableFilterRowProps<T>) {
  const { colors, columns } = shared;
  const helperStyle = [styles.noBottomBorder, shared.columnDividerStyle(-1), { backgroundColor: colors.headerBg }];
  const cellRole = a11yProps({ role: shared.grid ? 'gridcell' : 'cell' });

  return (
    <TableTr
      {...(isWeb ? { 'aria-rowindex': ariaRowIndex } : null)}
      style={{ backgroundColor: colors.headerBg, borderBottomWidth: 1, borderBottomColor: colors.strongBorder }}
    >
      {shared.selectable && <TableTh w={50} {...cellRole} style={helperStyle} />}
      {shared.expandable && <TableTh w={50} {...cellRole} style={helperStyle} />}
      {columns.map((column, colIdx) => (
        <TableTh
          key={column.key}
          {...cellRole}
          w={shared.columnWidths[column.key] || column.width}
          miw={column.minWidth}
          maw={column.maxWidth}
          style={[
            styles.filterCell,
            shared.columnDividerStyle(colIdx),
            { backgroundColor: colors.headerBg },
            shared.sticky.getStickyCellStyle(column, colors.headerBg, true),
          ]}
        >
          {column.filterable ? (
            <ColumnFilterInput
              column={column}
              filterType={getColumnFilterType(column)}
              currentFilter={shared.getColumnFilter(column.key)}
              data={data}
              align={getColumnAlign(column)}
              onCommit={(value, operator) => onCommit(column.key, value, operator)}
            />
          ) : null}
        </TableTh>
      ))}
      {shared.hasActions && (
        <TableTh {...cellRole} style={[styles.noBottomBorder, { width: shared.actionsColumnWidth }]} />
      )}
    </TableTr>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  filterButton: {
    borderRadius: 4,
    padding: 4,
  },
  filterCell: {
    borderBottomWidth: 0,
    paddingVertical: 6,
  },
  headerCell: {
    // Header content spans the full cell so the sort/filter/menu controls can
    // sit flush at the end regardless of the column's text alignment (which
    // is applied to the label instead).
    alignItems: 'stretch',
    borderBottomWidth: 0,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    width: '100%',
  },
  headerLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  iconButton: {
    borderRadius: 4,
    padding: 2,
  },
  menuButton: {
    borderRadius: 4,
    padding: 4,
  },
  noBottomBorder: {
    borderBottomWidth: 0,
  },
  resizeGrip: {
    borderRadius: 1,
    height: '60%',
    width: 2,
  },
  resizeHandle: {
    alignItems: 'center',
    bottom: 0,
    end: -4,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 8,
  },
});
