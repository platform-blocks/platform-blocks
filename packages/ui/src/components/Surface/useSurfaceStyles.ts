import { useContext, useMemo } from 'react';
import type { ViewStyle } from 'react-native';

import { useTheme } from '../../core/theme';
import { clampSurfaceLevel, resolveSurface } from '../../core/theme/surfaces';
import { createRadiusStyles } from '../../core/theme/radius';
import { resolveBg } from '../../core/theme/resolveColors';
import { getShadowStyles } from '../../core/utils';
import { getSpacing, type SizeValue } from '../../core/theme/sizes';
import type { RadiusValue } from '../../core/theme/radius';
import {
  getComponentDefaultShadow,
  type COMPONENT_SHADOW_DEFAULTS,
  type ShadowValue,
} from '../../core/theme/shadow';
import type { SurfaceLevel, SurfaceToken } from '../../core/theme/types';

import { SurfaceContext } from './SurfaceContext';

export interface UseSurfaceStylesOptions {
  /** Explicit elevation step. Wins over `raised`. */
  level?: SurfaceLevel;
  /** Derive the level from the enclosing Surface, plus one. */
  raised?: boolean;
  /** Level used when neither `level` nor `raised` is given. */
  defaultLevel?: SurfaceLevel;
  /** `'auto'` draws the hairline in dark mode only. */
  withBorder?: boolean | 'auto';
  borderColor?: string;
  borderWidth?: number;
  /** Background override — CSS color, `theme.backgrounds` key, or palette name. */
  bg?: string;
  /** Shadow override. Falls back to `componentShadowType`, then the level's default. */
  shadow?: ShadowValue;
  /**
   * Resolve an unset shadow from `COMPONENT_SHADOW_DEFAULTS[componentShadowType]`
   * instead of from the level. For components whose depth is part of their
   * identity rather than a consequence of where they sit.
   */
  componentShadowType?: keyof typeof COMPONENT_SHADOW_DEFAULTS;
  radius?: RadiusValue;
  /** Padding — size token or px. Omitted entirely when undefined. */
  padding?: SizeValue;
}

export interface UseSurfaceStylesResult {
  /** The resolved elevation step — feed this to a SurfaceContext.Provider. */
  level: SurfaceLevel;
  /** The raw token, for callers that need the colors rather than the style. */
  token: SurfaceToken;
  /** Background + border + radius + padding. */
  style: ViewStyle;
  /** Shadow styles, kept separate so callers can drop them per platform. */
  shadowStyle: Record<string, any>;
}

const resolvePadding = (padding: SizeValue | undefined): number | undefined => {
  if (padding === undefined) return undefined;
  if (typeof padding === 'number') return padding;
  return getSpacing(padding);
};

/**
 * Resolve one elevation step into concrete styles.
 *
 * Shared by `Surface` and by every component that paints its own container but
 * should still sit on the same ladder (Card, Menu dropdowns, Popover, Dialog).
 * Keeping the resolution here is the point of the whole exercise: components
 * pick a *level*, never a color.
 */
export function useSurfaceStyles(options: UseSurfaceStylesOptions = {}): UseSurfaceStylesResult {
  const {
    level,
    raised = false,
    defaultLevel = 1,
    withBorder = 'auto',
    borderColor,
    borderWidth,
    bg,
    shadow,
    componentShadowType,
    radius,
    padding,
  } = options;

  const theme = useTheme();
  const parentLevel = useContext(SurfaceContext).level;

  const resolvedLevel: SurfaceLevel = useMemo(() => {
    if (level !== undefined) return clampSurfaceLevel(level);
    if (raised) return clampSurfaceLevel(parentLevel + 1);
    return defaultLevel;
  }, [level, raised, parentLevel, defaultLevel]);

  const token = useMemo(() => resolveSurface(theme, resolvedLevel), [theme, resolvedLevel]);

  return useMemo(() => {
    // Dark mode can't lean on shadow to separate stacked surfaces, so the
    // hairline border carries elevation there by default.
    const showBorder =
      withBorder === 'auto'
        ? theme.colorScheme === 'dark'
        : withBorder || borderColor !== undefined || borderWidth !== undefined;

    const resolvedPadding = resolvePadding(padding);
    const radiusStyles = radius !== undefined ? createRadiusStyles(radius) : undefined;

    const style: ViewStyle = {
      backgroundColor: (bg ? resolveBg(theme, bg) : undefined) ?? token.background,
      ...(resolvedPadding !== undefined ? { padding: resolvedPadding } : {}),
      ...(showBorder
        ? {
            borderWidth: borderWidth ?? 1,
            borderColor: borderColor ?? token.border,
            borderStyle: 'solid' as const,
          }
        : {}),
      ...(radiusStyles || {}),
    };

    // An explicit shadow always wins. Otherwise a component that declares its
    // own shadow identity resolves through COMPONENT_SHADOW_DEFAULTS; anything
    // else takes the depth implied by its elevation. Resolved to a token up
    // front because `getShadowStyles` bails on an unset shadow before it ever
    // consults its `componentType` argument.
    const effectiveShadow =
      shadow ??
      (componentShadowType ? getComponentDefaultShadow(componentShadowType) : token.shadow);

    const shadowStyle = getShadowStyles({ shadow: effectiveShadow }, theme);

    return {
      level: resolvedLevel,
      token,
      style,
      shadowStyle,
    };
  }, [
    theme,
    token,
    resolvedLevel,
    withBorder,
    borderColor,
    borderWidth,
    bg,
    shadow,
    componentShadowType,
    radius,
    padding,
  ]);
}
