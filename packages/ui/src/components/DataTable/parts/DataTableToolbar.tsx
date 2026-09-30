import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { a11yProps } from '../../../core/accessibility/a11yProps';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { resolveRadius, resolveSpacing } from '../../../core/theme/tokens';
import { Button } from '../../Button';
import { Checkbox } from '../../Checkbox';
import { Flex } from '../../Flex';
import { Icon } from '../../Icon';
import { Input } from '../../Input';
import { Popover } from '../../Popover';
import { Text } from '../../Text';
import type { DataTableBulkAction, DataTableColumn, DataTableFilter, DataTableRowId } from '../types';
import type { DataTableColors } from './shared';

export interface DataTableToolbarProps<T> {
  colors: DataTableColors;
  compact: boolean;
  data: T[];
  columns: DataTableColumn<T>[];
  selectedRows: DataTableRowId[];
  bulkActions: DataTableBulkAction<T>[];
  searchable: boolean;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilters: DataTableFilter[];
  getColumnFilter: (columnKey: string) => DataTableFilter | undefined;
  onClearFilters: () => void;
  onRemoveFilter: (columnKey: string) => void;
  renderFilterControl: (column: DataTableColumn<T>, showOperators: boolean, autoFocus: boolean) => React.ReactNode;
  editMode: boolean;
  onEditModeChange?: (editMode: boolean) => void;
  exportable: boolean;
  onExport: () => void;
  showColumnVisibilityManager: boolean;
  hiddenSet: ReadonlySet<string>;
  setHiddenColumns: React.Dispatch<React.SetStateAction<string[]>>;
  onResetColumns: () => void;
}

/** Search remains visible; secondary controls adapt to the table's own width. */
export function DataTableToolbar<T>({
  colors, compact, data, columns, selectedRows, bulkActions, searchable, searchPlaceholder,
  searchValue, onSearchChange, activeFilters, getColumnFilter, onClearFilters,
  onRemoveFilter, renderFilterControl, editMode, onEditModeChange, exportable,
  onExport, showColumnVisibilityManager, hiddenSet, setHiddenColumns, onResetColumns,
}: DataTableToolbarProps<T>) {
  const theme = useTheme();
  const space = (token: 'xs' | 'sm' | 'md') => {
    const value = resolveSpacing(theme, token);
    return typeof value === 'number' ? value : 0;
  };
  const filterableColumns = columns.filter((column) => column.filterable);
  const hasSecondaryActions = !!onEditModeChange || exportable || showColumnVisibilityManager;
  const visibleCount = columns.length - columns.filter((column) => hiddenSet.has(column.key)).length;

  const columnsContent = (
    <View style={styles.columnsBody}>
      <View style={styles.columnsHeading}>
        <Text variant="small" fw="semibold">Columns</Text>
        <Button size="xs" variant="ghost" onPress={onResetColumns}>Reset columns</Button>
      </View>
      <ScrollView style={styles.columnsList}>
        {columns.map((column) => {
          const checked = !hiddenSet.has(column.key);
          return (
            <Checkbox
              key={column.key}
              label={column.header}
              checked={checked}
              disabled={checked && visibleCount <= 1}
              onChange={() => setHiddenColumns((previous) =>
                previous.includes(column.key)
                  ? previous.filter((key) => key !== column.key)
                  : [...previous, column.key]
              )}
              style={styles.columnsCheckbox}
            />
          );
        })}
      </ScrollView>
    </View>
  );

  const filtersControl = filterableColumns.length > 0 ? (
    <Popover position="bottom-end" offset={{ mainAxis: 8 }} w={compact ? 280 : 320} trapFocus>
      <Popover.Target>
        <Button variant="outline" size="sm" startSection={<Icon name="filter" size={14} decorative />}>
          {activeFilters.length ? `Filters (${activeFilters.length})` : 'Filters'}
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Flex direction="column" gap={space('sm')} style={[styles.popoverBody, compact && styles.popoverBodyCompact]}>
          <Flex direction="row" justify="space-between" align="center">
            <Text variant="small" textRole="panelTitle">Filters</Text>
            {activeFilters.length > 0 && (
              <Button variant="ghost" size="xs" onPress={onClearFilters}>Clear all</Button>
            )}
          </Flex>
          {activeFilters.map((filter) => {
            const column = columns.find((candidate) => candidate.key === filter.column);
            const name = typeof column?.header === 'string' ? column.header : filter.column;
            return (
              <View
                key={filter.column}
                style={[
                  styles.chip,
                  { backgroundColor: colors.selectedBg, paddingHorizontal: space('sm'), paddingVertical: space('xs'),
                    borderRadius: resolveRadius(theme, 'sm'), gap: space('xs') },
                ]}
              >
                <Text variant="small" style={{ color: colors.text }}>
                  {name}: {filter.operator} "{String(filter.value)}"
                </Text>
                <Pressable
                  onPress={() => onRemoveFilter(filter.column)}
                  {...a11yProps({ role: 'button', label: `Remove ${name} filter` })}
                  hitSlop={8}
                  style={styles.chipRemove}
                >
                  <Icon name="x" size={12} color={colors.accent} decorative />
                </Pressable>
              </View>
            );
          })}
          {filterableColumns.map((column) => (
            <View key={column.key}>{renderFilterControl(column, false, false)}</View>
          ))}
        </Flex>
      </Popover.Dropdown>
    </Popover>
  ) : null;

  const editControl = onEditModeChange ? (
    <Button variant={editMode ? 'filled' : 'outline'} size="sm" onPress={() => onEditModeChange(!editMode)}>
      {editMode ? 'Exit Edit' : 'Edit'}
    </Button>
  ) : null;
  const exportControl = exportable ? (
    <Button variant="outline" size="sm" startSection={<Icon name="download" size={14} decorative />}
      onPress={onExport} accessibilityLabel="Export as CSV">
      Export
    </Button>
  ) : null;

  return (
    <View style={[styles.toolbar, compact && styles.toolbarCompact, { padding: space('md'), borderBottomColor: colors.hairline }]}>
      {searchable && (
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChangeText={onSearchChange}
          startSection={<Icon name="search" size={16} decorative />}
          size="sm"
          accessibilityLabel="Search"
          style={[styles.searchInput, compact && styles.searchInputCompact]}
        />
      )}
      <View style={[styles.actions, compact && styles.actionsCompact]}>
        {selectedRows.length > 0 && <Text variant="small" c="muted">{selectedRows.length} selected</Text>}
        {filtersControl}
        {!compact && editControl}
        {!compact && exportControl}
        {!compact && showColumnVisibilityManager && (
          <Popover position="bottom-end" offset={{ mainAxis: 8 }} w={280} trapFocus>
            <Popover.Target>
              <Button variant="outline" size="sm" startSection={<Icon name="eye" size={14} decorative />}>
                Columns
              </Button>
            </Popover.Target>
            <Popover.Dropdown>{columnsContent}</Popover.Dropdown>
          </Popover>
        )}
        {compact && hasSecondaryActions && (
          <Popover position="bottom-end" offset={{ mainAxis: 8 }} w={280} trapFocus>
            <Popover.Target>
              <Button variant="outline" size="sm" startSection={<Icon name="dots" size={14} decorative />}>
                More
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <View style={styles.moreBody}>
                {editControl}
                {exportControl}
                {showColumnVisibilityManager && columnsContent}
              </View>
            </Popover.Dropdown>
          </Popover>
        )}
      </View>
      {selectedRows.length > 0 && bulkActions.length > 0 && (
        <ScrollView horizontal style={styles.bulkRow} contentContainerStyle={styles.bulkContent}>
          {bulkActions.map((action) => (
            <Button key={action.key} variant="outline" size="sm" startSection={action.icon}
              onPress={() => action.action(selectedRows, data)}>
              {action.label}
            </Button>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  actionsCompact: { justifyContent: 'space-between', width: '100%' },
  bulkContent: { gap: 8 },
  bulkRow: { width: '100%' },
  chip: { alignItems: 'center', flexDirection: 'row' },
  chipRemove: { alignItems: 'center', justifyContent: 'center', minHeight: 24, minWidth: 24 },
  columnsBody: { maxHeight: 300, padding: 8, width: 260 },
  columnsCheckbox: { marginBottom: 4 },
  columnsHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  columnsList: { maxHeight: 220 },
  moreBody: { gap: 8, padding: 8 },
  popoverBody: { width: 320 },
  popoverBodyCompact: { width: 260 },
  searchInput: { flexGrow: 1, minWidth: 180, maxWidth: 360 },
  searchInputCompact: { maxWidth: undefined, width: '100%' },
  toolbar: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  toolbarCompact: { alignItems: 'stretch', flexDirection: 'column' },
});
