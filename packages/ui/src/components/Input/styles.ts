import { Platform, StyleSheet } from 'react-native';
import { PlatformBlocksTheme, SizeToken, SizeValue } from '../../core/theme/types';
import { InputStyleProps, InputVariant } from './types';
import { px } from '../../core/utils';
import { createRadiusStyles } from '../../core/theme/radius';
import { getControlLabelFontSize } from '../../core/theme/sizes';

/**
 * Width floor for a field on wide screens. Fields dropped into a shrinking
 * flex parent (a row, a form grid) otherwise collapse to something too narrow
 * to type in; mobile skips the floor entirely and just fills the row, since
 * 400px is wider than the viewport.
 *
 * The floor is clamped to the parent so it can never push the field past it —
 * a field inside a narrow panel (a 420px sign-in card) would otherwise overflow
 * the panel's own padding, since `min-width` outranks both `width` and
 * `max-width`. Web gets the clamp via CSS `min()`; Yoga has no equivalent, so
 * native keeps the plain floor.
 */
export const INPUT_MIN_WIDTH = 400;

export const inputMinWidthFloor = () =>
  (Platform.OS === 'web'
    ? { minWidth: `min(100%, ${INPUT_MIN_WIDTH}px)` as unknown as number }
    : { minWidth: INPUT_MIN_WIDTH });

export const createInputStyles = (
  theme: PlatformBlocksTheme,
  isRTL: boolean = false,
  isMobile: boolean = false
) => {
  const getSizeStyles = (size: SizeValue) => {
    const sizeMap: Record<SizeToken, { fontSize: number; minHeight: number }> = {
      xs: {
        fontSize: px(theme.fontSizes.xs),
        minHeight: 32
      },
      sm: {
        fontSize: px(theme.fontSizes.sm),
        minHeight: 36
      },
      md: {
        fontSize: px(theme.fontSizes.md),
        minHeight: 40
      },
      lg: {
        fontSize: px(theme.fontSizes.lg),
        minHeight: 44
      },
      xl: {
        fontSize: px(theme.fontSizes.xl),
        minHeight: 48
      },
      '2xl': {
        fontSize: px(theme.fontSizes['2xl']),
        minHeight: 52
      },
      '3xl': {
        fontSize: px(theme.fontSizes['3xl']),
        minHeight: 56
      }
    };
    if (typeof size === 'number') {
      const base = Math.max(24, size);
      return {
        fontSize: base,
        minHeight: Math.max(base + 8, 32),
      };
    }
    return sizeMap[size] || sizeMap.md;
  };

  const getInputStyles = (props: InputStyleProps, radiusStyles?: any) => {
    const baseStyles = getSizeStyles(props.size);
    const inputRadius = radiusStyles ?? createRadiusStyles(undefined, undefined, 'input');
    // Padding frames the text, so it is a fraction of the field's own font size rather
    // than the layout spacing token. The spacing scale spans 8x (4→32px) against a 2.4x
    // type scale, so token-driven padding crept from 0.86x the text at `md` to 1.21x at
    // `3xl` — large fields read as mostly padding. These ratios hold ~0.88x/0.5x across
    // the scale and reproduce `md` (12/7) exactly. The floors keep xs/sm off their borders.
    const horizontalPadding = Math.max(12, Math.round(baseStyles.fontSize * 0.88));
    const verticalPadding = Math.max(7, Math.round(baseStyles.fontSize * 0.5));

    return StyleSheet.create({
      container: {
        marginBottom: px(theme.spacing.sm),
        width: '100%',
        ...(isMobile ? null : inputMinWidthFloor()),
      },
      
      error: {
        color: theme.colors.error[5],
        fontSize: px(theme.fontSizes.sm),
        marginTop: 4
      },
      
      helperText: {
        color: theme.text.muted,
        fontSize: px(theme.fontSizes.sm),
        marginTop: 4
      },
      
      input: {
        flex: 1,
        fontSize: baseStyles.fontSize,
        color: props.disabled ? theme.text.disabled : theme.text.primary,
        paddingVertical: 0, // Remove default padding to control spacing better
        paddingHorizontal: 0,
        minHeight: 20, // Set a minimum height for the text input
        fontFamily: theme.fontFamily,
        // Remove any web-specific styling that could interfere
        ...(Platform.OS === 'web' && {
          outlineWidth: 0,
          outlineStyle: 'none',
          border: 'none',
          borderWidth: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
        } as any),
      },
      
      inputContainer: (() => {
        const variant: InputVariant = props.variant ?? 'default';
        const isDark = theme.colorScheme === 'dark';
        // Focus is indicated by the border turning the primary theme color —
        // no outer ring/glow. Error always wins over focus.
        const isFocused = !!props.focused && !props.disabled;
        const focusBorder = props.error
          ? theme.colors.error[5]
          : isFocused
            ? theme.colors.primary[5]
            : theme.backgrounds.border;

        // Per-variant fill + border. Stroke is a constant 1px in every state — focus and
        // error only change `borderColor` — so nothing reflows. `unstyled` keeps a
        // transparent border at the same width for the same reason.
        const fill: { backgroundColor: string; borderColor: string; borderWidth: number } = (() => {
          if (variant === 'unstyled') {
            return {
              backgroundColor: 'transparent',
              borderColor: props.error ? theme.colors.error[5] : 'transparent',
              borderWidth: props.error ? 1 : 0,
            };
          }
          if (variant === 'outline') {
            return {
              backgroundColor: 'transparent',
              borderColor: focusBorder,
              borderWidth: 1,
            };
          }
          if (variant === 'filled') {
            return {
              // The dark palette's gray scale runs the other way (gray[0] is the
              // darkest), so the fill comes from the background tokens instead:
              // `elevated` sits one step above `surface` the way gray[1] sits one
              // step below white in light mode, and `subtle` reads as recessed.
              backgroundColor: props.disabled
                ? (isDark ? theme.backgrounds.subtle : theme.colors.gray[1])
                : (isDark ? theme.backgrounds.elevated : theme.colors.gray[1]),
              // Filled hides the border until focus/error gives it a color
              borderColor: props.error
                ? theme.colors.error[5]
                : isFocused
                  ? theme.colors.primary[5]
                  : 'transparent',
              borderWidth: 1,
            };
          }
          // default
          return {
            backgroundColor: props.disabled
              ? (isDark ? '#2C2C2E' : theme.colors.gray[0])
              : theme.backgrounds.surface,
            borderColor: focusBorder,
            borderWidth: 1,
          };
        })();

        return {
          alignItems: 'center',
          flexDirection: 'row',
          ...inputRadius,
          backgroundColor: fill.backgroundColor,
          paddingHorizontal: variant === 'unstyled' ? 0 : horizontalPadding,
          paddingVertical: variant === 'unstyled' ? 0 : verticalPadding,
          minHeight: baseStyles.minHeight,
          borderWidth: fill.borderWidth,
          borderColor: fill.borderColor,
          // Inputs sit flat on the surface: no focus ring, no elevation — focus is
          // carried entirely by `borderColor`, so light and dark read the same.
          elevation: 0,
          ...(Platform.OS === 'web' && props.disabled && ({ cursor: 'not-allowed', opacity: 0.75 } as any)),
        };
      })(),
      
      label: {
        color: props.disabled ? theme.text.disabled : theme.text.primary,
        fontSize: getControlLabelFontSize(props.size),
        fontWeight: '600',
        marginBottom: 0
      },
      
      startSection: {
        ...(isRTL ? { paddingLeft: px(theme.spacing.xs) } : { paddingRight: px(theme.spacing.xs) })
      },
      
      required: {
        color: theme.colors.error[5]
      },
      
      endSection: {
        ...(isRTL ? { paddingRight: px(theme.spacing.xs) } : { paddingLeft: px(theme.spacing.xs) }),
        alignItems: 'center',
        flexDirection: 'row'
      }
    });
  };

  return { getInputStyles, getSizeStyles };
};
