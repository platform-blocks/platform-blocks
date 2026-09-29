import { useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';

import { isWeb } from '../../../core/platform/flags';
import { webStyle } from '../../../core/platform/webStyle';
import { DEFAULT_COLUMN_WIDTH } from '../utils';
import type { DataTableColumn } from '../types';
import type { ColumnWidths, PinSide } from './useColumnLayout';

export interface StickyColumns<T> {
  /** Sticky positioning is web-only (CSS `position: sticky`); a no-op on native. */
  stickyEnabled: boolean;
  /** Whether any visible column is pinned. */
  hasStickyColumns: boolean;
  /** Effective pin side: runtime (menu) pin, else the column's static `sticky`. */
  effectiveSticky: (column: DataTableColumn<T>) => PinSide | undefined;
  /**
   * Sticky positioning style for a header/body cell, or null when the column
   * isn't pinned. `bg` must be opaque so scrolled cells don't bleed through the
   * frozen column; `elevated` (header) sits above body sticky cells.
   */
  getStickyCellStyle: (column: DataTableColumn<T>, bg: string, elevated?: boolean) => ViewStyle | null;
}

/**
 * Pinned (sticky) columns. `left` pins to the leading edge and `right` to the
 * trailing edge using the logical `start` / `end` insets, so pins mirror in
 * RTL. Offsets are the cumulative width of the helper columns and the preceding
 * pinned columns on the same side; pinned columns should declare a numeric
 * `width` so the offsets line up exactly. The boundary column draws a hairline
 * (`dividerColor`) to mark the frozen region.
 */
export function useStickyColumns<T>({
  visibleColumns,
  pinnedColumns,
  columnWidths,
  leadingWidth,
  trailingWidth,
  dividerColor,
}: {
  visibleColumns: DataTableColumn<T>[];
  pinnedColumns: Record<string, PinSide>;
  columnWidths: ColumnWidths;
  /** Width of the helper columns before the data columns (select / expand). */
  leadingWidth: number;
  /** Width of the helper column after the data columns (actions). */
  trailingWidth: number;
  dividerColor: string;
}): StickyColumns<T> {
  const stickyEnabled = isWeb;

  const effectiveSticky = useCallback(
    (c: DataTableColumn<T>): PinSide | undefined => pinnedColumns[c.key] ?? c.sticky,
    [pinnedColumns]
  );

  const offsets = useMemo(() => {
    const start: Record<string, number> = {};
    const end: Record<string, number> = {};
    let lastStartKey: string | null = null;
    let firstEndKey: string | null = null;
    if (!stickyEnabled) return { start, end, lastStartKey, firstEndKey };

    const widthOf = (c: DataTableColumn<T>): number => {
      const w = columnWidths[c.key] ?? c.width;
      if (typeof w === 'number') return w;
      if (typeof c.minWidth === 'number') return c.minWidth;
      return DEFAULT_COLUMN_WIDTH;
    };

    let running = leadingWidth;
    for (const c of visibleColumns) {
      if (effectiveSticky(c) === 'left') {
        start[c.key] = running;
        running += widthOf(c);
        lastStartKey = c.key; // innermost start-pinned column → draws the divider
      }
    }
    running = trailingWidth;
    for (let i = visibleColumns.length - 1; i >= 0; i--) {
      const c = visibleColumns[i];
      if (effectiveSticky(c) === 'right') {
        end[c.key] = running;
        running += widthOf(c);
        firstEndKey = c.key; // innermost end-pinned column → draws the divider
      }
    }
    return { start, end, lastStartKey, firstEndKey };
  }, [stickyEnabled, visibleColumns, columnWidths, leadingWidth, trailingWidth, effectiveSticky]);

  const hasStickyColumns = useMemo(
    () => stickyEnabled && visibleColumns.some((c) => !!effectiveSticky(c)),
    [stickyEnabled, visibleColumns, effectiveSticky]
  );

  const getStickyCellStyle = useCallback(
    (column: DataTableColumn<T>, bg: string, elevated = false): ViewStyle | null => {
      const side = effectiveSticky(column);
      if (!stickyEnabled || !side) return null;
      const isStart = side === 'left';
      const offset = isStart ? offsets.start[column.key] : offsets.end[column.key];
      if (offset === undefined) return null;
      const isDivider = isStart ? offsets.lastStartKey === column.key : offsets.firstEndKey === column.key;
      const divider: ViewStyle | null = isDivider
        ? isStart
          ? { borderEndWidth: 1, borderEndColor: dividerColor }
          : { borderStartWidth: 1, borderStartColor: dividerColor }
        : null;
      return {
        ...webStyle({ position: 'sticky', zIndex: elevated ? 4 : 3 }),
        ...(isStart ? { start: offset } : { end: offset }),
        backgroundColor: bg,
        ...divider,
      };
    },
    [stickyEnabled, offsets, effectiveSticky, dividerColor]
  );

  return useMemo(
    () => ({ stickyEnabled, hasStickyColumns, effectiveSticky, getStickyCellStyle }),
    [stickyEnabled, hasStickyColumns, effectiveSticky, getStickyCellStyle]
  );
}
