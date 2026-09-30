import React, { useMemo } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type PressableStateCallbackType,
  type ViewStyle,
} from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import { webProps, webStyle, type WebMouseEvent } from '../../core/platform';
import type { ComponentSizeValue } from '../../core/theme/componentSize';
import { resolveTextColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { PlocksTheme } from '../../core/theme/types';
import { resolveVariantRoles } from '../../core/theme/variantRoles';
import type { BaseProps } from '../../core/types/base';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import type { PassthroughAccessibilityProps } from '../Button/types';
import { Text } from '../Text';
import type { TextProps } from '../Text';

/** Menu item colors, named for the theme palettes they resolve to. */
export type MenuItemColor = 'default' | 'primary' | 'error' | 'success' | 'warning';

export interface MenuItemButtonProps
  extends BaseProps<ViewStyle>,
    PassthroughAccessibilityProps,
    Pick<PressableProps, 'onPressIn' | 'onPressOut' | 'onHoverIn' | 'onHoverOut' | 'onFocus' | 'onBlur' | 'hitSlop' | 'nativeID'> {
  /** Text label (alternative to children) */
  title?: string;
  /** Custom content */
  children?: React.ReactNode;
  /** Leading content (usually an icon) */
  startSection?: React.ReactNode;
  /** Trailing content (icon, shortcut hint) */
  endSection?: React.ReactNode;
  /** Click handler */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is active (highlighted / selected) */
  active?: boolean;
  /** Whether the button has destructive styling */
  danger?: boolean;
  /** Whether the button should take up full width */
  fullWidth?: boolean;
  /** Size of the button (token or height in px) */
  size?: ComponentSizeValue;
  /** Whether to use compact styling */
  compact?: boolean;
  /** Whether to use fully rounded corners */
  rounded?: boolean;
  /** Web-only mouse down handler (e.g. to keep focus in a text input) */
  onMouseDown?: (event: WebMouseEvent) => void;
  /** Semantic color for menu styling */
  color?: MenuItemColor;
  /** Color to apply when hovered */
  hoverColor?: MenuItemColor;
  /** Color to apply when active/pressed */
  activeColor?: MenuItemColor;
  /** Override text color for base state */
  textColor?: string;
  /** Override text color when hovered */
  hoverTextColor?: string;
  /** Override text color when active */
  activeTextColor?: string;
  /** Override props applied to the inner label `<Text>` (style, fw, ff, size, c). */
  labelProps?: Omit<TextProps, 'children'>;
}

interface MenuTone {
  /** Resting text color. */
  text: string;
  /** Hover fill. */
  hoverBg: string;
  /** Pressed / active fill. */
  activeBg: string;
  /** Text on the active fill. */
  activeText: string;
}

/** react-native-web adds `hovered` to the Pressable state; native omits it. */
type WebPressableState = PressableStateCallbackType & { hovered?: boolean };

/**
 * Colors for a tone. Accent tones use the shared variant model — the `subtle`
 * wash on hover, the `light` wash when active — whose text is chosen by
 * measured contrast, so labels stay readable on light and dark surfaces alike.
 */
function getTone(theme: PlocksTheme, tone: MenuItemColor): MenuTone {
  if (tone === 'default') {
    // Neutral hover and press are translucent washes, not palette shades: an
    // opaque shade is only correct at one elevation, and these items render on
    // level-2 dropdowns as often as on level-1 panels. A neutral row never
    // flashes the accent color under the finger; callers that want an accent
    // press ask for it with `activeColor="primary"`.
    return {
      text: theme.text.primary,
      hoverBg: theme.backgrounds.hover,
      activeBg: theme.backgrounds.pressed,
      activeText: resolveTextColor(theme, 'primary') ?? theme.text.primary,
    };
  }
  const rest = resolveVariantRoles(theme, { variant: 'outline', color: tone });
  const hover = resolveVariantRoles(theme, { variant: 'subtle', color: tone });
  const active = resolveVariantRoles(theme, { variant: 'light', color: tone });
  return { text: rest.text, hoverBg: hover.fill, activeBg: active.fill, activeText: active.text };
}

/**
 * A row button for menus, dropdowns and command palettes: tones, start/end
 * sections, hover/active states. Metrics come from the control-size table, so
 * a `sm` item matches a `sm` input. Defaults to `role="button"`; menus and
 * listboxes pass `role="menuitem"` / `"option"` (plus their state) through.
 */
export const MenuItemButton = factory<{ props: MenuItemButtonProps; ref: View }>((allProps, ref) => {
  const { styleProps, otherProps } = extractStyleProps(allProps);
  const {
    title,
    children,
    startSection,
    endSection,
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
    color,
    hoverColor,
    activeColor,
    textColor: textColorOverride,
    hoverTextColor: hoverTextColorOverride,
    activeTextColor: activeTextColorOverride,
    testID,
    labelProps,
    ...rest
  } = otherProps;

  const theme = useTheme();
  const control = getControlSize(theme, size);
  const paddingY = Math.round(control.paddingX * 0.6);
  const content = children ?? title;

  const resolveTone = (tone?: MenuItemColor): MenuItemColor => (danger ? 'error' : tone ?? 'default');
  const baseTone = resolveTone(color);
  const hoverTone = resolveTone(hoverColor);
  const activeTone = resolveTone(activeColor ?? color);

  const basePalette = useMemo(() => getTone(theme, baseTone), [theme, baseTone]);
  const hoverPalette = useMemo(() => getTone(theme, hoverTone), [theme, hoverTone]);
  const activePalette = useMemo(() => getTone(theme, activeTone), [theme, activeTone]);

  const baseStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: control.height,
      paddingHorizontal: control.paddingX,
      paddingVertical: compact ? Math.max(2, paddingY - 4) : paddingY,
      width: fullWidth ? '100%' : undefined,
      borderRadius: rounded ? 999 : control.radius,
      opacity: disabled ? 0.45 : 1,
      gap: control.gap,
      backgroundColor: 'transparent',
    }),
    [control, paddingY, compact, fullWidth, rounded, disabled]
  );

  const baseText = textColorOverride ?? basePalette.text;
  const hoverText = hoverTextColorOverride ?? hoverPalette.text;
  const activeText = activeTextColorOverride ?? activePalette.activeText;

  const renderContent = (hovered: boolean, pressed: boolean) => {
    const isActive = active || pressed;
    const textColor = disabled ? theme.text.disabled : isActive ? activeText : hovered ? hoverText : baseText;
    const sectionOpacity = { opacity: disabled ? 0.6 : 1 };
    return (
      <>
        {startSection ? <View style={sectionOpacity}>{startSection}</View> : null}
        {content != null && content !== false ? (
          typeof content === 'string' ? (
            <Text
              {...mergeSlotProps(
                {
                  size: control.fontSize,
                  fw: active ? ('600' as const) : ('500' as const),
                  c: textColor,
                  style: { flex: 1, overflow: 'hidden' as const },
                },
                labelProps
              )}
            >
              {content}
            </Text>
          ) : (
            content
          )
        ) : null}
        {endSection ? <View style={sectionOpacity}>{endSection}</View> : null}
      </>
    );
  };

  return (
    <Pressable
      {...a11yProps({ role: 'button', disabled })}
      {...rest}
      ref={ref}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      onPressIn={disabled ? undefined : onPressIn}
      onPressOut={disabled ? undefined : onPressOut}
      testID={testID}
      {...webProps({ onMouseDown })}
      style={({ pressed, hovered }: WebPressableState) => {
        const effectiveActive = active || pressed;
        return [
          baseStyle,
          !disabled && effectiveActive ? { backgroundColor: activePalette.activeBg } : null,
          !disabled && !effectiveActive && hovered ? { backgroundColor: hoverPalette.hoverBg } : null,
          webStyle({ cursor: disabled ? 'not-allowed' : 'pointer' }),
          resolveStyleProps(styleProps, theme),
          style,
        ];
      }}
    >
      {({ pressed, hovered }: WebPressableState) => renderContent(!!hovered, pressed)}
    </Pressable>
  );
}, { displayName: 'MenuItemButton' });

export default MenuItemButton;
