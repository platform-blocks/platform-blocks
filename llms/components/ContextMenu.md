# ContextMenu

ContextMenu shows actions for a target on right-click or long-press.

## Metadata

- Import: `import { ContextMenu } from '@plocks/ui';`
- Tags: menu, context, rightclick, longpress, actions
- Docs: https://plocks.dev/components/ContextMenu
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ContextMenu

## Props

- `children` (required): (props: ContextMenuTriggerProps) => ReactNode — Render prop for the trigger: spread the given props onto it.
- `items` (required): ContextMenuItem[]
- `closeOnSelect`: boolean = true — Close after selection. @default true
- `longPressDelay`: number = 350 — Long press duration (ms) for native. @default 350
- `mah`: number = 280 — Menu max height before the items scroll (not the root's). @default 280
- `onOpen`: () => void — Called when menu opens
- `onClose`: () => void — Called when menu closes
- `opened`: boolean — Controlled open state.
- `defaultOpened`: boolean = false — Initial open state when uncontrolled. @default false
- `position`: { x: number; y: number } — Controlled position (web: viewport coordinates; native: page coordinates).
- `aria-label`: string = 'Context menu' — Accessible name of the menu. @default 'Context menu'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface ContextMenuTriggerProps {
  /** Web: right-click, or the keyboard ContextMenu key. */
  onContextMenu: (event: WebMouseEvent) => void;
  /** Native long-press timer start. */
  onPressIn: (event: GestureResponderEvent) => void;
  /** Native long-press timer cancel. */
  onPressOut: () => void;
  /** Web keyboard: Shift+F10 / ContextMenu key. */
  onKeyDown?: (event: WebKeyboardEvent) => void;
  /** Screen readers: "long press" and a labelled "Open menu" action. */
  accessibilityActions: ReadonlyArray<AccessibilityActionInfo>;
  onAccessibilityAction: (event: AccessibilityActionEvent) => void;
  /** Web: `menu` — the trigger opens one. */
  'aria-haspopup'?: 'menu';
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}
```

## Examples

### Basics

Wrap any trigger element with `ContextMenu` and pass an `items` array. The menu opens on right-click (web) or long-press (mobile); the `children` render prop receives the handlers to spread onto your trigger.

```tsx
import { Card, ContextMenu, Text } from '@plocks/ui';

const ITEMS = [
  { id: 'copy', label: 'Copy' },
  { id: 'rename', label: 'Rename' },
  { id: 'delete', label: 'Delete', danger: true },
];

export function Demo() {
  return (
    <ContextMenu items={ITEMS}>
      {(triggerProps) => (
        <Card {...triggerProps} padding="2xl">
          <Text>Right-click or long-press me</Text>
        </Card>
      )}
    </ContextMenu>
  );
}
```
