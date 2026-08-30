# ContextMenu

The ContextMenu component provides a context-sensitive menu that appears on right-click (web) or long-press (mobile) with customizable actions.

## Metadata

- Canonical name: `ContextMenu`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { ContextMenu } from '@platform-blocks/react-ui-library';`
- Category: overlay
- Tags: menu, context, rightclick, longpress, actions
- Docs: https://react-ui-library.com/components/ContextMenu
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/ContextMenu

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | (props: { onContextMenu: (e: any) => void; onPressIn: (e: any) => void }) => React.ReactNode | Yes |  | Render prop for the trigger |
| `items` | ContextMenuItem[] | Yes |  |  |
| `closeOnSelect` | boolean | No |  | Close after selection (default true) |
| `longPressDelay` | number | No |  | Long press duration (ms) for native |
| `maxHeight` | number | No |  | Optional maximum height (scrolls) |
| `onOpen` | () => void | No |  | Called when menu opens |
| `onClose` | () => void | No |  | Called when menu closes |
| `open` | boolean | No |  | Controlled open |
| `position` | { x: number; y: number } | No |  | Controlled position |
| `portalId` | string | No |  | Portal target id (web) - simple placeholder for future portal integration |
| `style` | any | No |  |  |

## Examples

### Basic Usage
ID: `ContextMenu.basic` • Tags: rightclick, longpress • Category: basics • Status: stable • Since: 1.0.0

Wrap any trigger element with `ContextMenu` and pass an `items` array. The menu opens on right-click (web) or long-press (mobile); the `children` render prop receives the handlers to spread onto your trigger.

```tsx
const ITEMS = [
  { id: 'copy', label: 'Copy' },
  { id: 'rename', label: 'Rename' },
  { id: 'delete', label: 'Delete', danger: true },
];
  return (
    <ContextMenu items={ITEMS}>
      {(triggerProps) => (
        <Card {...triggerProps} style={{ padding: 24, alignItems: 'center' }}>
          <Text variant="p">Right-click or long-press me</Text>
        </Card>
      )}
    </ContextMenu>
  );
}
```
