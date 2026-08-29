import { useState } from 'react';
import { Block, Tabs, Text, useTheme } from '@platform-blocks/ui';

const PANELS = [
  {
    key: 'overview',
    label: 'Overview',
    body: 'High-level snapshot of product activity and health.'
  },
  {
    key: 'analytics',
    label: 'Analytics',
    body: 'Dive into usage metrics, adoption trends, and retention.'
  },
  {
    key: 'billing',
    label: 'Billing',
    body: 'Billing is temporarily disabled while invoices reconcile.',
    disabled: true
  },
  {
    key: 'settings',
    label: 'Settings',
    body: 'Manage workspace preferences and security controls.'
  }
];

export function Demo() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);

  return (
    <Block>
      <Tabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setLastAttempt(null);
        }}
        onDisabledTabPress={(key) => {
          const label = PANELS.find((panel) => panel.key === key)?.label ?? key;
          setLastAttempt(`${label} is currently disabled.`);
        }}
        variant="line"
        size="md"
        items={PANELS.map(({ body, ...panel }) => ({
          ...panel,
          content: (
            <Block bg={theme.backgrounds.surface} borderColor={theme.backgrounds.border} radius="lg" p="md">
              <Text>{body}</Text>
            </Block>
          )
        }))}
      />
      <Text variant="small" color="muted">
        Disable sensitive tabs while keeping the `onDisabledTabPress` callback to track attempted access.
        {lastAttempt ? ` ${lastAttempt}` : ''}
      </Text>
    </Block>
  );
}
