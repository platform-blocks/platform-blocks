import {
  Button,
  Icon,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  MenuLabel,
  MenuSub,
} from '@platform-blocks/ui';

export default function Demo() {
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
