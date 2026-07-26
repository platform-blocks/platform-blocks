import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { resolveSurface } from '../../core/theme/surfaces';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { useDropdownPositioning } from '../../core/hooks/useDropdownPositioning';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
import { useControllableState, useOverlayMode } from '../../hooks';
import { ColorSwatch } from '../ColorSwatch';
import { normalizeHex } from '../ColorInput/utils';
import type { ColorPickerProps } from './types';

// Compact preset palette — a smaller, curated set than the full ColorInput.
const DEFAULT_SWATCHES = [
  '#FF6B6B', '#F8B500', '#FECA57', '#96CEB4', '#4ECDC4',
  '#45B7D1', '#54A0FF', '#5F27CD', '#A29BFE', '#0F172A',
];

const DEFAULT_FALLBACK_PLACEMENTS: PlacementType[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end', 'bottom', 'top'];

export const ColorPicker = factory<{ props: ColorPickerProps; ref: View }>((props, ref) => {
  const {
    value,
    defaultValue = '',
    onChange,
    swatches = DEFAULT_SWATCHES,
    size = 28,
    columns = 5,
    disabled = false,
    accessibilityLabel,
    style,
    testID,
    ...spacing
  } = props;

  const theme = useTheme();
  const spacingStyles = getSpacingStyles(extractSpacingProps(spacing).spacingProps);
  const { shouldUseModal, shouldUseOverlay } = useOverlayMode();

  const [effectiveValue, setEffectiveValue] = useControllableState<string>({
    value,
    defaultValue,
    finalValue: '',
    onChange,
  });

  const [isOpen, setIsOpen] = useState(false);

  const swatchGap = Math.max(4, Math.round(size * 0.25));
  const swatchRadius = Math.max(4, Math.round(size * 0.25));
  const popoverWidth = columns * size + (columns - 1) * swatchGap + swatchGap * 2;
  const swatchRows = Math.max(1, Math.ceil(swatches.length / columns));
  const popoverHeight = swatchRows * size + (swatchRows - 1) * swatchGap + swatchGap * 2;

  // Portals the swatch grid through the app-level OverlayProvider so it escapes
  // any `overflow: hidden` ancestor and repositions at viewport edges — the same
  // system Tooltip / ColorInput / AutoComplete use.
  const {
    position,
    anchorRef,
    popoverRef,
    showOverlay,
    hideOverlay,
    updatePosition,
  } = useDropdownPositioning({
    isOpen: isOpen && shouldUseOverlay,
    placement: 'bottom-start',
    flip: true,
    shift: true,
    offset: 6,
    autoUpdate: true,
    fallbackPlacements: DEFAULT_FALLBACK_PLACEMENTS,
    // The grid's height is fully determined by the swatch count, so the side can
    // be chosen correctly before the popover ever mounts.
    desiredHeight: popoverHeight,
    onClose: () => setIsOpen(false),
  });

  const handleSelect = useCallback((color: string) => {
    setEffectiveValue(normalizeHex(color));
    setIsOpen(false);
    hideOverlay();
  }, [setEffectiveValue, hideOverlay]);

  const toggleOpen = useCallback(() => {
    if (disabled) return;
    if (isOpen) {
      hideOverlay();
    }
    setIsOpen((open) => !open);
  }, [disabled, isOpen, hideOverlay]);

  const handleModalDismiss = useCallback(() => {
    setIsOpen(false);
    hideOverlay();
  }, [hideOverlay]);

  /**
   * Edge-pinned and height-capped by the positioner, so a layout pass can't move
   * the popover any more — this only refreshes the reported size. Replaces a
   * `setTimeout(…, 16)` that deferred a corrective reposition.
   */
  const handlePopoverLayout = useCallback(() => {
    updatePosition({ silent: true });
  }, [updatePosition]);

  const renderSwatches = useCallback(() => (
    swatches.map((color) => (
      <ColorSwatch
        key={color}
        color={color}
        size={size}
        borderRadius={swatchRadius}
        selected={effectiveValue === color}
        showBorder={false}
        onPress={() => handleSelect(color)}
      />
    ))
  ), [swatches, size, swatchRadius, effectiveValue, handleSelect]);

  const dropdownStyle = useMemo(() => ({
    padding: swatchGap,
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: swatchGap,
    // Level 2 — matches menus, select dropdowns and popovers.
    backgroundColor: resolveSurface(theme, 2).background,
    borderWidth: 1,
    borderColor: resolveSurface(theme, 2).border,
    borderRadius: Math.max(6, Math.round(size * 0.3)),
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    elevation: 8,
  }), [swatchGap, theme, size]);

  // Portaled overlay lifecycle — mirrors ColorInput.
  useEffect(() => {
    if (!shouldUseOverlay || !isOpen || !position) return;

    const content = (
      <View
        ref={popoverRef}
        onLayout={handlePopoverLayout}
        style={[dropdownStyle, { width: popoverWidth }]}
      >
        {renderSwatches()}
      </View>
    );

    showOverlay(content, { width: popoverWidth });
  }, [shouldUseOverlay, isOpen, position, showOverlay, handlePopoverLayout, renderSwatches, dropdownStyle, popoverWidth, popoverRef]);

  return (
    <View ref={ref} style={[{ alignSelf: 'flex-start' }, spacingStyles, style]} testID={testID}>
      <View ref={anchorRef}>
        <Pressable
          onPress={toggleOpen}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || (effectiveValue ? `Color ${effectiveValue}` : 'Select a color')}
          accessibilityState={{ expanded: isOpen, disabled }}
          style={({ pressed }) => ({ opacity: disabled ? 0.5 : pressed ? 0.8 : 1 })}
        >
          <View
            style={{
              width: size,
              height: size,
              borderRadius: swatchRadius,
              backgroundColor: effectiveValue || 'transparent',
              borderWidth: 1,
              borderColor: effectiveValue ? theme.colors.gray[3] : theme.colors.gray[4],
              ...(!effectiveValue && { borderStyle: 'dashed' as const }),
            }}
          />
        </Pressable>
      </View>

      {isOpen && shouldUseModal && (
        <Modal transparent animationType="fade" visible onRequestClose={handleModalDismiss}>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', padding: 24, justifyContent: 'center', alignItems: 'center' }}
            onPress={handleModalDismiss}
          >
            <Pressable style={[dropdownStyle, { width: popoverWidth, maxWidth: '90%' }]}>
              {renderSwatches()}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
});

ColorPicker.displayName = 'ColorPicker';
