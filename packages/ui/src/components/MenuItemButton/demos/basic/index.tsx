import { Menu, MenuItem, MenuDivider, MenuDropdown, Button, Icon } from '@platform-blocks/react-ui-library';

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
