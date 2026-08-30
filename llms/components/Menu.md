# Menu

The Menu component provides a dropdown interface for navigation links, actions, and contextual options. It supports flexible positioning, keyboard navigation, and customizable triggers.

## Metadata

- Canonical name: `Menu`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Menu } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: navigation
- Docs: https://react-ui-library.com/components/Menu
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Menu

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `opened` | boolean | No |  | Whether the menu is open |
| `trigger` | 'click' \| 'hover' \| 'contextmenu' | No | 'click' | Menu trigger event type |
| `position` | 'top' \| 'bottom' \| 'left' \| 'right' \| 'auto' \| 'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'right-start' \| 'right-end' | No | 'auto' | Position relative to trigger |
| `offset` | number | No | 4 | Offset from trigger element |
| `closeOnClickOutside` | boolean | No | true | Whether to close when clicking outside |
| `closeOnEscape` | boolean | No | true | Whether to close when pressing escape |
| `onOpen` | () => void | No |  | Callback when menu opens |
| `onClose` | () => void | No |  | Callback when menu closes |
| `w` | number \| 'target' \| 'auto' | No | 'auto' | Menu content width |
| `maxH` | number | No | 300 | Maximum height for scrollable content |
| `shadow` | 'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' | No | 'md' | Menu content shadow |
| `radius` | 'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' | No | 'md' | Border radius |
| `children` | React.ReactNode | Yes |  | Menu trigger element and dropdown |
| `testID` | string | No |  | Test ID for testing |
| `disabled` | boolean | No | false | Whether menu is disabled |
| `strategy` | 'absolute' \| 'fixed' \| 'portal' | No | Platform.OS === 'web' ? 'fixed' : 'portal' | Menu placement strategy |
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

### Basic Usage
ID: `Menu.basic` • Tags: menu • Category: usage • Status: stable • Since: 1.0.0

Pair a trigger with `MenuDropdown` to show primary actions and separators in a compact surface.

```tsx
Button,
  Card,
  Icon,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  Text,
} from '@platform-blocks/react-ui-library';
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
ID: `Menu.context` • Tags: menu, contextmenu • Category: behavior • Status: stable • Since: 1.0.0

Enable `trigger="contextmenu"` to surface a menu when users right-click or long-press a target.

```tsx
Block,
  Card,
  Icon,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  Text,
} from '@platform-blocks/react-ui-library';
  return (
    <Menu trigger="contextmenu">
      <Card
        p="lg"
        variant="outline"
        style={{
          borderStyle: 'dashed',
          cursor: 'context-menu',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 140,
        }}
      >
        <Block align="center">
          <Icon name="star" size="lg" color="gold" />
          <Text size="sm" color="secondary">
            Right-click or long-press this area
          </Text>
        </Block>
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
ID: `Menu.positioning` • Tags: menu, position • Category: layout • Status: stable • Since: 1.0.0

Adjust the `position` prop to pin dropdown content to any edge of the trigger.

```tsx
const POSITIONS = [
  { label: 'Bottom start', position: 'bottom-start' },
  { label: 'Bottom', position: 'bottom' },
  { label: 'Bottom end', position: 'bottom-end' },
  { label: 'Top start', position: 'top-start' },
  { label: 'Top', position: 'top' },
  { label: 'Top end', position: 'top-end' },
] as const;
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

### Submenu
ID: `Menu.submenu` • Category: general

```tsx
Button,
  Icon,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuLabel,
  MenuSub,
} from '@platform-blocks/react-ui-library';
  return (
    <Menu w={220}>
      <Button size="sm" variant="outline">
        Actions
      </Button>
      <MenuDropdown>
        <MenuLabel>Document</MenuLabel>
        <MenuItem startSection={<Icon name="edit" size="sm" />}>Rename</MenuItem>
        {/* Flyout submenu — opens to the side on hover (web) or tap */}
        <MenuSub label="Share" startSection={<Icon name="share" size="sm" />}>
          <MenuItem startSection={<Icon name="link" size="sm" />}>Copy link</MenuItem>
          <MenuItem startSection={<Icon name="mail" size="sm" />}>Email</MenuItem>
          {/* Submenus nest arbitrarily deep */}
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
        <MenuDivider />
        <MenuItem color="danger" startSection={<Icon name="trash" size="sm" />}>
          Delete
        </MenuItem>
      </MenuDropdown>
    </Menu>
  );
}
```
