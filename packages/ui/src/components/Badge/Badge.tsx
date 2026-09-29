import React, { useMemo } from 'react';
import { Pressable, View, type TextStyle, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, resolveRadius, resolveShadow, stepDown } from '../../core/theme/tokens';
import { resolveGradientStops, resolveVariantRoles } from '../../core/theme/variantRoles';
import { warnOnce } from '../../core/utils/logger';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { RemoveButton } from '../Chip/RemoveButton';
import { Text } from '../Text';
import type { BadgeProps, BadgeVariant } from './types';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

/** A badge is a label, not a control: it sits well below the compact control height. */
const BADGE_HEIGHT_RATIO = 0.625;
const BADGE_PADDING_RATIO = 0.8;

const ABSOLUTE_FILL: ViewStyle = { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0 };
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 1 };

/** Foreground row above the absolute gradient fill (see Chip). */
const CONTENT_STYLE: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  zIndex: 1,
};

/**
 * A small status label. Metrics derive from the compact control size
 * (`getControlSize(theme, stepDown(size))`): `md` is 20px tall. `onPress` makes
 * it a button; `onRemove` adds a remove button named "Remove <label>".
 */
export const Badge = factory<{ props: BadgeProps; ref: View }>((props, ref) => {
  const {
    children,
    size = 'md',
    variant,
    v,
    color,
    c,
    onPress,
    startSection: startSectionProp,
    endSection: endSectionProp,
    startIcon,
    endIcon,
    onRemove,
    removePosition = 'right',
    removeButtonLabel,
    disabled = false,
    style,
    textStyle,
    labelProps,
    radius = 'md',
    shadow = 'none',
    testID,
    ...rest
  } = props;

  if (startIcon !== undefined) warnOnce('Badge.startIcon', 'Badge: `startIcon` is deprecated; use `startSection`.');
  if (endIcon !== undefined) warnOnce('Badge.endIcon', 'Badge: `endIcon` is deprecated; use `endSection`.');
  const startSection = startSectionProp ?? startIcon;
  const endSection = endSectionProp ?? endIcon;

  const theme = useTheme();
  const { styleProps, otherProps: a11yRest } = extractStyleProps(rest);

  // The canonical name wins over its shorthand, matching Text and RollingNumber.
  const requestedVariant: BadgeVariant = variant ?? v ?? 'subtle';
  const resolvedColor = color ?? c ?? 'primary';
  const shouldUseGradient = requestedVariant === 'gradient' && hasLinearGradient;
  const effectiveVariant: BadgeVariant =
    requestedVariant === 'gradient' && !hasLinearGradient ? 'filled' : requestedVariant;

  const control = getControlSize(theme, stepDown(size));
  const height = typeof size === 'number' ? size : Math.round(control.height * BADGE_HEIGHT_RATIO);
  const borderRadius = resolveRadius(theme, radius);

  const gradientStops = useMemo(
    () => (shouldUseGradient ? resolveGradientStops(theme, resolvedColor) : undefined),
    [shouldUseGradient, theme, resolvedColor]
  );
  // Fill + border + text come from the shared variant system so a Badge matches
  // Alert, Chip, and Button for the same variant+color on every theme and scheme.
  const roles = useMemo(
    () => resolveVariantRoles(theme, { variant: effectiveVariant, color: resolvedColor, gradientStops }),
    [theme, effectiveVariant, resolvedColor, gradientStops]
  );

  const badgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height,
    minHeight: height,
    paddingHorizontal: Math.round(control.paddingX * BADGE_PADDING_RATIO),
    borderWidth: 1,
    borderRadius,
    backgroundColor: roles.fill,
    borderColor: roles.border,
    opacity: disabled ? 0.5 : 1,
    position: 'relative',
    ...(effectiveVariant === 'gradient' ? { overflow: 'hidden' } : null),
    // Badges are flat unless the consumer opts in via `shadow`.
    ...resolveShadow(theme, shadow),
  };
  const labelStyle: TextStyle = { fontSize: control.fontSize, textAlign: 'center', color: roles.text };
  const gap = control.gap;

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
      {startSection ? <View style={{ marginEnd: gap }}>{startSection}</View> : null}
      <Text {...mergeSlotProps({ fw: '500' as const, style: [labelStyle, textStyle] }, labelProps)}>{children}</Text>
      {endSection ? <View style={{ marginStart: gap }}>{endSection}</View> : null}
    </>
  );

  const rootStyle = [badgeStyle, resolveStyleProps(styleProps, theme), style];
  const accessibility = onPress ? a11yProps({ role: 'button', disabled }) : {};
  const cursorStyle = webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' });
  const handlePress = disabled ? undefined : onPress;

  // A pressable badge with a remove button: two sibling controls, never nested.
  if (onPress && removeButton) {
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
        {removePosition === 'right' && removeButton ? <View style={{ marginStart: gap / 2 }}>{removeButton}</View> : null}
      </View>
    </>
  );

  if (!onPress) {
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
}, { displayName: 'Badge' });

export default Badge;
