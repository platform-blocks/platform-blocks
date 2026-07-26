import { MutableRefObject, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

import type { KnobMark } from '../types';
import { pickAdjacentMark } from '../utils/marks';

/** Coarse steps (shift) move ten detents at once. */
const COARSE_MULTIPLIER = 10;
/** Page keys cross a tenth of the range, independent of `step`. */
const PAGE_FRACTION = 0.1;

const getKeyFromEvent = (event: any) => {
  const nativeEvent = event?.nativeEvent ?? event;
  return (nativeEvent?.key ?? nativeEvent?.code ?? event?.key) as string | undefined;
};

export type UseKnobKeyboardParams = {
  disabled: boolean;
  readOnly: boolean;
  min: number;
  max: number;
  step: number;
  isEndless: boolean;
  restrictToMarks: boolean;
  marksNormalized: KnobMark[];
  valueRef: MutableRefObject<number>;
  handleValueUpdate: (value: number, final: boolean) => void;
  isRTL: boolean;
};

/**
 * Keyboard and assistive-technology adjustment for the knob.
 *
 * The surface already advertises `accessibilityRole="adjustable"` and takes focus, so this
 * is what makes that promise true: arrows nudge by `step`, shift makes them coarse, page
 * keys cross a tenth of the range, and Home/End pin to the bounds. Every keypress commits
 * (`final: true`) because there is no gesture to end.
 *
 * Physical keys are web-only, mirroring the rest of the library; on native the same moves
 * are exposed as increment/decrement accessibility actions, which is how VoiceOver and
 * TalkBack drive an adjustable control.
 */
export const useKnobKeyboard = ({
  disabled,
  readOnly,
  min,
  max,
  step,
  isEndless,
  restrictToMarks,
  marksNormalized,
  valueRef,
  handleValueUpdate,
  isRTL,
}: UseKnobKeyboardParams) => {
  const locked = disabled || readOnly;

  const steps = useMemo(() => {
    const span = Math.abs(max - min);
    const base = Number.isFinite(step) && step > 0 ? step : span > 0 ? span / 100 : 1;
    return {
      base,
      coarse: base * COARSE_MULTIPLIER,
      page: span > 0 ? span * PAGE_FRACTION : base * COARSE_MULTIPLIER,
    };
  }, [min, max, step]);

  const nudge = useCallback(
    (direction: 1 | -1, amount: number) => {
      if (locked) return;
      // Detented knobs move between marks, not by `step` — a `step`-sized nudge would
      // usually re-snap to the mark it started on and look frozen.
      if (restrictToMarks && marksNormalized.length) {
        const next = pickAdjacentMark(valueRef.current, marksNormalized, direction);
        if (next !== valueRef.current) handleValueUpdate(next, true);
        return;
      }
      handleValueUpdate(valueRef.current + direction * amount, true);
    },
    [locked, restrictToMarks, marksNormalized, valueRef, handleValueUpdate]
  );

  const jumpToBound = useCallback(
    (bound: 'min' | 'max') => {
      // Endless knobs have no absolute ends to jump to.
      if (locked || isEndless) return false;
      if (restrictToMarks && marksNormalized.length) {
        const target = bound === 'min' ? marksNormalized[0] : marksNormalized[marksNormalized.length - 1];
        handleValueUpdate(target.value, true);
        return true;
      }
      handleValueUpdate(bound === 'min' ? min : max, true);
      return true;
    },
    [locked, isEndless, restrictToMarks, marksNormalized, handleValueUpdate, min, max]
  );

  const handleKeyDown = useCallback(
    (event: any) => {
      if (locked) return;
      const key = getKeyFromEvent(event);
      if (!key) return;

      // Horizontal arrows follow reading order, so they swap under RTL. Vertical ones don't.
      const forwardKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = isRTL ? 'ArrowRight' : 'ArrowLeft';
      const amount = event?.shiftKey ? steps.coarse : steps.base;

      let handled = true;
      if (key === forwardKey || key === 'ArrowUp') {
        nudge(1, amount);
      } else if (key === backwardKey || key === 'ArrowDown') {
        nudge(-1, amount);
      } else if (key === 'PageUp') {
        nudge(1, steps.page);
      } else if (key === 'PageDown') {
        nudge(-1, steps.page);
      } else if (key === 'Home') {
        handled = jumpToBound('min');
      } else if (key === 'End') {
        handled = jumpToBound('max');
      } else {
        handled = false;
      }

      if (!handled) return;
      // Otherwise arrows scroll the page and Home/End jump it to the ends.
      event?.preventDefault?.();
      event?.stopPropagation?.();
    },
    [locked, isRTL, steps, nudge, jumpToBound]
  );

  const handleAccessibilityAction = useCallback(
    (event: any) => {
      const actionName = event?.nativeEvent?.actionName;
      if (actionName === 'increment') nudge(1, steps.base);
      else if (actionName === 'decrement') nudge(-1, steps.base);
    },
    [nudge, steps]
  );

  const keyboardHandlers = useMemo(
    () =>
      Platform.OS === 'web'
        ? { onKeyDown: handleKeyDown, tabIndex: (disabled ? -1 : 0) as 0 | -1 }
        : {},
    [handleKeyDown, disabled]
  );

  const accessibilityActions = useMemo(
    () =>
      locked
        ? undefined
        : ([
          { name: 'increment', label: 'Increase value' },
          { name: 'decrement', label: 'Decrease value' },
        ] as const),
    [locked]
  );

  return {
    keyboardHandlers,
    accessibilityActions,
    onAccessibilityAction: locked ? undefined : handleAccessibilityAction,
  };
};
