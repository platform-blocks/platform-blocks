import React from 'react';
import type { Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveRadius, resolveScrim } from '../../core/theme/tokens';
import { resolveColorProp } from '../../core/theme/resolveColors';
import { getZIndex } from '../../core/theme/zIndices';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { isWeb, webStyle } from '../../core/platform';
import type { OverlayFactoryPayload, OverlayProps } from './types';

/** Opacity for an explicit `color` when none is given. */
const DEFAULT_OPACITY = 0.6;
/**
 * Siblings stack at z 0 (react-native-web sets it on every View), so an overlay
 * rendered before the content it covers would paint underneath it without a lift.
 */
const CONTAINED_Z_INDEX = 1;
const HEX_COLOR_REGEX = /^#?[0-9a-f]{3,8}$/i;

const clampOpacity = (value: number | undefined): number => {
  if (value == null || Number.isNaN(value)) return DEFAULT_OPACITY;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
};

const hexToRgba = (hex: string, opacity: number): string => {
  const normalized = hex.replace('#', '');
  const expand = normalized.length === 3 || normalized.length === 4;
  const channel = (index: number) => (expand
    ? parseInt(normalized[index] + normalized[index], 16)
    : parseInt(normalized.slice(index * 2, index * 2 + 2), 16));
  if (expand || normalized.length === 6 || normalized.length === 8) {
    return `rgba(${channel(0)}, ${channel(1)}, ${channel(2)}, ${opacity})`;
  }
  return hex;
};

/** Re-express any common CSS color with the given alpha. */
const applyOpacity = (color: string, opacity: number): string => {
  const lower = color.toLowerCase();
  if (lower === 'transparent') return 'transparent';
  if (lower === 'black') return `rgba(0, 0, 0, ${opacity})`;
  if (lower === 'white') return `rgba(255, 255, 255, ${opacity})`;
  if (HEX_COLOR_REGEX.test(color)) return hexToRgba(color.startsWith('#') ? color : `#${color}`, opacity);

  if (color.startsWith('rgba') || color.startsWith('rgb(')) {
    const parts = color.slice(color.indexOf('(') + 1, color.lastIndexOf(')')).split(',').map((part) => part.trim());
    if (parts.length >= 3) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
  }
  if (color.startsWith('hsl')) {
    const prefix = color.startsWith('hsla') ? 'hsla' : 'hsl';
    const parts = color.slice(color.indexOf('(') + 1, color.lastIndexOf(')')).split(',').map((part) => part.trim());
    if (parts.length >= 3) return `${prefix}(${parts[0]}, ${parts[1]}, ${parts[2]}, ${opacity})`;
  }
  return color;
};

const blurValue = (value: number | string): string => {
  if (typeof value === 'number') return `blur(${value}px)`;
  return value.includes('(') ? value : `blur(${value})`;
};

/** A dimming / tinting layer that fills its positioned parent (or the viewport with `fixed`). */
function OverlayBase(props: OverlayProps, ref: Ref<View>) {
  const theme = useTheme();
  const {
    color,
    opacity,
    backgroundOpacity,
    gradient,
    blur,
    radius,
    zIndex,
    fixed = false,
    center = false,
    style,
    children,
    ...others
  } = props;
  // `opacity` (taken above) tints the background only: on the root it would fade the children too.
  const { styleProps, otherProps: rest } = extractStyleProps(others);
  const boxStyles = useStyleProps(styleProps);

  const explicitOpacity = backgroundOpacity ?? opacity;
  const resolvedColor = color
    ? resolveColorProp(theme, color, { scopes: ['backgrounds', 'text'], shades: [5, 0] })
    : undefined;
  // Web paints the gradient instead of the flat color; native falls back to the color.
  // Without a `color` it is the theme's scrim — at its own strength unless an
  // opacity is given.
  const backgroundColor = gradient && isWeb
    ? undefined
    : resolvedColor
      ? applyOpacity(resolvedColor, clampOpacity(explicitOpacity ?? DEFAULT_OPACITY))
      : resolveScrim(theme, explicitOpacity == null ? undefined : clampOpacity(explicitOpacity));

  const resolvedZIndex = zIndex ?? (fixed ? getZIndex(theme, 'overlay') : CONTAINED_Z_INDEX);

  const resolvedRadius = radius != null ? resolveRadius(theme, radius) : undefined;
  const radiusStyle: ViewStyle | null = resolvedRadius != null
    ? { borderRadius: resolvedRadius, overflow: resolvedRadius > 0 ? 'hidden' : undefined }
    : null;

  return (
    <View
      ref={ref}
      style={[
        StyleSheet.absoluteFill,
        fixed ? webStyle({ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }) : null,
        center ? styles.center : null,
        { zIndex: resolvedZIndex },
        backgroundColor ? { backgroundColor } : null,
        gradient ? webStyle({ backgroundImage: gradient }) : null,
        blur != null ? webStyle({ backdropFilter: blurValue(blur), WebkitBackdropFilter: blurValue(blur) }) : null,
        radiusStyle,
        boxStyles,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export const Overlay = factory<OverlayFactoryPayload>(OverlayBase, { displayName: 'Overlay' });

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
