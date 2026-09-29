import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSubmitEditingEventData,
  type ViewStyle,
} from 'react-native';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { ClearButton } from '../../core/components/ClearButton';
import { factory } from '../../core/factory/factory';
import { webProps } from '../../core/platform/webProps';
import { useKeyboardFocusOptional } from '../../core/providers/KeyboardManagerProvider';
import { useIsMobile } from '../../core/responsive';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getLayoutStyles, extractLayoutProps } from '../../core/utils/layout';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer/disclaimerUtils';
import { Field, FieldBoundary, useFieldContext, type FieldRenderProps } from '../_internal/Field/Field';
import { getFieldFrameStyles } from '../_internal/Field/fieldFrameStyles';
import { getInputRootStyles } from './styles';
import type { TextInputBaseProps } from './types';

export type { TextInputBaseProps } from './types';

/** Whether a label/description/error slot has something to show (`error={true}` counts: invalid, no message). */
const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== '';

const PB_INPUT_DATASET = { pbInput: 'true' } as const;

/**
 * The shared text-field shell: label / description / error / helper text come
 * from the `Field` frame (ids, `aria-labelledby` / `aria-describedby`,
 * `aria-invalid`, error announcement), the bordered frame from
 * `getFieldFrameStyles` (2px focus ring from `theme.states.focusRing`, visible
 * in the error state too). Input, NumberInput, PhoneInput and Search render it.
 *
 * `ref` (and `inputRef`) point at the underlying `TextInput`.
 *
 * Inside another `Field` (e.g. a labelled `FormField`) and without label,
 * description, error or helper text of its own, it renders just the frame and
 * adopts that field's wiring, so the outer label names this input.
 */
export const TextInputBase = factory<{
  props: TextInputBaseProps;
  ref: TextInput;
}>((props, ref) => {
  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(props);
  const { layoutProps, otherProps: propsAfterLayout } = extractLayoutProps(propsAfterSpacing);
  const { disclaimerProps: disclaimerData, otherProps } = extractDisclaimerProps(propsAfterLayout);

  const {
    id,
    value,
    defaultValue,
    onChangeText,
    onEnter,
    label,
    description,
    error,
    helperText,
    disabled = false,
    readOnly = false,
    required = false,
    size = 'md',
    variant = 'default',
    radius,
    withAsterisk,
    placeholder,
    placeholderTextColor,
    startSection,
    endSection,
    startSectionProps,
    endSectionProps,
    focused: focusedProp,
    accessibilityLabel,
    accessibilityHint,
    testID,
    textInputProps,
    style,
    secureTextEntry,
    clearable,
    clearButtonLabel,
    onClear,
    inputRef,
    name,
    keyboardFocusId,
    labelProps,
    descriptionProps,
    onFocus,
    onBlur,
    containerProps,
  } = otherProps;

  const theme = useTheme();
  const isMobile = useIsMobile();
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);
  const outerField = useFieldContext();
  // `true` marks the field invalid without a message, so it counts as an error too.
  const hasOwnError = hasContent(error);
  const headless = !!outerField && !hasContent(label) && !hasContent(description) && !hasContent(helperText) && !hasOwnError;

  const [currentValue, setCurrentValue] = useControllableState<string>({
    value: value == null ? undefined : String(value),
    defaultValue,
    finalValue: '',
    onChange: onChangeText,
  });

  const [focused, setFocused] = useState(false);
  const internalInputRef = useRef<TextInput | null>(null);
  const mergedRef = useMergedRef<TextInput>(internalInputRef, inputRef, ref);

  // KeyboardManagerProvider focus hand-off: an explicit id, else the field name / testID.
  const fallbackFocusId = useA11yId(undefined, 'focus');
  const focusTargetId = useMemo(() => {
    for (const candidate of [keyboardFocusId, name, testID]) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate.trim();
    }
    return fallbackFocusId;
  }, [keyboardFocusId, name, testID, fallbackFocusId]);

  const keyboardFocus = useKeyboardFocusOptional();
  const pendingFocusTarget = keyboardFocus?.pendingFocusTarget;
  useEffect(() => {
    if (!keyboardFocus || !pendingFocusTarget || pendingFocusTarget !== focusTargetId) return;
    if (keyboardFocus.consumeFocusTarget(focusTargetId)) {
      requestAnimationFrame(() => internalInputRef.current?.focus?.());
    }
  }, [keyboardFocus, pendingFocusTarget, focusTargetId]);

  const {
    style: textInputStyle,
    selectionColor: selectionColorProp,
    secureTextEntry: secureTextEntryProp,
    onSubmitEditing: textInputOnSubmitEditing,
    editable: editableProp,
    ...restTextInputProps
  } = textInputProps ?? {};

  const fieldDisabled = disabled || (headless && !!outerField?.disabled);
  const fieldReadOnly = readOnly || (headless && !!outerField?.readOnly);
  const isFocused = focusedProp ?? focused;

  const showClearButton = !!clearable && !fieldDisabled && !fieldReadOnly && currentValue.length > 0;

  const handleChangeText = useCallback((text: string) => setCurrentValue(text), [setCurrentValue]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleSubmitEditing = useCallback(
    (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      textInputOnSubmitEditing?.(event);
      onEnter?.();
    },
    [textInputOnSubmitEditing, onEnter]
  );

  const handleClear = useCallback(() => {
    if (fieldDisabled) return;
    internalInputRef.current?.clear?.();
    // Keep the caret in the field for seamless editing.
    requestAnimationFrame(() => internalInputRef.current?.focus?.());
    handleChangeText('');
    onClear?.();
  }, [fieldDisabled, handleChangeText, onClear]);

  const rootStyles = getInputRootStyles(theme, isMobile);
  const spacingStyles = resolveStyleProps(styleProps, theme);
  const layoutStyles = getLayoutStyles(layoutProps);
  const explicitlySized = useMemo(() => {
    const flat = StyleSheet.flatten(style) as ViewStyle | undefined;
    return (
      styleProps.w !== undefined ||
      styleProps.maw !== undefined ||
      flat?.width !== undefined ||
      flat?.maxWidth !== undefined
    );
  }, [styleProps.w, styleProps.maw, style]);
  const rootStyle = [
    rootStyles.root,
    explicitlySized ? rootStyles.unfloored : null,
    // `fullWidth` first, so an explicit `w` (in `spacingStyles`) wins.
    layoutStyles,
    spacingStyles,
    style,
  ];

  const renderControl = (field: Pick<FieldRenderProps, 'controlProps' | 'invalid'>) => {
    const frame = getFieldFrameStyles(theme, size, variant, radius, field.invalid, isFocused, fieldDisabled);
    const secure = secureTextEntry ?? secureTextEntryProp ?? false;
    const editable = !fieldDisabled && !fieldReadOnly && editableProp !== false;
    const selectionColor =
      selectionColorProp ?? (fieldDisabled ? theme.text.disabled : theme.text.primary);

    return (
      <View style={frame.frame}>
        {isFocused && !fieldDisabled ? <View style={frame.focusRing} /> : null}
        {startSection ? (
          <FieldBoundary>
            <View {...mergeSlotProps({ style: frame.startSection }, startSectionProps)}>{startSection}</View>
          </FieldBoundary>
        ) : null}

        <View style={frame.control}>
          <TextInput
            ref={mergedRef}
            {...field.controlProps}
            {...(accessibilityLabel && headless ? a11yProps({ label: accessibilityLabel }) : null)}
            value={currentValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmitEditing}
            placeholder={placeholder}
            placeholderTextColor={placeholderTextColor ?? theme.text.muted}
            selectionColor={selectionColor}
            testID={testID}
            secureTextEntry={secure}
            {...restTextInputProps}
            {...webProps({ dataSet: PB_INPUT_DATASET })}
            editable={editable}
            style={[frame.input, textInputStyle]}
          />
        </View>

        {showClearButton || endSection ? (
          <FieldBoundary>
            <View {...mergeSlotProps({ style: frame.endSection }, endSectionProps)}>
              {showClearButton ? (
                <ClearButton
                  onPress={handleClear}
                  size={size}
                  accessibilityLabel={clearButtonLabel ?? 'Clear'}
                  hasRightSection={!!endSection}
                />
              ) : null}
              {endSection}
            </View>
          </FieldBoundary>
        ) : null}
      </View>
    );
  };

  const disclaimerNode = renderDisclaimer();

  if (headless && outerField) {
    return (
      <View {...containerProps} style={rootStyle}>
        {renderControl({
          controlProps: outerField.controlProps,
          invalid: outerField.invalid,
        })}
        {disclaimerNode}
      </View>
    );
  }

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
      style={rootStyle}
      containerProps={containerProps}
    >
      {(field) => (
        <>
          {renderControl(field)}
          {disclaimerNode}
        </>
      )}
    </Field>
  );
});

TextInputBase.displayName = 'TextInputBase';
