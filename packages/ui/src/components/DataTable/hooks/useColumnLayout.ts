import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import { readPref, usePersistedPref } from '../persistence';
import type { DataTableColumn } from '../types';

export type ColumnWidths = Record<string, number | string>;
export type PinSide = 'left' | 'right';

interface UseColumnLayoutOptions<T> {
  /** Persistence key (`DataTable` `id`). */
  id?: string;
  columns: DataTableColumn<T>[];
  initialHiddenColumns: string[];
  onColumnVisibilityChange?: (hidden: string[]) => void;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
}

export interface ColumnLayout<T> {
  /** Columns in display order (hidden ones included). */
  orderedColumns: DataTableColumn<T>[];
  /** Columns in display order, hidden ones removed. */
  visibleColumns: DataTableColumn<T>[];
  hiddenColumns: string[];
  hiddenSet: ReadonlySet<string>;
  setHiddenColumns: Dispatch<SetStateAction<string[]>>;
  columnWidths: ColumnWidths;
  setColumnWidths: Dispatch<SetStateAction<ColumnWidths>>;
  pinnedColumns: Record<string, PinSide>;
  setColumnPin: (columnKey: string, side: PinSide | null) => void;
  /** Move column `fromKey` to `toKey`'s position within the full order. */
  reorderColumn: (fromKey: string, toKey: string) => void;
  /** Move a column one slot towards the start (-1) or end (1) among the visible columns. */
  moveColumn: (columnKey: string, dir: -1 | 1) => void;
  resetColumns: () => void;
}

function validHidden<T>(hidden: string[], columns: DataTableColumn<T>[]): string[] {
  const keys = new Set(columns.map((column) => column.key));
  const next = hidden.filter((key) => keys.has(key));
  return columns.length > 0 && next.length === columns.length ? next.filter((key) => key !== columns[0].key) : next;
}

/** Calls `callback(value)` whenever `value` changes after mount (never for the initial value). */
function useOnChange<V>(value: V, callback: (value: V) => void): void {
  const initial = useRef(true);
  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    callback(value);
  }, [value, callback]);
}

/**
 * Column widths, visibility, pinning and order for DataTable, persisted per
 * `id` (debounced) and reported through the change callbacks only when they
 * actually change.
 */
export function useColumnLayout<T>({
  id,
  columns,
  initialHiddenColumns,
  onColumnVisibilityChange,
  columnOrder: controlledColumnOrder,
  onColumnOrderChange,
}: UseColumnLayoutOptions<T>): ColumnLayout<T> {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() => {
    const initial: ColumnWidths = {};
    columns.forEach((c) => {
      if (c.width) initial[c.key] = c.width;
    });
    return { ...initial, ...readPref<ColumnWidths>(id, 'columnWidths', {}) };
  });
  const [hiddenColumns, setInternalHiddenColumns] = useState<string[]>(() =>
    validHidden(readPref<string[]>(id, 'hiddenColumns', initialHiddenColumns), columns)
  );
  const setHiddenColumns = useCallback<Dispatch<SetStateAction<string[]>>>(
    (next) => setInternalHiddenColumns((previous) =>
      validHidden(typeof next === 'function' ? next(previous) : next, columns)
    ),
    [columns]
  );
  // Runtime column pinning overrides the static `column.sticky` (menu-driven).
  const [pinnedColumns, setPinnedColumns] = useState<Record<string, PinSide>>(() => {
    const fromColumns: Record<string, PinSide> = {};
    columns.forEach((c) => {
      if (c.sticky) fromColumns[c.key] = c.sticky;
    });
    return readPref<Record<string, PinSide>>(id, 'pinnedColumns', fromColumns);
  });
  // Column ordering (drag-reorder). Uncontrolled unless `columnOrder` is passed.
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[] | null>(() =>
    readPref<string[] | null>(id, 'columnOrder', null)
  );

  usePersistedPref(id, 'hiddenColumns', hiddenColumns);
  usePersistedPref(id, 'columnWidths', columnWidths);
  usePersistedPref(id, 'pinnedColumns', pinnedColumns);
  usePersistedPref(id, 'columnOrder', internalColumnOrder);

  const notifyVisibility = useLatestCallback(onColumnVisibilityChange);
  useOnChange(hiddenColumns, notifyVisibility);

  const columnOrder = controlledColumnOrder ?? internalColumnOrder;

  // Apply the active order (if any), then append any columns not listed in it
  // (e.g. newly added ones) so nothing silently disappears.
  const orderedColumns = useMemo(() => {
    if (!columnOrder || columnOrder.length === 0) return columns;
    const byKey = new Map(columns.map((c) => [c.key, c]));
    const listed = new Set(columnOrder);
    const ordered = columnOrder
      .map((k) => byKey.get(k))
      .filter((c): c is DataTableColumn<T> => c !== undefined);
    const missing = columns.filter((c) => !listed.has(c.key));
    return [...ordered, ...missing];
  }, [columns, columnOrder]);

  const hiddenSet = useMemo<ReadonlySet<string>>(() => new Set(validHidden(hiddenColumns, columns)), [hiddenColumns, columns]);

  const visibleColumns = useMemo(
    () => orderedColumns.filter((c) => !hiddenSet.has(c.key)),
    [orderedColumns, hiddenSet]
  );

  const notifyOrder = useLatestCallback(onColumnOrderChange);
  const isOrderControlled = controlledColumnOrder !== undefined;

  const reorderColumn = useCallback(
    (fromKey: string, toKey: string) => {
      if (fromKey === toKey) return;
      const base = (columnOrder && columnOrder.length ? columnOrder : columns.map((c) => c.key)).slice();
      const from = base.indexOf(fromKey);
      const to = base.indexOf(toKey);
      if (from === -1 || to === -1) return;
      base.splice(from, 1);
      base.splice(to, 0, fromKey);
      if (!isOrderControlled) setInternalColumnOrder(base);
      notifyOrder(base);
    },
    [columnOrder, columns, isOrderControlled, notifyOrder]
  );

  const moveColumn = useCallback(
    (columnKey: string, dir: -1 | 1) => {
      const idx = visibleColumns.findIndex((c) => c.key === columnKey);
      const targetIdx = idx + dir;
      if (idx === -1 || targetIdx < 0 || targetIdx >= visibleColumns.length) return;
      reorderColumn(columnKey, visibleColumns[targetIdx].key);
    },
    [visibleColumns, reorderColumn]
  );

  const setColumnPin = useCallback((columnKey: string, side: PinSide | null) => {
    setPinnedColumns((prev) => {
      const next = { ...prev };
      if (side) next[columnKey] = side;
      else delete next[columnKey];
      return next;
    });
  }, []);

  const resetColumns = useCallback(() => {
    setHiddenColumns([]);
    const widths: ColumnWidths = {};
    const pins: Record<string, PinSide> = {};
    columns.forEach((column) => {
      if (column.width) widths[column.key] = column.width;
      if (column.sticky) pins[column.key] = column.sticky;
    });
    setColumnWidths(widths);
    setPinnedColumns(pins);
    setInternalColumnOrder(null);
    if (isOrderControlled) notifyOrder(columns.map((column) => column.key));
  }, [columns, isOrderControlled, notifyOrder, setHiddenColumns]);

  return useMemo(
    () => ({
      orderedColumns,
      visibleColumns,
      hiddenColumns,
      hiddenSet,
      setHiddenColumns,
      columnWidths,
      setColumnWidths,
      pinnedColumns,
      setColumnPin,
      reorderColumn,
      moveColumn,
      resetColumns,
    }),
    [
      orderedColumns,
      visibleColumns,
      hiddenColumns,
      hiddenSet,
      setHiddenColumns,
      columnWidths,
      pinnedColumns,
      setColumnPin,
      reorderColumn,
      moveColumn,
      resetColumns,
    ]
  );
}
