import { useState } from 'react';
import { Block, Tabs, Text } from '@plocks/ui';

const ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    content: <Text>High-level snapshot of product activity and health.</Text>
  },
  {
    key: 'analytics',
    label: 'Analytics',
    content: <Text>Dive into usage metrics, adoption trends, and retention.</Text>
  },
  {
    key: 'billing',
    label: 'Billing',
    content: <Text>Billing is temporarily disabled while invoices reconcile.</Text>,
    disabled: true
  },
  {
    key: 'settings',
    label: 'Settings',
    content: <Text>Manage workspace preferences and security controls.</Text>
  }
];

export function Demo() {
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);

  return (
    <Block fullWidth>
      <Tabs items={ITEMS} onDisabledTabPress={setLastAttempt} />
      {lastAttempt && (
        <Text variant="small" c="muted">
          Pressed disabled tab: {lastAttempt}
        </Text>
      )}
    </Block>
  );
}
