import { useMemo } from 'react';
import type { TextStyle, ViewStyle } from 'react-native';

import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSurface } from '../../core/theme/surfaces';
import { getControlSize, resolveRadius, resolveShadow } from '../../core/theme/tokens';
import type { ControlSizeMetrics } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import type { RadiusValue } from '../../core/types/base';
import { getFieldFrameStyles } from '../_internal/Field/fieldFrameStyles';
import type { FieldVariant } from '../_internal/Field/fieldProps';

/**
 * Internal: the bordered "input box" shared by the non-text fields of this
 * group (Select, AutoComplete, ColorInput and the date / month / year picker
 * inputs). The frame itself comes from the form family's shared
 * `getFieldFrameStyles` (the same box `Input` draws), so every field looks
 * alike; this adds the value / placeholder text and icon colors.
 */
export interface FieldControlStyleOptions {
  size?: SizeValue;
  radius?: RadiusValue;
  variant?: FieldVariant;
  /** Focused / open: the frame border switches to the accent color. */
  focused?: boolean;
  invalid?: boolean;
  disabled?: boolean;
}

export interface FieldControlStyles {
  /** Resolved control metrics (height, paddingX, fontSize, iconSize, radius, gap). */
  metrics: ControlSizeMetrics;
  /** The box: min height, padding, radius, border and fill for the variant/state. */
  frame: ViewStyle;
  /** The 2px focus ring, absolutely positioned outside the frame's border; render it while focused. */
  focusRing: ViewStyle;
  /** Style for a TextInput inside the frame (flex, font, color; web outline reset). */
  input: TextStyle;
  /** Value text. */
  text: TextStyle;
  /** Placeholder text. */
  placeholder: TextStyle;
  placeholderColor: string;
  /** Color for trailing affordance icons (chevron, calendar, clock). */
  iconColor: string;
  /** Accent used for selection checks. */
  accentColor: string;
}

export function getFieldControlStyles(
  theme: PlatformBlocksTheme,
  { size = 'md', radius, variant = 'default', focused = false, invalid = false, disabled = false }: FieldControlStyleOptions
): FieldControlStyles {
  const metrics = getControlSize(theme, size);
  const frameStyles = getFieldFrameStyles(theme, size, variant, radius, invalid, focused, disabled);

  const text: TextStyle = {
    flexShrink: 1,
    fontSize: metrics.fontSize,
    fontFamily: theme.fontFamily,
    color: disabled ? theme.text.disabled : theme.text.primary,
  };
  const placeholderColor = disabled ? theme.text.disabled : theme.text.muted;

  return {
    metrics,
    frame: frameStyles.frame,
    focusRing: frameStyles.focusRing,
    input: frameStyles.input,
    text,
    placeholder: { ...text, color: placeholderColor },
    placeholderColor,
    iconColor: disabled ? theme.text.disabled : theme.text.muted,
    accentColor: theme.colors.primary[5],
  };
}

/** Memoized `getFieldControlStyles` for the current theme. */
export function useFieldControlStyles(options: FieldControlStyleOptions): FieldControlStyles {
  const theme = useTheme();
  const { size, radius, variant, focused, invalid, disabled } = options;
  return useMemo(
    () => getFieldControlStyles(theme, { size, radius, variant, focused, invalid, disabled }),
    [theme, size, radius, variant, focused, invalid, disabled]
  );
}

/**
 * Level-2 floating surface (the step menus, dropdowns and popovers sit at) for
 * the group's anchored dropdowns: fill, hairline border, radius and shadow, all
 * from theme tokens.
 */
export function getDropdownSurfaceStyle(theme: PlatformBlocksTheme): ViewStyle {
  const surface = resolveSurface(theme, 2);
  return {
    backgroundColor: surface.background,
    borderColor: surface.border,
    borderWidth: 1,
    borderRadius: resolveRadius(theme, 'md'),
    overflow: 'hidden',
    ...resolveShadow(theme, surface.shadow === 'none' ? 'md' : surface.shadow),
  };
}
