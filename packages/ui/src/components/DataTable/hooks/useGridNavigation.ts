import { useCallback, useMemo, useRef, useState } from 'react';

import { useRovingFocus } from '../../../core/accessibility/useRovingFocus';
import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import type { WebKeyboardEvent } from '../../../core/platform/webProps';

/** Rows jumped by PageUp / PageDown. */
const PAGE_ROWS = 10;

export interface GridNavigation {
  /** Keyboard navigation is active (web, interactive, non-virtual, ungrouped). */
  enabled: boolean;
  /** Flat index (`row * columns + col`) of the current tab stop. */
  activeIndex: number;
  /** Ref callback for a cell (stable per index). */
  getCellRef: (index: number) => (node: unknown) => void;
  /** Cell keydown handler (stable). */
  onCellKeyDown: (event: WebKeyboardEvent, index: number) => void;
  /** Cell focus handler (stable): makes a clicked / focused cell the tab stop. */
  onCellFocus: (index: number) => void;
}

/**
 * Roving-tabindex keyboard navigation over DataTable's data cells (ARIA grid
 * pattern): the grid is one tab stop; Arrow keys move by cell (mirrored in
 * RTL), Home / End go to the row ends (Ctrl/Cmd for the grid ends),
 * PageUp / PageDown move ten rows, Enter (via the cell's press handler) and
 * Space activate the cell. DOM focus moves with the tab stop, so the browser
 * scrolls the cell into view.
 */
export function useGridNavigation({
  enabled,
  rowCount,
  columnCount,
  onActivate,
}: {
  enabled: boolean;
  rowCount: number;
  columnCount: number;
  onActivate: (row: number, col: number) => void;
}): GridNavigation {
  const count = enabled ? rowCount * columnCount : 0;
  const [requestedIndex, setRequestedIndex] = useState(0);
  // The row set can shrink (paging, filtering); fall back to the first cell.
  const activeIndex = requestedIndex < count ? requestedIndex : 0;

  const roving = useRovingFocus({
    count,
    orientation: 'both',
    columns: Math.max(1, columnCount),
    loop: false,
    activeIndex,
    onActiveChange: setRequestedIndex,
  });

  // `getItemProps` changes identity with the tab stop, but the ref callbacks it
  // hands out are cached per index — so a stable accessor is safe to pass to
  // memoized rows.
  const rovingRef = useRef(roving);
  rovingRef.current = roving;

  const getCellRef = useCallback((index: number) => rovingRef.current.getItemProps(index).ref, []);

  const activate = useLatestCallback(onActivate);

  const onCellKeyDown = useCallback(
    (event: WebKeyboardEvent, index: number) => {
      // Keys typed into an editor inside the cell stay with the editor.
      if (event.target !== event.currentTarget) return;
      const { focusItem, handleKeyDown } = rovingRef.current;
      const columns = Math.max(1, columnCount);
      const row = Math.floor(index / columns);
      const col = index % columns;

      if (event.key === 'PageDown' || event.key === 'PageUp') {
        const step = event.key === 'PageDown' ? PAGE_ROWS : -PAGE_ROWS;
        const targetRow = Math.min(rowCount - 1, Math.max(0, row + step));
        event.preventDefault();
        focusItem(targetRow * columns + col);
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        activate(row, col);
        return;
      }
      handleKeyDown(event, index);
    },
    [columnCount, rowCount, activate]
  );

  const onCellFocus = useCallback((index: number) => setRequestedIndex(index), []);

  return useMemo(
    () => ({ enabled: count > 0, activeIndex, getCellRef, onCellKeyDown, onCellFocus }),
    [count, activeIndex, getCellRef, onCellKeyDown, onCellFocus]
  );
}
