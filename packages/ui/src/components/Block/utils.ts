import type { DimensionValue, ViewStyle } from 'react-native';

import { resolveRadius, resolveShadow, resolveSpacing, type ShadowToken } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import type { BlockStyleProps } from './types';

type ThemeLike = Partial<PlatformBlocksTheme> | null | undefined;

/** Radius prop → px, resolved against `theme.radii`. */
export function blockRadius(radius: BlockStyleProps['radius'], theme?: ThemeLike): number | undefined {
  if (radius === undefined) return undefined;
  return resolveRadius(theme, radius);
}

const SHADOW_LEVELS: readonly ShadowToken[] = ['none', 'xs', 'sm', 'md', 'lg', 'xl'];

/** `shadow` prop (token, or legacy depth 0–5) → the theme's cross-platform shadow style. */
export function blockShadow(shadow: BlockStyleProps['shadow'], theme?: ThemeLike): ViewStyle {
  if (shadow === undefined) return {};
  const token: ShadowToken =
    typeof shadow === 'number' ? SHADOW_LEVELS[Math.max(0, Math.min(5, Math.round(shadow)))] : shadow;
  return resolveShadow(theme, token);
}

/** Basis / inset prop → a DimensionValue (`'full'` = 100%). */
export function getDimension(value: number | string | undefined): DimensionValue | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (value === 'auto') return 'auto';
  if (value === 'full') return '100%';
  return value as DimensionValue;
}

/** Gap prop → px, resolved against `theme.spacing`. */
export function blockGap(gap: BlockStyleProps['gap'], theme?: ThemeLike): number | undefined {
  if (gap === undefined) return undefined;
  if (typeof gap === 'number') return gap;
  const resolved = resolveSpacing(theme, gap);
  return typeof resolved === 'number' ? resolved : undefined;
}

function resolveFlexWrap(wrap: BlockStyleProps['wrap']): ViewStyle['flexWrap'] | undefined {
  if (wrap === undefined) return undefined;
  if (typeof wrap === 'boolean') {
    return wrap ? 'wrap' : 'nowrap';
  }
  return wrap;
}

/**
 * Converts Block layout props to a React Native style. The box props (`w`,
 * `bg`, `opacity`, …) are not handled here: they resolve with the spacing
 * props through `useStyleProps`.
 *
 * `start` / `end` are logical insets (mirrored in right-to-left layouts by
 * React Native and react-native-web); `left` / `right` are physical.
 * The second argument used to be an `isRTL` flag and is still accepted as one
 * (ignored) for back-compat.
 */
export function getBlockStyles(props: BlockStyleProps, theme?: ThemeLike | boolean): ViewStyle {
  const resolvedTheme = typeof theme === 'object' ? theme : undefined;
  const {
    radius,
    borderWidth,
    borderColor,
    shadow,
    grow,
    shrink,
    basis,
    direction,
    align,
    justify,
    wrap,
    gap,
    position,
    top,
    right,
    bottom,
    left,
    start,
    end,
    zIndex,
    flex,
  } = props;

  const style: ViewStyle = {
    // Appearance
    borderRadius: blockRadius(radius, resolvedTheme),
    borderWidth,
    borderColor,

    // Shadow
    ...blockShadow(shadow, resolvedTheme),

    // Flex properties
    ...(flex !== false && { display: 'flex' as const }),
    flexGrow: typeof grow === 'boolean' ? (grow ? 1 : 0) : grow,
    flexShrink: typeof shrink === 'boolean' ? (shrink ? 1 : 0) : shrink,
    flexBasis: getDimension(basis),
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: resolveFlexWrap(wrap),
    gap: blockGap(gap, resolvedTheme),

    // Position
    position,
    top: getDimension(top),
    right: getDimension(right),
    bottom: getDimension(bottom),
    left: getDimension(left),
    start: getDimension(start),
    end: getDimension(end),
    zIndex,
  };

  return style;
}
