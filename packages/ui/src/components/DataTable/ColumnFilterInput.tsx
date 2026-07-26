import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Input } from '../Input';
import { Select } from '../Select';
import { useDebouncedCallback } from '../../hooks';
import type { DataTableColumn, DataTableFilter, FilterType } from './types';

interface ColumnFilterInputProps<T = any> {
  column: DataTableColumn<T>;
  /** Resolved filter UI type for the column. */
  filterType: FilterType;
  /** Currently applied filter for this column, if any. */
  currentFilter?: DataTableFilter;
  /** Full data set, used to auto-derive select options when none are provided. */
  data?: T[];
  /** Commit a value (empty clears the filter). */
  onCommit: (value: any, operator: DataTableFilter['operator']) => void;
  align?: 'left' | 'center' | 'right';
}

// Default operator applied by the under-header inline filters. Text uses a
// forgiving substring match; discrete/numeric/date types match exactly.
function defaultOperator(filterType: FilterType): DataTableFilter['operator'] {
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

/**
 * Compact, single-line filter control rendered beneath a column header when
 * `showColumnFilters` is enabled. Text/number/date columns get a debounced
 * text input; select/boolean columns get a dropdown. It is intentionally
 * leaner than {@link AdvancedFilterControl} (no operator picker or chips) so it
 * fits inside a table row.
 */
export function ColumnFilterInput<T = any>({
  column,
  filterType,
  currentFilter,
  data = [],
  onCommit,
  align = 'left',
}: ColumnFilterInputProps<T>) {
  const operator = defaultOperator(filterType);
  const [value, setValue] = useState<any>(currentFilter?.value ?? '');

  // Keep the local input in sync when the filter is cleared/changed externally
  // (e.g. a "Clear all filters" action or controlled `filters` prop).
  useEffect(() => {
    setValue(currentFilter?.value ?? '');
  }, [currentFilter?.value]);

  const debouncedCommit = useDebouncedCallback(
    (next: any) => onCommit(next, operator),
    300
  );

  const selectOptions = useMemo(() => {
    if (filterType !== 'select') return [];
    if (column.filterOptions) return column.filterOptions;
    const accessor = column.accessor;
    const seen = new Set<any>();
    data.forEach((row) => {
      const v = typeof accessor === 'function' ? accessor(row) : (row as any)[accessor];
      if (v !== null && v !== undefined && v !== '') seen.add(v);
    });
    return Array.from(seen)
      .sort()
      .slice(0, 50)
      .map((v) => ({ label: String(v), value: v }));
  }, [filterType, column.filterOptions, column.accessor, data]);

  if (filterType === 'select') {
    return (
      <Select
        size="xs"
        placeholder="All"
        options={[{ label: 'All', value: '' }, ...selectOptions]}
        value={value === undefined ? '' : value}
        onChange={(next) => {
          setValue(next);
          onCommit(next === '' ? undefined : next, operator);
        }}
      />
    );
  }

  if (filterType === 'boolean') {
    return (
      <Select
        size="xs"
        placeholder="All"
        options={[
          { label: 'All', value: '' },
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]}
        value={value === '' || value === undefined ? '' : value}
        onChange={(next) => {
          setValue(next);
          onCommit(next === '' ? undefined : next, operator);
        }}
      />
    );
  }

  const placeholder =
    filterType === 'number' ? 'Filter…' : filterType === 'date' ? 'YYYY-MM-DD' : 'Filter…';

  return (
    <View style={{ width: '100%' }}>
      <Input
        size="xs"
        placeholder={placeholder}
        value={String(value ?? '')}
        keyboardType={filterType === 'number' ? 'numeric' : 'default'}
        onChangeText={(text) => {
          const next = filterType === 'number' ? (text === '' ? '' : parseFloat(text)) : text;
          setValue(next);
          debouncedCommit(next === '' || Number.isNaN(next) ? undefined : next);
        }}
        onBlur={debouncedCommit.flush}
        style={{
          fontSize: 12,
          textAlign: align === 'right' ? 'right' : align === 'center' ? 'center' : 'left',
        }}
      />
    </View>
  );
}
