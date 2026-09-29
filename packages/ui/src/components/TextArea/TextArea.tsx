import React, { useCallback, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ClearButton } from '../../core/components/ClearButton';
import { factory } from '../../core/factory/factory';
import { webProps } from '../../core/platform/webProps';
import { webStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getLayoutStyles, extractLayoutProps } from '../../core/utils/layout';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer/disclaimerUtils';
import { Field, FieldBoundary } from '../_internal/Field/Field';
import { getFieldFrameStyles } from '../_internal/Field/fieldFrameStyles';
import { getTextAreaStyles } from './styles';
import type { TextAreaProps } from './types';

const PB_INPUT_DATASET = { pbInput: 'true' } as const;

/**
 * Multi-line text field. Label, description, error and helper text come from
 * the shared `Field` frame (linked to the text area for assistive technology,
 * errors announced); the box matches Input, including the focus ring.
 * `ref` points at the TextInput.
 */
export const TextArea = factory<{
  props: TextAreaProps;
  ref: TextInput;
}>(
  (props, ref) => {
    // `h` sizes the text box, not the root, so it is taken off before the style props.
    const { h, ...propsWithoutH } = props;
    const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(propsWithoutH);
    const { layoutProps, otherProps: propsAfterLayout } = extractLayoutProps(propsAfterSpacing);
    const { disclaimerProps: disclaimerData, otherProps } = extractDisclaimerProps(propsAfterLayout);

    const {
      id,
      value,
      defaultValue,
      onChangeText,
      label,
      description,
      error,
      helperText,
      disabled = false,
      readOnly = false,
      required = false,
      withAsterisk,
      placeholder,
      placeholderTextColor,
      size = 'md',
      variant = 'default',
      // Undefined by design — the `input` radius token supplies the default.
      radius,
      rows = 3,
      minRows = 1,
      maxRows,
      autoResize = false,
      maxLength,
      showCharCounter = false,
      resize = 'none',
      textInputProps,
      style,
      testID,
      clearable,
      clearButtonLabel,
      onClear,
      labelProps,
      descriptionProps,
      accessibilityLabel,
      accessibilityHint,
      startSection,
      endSection,
      startSectionProps,
      endSectionProps,
      onFocus,
      onBlur,
      editable: editableProp,
      scrollEnabled,
      // Form integration / keyboard hand-off ids: nothing to wire on a text area.
      name: _name,
      keyboardFocusId: _keyboardFocusId,
      ...nativeProps
    } = otherProps;

    const theme = useTheme();
    const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);
    const [focused, setFocused] = useState(false);
    const textInputRef = useRef<TextInput>(null);
    const mergedRef = useMergedRef<TextInput>(textInputRef, ref);

    const { rowHeight, styles } = getTextAreaStyles(theme, size);

    const [currentValue, setCurrentValue] = useControllableState<string>({
      value,
      defaultValue,
      finalValue: '',
      onChange: onChangeText,
    });

    // Rows follow the content while auto-resizing; derived during render.
    const lineCount = currentValue ? currentValue.split('\n').length : rows;
    const visibleRows = autoResize
      ? Math.max(minRows, maxRows ? Math.min(lineCount, maxRows) : lineCount)
      : rows;

    const handleFocus = useCallback(() => {
      setFocused(true);
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(() => {
      setFocused(false);
      onBlur?.();
    }, [onBlur]);

    const handleChangeText = useCallback(
      (text: string) => {
        if (maxLength && text.length > maxLength) return;
        setCurrentValue(text);
      },
      [maxLength, setCurrentValue]
    );

    const showClearButton = !!clearable && !disabled && !readOnly && currentValue.length > 0;

    const handleClear = useCallback(() => {
      if (disabled) return;
      setCurrentValue('');
      textInputRef.current?.clear?.();
      requestAnimationFrame(() => textInputRef.current?.focus?.());
      onClear?.();
    }, [disabled, setCurrentValue, onClear]);

    const charCount = currentValue.length;
    const isCharCountError = maxLength ? charCount > maxLength : false;
    const inputHeight = typeof h === 'number' ? h : visibleRows * rowHeight;

    const { style: textInputStyle, ...restTextInputProps } = textInputProps ?? {};
    const editable = !disabled && !readOnly && editableProp !== false;

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
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        testID={testID}
        // `fullWidth` first, so an explicit `w` wins.
        style={[styles.root, getLayoutStyles(layoutProps), resolveStyleProps(styleProps, theme), style]}
      >
        {({ controlProps, invalid }) => {
          const frame = getFieldFrameStyles(theme, size, variant, radius, invalid, focused, disabled);
          return (
            <>
              <View style={[frame.frame, styles.frame]}>
                {focused && !disabled ? <View style={frame.focusRing} /> : null}
                {startSection ? (
                  <FieldBoundary>
                    <View {...mergeSlotProps({ style: frame.startSection }, startSectionProps)}>{startSection}</View>
                  </FieldBoundary>
                ) : null}

                <View style={frame.control}>
                  <TextInput
                    ref={mergedRef}
                    {...controlProps}
                    value={currentValue}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderTextColor ?? theme.text.muted}
                    multiline
                    numberOfLines={visibleRows}
                    maxLength={maxLength}
                    textAlignVertical="top"
                    scrollEnabled={scrollEnabled ?? !autoResize}
                    {...nativeProps}
                    {...restTextInputProps}
                    {...webProps({ dataSet: PB_INPUT_DATASET })}
                    editable={editable}
                    style={[
                      frame.input,
                      styles.input,
                      { height: inputHeight, paddingEnd: showClearButton ? 32 : 0 },
                      webStyle({ resize }),
                      textInputStyle,
                    ]}
                  />
                </View>

                {endSection ? (
                  <FieldBoundary>
                    <View {...mergeSlotProps({ style: frame.endSection }, endSectionProps)}>{endSection}</View>
                  </FieldBoundary>
                ) : null}

                {showClearButton ? (
                  <ClearButton
                    onPress={handleClear}
                    size={size}
                    accessibilityLabel={clearButtonLabel ?? 'Clear'}
                    style={styles.clearButton}
                  />
                ) : null}
              </View>

              {showCharCounter && maxLength ? (
                <Text style={[styles.counter, isCharCountError && styles.counterError]}>
                  {charCount}/{maxLength}
                </Text>
              ) : null}

              {renderDisclaimer()}
            </>
          );
        }}
      </Field>
    );
  },
  { displayName: 'TextArea' }
);
