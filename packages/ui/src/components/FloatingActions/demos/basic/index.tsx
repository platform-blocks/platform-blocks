import { useState } from 'react';
import { Block, FloatingActions, Text } from '@plocks/ui';

export function Demo() {
  const [message, setMessage] = useState('Choose an action');

  return (
    <Block fullWidth h={220} position="relative" p="md">
      <Text>{message}</Text>
      <FloatingActions
        actions={[
          {
            key: 'create',
            icon: 'plus',
            accessibilityLabel: 'Create item',
            onPress: () => setMessage('Created'),
          },
          {
            key: 'search',
            icon: 'search',
            accessibilityLabel: 'Search items',
            onPress: () => setMessage('Search selected'),
          },
        ]}
      />
    </Block>
  );
}
