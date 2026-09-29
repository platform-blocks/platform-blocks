import { useMemo, useState } from 'react';

import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import type { DataTableRowId } from '../types';

/**
 * Expanded-row state (controlled via `expandedRows` + `onExpandedRowsChange`, or
 * internal). `toggle` has a stable identity; `expandedSet` gives O(1) lookups
 * in the row loop.
 */
export function useExpandedRows({
  expandedRows: controlledExpandedRows,
  initialExpandedRows,
  onExpandedRowsChange,
  allowMultipleExpanded,
}: {
  expandedRows?: DataTableRowId[];
  initialExpandedRows: DataTableRowId[];
  onExpandedRowsChange?: (expanded: DataTableRowId[]) => void;
  allowMultipleExpanded: boolean;
}) {
  const [internalExpandedRows, setInternalExpandedRows] = useState<DataTableRowId[]>(initialExpandedRows);
  const expandedRows = controlledExpandedRows !== undefined ? controlledExpandedRows : internalExpandedRows;
  const expandedSet = useMemo<ReadonlySet<DataTableRowId>>(() => new Set(expandedRows), [expandedRows]);

  const toggle = useLatestCallback((rowId: DataTableRowId) => {
    const next = expandedSet.has(rowId)
      ? expandedRows.filter((id) => id !== rowId)
      : allowMultipleExpanded
        ? [...expandedRows, rowId]
        : [rowId];
    if (onExpandedRowsChange) onExpandedRowsChange(next);
    else setInternalExpandedRows(next);
  });

  return useMemo(() => ({ expandedSet, toggle }), [expandedSet, toggle]);
}
