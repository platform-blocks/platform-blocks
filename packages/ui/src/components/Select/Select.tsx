import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Pressable, FlatList, Text as RNText, Modal, Platform, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { factory } from '../../core/factory/factory';
import { FieldHeader } from '../_internal/FieldHeader';
import { createInputStyles } from '../Input/styles';
import { useTheme } from '../../core/theme';
import { createRadiusStyles } from '../../core/theme/radius';
import { getSpacingStyles, extractSpacingProps, extractLayoutProps, getLayoutStyles } from '../../core/utils';
import type { SizeValue } from '../../core/theme/types';
import { getFontSize } from '../../core/theme/sizes';
import { MenuItemButton } from '../MenuItemButton';
import { ListGroup, ListGroupDivider } from '../ListGroup';
import { Surface } from '../Surface';
import { Icon } from '../Icon';
import { ClearButton } from '../../core/components/ClearButton';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useReducedMotion } from '../../core/motion/ReducedMotionProvider';
import { useMenuStyles } from '../Menu/styles';
import { Text } from '../Text';
import { useKeyboardManagerOptional } from '../../core/providers/KeyboardManagerProvider';
import { handleSelectionComplete } from '../../core/keyboard/selection';
import { useDropdownPositioning } from '../../core/hooks/useDropdownPositioning';
import { useOverlayMode } from '../../hooks';
import type { PlacementType } from '../../core/utils/positioning-enhanced';

import type { SelectOption, SelectProps } from './Select.types';
import { CustomOption } from './CustomOption';

/** Matches the Accordion chevron spin so every disclosure affordance reads alike. */
const CHEVRON_SPIN_DURATION = 220;

/**
 * Approximate height of one rendered option row.
 *
 * Only used to pre-empt the measurement, so being a few px out is harmless — it
 * shifts the flip threshold slightly, never the final layout, which is driven by
 * the `maxHeight` the positioner returns. Mirrors `MenuItemButton` in `compact`
 * mode: one line of text plus its vertical padding.
 */
function estimateOptionRowHeight(size: SizeValue): number {
  return Math.round(getFontSize(size) * 1.5) + 16;
}

const DROPDOWN_FALLBACK_PLACEMENTS: PlacementType[] = [
  'top-start',
  'top-end',
  'top',
  'bottom-start',
  'bottom-end',
  'bottom',
];

export const Select = factory<{ props: SelectProps; ref: any }>((allProps, ref) => {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(allProps as any);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  const {
    value: valueProp,
    defaultValue,
    onChange,
    options,
    placeholder = 'Select…',
    size = 'md',
    // Undefined by design — the `input` radius token supplies the default.
    radius,
    disabled,
    label,
    helperText,
    description,
    error,
    renderOption,
    fullWidth,
    maxH = 260,
    closeOnSelect = true,
    clearable,
    clearButtonLabel,
    onClear,
    refocusAfterSelect,
    keyboardAvoidance = true,
    labelProps,
    descriptionProps,
    variant = 'default',
  } = otherProps as SelectProps;

  const theme = useTheme();
  const { shouldUseModal, shouldUseOverlay } = useOverlayMode();
  const menuStyles = useMenuStyles();
  const { isRTL } = useDirection();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any>(valueProp ?? defaultValue ?? null);
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);

  // The chevron is a single `chevron-down` spun a half turn rather than two
  // swapped icons, so opening and closing read as one continuous motion.
  const reducedMotion = useReducedMotion();
  const chevronRotation = useSharedValue(open ? 180 : 0);
  useEffect(() => {
    const target = open ? 180 : 0;
    if (reducedMotion) {
      chevronRotation.value = target;
      return;
    }
    chevronRotation.value = withTiming(target, {
      duration: CHEVRON_SPIN_DURATION,
      easing: Easing.inOut(Easing.ease),
    });
  }, [open, reducedMotion, chevronRotation]);
  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const triggerRef = useRef<View | null>(null);
  const keyboardManager = useKeyboardManagerOptional();
  const dismissKeyboardRef = keyboardManager?.dismissKeyboard;

  // How tall the menu will be, known before it mounts. Feeding this to the
  // positioner is what lets the very first calculation pick the correct side:
  // without it the pre-measure pass assumes a short popover, decides a Select
  // near the bottom of the window fits below, and then flips above once the real
  // height arrives — the visible jump this replaces.
  const estimatedDropdownHeight = useMemo(() => {
    const rowHeight = estimateOptionRowHeight(size as SizeValue);
    // +2 for the Surface border, and a divider between each pair of rows.
    const contentHeight = options.length * rowHeight + Math.max(0, options.length - 1) + 2;
    return typeof maxH === 'number' ? Math.min(maxH, contentHeight) : contentHeight;
  }, [options.length, size, maxH]);

  const {
    position,
    anchorRef,
    popoverRef,
    showOverlay,
    hideOverlay,
    updatePosition,
  } = useDropdownPositioning({
    isOpen: open && shouldUseOverlay,
    placement: 'bottom-start',
    flip: true,
    shift: true,
    offset: 6,
    boundary: 8,
    desiredHeight: estimatedDropdownHeight,
    fallbackPlacements: DROPDOWN_FALLBACK_PLACEMENTS,
    keyboardAvoidance,
    closeOnClickOutside: true,
    closeOnEscape: true,
    matchAnchorWidth: true,
    onClose: () => setOpen(false),
  });

  useEffect(() => {
    if (valueProp !== undefined) {
      setValue(valueProp);
    }
  }, [valueProp]);

  useEffect(() => {
    if (!open) {
      dismissKeyboardRef?.();
    }
  }, [open, dismissKeyboardRef]);

  const focusTrigger = useCallback(() => {
    const node: any = triggerRef.current;
    node?.focus?.();
  }, []);

  const blurTrigger = useCallback(() => {
    const node: any = triggerRef.current;
    node?.blur?.();
  }, []);

  const setTriggerNode = useCallback((node: View | null) => {
    triggerRef.current = node;
    (anchorRef as any).current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as any).current = node;
    }
  }, [anchorRef, ref]);

  const radiusStyles = createRadiusStyles(radius, undefined, 'input');
  const { getInputStyles } = createInputStyles(theme, isRTL);
  const inputStyles = getInputStyles({
    size: size as SizeValue,
    focused: open,
    error: !!error,
    disabled: !!disabled,
    hasLeftSection: false,
    hasRightSection: true,
    variant,
  }, radiusStyles);

  // The trigger renders its own <Text> rather than a real <TextInput>, so it has
  // to resolve the field font size itself — the same scale `createInputStyles`
  // uses — and the dropdown options are pinned to it.
  const fieldFontSize = getFontSize(size as SizeValue);

  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const hasExplicitWidth = !!(layoutProps as any)?.width || !!(layoutProps as any)?.minWidth || !!(layoutProps as any)?.flex || fullWidth;
  const defaultMinWidthStyle = !hasExplicitWidth ? { minWidth: 200 } : null;
  const fullWidthStyle = fullWidth ? { width: '100%' as const } : null;

  const selectedOption = options.find((o: SelectOption) => o.value === value) || null;
  const showClearButton = !!(clearable && selectedOption && !disabled);
  const clearLabel = clearButtonLabel || 'Clear selection';

  const close = useCallback(() => {
    setOpen(false);
    hideOverlay();
    keyboardManager?.dismissKeyboard();
  }, [hideOverlay, keyboardManager]);

  const measureTrigger = useCallback(() => {
    if (shouldUseOverlay) return;
    if (!triggerRef.current) return;

    try {
      (triggerRef.current as any).measure?.((x: number, y: number, width: number) => {
        setTriggerWidth(width);
      });
    } catch {
      /* native measurement failures can be ignored safely */
    }
  }, [shouldUseOverlay]);

  const toggle = useCallback(() => {
    if (disabled) return;

    setOpen(prev => {
      const next = !prev;
      if (next) {
        if (shouldUseModal) {
          measureTrigger();
        }
      } else {
        hideOverlay();
        keyboardManager?.dismissKeyboard();
      }
      return next;
    });
  }, [disabled, measureTrigger, hideOverlay, keyboardManager, shouldUseModal]);

  /**
   * The dropdown is edge-pinned and height-capped by the positioner, so a layout
   * pass no longer changes where it sits — it only refreshes `finalHeight` for
   * consumers that read it. That makes this a plain silent refresh: the old
   * `setTimeout(…, 16)` existed to defer a *corrective* reposition until after
   * the DOM had settled, and correcting is exactly what no longer happens.
   */
  const handleDropdownLayout = useCallback(() => {
    if (!shouldUseOverlay || !open) {
      return;
    }
    updatePosition({ silent: true });
  }, [open, updatePosition, shouldUseOverlay]);

  useEffect(() => {
    if (!shouldUseOverlay) {
      return;
    }

    const width = position?.finalWidth;
    if (!width || width <= 0) {
      return;
    }

    setTriggerWidth(prev => {
      if (prev !== null && Math.abs(prev - width) < 1) {
        return prev;
      }
      return width;
    });
  }, [position, shouldUseOverlay]);

  const { width: windowWidth } = useWindowDimensions();

  const resolvedDropdownWidth = useMemo(() => {
    // Mobile picker (Modal) mode: the options render as a centered dialog card,
    // not an anchored dropdown, so the trigger's width is irrelevant — sizing
    // the card to it left a narrow list floating at the screen's left edge,
    // visually disconnected from everything. Use a comfortable dialog width.
    if (shouldUseModal) {
      return Math.min(Math.max(windowWidth - 48, 0), 400);
    }
    if (position?.finalWidth && position.finalWidth > 0) {
      return position.finalWidth;
    }
    if (triggerWidth && triggerWidth > 0) {
      return triggerWidth;
    }
    return undefined;
  }, [shouldUseModal, windowWidth, position?.finalWidth, triggerWidth]);

  const resolvedDropdownMaxHeight = useMemo(() => {
    const keyboardMax = typeof position?.maxHeight === 'number' ? position.maxHeight : undefined;
    if (typeof maxH === 'number') {
      return keyboardMax ? Math.min(maxH, keyboardMax) : maxH;
    }
    return keyboardMax ?? maxH;
  }, [maxH, position?.maxHeight]);

  const handleSelect = useCallback((opt: SelectOption) => {
    if (opt.disabled) return;

    // Deliberately no hideOverlay() here. The menu is pushed into the overlay
    // registry, so tearing it down mid-selection means the follow-up render
    // opens a *second* overlay while the first one's deferred onClose is still
    // queued — that callback then closes this Select and orphans the menu that
    // is actually on screen. Let the value change flow through and the effect
    // below update the existing overlay in place; `close()` handles teardown
    // when closeOnSelect is on.
    if (valueProp === undefined) {
      setValue(opt.value);
    }

    onChange?.(opt.value, opt);

    handleSelectionComplete({
      mode: 'single',
      preferRefocus: refocusAfterSelect,
      keyboardManager,
      focusCallbacks: {
        focusPrimary: focusTrigger,
        blurPrimary: blurTrigger,
      },
    });

    if (closeOnSelect) {
      close();
    }
  }, [closeOnSelect, close, onChange, valueProp, refocusAfterSelect, keyboardManager, focusTrigger, blurTrigger]);

  const listMaxHeight = resolvedDropdownMaxHeight ?? maxH;
  const menu = useMemo(() => {
    // maxWidth included: menuStyles.dropdown caps at 320, which must not
    // shrink a dropdown below an explicitly resolved width (a trigger wider
    // than 320, or the mobile dialog card).
    const widthStyle = resolvedDropdownWidth && resolvedDropdownWidth > 0
      ? { width: resolvedDropdownWidth, minWidth: resolvedDropdownWidth, maxWidth: resolvedDropdownWidth }
      : undefined;
    const maxHeightStyle = listMaxHeight
      ? { maxHeight: listMaxHeight }
      : undefined;

    return (
      <View style={widthStyle}>
        {/*
          One painted surface, at level 2 (floating over content). The inner
          ListGroup runs `flush` so it doesn't stamp a second background on top
          — that double-paint is what made the dropdown read as a grey slab.
        */}
        <Surface
          level={2}
          withBorder
          radius="md"
          style={{
            ...menuStyles.dropdown,
            ...(maxHeightStyle ?? {}),
            ...(widthStyle ?? {}),
          }}
        >
        <ListGroup
          variant="flush"
          size={size as SizeValue}
          style={{
            ...(maxHeightStyle ?? {}),
            ...(widthStyle ?? {}),
          }}
        >
          <FlatList
            data={options}
            keyExtractor={o => String(o.value)}
            renderItem={({ item }) => {
              const selected = item.value === value;

              if (renderOption) {
                return (
                  <CustomOption
                    option={item}
                    selected={selected}
                    render={renderOption}
                    onSelect={handleSelect}
                  />
                );
              }

              const primaryPalette = theme.colors.primary || [];
              const highlightColor = theme.colorScheme === 'dark'
                ? primaryPalette[5] || primaryPalette[4] || '#60A5FA'
                : primaryPalette[6] || primaryPalette[5] || '#3B82F6';
              const baseTextColor = item.disabled ? theme.text.disabled : theme.text.primary;
              const accentTextColor = item.disabled ? theme.text.disabled : highlightColor;

              return (
                <MenuItemButton
                  onPress={() => handleSelect(item)}
                  disabled={!!item.disabled}
                  active={false}
                  color="default"
                  hoverColor="default"
                  activeColor="default"
                  textColor={baseTextColor}
                  hoverTextColor={baseTextColor}
                  activeTextColor={baseTextColor}
                  // No spacer on the unselected rows: labels sit flush against
                  // the row padding, and only the selected option's checkmark
                  // pushes its label across.
                  startIcon={selected ? <Icon name="check" size={16} color={highlightColor} /> : undefined}
                  compact
                  rounded={false}
                  size={size as SizeValue}
                  // Options read at exactly the trigger's font size. `size` alone
                  // isn't enough: a numeric `size` means "row height" to the menu
                  // item but "font size" to the field, so pin the label directly.
                  labelProps={{ size: fieldFontSize }}
                  style={{ borderRadius: 0 }}
                >
                  {item.label}
                </MenuItemButton>
              );
            }}
            ItemSeparatorComponent={renderOption ? undefined : ListGroupDivider}
            style={maxHeightStyle}
            bounces={false}
          />
        </ListGroup>
        </Surface>
      </View>
    );
  }, [resolvedDropdownWidth, listMaxHeight, menuStyles.dropdown, options, value, renderOption, size, fieldFontSize, theme.colors.primary, theme.colors.secondary, theme.colorScheme, theme.text.disabled, theme.text.primary, theme.text.onPrimary, handleSelect]);

  useEffect(() => {
    if (!shouldUseOverlay) {
      return () => {};
    }

    if (!open) {
      return () => {
        hideOverlay();
      }
      
    }

    if (!position) {
      return () => {};
    }

    const dropdownWidth = resolvedDropdownWidth;
    const dropdownMaxHeight = resolvedDropdownMaxHeight;

    const overlayContent = (
      <View
        ref={popoverRef}
        onLayout={handleDropdownLayout}
        style={[
          dropdownWidth ? { width: dropdownWidth, minWidth: dropdownWidth } : null,
          dropdownMaxHeight ? { maxHeight: dropdownMaxHeight } : null,
        ]}
      >
        {menu}
      </View>
    );

    showOverlay(overlayContent, {
      width: dropdownWidth,
      maxHeight: dropdownMaxHeight,
      zIndex: 1300,
    });

    // return () => hideOverlay();
  }, [open,
    position, resolvedDropdownWidth, resolvedDropdownMaxHeight, popoverRef, handleDropdownLayout, menu, showOverlay, hideOverlay, shouldUseOverlay
  ]);

  useEffect(() => {
    return () => {
      hideOverlay();
    };
  }, [hideOverlay]);

  const handleClear = useCallback((event?: any) => {
    event?.stopPropagation?.();
    if (disabled) return;

    if (valueProp === undefined) {
      setValue(null);
    }

    onChange?.(null, null);
    onClear?.();
    close();
  }, [disabled, valueProp, onChange, onClear, close]);

  const fieldContent = selectedOption ? (
    <RNText
      style={{
        color: disabled ? theme.text.disabled : theme.text.primary,
        fontSize: fieldFontSize,
        fontFamily: theme.fontFamily,
      }}
    >
      {selectedOption.label}
    </RNText>
  ) : (
    <RNText
      style={{
        color: disabled ? theme.text.disabled : theme.text.muted,
        fontSize: fieldFontSize,
        fontFamily: theme.fontFamily,
      }}
    >
      {placeholder}
    </RNText>
  );

  return (
    <View style={[defaultMinWidthStyle, fullWidthStyle, spacingStyles, layoutStyles]}>
      <FieldHeader
        label={label}
        description={description}
        disabled={disabled}
        error={!!error}
        size={size as SizeValue}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
      />
      <Pressable
        ref={setTriggerNode}
        onPress={toggle}
        {...(Platform.OS === 'web' ? { role: 'combobox' as const } : { accessibilityRole: 'button' as const })}
        accessibilityLabel={label || placeholder}
        // The chevron now conveys open/closed by rotation alone, so the state has
        // to be published to assistive tech explicitly.
        accessibilityState={{ disabled: !!disabled, expanded: open }}
        disabled={disabled}
        style={[
          inputStyles.inputContainer,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '100%',
            width: '100%',
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            ...(isRTL ? { paddingLeft: showClearButton ? 8 : 0 } : { paddingRight: showClearButton ? 8 : 0 }),
          }}
        >
          {fieldContent}
        </View>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
          {showClearButton && (
            <ClearButton
              onPress={handleClear}
              size={size as SizeValue}
              accessibilityLabel={clearLabel}
              hasRightSection={true}
            />
          )}
          <Animated.View style={animatedChevronStyle}>
            <Icon
              name="chevron-down"
              size={16}
              color={disabled ? theme.text.disabled : theme.text.muted}
            />
          </Animated.View>
        </View>
      </Pressable>
      {error && <RNText style={inputStyles.error}>{error}</RNText>}
      {!error && helperText && <RNText style={inputStyles.helperText}>{helperText}</RNText>}

      {open && shouldUseModal && (
        <Modal transparent animationType="fade" visible onRequestClose={close}>
          <Pressable
            // Centered both ways: without alignItems the card stretched from the
            // left edge at whatever width the trigger measured, so the options
            // appeared as a detached strip at the screen's mid-left.
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: 24, justifyContent: 'center', alignItems: 'center' }}
            onPress={close}
          >
            <Pressable style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', elevation: 4 }}>
              {menu}
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
});
