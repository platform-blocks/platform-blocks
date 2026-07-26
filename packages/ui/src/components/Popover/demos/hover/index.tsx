import { Block, Button, Popover, Text } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Popover trigger="hover">
      <Popover.Target>
        <Button>
          Hover over me
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Block p="sm" style={{ maxWidth: 240 }}>
          <Text weight="semibold">Hover popover</Text>
          <Text variant="small" colorVariant="secondary">
            This popover opens on hover, ideal for mouse users who want quick access to additional content.
          </Text>
        </Block>
      </Popover.Dropdown>
    </Popover>
  );
}
