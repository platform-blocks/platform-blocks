import { Button, Block, Popover, Text } from '@platform-blocks/react-ui-library';

const OPTIONS = [
  { label: 'Top', position: 'top', description: 'Appears above the trigger.' },
  { label: 'Right', position: 'right', description: 'Anchors to the right edge.' },
  { label: 'Bottom', position: 'bottom', description: 'Drops below the trigger.' },
  { label: 'Left', position: 'left', description: 'Anchors to the left edge.' },
] as const;

export function Demo() {
  return (
    <Block direction="row">
      {OPTIONS.map(({ label, position, description }) => (
        <Popover key={position} position={position} withArrow>
          <Popover.Target>
            <Button>
              {label}
            </Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Block p="sm" style={{ maxWidth: 220 }}>
              <Text weight="semibold">{label} placement</Text>
              <Text variant="small" color="secondary">
                {description}
              </Text>
            </Block>
          </Popover.Dropdown>
        </Popover>
      ))}
    </Block>
  );
}
