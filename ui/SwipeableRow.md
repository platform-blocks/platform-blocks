# SwipeableRow

SwipeableRow reveals actions when swiped and provides an action button for keyboard and touch discovery. Actions use the theme-aware Button primitive. Put the row inside a `GestureHandlerRootView` to enable swipe gestures; the action button remains available without Gesture Handler.

## Metadata

- Import: `import { SwipeableRow } from '@plocks/ui';`
- Status: beta
- Tags: swipe, row, actions, list
- Docs: https://plocks.dev/components/SwipeableRow
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/SwipeableRow

## Props

- `children` (required): React.ReactNode
- `startActions`: SwipeableRowAction[] = [] — Actions revealed from the logical start edge.
- `endActions`: SwipeableRowAction[] = [] — Actions revealed from the logical end edge.
- `accessibilityLabel`: string — Accessible name for this row's action group.
- `actionWidth`: number = 104 — Width of each revealed action. @default 104
- `disabled`: boolean = false — Disable swipe and action activation.
- `showActionButton`: boolean = true — Show an action-menu button for keyboard and touch discovery. @default true
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface SwipeableRowAction {
  key: string;
  label: string;
  icon?: string;
  onPress: () => void;
  color?: ColorProp;
  variant?: ButtonVariant;
  disabled?: boolean;
}
```

## Examples

### Swipe actions

Swipe the message toward either side to reveal actions. The action button also shows all actions, including for keyboard users. `startActions` and `endActions` follow the current text direction. Use `color` and `variant` on each action to communicate its purpose.

```tsx
import { useState } from 'react';
import { Block, Column, SwipeableRow, Text } from '@plocks/ui';

export function Demo() {
  const [status, setStatus] = useState('Choose an action');
  return (
    <Column gap="sm" fullWidth>
      <Text c="secondary">Swipe the row, or open its action button.</Text>
      <SwipeableRow
        w="100%"
        accessibilityLabel="Message from Ada"
        startActions={[{ key: 'archive', label: 'Archive', icon: 'folder', color: 'primary', onPress: () => setStatus('Archived') }]}
        endActions={[{ key: 'delete', label: 'Delete', icon: 'trash', color: 'error', onPress: () => setStatus('Deleted') }]}
      >
        <Block p="md" fullWidth>
          <Text fw="semibold">Ada Lovelace</Text>
          <Text c="secondary">New design notes are ready to review.</Text>
        </Block>
      </SwipeableRow>
      <Text>{status}</Text>
    </Column>
  );
}
```
