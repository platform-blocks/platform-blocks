import React, { createContext, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { Platform } from 'react-native';

import { applyColorSchemeMarker } from './colorSchemeMarker';
import { CSSVariables } from './CSSVariables';
import { withCssVariableColors } from './cssVariableTheme';
import { PlatformBlocksThemeProvider, PlatformBlocksThemeProviderProps, useOptionalTheme } from './ThemeProvider';
import type { PlatformBlocksTheme, PlatformBlocksThemeOverride, PlatformBlocksThemePair } from './types';
import { useColorScheme, ColorScheme } from './useColorScheme';
import { getBuiltInTheme, isThemePair, resolveThemeForScheme } from './utils';
import { OverlayProvider, OverlayRenderer, DirectionProvider } from '../providers';
import { SafeAreaBoundary } from '../providers/SafeAreaBoundary';
import type { DirectionProviderProps } from '../providers';
import { BreakpointProvider } from '../responsive';
import { SpotlightController } from '../../components/Spotlight/SpotlightController';
import { I18nProvider } from '../i18n';
import type { I18nResources } from '../i18n/types';
import type { SpotlightItem } from '../../components/Spotlight/SpotlightTypes';
import { UniversalCSS } from '../utils/UniversalCSS';
import type { HighlightProps as HighlightComponentProps } from '../../components/Highlight';
import { HapticsProvider } from '../haptics/HapticsProvider';
import type { HapticsProviderProps } from '../haptics/HapticsProvider';
import { AccessibilityProvider } from '../accessibility/context';
import { ReducedMotionProvider } from '../motion/ReducedMotionProvider';
import type { ReducedMotionSetting } from '../motion/ReducedMotionProvider';
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
 * dark theme doesn't define (e.g. `designTokens`). Same object as
 * `getBuiltInTheme('dark')`.
 */
export const BUILT_IN_DARK_THEME: PlatformBlocksTheme & { colorScheme: 'dark' } =
  getBuiltInTheme('dark') as PlatformBlocksTheme & { colorScheme: 'dark' };

/** True below a PlatformBlocksProvider — only the outermost one owns the document. */
const PlatformBlocksNestingContext = createContext(false);

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof document !== 'undefined' ? useLayoutEffect : useEffect;

// These boundaries are deliberately NOT React.memo: `children` is a new element
// on every render of the app root, so a memo could never skip. What keeps a root
// re-render cheap is that every provider below publishes a memoized (or
// primitive) context value, and the library's own leaf elements are memoized so
// React bails out on them by element identity.
function ThemeBoundary({
  theme,
  inherit,
  withCSSVariables,
  cssVariablesSelector,
  withGlobalCSS,
  children,
}: ThemeBoundaryProps) {
  const cssVariables = useMemo(
    () => (withCSSVariables ? <CSSVariables selector={cssVariablesSelector} /> : null),
    [withCSSVariables, cssVariablesSelector]
  );
  const globalCSS = useMemo(() => (withGlobalCSS ? <UniversalCSS /> : null), [withGlobalCSS]);

  return (
    <PlatformBlocksThemeProvider theme={theme} inherit={inherit}>
      {cssVariables}
      {globalCSS}
      {children}
    </PlatformBlocksThemeProvider>
  );
}

interface OverlayBoundaryProps {
  enabled: boolean;
  children: React.ReactNode;
}

function OverlayBoundary({ enabled, children }: OverlayBoundaryProps) {
  // Stable element: the renderer re-renders only when the overlay contexts change.
  const renderer = useMemo(() => <OverlayRenderer />, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <OverlayProvider>
      {children}
      {renderer}
    </OverlayProvider>
  );
}

interface I18nBoundaryProps {
  locale: string;
  fallbackLocale: string;
  resources: NonNullable<PlatformBlocksProviderProps['i18nResources']>;
  children: React.ReactNode;
}

function I18nBoundary({ locale, fallbackLocale, resources, children }: I18nBoundaryProps) {
  // I18nProvider keys its memoized value on these fields, not on the object.
  return (
    <I18nProvider initial={{ locale, fallbackLocale, resources }}>
      {children}
    </I18nProvider>
  );
}

type DirectionProviderConfig = Omit<DirectionProviderProps, 'children'>;
type HapticsProviderConfig = Omit<HapticsProviderProps, 'children'>;

export interface PlatformBlocksProviderProps extends Omit<PlatformBlocksThemeProviderProps, 'children' | 'theme'> {
  /** Your application */
  children: React.ReactNode;

  /**
   * Custom theme. Either:
   * - a partial override — merged onto the built-in theme of the CURRENT color
   *   scheme, so it keeps light/dark switching (`colorSchemeMode`, OS setting);
   * - an override with an explicit `colorScheme` — pins that scheme;
   * - a `{ light, dark }` pair — each side merged onto the matching built-in
   *   theme and picked by the current scheme.
   *
   * Keep the object stable (module constant or memoized): resolved themes are
   * cached per object.
   */
  theme?: PlatformBlocksThemeOverride | PlatformBlocksThemePair;

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

  /**
   * Mount a `SafeAreaProvider` so Dialog, the dropdown sheets and AppShell keep
   * clear of the notch and the home indicator. Skipped when one is already
   * above (Expo Router's, or your own), so you rarely need to set this — pass
   * `false` to leave the tree without one.
   */
  withSafeAreaProvider?: boolean;

  /** Enhanced theme mode configuration */
  themeModeConfig?: ThemeModeConfig;

  /** Lazily mount Spotlight search UI at library level (opt-in) */
  withSpotlight?: boolean;
  /** Configure Spotlight behavior at provider level */
  spotlightConfig?: {
    shortcut?: string | string[] | null; // default ['cmd+k','ctrl+k']
    actions?: SpotlightItem[]; // optional initial actions; apps can still mount their own Spotlight if needed
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
  i18nResources?: I18nResources;

  /** Direction context configuration (pass false to opt out) */
  direction?: false | DirectionProviderConfig;
  /** Haptics context configuration (pass false to opt out) */
  haptics?: false | HapticsProviderConfig;

  /**
   * Reduced motion for every library animation:
   * - `'system'` (default at the root): follow the OS setting
   * - `true` / `false`: force it on / off (e.g. an in-app setting, screenshots)
   * Omitted inside another ReducedMotionProvider: inherit that provider's setting.
   */
  reducedMotion?: ReducedMotionSetting;
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
}: Omit<PlatformBlocksProviderProps, 'locale' | 'fallbackLocale' | 'i18nResources' | 'direction' | 'haptics' | 'reducedMotion' | 'permissions' | 'withSafeAreaProvider'>) {
  const osColorScheme = useColorScheme();
  const optionalThemeModeColorScheme = useOptionalThemeModeColorScheme();
  const nested = useContext(PlatformBlocksNestingContext);
  const parentTheme = useOptionalTheme();
  
  // Use enhanced theme mode if available, otherwise fall back to colorSchemeMode
  const enhancedColorScheme = themeModeConfig ? optionalThemeModeColorScheme : null;
  const effectiveColorScheme = enhancedColorScheme || colorSchemeMode;
  const scheme: ColorScheme = effectiveColorScheme === 'auto' ? osColorScheme : effectiveColorScheme;

  // The outermost provider owns the document: the color-scheme marker, the
  // body colors and the `:root` variables. A nested provider only writes CSS
  // variables when it was given its own selector to scope them to.
  const ownsVariables = !nested || cssVariablesSelector !== ':root';

  const resolvedTheme = useMemo<PlatformBlocksTheme | PlatformBlocksThemeOverride>(() => {
    // A nested provider's partial override keeps merging onto its parent's
    // theme (PlatformBlocksThemeProvider does that) — as it always has.
    if (theme && nested && inherit && parentTheme && !isThemePair(theme) && !(theme as PlatformBlocksThemeOverride).colorScheme) {
      return theme as PlatformBlocksThemeOverride;
    }
    // Built-in, pair or override → a complete theme for the current scheme
    // (cached per input object, so the identity is stable).
    const base = resolveThemeForScheme(theme, scheme);
    return colorsAsCssVariables && ownsVariables ? withCssVariableColors(base) : base;
  }, [theme, nested, inherit, parentTheme, scheme, colorsAsCssVariables, ownsVariables]);

  const renderedScheme: ColorScheme =
    ('colorScheme' in resolvedTheme && resolvedTheme.colorScheme) || scheme;

  // Color-scheme marker on <html> (web only), via the one shared code path.
  // With `themeModeConfig`, the ThemeModeProvider above does it instead.
  useIsomorphicLayoutEffect(() => {
    if (nested || themeModeConfig) return;
    const mode = effectiveColorScheme === 'auto' && renderedScheme === osColorScheme ? 'auto' : renderedScheme;
    applyColorSchemeMarker(renderedScheme, mode);
  }, [nested, themeModeConfig, effectiveColorScheme, renderedScheme, osColorScheme]);

  const mainContent = (
    <PlatformBlocksNestingContext.Provider value={true}>
      <ThemeBoundary
        theme={resolvedTheme}
        inherit={inherit}
        withCSSVariables={withCSSVariables && ownsVariables}
        cssVariablesSelector={cssVariablesSelector}
        withGlobalCSS={withGlobalCSS}
      >
        <OverlayBoundary enabled={withOverlays}>
          {children}
          {withSpotlight && <SpotlightController config={spotlightConfig} />}
        </OverlayBoundary>
      </ThemeBoundary>
    </PlatformBlocksNestingContext.Provider>
  );

  return mainContent;
}

/**
 * Main provider component for Platform Blocks library
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
  withSafeAreaProvider = true,
  themeModeConfig,
  spotlightConfig,
  locale = 'en',
  fallbackLocale = 'en',
  i18nResources,
  direction,
  haptics,
  reducedMotion
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

  // Accessibility services and the reduced-motion override. Both publish stable
  // values (the override is a primitive), so they add no re-renders. Always
  // mounted, so changing `reducedMotion` never remounts the app.
  let enhancedTree = (
    <ReducedMotionProvider reducedMotion={reducedMotion}>
      <AccessibilityProvider>
        {themedTree}
      </AccessibilityProvider>
    </ReducedMotionProvider>
  );

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
    <SafeAreaBoundary enabled={withSafeAreaProvider}>
      <I18nBoundary
        locale={locale}
        fallbackLocale={fallbackLocale}
        resources={i18nStore}
      >
        <BreakpointProvider>
          {enhancedTree}
        </BreakpointProvider>
      </I18nBoundary>
    </SafeAreaBoundary>
  );
}

PlatformBlocksProvider.displayName = 'PlatformBlocksProvider';
