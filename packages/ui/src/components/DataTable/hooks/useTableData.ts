import { useCallback, useEffect, useMemo, useState } from 'react';

import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import { filterData, getValue, sortData } from '../utils';
import type {
  DataTableColumn,
  DataTableFilter,
  DataTablePagination,
  DataTableProps,
  DataTableRowFeatures,
  DataTableSort,
  DataTableValue,
} from '../types';

export interface DataTableGroup<T> {
  key: string;
  value: DataTableValue;
  rows: T[];
}

interface UseTableDataOptions<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  activeFilters: DataTableFilter[];
  searchValue: string;
  sortBy: DataTableSort[];
  rowFeatureToggle?: DataTableProps<T>['rowFeatureToggle'];
  manualPagination: boolean;
  pagination?: DataTablePagination;
  onPaginationChange?: (pagination: DataTablePagination) => void;
  /** Group key. Pagination is bypassed whenever it is set. */
  groupBy?: string;
  /** Build groups (grouping renders only in the non-virtual path). */
  groupingActive: boolean;
  /** Whether groups start expanded. */
  groupsDefaultExpanded: boolean;
}

export interface TableData<T> {
  /** Filtered + sorted rows across all pages (the raw `data` in manual mode). */
  fullRows: T[];
  /** Rows of the current page (all rows while grouping). */
  processedData: T[];
  /** Row count used for pagination / aria-rowcount. */
  totalFiltered: number;
  /** Groups over `fullRows` when grouping is active, else null. */
  groups: DataTableGroup<T>[] | null;
  isGroupExpanded: (key: string) => boolean;
  toggleGroup: (key: string) => void;
  /**
   * The data rows actually rendered, in order (group headers and collapsed
   * groups excluded) — the index space for editing and keyboard navigation.
   */
  flatRows: T[];
}

/**
 * DataTable's row pipeline: filter + search → sort (rows marked
 * `sortable: false` keep their order after the sorted rows) → paginate, plus
 * grouping. Client-side pages are clamped when filtering shrinks the result
 * set. In manual (server) mode the data is rendered as given.
 */
export function useTableData<T>({
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
}: UseTableDataOptions<T>): TableData<T> {
  // Full filtered + sorted row set (before pagination). Grouping and grand-total
  // aggregation operate on this so groups/totals span all matching rows, not
  // just the current page.
  const fullRows = useMemo(() => {
    if (manualPagination) return data;

    const filtered = filterData(data, activeFilters, columns, searchValue, rowFeatureToggle);

    // Sort only rows permitting it; rows opting out keep their relative order after the sorted portion.
    const sortable: T[] = [];
    const fixed: T[] = [];
    filtered.forEach((row, i) => {
      const features: DataTableRowFeatures = rowFeatureToggle?.(row, i) || {};
      if (features.sortable === false) fixed.push(row);
      else sortable.push(row);
    });

    const sortedPortion = sortBy.length ? sortData(sortable, sortBy, columns) : sortable;
    return [...sortedPortion, ...fixed];
  }, [data, activeFilters, sortBy, searchValue, columns, rowFeatureToggle, manualPagination]);

  const pageIndex = pagination?.page;
  const pageSize = pagination?.pageSize;

  const processedData = useMemo(() => {
    if (manualPagination) return data;
    // Grouping renders every group (pagination is bypassed), so show all rows.
    if (groupBy) return fullRows;
    if (pageIndex !== undefined && pageSize !== undefined) {
      const startIndex = (pageIndex - 1) * pageSize;
      return fullRows.slice(startIndex, startIndex + pageSize);
    }
    return fullRows;
  }, [fullRows, data, pageIndex, pageSize, manualPagination, groupBy]);

  // In manual mode the server owns the count; trust `pagination.total`.
  const totalFiltered = manualPagination ? (pagination?.total ?? data.length) : fullRows.length;

  // Client-side page clamp: when filtering/search shrinks the result set below
  // the current page, snap back to the last valid page so the table never shows
  // an empty page. Skipped in manual mode, where the server decides which page exists.
  const clampPage = useLatestCallback(() => {
    if (manualPagination || !pagination || !onPaginationChange) return;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pagination.pageSize));
    if (pagination.page > totalPages) {
      onPaginationChange({ ...pagination, page: totalPages });
    }
  });
  const canPaginate = !!onPaginationChange;
  useEffect(() => {
    clampPage();
  }, [clampPage, manualPagination, pageIndex, pageSize, totalFiltered, canPaginate]);

  const groups = useMemo(() => {
    if (!groupBy || !groupingActive) return null;
    const column = columns.find((c) => c.key === groupBy);
    const order: Array<{ key: string; value: DataTableValue }> = [];
    const byKey = new Map<string, T[]>();
    fullRows.forEach((row) => {
      const value = column ? getValue(row, column.accessor) : undefined;
      const key = String(value);
      let bucket = byKey.get(key);
      if (!bucket) {
        bucket = [];
        byKey.set(key, bucket);
        order.push({ key, value });
      }
      bucket.push(row);
    });
    return order.map((o) => ({ key: o.key, value: o.value, rows: byKey.get(o.key) ?? [] }));
  }, [columns, groupBy, groupingActive, fullRows]);

  // Group expansion: keys toggled away from the `groupsDefaultExpanded` default.
  const [toggledGroups, setToggledGroups] = useState<ReadonlySet<string>>(() => new Set());
  const isGroupExpanded = useCallback(
    (key: string) => (groupsDefaultExpanded ? !toggledGroups.has(key) : toggledGroups.has(key)),
    [groupsDefaultExpanded, toggledGroups]
  );
  const toggleGroup = useCallback((key: string) => {
    setToggledGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const flatRows = useMemo(() => {
    if (!groups) return processedData;
    const out: T[] = [];
    groups.forEach((group) => {
      if (isGroupExpanded(group.key)) out.push(...group.rows);
    });
    return out;
  }, [groups, processedData, isGroupExpanded]);

  return useMemo(
    () => ({ fullRows, processedData, totalFiltered, groups, isGroupExpanded, toggleGroup, flatRows }),
    [fullRows, processedData, totalFiltered, groups, isGroupExpanded, toggleGroup, flatRows]
  );
}
