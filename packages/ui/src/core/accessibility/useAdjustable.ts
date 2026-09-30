import { useCallback, useMemo, useRef } from 'react';
import type { AccessibilityActionEvent, AccessibilityActionInfo } from 'react-native';

import { useLatestCallback } from '../hooks/useLatestCallback';
import { isWeb } from '../platform';
import { useDirection } from '../providers/DirectionProvider';
import { a11yProps, type A11yProps, type IdRefs } from './a11yProps';
import { consumeEvent, readKey, type KeyboardEventLike } from './keyboard';

/** Shift+arrow moves this many steps. */
const COARSE_MULTIPLIER = 10;
/** Default PageUp/PageDown distance: a tenth of the range. */
const PAGE_FRACTION = 0.1;

export interface UseAdjustableOptions {
  value: number;
  min: number;
  max: number;
  /** Arrow-key / accessibility-action step. Default: 1, or 1% of the range if `step <= 0`. */
  step?: number;
  /** PageUp/PageDown distance. Default: 10% of the range. */
  largeStep?: number;
  /** Called with every new value. */
  onChange: (value: number) => void;
  /** Called after each discrete adjustment (keyboard, accessibility action). */
  onChangeEnd?: (value: number) => void;
  /** Accessible name. */
  label?: string;
  labelledBy?: IdRefs;
  describedBy?: IdRefs;
  /** Native hint. */
  hint?: string;
  /** Spoken value (`'40 percent'`), or a formatter. */
  valueText?: string | ((value: number) => string);
  /** Default `'horizontal'`. Only horizontal arrows swap under RTL. */
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  readOnly?: boolean;
  /** Override reading direction. Default: `useDirection().isRTL`. */
  rtl?: boolean;
  /**
   * Endless controls (a rotary knob with no stops): values are not clamped and
   * Home/End do nothing.
   */
  endless?: boolean;
  /**
   * Custom stepping (detents, marks): the next value from `current` in
   * `direction` for a nudge of `amount`. Result is still clamped (unless endless).
   */
  getNextValue?: (current: number, direction: 1 | -1, amount: number) => number;
  /** Values for Home/End. Default `min` / `max`. */
  getBoundValue?: (bound: 'min' | 'max') => number;
  /** Element id. */
  id?: string;
}

export type AdjustableProps = A11yProps & {
  /** Web only: the thumb is a tab stop unless disabled. */
  tabIndex?: 0 | -1;
  /** Web only. */
  onKeyDown?: (event: KeyboardEventLike) => void;
};

export interface UseAdjustableResult {
  /** Spread on the focusable thumb. */
  adjustableProps: AdjustableProps;
  /** Nudge up by `amount` (default `step`). */
  increment: (amount?: number) => void;
  /** Nudge down by `amount` (default `step`). */
  decrement: (amount?: number) => void;
  /** The key handler, for elements that route keys themselves. Returns true when handled. */
  handleKeyDown: (event: KeyboardEventLike) => boolean;
}

const INCREMENT_ACTIONS: ReadonlyArray<AccessibilityActionInfo> = [
  { name: 'increment', label: 'Increase value' },
  { name: 'decrement', label: 'Decrease value' },
];

const decimalsOf = (n: number) => {
  if (!Number.isFinite(n)) return 0;
  const text = String(n);
  const e = text.indexOf('e-');
  if (e >= 0) return Number(text.slice(e + 2));
  const dot = text.indexOf('.');
  return dot >= 0 ? text.length - dot - 1 : 0;
};

/**
 * A value control's focusable thumb (Slider/RangeSlider thumbs, Knob, Wheel,
 * Rating): `role="slider"` (native: adjustable), `aria-value*`, native
 * increment/decrement accessibility actions, and web keys — arrows by `step`
 * (Shift: ×10; horizontal arrows swap under RTL), PageUp/PageDown by `largeStep`,
 * Home/End to the bounds. Each discrete change calls `onChange` then `onChangeEnd`.
 *
 * @example
 * const { adjustableProps } = useAdjustable({ value, min: 0, max: 100, step: 1, onChange: setValue, label: 'Volume' });
 * <View {...adjustableProps} />
 */
export function useAdjustable(options: UseAdjustableOptions): UseAdjustableResult {
  const {
    value,
    min,
    max,
    step,
    largeStep,
    label,
    labelledBy,
    describedBy,
    hint,
    valueText,
    orientation = 'horizontal',
    disabled = false,
    readOnly = false,
    endless = false,
    id,
  } = options;

  const direction = useDirection();
  const rtl = options.rtl ?? direction.isRTL;
  const locked = disabled || readOnly;

  const onChange = useLatestCallback(options.onChange);
  const onChangeEnd = useLatestCallback(options.onChangeEnd);
  const getNextValue = useLatestCallback(options.getNextValue);
  const getBoundValue = useLatestCallback(options.getBoundValue);
  const hasGetNextValue = options.getNextValue !== undefined;
  const hasGetBoundValue = options.getBoundValue !== undefined;

  // Latest value, updated synchronously on each commit so rapid key repeats
  // between renders build on each other instead of on a stale prop.
  const valueRef = useRef(value);
  valueRef.current = value;

  const steps = useMemo(() => {
    const span = Math.abs(max - min);
    const base = step !== undefined && Number.isFinite(step) && step > 0 ? step : span > 0 && step !== undefined ? span / 100 : 1;
    const page = largeStep !== undefined && largeStep > 0 ? largeStep : span > 0 ? span * PAGE_FRACTION : base * COARSE_MULTIPLIER;
    return { base, coarse: base * COARSE_MULTIPLIER, page, precision: Math.max(decimalsOf(base), decimalsOf(min)) };
  }, [min, max, step, largeStep]);

  const normalize = useCallback(
    (next: number) => {
      let result = Number(next.toFixed(Math.min(steps.precision, 10)));
      if (!endless) result = Math.min(max, Math.max(min, result));
      return result;
    },
    [steps.precision, endless, min, max]
  );

  const commit = useCallback(
    (next: number) => {
      const normalized = normalize(next);
      if (normalized === valueRef.current) return;
      valueRef.current = normalized;
      onChange(normalized);
      onChangeEnd(normalized);
    },
    [normalize, onChange, onChangeEnd]
  );

  const nudge = useCallback(
    (dir: 1 | -1, amount: number) => {
      if (locked) return;
      const current = valueRef.current;
      commit(hasGetNextValue ? getNextValue(current, dir, amount) ?? current : current + dir * amount);
    },
    [locked, commit, hasGetNextValue, getNextValue]
  );

  const increment = useCallback((amount?: number) => nudge(1, amount ?? steps.base), [nudge, steps.base]);
  const decrement = useCallback((amount?: number) => nudge(-1, amount ?? steps.base), [nudge, steps.base]);

  const handleKeyDown = useCallback(
    (event: KeyboardEventLike): boolean => {
      if (locked || event.defaultPrevented) return false;
      const { key, shift } = readKey(event);
      const swap = rtl && orientation === 'horizontal';
      const forwardKey = swap ? 'ArrowLeft' : 'ArrowRight';
      const backwardKey = swap ? 'ArrowRight' : 'ArrowLeft';
      const amount = shift ? steps.coarse : steps.base;

      if (key === forwardKey || key === 'ArrowUp') nudge(1, amount);
      else if (key === backwardKey || key === 'ArrowDown') nudge(-1, amount);
      else if (key === 'PageUp') nudge(1, steps.page);
      else if (key === 'PageDown') nudge(-1, steps.page);
      else if (key === 'Home' || key === 'End') {
        // Endless controls have no ends to jump to.
        if (endless) return false;
        const bound = key === 'Home' ? 'min' : 'max';
        commit(hasGetBoundValue ? getBoundValue(bound) ?? (bound === 'min' ? min : max) : bound === 'min' ? min : max);
      } else {
        return false;
      }
      // Otherwise arrows scroll the page and Home/End jump it to the ends.
      consumeEvent(event);
      return true;
    },
    [locked, rtl, orientation, steps, nudge, endless, commit, hasGetBoundValue, getBoundValue, min, max]
  );

  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      const name = event.nativeEvent.actionName;
      if (name === 'increment') nudge(1, steps.base);
      else if (name === 'decrement') nudge(-1, steps.base);
    },
    [nudge, steps.base]
  );

  const resolvedValueText = typeof valueText === 'function' ? valueText(value) : valueText;

  const adjustableProps = useMemo<AdjustableProps>(() => {
    const props: AdjustableProps = a11yProps({
      role: 'slider',
      id,
      label,
      labelledBy,
      describedBy,
      hint,
      disabled,
      readOnly,
      orientation,
      value: {
        min: endless ? undefined : min,
        max: endless ? undefined : max,
        now: value,
        text: resolvedValueText,
      },
      actions: locked ? undefined : INCREMENT_ACTIONS,
      onAction: locked ? undefined : onAccessibilityAction,
    });
    if (isWeb) {
      props.tabIndex = disabled ? -1 : 0;
      props.onKeyDown = (event: KeyboardEventLike) => {
        handleKeyDown(event);
      };
    }
    return props;
  }, [id, label, labelledBy, describedBy, hint, disabled, readOnly, orientation, endless, min, max, value, resolvedValueText, locked, onAccessibilityAction, handleKeyDown]);

  return { adjustableProps, increment, decrement, handleKeyDown };
}
