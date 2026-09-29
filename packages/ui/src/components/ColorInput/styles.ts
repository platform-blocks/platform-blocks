import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { webStyle } from '../../core/platform/webStyle';
import { getControlSize, resolveRadius } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { getDropdownSurfaceStyle } from '../Select/fieldControlStyles';

/** ColorInput-specific measurements, all derived from the theme's control size. */
export interface ColorInputMetrics {
  /** Gap between the frame's parts (preview, hex text, buttons). */
  gap: number;
  previewSize: number;
  previewRadius: number;
  swatchSize: number;
  swatchRadius: number;
  swatchGap: number;
  /** Inner padding of the dropdown card / sheet body. */
  dropdownPadding: number;
  iconSize: number;
  /** Visible box of the swatch toggle button (≥ 24px, the web minimum target). */
  toggleSize: number;
}

export function getColorInputMetrics(theme: PlatformBlocksTheme, size: SizeValue): ColorInputMetrics {
  const control = getControlSize(theme, size);
  return {
    gap: control.gap,
    previewSize: Math.max(12, Math.round(control.height * 0.55)),
    previewRadius: Math.max(2, Math.round(control.radius * 0.5)),
    swatchSize: Math.max(24, Math.round(control.height * 0.75)),
    swatchRadius: Math.max(4, Math.round(control.radius * 0.5)),
    swatchGap: Math.max(6, Math.round(control.paddingX * 0.5)),
    dropdownPadding: control.paddingX,
    iconSize: control.iconSize,
    toggleSize: Math.max(24, control.iconSize + 8),
  };
}

/** Style table for ColorInput's own parts, cached per theme + size. */
export const getColorInputStyles = createThemedStyles((theme: PlatformBlocksTheme, size: SizeValue) => {
  const metrics = getColorInputMetrics(theme, size);

  const preview: ViewStyle = {
    width: metrics.previewSize,
    height: metrics.previewSize,
    borderRadius: metrics.previewRadius,
    borderWidth: 1,
    borderColor: theme.backgrounds.border,
  };

  const hexInput: TextStyle = {
    fontFamily: theme.fontFamilyMono,
  };

  const toggle: ViewStyle = {
    minWidth: metrics.toggleSize,
    minHeight: metrics.toggleSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: resolveRadius(theme, 'sm'),
    ...webStyle({ cursor: 'pointer' }),
  };

  return {
    metrics,
    styles: StyleSheet.create({
      frameGap: { gap: metrics.gap },
      preview,
      previewEmpty: { borderColor: theme.backgrounds.borderStrong, borderStyle: 'dashed' },
      hexInput,
      spacer: { flex: 1 },
      section: { flexDirection: 'row', alignItems: 'center' },
      toggle,
      toggleHovered: { backgroundColor: theme.backgrounds.hover },
      togglePressed: { backgroundColor: theme.backgrounds.pressed },
      toggleDisabled: webStyle({ cursor: 'not-allowed' }),
      dropdown: { ...getDropdownSurfaceStyle(theme), padding: metrics.dropdownPadding },
      sheetBody: { padding: metrics.dropdownPadding },
    }),
  };
});

export type ColorInputStyles = ReturnType<typeof getColorInputStyles>['styles'];
