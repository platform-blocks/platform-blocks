import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useControllableState } from '../../../hooks/useControllableState/useControllableState';
import { useLatestCallback } from '../../../core/hooks/useLatestCallback';

type RowId = string | number;

interface UseRowSelectionProps {
  /** All row IDs in current view (after filtering/pagination) */
  allRowIds: RowId[];
  /** Initial selected rows (uncontrolled) */
  initialSelectedRows?: RowId[];
  /** Controlled selected rows */
  selectedRows?: RowId[];
  /** Selection change handler */
  onSelectionChange?: (selectedRows: RowId[]) => void;
  /** Whether to persist selection across pagination */
  persistAcrossPagination?: boolean;
}

export interface UseRowSelectionReturn {
  /** Currently selected row IDs */
  selectedRows: RowId[];
  /** The selection as a Set, for O(1) membership checks in render loops */
  selectedSet: ReadonlySet<RowId>;
  /** Whether all visible rows are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) visible rows are selected */
  isIndeterminate: boolean;
  /** Toggle selection for a single row (stable identity) */
  toggleRow: (rowId: RowId, event?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => void;
  /** Toggle selection for all visible rows (stable identity) */
  toggleAll: () => void;
  /** Select a range of rows (for shift+click) (stable identity) */
  selectRange: (fromId: RowId, toId: RowId) => void;
  /** Clear all selections (stable identity) */
  clearSelection: () => void;
  /** Select all rows (including those not currently visible if persistAcrossPagination is true) (stable identity) */
  selectAll: (allPossibleIds?: RowId[]) => void;
  /** Get number of selected rows */
  selectionCount: number;
  /** Check if a specific row is selected (changes identity only when the selection changes) */
  isRowSelected: (rowId: RowId) => boolean;
}

const EMPTY: RowId[] = [];

/**
 * Row selection state for DataTable: controlled or uncontrolled, with
 * shift-click range selection. The action callbacks have a stable identity and
 * the returned object is memoized, so rows that depend on them don't re-render
 * when an unrelated row is selected.
 */
export function useRowSelection({
  allRowIds,
  initialSelectedRows,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  persistAcrossPagination = false,
}: UseRowSelectionProps): UseRowSelectionReturn {
  const [selectedRows, updateSelection] = useControllableState<RowId[]>({
    value: controlledSelectedRows,
    defaultValue: initialSelectedRows,
    finalValue: EMPTY,
    onChange: onSelectionChange,
  });
  const lastSelectedRowRef = useRef<RowId | null>(null);

  const selectedSet = useMemo<ReadonlySet<RowId>>(() => new Set(selectedRows), [selectedRows]);

  const visibleSelectedCount = useMemo(
    () => allRowIds.reduce<number>((count, id) => (selectedSet.has(id) ? count + 1 : count), 0),
    [allRowIds, selectedSet]
  );

  const isAllSelected = allRowIds.length > 0 && visibleSelectedCount === allRowIds.length;
  const isIndeterminate = visibleSelectedCount > 0 && visibleSelectedCount < allRowIds.length;
  const selectionCount = selectedRows.length;

  const isRowSelected = useCallback((rowId: RowId) => selectedSet.has(rowId), [selectedSet]);

  const toggleRow = useLatestCallback(
    (rowId: RowId, event?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => {
      if (event?.shiftKey && lastSelectedRowRef.current !== null) {
        // Range selection
        const lastIndex = allRowIds.indexOf(lastSelectedRowRef.current);
        const currentIndex = allRowIds.indexOf(rowId);

        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          const rangeIds = allRowIds.slice(start, end + 1);
          const rangeSet = new Set(rangeIds);

          // Add the range, or remove it when it is already fully selected.
          const allRangeSelected = rangeIds.every((id) => selectedSet.has(id));
          updateSelection(
            allRangeSelected
              ? selectedRows.filter((id) => !rangeSet.has(id))
              : [...selectedRows, ...rangeIds.filter((id) => !selectedSet.has(id))]
          );
          return;
        }
      }

      // Single row toggle
      updateSelection(selectedSet.has(rowId) ? selectedRows.filter((id) => id !== rowId) : [...selectedRows, rowId]);
      lastSelectedRowRef.current = rowId;
    }
  );

  const selectRange = useLatestCallback((fromId: RowId, toId: RowId) => {
    const fromIndex = allRowIds.indexOf(fromId);
    const toIndex = allRowIds.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const rangeIds = allRowIds.slice(start, end + 1);
    updateSelection([...selectedRows, ...rangeIds.filter((id) => !selectedSet.has(id))]);
  });

  const toggleAll = useLatestCallback(() => {
    if (isAllSelected) {
      // Remove all visible rows from selection
      const visible = new Set(allRowIds);
      updateSelection(persistAcrossPagination ? selectedRows.filter((id) => !visible.has(id)) : []);
    } else {
      // Add all visible rows to selection
      updateSelection([...selectedRows, ...allRowIds.filter((id) => !selectedSet.has(id))]);
    }
  });

  const clearSelection = useLatestCallback(() => {
    updateSelection([]);
    lastSelectedRowRef.current = null;
  });

  const selectAll = useLatestCallback((allPossibleIds?: RowId[]) => {
    updateSelection(allPossibleIds || allRowIds);
  });

  // Reset last selected when allRowIds changes (pagination)
  useEffect(() => {
    if (lastSelectedRowRef.current !== null && !allRowIds.includes(lastSelectedRowRef.current)) {
      lastSelectedRowRef.current = null;
    }
  }, [allRowIds]);

  return useMemo(
    () => ({
      selectedRows,
      selectedSet,
      isAllSelected,
      isIndeterminate,
      toggleRow,
      toggleAll,
      selectRange,
      clearSelection,
      selectAll,
      selectionCount,
      isRowSelected,
    }),
    [
      selectedRows,
      selectedSet,
      isAllSelected,
      isIndeterminate,
      toggleRow,
      toggleAll,
      selectRange,
      clearSelection,
      selectAll,
      selectionCount,
      isRowSelected,
    ]
  );
}
