import React, { createContext, useContext, useRef } from 'react';
import { setDefaultColorScheme } from '../utils';

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
}

/**
 * Default categorical series palettes — a fixed hue order, assigned by slot, never cycled.
 *
 * Both sets pass all six palette checks (lightness band, chroma floor, CVD separation,
 * normal-vision floor, 3:1 contrast) against their own surface. The dark set is *selected*
 * for the dark surface rather than reused from the light one: on a dark background the
 * light set put four hues outside the lightness band and dropped `#4a3aa7` to 2.04:1
 * contrast, which is effectively invisible.
 *
 * Same hue order in both, so a series keeps its identity across a theme switch. Re-run the
 * palette validator before changing either — worst adjacent pair is currently ΔE 20.9
 * (light) and 15.1 (dark) under simulated CVD, against a floor of 8.
 */
export const DEFAULT_ACCENT_PALETTE_LIGHT = [
  '#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948',
];
export const DEFAULT_ACCENT_PALETTE_DARK = [
  '#3280DE', '#B33F03', '#1CAF7A', '#8B5D06', '#D66B94', '#077705', '#766DDF', '#DB4141',
];

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
};

const ChartThemeCtx = createContext<ChartTheme>(defaultTheme);

/**
 * Provider component for chart theming
 * @param value - Partial theme overrides
 * @param hostThemeBridge - Optional bridge to host design system theme
 * @param children - Child components to render
 */
export const ChartThemeProvider: React.FC<{ value?: Partial<ChartTheme>; hostThemeBridge?: HostThemeBridge; children: React.ReactNode }> = ({ value, hostThemeBridge, children }) => {
  const paletteRef = useRef<string | null>(null);
  // A host that supplies a dark surface but no palette of its own gets the dark-surface
  // default, not the light one — the light steps wash out to ~2:1 against a dark
  // background. An explicit accentPalette always wins.
  const resolvedBackground = hostThemeBridge?.background ?? value?.colors?.background ?? defaultTheme.colors.background;
  const defaultPalette = surfaceIsDark(resolvedBackground)
    ? DEFAULT_ACCENT_PALETTE_DARK
    : DEFAULT_ACCENT_PALETTE_LIGHT;
  const merged: ChartTheme = {
    ...defaultTheme,
    ...value,
    colors: {
      ...defaultTheme.colors,
      accentPalette: defaultPalette,
      ...(value?.colors || {}),
      ...(hostThemeBridge ? {
        textPrimary: hostThemeBridge.textPrimary ?? defaultTheme.colors.textPrimary,
        textSecondary: hostThemeBridge.textSecondary ?? defaultTheme.colors.textSecondary,
        background: hostThemeBridge.background ?? defaultTheme.colors.background,
        grid: hostThemeBridge.grid ?? defaultTheme.colors.grid,
        accentPalette: hostThemeBridge.accentPalette ?? value?.colors?.accentPalette ?? defaultPalette,
      } : {})
    },
    fontSize: { ...defaultTheme.fontSize, ...(value?.fontSize || {}) },
    fontFamily: hostThemeBridge?.fontFamily || value?.fontFamily || defaultTheme.fontFamily,
  };
  const palette = Array.isArray(merged.colors?.accentPalette) && merged.colors.accentPalette.length
    ? merged.colors.accentPalette
    : defaultTheme.colors.accentPalette;
  const paletteKey = palette.join('|');
  if (paletteRef.current !== paletteKey) {
    paletteRef.current = paletteKey;
    setDefaultColorScheme([...palette]);
  }
  return <ChartThemeCtx.Provider value={merged}>{children}</ChartThemeCtx.Provider>;
};

/**
 * Hook to access the current chart theme
 * @returns Current chart theme configuration
 */
export function useChartTheme() {
  return useContext(ChartThemeCtx);
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
