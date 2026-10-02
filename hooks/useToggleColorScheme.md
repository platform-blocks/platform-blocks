# useToggleColorScheme

Bind a keyboard shortcut to cycle through available color schemes provided by the theme mode context.

## Metadata

- Import: `import { useToggleColorScheme } from '@plocks/ui';`
- Tags: keyboard, theme
- Docs: https://plocks.dev/hooks/useToggleColorScheme
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useHotkeys/index.ts

## Definition

```ts
export function useToggleColorScheme(handler: () => void, enabled = true);
```

## Examples

### Cycle theme

Wire the default Ctrl/⌘ + J shortcut to the same handler you use for manual theme toggles.

```tsx
import { Block, Button, DataList, KeyCap, Row, Text, useThemeMode, useToggleColorScheme } from '@plocks/ui';

export function Demo() {
  const { mode, cycleMode, actualColorScheme } = useThemeMode();

  useToggleColorScheme(cycleMode);

  return (
    <Block align="flex-start" maw={420}>
      <DataList
        labelWidth={130}
        data={[
          { label: 'Current mode', value: mode },
          { label: 'Active scheme', value: actualColorScheme }
        ]}
      />
      <Button onPress={cycleMode}>Toggle theme</Button>
      <Row gap="xs" align="center">
        <Text size="xs" c="muted">Or press</Text>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">J</KeyCap>
        <Text size="xs" c="muted">anywhere in the docs.</Text>
      </Row>
    </Block>
  );
}
```
