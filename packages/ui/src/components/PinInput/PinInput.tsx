import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, TextInput, Platform } from 'react-native';
import { Text } from '../Text';
import { PinInputProps } from './types';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';
import { FieldHeader } from '../_internal/FieldHeader';
import { useControllableState } from '../../hooks/useControllableState';

export const PinInput = factory<{
  props: PinInputProps;
  ref: View;
}>((props, ref) => {
  const {
    length = 4,
    value: controlledValue,
    defaultValue = '',
    onChange,
    mask = false,
    maskChar = '•',
    manageFocus = true,
    type = 'numeric',
    placeholder = '',
    allowPaste = true,
    oneTimeCode = false,
    spacing = 8,
    disabled = false,
    error,
    size = 'md',
    onComplete,
    textInputProps,
    label,
    description,
    helperText,
    required,
    withAsterisk,
    labelProps,
    descriptionProps,
    style,
    keyboardFocusId,
    name,
    testID,
    // Native TextInput passthrough props
    autoCapitalize,
    autoCorrect,
    autoFocus,
    selectTextOnFocus: selectTextOnFocusProp,
    textContentType: textContentTypeProp,
    textAlign,
    spellCheck,
    selectionColor,
    showSoftInputOnFocus,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const keyboardManager = useKeyboardManagerOptional();

  // Support both controlled (`value`) and uncontrolled (`defaultValue`) usage.
  const [value, commitValue] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
    finalValue: '',
    onChange,
  });

  const fallbackFocusIdRef = useRef(`pin-${Math.random().toString(36).slice(2, 10)}`);
  const focusTargetId = useMemo(() => {
    if (typeof keyboardFocusId === 'string' && keyboardFocusId.trim().length > 0) {
      return keyboardFocusId.trim();
    }
    if (typeof name === 'string' && name.trim().length > 0) {
      return name.trim();
    }
    if (typeof testID === 'string' && testID.trim().length > 0) {
      return testID.trim();
    }
    return fallbackFocusIdRef.current;
  }, [keyboardFocusId, name, testID]);
  
  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
    for (let i = inputRefs.current.length; i < length; i++) {
      inputRefs.current[i] = null;
    }
  }, [length]);

  // Split value into array of individual digits
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  // Call onComplete when all digits are filled
  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const filterChars = useCallback((input: string) => (
    type === 'numeric'
      ? input.replace(/[^0-9]/g, '')
      : input.replace(/[^a-zA-Z0-9]/g, '')
  ), [type]);

  const handleChangeText = useCallback((text: string, index: number) => {
    if (disabled) return;

    // Some platforms append the newly typed character to a cell that already
    // holds a digit (instead of replacing the selection), yielding a 2-char
    // string. Treat that as a single keystroke — not a paste — so we don't wipe
    // the value or skip focus ahead.
    const prevDigit = digits[index] || '';
    let incoming = text;
    if (prevDigit && text.length === prevDigit.length + 1 && text.startsWith(prevDigit)) {
      incoming = text.slice(prevDigit.length);
    }

    // Handle genuine multi-character paste
    if (incoming.length > 1 && allowPaste) {
      const pastedDigits = filterChars(incoming).slice(0, length);
      commitValue(pastedDigits);

      // Focus the next empty input or the last input
      const nextEmptyIndex = Math.min(pastedDigits.length, length - 1);
      if (manageFocus && inputRefs.current[nextEmptyIndex]) {
        setTimeout(() => {
          inputRefs.current[nextEmptyIndex]?.focus();
        }, 0);
      }
      // If paste filled all digits, blur all
      if (pastedDigits.length === length) {
        setTimeout(() => {
          inputRefs.current.forEach(r => r?.blur());
          setFocusedIndex(-1);
        }, 0);
      }
      return;
    }

    // Single character entry — only keep the last valid character
    const newDigit = filterChars(incoming).slice(-1);

    // Update the value
    const newDigits = [...digits];
    newDigits[index] = newDigit;
    const newValue = newDigits.join('');
    commitValue(newValue);

    if (manageFocus && newDigit && index < length - 1) {
      // Always advance to the immediate next cell — even if it already has a
      // value (e.g. when editing an earlier digit of a filled PIN).
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 0);
    } else if (index === length - 1 && newValue.length === length) {
      // Completed on the final cell: blur all inputs
      setTimeout(() => {
        inputRefs.current.forEach(r => r?.blur());
        setFocusedIndex(-1);
      }, 0);
    }
  }, [digits, disabled, allowPaste, length, commitValue, manageFocus, filterChars]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (disabled) return;

    if (key === 'Backspace') {
      // If current input is empty, focus previous input
      if (!digits[index] && index > 0 && manageFocus) {
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
        }, 0);
      }
      return;
    }

    // When the pressed character matches the digit already in this cell, the
    // native input value doesn't change, so `onChangeText` never fires and the
    // usual auto-advance is skipped. Advance focus here to cover that case.
    if (manageFocus && index < length - 1 && key === digits[index]) {
      const isValidChar = type === 'numeric'
        ? /^[0-9]$/.test(key)
        : /^[a-zA-Z0-9]$/.test(key);
      if (isValidChar) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        }, 0);
      }
    }
  }, [digits, disabled, manageFocus, length, type]);

  const handleFocus = useCallback((index: number) => {
    // Determine first empty index
    const firstEmpty = digits.findIndex(d => d === '');

    // If all empty, always force focus to 0
    if (firstEmpty === 0 && index !== 0) {
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
      setFocusedIndex(0);
      return;
    }

    // If there is an earlier empty digit than the one focused, redirect to that
    if (firstEmpty !== -1 && index > firstEmpty) {
      setTimeout(() => inputRefs.current[firstEmpty]?.focus(), 0);
      setFocusedIndex(firstEmpty);
      return;
    }

    setFocusedIndex(index);
  }, [digits]);

  const handleBlur = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  const focusPreferredCell = useCallback(() => {
    const digitsArray = value.split('').slice(0, length);
    const firstEmptyIndex = digitsArray.findIndex(digit => digit === '');
    let targetIndex = 0;

    if (manageFocus) {
      if (firstEmptyIndex !== -1) {
        targetIndex = firstEmptyIndex;
      } else if (digitsArray.length > 0) {
        targetIndex = Math.min(digitsArray.length, length - 1);
      }
    }

    const node = inputRefs.current[targetIndex] ?? inputRefs.current[0];
    node?.focus?.();
    setFocusedIndex(targetIndex);
  }, [value, length, manageFocus]);

  useEffect(() => {
    if (!keyboardManager) {
      return;
    }

    if (keyboardManager.pendingFocusTarget !== focusTargetId) {
      return;
    }

    if (keyboardManager.consumeFocusTarget(focusTargetId)) {
      requestAnimationFrame(() => {
        focusPreferredCell();
      });
    }
  }, [keyboardManager, focusTargetId, focusPreferredCell]);

  // Input styles
  const getInputStyle = useCallback((index: number) => {
    const baseFontSize = size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'lg' ? 20 : size === 'xl' ? 24 : 18;
    const baseStyle = {
      width: size === 'xs' ? 32 : size === 'sm' ? 40 : size === 'lg' ? 56 : size === 'xl' ? 64 : 48,
      height: size === 'xs' ? 32 : size === 'sm' ? 40 : size === 'lg' ? 56 : size === 'xl' ? 64 : 48,
      borderWidth: 1,
      borderColor: error 
        ? theme.colors.error[5]
        : focusedIndex === index 
          ? theme.colors.primary[5]
          : theme.colors.gray[3],
      borderRadius: 6,
      backgroundColor: disabled 
        ? theme.colors.gray[1] 
        : (theme.colorScheme === 'dark' ? theme.colors.gray[1] : 'white'),
      textAlign: 'center' as const,
      // Slightly larger font for masked dots for better visibility
      fontSize: mask ? baseFontSize + 6 : baseFontSize,
      color: disabled ? theme.text.disabled : theme.text.primary,
      marginRight: index < length - 1 ? spacing : 0,
    };
    
    return baseStyle;
  }, [size, error, focusedIndex, length, spacing, disabled, theme, mask]);

  return (
    <View
      ref={ref}
      style={[style, spacingProps]}
      testID={testID}
    >
      <FieldHeader
        label={label}
        description={description}
        required={required}
        withAsterisk={withAsterisk ?? required}
        disabled={disabled}
        error={!!error}
        size={size as any}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        marginBottom={8}
      />
      
      <View 
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'center' 
        }}
      >
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={getInputStyle(index)}
            value={mask && digit ? maskChar : digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={Platform.OS === 'web' ? ({ nativeEvent }) => {
              handleKeyPress(nativeEvent.key, index);
            } : undefined}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            maxLength={allowPaste ? undefined : 1}
            keyboardType={type === 'numeric' ? 'number-pad' : 'default'}
            textContentType={oneTimeCode ? 'oneTimeCode' : (textContentTypeProp ?? undefined)}
            autoComplete={oneTimeCode ? 'one-time-code' : 'off'}
            selectTextOnFocus={selectTextOnFocusProp ?? true}
            editable={!disabled}
            placeholder={focusedIndex === index ? '' : placeholder}
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
        ))}
      </View>
      
      {error ? (
        <Text 
          style={{ 
            marginTop: 4, 
            fontSize: 12, 
            color: theme.colors.error[5] 
          }}
        >
          {error}
        </Text>
      ) : null}
      
      {helperText && !error ? (
        <Text 
          style={{ 
            marginTop: 4, 
            fontSize: 12, 
            color: theme.text.muted 
          }}
        >
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});

PinInput.displayName = 'PinInput';
