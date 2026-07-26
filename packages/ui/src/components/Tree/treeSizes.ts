import { getFontSize, type SizeValue } from '../../core/theme/sizes';
import {
  resolveComponentSize,
  type ComponentSize,
  type ComponentSizeValue,
} from '../../core/theme/componentSize';

/**
 * Row geometry per density step. `rowHeight` is the floor every row is pinned
 * to — branches carry a disclosure control and leaves do not, so without it the
 * two render at different heights, and a selected row's border changes the box
 * again on top of that.
 */
export interface TreeMetrics {
  rowHeight: number;
  paddingHorizontal: number;
  gap: number;
  indent: number;
  iconSize: number;
  radius: number;
  textSize: SizeValue;
  checkboxSize: SizeValue;
}

const TREE_ALLOWED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
const TREE_ALLOWED_SIZES_ARRAY: ComponentSize[] = [...TREE_ALLOWED_SIZES];

const TREE_SIZE_SCALE: Partial<Record<ComponentSize, TreeMetrics>> = {
  xs: { rowHeight: 24, paddingHorizontal: 4, gap: 3, indent: 12, iconSize: 14, radius: 4, textSize: 'xs', checkboxSize: 'xs' },
  sm: { rowHeight: 28, paddingHorizontal: 6, gap: 4, indent: 14, iconSize: 16, radius: 6, textSize: 'sm', checkboxSize: 'xs' },
  md: { rowHeight: 32, paddingHorizontal: 8, gap: 6, indent: 16, iconSize: 18, radius: 6, textSize: 'sm', checkboxSize: 'sm' },
  lg: { rowHeight: 40, paddingHorizontal: 10, gap: 8, indent: 20, iconSize: 20, radius: 8, textSize: 'md', checkboxSize: 'sm' },
  xl: { rowHeight: 48, paddingHorizontal: 12, gap: 10, indent: 24, iconSize: 24, radius: 8, textSize: 'lg', checkboxSize: 'md' },
};

const BASE_METRICS = TREE_SIZE_SCALE.md as TreeMetrics;
const BASE_FONT_SIZE = getFontSize('md') || 16;

/** A numeric `size` is read as a font size, and the rest of the row scales with it. */
function metricsFromFontSize(fontSize: number): TreeMetrics {
  const scale = fontSize / BASE_FONT_SIZE;
  const step = (value: number, minimum: number) => Math.max(minimum, Math.round(value * scale));
  return {
    rowHeight: step(BASE_METRICS.rowHeight, 20),
    paddingHorizontal: step(BASE_METRICS.paddingHorizontal, 4),
    gap: step(BASE_METRICS.gap, 2),
    indent: step(BASE_METRICS.indent, 8),
    iconSize: step(BASE_METRICS.iconSize, 12),
    radius: BASE_METRICS.radius,
    textSize: fontSize,
    checkboxSize: Math.max(12, Math.round(fontSize * 0.9)),
  };
}

export function resolveTreeMetrics(size: ComponentSizeValue | undefined): TreeMetrics {
  const resolved = resolveComponentSize<TreeMetrics>(size, TREE_SIZE_SCALE, {
    allowedSizes: TREE_ALLOWED_SIZES_ARRAY,
    fallback: 'md',
  });
  return typeof resolved === 'number' ? metricsFromFontSize(resolved) : resolved;
}
