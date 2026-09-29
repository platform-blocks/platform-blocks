import { Button, Block, Popover, Text } from '@platform-blocks/ui';

const OPTIONS = [
  { label: 'Top', position: 'top' },
  { label: 'Right', position: 'right' },
  { label: 'Bottom', position: 'bottom' },
  { label: 'Left', position: 'left' },
] as const;

export function Demo() {
  return (
    <Block direction="row">
      {OPTIONS.map(({ label, position }) => (
        <Popover key={position} position={position} withArrow>
          <Popover.Target>
            <Button>
              {label}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Block p="sm">
              <Text fw="semibold">{label} placement</Text>
            </Block>
          </Popover.Dropdown>
        </Popover>
      ))}
    </Block>
  );
}
