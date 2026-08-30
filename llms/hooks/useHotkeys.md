# useHotkeys

Register scoped keyboard shortcuts that only run while the component using them stays mounted.

## Metadata

- Canonical name: `useHotkeys`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useHotkeys } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: keyboard
- Tags: keyboard, shortcuts, scoped
- Docs: https://react-ui-library.com/hooks/useHotkeys
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useHotkeys

## Definition

```ts
export type HotkeyItem = [
  /** key combination like 'mod+k', 'escape', 'ctrl+j' */
  string,
  /** handler function */
  (event: KeyboardEvent) => void,
  /** optional modifiers override */
  KeyboardModifiers?,
  /** optional description */
  string[]?
];

export type KeyboardModifiers = {
  /** Whether the Alt key is pressed */
  alt?: boolean;
  /** Whether the Ctrl key is pressed */
  ctrl?: boolean;
  /** Whether the Meta (Cmd) key is pressed */
  meta?: boolean;
  /** Whether the Shift key is pressed */
  shift?: boolean;
}

export function useHotkeys(hotkeys: HotkeyItem[], dependencies: React.DependencyList = []);
```

## Examples

### Scoped shortcuts

Register multiple keyboard combinations while a view is mounted to keep editor commands local to that surface.

```tsx
import { useCallback, useState } from 'react';
import { Block, KeyCap, Row, Text, useHotkeys } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [log, setLog] = useState<string[]>([]);

  const append = useCallback((entry: string) => {
    setLog(prev => [entry, ...prev].slice(0, 4));
  }, []);

  useHotkeys(
    [
      ['mod+b', () => append('Bold toggled')],
      ['mod+shift+p', () => append('Command palette opened')],
      ['escape', () => append('Escape pressed')],
    ],
    [append]
  );

  return (
    <Block align="flex-start">
      <Row gap="xs" wrap="wrap">
        <KeyCap keyCode="B" modifiers={['cmd']} size="sm">⌘B</KeyCap>
        <KeyCap keyCode="P" modifiers={['cmd', 'shift']} size="sm">⇧⌘P</KeyCap>
        <KeyCap keyCode="Escape" size="sm">Esc</KeyCap>
      </Row>
      {log.length ? (
        log.map((entry, index) => (
          <Text key={`${entry}-${index}`} size="sm">{entry}</Text>
        ))
      ) : (
        <Text size="sm" color="muted">No shortcuts fired yet.</Text>
      )}
    </Block>
  );
}
```
