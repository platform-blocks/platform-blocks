# MenuItemButton

A row button used inside menus and command palettes. The inner label `<Text>` accepts the full Text-prop API via `labelProps` (`ff`, `weight`, `tracking`, `uppercase`, `color`, `style`).

## Metadata

- Canonical name: `MenuItemButton`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { MenuItemButton } from '@platform-blocks/react-ui-library';`
- Category: navigation
- Tags: menu, dropdown, command, item, button
- Docs: https://react-ui-library.com/components/MenuItemButton
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/MenuItemButton

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | string | No |  | Text label (alternative to children) |
| `children` | React.ReactNode | No |  | Custom content |
| `startIcon` | React.ReactNode | No |  | Leading icon |
| `endIcon` | React.ReactNode | No |  | Trailing icon / shortcut hint |
| `onPress` | () => void | No |  | Click handler |
| `disabled` | boolean | No |  | Whether the button is disabled |
| `active` | boolean | No |  | Whether the button is active (selected) |
| `danger` | boolean | No |  | Whether the button has destructive styling |
| `fullWidth` | boolean | No |  | Whether the button should take up full width |
| `size` | ComponentSizeValue | No |  | Size of the button |
| `compact` | boolean | No |  | Whether to use compact styling |
| `rounded` | boolean | No |  | Whether to use fully rounded corners |
| `style` | any | No |  | Custom styles override |
| `onPressIn` | (event: GestureResponderEvent) => void | No |  | Callback fired when press starts |
| `onPressOut` | (event: GestureResponderEvent) => void | No |  | Callback fired when press ends |
| `onMouseDown` | (event: any) => void | No |  | Web-only mouse down handler |
| `onMouseEnter` | (event: any) => void | No |  | Web-only mouse enter handler |
| `onMouseLeave` | (event: any) => void | No |  | Web-only mouse leave handler |
| `onHoverIn` | PressableProps['onHoverIn'] | No |  | Pointer hover start handler (web) |
| `onHoverOut` | PressableProps['onHoverOut'] | No |  | Pointer hover end handler (web) |
| `onFocus` | PressableProps['onFocus'] | No |  | Focus handler |
| `onBlur` | PressableProps['onBlur'] | No |  | Blur handler |
| `color` | MenuItemColor | No |  | Semantic color for menu styling |
| `hoverColor` | MenuItemColor | No |  | Color to apply when hovered |
| `activeColor` | MenuItemColor | No |  | Color to apply when active/pressed |
| `textColor` | string | No |  | Override text color for base state |
| `hoverTextColor` | string | No |  | Override text color when hovered |
| `activeTextColor` | string | No |  | Override text color when active |
| `testID` | string | No |  | Test identifier forwarded to Pressable |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the inner label `<Text>` (style, weight, ff, size, color). |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Basic Menu
ID: `MenuItemButton.basic` • Category: general

Simple dropdown menu with icons and dividers.

```tsx
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
