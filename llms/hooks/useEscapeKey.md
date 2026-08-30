# useEscapeKey

Listen for user to press the Escape key to dismiss transient UI like modals, drawers, or menus.

## Metadata

- Canonical name: `useEscapeKey`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useEscapeKey } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: keyboard
- Tags: keyboard, escape
- Docs: https://react-ui-library.com/hooks/useEscapeKey
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useEscapeKey

## Definition

```ts
export function useEscapeKey(handler: () => void, enabled = true);
```

## Examples

### Dismiss panels

Wire the Escape key to close a panel and automatically disable the listener once the panel is dismissed.

```tsx
import { useState } from 'react';
import { Block, Button, Card, Text, useEscapeKey } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [open, setOpen] = useState(true);

  // The listener is only registered while the panel is visible.
  useEscapeKey(() => setOpen(false), open);

  return (
    <Block align="flex-start">
      {open ? (
        <Card p="md" maxW={360}>
          <Block>
            <Text size="sm" weight="semibold">Escape-enabled panel</Text>
            <Text size="sm" color="muted">
              Press Escape to close this panel without touching the mouse.
            </Text>
            <Button size="sm" onPress={() => setOpen(false)}>Close</Button>
          </Block>
        </Card>
      ) : (
        <Button variant="outline" onPress={() => setOpen(true)}>Reopen panel</Button>
      )}
    </Block>
  );
}
```
