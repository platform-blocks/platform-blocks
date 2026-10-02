# MenuItemButton

A row button used inside menus and command palettes. The inner label `<Text>` accepts the full Text-prop API via `labelProps` (`ff`, `fw`, `lts`, `tt`, `c`, `style`).

## Metadata

- Import: `import { MenuItemButton } from '@plocks/ui';`
- Tags: menu, dropdown, command, item, button
- Docs: https://plocks.dev/components/MenuItemButton
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/MenuItemButton

## Props

- `title`: string — Text label (alternative to children)
- `children`: React.ReactNode — Custom content
- `startSection`: React.ReactNode — Leading content (usually an icon)
- `endSection`: React.ReactNode — Trailing content (icon, shortcut hint)
- `onPress`: () => void — Click handler
- `disabled`: boolean — Whether the button is disabled
- `active`: boolean — Whether the button is active (highlighted / selected)
- `danger`: boolean — Whether the button has destructive styling
- `fullWidth`: boolean — Whether the button should take up full width
- `size`: ComponentSizeValue — Size of the button (token or height in px)
- `compact`: boolean — Whether to use compact styling
- `rounded`: boolean — Whether to use fully rounded corners
- `onMouseDown`: (event: WebMouseEvent) => void — Web-only mouse down handler (e.g. to keep focus in a text input)
- `color`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Semantic color for menu styling
- `hoverColor`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Color to apply when hovered
- `activeColor`: 'default' | 'primary' | 'error' | 'success' | 'warning' — Color to apply when active/pressed
- `textColor`: string — Override text color for base state
- `hoverTextColor`: string — Override text color when hovered
- `activeTextColor`: string — Override text color when active
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the inner label `<Text>` (style, fw, ff, size, c).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Simple dropdown menu with icons and dividers.

```tsx
import { Menu, MenuItem, MenuDivider, MenuDropdown, Button, Icon } from '@plocks/ui';

export function Demo() {
  return (
    <Menu>
      <Button variant="filled">Open Menu</Button>
      <MenuDropdown>
        <MenuItem startSection={<Icon name="user" />}>
          Profile
        </MenuItem>
        <MenuItem startSection={<Icon name="settings" />}>
          Settings
        </MenuItem>
        <MenuItem startSection={<Icon name="info" />}>
          Help & Support
        </MenuItem>
        <MenuItem startSection={<Icon name="arrow-left" />}>
          Logout
        </MenuItem>
      </MenuDropdown>
    </Menu>
  )
}
```
