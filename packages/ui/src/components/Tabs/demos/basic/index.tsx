import { Block, Tabs, Text } from '@platform-blocks/ui';

const ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    content: <Text>High-level summary and entry point.</Text>
  },
  {
    key: 'details',
    label: 'Details',
    content: <Text>Deeper dive into metrics and configuration.</Text>
  },
  {
    key: 'activity',
    label: 'Activity',
    content: <Text>Recent events, tasks, and notifications.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      <Tabs items={ITEMS} />
    </Block>
  );
}
