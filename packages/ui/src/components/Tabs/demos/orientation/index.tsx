import { Block, Tabs, Text } from '@platform-blocks/ui';

const ORIENTATIONS = ['horizontal', 'vertical'] as const;

const ITEMS = [
  {
    key: 'general',
    label: 'General',
    content: <Text>Broad overview content.</Text>
  },
  {
    key: 'security',
    label: 'Security',
    content: <Text>Security controls and permissions.</Text>
  },
  {
    key: 'notifications',
    label: 'Notifications',
    content: <Text>Configure alerts and digests.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      {ORIENTATIONS.map((orientation) => (
        <Block key={orientation} fullWidth>
          <Text variant="small" c="secondary">{orientation}</Text>
          <Tabs orientation={orientation} items={ITEMS} />
        </Block>
      ))}
    </Block>
  );
}
