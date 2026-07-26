import { MutableRefObject, useCallback, useMemo, useRef } from 'react';
import { Platform, type View } from 'react-native';

import {
  getArcAngleFromRatio,
  getArcRatioFromAngle,
  isAngleInArcDeadZone,
  type NormalizedArcConfig,
} from '../arc';
import type { NormalizedInteractionConfig } from '../interactionConfig';
import type { LayoutState } from './useKnobGeometry';
import { useKnobInteraction } from './useKnobInteraction';

export type UseKnobGesturesParams = {
  disabled: boolean;
  readOnly: boolean;
  interactionConfig: NormalizedInteractionConfig;
  isEndless: boolean;
  min: number;
  max: number;
  arcConfig: NormalizedArcConfig;
  gestureDegreeSpan: number;
  layoutState: LayoutState;
  handleValueUpdate: (value: number, final: boolean) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  onChangeEnd?: (value: number) => void;
  valueRef: MutableRefObject<number>;
  hostRef: MutableRefObject<View | null>;
  degreesToValueDelta: (degrees: number) => number;
  valueToAngle: (value: number) => number;
  isRTL: boolean;
};

export const useKnobGestures = ({
  disabled,
  readOnly,
  interactionConfig,
  isEndless,
  min,
  max,
  arcConfig,
  gestureDegreeSpan,
  layoutState,
  handleValueUpdate,
  onScrubStart,
  onScrubEnd,
  onChangeEnd,
  valueRef,
  hostRef,
  degreesToValueDelta,
  valueToAngle,
  isRTL,
}: UseKnobGesturesParams) => {
  const pointerModesFromConfig = useMemo(
    () => interactionConfig.modes.filter((mode) => mode !== 'scroll'),
    [interactionConfig]
  );
  const pointerModes = useMemo(() => {
    if (Platform.OS === 'web') return pointerModesFromConfig;
    // Force spin-only interaction on native/touch to reduce jitter from slide modes.
    return ['spin'];
  }, [pointerModesFromConfig]);
  const hasVerticalSlide = pointerModes.includes('vertical-slide');
  const hasHorizontalSlide = pointerModes.includes('horizontal-slide');
  const hasSlideModes = hasVerticalSlide || hasHorizontalSlide;
  const canSpin = pointerModes.includes('spin');
  const pointerGestureEnabled = pointerModes.length > 0;
  const spinDeadZoneDegrees = interactionConfig.spinDeadZoneDegrees ?? 0;
  const spinStopAtLimitsEnabled = interactionConfig.spinStopAtLimits && !isEndless;

  const lastDragAngleRef = useRef<number | null>(null);
  const resetLastDragAngle = useCallback(() => {
    lastDragAngleRef.current = null;
  }, []);

  // A press that never became a drag. Endless knobs are excluded: with no fixed mapping
  // from angle to value, there is nothing absolute to jump to.
  const tapToSetEnabled = interactionConfig.tapToSet && !isEndless && max > min;

  // Shared by the two ways a press can set a value outright: a press that starts scrubbing
  // on mouse-down, and a tap released without dragging on knobs that cannot spin at all.
  // Both should refuse the same bad targets.
  const isTapTargetActionable = useCallback(
    (x: number, y: number) => {
      if (!tapToSetEnabled) return false;
      const dx = x - layoutState.cx;
      const dy = layoutState.cy - y;

      // Near the centre a couple of pixels swing the angle wildly, so a press there is far
      // more likely to be a mis-hit than a deliberate request for some specific value.
      const deadRadius = layoutState.radius * interactionConfig.tapDeadRadiusRatio;
      if (Math.sqrt(dx * dx + dy * dy) < deadRadius) return false;

      // Pressing the gap between the two ends of a partial arc has no sensible answer;
      // snapping to whichever end is nearer would be a large, unrequested jump.
      const rawAngle = (Math.atan2(dx, dy) * 180) / Math.PI;
      return !isAngleInArcDeadZone(arcConfig, (rawAngle + 360) % 360);
    },
    [tapToSetEnabled, layoutState, interactionConfig.tapDeadRadiusRatio, arcConfig]
  );

  const updateFromPoint = useCallback(
    (x: number, y: number, final = false, fromGrant = false) => {
      const dx = x - layoutState.cx;
      const dy = layoutState.cy - y;
      const rawAngle = (Math.atan2(dx, dy) * 180) / Math.PI;
      let normalizedAngle = (rawAngle + 360) % 360;
      // On touch/native we see more positional noise, which makes endless/spin
      // jittery. Apply a small low-pass filter to smooth angle changes without
      // affecting web precision.
      if (Platform.OS !== 'web' && lastDragAngleRef.current != null) {
        const previous = lastDragAngleRef.current;
        const alpha = 0.25; // keep most of the new signal, lightly smooth
        // Choose the shortest direction around the circle to avoid jumps at 0/360.
        let delta = normalizedAngle - previous;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        const smoothed = previous + delta * alpha;
        normalizedAngle = (smoothed + 360) % 360;
      }

      if (spinStopAtLimitsEnabled && arcConfig.sweepAngle < 359.999) {
        const ratio = getArcRatioFromAngle(arcConfig, normalizedAngle, { clamp: true });
        normalizedAngle = getArcAngleFromRatio(arcConfig, ratio);
      }
      if (isEndless || spinStopAtLimitsEnabled) {
        const spanRaw = max - min;
        const span = spanRaw === 0 ? gestureDegreeSpan : Math.abs(spanRaw);
        if (!Number.isFinite(span) || span <= 0) return;

        if (lastDragAngleRef.current == null) {
          lastDragAngleRef.current = normalizedAngle;
          if (fromGrant) {
            if (spinStopAtLimitsEnabled) {
              const ratio = getArcRatioFromAngle(arcConfig, normalizedAngle);
              const absoluteValue = min + ratio * (max - min);
              handleValueUpdate(absoluteValue, final);
            } else {
              const currentAngle = valueToAngle(valueRef.current);
              let deltaInitial = normalizedAngle - currentAngle;
              if (deltaInitial > 180) deltaInitial -= 360;
              if (deltaInitial < -180) deltaInitial += 360;
              if (deltaInitial !== 0) {
                const nextValue = valueRef.current + (deltaInitial / gestureDegreeSpan) * span;
                handleValueUpdate(nextValue, final);
              }
            }
          }
          return;
        }

        let deltaAngle = normalizedAngle - lastDragAngleRef.current;
        if (deltaAngle > 180) deltaAngle -= 360;
        if (deltaAngle < -180) deltaAngle += 360;
        lastDragAngleRef.current = normalizedAngle;
        if (deltaAngle === 0) return;
        if (Math.abs(deltaAngle) < spinDeadZoneDegrees) {
          return;
        }
        const nextValue = valueRef.current + (deltaAngle / gestureDegreeSpan) * span;
        handleValueUpdate(nextValue, final);
        return;
      }

      // Spin-only platforms lock on press, so this is where a press lands its value. Hold
      // it to the same standard as a tap; mid-drag updates stay unguarded so the knob keeps
      // tracking the pointer even if it passes over the centre or the dead zone.
      if (fromGrant && !isTapTargetActionable(x, y)) return;

      const ratio = getArcRatioFromAngle(arcConfig, normalizedAngle);
      const nextValue = min + ratio * (max - min);
      handleValueUpdate(nextValue, final);
    },
    [
      arcConfig,
      handleValueUpdate,
      isEndless,
      layoutState,
      max,
      min,
      spinStopAtLimitsEnabled,
      valueRef,
      valueToAngle,
      spinDeadZoneDegrees,
      gestureDegreeSpan,
      isTapTargetActionable,
    ]
  );

  const handleTap = useCallback(
    (x: number, y: number) => {
      if (!isTapTargetActionable(x, y)) return;
      const dx = x - layoutState.cx;
      const dy = layoutState.cy - y;
      const rawAngle = (Math.atan2(dx, dy) * 180) / Math.PI;
      const ratio = getArcRatioFromAngle(arcConfig, (rawAngle + 360) % 360, { clamp: true });
      handleValueUpdate(min + ratio * (max - min), true);
    },
    [isTapTargetActionable, layoutState, arcConfig, handleValueUpdate, min, max]
  );

  const { panHandlers } = useKnobInteraction({
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
    isPressActionable: isTapTargetActionable,
  });

  return { panHandlers };
};
