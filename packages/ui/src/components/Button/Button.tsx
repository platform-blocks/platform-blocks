import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { themeColorForFirstPaint } from '../../core/theme/cssVariableTheme';
import type { ShadowToken } from '../../core/theme/shadow';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, resolveRadius, resolveShadow } from '../../core/theme/tokens';
import { resolveGradientStops, type VariantRoles } from '../../core/theme/variantRoles';
import { extractLayoutProps, getLayoutStyles } from '../../core/utils/layout';
import { warnOnce } from '../../core/utils/logger';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { useHaptics } from '../../hooks/useHaptics';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { Loader } from '../Loader';
import { Text } from '../Text';
import { Tooltip, getTooltipText, resolveTooltipProps } from '../Tooltip';
import { useButtonAnimation } from './animation';
import {
  getButtonFillStyle,
  getButtonIconSpacing,
  getButtonLabelStyle,
  getButtonPressedStyle,
  getButtonStyles,
  getCanonicalVariant,
  resolveAccentTextColor,
  resolveButtonRoles,
  resolveButtonTextColor,
  resolveRoleColor,
  splitButtonLayoutStyles,
} from './styles';
import type { ButtonProps } from './types';
import { useFocusRing } from './useFocusRing';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

/** Absolute layer the gradient drifts inside, clipped to the button's shape. */
const GRADIENT_CLIP: ViewStyle = { position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, zIndex: -1, overflow: 'hidden' };
/** Overscan both edges so the hover drift never exposes the corners. */
const GRADIENT_TRACK: ViewStyle = { position: 'absolute', top: 0, bottom: 0, start: -20, end: -20 };
const GRADIENT_FILL: ViewStyle = { flex: 1 };
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 1 };

interface IconLikeProps {
  name?: unknown;
  color?: unknown;
}

/**
 * Icons (anything with a `name` or `color` prop and no explicit color) inherit
 * the button's text color so they read on every variant.
 */
function withInheritedColor(node: React.ReactNode, color: string | undefined): React.ReactNode {
  if (!React.isValidElement<IconLikeProps>(node)) return node;
  const { name, color: ownColor } = node.props;
  const looksLikeIcon = name !== undefined || ownColor !== undefined;
  if (!looksLikeIcon || (ownColor && ownColor !== 'currentColor')) return node;
  return React.cloneElement(node, { color });
}

/**
 * A button. Sizes come from the shared control-size table (`getControlSize`),
 * so a Button, IconButton, Input or Select of the same `size` are the same height.
 *
 * The ref is the underlying Pressable (the focusable element).
 */
export const Button = factory<{ props: ButtonProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(allProps);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  const {
    title,
    children,
    onPress,
    onPressIn,
    onPressOut,
    onHoverIn,
    onHoverOut,
    onLongPress,
    onLayout,
    onFocus,
    onBlur,
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    loadingTitle,
    color,
    textColor: textColorProp,
    icon,
    startSection,
    endSection,
    tooltip,
    transitionDuration,
    radius,
    shadow,
    style,
    testID,
    accessibilityLabel: accessibilityLabelProp,
    accessibilityHint: accessibilityHintProp,
    labelProps,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const effectiveVariant = variant === 'gradient' && !hasLinearGradient ? 'filled' : variant;

  // Last width the button occupied with its real content, so the loading state
  // can hold that width instead of collapsing around the loader.
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  // `tooltip` accepts a string shorthand or a full Tooltip config.
  const tooltipProps = resolveTooltipProps(tooltip);
  const tooltipText = getTooltipText(tooltip);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // Only record width while not loading, so we keep the natural content width.
      // It is deliberately never cleared: layout only fires when the size actually
      // changes, so dropping it when loading ends would leave nothing to freeze on
      // the next loading cycle.
      if (!loading) {
        const { width } = event.nativeEvent.layout;
        if (width > 0) setMeasuredWidth((prev) => (prev === width ? prev : width));
      }
      onLayout?.(event);
    },
    [loading, onLayout],
  );

  // Children take precedence over title.
  const buttonContent = children ?? title;
  const displayContent = loading ? (loadingTitle ?? '') : buttonContent;

  // An icon button has an icon and no text.
  const isIconButton = !!icon && (buttonContent == null || buttonContent === '');

  const control = getControlSize(theme, size);
  // Default corner radius comes from the control size; `radius="full"` is a true pill.
  const borderRadius = radius === undefined ? control.radius : resolveRadius(theme, radius);
  // Buttons are flat by default on every variant; opt in with the `shadow` prop.
  const shadowStyle = resolveShadow(theme, shadow as ShadowToken | undefined);

  // `fullWidth` first, so an explicit `w` wins.
  const rootStyles = { ...getLayoutStyles(layoutProps), ...resolveStyleProps(styleProps, theme) };
  const {
    outer: outerLayoutStyles,
    pressableLayout: pressableLayoutStyles,
    pressableStyle: pressableStyleRest,
  } = splitButtonLayoutStyles(rootStyles, style);

  // Hug the content unless the button was asked to fill its container.
  const fillStyle = getButtonFillStyle(outerLayoutStyles);

  // Freeze the measured width on the Pressable while loading to avoid jumps.
  const loadingFreezeStyle =
    loading && measuredWidth && !styleProps.w && !layoutProps.fullWidth
      ? { width: measuredWidth, minWidth: measuredWidth }
      : null;

  const iconSpacing = getButtonIconSpacing(theme, size);

  const hasExplicitColor = color != null;
  const resolvedRoleColor = resolveRoleColor(theme, color);

  // Gradient stops — also used to render the LinearGradient overlay so it honors `color`.
  const gradientStops = useMemo<[string, string]>(
    () => resolveGradientStops(theme, resolvedRoleColor),
    [resolvedRoleColor, theme],
  );

  const canonicalVariant = getCanonicalVariant(effectiveVariant);

  const roles = useMemo<VariantRoles | null>(
    () => resolveButtonRoles(theme, canonicalVariant, resolvedRoleColor, gradientStops),
    [canonicalVariant, theme, resolvedRoleColor, gradientStops],
  );

  // Accent text for ghost/link when a color is explicitly requested (else they keep
  // their neutral defaults).
  const accentText = useMemo(() => resolveAccentTextColor(theme, resolvedRoleColor), [theme, resolvedRoleColor]);

  const buttonStyles = useMemo(() => {
    const resolved = getButtonStyles({
      theme,
      variant: effectiveVariant,
      size,
      disabled,
      loading,
      borderRadius,
      shadowStyle,
      roles,
      roleColor: resolvedRoleColor,
      isIconButton,
      hovered,
      reducedMotion,
    });
    // On web, palette colors render as CSS variables so the first paint of a
    // statically rendered page follows the user's color scheme.
    return {
      ...resolved,
      backgroundColor: themeColorForFirstPaint(theme, resolved.backgroundColor as string | undefined),
      borderColor: themeColorForFirstPaint(theme, resolved.borderColor as string | undefined),
    };
  }, [theme, effectiveVariant, size, disabled, loading, borderRadius, shadowStyle, roles, resolvedRoleColor, isIconButton, hovered, reducedMotion]);

  const renderedTextColor = useMemo(
    () =>
      themeColorForFirstPaint(
        theme,
        resolveButtonTextColor({
          theme,
          variant: effectiveVariant,
          roles,
          textColorProp,
          hasExplicitColor,
          accentText,
        }),
      ),
    [textColorProp, roles, effectiveVariant, hasExplicitColor, accentText, theme],
  );

  // The Button's defaults, with `labelProps` merged over them (weight/ff/color/style).
  const textProps = useMemo(
    () =>
      mergeSlotProps(
        {
          size,
          fw: '600' as const,
          ta: 'center' as const,
          c: renderedTextColor,
          selectable: false,
          style: getButtonLabelStyle(theme, size, effectiveVariant),
        },
        labelProps,
      ),
    [size, renderedTextColor, labelProps, theme, effectiveVariant],
  );

  // Wraps primitives (and arrays of them) in the label Text; elements pass through.
  const renderLabel = (content: React.ReactNode): React.ReactNode => {
    if (content == null || content === '' || typeof content === 'boolean') return null;
    if (React.isValidElement(content)) return content;
    if (Array.isArray(content)) {
      const allPrimitive = content.every((c) => typeof c === 'string' || typeof c === 'number');
      return <Text {...textProps}>{allPrimitive ? content.join('') : content}</Text>;
    }
    if (typeof content === 'string' || typeof content === 'number') {
      return <Text {...textProps}>{content}</Text>;
    }
    return content;
  };

  // Button is effectively disabled when loading or disabled.
  const isInteractionDisabled = disabled || loading;

  const { wrapperStyle, gradientStyle, isPressing, pressIn, pressOut, hover, pulse } = useButtonAnimation({
    transitionDuration,
  });
  const { focusRingStyle, onFocus: onFocusRing, onBlur: onBlurRing } = useFocusRing(theme);

  const { impactPressIn, impactPressOut } = useHaptics();
  const handlePressIn = () => {
    if (!isInteractionDisabled) {
      impactPressIn();
      pressIn();
    }
    onPressIn?.();
  };
  const handlePressOut = () => {
    impactPressOut();
    pressOut();
    onPressOut?.();
  };
  const handlePress = () => {
    if (isInteractionDisabled) return;
    // Activation without a prior pressIn (keyboard / programmatic) gets a pulse.
    if (!isPressing()) pulse();
    onPress?.();
  };
  const handleHoverIn = () => {
    if (!isInteractionDisabled) setHovered(true);
    hover(1);
    onHoverIn?.();
  };
  const handleHoverOut = () => {
    setHovered(false);
    hover(0);
    onHoverOut?.();
  };
  const handleFocus: NonNullable<ButtonProps['onFocus']> = (event) => {
    onFocusRing(event);
    onFocus?.(event);
  };
  const handleBlur: NonNullable<ButtonProps['onBlur']> = (event) => {
    onBlurRing();
    onBlur?.(event);
  };

  // Accessible name: an explicit label, else the visible text (derived by the
  // platform from the content); icon-only buttons fall back to the tooltip text.
  const accessibilityLabel = accessibilityLabelProp ?? (isIconButton ? tooltipText : undefined);
  if (isIconButton && !accessibilityLabel && !rest['aria-label'] && !rest['aria-labelledby']) {
    warnOnce(
      'Button.iconOnlyLabel',
      'Button/IconButton: an icon-only button has no accessible name. Pass `accessibilityLabel` (or a `tooltip`).',
    );
  }
  // A text button is named by its text (flattened from nested elements, so an
  // icon + label child still reads as the label); never a generic fallback.
  const derivedLabel = accessibilityLabel ?? (isIconButton ? undefined : getNodeText(buttonContent) || undefined);

  const accessibility = a11yProps({
    role: 'button',
    label: derivedLabel,
    hint: accessibilityHintProp ?? (loading ? 'Loading' : undefined),
    disabled: isInteractionDisabled,
    busy: loading,
  });

  const gradientOverlay =
    variant === 'gradient' && hasLinearGradient ? (
      // Clip layer (matches the button's rounded rect) so the overscanned
      // gradient inside can drift sideways on hover without exposing a gap.
      <View pointerEvents="none" style={[GRADIENT_CLIP, { borderRadius }]}>
        <Animated.View style={[GRADIENT_TRACK, gradientStyle]}>
          <OptionalLinearGradient
            colors={[themeColorForFirstPaint(theme, gradientStops[0]) ?? gradientStops[0], themeColorForFirstPaint(theme, gradientStops[1]) ?? gradientStops[1]]}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={GRADIENT_FILL}
          />
        </Animated.View>
      </View>
    ) : null;

  let content: React.ReactNode;
  if (loading) {
    content = (
      <>
        <Loader size={size} color={renderedTextColor} style={!isIconButton ? { marginEnd: iconSpacing } : undefined} />
        {!isIconButton && renderLabel(displayContent)}
      </>
    );
  } else if (isIconButton) {
    content = withInheritedColor(icon, renderedTextColor);
  } else {
    content = (
      <>
        {startSection ? (
          <View style={{ marginEnd: iconSpacing }}>{withInheritedColor(startSection, renderedTextColor)}</View>
        ) : null}
        {renderLabel(displayContent)}
        {endSection ? (
          <View style={{ marginStart: iconSpacing }}>{withInheritedColor(endSection, renderedTextColor)}</View>
        ) : null}
      </>
    );
  }

  const pressableElement = (
    <Animated.View style={wrapperStyle} collapsable={false}>
      <Pressable
        {...accessibility}
        {...rest}
        ref={ref}
        testID={testID}
        style={({ pressed }) => [
          buttonStyles,
          pressableLayoutStyles,
          loadingFreezeStyle,
          pressed && !isInteractionDisabled ? getButtonPressedStyle(effectiveVariant) : null,
          focusRingStyle,
          pressableStyleRest,
        ]}
        onPress={handlePress}
        onLayout={handleLayout}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onLongPress={onLongPress}
        disabled={isInteractionDisabled}
      >
        {gradientOverlay}
        {content}
      </Pressable>
    </Animated.View>
  );

  // The tooltip wraps the pressable rather than the outer box on purpose: the
  // outer View is a layout box that stretches to its parent's cross axis (the
  // button itself hugs, via `fillStyle`), and anchoring a tooltip to it would
  // park the bubble beside the *row* instead of beside the button.
  return (
    <View style={[fillStyle, outerLayoutStyles]}>
      {tooltipProps ? <Tooltip {...tooltipProps}>{pressableElement}</Tooltip> : pressableElement}
    </View>
  );
}, { displayName: 'Button' });
