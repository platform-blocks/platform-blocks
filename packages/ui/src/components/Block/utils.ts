import type { DimensionValue, ViewStyle } from 'react-native';

import { resolveRadius, resolveShadow, resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme } from '../../core/theme/types';
import type { BlockStyleProps } from './types';

type ThemeLike = Partial<PlocksTheme> | null | undefined;

/** Radius prop → px, resolved against `theme.radii`. */
export function blockRadius(radius: BlockStyleProps['radius'], theme?: ThemeLike): number | undefined {
  if (radius === undefined) return undefined;
  return resolveRadius(theme, radius);
}

/** `shadow` token → the theme's cross-platform shadow style. */
export function blockShadow(shadow: BlockStyleProps['shadow'], theme?: ThemeLike): ViewStyle {
  if (shadow === undefined) return {};
  return resolveShadow(theme, shadow);
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
 */
export function getBlockStyles(props: BlockStyleProps, theme?: ThemeLike): ViewStyle {
  const {
    radius,
    borderWidth,
    borderColor,
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderTopColor,
    borderRightColor,
    borderBottomColor,
    borderLeftColor,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderStyle,
    overflow,
    aspectRatio,
    translateY,
    rotate,
    shadow,
    grow,
    shrink,
    basis,
    direction,
    align,
    alignSelf,
    justify,
    wrap,
    gap,
    position,
    top,
    right,
    bottom,
    left,
    inset,
    start,
    end,
    zIndex,
    flex,
  } = props;

  const style: ViewStyle = {
    // Appearance
    borderRadius: blockRadius(radius, theme),
    borderWidth,
    borderColor,
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderTopColor,
    borderRightColor,
    borderBottomColor,
    borderLeftColor,
    borderTopLeftRadius,
    borderTopRightRadius,
    borderStyle,
    overflow,
    aspectRatio,
    transform: translateY === undefined && rotate === undefined
      ? undefined
      : [...(translateY === undefined ? [] : [{ translateY }]), ...(rotate === undefined ? [] : [{ rotate }])],

    // Shadow
    ...blockShadow(shadow, theme),

    // Flex properties
    ...(flex !== false && { display: 'flex' as const }),
    flexGrow: typeof grow === 'boolean' ? (grow ? 1 : 0) : grow,
    ...(typeof flex === 'number' && { flex }),
    flexShrink: typeof shrink === 'boolean' ? (shrink ? 1 : 0) : shrink,
    flexBasis: getDimension(basis),
    flexDirection: direction,
    alignItems: align,
    alignSelf,
    justifyContent: justify,
    flexWrap: resolveFlexWrap(wrap),
    gap: blockGap(gap, theme),

    // Position
    position,
    top: getDimension(top ?? inset),
    right: getDimension(right ?? inset),
    bottom: getDimension(bottom ?? inset),
    left: getDimension(left ?? inset),
    start: getDimension(start),
    end: getDimension(end),
    zIndex,
  };

  if (props.touchAction) {
    (style as ViewStyle & { touchAction: BlockStyleProps['touchAction'] }).touchAction = props.touchAction;
  }
  return style;
}
