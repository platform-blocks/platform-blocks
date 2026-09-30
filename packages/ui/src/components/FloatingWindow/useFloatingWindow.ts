import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { useDragGesture } from '../../core/gestures/useDragGesture';
import type { FloatingWindowInitialPosition, FloatingWindowPosition, UseFloatingWindowOptions, UseFloatingWindowReturn } from './types';
function resolve(position: FloatingWindowInitialPosition, width: number, height: number): FloatingWindowPosition {
  const window = Dimensions.get('window');
  return { x: position.left ?? (position.right == null ? 20 : window.width - position.right - width), y: position.top ?? (position.bottom == null ? 20 : window.height - position.bottom - height) };
}
export function useFloatingWindow({ initialPosition = { top: 20, left: 20 }, enabled = true, constrainToViewport = true, constrainOffset = 0, axis, onPositionChange, onDragStart, onDragEnd, setPositionRef }: UseFloatingWindowOptions = {}): UseFloatingWindowReturn {
  const [size, setSizeState] = useState({ width: 0, height: 0 });
  const [position, setPositionState] = useState(() => resolve(initialPosition, 0, 0));
  const current = useRef(position); current.current = position;
  const start = useRef(position);
  const positionedAfterMeasure = useRef(false);
  const moved = useRef(false);
  const clamp = useCallback((next: FloatingWindowPosition) => {
    if (!constrainToViewport) return next;
    const viewport = Dimensions.get('window');
    return { x: Math.max(constrainOffset, Math.min(viewport.width - size.width - constrainOffset, next.x)), y: Math.max(constrainOffset, Math.min(viewport.height - size.height - constrainOffset, next.y)) };
  }, [constrainToViewport, constrainOffset, size]);
  const setPosition = useCallback((next: FloatingWindowInitialPosition) => { moved.current = true; const value = clamp(resolve(next, size.width, size.height)); setPositionState(value); onPositionChange?.(value); }, [clamp, size, onPositionChange]);
  useEffect(() => {
    if (!positionedAfterMeasure.current && size.width > 0 && size.height > 0) {
      positionedAfterMeasure.current = true;
      if (!moved.current && (initialPosition.right != null || initialPosition.bottom != null)) setPositionState(clamp(resolve(initialPosition, size.width, size.height)));
    } else if (positionedAfterMeasure.current) {
      setPositionState((previous) => { const next = clamp(previous); return next.x === previous.x && next.y === previous.y ? previous : next; });
    }
  }, [size, clamp, initialPosition]);
  useEffect(() => { if (setPositionRef) setPositionRef.current = { setPosition }; return () => { if (setPositionRef) setPositionRef.current = null; }; }, [setPositionRef, setPosition]);
  const dragHandlers = useDragGesture({ enabled, claimOnStart: false, activationDistance: 4, cursor: 'move', activeCursor: 'grabbing', onStart: () => { moved.current = true; start.current = current.current; onDragStart?.(); }, onMove: (point) => { const value = clamp({ x: start.current.x + (axis === 'y' ? 0 : point.dx), y: start.current.y + (axis === 'x' ? 0 : point.dy) }); setPositionState(value); }, onEnd: (point) => { const value = clamp({ x: start.current.x + (axis === 'y' ? 0 : point.dx), y: start.current.y + (axis === 'x' ? 0 : point.dy) }); setPositionState(value); onPositionChange?.(value); onDragEnd?.(); } });
  return { position, isDragging: dragHandlers.isDragging, setPosition, setSize: (width, height) => setSizeState((old) => old.width === width && old.height === height ? old : { width, height }), dragHandlers };
}
