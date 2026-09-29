import {
  Button,
  Icon,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuSub,
} from '@platform-blocks/ui';

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
