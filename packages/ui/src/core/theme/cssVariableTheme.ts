import { Platform } from 'react-native';

import type { PlocksTheme, SurfaceLevel, SurfaceScale } from './types';

/**
 * The ONE CSS-variable generator and naming scheme (prefix `--plocks-`):
 *
 * - palettes     `--plocks-palette-<name>-<i>`
 * - text         `--plocks-text-<token>`      (kebab-case: `text-on-primary`)
 * - backgrounds  `--plocks-bg-<token>`        (`bg-base` … `bg-border`, `bg-border-strong`, `bg-hover`, …)
 * - surfaces     `--plocks-surface-<level>-background|border`
 * - states       `--plocks-focus-ring`, `-text-selection`, `-highlight-text`, `-highlight-background`
 * - shell chrome `--plocks-shell-*`
 * - scales       `--plocks-font-size-*`, `-spacing-*`, `-radius-*`, `-shadow-*`,
 *                `-breakpoint-*`, `-z-<layer>`, `-control-height-<size>`
 *
 * `themeColorVariables` is the scheme-dependent subset (used per scheme by
 * `createThemeColorVariablesCss`); `themeCssVariables` is everything
 * (`CSSVariables` injects it). Both read LITERAL colors, so a theme already
 * rewritten by `withCssVariableColors` never produces `--x: var(--x, …)` cycles.
 */

/**
 * Routes the scheme-dependent color tokens through CSS custom properties.
 *
 * Static rendering happens once, in Node, with no reader and no color scheme —
 * so a prerendered page bakes one scheme's literal hex into every inline style
 * and can only be corrected by hydrating. Apps have papered over that by hiding
 * the markup until React takes over, which trades a wrong-theme flash for a
 * blank screen and loses both races on a slow connection.
 *
 * Emitting `var(--plocks-…, <hex>)` instead lets the cascade answer the
 * question the prerender could not: one `@media (prefers-color-scheme: dark)`
 * block restyles the whole static page before any JavaScript runs. The literal
 * stays in the `var()` fallback, so markup renders identically in apps that
 * never define the variables — including native, where this is a no-op.
 *
 * Only `text`, `backgrounds` and `surfaces` are rewritten. Palettes
 * (`theme.colors.*`) stay literal on purpose: the variant system measures
 * contrast against them (see `variantRoles.ts`), and `var(--x)` has no
 * luminance. Anything that has to *measure* a rewritten token reads the
 * original through {@link literalText} / {@link literalBackgrounds}.
 */

const TEXT_TOKENS = ['primary', 'secondary', 'muted', 'disabled', 'link', 'onPrimary'] as const;
const BACKGROUND_TOKENS = [
  'base',
  'subtle',
  'surface',
  'elevated',
  'border',
  'borderStrong',
  'hover',
  'pressed',
  'selected',
  'disabled',
  'mark',
  'scrim',
] as const;
const STATE_VAR_NAMES = {
  focusRing: '--plocks-focus-ring',
  textSelection: '--plocks-text-selection',
  highlightText: '--plocks-highlight-text',
  highlightBackground: '--plocks-highlight-background',
} as const;
const SURFACE_LEVELS: readonly SurfaceLevel[] = [0, 1, 2, 3];
const SURFACE_PARTS = ['background', 'border'] as const;

const kebab = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const backgroundVarName = (token: (typeof BACKGROUND_TOKENS)[number]) => `--plocks-bg-${kebab(token)}`;

const textVarName = (token: (typeof TEXT_TOKENS)[number]) => `--plocks-text-${kebab(token)}`;

const surfaceVarName = (level: SurfaceLevel, part: (typeof SURFACE_PARTS)[number]) =>
  `--plocks-surface-${level}-${part}`;

/**
 * The app shell's chrome, which the palette rewrite above cannot reach.
 *
 * `theme.colors.*` stays literal on purpose (see the note at the top of this
 * file), but AppShell dresses its header, navbar, aside, toc and footer out of
 * the gray ramp behind a `theme.colorScheme` branch — and a branch is resolved
 * in Node at prerender, where the scheme is always light. That baked one light
 * hex per chrome surface into the static markup and left the shell flashing
 * light until hydration re-ran the branch, while the rest of the page was
 * already dark from the first paint.
 *
 * Publishing just the handful of steps the shell uses puts the branch back
 * where the cascade can answer it, without turning the palette itself into
 * `var()` references the contrast math in `variantRoles.ts` could not measure.
 */
export type ShellChromeToken =
  | 'background'
  | 'border'
  | 'canvas'
  | 'veil'
  | 'veilStrong'
  | 'navActive';

export type ShellChromeColors = Record<ShellChromeToken, string>;

/**
 * Only the chrome a *web* shell paints gets a variable. `veilStrong` is the
 * opaque fallback the translucent bottom bar uses where there is no backdrop
 * filter — a native-only branch, and native resolves this whole module to
 * literals — so publishing it would put a rule in every document head that no
 * selector can ever read.
 */
const SHELL_CHROME_VAR_NAMES: Partial<Record<ShellChromeToken, string>> = {
  background: '--plocks-shell-chrome-bg',
  border: '--plocks-shell-chrome-border',
  canvas: '--plocks-shell-canvas-bg',
  veil: '--plocks-shell-chrome-veil',
  navActive: '--plocks-shell-nav-active-bg',
};

const reference = (name: string, fallback: string) => `var(${name}, ${fallback})`;

/**
 * The shell's chrome for one scheme, as literal colors.
 *
 * The rules are AppShell's own, lifted verbatim: chrome sits one step off the
 * page (the ramps run in opposite directions, so that is `gray[1]` in dark and
 * `gray[0]` in light), its hairline one step further, and the canvas behind it
 * is `gray[0]` in both. Kept here rather than in the component because the
 * stylesheet and the running shell have to agree on them.
 */
export const shellChromeColors = (theme: PlocksTheme): ShellChromeColors => {
  const gray = theme.colors?.gray ?? [];
  const primary = theme.colors?.primary ?? [];
  const dark = theme.colorScheme === 'dark';

  return {
    background: dark ? gray[1] : gray[0],
    border: dark ? gray[2] : gray[1],
    canvas: gray[0],
    veil: dark ? 'rgba(20,20,22,0.55)' : 'rgba(255,255,255,0.6)',
    veilStrong: dark ? 'rgba(20,20,22,0.75)' : 'rgba(255,255,255,0.82)',
    navActive: dark ? primary[8] : primary[0],
  };
};

/**
 * The same chrome as `var()` references, for the shell to render.
 *
 * Gated on `literalColors` — the marker `withCssVariableColors` leaves behind —
 * so the shell follows the cascade exactly where the rest of the theme does.
 * An app that has not opted into CSS-variable colors keeps literals, and so
 * does native, where `var()` means nothing.
 */
export const shellChrome = (theme: PlocksTheme): ShellChromeColors => {
  const literal = shellChromeColors(theme);
  if (Platform.OS !== 'web' || !theme.literalColors) return literal;

  const referenced = { ...literal };
  for (const [token, name] of Object.entries(SHELL_CHROME_VAR_NAMES) as [ShellChromeToken, string][]) {
    const value = literal[token];
    if (value) referenced[token] = reference(name, value);
  }
  return referenced;
};

/**
 * Every scheme-dependent color variable, resolved against `theme` (literal
 * colors — see `literalText` & co.). Feed one theme in per scheme to build the
 * light and dark blocks.
 */
export const themeColorVariables = (theme: PlocksTheme): Record<string, string> => {
  const variables: Record<string, string> = {};
  const text = literalText(theme);
  const backgrounds = literalBackgrounds(theme);
  const surfaces = literalSurfaces(theme);

  for (const token of TEXT_TOKENS) {
    const value = text?.[token];
    if (value) variables[textVarName(token)] = value;
  }

  for (const token of BACKGROUND_TOKENS) {
    const value = backgrounds?.[token];
    if (value) variables[backgroundVarName(token)] = value;
  }

  for (const [token, name] of Object.entries(STATE_VAR_NAMES) as [keyof typeof STATE_VAR_NAMES, string][]) {
    const value = theme.states?.[token];
    if (value) variables[name] = value;
  }

  for (const level of SURFACE_LEVELS) {
    const surface = surfaces?.[level];
    if (!surface) continue;
    for (const part of SURFACE_PARTS) {
      const value = surface[part];
      if (value) variables[surfaceVarName(level, part)] = value;
    }
  }

  // Publish indexed palettes for components whose computed inline styles use
  // literal shades, so the browser can resolve the active scheme before hydration.
  Object.entries(theme.colors ?? {}).forEach(([palette, shades]) => {
    shades.forEach((value, index) => {
      variables[`--plocks-palette-${palette}-${index}`] = value;
    });
  });

  const chrome = shellChromeColors(theme);
  for (const [token, name] of Object.entries(SHELL_CHROME_VAR_NAMES) as [ShellChromeToken, string][]) {
    const value = chrome[token];
    if (value) variables[name] = value;
  }

  return variables;
};

const scaleVariables = (
  prefix: string,
  scale: Record<string, string | number> | undefined,
  out: Record<string, string>,
  unit = ''
) => {
  if (!scale) return;
  for (const [key, value] of Object.entries(scale)) {
    if (value === undefined || value === null) continue;
    out[`--plocks-${prefix}-${key}`] = typeof value === 'number' ? `${value}${unit}` : String(value);
  }
};

/**
 * Every CSS variable for `theme`: the scheme-dependent colors
 * (`themeColorVariables`) plus fonts, scales, z-indices and control heights.
 * This is what `CSSVariables` injects.
 */
export const themeCssVariables = (theme: PlocksTheme): Record<string, string> => {
  const variables: Record<string, string> = {
    '--plocks-color-scheme': theme.colorScheme,
    '--plocks-primary-color': theme.primaryColor,
  };
  if (theme.fontFamily) variables['--plocks-font-family'] = theme.fontFamily;
  if (theme.fontFamilyMono) variables['--plocks-font-family-mono'] = theme.fontFamilyMono;

  Object.assign(variables, themeColorVariables(theme));

  scaleVariables('font-size', theme.fontSizes, variables);
  scaleVariables('spacing', theme.spacing, variables);
  scaleVariables('radius', theme.radii, variables);
  scaleVariables('shadow', theme.shadows, variables);
  scaleVariables('breakpoint', theme.breakpoints, variables);
  scaleVariables('z', theme.zIndices as unknown as Record<string, number> | undefined, variables);
  if (theme.controlSizes) {
    for (const [size, metrics] of Object.entries(theme.controlSizes)) {
      if (metrics?.height !== undefined) variables[`--plocks-control-height-${size}`] = `${metrics.height}px`;
    }
  }
  return variables;
};

/** Serializes variables as one rule: `selector { --a: 1; … }`. */
export const cssVariablesRule = (selector: string, variables: Record<string, string>): string => {
  const body = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return body ? `${selector} {\n${body}\n}` : '';
};

export interface ThemeColorVariablesCssOptions {
  /** Class stamped on the root element when the reader has chosen light explicitly. */
  lightClass?: string;
  /** Class stamped on the root element when the reader has chosen dark explicitly. */
  darkClass?: string;
  /** Element the variables are defined on. */
  selector?: string;
}

/**
 * A stylesheet defining the color variables for both schemes.
 *
 * Order matters: the OS preference is applied inside a media query that a
 * `lightClass` opts out of, and the explicit classes come last so a stored
 * choice outranks the OS in both directions. Inline this in the document head
 * of a statically rendered app — before first paint, and without waiting on JS.
 */
export const createThemeColorVariablesCss = (
  lightTheme: PlocksTheme,
  darkTheme: PlocksTheme,
  options: ThemeColorVariablesCssOptions = {},
): string => {
  const {
    lightClass = 'plocks-light',
    darkClass = 'plocks-dark',
    selector = ':root',
  } = options;

  const block = cssVariablesRule;

  const light = themeColorVariables(lightTheme);
  const dark = themeColorVariables(darkTheme);

  return [
    block(selector, light),
    `@media (prefers-color-scheme: dark) {\n${block(`${selector}:not(.${lightClass})`, dark)
      .split('\n')
      .map((line) => (line ? `  ${line}` : line))
      .join('\n')}\n}`,
    block(`${selector}.${darkClass}`, dark),
    block(`${selector}.${lightClass}`, light),
  ]
    .filter(Boolean)
    .join('\n\n');
};

/**
 * Rewrites `text`, `backgrounds` and `surfaces` to `var()` references, keeping
 * the originals on `literalColors` for code that measures color.
 *
 * A no-op off the web, where CSS variables do not exist. Calling it twice is
 * also a no-op — the already-rewritten theme is returned untouched.
 */
export const withCssVariableColors = <T extends PlocksTheme>(theme: T): T => {
  if (Platform.OS !== 'web' || theme.literalColors) return theme;

  const text = { ...theme.text };
  for (const token of TEXT_TOKENS) {
    const value = theme.text?.[token];
    if (value) text[token] = reference(textVarName(token), value);
  }

  const backgrounds = { ...theme.backgrounds };
  for (const token of BACKGROUND_TOKENS) {
    const value = theme.backgrounds?.[token];
    if (value) backgrounds[token] = reference(backgroundVarName(token), value);
  }

  let surfaces: SurfaceScale | undefined;
  if (theme.surfaces) {
    surfaces = { ...theme.surfaces };
    for (const level of SURFACE_LEVELS) {
      const surface = theme.surfaces[level];
      if (!surface) continue;
      surfaces[level] = {
        ...surface,
        background: surface.background
          ? reference(surfaceVarName(level, 'background'), surface.background)
          : surface.background,
        border: surface.border
          ? reference(surfaceVarName(level, 'border'), surface.border)
          : surface.border,
      };
    }
  }

  return {
    ...theme,
    text,
    backgrounds,
    ...(surfaces ? { surfaces } : {}),
    literalColors: {
      text: theme.text,
      backgrounds: theme.backgrounds,
      ...(theme.surfaces ? { surfaces: theme.surfaces } : {}),
    },
  };
};

/** Text tokens as literal colors — safe to measure, and safe outside CSS. */
export const literalText = (theme: PlocksTheme): PlocksTheme['text'] =>
  theme.literalColors?.text ?? theme.text;

/** Background tokens as literal colors — safe to measure, and safe outside CSS. */
export const literalBackgrounds = (theme: PlocksTheme): PlocksTheme['backgrounds'] =>
  theme.literalColors?.backgrounds ?? theme.backgrounds;

/** Surface tokens as literal colors — safe to measure, and safe outside CSS. */
export const literalSurfaces = (theme: PlocksTheme): SurfaceScale | undefined =>
  theme.literalColors?.surfaces ?? theme.surfaces;

/** Return a scheme-aware CSS color when a rendered color comes from a theme palette. */
export const themeColorForFirstPaint = (theme: PlocksTheme, value: string | undefined): string | undefined => {
  if (Platform.OS !== 'web' || !value || value === 'transparent') return value;

  const rgba = value.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i);
  const rgb = rgba ? rgba.slice(1, 4).map(Number) : null;
  for (const [palette, shades] of Object.entries(theme.colors ?? {})) {
    const index = shades.findIndex((shade) => {
      if (!rgba) return shade.toLowerCase() === value.toLowerCase();
      const hex = shade.replace(/^#/, '');
      if (!/^[\da-f]{6}$/i.test(hex)) return false;
      return [0, 2, 4].every((offset, channel) => parseInt(hex.slice(offset, offset + 2), 16) === rgb?.[channel]);
    });
    if (index >= 0) {
      const reference = `var(--plocks-palette-${palette}-${index}, ${shades[index]})`;
      return rgba
        ? `color-mix(in srgb, ${reference} ${Number(rgba[4]) * 100}%, transparent)`
        : reference;
    }
  }
  return value;
};
