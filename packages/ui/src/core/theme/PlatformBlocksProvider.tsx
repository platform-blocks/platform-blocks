import React, { useMemo, useRef, useEffect } from 'react';

import { CSSVariables } from './CSSVariables';
import { withCssVariableColors } from './cssVariableTheme';
import { DARK_THEME } from './darkTheme';
import { DEFAULT_THEME } from './defaultTheme';
import { PlatformBlocksThemeProvider, PlatformBlocksThemeProviderProps } from './ThemeProvider';
import { useColorScheme, ColorScheme } from './useColorScheme';
import { OverlayProvider, OverlayRenderer, DirectionProvider } from '../providers';
import type { DirectionProviderProps } from '../providers';
import { BreakpointProvider } from '../responsive';
import { SpotlightController } from '../../components/Spotlight/SpotlightController';
import { I18nProvider } from '../i18n';
import { UniversalCSS } from '../utils/UniversalCSS';
import type { HighlightProps as HighlightComponentProps } from '../../components/Highlight';
import { HapticsProvider } from '../haptics/HapticsProvider';
import type { HapticsProviderProps } from '../haptics/HapticsProvider';
import {
  ThemeModeProvider,
  ThemeModeConfig,
  useOptionalColorScheme as useOptionalThemeModeColorScheme
} from './ThemeModeProvider';

interface ThemeBoundaryProps {
  theme: PlatformBlocksThemeProviderProps['theme'];
  inherit: boolean;
  withCSSVariables: boolean;
  cssVariablesSelector: string;
  withGlobalCSS: boolean;
  children: React.ReactNode;
}

/**
 * The dark theme used when the app doesn't supply one of its own.
 *
 * `DARK_THEME` is a complete theme, so it's spread wholesale rather than
 * cherry-picked. Copying individual keys silently left every scheme-dependent
 * group it forgot — `surfaces`, `states`, `semantic`, `shadows` — on their light
 * values, which is how dark-mode overlays ended up painting a white level-2
 * background under near-white text. `DEFAULT_THEME` still supplies anything the
 * dark theme doesn't define (e.g. `designTokens`).
 */
export const BUILT_IN_DARK_THEME = {
  ...DEFAULT_THEME,
  ...DARK_THEME,
  colorScheme: 'dark' as const,
};

const ThemeBoundary = React.memo<ThemeBoundaryProps>(function ThemeBoundary({
  theme,
  inherit,
  withCSSVariables,
  cssVariablesSelector,
  withGlobalCSS,
  children,
}) {
  return (
    <PlatformBlocksThemeProvider theme={theme} inherit={inherit}>
      {withCSSVariables && <CSSVariables selector={cssVariablesSelector} />}
      {withGlobalCSS && <UniversalCSS />}
      {children}
    </PlatformBlocksThemeProvider>
  );
});

interface OverlayBoundaryProps {
  enabled: boolean;
  children: React.ReactNode;
}

const OverlayBoundary = React.memo<OverlayBoundaryProps>(function OverlayBoundary({ enabled, children }) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <OverlayProvider>
      {children}
      <OverlayRenderer />
    </OverlayProvider>
  );
});

interface I18nBoundaryProps {
  locale: string;
  fallbackLocale: string;
  resources: NonNullable<PlatformBlocksProviderProps['i18nResources']>;
  children: React.ReactNode;
}

const I18nBoundary = React.memo<I18nBoundaryProps>(function I18nBoundary({ locale, fallbackLocale, resources, children }) {
  return (
    <I18nProvider initial={{ locale, fallbackLocale, resources }}>
      {children}
    </I18nProvider>
  );
});

type DirectionProviderConfig = Omit<DirectionProviderProps, 'children'>;
type HapticsProviderConfig = Omit<HapticsProviderProps, 'children'>;

export interface PlatformBlocksProviderProps extends Omit<PlatformBlocksThemeProviderProps, 'children'> {
  /** Your application */
  children: React.ReactNode;

  /** Whether to inject CSS variables */
  withCSSVariables?: boolean;

  /**
   * Render `text` / `backgrounds` / `surfaces` as CSS `var()` references instead
   * of literal colors (web only, opt-in).
   *
   * Pair it with `createThemeColorVariablesCss` inlined in the document head:
   * statically rendered markup then answers to `prefers-color-scheme` on its
   * own, so a prerendered page is already in the reader's scheme at first paint
   * rather than after hydration. Off by default — the rewritten values are CSS
   * strings, so anything that hands a theme color to a non-CSS consumer (SVG
   * attributes, Animated interpolation) has to read `literalColors` instead.
   */
  colorsAsCssVariables?: boolean;

  /** CSS selector where variables should be applied */
  cssVariablesSelector?: string;

  /**
   * Color scheme mode:
   * - 'auto': automatically follows OS preference
   * - 'light': force light mode
   * - 'dark': force dark mode
   */
  colorSchemeMode?: 'auto' | 'light' | 'dark';

  /** Whether to enable overlay system (menus, tooltips, etc.) */
  withOverlays?: boolean;

  /** Whether to inject global CSS for universal props (lightHidden/darkHidden) */
  withGlobalCSS?: boolean;

  /** Enhanced theme mode configuration */
  themeModeConfig?: ThemeModeConfig;

  /** Lazily mount Spotlight search UI at library level (opt-in) */
  withSpotlight?: boolean;
  /** Configure Spotlight behavior at provider level */
  spotlightConfig?: {
    shortcut?: string | string[] | null; // default ['cmd+k','ctrl+k']
    actions?: any[]; // optional initial actions; apps can still mount their own Spotlight if needed
    placeholder?: string;
    limit?: number;
    highlightQuery?: boolean | HighlightComponentProps['highlight'];
    /** Render Spotlight even when no actions provided (useful to inject later) */
    alwaysMount?: boolean;
  };

  /** i18n: initial active locale */
  locale?: string;
  /** i18n: fallback locale */
  fallbackLocale?: string;
  /** i18n: resources map */
  i18nResources?: Record<string, { translation: Record<string, any> }>;

  /** Direction context configuration (pass false to opt out) */
  direction?: false | DirectionProviderConfig;
  /** Haptics context configuration (pass false to opt out) */
  haptics?: false | HapticsProviderConfig;
}

/**
 * Internal component that uses the enhanced theme mode when config is provided
 */
function PlatformBlocksContent({
  children,
  theme,
  inherit = true,
  withCSSVariables = true,
  cssVariablesSelector = ':root',
  colorsAsCssVariables = false,
  colorSchemeMode = 'auto',
  withOverlays = true,
  withSpotlight = false,
  withGlobalCSS = true,
  spotlightConfig,
  themeModeConfig
}: Omit<PlatformBlocksProviderProps, 'locale' | 'fallbackLocale' | 'i18nResources' | 'direction' | 'haptics' | 'permissions'>) {
  const osColorScheme = useColorScheme();
  const optionalThemeModeColorScheme = useOptionalThemeModeColorScheme();
  
  // Use enhanced theme mode if available, otherwise fall back to colorSchemeMode
  const enhancedColorScheme = themeModeConfig ? optionalThemeModeColorScheme : null;
  const effectiveColorScheme = enhancedColorScheme || colorSchemeMode;
  
  // Cache light & dark theme objects once. If custom theme provided, bypass cache.
  const cachedThemesRef = useRef<{ light: any; dark: any } | null>(null);
  if (!cachedThemesRef.current && !theme) {
    cachedThemesRef.current = { light: DEFAULT_THEME, dark: BUILT_IN_DARK_THEME };
  }

  const resolvedTheme = useMemo(() => {
    const base = (() => {
      if (theme) return theme; // user supplied custom theme (assumed stable externally)
      const store = cachedThemesRef.current!;
      const target: ColorScheme = effectiveColorScheme === 'auto' ? osColorScheme : effectiveColorScheme;
      return target === 'dark' ? store.dark : store.light;
    })();
    return colorsAsCssVariables ? withCssVariableColors(base) : base;
  }, [theme, effectiveColorScheme, osColorScheme, colorsAsCssVariables]);

  // Set color scheme data attribute on root element (web only)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const target = effectiveColorScheme === 'auto' ? osColorScheme : effectiveColorScheme;
      document.documentElement.setAttribute('data-platform-blocks-color-scheme', target);
    }
  }, [effectiveColorScheme, osColorScheme]);

  const mainContent = (
    <ThemeBoundary
      theme={resolvedTheme}
      inherit={inherit}
      withCSSVariables={withCSSVariables}
      cssVariablesSelector={cssVariablesSelector}
      withGlobalCSS={withGlobalCSS}
    >
      <OverlayBoundary enabled={withOverlays}>
        {children}
        {withSpotlight && <SpotlightController config={spotlightConfig} />}
      </OverlayBoundary>
    </ThemeBoundary>
  );

  return mainContent;
}

/**
 * Main provider component for React UI Library library
 * Provides theme context and injects CSS variables
 */
export function PlatformBlocksProvider({
  children,
  theme,
  inherit = true,
  withCSSVariables = true,
  cssVariablesSelector = ':root',
  colorsAsCssVariables = false,
  colorSchemeMode = 'auto',
  withOverlays = true,
  withSpotlight = false,
  withGlobalCSS = true,
  themeModeConfig,
  spotlightConfig,
  locale = 'en',
  fallbackLocale = 'en',
  i18nResources,
  direction,
  haptics
}: PlatformBlocksProviderProps) {
  const i18nStore = useMemo(
    () => i18nResources || { en: { translation: {} } },
    [i18nResources]
  );

  const content = (
    <PlatformBlocksContent
      theme={theme}
      inherit={inherit}
      withCSSVariables={withCSSVariables}
      cssVariablesSelector={cssVariablesSelector}
      colorsAsCssVariables={colorsAsCssVariables}
      colorSchemeMode={colorSchemeMode}
      withOverlays={withOverlays}
      withSpotlight={withSpotlight}
      withGlobalCSS={withGlobalCSS}
      spotlightConfig={spotlightConfig}
      themeModeConfig={themeModeConfig}
    >
      {children}
    </PlatformBlocksContent>
  );

  const themedTree = themeModeConfig ? (
    <ThemeModeProvider config={themeModeConfig}>
      {content}
    </ThemeModeProvider>
  ) : (
    content
  );

  const directionConfig: DirectionProviderConfig | null = direction === false ? null : (direction ?? {});
  const hapticsConfig: HapticsProviderConfig | null = haptics === false ? null : (haptics ?? {});

  let enhancedTree = themedTree;

  if (hapticsConfig) {
    enhancedTree = (
      <HapticsProvider {...hapticsConfig}>
        {enhancedTree}
      </HapticsProvider>
    );
  }

  if (directionConfig) {
    enhancedTree = (
      <DirectionProvider {...directionConfig}>
        {enhancedTree}
      </DirectionProvider>
    );
  }

  return (
    <I18nBoundary
      locale={locale}
      fallbackLocale={fallbackLocale}
      resources={i18nStore}
    >
      <BreakpointProvider>
        {enhancedTree}
      </BreakpointProvider>
    </I18nBoundary>
  );
}

PlatformBlocksProvider.displayName = 'PlatformBlocksProvider';
