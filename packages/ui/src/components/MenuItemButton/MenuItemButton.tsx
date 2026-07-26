import React, { forwardRef, useMemo, useState, useCallback } from 'react';
import { Platform, Pressable, View } from 'react-native';
import type { PressableProps } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { Text } from '../Text';
import type { TextProps } from '../Text';
import { useTheme } from '../../core/theme';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { getSpacingStyles, extractSpacingProps, SpacingProps, mergeSlotProps } from '../../core/utils';
import { useDirection } from '../../core/providers/DirectionProvider';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { getComponentSize } from '../../core/theme/unified-sizing';
import { getFontSize } from '../../core/theme/sizes';

type MenuTone = 'default' | 'primary' | 'danger' | 'success' | 'warning';

export interface MenuItemButtonProps extends SpacingProps {
  /** Text label (alternative to children) */
  title?: string;
  /** Custom content */
  children?: React.ReactNode;
  /** Leading icon */
  startIcon?: React.ReactNode;
  /** Trailing icon / shortcut hint */
  endIcon?: React.ReactNode;
  /** Click handler */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is active (selected) */
  active?: boolean;
  /** Whether the button has destructive styling */
  danger?: boolean;
  /** Whether the button should take up full width */
  fullWidth?: boolean;
  /** Size of the button */
  size?: ComponentSizeValue;
  /** Whether to use compact styling */
  compact?: boolean;
  /** Whether to use fully rounded corners */
  rounded?: boolean;
  /** Custom styles override */
  style?: any;
  /** Callback fired when press starts */
  onPressIn?: (event: GestureResponderEvent) => void;
  /** Callback fired when press ends */
  onPressOut?: (event: GestureResponderEvent) => void;
  /** Web-only mouse down handler */
  onMouseDown?: (event: any) => void;
  /** Web-only mouse enter handler */
  onMouseEnter?: (event: any) => void;
  /** Web-only mouse leave handler */
  onMouseLeave?: (event: any) => void;
  /** Pointer hover start handler (web) */
  onHoverIn?: PressableProps['onHoverIn'];
  /** Pointer hover end handler (web) */
  onHoverOut?: PressableProps['onHoverOut'];
  /** Focus handler */
  onFocus?: PressableProps['onFocus'];
  /** Blur handler */
  onBlur?: PressableProps['onBlur'];
  /** Semantic tone for menu styling */
  tone?: MenuTone;
  /** Tone to apply when hovered */
  hoverTone?: MenuTone;
  /** Tone to apply when active/pressed */
  activeTone?: MenuTone;
  /** Override text color for base state */
  textColor?: string;
  /** Override text color when hovered */
  hoverTextColor?: string;
  /** Override text color when active */
  activeTextColor?: string;
  /** Test identifier forwarded to Pressable */
  testID?: string;
  /** Override props applied to the inner label `<Text>` (style, weight, ff, size, colorVariant). */
  labelProps?: Omit<TextProps, 'children'>;
}

interface MenuItemButtonMetrics {
  fontSize: number;
  paddingX: number;
  paddingY: number;
  gap: number;
  radius: number;
  minHeight: number;
}

const MENU_ITEM_ALLOWED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const MENU_ITEM_ALLOWED_SIZES_ARRAY: ComponentSize[] = [...MENU_ITEM_ALLOWED_SIZES];

const MIN_MENU_ITEM_METRICS = {
  fontSize: 10,
  paddingX: 6,
  paddingY: 4,
  gap: 4,
  radius: 4,
  minHeight: 28,
} as const;

// Font size tracks the theme token of the same name — a menu item at `md` reads
// at the same size as any other `md` control (input text, labels), so a dropdown
// never renders visibly smaller than the trigger that opened it.
const MENU_ITEM_BASE_METRICS: Record<'xs' | 'sm' | 'md' | 'lg', MenuItemButtonMetrics> = {
  xs: {
    fontSize: getFontSize('xs'),
    paddingX: 8,
    paddingY: 4,
    gap: 6,
    radius: 4,
    minHeight: 30,
  },
  sm: {
    fontSize: getFontSize('sm'),
    paddingX: 10,
    paddingY: 6,
    gap: 8,
    radius: 6,
    minHeight: 34,
  },
  md: {
    fontSize: getFontSize('md'),
    paddingX: 12,
    paddingY: 8,
    gap: 10,
    radius: 8,
    minHeight: 38,
  },
  lg: {
    fontSize: getFontSize('lg'),
    paddingX: 14,
    paddingY: 10,
    gap: 12,
    radius: 10,
    minHeight: 44,
  },
};

function scaleMetricsFromBase(size: ComponentSize): MenuItemButtonMetrics {
  const base = MENU_ITEM_BASE_METRICS.lg;
  const baseConfig = getComponentSize('lg');
  const targetConfig = getComponentSize(size);

  const heightScale = targetConfig.height / baseConfig.height;
  const paddingScale = targetConfig.padding / baseConfig.padding;
  const fontScale = targetConfig.fontSize / baseConfig.fontSize;
  const radiusScale = targetConfig.borderRadius / baseConfig.borderRadius;

  const scaleMetric = (value: number, scale: number, minimum: number) => Math.max(minimum, Math.round(value * scale));

  return {
    fontSize: scaleMetric(base.fontSize, fontScale, MIN_MENU_ITEM_METRICS.fontSize),
    paddingX: scaleMetric(base.paddingX, paddingScale, MIN_MENU_ITEM_METRICS.paddingX),
    paddingY: scaleMetric(base.paddingY, paddingScale, MIN_MENU_ITEM_METRICS.paddingY),
    gap: scaleMetric(base.gap, paddingScale, MIN_MENU_ITEM_METRICS.gap),
    radius: scaleMetric(base.radius, radiusScale, MIN_MENU_ITEM_METRICS.radius),
    minHeight: scaleMetric(base.minHeight, heightScale, MIN_MENU_ITEM_METRICS.minHeight),
  };
}

const MENU_ITEM_SIZE_SCALE: Partial<Record<ComponentSize, MenuItemButtonMetrics>> = {
  xs: MENU_ITEM_BASE_METRICS.xs,
  sm: MENU_ITEM_BASE_METRICS.sm,
  md: MENU_ITEM_BASE_METRICS.md,
  lg: MENU_ITEM_BASE_METRICS.lg,
  xl: scaleMetricsFromBase('xl'),
  '2xl': scaleMetricsFromBase('2xl'),
  '3xl': scaleMetricsFromBase('3xl'),
};

const BASE_MENU_ITEM_METRICS = MENU_ITEM_SIZE_SCALE.md ?? MENU_ITEM_BASE_METRICS.md;
const BASE_MENU_ITEM_HEIGHT = getComponentSize('md').height;

function resolveMenuItemMetrics(value: ComponentSizeValue | undefined): MenuItemButtonMetrics {
  const resolved = resolveComponentSize(value, MENU_ITEM_SIZE_SCALE, {
    allowedSizes: MENU_ITEM_ALLOWED_SIZES_ARRAY,
    fallback: 'sm',
  });

  if (typeof resolved === 'number') {
    return calculateNumericMetrics(resolved);
  }

  return resolved;
}

function calculateNumericMetrics(height: number): MenuItemButtonMetrics {
  const normalizedHeight = Math.max(MIN_MENU_ITEM_METRICS.minHeight, Math.round(height));
  const scale = normalizedHeight / BASE_MENU_ITEM_HEIGHT;

  const scaleMetric = (value: number, minimum: number) => Math.max(minimum, Math.round(value * scale));

  return {
    fontSize: scaleMetric(BASE_MENU_ITEM_METRICS.fontSize, MIN_MENU_ITEM_METRICS.fontSize),
    paddingX: scaleMetric(BASE_MENU_ITEM_METRICS.paddingX, MIN_MENU_ITEM_METRICS.paddingX),
    paddingY: scaleMetric(BASE_MENU_ITEM_METRICS.paddingY, MIN_MENU_ITEM_METRICS.paddingY),
    gap: scaleMetric(BASE_MENU_ITEM_METRICS.gap, MIN_MENU_ITEM_METRICS.gap),
    radius: scaleMetric(BASE_MENU_ITEM_METRICS.radius, MIN_MENU_ITEM_METRICS.radius),
    minHeight: Math.max(normalizedHeight, scaleMetric(BASE_MENU_ITEM_METRICS.minHeight, MIN_MENU_ITEM_METRICS.minHeight)),
  };
}

export const MenuItemButton = forwardRef<View, MenuItemButtonProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const {
    title,
    children,
    startIcon,
    endIcon,
    onPress,
    disabled = false,
    active = false,
    danger = false,
  fullWidth = true,
  size = 'sm',
    compact = false,
    rounded = false,
    style,
    onPressIn,
    onPressOut,
    onMouseDown,
  onMouseEnter,
  onMouseLeave,
    onHoverIn,
    onHoverOut,
    onFocus,
    onBlur,
    tone,
    hoverTone,
    activeTone,
    textColor: textColorOverride,
    hoverTextColor: hoverTextColorOverride,
    activeTextColor: activeTextColorOverride,
    testID,
    labelProps,
    ...restProps
  } = otherProps as MenuItemButtonProps & { [key: string]: any };

  const theme = useTheme();
  const { isRTL } = useDirection();
  const spacingStyles = getSpacingStyles(spacingProps);
  const metrics = useMemo(() => resolveMenuItemMetrics(size), [size]);
  const content = children || title;
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const resolveTone = useCallback((toneKey?: MenuTone) => {
    if (danger) return 'danger' as const;
    return toneKey ?? 'default';
  }, [danger]);

  const getPalette = useCallback((toneKey: MenuTone) => {
    const isDark = theme.colorScheme === 'dark';
    switch (toneKey) {
      case 'primary':
        return {
          text: isDark ? (theme.text.onPrimary ?? theme.colors.primary[1]) : (theme.colors.primary[6] ?? theme.colors.primary[5]),
          bg: 'transparent',
          hoverBg: isDark ? (theme.colors.primary[4] ?? theme.colors.primary[3]) : (theme.colors.primary[0] ?? 'rgba(0,0,0,0.04)'),
          activeBg: isDark ? (theme.colors.primary[5] ?? theme.colors.primary[6]) : (theme.colors.primary[1] ?? 'rgba(0,0,0,0.08)'),
          activeText: isDark ? (theme.text.onPrimary ?? theme.colors.primary[1]) : (theme.colors.primary[7] ?? theme.colors.primary[6]),
        };
      case 'danger':
        return {
          text: theme.colors.error[6],
          bg: 'transparent',
          hoverBg: isDark ? theme.colors.error[3] : theme.colors.error[0],
          activeBg: isDark ? theme.colors.error[4] : theme.colors.error[1],
          activeText: theme.colors.error[6],
        };
      case 'success':
        return {
          text: isDark ? theme.colors.success[2] : theme.colors.success[6],
          bg: 'transparent',
          hoverBg: isDark ? theme.colors.success[4] : theme.colors.success[0],
          activeBg: isDark ? theme.colors.success[5] : theme.colors.success[1],
          activeText: isDark ? theme.colors.success[2] : theme.colors.success[6],
        };
      case 'warning':
        return {
          text: isDark ? theme.colors.warning[2] : theme.colors.warning[6],
          bg: 'transparent',
          hoverBg: isDark ? theme.colors.warning[4] : theme.colors.warning[0],
          activeBg: isDark ? theme.colors.warning[5] : theme.colors.warning[1],
          activeText: isDark ? theme.colors.warning[2] : theme.colors.warning[6],
        };
      default:
        // Neutral hover and press are translucent overlays, not palette shades:
        // an opaque shade is only correct at one elevation, and these items
        // render on level-2 dropdowns as often as on level-1 panels. Press is
        // the same tint as hover, just deeper — a neutral row has no reason to
        // flash the accent color under the finger. Callers that do want an
        // accent press ask for it with `activeTone="primary"`.
        return {
          text: theme.text.primary,
          bg: 'transparent',
          hoverBg: surfaceInteractionTint(theme, 'hover'),
          activeBg: surfaceInteractionTint(theme, 'pressed'),
          activeText: isDark ? (theme.text.onPrimary ?? theme.text.primary) : theme.colors.primary[6],
        };
    }
  }, [theme]);

  const baseTone = resolveTone(tone);
  const hoverToneResolved = resolveTone(hoverTone);
  const activeToneResolved = resolveTone(activeTone ?? tone);

  const basePalette = useMemo(() => getPalette(baseTone), [baseTone, getPalette]);
  const hoverPalette = useMemo(() => getPalette(hoverToneResolved), [hoverToneResolved, getPalette]);
  const activePalette = useMemo(() => getPalette(activeToneResolved), [activeToneResolved, getPalette]);

  const buttonBaseStyle = useMemo(() => ({
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    minHeight: metrics.minHeight,
    paddingHorizontal: metrics.paddingX,
    paddingVertical: compact ? Math.max(2, metrics.paddingY - 4) : metrics.paddingY,
    width: fullWidth ? '100%' : undefined,
    borderRadius: rounded ? 999 : metrics.radius,
    opacity: disabled ? 0.45 : 1,
    gap: metrics.gap,
    backgroundColor: basePalette.bg,
  }), [isRTL, metrics, compact, fullWidth, rounded, disabled, basePalette.bg]);

  const handlePressIn = useCallback((event: GestureResponderEvent) => {
    if (!disabled) setIsPressed(true);
    onPressIn?.(event);
  }, [disabled, onPressIn]);

  const handlePressOut = useCallback((event: GestureResponderEvent) => {
    if (!disabled) setIsPressed(false);
    onPressOut?.(event);
  }, [disabled, onPressOut]);

  const handleHoverIn = useCallback((event: any) => {
    if (!disabled) setIsHovered(true);
    onHoverIn?.(event);
  }, [disabled, onHoverIn]);

  const handleHoverOut = useCallback((event: any) => {
    if (!disabled) setIsHovered(false);
    onHoverOut?.(event);
  }, [disabled, onHoverOut]);

  const handleMouseEnter = useCallback((event: any) => {
    if (!disabled) setIsHovered(true);
    onMouseEnter?.(event);
  }, [disabled, onMouseEnter]);

  const handleMouseLeave = useCallback((event: any) => {
    if (!disabled) setIsHovered(false);
    onMouseLeave?.(event);
  }, [disabled, onMouseLeave]);

  const isActive = active || isPressed;
  const baseText = textColorOverride ?? basePalette.text;
  const hoverText = hoverTextColorOverride ?? hoverPalette.text;
  const activeText = activeTextColorOverride ?? activePalette.activeText;

  const textColor = disabled
    ? theme.text.disabled
    : isActive
      ? activeText
      : isHovered
        ? hoverText
        : baseText;

  return (
    <View ref={ref} style={[fullWidth && { width: '100%' }, spacingStyles]}>
      <Pressable
        disabled={disabled}
        onPress={disabled ? undefined : onPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        {...(Platform.OS === 'web' && onMouseDown ? { onMouseDown } : {})}
        {...(Platform.OS === 'web' ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onFocus={onFocus}
        onBlur={onBlur}
        testID={testID}
        style={(pressableState) => {
          const { pressed } = pressableState;
          const hovered = (pressableState as any).hovered || isHovered;
          const effectiveActive = isActive || pressed;
          return [
            buttonBaseStyle,
            !disabled && effectiveActive && { backgroundColor: activePalette.activeBg },
            !disabled && !effectiveActive && hovered && { backgroundColor: hoverPalette.hoverBg },
            style
          ];
        }}
        {...restProps}
      >
        {startIcon && (
          <View style={{ opacity: disabled ? 0.6 : 1 }}>
            {startIcon}
          </View>
        )}
        {content && (
          typeof content === 'string' ? (
            <Text
              {...mergeSlotProps(
                {
                  size: metrics.fontSize,
                  weight: active ? ('600' as const) : ('500' as const),
                  color: textColor,
                  style: { flex: 1, overflow: 'hidden' as const },
                },
                labelProps,
              )}
            >
              {content}
            </Text>
          ) : content
        )}
        {endIcon && (
          <View style={isRTL ? { marginRight: metrics.gap, opacity: disabled ? 0.6 : 1 } : { marginLeft: metrics.gap, opacity: disabled ? 0.6 : 1 }}>
            {endIcon}
          </View>
        )}
      </Pressable>
    </View>
  );
});

MenuItemButton.displayName = 'MenuItemButton';

export default MenuItemButton;
