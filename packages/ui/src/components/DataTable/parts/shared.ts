import { useMemo } from 'react';
import type { ViewStyle } from 'react-native';

import { useTheme } from '../../../core/theme/ThemeProvider';
import { isWeb } from '../../../core/platform/flags';
import { webStyle } from '../../../core/platform/webStyle';
import type { DataTableProps } from '../types';

export type Density = NonNullable<DataTableProps['density']>;
export type BorderLineStyle = 'solid' | 'dashed' | 'dotted';

/** Semantic colors DataTable paints with — theme roles, overridable by the color props. */
export interface DataTableColors {
  /** Header / filter-row band (opaque, so pinned header cells cover scrolled ones). */
  headerBg: string;
  /** Opaque row surface under pinned cells, and the inline editor fill. */
  surfaceBg: string;
  /** Striped rows, group-header rows and the expanded-row panel. */
  stripeBg: string;
  /** Selected row fill (opaque). */
  selectedBg: string;
  /** Row hover fill. */
  hoverBg: string;
  /** Pressed fill for icon buttons. */
  pressedBg: string;
  /** Row dividers. */
  rowBorder: string;
  /** Column dividers. */
  columnBorder: string;
  /** Outer border. */
  outerBorder: string;
  /** Header underline, footer overline, pinned-column boundary, resize grip. */
  strongBorder: string;
  /** Hairlines inside the toolbar / pagination area. */
  hairline: string;
  /** Accent: selected-row bar, active filters, drop target, editor frame. */
  accent: string;
  /** Icons in controls. */
  icon: string;
  /** De-emphasized icons (placeholders, row-action fallback). */
  iconMuted: string;
  /** Body / header text. */
  text: string;
}

interface ColorOverrides {
  headerBackgroundColor?: string;
  hoverColor?: string;
  borderColor?: string;
  rowBorderColor?: string;
  columnBorderColor?: string;
  outerBorderColor?: string;
}

export function useDataTableColors({
  headerBackgroundColor,
  hoverColor,
  borderColor,
  rowBorderColor,
  columnBorderColor,
  outerBorderColor,
}: ColorOverrides): DataTableColors {
  const theme = useTheme();
  return useMemo(() => {
    const { backgrounds, text } = theme;
    return {
      headerBg: headerBackgroundColor ?? backgrounds.subtle,
      surfaceBg: backgrounds.surface,
      stripeBg: backgrounds.subtle,
      selectedBg: backgrounds.selected,
      hoverBg: hoverColor ?? backgrounds.hover,
      pressedBg: backgrounds.pressed,
      rowBorder: rowBorderColor ?? borderColor ?? backgrounds.border,
      columnBorder: columnBorderColor ?? borderColor ?? backgrounds.border,
      outerBorder: outerBorderColor ?? borderColor ?? backgrounds.borderStrong,
      strongBorder: borderColor ?? backgrounds.borderStrong,
      hairline: backgrounds.border,
      accent: theme.colors.primary[5],
      icon: text.secondary,
      iconMuted: text.muted,
      text: text.primary,
    };
  }, [theme, headerBackgroundColor, hoverColor, borderColor, rowBorderColor, columnBorderColor, outerBorderColor]);
}

/**
 * A dashed / dotted border on one side. Web styles the side alone; native only
 * has a view-wide `borderStyle`, which is fine for cells whose only border is
 * that side. `solid` is the default on both, so it needs no style.
 */
export function sideBorderStyle(side: 'bottom' | 'end', style: BorderLineStyle): ViewStyle | null {
  if (style === 'solid') return null;
  if (!isWeb) return { borderStyle: style };
  // react-native-web maps `borderEndStyle` to `border-inline-end-style`.
  return webStyle(side === 'bottom' ? { borderBottomStyle: style } : { borderEndStyle: style });
}

export const ROW_MIN_HEIGHT: Record<Density, number> = { compact: 40, normal: 48, comfortable: 56 };
export const AGGREGATE_ROW_MIN_HEIGHT: Record<Density, number> = { compact: 36, normal: 44, comfortable: 44 };
export const ESTIMATED_ROW_HEIGHT: Record<Density, number> = { compact: 44, normal: 52, comfortable: 60 };
export const TABLE_VERTICAL_SPACING: Record<Density, 'xs' | 'sm' | 'lg'> = { compact: 'xs', normal: 'sm', comfortable: 'lg' };
