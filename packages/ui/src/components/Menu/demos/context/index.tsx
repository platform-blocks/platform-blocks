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
