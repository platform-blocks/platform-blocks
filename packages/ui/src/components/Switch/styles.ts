import { StyleSheet, Platform } from 'react-native';
import { resolveComponentSize, type ComponentSize } from '../../core/theme/componentSize';
import { SwitchStyleProps } from './types';
import { PlatformBlocksTheme } from '../../core/theme/types';
import { DESIGN_TOKENS } from '../../core/design-tokens';
import { resolveColorProp } from '../../core/theme/resolveColors';

/** The track reads against a white thumb, so it sits one step past the fill base. */
export const SWITCH_SHADES = [6, 5] as const;

export const useSwitchStyles = (props: SwitchStyleProps & { theme: PlatformBlocksTheme }) => {
  const { checked, disabled, error, size, color, theme, variant = 'filled' } = props;
  // Variants whose track keeps a visible resting border, and whose thumb rests
  // as a gray element (colored/whitened by the animation when on).
  const hasRestingBorder = variant === 'outline' || variant === 'android';
  const thumbRestsGray = variant === 'outline' || variant === 'android';

  // Define size mappings using design tokens
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
  const switchDimensions = typeof resolvedDimensions === 'number'
    ? { width: resolvedDimensions * 2.2, height: resolvedDimensions, thumb: resolvedDimensions * 0.75 }
    : (resolvedDimensions ?? sizeMap.md!);
  const { width, height, thumb } = switchDimensions;

  // Get switch colors. Shade 6 (not the 5 that fills use) keeps the track
  // legible against the thumb; the shared resolver also accepts `primary.6`
  // shade syntax and raw CSS colors, which the old palette-key lookup dropped.
  const primaryColor = resolveColorProp(theme, color, { shades: SWITCH_SHADES }) ?? theme.colors.primary[6];
  const disabledColor = theme.text.disabled;
  const errorColor = theme.colors.error[6];

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      minHeight: height + DESIGN_TOKENS.spacing.xs,
    },
    
    containerReverse: {
      flexDirection: 'row-reverse',
      justifyContent: 'flex-end',
    },
    
    description: {
      color: theme.text.secondary,
      marginTop: DESIGN_TOKENS.spacing.xs,
    },
    
    error: {
      color: theme.colors.error[6],
      marginTop: 0,
    },

    label: {
      color: disabled ? disabledColor : theme.text.primary,
      lineHeight: height,
      ...(Platform.OS === 'web' && { userSelect: 'none' as any }),
    },
    
    labelContainer: {
      flexShrink: 1,
      justifyContent: 'center',
    },
    
    labelDisabled: {
      color: disabledColor,
    },
    
    labelError: {
      color: errorColor,
    },
    
    required: {
      color: theme.colors.error[6],
    },
    
    stateLabel: {
      color: theme.text.secondary,
      fontSize: DESIGN_TOKENS.typography.fontSize.xs,
    },
    
    stateLabelActive: {
      color: checked ? primaryColor : theme.text.secondary,
      fontWeight: checked ? '600' : '400',
    },
    
    stateLabels: {
      alignItems: 'center',
      flexDirection: 'row',
      marginTop: DESIGN_TOKENS.spacing.xs,
    },
    
    switchContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: height,
      minWidth: width,
    },
    
    switchPressable: {
      height: '100%',
      position: 'relative',
      width: '100%',
    },
    
    switchThumb: {
      width: thumb,
      height: thumb,
      borderRadius: thumb / 2,
      // Center any thumb content (onIcon / offIcon / label).
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      // Outline/android thumbs are the colored element (animated on/off); their
      // resting color is the "off" gray so there's no flash before animation runs.
      backgroundColor: disabled
        ? theme.colors.gray[4]
        : (thumbRestsGray ? theme.colors.gray[4] : 'white'),
      position: 'absolute',
      top: (height - thumb) / 2 - DESIGN_TOKENS.radius.xs, // Account for border
      left: 0, // Start position, will be animated via translateX
      elevation: DESIGN_TOKENS.radius.xs,
      boxShadow: DESIGN_TOKENS.shadow.sm,
    },
    
    switchTrack: {
      borderColor: (() => {
        if (disabled) return disabledColor;
        if (error) return errorColor;
        // Outline/android keep a visible resting border (the animated style tints
        // it toward the active color when on); filled/ios hide the border.
        if (hasRestingBorder) return theme.colors.gray[4];
        return 'transparent';
      })(),
      borderRadius: height / 2,
      borderWidth: DESIGN_TOKENS.radius.xs,
      height,
      opacity: disabled ? DESIGN_TOKENS.opacity.disabled : 1,
      position: 'relative',
      width,
    },
  });
};
