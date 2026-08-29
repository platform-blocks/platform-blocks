import { Block, Progress, Row, Text } from '@platform-blocks/ui';

const CHANNELS = [
  { label: 'Kick', value: 82, color: 'primary' as const },
  { label: 'Snare', value: 64, color: 'success' as const },
  { label: 'Bass', value: 91, color: 'warning' as const },
  { label: 'Vox', value: 47, color: 'error' as const }
];

export function Demo() {
  return (
    <Block gap="lg">
      <Block gap="sm">
        <Text variant="small" color="muted">
          Vertical bars fill from the bottom up
        </Text>
        <Row gap="md" align="flex-end">
          {CHANNELS.map((channel) => (
            <Block key={channel.label} gap="xs" align="center">
              <Progress
                value={channel.value}
                orientation="vertical"
                length={120}
                size="sm"
                radius="xl"
                color={channel.color}
                transitionDuration={600}
              />
              <Text variant="small" color="muted">
                {channel.label}
              </Text>
            </Block>
          ))}
          <Progress.Root orientation="vertical" length={140} size="md" radius="md">
            <Progress.Section value={40} color="primary" />
            <Progress.Section value={25} color="success" />
            <Progress.Section value={15} color="warning" striped animate />
          </Progress.Root>

        </Row>
      </Block>

    </Block>
  );
}
