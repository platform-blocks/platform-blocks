import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useDebouncedCallback } from '../../hooks/useDebouncedCallback/useDebouncedCallback';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Select } from '../Select';
import { getValue } from './utils';
import type { DataTableColumn, DataTableFilter, DataTableValue, FilterType } from './types';

interface AdvancedFilterControlProps<T> {
  column: DataTableColumn<T>;
  currentFilter?: DataTableFilter;
  onFilterChange: (filter: DataTableFilter | null) => void;
  /** Rows used to auto-generate select options. */
  data?: T[];
  /** Show the operator selector by default (used in the header filter popover). */
  showOperators?: boolean;
  /** Auto-focus the value input on mount (used when opened from the header filter popover). */
  autoFocus?: boolean;
}

type Operator = DataTableFilter['operator'];

interface FilterState {
  operator: Operator;
  value: DataTableValue;
}

interface OperatorOption {
  label: string;
  value: Operator;
  icon?: string;
}

// Default operator for a filter type.
function getDefaultOperator(filterType?: FilterType): Operator {
  switch (filterType) {
    case 'number':
    case 'date':
    case 'select':
    case 'boolean':
      return 'eq';
    default:
      return 'contains';
  }
}

const NUMBER_OPERATORS: OperatorOption[] = [
  { label: 'Equals', value: 'eq', icon: '=' },
  { label: 'Not equals', value: 'ne', icon: '≠' },
  { label: 'Greater than', value: 'gt', icon: '>' },
  { label: 'Greater or equal', value: 'gte', icon: '≥' },
  { label: 'Less than', value: 'lt', icon: '<' },
  { label: 'Less or equal', value: 'lte', icon: '≤' },
];

const DATE_OPERATORS: OperatorOption[] = [
  { label: 'Equals', value: 'eq', icon: '=' },
  { label: 'After', value: 'gt', icon: '>' },
  { label: 'Before', value: 'lt', icon: '<' },
  { label: 'Contains', value: 'contains', icon: '∋' },
];

const TEXT_OPERATORS: OperatorOption[] = [
  { label: 'Contains', value: 'contains', icon: '∋' },
  { label: 'Equals', value: 'eq', icon: '=' },
  { label: 'Starts with', value: 'startsWith', icon: 'A→' },
  { label: 'Ends with', value: 'endsWith', icon: '→Z' },
  { label: 'Not equals', value: 'ne', icon: '≠' },
];

const operatorOptions = (options: OperatorOption[]) =>
  options.map((op) => ({ label: op.icon || op.label, value: op.value }));

const stateFor = (filter: DataTableFilter | undefined, filterType?: FilterType): FilterState =>
  filter ? { operator: filter.operator, value: filter.value } : { operator: getDefaultOperator(filterType), value: '' };

const NO_ROWS: never[] = [];

/** Filter editor for one column (value input, optional operator picker, clear button). */
export function AdvancedFilterControl<T>({
  column,
  currentFilter,
  onFilterChange,
  data = NO_ROWS,
  showOperators = false,
  autoFocus = false,
}: AdvancedFilterControlProps<T>) {
  const theme = useTheme();
  const columnName = typeof column.header === 'string' ? column.header : undefined;

  const [filterState, setFilterState] = useState<FilterState>(() => stateFor(currentFilter, column.filterType));
  const [showAdvanced, setShowAdvanced] = useState(showOperators);

  // Reset the editor when the applied filter changes from outside.
  const [syncedFilter, setSyncedFilter] = useState(currentFilter);
  const [syncedType, setSyncedType] = useState(column.filterType);
  if (currentFilter !== syncedFilter || column.filterType !== syncedType) {
    setSyncedFilter(currentFilter);
    setSyncedType(column.filterType);
    setFilterState(stateFor(currentFilter, column.filterType));
  }

  // Auto-generate select options from data
  const getAutoOptions = (): Array<{ label: string; value: DataTableValue }> => {
    if (column.filterOptions) return column.filterOptions;
    const uniqueValues = new Set<DataTableValue>();
    data.forEach((row) => {
      const value = getValue(row, column.accessor);
      if (value !== null && value !== undefined) uniqueValues.add(value);
    });
    return Array.from(uniqueValues)
      .sort()
      .slice(0, 20) // Limit to 20 options
      .map((value) => ({ label: String(value), value }));
  };

  // Commit a specific value/operator to the parent. Empty values clear the filter.
  const commitFilter = (value: DataTableValue, operator: Operator) => {
    if (!value && value !== 0 && value !== false) {
      onFilterChange(null);
      return;
    }
    onFilterChange({ column: column.key, operator, value });
  };

  // Auto-apply while the user types, debounced so we don't filter on every keystroke.
  const debouncedCommit = useDebouncedCallback(commitFilter, 300);

  const clearFilter = () => {
    setFilterState({ operator: getDefaultOperator(column.filterType), value: '' });
    onFilterChange(null);
  };

  const commitSelect = (value: DataTableValue) => {
    setFilterState((prev) => ({ ...prev, value }));
    if (value === '') clearFilter();
    else onFilterChange({ column: column.key, operator: 'eq', value });
  };

  const operatorPicker = (options: OperatorOption[], placeholder: string) =>
    showAdvanced ? (
      <View style={styles.operator}>
        <Select
          size="xs"
          placeholder={placeholder}
          accessibilityLabel="Operator"
          options={operatorOptions(options)}
          value={filterState.operator}
          onChange={(value) => {
            const operator = (value ?? getDefaultOperator(column.filterType)) as Operator;
            setFilterState((prev) => ({ ...prev, operator }));
            debouncedCommit.cancel();
            commitFilter(filterState.value, operator);
          }}
        />
      </View>
    ) : null;

  const valueLabel = columnName ? `Filter ${columnName}` : 'Filter value';

  // Render different filter types
  const renderFilterInput = () => {
    switch (column.filterType) {
      case 'select':
        return (
          <Select
            size="xs"
            placeholder="Select value..."
            accessibilityLabel={valueLabel}
            options={[{ label: 'Any', value: '' }, ...getAutoOptions()]}
            value={filterState.value}
            onChange={commitSelect}
          />
        );

      case 'boolean':
        return (
          <Select
            size="xs"
            placeholder="Any"
            accessibilityLabel={valueLabel}
            options={[
              { label: 'Any', value: '' },
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ]}
            value={filterState.value}
            onChange={commitSelect}
          />
        );

      case 'number':
        return (
          <View style={styles.row}>
            {operatorPicker(NUMBER_OPERATORS, '=')}
            <Input
              size="xs"
              placeholder={showAdvanced ? 'Value' : '= Value'}
              accessibilityLabel={valueLabel}
              value={String(filterState.value ?? '')}
              onChangeText={(text) => {
                const value = text ? parseFloat(text) : '';
                setFilterState((prev) => ({ ...prev, value }));
                debouncedCommit(value, filterState.operator);
              }}
              onBlur={debouncedCommit.flush}
              keyboardType="numeric"
              autoFocus={autoFocus}
              style={styles.fill}
              textInputProps={{ style: styles.inputText }}
            />
          </View>
        );

      case 'date':
        return (
          <View style={styles.row}>
            {operatorPicker(DATE_OPERATORS, '=')}
            <Input
              size="xs"
              placeholder="YYYY-MM-DD"
              accessibilityLabel={valueLabel}
              value={String(filterState.value ?? '')}
              onChangeText={(value) => {
                setFilterState((prev) => ({ ...prev, value }));
                debouncedCommit(value, filterState.operator);
              }}
              onBlur={debouncedCommit.flush}
              autoFocus={autoFocus}
              style={styles.fill}
              textInputProps={{ style: styles.inputText }}
            />
          </View>
        );

      default:
        return (
          <View style={styles.row}>
            {operatorPicker(TEXT_OPERATORS, '∋')}
            <Input
              size="xs"
              placeholder={showAdvanced ? 'Value' : 'Search...'}
              accessibilityLabel={valueLabel}
              value={String(filterState.value ?? '')}
              onChangeText={(value) => {
                setFilterState((prev) => ({ ...prev, value }));
                debouncedCommit(value, filterState.operator);
              }}
              onBlur={debouncedCommit.flush}
              autoFocus={autoFocus}
              style={styles.fill}
              textInputProps={{ style: styles.inputText }}
            />
          </View>
        );
    }
  };

  const hasOperators =
    column.filterType === 'text' || column.filterType === 'number' || column.filterType === 'date';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderFilterInput()}

        {hasOperators && (
          <Pressable
            onPress={() => setShowAdvanced(!showAdvanced)}
            {...a11yProps({ role: 'button', label: 'Filter operators', pressed: showAdvanced })}
            style={[styles.iconButton, { backgroundColor: showAdvanced ? theme.backgrounds.selected : 'transparent' }]}
          >
            <Icon
              name="settings"
              size={12}
              color={showAdvanced ? theme.colors.primary[6] : theme.text.muted}
              decorative
            />
          </Pressable>
        )}

        {currentFilter && (
          <Pressable
            onPress={clearFilter}
            {...a11yProps({ role: 'button', label: columnName ? `Clear ${columnName} filter` : 'Clear filter' })}
            style={[styles.iconButton, { backgroundColor: theme.backgrounds.subtle }]}
          >
            <Icon name="x" size={12} color={theme.text.muted} decorative />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    padding: 4,
  },
  fill: {
    flex: 1,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 4,
    justifyContent: 'center',
    minHeight: 24,
    minWidth: 24,
    padding: 4,
  },
  inputText: {
    fontSize: 12,
  },
  operator: {
    width: 50,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
});
