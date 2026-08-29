import { Platform } from 'react-native';

import type { Breakpoint, ResponsiveSize } from './types';
import { BREAKPOINT_VALUES } from './hooks/useBreakpoint';
import { resolveResponsiveValue } from './hooks/useResponsiveValue';

/**
 * Shell geometry as CSS custom properties, for statically rendered web apps.
 *
 * A prerender has no viewport. Every breakpoint hook therefore has to guess,
 * and whatever it guesses is wrong for most readers: the static HTML ships one
 * layout and the client swaps to another on hydration, which costs a full-page
 * layout shift and — where the guess reaches the markup rather than just a
 * number — a hydration mismatch that throws the prerendered tree away.
 *
 * The colors in this library already solved the same problem: they resolve
 * through `var(--platform-blocks-…)` so one `@media` block restyles the static
 * page before any JavaScript runs (see `core/theme/cssVariableTheme.ts`). This
 * is that trick applied to layout. `createAppShellCss` emits the shell's
 * geometry for every breakpoint as media queries; `AppShell cssGeometry` emits
 * `var()` references instead of resolved numbers. The browser then answers the
 * question the prerender could not, at first paint, and the client's first
 * render emits the identical string — so there is nothing to shift and nothing
 * to mismatch.
 *
 * Opt-in per app, because it is a contract: an app that turns `cssGeometry` on
 * must inline the stylesheet this module builds, and the two must be built from
 * the same config. Apps that don't are untouched.
 */

/** Custom properties the shell reads. Stable names — apps inline them. */
export const APP_SHELL_CSS_VARS = {
  /** Header height, and so the top of the content area. */
  headerHeight: '--pb-shell-header-h',
  /** Horizontal space reserved for the navbar: 0 where it is a drawer. */
  navbarWidth: '--pb-shell-navbar-w',
  /** Bottom of the content area — the footer, or the bottom nav where one replaces it. */
  contentBottom: '--pb-shell-content-bottom',
} as const;

export type AppShellCssVar = keyof typeof APP_SHELL_CSS_VARS;

/**
 * The geometry an app has to describe twice — once for the running shell, once
 * for the stylesheet — so both are derived from this one shape instead.
 */
export interface AppShellCssConfig {
  /** Header height per breakpoint, as passed to `AppShell header={{ height }}`. */
  headerHeight?: ResponsiveSize;
  /** Footer height per breakpoint. */
  footerHeight?: ResponsiveSize;
  /** Bottom nav height per breakpoint. Replaces the footer where it shows. */
  bottomNavHeight?: ResponsiveSize;
  /** Whether the bottom nav only shows at mobile widths. @default true */
  bottomNavMobileOnly?: boolean;
  /** Expanded navbar width per breakpoint. */
  navbarWidth?: ResponsiveSize;
  /** Width of the collapsed rail. */
  navbarCollapsedWidth?: number;
  /** Whether the rail starts collapsed on desktop. */
  navbarStartCollapsed?: boolean;
  /** Breakpoint at which the rail auto-expands to its full width. */
  navbarAutoExpandBreakpoint?: Breakpoint;
  /**
   * Widest breakpoint still treated as mobile, where the navbar is a drawer and
   * reserves no space. Mirrors the shell's own `breakpoint === 'xs' || 'sm'`.
   * @default 'sm'
   */
  mobileUpTo?: Breakpoint;
}

const ORDER: Breakpoint[] = ['base', 'xs', 'sm', 'md', 'lg', 'xl'];

const atLeast = (current: Breakpoint, target?: Breakpoint): boolean => {
  if (!target) return false;
  const ci = ORDER.indexOf(current);
  const ti = ORDER.indexOf(target);
  return ci !== -1 && ti !== -1 && ci >= ti;
};

/** The breakpoint one step above `bp`, saturating at the top of the scale. */
const nextBreakpoint = (bp: Breakpoint): Breakpoint =>
  ORDER[Math.min(ORDER.indexOf(bp) + 1, ORDER.length - 1)];

/**
 * Space the navbar reserves at one breakpoint.
 *
 * The single source of truth for the rule, called by the running shell for the
 * current breakpoint and by the generator below for every breakpoint — the two
 * cannot disagree, which is the whole point of putting it here.
 */
export const resolveNavbarReservedWidth = (
  breakpoint: Breakpoint,
  config: AppShellCssConfig
): number => {
  if (config.navbarWidth == null) return 0;
  if (isMobileBreakpoint(breakpoint, config)) return 0; // drawer: overlays, reserves nothing
  const expanded = resolveResponsiveValue(config.navbarWidth, breakpoint);
  const collapsed = config.navbarCollapsedWidth ?? 72;
  if (atLeast(breakpoint, config.navbarAutoExpandBreakpoint)) return expanded;
  return config.navbarStartCollapsed === false ? expanded : collapsed;
};

/** Whether `breakpoint` is one the shell treats as mobile. */
export const isMobileBreakpoint = (
  breakpoint: Breakpoint,
  config: Pick<AppShellCssConfig, 'mobileUpTo'> = {}
): boolean => !atLeast(breakpoint, nextBreakpoint(config.mobileUpTo ?? 'sm'));

/**
 * Bottom of the content area at one breakpoint: the bottom nav where it shows,
 * the footer otherwise — the same either/or the shell makes at runtime.
 */
export const resolveContentBottom = (
  breakpoint: Breakpoint,
  config: AppShellCssConfig
): number => {
  const mobile = isMobileBreakpoint(breakpoint, config);
  const showsBottomNav =
    config.bottomNavHeight != null && (mobile || config.bottomNavMobileOnly === false);
  if (showsBottomNav) return resolveResponsiveValue(config.bottomNavHeight!, breakpoint);
  return config.footerHeight == null ? 0 : resolveResponsiveValue(config.footerHeight, breakpoint);
};

/**
 * A `var()` reference the prerender and the client both emit verbatim.
 *
 * The fallback has to be viewport-independent or it reintroduces the mismatch
 * it exists to prevent — so it is the config's `base` value, which is what a
 * page with no stylesheet (and no viewport) should show anyway.
 */
export const appShellVar = (
  name: string,
  fallback: number
): number | string => (Platform.OS === 'web' ? `var(${name}, ${fallback}px)` : fallback);

/** `calc()` around a var, for geometry that adds a fixed offset to one. */
export const appShellVarPlus = (
  name: string,
  fallback: number,
  offset: number
): number | string => {
  if (Platform.OS !== 'web') return fallback + offset;
  if (offset === 0) return `var(${name}, ${fallback}px)`;
  return `calc(var(${name}, ${fallback}px) + ${offset}px)`;
};

const px = (value: number) => `${Math.round(value)}px`;

/**
 * The stylesheet that answers what the prerender could not.
 *
 * Inline the result in the document head — before first paint, and without
 * waiting on JS. Every breakpoint above `base` becomes one `min-width` block,
 * in ascending order, so the cascade resolves them exactly the way
 * `resolveResponsiveValue` walks the scale at runtime.
 */
export const createAppShellCss = (
  config: AppShellCssConfig,
  options: { selector?: string; transitionDuration?: number } = {}
): string => {
  const { selector = ':root', transitionDuration = 200 } = options;

  const varsFor = (breakpoint: Breakpoint): Record<string, string> => ({
    [APP_SHELL_CSS_VARS.headerHeight]: px(
      config.headerHeight == null ? 0 : resolveResponsiveValue(config.headerHeight, breakpoint)
    ),
    [APP_SHELL_CSS_VARS.contentBottom]: px(resolveContentBottom(breakpoint, config)),
    [APP_SHELL_CSS_VARS.navbarWidth]: px(resolveNavbarReservedWidth(breakpoint, config)),
  });

  const block = (rule: string, vars: Record<string, string>): string => {
    const body = Object.entries(vars)
      .map(([name, value]) => `  ${name}: ${value};`)
      .join('\n');
    return `${rule} {\n${body}\n}`;
  };

  const base = varsFor('base');
  const chunks = [block(selector, base)];

  let previous = base;
  for (const breakpoint of ORDER) {
    if (breakpoint === 'base') continue;
    const vars = varsFor(breakpoint);
    // Only what actually changed at this width — a block repeating the previous
    // values is noise in a stylesheet that ships in every document head.
    const changed = Object.fromEntries(
      Object.entries(vars).filter(([name, value]) => previous[name] !== value)
    );
    previous = vars;
    if (!Object.keys(changed).length) continue;
    chunks.push(
      `@media (min-width: ${BREAKPOINT_VALUES[breakpoint as keyof typeof BREAKPOINT_VALUES]}px) {\n${block(
        selector,
        changed
      )
        .split('\n')
        .map((line) => (line ? `  ${line}` : line))
        .join('\n')}\n}`
    );
  }

  // Below the mobile cutoff the rail reserves no width, but a zero-width box
  // still holds focusable rows. `visibility` takes them out of the tab order and
  // the accessibility tree without changing the markup — which is the one thing
  // that has to stay identical across viewports.
  const mobileCeiling = BREAKPOINT_VALUES[
    nextBreakpoint(config.mobileUpTo ?? 'sm') as keyof typeof BREAKPOINT_VALUES
  ];
  if (config.navbarWidth != null && mobileCeiling > 0) {
    chunks.push(
      `@media (max-width: ${mobileCeiling - 0.02}px) {\n  [data-pb-shell-navbar] {\n    visibility: hidden;\n  }\n}`
    );
  }

  // Both variants of anything the shell used to pick by breakpoint ship in the
  // markup, and these decide which one is shown. That is the trade a single
  // prerendered document forces: one tree for every viewport, and CSS — the only
  // thing that knows the viewport before JavaScript does — choosing from it.
  if (mobileCeiling > 0) {
    chunks.push(
      `@media (max-width: ${mobileCeiling - 0.02}px) {\n  [data-pb-shell-desktop-only] {\n    display: none !important;\n  }\n}`,
      `@media (min-width: ${mobileCeiling}px) {\n  [data-pb-shell-mobile-only] {\n    display: none !important;\n  }\n}`
    );
  }

  if (transitionDuration > 0) {
    // The rail's hover expansion moves the navbar and the content column
    // together, because both read the same variable. Transitioning the
    // variable's *consumers* is what makes that one animation rather than two
    // that have to be kept in step.
    chunks.push(
      `[data-pb-shell-navbar], [data-pb-shell-main] {\n  transition: width ${transitionDuration}ms ease, left ${transitionDuration}ms ease, right ${transitionDuration}ms ease;\n}`,
      `@media (prefers-reduced-motion: reduce) {\n  [data-pb-shell-navbar], [data-pb-shell-main] {\n    transition: none;\n  }\n}`
    );
  }

  return chunks.join('\n\n');
};
