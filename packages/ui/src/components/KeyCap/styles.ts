import type { TextStyle, ViewStyle } from 'react-native';

import { webStyle } from '../../core/platform';
import { resolveAccentColor, resolveLineColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor, resolveShadow } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { resolveVariantRoles } from '../../core/theme/variantRoles';
import { resolveRoleColor } from '../Button/styles';
import type { KeyCapStyleProps } from './types';

export const useKeyCapStyles = (props: KeyCapStyleProps) => {
  const theme = useTheme();
  return getKeyCapStyles(theme, props);
};

/**
 * Container + label style of a key cap. The `default` variant is a neutral,
 * slightly raised key (a heavier bottom edge); the others tint with `color`.
 */
export const getKeyCapStyles = (
  theme: PlatformBlocksTheme,
  { metrics, variant, color, pressed }: KeyCapStyleProps
): { container: ViewStyle; text: TextStyle } => {
  const { height, paddingHorizontal, fontSize, minWidth } = metrics;

  let container: ViewStyle;
  let textColor: string;
  switch (variant) {
    case 'minimal':
      container = { backgroundColor: 'transparent', borderWidth: 0 };
      textColor = resolveVariantRoles(theme, { variant: 'outline', color: resolveRoleColor(theme, color) }).text;
      break;
    case 'outline':
      container = {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: resolveLineColor(theme, color) ?? theme.backgrounds.borderStrong,
      };
      textColor = resolveVariantRoles(theme, { variant: 'outline', color: resolveRoleColor(theme, color) }).text;
      break;
    case 'filled': {
      const fill = resolveAccentColor(theme, color) ?? theme.text.link;
      container = { backgroundColor: fill, borderWidth: 0 };
      textColor = onColor(theme, fill);
      break;
    }
    case 'default':
    default:
      container = {
        backgroundColor: pressed ? theme.backgrounds.border : theme.backgrounds.subtle,
        borderWidth: 1,
        borderColor: theme.backgrounds.border,
        borderBottomWidth: pressed ? 1 : 2,
        borderBottomColor: theme.backgrounds.borderStrong,
        ...(pressed ? null : resolveShadow(theme, 'xs')),
        // A faint top-lit gradient reads as a physical key on web.
        ...webStyle(
          pressed
            ? {}
            : { backgroundImage: `linear-gradient(180deg, ${theme.backgrounds.surface} 0%, ${theme.backgrounds.subtle} 100%)` }
        ),
      };
      textColor = theme.text.primary;
      break;
  }

  return {
    container: {
      minWidth,
      height,
      paddingHorizontal,
      alignItems: 'center',
      justifyContent: 'center',
      ...container,
      ...(pressed ? { transform: [{ translateY: 1 }] } : null),
      ...webStyle({ userSelect: 'none', cursor: 'default' }),
    },
    text: {
      fontSize,
      fontFamily: theme.fontFamilyMono,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: Math.round(fontSize * 1.2),
      color: textColor,
    },
  };
};
