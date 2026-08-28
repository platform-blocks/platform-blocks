import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform } from 'react-native';
import type {
  GestureResponderEvent,
  GestureResponderHandlers,
  LayoutChangeEvent,
  PanResponderGestureState,
  View,
  ViewStyle,
} from 'react-native';

import { acquirePageScrollLock, releasePageScrollLock } from './pageScrollLock';
import { acquireTextSelectionLock, releaseTextSelectionLock } from './textSelectionLock';
import { GESTURE_RESPONDER_LOCK, getGestureSurfaceStyle } from './gestureSurface';
import type { DragAxis, DragGestureCallback, DragPoint } from './types';

export interface UseDragGestureOptions {
  /** Turn the whole gesture off (disabled / read-only controls). Default true. */
  enabled?: boolean;
  /** Directions the surface consumes. Drives `touch-action` on web. Default `both`. */
  axis?: DragAxis;
  /**
   * Claim the gesture the moment the surface is touched, so a tap commits a
   * value and the drag is already ours before the browser or a parent
   * ScrollView can consider the touch a scroll. Default true.
   */
  claimOnStart?: boolean;
  /**
   * Travel (px) required before a *move* claims the gesture. Only consulted
   * when `claimOnStart` is false — controls that must let a tap fall through to
   * something else (a text field that also drag-scrubs) set this.
   */
  activationDistance?: number;
  /** Claim in the capture phase, outranking any child responders. Default false. */
  capture?: boolean;
  /** Hold the web page-scroll lock while dragging. Default true. */
  lockPageScroll?: boolean;
  /** Hold the web text-selection lock while dragging. Default true. */
  lockTextSelection?: boolean;
  /** Web cursor for the idle surface. */
  cursor?: string;
  /** Web cursor while a drag is in flight. Defaults to `cursor`. */
  activeCursor?: string;
  /** Fired once when the gesture is granted, with the press location. */
  onStart?: DragGestureCallback;
  /** Fired for every pointer sample while the gesture is held. */
  onMove?: DragGestureCallback;
  /** Fired once when the pointer is released. */
  onEnd?: DragGestureCallback;
  /** Fired instead of `onEnd` when the gesture is terminated (backgrounded, torn down). */
  onCancel?: () => void;
}

export interface UseDragGestureResult {
  /** Spread onto the View that owns the gesture. */
  panHandlers: GestureResponderHandlers;
  /** Web-only style props (`touch-action`, selection, cursor) for that same View. */
  surfaceStyle: ViewStyle;
  /** Attach to the same View — used to measure the surface's page origin. */
  ref: React.MutableRefObject<View | null>;
  /** Pass to the same View's `onLayout` (compose it if the caller needs its own). */
  onLayout: (event: LayoutChangeEvent) => void;
  /** True between grant and release/terminate. */
  isDragging: boolean;
  /** Latest known surface box, in page coordinates. */
  getSurfaceRect: () => { x: number; y: number; width: number; height: number };
}

type SurfaceRect = { x: number; y: number; width: number; height: number };

const EMPTY_RECT: SurfaceRect = { x: 0, y: 0, width: 0, height: 0 };

/**
 * The shared pan gesture used by every value control in the library
 * (Slider, Knob, Joystick, Rating, …).
 *
 * It exists because each of those had grown its own copy of the same four
 * concerns, each with slightly different bugs:
 *
 * 1. **Surface-relative coordinates.** `locationX/locationY` are relative to
 *    whatever view the touch landed on, which during a drag is whichever child
 *    happens to be under the finger — so they drift the moment a thumb slides
 *    beneath the pointer. This hook measures the surface once per gesture and
 *    derives every sample from `pageX/pageY`, which stays correct even when the
 *    finger leaves the control entirely.
 * 2. **Not losing the gesture to a scroll.** See `getGestureSurfaceStyle` and
 *    `GESTURE_RESPONDER_LOCK`: `touch-action` on web, termination-request and
 *    native-responder blocking on iOS/Android.
 * 3. **Page-scroll and text-selection locks**, taken on grant and released on
 *    every exit path including unmount.
 * 4. **Termination handling**, so a torn-down gesture cannot leave the page
 *    locked or a control stuck in its dragging state.
 */
export const useDragGesture = (options: UseDragGestureOptions = {}): UseDragGestureResult => {
  const {
    enabled = true,
    axis = 'both',
    claimOnStart = true,
    activationDistance = 0,
    capture = false,
    lockPageScroll = true,
    lockTextSelection = true,
    cursor,
    activeCursor,
    onStart,
    onMove,
    onEnd,
    onCancel,
  } = options;

  const surfaceRef = useRef<View | null>(null);
  const rectRef = useRef<SurfaceRect>(EMPTY_RECT);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const activeRef = useRef(false);
  const locksHeldRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Callbacks live in a ref so the PanResponder is created once. Re-creating it
  // between a grant and a move swaps the handler identity mid-gesture, which is
  // how drags used to die when a parent re-rendered.
  const handlersRef = useRef({ onStart, onMove, onEnd, onCancel, enabled });
  handlersRef.current = { onStart, onMove, onEnd, onCancel, enabled };

  const configRef = useRef({ claimOnStart, activationDistance, lockPageScroll, lockTextSelection });
  configRef.current = { claimOnStart, activationDistance, lockPageScroll, lockTextSelection };

  const measureSurface = useCallback(() => {
    const node = surfaceRef.current as any;
    if (!node) return;

    if (Platform.OS === 'web') {
      const rect = node.getBoundingClientRect?.();
      if (!rect) return;
      const scrollX = typeof window !== 'undefined' ? window.scrollX || window.pageXOffset || 0 : 0;
      const scrollY = typeof window !== 'undefined' ? window.scrollY || window.pageYOffset || 0 : 0;
      rectRef.current = {
        x: rect.left + scrollX,
        y: rect.top + scrollY,
        width: rect.width,
        height: rect.height,
      };
      return;
    }

    node.measureInWindow?.((x: number, y: number, width: number, height: number) => {
      if (typeof x !== 'number' || typeof width !== 'number') return;
      rectRef.current = { x, y, width, height };
      // A gesture already in flight adopts the authoritative measurement as soon
      // as it lands, replacing the synchronous estimate taken on grant.
      if (activeRef.current) originRef.current = { x, y };
    });
  }, []);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    rectRef.current = { ...rectRef.current, width, height };
    measureSurface();
  }, [measureSurface]);

  const acquireLocks = useCallback(() => {
    if (locksHeldRef.current) return;
    locksHeldRef.current = true;
    if (configRef.current.lockPageScroll) acquirePageScrollLock();
    if (configRef.current.lockTextSelection) acquireTextSelectionLock();
  }, []);

  const releaseLocks = useCallback(() => {
    if (!locksHeldRef.current) return;
    locksHeldRef.current = false;
    if (configRef.current.lockPageScroll) releasePageScrollLock();
    if (configRef.current.lockTextSelection) releaseTextSelectionLock();
  }, []);

  const toPoint = useCallback((
    event: GestureResponderEvent,
    flags: { isFirst?: boolean; isFinal?: boolean } = {}
  ): DragPoint => {
    const native: any = event?.nativeEvent ?? {};
    const pageX = typeof native.pageX === 'number' ? native.pageX : 0;
    const pageY = typeof native.pageY === 'number' ? native.pageY : 0;
    const origin = originRef.current ?? { x: rectRef.current.x, y: rectRef.current.y };
    const x = pageX - origin.x;
    const y = pageY - origin.y;
    const start = startRef.current ?? { x, y };
    const dx = x - start.x;
    const dy = y - start.y;

    return {
      x,
      y,
      width: rectRef.current.width,
      height: rectRef.current.height,
      dx,
      dy,
      distance: Math.sqrt(dx * dx + dy * dy),
      pageX,
      pageY,
      isFirst: !!flags.isFirst,
      isFinal: !!flags.isFinal,
    };
  }, []);

  const beginGesture = useCallback((event: GestureResponderEvent) => {
    const native: any = event?.nativeEvent ?? {};
    const pageX = typeof native.pageX === 'number' ? native.pageX : 0;
    const pageY = typeof native.pageY === 'number' ? native.pageY : 0;
    const locationX = typeof native.locationX === 'number' ? native.locationX : 0;
    const locationY = typeof native.locationY === 'number' ? native.locationY : 0;

    // Synchronous estimate so the very first sample of the gesture is already
    // usable: at grant the press is on the surface, so page − location is its
    // origin. `measureSurface` refines it a beat later on native.
    originRef.current = { x: pageX - locationX, y: pageY - locationY };
    measureSurface();

    activeRef.current = true;
    startRef.current = null;
    const point = toPoint(event, { isFirst: true });
    startRef.current = { x: point.x, y: point.y };

    acquireLocks();
    setIsDragging(true);
    handlersRef.current.onStart?.(point, { event, state: null });
  }, [acquireLocks, measureSurface, toPoint]);

  const endGesture = useCallback((
    event: GestureResponderEvent | null,
    state: PanResponderGestureState | null,
    cancelled: boolean
  ) => {
    const wasActive = activeRef.current;
    activeRef.current = false;
    releaseLocks();
    setIsDragging(false);
    if (!wasActive) return;
    if (cancelled) {
      handlersRef.current.onCancel?.();
    } else if (event) {
      handlersRef.current.onEnd?.(toPoint(event, { isFinal: true }), { event, state });
    }
    startRef.current = null;
    originRef.current = null;
  }, [releaseLocks, toPoint]);

  const panResponder = useMemo(() => {
    const shouldClaimOnStart = () => handlersRef.current.enabled && configRef.current.claimOnStart;

    const shouldClaimOnMove = (_event: GestureResponderEvent, state: PanResponderGestureState) => {
      if (!handlersRef.current.enabled) return false;
      if (configRef.current.claimOnStart) return true;
      const { activationDistance: slop } = configRef.current;
      const travelled = axis === 'x'
        ? Math.abs(state.dx)
        : axis === 'y'
          ? Math.abs(state.dy)
          : Math.sqrt(state.dx * state.dx + state.dy * state.dy);
      return travelled > slop;
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: shouldClaimOnStart,
      onStartShouldSetPanResponderCapture: capture ? shouldClaimOnStart : () => false,
      onMoveShouldSetPanResponder: shouldClaimOnMove,
      onMoveShouldSetPanResponderCapture: capture ? shouldClaimOnMove : () => false,
      onPanResponderGrant: (event) => {
        if (!handlersRef.current.enabled) return;
        beginGesture(event);
      },
      onPanResponderMove: (event, state) => {
        if (!handlersRef.current.enabled || !activeRef.current) return;
        handlersRef.current.onMove?.(toPoint(event), { event, state });
      },
      onPanResponderRelease: (event, state) => endGesture(event, state, false),
      onPanResponderTerminate: () => endGesture(null, null, true),
      ...GESTURE_RESPONDER_LOCK,
    });
  }, [axis, capture, beginGesture, endGesture, toPoint]);

  // A component torn down mid-drag (route change, conditional render) must not
  // leave the page unscrollable or unselectable.
  useEffect(() => () => {
    activeRef.current = false;
    releaseLocks();
  }, [releaseLocks]);

  // Losing `enabled` mid-drag is the same as a termination.
  useEffect(() => {
    if (!enabled && activeRef.current) endGesture(null, null, true);
  }, [enabled, endGesture]);

  const surfaceStyle = useMemo(() => getGestureSurfaceStyle({
    axis,
    enabled,
    cursor: isDragging ? (activeCursor ?? cursor) : cursor,
  }), [axis, enabled, cursor, activeCursor, isDragging]);

  const getSurfaceRect = useCallback(() => rectRef.current, []);

  return {
    panHandlers: panResponder.panHandlers,
    surfaceStyle,
    ref: surfaceRef,
    onLayout: handleLayout,
    isDragging,
    getSurfaceRect,
  };
};
