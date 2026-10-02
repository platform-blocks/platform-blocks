# useEscapeKey

Listen for user to press the Escape key to dismiss transient UI like modals, drawers, or menus.

## Metadata

- Import: `import { useEscapeKey } from '@plocks/ui';`
- Tags: keyboard, escape
- Docs: https://plocks.dev/hooks/useEscapeKey
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useEscapeKey/useEscapeKey.ts

## Definition

```ts
export function useEscapeKey(handler: () => void, enabled = true): void;
```

## Examples

### Dismiss panels

Wire the Escape key to close a panel and automatically disable the listener once the panel is dismissed.

```tsx
import { useState } from 'react';
import { Block, Button, Card, Text, useEscapeKey } from '@plocks/ui';

export function Demo() {
  const [open, setOpen] = useState(true);

  // The listener is only registered while the panel is visible.
  useEscapeKey(() => setOpen(false), open);

  return (
    <Block align="flex-start">
      {open ? (
        <Card p="md" maw={360}>
          <Block>
            <Text size="sm" fw="semibold">Escape-enabled panel</Text>
            <Text size="sm" c="muted">
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
