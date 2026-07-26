import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';
import { PanResponder, Platform, View } from 'react-native';

import type { KnobInteractionMode } from '../types';
import type { LayoutState } from './useKnobGeometry';
import type { NormalizedInteractionConfig } from '../interactionConfig';

type InteractionState = {
  mode: KnobInteractionMode | null;
  locked: boolean;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  totalTravel: number;
  startSideX: 'left' | 'right';
  startSideY: 'top' | 'bottom';
  spinInitialized: boolean;
  startLocationX: number;
  startLocationY: number;
};

type UseKnobInteractionOptions = {
  disabled: boolean;
  readOnly: boolean;
  pointerGestureEnabled: boolean;
  hasSlideModes: boolean;
  hasVerticalSlide: boolean;
  hasHorizontalSlide: boolean;
  canSpin: boolean;
  interactionConfig: NormalizedInteractionConfig;
  layoutState: LayoutState;
  updateFromPoint: (x: number, y: number, final?: boolean, fromGrant?: boolean) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  onChangeEnd?: (value: number) => void;
  valueRef: MutableRefObject<number>;
  hostRef: MutableRefObject<View | null>;
  resetLastDragAngle: () => void;
  handleValueUpdate: (value: number, final: boolean) => void;
  degreesToValueDelta: (degrees: number) => number;
  isRTL: boolean;
  handleTap: (x: number, y: number) => void;
  isPressActionable: (x: number, y: number) => boolean;
};

/**
 * A wheel has no gesture end, so `scroll` stays the active mode for a beat after the last
 * event and then clears itself. Long enough to bridge the gaps between trackpad momentum
 * events, short enough that the mode doesn't linger once the fingers lift.
 */
const SCROLL_MODE_IDLE_MS = 250;

export const useKnobInteraction = ({
  disabled,
  readOnly,
  pointerGestureEnabled,
  hasSlideModes,
  hasVerticalSlide,
  hasHorizontalSlide,
  canSpin,
  interactionConfig,
  layoutState,
  updateFromPoint,
  onScrubStart,
  onScrubEnd,
  onChangeEnd,
  valueRef,
  hostRef,
  resetLastDragAngle,
  handleValueUpdate,
  degreesToValueDelta,
  isRTL,
  handleTap,
  isPressActionable,
}: UseKnobInteractionOptions) => {
  const selectionStateRef = useRef<{ count: number; prev?: string | null }>({ count: 0 });
  const interactionStateRef = useRef<InteractionState>({
    mode: null,
    locked: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    totalTravel: 0,
    startSideX: 'right',
    startSideY: 'bottom',
    spinInitialized: false,
    startLocationX: 0,
    startLocationY: 0,
  });

  const disableTextSelection = useCallback(() => {
    if (Platform.OS !== 'web') return;
    const doc = typeof document !== 'undefined' ? document : undefined;
    const body = doc?.body;
    if (!body) return;
    const state = selectionStateRef.current;
    if (state.count === 0) {
      state.prev = body.style.userSelect;
      body.style.userSelect = 'none';
    }
    state.count += 1;
  }, []);

  const restoreTextSelection = useCallback(() => {
    if (Platform.OS !== 'web') return;
    const doc = typeof document !== 'undefined' ? document : undefined;
    const body = doc?.body;
    if (!body) return;
    const state = selectionStateRef.current;
    if (state.count === 0) return;
    state.count -= 1;
    if (state.count === 0) {
      body.style.userSelect = state.prev ?? '';
      state.prev = undefined;
    }
  }, []);

  const scrollModeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setActiveInteractionMode = useCallback(
    (mode: KnobInteractionMode | null) => {
      const state = interactionStateRef.current;
      if (state.mode === mode) return;
      state.mode = mode;
      interactionConfig.onModeChange?.(mode);
    },
    [interactionConfig]
  );

  const clearScrollModeTimer = useCallback(() => {
    if (scrollModeTimerRef.current) {
      clearTimeout(scrollModeTimerRef.current);
      scrollModeTimerRef.current = null;
    }
  }, []);

  const markScrollModeActive = useCallback(() => {
    // A pointer drag owns the mode while it lasts; a stray wheel event mid-drag should not
    // steal it out from under the gesture that is actually moving the value.
    if (interactionStateRef.current.locked) return;
    setActiveInteractionMode('scroll');
    clearScrollModeTimer();
    scrollModeTimerRef.current = setTimeout(() => {
      scrollModeTimerRef.current = null;
      // Only stand down if nothing else has claimed the mode in the meantime.
      if (interactionStateRef.current.mode === 'scroll') {
        setActiveInteractionMode(null);
      }
    }, SCROLL_MODE_IDLE_MS);
  }, [setActiveInteractionMode, clearScrollModeTimer]);

  const handlePanGrant = useCallback(
    (event: any) => {
      if (disabled || readOnly || !pointerGestureEnabled) return;
      onScrubStart?.();
      const native = event.nativeEvent;
      if (Platform.OS === 'web') {
        native?.preventDefault?.();
        native?.stopPropagation?.();
      }
      const pageX = native.pageX ?? native.locationX ?? 0;
      const pageY = native.pageY ?? native.locationY ?? 0;
      const locationX = native.locationX ?? pageX;
      const locationY = native.locationY ?? pageY;
      const state = interactionStateRef.current;
      state.startX = pageX;
      state.startY = pageY;
      state.lastX = pageX;
      state.lastY = pageY;
      state.totalTravel = 0;
      state.startSideX = locationX < layoutState.cx ? 'left' : 'right';
      state.startSideY = locationY < layoutState.cy ? 'top' : 'bottom';
      // Kept for tap-to-set: on release `locationX/Y` are relative to whatever child ended
      // up under the pointer, so the press coordinates are the reliable ones.
      state.startLocationX = locationX;
      state.startLocationY = locationY;
      // The press itself starts scrubbing: it lands its value and locks into spin, so the
      // knob tracks the pointer from mouse-down instead of sitting inert until the pointer
      // travels `lockThresholdPx` or the button comes back up. Presses the tap guards reject
      // (the centre dead radius, the gap in a partial arc, endless knobs) still fall through
      // to threshold-based detection, which is what keeps the slide modes reachable.
      clearScrollModeTimer();
      const scrubOnPress = canSpin && (!hasSlideModes || isPressActionable(locationX, locationY));
      state.locked = scrubOnPress;
      state.spinInitialized = scrubOnPress;
      resetLastDragAngle();
      disableTextSelection();
      if (scrubOnPress) {
        setActiveInteractionMode('spin');
        updateFromPoint(locationX, locationY, false, true);
      } else {
        setActiveInteractionMode(null);
      }
    },
    [
      disabled,
      readOnly,
      pointerGestureEnabled,
      onScrubStart,
      layoutState,
      hasSlideModes,
      canSpin,
      resetLastDragAngle,
      disableTextSelection,
      setActiveInteractionMode,
      clearScrollModeTimer,
      updateFromPoint,
      isPressActionable,
    ]
  );

  const handlePanMove = useCallback(
    (event: any) => {
      if (disabled || readOnly || !pointerGestureEnabled) return;
      const native = event.nativeEvent;
      if (Platform.OS === 'web') {
        native?.preventDefault?.();
      }
      const pageX = native.pageX ?? native.locationX ?? 0;
      const pageY = native.pageY ?? native.locationY ?? 0;
      const locationX = native.locationX ?? pageX;
      const locationY = native.locationY ?? pageY;
      const state = interactionStateRef.current;

      if (!state.locked) {
        const dx = pageX - state.startX;
        const dy = pageY - state.startY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const travel = Math.sqrt(absDx * absDx + absDy * absDy);
        if (travel >= interactionConfig.lockThresholdPx) {
          const verticalDominant =
            hasVerticalSlide &&
            absDy > absDx * interactionConfig.slideDominanceRatio + interactionConfig.variancePx;
          const horizontalDominant =
            hasHorizontalSlide &&
            absDx > absDy * interactionConfig.slideDominanceRatio + interactionConfig.variancePx;

          let nextMode: KnobInteractionMode | null = null;
          if (verticalDominant) {
            nextMode = 'vertical-slide';
          } else if (horizontalDominant) {
            nextMode = 'horizontal-slide';
          } else if (canSpin) {
            nextMode = 'spin';
          }
          if (nextMode) {
            state.locked = true;
            state.spinInitialized = nextMode === 'spin';
            state.lastX = pageX;
            state.lastY = pageY;
            setActiveInteractionMode(nextMode);
            if (nextMode === 'spin') {
              updateFromPoint(locationX, locationY, false, true);
            }
          }
        }
        return;
      }

      switch (state.mode) {
        case 'vertical-slide': {
          const deltaRaw = -(pageY - state.lastY);
          state.lastY = pageY;
          if (Math.abs(deltaRaw) < interactionConfig.slideHysteresisPx) {
            return;
          }

          let multiplier = 1;
          if (interactionConfig.respectStartSide && state.startSideX === 'right') {
            multiplier *= -1;
          }
          const adjustedPx = deltaRaw * multiplier;
          const degrees = adjustedPx / interactionConfig.slideRatio;
          const valueDelta = degreesToValueDelta(degrees);
          if (valueDelta !== 0) {
            handleValueUpdate(valueRef.current + valueDelta, false);
          }
          break;
        }
        case 'horizontal-slide': {
          const deltaRaw = pageX - state.lastX;
          state.lastX = pageX;
          if (Math.abs(deltaRaw) < interactionConfig.slideHysteresisPx) {
            return;
          }

          let multiplier = 1;
          if (interactionConfig.respectStartSide && state.startSideY === 'bottom') {
            multiplier *= -1;
          }
          if (isRTL) {
            multiplier *= -1;
          }
          const adjustedPx = deltaRaw * multiplier;
          const degrees = adjustedPx / interactionConfig.slideRatio;
          const valueDelta = degreesToValueDelta(degrees);
          if (valueDelta !== 0) {
            handleValueUpdate(valueRef.current + valueDelta, false);
          }
          break;
        }
        case 'spin':
          updateFromPoint(locationX, locationY, false);
          break;
        default:
          break;
      }
    },
    [
      disabled,
      readOnly,
      pointerGestureEnabled,
      interactionConfig,
      hasVerticalSlide,
      hasHorizontalSlide,
      canSpin,
      setActiveInteractionMode,
      updateFromPoint,
      degreesToValueDelta,
      handleValueUpdate,
      valueRef,
      isRTL,
    ]
  );

  const handlePanEnd = useCallback(() => {
    resetLastDragAngle();
    restoreTextSelection();
    const state = interactionStateRef.current;
    // Never locking into a mode means the press neither scrubbed nor travelled past
    // `lockThresholdPx`. A press that could scrub already set its value on mouse-down, so
    // what is left here are the knobs that cannot spin at all (slide-only configurations),
    // where the release is still the only chance to honour tapToSet.
    const wasTap = !state.locked;
    state.locked = false;
    state.spinInitialized = false;
    setActiveInteractionMode(null);
    if (disabled || readOnly || !pointerGestureEnabled) return;
    if (wasTap) {
      handleTap(state.startLocationX, state.startLocationY);
    }
    onScrubEnd?.();
    onChangeEnd?.(valueRef.current);
  }, [
    disabled,
    readOnly,
    pointerGestureEnabled,
    onScrubEnd,
    onChangeEnd,
    valueRef,
    resetLastDragAngle,
    restoreTextSelection,
    setActiveInteractionMode,
    handleTap,
  ]);

  const handleWheel = useCallback(
    (event: any) => {
      if (Platform.OS !== 'web') return;
      const native = event?.nativeEvent ?? event;
      if (!interactionConfig.scroll.enabled) return;

      const shouldBlockScroll =
        interactionConfig.scroll.preventPageScroll && !disabled && !readOnly;
      if (shouldBlockScroll) {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        native?.preventDefault?.();
        native?.stopPropagation?.();
        native?.stopImmediatePropagation?.();
      }
      if (disabled || readOnly) return;
      const deltaY = native?.deltaY ?? 0;
      const deltaX = native?.deltaX ?? 0;
      const dominantDelta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX;
      if (!dominantDelta) return;
      // Wheel input is a real interaction mode, so report it the way the pointer gestures do
      // — `onModeChange` consumers (mode readouts, haptics, analytics) otherwise never see it.
      markScrollModeActive();
      const direction = interactionConfig.scroll.invert ? 1 : -1;
      const ratio = interactionConfig.scroll.ratio ?? 0.5;
      const nextValue = valueRef.current + dominantDelta * ratio * direction;
      handleValueUpdate(nextValue, true);
    },
    [
      interactionConfig.scroll,
      disabled,
      readOnly,
      handleValueUpdate,
      valueRef,
      markScrollModeActive,
    ]
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!interactionConfig.scroll.enabled) return;
    const node = hostRef.current as unknown as HTMLElement | null;
    if (!node?.addEventListener) return;

    const listener = (event: WheelEvent) => {
      handleWheel(event);
    };

    node.addEventListener('wheel', listener, { passive: false });
    return () => {
      node.removeEventListener('wheel', listener);
    };
  }, [interactionConfig.scroll.enabled, handleWheel, hostRef]);

  useEffect(() => () => restoreTextSelection(), [restoreTextSelection]);

  useEffect(() => () => clearScrollModeTimer(), [clearScrollModeTimer]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => pointerGestureEnabled && !disabled && !readOnly,
        onStartShouldSetPanResponderCapture: () => pointerGestureEnabled && !disabled && !readOnly,
        onMoveShouldSetPanResponder: () => pointerGestureEnabled && !disabled && !readOnly,
        onMoveShouldSetPanResponderCapture: () => pointerGestureEnabled && !disabled && !readOnly,
        onPanResponderGrant: handlePanGrant,
        onPanResponderMove: handlePanMove,
        onPanResponderRelease: handlePanEnd,
        onPanResponderTerminate: handlePanEnd,
      }),
    [
      disabled,
      readOnly,
      pointerGestureEnabled,
      handlePanGrant,
      handlePanMove,
      handlePanEnd,
    ]
  );

  return {
    panHandlers: panResponder.panHandlers,
  };
};
