import { Block, Text, Timeline } from '@platform-blocks/ui';

const phases = [
  { title: 'Kickoff', description: 'Establish scope, goals, and responsible stakeholders.' },
  { title: 'Execution', description: 'Track feature work and unblock contributors.' },
  { title: 'Review', description: 'Collect feedback and iterate on the release candidate.' },
];

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Block>
        <Text fw="semibold">Left</Text>
        <Timeline>
          {phases.map((phase) => (
            <Timeline.Item key={phase.title} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Right</Text>
        <Timeline align="right">
          {phases.map((phase) => (
            <Timeline.Item key={phase.title} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Center</Text>
        <Timeline centerMode>
          {phases.map((phase) => (
            <Timeline.Item key={phase.title} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}
