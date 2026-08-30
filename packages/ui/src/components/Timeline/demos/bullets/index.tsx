import { Block, Icon, Text, Timeline } from '@platform-blocks/react-ui-library';

const bulletContent = [
  {
    title: 'Default bullet',
    description: 'Uses the configured timeline size for spacing.',
  },
  {
    title: 'Numbered bullet',
    description: 'Render a custom label with the `bullet` prop.',
    bullet: <Text size="xs" weight="semibold">1</Text>,
  },
  {
    title: 'Completed bullet',
    description: 'Swap in an icon to reinforce status.',
    bullet: <Icon name="check" size={12} color="#0E8A16" />,
  },
  {
    title: 'Pending bullet',
    description: 'Show remaining work with a clock icon.',
    bullet: <Icon name="clock" size={12} color="#F59E0B" />,
  },
];

const bulletSizes = [
  { label: 'Compact bullet (18px)', bulletSize: 18 },
  { label: 'Large bullet (28px)', bulletSize: 28 },
];

export function Demo() {
  return (
    <Block>
      <Text size="sm" color="secondary">
        Override bullet content or scale it with the `bullet` and `bulletSize` props.
      </Text>

      <Block>
        <Text weight="semibold">Custom bullet content</Text>
        <Timeline bulletSize={22}>
          {bulletContent.map((item) => (
            <Timeline.Item key={item.title} title={item.title} bullet={item.bullet}>
              <Text size="sm">{item.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Block>

      <Block>
        <Text weight="semibold">Adjust bullet size</Text>
        {bulletSizes.map((entry) => (
          <Timeline key={entry.label} bulletSize={entry.bulletSize}>
            <Timeline.Item title={entry.label}>
              <Text size="sm">Connector and spacing track with the bullet size.</Text>
            </Timeline.Item>
            <Timeline.Item title="Follow-up task">
              <Text size="sm">An additional item retains the same sizing.</Text>
            </Timeline.Item>
          </Timeline>
        ))}
      </Block>
    </Block>
  );
}


