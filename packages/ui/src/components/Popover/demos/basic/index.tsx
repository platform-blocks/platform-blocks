import { Block, Button, Popover, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Popover>
      <Popover.Target>
        <Button>
          Toggle popover
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm">
          <Text fw="semibold">Quick actions</Text>
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
