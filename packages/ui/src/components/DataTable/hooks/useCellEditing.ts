import { useCallback, useMemo, useState } from 'react';

import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import type { DataTableColumn, DataTableProps, DataTableRowId, DataTableValue } from '../types';

export interface EditingCell {
  rowId: DataTableRowId;
  column: string;
}

export interface CellEditing {
  editingCell: EditingCell | null;
  editValue: DataTableValue;
  /** Start editing `column` of the rendered row `rowIndex` with its current value (no-op if already editing it). */
  beginEdit: (rowId: DataTableRowId, columnKey: string, value: DataTableValue) => void;
  setEditValue: (value: DataTableValue) => void;
  /** Validate and commit through `onCellEdit`; an invalid value keeps the editor open. */
  commitEdit: () => void;
  cancelEdit: () => void;
}

/** Inline cell editing state for DataTable's edit mode. */
export function useCellEditing<T>({
  columns,
  onCellEdit,
  rows,
  getRowId,
}: {
  columns: DataTableColumn<T>[];
  onCellEdit?: DataTableProps<T>['onCellEdit'];
  rows: T[];
  getRowId: (row: T, index: number) => DataTableRowId;
}): CellEditing {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<DataTableValue>('');

  const beginEdit = useLatestCallback((rowId: DataTableRowId, columnKey: string, value: DataTableValue) => {
    if (editingCell?.rowId === rowId && editingCell.column === columnKey) return;
    setEditingCell({ rowId, column: columnKey });
    setEditValue(value);
  });

  const commitEdit = useLatestCallback(() => {
    if (!editingCell || !onCellEdit) return;
    const column = columns.find((col) => col.key === editingCell.column);
    if (column?.validate && column.validate(editValue)) return;
    const rowIndex = rows.findIndex((row, index) => getRowId(row, index) === editingCell.rowId);
    if (rowIndex >= 0) onCellEdit(rowIndex, editingCell.column, editValue, editingCell.rowId, rows[rowIndex]);
    setEditingCell(null);
    setEditValue('');
  });

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  return useMemo(
    () => ({ editingCell, editValue, beginEdit, setEditValue, commitEdit, cancelEdit }),
    [editingCell, editValue, beginEdit, commitEdit, cancelEdit]
  );
}
