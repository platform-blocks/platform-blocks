# useSpotlightToggle

Provide a convenience wrapper for the global command palette shortcut so feature teams can open Spotlight without touching implementation details.

## Metadata

- Canonical name: `useSpotlightToggle`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useSpotlightToggle } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: keyboard
- Tags: keyboard, spotlight
- Docs: https://react-ui-library.com/hooks/useSpotlightToggle
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useSpotlightToggle

## Definition

```ts
export function useSpotlightToggle(handler: () => void, enabled = true);
```

## Examples

### Spotlight toggle

Expose the shared Mod + K command palette shortcut without importing spotlight internals.

```tsx
import { useCallback, useState } from 'react';
import { Alert, Block, Button, KeyCap, Row, useSpotlightToggle } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [open, setOpen] = useState(false);

  const openSpotlight = useCallback(() => {
    setOpen(true);
  }, []);

  useSpotlightToggle(openSpotlight, true);

  return (
    <Block align="flex-start">
      <Row gap="xs" align="center">
        <KeyCap keyCode="K" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <KeyCap keyCode="K" modifiers={['cmd']} size="sm">K</KeyCap>
      </Row>
      <Row gap="sm" wrap="wrap">
        <Button onPress={openSpotlight}>Open Spotlight</Button>
        <Button variant="outline" onPress={() => setOpen(false)} disabled={!open}>Close Spotlight</Button>
      </Row>
      <Alert severity={open ? 'success' : 'info'} fullWidth>
        {open ? 'Spotlight is open. Press Mod + K or use the close button to dismiss.' : 'Spotlight is closed.'}
      </Alert>
    </Block>
  );
}
```
