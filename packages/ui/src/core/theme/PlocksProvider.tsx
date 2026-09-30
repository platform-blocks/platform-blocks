import React, { createContext, useContext, useMemo } from 'react';

import { applyColorSchemeMarker } from './colorSchemeMarker';
import { CSSVariables } from './CSSVariables';
import { withCssVariableColors } from './cssVariableTheme';
import { ThemeScope, ThemeScopeProps, useOptionalTheme } from './ThemeProvider';
import type { PlocksTheme, PlocksThemeOverride, PlocksThemePair } from './types';
import { useColorScheme, ColorScheme } from './useColorScheme';
import { getBuiltInTheme, isThemePair, resolveThemeForScheme } from './utils';
import { OverlayProvider, OverlayRenderer, DirectionProvider } from '../providers';
import { SafeAreaBoundary } from '../providers/SafeAreaBoundary';
import type { DirectionProviderProps } from '../providers';
import { BreakpointProvider } from '../responsive';
import { I18nProvider } from '../i18n';
import type { I18nResources } from '../i18n/types';
import { UniversalCSS } from '../utils/UniversalCSS';
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
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

interface ThemeBoundaryProps {
  theme: ThemeScopeProps['theme'];
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
 * cherry-picked: copying individual keys leaves every scheme-dependent group it
 * forgets — `surfaces`, `states`, `shadows` — on their light values.
 * `DEFAULT_THEME` still supplies anything the dark theme doesn't define (e.g.
 * `designTokens`). Same object as `getBuiltInTheme('dark')`.
 */
export const BUILT_IN_DARK_THEME: PlocksTheme & { colorScheme: 'dark' } =
  getBuiltInTheme('dark') as PlocksTheme & { colorScheme: 'dark' };

/**
 * True below a PlocksProvider. The outermost one mounts the app-level services
 * and owns the document; a nested one only scopes a theme.
 */
const NestingContext = createContext(false);

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
    <ThemeScope theme={theme} inherit={inherit}>
      {cssVariables}
      {globalCSS}
      {children}
    </ThemeScope>
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
  resources: NonNullable<PlocksProviderProps['i18nResources']>;
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

export interface PlocksProviderProps {
  /** Your application */
  children: React.ReactNode;

  /**
   * Custom theme. Either:
   * - a partial override — merged onto the built-in theme of the CURRENT color
   *   scheme, so it keeps light/dark switching (`colorSchemeMode`, OS setting);
   *   in a nested provider, merged onto the parent's theme (see `inherit`);
   * - an override with an explicit `colorScheme` — pins that scheme;
   * - a `{ light, dark }` pair — each side merged onto the matching built-in
   *   theme and picked by the current scheme.
   *
   * Keep the object stable (module constant or memoized): resolved themes are
   * cached per object.
   */
  theme?: PlocksThemeOverride | PlocksThemePair;

  /**
   * Nested providers: merge a partial `theme` onto the parent provider's theme
   * (default) rather than onto the built-in one.
   */
  inherit?: boolean;

  /**
   * Whether to inject CSS variables. The root provider writes them to `:root`;
   * a nested one only when given its own `cssVariablesSelector`.
   */
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
   *
   * Default `'auto'` at the root; a nested provider follows its parent's scheme.
   */
  colorSchemeMode?: 'auto' | 'light' | 'dark';

  /** Root provider only. Whether to enable overlay system (menus, tooltips, etc.) */
  withOverlays?: boolean;

  /** Root provider only. Inject the global web CSS (keyboard focus ring, text-input reset). */
  withGlobalCSS?: boolean;

  /**
   * Root provider only. Mount a `SafeAreaProvider` so Dialog, the dropdown
   * sheets and AppShell keep clear of the notch and the home indicator. Skipped
   * when one is already above (Expo Router's, or your own), so you rarely need
   * to set this — pass `false` to leave the tree without one.
   */
  withSafeAreaProvider?: boolean;

  /**
   * Root provider only. Persist and switch the color-scheme mode; read and set
   * it with `useThemeMode()`.
   */
  themeModeConfig?: ThemeModeConfig;

  /** Root provider only. i18n: initial active locale */
  locale?: string;
  /** Root provider only. i18n: fallback locale */
  fallbackLocale?: string;
  /** Root provider only. i18n: resources map */
  i18nResources?: I18nResources;

  /** Direction context configuration (pass false to opt out at the root) */
  direction?: false | DirectionProviderConfig;
  /** Root provider only. Haptics context configuration (pass false to opt out) */
  haptics?: false | HapticsProviderConfig;

  /**
   * Reduced motion for every library animation:
   * - `'system'` (default at the root): follow the OS setting
   * - `true` / `false`: force it on / off (e.g. an in-app setting, screenshots)
   * Omitted in a nested provider: inherit the parent's setting.
   */
  reducedMotion?: ReducedMotionSetting;
}

interface ResolvedThemeOptions {
  theme: PlocksProviderProps['theme'];
  inherit: boolean;
  /** The scheme to render: the provider's mode, resolved against the OS or its parent. */
  scheme: ColorScheme;
  colorsAsCssVariables: boolean;
  ownsVariables: boolean;
  nested: boolean;
}

function useResolvedTheme({
  theme,
  inherit,
  scheme,
  colorsAsCssVariables,
  ownsVariables,
  nested,
}: ResolvedThemeOptions): PlocksTheme | PlocksThemeOverride | undefined {
  const parentTheme = useOptionalTheme();

  return useMemo(() => {
    if (nested && inherit && parentTheme) {
      // Nothing to change: the scope inherits its parent as is.
      if (!theme) return undefined;
      // A partial override merges onto the parent's theme (ThemeScope does that).
      if (!isThemePair(theme) && !(theme as PlocksThemeOverride).colorScheme) {
        return theme as PlocksThemeOverride;
      }
    }
    // Built-in, pair or override → a complete theme for the current scheme
    // (cached per input object, so the identity is stable).
    const base = resolveThemeForScheme(theme, scheme);
    return colorsAsCssVariables && ownsVariables ? withCssVariableColors(base) : base;
  }, [theme, nested, inherit, parentTheme, scheme, colorsAsCssVariables, ownsVariables]);
}

type RootContentProps = Pick<
  PlocksProviderProps,
  'children' | 'theme' | 'themeModeConfig'
> &
  Required<
    Pick<
      PlocksProviderProps,
      | 'inherit'
      | 'withCSSVariables'
      | 'cssVariablesSelector'
      | 'colorsAsCssVariables'
      | 'colorSchemeMode'
      | 'withOverlays'
      | 'withGlobalCSS'
    >
  >;

/** The root provider's theme, document marker and overlays. */
function RootContent({
  children,
  theme,
  inherit,
  withCSSVariables,
  cssVariablesSelector,
  colorsAsCssVariables,
  colorSchemeMode,
  withOverlays,
  withGlobalCSS,
  themeModeConfig,
}: RootContentProps) {
  const osColorScheme = useColorScheme();
  const themeModeColorScheme = useOptionalThemeModeColorScheme();

  // With `themeModeConfig`, the ThemeModeProvider above owns the mode.
  const effectiveColorScheme = (themeModeConfig ? themeModeColorScheme : null) || colorSchemeMode;
  const scheme: ColorScheme = effectiveColorScheme === 'auto' ? osColorScheme : effectiveColorScheme;

  const resolvedTheme = useResolvedTheme({
    theme,
    inherit,
    scheme,
    colorsAsCssVariables,
    ownsVariables: true,
    nested: false,
  });

  const renderedScheme: ColorScheme =
    (resolvedTheme && 'colorScheme' in resolvedTheme && resolvedTheme.colorScheme) || scheme;

  // Color-scheme marker on <html> (web only), via the one shared code path.
  // With `themeModeConfig`, the ThemeModeProvider above does it instead.
  useIsomorphicLayoutEffect(() => {
    if (themeModeConfig) return;
    const mode = effectiveColorScheme === 'auto' && renderedScheme === osColorScheme ? 'auto' : renderedScheme;
    applyColorSchemeMarker(renderedScheme, mode);
  }, [themeModeConfig, effectiveColorScheme, renderedScheme, osColorScheme]);

  return (
    <NestingContext.Provider value={true}>
      <ThemeBoundary
        theme={resolvedTheme}
        inherit={inherit}
        withCSSVariables={withCSSVariables}
        cssVariablesSelector={cssVariablesSelector}
        withGlobalCSS={withGlobalCSS}
      >
        <OverlayBoundary enabled={withOverlays}>{children}</OverlayBoundary>
      </ThemeBoundary>
    </NestingContext.Provider>
  );
}

/**
 * A PlocksProvider inside another: scopes a theme (and, when given, a text
 * direction and a reduced-motion setting) to its subtree. The app-level
 * services stay with the root provider.
 */
function NestedProvider({
  children,
  theme,
  inherit = true,
  withCSSVariables = true,
  cssVariablesSelector = ':root',
  colorsAsCssVariables = false,
  colorSchemeMode,
  direction,
  reducedMotion,
}: PlocksProviderProps) {
  const osColorScheme = useColorScheme();
  const parentTheme = useOptionalTheme();

  // A nested provider writes CSS variables only when scoped to its own selector.
  const ownsVariables = cssVariablesSelector !== ':root';
  const scheme: ColorScheme =
    colorSchemeMode === undefined
      ? parentTheme?.colorScheme ?? osColorScheme
      : colorSchemeMode === 'auto'
        ? osColorScheme
        : colorSchemeMode;

  const resolvedTheme = useResolvedTheme({
    theme,
    inherit,
    scheme,
    colorsAsCssVariables,
    ownsVariables,
    nested: true,
  });

  let tree = (
    <ThemeBoundary
      theme={resolvedTheme}
      inherit={inherit}
      withCSSVariables={withCSSVariables && ownsVariables}
      cssVariablesSelector={cssVariablesSelector}
      withGlobalCSS={false}
    >
      {children}
    </ThemeBoundary>
  );

  if (reducedMotion !== undefined) {
    tree = <ReducedMotionProvider reducedMotion={reducedMotion}>{tree}</ReducedMotionProvider>;
  }

  if (direction) {
    tree = <DirectionProvider {...direction}>{tree}</DirectionProvider>;
  }

  return tree;
}

/**
 * The plocks provider. Mount one at the root of the app: it provides the theme
 * and mounts the app-level services (overlays, i18n, safe area, haptics,
 * direction, reduced motion, theme-mode persistence, global CSS).
 *
 * A PlocksProvider inside another scopes a theme to its subtree — `theme`,
 * `inherit`, `colorSchemeMode` and, with its own `cssVariablesSelector`, CSS
 * variables — plus `direction` and `reducedMotion` when given. Props marked
 * "Root provider only" are ignored there.
 */
export function PlocksProvider(props: PlocksProviderProps) {
  const nested = useContext(NestingContext);
  return nested ? <NestedProvider {...props} /> : <RootProvider {...props} />;
}

function RootProvider({
  children,
  theme,
  inherit = true,
  withCSSVariables = true,
  cssVariablesSelector = ':root',
  colorsAsCssVariables = false,
  colorSchemeMode = 'auto',
  withOverlays = true,
  withGlobalCSS = true,
  withSafeAreaProvider = true,
  themeModeConfig,
  locale = 'en',
  fallbackLocale = 'en',
  i18nResources,
  direction,
  haptics,
  reducedMotion
}: PlocksProviderProps) {
  const i18nStore = useMemo(
    () => i18nResources || { en: { translation: {} } },
    [i18nResources]
  );

  const content = (
    <RootContent
      theme={theme}
      inherit={inherit}
      withCSSVariables={withCSSVariables}
      cssVariablesSelector={cssVariablesSelector}
      colorsAsCssVariables={colorsAsCssVariables}
      colorSchemeMode={colorSchemeMode}
      withOverlays={withOverlays}
      withGlobalCSS={withGlobalCSS}
      themeModeConfig={themeModeConfig}
    >
      {children}
    </RootContent>
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

PlocksProvider.displayName = 'PlocksProvider';
