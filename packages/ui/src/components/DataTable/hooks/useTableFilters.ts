import { useCallback, useMemo, useState } from 'react';

import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import type { DataTableFilter, DataTableValue } from '../types';

const NO_FILTERS: DataTableFilter[] = [];

export interface TableFilters {
  searchValue: string;
  setSearchValue: (value: string) => void;
  /** The filters in effect (the `filters` prop when controlled, else internal state). */
  activeFilters: DataTableFilter[];
  getColumnFilter: (columnKey: string) => DataTableFilter | undefined;
  /** Set a column's filter; an empty value clears it. */
  updateFilter: (columnKey: string, value: DataTableValue, operator?: DataTableFilter['operator']) => void;
  clearFilter: (columnKey: string) => void;
  clearAllFilters: () => void;
}

/**
 * Global search and per-column filters. Each is controlled when its change
 * callback is passed (`onSearchChange` + `searchValue`, `onFilterChange` +
 * `filters`) and managed internally otherwise; every setter respects the mode.
 */
export function useTableFilters({
  searchValue: controlledSearchValue,
  onSearchChange,
  filters = NO_FILTERS,
  onFilterChange,
}: {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: DataTableFilter[];
  onFilterChange?: (filters: DataTableFilter[]) => void;
}): TableFilters {
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const searchValue = controlledSearchValue !== undefined ? controlledSearchValue : internalSearchValue;
  const [internalFilters, setInternalFilters] = useState<DataTableFilter[]>(NO_FILTERS);
  const activeFilters = onFilterChange ? filters : internalFilters;

  const setSearchValue = useLatestCallback((value: string) => {
    if (onSearchChange) onSearchChange(value);
    else setInternalSearchValue(value);
  });

  const updateFilter = useLatestCallback(
    (columnKey: string, value: DataTableValue, operator?: DataTableFilter['operator']) => {
      const op: DataTableFilter['operator'] = operator || 'contains';
      const apply = (prev: DataTableFilter[]) => {
        const next = prev.filter((f) => f.column !== columnKey);
        if (value !== '' && value !== null && value !== undefined) next.push({ column: columnKey, value, operator: op });
        return next;
      };
      if (onFilterChange) onFilterChange(apply(filters));
      else setInternalFilters(apply);
    }
  );

  const clearFilter = useCallback((columnKey: string) => updateFilter(columnKey, undefined), [updateFilter]);

  const clearAllFilters = useLatestCallback(() => {
    if (onFilterChange) onFilterChange([]);
    else setInternalFilters([]);
  });

  const getColumnFilter = useCallback(
    (columnKey: string) => activeFilters.find((f) => f.column === columnKey),
    [activeFilters]
  );

  return useMemo(
    () => ({
      searchValue,
      setSearchValue,
      activeFilters,
      getColumnFilter,
      updateFilter,
      clearFilter,
      clearAllFilters,
    }),
    [searchValue, setSearchValue, activeFilters, getColumnFilter, updateFilter, clearFilter, clearAllFilters]
  );
}
