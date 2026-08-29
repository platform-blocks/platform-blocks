import { Block, Text, Timeline } from '@platform-blocks/ui';

const phases = [
  { title: 'Kickoff', description: 'Establish scope, goals, and responsible stakeholders.' },
  { title: 'Execution', description: 'Track feature work and unblock contributors.' },
  { title: 'Review', description: 'Collect feedback and iterate on the release candidate.' },
];

const signals = [
  { title: 'All Clear', description: 'No blockers detected.', align: 'left' as const, color: 'success.5' },
  { title: 'Caution', description: 'Risk detected for timeline.', align: 'right' as const, color: 'warning.5' },
  { title: 'Stop', description: 'Escalate critical issues before shipping.', align: 'left' as const, color: 'error.5' },
];

export function Demo() {
  return (
    <Block>
      <Text size="sm" color="secondary">
        Adjust alignment with the `align` prop or enable `centerMode` for timelines that alternate between sides.
      </Text>

      <Block>
        <Text weight="semibold">Left aligned (default)</Text>
        <Timeline>
          {phases.map((phase) => (
            <Timeline.Item key={`left-${phase.title}`} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text weight="semibold">Right aligned</Text>
        <Timeline align="right" active={1}>
          {phases.map((phase) => (
            <Timeline.Item key={`right-${phase.title}`} title={phase.title}>
              <Text size="sm">{phase.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text weight="semibold">Centered spine with per-item alignment</Text>
        <Timeline centerMode active={1}>
          {signals.map((signal) => (
            <Timeline.Item
              key={signal.title}
              title={signal.title}
              itemAlign={signal.align}
              color={signal.color}
            >
              <Text size="sm">{signal.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}


