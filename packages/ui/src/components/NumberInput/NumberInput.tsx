import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Pressable, Platform, PanResponder } from 'react-native';
import type { PanResponderGestureState, PanResponderInstance } from 'react-native';
import { Input } from '../Input';
import { Icon } from '../Icon';
import { NumberInputProps } from './types';
import { ExtendedTextInputProps } from '../Input/types';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';

const DEFAULT_DECIMAL_SEPARATOR = '.';
const DEFAULT_STEP_DELAY = 500;
const DEFAULT_STEP_INTERVAL = 100;
const DEFAULT_DRAG_STEP_DISTANCE = 16;
const MIN_DRAG_ACTIVATION_DISTANCE = 4;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCurrencySymbol = (currency: string) => {
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    });
    const parts = formatter.formatToParts(0);
    return parts.find(part => part.type === 'currency')?.value ?? '';
  } catch {
    return '';
  }
};

const groupThousands = (
  intPart: string,
  separator: string | undefined,
  style: 'none' | 'thousand' | 'lakh' | 'wan'
) => {
  if (!separator || style === 'none') {
    return intPart;
  }

  const part = intPart === '' ? '0' : intPart;

  switch (style) {
    case 'lakh': {
      if (part.length <= 3) return part;
      const lastThree = part.slice(-3);
      let remaining = part.slice(0, -3);
      const groups: string[] = [];
      while (remaining.length > 2) {
        groups.unshift(remaining.slice(-2));
        remaining = remaining.slice(0, -2);
      }
      if (remaining.length) {
        groups.unshift(remaining);
      }
      return `${groups.join(separator)}${separator}${lastThree}`;
    }
    case 'wan':
      return part.replace(/\B(?=(\d{4})+(?!\d))/g, separator);
    case 'thousand':
    default:
      return part.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }
};

interface FormatOptions {
  format: NumberInputProps['format'];
  currency: string;
  decimalSeparator: string;
  thousandSeparator?: string;
  thousandsGroupStyle: 'none' | 'thousand' | 'lakh' | 'wan';
  decimalScale?: number;
  precision?: number;
  fixedDecimalScale: boolean;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
  allowDecimal: boolean;
}

const formatDisplayValue = (value: number, options: FormatOptions): string => {
  if (!Number.isFinite(value)) return '';
  if (options.formatter) return options.formatter(value);

  const {
    format,
    currency,
    decimalSeparator,
    thousandSeparator,
    thousandsGroupStyle,
    decimalScale,
    precision,
    fixedDecimalScale,
    prefix,
    suffix,
    allowDecimal,
  } = options;

  const effectivePrefix = prefix ?? (format === 'currency' ? getCurrencySymbol(currency) : undefined);
  const effectiveSuffix = suffix ?? (format === 'percentage' ? '%' : undefined);

  let resolvedDecimalScale = decimalScale ?? precision;
  if (!allowDecimal) {
    resolvedDecimalScale = 0;
  }

  let workingValue = value;
  if (!allowDecimal) {
    workingValue = Math.trunc(workingValue);
  }

  const sign = workingValue < 0 ? '-' : '';
  const absoluteValue = Math.abs(workingValue);

  let base: string;
  if (typeof resolvedDecimalScale === 'number') {
    base = absoluteValue.toFixed(resolvedDecimalScale);
    if (!fixedDecimalScale && resolvedDecimalScale > 0) {
      base = base.replace(/(\.\d*?)0+$/, (_, group: string) => (group === '.' ? '' : group));
    }
  } else {
    base = absoluteValue.toString();
  }

  base = base.replace(/\.$/, '');

  const [intPartRaw, fracPartRaw = ''] = base.split('.');
  const intPart = groupThousands(intPartRaw, thousandSeparator, thousandsGroupStyle);
  const fracPart = fracPartRaw.length > 0 ? fracPartRaw : '';
  const decimalPortion = fracPart.length > 0 ? `${decimalSeparator}${fracPart}` : '';

  return `${sign}${effectivePrefix ?? ''}${intPart}${decimalPortion}${effectiveSuffix ?? ''}`;
};

const toLocalizedString = (normalized: string, decimalSeparator: string) => {
  if (!normalized) return '';
  if (decimalSeparator === DEFAULT_DECIMAL_SEPARATOR) return normalized;
  return normalized.replace('.', decimalSeparator);
};

interface NormalizeOptions {
  allowDecimal: boolean;
  allowNegative: boolean;
  allowLeadingZeros: boolean;
  decimalSeparator: string;
  allowedDecimalSeparators: string[];
  decimalScale?: number;
  thousandSeparator?: string;
  prefix?: string;
  suffix?: string;
}

interface NormalizeResult {
  normalized: string;
  localized: string;
  parsedValue?: number;
  hasValue: boolean;
}

const normalizeInput = (value: string, options: NormalizeOptions): NormalizeResult => {
  if (!value) {
    return { normalized: '', localized: '', parsedValue: undefined, hasValue: false };
  }

  let input = value.trim();

  if (options.prefix && input.startsWith(options.prefix)) {
    input = input.slice(options.prefix.length);
  }

  if (options.suffix && input.endsWith(options.suffix)) {
    input = input.slice(0, -options.suffix.length);
  }

  if (options.thousandSeparator) {
    const pattern = new RegExp(escapeRegExp(options.thousandSeparator), 'g');
    input = input.replace(pattern, '');
  }

  input = input.replace(/\s+/g, '');

  const decimalChars = new Set<string>(options.allowedDecimalSeparators);
  decimalChars.add(options.decimalSeparator);
  decimalChars.add(DEFAULT_DECIMAL_SEPARATOR);

  let normalized = '';
  let hasDecimal = false;
  let endedWithDecimal = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (char >= '0' && char <= '9') {
      normalized += char;
      endedWithDecimal = false;
      continue;
    }

    if ((char === '-' || char === '+') && normalized.length === 0) {
      if (char === '-' && options.allowNegative) {
        normalized += char;
      }
      endedWithDecimal = false;
      continue;
    }

    if (options.allowDecimal && decimalChars.has(char)) {
      if (!hasDecimal) {
        normalized += '.';
        hasDecimal = true;
        endedWithDecimal = true;
      }
    }
  }

  if (!options.allowNegative) {
    normalized = normalized.replace(/-/g, '');
  } else if (normalized.includes('-', 1)) {
    normalized = normalized[0] === '-' ? `-${normalized.slice(1).replace(/-/g, '')}` : normalized.replace(/-/g, '');
  }

  if (!options.allowDecimal) {
    const decimalIndex = normalized.indexOf('.');
    if (decimalIndex !== -1) {
      normalized = normalized.slice(0, decimalIndex);
      hasDecimal = false;
      endedWithDecimal = false;
    }
  }

  if (options.decimalScale !== undefined && options.decimalScale >= 0 && hasDecimal) {
    const [intPart, fracPartRaw = ''] = normalized.split('.');
    const truncated = fracPartRaw.slice(0, options.decimalScale);
    const keepDecimal = options.decimalScale > 0 && (truncated.length > 0 || endedWithDecimal);

    if (options.decimalScale === 0) {
      normalized = intPart;
      hasDecimal = false;
      endedWithDecimal = false;
    } else {
      normalized = truncated.length > 0
        ? `${intPart}.${truncated}`
        : `${intPart}${keepDecimal ? '.' : ''}`;
      hasDecimal = truncated.length > 0 || keepDecimal;
      endedWithDecimal = truncated.length === 0 && keepDecimal;
    }
  }

  if (!options.allowLeadingZeros) {
    const negative = normalized.startsWith('-');
    let body = negative ? normalized.slice(1) : normalized;
    const [intPartRaw, fracRaw = ''] = body.split('.');
    let intPart = intPartRaw.replace(/^0+(?=\d)/, '');
    if (intPart === '') intPart = '0';

    if (fracRaw) {
      body = `${intPart}.${fracRaw}`;
    } else {
      body = intPart + (endedWithDecimal ? '.' : '');
    }

    normalized = negative ? `-${body}` : body;
  }

  const digits = normalized.replace(/[^0-9]/g, '');
  const hasValue = digits.length > 0;
  const parsedValue = hasValue ? Number(normalized) : undefined;

  return {
    normalized,
    localized: toLocalizedString(normalized, options.decimalSeparator),
    parsedValue: Number.isFinite(parsedValue) ? parsedValue : undefined,
    hasValue,
  };
};

export const NumberInput = factory<{
  props: NumberInputProps;
  ref: any;
}>((props, ref) => {
  const {
    value,
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
    ...inputProps
  } = props;

  const theme = useTheme();
  const keyboardManager = useKeyboardManagerOptional();
  const [internalValue, setInternalValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<any>(null);
  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepCountRef = useRef(0);
  const holdActiveRef = useRef(false);
  const dragStateRef = useRef({
    active: false,
    dragStartValue: typeof value === 'number' ? value : startValue,
    lastComputedValue: typeof value === 'number' ? value : undefined,
    wasFocused: false,
  });
  const controlledValueRef = useRef<number | undefined>(
    typeof value === 'number' ? value : undefined
  );

  useEffect(() => {
    controlledValueRef.current = typeof value === 'number' ? value : undefined;
  }, [value]);

  const {
    endSection: userRightSection,
    startSection: userLeftSection,
    onFocus: userInputOnFocus,
    onBlur: userInputOnBlur,
    ...restInputProps
  } = inputProps;

  const identityProps = restInputProps as {
    keyboardFocusId?: string;
    name?: string;
    testID?: string;
  };

  const explicitFocusId = identityProps.keyboardFocusId;
  const inputName = identityProps.name;
  const inputTestId = identityProps.testID;

  const fallbackFocusIdRef = useRef(`number-${Math.random().toString(36).slice(2, 10)}`);
  const focusTargetId = useMemo(() => {
    if (typeof explicitFocusId === 'string' && explicitFocusId.trim().length > 0) {
      return explicitFocusId.trim();
    }

    if (typeof inputName === 'string' && inputName.trim().length > 0) {
      return inputName.trim();
    }

    if (typeof inputTestId === 'string' && inputTestId.trim().length > 0) {
      return inputTestId.trim();
    }

    return fallbackFocusIdRef.current;
  }, [explicitFocusId, inputName, inputTestId]);

  const requestFocusRestore = useCallback(() => {
    if (!keyboardManager) {
      return;
    }

    keyboardManager.refocus(focusTargetId);
  }, [keyboardManager, focusTargetId]);

  const allowDecimal = allowDecimalProp ?? (format !== 'integer');

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

  const resolvedShiftMultiplier = useMemo(() => {
    if (typeof shiftMultiplier !== 'number' || Number.isNaN(shiftMultiplier)) {
      return 10;
    }
    if (!Number.isFinite(shiftMultiplier)) {
      return 10;
    }
    const absolute = Math.abs(shiftMultiplier);
    return absolute >= 1 ? absolute : 1;
  }, [shiftMultiplier]);

  const formatOptions = useMemo<FormatOptions>(() => ({
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
  }), [format, currency, decimalSeparator, resolvedThousandSeparator, thousandsGroupStyle, resolvedDecimalScale, precision, fixedDecimalScale, effectivePrefix, effectiveSuffix, formatter, allowDecimal]);

  const formatValue = useCallback((val: number) => formatDisplayValue(val, formatOptions), [formatOptions]);

  const getModifierMultiplier = useCallback((event?: { nativeEvent?: any } | any) => {
    const native = event?.nativeEvent ?? event;
    if (!native) return 1;

    if (typeof native.getModifierState === 'function') {
      try {
        if (native.getModifierState('Shift')) {
          return resolvedShiftMultiplier;
        }
      } catch {
        // ignore modifier lookup failures
      }
    }

    if (native.shiftKey) {
      return resolvedShiftMultiplier;
    }

    const modifiers = native.modifiers ?? native.modifierFlags;
    if (Array.isArray(modifiers)) {
      for (let index = 0; index < modifiers.length; index += 1) {
        const mod = modifiers[index];
        if (typeof mod === 'string' && mod.toLowerCase() === 'shift') {
          return resolvedShiftMultiplier;
        }
      }
    }

    return 1;
  }, [resolvedShiftMultiplier]);

  const normalizationOptions = useMemo<NormalizeOptions>(() => ({
    allowDecimal,
    allowNegative,
    allowLeadingZeros,
    decimalSeparator,
    allowedDecimalSeparators: allowedDecimalSeparatorsResolved,
    decimalScale: resolvedDecimalScale,
    thousandSeparator: resolvedThousandSeparator,
    prefix: effectivePrefix,
    suffix: effectiveSuffix,
  }), [allowDecimal, allowNegative, allowLeadingZeros, decimalSeparator, allowedDecimalSeparatorsResolved, resolvedDecimalScale, resolvedThousandSeparator, effectivePrefix, effectiveSuffix]);

  const formatEditableValue = useCallback((val: number) => {
    if (!Number.isFinite(val)) return '';

    let normalized: string;

    if (!allowDecimal) {
      normalized = Math.trunc(val).toString();
    } else if (typeof resolvedDecimalScale === 'number') {
      normalized = val.toFixed(resolvedDecimalScale);
      if (!fixedDecimalScale && resolvedDecimalScale > 0) {
        normalized = normalized.replace(/(\.\d*?)0+$/, (_, group: string) => (group === '.' ? '' : group));
      }
    } else {
      normalized = val.toString();
    }

    normalized = normalized.replace(/\.$/, '');

    return decimalSeparator === DEFAULT_DECIMAL_SEPARATOR
      ? normalized
      : normalized.replace('.', decimalSeparator);
  }, [allowDecimal, resolvedDecimalScale, fixedDecimalScale, decimalSeparator]);

  const allowedChecker = useCallback((nextValue: number, valueString: string) => {
    if (!isAllowed) return true;
    return isAllowed({
      floatValue: nextValue,
      formattedValue: formatValue(nextValue),
      value: valueString,
    });
  }, [isAllowed, formatValue]);

  const resolvedMin = useMemo(() => {
    if (!allowNegative) {
      const limit = 0;
      if (min === undefined) return limit;
      return Math.max(min, limit);
    }
    return min;
  }, [allowNegative, min]);

  // Format display value
  const displayValue = useMemo(() => {
    if (focused) return internalValue;
    if (value === undefined || value === null) return '';
    return formatValue(value);
  }, [focused, internalValue, value, formatValue]);

  // Clamp value to bounds
  const clampValue = useCallback((val: number): number => {
    let clamped = val;
    if (resolvedMin !== undefined && clamped < resolvedMin) clamped = resolvedMin;
    if (max !== undefined && clamped > max) clamped = max;
    return clamped;
  }, [resolvedMin, max]);

  useEffect(() => {
    if (!focused) return;
    if (value === undefined || value === null) {
      setInternalValue('');
      return;
    }
    setInternalValue(formatEditableValue(value));
  }, [value, focused, formatEditableValue]);

  // Handle text input changes
  const handleChangeText = useCallback((text: string) => {
    if (parser) {
      setInternalValue(text);
      const parsed = parser(text);
      if (!isNaN(parsed)) {
        const clamped = clampBehavior === 'strict' ? clampValue(parsed) : parsed;
        if (allowedChecker(clamped, clamped.toString())) {
          onChange?.(clamped);
        }
      } else if (allowEmpty && text === '') {
        onChange?.(undefined);
      }
      return;
    }

    const normalized = normalizeInput(text, normalizationOptions);
    setInternalValue(normalized.localized);

    if (!normalized.hasValue) {
      if (allowEmpty && normalized.localized === '') {
        onChange?.(undefined);
      }
      return;
    }

    if (normalized.parsedValue === undefined || Number.isNaN(normalized.parsedValue)) {
      return;
    }

    let nextValue = normalized.parsedValue;

    if (clampBehavior === 'strict') {
      nextValue = clampValue(nextValue);
      setInternalValue(formatEditableValue(nextValue));
    }

    if (!allowedChecker(nextValue, nextValue.toString())) {
      return;
    }

    onChange?.(nextValue);
  }, [parser, clampBehavior, clampValue, allowEmpty, onChange, normalizationOptions, formatEditableValue, allowedChecker]);

  // Handle focus
  const handleFocus = useCallback(() => {
    setFocused(true);
    if (value === undefined || value === null) {
      setInternalValue('');
    } else {
      setInternalValue(formatEditableValue(value));
    }
    userInputOnFocus?.();
  }, [value, formatEditableValue, userInputOnFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setFocused(false);
    setInternalValue('');
    
    // Apply clamping on blur if needed
    if (clampBehavior === 'blur' && value !== undefined) {
      const clamped = clampValue(value);
      if (clamped !== value && allowedChecker(clamped, clamped.toString())) {
        onChange?.(clamped);
      }
    }
    userInputOnBlur?.();
  }, [clampBehavior, clampValue, value, onChange, allowedChecker, userInputOnBlur]);

  // Handle increment/decrement
  const handleStep = useCallback((direction: 'up' | 'down', shouldRestoreFocus = false, multiplier = 1) => {
    if (disabled) return;
    const normalizedMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
    const stepSize = step * normalizedMultiplier;
    const effectiveStep = Number.isFinite(stepSize) && stepSize !== 0 ? stepSize : step;
    const currentValue = controlledValueRef.current;
    const hasValue = currentValue !== undefined && currentValue !== null;
    let nextValue: number;

    if (!hasValue) {
      nextValue = startValue;
    } else {
      const delta = direction === 'up' ? effectiveStep : -effectiveStep;
      nextValue = (currentValue as number) + delta;
    }

    if (!allowDecimal) {
      nextValue = Math.round(nextValue);
    }

    const clamped = clampValue(nextValue);

    if (!allowedChecker(clamped, clamped.toString())) {
      return;
    }

    controlledValueRef.current = clamped;
    onChange?.(clamped);

    if (focused) {
      setInternalValue(formatEditableValue(clamped));
    }
    if (shouldRestoreFocus) {
      requestFocusRestore();
    }
  }, [disabled, startValue, step, allowDecimal, clampValue, allowedChecker, onChange, focused, formatEditableValue, requestFocusRestore]);

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

  const scheduleNextStep = useCallback((direction: 'up' | 'down', multiplier: number) => {
    const normalizedMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
    const interval = typeof stepHoldInterval === 'function'
      ? stepHoldInterval(stepCountRef.current)
      : stepHoldInterval;

    const delay = Math.max(interval ?? DEFAULT_STEP_INTERVAL, 0);

    holdIntervalRef.current = setTimeout(() => {
      stepCountRef.current += 1;
      handleStep(direction, true, normalizedMultiplier);
      scheduleNextStep(direction, normalizedMultiplier);
    }, delay);
  }, [handleStep, stepHoldInterval]);

  const startHold = useCallback((direction: 'up' | 'down', multiplier = 1) => {
    if (disabled) return;
    // The pan responder covers the whole field, controls included. Marking the hold keeps a
    // press on +/- from also arming the drag gesture and double-counting steps.
    holdActiveRef.current = true;
    clearHoldTimers();
    stepCountRef.current = 0;
    const normalizedMultiplier = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
    handleStep(direction, true, normalizedMultiplier);

    const delay = Math.max(stepHoldDelay ?? DEFAULT_STEP_DELAY, 0);

    holdTimeoutRef.current = setTimeout(() => {
      stepCountRef.current = 1;
      scheduleNextStep(direction, normalizedMultiplier);
    }, delay);
  }, [disabled, clearHoldTimers, handleStep, stepHoldDelay, scheduleNextStep]);

  const stopHold = useCallback(() => {
    holdActiveRef.current = false;
    clearHoldTimers();
    stepCountRef.current = 0;
  }, [clearHoldTimers]);

  useEffect(() => () => {
    clearHoldTimers();
  }, [clearHoldTimers]);

  useEffect(() => {
    const state = dragStateRef.current;
    if (state.active) return;
    state.dragStartValue = typeof value === 'number' ? value : startValue;
    state.lastComputedValue = typeof value === 'number' ? value : undefined;
  }, [value, startValue]);

  const effectiveDragStepDistance = useMemo(() => {
    if (!Number.isFinite(dragStepDistance) || dragStepDistance <= 0) {
      return DEFAULT_DRAG_STEP_DISTANCE;
    }
    return dragStepDistance;
  }, [dragStepDistance]);

  const dragActivationDistance = useMemo(
    () => Math.max(MIN_DRAG_ACTIVATION_DISTANCE, effectiveDragStepDistance * 0.35),
    [effectiveDragStepDistance]
  );

  const getDragAxisDelta = useCallback((gestureState: PanResponderGestureState) => (
    dragAxis === 'horizontal' ? gestureState.dx : -gestureState.dy
  ), [dragAxis]);

  // --- Web text-selection guard -------------------------------------------------------------
  // The gesture starts inside a focused <input>, so the browser is busy running its own
  // text-selection drag on the same pointer stream. Nothing in the responder system cancels
  // that, which is why the value ends up highlighted while it is being scrubbed.
  const selectionGuardRef = useRef({
    active: false,
    caret: null as number | null,
    blurredForDrag: false,
    prevBodyUserSelect: '',
    prevBodyCursor: '',
    prevInputUserSelect: '',
    prevInputCursor: '',
  });

  const getWebInputElement = useCallback((): HTMLInputElement | null => {
    if (Platform.OS !== 'web') return null;
    const node = inputRef.current as unknown as HTMLInputElement | null;
    if (!node || typeof node.setSelectionRange !== 'function') return null;
    return node;
  }, []);

  // `selectionStart` throws on input types that do not support selection, and this runs inside a
  // pointer-move handler where a throw would abort the whole gesture.
  const readSelectionRange = useCallback((element: HTMLInputElement) => {
    try {
      const { selectionStart, selectionEnd } = element;
      if (typeof selectionStart !== 'number' || typeof selectionEnd !== 'number') return null;
      return { start: selectionStart, end: selectionEnd };
    } catch {
      return null;
    }
  }, []);

  const collapseSelection = useCallback(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const element = getWebInputElement();
    if (element) {
      const range = readSelectionRange(element);
      if (range && range.start !== range.end) {
        const text = element.value ?? '';
        const caret = selectionGuardRef.current.caret ?? text.length;
        const bounded = Math.max(0, Math.min(caret, text.length));
        try {
          element.setSelectionRange(bounded, bounded);
        } catch {
          // Some input modes reject programmatic selection; the highlight is cosmetic here.
        }
      }
    }

    // A drag that started on the label or description selects document text instead, which the
    // input's own selection API cannot clear.
    if (element && document.activeElement === element) return;
    const selection = typeof window !== 'undefined' ? window.getSelection?.() : null;
    if (selection && !selection.isCollapsed) {
      selection.removeAllRanges();
    }
  }, [getWebInputElement, readSelectionRange]);

  const preventSelectStart = useCallback((event: Event) => {
    if (selectionGuardRef.current.active) {
      event.preventDefault();
    }
  }, []);

  const beginSelectionGuard = useCallback(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const guard = selectionGuardRef.current;
    if (guard.active) return;

    const element = getWebInputElement();
    const cursor = dragAxis === 'vertical' ? 'ns-resize' : 'ew-resize';

    // Where the pointer went down, so the caret can be parked there instead of jumping once the
    // browser's half-formed selection is collapsed.
    const range = element ? readSelectionRange(element) : null;

    guard.active = true;
    guard.caret = range && range.start === range.end ? range.start : null;

    const body = document.body;
    if (body) {
      guard.prevBodyUserSelect = body.style.userSelect;
      guard.prevBodyCursor = body.style.cursor;
      body.style.userSelect = 'none';
      body.style.cursor = cursor;
    }

    if (element) {
      // Form controls opt out of an inherited `user-select: none`, so the field needs its own.
      guard.prevInputUserSelect = element.style.userSelect;
      guard.prevInputCursor = element.style.cursor;
      element.style.userSelect = 'none';
      element.style.cursor = cursor;
    }

    document.addEventListener('selectstart', preventSelectStart);
    collapseSelection();

    // `user-select: none` does not apply inside editable elements, so a focused field will still
    // let the browser drag-select its own text — and the `select` event that produces terminates
    // the responder outright (react-native-web only lets a responder refuse termination for
    // contextmenu/scroll/selectionchange). Handing focus back at the end of the gesture is what
    // keeps the field typeable; holding onto it mid-scrub is what breaks the scrub.
    if (element && document.activeElement === element) {
      guard.blurredForDrag = true;
      element.blur();
    }
  }, [dragAxis, getWebInputElement, readSelectionRange, preventSelectStart, collapseSelection]);

  /** Returns whether the field gave up focus for the gesture and should get it back. */
  const endSelectionGuard = useCallback(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return false;

    const guard = selectionGuardRef.current;
    if (!guard.active) return false;

    guard.active = false;
    document.removeEventListener('selectstart', preventSelectStart);

    const body = document.body;
    if (body) {
      body.style.userSelect = guard.prevBodyUserSelect;
      body.style.cursor = guard.prevBodyCursor;
    }

    const element = getWebInputElement();
    if (element) {
      element.style.userSelect = guard.prevInputUserSelect;
      element.style.cursor = guard.prevInputCursor;
    }

    collapseSelection();
    guard.caret = null;

    const blurredForDrag = guard.blurredForDrag;
    guard.blurredForDrag = false;
    return blurredForDrag;
  }, [preventSelectStart, getWebInputElement, collapseSelection]);

  const beginDrag = useCallback(() => {
    const state = dragStateRef.current;
    if (state.active || !withDragGesture || disabled || holdActiveRef.current) {
      return;
    }

    const baseValue = typeof value === 'number' ? value : startValue;
    state.active = true;
    state.dragStartValue = baseValue;
    state.lastComputedValue = typeof value === 'number' ? value : undefined;
    state.wasFocused = focused;
    beginSelectionGuard();
    onDragStateChange?.(true);
  }, [withDragGesture, disabled, value, startValue, focused, beginSelectionGuard, onDragStateChange]);

  const handleDragMove = useCallback((gestureState: PanResponderGestureState) => {
    if (!withDragGesture || disabled) {
      return;
    }

    const state = dragStateRef.current;

    if (!state.active) {
      beginDrag();
    }

    if (!state.active) {
      return;
    }

    const delta = getDragAxisDelta(gestureState);
    if (!Number.isFinite(delta)) {
      return;
    }

    const distance = effectiveDragStepDistance;
    if (!Number.isFinite(distance) || distance <= 0) {
      return;
    }

    const multiplier = dragStepMultiplier || 1;
    const stepSize = step * multiplier;

    if (!Number.isFinite(stepSize) || stepSize === 0) {
      return;
    }

    const rawDelta = (delta / distance) * stepSize;
    let nextValue = state.dragStartValue + rawDelta;

    if (Number.isFinite(stepSize) && stepSize !== 0) {
      const relativeSteps = (nextValue - state.dragStartValue) / stepSize;
      const roundedSteps = allowDecimal ? Math.round(relativeSteps * 1e6) / 1e6 : Math.round(relativeSteps);
      nextValue = state.dragStartValue + roundedSteps * stepSize;
    }

    if (!Number.isFinite(nextValue)) {
      return;
    }

    if (!allowDecimal) {
      nextValue = Math.round(nextValue);
    }

    const clamped = clampValue(nextValue);

    if (!allowedChecker(clamped, clamped.toString())) {
      return;
    }

    // The browser keeps extending its own selection for as long as the pointer is down, so the
    // highlight has to be cleared on every move rather than once at activation.
    collapseSelection();

    if (state.lastComputedValue === clamped) {
      return;
    }

    state.lastComputedValue = clamped;
    controlledValueRef.current = clamped;

    onChange?.(clamped);

    if (focused) {
      setInternalValue(formatEditableValue(clamped));
    }
  }, [withDragGesture, disabled, beginDrag, getDragAxisDelta, effectiveDragStepDistance, dragStepMultiplier, step, allowDecimal, clampValue, allowedChecker, collapseSelection, onChange, focused, formatEditableValue]);

  const endDrag = useCallback(() => {
    const state = dragStateRef.current;
    const blurredForDrag = endSelectionGuard();

    if (!state.active) {
      return;
    }

    const shouldRestoreFocus = (state.wasFocused || blurredForDrag) && !disabled;

    state.active = false;
    state.wasFocused = false;
    state.lastComputedValue = undefined;

    onDragStateChange?.(false);

    if (shouldRestoreFocus) {
      requestFocusRestore();
    }
  }, [onDragStateChange, requestFocusRestore, endSelectionGuard, disabled]);

  useEffect(() => {
    if (!withDragGesture || disabled) {
      endDrag();
    }
  }, [withDragGesture, disabled, endDrag]);

  const onDragStateChangeRef = useRef(onDragStateChange);
  useEffect(() => {
    onDragStateChangeRef.current = onDragStateChange;
  }, [onDragStateChange]);

  // Unmount only. Keying this on `onDragStateChange` would tear down a live drag every time a
  // parent re-rendered with an inline callback — which is exactly what happens while dragging.
  useEffect(() => () => {
    if (dragStateRef.current.active) {
      dragStateRef.current.active = false;
      dragStateRef.current.wasFocused = false;
      dragStateRef.current.lastComputedValue = undefined;
      onDragStateChangeRef.current?.(false);
    }
    endSelectionGuard();
  }, [endSelectionGuard]);

  const dragConfigRef = useRef({
    enabled: withDragGesture,
    disabled: !!disabled,
    axis: dragAxis,
    activationDistance: dragActivationDistance,
  });
  const dragHandlersRef = useRef({ begin: beginDrag, move: handleDragMove, end: endDrag });

  useEffect(() => {
    dragConfigRef.current = {
      enabled: withDragGesture,
      disabled: !!disabled,
      axis: dragAxis,
      activationDistance: dragActivationDistance,
    };
  }, [withDragGesture, disabled, dragAxis, dragActivationDistance]);

  useEffect(() => {
    dragHandlersRef.current = { begin: beginDrag, move: handleDragMove, end: endDrag };
  }, [beginDrag, handleDragMove, endDrag]);

  // Created once and driven through refs. A PanResponder accumulates dx/dy inside the instance
  // it was created with, so rebuilding it mid-gesture — which a controlled `value` update does
  // on every single step — resets the travel measured since the drag began and snaps the value
  // back to where the pointer went down.
  const panResponderRef = useRef<PanResponderInstance | null>(null);
  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const config = dragConfigRef.current;
        if (!config.enabled || config.disabled || holdActiveRef.current) {
          return false;
        }

        const primaryDelta = config.axis === 'horizontal' ? Math.abs(gestureState.dx) : Math.abs(gestureState.dy);
        const crossDelta = config.axis === 'horizontal' ? Math.abs(gestureState.dy) : Math.abs(gestureState.dx);

        if (primaryDelta < config.activationDistance) {
          return false;
        }

        return primaryDelta >= crossDelta;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => {
        dragHandlersRef.current.begin();
      },
      onPanResponderMove: (_, gestureState) => {
        dragHandlersRef.current.move(gestureState);
      },
      onPanResponderRelease: () => {
        dragHandlersRef.current.end();
      },
      onPanResponderTerminate: () => {
        dragHandlersRef.current.end();
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,
    });
  }

  const dragGestureEnabled = withDragGesture && !disabled;

  const inputPropsWithGestures = useMemo(() => {
    if (!dragGestureEnabled) {
      return restInputProps;
    }

    return {
      ...restInputProps,
      ...(panResponderRef.current as PanResponderInstance).panHandlers,
    };
  }, [restInputProps, dragGestureEnabled]);

  // Controls visibility
  const showControls = useMemo(() => {
    if (!withControls) return false;
    if (hideControlsOnMobile && Platform.OS !== 'web') return false;
    return true;
  }, [withControls, hideControlsOnMobile]);

  const comparisonValue = value ?? startValue;
  const disableIncrement = disabled || (max !== undefined && comparisonValue >= max);
  const disableDecrement = disabled || (resolvedMin !== undefined && comparisonValue <= resolvedMin);

  const startSection = useMemo(() => {
    if (!withSideButtons) {
      return userLeftSection;
    }

    const button = (
      <Pressable
        key="side-decrement"
        onPressIn={(event) => startHold('down', getModifierMultiplier(event))}
        onPressOut={stopHold}
        onTouchEnd={stopHold}
        disabled={disableDecrement}
        accessibilityRole="button"
        accessibilityLabel="Decrease value"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          paddingHorizontal: 10,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disableDecrement ? 0.4 : 1,
        }}
      >
        <Icon name="minus" size={14} color={theme.text.secondary} />
      </Pressable>
    );

    if (!userLeftSection) {
      return button;
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {button}
        <View style={{ marginLeft: 8 }}>{userLeftSection}</View>
      </View>
    );
  }, [withSideButtons, userLeftSection, startHold, stopHold, getModifierMultiplier, disableDecrement, theme]);

  // Right section with controls and side button
  const endSection = useMemo(() => {
    if (!withSideButtons && !showControls) {
      return userRightSection ?? null;
    }

    const sections: React.ReactNode[] = [];

    if (withSideButtons) {
      sections.push(
        <Pressable
          key="side-increment"
          onPressIn={(event) => startHold('up', getModifierMultiplier(event))}
          onPressOut={stopHold}
          onTouchEnd={stopHold}
          disabled={disableIncrement}
          accessibilityRole="button"
          accessibilityLabel="Increase value"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            paddingHorizontal: 10,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disableIncrement ? 0.4 : 1,
          }}
        >
          <Icon name="plus" size={14} color={theme.text.secondary} />
        </Pressable>
      );
    }

    if (showControls) {
      const marginStyle = sections.length > 0 ? { marginLeft: 4 } : null;
      sections.push(
        <View key="spinner" style={[{ flexDirection: 'column' }, marginStyle]}>
          <Pressable
            onPressIn={(event) => startHold('up', getModifierMultiplier(event))}
            onPressOut={stopHold}
            onTouchEnd={stopHold}
            disabled={disableIncrement}
            accessibilityRole="button"
            style={{
              padding: 4,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.gray[3],
            }}
          >
            <Icon name="chevron-up" size={12} color={theme.text.secondary} />
          </Pressable>

          <Pressable
            onPressIn={(event) => startHold('down', getModifierMultiplier(event))}
            onPressOut={stopHold}
            onTouchEnd={stopHold}
            disabled={disableDecrement}
            accessibilityRole="button"
            style={{
              padding: 4,
            }}
          >
            <Icon name="chevron-down" size={12} color={theme.text.secondary} />
          </Pressable>
        </View>
      );
    }

    if (userRightSection) {
      const marginStyle = sections.length > 0 ? { marginLeft: 4 } : null;
      sections.push(
        <View key="user" style={marginStyle ?? undefined}>
          {userRightSection}
        </View>
      );
    }

    if (sections.length === 0) {
      return null;
    }

    if (sections.length === 1) {
      return sections[0];
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        {sections}
      </View>
    );
  }, [
    withSideButtons,
    showControls,
    userRightSection,
    startHold,
    stopHold,
    getModifierMultiplier,
    disableIncrement,
    disableDecrement,
    theme
  ]);

  const userOnKeyDown = textInputProps?.onKeyDown;

  const handleKeyDown = useCallback((event: any) => {
    userOnKeyDown?.(event);
    if (!withKeyboardEvents) return;
    if (event?.defaultPrevented) return;

    const key = event?.nativeEvent?.key ?? event?.key;
    if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault?.();
      event.stopPropagation?.();
      const multiplier = getModifierMultiplier(event);
      handleStep(key === 'ArrowUp' ? 'up' : 'down', false, multiplier);
    }
  }, [userOnKeyDown, withKeyboardEvents, handleStep, getModifierMultiplier]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !withKeyboardEvents) return;

    const element = inputRef.current as unknown as {
      addEventListener?: (type: string, listener: any) => void;
      removeEventListener?: (type: string, listener: any) => void;
    } | null;

    if (!element?.addEventListener || !element?.removeEventListener) {
      return;
    }

    const listener = (event: any) => {
      handleKeyDown(event);
    };

    const add = element.addEventListener.bind(element);
    const remove = element.removeEventListener.bind(element);

    add('keydown', listener);

    return () => {
      remove('keydown', listener);
    };
  }, [handleKeyDown, withKeyboardEvents]);

  const enhancedTextInputProps = useMemo<NumberInputProps['textInputProps']>(() => {
    if (Platform.OS !== 'web' || !withKeyboardEvents) {
      return textInputProps;
    }

    if (textInputProps) {
      return {
        ...textInputProps,
        onKeyDown: handleKeyDown,
      };
    }

    return {
      onKeyDown: handleKeyDown,
    } as ExtendedTextInputProps;
  }, [textInputProps, handleKeyDown, withKeyboardEvents]);

  const keyboardType = allowDecimal ? 'decimal-pad' : 'number-pad';

  return (
    <Input
      {...inputPropsWithGestures}
      value={displayValue}
      onChangeText={handleChangeText}
      onBlur={handleBlur}
      onFocus={handleFocus}
      keyboardType={keyboardType}
      startSection={startSection}
      endSection={endSection}
      disabled={disabled}
      error={error}
      inputRef={inputRef}
      textInputProps={enhancedTextInputProps}
    />
  );
});

NumberInput.displayName = 'NumberInput';
