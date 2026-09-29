import { useCallback, useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from 'react';
import type { GestureResponderEvent } from 'react-native';

import { hasDOM } from '../../../core/platform/flags';
import { useDirection } from '../../../core/providers/DirectionProvider';
import type { DataTableColumn } from '../types';
import type { ColumnWidths } from './useColumnLayout';

/** Narrowest a column can be dragged to, whatever its `minWidth`. */
const MIN_RESIZE_WIDTH = 40;
/** Starting width for a column without a numeric width or `minWidth`. */
const FALLBACK_START_WIDTH = 120;

interface ResizeSession {
  key: string;
  startX: number;
  startWidth: number;
  minWidth?: number;
  maxWidth?: number;
  pendingWidth: number | null;
  frame: number | null;
  detach: (() => void) | null;
}

interface PointerLike {
  pageX?: number;
  touches?: ArrayLike<{ pageX: number }>;
}

const pageXOf = (event: PointerLike): number => event.pageX ?? event.touches?.[0]?.pageX ?? 0;

export interface ColumnResizeHandlers<T> {
  /** Starts a drag from the handle's responder grant. */
  beginResize: (event: GestureResponderEvent, column: DataTableColumn<T>) => void;
  /** Native drag updates (web uses document listeners). */
  onResponderMove: (event: GestureResponderEvent) => void;
  /** Ends the drag (release / terminate). */
  endResize: () => void;
}

/**
 * Drag-to-resize for DataTable columns. Pointer moves are coalesced into at
 * most one `setColumnWidths` per animation frame (a raw mousemove handler would
 * re-render every row dozens of times per frame); the final width is applied
 * synchronously when the drag ends. Persistence is debounced by the caller
 * (`usePersistedPref`), so a drag produces a single storage write.
 *
 * Web tracks the pointer with document listeners so the drag continues outside
 * the handle; native uses the handle's responder move events. The handle sits
 * on the trailing edge, so in RTL dragging towards the start widens the column.
 */
export function useColumnResize<T>({
  enabled,
  columnWidths,
  setColumnWidths,
}: {
  enabled: boolean;
  columnWidths: ColumnWidths;
  setColumnWidths: Dispatch<SetStateAction<ColumnWidths>>;
}): ColumnResizeHandlers<T> {
  const { isRTL } = useDirection();
  const sessionRef = useRef<ResizeSession | null>(null);
  const widthsRef = useRef(columnWidths);
  widthsRef.current = columnWidths;
  const rtlRef = useRef(isRTL);
  rtlRef.current = isRTL;

  const applyWidth = useCallback(
    (key: string, width: number) => {
      setColumnWidths((prev) => (prev[key] === width ? prev : { ...prev, [key]: width }));
    },
    [setColumnWidths]
  );

  const flushFrame = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    if (session.frame !== null) {
      cancelAnimationFrame(session.frame);
      session.frame = null;
    }
    if (session.pendingWidth !== null) {
      applyWidth(session.key, session.pendingWidth);
      session.pendingWidth = null;
    }
  }, [applyWidth]);

  const moveTo = useCallback(
    (pageX: number) => {
      const session = sessionRef.current;
      if (!session) return;
      const delta = (pageX - session.startX) * (rtlRef.current ? -1 : 1);
      let width = session.startWidth + delta;
      if (session.minWidth) width = Math.max(session.minWidth, width);
      if (session.maxWidth) width = Math.min(session.maxWidth, width);
      session.pendingWidth = Math.max(MIN_RESIZE_WIDTH, width);
      if (session.frame === null) {
        session.frame = requestAnimationFrame(() => {
          const current = sessionRef.current;
          if (!current) return;
          current.frame = null;
          if (current.pendingWidth !== null) {
            applyWidth(current.key, current.pendingWidth);
            current.pendingWidth = null;
          }
        });
      }
    },
    [applyWidth]
  );

  const endResize = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    flushFrame();
    session.detach?.();
    sessionRef.current = null;
  }, [flushFrame]);

  const beginResize = useCallback(
    (event: GestureResponderEvent, column: DataTableColumn<T>) => {
      if (!enabled || !column.resizable) return;
      endResize();
      const current = widthsRef.current[column.key];
      const session: ResizeSession = {
        key: column.key,
        startX: event.nativeEvent.pageX ?? 0,
        startWidth: typeof current === 'number' ? current : column.minWidth || FALLBACK_START_WIDTH,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        pendingWidth: null,
        frame: null,
        detach: null,
      };
      sessionRef.current = session;

      if (hasDOM) {
        const onMove = (ev: MouseEvent | TouchEvent) => moveTo(pageXOf(ev as PointerLike));
        const onUp = () => endResize();
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onUp);
        session.detach = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          document.removeEventListener('touchmove', onMove);
          document.removeEventListener('touchend', onUp);
        };
      }
    },
    [enabled, endResize, moveTo]
  );

  const onResponderMove = useCallback(
    (event: GestureResponderEvent) => {
      if (!hasDOM) moveTo(event.nativeEvent.pageX);
    },
    [moveTo]
  );

  // Drop listeners / pending frames if the table unmounts mid-drag.
  useEffect(() => () => endResize(), [endResize]);

  return useMemo(() => ({ beginResize, onResponderMove, endResize }), [beginResize, onResponderMove, endResize]);
}
