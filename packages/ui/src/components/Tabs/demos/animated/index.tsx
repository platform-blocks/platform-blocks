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
    key: 'settings',
    label: 'Settings',
    content: <Text>Manage workspace preferences.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      <Tabs animated animationDuration={500} items={ITEMS} />
    </Block>
  );
}
