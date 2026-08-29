import { StyleSheet, Platform } from 'react-native';
import { resolveComponentSize, type ComponentSize } from '../../core/theme/componentSize';
import { literalBackgrounds, literalText } from '../../core/theme/cssVariableTheme';
import { readableTextOn } from '../../core/theme/colorUtils';
import { RadioStyleProps } from './types';
import { PlatformBlocksTheme } from '../../core/theme/types';

/**
 * Ring thickness of an unselected radio, and the inset the ring closes in from.
 * Hairline — an off radio should read as an outline, not as a
 * donut competing with the selected state.
 */
const BORDER_WIDTH = 1;

const SIZE_MAP: Partial<Record<ComponentSize, number>> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 36,
  '3xl': 40
};

/**
 * Geometry and palette of the radio control.
 *
 * The control is two stacked circles rather than a bordered box: an opaque
 * `track` disc filling the whole footprint, and a `hole` disc punched over it.
 * Unselected, the hole covers everything but a `BORDER_WIDTH` rim, so the
 * control reads as a ring. Selecting shrinks the hole down to `dotSize` and
 * recolors the track, which turns the rim into a filled disc and leaves the
 * hole behind as the center dot — one continuous motion, no crossfade.
 */
export const getRadioMetrics = (props: RadioStyleProps & { theme: PlatformBlocksTheme }) => {
  const { disabled, error, size, color, theme } = props;

  const radioSize = resolveComponentSize(size, SIZE_MAP, { fallback: 'md' }) as number;
  // The dot sits at ~40% of the control — the ratio most design systems
  // land on (8px inside 20px).
  const dotSize = Math.max(Math.round(radioSize * 0.4), 4);
  // Interior the hole covers when unselected — everything inside the rim.
  const holeSize = radioSize - BORDER_WIDTH * 2;

  const getColorScheme = (colorName: string) => {
    const colorMap: Record<string, any> = {
      'primary': theme.colors.primary,
      'secondary': theme.colors.secondary,
      'success': theme.colors.success,
      'warning': theme.colors.warning,
      'error': theme.colors.error,
      'gray': theme.colors.gray,
    };
    return colorMap[colorName] || theme.colors.primary;
  };

  const errorColor = theme.colors.error[6];
  const accentColor = (() => {
    if (disabled) return theme.colors.gray[3];
    if (error) return errorColor;
    return getColorScheme(color)[6];
  })();
  // Read literally rather than through `theme.backgrounds`: on web that token is
  // a `var(--platform-blocks-bg-surface, …)` reference, and the hole color is
  // interpolated, which needs a color the animation can actually parse.
  // Falls back to white for slim themes (tests) that omit the background scale.
  const surfaceColor = literalBackgrounds(theme)?.surface ?? '#ffffff';

  return {
    borderWidth: BORDER_WIDTH,
    dotSize,
    holeSize,
    radioSize,
    /** Track color while unselected — only its rim is visible, so this is the ring. */
    ringColor: (() => {
      if (disabled) return theme.colors.gray[3];
      if (error) return errorColor;
      return theme.colors.gray[4];
    })(),
    /** Track color once selected, when the whole disc is showing. */
    fillColor: accentColor,
    /** Hole color while unselected — matches the surface so the center reads as empty. */
    holeColor: surfaceColor,
    /**
     * Hole color once selected, when all that is left of it is the dot. Light
     * text is the conventional choice on a filled control, but dark themes take
     * their accent from the light end of the scale, where a near-white dot all
     * but vanishes — so fall back to a dark dot when the fill is too bright.
     */
    dotColor: disabled
      ? surfaceColor
      : readableTextOn(accentColor, '#1A1A1A', literalText(theme).onPrimary || '#ffffff'),
    /** How far the hole shrinks to become the dot. */
    dotScale: dotSize / holeSize,
  };
};

export const useRadioStyles = (props: RadioStyleProps & { theme: PlatformBlocksTheme }) => {
  const { checked, disabled, theme } = props;

  const { holeSize, radioSize, ringColor, fillColor, holeColor, dotColor, dotScale } =
    getRadioMetrics(props);

  const errorColor = theme.colors.error[6];

  return StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      minHeight: radioSize + 4,
    },

    description: {
      color: theme.text.secondary,
      marginTop: 2,
    },

    error: {
      color: theme.colors.error[6],
      marginTop: 2,
    },

    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },

    label: {
      color: disabled ? theme.colors.gray[6] : theme.text.primary,
      lineHeight: radioSize,
      ...(Platform.OS === 'web' && { userSelect: 'none' as any }),
    },

    labelContainer: {
      flex: 1,
      justifyContent: 'center',
      marginLeft: 8,
    },

    labelContainerLeft: {
      marginLeft: 0,
      marginRight: 8,
    },

    labelContent: {
      alignItems: 'center',
      flexDirection: 'row',
    },

    labelDisabled: {
      color: theme.colors.gray[6],
    },

    labelError: {
      color: errorColor,
    },

    radio: {
      alignItems: 'center',
      // The ring is the rim of the track disc, not a real border — animating a
      // border width/color can't be driven natively and lands on half-pixels.
      backgroundColor: 'transparent',
      borderRadius: radioSize / 2,
      height: radioSize,
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1,
      width: radioSize,
      ...(Platform.OS === 'web' && {
        transition: 'box-shadow 120ms ease',
      }),
    },

    radioContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: radioSize,
      minWidth: radioSize,
    },

    // Center disc punched out of the track. At rest it covers everything but the
    // rim (so the control reads as a ring); selected, it is just the dot.
    radioInner: {
      backgroundColor: checked ? dotColor : holeColor,
      borderRadius: holeSize / 2,
      height: holeSize,
      transform: [{ scale: checked ? dotScale : 1 }],
      width: holeSize,
      ...(Platform.OS === 'android' && {
        // Android-specific fixes for maintaining circle shape
        borderRadius: Math.max(holeSize / 2, 1),
        elevation: 0,
      }),
    },

    // Opaque disc filling the whole control. Only its rim shows while unselected.
    radioTrack: {
      backgroundColor: checked ? fillColor : ringColor,
      borderRadius: radioSize / 2,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },

    required: {
      color: theme.colors.error[6],
    },
  });
};
