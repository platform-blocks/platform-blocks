import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TextInput, View, Text, TextInputProps as RNTextInputProps, StyleSheet, Platform, ViewStyle } from 'react-native';
import { useTheme } from '../../core/theme';
import { createRadiusStyles } from '../../core/theme/radius';
import { getSpacingStyles, extractSpacingProps, getLayoutStyles, extractLayoutProps, mergeSlotProps } from '../../core/utils';
import { factory } from '../../core/factory/factory';
import { createInputStyles } from './styles';
import { FieldHeader } from '../_internal/FieldHeader';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer';
import { BaseInputProps, InputStyleProps, ExtendedTextInputProps } from './types';
import { Icon } from '../Icon';
import { ClearButton } from '../../core/components/ClearButton';
import { useAnnouncer } from '../../core/accessibility/hooks';
import { createAccessibilityProps } from '../../core/accessibility/utils';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useIsMobile } from '../../core/responsive';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';

interface InputLabelProps {
  required?: boolean;
  children: React.ReactNode;
}

const InputLabel: React.FC<InputLabelProps> = ({ required, children }) => {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const { getInputStyles } = createInputStyles(theme, isRTL);
  const styles = getInputStyles({ size: 'md' } as InputStyleProps);

  return (
    <Text style={styles.label}>
      {children}
      {required && (
        <Text style={styles.required} accessibilityLabel="required">
          {' *'}
        </Text>
      )}
    </Text>
  );
};

interface TextInputBaseProps extends BaseInputProps {
  /** Whether input is focused */
  focused?: boolean;
  /** Additional TextInput props */
  textInputProps?: ExtendedTextInputProps;
  /** External ref passthrough */
  inputRef?: any;
  /** Force secure entry regardless of type */
  secureTextEntry?: boolean;
}

export const TextInputBase = factory<{
  props: TextInputBaseProps;
  ref: TextInput;
}>((props, ref) => {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(props);
  const { layoutProps, otherProps: propsAfterLayout } = extractLayoutProps(propsAfterSpacing);
  const { disclaimerProps: disclaimerData, otherProps } = extractDisclaimerProps(propsAfterLayout as TextInputBaseProps);
  
  const {
    value,
    onChangeText,
    onEnter,
  label,
  description,
    error,
    helperText,
    disabled,
    required,
    size = 'md',
    variant = 'default',
    withAsterisk,
    placeholder,
    startSection,
    endSection,
    focused: focusedProp,
    accessibilityLabel,
    accessibilityHint,
    testID,
    textInputProps,
    style,
    radius,
    secureTextEntry,
    clearable,
    clearButtonLabel,
    onClear,
    inputRef,
    name,
    keyboardFocusId,
    labelProps,
    descriptionProps,
    placeholderTextColor,
    startSectionProps,
    endSectionProps,
    ...rest
  } = otherProps;

  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);

  const [focused, setFocused] = useState(false);
  const theme = useTheme();
  const { isRTL } = useDirection();
  const isMobile = useIsMobile();
  const internalInputRef = useRef<TextInput | null>(null);

  // Accessibility hooks
  const { announce } = useAnnouncer();
  const generatedInputIdRef = useRef(`input-${(typeof label === 'string' && label) || 'field'}-${Math.random().toString(36).substr(2, 9)}`);
  const inputId = generatedInputIdRef.current;

  const fallbackFocusIdRef = useRef(`focus-${Math.random().toString(36).substr(2, 8)}`);
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

  const keyboardManager = useKeyboardManagerOptional();

  // Falls back to the shared `input` radius token so Input, AutoComplete, Select,
  // and TextArea round identically instead of each hardcoding a default.
  const radiusStyles = createRadiusStyles(radius, undefined, 'input');

  const isFocused = focusedProp !== undefined ? focusedProp : focused;

  const textInputStyleProp = (textInputProps as any)?.style;
  const selectionColorProp = (textInputProps as any)?.selectionColor;
  const secureTextEntryProp = (textInputProps as any)?.secureTextEntry;
  const textInputOnChange = (textInputProps as any)?.onChangeText as ((text: string) => void) | undefined;

  const restTextInputProps = useMemo(() => {
    if (!textInputProps) return {} as Partial<RNTextInputProps>;
    const { style: _style, selectionColor: _selectionColor, secureTextEntry: _secureEntry, ...restProps } = textInputProps as any;
    return restProps as Partial<RNTextInputProps>;
  }, [textInputProps]);

  const normalizedValue = useMemo(() => {
    if (value == null) return '';
    return typeof value === 'string' ? value : String(value);
  }, [value]);

  const showClearButton = useMemo(() => {
    if (!clearable || disabled) return false;
    return normalizedValue.length > 0;
  }, [clearable, disabled, normalizedValue]);

  const styleProps: InputStyleProps = useMemo(() => ({
    error: !!error,
    disabled: !!disabled,
    focused: isFocused,
    size,
    variant,
    hasLeftSection: !!startSection,
    hasRightSection: !!endSection || showClearButton
  }), [error, disabled, isFocused, size, variant, startSection, endSection, showClearButton]);

  const { getInputStyles } = createInputStyles(theme, isRTL, isMobile);
  const styles = getInputStyles(styleProps, radiusStyles);
  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  // A caller who sizes the field explicitly outranks the desktop width floor —
  // `minWidth` beats both `width` and `maxWidth`, so it has to be dropped rather
  // than merely overridden.
  const containerWidthFloorReset = useMemo(() => {
    const explicitStyle = StyleSheet.flatten(style) as ViewStyle | undefined;
    const sized =
      layoutProps.w !== undefined ||
      layoutProps.maxW !== undefined ||
      explicitStyle?.width !== undefined ||
      explicitStyle?.maxWidth !== undefined;
    return sized ? { minWidth: 0 } : null;
  }, [layoutProps.w, layoutProps.maxW, style]);

  const flattenedInputStyle = useMemo(
    () => (textInputStyleProp ? StyleSheet.flatten(textInputStyleProp) : undefined),
    [textInputStyleProp]
  );

  const isSecureEntry = useMemo(() => {
    if (secureTextEntry !== undefined) {
      return secureTextEntry;
    }
    return secureTextEntryProp ?? false;
  }, [secureTextEntry, secureTextEntryProp]);

  const textColor = (flattenedInputStyle?.color as string) ?? (styleProps.disabled ? theme.text.disabled : theme.text.primary);

  const resolvedInputStyle = useMemo(() => {
    const base = [styles.input] as any[];
    if (textInputStyleProp) {
      base.push(textInputStyleProp);
    }
    base.push({ color: textColor });
    return base;
  }, [styles.input, textInputStyleProp, textColor]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    
    // Announce field information for screen readers
    if (label) {
      const announcement = `${label}${required ? ', required' : ''} text field`;
      announce(announcement);
    }
  }, [announce, label, required]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    
    // Announce validation errors on blur
    if (error) {
      announce(`Error: ${error}`, { priority: 'assertive' });
    }
  }, [announce, error]);

  const handleSubmitEditing = useCallback(() => {
    if (onEnter) {
      onEnter();
    }
  }, [onEnter]);

  // Enhanced accessibility props
  const accessibilityState = {
    disabled: !!disabled,
  };

  const inputAccessibilityProps = {
    accessibilityLabel: accessibilityLabel || (typeof label === 'string' ? label : undefined),
    accessibilityHint: accessibilityHint || helperText,
    accessibilityState,
    accessibilityRequired: required,
    nativeID: inputId,
  };

  const assignInputRef = useCallback((node: TextInput | null) => {
    internalInputRef.current = node;

    if (typeof inputRef === 'function') {
      inputRef(node);
    } else if (inputRef && 'current' in inputRef) {
      (inputRef as any).current = node;
    }

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref && 'current' in ref) {
      (ref as any).current = node;
    }
  }, [inputRef, ref]);

  const handleClear = useCallback(() => {
    if (disabled) return;

    internalInputRef.current?.clear?.();

    // Keep cursor focus for seamless editing
    requestAnimationFrame(() => {
      internalInputRef.current?.focus?.();
    });

    textInputOnChange?.('');
    onChangeText?.('');
    onClear?.();
  }, [disabled, textInputOnChange, onChangeText, onClear]);

  const clearButtonLabelText = clearButtonLabel || 'Clear input';

  const pendingFocusTarget = keyboardManager?.pendingFocusTarget;

  useEffect(() => {
    if (!keyboardManager || !pendingFocusTarget) {
      return;
    }

    if (pendingFocusTarget !== focusTargetId) {
      return;
    }

    if (keyboardManager.consumeFocusTarget(focusTargetId)) {
      requestAnimationFrame(() => {
        internalInputRef.current?.focus?.();
      });
    }
  }, [keyboardManager, pendingFocusTarget, focusTargetId]);

  const disclaimerNode = renderDisclaimer();

  return (
    <View style={[styles.container, containerWidthFloorReset, spacingStyles, layoutStyles, style]} {...rest}>
      <FieldHeader
        label={label}
        description={description}
        required={required}
        withAsterisk={withAsterisk}
        disabled={disabled}
        error={!!error}
        size={size}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
      />

      <View style={styles.inputContainer}>
        {startSection && (
          <View {...mergeSlotProps({ style: styles.startSection }, startSectionProps)}>
            {startSection}
          </View>
        )}

        <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
          <TextInput
            ref={assignInputRef}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmitEditing}
            editable={!disabled}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor ?? theme.text.muted}
            style={resolvedInputStyle}
            selectionColor={selectionColorProp ?? textColor}
            testID={testID}
            secureTextEntry={isSecureEntry}
            {...inputAccessibilityProps}
            {...restTextInputProps}
          />
        </View>

        {(showClearButton || endSection) && (
          <View {...mergeSlotProps({ style: styles.endSection }, endSectionProps)}>
            {showClearButton && (
              <ClearButton
                onPress={handleClear}
                size={size}
                accessibilityLabel={clearButtonLabelText}
                hasRightSection={!!endSection}
              />
            )}
            {endSection}
          </View>
        )}
      </View>

      {disclaimerNode}

      {error ? (
        <Text style={styles.error} role="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {helperText && !error ? (
        <Text style={styles.helperText}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
});
