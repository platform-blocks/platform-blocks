import { Block, Button, Popover, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Popover trigger="hover">
      <Popover.Target>
        <Button>
          Hover over me
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm">
          <Text fw="semibold">Hover popover</Text>
        </Block>
      </Popover.Dropdown>
    </Popover>
  );
}
