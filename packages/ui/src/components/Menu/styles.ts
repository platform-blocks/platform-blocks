import type { ViewStyle } from 'react-native';

import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSurface, surfaceInteractionTint } from '../../core/theme/surfaces';
import { resolveRadius, resolveShadow, resolveSpacing } from '../../core/theme/tokens';
import type { ShadowToken } from '../../core/theme/tokens';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import type { RadiusValue } from '../../core/types/base';

export interface MenuStyleOptions {
  radius?: RadiusValue;
  shadow?: ShadowToken;
}

/**
 * Styles for menu/dropdown surfaces, cached per theme + radius + shadow.
 *
 * The dropdown sits at level 2 — floating over content — and takes its
 * background, border and shadow from the theme's elevation ladder. Overlays
 * always take the hairline, in both schemes: they float over arbitrary
 * content, so they need a defined edge even in light mode.
 */
export const getMenuStyles = createThemedStyles((theme, radius: RadiusValue, shadow: ShadowToken) => {
  const surface = resolveSurface(theme, 2);
  const gapSm = resolveSpacing(theme, 'sm') as number;
  const gapMd = resolveSpacing(theme, 'md') as number;

  const dropdown: ViewStyle = {
    backgroundColor: surface.background,
    borderColor: surface.border,
    borderWidth: 1,
    borderRadius: resolveRadius(theme, radius),
    ...resolveShadow(theme, shadow),
    minWidth: 180,
    maxWidth: 320,
    overflow: 'hidden',
  };

  return {
    dropdown,
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: gapSm,
      paddingHorizontal: gapMd,
      minHeight: 36,
    } as ViewStyle,
    itemHovered: { backgroundColor: surfaceInteractionTint(theme, 'hover') } as ViewStyle,
    itemPressed: { backgroundColor: surfaceInteractionTint(theme, 'pressed') } as ViewStyle,
    itemSelected: { backgroundColor: surfaceInteractionTint(theme, 'selected') } as ViewStyle,
    itemDisabled: { opacity: 0.5 } as ViewStyle,
    itemDanger: { backgroundColor: theme.colors.error[0] } as ViewStyle,
    itemDangerPressed: { backgroundColor: theme.colors.error[1] } as ViewStyle,
    label: { paddingVertical: 6, paddingHorizontal: gapMd } as ViewStyle,
    divider: { height: 1, backgroundColor: surface.border } as ViewStyle,
    startSection: { marginEnd: gapSm } as ViewStyle,
    endSection: { marginStart: 'auto', paddingStart: gapMd } as ViewStyle,
    /** The resolved level-2 token, for callers that need the raw colors. */
    surfaceToken: surface,
  };
});

/** Hook form of {@link getMenuStyles} for the current theme (also used by Select). */
export function useMenuStyles(options: MenuStyleOptions = {}) {
  const theme = useTheme();
  return getMenuStyles(theme, options.radius ?? 'md', options.shadow ?? 'md');
}
