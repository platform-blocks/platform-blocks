import { useMemo } from 'react';
import type { DimensionValue, ViewStyle } from 'react-native';

import { DEFAULT_THEME } from '../theme/defaultTheme';
import { resolveBg } from '../theme/resolveColors';
import { useTheme } from '../theme/ThemeProvider';
import { resolveSpacing } from '../theme/tokens';
import type { DimensionProp, PlatformBlocksTheme, SpacingValue, StyleProps } from '../theme/types';

/** Re-export SpacingValue from theme types */
export type { SpacingValue } from '../theme/types';

/**
 * The style props — spacing (`m`, `px`, …) and box (`w`, `maw`, `bg`,
 * `opacity`, …) — defined in `core/theme/types.ts`, re-exported here.
 * Visibility props live in `VisibilityProps` (`core/types/base.ts`).
 */
export type { BoxProps, DimensionProp, SpacingProps, StyleProps } from '../theme/types';

/** Every style prop key, spacing first (shorthands before the edges they cover). */
const STYLE_KEYS = [
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml',
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl',
  'w', 'h', 'miw', 'maw', 'mih', 'mah', 'bg', 'opacity',
] as const satisfies readonly (keyof StyleProps)[];

const EMPTY_STYLE: ViewStyle = Object.freeze({}) as ViewStyle;

const dimension = (value: DimensionProp): DimensionValue =>
  (value === 'full' ? '100%' : value) as DimensionValue;

/**
 * Converts style props to a style: spacing tokens resolve through
 * `theme.spacing`, `bg` through `resolveBg`, and `'full'` sizes to `'100%'`.
 *
 * Horizontal spacing uses logical properties on EVERY platform: `ml` / `pl` →
 * `marginStart` / `paddingStart`, `mr` / `pr` → `marginEnd` / `paddingEnd`.
 * react-native-web maps them to `margin-inline-*`, and React Native flips them
 * in RTL itself, so nothing here reads the layout direction. Edge props win
 * over the shorthands that cover them (`mt` over `my` over `m`).
 *
 * @param props - The style props to convert.
 * @param theme - Theme to resolve tokens against (defaults to `DEFAULT_THEME`);
 *   `useStyleProps` passes the current one.
 */
export function resolveStyleProps(props: StyleProps, theme?: Partial<PlatformBlocksTheme> | null): ViewStyle {
  const resolvedTheme = theme ?? DEFAULT_THEME;
  const resolve = (value: SpacingValue) => resolveSpacing(resolvedTheme, value);
  const styles: ViewStyle = {};
  let any = false;

  const set = (keys: (keyof ViewStyle)[], value: SpacingValue | undefined) => {
    if (value === undefined || value === null) return;
    const resolved = resolve(value);
    for (const key of keys) (styles as Record<string, unknown>)[key] = resolved;
    any = true;
  };

  set(['marginTop', 'marginBottom', 'marginStart', 'marginEnd'], props.m);
  set(['marginStart', 'marginEnd'], props.mx);
  set(['marginTop', 'marginBottom'], props.my);
  set(['marginTop'], props.mt);
  set(['marginBottom'], props.mb);
  set(['marginEnd'], props.mr);
  set(['marginStart'], props.ml);

  set(['paddingTop', 'paddingBottom', 'paddingStart', 'paddingEnd'], props.p);
  set(['paddingStart', 'paddingEnd'], props.px);
  set(['paddingTop', 'paddingBottom'], props.py);
  set(['paddingTop'], props.pt);
  set(['paddingBottom'], props.pb);
  set(['paddingEnd'], props.pr);
  set(['paddingStart'], props.pl);

  const size = (key: 'width' | 'height' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight', value: DimensionProp | undefined) => {
    if (value === undefined || value === null) return;
    styles[key] = dimension(value);
    any = true;
  };
  size('width', props.w);
  size('height', props.h);
  size('minWidth', props.miw);
  size('maxWidth', props.maw);
  size('minHeight', props.mih);
  size('maxHeight', props.mah);

  if (props.bg !== undefined && props.bg !== null) {
    const bg = resolveBg(resolvedTheme as PlatformBlocksTheme, props.bg);
    if (bg !== undefined) {
      styles.backgroundColor = bg;
      any = true;
    }
  }
  if (props.opacity !== undefined && props.opacity !== null) {
    styles.opacity = props.opacity;
    any = true;
  }

  return any ? styles : EMPTY_STYLE;
}

/**
 * Hook form of `resolveStyleProps`, resolved against the current theme and
 * memoized on the prop values (not on the props object's identity).
 */
export function useStyleProps(props: StyleProps): ViewStyle {
  const theme = useTheme();
  const { m, mx, my, mt, mr, mb, ml, p, px, py, pt, pr, pb, pl, w, h, miw, maw, mih, mah, bg, opacity } = props;
  return useMemo(
    () =>
      resolveStyleProps(
        { m, mx, my, mt, mr, mb, ml, p, px, py, pt, pr, pb, pl, w, h, miw, maw, mih, mah, bg, opacity },
        theme
      ),
    [theme, m, mx, my, mt, mr, mb, ml, p, px, py, pt, pr, pb, pl, w, h, miw, maw, mih, mah, bg, opacity]
  );
}

/**
 * Splits the style props off a props object.
 *
 * Visibility props (`lightHidden`, …) are NOT extracted: they stay in
 * `otherProps`. They are handled by the component factory / `useVisibility`,
 * which strips them before the component renders.
 *
 * A component that gives one of these names its own meaning (Popover's
 * `w="target"`, say) destructures it BEFORE calling this, so it never reaches
 * the root style.
 */
export function extractStyleProps<T extends StyleProps>(
  props: T
): { styleProps: StyleProps; otherProps: Omit<T, keyof StyleProps> } {
  const {
    m, mx, my, mt, mr, mb, ml,
    p, px, py, pt, pr, pb, pl,
    w, h, miw, maw, mih, mah, bg, opacity,
    ...otherProps
  } = props;

  const styleProps: StyleProps = {
    m, mx, my, mt, mr, mb, ml,
    p, px, py, pt, pr, pb, pl,
    w, h, miw, maw, mih, mah, bg, opacity,
  };

  return { styleProps, otherProps };
}

/** @internal every style prop name, for prop filtering. */
export const STYLE_PROP_KEYS: readonly (keyof StyleProps)[] = STYLE_KEYS;
