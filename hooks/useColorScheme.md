# useColorScheme

Read the operating system's light/dark preference and re-render when it changes (`prefers-color-scheme` on web, `Appearance` on native). It ignores the app's own mode; for the scheme the app is actually rendering, read `useTheme().colorScheme`.

## Metadata

- Import: `import { useColorScheme } from '@plocks/ui';`
- Tags: theme, dark-mode, color-scheme, system
- Docs: https://plocks.dev/hooks/useColorScheme
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/theme/useColorScheme.ts

## Definition

```ts
export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme;
```

## Examples

### System color scheme

`useColorScheme()` returns `'light' | 'dark'` from the OS and needs no provider. Switch your system appearance to see it update; the docs site's own theme toggle doesn't affect it. Static rendering has no OS to ask, so the server renders `'light'` and the client corrects it before first paint.

```tsx
import { Icon, Row, Text, useColorScheme } from '@plocks/ui';

export function Demo() {
  const scheme = useColorScheme();

  return (
    <Row gap="sm" align="center">
      <Icon name={scheme === 'dark' ? 'moon' : 'sun'} size="lg" />
      <Text fw="600">System: {scheme}</Text>
    </Row>
  );
}
```
