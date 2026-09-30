import { Block, Tabs, Text } from '@plocks/ui';

const VARIANTS = ['line', 'chip', 'folder'] as const;

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
      {VARIANTS.map((variant) => (
        <Block key={variant} fullWidth>
          <Text variant="small" c="secondary">{variant}</Text>
          <Tabs variant={variant} items={ITEMS} />
        </Block>
      ))}
    </Block>
  );
}
