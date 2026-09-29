import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { PressableProps, ViewProps, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useFloating } from '../../core/overlay/useFloating';
import { isNative } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useTheme } from '../../core/theme/ThemeProvider';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { useOverlayMode } from '../../hooks/useOverlayMode';
import { DropdownSheet } from '../_internal/DropdownSheet/DropdownSheet';
import { normalizeHex } from '../ColorInput/utils';
import { SwatchGrid } from '../ColorSwatch/SwatchGrid';
import { getDropdownSurfaceStyle } from '../Select/fieldControlStyles';
import type { ColorPickerProps } from './types';

// Compact preset palette — a smaller, curated set than the full ColorInput.
const DEFAULT_SWATCHES = [
  '#FF6B6B', '#F8B500', '#FECA57', '#96CEB4', '#4ECDC4',
  '#45B7D1', '#54A0FF', '#5F27CD', '#A29BFE', '#0F172A',
];

const FALLBACK_PLACEMENTS: PlacementType[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'];

/** Minimum native touch target, pt. */
const NATIVE_MIN_TARGET = 44;
const SHEET_TITLE = 'Choose a color';

/**
 * A compact swatch-only color picker: a color preview button that opens a
 * small palette (an anchored dropdown on desktop web, a sheet on native and
 * small screens).
 *
 * @example
 * <ColorPicker value={color} onChange={setColor} accessibilityLabel="Label color" />
 */
export const ColorPicker = factory<{ props: ColorPickerProps; ref: View }>((props, ref) => {
  const {
    value,
    defaultValue = '',
    onChange,
    swatches = DEFAULT_SWATCHES,
    swatchLabels,
    size = 28,
    columns = 5,
    disabled = false,
    accessibilityLabel,
    style,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const spacingStyles = resolveStyleProps(extractStyleProps(rest).styleProps, theme);
  const { shouldUseModal } = useOverlayMode();

  const [effectiveValue, setEffectiveValue] = useControllableState<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange,
  });

  const [opened, setOpened] = useState(false);
  const close = useCallback(() => setOpened(false), []);

  const swatchGap = Math.max(4, Math.round(size * 0.25));
  const swatchRadius = Math.max(4, Math.round(size * 0.25));
  const swatchRows = Math.max(1, Math.ceil(swatches.length / columns));
  const popoverHeight = swatchRows * size + (swatchRows - 1) * swatchGap + swatchGap * 2;

  const floating = useFloating({
    opened: opened && !shouldUseModal,
    onDismiss: close,
    placement: 'bottom-start',
    offset: 6,
    fallbackPlacements: FALLBACK_PLACEMENTS,
    // The grid's height is fully determined by the swatch count, so the side
    // can be chosen correctly before the popover is measured.
    desiredHeight: popoverHeight,
    layer: 'dropdown',
    role: 'dialog',
    // Focus lands on the selected swatch (the group's only tab stop).
    autoFocus: true,
    initialFocus: 'first-tabbable',
  });

  const handleSelect = useCallback(
    (color: string) => {
      setEffectiveValue(normalizeHex(color));
      setOpened(false);
    },
    [setEffectiveValue]
  );

  const toggle = useCallback(() => {
    if (disabled) return;
    setOpened((isOpen) => !isOpen);
  }, [disabled]);

  const styles = useThemedStyles(
    (t) => ({
      root: { alignSelf: 'flex-start' } as ViewStyle,
      dropdown: { ...getDropdownSurfaceStyle(t), padding: swatchGap } as ViewStyle,
      sheetBody: { padding: swatchGap * 2, alignItems: 'center' } as ViewStyle,
      preview: {
        width: size,
        height: size,
        borderRadius: swatchRadius,
        borderWidth: 1,
        borderColor: t.backgrounds.border,
      } as ViewStyle,
      previewEmpty: { borderColor: t.backgrounds.borderStrong, borderStyle: 'dashed' } as ViewStyle,
      trigger: webStyle({ cursor: 'pointer' }),
      triggerDisabled: { opacity: 0.5, ...webStyle({ cursor: 'not-allowed' }) } as ViewStyle,
      triggerPressed: { opacity: 0.8 } as ViewStyle,
    }),
    [swatchGap, size, swatchRadius]
  );

  // Native: a small swatch still gets a 44pt touch target.
  const hitSlop = isNative && size < NATIVE_MIN_TARGET ? Math.ceil((NATIVE_MIN_TARGET - size) / 2) : undefined;
  const triggerLabel = accessibilityLabel ?? (effectiveValue ? `Color ${effectiveValue}` : 'Select a color');

  const grid = (
    <SwatchGrid
      swatches={swatches}
      value={effectiveValue}
      onSelect={handleSelect}
      swatchSize={size}
      swatchRadius={swatchRadius}
      gap={swatchGap}
      columns={columns}
      labels={swatchLabels}
      testID={testID ? `${testID}-swatches` : undefined}
    />
  );

  const referenceProps = floating.getReferenceProps() as PressableProps;

  return (
    <View ref={ref} style={[styles.root, spacingStyles, style]} testID={testID}>
      <Pressable
        {...referenceProps}
        // The sheet (native / small screens) is not the floating element, so
        // the expanded state comes from our own flag.
        aria-expanded={opened}
        onPress={toggle}
        disabled={disabled}
        hitSlop={hitSlop}
        {...a11yProps({ role: 'button', label: triggerLabel, disabled })}
        style={({ pressed }) => [
          styles.trigger,
          disabled ? styles.triggerDisabled : pressed ? styles.triggerPressed : null,
        ]}
        testID={testID ? `${testID}-trigger` : undefined}
      >
        <View
          style={[
            styles.preview,
            { backgroundColor: effectiveValue || 'transparent' },
            effectiveValue ? null : styles.previewEmpty,
          ]}
        />
      </Pressable>

      {shouldUseModal ? (
        <DropdownSheet
          opened={opened}
          onClose={close}
          title={SHEET_TITLE}
          testID={testID ? `${testID}-sheet` : undefined}
        >
          <View style={styles.sheetBody}>{grid}</View>
        </DropdownSheet>
      ) : (
        // Renders nothing here with an OverlayProvider; without one it is the
        // inline fallback, positioned against this root view.
        floating.renderFloating(
          <View
            {...(floating.getFloatingProps({
              'aria-label': SHEET_TITLE,
              style: styles.dropdown,
              testID: testID ? `${testID}-dropdown` : undefined,
            }) as ViewProps)}
          >
            {grid}
          </View>
        )
      )}
    </View>
  );
});

ColorPicker.displayName = 'ColorPicker';
