import { useState } from 'react';
import { Block, Column, SwipeableRow, Text } from '@plocks/ui';

export function Demo() {
  const [status, setStatus] = useState('Choose an action');
  return (
    <Column gap="sm" fullWidth>
      <Text c="secondary">Swipe the row, or open its action button.</Text>
      <SwipeableRow
        w="100%"
        accessibilityLabel="Message from Ada"
        startActions={[{ key: 'archive', label: 'Archive', icon: 'folder', color: 'primary', onPress: () => setStatus('Archived') }]}
        endActions={[{ key: 'delete', label: 'Delete', icon: 'trash', color: 'error', onPress: () => setStatus('Deleted') }]}
      >
        <Block p="md" fullWidth>
          <Text fw="semibold">Ada Lovelace</Text>
          <Text c="secondary">New design notes are ready to review.</Text>
        </Block>
      </SwipeableRow>
      <Text>{status}</Text>
    </Column>
  );
}
