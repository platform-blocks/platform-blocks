import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { TextInput } from 'react-native';
import { factory } from '../../core/factory/factory';
import { isIOS } from '../../core/platform';
import { TextInputBase } from './InputBase';
import { PasswordToggle } from './PasswordToggle';
import type { ExtendedTextInputProps, InputProps, ValidationRule } from './types';
import { validateValue } from './validation';

type InputType = NonNullable<InputProps['type']>;

const INPUT_TYPE_CONFIG: Record<InputType, ExtendedTextInputProps> = {
  text: {
    keyboardType: 'default',
    secureTextEntry: false,
    autoCapitalize: 'sentences',
    autoComplete: 'off',
  },
  password: {
    keyboardType: 'default',
    secureTextEntry: true,
    autoCapitalize: 'none',
    autoComplete: 'password',
    // Immediate masking on iOS, and no corrections/suggestions that could echo characters.
    textContentType: 'password',
    autoCorrect: false,
    spellCheck: false,
    clearButtonMode: 'never',
  },
  email: {
    keyboardType: 'email-address',
    secureTextEntry: false,
    autoCapitalize: 'none',
    autoComplete: 'email',
  },
  tel: {
    keyboardType: 'phone-pad',
    secureTextEntry: false,
    autoCapitalize: 'none',
    autoComplete: 'tel',
  },
  number: {
    keyboardType: 'numeric',
    secureTextEntry: false,
    autoCapitalize: 'none',
    autoComplete: 'off',
  },
  search: {
    keyboardType: 'default',
    secureTextEntry: false,
    autoCapitalize: 'none',
    autoComplete: 'off',
  },
};

/** Extra protection while a password is hidden (no autocorrect/suggestions that reveal characters). */
export const HIDDEN_PASSWORD_PROPS: ExtendedTextInputProps = {
  autoCorrect: false,
  spellCheck: false,
  textContentType: 'password',
  clearButtonMode: 'never',
  secureTextEntry: true,
  ...(isIOS
    ? {
        keyboardAppearance: 'default',
        enablesReturnKeyAutomatically: false,
        smartInsertDelete: false,
      }
    : null),
};

/**
 * Runs `rules` against `value` once the field has been blurred, then on every
 * change (debounced by `debounceMs`). Returns the first failing rule's message.
 */
function useValidationError(
  value: string,
  rules: ValidationRule[] | undefined,
  touched: boolean,
  debounceMs: number | undefined
): string | undefined {
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const active = touched && !!rules && rules.length > 0;

  useEffect(() => {
    if (!active || !rules) {
      setValidationError(undefined);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      validateValue(value, rules).then((errors) => {
        if (!cancelled) setValidationError(errors[0]);
      });
    }, Math.max(0, debounceMs ?? 0));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active, rules, value, debounceMs]);

  return active ? validationError : undefined;
}

export const Input = factory<{
  props: InputProps;
  ref: TextInput;
}>(
  (props, ref) => {
    const {
      type = 'text',
      size = 'md',
      validation,
      debounceMs,
      autoComplete,
      keyboardType,
      multiline,
      numberOfLines,
      minLines = 1,
      maxLines,
      maxLength,
      secureTextEntry,
      textInputProps,
      required,
      withAsterisk,
      endSection,
      inputRef,
      value,
      defaultValue,
      onChangeText,
      onBlur,
      error,
      // Native TextInput passthrough props
      autoCapitalize,
      autoCorrect,
      autoFocus,
      returnKeyType,
      blurOnSubmit,
      selectTextOnFocus,
      textContentType,
      textAlign,
      spellCheck,
      inputMode,
      enterKeyHint,
      selectionColor,
      showSoftInputOnFocus,
      editable,
      ...baseProps
    } = props;

    const [showPassword, setShowPassword] = useState(false);
    const [currentLines, setCurrentLines] = useState(minLines);
    const [touched, setTouched] = useState(false);
    // Only tracked for validation of an uncontrolled field.
    const [uncontrolledText, setUncontrolledText] = useState(defaultValue ?? '');
    const hasValidation = !!validation && validation.length > 0;

    const countLines = useCallback(
      (text: string) => {
        if (!text) return minLines;
        const lineCount = text.split('\n').length;
        return Math.max(minLines, maxLines ? Math.min(lineCount, maxLines) : lineCount);
      },
      [minLines, maxLines]
    );

    const handleChangeText = useCallback(
      (text: string) => {
        if (multiline && !numberOfLines) {
          // Grow with the content unless numberOfLines pins the height.
          setCurrentLines(countLines(text));
        }
        if (hasValidation && value === undefined) setUncontrolledText(text);
        onChangeText?.(text);
      },
      [multiline, numberOfLines, countLines, hasValidation, value, onChangeText]
    );

    const handleBlur = useCallback(() => {
      if (hasValidation) setTouched(true);
      onBlur?.();
    }, [hasValidation, onBlur]);

    const validationError = useValidationError(value ?? uncontrolledText, validation, touched, debounceMs);

    const typeConfig = INPUT_TYPE_CONFIG[type] ?? INPUT_TYPE_CONFIG.text;
    const isPasswordType = type === 'password';
    const actualSecureTextEntry = isPasswordType ? !showPassword : (secureTextEntry ?? typeConfig.secureTextEntry);

    const passwordToggle = isPasswordType ? (
      <PasswordToggle
        visible={showPassword}
        onToggle={() => setShowPassword((shown) => !shown)}
        size={size}
        disabled={baseProps.disabled}
      />
    ) : null;

    const effectiveNumberOfLines = numberOfLines ?? (multiline ? currentLines : undefined);

    const mergedTextInputProps = useMemo<ExtendedTextInputProps>(() => {
      // Explicit native props win over the type defaults; `undefined` ones are skipped.
      const passthrough: ExtendedTextInputProps = {};
      if (autoCapitalize !== undefined) passthrough.autoCapitalize = autoCapitalize;
      if (autoCorrect !== undefined) passthrough.autoCorrect = autoCorrect;
      if (autoFocus !== undefined) passthrough.autoFocus = autoFocus;
      if (returnKeyType !== undefined) passthrough.returnKeyType = returnKeyType;
      if (blurOnSubmit !== undefined) passthrough.blurOnSubmit = blurOnSubmit;
      if (selectTextOnFocus !== undefined) passthrough.selectTextOnFocus = selectTextOnFocus;
      if (textContentType !== undefined) passthrough.textContentType = textContentType;
      if (textAlign !== undefined) passthrough.textAlign = textAlign;
      if (spellCheck !== undefined) passthrough.spellCheck = spellCheck;
      if (inputMode !== undefined) passthrough.inputMode = inputMode;
      if (enterKeyHint !== undefined) passthrough.enterKeyHint = enterKeyHint;
      if (selectionColor !== undefined) passthrough.selectionColor = selectionColor;
      if (showSoftInputOnFocus !== undefined) passthrough.showSoftInputOnFocus = showSoftInputOnFocus;
      if (editable !== undefined) passthrough.editable = editable;
      if (autoComplete) passthrough.autoComplete = autoComplete;
      if (keyboardType) passthrough.keyboardType = keyboardType;
      if (multiline !== undefined) passthrough.multiline = multiline;
      if (effectiveNumberOfLines) passthrough.numberOfLines = effectiveNumberOfLines;
      if (maxLength) passthrough.maxLength = maxLength;

      const merged: ExtendedTextInputProps = {
        ...typeConfig,
        ...passthrough,
        ...textInputProps,
        secureTextEntry: actualSecureTextEntry,
      };
      return isPasswordType && !showPassword ? { ...merged, ...HIDDEN_PASSWORD_PROPS } : merged;
    }, [
      typeConfig,
      textInputProps,
      actualSecureTextEntry,
      autoComplete,
      keyboardType,
      multiline,
      effectiveNumberOfLines,
      maxLength,
      isPasswordType,
      showPassword,
      autoCapitalize,
      autoCorrect,
      autoFocus,
      returnKeyType,
      blurOnSubmit,
      selectTextOnFocus,
      textContentType,
      textAlign,
      spellCheck,
      inputMode,
      enterKeyHint,
      selectionColor,
      showSoftInputOnFocus,
      editable,
    ]);

    return (
      <TextInputBase
        {...baseProps}
        ref={ref}
        inputRef={inputRef}
        size={size}
        value={value}
        defaultValue={defaultValue}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        error={error ?? validationError}
        required={required}
        withAsterisk={withAsterisk ?? required}
        endSection={
          passwordToggle && endSection ? (
            <>
              {endSection}
              {passwordToggle}
            </>
          ) : (
            passwordToggle ?? endSection
          )
        }
        textInputProps={mergedTextInputProps}
        secureTextEntry={isPasswordType ? undefined : mergedTextInputProps.secureTextEntry}
      />
    );
  },
  { displayName: 'Input' }
);
