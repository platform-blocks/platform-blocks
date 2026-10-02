# useThemedStyles

Build a style table from the theme once per theme and dependency list instead of on every render. `createThemedStyles` is the module-level variant: a style factory cached per theme and argument list, for tables keyed by size, variant and the like.

## Metadata

- Import: `import { useThemedStyles } from '@plocks/ui';`
- Tags: theme, styles, stylesheet, performance, memoization
- Docs: https://plocks.dev/hooks/useThemedStyles
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/hooks/useThemedStyles.ts

## Definition

```ts
export function useThemedStyles<T>(factory: (theme: PlocksTheme) => T, deps: DependencyList = []): T;
```

## Examples

### Theme-aware styles

`useThemedStyles(factory, deps?)` calls `factory(theme)` and memoizes whatever it returns (a plain style object or a `StyleSheet.create` table) on the theme object plus `deps`, so the card's styles are rebuilt only when the color scheme switches or `compact` changes. List everything the factory closes over in `deps`; the factory itself is not a dependency, so an inline arrow is fine. For styles shared across instances, `createThemedStyles((theme, ...args) => styles)` returns a function cached per theme and per argument list; the extra arguments must be primitives.

```tsx
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Block, Switch, resolveRadius, resolveSpacing, useThemedStyles } from '@plocks/ui';

export function Demo() {
  const [compact, setCompact] = useState(false);

  const styles = useThemedStyles(
    (theme) => ({
      card: {
        padding: resolveSpacing(theme, compact ? 'sm' : 'lg'),
        borderRadius: resolveRadius(theme, 'md'),
        borderWidth: 1,
        borderColor: theme.backgrounds.border,
        backgroundColor: theme.backgrounds.subtle,
      },
      title: { color: theme.text.primary, fontSize: 16 },
      meta: { color: theme.text.muted, fontSize: 13 },
    }),
    [compact]
  );

  return (
    <Block fullWidth maw={360}>
      <Switch label="Compact" checked={compact} onChange={setCompact} />
      <View style={styles.card}>
        <Text style={styles.title}>Weekly report</Text>
        <Text style={styles.meta}>Updated 2 hours ago</Text>
      </View>
    </Block>
  );
}
```
