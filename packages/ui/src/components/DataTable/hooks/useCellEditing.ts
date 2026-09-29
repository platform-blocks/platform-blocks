import { useCallback, useMemo, useState } from 'react';

import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import type { DataTableColumn, DataTableProps, DataTableValue } from '../types';

export interface EditingCell {
  /** Index of the row among the rendered rows. */
  row: number;
  column: string;
}

export interface CellEditing {
  editingCell: EditingCell | null;
  editValue: DataTableValue;
  /** Start editing `column` of the rendered row `rowIndex` with its current value (no-op if already editing it). */
  beginEdit: (rowIndex: number, columnKey: string, value: DataTableValue) => void;
  setEditValue: (value: DataTableValue) => void;
  /** Validate and commit through `onCellEdit`; an invalid value keeps the editor open. */
  commitEdit: () => void;
  cancelEdit: () => void;
}

/** Inline cell editing state for DataTable's edit mode. */
export function useCellEditing<T>({
  columns,
  onCellEdit,
}: {
  columns: DataTableColumn<T>[];
  onCellEdit?: DataTableProps<T>['onCellEdit'];
}): CellEditing {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<DataTableValue>('');

  const beginEdit = useLatestCallback((rowIndex: number, columnKey: string, value: DataTableValue) => {
    if (editingCell?.row === rowIndex && editingCell.column === columnKey) return;
    setEditingCell({ row: rowIndex, column: columnKey });
    setEditValue(value);
  });

  const commitEdit = useLatestCallback(() => {
    if (!editingCell || !onCellEdit) return;
    const column = columns.find((col) => col.key === editingCell.column);
    if (column?.validate && column.validate(editValue)) return;
    onCellEdit(editingCell.row, editingCell.column, editValue);
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
