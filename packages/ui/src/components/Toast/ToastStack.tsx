import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Toast } from './Toast';
import type { ToastPosition as ToastScreenPosition, ToastItem } from './ToastProvider';
import type { ToastPosition as ToastDirection } from './types';
import { useReducedMotion } from './useReducedMotion';

/**
 * Height assumed for a toast that has not reported its layout yet. It is only
 * ever read for a single frame, and only for the toast that just mounted, since
 * every toast behind it in the stack has already been measured.
 */
const ESTIMATED_TOAST_HEIGHT = 64;

/**
 * Repositioning spring. Critically-ish damped: the stack closes a gap decisively
 * and stops, because a toast that wobbles into place reads as a glitch rather
 * than as polish.
 */
const REFLOW_SPRING = {
  damping: 26,
  stiffness: 240,
  mass: 0.85,
  overshootClamping: false,
  restDisplacementThreshold: 0.1,
  restSpeedThreshold: 0.1,
} as const;

type StackAnchor = 'top' | 'bottom';

interface ToastStackItemProps {
  /** Distance from the anchored edge, in px. */
  offset: number;
  anchor: StackAnchor;
  zIndex: number;
  animate: boolean;
  onMeasure: (height: number) => void;
  onHoverChange: (hovered: boolean) => void;
  onFocusChange: (focused: boolean) => void;
  children: React.ReactNode;
}

/**
 * One slot in the stack. Owns nothing but its position: the toast inside runs
 * its own enter/exit transition, and this wrapper only slides the slot when the
 * toasts around it change.
 */
function ToastStackItem({
  offset,
  anchor,
  zIndex,
  animate,
  onMeasure,
  onHoverChange,
  onFocusChange,
  children,
}: ToastStackItemProps) {
  // A bottom-anchored stack grows upward, so its offsets run negative.
  const target = anchor === 'top' ? offset : -offset;
  const translate = useSharedValue(target);

  useEffect(() => {
    // The initial value is already `target`, so the first pass is a no-op and a
    // freshly mounted toast never slides in from a stale slot.
    translate.value = animate ? withSpring(target, REFLOW_SPRING) : target;
  }, [target, animate, translate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translate.value }],
  }), []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    onMeasure(event.nativeEvent.layout.height);
  }, [onMeasure]);

  const hoverProps = {
    onMouseEnter: () => onHoverChange(true),
    onMouseLeave: () => onHoverChange(false),
    onFocus: () => onFocusChange(true),
    onBlur: () => onFocusChange(false),
  } as any;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          [anchor]: 0,
          zIndex,
        } as ViewStyle,
        animatedStyle,
      ]}
      // Deliberately hit-testable: `box-none` puts an element out of reach of
      // the pointer, so the hover handlers here would never fire and the stack
      // would never pause. The slot is exactly as wide and tall as the toast it
      // holds, so leaving it hit-testable costs no extra hit area.
      onLayout={handleLayout}
      {...hoverProps}
    >
      {children}
    </Animated.View>
  );
}

export interface ToastStackLayout {
  /** Distance from the anchored edge for each toast id. */
  offsets: Record<string, number>;
  /** Bounds the stack needs so no toast sits outside its container. */
  stackHeight: number;
  /** Offsets to reuse for toasts that are on their way out. */
  pinned: Record<string, number>;
}

/**
 * Places every toast in a stack as a distance from the anchored edge.
 *
 * Two rules produce the whole behaviour:
 *
 * - The newest toast is at offset 0. Older toasts sit further from the edge, in
 *   the order they arrived.
 * - A toast that is leaving does not advance the cursor and keeps the offset it
 *   held while visible. The toasts behind it therefore move into its slot the
 *   moment it starts leaving, instead of waiting for it to unmount.
 *
 * Exported for testing: this is where a stack looks broken or correct, and it
 * is pure, so it can be checked without driving animations.
 */
export function computeStackLayout(
  items: Pick<ToastItem, 'id' | 'visible'>[],
  heights: Record<string, number>,
  spacing: number,
  previousPinned: Record<string, number>,
): ToastStackLayout {
  // Newest first: index 0 sits against the anchored edge.
  const ordered = [...items].reverse();
  const offsets: Record<string, number> = {};
  const pinned: Record<string, number> = {};
  let cursor = 0;
  let extent = 0;

  ordered.forEach(item => {
    const height = heights[item.id] ?? ESTIMATED_TOAST_HEIGHT;
    if (item.visible) {
      offsets[item.id] = cursor;
      pinned[item.id] = cursor;
      cursor += height + spacing;
      extent = Math.max(extent, cursor - spacing);
      return;
    }
    // Leaving: hold position, and don't advance the cursor so the toasts behind
    // it slide into the space it is vacating.
    const held = previousPinned[item.id] ?? cursor;
    offsets[item.id] = held;
    pinned[item.id] = held;
    extent = Math.max(extent, held + height);
  });

  return { offsets, stackHeight: extent, pinned };
}

export interface ToastStackProps {
  /** Screen position this stack is anchored to, e.g. `top-right`. */
  position: ToastScreenPosition;
  /** Toasts for this position, oldest first. */
  items: ToastItem[];
  /** Absolute/fixed placement style for the stack container. */
  containerStyle: ViewStyle;
  /** Vertical gap between toasts. */
  spacing: number;
  onClose: (id: string) => void;
  onExited: (id: string) => void;
}

const directionFor = (position: ToastScreenPosition): ToastDirection => {
  if (position.endsWith('-left')) return 'left';
  if (position.endsWith('-right')) return 'right';
  return position.startsWith('bottom') ? 'bottom' : 'top';
};

/**
 * Renders one screen position's toasts.
 *
 * The stack is laid out by hand rather than by flexbox because the two things
 * that make a multi-toast stack feel broken both happen at the moment the list
 * changes, and neither is expressible in flow layout:
 *
 * 1. A leaving toast has to keep the position it is leaving from while the
 *    toasts behind it close the gap. In flow layout the gap only closes when the
 *    element unmounts, which is why the stack used to snap.
 * 2. An arriving toast must not disturb the toasts already on screen until it
 *    has a measured height, or every message on screen jumps by one frame.
 *
 * So each toast is absolutely positioned at a measured offset from the anchored
 * edge, and only the offsets animate. Toasts that are on their way out are
 * dropped from the offset run immediately and pinned to their last position, so
 * the gap closes underneath them while they fade.
 *
 * The newest toast always takes the slot nearest the anchored edge, in both top-
 * and bottom-anchored stacks: the most recent message is the one worth reading,
 * so it belongs in the one place the user's eye can learn.
 */
export function ToastStack({
  position,
  items,
  containerStyle,
  spacing,
  onClose,
  onExited,
}: ToastStackProps) {
  const anchor: StackAnchor = position.startsWith('bottom') ? 'bottom' : 'top';
  const direction = directionFor(position);
  const reducedMotion = useReducedMotion();

  const [heights, setHeights] = useState<Record<string, number>>({});
  // Last offset each toast held while it was still visible, so a leaving toast
  // can stay put while the rest of the stack moves.
  const pinnedOffsets = useRef<Record<string, number>>({});

  const setHeight = useCallback((id: string, height: number) => {
    setHeights(prev => (
      Math.abs((prev[id] ?? 0) - height) < 0.5 ? prev : { ...prev, [id]: height }
    ));
  }, []);

  const { offsets, stackHeight, pinned } = useMemo(
    () => computeStackLayout(items, heights, spacing, pinnedOffsets.current),
    [items, heights, spacing]
  );
  pinnedOffsets.current = pinned;

  // Pausing is per stack, not per toast: reaching across one toast to press the
  // button on another must not cost you the one you were reaching for.
  //
  // Tracked as sets of ids rather than as a counter, because a toast removed
  // while the pointer is on it never gets to fire its leave event — with a
  // counter that leaks one "still hovered" forever and the stack stays frozen
  // for the rest of the session.
  const hoveredIds = useRef<Set<string>>(new Set());
  const focusedIds = useRef<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);

  const syncPaused = useCallback(() => {
    setPaused(hoveredIds.current.size > 0 || focusedIds.current.size > 0);
  }, []);

  const handleHoverChange = useCallback((id: string, hovered: boolean) => {
    if (hovered) hoveredIds.current.add(id);
    else hoveredIds.current.delete(id);
    syncPaused();
  }, [syncPaused]);

  const handleFocusChange = useCallback((id: string, focused: boolean) => {
    if (focused) focusedIds.current.add(id);
    else focusedIds.current.delete(id);
    syncPaused();
  }, [syncPaused]);

  // Forget everything about toasts that have left the tree: their measured
  // height, and any pointer or focus they were holding when they went. (Pins
  // need no cleanup — `computeStackLayout` rebuilds them from the live list.)
  useEffect(() => {
    const live = new Set(items.map(item => item.id));

    let released = false;
    [hoveredIds, focusedIds].forEach(ref => {
      ref.current.forEach(id => {
        if (live.has(id)) return;
        ref.current.delete(id);
        released = true;
      });
    });
    if (released) syncPaused();

    setHeights(prev => {
      const stale = Object.keys(prev).filter(id => !live.has(id));
      if (stale.length === 0) return prev;
      const next = { ...prev };
      stale.forEach(id => delete next[id]);
      return next;
    });
  }, [items, syncPaused]);

  if (items.length === 0) return null;

  const ordered = [...items].reverse();

  return (
    <View style={[containerStyle, { height: stackHeight }]} pointerEvents="box-none">
      {ordered.map((item, index) => {
        // Queue bookkeeping is the provider's business; only presentation props
        // reach the toast.
        const { id, visible, timestamp, priority, groupId, message, ...toastProps } = item;

        return (
          <ToastStackItem
            key={id}
            offset={offsets[id] ?? 0}
            anchor={anchor}
            // Newest paints above the toasts it is arriving in front of.
            zIndex={ordered.length - index}
            animate={!reducedMotion}
            onMeasure={height => setHeight(id, height)}
            onHoverChange={hovered => handleHoverChange(id, hovered)}
            onFocusChange={focused => handleFocusChange(id, focused)}
          >
            <Toast
              {...toastProps}
              visible={visible}
              position={direction}
              paused={paused}
              onClose={() => onClose(id)}
              onExited={() => onExited(id)}
            />
          </ToastStackItem>
        );
      })}
    </View>
  );
}
