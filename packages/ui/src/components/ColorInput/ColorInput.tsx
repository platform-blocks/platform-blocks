import React, { useState, useRef, useCallback, useEffect, forwardRef, useMemo } from 'react';
import { View, TextInput, Pressable, Modal } from 'react-native';
import { Text } from '../Text';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { FieldHeader } from '../_internal/FieldHeader';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { useDropdownPositioning } from '../../core/hooks/useDropdownPositioning';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import { createRadiusStyles } from '../../core/theme/radius';
import { clampComponentSize, resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { getComponentSize } from '../../core/theme/unified-sizing';
import { useColorInputStyles, type ColorInputSizeMetrics } from './styles';
import { ColorInputProps } from './types';
import { useControllableState, useOverlayMode } from '../../hooks';

import { isValidHex, normalizeHex } from './utils';
import { ColorSwatch } from '../ColorSwatch';
import { ClearButton } from '../../core/components/ClearButton';

// Common color swatches
const DEFAULT_SWATCHES = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#C44569', '#F8B500', '#6C5CE7', '#A29BFE', '#FD79A8',
  '#E84393', '#00B894', '#00CEC9', '#74B9FF', '#0984E3',
];

const DEFAULT_FALLBACK_PLACEMENTS: PlacementType[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'];

/** Tallest the swatch dropdown gets, and the height hint the positioner uses to pick a side. */
const COLOR_INPUT_DROPDOWN_MAX_HEIGHT = 420;

const COLOR_INPUT_ALLOWED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const COLOR_INPUT_ALLOWED_SIZES_ARRAY: ComponentSize[] = [...COLOR_INPUT_ALLOWED_SIZES];

const COLOR_INPUT_SIZE_SCALE: Partial<Record<ComponentSize, ColorInputSizeMetrics>> = {
  xs: createMetricsForToken('xs'),
  sm: createMetricsForToken('sm'),
  md: createMetricsForToken('md'),
  lg: createMetricsForToken('lg'),
  xl: createMetricsForToken('xl'),
};

const BASE_COLOR_INPUT_METRICS: ColorInputSizeMetrics = COLOR_INPUT_SIZE_SCALE.md ?? createMetricsForToken('md');

const CLEAR_BUTTON_SIZE_THRESHOLDS: Array<{ max: number; token: ComponentSize }> = [
  { max: 34, token: 'xs' },
  { max: 38, token: 'sm' },
  { max: 42, token: 'md' },
  { max: 48, token: 'lg' },
  { max: 54, token: 'xl' },
  { max: 60, token: '2xl' },
  { max: Number.POSITIVE_INFINITY, token: '3xl' },
];

function createMetricsForToken(size: ComponentSize): ColorInputSizeMetrics {
  const config = getComponentSize(size);

  return {
    inputHeight: config.height,
    paddingHorizontal: config.padding,
    paddingVertical: Math.max(6, Math.round(config.padding * 0.65)),
    previewSize: Math.max(18, Math.round(config.height * 0.6)),
    previewBorderRadius: Math.max(4, Math.round(config.borderRadius * 0.5)),
    previewMarginRight: Math.max(6, Math.round(config.padding * 0.7)),
    textFontSize: Math.max(11, Math.round(config.fontSize * 0.875)),
    textInputHeight: Math.max(16, Math.round(config.height * 0.5)),
    dropdownIconSize: Math.max(12, Math.round(config.iconSize * 0.85)),
    dropdownIconMarginLeft: Math.max(6, Math.round(config.padding * 0.7)),
    swatchSize: Math.max(28, Math.round(config.height * 0.75)),
    swatchGap: Math.max(6, Math.round(config.padding * 0.5)),
  };
}

function resolveColorInputMetrics(value: ComponentSizeValue | undefined): ColorInputSizeMetrics {
  const resolved = resolveComponentSize(value, COLOR_INPUT_SIZE_SCALE, {
    allowedSizes: COLOR_INPUT_ALLOWED_SIZES_ARRAY,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return calculateNumericMetrics(resolved);
  }

  return resolved;
}

function calculateNumericMetrics(height: number): ColorInputSizeMetrics {
  const scale = height / BASE_COLOR_INPUT_METRICS.inputHeight;

  const clamp = (measurement: number, minimum: number) => Math.max(minimum, Math.round(measurement));

  return {
    inputHeight: height,
    paddingHorizontal: clamp(BASE_COLOR_INPUT_METRICS.paddingHorizontal * scale, 6),
    paddingVertical: clamp(BASE_COLOR_INPUT_METRICS.paddingVertical * scale, 4),
    previewSize: clamp(BASE_COLOR_INPUT_METRICS.previewSize * scale, 12),
    previewBorderRadius: clamp(BASE_COLOR_INPUT_METRICS.previewBorderRadius * scale, 2),
    previewMarginRight: clamp(BASE_COLOR_INPUT_METRICS.previewMarginRight * scale, 4),
    textFontSize: clamp(BASE_COLOR_INPUT_METRICS.textFontSize * scale, 10),
    textInputHeight: clamp(BASE_COLOR_INPUT_METRICS.textInputHeight * scale, 14),
    dropdownIconSize: clamp(BASE_COLOR_INPUT_METRICS.dropdownIconSize * scale, 10),
    dropdownIconMarginLeft: clamp(BASE_COLOR_INPUT_METRICS.dropdownIconMarginLeft * scale, 4),
    swatchSize: clamp(BASE_COLOR_INPUT_METRICS.swatchSize * scale, 20),
    swatchGap: clamp(BASE_COLOR_INPUT_METRICS.swatchGap * scale, 4),
  };
}

function mapClearButtonSize(height: number): ComponentSize {
  for (const entry of CLEAR_BUTTON_SIZE_THRESHOLDS) {
    if (height <= entry.max) {
      return entry.token;
    }
  }

  return 'md';
}

interface ColorInputFactoryPayload {
  props: ColorInputProps;
  ref: View;
}

const ColorInputBase = forwardRef<View, ColorInputProps>((props, ref) => {
  const {
    value,
    defaultValue = '',
    onChange,
    label,
    placeholder = 'Select color',
    disabled = false,
    required = false,
    error,
    description,
    size = 'md',
    variant = 'default',
    // Undefined by design — the `input` radius token supplies the default.
    radius,
    showPreview = true,
    showInput = true,
    swatches = DEFAULT_SWATCHES,
    withSwatches = true,
    format = 'hex',
    withAlpha = false,
    style,
    previewStyle,
    inputStyle,
  testID,
  clearable = false,
  clearButtonLabel = 'Clear color',
    // Positioning props
    placement = 'bottom-start',
    flip = true,
    shift = true,
    boundary,
    offset = 8,
    autoReposition = true,
    fallbackPlacements = DEFAULT_FALLBACK_PLACEMENTS,
    keyboardAvoidance = true,
    ...spacingProps
  } = props;

  const [effectiveValue, setEffectiveValue] = useControllableState<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(effectiveValue);
  const [focused, setFocused] = useState(false);
  const { shouldUseModal, shouldUseOverlay } = useOverlayMode();

  const theme = useTheme();
  const sizeMetrics = useMemo(() => resolveColorInputMetrics(size), [size]);
  const styles = useColorInputStyles(sizeMetrics);
  const radiusStyles = useMemo(
    () => createRadiusStyles(radius, sizeMetrics.inputHeight, 'input'),
    [radius, sizeMetrics.inputHeight]
  );
  const clearButtonSize = useMemo<ComponentSize>(() => {
    const clamped = clampComponentSize(size ?? 'md', COLOR_INPUT_ALLOWED_SIZES_ARRAY, 'md');

    if (typeof clamped === 'number') {
      return mapClearButtonSize(clamped);
    }

    return clamped;
  }, [size]);
  const spacingStyles = getSpacingStyles(extractSpacingProps(spacingProps).spacingProps);

  // Enhanced positioning system using shared dropdown hook
  const {
    position,
    anchorRef,
    popoverRef,
    showOverlay,
    hideOverlay,
    updatePosition,
  } = useDropdownPositioning({
    isOpen: isOpen && shouldUseOverlay,
    placement,
    flip,
    shift,
    boundary,
    offset,
    autoUpdate: autoReposition,
    fallbackPlacements,
    keyboardAvoidance,
    // The picker's full height, so the side is chosen correctly on the very
    // first pass instead of being corrected once the dropdown has been measured.
    desiredHeight: COLOR_INPUT_DROPDOWN_MAX_HEIGHT,
    onClose: () => setIsOpen(false),
  });

  /**
   * The dropdown is edge-pinned and height-capped by the positioner, so its own
   * layout can no longer change where it sits — this just refreshes the reported
   * size. The `setTimeout(…, 16)` it replaces was there to defer a corrective
   * reposition until the DOM had settled; there is nothing left to correct.
   */
  const handleDropdownLayout = useCallback(() => {
    updatePosition({ silent: true });
  }, [updatePosition]);

  // Sync inputValue when effectiveValue changes (controlled mode or defaultValue changes)
  useEffect(() => {
    setInputValue(effectiveValue);
  }, [effectiveValue]);

  const handleColorSelect = useCallback((color: string) => {
    const normalizedColor = normalizeHex(color);
    setInputValue(normalizedColor);
    setEffectiveValue(normalizedColor);
    setIsOpen(false);

    // Close overlay
    hideOverlay();
  }, [setEffectiveValue, hideOverlay]);

  const renderDropdownContent = useCallback(() => (
    <>
      {withSwatches && (
        <View style={styles.colorPalette}>
          {/* <Text style={styles.paletteTitle}>Color Swatches</Text> */}
          <View style={styles.swatchGrid}>
            {swatches.map((swatchColor) => (
              <ColorSwatch
                key={swatchColor}
                color={swatchColor}
                size={sizeMetrics.swatchSize}
                borderRadius={Math.max(4, Math.round(sizeMetrics.previewBorderRadius))}
                onPress={() => handleColorSelect(swatchColor)}
                selected={effectiveValue === swatchColor}
                showBorder={false}
              />
            ))}
          </View>
        </View>
      )}
    </>
  ), [withSwatches, styles, swatches, handleColorSelect, effectiveValue, sizeMetrics.previewBorderRadius, sizeMetrics.swatchSize]);

  const handleInputChange = useCallback((text: string) => {
    setInputValue(text);
    // Only update the value if it's a complete hex (3 or 6 chars after #)
    // Don't normalize here to allow typing without interference
    if (isValidHex(text)) {
      // Deliberately un-normalized, so typing isn't rewritten mid-entry.
      setEffectiveValue(text);
    }
  }, [setEffectiveValue]);

  const handleInputSubmit = useCallback(() => {
    if (isValidHex(inputValue)) {
      const normalizedColor = normalizeHex(inputValue);
      setInputValue(normalizedColor);
      setEffectiveValue(normalizedColor);
    } else {
      setInputValue(effectiveValue); // Reset to valid value
    }
    setFocused(false);
    setIsOpen(false);

    // Close overlay
    hideOverlay();
  }, [inputValue, effectiveValue, setEffectiveValue, hideOverlay]);

  const handleInputBlur = useCallback(() => {
    setFocused(false);

    // Normalize the hex value when user finishes editing
    if (isValidHex(inputValue)) {
      const normalizedColor = normalizeHex(inputValue);
      setInputValue(normalizedColor);
      setEffectiveValue(normalizedColor);
    } else if (inputValue !== effectiveValue) {
      // Reset to valid value if invalid
      setInputValue(effectiveValue);
    }
  }, [inputValue, effectiveValue, setEffectiveValue]);

  const handleToggleDropdown = useCallback(() => {
    if (disabled) return;

    if (isOpen) {
      setFocused(false);
      hideOverlay();
    }

    setIsOpen(!isOpen);
  }, [disabled, hideOverlay, isOpen]);

  const handleModalDismiss = useCallback(() => {
    setFocused(false);
    setIsOpen(false);
    hideOverlay();
  }, [hideOverlay]);

  const handleClear = useCallback(() => {
    if (disabled) return;

    setInputValue('');
    setEffectiveValue('');
    hideOverlay();
    setIsOpen(false);
  }, [disabled, hideOverlay, setEffectiveValue]);

  const showClearButton = clearable && showInput && !disabled && (inputValue?.length ?? 0) > 0;

  // Handle opening/closing overlay with positioning
  useEffect(() => {
    if (!shouldUseOverlay || !isOpen || !position) {
      return;
    }

    const minimumWidth = typeof styles.dropdown.minWidth === 'number'
      ? styles.dropdown.minWidth
      : 320;
    const dropdownWidth = Math.max(position.finalWidth ?? 0, minimumWidth);
    const dropdownMaxHeight = position.maxHeight ?? COLOR_INPUT_DROPDOWN_MAX_HEIGHT;

    const dropdownContent = (
      <View
        ref={popoverRef}
        onLayout={handleDropdownLayout}
        style={[
          styles.dropdown,
          {
            width: dropdownWidth,
            maxHeight: dropdownMaxHeight,
          },
        ]}
      >
        {renderDropdownContent()}
      </View>
    );

    showOverlay(dropdownContent, {
      width: dropdownWidth,
      maxHeight: dropdownMaxHeight,
    });
  }, [
    shouldUseOverlay,
    isOpen,
    position,
    showOverlay,
    handleDropdownLayout,
    renderDropdownContent,
    styles.dropdown,
  ]);

  return (
    <View ref={ref} style={[spacingStyles, style]} testID={testID}>
      {label && (
        <FieldHeader
          label={label}
          required={required}
          error={!!error}
          description={description}
        />
      )}

      <View ref={anchorRef} style={styles.wrapper}>
        <View
          style={[
            styles.input,
            radiusStyles,
            focused && styles.inputFocused,
            error && styles.inputError,
            disabled && styles.inputDisabled,
            inputStyle,
          ]}
        >
          {showPreview && (
            <View style={styles.previewWrapper}>
              <View
                style={[
                  styles.preview,
                  previewStyle,
                  {
                    backgroundColor: effectiveValue || 'transparent',
                    // Show a subtle border when no color is selected
                    ...((!effectiveValue) && {
                      borderWidth: 1,
                      borderColor: theme.colors.gray[3],
                      borderStyle: 'dashed',
                    })
                  },
                ]}
              />
            </View>
          )}

          {showInput && (
            <TextInput
              value={inputValue}
              onChangeText={handleInputChange}
              onSubmitEditing={handleInputSubmit}
              onFocus={() => setFocused(true)}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              placeholderTextColor={theme.text.secondary}
              style={[
                styles.textInput,
                { flex: 1 }
              ]}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect={false}
              underlineColorAndroid="transparent"
              maxLength={7}
              editable={!disabled}
            />
          )}

          {showClearButton && (
            <ClearButton
              onPress={handleClear}
              disabled={disabled}
              size={clearButtonSize}
              accessibilityLabel={clearButtonLabel}
              hasRightSection={true}
              style={{ marginRight: Math.max(4, Math.round(sizeMetrics.previewMarginRight * 0.5)) }}
            />
          )}

          <Pressable
            onPress={handleToggleDropdown}
            disabled={disabled}
            style={({ pressed }) => ([
              styles.dropdownTrigger,
              pressed ? styles.dropdownTriggerPressed : null,
            ])}
            accessibilityRole="button"
            accessibilityLabel={isOpen ? 'Collapse color options' : 'Expand color options'}
            accessibilityState={{ expanded: isOpen }}
          >
            <Text style={styles.dropdownIcon}>{isOpen ? '▲' : '▼'}</Text>
          </Pressable>
        </View>
      </View>
      {isOpen && shouldUseModal && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={handleModalDismiss}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', padding: 24, justifyContent: 'center' }}
            onPress={handleModalDismiss}
          >
            <Pressable style={[styles.dropdown, { width: '100%', maxWidth: 360, alignSelf: 'center', maxHeight: '80%', minWidth: 0 }]}> 
              {renderDropdownContent()}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
});

export const ColorInput = factory<ColorInputFactoryPayload>((props, ref) => (
  <ColorInputBase {...props} ref={ref} />
));

ColorInput.displayName = 'ColorInput';