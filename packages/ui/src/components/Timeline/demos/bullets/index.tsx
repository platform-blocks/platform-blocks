import { Block, Icon, Text, Timeline } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Timeline bulletSize={28}>
        <Timeline.Item title="Default" />
        <Timeline.Item title="Numbered" bullet={<Text size="xs" fw="semibold">1</Text>} />
        <Timeline.Item title="Completed" bullet={<Icon name="check" size={12} color="#0E8A16" />} />
        <Timeline.Item title="Pending" bullet={<Icon name="clock" size={12} color="#F59E0B" />} />
      </Timeline>
    </Block>
  );
}
