import { useState } from 'react';
import { Block, Tabs, Text } from '@platform-blocks/react-ui-library';

const ITEMS = [
  {
    key: 'dashboard',
    label: '🏠 Dashboard',
    content: <Text>Monitor analytics across teams and products.</Text>
  },
  {
    key: 'settings',
    label: '⚙️ Settings',
    content: <Text>Configure notifications, permissions, and integrations.</Text>
  },
  {
    key: 'profile',
    label: '👤 Profile',
    content: <Text>Review contact details, roles, and security options.</Text>
  }
];

export function Demo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const activeLabel = ITEMS.find((item) => item.key === activeTab)?.label ?? activeTab;

  return (
    <Block>
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} items={ITEMS} />
      <Text variant="small" color="muted">
        Active tab: {activeLabel}
      </Text>
    </Block>
  );
}
