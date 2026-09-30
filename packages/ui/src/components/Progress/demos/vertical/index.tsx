import { Block, Progress, Row, Text } from '@plocks/ui';

const CHANNELS = [
  { label: 'Kick', value: 82 },
  { label: 'Snare', value: 64 },
  { label: 'Bass', value: 91 },
  { label: 'Vox', value: 47 }
];

export function Demo() {
  return (
    <Row gap="md">
      {CHANNELS.map((channel) => (
        <Block key={channel.label} gap="xs" align="center">
          <Progress value={channel.value} orientation="vertical" length={120} />
          <Text variant="small" c="muted">
            {channel.label}
          </Text>
        </Block>
      ))}
    </Row>
  );
}
