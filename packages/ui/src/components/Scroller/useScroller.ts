import { useCallback, useRef, useState } from 'react';
import type { ScrollView } from 'react-native';
import { useDirection } from '../../core/providers/DirectionProvider';
import type { UseScrollerOptions, UseScrollerReturn } from './types';
export function useScroller({ scrollAmount = 200, draggable = true }: UseScrollerOptions = {}): UseScrollerReturn {
  const ref = useRef<ScrollView>(null);
  const { isRTL } = useDirection();
  const [offset, setOffset] = useState(0);
  const [viewport, setViewport] = useState(0);
  const [content, setContent] = useState(0);
  const [isDragging, setDragging] = useState(false);
  const origin = useRef({ x: 0, offset: 0 });
  const max = Math.max(0, content - viewport);
  const move = useCallback((direction: -1 | 1) => {
    const next = Math.max(0, Math.min(max, offset + direction * (isRTL ? -1 : 1) * scrollAmount));
    ref.current?.scrollTo({ x: next, animated: true });
    setOffset(next);
  }, [isRTL, max, offset, scrollAmount]);
  return {
    ref, canScrollStart: isRTL ? offset < max - 1 : offset > 1, canScrollEnd: isRTL ? offset > 1 : offset < max - 1,
    isDragging, scrollStart: () => move(-1), scrollEnd: () => move(1),
    onScroll: (event) => setOffset(event.nativeEvent.contentOffset.x),
    onLayout: (event) => setViewport(event.nativeEvent.layout.width),
    onContentSizeChange: (width) => setContent(width),
    dragHandlers: {
      onMouseDown: (event) => { if (!draggable) return; origin.current = { x: event.clientX ?? 0, offset }; setDragging(true); },
      onMouseMove: (event) => { if (!isDragging) return; const next = Math.max(0, Math.min(max, origin.current.offset + origin.current.x - (event.clientX ?? 0))); ref.current?.scrollTo({ x: next, animated: false }); setOffset(next); },
      onMouseUp: () => setDragging(false), onMouseLeave: () => setDragging(false),
    },
  };
}
