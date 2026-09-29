import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';

import { createThemedStyles } from '../../../core/hooks/useThemedStyles';
import { isWeb } from '../../../core/platform';
import { webStyle } from '../../../core/platform/webStyle';
import { getComponentDefaultRadius } from '../../../core/theme/radius';
import { getControlSize, resolveRadius, resolveSpacing } from '../../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../../core/theme/types';
import type { RadiusValue } from '../../../core/types/base';
import type { FieldVariant } from './fieldProps';

/** Width of the ring drawn around a focused field frame (both platforms, every state). */
export const FIELD_FOCUS_RING_WIDTH = 2;

/** Font size of a field's label for a control `size` (one step under the control's own text). */
export function getFieldLabelFontSize(theme: PlatformBlocksTheme, size: SizeValue | undefined): number {
  return Math.max(10, Math.round(getControlSize(theme, size).fontSize * 0.9));
}

/** The color every field focus ring uses. */
export function getFieldFocusRingColor(theme: PlatformBlocksTheme): string {
  return theme.states?.focusRing ?? theme.colors.primary[5];
}

/**
 * Style table for a text field's frame (the bordered box around a TextInput):
 * `frame`, the absolutely positioned `focusRing`, the `control` slot, the
 * `input` text and the `startSection` / `endSection` wrappers.
 *
 * Built from theme tokens only (control-size table, semantic colors, the
 * `input` radius) and cached per theme + arguments, so a keystroke never
 * rebuilds it. Colors match the non-text fields' frame (Select, pickers), so
 * the whole form family reads the same.
 *
 * Focus draws a 2px `focusRing` OUTSIDE the 1px border — including in the
 * error state, where the border stays the error color — so focus never
 * reflows the field and never hides the error.
 *
 * @example
 * const styles = getFieldFrameStyles(theme, size, variant, radius, invalid, focused, disabled);
 * <View style={styles.frame}>{focused ? <View style={styles.focusRing} /> : null}...</View>
 */
export const getFieldFrameStyles = createThemedStyles(
  (
    theme: PlatformBlocksTheme,
    size: SizeValue,
    variant: FieldVariant,
    radius: RadiusValue | undefined,
    invalid: boolean,
    focused: boolean,
    disabled: boolean
  ) => {
    const metrics = getControlSize(theme, size);
    const unstyled = variant === 'unstyled';
    const errorColor = theme.colors.error[5];
    const accentColor = theme.colors.primary[5];
    const isFocused = focused && !disabled;

    let backgroundColor: string = theme.backgrounds.surface;
    let borderColor: string = theme.backgrounds.borderStrong;
    if (variant === 'filled') {
      backgroundColor = theme.backgrounds.subtle;
      // Filled hides its border until focus or an error gives it a color.
      borderColor = 'transparent';
    } else if (variant === 'outline' || unstyled) {
      backgroundColor = 'transparent';
      if (unstyled) borderColor = 'transparent';
    }
    if (disabled && !unstyled) backgroundColor = theme.backgrounds.disabled;
    if (invalid) borderColor = errorColor;
    else if (isFocused && !unstyled) borderColor = accentColor;

    // A constant border width in every state, so focus/error never reflow the
    // field. `unstyled` only draws one to flag an error.
    const borderWidth = unstyled && !invalid ? 0 : 1;
    const borderRadius = unstyled ? 0 : resolveRadius(theme, radius ?? getComponentDefaultRadius('input'));
    const ringInset = -(borderWidth + FIELD_FOCUS_RING_WIDTH);
    const sectionGap = resolveSpacing(theme, 'xs') as number;

    const frame: ViewStyle = {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: metrics.height,
      paddingHorizontal: unstyled ? 0 : metrics.paddingX,
      paddingVertical: unstyled ? 0 : Math.max(4, Math.round(metrics.fontSize * 0.5)),
      borderRadius,
      borderWidth,
      borderColor,
      backgroundColor,
      ...(disabled && isWeb ? { opacity: 0.75 } : null),
      ...webStyle(disabled ? { cursor: 'not-allowed' } : {}),
    };

    const focusRing: ViewStyle = {
      position: 'absolute',
      top: ringInset,
      bottom: ringInset,
      start: ringInset,
      end: ringInset,
      borderWidth: FIELD_FOCUS_RING_WIDTH,
      borderColor: getFieldFocusRingColor(theme),
      borderRadius: borderRadius + borderWidth + FIELD_FOCUS_RING_WIDTH,
      pointerEvents: 'none',
    };

    const input: TextStyle = {
      flex: 1,
      fontSize: metrics.fontSize,
      fontFamily: theme.fontFamily,
      color: disabled ? theme.text.disabled : theme.text.primary,
      minHeight: 20,
      margin: 0,
      paddingVertical: 0,
      paddingHorizontal: 0,
      borderWidth: 0,
      backgroundColor: 'transparent',
      // The frame draws focus; UniversalCSS also drops the raw outline for
      // `data-pb-input` elements, this covers apps without the provider.
      ...webStyle({ outlineStyle: 'none', outlineWidth: 0, boxShadow: 'none', boxSizing: 'border-box' }),
    };

    return StyleSheet.create({
      frame,
      focusRing,
      control: { flex: 1, position: 'relative', justifyContent: 'center' },
      input,
      startSection: { paddingEnd: sectionGap, flexDirection: 'row', alignItems: 'center' },
      endSection: { paddingStart: sectionGap, flexDirection: 'row', alignItems: 'center' },
    });
  }
);

export type FieldFrameStyles = ReturnType<typeof getFieldFrameStyles>;
