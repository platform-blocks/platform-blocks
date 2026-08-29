import {
  Block,
  Card,
  Icon,
  Menu,
  MenuDivider,
  MenuDropdown,
  MenuItem,
  Text,
} from '@platform-blocks/ui';

export function Demo() {
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
