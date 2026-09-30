import React, { useMemo } from 'react';
import { Pressable, View, type TextStyle, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import type { KeyboardEventLike } from '../../core/accessibility/keyboard';
import { webProps, webStyle } from '../../core/platform';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, resolveRadius, resolveShadow, stepDown } from '../../core/theme/tokens';
import { resolveGradientStops, resolveVariantRoles } from '../../core/theme/variantRoles';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { Text } from '../Text';
import { RemoveButton } from './RemoveButton';
import type { ChipProps, ChipVariant } from './types';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

const ABSOLUTE_FILL: ViewStyle = { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 };
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 1 };

/**
 * Foreground row that must paint above the absolute gradient fill: on web,
 * positioned elements paint above non-positioned in-flow siblings regardless of
 * DOM order, so an opaque gradient would otherwise cover the label.
 */
const CONTENT_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
};

/**
 * A compact label: a tag, a filter, an input token. Sized one step below a
 * control of the same `size` (`getControlSize(theme, stepDown(size))`).
 *
 * - `onPress` makes it a button.
 * - `pressed` exposes the selected state of a button chip to assistive technology.
 * - `checked` / `defaultChecked` / `onChange` make it selectable: a checkbox
 *   (`aria-checked`) that toggles on press, drawn in `variant` when checked and
 *   `uncheckedVariant` (default `outline`) when not.
 * - `onRemove` adds a remove button named "Remove <label>".
 */
export const Chip = factory<{ props: ChipProps; ref: View }>((props, ref) => {
  const {
    children,
    size = 'md',
    variant = 'filled',
    uncheckedVariant = 'outline',
    color = 'primary',
    onPress,
    pressed,
    checked: checkedProp,
    defaultChecked,
    onChange,
    dot = false,
    dotColor,
    startSection,
    endSection,
    onRemove,
    removePosition = 'right',
    removeButtonLabel,
    disabled = false,
    style,
    textStyle,
    labelProps,
    radius = 'full',
    shadow = 'none',
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps, otherProps: a11yRest } = extractStyleProps(rest);

  const selectable = checkedProp !== undefined || defaultChecked !== undefined || onChange !== undefined;
  const [checked, setChecked] = useControllableState<boolean>({
    value: checkedProp,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  const requestedVariant: ChipVariant = selectable && !checked ? uncheckedVariant : variant;
  const shouldUseGradient = requestedVariant === 'gradient' && hasLinearGradient;
  const effectiveVariant: ChipVariant =
    requestedVariant === 'gradient' && !hasLinearGradient ? 'filled' : requestedVariant;

  const control = getControlSize(theme, stepDown(size));
  const borderRadius = resolveRadius(theme, radius);

  const gradientStops = useMemo(
    () => (shouldUseGradient ? resolveGradientStops(theme, color) : undefined),
    [shouldUseGradient, theme, color]
  );
  const roles = useMemo(
    () => resolveVariantRoles(theme, { variant: effectiveVariant, color, gradientStops }),
    [theme, effectiveVariant, color, gradientStops]
  );

  const chipStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: control.height,
    paddingHorizontal: control.paddingX,
    borderWidth: 1,
    borderRadius,
    backgroundColor: roles.fill,
    borderColor: roles.border,
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    ...(effectiveVariant === 'gradient' ? { overflow: 'hidden' } : null),
    // Chips are flat unless the consumer opts in via `shadow`.
    ...resolveShadow(theme, shadow),
  };
  const labelStyle: TextStyle = { fontSize: control.fontSize, textAlign: 'center', color: roles.text };
  const gap = control.gap;

  // Leading status dot. Defaults to the resolved label color so it stays legible
  // across every variant + color scheme; caller can override via `dotColor`.
  const dotSize = Math.max(6, Math.round(control.fontSize * 0.42));
  const dotNode = dot ? (
    <View
      style={{
        width: dotSize,
        height: dotSize,
        borderRadius: dotSize / 2,
        backgroundColor: (dotColor && resolveAccentColor(theme, dotColor)) ?? roles.text,
        opacity: dotColor ? 1 : 0.9,
        marginEnd: gap,
      }}
    />
  ) : null;

  const labelText = getNodeText(children);
  const removeButton = onRemove ? (
    <RemoveButton
      size={size}
      color={roles.text}
      onPress={onRemove}
      disabled={disabled}
      label={removeButtonLabel ?? (labelText ? `Remove ${labelText}` : 'Remove')}
      testID={testID ? `${testID}-remove` : undefined}
    />
  ) : null;

  // Pull the remove button toward the chip edge by trimming the padding on its
  // side (its touch target already carries its own breathing room).
  const removeEdgeStyle: ViewStyle | null = onRemove
    ? removePosition === 'right'
      ? { paddingEnd: Math.max(2, control.paddingX - 8) }
      : { paddingStart: Math.max(2, control.paddingX - 8) }
    : null;

  const interactive = selectable || !!onPress;
  const handlePress = () => {
    if (disabled) return;
    if (selectable) setChecked(!checked);
    onPress?.();
  };

  // react-native-web only activates `role="button"` on Space; a checkbox needs it too.
  const handleKeyDown = (event: KeyboardEventLike) => {
    if (event.key === ' ' && !event.defaultPrevented) {
      event.preventDefault?.();
      handlePress();
    }
  };

  const accessibility = interactive
    ? {
        ...a11yProps({
          role: selectable ? 'checkbox' : 'button',
          checked: selectable ? checked : undefined,
          pressed: selectable ? undefined : pressed,
          disabled,
        }),
        ...webProps({ onKeyDown: selectable ? handleKeyDown : undefined }),
      }
    : {};

  const gradient =
    shouldUseGradient && gradientStops ? (
      <OptionalLinearGradient
        pointerEvents="none"
        colors={gradientStops}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={[ABSOLUTE_FILL, { borderRadius }]}
      />
    ) : null;

  const label = (
    <>
      {dotNode}
      {startSection ? <View style={{ marginEnd: gap }}>{startSection}</View> : null}
      <Text {...mergeSlotProps({ fw: '500' as const, style: [labelStyle, textStyle] }, labelProps)}>{children}</Text>
      {endSection ? <View style={{ marginStart: gap }}>{endSection}</View> : null}
    </>
  );

  const rootStyle = [chipStyle, removeEdgeStyle, resolveStyleProps(styleProps, theme), style];
  const cursorStyle = webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' });

  // A pressable chip with a remove button: two sibling controls inside the chip
  // shell, never a button nested in a button.
  if (interactive && removeButton) {
    return (
      <View ref={ref} style={rootStyle} testID={testID}>
        {gradient}
        <View style={CONTENT_STYLE}>
          {removePosition === 'left' ? <View style={{ marginEnd: gap / 2 }}>{removeButton}</View> : null}
          <Pressable
            style={[CONTENT_STYLE, cursorStyle]}
            onPress={handlePress}
            disabled={disabled}
            testID={testID ? `${testID}-press` : undefined}
            {...accessibility}
            {...a11yRest}
          >
            {label}
          </Pressable>
          {removePosition === 'right' ? <View style={{ marginStart: gap / 2 }}>{removeButton}</View> : null}
        </View>
      </View>
    );
  }

  const content = (
    <>
      {gradient}
      <View style={CONTENT_STYLE}>
        {removePosition === 'left' && removeButton ? <View style={{ marginEnd: gap / 2 }}>{removeButton}</View> : null}
        {label}
        {removePosition === 'right' && removeButton ? (
          <View style={{ marginStart: gap / 2 }}>{removeButton}</View>
        ) : null}
      </View>
    </>
  );

  if (!interactive) {
    return (
      <View ref={ref} style={rootStyle} testID={testID} {...a11yRest}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      ref={ref}
      style={[rootStyle, cursorStyle]}
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      {...accessibility}
      {...a11yRest}
    >
      {content}
    </Pressable>
  );
}, { displayName: 'Chip' });

export default Chip;
