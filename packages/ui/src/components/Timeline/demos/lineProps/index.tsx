import { Block, Text, Timeline } from '@platform-blocks/ui';

const launches = [
  { title: 'Announcement', description: 'Introduced the roadmap to stakeholders.' },
  { title: 'Preview', description: 'Shared early access resources with champions.' },
  { title: 'Release', description: 'Rolled the feature out to everyone.' },
];

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Block>
        <Text fw="semibold">Theme color</Text>
        <Timeline color="primary.6">
          {launches.map((milestone) => (
            <Timeline.Item key={milestone.title} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Thicker connector</Text>
        <Timeline lineWidth={4}>
          {launches.map((milestone) => (
            <Timeline.Item key={milestone.title} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text fw="semibold">Combined styling</Text>
        <Timeline color="success.6" lineWidth={3}>
          {launches.map((milestone) => (
            <Timeline.Item key={milestone.title} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}
