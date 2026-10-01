import { useState } from 'react';
import { Block, Column, FloatingActions, Text } from '@plocks/ui';

export function Demo() {
  const [message, setMessage] = useState('Choose an action');
  const actions = [
    { key: 'create', icon: 'plus', accessibilityLabel: 'Create item', color: 'success' as const, onPress: () => setMessage('Created') },
    { key: 'search', icon: 'search', accessibilityLabel: 'Search items', onPress: () => setMessage('Search selected') },
    { key: 'info', icon: 'info', accessibilityLabel: 'Show details', onPress: () => setMessage('Details selected') },
  ];

  return (
    <Column gap="lg" fullWidth>
      <Block fullWidth h={280} position="relative" p="md">
        <Text fw="semibold">Click or tap · persistent labels</Text>
        <Text>{message}</Text>
        <FloatingActions trigger="click" mode="stack" labelMode="persistent" actions={actions} />
      </Block>
      <Block fullWidth h={220} position="relative" p="md">
        <Text fw="semibold">Hover · flower layout · focus for labels</Text>
        <FloatingActions trigger="hover" mode="flower" labelMode="tooltip" actions={actions} />
      </Block>
    </Column>
  );
}
