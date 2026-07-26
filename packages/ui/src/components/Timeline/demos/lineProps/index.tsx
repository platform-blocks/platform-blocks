import { Block, Text, Timeline } from '@platform-blocks/ui';

const launches = [
  { title: 'Announcement', description: 'Introduced the roadmap to stakeholders.' },
  { title: 'Preview', description: 'Shared early access resources with champions.' },
  { title: 'Release', description: 'Rolled the feature out to everyone.' },
];

export default function Demo() {
  return (
    <Block>
      <Text size="sm" colorVariant="secondary">
        Customize the connector line globally with the `color`, `colorVariant`, and `lineWidth` props on `Timeline`.
      </Text>

      <Block>
        <Text weight="semibold">Theme color</Text>
        <Timeline colorVariant="primary.6">
          {launches.map((milestone) => (
            <Timeline.Item key={`color-${milestone.title}`} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text weight="semibold">Thicker connector</Text>
        <Timeline lineWidth={4}>
          {launches.slice(0, 2).map((milestone) => (
            <Timeline.Item key={`width-${milestone.title}`} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text weight="semibold">Combined styling</Text>
        <Timeline colorVariant="success.6" lineWidth={3}>
          {launches.slice(1).map((milestone) => (
            <Timeline.Item key={`combined-${milestone.title}`} title={milestone.title}>
              <Text size="sm">{milestone.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}


