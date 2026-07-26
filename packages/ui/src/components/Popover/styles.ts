import { StyleSheet } from 'react-native';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { createRadiusStyles } from '../../core/theme/radius';
import { createShadowStyles } from '../../core/theme/shadow';
import { resolveSurface } from '../../core/theme/surfaces';
import type { RadiusValue } from '../../core/theme/radius';
import type { ShadowValue } from '../../core/theme/shadow';

interface CreateStylesParams {
  radius?: RadiusValue | number;
  shadow?: ShadowValue;
  arrowSize: number;
}

export const createPopoverStyles = (theme: PlatformBlocksTheme) => (params: CreateStylesParams) => {
  const radiusStyles = createRadiusStyles(params.radius);
  const shadowStyles = createShadowStyles(params.shadow, theme, 'popover');
  // Level 2 — floating over content, same step as menus and select dropdowns,
  // so the two never disagree about what "a thing on top of the page" looks like.
  const surface = resolveSurface(theme, 2);

  return StyleSheet.create({
    wrapper: {
      position: 'relative',
      alignSelf: 'flex-start',
      overflow: 'visible',
      ...shadowStyles,
    },
    dropdown: {
      backgroundColor: surface.background,
      borderColor: surface.border,
      borderWidth: 1,
      color: theme.text.primary,
      ...radiusStyles,
      overflow: 'hidden',
      minWidth: 0,
    },
    arrow: {
      position: 'absolute',
      width: params.arrowSize * 2,
      height: params.arrowSize * 2,
      // Must match `dropdown` exactly — the arrow is a rotated square that
      // continues the surface, so any mismatch shows as a seam.
      backgroundColor: surface.background,
      transform: [{ rotate: '45deg' }],
    },
  });
};
