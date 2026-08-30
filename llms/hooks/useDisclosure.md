# useDisclosure

Manage boolean open/close state with `open`, `close`, and `toggle` handlers plus callbacks that fire only on real transitions.

## Metadata

- Canonical name: `useDisclosure`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useDisclosure } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: state
- Tags: state, toggle, open-close, modal, dialog
- Docs: https://react-ui-library.com/hooks/useDisclosure
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useDisclosure

## Definition

```ts
export interface UseDisclosureCallbacks {
  /** Called when the state transitions from closed → open. */
  onOpen?: () => void;
  /** Called when the state transitions from open → closed. */
  onClose?: () => void;
}

export type UseDisclosureReturn = readonly [boolean, UseDisclosureHandlers];

export interface UseDisclosureHandlers {
  /** Set state to `true`. No-op if already open. */
  open: () => void;
  /** Set state to `false`. No-op if already closed. */
  close: () => void;
  /** Flip the state. */
  toggle: () => void;
}

export function useDisclosure(initialState: boolean = false, callbacks?: UseDisclosureCallbacks): UseDisclosureReturn;
```

## Examples

### Toggle a dialog

Boolean state with `open` / `close` / `toggle` handlers. Optional `onOpen` / `onClose` callbacks fire only on real transitions, never on no-op calls.

```tsx
import { Badge, Block, Button, Dialog, Row, Text, useDisclosure } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [opened, { open, close, toggle }] = useDisclosure(false, {
    onOpen: () => console.log('opened'),
    onClose: () => console.log('closed'),
  });

  return (
    <Block align="flex-start">
      <Badge color={opened ? 'success' : 'gray'}>{opened ? 'Open' : 'Closed'}</Badge>

      <Row gap="sm" wrap="wrap">
        <Button onPress={open}>open</Button>
        <Button variant="outline" onPress={close}>close</Button>
        <Button variant="ghost" onPress={toggle}>toggle</Button>
      </Row>

      <Dialog visible={opened} title="Dialog title" onClose={close}>
        <Block p="md">
          <Text>This dialog's open state is managed by useDisclosure.</Text>
          <Button onPress={close}>Close</Button>
        </Block>
      </Dialog>
    </Block>
  );
}
```
