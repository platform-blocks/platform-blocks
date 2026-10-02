# Menubar

Menubar wraps the existing Menu dropdowns and keeps only one menu open at a time.

## Metadata

- Import: `import { Menubar } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Menubar
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Menubar

## Props

- `children` (required): React.ReactNode
- `trigger`: 'click' | 'hover'
- `loop`: boolean
- `openIndex`: number | null
- `defaultOpenIndex`: number | null
- `onOpenChange`: (index: number | null) => void
- `position`: MenuProps['position']
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { MenubarMenu, MenubarTarget, MenubarDropdown } from '@plocks/ui';`

### MenubarMenu

- `children` (required): React.ReactNode
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Menu` props (`position` `offset` `closeOnClickOutside` `closeOnEscape` `onOpen` `onClose` `w` `mah` `shadow` `radius` `disabled` `strategy` `aria-label`): https://plocks.dev/llms/components/Menu.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenubarTarget

- `children` (required): React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Button` props (`onPress` `onPressIn` `onPressOut` `onHoverIn` `onHoverOut` `onLongPress` `onLayout` `variant` `color` `size` `disabled` `loading` `loadingTitle` `fullWidth` `textColor` `icon` `startSection` `endSection` `tooltip` `transitionDuration` `accessibilityLabel` `accessibilityHint` `labelProps`): https://plocks.dev/llms/components/Button.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### MenubarDropdown

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

### Menubar.Dropdown

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

### Menubar.Menu

- `children` (required): React.ReactNode
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Menu` props (`position` `offset` `closeOnClickOutside` `closeOnEscape` `onOpen` `onClose` `w` `mah` `shadow` `radius` `disabled` `strategy` `aria-label`): https://plocks.dev/llms/components/Menu.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Menubar.Target

- `children` (required): React.ReactNode
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Button` props (`onPress` `onPressIn` `onPressOut` `onHoverIn` `onHoverOut` `onLongPress` `onLayout` `variant` `color` `size` `disabled` `loading` `loadingTitle` `fullWidth` `textColor` `icon` `startSection` `endSection` `tooltip` `transitionDuration` `accessibilityLabel` `accessibilityHint` `labelProps`): https://plocks.dev/llms/components/Button.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Open a menu by pressing its target, then hover or use arrow keys to switch menus.

```tsx
import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
            <Menu.Divider />
            <Menu.Item>Exit</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Edit</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Undo</Menu.Item>
            <Menu.Item>Redo</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Help</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Documentation</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
```

### Hover Trigger

With `trigger="hover"`, moving across targets switches menus.

```tsx
import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar trigger="hover">
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>New</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Edit</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Undo</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
```

### Checkbox and Radio Items

Top-level dropdowns can contain persistent menu choices.

```tsx
import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu>
          <Menubar.Target>View</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.CheckboxItem>Show grid</Menu.CheckboxItem>
            <Menu.RadioGroup defaultValue="list">
              <Menu.RadioItem value="list">List</Menu.RadioItem>
              <Menu.RadioItem value="grid">Grid</Menu.RadioItem>
            </Menu.RadioGroup>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
```

### Submenus

Menubar dropdowns reuse nested Menu.Sub groups.

```tsx
import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Sub label="Share">
              <Menu.Item>Email</Menu.Item>
              <Menu.Item>Copy link</Menu.Item>
            </Menu.Sub>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
```

### Dropdown Position

A menu can override the default bottom-start placement.

```tsx
import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Menubar>
        <Menubar.Menu position="bottom-end">
          <Menubar.Target>Options</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Settings</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
```

### Controlled State

`openIndex` and `onOpenChange` let a parent own the open menu.

```tsx
import { useState } from 'react';
import { Block, Menu, Menubar } from '@plocks/ui';

export function Demo() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <Block fullWidth>
      <Menubar openIndex={openIndex} onOpenChange={setOpenIndex}>
        <Menubar.Menu>
          <Menubar.Target>File</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
        <Menubar.Menu>
          <Menubar.Target>Edit</Menubar.Target>
          <Menubar.Dropdown>
            <Menu.Item>Undo</Menu.Item>
            <Menu.Item>Redo</Menu.Item>
          </Menubar.Dropdown>
        </Menubar.Menu>
      </Menubar>
    </Block>
  );
}
```
