import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useLatestCallback } from '../../../core/hooks/useLatestCallback';
import { hasDOM } from '../../../core/platform/flags';

/** The DOM API the drag listeners need (react-native-web host refs are DOM elements). */
interface DragNode {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  addEventListener(type: string, listener: (event: DragEvent) => void): void;
  removeEventListener(type: string, listener: (event: DragEvent) => void): void;
}

const isDragNode = (node: unknown): node is DragNode =>
  !!node &&
  typeof (node as Partial<DragNode>).addEventListener === 'function' &&
  typeof (node as Partial<DragNode>).setAttribute === 'function';

export interface ColumnReorderState {
  /** Ref callback for the header cell of `columnKey` (stable per key). */
  getHeaderRef: (columnKey: string) => (node: unknown) => void;
  /** Header currently hovered by a dragged column (drop indicator), if any. */
  dropTargetKey: string | null;
}

/**
 * Drag-to-reorder column headers (web). Uses native HTML5 drag and drop:
 * react-native-web's View drops `draggable` and the drag-event props, so the
 * attribute and listeners are attached imperatively to each header's DOM node.
 * A no-op on native and when disabled.
 */
export function useColumnReorder({
  enabled,
  columnKeys,
  reorderColumn,
}: {
  enabled: boolean;
  columnKeys: string[];
  reorderColumn: (fromKey: string, toKey: string) => void;
}): ColumnReorderState {
  const nodes = useRef(new Map<string, unknown>());
  const refCallbacks = useRef(new Map<string, (node: unknown) => void>());
  const [dropTargetKey, setDropTargetKey] = useState<string | null>(null);
  const reorder = useLatestCallback(reorderColumn);

  const getHeaderRef = useCallback((columnKey: string) => {
    let callback = refCallbacks.current.get(columnKey);
    if (!callback) {
      callback = (node: unknown) => {
        if (node) nodes.current.set(columnKey, node);
        else nodes.current.delete(columnKey);
      };
      refCallbacks.current.set(columnKey, callback);
    }
    return callback;
  }, []);

  // Re-bind when the set/order of visible columns changes.
  const keysSignature = columnKeys.join('\u0000');

  useEffect(() => {
    if (!hasDOM || !enabled) return undefined;
    let dragFrom: string | null = null;
    const cleanups: Array<() => void> = [];

    keysSignature.split('\u0000').forEach((key) => {
      const node = nodes.current.get(key);
      if (!isDragNode(node)) return;
      node.setAttribute('draggable', 'true');

      const onDragStart = (event: DragEvent) => {
        dragFrom = key;
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
          try {
            event.dataTransfer.setData('text/plain', key);
          } catch {
            /* some browsers reject setData outside dragstart */
          }
        }
      };
      const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        setDropTargetKey(dragFrom && dragFrom !== key ? key : null);
      };
      const onDragLeave = () => setDropTargetKey(null);
      const onDrop = (event: DragEvent) => {
        event.preventDefault();
        if (dragFrom) reorder(dragFrom, key);
        dragFrom = null;
        setDropTargetKey(null);
      };
      const onDragEnd = () => {
        dragFrom = null;
        setDropTargetKey(null);
      };

      node.addEventListener('dragstart', onDragStart);
      node.addEventListener('dragover', onDragOver);
      node.addEventListener('dragleave', onDragLeave);
      node.addEventListener('drop', onDrop);
      node.addEventListener('dragend', onDragEnd);
      cleanups.push(() => {
        node.removeAttribute('draggable');
        node.removeEventListener('dragstart', onDragStart);
        node.removeEventListener('dragover', onDragOver);
        node.removeEventListener('dragleave', onDragLeave);
        node.removeEventListener('drop', onDrop);
        node.removeEventListener('dragend', onDragEnd);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [enabled, keysSignature, reorder]);

  return useMemo(() => ({ getHeaderRef, dropTargetKey }), [getHeaderRef, dropTargetKey]);
}
