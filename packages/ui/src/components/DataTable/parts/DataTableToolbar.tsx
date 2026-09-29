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
import { Row } from '../../Layout';
import { Popover } from '../../Popover';
import { Text } from '../../Text';
import { ComponentWithDisclaimer } from '../../_internal/Disclaimer';
import type { DataTableBulkAction, DataTableColumn, DataTableFilter, DataTableRowId } from '../types';
import type { DataTableColors } from './shared';

export interface DataTableToolbarProps<T> {
  colors: DataTableColors;
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
}

/**
 * The toolbar above the table: bulk actions for the selection, the search &
 * filter popover, edit-mode toggle, CSV export and the column visibility manager.
 */
export function DataTableToolbar<T>({
  colors,
  data,
  columns,
  selectedRows,
  bulkActions,
  searchable,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  activeFilters,
  getColumnFilter,
  onClearFilters,
  onRemoveFilter,
  renderFilterControl,
  editMode,
  onEditModeChange,
  exportable,
  onExport,
  showColumnVisibilityManager,
  hiddenSet,
  setHiddenColumns,
}: DataTableToolbarProps<T>) {
  const theme = useTheme();
  const space = (token: 'xs' | 'sm' | 'md') => {
    const value = resolveSpacing(theme, token);
    return typeof value === 'number' ? value : 0;
  };
  const filterableColumns = columns.filter((c) => c.filterable);
  const hasFilterUi = filterableColumns.length > 0;

  return (
    <View style={[styles.toolbar, { marginBottom: space('md'), paddingHorizontal: space('xs') }]}>
      <Flex gap={space('md')} align="center">
        {selectedRows.length > 0 && bulkActions.length > 0 && (
          <Flex gap={8}>
            <Text variant="small" c="muted">
              {selectedRows.length} selected
            </Text>
            {bulkActions.map((action) => (
              <Button
                key={action.key}
                variant="outline"
                size="sm"
                startSection={action.icon}
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
        {(searchable || hasFilterUi) && (
          <Popover position="bottom-end" offset={{ mainAxis: 12 }} w={320} trapFocus>
            <Popover.Target>
              <Button variant="outline" size="sm" startSection={<Icon name="search" size={14} decorative />}>
                Search
                {(searchValue || activeFilters.length > 0) && (
                  <View style={[styles.activeDot, { backgroundColor: colors.accent }]} />
                )}
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Flex direction="column" gap={space('md')} style={styles.popoverBody}>
                <Text variant="small" textRole="panelTitle">
                  Search & Filter
                </Text>

                {searchable && (
                  <View style={[styles.searchSection, { borderBottomColor: colors.hairline, paddingBottom: space('sm') }]}>
                    <Flex direction="column" gap={space('xs')}>
                      <Text variant="small" textRole="sectionLabel">
                        Search
                      </Text>
                      <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChangeText={onSearchChange}
                        startSection={<Icon name="search" size={16} decorative />}
                        size="sm"
                        accessibilityLabel="Search"
                      />
                    </Flex>
                  </View>
                )}

                {hasFilterUi && (
                  <Flex direction="column" gap={space('sm')}>
                    <Flex direction="row" justify="space-between" align="center">
                      <Text variant="small" textRole="sectionLabel">
                        Filters
                      </Text>
                      {activeFilters.length > 0 && (
                        <Button variant="ghost" size="xs" onPress={onClearFilters}>
                          Clear all
                        </Button>
                      )}
                    </Flex>

                    {activeFilters.length > 0 && (
                      <Flex direction="column" gap={space('xs')} style={{ marginBottom: space('sm') }}>
                        {activeFilters.map((filter) => {
                          const column = columns.find((c) => c.key === filter.column);
                          const name = typeof column?.header === 'string' ? column.header : filter.column;
                          return (
                            <View
                              key={filter.column}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: colors.selectedBg,
                                  paddingHorizontal: space('sm'),
                                  paddingVertical: space('xs'),
                                  borderRadius: resolveRadius(theme, 'sm'),
                                  gap: space('xs'),
                                },
                              ]}
                            >
                              <Text variant="small" style={{ color: colors.text }}>
                                {column?.header || filter.column}: {filter.operator} "{String(filter.value)}"
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
                      </Flex>
                    )}

                    <Flex direction="column" gap={space('sm')}>
                      {filterableColumns.map((column) => {
                        const currentFilter = getColumnFilter(column.key);
                        return (
                          <View key={`${column.key}-${currentFilter?.value ?? 'no-filter'}`}>
                            {renderFilterControl(column, false, false)}
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
          <Button variant={editMode ? 'filled' : 'outline'} size="sm" onPress={() => onEditModeChange(!editMode)}>
            {editMode ? 'Exit Edit' : 'Edit'}
          </Button>
        )}
        {exportable && (
          <Button
            variant="outline"
            size="sm"
            startSection={<Icon name="download" size={14} decorative />}
            onPress={onExport}
            accessibilityLabel="Export as CSV"
          >
            Export
          </Button>
        )}
        {showColumnVisibilityManager && (
          <Popover position="bottom-end" offset={{ mainAxis: 12 }} w={280} trapFocus>
            <Popover.Target>
              <Button variant="outline" size="sm" startSection={<Icon name="eye" size={14} decorative />}>
                Columns
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <View style={styles.columnsBody}>
                <ComponentWithDisclaimer
                  disclaimer="Selected view determines the layout style"
                  disclaimerProps={{ c: 'muted', size: 'sm' }}
                >
                  <Row>
                    <Button
                      size="xs"
                      title="Deselect All"
                      variant={hiddenSet.size === columns.length ? 'filled' : 'outline'}
                      onPress={() => setHiddenColumns(columns.map((c) => c.key))}
                      style={styles.columnsButton}
                    />
                    <Button
                      size="xs"
                      title="Select All"
                      variant={hiddenSet.size === 0 ? 'filled' : 'outline'}
                      onPress={() => setHiddenColumns([])}
                      style={styles.columnsButton}
                    />
                  </Row>
                </ComponentWithDisclaimer>

                <ScrollView style={styles.columnsList}>
                  {columns.map((col) => (
                    <Checkbox
                      key={col.key}
                      label={col.header}
                      checked={!hiddenSet.has(col.key)}
                      onChange={() =>
                        setHiddenColumns((prev) =>
                          prev.includes(col.key) ? prev.filter((h) => h !== col.key) : [...prev, col.key]
                        )
                      }
                      style={styles.columnsCheckbox}
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
}

const styles = StyleSheet.create({
  activeDot: {
    borderRadius: 3,
    height: 6,
    marginStart: 4,
    width: 6,
  },
  chip: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  chipRemove: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
    minWidth: 24,
  },
  columnsBody: {
    maxHeight: 300,
    padding: 8,
    width: 260,
  },
  columnsButton: {
    marginBottom: 8,
  },
  columnsCheckbox: {
    marginBottom: 4,
  },
  columnsList: {
    maxHeight: 200,
  },
  popoverBody: {
    width: 320,
  },
  searchSection: {
    borderBottomWidth: 1,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
