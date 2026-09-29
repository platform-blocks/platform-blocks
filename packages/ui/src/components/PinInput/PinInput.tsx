import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { TextInput, View, type TextStyle, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText, useA11yId } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { isWeb, webProps } from '../../core/platform';
import { useKeyboardFocusOptional } from '../../core/providers/KeyboardManagerProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { FieldHandle } from '../../core/types/base';
import { getLayoutStyles } from '../../core/utils/layout';
import { warnOnce } from '../../core/utils/logger';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Disclaimer } from '../_internal/Disclaimer/Disclaimer';
import { Field, type FieldRenderProps } from '../_internal/Field/Field';
import { getFieldFrameStyles } from '../_internal/Field/fieldFrameStyles';
import { useGroupFocus } from '../Checkbox/useGroupFocus';
import type { PinInputProps } from './types';

const PB_INPUT_DATASET = { pbInput: 'true' } as const;

/**
 * A code / PIN entry: one single-character cell per position, with automatic
 * focus hand-off, paste of a whole code, and one-time-code autofill. Each cell
 * is framed like every other text field (`variant`, `radius`, error and focus
 * states) and sized from the theme's control height.
 */
export const PinInput = factory<{ props: PinInputProps; ref: FieldHandle }>((props, ref) => {
  const {
    length = 4,
    value: controlledValue,
    defaultValue = '',
    onChange,
    onComplete,
    mask = false,
    maskChar = '•',
    manageFocus = true,
    enforceOrderInitialOnly = false,
    type = 'numeric',
    placeholder = '',
    allowPaste = true,
    oneTimeCode = false,
    spacing = 8,
    disabled = false,
    readOnly = false,
    error,
    size = 'md',
    radius,
    borderRadius,
    variant = 'default',
    textInputProps,
    label,
    description,
    helperText,
    required,
    withAsterisk,
    labelProps,
    descriptionProps,
    accessibilityLabel,
    accessibilityHint,
    onFocus,
    onBlur,
    style,
    keyboardFocusId,
    name,
    testID,
    // Native TextInput passthrough props
    autoCapitalize,
    autoCorrect,
    autoFocus,
    selectTextOnFocus,
    textContentType,
    textAlign = 'center',
    spellCheck,
    selectionColor,
    showSoftInputOnFocus,
    id,
    disclaimer,
    disclaimerProps,
  } = props;

  if (borderRadius !== undefined) {
    warnOnce('PinInput.borderRadius', '[PinInput] `borderRadius` is deprecated and will be removed; use `radius` instead.');
  }

  const theme = useTheme();
  const spacingStyles = useStyleProps(props);
  const layoutStyles = getLayoutStyles(props);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const focusedIndexRef = useRef(-1);
  const keyboardFocus = useKeyboardFocusOptional();
  const locked = disabled || readOnly;

  const [value, commitValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
    finalValue: '',
    onChange,
  });

  const fallbackFocusId = useA11yId(undefined, 'pin');
  const focusTargetId = useMemo(() => {
    for (const candidate of [keyboardFocusId, name, testID]) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate.trim();
    }
    return fallbackFocusId;
  }, [keyboardFocusId, name, testID, fallbackFocusId]);

  // Split value into one entry per cell.
  const digits = value.split('').slice(0, length);
  while (digits.length < length) digits.push('');

  // onComplete fires on the transition to a complete PIN — never merely because
  // the parent re-rendered (an inline callback used to re-fire it, which
  // double-submitted one-time codes). A PIN already complete on mount doesn't fire.
  const emitComplete = useLatestCallback(onComplete);
  const lastCompletedRef = useRef<string | null>(value.length === length ? value : null);
  const hasCompletedRef = useRef(value.length === length);
  useEffect(() => {
    if (value.length !== length) {
      lastCompletedRef.current = null;
      return;
    }
    hasCompletedRef.current = true;
    if (lastCompletedRef.current === value) return;
    lastCompletedRef.current = value;
    emitComplete(value);
  }, [value, length, emitComplete]);

  const filterChars = useCallback(
    (input: string) => (type === 'numeric' ? input.replace(/[^0-9]/g, '') : input.replace(/[^a-zA-Z0-9]/g, '')),
    [type]
  );

  const focusCell = useCallback((index: number) => {
    setTimeout(() => inputRefs.current[index]?.focus(), 0);
  }, []);

  const blurAll = useCallback(() => {
    setTimeout(() => {
      inputRefs.current.forEach((input) => input?.blur());
      focusedIndexRef.current = -1;
      setFocusedIndex(-1);
    }, 0);
  }, []);

  const handleChangeText = useCallback(
    (text: string, index: number) => {
      if (locked) return;

      // Some platforms append the typed character to a cell that already holds
      // one (instead of replacing the selection), yielding a 2-char string.
      // Treat that as one keystroke — not a paste.
      const prevDigit = digits[index] || '';
      let incoming = text;
      if (prevDigit && text.length === prevDigit.length + 1 && text.startsWith(prevDigit)) {
        incoming = text.slice(prevDigit.length);
      }

      // A genuine multi-character paste fills from the start.
      if (incoming.length > 1 && allowPaste) {
        const pasted = filterChars(incoming).slice(0, length);
        commitValue(pasted);
        if (manageFocus) focusCell(Math.min(pasted.length, length - 1));
        if (pasted.length === length) blurAll();
        return;
      }

      // Single character entry — only keep the last valid character.
      const newDigit = filterChars(incoming).slice(-1);
      const nextDigits = [...digits];
      nextDigits[index] = newDigit;
      const nextValue = nextDigits.join('');
      commitValue(nextValue);

      if (manageFocus && newDigit && index < length - 1) {
        // Always advance to the next cell — even if it already has a value
        // (editing an earlier digit of a filled PIN).
        focusCell(index + 1);
      } else if (index === length - 1 && nextValue.length === length) {
        blurAll();
      }
    },
    [digits, locked, allowPaste, length, commitValue, manageFocus, filterChars, focusCell, blurAll]
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (locked) return;
      if (key === 'Backspace') {
        // From an empty cell, step back to the previous one.
        if (!digits[index] && index > 0 && manageFocus) focusCell(index - 1);
        return;
      }
      // Typing the character a cell already holds changes nothing, so
      // `onChangeText` never fires and the auto-advance would be skipped.
      if (manageFocus && index < length - 1 && key === digits[index]) {
        const isValidChar = type === 'numeric' ? /^[0-9]$/.test(key) : /^[a-zA-Z0-9]$/.test(key);
        if (isValidChar) focusCell(index + 1);
      }
    },
    [digits, locked, manageFocus, length, type, focusCell]
  );

  const groupFocus = useGroupFocus(onFocus, onBlur);

  const handleFocus = useCallback(
    (index: number) => {
      const firstEmpty = digits.findIndex((d) => d === '');
      // Sequential entry: a later cell redirects to the first empty one — unless
      // `enforceOrderInitialOnly` and the PIN has already been completed once.
      const enforce = !(enforceOrderInitialOnly && hasCompletedRef.current);
      let target = index;
      if (enforce && firstEmpty !== -1 && index > firstEmpty) {
        target = firstEmpty;
        focusCell(firstEmpty);
      }
      focusedIndexRef.current = target;
      setFocusedIndex(target);
      groupFocus.onPartFocus();
    },
    [digits, enforceOrderInitialOnly, focusCell, groupFocus]
  );

  const handleBlur = useCallback(() => {
    focusedIndexRef.current = -1;
    setFocusedIndex(-1);
    groupFocus.onPartBlur();
  }, [groupFocus]);

  const focusPreferredCell = useCallback(() => {
    const cells = value.split('').slice(0, length);
    const firstEmpty = cells.findIndex((d) => d === '');
    let target = 0;
    if (manageFocus) {
      if (firstEmpty !== -1) target = firstEmpty;
      else if (cells.length > 0) target = Math.min(cells.length, length - 1);
    }
    (inputRefs.current[target] ?? inputRefs.current[0])?.focus();
    focusedIndexRef.current = target;
    setFocusedIndex(target);
  }, [value, length, manageFocus]);

  useImperativeHandle(
    ref,
    () => ({
      focus: focusPreferredCell,
      blur: () => inputRefs.current.forEach((input) => input?.blur()),
      clear: () => commitValue(''),
      isFocused: () => focusedIndexRef.current !== -1,
    }),
    [focusPreferredCell, commitValue]
  );

  // Focus hand-off from KeyboardManagerProvider (e.g. after the keyboard closed).
  const pendingFocusTarget = keyboardFocus?.pendingFocusTarget;
  const consumeFocusTarget = keyboardFocus?.consumeFocusTarget;
  useEffect(() => {
    if (!consumeFocusTarget || pendingFocusTarget !== focusTargetId) return;
    if (consumeFocusTarget(focusTargetId)) {
      requestAnimationFrame(() => focusPreferredCell());
    }
  }, [pendingFocusTarget, consumeFocusTarget, focusTargetId, focusPreferredCell]);

  const cellSize = getControlSize(theme, size).height;
  const styles = useThemedStyles(
    () => {
      // Digits read larger than body text; the masked dot a little larger still.
      const fontSize = Math.round(cellSize * 0.45) + (mask ? 6 : 0);
      return {
        row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing } as ViewStyle,
        cell: { width: cellSize, height: cellSize, paddingHorizontal: 0, paddingVertical: 0, justifyContent: 'center' } as ViewStyle,
        input: { fontSize, textAlign: 'center', width: '100%', height: '100%' } as TextStyle,
      };
    },
    [cellSize, mask, spacing]
  );

  const invalid = !!error;
  const labelText = accessibilityLabel ?? getNodeText(label);
  const cellLabel = (index: number) =>
    labelText ? `${labelText}, digit ${index + 1} of ${length}` : `Digit ${index + 1} of ${length}`;

  const renderCells = ({ controlProps }: FieldRenderProps) => {
    // The row is a group named by the field label; each cell has its own name and
    // carries the field's description / error / required / invalid wiring.
    const { id: groupId, 'aria-labelledby': labelledBy, 'aria-label': _groupLabel, ...cellWiring } = controlProps;
    return (
      <View id={groupId} role="group" aria-labelledby={labelledBy} style={styles.row}>
        {digits.map((digit, index) => {
          const focused = focusedIndex === index;
          const frame = getFieldFrameStyles(theme, size, variant, radius ?? borderRadius, invalid, focused, disabled);
          return (
            <View key={index} style={[frame.frame, styles.cell]}>
              {focused && !disabled ? <View style={frame.focusRing} /> : null}
              <TextInput
                ref={(node) => {
                  inputRefs.current[index] = node;
                }}
                {...cellWiring}
                {...a11yProps({ label: cellLabel(index) })}
                {...webProps({ dataSet: PB_INPUT_DATASET })}
                testID={testID ? `${testID}-cell-${index}` : undefined}
                style={[frame.input, styles.input]}
                value={mask && digit ? maskChar : digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={isWeb ? ({ nativeEvent }) => handleKeyPress(nativeEvent.key, index) : undefined}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                maxLength={allowPaste ? undefined : 1}
                keyboardType={type === 'numeric' ? 'number-pad' : 'default'}
                textContentType={oneTimeCode ? 'oneTimeCode' : textContentType}
                autoComplete={oneTimeCode ? 'one-time-code' : 'off'}
                selectTextOnFocus={selectTextOnFocus ?? true}
                editable={!locked}
                placeholder={focused ? '' : placeholder}
                placeholderTextColor={theme.text.muted}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                autoFocus={autoFocus && index === 0}
                textAlign={textAlign}
                spellCheck={spellCheck}
                selectionColor={selectionColor}
                showSoftInputOnFocus={showSoftInputOnFocus}
                {...textInputProps}
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Field
      id={id}
      label={label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={[spacingStyles, layoutStyles, style]}
    >
      {(field: FieldRenderProps) => (
        <>
          {renderCells(field)}
          {disclaimer ? <Disclaimer {...disclaimerProps}>{disclaimer}</Disclaimer> : null}
        </>
      )}
    </Field>
  );
}, { displayName: 'PinInput' });

PinInput.displayName = 'PinInput';
