import React, { useMemo, useState, useCallback } from 'react';
import { Pressable, View, Animated, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../../core/theme';
import { resolveGradientStops, type VariantRoles } from '../../core/theme/variantRoles';
import { getHeight } from '../../core/theme/sizes';
import { createRadiusStyles } from '../../core/theme/radius';
import { getSpacingStyles, extractSpacingProps, extractShadowProps, getShadowStyles, getLayoutStyles, extractLayoutProps, mergeSlotProps, useMergedRef } from '../../core/utils';
import { Loader } from '../Loader';
import { Text } from '../Text';
import { Tooltip, resolveTooltipProps, getTooltipText } from '../Tooltip';
import { ButtonProps } from './types';
import { useHaptics } from '../../hooks/useHaptics';
import { useFocus, useAnnouncer } from '../../core/accessibility/hooks';
import { createAccessibilityProps } from '../../core/accessibility/utils';
import { resolveLinearGradient } from '../../utils/optionalDependencies';
import { useButtonAnimation } from './animation';
import {
  getButtonFillStyle,
  getButtonIconSpacing,
  getButtonLabelStyle,
  getButtonStyles,
  getButtonPressedStyle,
  getCanonicalVariant,
  resolveAccentTextColor,
  resolveButtonRoles,
  resolveButtonTextColor,
  resolveRoleColor,
  resolveTokenColor,
  splitButtonLayoutStyles,
} from './styles';

const { LinearGradient: OptionalLinearGradient, hasLinearGradient } = resolveLinearGradient();

export const Button = React.forwardRef<View, ButtonProps>((allProps, ref) => {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(allProps);
  const { shadowProps, otherProps: propsAfterShadow } = extractShadowProps(propsAfterSpacing);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterShadow);
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
    variant = 'default',
    size = 'md',
    disabled = false,
    loading = false,
    loadingTitle,
    color,
    colorVariant,
    textColor: textColorProp,
    icon,
    startIcon,
    endIcon,
    tooltip,
    tooltipPosition = 'top',
    transitionDuration,
    radius,
    style,
    testID,
    accessibilityLabel: accessibilityLabelProp,
    accessibilityHint: accessibilityHintProp,
    labelProps,
  } = otherProps;
  // Theme
  const theme = useTheme();
  const effectiveVariant = variant === 'gradient' && !hasLinearGradient ? 'filled' : variant;

  // Accessibility hooks
  const { announce } = useAnnouncer();
  const { ref: focusRef, focus, isFocused } = useFocus(`button-${title || 'button'}`);

  // Last width the button occupied with its real content, so the loading state
  // can hold that width instead of collapsing around the loader.
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  // `tooltip` accepts a string shorthand or a full Tooltip config; `tooltipPosition`
  // is the legacy default and yields to an explicit `position` in the object form.
  const tooltipProps = resolveTooltipProps(tooltip, { position: tooltipPosition });
  const tooltipText = getTooltipText(tooltip);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    // Only record width while not loading, so we keep the natural content width.
    // It is deliberately never cleared: layout only fires when the size actually
    // changes, so dropping it when loading ends would leave nothing to freeze on
    // the next loading cycle (the content width is usually unchanged, so no new
    // layout event arrives).
    if (!loading) {
      const { width } = event.nativeEvent.layout;
      if (width > 0) {
        setMeasuredWidth(prev => (prev === width ? prev : width));
      }
    }
    // Call user's onLayout if provided
    onLayout?.(event);
  }, [loading, onLayout]);

  // Determine button content - children takes precedence over title
  const buttonContent = children ?? title;

  // Determine what content to show based on loading state
  const displayContent = loading
    ? (loadingTitle !== undefined ? loadingTitle : '')
    : buttonContent;

  // Helper to ensure any primitive or array of primitives ends up wrapped in Text
  const renderButtonContent = (content: any) => {
    if (content == null) return content;
    // Direct React element, return as-is
    if (React.isValidElement(content)) return content;
    // Array of primitives (strings/numbers)
    if (Array.isArray(content)) {
      const allPrimitive = content.every(c => ['string', 'number'].includes(typeof c));
      if (allPrimitive) {
        return <Text {...textProps}>{content.join('')}</Text>;
      }
      // Mixed array - wrap each primitive with span Text
      return (
        <Text {...textProps}>
          {content.map((c, i) => typeof c === 'string' || typeof c === 'number' ? String(c) : c)}
        </Text>
      );
    }
    if (typeof content === 'string' || typeof content === 'number') {
      return <Text {...textProps}>{content}</Text>;
    }
    return content;
  };

  // Check if this is an icon button (has icon prop but no title/children)
  const isIconButton = !!icon && !buttonContent;

  // Validate that either children/title or icon is provided
  // if (!buttonContent && !icon) {
  //   console.warn('Button: Either title prop, children, or icon must be provided');
  // }

  const height = getHeight(size);
  const radiusStyles = createRadiusStyles(radius, height, 'button');

  // Buttons are flat by default on every variant; opt in with the `shadow` prop.
  const effectiveShadow = shadowProps.shadow ?? 'none';
  const shadowStyles = getShadowStyles({ shadow: effectiveShadow }, theme, 'button');

  const spacingStyles = getSpacingStyles(spacingProps);
  const {
    outer: outerLayoutStyles,
    pressableLayout: heightLayoutStyles,
    pressableStyle: pressableStyleRest,
  } = splitButtonLayoutStyles(getLayoutStyles(layoutProps) as Record<string, unknown>, style);

  // Hug the content unless the button was asked to fill its container.
  const fillStyle = getButtonFillStyle(outerLayoutStyles);

  // Freeze the measured width on the Pressable while loading to avoid jumps.
  const loadingFreezeStyle =
    loading && measuredWidth && !layoutProps.w && !layoutProps.fullWidth
      ? { width: measuredWidth, minWidth: measuredWidth }
      : null;

  const iconSpacing = getButtonIconSpacing(size);

  // Explicit `color` wins, then legacy `colorVariant`, else `primary`.
  const roleColorToken = color ?? colorVariant;
  const hasExplicitColor = roleColorToken != null;
  const resolvedRoleColor = resolveRoleColor(theme, roleColorToken);

  // Gradient stops — also used to render the LinearGradient overlay so it honors `color`.
  // Shared helper keeps a tasteful, tight same-hue range consistent with Badge/Chip/Card.
  const gradientStops = useMemo<[string, string]>(
    () => resolveGradientStops(theme, resolvedRoleColor),
    [resolvedRoleColor, theme],
  );

  const canonicalVariant = getCanonicalVariant(effectiveVariant as string);

  const roles = useMemo<VariantRoles | null>(
    () => resolveButtonRoles(theme, canonicalVariant, resolvedRoleColor, gradientStops),
    [canonicalVariant, theme, resolvedRoleColor, gradientStops],
  );

  // Accent text for ghost/link when a color is explicitly requested (else they keep
  // their neutral defaults, so existing call sites are unchanged).
  const accentText = useMemo(
    () => resolveAccentTextColor(theme, resolvedRoleColor),
    [theme, resolvedRoleColor],
  );

  const buttonStyles = getButtonStyles({
    theme,
    variant: effectiveVariant,
    size,
    disabled,
    loading,
    radiusStyles,
    shadowStyles,
    roles,
    isIconButton,
  });

  const textColor = useMemo(
    () =>
      resolveButtonTextColor({
        theme,
        variant: effectiveVariant,
        roles,
        textColorProp,
        hasExplicitColor,
        accentText,
      }),
    [textColorProp, roles, effectiveVariant, hasExplicitColor, accentText, theme],
  );

  // Memoize text props. The base styling is the Button's defaults; if the
  // consumer passes `labelProps`, those win (weight/ff/colorVariant/style)
  // via mergeSlotProps so they aren't silently overridden by the inline style.
  const textProps = useMemo(
    () =>
      mergeSlotProps(
        {
          size,
          weight: '600' as const,
          align: 'center' as const,
          color: textColor,
          selectable: false,
          style: getButtonLabelStyle(size),
        },
        labelProps,
      ),
    [size, textColor, labelProps],
  );

  // Loader shares the text color so it reads on every variant.
  const loaderColor = textColor;

  // Helper function to inject color into icon components
  const renderIconWithColor = (iconElement: React.ReactNode) => {
    if (!iconElement) return iconElement;

    // If it's a React element, try to clone it with the button's text color
    if (React.isValidElement(iconElement)) {
      const iconProps = iconElement.props as any;

      // Check if it looks like an Icon component and should inherit color
      if (iconProps && (iconProps.name !== undefined || iconProps.color !== undefined)) {
        // Only inject color if no color is set or if it's set to currentColor
        const shouldInjectColor = !iconProps.color || iconProps.color === 'currentColor';
        if (shouldInjectColor) {
          return React.cloneElement(iconElement as any, {
            ...iconProps,
            color: textColor
          });
        }
      }
    }

    return iconElement;
  };

  // Button is effectively disabled when loading or disabled
  const isInteractionDisabled = disabled || loading;

  // Get loader color based on variant and custom color
  const getLoaderColor = () => loaderColor;

  const { wrapperStyle: animatedWrapperStyle, gradientDrift, isPressing, pressIn, pressOut, hover, pulse } =
    useButtonAnimation({ transitionDuration });

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

  const handleInternalPress = () => {
    if (isInteractionDisabled) return;
    // If user triggered onPress without a prior pressIn (keyboard / programmatic), run pulse
    if (!isPressing) {
      pulse();
    }
    
    // Announce action for screen readers if tooltip is provided
    if (tooltipText) {
      announce(`${tooltipText} button activated`);
    }
    
    onPress?.();
  };

  // Generate accessibility props
  const accessibilityLabel = accessibilityLabelProp || tooltipText || (typeof buttonContent === 'string' ? buttonContent : 'Button');
  const accessibilityHint = accessibilityHintProp || (loading ? 'Loading' : undefined);
  const accessibilityProps = createAccessibilityProps({
    role: 'button',
    label: accessibilityLabel,
    hint: accessibilityHint,
    disabled: isInteractionDisabled,
    selected: false,
  });

  // Consumers get the underlying Pressable; internal focus management keeps
  // its own handle on the same node.
  const pressableRef = useMergedRef<View>(focusRef, ref);

  const pressableElement = (
      <Animated.View style={animatedWrapperStyle} collapsable={false}

      >
        <Pressable
          ref={pressableRef}
          testID={testID}
          {...accessibilityProps}
          style={({ pressed }) => [
            buttonStyles,
            heightLayoutStyles,
            loadingFreezeStyle,
            // subtle visual feedback beyond scale on supported platforms
            pressed && !isInteractionDisabled ? getButtonPressedStyle(effectiveVariant) : null,
            pressableStyleRest,
          ]}
          onPress={handleInternalPress}
          onLayout={handleLayout}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onHoverIn={() => { hover(1); onHoverIn?.(); }}
          onHoverOut={() => { hover(0); onHoverOut?.(); }}
          onLongPress={onLongPress}
          disabled={isInteractionDisabled}
        >

          {variant === 'gradient' && hasLinearGradient && (
            // Clip layer (matches the button's rounded rect) so the overscanned
            // gradient inside can drift sideways on hover without exposing a gap.
            <View
              pointerEvents="none"
              style={{ position: 'absolute', zIndex: -1, top: 0, left: 0, right: 0, bottom: 0, borderRadius: radiusStyles.borderRadius, overflow: 'hidden' }}
            >
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  // Overscan both edges so the drift never exposes the corners.
                  left: -20,
                  right: -20,
                  transform: [{ translateX: gradientDrift }],
                }}
              >
                <OptionalLinearGradient
                  colors={gradientStops}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>
          )}

          {loading ? (
            <>
              <Loader
                size={size}
                color={getLoaderColor()}
                style={!isIconButton ? { marginRight: iconSpacing } : undefined}
              />
              {!isIconButton && renderButtonContent(displayContent)}
            </>
          ) : isIconButton ? (
            // Icon-only button
            renderIconWithColor(icon)
          ) : (
            // Regular button with text and optional side icons
            <>
              {startIcon && (
                <View style={{ marginRight: iconSpacing }}>
                  {renderIconWithColor(startIcon)}
                </View>
              )}

              {renderButtonContent(displayContent)}

              {endIcon && (
                <View style={{ marginLeft: iconSpacing }}>
                  {renderIconWithColor(endIcon)}
                </View>
              )}
            </>
          )}
        </Pressable>
      </Animated.View>
  );

  // The tooltip wraps the pressable rather than the outer box on purpose: the
  // outer View is a layout box that stretches to its parent's cross axis (the
  // button itself hugs, via `fillStyle`), and anchoring a tooltip to it would
  // park the bubble beside the *row* instead of beside the button.
  return (
    <View style={[spacingStyles, fillStyle, outerLayoutStyles]}>
      {tooltipProps ? (
        <Tooltip {...tooltipProps}>{pressableElement}</Tooltip>
      ) : (
        pressableElement
      )}
    </View>
  );
});

Button.displayName = 'Button';
