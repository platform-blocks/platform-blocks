# Menu

The Menu component provides a dropdown interface for navigation links, actions, and contextual options.

## Metadata

- Import: `import { Menu } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Menu
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Menu

## Props

- `opened`: boolean — Controlled open state.
- `defaultOpened`: boolean = false — Initial open state when uncontrolled. @default false
- `onChange`: (opened: boolean) => void — Called with the requested open state (both modes).
- `trigger`: 'click' | 'hover' | 'contextmenu' = 'click' — What opens the menu: a press on the trigger (`click`), the pointer resting on it (`hover`, web), or a right-click / long-press (`contextmenu`) — the menu then opens at the pointer.
- `position`: MenuPosition = 'auto' on web, 'top' on native (flips below when needed) — Placement relative to the trigger, written for LTR (mirrored in RTL).
- `offset`: number = 4 — Gap between trigger and menu, px. @default 4
- `closeOnClickOutside`: boolean = true — Close when pressing outside the menu. @default true
- `closeOnEscape`: boolean = true — Close on Escape (web) / Android back. Only the topmost overlay closes. @default true
- `onOpen`: () => void — Called when the menu opens.
- `onClose`: () => void — Called when the menu closes.
- `w`: number | 'target' | 'auto' = 'auto' — Menu width: a number, `'target'` (the trigger's width) or `'auto'` (as wide as the longest item, never narrower than the trigger).
- `mah`: number = 300 — Maximum height before the items scroll. @default 300
- `shadow`: ShadowToken = 'md' — Menu shadow. @default 'md'
- `radius`: RadiusValue = 'md' — Menu corner radius. @default 'md'
- `children` (required): ReactNode — The trigger element followed by a `Menu.Dropdown`.
- `disabled`: boolean = false — Disable the trigger.
- `strategy`: 'absolute' | 'fixed' | 'portal' = isWeb ? 'fixed' : 'portal' — 'fixed' (web default): viewport-fixed; 'absolute'; 'portal' (native default): rendered in an RN Modal at the app root.
- `aria-label`: string — Accessible name of the menu. Defaults to the trigger labelling it (web).
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { MenuItem, MenuLabel, MenuDivider, MenuDropdown, MenuSub, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem } from '@plocks/ui';`

### MenuItem

- `children` (required): ReactNode — Item content
- `onPress`: () => void — Press handler
- `disabled`: boolean — Whether the item is disabled (skipped by arrow keys, announced as disabled)
- `startSection`: ReactNode — Content before the label
- `endSection`: ReactNode — Content after the label (shortcut hint, badge)
- `color`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Item color.
- `closeMenuOnClick`: boolean = true — Close the menu when the item is pressed. @default true
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenuLabel

- `children` (required): ReactNode — Label content
- `textProps`: Omit<TextProps, 'children'> — Override props for the label `<Text>`; the theme's `sectionLabel` text role by default.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenuDivider

- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenuDropdown

- `children` (required): ReactNode — Dropdown content: Menu.Item / Menu.Label / Menu.Divider / Menu.Sub
- `scrollable`: boolean = true — Wrap the items in a scroll container. @default true
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenuSub

- `label` (required): ReactNode — Trigger label shown in the parent dropdown
- `children` (required): ReactNode — Submenu items (Menu.Item / Menu.Divider / nested Menu.Sub)
- `startSection`: ReactNode — Content before the trigger label
- `disabled`: boolean — Whether the submenu trigger is disabled
- `color`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Trigger color.
- `w`: number = 200 — Submenu width. @default 200
- `mah`: number = 300 — Maximum height before the submenu scrolls. @default 300
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenuCheckboxItem

- `checked`: boolean — Controlled checked state.
- `defaultChecked`: boolean = false — Initial checked state. @default false
- `onChange`: (checked: boolean) => void — Called when toggled.
- `closeMenuOnClick`: boolean = false — Close the menu after toggling. @default false
- `children` (required): ReactNode — Item content
- `disabled`: boolean — Whether the item is disabled (skipped by arrow keys, announced as disabled)
- `startSection`: ReactNode — Content before the label
- `endSection`: ReactNode — Content after the label (shortcut hint, badge)
- `color`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Item color.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenuRadioGroup

- `children` (required): ReactNode
- `value`: string
- `defaultValue`: string
- `onChange`: (value: string) => void
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenuRadioItem

- `value` (required): string
- `closeMenuOnClick`: boolean
- `children` (required): ReactNode — Item content
- `disabled`: boolean — Whether the item is disabled (skipped by arrow keys, announced as disabled)
- `startSection`: ReactNode — Content before the label
- `endSection`: ReactNode — Content after the label (shortcut hint, badge)
- `color`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Item color.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Menu.CheckboxItem

- `checked`: boolean — Controlled checked state.
- `defaultChecked`: boolean = false — Initial checked state. @default false
- `onChange`: (checked: boolean) => void — Called when toggled.
- `closeMenuOnClick`: boolean = false — Close the menu after toggling. @default false
- `children` (required): ReactNode — Item content
- `disabled`: boolean — Whether the item is disabled (skipped by arrow keys, announced as disabled)
- `startSection`: ReactNode — Content before the label
- `endSection`: ReactNode — Content after the label (shortcut hint, badge)
- `color`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Item color.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Menu.Dropdown

- `children` (required): ReactNode — Dropdown content: Menu.Item / Menu.Label / Menu.Divider / Menu.Sub
- `scrollable`: boolean = true — Wrap the items in a scroll container. @default true
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Menu.RadioGroup

- `children` (required): ReactNode
- `value`: string
- `defaultValue`: string
- `onChange`: (value: string) => void
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Menu.RadioItem

- `value` (required): string
- `closeMenuOnClick`: boolean
- `children` (required): ReactNode — Item content
- `disabled`: boolean — Whether the item is disabled (skipped by arrow keys, announced as disabled)
- `startSection`: ReactNode — Content before the label
- `endSection`: ReactNode — Content after the label (shortcut hint, badge)
- `color`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Item color.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useMenuContext(): MenuContextValue` — Returns the enclosing menu state for custom items.
- `useMenuStyles(options: MenuStyleOptions = {})` — Returns the current theme's menu surface styles (`dropdown`, `item`, `itemHovered`, `label`, `divider`, … plus the raw level-2 `surfaceToken`) — for a custom dropdown or list that should match `Menu`.

## Types

```ts
export type MenuPosition = PlacementType;
```

## Examples

### Basics

Pair a trigger with `MenuDropdown` to show primary actions and separators in a compact surface.

```tsx
import { Button, Icon, Menu, MenuDivider, MenuDropdown, MenuItem } from '@plocks/ui';

export function Demo() {
  return (
    <Menu>
      <Button size="sm" variant="outline">
        Open menu
      </Button>
      <MenuDropdown>
        <MenuItem startSection={<Icon name="user" size="sm" />}>
          Profile
        </MenuItem>
        <MenuItem startSection={<Icon name="settings" size="sm" />}>
          Settings
        </MenuItem>
        <MenuItem startSection={<Icon name="info" size="sm" />}>
          Help & Support
        </MenuItem>
        <MenuDivider />
        <MenuItem startSection={<Icon name="arrow-left" size="sm" />}>
          Logout
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
}
```

### Context Trigger

Enable `trigger="contextmenu"` to surface a menu when users right-click or long-press a target.

```tsx
import { Card, Icon, Menu, MenuDivider, MenuDropdown, MenuItem, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Menu trigger="contextmenu">
      <Card variant="outline" p="xl">
        <Text>Right-click or long-press here</Text>
      </Card>
      <MenuDropdown>
        <MenuItem startSection={<Icon name="copy" size="sm" />}>
          Copy link
        </MenuItem>
        <MenuItem startSection={<Icon name="edit" size="sm" />}>
          Rename
        </MenuItem>
        <MenuItem startSection={<Icon name="share" size="sm" />}>
          Share
        </MenuItem>
        <MenuDivider />
        <MenuItem startSection={<Icon name="trash" size="sm" />}>
          Delete
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
}
```

### Placement Presets

Adjust the `position` prop to pin dropdown content to any edge of the trigger.

```tsx
import { Button, Menu, MenuDropdown, MenuItem, Row } from '@plocks/ui';

const POSITIONS = [
  { label: 'Bottom start', position: 'bottom-start' },
  { label: 'Bottom', position: 'bottom' },
  { label: 'Bottom end', position: 'bottom-end' },
  { label: 'Top start', position: 'top-start' },
  { label: 'Top', position: 'top' },
  { label: 'Top end', position: 'top-end' },
] as const;

export function Demo() {
  return (
    <Row gap="md" justify="center" wrap="wrap">
      {POSITIONS.map(({ label, position }) => (
        <Menu key={position} position={position}>
          <Button size="sm" variant="outline">
            {label}
          </Button>
          <MenuDropdown>
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Archive</MenuItem>
          </MenuDropdown>
        </Menu>
      ))}
    </Row>
  );
}
```

### Checkbox and Radio Items

Choice items keep the menu open while their state changes.

```tsx
import { Button, Menu } from '@plocks/ui';

export function Demo() {
  return (
    <Menu>
      <Button>View options</Button>
      <Menu.Dropdown>
        <Menu.CheckboxItem defaultChecked>Show grid</Menu.CheckboxItem>
        <Menu.RadioGroup defaultValue="comfortable">
          <Menu.RadioItem value="comfortable">Comfortable</Menu.RadioItem>
          <Menu.RadioItem value="compact">Compact</Menu.RadioItem>
        </Menu.RadioGroup>
      </Menu.Dropdown>
    </Menu>
  );
}
```

### Submenu

```tsx
import { Button, Icon, Menu, MenuDropdown, MenuItem, MenuSub } from '@plocks/ui';

export function Demo() {
  return (
    <Menu w={220}>
      <Button size="sm" variant="outline">
        Actions
      </Button>
      <MenuDropdown>
        <MenuItem startSection={<Icon name="edit" size="sm" />}>Rename</MenuItem>
        <MenuSub label="Share" startSection={<Icon name="share" size="sm" />}>
          <MenuItem startSection={<Icon name="link" size="sm" />}>Copy link</MenuItem>
          <MenuItem startSection={<Icon name="mail" size="sm" />}>Email</MenuItem>
          <MenuSub label="Social">
            <MenuItem>Twitter / X</MenuItem>
            <MenuItem>LinkedIn</MenuItem>
            <MenuItem>Reddit</MenuItem>
          </MenuSub>
        </MenuSub>
        <MenuSub label="Move to" startSection={<Icon name="folder" size="sm" />}>
          <MenuItem>Projects</MenuItem>
          <MenuItem>Archive</MenuItem>
          <MenuItem>Trash</MenuItem>
        </MenuSub>
      </MenuDropdown>
    </Menu>
  );
}
```
