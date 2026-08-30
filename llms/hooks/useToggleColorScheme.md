# useToggleColorScheme

Bind a keyboard shortcut to cycle through available color schemes provided by the theme mode context.

## Metadata

- Canonical name: `useToggleColorScheme`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useToggleColorScheme } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: keyboard
- Tags: keyboard, theme
- Docs: https://react-ui-library.com/hooks/useToggleColorScheme
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useToggleColorScheme

## Definition

```ts
export function useToggleColorScheme(handler: () => void, enabled = true);
```

## Examples

### Cycle theme

Wire the default Ctrl/⌘ + J shortcut to the same handler you use for manual theme toggles.

```tsx
import { Block, Button, DataList, KeyCap, Row, Text, useThemeMode, useToggleColorScheme } from '@platform-blocks/react-ui-library';

export function Demo() {
  const { mode, cycleMode, actualColorScheme } = useThemeMode();

  useToggleColorScheme(cycleMode);

  return (
    <Block align="flex-start" maxW={420}>
      <DataList
        labelWidth={130}
        data={[
          { label: 'Current mode', value: mode },
          { label: 'Active scheme', value: actualColorScheme }
        ]}
      />
      <Button onPress={cycleMode}>Toggle theme</Button>
      <Row gap="xs" align="center">
        <Text size="xs" color="muted">Or press</Text>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <KeyCap keyCode="J" modifiers={['cmd']} size="sm">J</KeyCap>
        <Text size="xs" color="muted">anywhere in the docs.</Text>
      </Row>
    </Block>
  );
}
```
