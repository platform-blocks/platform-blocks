import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useControllableState } from '../../../hooks/useControllableState';

interface UseRowSelectionProps {
  /** All row IDs in current view (after filtering/pagination) */
  allRowIds: (string | number)[];
  /** Initial selected rows */
  initialSelectedRows?: (string | number)[];
  /** Controlled selected rows */
  selectedRows?: (string | number)[];
  /** Selection change handler */
  onSelectionChange?: (selectedRows: (string | number)[]) => void;
  /** Whether to persist selection across pagination */
  persistAcrossPagination?: boolean;
}

interface UseRowSelectionReturn {
  /** Currently selected row IDs */
  selectedRows: (string | number)[];
  /** Whether all visible rows are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) visible rows are selected */
  isIndeterminate: boolean;
  /** Toggle selection for a single row */
  toggleRow: (rowId: string | number, event?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) => void;
  /** Toggle selection for all visible rows */
  toggleAll: () => void;
  /** Select a range of rows (for shift+click) */
  selectRange: (fromId: string | number, toId: string | number) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Select all rows (including those not currently visible if persistAcrossPagination is true) */
  selectAll: (allPossibleIds?: (string | number)[]) => void;
  /** Get number of selected rows */
  selectionCount: number;
  /** Check if a specific row is selected */
  isRowSelected: (rowId: string | number) => boolean;
}

export function useRowSelection({
  allRowIds,
  initialSelectedRows = [],
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  persistAcrossPagination = false
}: UseRowSelectionProps): UseRowSelectionReturn {
  
  const [selectedRows, updateSelection] = useControllableState<(string | number)[]>({
    value: controlledSelectedRows,
    defaultValue: initialSelectedRows,
    finalValue: [],
    onChange: onSelectionChange,
  });
  const lastSelectedRowRef = useRef<string | number | null>(null);

  // Computed values
  const visibleSelectedRows = useMemo(() => {
    return selectedRows.filter(id => allRowIds.includes(id));
  }, [selectedRows, allRowIds]);

  const isAllSelected = useMemo(() => {
    return allRowIds.length > 0 && visibleSelectedRows.length === allRowIds.length;
  }, [allRowIds.length, visibleSelectedRows.length]);

  const isIndeterminate = useMemo(() => {
    return visibleSelectedRows.length > 0 && visibleSelectedRows.length < allRowIds.length;
  }, [visibleSelectedRows.length, allRowIds.length]);

  const selectionCount = selectedRows.length;

  // Helper functions
  const isRowSelected = useCallback((rowId: string | number) => {
    return selectedRows.includes(rowId);
  }, [selectedRows]);

  const toggleRow = useCallback((
    rowId: string | number, 
    event?: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }
  ) => {
    const isCurrentlySelected = selectedRows.includes(rowId);
    const isShiftClick = event?.shiftKey;
    const isCtrlOrCmdClick = event?.ctrlKey || event?.metaKey;

    if (isShiftClick && lastSelectedRowRef.current !== null) {
      // Range selection
      const lastIndex = allRowIds.indexOf(lastSelectedRowRef.current);
      const currentIndex = allRowIds.indexOf(rowId);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = allRowIds.slice(start, end + 1);
        
        // Add range to selection (or remove if all are already selected)
        const allRangeSelected = rangeIds.every(id => selectedRows.includes(id));
        let newSelection: (string | number)[];
        
        if (allRangeSelected) {
          // Remove the range
          newSelection = selectedRows.filter(id => !rangeIds.includes(id));
        } else {
          // Add the range
          const uniqueNewIds = rangeIds.filter(id => !selectedRows.includes(id));
          newSelection = [...selectedRows, ...uniqueNewIds];
        }
        
        updateSelection(newSelection);
        return;
      }
    }

    // Single row toggle
    let newSelection: (string | number)[];
    if (isCurrentlySelected) {
      newSelection = selectedRows.filter(id => id !== rowId);
    } else {
      newSelection = [...selectedRows, rowId];
    }

    updateSelection(newSelection);
    lastSelectedRowRef.current = rowId;
  }, [selectedRows, allRowIds, updateSelection]);

  const selectRange = useCallback((fromId: string | number, toId: string | number) => {
    const fromIndex = allRowIds.indexOf(fromId);
    const toIndex = allRowIds.indexOf(toId);
    
    if (fromIndex === -1 || toIndex === -1) return;
    
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const rangeIds = allRowIds.slice(start, end + 1);
    
    const uniqueNewIds = rangeIds.filter(id => !selectedRows.includes(id));
    const newSelection = [...selectedRows, ...uniqueNewIds];
    
    updateSelection(newSelection);
  }, [allRowIds, selectedRows, updateSelection]);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      // Remove all visible rows from selection
      const newSelection = persistAcrossPagination 
        ? selectedRows.filter(id => !allRowIds.includes(id))
        : [];
      updateSelection(newSelection);
    } else {
      // Add all visible rows to selection
      const uniqueNewIds = allRowIds.filter(id => !selectedRows.includes(id));
      const newSelection = [...selectedRows, ...uniqueNewIds];
      updateSelection(newSelection);
    }
  }, [isAllSelected, selectedRows, allRowIds, updateSelection, persistAcrossPagination]);

  const clearSelection = useCallback(() => {
    updateSelection([]);
    lastSelectedRowRef.current = null;
  }, [updateSelection]);

  const selectAll = useCallback((allPossibleIds?: (string | number)[]) => {
    const idsToSelect = allPossibleIds || allRowIds;
    updateSelection(idsToSelect);
  }, [allRowIds, updateSelection]);

  // Reset last selected when allRowIds changes (pagination)
  useEffect(() => {
    if (lastSelectedRowRef.current && !allRowIds.includes(lastSelectedRowRef.current)) {
      lastSelectedRowRef.current = null;
    }
  }, [allRowIds]);

  return {
    selectedRows,
    isAllSelected,
    isIndeterminate,
    toggleRow,
    toggleAll,
    selectRange,
    clearSelection,
    selectAll,
    selectionCount,
    isRowSelected,
  };
}