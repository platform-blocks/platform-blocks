import React, { createContext, useContext, useMemo } from 'react';
import { resolveNumberFormatter, type NumberFormat } from '../utils';
import { paletteDefaultDark, paletteDefaultLight } from '../colors';

/**
 * Optional bridge interface to inject theme values from host design system
 */
export interface HostThemeBridge {
  /** Primary text color */
  textPrimary?: string;
  /** Secondary text color */
  textSecondary?: string;
  /** Background color */
  background?: string;
  /** Grid line color */
  grid?: string;
  /** Array of accent colors for data visualization */
  accentPalette?: string[];
  /** Font family */
  fontFamily?: string;
}

/**
 * Chart theme configuration
 */
export interface ChartTheme {
  /** Color values used across charts */
  colors: {
    /** Primary text color */
    textPrimary: string;
    /** Secondary text color */
    textSecondary: string;
    /** Background color */
    background: string;
    /** Grid line color */
    grid: string;
    /** Palette of colors for data series */
    accentPalette: string[];
  };
  /** Font size scale */
  fontSize: { xs: number; sm: number; md: number; lg: number };
  /** Border radius for chart elements */
  radius: number;
  /** Font family */
  fontFamily?: string;
  /**
   * How axis ticks and value labels render numbers when a chart has no
   * formatter of its own. Defaults to `'compact'` (9000 → "9K"); pass `'full'`
   * for grouped digits (9,000). Tooltips always show full values.
   */
  numberFormat?: NumberFormat;
}

/**
 * Default categorical series palettes. The steps and their validation notes live in
 * `colors.ts`; these names are what the provider picks between by surface.
 */
export const DEFAULT_ACCENT_PALETTE_LIGHT = paletteDefaultLight;
export const DEFAULT_ACCENT_PALETTE_DARK = paletteDefaultDark;

/** Relative luminance, used only to decide which default palette a surface wants. */
const surfaceIsDark = (background: string | undefined): boolean => {
  if (!background || background[0] !== '#') return false;
  const hex = background.length === 4
    ? background.slice(1).split('').map((c) => c + c).join('')
    : background.slice(1, 7);
  if (hex.length !== 6) return false;
  const channel = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4) < 0.35;
};

const defaultTheme: ChartTheme = {
  colors: {
    textPrimary: '#111', // will be overridden by host when provided
    textSecondary: '#555',
    background: '#ffffff',
    grid: '#e3e3e3',
    accentPalette: DEFAULT_ACCENT_PALETTE_LIGHT,
  },
  fontSize: { xs: 10, sm: 12, md: 14, lg: 16 },
  radius: 4,
  fontFamily: 'System',
  numberFormat: 'compact',
};

const ChartThemeCtx = createContext<ChartTheme>(defaultTheme);
// True below any ChartThemeProvider, so a nested provider knows it has a parent.
const ChartThemeNestedCtx = createContext(false);

/** Theme overrides — every field optional, including those inside `colors` and `fontSize`. */
export type ChartThemeOverrides = Omit<Partial<ChartTheme>, 'colors' | 'fontSize'> & {
  colors?: Partial<ChartTheme['colors']>;
  fontSize?: Partial<ChartTheme['fontSize']>;
};

/**
 * Provider component for chart theming.
 *
 * The outermost provider sets the app-wide chart theme. A nested provider
 * re-themes only its subtree: it starts from the parent's theme and overrides
 * just what it is given — e.g. `value={{ colors: { accentPalette: brand } }}`.
 * @param value - Partial theme overrides
 * @param hostThemeBridge - Optional bridge to host design system theme
 * @param children - Child components to render
 */
export const ChartThemeProvider: React.FC<{ value?: ChartThemeOverrides; hostThemeBridge?: HostThemeBridge; children: React.ReactNode }> = ({ value, hostThemeBridge, children }) => {
  const parentTheme = useContext(ChartThemeCtx);
  const nested = useContext(ChartThemeNestedCtx);
  const base = nested ? parentTheme : defaultTheme;
  // A host that supplies a dark surface but no palette of its own gets the dark-surface
  // default, not the light one — the light steps wash out to ~2:1 against a dark
  // background. An explicit accentPalette always wins. A nested provider keeps its
  // parent's palette unless it passes its own.
  const resolvedBackground = hostThemeBridge?.background ?? value?.colors?.background ?? base.colors.background;
  const defaultPalette = nested
    ? base.colors.accentPalette
    : surfaceIsDark(resolvedBackground)
      ? DEFAULT_ACCENT_PALETTE_DARK
      : DEFAULT_ACCENT_PALETTE_LIGHT;
  const merged: ChartTheme = {
    ...base,
    ...value,
    colors: {
      ...base.colors,
      accentPalette: defaultPalette,
      ...(value?.colors || {}),
      ...(hostThemeBridge ? {
        textPrimary: hostThemeBridge.textPrimary ?? base.colors.textPrimary,
        textSecondary: hostThemeBridge.textSecondary ?? base.colors.textSecondary,
        background: hostThemeBridge.background ?? base.colors.background,
        grid: hostThemeBridge.grid ?? base.colors.grid,
        accentPalette: hostThemeBridge.accentPalette ?? value?.colors?.accentPalette ?? defaultPalette,
      } : {})
    },
    fontSize: { ...base.fontSize, ...(value?.fontSize || {}) },
    fontFamily: hostThemeBridge?.fontFamily || value?.fontFamily || base.fontFamily,
  };
  const palette = Array.isArray(merged.colors?.accentPalette) && merged.colors.accentPalette.length
    ? merged.colors.accentPalette
    : defaultTheme.colors.accentPalette;
  // Charts index straight into the palette, so an empty one falls back to the default.
  merged.colors.accentPalette = palette;
  return (
    <ChartThemeNestedCtx.Provider value>
      <ChartThemeCtx.Provider value={merged}>{children}</ChartThemeCtx.Provider>
    </ChartThemeNestedCtx.Provider>
  );
};

/**
 * Hook to access the current chart theme
 * @returns Current chart theme configuration
 */
export function useChartTheme() {
  return useContext(ChartThemeCtx);
}

/**
 * Formatter for a single value (data label, center value) per the theme's
 * `numberFormat`; `fallback` renders numbers that aren't abbreviated (see
 * `resolveNumberFormatter`). Axes should use `createTickFormatter` with their
 * ticks instead.
 */
export function useNumberFormatter(fallback?: (value: number) => string) {
  const { numberFormat } = useChartTheme();
  return useMemo(() => resolveNumberFormatter(numberFormat, fallback), [numberFormat, fallback]);
}

/**
 * Convenience hook for host integration (expects a host design system theme object)
 * @param host - Host design system theme object
 * @returns Chart theme derived from host theme
 */
export function useHostChartTheme(host: { text?: { primary?: string; secondary?: string }; backgrounds?: { surface?: string }; colors?: { gray?: string[]; primary?: string[] } } | null | undefined) {
  if (!host) return defaultTheme;
  const background = host.backgrounds?.surface || defaultTheme.colors.background;
  const defaultPalette = surfaceIsDark(background)
    ? DEFAULT_ACCENT_PALETTE_DARK
    : DEFAULT_ACCENT_PALETTE_LIGHT;
  return {
    colors: {
      ...defaultTheme.colors,
      textPrimary: host.text?.primary || defaultTheme.colors.textPrimary,
      textSecondary: host.text?.secondary || defaultTheme.colors.textSecondary,
      background,
      grid: host.colors?.gray?.[3] || defaultTheme.colors.grid,
      accentPalette: host.colors?.primary || defaultPalette,
    },
    fontSize: defaultTheme.fontSize,
    radius: defaultTheme.radius,
    fontFamily: (host as any).fontFamily || defaultTheme.fontFamily,
  } as ChartTheme;
}
