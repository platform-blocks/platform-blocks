import type { ComponentSizeValue } from '../../core/theme/componentSize';
import { getControlSize, resolveFontSize, stepDown } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';

/**
 * Row geometry for one density step. `rowHeight` is the floor every row is
 * pinned to — branches carry a disclosure control and leaves do not, so
 * without it the two render at different heights, and a selected row's border
 * changes the box again on top of that.
 */
export interface TreeMetrics {
  rowHeight: number;
  paddingHorizontal: number;
  gap: number;
  indent: number;
  iconSize: number;
  radius: number;
  /** Label font size in px. */
  textSize: number;
  checkboxSize: SizeValue;
}

type ThemeLike = Partial<PlocksTheme> | null | undefined;

/**
 * Rows are compact controls, so they take the theme's control metrics one step
 * down (`getControlSize(theme, stepDown(size))`) — the `md` row is as tall as a
 * `sm` button. The gap and the caret follow the requested step itself, and the
 * label never drops below the theme's `sm` text except at `xs`, where density
 * is the point.
 */
function metricsForToken(theme: ThemeLike, size: SizeValue): TreeMetrics {
  const row = getControlSize(theme, stepDown(size));
  const own = getControlSize(theme, size);
  const smallestText = size === 'xs' ? row.fontSize : resolveFontSize(theme, 'sm');
  return {
    rowHeight: row.height,
    paddingHorizontal: Math.round(row.paddingX * 0.8),
    gap: own.gap,
    indent: Math.round(row.height / 2),
    iconSize: own.iconSize + 2,
    radius: row.radius,
    textSize: Math.max(row.fontSize, smallestText),
    checkboxSize: stepDown(size),
  };
}

/** A numeric `size` is read as a font size, and the rest of the row scales with it. */
function metricsFromFontSize(theme: ThemeLike, fontSize: number): TreeMetrics {
  const base = metricsForToken(theme, 'md');
  const scale = fontSize / base.textSize;
  const step = (value: number, minimum: number) => Math.max(minimum, Math.round(value * scale));
  return {
    rowHeight: step(base.rowHeight, 20),
    paddingHorizontal: step(base.paddingHorizontal, 4),
    gap: step(base.gap, 2),
    indent: step(base.indent, 8),
    iconSize: step(base.iconSize, 12),
    radius: base.radius,
    textSize: fontSize,
    checkboxSize: Math.max(12, Math.round(fontSize * 0.9)),
  };
}

export function resolveTreeMetrics(theme: ThemeLike, size: ComponentSizeValue | undefined): TreeMetrics {
  if (typeof size === 'number') return metricsFromFontSize(theme, size);
  return metricsForToken(theme, size ?? 'md');
}
