import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent, LayoutRectangle, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import type { KeyboardEventLike } from '../../core/accessibility/keyboard';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { factory } from '../../core/factory';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { webProps, webStyle } from '../../core/platform';
import { withAlpha } from '../../core/theme/colorUtils';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, onColor, resolveRadius } from '../../core/theme/tokens';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { warnOnce } from '../../core/utils/logger';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { FieldHeader } from '../_internal/FieldHeader';
import { Column, Row } from '../Layout';
import { Text } from '../Text';
import type { SegmentedControlProps } from './types';

interface NormalizedItem {
  value: string;
  label: React.ReactNode;
  disabled: boolean;
  ariaLabel?: string;
  testID?: string;
}

const parseTimingFunction = (value?: string) => {
  if (!value) {
    return Easing.bezier(0.25, 0.1, 0.25, 1);
  }

  const trimmed = value.trim().toLowerCase();

  switch (trimmed) {
    case 'linear':
      return Easing.linear;
    case 'ease':
      return Easing.bezier(0.25, 0.1, 0.25, 1);
    case 'ease-in':
      return Easing.in(Easing.cubic);
    case 'ease-out':
      return Easing.out(Easing.cubic);
    case 'ease-in-out':
      return Easing.inOut(Easing.cubic);
    default: {
      const cubicMatch = trimmed.match(/cubic-bezier\(([^)]+)\)/);
      if (cubicMatch) {
        const parts = cubicMatch[1]
          .split(',')
          .map((part) => parseFloat(part.trim()))
          .filter((num) => !Number.isNaN(num));
        if (parts.length === 4) {
          return Easing.bezier(parts[0], parts[1], parts[2], parts[3]);
        }
      }
      return Easing.bezier(0.25, 0.1, 0.25, 1);
    }
  }
};

const normalizeData = (data: SegmentedControlProps['data']): NormalizedItem[] =>
  data.map<NormalizedItem>((entry) => {
    if (typeof entry === 'string') {
      return { value: entry, label: entry, disabled: false };
    }
    return {
      value: entry.value,
      label: entry.label ?? entry.value,
      disabled: !!entry.disabled,
      ariaLabel: entry.ariaLabel,
      testID: entry.testID,
    };
  });

const hairlineWidth = StyleSheet.hairlineWidth;

/** The sliding indicator starts at the logical start edge; `translate` moves it onto the selected segment. */
const INDICATOR_BASE: ViewStyle = { position: 'absolute', top: 0, start: 0, zIndex: 0 };

/**
 * A single-choice control: a radio group (`role="radiogroup"`, each segment a
 * `radio` with `aria-checked`) drawn as segments with a sliding indicator.
 *
 * Keyboard: one tab stop; arrow keys (mirrored under RTL for horizontal
 * controls) move to and select the next segment, Home/End jump to the ends.
 * The indicator animation is skipped under reduced motion.
 */
export const SegmentedControl = factory<{
  props: SegmentedControlProps;
  ref: View;
}>((props, ref) => {
  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(props);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);

  const {
    data,
    value: controlledValue,
    defaultValue,
    onChange,
    size = 'md',
    color,
    orientation = 'horizontal',
    disabled = false,
    readOnly = false,
    autoContrast = false,
    withItemsBorders = false,
    transitionDuration = 200,
    transitionTimingFunction = 'ease',
    name,
    variant = 'filled',
    indicatorStyle,
    itemStyle,
    style,
    radius,
    testID,
    accessibilityLabel,
    label,
    description,
    labelPosition = 'top',
    ...rest
  } = otherProps;

  const theme = useTheme();
  const spacingStyles = useMemo(() => resolveStyleProps(styleProps, theme), [styleProps, theme]);
  const layoutStyles = useMemo(() => getLayoutStyles(layoutProps), [layoutProps]);
  const isFullWidth = layoutProps.fullWidth ?? false;
  // The container is a plain View, so a column parent stretches it edge to edge
  // via the inherited `alignItems: 'stretch'` — the segments stay content-sized
  // and the rest of the track runs off to the end. Hug the content unless the
  // caller asked for a width, which is also what makes `fullWidth` visibly different.
  const shouldHugContent = !isFullWidth && styleProps.w === undefined;

  const reducedMotion = useReducedMotion();
  const labelId = useA11yId(undefined, 'pb-segmented-label');

  const items = useMemo(() => normalizeData(data), [data]);
  const initialFallback = useMemo(() => {
    const firstEnabled = items.find((item) => !item.disabled);
    return firstEnabled?.value ?? items[0]?.value ?? '';
  }, [items]);

  const [selectedValue, setSelectedValue, isControlled] = useControllableState<string>({
    value: controlledValue,
    defaultValue,
    finalValue: initialFallback,
    onChange,
  });

  // If `data` changes out from under an uncontrolled control, the stored value
  // can name a segment that no longer exists. Correct it by derivation rather
  // than by writing state in an effect — no extra render, and no `onChange`
  // fired for a change the user never made.
  const currentValue =
    isControlled || items.some((item) => item.value === selectedValue) ? selectedValue : initialFallback;

  const indicatorColor = useMemo(
    () => resolveAccentColor(theme, color ?? 'primary') ?? theme.text.link,
    [color, theme]
  );
  const activeTextColor = useMemo(() => {
    if (variant === 'filled' || variant === 'outline') {
      return autoContrast ? onColor(theme, indicatorColor) : (theme.text.onPrimary ?? onColor(theme, indicatorColor));
    }
    if (variant === 'ghost') return indicatorColor;
    return theme.text.primary;
  }, [autoContrast, indicatorColor, theme, variant]);

  const inactiveTextColor = theme.text.secondary;
  const disabledTextColor = theme.text.disabled;

  const control = getControlSize(theme, size);
  const controlHeight = control.height;
  const verticalPadding = Math.max(6, Math.round(control.paddingX * 0.5));
  const horizontalPadding = control.paddingX;
  const borderRadius = resolveRadius(theme, radius ?? 'full');

  const indicatorX = useSharedValue(0);
  const indicatorY = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorHeight = useSharedValue(0);

  const itemLayouts = useRef<Record<string, LayoutRectangle>>({});
  const containerWidth = useRef(0);
  // Tracks whether the indicator has been placed at least once. The very first
  // placement should snap (no slide from the zero-size origin); only
  // subsequent value changes should animate between positions.
  const hasPositioned = useRef(false);

  const easingFunction = useMemo(() => parseTimingFunction(transitionTimingFunction), [transitionTimingFunction]);

  const updateIndicator = useCallback(
    (targetValue: string) => {
      const layout = itemLayouts.current[targetValue];
      if (!layout) return;

      // The indicator is anchored at the logical start edge. When the row runs
      // right-to-left (RTL — the platform flips `row`), that edge is the right
      // one, so the offset is measured from there and translates leftward.
      const first = itemLayouts.current[items[0]?.value];
      const last = itemLayouts.current[items[items.length - 1]?.value];
      const reversed = orientation === 'horizontal' && !!first && !!last && items.length > 1 && first.x > last.x;
      const offsetX = reversed ? -(containerWidth.current - layout.x - layout.width) : layout.x;

      const duration = reducedMotion || !hasPositioned.current ? 0 : Math.max(transitionDuration, 0);
      hasPositioned.current = true;

      const applyTiming = (shared: typeof indicatorX, target: number) => {
        shared.value = duration === 0 ? target : withTiming(target, { duration, easing: easingFunction });
      };

      applyTiming(indicatorX, offsetX);
      applyTiming(indicatorY, layout.y);
      applyTiming(indicatorWidth, layout.width);
      applyTiming(indicatorHeight, layout.height);
    },
    [easingFunction, indicatorHeight, indicatorWidth, indicatorX, indicatorY, items, orientation, reducedMotion, transitionDuration]
  );

  useEffect(() => {
    if (!currentValue) return;
    updateIndicator(currentValue);
  }, [currentValue, updateIndicator]);

  const handleContainerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      containerWidth.current = event.nativeEvent.layout.width;
      if (currentValue) updateIndicator(currentValue);
    },
    [currentValue, updateIndicator]
  );

  const handleItemLayout = useCallback(
    (valueKey: string, event: LayoutChangeEvent) => {
      itemLayouts.current = { ...itemLayouts.current, [valueKey]: event.nativeEvent.layout };
      if (currentValue === valueKey) updateIndicator(valueKey);
    },
    [currentValue, updateIndicator]
  );

  const handleSelect = useCallback(
    (valueKey: string) => {
      if (disabled || readOnly) return;
      // Re-selecting the active segment is a no-op, in both modes.
      if (valueKey === currentValue) return;
      setSelectedValue(valueKey);
    },
    [currentValue, disabled, readOnly, setSelectedValue]
  );

  // Arrow keys select (the APG radio-group pattern); focus arriving by pointer
  // does not — the press that follows it does.
  const keyboardNavigating = useRef(false);
  const selectedIndex = items.findIndex((item) => item.value === currentValue);
  const isItemDisabled = useCallback(
    (index: number) => disabled || !!items[index]?.disabled,
    [disabled, items]
  );
  const { getItemProps } = useRovingFocus({
    count: items.length,
    orientation,
    activeIndex: selectedIndex >= 0 ? selectedIndex : undefined,
    isDisabled: isItemDisabled,
    onActiveChange: (index) => {
      const item = items[index];
      if (keyboardNavigating.current && item && !item.disabled) handleSelect(item.value);
    },
  });

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }, { translateY: indicatorY.value }],
    width: indicatorWidth.value,
    height: indicatorHeight.value,
  }));

  const variantPresentation = useMemo(() => {
    const base = {
      containerBackground: theme.backgrounds.subtle,
      containerBorderColor: theme.backgrounds.borderStrong,
      containerBorderWidth: hairlineWidth,
      indicatorBackground: theme.backgrounds.elevated,
      indicatorBorderColor: 'transparent',
      indicatorBorderWidth: 0,
    };
    const isDark = theme.colorScheme === 'dark';

    switch (variant) {
      case 'filled':
        return {
          ...base,
          containerBackground: withAlpha(indicatorColor, 0.12),
          containerBorderColor: 'transparent',
          containerBorderWidth: 0,
          indicatorBackground: indicatorColor,
        };
      case 'outline':
        return {
          ...base,
          containerBackground: 'transparent',
          // Alpha is scheme-dependent: a tint needs more weight to register on dark.
          containerBorderColor: withAlpha(indicatorColor, isDark ? 0.55 : 0.35),
          containerBorderWidth: hairlineWidth,
          indicatorBackground: indicatorColor,
        };
      case 'ghost':
        return {
          ...base,
          containerBackground: 'transparent',
          containerBorderColor: 'transparent',
          containerBorderWidth: 0,
          indicatorBackground: withAlpha(indicatorColor, isDark ? 0.32 : 0.16),
          indicatorBorderColor: withAlpha(indicatorColor, isDark ? 0.5 : 0.25),
          indicatorBorderWidth: hairlineWidth,
        };
      default:
        return base;
    }
  }, [indicatorColor, theme, variant]);

  if (!items.length) {
    return null;
  }

  const hasLabelContent = label != null || description != null;
  // `left` / `right` follow the reading direction (Row flips under RTL).
  const isVerticalLabel = labelPosition === 'top' || labelPosition === 'bottom';

  const controlElement = (
    <View
      ref={ref}
      onLayout={handleContainerLayout}
      style={[
        {
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          alignItems: 'stretch',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: variantPresentation.containerBackground,
          borderWidth: variantPresentation.containerBorderWidth,
          borderColor: variantPresentation.containerBorderColor,
          borderRadius,
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        },
        ...(hasLabelContent
          ? [
              { alignSelf: isVerticalLabel && shouldHugContent ? ('flex-start' as const) : ('stretch' as const) },
              ...(!isVerticalLabel && isFullWidth ? [{ flexGrow: 1, flexShrink: 1, flexBasis: 0 }] : []),
            ]
          : [layoutStyles, spacingStyles, shouldHugContent && { alignSelf: 'flex-start' as const }]),
        style,
      ]}
      testID={testID}
      {...a11yProps({
        role: 'radiogroup',
        label: accessibilityLabel ?? name,
        labelledBy: hasLabelContent && label != null && !accessibilityLabel ? labelId : undefined,
        disabled,
        readOnly,
        orientation,
      })}
      {...rest}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          INDICATOR_BASE,
          {
            backgroundColor: variantPresentation.indicatorBackground,
            borderRadius,
            borderWidth: variantPresentation.indicatorBorderWidth,
            borderColor: variantPresentation.indicatorBorderColor,
          },
          animatedIndicatorStyle,
          indicatorStyle,
        ]}
      />

      {items.map((item, index) => {
        const selected = item.value === currentValue;
        const isItemInteractive = !(disabled || readOnly || item.disabled);
        const textColor = selected ? activeTextColor : !isItemInteractive ? disabledTextColor : inactiveTextColor;

        const nextItemIsSelected = items[index + 1]?.value === currentValue;
        const isLast = index === items.length - 1;
        const dividerColor =
          withItemsBorders && !isLast && !selected && !nextItemIsSelected
            ? variantPresentation.containerBorderColor
            : 'transparent';

        const dividerStyles: ViewStyle | undefined =
          !withItemsBorders || isLast
            ? undefined
            : orientation === 'vertical'
              ? { borderBottomWidth: hairlineWidth, borderBottomColor: dividerColor }
              : { borderEndWidth: hairlineWidth, borderEndColor: dividerColor };

        const itemLabel = item.ariaLabel ?? (typeof item.label === 'string' ? item.label : undefined);
        if (!itemLabel) {
          warnOnce(
            `SegmentedControl.itemLabel:${item.value}`,
            `SegmentedControl: segment "${item.value}" has a non-text label; pass \`ariaLabel\` so screen readers can name it.`
          );
        }

        const roving = getItemProps(index);
        const handleKeyDown = (event: KeyboardEventLike) => {
          keyboardNavigating.current = true;
          try {
            roving.onKeyDown(event);
          } finally {
            keyboardNavigating.current = false;
          }
          // react-native-web only activates `role="button"` on Space; a radio needs it too.
          if (!event.defaultPrevented && event.key === ' ') {
            event.preventDefault?.();
            handleSelect(item.value);
          }
        };

        return (
          <Pressable
            key={item.value}
            ref={roving.ref}
            {...a11yProps({
              role: 'radio',
              checked: selected,
              disabled: disabled || item.disabled,
              label: itemLabel,
            })}
            {...webProps({ tabIndex: roving.tabIndex, onKeyDown: handleKeyDown })}
            onFocus={roving.onFocus}
            onLayout={(event) => handleItemLayout(item.value, event)}
            onPress={() => handleSelect(item.value)}
            disabled={disabled || item.disabled}
            testID={item.testID}
            style={[
              {
                minHeight: controlHeight,
                paddingHorizontal: horizontalPadding,
                paddingVertical: verticalPadding,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                flexGrow: isFullWidth || orientation === 'vertical' ? 1 : undefined,
                flexBasis: isFullWidth ? 0 : undefined,
                zIndex: 1,
              },
              webStyle({ cursor: isItemInteractive ? 'pointer' : 'default' }),
              dividerStyles,
              itemStyle,
            ]}
          >
            {typeof item.label === 'string' ? (
              <View style={{ position: 'relative' }}>
                {/* Invisible bold copy reserves the selected width, so the row doesn't shift. */}
                <Text
                  size={size}
                  fw="600"
                  selectable={false}
                  style={{ fontSize: control.fontSize, fontWeight: '600', opacity: 0 }}
                >
                  {item.label}
                </Text>
                <Text
                  size={size}
                  fw={selected ? '600' : '500'}
                  selectable={false}
                  style={{
                    color: textColor,
                    fontSize: control.fontSize,
                    position: 'absolute',
                    top: 0,
                    start: 0,
                    end: 0,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ) : (
              item.label
            )}
          </Pressable>
        );
      })}
    </View>
  );

  if (!hasLabelContent) {
    return controlElement;
  }

  const labelNode = (
    <FieldHeader
      label={label}
      description={description}
      size={size}
      labelId={labelId}
      marginBottom={isVerticalLabel ? undefined : 0}
    />
  );

  const LayoutComponent = isVerticalLabel ? Column : Row;
  // When the label sits beside the control, force the wrapper to fill its parent
  // so the label can actually anchor to the edge. Without this, the wrapper
  // shrinks to content and labelPosition has no visible effect.
  const layoutPropsForWrapper = isVerticalLabel ? layoutProps : { ...layoutProps, fullWidth: true };
  // If the user did not opt into fullWidth, the control sizes to its items
  // and we push label and control to opposite edges (iOS Settings style).
  const layoutJustify = !isVerticalLabel && !isFullWidth ? ('space-between' as const) : undefined;

  return (
    <LayoutComponent
      gap={isVerticalLabel ? 'xs' : 'sm'}
      align={isVerticalLabel ? 'stretch' : 'center'}
      justify={layoutJustify}
      {...styleProps}
      {...layoutPropsForWrapper}
    >
      {(labelPosition === 'top' || labelPosition === 'left') && labelNode}
      {controlElement}
      {(labelPosition === 'right' || labelPosition === 'bottom') && labelNode}
    </LayoutComponent>
  );
}, { displayName: 'SegmentedControl' });
