import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { useControllableState } from '../../hooks/useControllableState';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate,
  interpolateColor 
} from 'react-native-reanimated';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { resolveColorProp } from '../../core/theme/resolveColors';
import { Text } from '../Text';
import { FieldHeader } from '../_internal/FieldHeader';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer';
import { SwitchProps } from './types';
import { useSwitchStyles, SWITCH_SHADES } from './styles';
import { Row, Column } from '../Layout';
import { DESIGN_TOKENS } from '../../core/design-tokens';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { resolveComponentSize, type ComponentSize } from '../../core/theme/componentSize';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils';
import { getAccessibilityValueProps } from '../../core/accessibility/utils';

export const Switch = factory<{
  props: SwitchProps;
  ref: View;
}>((rawProps, ref) => {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(rawProps);
  const spacingStyles = getSpacingStyles(spacingProps);
  const { disclaimerProps: disclaimerData, otherProps: props } = extractDisclaimerProps(propsAfterSpacing as SwitchProps);
  const {
    checked,
    defaultChecked = false,
    onChange,
    size = 'md',
    variant = 'filled',
    color = 'primary',
    transitionDuration,
    label,
    disabled = false,
    required = false,
    error,
    description,
    labelPosition = 'right',
    children,
    onIcon,
    offIcon,
    onLabel = 'On',
    offLabel = 'Off',
    controls,
    accessibilityLabel: accessibilityLabelProp,
    accessibilityHint,
    testID,
    style,
    labelProps,
    descriptionProps,
  } = props;

  const theme = useTheme();
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);
  const [effectiveChecked, setChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  const styles = useSwitchStyles({
    checked: effectiveChecked,
    disabled,
    error: !!error,
    size,
    color,
    variant,
    theme
  });

  const isOutline = variant === 'outline';
  const isIOS = variant === 'ios';
  const isAndroid = variant === 'android';

  // Animation setup
  const animationProgress = useSharedValue(effectiveChecked ? 1 : 0);
  // Springs ignore duration, so an explicit `transitionDuration` switches the
  // toggle to a timing curve — and 0 (or reduced motion) snaps with no animation.
  const resolvedDuration = useTransitionDuration(transitionDuration, DESIGN_TOKENS.motion.duration.normal);
  const useSpringToggle = transitionDuration == null && resolvedDuration > 0;

  useEffect(() => {
    const target = effectiveChecked ? 1 : 0;
    if (resolvedDuration === 0) {
      animationProgress.value = target;
      return;
    }
    if (useSpringToggle) {
      animationProgress.value = withSpring(target, {
        damping: DESIGN_TOKENS.motion.duration.normal / 10, // Convert duration to damping ratio
        stiffness: DESIGN_TOKENS.motion.duration.fast, // Use fast duration for stiffness
        mass: 0.5,
      });
      return;
    }
    animationProgress.value = withTiming(target, { duration: resolvedDuration });
  }, [effectiveChecked, animationProgress, resolvedDuration, useSpringToggle]);

  // Get size dimensions for animation
  const sizeMap: Partial<Record<ComponentSize, { width: number; height: number; thumb: number }>> = {
    xs: { width: 24, height: 14, thumb: 10 },
    sm: { width: 32, height: 18, thumb: 14 },
    md: { width: 40, height: 22, thumb: 18 },
    lg: { width: 48, height: 26, thumb: 22 },
    xl: { width: 56, height: 30, thumb: 26 },
    '2xl': { width: 64, height: 34, thumb: 30 },
    '3xl': { width: 72, height: 38, thumb: 34 }
  };
  const resolvedDimensions = resolveComponentSize(size, sizeMap, {
    fallback: 'md',
    allowedSizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
  });
  const baseDimensions = sizeMap.md!;
  const baseWidthRatio = baseDimensions.width / baseDimensions.height;
  const baseThumbRatio = baseDimensions.thumb / baseDimensions.height;

  const switchDimensions = typeof resolvedDimensions === 'number'
    ? {
        width: resolvedDimensions * baseWidthRatio,
        height: resolvedDimensions,
        thumb: resolvedDimensions * baseThumbRatio,
      }
    : (resolvedDimensions ?? baseDimensions);
  const { width, height, thumb } = switchDimensions;

  // Per-variant thumb geometry. `ios` uses a large thumb that nearly fills the
  // track; `android` grows a small "dot" thumb into a larger one as it turns on.
  const borderWidth = 2;

  // Resting (off) and active (on) thumb diameters.
  const offThumb = isAndroid ? Math.round(height * 0.42) : (isIOS ? height - 4 : thumb);
  const onThumb = (isAndroid || isIOS) ? (isIOS ? height - 4 : Math.round(height * 0.72)) : thumb;

  // Horizontal travel for the thumb's left edge.
  let leftPosition: number;
  let rightPosition: number;
  if (isIOS) {
    leftPosition = 2;
    rightPosition = width - onThumb - 2;
  } else if (isAndroid) {
    leftPosition = (height - offThumb) / 2; // inset the small dot from the edge
    rightPosition = width - onThumb - (height - onThumb) / 2;
  } else {
    const leftPadding = -2; // Move left position even further left
    const rightPadding = 2; // Keep right position as is (looks good)
    leftPosition = borderWidth + leftPadding; // 1px from left edge
    rightPosition = width - thumb - borderWidth - rightPadding; // 4px from right edge
  }

  // Vertical centering per thumb size (android animates between the two).
  const offTop = (height - offThumb) / 2;
  const onTop = (height - onThumb) / 2;

  // Animated styles
  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animationProgress.value,
      [0, 1],
      [leftPosition, rightPosition]
    );

    const activeColor = resolveColorProp(theme, color, { shades: SWITCH_SHADES }) ?? theme.colors.primary[6];

    // iOS: a constant large white thumb that only slides.
    if (isIOS) {
      return {
        transform: [{ translateX }],
        width: onThumb,
        height: onThumb,
        borderRadius: onThumb / 2,
        top: onTop,
      };
    }

    // Android: the dot grows and whitens as the switch turns on.
    if (isAndroid) {
      const sizeT = interpolate(animationProgress.value, [0, 1], [offThumb, onThumb]);
      const top = interpolate(animationProgress.value, [0, 1], [offTop, onTop]);
      const backgroundColor = disabled
        ? theme.colors.gray[4]
        : interpolateColor(animationProgress.value, [0, 1], [theme.colors.gray[5], 'white']);
      return {
        transform: [{ translateX }],
        width: sizeT,
        height: sizeT,
        borderRadius: sizeT / 2,
        top,
        backgroundColor,
      };
    }

    // Outline: the thumb is the colored element, tinting from gray → active color.
    if (isOutline && !disabled) {
      const backgroundColor = interpolateColor(
        animationProgress.value,
        [0, 1],
        [theme.colors.gray[4], activeColor]
      );
      return {
        transform: [{ translateX }],
        backgroundColor,
      };
    }

    return {
      transform: [{ translateX }],
    };
  }, [leftPosition, rightPosition, isOutline, isIOS, isAndroid, onThumb, offThumb, onTop, offTop, disabled, color, theme.colors]); // Add dependencies

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const activeColor = resolveColorProp(theme, color, { shades: SWITCH_SHADES }) ?? theme.colors.primary[6];

    if (isOutline) {
      // Transparent track; the border animates from the resting gray to the
      // active color as the switch turns on.
      const borderColor = interpolateColor(
        animationProgress.value,
        [0, 1],
        [theme.colors.gray[4], activeColor]
      );
      return {
        backgroundColor: 'transparent',
        ...(error || disabled ? {} : { borderColor }),
      };
    }

    if (isAndroid) {
      // Material: a gray filled track whose fill and border both take the active
      // color as it turns on.
      const backgroundColor = interpolateColor(
        animationProgress.value,
        [0, 1],
        [theme.colors.gray[3], activeColor]
      );
      const borderColor = interpolateColor(
        animationProgress.value,
        [0, 1],
        [theme.colors.gray[4], activeColor]
      );
      return {
        backgroundColor: disabled ? theme.colors.gray[2] : backgroundColor,
        ...(error || disabled ? {} : { borderColor }),
      };
    }

    // filled + ios: solid track that fills with the active color.
    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [theme.colors.gray[3], activeColor]
    );

    return {
      backgroundColor: disabled ? theme.colors.gray[2] : backgroundColor,
    };
  }, [color, theme.colors, disabled, error, isOutline, isAndroid]); // Add dependencies

  const handlePress = useCallback(() => {
    if (disabled) return;
    setChecked((previous) => !previous);
  }, [disabled, setChecked]);

  const labelContent = children || label;

  const switchElement = (
    <View style={styles.switchContainer}>
      <Animated.View style={[styles.switchTrack, trackAnimatedStyle, style]}>
        <Pressable
          ref={ref}
          style={styles.switchPressable}
          onPress={handlePress}
          disabled={disabled}
          testID={testID}
          accessibilityRole="switch"
          accessibilityState={{
            checked: effectiveChecked,
            disabled
          }}
          accessibilityLabel={accessibilityLabelProp || (typeof labelContent === 'string' ? labelContent : undefined)}
          accessibilityHint={accessibilityHint}
          {...getAccessibilityValueProps({ text: effectiveChecked ? onLabel : offLabel })}
          {...(controls && { 'aria-controls': controls })}
        >
          <Animated.View style={[styles.switchThumb, thumbAnimatedStyle]}>
            {effectiveChecked && onIcon ? onIcon : null}
            {!effectiveChecked && offIcon ? offIcon : null}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );

  const labelElement = labelContent ? (
    <Pressable
      style={styles.labelContainer}
      onPress={handlePress}
      disabled={disabled}
    >
      <FieldHeader
        label={labelContent}
        description={!error ? description : undefined}
        required={required}
        withAsterisk={true}
        disabled={disabled}
        error={!!error}
        size={size as any}
        marginBottom={error ? 2 : undefined}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
      />
      {error ? (
        <Text style={styles.error} size="sm" selectable={false}>{error}</Text>
      ) : null}
    </Pressable>
  ) : null;

  const containerStyle = [
    styles.container,
    // labelPosition === 'left' && styles.containerReverse,
  ];

  // Determine layout based on label position
  const isVertical = labelPosition === 'top' || labelPosition === 'bottom';
  const LayoutComponent = isVertical ? Column : Row;
  
  // For vertical layouts (top/bottom), we want tighter spacing and center alignment
  const layoutProps = isVertical 
    ? { gap: 'xs' as const, align: 'center' as const }
    : { gap: 'sm' as const, align: 'center' as const };

  const disclaimerNode = renderDisclaimer();

  return (
    <View style={spacingStyles}>
      <LayoutComponent {...layoutProps}>
        {labelPosition === 'top' && labelElement}
        {labelPosition === 'left' && labelElement}
        {switchElement}
        {labelPosition === 'right' && labelElement}
        {labelPosition === 'bottom' && labelElement}
      </LayoutComponent>
      {disclaimerNode ? (
        <View style={{ width: '100%' }}>
          {disclaimerNode}
        </View>
      ) : null}
    </View>
  );
});

Switch.displayName = 'Switch';
