import { DEFAULT_BREAKPOINTS, type Breakpoints, type ResponsiveProp } from '../../core/theme/breakpoints';

/**
 * The web half of `Grid`: its tracks, as CSS.
 *
 * `Grid` packs children into rows in JavaScript, which needs to know how many
 * columns there are, which needs the viewport. A static render has no viewport,
 * so the prerendered page came out with one row structure and the hydrating
 * client built another — a different number of DOM nodes, which React answers
 * by throwing the tree away and rebuilding it.
 *
 * On web the packing is therefore the browser's job. Every child is emitted as
 * a flat cell, and wrapping plus track width come from one custom property the
 * cells inherit from their grid. That leaves the markup identical at every
 * width, with only the CSS varying — which is the only part of a static page
 * that is allowed to.
 */

/** Set on the grid, read by its cells. */
const COLUMNS_VAR = '--pb-grid-cols';

const ORDER: (keyof Breakpoints)[] = ['base', 'sm', 'md', 'lg', 'xl'];

/** Stable, content-derived name: identical grids share one rule, and the server
 *  and the client arrive at the same one without having to coordinate. */
const digest = (input: string): string => {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
};

const asMap = <T,>(value: ResponsiveProp<T> | undefined): Partial<Record<keyof Breakpoints, T>> => {
  if (value === undefined) return {};
  if (value === null || typeof value !== 'object') return { base: value as T };
  return value as Partial<Record<keyof Breakpoints, T>>;
};

/**
 * Walks the scale the way `resolveResponsiveProp` does at runtime, so a value
 * declared only at `md` still applies at `lg` and `xl`.
 */
const filled = <T,>(
  value: ResponsiveProp<T> | undefined,
  fallback: T
): Record<keyof Breakpoints, T> => {
  const map = asMap(value);
  const out = {} as Record<keyof Breakpoints, T>;
  let current = map.base ?? fallback;
  for (const key of ORDER) {
    if (map[key] !== undefined) current = map[key] as T;
    out[key] = current;
  }
  return out;
};

/** Emits `rule` at `base`, then only where the value actually changes. */
const responsiveRules = (
  selector: string,
  values: Record<keyof Breakpoints, string>,
  breakpoints: Breakpoints
): string => {
  const chunks: string[] = [`${selector}{${values.base}}`];
  let previous = values.base;
  for (const key of ORDER) {
    if (key === 'base') continue;
    if (values[key] === previous) continue;
    previous = values[key];
    chunks.push(`@media (min-width:${breakpoints[key]}px){${selector}{${values[key]}}}`);
  }
  return chunks.join('');
};

export interface GridWebStyles {
  /** Value for the grid's `data-pb-grid` attribute, and the rule's key. */
  name: string;
  css: string;
}

/** The grid itself: how many tracks, at each width. */
export const gridColumnsCss = (
  columns: ResponsiveProp<number> | undefined,
  breakpoints: Breakpoints = DEFAULT_BREAKPOINTS
): GridWebStyles => {
  const perBreakpoint = filled(columns, 12);
  const name = `c${digest(ORDER.map((k) => perBreakpoint[k]).join(','))}`;
  const values = {} as Record<keyof Breakpoints, string>;
  for (const key of ORDER) {
    values[key] = `${COLUMNS_VAR}:${Math.max(1, Math.round(perBreakpoint[key]))}`;
  }
  return { name, css: responsiveRules(`[data-pb-grid="${name}"]`, values, breakpoints) };
};

/**
 * One cell: the width of `span` tracks plus the gaps between them.
 *
 * `flex-basis` rather than a grow ratio, because the ratio only splits what is
 * left after the gaps and a row of mixed spans then lands off the tracks the
 * row above used. The column count arrives through the inherited variable, so
 * this expression is the same string at every width.
 */
export const gridCellCss = (
  span: ResponsiveProp<number> | undefined,
  columnGap: number,
  breakpoints: Breakpoints = DEFAULT_BREAKPOINTS
): GridWebStyles => {
  const perBreakpoint = filled(span, 1);
  const name = `i${digest(`${ORDER.map((k) => perBreakpoint[k]).join(',')}|${columnGap}`)}`;
  const basis = (n: number) => {
    const s = Math.max(1, Math.round(n));
    const track = `(100% - (var(${COLUMNS_VAR},1) - 1) * ${columnGap}px) / var(${COLUMNS_VAR},1)`;
    return `flex-basis:calc(${track} * ${s}${s > 1 ? ` + ${(s - 1) * columnGap}px` : ''})`;
  };
  const values = {} as Record<keyof Breakpoints, string>;
  for (const key of ORDER) {
    values[key] = basis(perBreakpoint[key]);
  }
  // The selector is doubled on purpose. react-native-web gives every `View` a
  // class carrying `flex-basis: auto`, and its stylesheet is injected after the
  // ones React hoists — equal specificity, and later wins. Repeating the
  // attribute outranks the class without reaching for `!important`.
  return {
    name,
    css: responsiveRules(`[data-pb-grid-cell="${name}"][data-pb-grid-cell="${name}"]`, values, breakpoints),
  };
};
