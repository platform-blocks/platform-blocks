/**
 * Plain-data theming guide.
 *
 * JSX-free so scripts/generate-llms.ts can render it to Markdown in Node; the
 * provider props, theme shape and mode types are appended there straight from
 * the source, so this module holds only the prose and the worked examples.
 */

export interface ThemingSection {
  title: string;
  lead: string;
  fileName?: string;
  code?: string;
}

export const THEMING_TITLE = 'Theming';

export const THEMING_SUBTITLE =
  'Color schemes, custom palettes, and reading theme tokens in your own components';

export const THEMING_INTRO =
  'Every component reads one theme object, provided by `PlatformBlocksProvider`. Two complete themes ship with the library — `DEFAULT_THEME` (light) and `DARK_THEME` — and by default the provider follows the operating system\'s color scheme.';

export const THEMING_SECTIONS: ThemingSection[] = [
  {
    title: 'Color scheme',
    lead: '`colorSchemeMode` picks the scheme: `\'auto\'` (the default) follows the OS, `\'light\'` and `\'dark\'` force one. For a user-controlled switch pass `themeModeConfig`; `useThemeMode()` then returns `{ mode, setMode, cycleMode, actualColorScheme }` anywhere below the provider, and throws without it. The chosen mode persists to `localStorage` on web; on native pass `persistence: { get, set }` backed by a synchronous store.',
    fileName: 'App.tsx',
    code: `import { Button, PlatformBlocksProvider, type ThemeModeConfig, useThemeMode } from '@platform-blocks/ui';

const themeModeConfig: ThemeModeConfig = { initialMode: 'auto' };

function ThemeToggle() {
  const { mode, cycleMode } = useThemeMode();
  return <Button onPress={cycleMode}>Theme: {mode}</Button>;
}

export default function App() {
  return (
    <PlatformBlocksProvider themeModeConfig={themeModeConfig}>
      <ThemeToggle />
    </PlatformBlocksProvider>
  );
}`,
  },
  {
    title: 'Custom theme',
    lead: 'Pass `theme` to change tokens. A partial override is merged onto the built-in theme of the current scheme, so light/dark switching keeps working; an override with an explicit `colorScheme` pins that scheme; a `{ light, dark }` pair gives each scheme its own override. Color ramps have ten shades with the base color at index 5 — light ramps run lightest to darkest, dark ramps darkest to lightest — so a brand palette needs one ramp per scheme. Keep the theme object stable (a module constant or `useMemo`): resolved themes are cached per object.',
    fileName: 'App.tsx',
    code: `import type { ReactNode } from 'react';
import { DARK_THEME, DEFAULT_THEME, PlatformBlocksProvider, createTheme } from '@platform-blocks/ui';

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
  return <PlatformBlocksProvider theme={theme}>{children}</PlatformBlocksProvider>;
}`,
  },
  {
    title: 'Reading tokens',
    lead: '`useTheme()` returns the active `PlatformBlocksTheme` — outside a provider it quietly returns `DEFAULT_THEME`. Prefer component props (`color`, `bg`, `p`, `radius`) over reading tokens; reach for the theme when styling your own primitives. `theme.spacing`, `theme.radii` and `theme.fontSizes` hold CSS pixel strings such as `\'16px\'`, not numbers.',
    fileName: 'Callout.tsx',
    code: `import { Block, Text, useTheme } from '@platform-blocks/ui';

export function Callout({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Block p="md" style={{ backgroundColor: theme.backgrounds.subtle, borderColor: theme.backgrounds.border, borderWidth: 1 }}>
      <Text style={{ color: theme.text.secondary }}>{children}</Text>
    </Block>
  );
}`,
  },
  {
    title: 'Elevation',
    lead: 'Express depth with `Surface` rather than hand-picked backgrounds: `level={0..3}` runs page → resting content (cards, panels) → floating content (menus, popovers) → screen-level content (dialogs, sheets, toasts), and `raised` takes the enclosing Surface\'s level plus one. Light mode shows elevation mostly with shadow, dark mode with a lighter fill and a hairline border.',
  },
];
