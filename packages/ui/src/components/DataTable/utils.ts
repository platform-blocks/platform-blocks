import type {
  ColumnDataType,
  DataTableColumn,
  DataTableFilter,
  DataTableProps,
  DataTableSort,
  FilterType,
} from './types';

/**
 * Pure data helpers for DataTable: value access, formatting, aggregation,
 * sorting and filtering. Nothing here touches React or the theme, so it can be
 * unit-tested and reused by the sub-components without dragging the table in.
 */

export const getValue = <T,>(row: T, accessor: keyof T | ((row: T) => any)): any => {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  return row[accessor];
};

export const formatValue = (value: any, dataType: ColumnDataType = 'text'): string => {
  if (value === null || value === undefined) return '';
  
  switch (dataType) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : String(value);
    case 'currency':
      return typeof value === 'number' ? `$${value.toLocaleString()}` : String(value);
    case 'percentage':
      return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : String(value);
    case 'date':
      return value instanceof Date ? value.toLocaleDateString() : String(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
};

export const isNumericType = (dataType?: ColumnDataType): boolean =>
  dataType === 'number' || dataType === 'currency' || dataType === 'percentage';

// Reduce a column's values over a set of rows per its aggregate spec. Numeric
// aggregates coerce values to numbers and ignore null/undefined; `count` is the
// row count; a function receives the rows directly.
export const computeAggregate = <T,>(
  agg: import('./types').AggregateType<T>,
  rows: T[],
  column: DataTableColumn<T>
): number | string => {
  if (typeof agg === 'function') return agg(rows);
  if (agg === 'count') return rows.length;
  const nums = rows
    .map(r => getValue(r, column.accessor))
    .filter(v => v !== null && v !== undefined && v !== '')
    .map(Number)
    .filter(n => !Number.isNaN(n));
  if (nums.length === 0) return agg === 'sum' ? 0 : '';
  switch (agg) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'avg': return nums.reduce((a, b) => a + b, 0) / nums.length;
    case 'min': return Math.min(...nums);
    case 'max': return Math.max(...nums);
    default: return '';
  }
};

// Fallback width used when a column has no explicit numeric width — also the
// basis for computing sticky (pinned) column offsets.
export const DEFAULT_COLUMN_WIDTH = 120;
// Fixed leading/trailing helper-column widths (selection / expand / actions).
export const SELECT_COL_WIDTH = 50;
export const EXPAND_COL_WIDTH = 50;

export const getColumnAlign = <T,>(column: DataTableColumn<T>): 'left' | 'center' | 'right' =>
  column.align ?? (isNumericType(column.dataType) ? 'right' : 'left');

// Resolve the filter UI/operator set for a column. Falls back from an explicit
// `filterType`, to a `select` when discrete options exist, to the column's
// `dataType`, and finally to free-text `contains`.
export const getColumnFilterType = <T,>(column: DataTableColumn<T>): FilterType => {
  if (column.filterType) return column.filterType;
  if (column.filterOptions) return 'select';
  switch (column.dataType) {
    case 'number':
    case 'currency':
    case 'percentage':
      return 'number';
    case 'date':
      return 'date';
    case 'boolean':
      return 'boolean';
    default:
      return 'text';
  }
};

export const sortData = <T,>(data: T[], sortBy: DataTableSort[], columns: DataTableColumn<T>[]): T[] => {
  if (!sortBy.length) return data;

  return [...data].sort((a, b) => {
    for (const sort of sortBy) {
      const column = columns.find(col => col.key === sort.column);
      if (!column || !sort.direction) continue;

      const aValue = getValue(a, column.accessor);
      const bValue = getValue(b, column.accessor);

      let comparison = 0;
      
      if (aValue === null || aValue === undefined) comparison = 1;
      else if (bValue === null || bValue === undefined) comparison = -1;
      else if (column.compare) {
        try { comparison = column.compare(aValue, bValue, a, b); } catch { comparison = 0; }
      } else if (typeof aValue === 'string' && typeof bValue === 'string') comparison = aValue.localeCompare(bValue);
      else if (typeof aValue === 'number' && typeof bValue === 'number') comparison = aValue - bValue;
      else if (aValue instanceof Date && bValue instanceof Date) comparison = aValue.getTime() - bValue.getTime();
      else comparison = String(aValue).localeCompare(String(bValue));

      if (comparison !== 0) {
        return sort.direction === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
};

// Normalize a value (Date, timestamp, ISO or `YYYY-MM-DD` string) to a
// timezone-safe, comparable day key (e.g. 2024-01-15 -> 20240115). Returns
// null when the value cannot be parsed as a date. Plain date-only strings are
// parsed literally to avoid the UTC-midnight shift `new Date('YYYY-MM-DD')`
// introduces in negative-offset timezones.
export const toDayKey = (value: any): number | null => {
  const fromDate = (d: Date) =>
    isNaN(d.getTime())
      ? null
      : d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

  if (value instanceof Date) return fromDate(value);
  if (typeof value === 'number') return fromDate(new Date(value));
  if (typeof value === 'string') {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3]);
    return fromDate(new Date(value));
  }
  return null;
};

export const filterData = <T,>(
  data: T[],
  filters: DataTableFilter[],
  columns: DataTableColumn<T>[],
  searchValue?: string,
  rowFeatureToggle?: DataTableProps<T>['rowFeatureToggle']
): T[] => {
  let filteredData = data;

  // Apply column filters
  if (filters.length > 0) {
    filteredData = filteredData.filter((row, idx) => {
      const rowFeatures = rowFeatureToggle?.(row, idx) || {} as any;
      // If row is marked non-filterable, always keep it
      if (rowFeatures.filterable === false) return true;
      return filters.every(filter => {
        const column = columns.find(col => col.key === filter.column);
        if (!column) return true;

        const value = getValue(row, column.accessor);
        const filterValue = filter.value;
        const op = filter.operator;

        // Date-aware equality/ordering: compare by calendar day so a
        // `YYYY-MM-DD` filter value matches Date/ISO row values correctly.
        const isDateColumn =
          column.dataType === 'date' || column.filterType === 'date' || value instanceof Date;
        if (
          isDateColumn &&
          (op === 'eq' || op === 'ne' || op === 'lt' || op === 'lte' || op === 'gt' || op === 'gte')
        ) {
          const rowKey = toDayKey(value);
          const filterKey = toDayKey(filterValue);
          if (filterKey === null) return true; // unparseable filter → no-op
          if (rowKey === null) return op === 'ne'; // undated row only matches "not equals"
          switch (op) {
            case 'eq':
              return rowKey === filterKey;
            case 'ne':
              return rowKey !== filterKey;
            case 'lt':
              return rowKey < filterKey;
            case 'lte':
              return rowKey <= filterKey;
            case 'gt':
              return rowKey > filterKey;
            case 'gte':
              return rowKey >= filterKey;
          }
        }

        switch (op) {
          case 'eq':
            return value === filterValue;
          case 'ne':
            return value !== filterValue;
          case 'lt':
            return value < filterValue;
          case 'lte':
            return value <= filterValue;
          case 'gt':
            return value > filterValue;
          case 'gte':
            return value >= filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'startsWith':
            return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
          case 'endsWith':
            return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
          default:
            return true;
        }
      });
    });
  }

  // Apply global search
  if (searchValue && searchValue.trim()) {
    const searchTerm = searchValue.toLowerCase().trim();
    filteredData = filteredData.filter((row, idx) => {
      const rowFeatures = rowFeatureToggle?.(row, idx) || {} as any;
      if (rowFeatures.searchable === false) return true; // keep regardless of search
      return columns.some(column => {
        const value = getValue(row, column.accessor);
        return String(value).toLowerCase().includes(searchTerm);
      });
    });
  }

  return filteredData;
};
