# useThemeMode

Read and change the user's color-scheme choice (`'light'`, `'dark'` or `'auto'`) along with the scheme it resolves to, for building a theme switcher. Available below a `PlocksProvider` given `themeModeConfig`, which persists the choice (to `localStorage` on web by default); it throws without one.

## Metadata

- Import: `import { useThemeMode } from '@plocks/ui';`
- Tags: theme, dark-mode, color-scheme, persistence
- Docs: https://plocks.dev/hooks/useThemeMode
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/theme/ThemeModeProvider.tsx

## Definition

```ts
export function useThemeMode(): ThemeModeContextValue;
```

## Examples

### Pick a color scheme

`useThemeMode()` returns `{ mode, setMode, cycleMode, actualColorScheme }`: `mode` is the stored choice, `actualColorScheme` the `'light'` / `'dark'` it resolves to (`'auto'` follows the OS), and `cycleMode` steps light → dark → auto. Picking a mode here switches the whole docs site. `themeModeConfig` takes `initialMode` (default `'auto'`), `persistence: { get, set }` (default: `localStorage` on web, none on native, so pass a synchronous store there) and `domConfig` for the class and attribute written to `<html>` on web.

```tsx
import { Block, SegmentedControl, Text, useThemeMode, type ColorSchemeMode } from '@plocks/ui';

const MODES: { label: string; value: ColorSchemeMode }[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Auto', value: 'auto' },
];

export function Demo() {
  const { mode, setMode, actualColorScheme } = useThemeMode();

  return (
    <Block align="center">
      <SegmentedControl data={MODES} value={mode} onChange={(value) => setMode(value as ColorSchemeMode)} />
      <Text size="sm" c="muted">
        actualColorScheme: {actualColorScheme}
      </Text>
    </Block>
  );
}
```
