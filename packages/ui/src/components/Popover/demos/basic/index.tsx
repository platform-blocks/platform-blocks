import { Block, Button, Popover, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Popover>
      <Popover.Target>
        <Button>
          Toggle popover
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm" style={{ maxWidth: 240 }}>
          <Text weight="semibold">Quick actions</Text>
          <Text variant="small" color="secondary">
            Popovers expose more content than tooltips without leaving the page.
          </Text>
          <Button size="xs" variant="ghost">
            Create new entry
          </Button>
          <Button size="xs" variant="ghost">
            View documentation
          </Button>
        </Block>
      </Popover.Dropdown>
    </Popover>
  );
}
