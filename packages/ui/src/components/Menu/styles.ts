import { ViewStyle } from 'react-native';

import { useTheme } from '../../core/theme';
import { surfaceInteractionTint } from '../../core/theme/surfaces';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';

/**
 * Styles for menu/dropdown surfaces.
 *
 * The dropdown sits at level 2 — floating over content — and takes its
 * background, border and shadow from the theme's elevation ladder. It used to
 * index `theme.colors.surface[4]`, which is a mid-grey step of a 10-shade
 * *palette* rather than a semantic background, so light-mode dropdowns rendered
 * grey while popovers next to them rendered white.
 */
export function useMenuStyles() {
  const theme = useTheme();

  const surface = useSurfaceStyles({
    level: 2,
    radius: 'md',
    // Overlays always take the hairline, in both schemes: they float over
    // arbitrary content, so they need a defined edge even in light mode.
    withBorder: true,
  });

  const dropdown: ViewStyle = {
    ...surface.style,
    ...surface.shadowStyle,
    minWidth: 180,
    maxWidth: 320,
    overflow: 'hidden',
  };

  const item: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  };

  const itemHovered: ViewStyle = {
    backgroundColor: surfaceInteractionTint(theme, 'hover'),
  };

  const itemPressed: ViewStyle = {
    backgroundColor: surfaceInteractionTint(theme, 'pressed'),
  };

  const itemSelected: ViewStyle = {
    backgroundColor: surfaceInteractionTint(theme, 'selected'),
  };

  const itemDisabled: ViewStyle = {
    opacity: 0.5,
  };

  const itemDanger: ViewStyle = {
    backgroundColor: theme.colors.error[0],
  };

  const itemDangerPressed: ViewStyle = {
    backgroundColor: theme.colors.error[1],
  };

  const label: ViewStyle = {
    paddingVertical: 6,
    paddingHorizontal: 12,
  };

  const divider: ViewStyle = {
    height: 1,
    backgroundColor: surface.token.border,
  };

  const startSection: ViewStyle = {
    marginRight: 8,
  };

  const endSection: ViewStyle = {
    marginLeft: 'auto',
    paddingLeft: 12,
  };

  return {
    dropdown,
    item,
    itemHovered,
    itemPressed,
    itemSelected,
    itemDisabled,
    itemDanger,
    itemDangerPressed,
    label,
    divider,
    startSection,
    endSection,
    /** The resolved level-2 token, for callers that need the raw colors. */
    surfaceToken: surface.token,
  };
}
