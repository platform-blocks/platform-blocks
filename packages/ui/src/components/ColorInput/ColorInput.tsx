import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import type { LayoutChangeEvent, PressableProps, ViewProps } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useFloating } from '../../core/overlay/useFloating';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import { isNative } from '../../core/platform/flags';
import { webProps } from '../../core/platform/webProps';
import { useKeyboardFocusOptional } from '../../core/providers/KeyboardManagerProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import type { FieldHandle } from '../../core/types/base';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { useOverlayMode } from '../../hooks/useOverlayMode';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer/disclaimerUtils';
import { DropdownSheet } from '../_internal/DropdownSheet/DropdownSheet';
import { Field, FieldBoundary } from '../_internal/Field/Field';
import { SwatchGrid } from '../ColorSwatch/SwatchGrid';
import { Icon } from '../Icon';
import { FieldClearButton } from '../Select/FieldClearButton';
import { useFieldControlStyles } from '../Select/fieldControlStyles';
import { getColorInputStyles } from './styles';
import type { ColorInputProps } from './types';
import { isValidHex, normalizeHex, withHash } from './utils';

// Common color swatches
const DEFAULT_SWATCHES = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#C44569', '#F8B500', '#6C5CE7', '#A29BFE', '#FD79A8',
  '#E84393', '#00B894', '#00CEC9', '#74B9FF', '#0984E3',
];

const DEFAULT_FALLBACK_PLACEMENTS: PlacementType[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'];

/** The anchored dropdown is at least this wide (it otherwise matches the field). */
const DROPDOWN_MIN_WIDTH = 320;
/** Minimum native touch target, pt. */
const NATIVE_MIN_TARGET = 44;

const SHOW_SWATCHES = 'Show color swatches';
const HIDE_SWATCHES = 'Hide color swatches';
const DEFAULT_SHEET_TITLE = 'Choose a color';
const PB_INPUT_DATASET = { pbInput: 'true' } as const;

const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true && node !== '';

/**
 * A color field: a hex text input with a live preview and a swatch palette
 * (an anchored dropdown on desktop web, a sheet on native and small screens).
 * Rendered through the shared `Field` frame, so label, description, error and
 * helper text are linked to the hex input.
 *
 * @example
 * <ColorInput label="Brand color" value={color} onChange={setColor} clearable />
 */
export const ColorInput = factory<{ props: ColorInputProps; ref: FieldHandle }>((props, ref) => {
  const { styleProps, otherProps: afterSpacing } = extractStyleProps(props);
  const { layoutProps, otherProps: afterLayout } = extractLayoutProps(afterSpacing);
  const { disclaimerProps: disclaimerData, otherProps } = extractDisclaimerProps(afterLayout);
  const {
    value,
    defaultValue = '',
    onChange,
    label,
    description,
    error,
    helperText,
    required = false,
    withAsterisk,
    disabled = false,
    readOnly = false,
    size = 'md',
    radius,
    variant = 'default',
    name,
    accessibilityLabel,
    accessibilityHint,
    keyboardFocusId,
    labelProps,
    descriptionProps,
    onFocus,
    onBlur,
    placeholder = 'Select color',
    placeholderTextColor,
    clearable = false,
    clearButtonLabel = 'Clear color',
    onClear,
    startSection,
    endSection,
    showPreview = true,
    showInput = true,
    swatches = DEFAULT_SWATCHES,
    swatchLabels,
    withSwatches = true,
    placement = 'bottom-start',
    flip = true,
    shift = true,
    boundary,
    offset = 8,
    autoReposition = true,
    fallbackPlacements = DEFAULT_FALLBACK_PLACEMENTS,
    keyboardAvoidance = true,
    previewStyle,
    inputStyle,
    style,
    testID,
  } = otherProps;

  const theme = useTheme();
  const { shouldUseModal } = useOverlayMode();
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);

  const [effectiveValue, setEffectiveValue] = useControllableState<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange,
  });

  // The text being edited; re-synced whenever the value changes (typing,
  // swatches, or the controlled prop) — derived during render, not in an effect.
  const [inputValue, setInputValue] = useState(effectiveValue);
  const [syncedValue, setSyncedValue] = useState(effectiveValue);
  if (syncedValue !== effectiveValue) {
    setSyncedValue(effectiveValue);
    setInputValue(effectiveValue);
  }

  const [focused, setFocused] = useState(false);
  const [openedState, setOpenedState] = useState(false);
  const canPick = withSwatches && !disabled && !readOnly;
  const opened = openedState && canPick;
  const close = useCallback(() => setOpenedState(false), []);

  const inputRef = useRef<TextInput>(null);
  const toggleRef = useRef<View>(null);

  const invalid = error !== undefined && error !== null && error !== false && error !== '';
  const controlStyles = useFieldControlStyles({
    size,
    radius,
    variant,
    focused: focused || opened,
    invalid,
    disabled,
  });
  const { metrics, styles } = getColorInputStyles(theme, size);

  // --- dropdown ---------------------------------------------------------------
  const [frameWidth, setFrameWidth] = useState(0);
  const handleFrameLayout = useCallback((event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setFrameWidth((previous) => (previous === width ? previous : width));
  }, []);

  const dropdownWidth = Math.max(frameWidth, DROPDOWN_MIN_WIDTH);
  // Expected height, so the first frame already opens on the side it fits.
  const estimatedHeight = useMemo(() => {
    const inner = dropdownWidth - metrics.dropdownPadding * 2 - 2;
    const perRow = Math.max(1, Math.floor((inner + metrics.swatchGap) / (metrics.swatchSize + metrics.swatchGap)));
    const rows = Math.max(1, Math.ceil(swatches.length / perRow));
    return rows * metrics.swatchSize + (rows - 1) * metrics.swatchGap + metrics.dropdownPadding * 2 + 2;
  }, [dropdownWidth, metrics, swatches.length]);

  const floating = useFloating({
    opened: opened && !shouldUseModal,
    onDismiss: close,
    placement,
    offset,
    flip,
    shift,
    boundary,
    fallbackPlacements,
    keyboardAvoidance,
    autoUpdate: autoReposition,
    desiredHeight: estimatedHeight,
    layer: 'dropdown',
    role: 'dialog',
    // Focus lands on the selected swatch (the palette's only tab stop).
    autoFocus: true,
    initialFocus: 'first-tabbable',
  });

  // --- value handling ---------------------------------------------------------
  const commitInput = useCallback(() => {
    const text = inputValue.trim();
    if (text === '') {
      // Emptying the field clears the color.
      setInputValue('');
      if (effectiveValue !== '') setEffectiveValue('');
      return;
    }
    const candidate = withHash(text);
    if (isValidHex(candidate)) {
      const normalized = normalizeHex(candidate);
      setInputValue(normalized);
      if (normalized !== effectiveValue) setEffectiveValue(normalized);
    } else {
      // Not a color: fall back to the last valid value.
      setInputValue(effectiveValue);
    }
  }, [inputValue, effectiveValue, setEffectiveValue]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputValue(text);
      // Complete hex values are reported while typing, un-normalized, so the
      // text isn't rewritten mid-entry; blur / submit normalize.
      const candidate = withHash(text);
      if (isValidHex(candidate) && candidate !== effectiveValue) {
        setEffectiveValue(candidate);
      }
    },
    [effectiveValue, setEffectiveValue]
  );

  const handleSubmitEditing = useCallback(() => {
    commitInput();
    close();
  }, [commitInput, close]);

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    commitInput();
    onBlur?.();
  }, [commitInput, onBlur]);

  const handleSelect = useCallback(
    (color: string) => {
      const normalized = normalizeHex(color);
      setInputValue(normalized);
      setEffectiveValue(normalized);
      close();
    },
    [setEffectiveValue, close]
  );

  const handleClear = useLatestCallback(() => {
    if (disabled || readOnly) return;
    setInputValue('');
    setEffectiveValue('');
    close();
    onClear?.();
    // Keep the caret in the field for seamless editing.
    if (showInput) requestAnimationFrame(() => inputRef.current?.focus());
  });

  const toggle = useCallback(() => {
    if (!canPick) return;
    setOpenedState((isOpen) => !isOpen);
  }, [canPick]);

  // --- imperative handle / keyboard manager -------------------------------------
  useImperativeHandle(
    ref,
    (): FieldHandle => ({
      focus: () => (inputRef.current ?? toggleRef.current)?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => handleClear(),
      isFocused: () => inputRef.current?.isFocused() ?? false,
    }),
    [handleClear]
  );

  const keyboardFocus = useKeyboardFocusOptional();
  const pendingFocusTarget = keyboardFocus?.pendingFocusTarget;
  const focusTargetId = keyboardFocusId ?? name;
  useEffect(() => {
    if (!keyboardFocus || !focusTargetId || pendingFocusTarget !== focusTargetId) return;
    if (keyboardFocus.consumeFocusTarget(focusTargetId)) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [keyboardFocus, pendingFocusTarget, focusTargetId]);

  // --- render -------------------------------------------------------------------
  const showClearButton = clearable && !disabled && !readOnly && inputValue.length > 0;
  const hasLabel = hasContent(label);
  const toggleLabel = opened ? HIDE_SWATCHES : SHOW_SWATCHES;
  const toggleHitSlop = isNative ? Math.ceil((NATIVE_MIN_TARGET - metrics.toggleSize) / 2) : undefined;
  const sheetTitle = typeof label === 'string' && label ? label : DEFAULT_SHEET_TITLE;
  const referenceProps = floating.getReferenceProps({}, { ref: false }) as PressableProps;

  const grid = (
    <SwatchGrid
      swatches={swatches}
      value={effectiveValue}
      onSelect={handleSelect}
      swatchSize={metrics.swatchSize}
      swatchRadius={metrics.swatchRadius}
      gap={metrics.swatchGap}
      labels={swatchLabels}
      testID={testID ? `${testID}-swatches` : undefined}
    />
  );

  return (
    <Field
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
      style={[getLayoutStyles(layoutProps), resolveStyleProps(styleProps, theme), style]}
      testID={testID}
    >
      {({ controlProps }) => (
        <>
          <View
            ref={floating.refs.setReference}
            onLayout={handleFrameLayout}
            style={[controlStyles.frame, styles.frameGap, inputStyle]}
          >
            {focused && !disabled ? <View style={controlStyles.focusRing} /> : null}

            {startSection ? (
              <FieldBoundary>
                <View style={styles.section}>{startSection}</View>
              </FieldBoundary>
            ) : null}

            {showPreview ? (
              <View
                {...(showInput
                  ? a11yProps({ hidden: true })
                  : a11yProps({ role: 'img', label: effectiveValue ? `Color ${effectiveValue}` : 'No color', accessible: true }))}
                style={[
                  styles.preview,
                  { backgroundColor: effectiveValue || 'transparent' },
                  effectiveValue ? null : styles.previewEmpty,
                  previewStyle,
                ]}
                testID={testID ? `${testID}-preview` : undefined}
              />
            ) : null}

            {showInput ? (
              <TextInput
                ref={inputRef}
                {...controlProps}
                value={inputValue}
                onChangeText={handleChangeText}
                onSubmitEditing={handleSubmitEditing}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor ?? controlStyles.placeholderColor}
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect={false}
                spellCheck={false}
                underlineColorAndroid="transparent"
                maxLength={7}
                editable={!disabled && !readOnly}
                {...webProps({ dataSet: PB_INPUT_DATASET })}
                style={[controlStyles.input, styles.hexInput]}
                testID={testID ? `${testID}-input` : undefined}
              />
            ) : (
              <View style={styles.spacer} />
            )}

            {showClearButton ? (
              <FieldClearButton onPress={handleClear} size={size} label={clearButtonLabel} preventFocusSteal />
            ) : null}

            {endSection ? (
              <FieldBoundary>
                <View style={styles.section}>{endSection}</View>
              </FieldBoundary>
            ) : null}

            {withSwatches ? (
              <Pressable
                ref={toggleRef}
                {...referenceProps}
                // The sheet (native / small screens) is not the floating element,
                // so the expanded state comes from our own flag.
                aria-expanded={opened}
                {...(showInput
                  ? a11yProps({ role: 'button', label: toggleLabel, disabled: !canPick })
                  : {
                      // Without a hex input the toggle is the field's control.
                      ...controlProps,
                      ...a11yProps({
                        role: 'button',
                        label: hasLabel || accessibilityLabel ? undefined : toggleLabel,
                        disabled: !canPick,
                      }),
                    })}
                onPress={toggle}
                disabled={!canPick}
                hitSlop={toggleHitSlop}
                style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
                  styles.toggle,
                  !canPick ? styles.toggleDisabled : pressed ? styles.togglePressed : hovered ? styles.toggleHovered : null,
                ]}
                testID={testID ? `${testID}-toggle` : undefined}
              >
                <Icon
                  name={opened ? 'chevron-up' : 'chevron-down'}
                  size={metrics.iconSize}
                  color={controlStyles.iconColor}
                  decorative
                />
              </Pressable>
            ) : null}

            {/* Without an OverlayProvider this is the inline dropdown, placed against the frame. */}
            {withSwatches && !shouldUseModal
              ? floating.renderFloating(
                  <View
                    {...(floating.getFloatingProps({
                      'aria-label': sheetTitle,
                      style: [styles.dropdown, { width: dropdownWidth }],
                      testID: testID ? `${testID}-dropdown` : undefined,
                    }) as ViewProps)}
                  >
                    {grid}
                  </View>,
                  { width: dropdownWidth }
                )
              : null}
          </View>

          {withSwatches && shouldUseModal ? (
            <DropdownSheet
              opened={opened}
              onClose={close}
              title={sheetTitle}
              scrollable
              testID={testID ? `${testID}-sheet` : undefined}
            >
              <View style={styles.sheetBody}>{grid}</View>
            </DropdownSheet>
          ) : null}

          {renderDisclaimer()}
        </>
      )}
    </Field>
  );
});

ColorInput.displayName = 'ColorInput';
