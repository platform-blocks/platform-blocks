# Theming

Every component reads one theme object, provided by `PlocksProvider`. Two complete themes ship with the library — `DEFAULT_THEME` (light) and `DARK_THEME` — and by default the provider follows the operating system's color scheme.

## Color scheme

`colorSchemeMode` picks the scheme: `'auto'` (the default) follows the OS, `'light'` and `'dark'` force one. For a user-controlled switch pass `themeModeConfig`; `useThemeMode()` then returns `{ mode, setMode, cycleMode, actualColorScheme }` anywhere below the provider, and throws without it. The chosen mode persists to `localStorage` on web; on native pass `persistence: { get, set }` backed by a synchronous store.

`App.tsx`

```tsx
import { Button, PlocksProvider, type ThemeModeConfig, useThemeMode } from '@plocks/ui';

const themeModeConfig: ThemeModeConfig = { initialMode: 'auto' };

function ThemeToggle() {
  const { mode, cycleMode } = useThemeMode();
  return <Button onPress={cycleMode}>Theme: {mode}</Button>;
}

export default function App() {
  return (
    <PlocksProvider themeModeConfig={themeModeConfig}>
      <ThemeToggle />
    </PlocksProvider>
  );
}
```

## Custom theme

Pass `theme` to change tokens. A partial override is merged onto the built-in theme of the current scheme, so light/dark switching keeps working; an override with an explicit `colorScheme` pins that scheme; a `{ light, dark }` pair gives each scheme its own override. Color ramps have ten shades with the base color at index 5 — light ramps run lightest to darkest, dark ramps darkest to lightest — so a brand palette needs one ramp per scheme. Keep the theme object stable (a module constant or `useMemo`): resolved themes are cached per object.

`App.tsx`

```tsx
import type { ReactNode } from 'react';
import { DARK_THEME, DEFAULT_THEME, PlocksProvider, createTheme } from '@plocks/ui';

const theme = {
  light: createTheme({
    colors: {
      ...DEFAULT_THEME.colors,
      primary: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#2E1065'],
    },
  }),
  dark: createTheme({
    colors: {
      ...DARK_THEME.colors,
      primary: ['#1E1033', '#2E1065', '#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
    },
  }),
};

export default function App({ children }: { children: ReactNode }) {
  return <PlocksProvider theme={theme}>{children}</PlocksProvider>;
}
```

## Reading tokens

`useTheme()` returns the active `PlocksTheme` — outside a provider it quietly returns `DEFAULT_THEME`. Prefer component props (`color`, `bg`, `p`, `radius`) over reading tokens; reach for the theme when styling your own primitives. `theme.spacing`, `theme.radii` and `theme.fontSizes` hold CSS pixel strings such as `'16px'`, not numbers.

`Callout.tsx`

```tsx
import { Block, Text, useTheme } from '@plocks/ui';

export function Callout({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Block p="md" style={{ backgroundColor: theme.backgrounds.subtle, borderColor: theme.backgrounds.border, borderWidth: 1 }}>
      <Text style={{ color: theme.text.secondary }}>{children}</Text>
    </Block>
  );
}
```

## Elevation

Express depth with `Surface` rather than hand-picked backgrounds: `level={0..3}` runs page → resting content (cards, panels) → floating content (menus, popovers) → screen-level content (dialogs, sheets, toasts), and `raised` takes the enclosing Surface's level plus one. Light mode shows elevation mostly with shadow, dark mode with a lighter fill and a hairline border.

## Provider props

`PlocksProvider` also mounts the overlay layer, i18n, direction, haptics, reduced motion and a safe-area provider; each has an opt-out below.

```ts
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
```

## Theme object

`useTheme()` returns a `PlocksTheme` with these top-level groups:

- `primaryColor` — Primary color used for buttons, links, etc.
- `colorScheme` — Color scheme
- `designTokens` — Design tokens for consistent styling
- `colors` — Colors palette
- `text` — Semantic text colors
- `backgrounds` — Semantic background & surface colors
- `literalColors` — The literal colors behind `text`, `backgrounds` and `surfaces` when those have been rewritten to CSS `var()` references for the web — see `withCssVariableColors`.
- `surfaces` — Elevation ladder consumed by `Surface` (and, through it, Card, Menu, Popover, Dialog…).
- `textRoles` — Typography for titles and group labels (see `TextRoleName`), read through `resolveTextRole` and `Text`'s `textRole` prop.
- `states` — Semantic interactive state colors
- `fontFamily` — Font family
- `fontFamilyMono` — Monospace font family (code, kbd, tabular numbers).
- `controlSizes` — The control-size table used by Button, IconButton, Input and every other fixed-height control — read it through `getControlSize(theme, size)`.
- `zIndices` — Stacking layers for overlays and sticky chrome — read through `getZIndex(theme, layer)`.
- `fontSizes` — Font sizes - extended with new size system
- `spacing` — Spacing values - extended with new size system
- `radii` — Border radius values - extended with new size system
- `shadows` — Shadows
- `breakpoints` — Breakpoints for responsive design
- `motion` — Motion tokens for animations
- `components` — Component default props and styles (override point)
- `other` — Any additional custom theme properties (see `PlocksThemeOther`)

## Types

```ts
export interface PlocksThemePair {
  light?: PlocksThemeOverride;
  dark?: PlocksThemeOverride;
}

export interface ThemeModeConfig {
  /** Initial color scheme mode */
  initialMode?: ColorSchemeMode;
  /** Custom persistence functions (optional) */
  persistence?: {
    get: () => ColorSchemeMode | null;
    set: (mode: ColorSchemeMode) => void;
  };
  /** Custom DOM manipulation (web only, optional) */
  domConfig?: {
    selector: string;
    lightClass: string;
    darkClass: string;
    attribute: string;
  };
}

// Returned by useThemeMode()
interface ThemeModeContextValue {
  mode: ColorSchemeMode;
  setMode: (mode: ColorSchemeMode) => void;
  cycleMode: () => void;
  actualColorScheme: 'light' | 'dark'; // resolved value (no 'auto')
}

export function useTheme(): PlocksTheme;

export function useThemeMode(): ThemeModeContextValue;

export function createTheme(themeOverride: PlocksThemeOverride): PlocksThemeOverride;
```
