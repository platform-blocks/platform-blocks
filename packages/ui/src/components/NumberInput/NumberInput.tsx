import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  View,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type PanResponderGestureState,
  type PanResponderInstance,
  type TextInput,
  type TextInputKeyPressEventData,
} from 'react-native';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { acquirePageScrollLock, releasePageScrollLock } from '../../core/gestures';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { isNative, isWeb } from '../../core/platform';
import { webStyle } from '../../core/platform/webStyle';
import type { WebKeyboardEvent } from '../../core/platform/webProps';
import { useKeyboardFocusOptional } from '../../core/providers/KeyboardManagerProvider';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { Icon } from '../Icon';
import { Input } from '../Input/Input';
import type { ExtendedTextInputProps } from '../Input/types';
import { createDragSelectionGuard } from './dragSelectionGuard';
import {
  DEFAULT_DECIMAL_SEPARATOR,
  formatDisplayValue,
  formatEditableValue,
  getCurrencySymbol,
  isShiftHeld,
  normalizeInput,
  resolveShiftMultiplier,
  type FormatOptions,
  type ModifierEventLike,
  type NormalizeOptions,
} from './numberFormat';
import type { NumberInputProps } from './types';

const DEFAULT_STEP_DELAY = 500;
const DEFAULT_STEP_INTERVAL = 100;
const DEFAULT_DRAG_STEP_DISTANCE = 16;
const MIN_DRAG_ACTIVATION_DISTANCE = 4;
/** Extra touch area around the 24px step buttons on native (hitSlop is ignored on web). */
const STEP_BUTTON_HIT_SLOP = 10;

type StepDirection = 'up' | 'down';

/** Text typed while focused, and the value it produced — shown only while the value still matches. */
interface EditDraft {
  text: string;
  forValue: number | null;
}

/**
 * Numeric text field with optional step buttons, arrow-key stepping, press-and-hold
 * repeat and press-and-drag scrubbing. Formats on blur (separators, prefix/suffix,
 * currency, percentage), edits raw digits while focused. On web the field is a
 * `spinbutton` with `aria-valuenow/min/max`. `ref` points at the TextInput.
 */
export const NumberInput = factory<{
  props: NumberInputProps;
  ref: TextInput;
}>(
  (props, ref) => {
    const {
      value,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      format = 'decimal',
      currency = 'USD',
      shiftMultiplier = 10,
      withControls = false,
      withSideButtons = false,
      hideControlsOnMobile = true,
      withDragGesture = false,
      dragAxis = 'horizontal',
      dragStepDistance = DEFAULT_DRAG_STEP_DISTANCE,
      dragStepMultiplier = 1,
      onDragStateChange,
      formatter,
      parser,
      clampBehavior = 'blur',
      allowEmpty = true,
      disabled,
      error,
      textInputProps,
      allowDecimal: allowDecimalProp,
      allowNegative = true,
      allowLeadingZeros = true,
      allowedDecimalSeparators,
      decimalSeparator = DEFAULT_DECIMAL_SEPARATOR,
      decimalScale,
      fixedDecimalScale = false,
      thousandSeparator,
      thousandsGroupStyle = 'thousand',
      prefix,
      suffix,
      isAllowed,
      startValue = 0,
      stepHoldDelay = DEFAULT_STEP_DELAY,
      stepHoldInterval = DEFAULT_STEP_INTERVAL,
      withKeyboardEvents = true,
      incrementLabel = 'Increase value',
      decrementLabel = 'Decrease value',
      endSection: userEndSection,
      startSection: userStartSection,
      onFocus: userOnFocus,
      onBlur: userOnBlur,
      keyboardFocusId,
      name,
      testID,
      ...restInputProps
    } = props;

    const theme = useTheme();
    const keyboardFocus = useKeyboardFocusOptional();

    // Passing `value` at all (even `undefined` = empty) makes the field controlled;
    // `null` is the internal "empty" so it can't be mistaken for "uncontrolled".
    const isControlled = Object.prototype.hasOwnProperty.call(props, 'value');
    const emitChange = useLatestCallback((next: number | null) => onChange?.(next ?? undefined));
    const [current, setCurrent] = useControllableState<number | null>({
      value: isControlled ? (value ?? null) : undefined,
      defaultValue: defaultValue ?? null,
      finalValue: null,
      onChange: emitChange,
    });

    const [focused, setFocused] = useState(false);
    const [draft, setDraft] = useState<EditDraft | null>(null);
    const inputRef = useRef<TextInput | null>(null);
    const mergedRef = useMergedRef<TextInput>(inputRef, ref);

    // The latest committed value, advanced synchronously by steps so a
    // press-and-hold repeat composes before the parent re-renders.
    const valueRef = useRef<number | null>(current);
    valueRef.current = current;

    const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const holdIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const stepCountRef = useRef(0);
    const holdActiveRef = useRef(false);
    const dragStateRef = useRef({
      active: false,
      dragStartValue: current ?? startValue,
      lastComputedValue: current ?? undefined,
      wasFocused: false,
    });

    const fallbackFocusId = useA11yId(undefined, 'number');
    const focusTargetId = useMemo(() => {
      for (const candidate of [keyboardFocusId, name, testID]) {
        if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate.trim();
      }
      return fallbackFocusId;
    }, [keyboardFocusId, name, testID, fallbackFocusId]);

    const requestFocusRestore = useCallback(() => {
      if (keyboardFocus) {
        keyboardFocus.refocus(focusTargetId);
        return;
      }
      requestAnimationFrame(() => inputRef.current?.focus?.());
    }, [keyboardFocus, focusTargetId]);

    const allowDecimal = allowDecimalProp ?? format !== 'integer';

    const resolvedDecimalScale = useMemo(() => {
      if (!allowDecimal) return 0;
      if (decimalScale !== undefined) return decimalScale;
      if (precision !== undefined) return precision;
      if (format === 'integer') return 0;
      return undefined;
    }, [allowDecimal, decimalScale, precision, format]);

    const resolvedThousandSeparator = useMemo(() => {
      if (typeof thousandSeparator === 'string') return thousandSeparator;
      if (thousandSeparator === true) return ',';
      if (thousandSeparator === false) return undefined;
      return format === 'currency' ? ',' : undefined;
    }, [thousandSeparator, format]);

    const allowedDecimalSeparatorsResolved = useMemo(() => {
      const set = new Set<string>(allowedDecimalSeparators ?? []);
      set.add(decimalSeparator);
      set.add(DEFAULT_DECIMAL_SEPARATOR);
      return Array.from(set);
    }, [allowedDecimalSeparators, decimalSeparator]);

    const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);
    const effectivePrefix = prefix ?? (format === 'currency' ? currencySymbol : undefined);
    const effectiveSuffix = suffix ?? (format === 'percentage' ? '%' : undefined);
    const resolvedShiftMultiplier = resolveShiftMultiplier(shiftMultiplier);

    const formatOptions = useMemo<FormatOptions>(
      () => ({
        format,
        currency,
        decimalSeparator,
        thousandSeparator: resolvedThousandSeparator,
        thousandsGroupStyle,
        decimalScale: resolvedDecimalScale,
        precision,
        fixedDecimalScale,
        prefix: effectivePrefix,
        suffix: effectiveSuffix,
        formatter,
        allowDecimal,
      }),
      [
        format,
        currency,
        decimalSeparator,
        resolvedThousandSeparator,
        thousandsGroupStyle,
        resolvedDecimalScale,
        precision,
        fixedDecimalScale,
        effectivePrefix,
        effectiveSuffix,
        formatter,
        allowDecimal,
      ]
    );

    const normalizationOptions = useMemo<NormalizeOptions>(
      () => ({
        allowDecimal,
        allowNegative,
        allowLeadingZeros,
        decimalSeparator,
        allowedDecimalSeparators: allowedDecimalSeparatorsResolved,
        decimalScale: resolvedDecimalScale,
        thousandSeparator: resolvedThousandSeparator,
        prefix: effectivePrefix,
        suffix: effectiveSuffix,
      }),
      [
        allowDecimal,
        allowNegative,
        allowLeadingZeros,
        decimalSeparator,
        allowedDecimalSeparatorsResolved,
        resolvedDecimalScale,
        resolvedThousandSeparator,
        effectivePrefix,
        effectiveSuffix,
      ]
    );

    const formatValue = useCallback((val: number) => formatDisplayValue(val, formatOptions), [formatOptions]);

    const toEditable = useCallback(
      (val: number) =>
        formatEditableValue(val, {
          allowDecimal,
          decimalScale: resolvedDecimalScale,
          fixedDecimalScale,
          decimalSeparator,
        }),
      [allowDecimal, resolvedDecimalScale, fixedDecimalScale, decimalSeparator]
    );

    const getModifierMultiplier = useCallback(
      (event?: ModifierEventLike | null) => (isShiftHeld(event) ? resolvedShiftMultiplier : 1),
      [resolvedShiftMultiplier]
    );

    const allowedChecker = useCallback(
      (nextValue: number, valueString: string) => {
        if (!isAllowed) return true;
        return isAllowed({ floatValue: nextValue, formattedValue: formatValue(nextValue), value: valueString });
      },
      [isAllowed, formatValue]
    );

    const resolvedMin = allowNegative ? min : Math.max(min ?? 0, 0);

    const clampValue = useCallback(
      (val: number): number => {
        let clamped = val;
        if (resolvedMin !== undefined && clamped < resolvedMin) clamped = resolvedMin;
        if (max !== undefined && clamped > max) clamped = max;
        return clamped;
      },
      [resolvedMin, max]
    );

    // Unfocused: the formatted value. Focused: what the user typed, as long as
    // the value is still the one that text produced (a step or an external
    // change shows the new value instead).
    const displayValue = (() => {
      if (!focused) return current === null ? '' : formatValue(current);
      if (draft && draft.forValue === current) return draft.text;
      return current === null ? '' : toEditable(current);
    })();

    const commit = useCallback(
      (next: number | null) => {
        valueRef.current = next;
        setCurrent(next);
      },
      [setCurrent]
    );

    const handleChangeText = useCallback(
      (text: string) => {
        const before = valueRef.current;

        if (parser) {
          const parsed = parser(text);
          if (!Number.isNaN(parsed)) {
            const clamped = clampBehavior === 'strict' ? clampValue(parsed) : parsed;
            if (allowedChecker(clamped, clamped.toString())) {
              setDraft({ text, forValue: clamped });
              commit(clamped);
              return;
            }
          } else if (allowEmpty && text === '') {
            setDraft({ text, forValue: null });
            commit(null);
            return;
          }
          setDraft({ text, forValue: before });
          return;
        }

        const normalized = normalizeInput(text, normalizationOptions);

        if (!normalized.hasValue || normalized.parsedValue === undefined) {
          if (allowEmpty && normalized.localized === '') {
            setDraft({ text: '', forValue: null });
            commit(null);
            return;
          }
          // A partial entry ('-', '.'): keep showing it, value unchanged.
          setDraft({ text: normalized.localized, forValue: before });
          return;
        }

        let nextValue = normalized.parsedValue;
        let nextText = normalized.localized;
        if (clampBehavior === 'strict') {
          nextValue = clampValue(nextValue);
          if (nextValue !== normalized.parsedValue) nextText = toEditable(nextValue);
        }

        if (!allowedChecker(nextValue, nextValue.toString())) {
          setDraft({ text: nextText, forValue: before });
          return;
        }

        setDraft({ text: nextText, forValue: nextValue });
        commit(nextValue);
      },
      [parser, clampBehavior, clampValue, allowEmpty, normalizationOptions, allowedChecker, toEditable, commit]
    );

    const handleFocus = useCallback(() => {
      setFocused(true);
      setDraft(null);
      userOnFocus?.();
    }, [userOnFocus]);

    const handleBlur = useCallback(() => {
      setFocused(false);
      setDraft(null);
      const latest = valueRef.current;
      if (clampBehavior === 'blur' && latest !== null) {
        const clamped = clampValue(latest);
        if (clamped !== latest && allowedChecker(clamped, clamped.toString())) {
          commit(clamped);
        }
      }
      userOnBlur?.();
    }, [clampBehavior, clampValue, allowedChecker, commit, userOnBlur]);

    const handleStep = useCallback(
      (direction: StepDirection, shouldRestoreFocus = false, multiplier = 1) => {
        if (disabled) return;
        const normalizedMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
        const stepSize = step * normalizedMultiplier;
        const effectiveStep = Number.isFinite(stepSize) && stepSize !== 0 ? stepSize : step;
        const latest = valueRef.current;

        let nextValue = latest === null ? startValue : latest + (direction === 'up' ? effectiveStep : -effectiveStep);
        if (!allowDecimal) nextValue = Math.round(nextValue);

        const clamped = clampValue(nextValue);
        if (!allowedChecker(clamped, clamped.toString())) return;

        commit(clamped);
        if (shouldRestoreFocus) requestFocusRestore();
      },
      [disabled, step, startValue, allowDecimal, clampValue, allowedChecker, commit, requestFocusRestore]
    );

    const clearHoldTimers = useCallback(() => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
      if (holdIntervalRef.current) {
        clearTimeout(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
    }, []);

    const scheduleNextStep = useCallback(
      (direction: StepDirection, multiplier: number) => {
        const interval =
          typeof stepHoldInterval === 'function' ? stepHoldInterval(stepCountRef.current) : stepHoldInterval;
        holdIntervalRef.current = setTimeout(() => {
          stepCountRef.current += 1;
          handleStep(direction, true, multiplier);
          scheduleNextStep(direction, multiplier);
        }, Math.max(interval ?? DEFAULT_STEP_INTERVAL, 0));
      },
      [handleStep, stepHoldInterval]
    );

    const startHold = useCallback(
      (direction: StepDirection, multiplier = 1) => {
        if (disabled) return;
        // The pan responder covers the whole field, controls included. Marking the hold keeps a
        // press on +/- from also arming the drag gesture and double-counting steps.
        holdActiveRef.current = true;
        clearHoldTimers();
        stepCountRef.current = 0;
        handleStep(direction, true, multiplier);
        holdTimeoutRef.current = setTimeout(() => {
          stepCountRef.current = 1;
          scheduleNextStep(direction, multiplier);
        }, Math.max(stepHoldDelay ?? DEFAULT_STEP_DELAY, 0));
      },
      [disabled, clearHoldTimers, handleStep, stepHoldDelay, scheduleNextStep]
    );

    const stopHold = useCallback(() => {
      holdActiveRef.current = false;
      clearHoldTimers();
      stepCountRef.current = 0;
    }, [clearHoldTimers]);

    useEffect(() => clearHoldTimers, [clearHoldTimers]);

    // --- Press-and-drag scrubbing ------------------------------------------------------------
    const selectionGuardRef = useRef<ReturnType<typeof createDragSelectionGuard> | null>(null);
    if (!selectionGuardRef.current) {
      selectionGuardRef.current = createDragSelectionGuard(() => inputRef.current);
    }
    const selectionGuard = selectionGuardRef.current;

    const effectiveDragStepDistance =
      Number.isFinite(dragStepDistance) && dragStepDistance > 0 ? dragStepDistance : DEFAULT_DRAG_STEP_DISTANCE;
    const dragActivationDistance = Math.max(MIN_DRAG_ACTIVATION_DISTANCE, effectiveDragStepDistance * 0.35);

    const notifyDragState = useLatestCallback((dragging: boolean) => onDragStateChange?.(dragging));

    const beginDrag = useCallback(() => {
      const state = dragStateRef.current;
      if (state.active || !withDragGesture || disabled || holdActiveRef.current) return;

      const latest = valueRef.current;
      state.active = true;
      state.dragStartValue = latest ?? startValue;
      state.lastComputedValue = latest ?? undefined;
      state.wasFocused = focused;
      selectionGuard.begin(dragAxis);
      // A scrub only claims the gesture once it clears the activation distance, so the
      // lock is taken here rather than on touch-down: before that point the touch still
      // belongs to the page and scrolling over the field is correct.
      acquirePageScrollLock();
      notifyDragState(true);
    }, [withDragGesture, disabled, startValue, focused, selectionGuard, dragAxis, notifyDragState]);

    const handleDragMove = useCallback(
      (gestureState: PanResponderGestureState) => {
        if (!withDragGesture || disabled) return;

        const state = dragStateRef.current;
        if (!state.active) beginDrag();
        if (!state.active) return;

        const delta = dragAxis === 'horizontal' ? gestureState.dx : -gestureState.dy;
        if (!Number.isFinite(delta)) return;

        const stepSize = step * (dragStepMultiplier || 1);
        if (!Number.isFinite(stepSize) || stepSize === 0) return;

        const relativeSteps = delta / effectiveDragStepDistance;
        const roundedSteps = allowDecimal ? Math.round(relativeSteps * 1e6) / 1e6 : Math.round(relativeSteps);
        let nextValue = state.dragStartValue + roundedSteps * stepSize;
        if (!Number.isFinite(nextValue)) return;
        if (!allowDecimal) nextValue = Math.round(nextValue);

        const clamped = clampValue(nextValue);
        if (!allowedChecker(clamped, clamped.toString())) return;

        // The browser keeps extending its own selection while the pointer is down, so the
        // highlight is cleared on every move rather than once at activation.
        selectionGuard.collapse();

        if (state.lastComputedValue === clamped) return;
        state.lastComputedValue = clamped;
        commit(clamped);
      },
      [
        withDragGesture,
        disabled,
        beginDrag,
        dragAxis,
        step,
        dragStepMultiplier,
        effectiveDragStepDistance,
        allowDecimal,
        clampValue,
        allowedChecker,
        selectionGuard,
        commit,
      ]
    );

    const endDrag = useCallback(() => {
      const state = dragStateRef.current;
      const blurredForDrag = selectionGuard.end();
      if (!state.active) return;

      const shouldRestoreFocus = (state.wasFocused || blurredForDrag) && !disabled;
      releasePageScrollLock();
      state.active = false;
      state.wasFocused = false;
      state.lastComputedValue = undefined;
      notifyDragState(false);
      if (shouldRestoreFocus) requestFocusRestore();
    }, [selectionGuard, disabled, notifyDragState, requestFocusRestore]);

    useEffect(() => {
      if (!withDragGesture || disabled) endDrag();
    }, [withDragGesture, disabled, endDrag]);

    // Unmount only: a live drag would otherwise leave the page-scroll lock and the
    // selection guard held. Keyed on nothing that changes during a drag.
    useEffect(
      () => () => {
        const state = dragStateRef.current;
        if (state.active) {
          state.active = false;
          state.wasFocused = false;
          state.lastComputedValue = undefined;
          releasePageScrollLock();
          notifyDragState(false);
        }
        selectionGuard.end();
      },
      [notifyDragState, selectionGuard]
    );

    // Created once and driven through latest-value refs. A PanResponder accumulates dx/dy in the
    // instance it was created with, so rebuilding it mid-gesture — which a controlled `value`
    // update does on every step — resets the travel and snaps the value back.
    const dragConfig = {
      enabled: withDragGesture,
      disabled: !!disabled,
      axis: dragAxis,
      activationDistance: dragActivationDistance,
    };
    const dragConfigRef = useRef(dragConfig);
    dragConfigRef.current = dragConfig;
    const dragBegin = useLatestCallback(beginDrag);
    const dragMove = useLatestCallback(handleDragMove);
    const dragEnd = useLatestCallback(endDrag);

    const panResponderRef = useRef<PanResponderInstance | null>(null);
    if (!panResponderRef.current) {
      panResponderRef.current = PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const config = dragConfigRef.current;
          if (!config.enabled || config.disabled || holdActiveRef.current) return false;
          const primaryDelta = config.axis === 'horizontal' ? Math.abs(gestureState.dx) : Math.abs(gestureState.dy);
          const crossDelta = config.axis === 'horizontal' ? Math.abs(gestureState.dy) : Math.abs(gestureState.dx);
          if (primaryDelta < config.activationDistance) return false;
          return primaryDelta >= crossDelta;
        },
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderGrant: () => dragBegin(),
        onPanResponderMove: (_, gestureState) => dragMove(gestureState),
        onPanResponderRelease: () => dragEnd(),
        onPanResponderTerminate: () => dragEnd(),
        onPanResponderTerminationRequest: () => false,
        // Once the scrub has out-argued the cross axis it owns the gesture, so an enclosing
        // native ScrollView is told to stand down for the rest of it.
        onShouldBlockNativeResponder: () => true,
      });
    }

    const dragGestureEnabled = withDragGesture && !disabled;

    // --- Step buttons ------------------------------------------------------------------------
    const styles = useThemedStyles(
      (t) => ({
        sideButton: [
          { minWidth: 24, minHeight: 24, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' } as const,
          webStyle({ cursor: 'pointer' }),
        ],
        spinner: { flexDirection: 'column' } as const,
        spinnerButton: [
          { minWidth: 24, paddingHorizontal: 4, paddingVertical: 2, alignItems: 'center', justifyContent: 'center' } as const,
          webStyle({ cursor: 'pointer' }),
        ],
        spinnerDivider: { borderBottomWidth: 1, borderBottomColor: t.backgrounds.border },
        row: { flexDirection: 'row', alignItems: 'center' } as const,
        stretchRow: { flexDirection: 'row', alignItems: 'stretch', gap: 4 } as const,
        startGap: { marginStart: 8 },
        disabled: { opacity: 0.4 },
      }),
      []
    );

    const showControls = withControls && !(hideControlsOnMobile && isNative);
    const comparisonValue = current ?? startValue;
    const disableIncrement = !!disabled || (max !== undefined && comparisonValue >= max);
    const disableDecrement = !!disabled || (resolvedMin !== undefined && comparisonValue <= resolvedMin);
    const iconColor = theme.text.secondary;

    const stepButtonProps = (direction: StepDirection, isDisabled: boolean) => ({
      onPressIn: (event: GestureResponderEvent) => startHold(direction, getModifierMultiplier(event as unknown as ModifierEventLike)),
      onPressOut: stopHold,
      onTouchEnd: stopHold,
      disabled: isDisabled,
      hitSlop: isWeb ? undefined : STEP_BUTTON_HIT_SLOP,
      ...a11yProps({
        role: 'button',
        label: direction === 'up' ? incrementLabel : decrementLabel,
        disabled: isDisabled,
      }),
    });

    const decrementSideButton = withSideButtons ? (
      <Pressable
        key="side-decrement"
        {...stepButtonProps('down', disableDecrement)}
        style={[styles.sideButton, disableDecrement && styles.disabled]}
      >
        <Icon name="minus" size={14} color={iconColor} />
      </Pressable>
    ) : null;

    const startSection = decrementSideButton ? (
      userStartSection ? (
        <View style={styles.row}>
          {decrementSideButton}
          <View style={styles.startGap}>{userStartSection}</View>
        </View>
      ) : (
        decrementSideButton
      )
    ) : (
      userStartSection
    );

    const endSections: React.ReactNode[] = [];
    if (withSideButtons) {
      endSections.push(
        <Pressable
          key="side-increment"
          {...stepButtonProps('up', disableIncrement)}
          style={[styles.sideButton, disableIncrement && styles.disabled]}
        >
          <Icon name="plus" size={14} color={iconColor} />
        </Pressable>
      );
    }
    if (showControls) {
      endSections.push(
        <View key="spinner" style={styles.spinner}>
          <Pressable
            {...stepButtonProps('up', disableIncrement)}
            style={[styles.spinnerButton, styles.spinnerDivider, disableIncrement && styles.disabled]}
          >
            <Icon name="chevron-up" size={12} color={iconColor} />
          </Pressable>
          <Pressable
            {...stepButtonProps('down', disableDecrement)}
            style={[styles.spinnerButton, disableDecrement && styles.disabled]}
          >
            <Icon name="chevron-down" size={12} color={iconColor} />
          </Pressable>
        </View>
      );
    }
    if (userEndSection && endSections.length > 0) {
      endSections.push(<View key="user">{userEndSection}</View>);
    }
    const endSection =
      endSections.length === 0 ? (userEndSection ?? null) : endSections.length === 1 ? endSections[0] : (
        <View style={styles.stretchRow}>{endSections}</View>
      );

    // --- Keyboard ----------------------------------------------------------------------------
    const userOnKeyPress = textInputProps?.onKeyPress;
    const userOnKeyDown = textInputProps?.onKeyDown;

    // react-native-web routes a TextInput's DOM keydown through `onKeyPress` (with the full
    // keyboard event); native reports hardware-keyboard arrows there too.
    const handleKeyPress = useCallback(
      (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        userOnKeyPress?.(event);
        if (isWeb) userOnKeyDown?.(event as unknown as WebKeyboardEvent);
        if (!withKeyboardEvents) return;
        const webEvent = event as unknown as Partial<WebKeyboardEvent>;
        if (webEvent.defaultPrevented) return;

        const key = webEvent.key ?? event.nativeEvent?.key;
        if (key !== 'ArrowUp' && key !== 'ArrowDown') return;
        webEvent.preventDefault?.();
        handleStep(key === 'ArrowUp' ? 'up' : 'down', false, getModifierMultiplier(event as unknown as ModifierEventLike));
      },
      [userOnKeyPress, userOnKeyDown, withKeyboardEvents, handleStep, getModifierMultiplier]
    );

    const enhancedTextInputProps = useMemo<ExtendedTextInputProps>(
      () => ({
        ...textInputProps,
        onKeyPress: handleKeyPress,
        // Web: announce as a spin button with its range (native keeps the text-field role).
        ...(isWeb
          ? a11yProps({
              role: 'spinbutton',
              value: {
                min: resolvedMin,
                max,
                now: current ?? undefined,
                text: current === null ? undefined : formatValue(current),
              },
            })
          : null),
      }),
      [textInputProps, handleKeyPress, resolvedMin, max, current, formatValue]
    );

    return (
      <Input
        {...restInputProps}
        ref={mergedRef}
        name={name}
        testID={testID}
        keyboardFocusId={focusTargetId}
        value={displayValue}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        onFocus={handleFocus}
        keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
        startSection={startSection}
        endSection={endSection}
        disabled={disabled}
        error={error}
        textInputProps={enhancedTextInputProps}
        containerProps={dragGestureEnabled ? panResponderRef.current.panHandlers : undefined}
      />
    );
  },
  { displayName: 'NumberInput' }
);
